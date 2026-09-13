#!/usr/bin/env node
/**
 * Writes MANIFEST into a release directory, dist/out when make packs the release: what
 * the release holds, and every file of NHCX content in it with its size and sha256.
 * MANIFEST ships only in the release zip, never at the package root.
 *
 * Usage: node system/build-manifest.mjs <release dir> [--version <v>]
 *   --version  the release's version; default the version in system/package.json
 */

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
if (!process.argv[2] || process.argv[2].startsWith("--")) {
  console.error("Usage: node system/build-manifest.mjs <release dir> [--version <v>]");
  process.exit(1);
}
const DIR = resolve(process.cwd(), process.argv[2]);
const OUT = join(DIR, "MANIFEST");
const versionAt = process.argv.indexOf("--version");
const CORPUS_STATE = join(__dirname, ".cache", "corpus", "state.json");

// The package's content, in the order a reader meets it.
const CONTENT = [
  ["docs", "The NHCX documentation: overview, getting started, building a provider, building a payer, the FHIR reference, and reference chapters on errors, envelope fields, roles, governance and environments."],
  ["apis", "Every NHCX API as a request: method, path, headers, body, and what it is for and when to use it."],
  ["fhir", "The FHIR bundle of every exchange, generic and PMJAY, and the rules the FHIR reference is rendered from."],
  ["mappings", "Every use case's data elements, and where each sits in the FHIR bundle."],
  ["usecases.yaml", "Every NHA use case, A1 to E1, and the bundle types the FHIR Builder offers."],
  ["workflow.yaml", "Every workflow code: what it means, who sends it, and the x-hcx-status it travels with."],
  ["nhcx-error.yaml", "Every gateway and payer error code, by code space."],
  ["baseurl.yaml", "The base URL of every service an integration calls, in the sandbox and in production."],
  ["corpus", "The AI corpus the NHCX chatbot answers from: heading-scoped chunks written by a model from the documentation, the APIs and the use case mappings, and exact-lookup facts read from the data files."],
];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir).sort()) {
    if (name.startsWith(".")) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else out.push(path);
  }
  return out;
}

const files = [];
const contents = [];
for (const [name, what] of CONTENT) {
  const path = join(DIR, name);
  if (!existsSync(path)) {
    console.error(`[build-manifest] ${name} is missing from ${relative(process.cwd(), DIR) || DIR}`);
    process.exit(1);
  }
  const list = statSync(path).isDirectory() ? walk(path) : [path];
  const entries = list.map((f) => {
    const data = readFileSync(f);
    return { path: relative(DIR, f).split(sep).join("/"), bytes: data.length, sha256: createHash("sha256").update(data).digest("hex") };
  });
  files.push(...entries);
  const item = { path: statSync(path).isDirectory() ? `${name}/` : name, what, files: entries.length, bytes: entries.reduce((n, e) => n + e.bytes, 0) };
  if (name === "corpus") {
    const chunksFile = join(path, "index", "chunks.jsonl");
    const factsFile = join(path, "index", "facts.json");
    if (existsSync(chunksFile) && existsSync(factsFile)) {
      const chunks = readFileSync(chunksFile, "utf8").trim().split("\n").map((l) => JSON.parse(l));
      const facts = JSON.parse(readFileSync(factsFile, "utf8"));
      item.pages = new Set(chunks.map((c) => c.page)).size;
      item.chunks = chunks.length;
      item.facts = Object.fromEntries(Object.entries(facts).filter(([, v]) => typeof v === "object").map(([k, v]) => [k, Object.keys(v).length]));
      if (existsSync(CORPUS_STATE)) {
        const models = new Set(Object.values(JSON.parse(readFileSync(CORPUS_STATE, "utf8"))).map((s) => s.model));
        item.written_by = [...models].join(", ");
      }
    }
  }
  contents.push(item);
}

const pkg = JSON.parse(readFileSync(join(__dirname, "package.json"), "utf8"));
const manifest = {
  name: pkg.name,
  version: versionAt > 0 ? process.argv[versionAt + 1] : pkg.version,
  built: new Date().toISOString(),
  about: "Everything this package knows about NHCX, India's National Health Claims Exchange, for payers regulated by IRDAI and for PMJAY.",
  contents,
  files,
};
const header = "# MANIFEST of the NHCX package: what it holds, and every file with its size and sha256.\n";
writeFileSync(OUT, header + YAML.stringify(manifest, { lineWidth: 0 }), "utf8");
console.log(`[build-manifest] ${files.length} files in ${contents.length} parts -> ${relative(process.cwd(), OUT) || OUT}`);
