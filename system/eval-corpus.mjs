#!/usr/bin/env node
/**
 * Measures how well the corpus serves the NHCX chatbot. A held-out set of questions,
 * each tied to the verbatim passage that answers it, is run through the chatbot's own
 * retrieval (lib/bm25.mjs). A question is answered when its passage reaches the
 * context the chatbot's model reads.
 *
 *   node system/eval-corpus.mjs questions [--model <id>] [--force]
 *       a model writes the questions into system/eval/questions.jsonl; only pages whose
 *       source changed get new ones
 *   node system/eval-corpus.mjs score [<chunks.jsonl>...]
 *       score chunk indexes (default corpus/index/chunks.jsonl)
 *   node system/eval-corpus.mjs chunking
 *       score chunking settings on the plain sources, without calling a model
 *
 * Scores: context = the answer reaches the chatbot's context (k 6, 3500 tokens, 2 per page);
 * page = a chunk of the right page does; mrr = mean reciprocal rank of the answering chunk
 * in the top 20.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Bm25 } from "./lib/bm25.mjs";
import { DEFAULT_MODEL, createModel, pool, replyJson } from "./lib/claude.mjs";
import { chunkPages, dedupe, finish, loadSources, norm, sha } from "./lib/corpus.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_DIR = resolve(__dirname, "..");
const QUESTIONS = join(__dirname, "eval", "questions.jsonl");
const [command = "score", ...rest] = process.argv.slice(2);
const flag = (name, fallback) => {
  const at = rest.indexOf(`--${name}`);
  return at < 0 ? fallback : rest[at + 1] && !rest[at + 1].startsWith("--") ? rest[at + 1] : true;
};
const say = (m) => console.log(`[eval-corpus] ${m}`);

const readQuestions = () => (existsSync(QUESTIONS) ? readFileSync(QUESTIONS, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l)) : []);

// -----------------------------------------------------------------------------
// Scoring
// -----------------------------------------------------------------------------
export function score(chunks, questions, { k = 6, budget = 3500, perPage = 2 } = {}) {
  const bm = new Bm25(chunks);
  const snippets = chunks.map((c) => norm(c.snippet));
  const tally = () => ({ n: 0, context: 0, page: 0, rr: 0 });
  const total = tally();
  const bySection = new Map();
  const byType = new Map();
  const misses = [];
  for (const q of questions) {
    const answer = norm(q.answer);
    const ranked = bm.rank(q.question);
    const picked = new Set(bm.search(q.question, { k, perPage, budget }).map((c) => c.id));
    const context = chunks.some((c, i) => picked.has(c.id) && snippets[i].includes(answer));
    const page = chunks.some((c) => picked.has(c.id) && c.page === q.page);
    const pos = ranked.slice(0, 20).findIndex(({ i }) => snippets[i].includes(answer));
    for (const t of [total, bySection.get(q.section) || bySection.set(q.section, tally()).get(q.section), byType.get(q.type) || byType.set(q.type, tally()).get(q.type)]) {
      t.n += 1;
      t.context += context;
      t.page += page;
      t.rr += pos >= 0 ? 1 / (pos + 1) : 0;
    }
    if (!context) misses.push(q);
  }
  return { total, bySection, byType, misses };
}

const pct = (t, key) => `${((100 * t[key]) / Math.max(1, t.n)).toFixed(1)}%`;
const line = (name, t) => `${name.padEnd(34)} n=${String(t.n).padStart(3)}  context ${pct(t, "context").padStart(6)}  page ${pct(t, "page").padStart(6)}  mrr ${(t.rr / Math.max(1, t.n)).toFixed(3)}`;

function report(name, result, detail = false) {
  console.log(line(name, result.total));
  if (!detail) return;
  for (const [s, t] of [...result.bySection].sort()) console.log(`  ${line(s, t)}`);
  for (const [s, t] of [...result.byType].sort()) console.log(`  ${line(`type: ${s}`, t)}`);
}

// -----------------------------------------------------------------------------
// Questions
// -----------------------------------------------------------------------------
function questionPrompt(u, n) {
  return `You are building an evaluation set for a question-answering assistant over the documentation of NHCX, India's National Health Claims Exchange.

Read the SOURCE and write ${n} questions that a person integrating a hospital, insurer, TPA or PMJAY system with NHCX would really ask, each answered by one specific place in the source.

For each question give:
- "question": the way a developer or a claims-operations person would type it into a chat. Use your own words: paraphrase, use everyday synonyms, do not copy the source's headings or sentences. Vary the length; some questions are a few words, some explain what the person is building.
- "answer": a verbatim quote from the SOURCE, 4 to 25 words, that contains the answer. Copy it exactly from one sentence, list item or table cell; never join text from different places.
- "type": one of fact, procedure, concept, troubleshooting, comparison.

Spread the questions across the whole source, not just its start. Prefer questions with a specific answer: a code, an endpoint, a header, a rule, a step, a value, a condition.

Reply with a JSON array only.

SOURCE: ${u.title}
<source>
${u.text}
</source>`;
}

async function writeQuestions() {
  const { units } = loadSources(PACKAGE_DIR);
  const model = createModel({ model: flag("model", process.env.EVAL_MODEL || DEFAULT_MODEL), system: "You write evaluation data. You reply with JSON only. You never use tools.", cwd: join(__dirname, ".cache", "eval"), log: say });
  const existing = readQuestions();
  const hashes = new Map(units.map((u) => [u.rel, sha(u.text)]));
  const keep = flag("force", false) ? [] : existing.filter((q) => hashes.get(q.page) === q.page_hash);
  const have = new Set(keep.map((q) => q.page));
  const todo = units.filter((u) => !have.has(u.rel));
  say(`${units.length} pages; ${todo.length} need questions (${model.label})`);
  const fresh = [];
  let failed = 0;
  await pool(todo, Number(flag("jobs", 6)), async (u) => {
    const words = u.text.split(/\s+/).length;
    const n = Math.min(6, Math.max(1, Math.round(words / 400)));
    const source = norm(u.text);
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const got = replyJson(await model.ask(questionPrompt(u, n)))
          .filter((q) => q && typeof q.question === "string" && typeof q.answer === "string")
          .filter((q) => norm(q.answer).split(" ").length >= 3 && source.includes(norm(q.answer)) && !norm(q.question).includes(norm(q.answer)))
          .map((q) => ({ page: u.rel, page_hash: hashes.get(u.rel), section: u.section, type: q.type || "fact", question: q.question.trim(), answer: q.answer.trim() }));
        if (got.length) {
          fresh.push(...got);
          say(`  ${u.rel}: ${got.length}/${n}`);
          return;
        }
      } catch (e) {
        if (e.fatal) {
          say(`STOPPED: ${e.message}`);
          process.exit(1);
        }
        say(`  ${u.rel}: ${e.message}`);
      }
    }
    failed += 1;
  });
  const all = [...keep, ...fresh].sort((a, b) => a.page.localeCompare(b.page));
  mkdirSync(dirname(QUESTIONS), { recursive: true });
  writeFileSync(QUESTIONS, `${all.map((q) => JSON.stringify(q)).join("\n")}\n`);
  say(`${all.length} questions in ${QUESTIONS} (${fresh.length} new, ${failed} pages failed)${model.spent ? `; ~$${model.spent.toFixed(2)} at Anthropic list prices` : ""}`);
}

// -----------------------------------------------------------------------------
// Commands
// -----------------------------------------------------------------------------
if (command === "questions") {
  await writeQuestions();
} else if (command === "score") {
  const questions = readQuestions();
  if (!questions.length) throw new Error("no questions yet; run: node system/eval-corpus.mjs questions");
  const settings = { k: Number(flag("k", 6)), budget: Number(flag("budget", 3500)), perPage: Number(flag("per-page", 2)) };
  const valued = new Set(["--k", "--budget", "--per-page", "--model", "--jobs"]);
  const files = rest.filter((a, i) => !a.startsWith("--") && !valued.has(rest[i - 1]));
  say(`retrieval as the chatbot runs it: k ${settings.k}, budget ${settings.budget} tokens, ${settings.perPage} per page`);
  for (const f of files.length ? files : [join(PACKAGE_DIR, "corpus", "index", "chunks.jsonl")]) {
    const chunks = readFileSync(f, "utf8").trim().split("\n").map((l) => JSON.parse(l));
    report(f.replace(`${PACKAGE_DIR}/`, ""), score(chunks, questions, settings), Boolean(flag("detail", false)));
  }
} else if (command === "chunking") {
  const questions = readQuestions();
  if (!questions.length) throw new Error("no questions yet; run: node system/eval-corpus.mjs questions");
  const { units, sectionTitles } = loadSources(PACKAGE_DIR);
  const pages = units.map((u) => ({ ...u, body: u.text }));
  const variants = [
    ["v4 chunker: 1000/40, flat", { max: 1000, min: 40, fold: false, group: false, dedupe: false, crumbSection: false }],
    ["600/100 fold+group", { max: 600, min: 100, dedupe: false, crumbSection: false }],
    ["600/100 fold+group+dedupe", { max: 600, min: 100, dedupe: true, crumbSection: false }],
    ["600/100 +dedupe +section crumb", { max: 600, min: 100, dedupe: true, crumbSection: true }],
    ["400/80 +dedupe +section crumb", { max: 400, min: 80, dedupe: true, crumbSection: true }],
    ["800/120 +dedupe +section crumb", { max: 800, min: 120, dedupe: true, crumbSection: true }],
    ["1000/150 +dedupe +section crumb", { max: 1000, min: 150, dedupe: true, crumbSection: true }],
  ];
  for (const [name, v] of variants) {
    let records = chunkPages(pages, { sectionTitles, ...v });
    let dropped = 0;
    if (v.dedupe) ({ records, dropped } = dedupe(records));
    const chunks = records.map((r) => finish(r, v));
    const t = chunks.map((c) => c.tokens).sort((a, b) => a - b);
    report(`${name} [${chunks.length} chunks, p50 ${t[t.length >> 1]}, -${dropped}]`, score(chunks, questions), Boolean(flag("detail", false)));
  }
} else {
  console.error(`unknown command ${command}; use questions, score or chunking`);
  process.exit(1);
}
