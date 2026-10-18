#!/usr/bin/env node
/**
 * Builds corpus/, the index the NHCX chatbot answers from: corpus/index/chunks.jsonl
 * and corpus/index/facts.json, the only two files it reads.
 *
 *   1. CHUNKS  every docs chapter, API folder and use case mapping (lib/corpus.mjs) is cut
 *              at its sections into chunks of verbatim text, each placed as
 *              Section › Topic › Subtopic; near-identical chunks are merged.
 *   2. INDEX   Claude on Amazon Bedrock (lib/claude.mjs) reads each page and writes a summary and
 *              keywords for the page, and for every chunk a line of context, search keywords
 *              with the words people use, and the questions it answers. Nothing it writes may
 *              name an identifier the package does not contain. The results are cached in
 *              system/.cache/corpus under a hash of the page's chunks, so a rebuild only
 *              calls the model for pages whose content changed.
 *   3. FACTS   exact-lookup tables read from the data files: workflow codes and status values,
 *              error codes, endpoints, constants, glossary terms and protocol headers.
 *
 * Usage: node system/build-corpus.mjs [--model <id>] [--jobs <n>] [--offline] [--no-index] [--out <dir>]
 *   --model     the model that indexes the pages; default $CORPUS_MODEL, else zai.glm-5 (lib/claude.mjs DEFAULT_MODEL)
 *   --offline   never call the model; fail if a page's index is out of date
 *   --no-index  plain chunks only, without the model's index
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import { DEFAULT_MODEL, createModel, pool, replyJson } from "./lib/claude.mjs";
import { CHAPTER, chunkPages, clip, dedupe, finish, firstParagraph, identifiers, loadSources, plain, requestPath, sha, tableRows, walk } from "./lib/corpus.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_DIR = resolve(__dirname, "..");
const CACHE = join(__dirname, ".cache", "corpus");
const DATA_FILES = ["workflow.yaml", "usecases.yaml", "nhcx-error.yaml", "fhir/reference.yaml"].map((f) => join(PACKAGE_DIR, f));

const flags = new Map();
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (!a.startsWith("--")) continue;
  const next = process.argv[i + 1];
  flags.set(a.slice(2), next && !next.startsWith("--") ? (i++, next) : true);
}
const OUT = flags.has("out") ? resolve(process.cwd(), flags.get("out")) : join(PACKAGE_DIR, "corpus");
const IDX = join(OUT, "index");
const MODEL = flags.get("model") || DEFAULT_MODEL;
const SYSTEM = "You index documentation for retrieval. You reply with JSON only. You never use tools.";
const JOBS = Number(flags.get("jobs") || 4);
const OFFLINE = flags.has("offline");
const NO_INDEX = flags.has("no-index");
// Chosen on the eval set (system/eval-corpus.mjs): sections of up to ~1000 tokens, none under
// ~150, kept more answers in the chatbot's context than chunks of 400, 600 or 1500.
const CUT = { max: 1000, min: 150 };
const PROMPT_VERSION = "1";
const say = (m) => console.log(`[build-corpus] ${m}`);

// Things an index entry about NHCX has no reason to say.
const OFF_TOPIC = [/file:\/\//, /\{\{[^}]*\}\}/, /\b[\w-]+\.(?:bru|mjs|ya?ml)\b/i, /\bBruno\b/i, /\b(?:build-docs|node_modules|Makefile|npm)\b/, /\bfixtures?\//i];

// -----------------------------------------------------------------------------
// 1. Chunks
// -----------------------------------------------------------------------------
const { units, collection, unitOfChapter, sectionTitles } = loadSources(PACKAGE_DIR);
const pages = units.map((u) => ({ ...u, body: u.text }));
const { records, dropped } = dedupe(chunkPages(pages, { sectionTitles, ...CUT }));
const byPage = new Map(pages.map((p) => [p.rel, []]));
for (const r of records) byPage.get(r.page).push(r);
say(`${pages.length} pages -> ${records.length} chunks (${dropped} near-identical chunks merged)`);

const known = new Set();
for (const u of units) for (const id of identifiers(u.text)) known.add(id);
for (const f of DATA_FILES) for (const id of identifiers(readFileSync(f, "utf8"))) known.add(id);

// -----------------------------------------------------------------------------
// 2. Index: a model describes each page and each of its chunks
// -----------------------------------------------------------------------------
function indexPrompt(page, recs) {
  return `You are indexing one page of the NHCX knowledge base for retrieval. An assistant answers questions from people integrating hospitals, insurers, TPAs and PMJAY with NHCX, India's National Health Claims Exchange. It finds chunks by keyword search, and it reads one chunk at a time, never the whole page.

For the page, write:
- "summary": one sentence of at most 200 characters: what the page answers.
- "keywords": 5 to 12 terms a person would search for this page by.

For every chunk, by its id, write:
- "context": one or two sentences, at most 300 characters, that place the chunk: which exchange, role, payer (any payer, or PMJAY), resource, code or step it is about, and how it fits the page. A reader who sees only the chunk must know what it covers. Do not repeat the chunk's details.
- "keywords": 5 to 12 search terms: the codes, endpoints, headers and elements the chunk is about, and the words people use for its topic, including synonyms and short forms the chunk itself does not use (for example "preauth", "cashless approval", "TPA").
- "questions": 3 to 5 questions the chunk answers, the way a developer or a claims-operations person would ask them.

Use only what the page says. Never name a code, endpoint, header or element that is not on the page. Write about NHCX, not about files or tools.

Reply with JSON only:
{"summary": "...", "keywords": ["..."], "chunks": [{"id": "...", "context": "...", "keywords": ["..."], "questions": ["..."]}]}

PAGE: ${page.title} (${sectionTitles.get(page.section) || page.section})
${recs.map((r) => `<chunk id="${r.id}" place="${r.breadcrumb}">\n${r.text}\n</chunk>`).join("\n\n")}`;
}

/** Strings from a model's list that are safe to index: on topic, and naming only known identifiers. */
function clean(list, limit, maxLen) {
  if (!Array.isArray(list)) return [];
  const out = [];
  for (const x of list) {
    if (typeof x !== "string") continue;
    const s = plain(x);
    if (!s || s.length > maxLen || OFF_TOPIC.some((p) => p.test(s))) continue;
    if ([...identifiers(s)].some((id) => !known.has(id))) continue;
    if (!out.some((o) => o.toLowerCase() === s.toLowerCase())) out.push(s);
  }
  return out.slice(0, limit);
}

function readIndex(data, recs) {
  const errs = [];
  const chunks = {};
  const listed = new Map((Array.isArray(data?.chunks) ? data.chunks : []).map((c) => [c?.id, c]));
  for (const r of recs) {
    const c = listed.get(r.id);
    if (!c) {
      errs.push(`no entry for chunk ${r.id}`);
      continue;
    }
    const context = typeof c.context === "string" ? plain(c.context) : "";
    const badContext = !context || OFF_TOPIC.some((p) => p.test(context)) || [...identifiers(context)].some((id) => !known.has(id));
    if (badContext) errs.push(`chunk ${r.id}: the context is missing, off topic, or names an identifier not on the page`);
    chunks[r.id] = { context: badContext ? "" : clip(context, 320), keywords: clean(c.keywords, 12, 80), questions: clean(c.questions, 5, 200) };
  }
  return { errs, value: { summary: clip(plain(data?.summary || ""), 200), keywords: clean(data?.keywords, 12, 80), chunks } };
}

// --test [page]: index one page with the model and show the result, without touching the
// cache or corpus/. The quick way to check a model or a key works.
if (flags.has("test")) {
  const want = typeof flags.get("test") === "string" ? flags.get("test") : "02-getting-started/03-session-token.md";
  const page = pages.find((p) => p.rel === want) || pages.find((p) => p.rel.includes(want));
  if (!page) {
    say(`no page matches ${want}`);
    process.exit(1);
  }
  const recs = byPage.get(page.rel);
  const model = createModel({ model: MODEL, system: SYSTEM, cwd: CACHE, log: say });
  const started = Date.now();
  try {
    const { errs, value } = readIndex(replyJson(await model.ask(indexPrompt(page, recs))), recs);
    const withContext = Object.values(value.chunks).filter((c) => c.context).length;
    say(`test ${page.rel} with ${model.label}: ${withContext}/${recs.length} chunks indexed, ${errs.length} problems, ${((Date.now() - started) / 1000).toFixed(0)}s, ${model.usage}`);
    for (const e of errs.slice(0, 5)) say(`  - ${e}`);
    say(`summary: ${value.summary}`);
    say(`keywords: ${value.keywords.join(" | ")}`);
    for (const [id, c] of Object.entries(value.chunks).slice(0, 2)) say(`# ${id}\n    context: ${c.context}\n    keywords: ${c.keywords.join(" | ")}\n    questions: ${c.questions.join(" / ")}`);
    process.exit(errs.length ? 1 : 0);
  } catch (e) {
    say(`test FAILED with ${model.label}: ${e.message}`);
    process.exit(1);
  }
}

const cacheFile = (rel) => join(CACHE, `${rel}.json`);
const pageHash = (p, recs) => sha(`${PROMPT_VERSION}\0${p.rel}\0${recs.map((r) => `${r.id}\0${r.breadcrumb}\0${r.text.replace(/[ \t]+/g, " ").replace(/-{3,}/g, "---").replace(/ ?\| ?/g, "|")}`).join("\0")}`);
const index = new Map();
const stale = [];
for (const p of pages) {
  const hash = pageHash(p, byPage.get(p.rel));
  const file = cacheFile(p.rel);
  const cached = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : null;
  if (cached?.hash === hash) index.set(p.rel, cached);
  else stale.push({ page: p, hash });
}

if (!NO_INDEX && stale.length) {
  if (OFFLINE) {
    for (const s of stale) say(`  out of date: ${s.page.rel}`);
    say("these pages changed and --offline forbids calling the model");
    process.exit(1);
  }
  const model = createModel({ model: MODEL, system: SYSTEM, cwd: CACHE, log: say });
  say(`indexing ${stale.length} pages with ${model.label} (${pages.length - stale.length} unchanged)`);
  const started = Date.now();
  let done = 0;
  let failed = 0;
  await pool(stale, JOBS, async ({ page, hash }) => {
    const recs = byPage.get(page.rel);
    let prompt = indexPrompt(page, recs);
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const { errs, value } = readIndex(replyJson(await model.ask(prompt)), recs);
        if (!errs.length || attempt === 2) {
          const entry = { hash, model: model.label, ...value };
          mkdirSync(dirname(cacheFile(page.rel)), { recursive: true });
          writeFileSync(`${cacheFile(page.rel)}.tmp`, JSON.stringify(entry, null, 1));
          renameSync(`${cacheFile(page.rel)}.tmp`, cacheFile(page.rel));
          index.set(page.rel, entry);
          say(`  indexed ${page.rel} (${++done}/${stale.length})${errs.length ? `, ${errs.length} chunks without context` : ""}`);
          return;
        }
        prompt = `${indexPrompt(page, recs)}\n\nYour previous reply was rejected:\n- ${errs.slice(0, 20).join("\n- ")}\nReply again with the complete JSON.`;
      } catch (e) {
        if (e.fatal) {
          say(`STOPPED: ${e.message}`);
          say("corpus/ left as it was");
          process.exit(1);
        }
        say(`  ${page.rel}: ${e.message}`);
      }
    }
    failed += 1;
    say(`  FAILED ${page.rel}`);
  });
  say(`indexed ${done} pages, ${failed} failed, in ${((Date.now() - started) / 60000).toFixed(1)} min${model.usage ? `, ${model.usage}` : ""}${model.spent ? `, ~$${model.spent.toFixed(2)} at Anthropic list prices` : ""}`);
  if (failed) {
    say("corpus/ left as it was; rerun to retry the failed pages");
    process.exit(1);
  }
}

// Drop cached indexes of pages that are gone.
const live = new Set(pages.map((p) => cacheFile(p.rel)));
if (existsSync(CACHE)) for (const f of walk(CACHE)) if (f.endsWith(".json") && !live.has(f)) unlinkSync(f);

// How the index is used, chosen on the eval set: the context line leads the chunk's text, and
// the keywords and questions join the keywords the chatbot's search weighs three times over.
// The questions carry most of the gain; placed in the text they only cost the chatbot tokens.
const chunks = records.map((r) => {
  const pageIndex = NO_INDEX ? null : index.get(r.page);
  const entry = pageIndex?.chunks?.[r.id];
  const text = entry?.context ? `${entry.context}\n\n${r.text}` : r.text;
  const keywords = [...new Set([...r.keywords, ...(pageIndex?.keywords || []), ...(entry?.keywords || []), ...(entry?.questions || [])])];
  return finish({ ...r, text, keywords }, CUT);
});

// -----------------------------------------------------------------------------
// 3. Facts, from the data files
// -----------------------------------------------------------------------------
const workflow = YAML.parse(readFileSync(join(PACKAGE_DIR, "workflow.yaml"), "utf8"));
const errorsData = YAML.parse(readFileSync(join(PACKAGE_DIR, "nhcx-error.yaml"), "utf8"));
const reference = YAML.parse(readFileSync(join(PACKAGE_DIR, "fhir", "reference.yaml"), "utf8"));
const citeOf = (key) => unitOfChapter.get(CHAPTER[key])?.rel || "";
const compact = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== ""));
const facts = { source: "package", workflow_codes: {}, status_values: {}, constants: {}, error_codes: {}, endpoints: {}, glossary: {} };

for (const c of workflow.codes || []) {
  const code = String(c.code);
  facts.workflow_codes[code] = compact({
    code,
    name: c.name,
    description: c.means,
    constant: c.constant,
    use_case: c.use_case,
    side: c.authored_by,
    statuses: (c.statuses || []).join(", "),
    reused: c.reused ? "yes: only the pair with x-hcx-status tells its messages apart" : undefined,
    cite: citeOf("workflow"),
  });
  for (const s of c.statuses || []) (facts.status_values[s] ||= { value: s, workflow_codes: [], cite: citeOf("workflow") }).workflow_codes.push(code);
  if (c.constant) facts.constants[c.constant] = compact({ value: code, meaning: c.means, cite: citeOf("workflow") });
}

const spaceName = new Map((errorsData.spaces || []).map((s) => [s.id, s.name]));
const readingsOf = new Map();
for (const c of errorsData.codes || []) {
  if (!readingsOf.has(c.code)) readingsOf.set(c.code, []);
  readingsOf.get(c.code).push(c);
}
for (const [code, readings] of readingsOf) {
  const single = readings.length === 1;
  facts.error_codes[code] = compact({
    code,
    group: [...new Set(readings.map((r) => spaceName.get(r.space) || r.space))].join(" / "),
    description: single ? readings[0].message : readings.map((r) => `${spaceName.get(r.space) || r.space}: ${r.message}`).join(" | "),
    note: single ? undefined : "This code means one thing from a payer implementing the published standard and another from the PMJAY reference payer; decide which payer sent it.",
    cite: citeOf("errors"),
  });
}

for (const u of units.filter((x) => x.folder)) {
  for (const req of u.folder.requests) {
    const key = requestPath(req).toLowerCase();
    if (facts.endpoints[key]) continue;
    const summary = req.docs.match(/## Summary\s*\n+([\s\S]*?)(\n\s*\n|$)/)?.[1] || firstParagraph(req.docs.replace(/^`[A-Z]+ [^`]+`\s*$/m, ""));
    facts.endpoints[key] = compact({ path: key, method: req.method, service: u.folder.name, purpose: clip(plain(summary) || req.name, 300), cite: u.rel });
  }
}

const glossary = unitOfChapter.get(CHAPTER.glossary);
if (glossary) {
  let group = "";
  for (const line of glossary.text.split("\n")) {
    const h = line.match(/^## (.+)$/);
    if (h) group = plain(h[1]);
    const m = line.match(/^- \*\*(.+?)\*\*\s*(.*)$/);
    if (!m) continue;
    const names = plain(m[1]).replace(/\.$/, "").split(/,\s*/).filter(Boolean);
    for (const term of names) facts.glossary[term] = compact({ term, definition: plain(m[2]), group, also: names.length > 1 ? names.filter((n) => n !== term).join(", ") : undefined, cite: glossary.rel });
  }
}

const envelope = unitOfChapter.get(CHAPTER.envelope);
if (envelope) {
  for (const { heading, cells } of tableRows(envelope.text)) {
    const name = cells[0].match(/^`(x-hcx-[a-z0-9_-]+)`$/i)?.[1];
    if (name) {
      const entry = { term: name, definition: plain(cells.at(-1)), group: plain(heading), cite: envelope.rel };
      if (cells.length >= 4) Object.assign(entry, { type: plain(cells[1]), required: plain(cells[2]) });
      facts.glossary[name] ||= entry;
      continue;
    }
    const status = cells[0].match(/`((?:request|response)\.[a-z_]+)`/)?.[1];
    if (status && cells.length > 1) {
      const e = (facts.status_values[status] ||= { value: status, cite: envelope.rel });
      Object.assign(e, { meaning: plain(cells.at(-1)), layer: plain(heading) });
      if (e.cite !== envelope.rel) e.defined_in = envelope.rel;
    }
  }
}
for (const e of Object.values(facts.status_values)) if (Array.isArray(e.workflow_codes)) e.workflow_codes = e.workflow_codes.join(", ");
for (const vs of reference.codes?.value_sets || []) if (vs.title && vs.system) facts.constants[vs.title] = { value: vs.system, cite: citeOf("codes") };

// -----------------------------------------------------------------------------
// 4. Check, then write corpus/index/
// -----------------------------------------------------------------------------
const fails = [];
const chunked = new Set(chunks.map((c) => c.page));
for (const p of pages) if (!chunked.has(p.rel)) fails.push(`${p.rel} has no chunks`);
if (new Set(chunks.map((c) => c.id)).size !== chunks.length) fails.push("chunk ids are not unique");
for (const [k, v] of Object.entries(facts)) if (typeof v === "object" && !Object.keys(v).length) fails.push(`facts: ${k} is empty`);
if (fails.length) {
  say(`FAILED, ${fails.length} problem(s); corpus/ left as it was:`);
  for (const f of fails.slice(0, 40)) say(`  - ${f}`);
  process.exit(1);
}
if (existsSync(OUT)) {
  const stray = readdirSync(OUT).filter((n) => n !== "index" && !n.startsWith("."));
  if (stray.length) {
    say(`${OUT} holds files that are not the corpus (${stray.join(", ")}); refusing to replace it`);
    process.exit(1);
  }
}
rmSync(IDX, { recursive: true, force: true });
mkdirSync(IDX, { recursive: true });
writeFileSync(join(IDX, "chunks.jsonl"), `${chunks.map((c) => JSON.stringify(c)).join("\n")}\n`);
writeFileSync(join(IDX, "facts.json"), `${JSON.stringify(facts, null, 2)}\n`);

const indexed = chunks.filter((c) => index.get(c.page)?.chunks?.[c.id]?.context).length;
const counts = Object.entries(facts).filter(([, v]) => typeof v === "object").map(([k, v]) => `${k.replace(/_/g, " ")} ${Object.keys(v).length}`);
say(`${chunks.length} chunks (${indexed} with the model's index), facts: ${counts.join(", ")}`);
say(`wrote ${relative(PACKAGE_DIR, IDX).split(sep).join("/") || IDX}/chunks.jsonl and facts.json`);
