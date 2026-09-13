/**
 * The NHCX corpus, shared by build-corpus.mjs and eval-corpus.mjs: the sources it is
 * cut from, how a source is cut into chunks, and the text helpers both need.
 *
 * Sources carry NHCX and nothing about the package: every docs chapter except the
 * README, one rendering per folder of apis/ with each /internal twin folded into the
 * public request it mirrors, and one rendering per use case in mappings/. Links into
 * the package become their labels.
 *
 * A page is cut at its H2 sections. A section too short to stand alone is folded into
 * its neighbour; a section too long is cut at its H3s, and neighbouring H3s are grouped
 * back together up to the size limit. Code fences are never split. Every chunk carries
 * its place as Section › Topic › Subtopic.
 */

import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import YAML from "yaml";
import { readCollection } from "./bru.mjs";

export const API_SECTION = "07-api-collection";
export const DATA_SECTION = "08-data-elements";
// Chapters the fact tables are read from, by their path under docs/.
export const CHAPTER = {
  glossary: "01-Overview/11-Glossary.md",
  workflow: "01-Overview/06-Workflow Codes.md",
  errors: "06-Reference/01-Error Codes.md",
  envelope: "06-Reference/03-Envelope Fields.md",
  codes: "05-FHIR Reference/19-Codes and Value Sets.md",
};
const TOP_LEVEL = { "GAPS.md": "06-reference/08-gap-register.md" }; // docs/README.md is navigation, not NHCX

export const RESOURCES = new Set(["Claim", "ClaimResponse", "CoverageEligibilityRequest", "CoverageEligibilityResponse",
  "InsurancePlan", "Task", "PaymentNotice", "PaymentReconciliation", "Communication", "CommunicationRequest",
  "Patient", "Coverage", "Organization", "Practitioner", "PractitionerRole", "Encounter", "Procedure",
  "Observation", "DiagnosticReport", "DocumentReference", "Composition", "Appointment", "Bundle", "Questionnaire"]);
const ID_PATTERNS = [
  ["endpoint", /\/(?:v\d\/)?[a-z][a-z0-9_]*(?:hcxservice|hcxpayment)?\/[a-z0-9_/]{2,60}/g],
  ["header", /x-hcx-[a-z][a-z0-9_-]*[a-z0-9_]/g],
  ["code", /\b[A-Z]{2,6}-\d{3,5}\b/g],
  ["element", /\b[A-Z][A-Za-z]{2,}\.[a-z][A-Za-z0-9]*(?:\[\d+\])?(?:\.[a-zA-Z][A-Za-z0-9]*)*\b/g],
];

// -----------------------------------------------------------------------------
// Text helpers
// -----------------------------------------------------------------------------
export const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
export const toks = (s) => Math.max(1, Math.floor(s.length / 4));
export const sha = (s) => createHash("sha256").update(s).digest("hex").slice(0, 16);
export const cell = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " ").trim();
export const plain = (md) =>
  String(md ?? "").replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/\*\*|__/g, "").replace(/`/g, "").replace(/\s+/g, " ").trim();
export const clip = (text, n) => (text.length <= n ? text : `${text.slice(0, n - 1).replace(/\s+\S*$/, "")}…`);
export const nrcesPage = (type) => `https://nrces.in/ndhm/fhir/r4/StructureDefinition-${type}.html`;
/** Text reduced for matching a quoted answer: no markup, no case, single spaces. */
export const norm = (s) =>
  String(s ?? "").replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[`*|>#]/g, " ").toLowerCase().replace(/\s+/g, " ").trim();

export function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir).sort()) {
    if (name.startsWith(".")) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else out.push(path);
  }
  return out;
}

/** Keep https links; any other link becomes its label, and an image its alt text. */
export const keepWebLinks = (md) =>
  md.replace(/(!?)\[([^\]]*)\]\(([^)"]*?)(\s+"[^"]*")?\)/g, (whole, bang, label, target) => (!bang && /^https?:/.test(target.trim()) ? whole : label));

export function firstParagraph(md) {
  const prose = md.replace(/^# .+$/m, "").split(/\n\s*\n/).map((b) => b.trim()).find((b) => b && !/^(#|\||```|- |\* |> |<|\d+\. )/.test(b));
  return prose ? plain(prose) : "";
}

export function tableRows(md) {
  const out = [];
  let heading = "";
  let header = null;
  for (const line of md.split("\n")) {
    const h = line.match(/^#{1,6} (.+)$/);
    if (h) heading = h[1].trim();
    if (!line.startsWith("|")) {
      header = null;
      continue;
    }
    const cells = line.trim().replace(/^\|/, "").replace(/\|$/, "").split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, "|"));
    if (cells.every((c) => /^[-: ]*$/.test(c))) continue;
    if (!header) header = cells;
    else out.push({ heading, cells });
  }
  return out;
}

/** Endpoints, x-hcx headers, codes and FHIR element paths named in a text. */
export function identifiers(text) {
  const out = new Set();
  for (const [kind, pattern] of ID_PATTERNS) {
    for (const m of text.match(pattern) || []) {
      const id = m.replace(/\/+$/, "");
      if (kind === "element" && !RESOURCES.has(id.split(".")[0])) continue;
      if (id.length > 2) out.add(id);
    }
  }
  return out;
}

function demote(md) {
  let inFence = false;
  return md.split("\n").map((line) => {
    if (line.trimStart().startsWith("```")) inFence = !inFence;
    return !inFence && /^#{1,5} /.test(line) ? `#${line}` : line;
  }).join("\n");
}

/** The first paragraph of a named H2 section. */
function sectionOf(md, name) {
  const m = md.match(new RegExp(`^## ${name}[ \\t]*\\n+([\\s\\S]*?)(?=\\n## |$)`, "m"));
  return m ? m[1].trim().split(/\n\s*\n/)[0].trim() : "";
}

export const requestPath = (req) => req.url.replace(/^\{\{[^}]+\}\}/, "").replace(/\?.*$/, "");

// -----------------------------------------------------------------------------
// Sources
// -----------------------------------------------------------------------------
export function loadSources(packageDir) {
  const docsDir = join(packageDir, "docs");
  const units = [];
  const unitOfChapter = new Map();
  const sectionTitles = new Map([[API_SECTION, "API collection"], [DATA_SECTION, "Data elements"]]);

  for (const file of walk(docsDir).filter((f) => f.endsWith(".md"))) {
    const parts = relative(docsDir, file).split(sep);
    const rel = parts.length === 1 ? TOP_LEVEL[parts[0]] : `${slug(parts[0])}/${slug(parts.at(-1).replace(/\.md$/, ""))}.md`;
    if (!rel) continue;
    if (parts.length > 1) sectionTitles.set(slug(parts[0]), parts[0].replace(/^\d+-/, ""));
    let text = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
    text = text.replace(/^[ \t]*<!--[\s\S]*?-->[ \t]*\n/gm, "").replace(/<!--[\s\S]*?-->/g, "");
    text = keepWebLinks(text).replace(/\n{3,}/g, "\n\n").trim();
    const title = plain(text.match(/^# (.+)$/m)?.[1] || parts.at(-1).replace(/^\d+-|\.md$/g, ""));
    const unit = { rel, section: rel.split("/")[0], title, sources: [`docs/${parts.join("/")}`], keywords: [], text };
    units.push(unit);
    unitOfChapter.set(parts.join("/"), unit);
  }

  const collection = readCollection(join(packageDir, "apis"));
  for (const folder of collection.folders.filter((f) => f.requests.length)) {
    const paths = new Set(folder.requests.map(requestPath));
    const twinOf = new Map();
    const shown = [];
    for (const req of folder.requests) {
      const path = requestPath(req);
      const pub = path.replace(/^\/internal(?=\/)/, "");
      if (pub !== path && paths.has(pub)) twinOf.set(pub, req);
      else shown.push(req);
    }
    const lines = [`# ${folder.name} APIs`, "", `The NHCX API requests for ${folder.name.toLowerCase()}.`, ""];
    for (const req of shown) {
      const path = requestPath(req);
      lines.push(`## ${req.name}`, "", `\`${req.method} ${path}\``, "");
      const docs = keepWebLinks(req.docs.replace(/\r\n/g, "\n").replace(/^# .+\n+/, "").replace(/^`[A-Z]+ [^`]+`\s*\n+/, "").trim());
      if (docs) lines.push(demote(docs), "");
      const headers = Object.entries(req.headers);
      if (headers.length) lines.push("### Headers", "", "| Header | Value |", "| --- | --- |", ...headers.map(([k, v]) => `| \`${cell(k)}\` | \`${cell(v)}\` |`), "");
      const query = Object.entries(req.query);
      if (query.length) lines.push("### Query parameters", "", "| Parameter | Value |", "| --- | --- |", ...query.map(([k, v]) => `| \`${cell(k)}\` | \`${cell(v)}\` |`), "");
      if (req.body.trim()) lines.push("### Body", "", `\`\`\`${req.bodyType === "json" ? "json" : ""}`, req.body.trim(), "```", "");
      const twin = twinOf.get(path);
      if (twin) {
        lines.push(
          "### Internal adapter route",
          "",
          `\`${twin.method} ${requestPath(twin)}\` is the internal twin of \`${req.method} ${path}\`: the route the NHCX adapter serves, with the same body, headers and responses.`,
          ""
        );
        const when = keepWebLinks(sectionOf(twin.docs, "When to use"));
        if (when) lines.push(when, "");
      }
    }
    units.push({
      rel: `${API_SECTION}/${slug(folder.dir)}.md`,
      section: API_SECTION,
      title: `${folder.name} APIs`,
      sources: [`apis/${folder.dir}/`],
      keywords: [folder.name, ...paths].slice(0, 12),
      text: lines.join("\n").replace(/\n{3,}/g, "\n\n").trim(),
      folder,
    });
  }

  const mappingsDir = join(packageDir, "mappings");
  for (const f of readdirSync(mappingsDir).filter((n) => /^[A-Z]\d+\.yaml$/.test(n))) {
    const data = YAML.parse(readFileSync(join(mappingsDir, f), "utf8"));
    const code = String(data.code);
    const focal = data.focal_resource;
    const lines = [`# ${code} ${data.title}: data elements`, ""];
    if (data.description) lines.push(data.description, "");
    lines.push(
      `- **Use case:** ${code}, ${data.title}`,
      `- **Side:** ${data.side}`,
      ...(data.api ? [`- **API:** \`${data.api}\`${data.callback ? `, answered on \`${data.callback}\`` : ""}`] : []),
      ...(data.workflow ? [`- **Workflow codes:** ${data.workflow}`] : []),
      `- **Carries a JWE:** ${data.carries_jwe ? "yes" : "no"}`,
      ...(focal ? [`- **Focal resource:** [${focal}](${nrcesPage(focal)})`] : []),
      ""
    );
    const profiles = Object.keys(data.profiles || {});
    if (profiles.length) lines.push("## NRCeS profiles", "", ...profiles.map((t) => `- [${t}](${nrcesPage(t)})`), "");
    const groups = new Map();
    for (const field of data.fields || []) {
      const g = field.group || "Fields";
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(field);
    }
    for (const [group, fields] of groups) {
      lines.push(`## ${group}`, "", "| Data element | Key | Type | Cardinality | Required | FHIR path | Example |", "| --- | --- | --- | --- | --- | --- | --- |");
      for (const x of fields) {
        const path = [x.fhir_path, ...(x.also_at || [])].filter(Boolean).map((p) => `\`${cell(p)}\``).join(", also ");
        lines.push(`| ${cell(x.label)} | \`${cell(x.key)}\` | ${cell(x.data_type)} | ${cell(x.cardinality)} | ${x.required ? "yes" : "no"} | ${path} | ${x.example_value !== undefined ? `\`${cell(x.example_value)}\`` : ""} |`);
      }
      lines.push("");
    }
    units.push({
      rel: `${DATA_SECTION}/${code[0].toLowerCase()}${code.slice(1).padStart(2, "0")}-${slug(data.title)}.md`,
      section: DATA_SECTION,
      title: `${code} ${data.title}: data elements`,
      sources: [`mappings/${f}`],
      keywords: [code, data.title, data.api, data.callback, focal].filter(Boolean),
      text: lines.join("\n").trim(),
    });
  }

  units.sort((a, b) => a.rel.localeCompare(b.rel));
  return { units, collection, unitOfChapter, sectionTitles };
}

// -----------------------------------------------------------------------------
// Chunking
// -----------------------------------------------------------------------------
function splitFenced(text) {
  const parts = [];
  let buf = [];
  let inFence = false;
  for (const line of text.split("\n")) {
    if (line.trimStart().startsWith("```")) {
      if (inFence) {
        buf.push(line);
        parts.push([true, buf.join("\n")]);
        buf = [];
        inFence = false;
      } else {
        if (buf.length) parts.push([false, buf.join("\n")]);
        buf = [line];
        inFence = true;
      }
      continue;
    }
    buf.push(line);
  }
  if (buf.length) parts.push([inFence, buf.join("\n")]);
  return parts;
}

/** Greedily pack blocks into pieces of at most `limit` tokens, never splitting a fence. */
function pack(blocks, limit) {
  const out = [];
  let cur = [];
  let curT = 0;
  const flush = () => {
    out.push(cur.join("\n\n"));
    cur = [];
    curT = 0;
  };
  for (const [isFence, b] of blocks) {
    const t = toks(b);
    if (t > limit && !isFence) {
      for (const para of b.split(/\n\s*\n/)) {
        const pt = toks(para);
        if (curT + pt > limit && cur.length) flush();
        cur.push(para);
        curT += pt;
      }
      continue;
    }
    if (curT + t > limit && cur.length) flush();
    cur.push(b);
    curT += t;
  }
  if (cur.length) flush();
  return out.filter((o) => o.trim());
}

/**
 * Cut one page into pieces: { heads: [H2...], h3, text, part }.
 * `fold` merges a section under `min` tokens into its neighbour; `group` packs
 * neighbouring H3s of a long section back together up to `max`.
 */
export function cutPage(body, { max = 600, min = 100, fold = true, group = true } = {}) {
  const parts = body.split(/^(## .+)$/m);
  const sections = [];
  const pre = parts[0].trim().replace(/^# .+$/m, "").trim();
  if (pre) sections.push({ heads: [], text: pre });
  for (let i = 1; i < parts.length; i += 2) {
    const text = (parts[i + 1] || "").trim();
    if (text) sections.push({ heads: [parts[i].slice(3).trim()], text });
  }

  const folded = [];
  for (const s of sections) {
    const prev = folded.at(-1);
    if (fold && prev && (toks(s.text) < min || toks(prev.text) < min) && toks(prev.text) + toks(s.text) <= max) {
      if (!prev.heads.length) {
        prev.heads = s.heads;
        prev.text = `${prev.text}\n\n${s.text}`;
      } else {
        prev.heads.push(...s.heads);
        prev.text = `${prev.text}\n\n## ${s.heads[0]}\n\n${s.text}`;
      }
      continue;
    }
    folded.push({ heads: [...s.heads], text: s.text });
  }

  const pieces = [];
  for (const s of folded) {
    if (toks(s.text) <= max) {
      pieces.push({ heads: s.heads, h3: "", text: s.text, part: 0 });
      continue;
    }
    const p3 = s.text.split(/^(### .+)$/m);
    const subs = [];
    if (p3[0].trim()) subs.push({ h3: "", text: p3[0].trim() });
    for (let j = 1; j < p3.length; j += 2) {
      const text = (p3[j + 1] || "").trim();
      if (text) subs.push({ h3: p3[j].slice(4).trim(), text });
    }
    let cur = null;
    const flush = () => {
      if (cur) pieces.push(cur);
      cur = null;
    };
    for (const sub of subs) {
      if (toks(sub.text) > max) {
        flush();
        pack(splitFenced(sub.text), max).forEach((piece, part) => pieces.push({ heads: s.heads, h3: sub.h3, text: piece, part }));
        continue;
      }
      const body3 = sub.h3 ? `### ${sub.h3}\n\n${sub.text}` : sub.text;
      if (group && cur && toks(cur.text) + toks(body3) <= max) {
        cur.text = `${cur.text}\n\n${body3}`;
        continue;
      }
      flush();
      cur = { heads: s.heads, h3: sub.h3, text: sub.text, part: 0 };
    }
    flush();
  }
  return pieces;
}

/**
 * Chunk records in the shape the chatbot reads, for pages { rel, section, title, keywords, body }.
 * `crumbSection` puts the section title first in the breadcrumb.
 */
export function chunkPages(pages, { sectionTitles, crumbSection = true, ...cut } = {}) {
  const records = [];
  const ids = new Set();
  const bySection = new Map();
  for (const p of pages) {
    if (!bySection.has(p.section)) bySection.set(p.section, []);
    bySection.get(p.section).push(p);
  }
  const codeOf = new Map();
  for (const [section, list] of bySection) list.forEach((p, i) => codeOf.set(p.rel, `${section.split("-")[0]}.${String(i + 1).padStart(2, "0")}`));

  for (const p of pages) {
    for (const piece of cutPage(p.body, cut)) {
      const h2 = piece.heads.map(plain).join(" · ");
      const h3 = plain(piece.h3);
      const anchor = slug(h3 ? `${piece.heads[0] || ""} ${h3}` : piece.heads[0] || "") || "intro";
      const base = `${p.rel}#${anchor}${piece.part ? `~${piece.part}` : ""}`;
      let id = base;
      for (let n = 2; ids.has(id); n++) id = `${base}.${n}`;
      ids.add(id);
      const sectionTitle = sectionTitles?.get(p.section) || "";
      records.push({
        id,
        page: p.rel,
        page_title: p.title,
        code: codeOf.get(p.rel),
        section: p.section,
        topic: p.title,
        subtopic: [h2, h3].filter(Boolean).join(" › "),
        breadcrumb: [crumbSection ? sectionTitle : "", p.title, h2, h3].filter(Boolean).join(" › "),
        anchor: anchor === "intro" ? "" : anchor,
        heading: h3 || h2 || p.title,
        text: piece.text,
        keywords: [...(p.keywords || [])],
      });
    }
  }
  return records;
}

/**
 * Drop a chunk whose text is at least `threshold` contained in an earlier chunk, and
 * tell the kept chunk where else it applies, so both topics still reach it.
 */
export function dedupe(records, threshold = 0.9) {
  const shingles = (t) => {
    const w = norm(t).split(/[^a-z0-9./_-]+/).filter(Boolean);
    const s = new Set();
    for (let i = 0; i + 5 <= w.length; i++) s.add(w.slice(i, i + 5).join(" "));
    return s;
  };
  const inverted = new Map();
  const kept = [];
  let dropped = 0;
  for (const r of records) {
    const s = shingles(r.text);
    let home = -1;
    if (s.size >= 20) {
      const shared = new Map();
      for (const x of s) for (const j of inverted.get(x) || []) shared.set(j, (shared.get(j) || 0) + 1);
      let best = 0;
      for (const [j, n] of shared) if (n / s.size >= threshold && n > best) [best, home] = [n, j];
    }
    if (home >= 0) {
      (kept[home].also ||= []).push(r.breadcrumb);
      dropped += 1;
      continue;
    }
    for (const x of s) {
      if (!inverted.has(x)) inverted.set(x, []);
      inverted.get(x).push(kept.length);
    }
    kept.push(r);
  }
  for (const r of kept) {
    if (!r.also) continue;
    r.text = `${r.text}\n\nThe same applies to: ${[...new Set(r.also)].join("; ")}.`;
    delete r.also;
  }
  return { records: kept, dropped };
}

/** Size, kind and the snippet the chatbot shows its model, once a chunk's text is final. */
export function finish(r, { max = 600 } = {}) {
  const tokens = toks(r.text);
  const fenced = (r.text.match(/```[\s\S]*?```/g) || []).reduce((n, f) => n + f.length, 0);
  const oversized = tokens > max * 1.5;
  const lines = r.text.split("\n");
  return {
    ...r,
    snippet: oversized ? `${lines.slice(0, 50).join("\n")}\n… ${lines.length - 50} more lines in ${r.page_title}` : r.text,
    tokens,
    kind: fenced > r.text.length * 0.6 ? "payload" : "prose",
    oversized,
  };
}
