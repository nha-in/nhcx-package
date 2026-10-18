/**
 * Reading and writing Bruno's `.bru` files.
 *
 * Bruno keeps one request per file in a small block language: a `meta` block,
 * a block named after the method holding the url, blocks for headers, query
 * parameters and the body, and a `docs` block of markdown. That is enough to
 * carry a request, and it is plain text, which is why the collection is stored
 * this way rather than as a vendor's JSON export.
 *
 * Two shapes of block, and the difference matters when parsing:
 *
 *   dictionary   `key: value` lines, two spaces in
 *   text         raw content, two spaces in, kept exactly as written
 *
 * `vars:secret` is the third, a bare list of names in square brackets.
 *
 * The exporters read a whole collection back with `readCollection`, so
 * anything they need in Postman or OpenAPI has to survive a round trip
 * through these files. That is deliberate: the Bruno folder is the source, and
 * the other two formats are generated from it rather than beside it.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const TEXT_BLOCKS = /^(body:(json|text|xml|sparql|graphql)|docs|script:pre-request|script:post-response|tests)$/;

// ---------------------------------------------------------------------------
// Writing
// ---------------------------------------------------------------------------

const indent = (text) =>
  String(text)
    .replace(/\s+$/, '')
    .split('\n')
    .map((line) => (line ? `  ${line}` : ''))
    .join('\n');

export function dictBlock(name, entries) {
  // An empty value is kept: the environment file's blank `token:` is the slot
  // the session request fills in, and dropping it would hide it from Bruno.
  const lines = Object.entries(entries)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `  ${key}: ${value}`);
  return lines.length ? `${name} {\n${lines.join('\n')}\n}` : '';
}

export function textBlock(name, text) {
  return text && String(text).trim() ? `${name} {\n${indent(text)}\n}` : '';
}

export function listBlock(name, items) {
  return items.length ? `${name} [\n${items.map((i) => `  ${i}`).join(',\n')}\n]` : '';
}

/** Blocks in the order Bruno itself writes them, blank ones dropped. */
export function bru(blocks) {
  return `${blocks.filter(Boolean).join('\n\n')}\n`;
}

// ---------------------------------------------------------------------------
// Reading
// ---------------------------------------------------------------------------

/**
 * Split a `.bru` file into its blocks.
 *
 * Brace counting rather than a regex, because a JSON body is full of braces
 * and the block ends at the one that matches its opener, not the first one on
 * a line of its own.
 */
export function parseBru(text) {
  const blocks = {};
  let i = 0;
  while (i < text.length) {
    const header = /([a-zA-Z0-9:_-]+)\s*([{[])/y;
    header.lastIndex = i;
    const match = header.exec(text);
    if (!match) {
      const next = text.indexOf('\n', i);
      if (next === -1) break;
      i = next + 1;
      continue;
    }
    const [, name, opener] = match;
    const closer = opener === '{' ? '}' : ']';
    let depth = 1;
    let j = header.lastIndex;
    while (j < text.length && depth > 0) {
      if (text[j] === opener) depth += 1;
      else if (text[j] === closer) depth -= 1;
      j += 1;
    }
    const body = text.slice(header.lastIndex, j - 1);
    blocks[name] = TEXT_BLOCKS.test(name) ? dedent(body) : parseEntries(body, opener);
    i = j;
  }
  return blocks;
}

function dedent(body) {
  const lines = body.replace(/^\n/, '').replace(/\s+$/, '').split('\n');
  return lines.map((line) => (line.startsWith('  ') ? line.slice(2) : line)).join('\n');
}

function parseEntries(body, opener) {
  if (opener === '[') {
    return body
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  const out = {};
  for (const line of body.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const at = trimmed.indexOf(':');
    if (at === -1) continue;
    out[trimmed.slice(0, at).trim()] = trimmed.slice(at + 1).trim();
  }
  return out;
}

const METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

/** One request, in the shape both exporters work from. */
export function readRequest(file) {
  const blocks = parseBru(readFileSync(file, 'utf8'));
  const method = METHODS.find((m) => blocks[m]);
  if (!method) return null;
  const call = blocks[method];
  // A form body (body:form-urlencoded) is kept as its fields under `form`, and
  // as the encoded string under `body` for a reader that only knows raw bodies.
  const form = blocks['body:form-urlencoded'] ?? null;
  const body =
    blocks['body:json'] ??
    blocks['body:text'] ??
    (form ? Object.entries(form).map(([k, v]) => `${k}=${v}`).join('&') : '');
  return {
    file,
    name: blocks.meta?.name ?? '',
    seq: Number(blocks.meta?.seq ?? 0),
    method: method.toUpperCase(),
    url: call.url ?? '',
    bodyType: call.body ?? 'none',
    auth: call.auth ?? 'inherit',
    body,
    form,
    headers: blocks.headers ?? {},
    query: blocks['params:query'] ?? {},
    docs: blocks.docs ?? '',
  };
}

/**
 * Every request in a Bruno collection, grouped by the folder it sits in.
 *
 * Folder order comes from each folder's own `folder.bru`, and request order
 * from `meta.seq`, so the generated Postman collection and OpenAPI document
 * list things in the order the collection does.
 */
export function readCollection(root) {
  const settings = JSON.parse(readFileSync(join(root, 'bruno.json'), 'utf8'));
  const environments = readEnvironments(join(root, 'environments'));
  const folders = [];

  for (const name of readdirSync(root).sort()) {
    const path = join(root, name);
    if (name === 'environments' || !statSync(path).isDirectory()) continue;
    const meta = parseBru(safeRead(join(path, 'folder.bru'))).meta ?? {};
    const requests = readdirSync(path)
      .filter((f) => f.endsWith('.bru') && f !== 'folder.bru')
      .map((f) => readRequest(join(path, f)))
      .filter(Boolean)
      .sort((a, b) => a.seq - b.seq || a.name.localeCompare(b.name));
    folders.push({ dir: name, name: meta.name ?? name, seq: Number(meta.seq ?? 0), docs: meta.docs ?? '', requests });
  }

  folders.sort((a, b) => a.seq - b.seq || a.dir.localeCompare(b.dir));
  return { settings, environments, folders };
}

function safeRead(file) {
  try {
    return readFileSync(file, 'utf8');
  } catch {
    return '';
  }
}

function readEnvironments(dir) {
  let files = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.bru'));
  } catch {
    return [];
  }
  return files.map((f) => {
    const blocks = parseBru(readFileSync(join(dir, f), 'utf8'));
    return { name: f.replace(/\.bru$/, ''), vars: blocks.vars ?? {}, secrets: blocks['vars:secret'] ?? [] };
  });
}

/**
 * A url with its `{{var}}` placeholders filled in from an environment.
 *
 * OpenAPI has no notion of a collection variable, so the document is written
 * against the sandbox hosts the environment names. Postman keeps the
 * placeholders, because it has variables of its own.
 */
export function resolveVars(text, vars) {
  return String(text).replace(/\{\{\s*([\w-]+)\s*\}\}/g, (whole, key) => vars[key] ?? whole);
}
