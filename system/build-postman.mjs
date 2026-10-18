/**
 * The NHCX Postman collection, built from the Bruno collection in apis/.
 *
 * One collection, four folders, so a reader imports one file and has both
 * environments and both halves of the work in front of them:
 *
 *   NHCX Onboarding (SANDBOX)   the session token, participant creation and the registry
 *   NHCX Usecase (SANDBOX)      the session token and every exchange call: eligibility,
 *                               pre-authorisation, claim, payment, communication, status,
 *                               plans, tasks, the PMJAY adjudicator hooks and biometrics
 *   NHCX Onboarding (PROD)      the same calls on the production hosts
 *   NHCX Usecase (PROD)         the same calls on the production hosts
 *
 * Inside each folder the Bruno folders keep their names and order, and each
 * request keeps its headers, body, query and documentation. The hosts come from
 * baseurl.yaml: the sandbox ones as the Bruno environment has them, the
 * production ones from the same file, blank where NHA has not published one.
 *
 * Every variable is prefixed by its environment, sbx_ or prod_, so a sandbox
 * token or participant code is never sent to production by mistake. Each
 * environment's folders authenticate with their own token, and running Session
 * token in a folder stores that environment's token for the calls after it.
 *
 * The exchange calls (/v1/...) carry a JWE, not a FHIR bundle. The body shipped
 * here is the envelope with a placeholder payload: encrypt a real bundle for the
 * recipient's certificate before sending one.
 *
 * Writes, under dist/postman/ (or --out <dir>):
 *   nhcx.postman_collection.json      the collection
 *   nhcx.postman_environment.json     an environment with every variable, secrets blank
 *   nhcx.postman_manifest.json        what was written, for a site that serves the files
 *
 * Usage:
 *   node system/build-postman.mjs [--out <dir>]
 *   make postman
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import { parseBru, readCollection } from "./lib/bru.mjs";

const PACKAGE_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const APIS_DIR = join(PACKAGE_DIR, "apis");

const args = process.argv.slice(2);
const at = args.indexOf("--out");
const OUT_DIR = at === -1 ? join(PACKAGE_DIR, "dist", "postman") : resolve(args[at + 1] ?? "");
if (at !== -1 && !args[at + 1]) {
  console.error("build-postman: --out needs a directory");
  process.exit(2);
}

const SCHEMA = "https://schema.getpostman.com/json/collection/v2.1.0/collection.json";

// The two environments, in the order their folders appear, and the prefix
// their variables carry.
const ENVIRONMENTS = [
  { id: "sandbox", folder: "SANDBOX", prefix: "sbx" },
  { id: "production", folder: "PROD", prefix: "prod" },
];

// Which Bruno folders make up the onboarding half: the session token, the
// sandbox and production onboarding folders, and the registry. Everything
// else is a use case. The session folder opens both halves, so either runs
// on its own.
const SESSION = "01-session";
const ONBOARDING = [SESSION, "11-onboarding-sandbox", "12-onboarding-production", "10-registry"];

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

const collection = readCollection(APIS_DIR);
const bruEnv = collection.environments.find((e) => e.name === "sandbox") ?? collection.environments[0];
if (!bruEnv) throw new Error("build-postman: apis/environments has no sandbox environment");
const envVars = { ...bruEnv.vars };
const secrets = new Set(bruEnv.secrets);
// A variable a request reads that the Bruno environment does not name is
// declared all the same, blank, so the collection asks for it rather than
// sending the placeholder.
for (const folder of collection.folders) {
  for (const request of folder.requests) {
    const text = [request.url, JSON.stringify(request.headers), JSON.stringify(request.query), request.body].join("\n");
    for (const [, name] of text.matchAll(/\{\{\s*([A-Za-z_][\w-]*)\s*\}\}/g)) {
      if (!(name in envVars)) envVars[name] = "";
    }
  }
}
const envNames = new Set(Object.keys(envVars));

const shared = parseBru(readFileSync(join(APIS_DIR, "collection.bru"), "utf8"));
const sharedHeaders = shared.headers ?? {};

const baseurls = YAML.parse(readFileSync(join(PACKAGE_DIR, "baseurl.yaml"), "utf8"));
const services = baseurls.services ?? [];
const cmIds = Object.fromEntries(
  Object.entries(baseurls.environments ?? {}).map(([id, env]) => [id, env.cm_id ?? ""]),
);

// ---------------------------------------------------------------------------
// Variables, per environment
// ---------------------------------------------------------------------------

const prefixed = (env, name) => `${env.prefix}_${name}`;

/**
 * The value an environment variable takes in an environment. A host variable
 * follows baseurl.yaml: the sandbox value is the Bruno environment's own, and
 * the production value is that same value with the sandbox base swapped for
 * the production base, so a variable that carries a path (sessionsUrl,
 * adjudicatorRoleUrl) keeps it. Blank where production is not published.
 */
function valueOf(env, name) {
  if (name === "cmId") return cmIds[env.id] ?? envVars.cmId ?? "";
  const service = services.find((s) => s.variable === name);
  const current = String(envVars[name] ?? "");
  if (!service) return env.id === "sandbox" ? current : "";
  if (env.id === "sandbox") return current || service.sandbox || "";
  if (!service.production) return "";
  return current.startsWith(service.sandbox)
    ? service.production + current.slice(service.sandbox.length)
    : service.production;
}

function describeVariable(env, name) {
  const service = services.find((s) => s.variable === name);
  if (!service) return undefined;
  if (env.id === "production" && !service.production) return service.production_note ?? "Not published.";
  return service.used_for;
}

/** Every variable of one environment, hosts filled in and the rest blank. */
function variablesOf(env) {
  return Object.keys(envVars).map((name) => {
    const description = describeVariable(env, name);
    return {
      key: prefixed(env, name),
      value: valueOf(env, name),
      ...(secrets.has(name) ? { type: "secret" } : {}),
      ...(description ? { description } : {}),
    };
  });
}

/**
 * `{{name}}` becomes `{{sbx_name}}` or `{{prod_name}}` for a variable the Bruno
 * environment defines. Postman's own `{{$guid}}` and `{{$isoTimestamp}}` pass
 * through untouched, as does anything the environment does not name.
 */
const rewrite = (env, text) =>
  String(text ?? "").replace(/\{\{\s*([\w-]+)\s*\}\}/g, (whole, name) =>
    envNames.has(name) ? `{{${prefixed(env, name)}}}` : whole,
  );

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

const json = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

function exampleResponse(docs) {
  const match = /```json response\n([\s\S]*?)```/.exec(docs ?? "");
  return match ? json(match[1]) : undefined;
}

const prose = (docs) =>
  (docs ?? "")
    .replace(/## Example response\n\n```json response\n[\s\S]*?```\n?/, "")
    .trim();

function urlOf(env, request) {
  const raw = rewrite(env, request.url);
  const query = Object.entries(request.query).map(([key, value]) => ({ key, value: rewrite(env, value) }));
  const [beforeQuery] = raw.split("?");
  const match = /^(\{\{[^}]+\}\}|https?:\/\/[^/]+)(.*)$/.exec(beforeQuery);
  const host = match ? match[1] : beforeQuery;
  const path = match ? match[2] : "";
  return {
    raw: query.length ? `${raw}${raw.includes("?") ? "&" : "?"}${query.map((q) => `${q.key}=${q.value}`).join("&")}` : raw,
    host: [host],
    path: path.split("/").filter(Boolean),
    ...(query.length ? { query } : {}),
  };
}

/**
 * Bruno's post-response script, as a Postman test. The one script in the
 * collection stores the session token; here it stores it under the
 * environment's own name, in the active environment and in the collection, so
 * the folder's calls read it whichever the reader imported.
 */
function testScriptOf(env, file) {
  const blocks = parseBru(readFileSync(file, "utf8"));
  const script = blocks["script:post-response"];
  if (!script) return undefined;
  if (!/bru\.setEnvVar\(/.test(script)) return undefined;
  // The script as Bruno runs it, with `res.body` served by Postman's response
  // and each bru.setEnvVar made a keep of the environment's own variable.
  const body = script
    .trim()
    .split("\n")
    .map((line) =>
      line.replace(/bru\.setEnvVar\(\s*(['"])([\w-]+)\1\s*,/g, (whole, quote, name) => `keep(${quote}${prefixed(env, name)}${quote},`),
    );
  return [
    `// Keeps what this response hands to the ${env.folder} calls after it.`,
    "(function () {",
    "let parsed;",
    "try { parsed = pm.response.json(); } catch (error) { return; }",
    "const res = {body: parsed};",
    "function keep(name, value) {",
    "  if (value === undefined || value === null || value === '') return;",
    "  pm.collectionVariables.set(name, value);",
    "  if (pm.environment && pm.environment.name) pm.environment.set(name, value);",
    "}",
    ...body,
    "})();",
  ];
}

function headersOf(env, request) {
  const own = new Set(Object.keys(request.headers).map((k) => k.toLowerCase()));
  const headers = Object.entries(request.headers).map(([key, value]) => ({ key, value: rewrite(env, value) }));
  // The collection's shared headers: the NHCX bearer_auth header on every call
  // that authenticates, Accept always, Content-Type with a body.
  for (const [key, value] of Object.entries(sharedHeaders)) {
    const lower = key.toLowerCase();
    if (own.has(lower)) continue;
    if (lower === "bearer_auth" && request.auth === "none") continue;
    if (lower === "content-type" && !request.body) continue;
    headers.push({ key, value: rewrite(env, value) });
  }
  return headers;
}

function itemOf(env, request) {
  const example = exampleResponse(request.docs);
  const test = testScriptOf(env, request.file);
  const req = {
    method: request.method,
    header: headersOf(env, request),
    url: urlOf(env, request),
    ...(request.auth === "none" ? { auth: { type: "noauth" } } : {}),
    ...(request.form
      ? { body: { mode: "urlencoded", urlencoded: Object.entries(request.form).map(([key, value]) => ({ key, value: rewrite(env, value), type: "text" })) } }
      : request.body
        ? { body: { mode: "raw", raw: rewrite(env, request.body), options: { raw: { language: "json" } } } }
        : {}),
    description: prose(request.docs),
  };
  return {
    name: request.name,
    request: req,
    ...(test ? { event: [{ listen: "test", script: { type: "text/javascript", exec: test } }] } : {}),
    ...(example
      ? {
          response: [
            {
              name: "Documented response",
              originalRequest: { method: req.method, header: req.header, url: req.url },
              status: "OK",
              code: 200,
              _postman_previewlanguage: "json",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: JSON.stringify(example, null, 2),
            },
          ],
        }
      : {}),
  };
}

// ---------------------------------------------------------------------------
// Folders
// ---------------------------------------------------------------------------

const byDir = new Map(collection.folders.map((f) => [f.dir, f]));
for (const dir of ONBOARDING) {
  if (!byDir.has(dir)) throw new Error(`build-postman: apis/${dir} is not in the collection`);
}
const usecaseDirs = [SESSION, ...collection.folders.map((f) => f.dir).filter((d) => !ONBOARDING.includes(d))];

const SETS = [
  { id: "onboarding", label: "NHCX Onboarding", dirs: ONBOARDING },
  { id: "usecase", label: "NHCX Usecase", dirs: usecaseDirs },
];

function folderOf(env, set) {
  const items = set.dirs.map((dir) => {
    const folder = byDir.get(dir);
    return {
      name: folder.name,
      ...(folder.docs ? { description: folder.docs } : {}),
      item: folder.requests.map((request) => itemOf(env, request)),
    };
  });
  return {
    name: `${set.label} (${env.folder})`,
    description:
      set.id === "onboarding"
        ? `Getting a participant onto NHCX ${env.id === "sandbox" ? "in the sandbox" : "in production"}: the session token, creating and updating the participant, and the registry. Run Session token first.`
        : `The exchange calls ${env.id === "sandbox" ? "in the sandbox" : "in production"}: every use case, the status and search calls, the PMJAY adjudicator hooks and biometric authentication. Run Session token first.`,
    auth: { type: "bearer", bearer: [{ key: "token", value: `{{${prefixed(env, "token")}}}`, type: "string" }] },
    item: items,
  };
}

// Sandbox first, both halves, then production: the order a reader works in.
const folders = [];
for (const env of ENVIRONMENTS) {
  for (const set of SETS) folders.push(folderOf(env, set));
}

const count = (folder) => folder.item.reduce((n, f) => n + (f.item ? count(f) : 1), 0);

const DESCRIPTION = [
  "Generated from the NHCX package (github.com/nha-in/nhcx-package), from the Bruno collection under apis/. Edit the package, not this file.",
  "",
  "Four folders: NHCX Onboarding and NHCX Usecase, each for the sandbox and for production. Onboarding is the session token, creating and updating a participant, and the registry. Usecase is the session token and every exchange call.",
  "",
  "Every variable is prefixed by its environment, sbx_ or prod_, so a sandbox token or participant code is never sent to production by mistake. Import nhcx.postman_environment.json beside this collection and fill in sbx_clientId and sbx_clientSecret (and the prod_ pair when you have production credentials). Run Session token in the folder you are working in: it stores that environment's token, and the folder's calls send it as bearer_auth.",
  "",
  "The exchange calls (/v1/...) carry a JWE, not a FHIR bundle. The body here is the envelope with a placeholder payload. Encrypt a real bundle for the recipient's certificate before sending one.",
  "",
  "Production hosts NHA has not published are blank. Fill them in from your onboarding letter.",
].join("\n");

const postman = {
  info: {
    name: "NHCX",
    description: DESCRIPTION,
    schema: SCHEMA,
  },
  item: folders,
  // Declared on the collection too, hosts filled in, so the collection works
  // on its own; the environment, when imported, takes precedence.
  variable: ENVIRONMENTS.flatMap((env) => variablesOf(env)),
};

const environment = {
  name: "NHCX",
  values: ENVIRONMENTS.flatMap((env) =>
    variablesOf(env).map((v) => ({
      key: v.key,
      value: v.value,
      ...(v.type ? { type: v.type } : {}),
      enabled: true,
    })),
  ),
  _postman_variable_scope: "environment",
};

const manifest = {
  label: "NHCX",
  file: "nhcx.postman_collection.json",
  environment: "nhcx.postman_environment.json",
  requests: folders.reduce((n, f) => n + count(f), 0),
  folders: folders.map((f) => ({ name: f.name, requests: count(f) })),
  source: "nhcx-package/apis",
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, manifest.file), `${JSON.stringify(postman, null, 2)}\n`);
writeFileSync(join(OUT_DIR, manifest.environment), `${JSON.stringify(environment, null, 2)}\n`);
writeFileSync(join(OUT_DIR, "nhcx.postman_manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  `[build-postman] ${manifest.requests} requests in ${folders.length} folders: ` +
    manifest.folders.map((f) => `${f.name} (${f.requests})`).join(", "),
);
console.log(`[build-postman] Wrote: ${join(OUT_DIR, manifest.file)}`);
console.log(`[build-postman] Wrote: ${join(OUT_DIR, manifest.environment)}`);
