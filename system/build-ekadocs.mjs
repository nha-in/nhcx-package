/**
 * Ports the NHCX package into a checkout of github.com/nha-in/docs, laid out the
 * way that site lays out HIE-CM.
 *
 *   documentation/pages/nhcx/v1/               every chapter under docs/, placed in the
 *                                              site's sections: getting-started, roles,
 *                                              registries, concepts, go-live, reference
 *   documentation/pages/nhcx/v1/api/<module>/  one overview page per Bruno folder
 *   documentation/catalogue/openapi/nhcx/v1/   one OpenAPI 3.1 file per Bruno folder, the
 *                                              callbacks as webhooks and the error codes
 *                                              as x-abdm-errors
 *
 * The site's own build (docs/scripts/build-api-reference.mjs) turns the specifications
 * into the endpoint pages, the Scalar references and the authentication, callbacks and
 * error code pages, as it does for HIE-CM. Both NHCX folders above are owned by this
 * script and replaced on every run.
 *
 * Usage:
 *   node system/build-ekadocs.mjs <nha-in/docs checkout> [--branch <branch>] [--repo <url>]
 *   make ekadocs [EKADOCS_DIR=<checkout>] [EKADOCS_BRANCH=<branch>]
 *
 * With --branch the checkout is cloned at that branch, or pulled to its latest
 * commit, before the port.
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import { parseBru, readCollection } from "./lib/bru.mjs";

const PACKAGE_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS_DIR = join(PACKAGE_DIR, "docs");
const APIS_DIR = join(PACKAGE_DIR, "apis");

const PLATFORM = "nhcx";
const VERSION = "v1";
const SITE = `/docs/${PLATFORM}/${VERSION}`;
// How pages and specifications name the package in `source:` and x-abdm-sources.
const SOURCE = "nhcx-package";

// Where each package section lands in the site's tree. Reference chapters sit after
// the three pages the site generates there (authentication, callbacks, error codes).
const SECTIONS = {
  "01-Overview": { dir: "concepts" },
  "02-Getting Started": { dir: "getting-started" },
  "03-Building a Provider": { dir: "roles/provider", roles: ["provider"] },
  "04-Building a Payer": { dir: "roles/payer", roles: ["payer"] },
  "05-FHIR Reference": { dir: "reference/fhir" },
  "06-Reference": { dir: "reference", offset: 10 },
  "07-Go Live": { dir: "go-live" },
};

// Chapters that take a fixed place rather than a page in their section's folder.
const PLACED = {
  "01-Overview/01-Introduction.md": "index.md",
  "01-Overview/03-Participants and Policies.md": "registries/index.md",
  "01-Overview/11-Glossary.md": "getting-started/glossary.md",
  "03-Building a Provider/01-Provider Overview.md": "roles/provider/index.md",
  "04-Building a Payer/01-Payer Overview.md": "roles/payer/index.md",
  "05-FHIR Reference/01-Bundles and Conventions.md": "reference/fhir/index.md",
  // reference/error-codes.md is the site's, generated from the specs' x-abdm-errors.
  "06-Reference/01-Error Codes.md": "reference/error-code-guide.md",
  "07-Go Live/01-Going Live.md": "go-live/index.md",
};
const POSITION = { "01-Overview/11-Glossary.md": 90 };
const LABEL = { "06-Reference/01-Error Codes.md": "Reading error codes" };

const CATEGORIES = {
  "getting-started": { label: "Getting started", position: 2 },
  roles: { label: "Choose your path", position: 3 },
  "roles/provider": { label: "Building a provider", position: 1, customProps: { roles: ["provider"] } },
  "roles/payer": { label: "Building a payer", position: 2, customProps: { roles: ["payer"] } },
  registries: { label: "Registries", position: 4 },
  concepts: { label: "Core concepts", position: 5 },
  "go-live": { label: "Go live", position: 6 },
  "reference/fhir": { label: "FHIR bundles", position: 30 },
};

const ALL_ROLES = ["provider", "payer"];
const METHODS = ["get", "put", "post", "delete", "patch", "options", "head"];

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const read = (path) => readFileSync(path, "utf8");
const sha256 = (text) => createHash("sha256").update(text).digest("hex");
const slug = (text) => String(text).replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
const snake = (text) => String(text).replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "").toLowerCase();
const pascal = (text) =>
  String(text)
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join("");
const oneLine = (text) => String(text ?? "").replace(/\s+/g, " ").trim();
const firstSentence = (text) => {
  const line = oneLine(text);
  const match = /^(.+?[.!?])(\s|$)/.exec(line);
  return match ? match[1] : line;
};
const lowerFirst = (text) => (/^[A-Z][a-z]/.test(text) ? text[0].toLowerCase() + text.slice(1) : text);

/** A description no longer than the site allows, cut at a word. */
function clip(text, max = 160) {
  const line = oneLine(text);
  if (line.length <= max) return line;
  const cut = line.slice(0, max - 3).replace(/\s+\S*$/, "").replace(/[,;:]$/, "");
  return `${cut}...`;
}

function walk(dir) {
  return readdirSync(dir)
    .sort()
    .flatMap((name) => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? walk(path) : [path];
    });
}

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

function frontMatter(fields) {
  const clean = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
  return `---\n${YAML.stringify(clean, { lineWidth: 0 })}---\n\n`;
}

/** Markdown sections of a text by `## ` heading, the text before the first under "". */
function sections(text, level = 2) {
  const out = new Map();
  const marker = `${"#".repeat(level)} `;
  let name = "";
  let lines = [];
  let fence = false;
  for (const line of text.split("\n")) {
    if (/^(```|~~~)/.test(line)) fence = !fence;
    if (!fence && line.startsWith(marker)) {
      out.set(name, lines.join("\n").trim());
      name = line.slice(marker.length).trim();
      lines = [];
    } else lines.push(line);
  }
  out.set(name, lines.join("\n").trim());
  return out;
}

const firstFence = (text, lang = "") => {
  const match = new RegExp("^```" + lang + "[^\\n]*\\n([\\s\\S]*?)^```", "m").exec(text ?? "");
  return match ? match[1] : undefined;
};

const parseJson = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

// ---------------------------------------------------------------------------
// Package sources
// ---------------------------------------------------------------------------

const collection = readCollection(APIS_DIR);
const env = (collection.environments.find((e) => e.name === "sandbox") ?? collection.environments[0] ?? { vars: {} }).vars;
const collectionHeaders = parseBru(read(join(APIS_DIR, "collection.bru"))).headers ?? {};
const baseUrls = YAML.parse(read(join(PACKAGE_DIR, "baseurl.yaml")));
const errors = YAML.parse(read(join(PACKAGE_DIR, "nhcx-error.yaml")));

// Same placeholders the package's own chapters print in their curls.
function placeholderFor(name) {
  if (name === "token") return "<access token>";
  if (name === "$guid") return "<uuid>";
  if (name === "$isoTimestamp") return "<iso timestamp>";
  if (name === "$timestamp") return "<unix timestamp>";
  return `<${name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase()}>`;
}

function fillVars(text) {
  return String(text).replace(/\{\{\s*([\w$-]+)\s*\}\}/g, (whole, name) => {
    const value = env[name];
    return value !== undefined && String(value).trim() !== "" ? value : placeholderFor(name);
  });
}

// Every chapter, with its title, number and the one-line description the README's
// table of contents gives it.
const chapters = walk(DOCS_DIR)
  .map((path) => path.slice(DOCS_DIR.length + 1))
  .filter((rel) => rel.endsWith(".md") && rel.includes("/"))
  .map((rel) => {
    const [section, file] = rel.split("/");
    const text = read(join(DOCS_DIR, rel));
    return {
      rel,
      section,
      file,
      text,
      number: `${section.slice(0, 2)}.${file.slice(0, 2)}`,
      title: (/^# (.+)$/m.exec(text)?.[1] ?? file.replace(/^\d+-|\.md$/g, "")).trim(),
    };
  })
  .filter((chapter) => SECTIONS[chapter.section]);

const tocDescriptions = new Map();
for (const match of read(join(DOCS_DIR, "README.md")).matchAll(/^\d+\. \[[^\]]*\]\(([^)]+)\): (.+)$/gm)) {
  const path = decodeURI(match[1]).replace(/^.*?\/docs\//, "");
  tocDescriptions.set(path, match[2].trim());
}

const chapterByTitle = (title) => chapters.find((c) => c.title.toLowerCase() === title.toLowerCase());

// Where each chapter goes, and the address it answers at.
for (const chapter of chapters) {
  const section = SECTIONS[chapter.section];
  const target = PLACED[chapter.rel] ?? `${section.dir}/${slug(chapter.file.replace(/^\d+-|\.md$/g, ""))}.md`;
  const route = target.replace(/(^|\/)index\.md$/, "").replace(/\.md$/, "");
  chapter.target = target;
  chapter.url = route ? `${SITE}/${route}` : SITE;
  chapter.position = POSITION[chapter.rel] ?? Number(chapter.file.slice(0, 2)) + (section.offset ?? 0);
  chapter.roles = section.roles;
}
const chapterByPath = new Map(chapters.map((c) => [`docs/${c.rel}`, c]));
const chapterByNumber = new Map(chapters.map((c) => [c.number, c]));

// Header descriptions, from the package's own words: the envelope field table first,
// then a bullet that opens with the header, then the first sentence that names it.
const envelope = chapterByTitle("Envelope fields");
const headerFacts = new Map();
for (const match of (envelope?.text ?? "").matchAll(/^\| `([^`]+)` \| ([^|]+) \| ([^|]+) \| (.+) \|$/gm)) {
  headerFacts.set(match[1], {
    required: /mandatory/i.test(match[3]),
    description: `${oneLine(match[4]).replace(/\.?$/, ".")} ${oneLine(match[3]).replace(/\*/g, "")} on the envelope.`,
  });
}
const prose = chapters.map((c) => c.text.replace(/^```[\s\S]*?^```/gm, "")).join("\n");
function headerDescription(name) {
  if (headerFacts.has(name)) return headerFacts.get(name).description;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const bullet = new RegExp("^- `" + escaped + "` (?:is|names|carries|goes)\\b.*$", "m").exec(prose);
  if (bullet) return oneLine(bullet[0].slice(2));
  for (const paragraph of prose.split(/\n\s*\n/)) {
    if (!paragraph.includes("`" + name + "`") || /^\s*\|/.test(paragraph)) continue;
    const sentence = oneLine(paragraph)
      .split(/(?<=[.!?])\s+/)
      .find((s) => s.includes("`" + name + "`"));
    if (sentence && !sentence.startsWith("#")) return sentence.replace(/^[-*]\s+/, "");
  }
  return `Sent on this call, as the package's request carries it.`;
}

// What a participant hosts, and the receipt it answers with, from Receiving a callback.
const callbackChapter = chapterByTitle("Receiving a callback");
const callbackSections = sections(callbackChapter?.text ?? "");
const providerHosts = (firstFence(callbackSections.get("What to host") ?? "") ?? "")
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l.startsWith("/"));
const mirror = (path) => {
  if (path === "/v1/error") return path;
  const parts = path.split("/");
  const last = parts.pop();
  return [...parts, last.startsWith("on_") ? last.slice(3) : `on_${last}`].join("/");
};
const hostedBy = new Map();
for (const path of providerHosts) {
  hostedBy.set(path, path === "/v1/error" ? "participant" : "provider");
  if (!hostedBy.has(mirror(path))) hostedBy.set(mirror(path), "payer");
}
const receipt = parseJson(firstFence(callbackSections.get("Answer first, read second") ?? "", "json") ?? "");

// The bearer scheme, as the Session token chapter explains it.
const sessionChapter = chapterByTitle("Session token");
const bearerNote =
  oneLine((sections(sessionChapter?.text ?? "").get("Using it") ?? "").split(/\n\s*\n/)[0]) ||
  "The session token from the ABDM gateway, sent with the word Bearer in front.";

// ---------------------------------------------------------------------------
// Operations: one per Bruno request
// ---------------------------------------------------------------------------

const services = baseUrls.services ?? [];
const serviceByVar = new Map(services.filter((s) => s.variable).map((s) => [s.variable, s]));

function locate(request) {
  const variable = /^\{\{\s*(\w+)\s*\}\}/.exec(request.url)?.[1];
  const service = serviceByVar.get(variable);
  const full = fillVars(request.url).replace(/\?.*$/, "");
  if (service && full.startsWith(service.sandbox)) {
    return { service, base: service.sandbox, path: full.slice(service.sandbox.length) || "/", origin: new URL(full).origin };
  }
  const url = new URL(full);
  return { service: undefined, base: url.origin, path: url.pathname, origin: url.origin };
}

function bruDocs(request) {
  const parts = sections(request.docs ?? "");
  return {
    summary: parts.get("Summary") ?? "",
    parts: [...parts.entries()].filter(
      ([name]) => name && !["Summary", "Example response"].includes(name),
    ),
    response: parseJson(firstFence(parts.get("Example response") ?? "", "json") ?? ""),
    postconditions: parts.get("Postconditions") ?? "",
    purpose: parts.get("Business purpose") ?? "",
  };
}

/** "Chapter 05.08" in a request's docs becomes a link to that chapter's page. */
const linkChapters = (text) =>
  text.replace(/\b(\d\d)\.(\d\d)\b/g, (whole, s, c) => {
    const chapter = chapterByNumber.get(`${s}.${c}`);
    return chapter ? `[${chapter.title}](${chapter.url})` : whole;
  });

function describe(request, extra = []) {
  const docs = bruDocs(request);
  const blocks = [docs.summary];
  for (const [name, body] of docs.parts) {
    blocks.push(`### ${name}\n\n${name === "Specification" ? linkChapters(body) : body}`);
  }
  return [...blocks, ...extra].filter(Boolean).join("\n\n").trim();
}

function schemaOf(value) {
  if (value === null || value === undefined) return {};
  if (Array.isArray(value)) return { type: "array", items: value.length ? schemaOf(value[0]) : {} };
  if (typeof value === "object") {
    return { type: "object", properties: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, schemaOf(v)])) };
  }
  if (typeof value === "number") return { type: Number.isInteger(value) ? "integer" : "number" };
  if (typeof value === "boolean") return { type: "boolean" };
  return { type: "string" };
}

/** One schema covering several examples, so each of them validates against it. */
function mergeSchemas(a, b) {
  if (!a?.type) return b ?? {};
  if (!b?.type || a.type !== b.type) return a;
  if (a.type === "object") {
    const properties = { ...a.properties };
    for (const [k, v] of Object.entries(b.properties ?? {})) properties[k] = properties[k] ? mergeSchemas(properties[k], v) : v;
    return { type: "object", properties };
  }
  if (a.type === "array") return { type: "array", items: mergeSchemas(a.items, b.items) };
  return a;
}

function requestHeaders(request) {
  // Bruno sends the collection's headers with every request that inherits its auth.
  const headers = request.auth === "none" ? { ...request.headers } : { ...collectionHeaders, ...request.headers };
  return Object.entries(headers)
    .filter(([name]) => !["accept", "content-type", "authorization"].includes(name.toLowerCase()))
    .map(([name, value]) => ({ name, example: fillVars(value) }));
}

function body(request) {
  if (!request.body?.trim()) return undefined;
  const text = fillVars(request.body).trim();
  const value = parseJson(text);
  return value === undefined ? { type: "text/plain", value: text } : { type: "application/json", value };
}

function responseOf(request) {
  const docs = bruDocs(request);
  const status = /HTTP (\d{3})/.exec(docs.postconditions)?.[1] ?? /returns (\d{3})/.exec(docs.postconditions)?.[1] ?? "200";
  return {
    status,
    description: firstSentence(docs.postconditions) || "The call was processed.",
    example: docs.response,
  };
}

const modules = collection.folders.map((folder, index) => {
  const id = folder.dir.replace(/^\d+-/, "");
  return {
    folder,
    id,
    label: folder.name,
    position: index + 1,
    file: `${PLATFORM}-${id}.yaml`,
    route: `/reference/${PLATFORM}-${id}`,
    url: `${SITE}/api/${id}`,
    ops: [],
  };
});

// Two requests on one method and path are one operation in OpenAPI: the later ones
// ride along as extra examples on the first.
const opByRef = new Map();
for (const module of modules) {
  const byKey = new Map();
  for (const request of module.folder.requests) {
    const ref = `${module.folder.dir}/${request.file.split("/").pop()}`;
    const where = locate(request);
    const key = `${request.method} ${where.base}${where.path}`;
    if (byKey.has(key)) {
      byKey.get(key).also.push(request);
      opByRef.set(ref, byKey.get(key));
      continue;
    }
    const stem = request.file.split("/").pop().replace(/\.bru$/, "");
    const op = {
      module,
      request,
      ref,
      where,
      also: [],
      internal: /^\/internal\//.test(where.path),
      operationId: `${snake(module.id)}_${snake(stem)}`,
    };
    op.page = `${module.url}/endpoints/${slug(op.operationId)}`;
    if (op.operationId.length > 64) console.warn(`  operationId over 64 characters: ${op.operationId}`);
    byKey.set(key, op);
    opByRef.set(ref, op);
    module.ops.push(op);
  }
}

// ---------------------------------------------------------------------------
// Chapters into pages
// ---------------------------------------------------------------------------

const ALERTS = { NOTE: "note", TIP: "tip", IMPORTANT: "info", WARNING: "warning", CAUTION: "danger" };
const HTML_TAG = /^<\/?(a|b|br|code|details|div|em|i|img|kbd|p|span|strong|sub|summary|sup)\b[^>]*>/i;
const unlinked = new Map();
const guidesByModule = new Map(); // module id -> Map(chapter url -> chapter)

function useOf(op, chapter) {
  if (!guidesByModule.has(op.module.id)) guidesByModule.set(op.module.id, new Map());
  guidesByModule.get(op.module.id).set(chapter.url, chapter);
}

function rewriteHref(href, chapter) {
  if (/^(https?:|mailto:|#)/.test(href)) return href;
  const [rawPath, anchor] = href.split("#");
  let path;
  try {
    path = decodeURI(rawPath);
  } catch {
    path = rawPath;
  }
  const target = posix.normalize(posix.join("docs", chapter.section, path));
  if (chapterByPath.has(target)) return chapterByPath.get(target).url + (anchor ? `#${anchor}` : "");
  if (target.startsWith("apis/") && target.endsWith(".bru")) {
    const op = opByRef.get(target.slice("apis/".length));
    if (op) {
      useOf(op, chapter);
      return op.page;
    }
  }
  unlinked.set(target, (unlinked.get(target) ?? 0) + 1);
  return undefined;
}

/** One line of prose: links rewritten for the site, stray angle brackets escaped. */
function rewriteLine(line, chapter) {
  const spans = [];
  let text = line.replace(/(`+)([\s\S]*?[^`])\1(?!`)/g, (whole) => {
    spans.push(whole);
    return ` ${spans.length - 1} `;
  });
  text = text.replace(/(!?)\[((?:[^[\]]|\[[^\]]*\])*)\]\(([^)\s]+)((?:\s+"[^"]*")?)\)/g, (whole, bang, label, href, title) => {
    if (bang) return whole;
    const next = rewriteHref(href, chapter);
    return next === undefined ? label : `[${label}](${next}${title})`;
  });
  text = text.replace(/<(?!https?:|mailto:)/g, (lt, offset, all) => (HTML_TAG.test(all.slice(offset)) ? lt : "&lt;"));
  return text.replace(/ (\d+) /g, (whole, i) => spans[Number(i)]);
}

function convert(chapter) {
  const out = [];
  const lines = chapter.text.split("\n");
  let fence = null;
  let pendingApi = null;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const open = /^(\s*)(`{3,}|~{3,})/.exec(line);
    if (fence) {
      out.push(line);
      if (open && open[2][0] === fence[0] && open[2].length >= fence.length && !line.trim().slice(open[2].length)) fence = null;
      continue;
    }
    if (open) {
      fence = open[2];
      out.push(line);
      continue;
    }
    const marker = /^<!-- build-docs:(\S+)(?: (\S+))? -->$/.exec(line.trim());
    if (marker) {
      if (marker[1] === "api") pendingApi = opByRef.get(marker[2]);
      if (marker[1] === "end" && pendingApi) {
        useOf(pendingApi, chapter);
        out.push("", `[${pendingApi.request.name} in the API reference](${pendingApi.page})`);
        pendingApi = null;
      }
      continue;
    }
    const alert = /^>\s*\[!(\w+)\]\s*$/.exec(line);
    if (alert && ALERTS[alert[1].toUpperCase()]) {
      out.push(`:::${ALERTS[alert[1].toUpperCase()]}`);
      while (i + 1 < lines.length && /^>/.test(lines[i + 1])) {
        i += 1;
        out.push(rewriteLine(lines[i].replace(/^>\s?/, ""), chapter));
      }
      out.push(":::");
      continue;
    }
    out.push(rewriteLine(line, chapter));
  }
  return `${out.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
}

function pageFor(chapter) {
  const firstParagraph = chapter.text
    .replace(/^#.*$/gm, "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .find((p) => p && !/^(```|<!--|\||>|-|\d+\.)/.test(p));
  return (
    frontMatter({
      title: chapter.title,
      sidebar_label: LABEL[chapter.rel] ?? chapter.title,
      sidebar_position: chapter.position,
      description: clip(tocDescriptions.get(chapter.rel) ?? firstSentence(firstParagraph ?? chapter.title)),
      verification: "unverified",
      source: `${SOURCE}/docs/${chapter.rel}`,
      generated: true,
      sidebar_custom_props: chapter.roles ? { roles: chapter.roles } : undefined,
    }) + convert(chapter)
  );
}

// ---------------------------------------------------------------------------
// Specifications
// ---------------------------------------------------------------------------

const bandOf = (code) => {
  const n = Number(/PAYR-(\d+)/.exec(code)?.[1]);
  return Number.isFinite(n) ? Math.min(Math.floor(n / 100), 14) : undefined;
};
const errorOwner = modules.find((m) => m.ops.some((op) => op.where.path === "/v1/error")) ?? modules.at(-1);
// Reference payer codes by band: each band names the exchange that rejects with it.
const BAND_OWNER = { 11: "eligibility", 12: "preauth", 13: "claim", 14: "insurance-plan" };
const spaceById = new Map((errors.spaces ?? []).map((s) => [s.id, s]));

function errorBlocks(module) {
  const out = {};
  const owns = (code) => {
    if (code.space !== "reference-payer") return module === errorOwner;
    const owner = BAND_OWNER[bandOf(code.code)];
    return owner ? owner === module.id : module === errorOwner;
  };
  const exchange = module.ops.some((op) => op.where.service?.id === "nhcx" && !op.internal);
  if (exchange || module === errorOwner) {
    const notes = [
      `Codes any exchange call can meet are recorded once, in the [${errorOwner.label}](${errorOwner.url}) specification: the gateway's NHCX- codes, the standard payer codes, and the reference payer's structure and transport codes. The reference payer's other codes sit with the exchange they reject: coverage eligibility, preauthorisation, claim and insurance plan. [Reading error codes](${chapterByPath.get("docs/06-Reference/01-Error Codes.md")?.url ?? `${SITE}/reference`}) explains the code spaces.`,
    ];
    if (module === errorOwner && errors.collisions?.length) {
      notes.push(
        `${errors.collisions.length} codes from ${errors.collisions[0].code} to ${errors.collisions.at(-1).code} mean one thing on the standard payer sheet and another on the reference payer's sheet. Read the code together with its message.`,
      );
    }
    out["x-abdm-errors"] = {
      notes: notes.join("\n\n"),
      ...(module === errorOwner
        ? {
            ranges: (errors.bands ?? []).map((band) => ({
              range: band.band,
              covers: `${band.rejected_by}. ${band.means}.`,
              examples: errors.codes
                .filter((c) => c.code.startsWith(band.band.replace(/x+$/, "")))
                .slice(0, 2)
                .map((c) => `\`${c.code}\``)
                .join(", "),
            })),
          }
        : {}),
    };
  }
  for (const space of errors.spaces ?? []) {
    const codes = errors.codes.filter((c) => c.space === space.id && owns(c));
    if (!codes.length) continue;
    out[`x-abdm-errors-${space.id}`] = {
      source: `${space.name} codes, ${space.prefix}. Sent by ${lowerFirst(space.sent_by)}; they arrive ${lowerFirst(space.arrives)}.`,
      codes: codes.map((c) => ({ code: c.code, message: oneLine(c.message), action: oneLine(c.note ?? "") })),
    };
  }
  return out;
}

function serversFor(module) {
  const counts = new Map();
  for (const op of module.ops) counts.set(op.where.base, (counts.get(op.where.base) ?? 0) + 1);
  const bases = [...counts.keys()];
  const origins = new Set(module.ops.map((op) => op.where.origin));
  const serverList = (service, base) => {
    const list = [{ url: base, description: `Sandbox, ${service?.name ?? "as the collection calls it"}.` }];
    if (service?.production) {
      list.push({ url: service.production, description: `Production. ${oneLine(service.production_note ?? "")}`.trim() });
    }
    return list;
  };
  if (bases.length === 1) {
    return { servers: serverList(module.ops[0].where.service, bases[0]), pathOf: (op) => op.where.path };
  }
  if (origins.size === 1) {
    // Several services on one host: the host is the server and each path carries its
    // service's prefix, so every operation's address is right under one server.
    const origin = [...origins][0];
    return {
      servers: [{ url: origin, description: "Sandbox." }],
      pathOf: (op) => new URL(op.where.base + op.where.path).pathname,
    };
  }
  const primary = bases.sort((a, b) => counts.get(b) - counts.get(a))[0];
  const primaryService = module.ops.find((op) => op.where.base === primary).where.service;
  return {
    servers: serverList(primaryService, primary),
    pathOf: (op) => op.where.path,
    override: (op) => (op.where.base === primary ? undefined : serverList(op.where.service, op.where.base)),
  };
}

function buildSpec(module) {
  const { servers, pathOf, override } = serversFor(module);
  const components = { parameters: {} };
  const paramRef = new Map();

  const parametersOf = (request) =>
    requestHeaders(request).map(({ name, example }) => {
      const key = pascal(name);
      if (!components.parameters[key]) {
        components.parameters[key] = {
          name,
          in: "header",
          required: headerFacts.get(name)?.required ?? true,
          description: headerDescription(name),
          schema: { type: "string" },
          example,
        };
        paramRef.set(key, example);
      }
      if (paramRef.get(key) === example) return { $ref: `#/components/parameters/${key}` };
      const { example: _shared, ...rest } = components.parameters[key];
      return { ...rest, example };
    });

  const queryOf = (request) =>
    Object.entries(request.query ?? {}).map(([name, value]) => ({
      name,
      in: "query",
      required: true,
      schema: { type: "string" },
      example: fillVars(value),
    }));

  const requestBodyOf = (requests) => {
    const bodies = requests.map((r) => ({ request: r, body: body(r) })).filter((b) => b.body);
    if (!bodies.length) return undefined;
    const type = bodies[0].body.type;
    const schema = type === "application/json"
      ? bodies.map((b) => schemaOf(b.body.value)).reduce(mergeSchemas)
      : { type: "string" };
    const media = { schema };
    if (bodies.length === 1) media.example = bodies[0].body.value;
    else {
      media.examples = Object.fromEntries(
        bodies.map((b) => [snake(b.request.file.split("/").pop().replace(/\.bru$/, "")), { summary: b.request.name, value: b.body.value }]),
      );
    }
    return { required: true, content: { [type]: media } };
  };

  const responsesOf = (request) => {
    const response = responseOf(request);
    return {
      [response.status]: {
        description: response.description,
        ...(response.example !== undefined
          ? { content: { "application/json": { schema: schemaOf(response.example), example: response.example } } }
          : {}),
      },
    };
  };

  const tag = module.label;
  const adapterTag = "Adapter";
  const paths = {};
  const webhooks = {};

  for (const op of module.ops) {
    const { request } = op;
    const extra = op.also.map(
      (other) => `### Also sent as ${lowerFirst(other.name)}\n\nThe same address, with other headers and body.\n\n${bruDocs(other).summary}`,
    );
    const operation = {
      operationId: op.operationId,
      "x-abdm-use-case": op.internal ? adapterTag : tag,
      tags: [op.internal ? adapterTag : tag],
      summary: request.name,
      description: describe(request, extra),
      ...(request.auth === "none" || module.id === "session" ? { security: [] } : {}),
      ...(override?.(op) ? { servers: override(op) } : {}),
    };
    const parameters = [...parametersOf(request), ...queryOf(request)];
    if (parameters.length) operation.parameters = parameters;
    const requestBody = requestBodyOf([request, ...op.also]);
    if (requestBody) operation.requestBody = requestBody;
    operation.responses = responsesOf(request);
    const path = pathOf(op);
    paths[path] ??= {};
    paths[path][request.method.toLowerCase()] = operation;

    // The exchange hands the same message on to the recipient, at the same path.
    const host = op.where.service?.id === "nhcx" && !op.internal ? hostedBy.get(op.where.path) : undefined;
    if (host) {
      const key = snake(op.where.path);
      const who = host === "participant" ? "every participant" : `the ${host}`;
      webhooks[key] = {
        post: {
          operationId: `${snake(module.id)}_webhook_${key}`,
          // The sender's call to the exchange is what makes it arrive.
          "x-abdm-triggered-by": op.operationId,
          "x-abdm-use-case": "Webhooks",
          tags: [tag],
          summary: `Receive ${lowerFirst(request.name)}`,
          description: [
            `Hosted by ${who}. The exchange posts this message to the \`endpoint_url\` you registered, at \`${op.where.path}\`, with the headers and the sealed payload the sender posted. Answer HTTP 202 with the receipt first and process afterwards; [Receiving a callback](${callbackChapter?.url ?? SITE}) has the rules.`,
            bruDocs(request).summary,
          ].join("\n\n"),
          ...(parameters.length ? { parameters } : {}),
          ...(requestBody ? { requestBody } : {}),
          responses: {
            202: {
              description: "Received. The receipt names the message it answers; the answer itself follows as a call of your own.",
              ...(receipt ? { content: { "application/json": { schema: schemaOf(receipt), example: receipt } } } : {}),
            },
          },
        },
      };
    }
  }

  const exchangeOps = module.ops.filter((op) => !op.internal);
  const purpose = firstSentence(bruDocs((exchangeOps[0] ?? module.ops[0]).request).purpose) ||
    firstSentence(bruDocs(module.ops[0].request).summary);
  const guides = [...(guidesByModule.get(module.id)?.values() ?? [])];
  const noProduction = [...new Set(module.ops.map((op) => op.where.service).filter((s) => s && !s.production && s.production_note))];

  const tags = [{ name: tag, description: purpose }];
  if (module.ops.some((op) => op.internal)) {
    tags.push({
      name: adapterTag,
      description: firstSentence(bruDocs(module.ops.find((op) => op.internal).request).summary.replace(/^[^.]*\.\s*/, "")) ||
        "Internal twins of the exchange calls, for the NHCX adapter deployment.",
    });
  }

  const sources = [
    {
      file: `${SOURCE}/apis/${module.folder.dir}`,
      role: "upstream",
      hash: `sha256:${sha256(module.folder.requests.map((r) => read(r.file)).join("\n"))}`,
      note: "The package's Bruno collection, one request per operation.",
    },
    { file: `${SOURCE}/baseurl.yaml`, role: "upstream", hash: `sha256:${sha256(read(join(PACKAGE_DIR, "baseurl.yaml")))}`, note: "The sandbox and production hosts." },
  ];
  const errorKeys = errorBlocks(module);
  if (Object.keys(errorKeys).some((k) => errorKeys[k].codes?.length)) {
    sources.push({ file: `${SOURCE}/nhcx-error.yaml`, role: "upstream", hash: `sha256:${sha256(read(join(PACKAGE_DIR, "nhcx-error.yaml")))}`, note: "The error codes." });
  }

  const hookCount = Object.keys(webhooks).length;
  const description = [
    `The ${module.label} calls on the National Health Claims Exchange (NHCX): ${module.ops.length} operation${module.ops.length === 1 ? "" : "s"}${hookCount ? `, and ${hookCount} callback${hookCount === 1 ? "" : "s"} you host` : ""}.`,
    purpose,
    guides.length ? `Guides that use these calls: ${guides.map((g) => `[${g.title}](${g.url})`).join(", ")}.` : "",
    ...noProduction.map((s) => `Production address for the ${s.name}: ${lowerFirst(oneLine(s.production_note))}`),
  ].filter(Boolean).join("\n\n");

  return {
    openapi: "3.1.1",
    info: {
      "x-portal": { module: module.id, label: module.label, position: module.position },
      title: `NHCX ${lowerFirst(module.label)}`,
      summary: clip(purpose, 200),
      description,
      version: `${PLATFORM}-${VERSION}`,
      license: { name: "MIT", identifier: "MIT" },
      contact: { name: "NHCX sandbox", url: baseUrls.services?.find((s) => s.id === "portal")?.sandbox ?? "https://hcxsbx.abdm.gov.in" },
      "x-abdm-gateway": PLATFORM,
      "x-abdm-module": module.id,
      "x-abdm-phase": 1,
      "x-abdm-roles": module.roles,
    },
    "x-abdm-sources": sources,
    servers,
    tags,
    security: [{ bearerAuth: [] }],
    paths,
    ...(hookCount ? { webhooks } : {}),
    components: {
      securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", description: bearerNote } },
      ...(Object.keys(components.parameters).length ? components : {}),
    },
    ...errorKeys,
  };
}

function modulePage(module, spec) {
  const guides = [...(guidesByModule.get(module.id)?.values() ?? [])];
  const lines = [
    `# ${module.label}`,
    "",
    spec.info.summary,
    "",
    "## Calls",
    "",
    "| Call | Method and path | What it does |",
    "| --- | --- | --- |",
  ];
  for (const [path, item] of Object.entries(spec.paths)) {
    for (const method of METHODS) {
      const operation = item[method];
      if (!operation) continue;
      const op = module.ops.find((o) => o.operationId === operation.operationId);
      const also = op.also.length ? ` Also sent as ${op.also.map((r) => lowerFirst(r.name)).join(", ")}.` : "";
      lines.push(`| [${operation.summary}](${op.page}) | \`${method.toUpperCase()} ${path}\` | ${firstSentence(bruDocs(op.request).summary).replace(/\|/g, "\\|")}${also} |`);
    }
  }
  lines.push("");
  const hooks = Object.entries(spec.webhooks ?? {});
  if (hooks.length) {
    lines.push("## Callbacks you host", "", "The exchange posts these to the `endpoint_url` you registered. Answer each with HTTP 202 first.", "");
    lines.push("| Path | Hosted by |", "| --- | --- |");
    for (const [key] of hooks) {
      const path = `/${key.replace(/_/g, "/")}`;
      const real = [...hostedBy.keys()].find((p) => snake(p) === key) ?? path;
      lines.push(`| \`${real}\` | ${hostedBy.get(real) === "participant" ? "Every participant" : `The ${hostedBy.get(real)}`} |`);
    }
    lines.push("");
  }
  lines.push("## Base URLs", "", "| Environment | Base URL |", "| --- | --- |");
  for (const server of spec.servers) lines.push(`| ${server.description} | \`${server.url}\` |`);
  lines.push("");
  if (guides.length) {
    lines.push("## Guides that use these calls", "");
    for (const guide of guides) lines.push(`- [${guide.title}](${guide.url})`);
    lines.push("");
  }
  lines.push(`The whole specification, with a request you can send from the page, is the [${module.label} API reference](${module.route}).`, "");

  return (
    frontMatter({
      title: module.label,
      sidebar_label: "Overview",
      sidebar_position: 0,
      description: clip(`The ${module.label} calls on NHCX: what each one does, the hosts they go to, and the guides that use them.`),
      verification: "unverified",
      source: `${SOURCE}/apis/${module.folder.dir}`,
      generated: true,
    }) + lines.join("\n")
  );
}

// ---------------------------------------------------------------------------
// Contributor notes. READMEs never render; they tell a contributor where the
// content comes from.
// ---------------------------------------------------------------------------

const README = {
  "": `# NHCX V1

Ported from the NHCX package by its \`make ekadocs\` target (\`system/build-ekadocs.mjs\`).
Everything in this folder is replaced on every port, so change the package and port again
rather than editing a page here.

| Folder | Renders as | From the package |
| --- | --- | --- |
| \`index.md\` | The landing page | \`docs/01-Overview/01-Introduction.md\` |
| \`getting-started/\` | Overview tab: the base framework, first to last | \`docs/02-Getting Started\`, and the glossary |
| \`roles/\` | Overview tab: one path per role | \`docs/03-Building a Provider\`, \`docs/04-Building a Payer\` |
| \`registries/\` | Overview tab: participants and policies | \`docs/01-Overview/03-Participants and Policies.md\` |
| \`concepts/\` | Overview tab: how a claim moves, use cases, workflow codes, PMJAY | \`docs/01-Overview\` |
| \`go-live/\` | Overview tab: leaving the sandbox | \`docs/07-Go Live\` |
| \`api/\` | API references tab: one module per Bruno folder | \`apis/\` |
| \`reference/\` | API references tab: lookups, and the FHIR bundles under \`fhir/\` | \`docs/06-Reference\`, \`docs/05-FHIR Reference\` |
`,
  api: `# API references

One module per folder of the package's Bruno collection. \`index.md\` in each module is the
overview the port writes. \`endpoints/\`, \`errors.md\` and \`_category_.json\` are generated
from \`documentation/catalogue/openapi/nhcx/v1/\` by the site's build, as for every gateway.
`,
  reference: `# Reference

The package's reference chapters, and the FHIR bundles under \`fhir/\`. \`authentication.md\`,
\`callbacks.md\` and \`error-codes.md\` are the site's, generated from the specifications.
`,
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

// The repository has been laid out two ways: the site in site/ with the catalogue
// beside it, and an older documentation/ tree with the site framework in docs/.
const LAYOUTS = [
  { pages: ["site", "docs"], specs: ["catalogue", "openapi"], generator: ["scripts", "build-api-reference.mjs"] },
  { pages: ["documentation", "pages"], specs: ["documentation", "catalogue", "openapi"], generator: ["docs", "scripts", "build-api-reference.mjs"] },
];

const option = (name) => {
  const at = process.argv.indexOf(name);
  return at > -1 ? process.argv[at + 1] : undefined;
};
const git = (dir, ...args) =>
  execFileSync("git", ["-C", dir, ...args], { stdio: ["ignore", "pipe", "inherit"] }).toString().trim();

/**
 * Clone the branch, or bring an existing checkout to the branch's latest commit.
 *
 * The NHCX folders are reset first: the port replaces them on every run, so the
 * previous port's output is never worth keeping and would otherwise block the pull.
 * Any other local change is left alone, and git stops the pull if it is in the way.
 */
function sync(target, repo, branch) {
  if (!existsSync(join(target, ".git"))) {
    execFileSync("git", ["clone", "-q", "--branch", branch, repo, target], { stdio: "inherit" });
  } else {
    const owned = LAYOUTS.flatMap((l) => [l.pages, l.specs].map((p) => [...p, PLATFORM, VERSION].join("/")))
      .filter((p) => existsSync(join(target, p)));
    const tracked = owned.filter((p) => git(target, "ls-files", "--", p));
    if (tracked.length) git(target, "checkout", "-q", "HEAD", "--", ...tracked);
    if (owned.length) git(target, "clean", "-qfd", "--", ...owned);
    git(target, "fetch", "-q", "origin", branch);
    if (git(target, "rev-parse", "--abbrev-ref", "HEAD") !== branch) {
      const local = git(target, "branch", "--list", branch);
      git(target, "checkout", "-q", ...(local ? [branch] : ["-b", branch, "FETCH_HEAD"]));
    }
    git(target, "merge", "-q", "--ff-only", "FETCH_HEAD");
  }
  console.log(`[ekadocs] ${branch} at ${git(target, "log", "-1", "--format=%h %s")}`);
}

function main() {
  const target = process.argv[2] ? resolve(process.argv[2]) : undefined;
  const branch = option("--branch");
  if (target && branch) sync(target, option("--repo") ?? "https://github.com/nha-in/docs", branch);
  const layout = target && LAYOUTS.find((l) => existsSync(join(target, ...l.pages)) && existsSync(join(target, ...l.generator)));
  if (!layout) {
    console.error("Usage: node system/build-ekadocs.mjs <checkout of github.com/nha-in/docs> [--branch <branch>] [--repo <url>]");
    process.exit(1);
  }
  const pagesDir = join(target, ...layout.pages, PLATFORM, VERSION);
  const specsDir = join(target, ...layout.specs, PLATFORM, VERSION);
  const specsRel = [...layout.specs, PLATFORM, VERSION].join("/");
  rmSync(pagesDir, { recursive: true, force: true });
  rmSync(specsDir, { recursive: true, force: true });

  // Chapters first: converting them records which guides use which calls, and the
  // module pages and specifications list those guides.
  for (const chapter of chapters) write(join(pagesDir, chapter.target), pageFor(chapter));
  for (const [dir, meta] of Object.entries(CATEGORIES)) write(join(pagesDir, dir, "_category_.json"), json(meta));

  for (const module of modules) {
    const roles = new Set([...(guidesByModule.get(module.id)?.values() ?? [])].flatMap((g) => g.roles ?? []));
    // A module only the provider's or only the payer's guides use is that role's;
    // anything else serves both.
    module.roles = roles.size === 1 ? [...roles] : ALL_ROLES;
  }

  let operations = 0;
  let callbacks = 0;
  let codes = 0;
  for (const module of modules) {
    const spec = buildSpec(module);
    operations += module.ops.length;
    callbacks += Object.keys(spec.webhooks ?? {}).length;
    codes += Object.entries(spec).filter(([k]) => k.startsWith("x-abdm-errors")).reduce((n, [, b]) => n + (b.codes?.length ?? 0), 0);
    const header = [
      `# NHCX ${lowerFirst(module.label)}, from the NHCX package's Bruno folder apis/${module.folder.dir}.`,
      "#",
      "# Written by the package's system/build-ekadocs.mjs (make ekadocs); change the .bru",
      "# requests there and port again rather than editing this file.",
      "#",
      "# Rules this file follows: catalogue/openapi/CONVENTIONS.md",
      "",
    ].join("\n");
    write(join(specsDir, module.file), header + YAML.stringify(spec, { lineWidth: 0, aliasDuplicateObjects: false }));
    write(join(pagesDir, "api", module.id, "index.md"), modulePage(module, spec));
  }

  write(join(pagesDir, "README.md"), README[""]);
  write(join(pagesDir, "api", "README.md"), README.api.replace("documentation/catalogue/openapi/nhcx/v1/", `${specsRel}/`));
  write(join(pagesDir, "reference", "README.md"), README.reference);
  write(
    join(specsDir, "README.md"),
    `# NHCX V1 specifications\n\nOne OpenAPI 3.1 file per folder of the NHCX package's Bruno collection, written by the\npackage's \`make ekadocs\`. Callbacks are \`webhooks\`, error codes are \`x-abdm-errors\` blocks.\nChange the package and port again rather than editing these files; see \`../../CONVENTIONS.md\`\nfor the rules they follow.\n`,
  );

  console.log(`[ekadocs] ${chapters.length} pages, ${modules.length} module overviews -> ${pagesDir}`);
  console.log(`[ekadocs] ${modules.length} specifications, ${operations} operations, ${callbacks} callbacks, ${codes} error codes -> ${specsDir}`);
  if (unlinked.size) {
    console.log(`[ekadocs] Links to package files with no page on the site, kept as text (${unlinked.size}):`);
    for (const [path, n] of [...unlinked].sort()) console.log(`  ${path}${n > 1 ? ` (${n})` : ""}`);
  }
}

main();
