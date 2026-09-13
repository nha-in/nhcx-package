/**
 * The model the corpus tools call. Two engines, picked by CORPUS_ENGINE:
 *
 *   bedrock (default)  Amazon Bedrock, through the bedrock-mantle endpoint the NHCX chatbot
 *                      uses. Claude models (`claude-*`, `anthropic.*`) go through the Anthropic
 *                      Bedrock Mantle client; every other Bedrock model (`zai.glm-5`,
 *                      `moonshotai.kimi-k2.5`, ...) through Bedrock's OpenAI-compatible chat route.
 *   cli                the claude CLI in print mode, with no tools and a short system prompt.
 *
 * The key is the NHCX chatbot's: read from its .env (CORPUS_ENV_FILE, default
 * services/chatbot/.env beside the package), where it is kept as OPENAI_API_KEY for the
 * bedrock-mantle endpoint. AWS_BEARER_TOKEN_BEDROCK is used only when that file holds no
 * key. The key is never printed.
 *
 * CORPUS_BEDROCK_REGION sets the region. Without it, Claude goes to us-east-1 and every
 * other model to the chatbot's own region (AWS_REGION in its .env, else ap-south-1).
 */

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { AnthropicBedrockMantle } from "@anthropic-ai/bedrock-sdk";
import { betaRefusalFallbackMiddleware } from "@anthropic-ai/sdk";

const PACKAGE_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
// The model the corpus is indexed with unless CORPUS_MODEL names another.
export const DEFAULT_MODEL = process.env.CORPUS_MODEL || "zai.glm-5";
// Anthropic list prices per million tokens (input, output), for a spend estimate on Claude
// only; Bedrock bills at its own rates.
const LIST_PRICE = { "claude-opus-5": [5, 25], "claude-sonnet-5": [2, 10], "claude-opus-4-8": [5, 25], "claude-haiku-4-5": [1, 5] };
// On a refusal, Opus 5 hands the request to Opus 4.8 rather than failing the page.
const FALLBACK = { "claude-opus-5": "claude-opus-4-8" };

export function createModel(opts) {
  return (process.env.CORPUS_ENGINE || "bedrock") === "cli" ? cliModel(opts) : bedrockModel(opts);
}

function fatal(message) {
  return Object.assign(new Error(message), { fatal: true });
}

const wait = (s) => new Promise((r) => setTimeout(r, s * 1000));

// -----------------------------------------------------------------------------
// Bedrock
// -----------------------------------------------------------------------------
function chatbotEnv() {
  const file = process.env.CORPUS_ENV_FILE || join(PACKAGE_DIR, "..", "services", "chatbot", ".env");
  const vars = {};
  if (!existsSync(file)) return vars;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) vars[m[1]] = m[2].replace(/\s+#.*$/, "").trim().replace(/^["']|["']$/g, "");
  }
  return vars;
}

function bedrockModel({ model, system, timeout = 900, retries = 4, maxTokens = Number(process.env.CORPUS_MAX_TOKENS || 32000) }) {
  const env = chatbotEnv();
  const fromChatbot = env.AWS_BEARER_TOKEN_BEDROCK || (/bedrock-mantle\./.test(env.OPENAI_BASE_URL || "") ? env.OPENAI_API_KEY : "");
  const apiKey = fromChatbot || process.env.AWS_BEARER_TOKEN_BEDROCK || "";
  if (!apiKey) throw fatal("no Bedrock key: the chatbot's .env holds none (CORPUS_ENV_FILE) and AWS_BEARER_TOKEN_BEDROCK is unset");
  const claude = /^(anthropic\.)?claude-/.test(model);
  const region = process.env.CORPUS_BEDROCK_REGION || (claude ? "us-east-1" : env.AWS_REGION || "ap-south-1");
  const refused = (status, reason) =>
    fatal(`Bedrock refused ${model} in ${region} (HTTP ${status}): ${String(reason).replace(/\s+/g, " ").slice(0, 200)} Pick a model this account can call (CORPUS_MODEL), set CORPUS_BEDROCK_REGION, or run with CORPUS_ENGINE=cli.`);
  const used = { input: 0, output: 0 };
  const common = {
    get usage() {
      return `${used.input.toLocaleString("en-US")} input and ${used.output.toLocaleString("en-US")} output tokens`;
    },
  };

  if (claude) {
    const bare = model.replace(/^anthropic\./, "");
    const id = `anthropic.${bare}`;
    const fallback = FALLBACK[bare];
    const client = new AnthropicBedrockMantle({
      apiKey,
      awsRegion: region,
      maxRetries: retries,
      timeout: timeout * 1000,
      middleware: fallback ? [betaRefusalFallbackMiddleware([{ model: `anthropic.${fallback}` }])] : [],
    });
    return Object.defineProperties(
      {
        model: bare,
        label: `bedrock:${id} (${region})`,
        async ask(prompt) {
          let msg;
          try {
            msg = await client.beta.messages.stream({ model: id, max_tokens: maxTokens, system, messages: [{ role: "user", content: prompt }] }).finalMessage();
          } catch (e) {
            // A refused key or model will refuse every page; stop instead of retrying each one.
            if (e?.status === 401 || e?.status === 403) throw refused(e.status, e?.error?.error?.message || e.message);
            throw e;
          }
          used.input += (msg.usage?.input_tokens || 0) + (msg.usage?.cache_creation_input_tokens || 0) + (msg.usage?.cache_read_input_tokens || 0);
          used.output += msg.usage?.output_tokens || 0;
          if (msg.stop_reason === "refusal") throw new Error("the model declined the request");
          if (msg.stop_reason === "max_tokens") throw new Error(`the reply hit max_tokens (${maxTokens})`);
          const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
          if (!text.trim()) throw new Error("the model returned no text");
          return text;
        },
      },
      {
        spent: {
          get() {
            const [inPrice, outPrice] = LIST_PRICE[bare] || [0, 0];
            return (used.input * inPrice + used.output * outPrice) / 1e6;
          },
        },
        usage: Object.getOwnPropertyDescriptor(common, "usage"),
      }
    );
  }

  // Every other Bedrock model: the OpenAI-compatible chat route of bedrock-mantle.
  const url = `https://bedrock-mantle.${region}.api.aws/v1/chat/completions`;
  const limit = /^openai\.gpt-5/.test(model) ? { max_completion_tokens: maxTokens } : { max_tokens: maxTokens };
  async function once(prompt) {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(timeout * 1000),
      body: JSON.stringify({ model, ...limit, messages: [{ role: "system", content: system }, { role: "user", content: prompt }] }),
    });
    const body = await res.json().catch(() => ({}));
    const reason = body.error?.message || body.message || JSON.stringify(body).slice(0, 200);
    if (res.status === 401 || res.status === 403) throw refused(res.status, reason);
    if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}: ${String(reason).slice(0, 200)}`), { status: res.status });
    used.input += body.usage?.prompt_tokens || 0;
    used.output += body.usage?.completion_tokens || 0;
    const choice = body.choices?.[0];
    if (choice?.finish_reason === "length") throw new Error(`the reply hit max_tokens (${maxTokens})`);
    const text = choice?.message?.content;
    if (!text?.trim()) throw new Error("the model returned no text");
    return text;
  }
  return Object.defineProperties(
    {
      model,
      label: `bedrock:${model} (${region})`,
      async ask(prompt) {
        for (let attempt = 0; ; attempt++) {
          try {
            return await once(prompt);
          } catch (e) {
            // Throttling, server errors and timeouts are worth another try; a bad request is not.
            const transient = !e.fatal && (e.status === 429 || e.status >= 500 || e.name === "TimeoutError" || e.name === "TypeError");
            if (!transient || attempt >= retries) throw e;
            await wait(Math.min(2 ** attempt * 5, 60));
          }
        }
      },
    },
    { spent: { get: () => 0 }, usage: Object.getOwnPropertyDescriptor(common, "usage") }
  );
}

// -----------------------------------------------------------------------------
// claude CLI
// -----------------------------------------------------------------------------
function cliModel({ model, system, cwd, timeout = 900, retries = 2, bin = process.env.CLAUDE_BIN || "claude", log = console.log }) {
  let spent = 0;
  mkdirSync(cwd, { recursive: true });

  function run(prompt) {
    return new Promise((done, fail) => {
      const args = ["-p", "--output-format", "json", "--model", model, "--tools", "", "--system-prompt", system, "--no-session-persistence", "--strict-mcp-config"];
      const child = spawn(bin, args, { cwd, stdio: ["pipe", "pipe", "pipe"] });
      let out = "";
      let err = "";
      const timer = setTimeout(() => {
        child.kill("SIGTERM");
        fail(new Error(`timed out after ${timeout}s`));
      }, timeout * 1000);
      child.stdout.on("data", (d) => (out += d));
      child.stderr.on("data", (d) => (err += d));
      child.on("error", (e) => {
        clearTimeout(timer);
        fail(e.code === "ENOENT" ? fatal(`'${bin}' was not found; the claude CLI is needed for CORPUS_ENGINE=cli`) : e);
      });
      child.on("close", (code) => {
        clearTimeout(timer);
        if (code !== 0) return fail(new Error(`claude exited ${code}: ${(err || out).trim().slice(0, 400)}`));
        try {
          const data = JSON.parse(out);
          spent += Number(data.total_cost_usd || 0);
          if (data.is_error || typeof data.result !== "string" || !data.result.trim()) return fail(new Error(`no reply: ${out.slice(0, 300)}`));
          done(data.result);
        } catch {
          done(out);
        }
      });
      child.stdin.end(prompt);
    });
  }

  async function ask(prompt) {
    let last;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await run(prompt);
      } catch (e) {
        last = e;
        if (e.fatal) break;
        const delay = Math.min(2 ** attempt * 5, 60);
        log(`  model error (attempt ${attempt + 1}/${retries + 1}): ${e.message}; retrying in ${delay}s`);
        await wait(delay);
      }
    }
    throw last;
  }

  return {
    model,
    label: `cli:${model}`,
    ask,
    get spent() {
      return spent;
    },
    get usage() {
      return "";
    },
  };
}

/** The JSON a model replied with, fenced or bare. */
export function replyJson(text) {
  const fenced = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  const blob = fenced ? fenced[1] : text.slice(Math.min(...["[", "{"].map((c) => (text.indexOf(c) < 0 ? Infinity : text.indexOf(c)))));
  return JSON.parse(blob.slice(0, Math.max(blob.lastIndexOf("]"), blob.lastIndexOf("}")) + 1));
}

/** Run `fn` over `items` with at most `jobs` at a time. */
export async function pool(items, jobs, fn) {
  const queue = [...items];
  await Promise.all(Array.from({ length: Math.min(jobs, queue.length) }, async () => {
    while (queue.length) await fn(queue.shift());
  }));
}
