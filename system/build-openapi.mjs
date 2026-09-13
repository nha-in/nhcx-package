/**
 * Standalone OpenAPI & Postman Builder for NHCX API Collections
 *
 * Reads:
 *   package/apis/                (Bruno collection)
 *   package/apis/environments/   (Sandbox / production hosts & variables)
 *
 * Generates:
 *   package/system/misc/nhcx.openapi.yaml   (OpenAPI 3.1 YAML specification)
 *   package/system/misc/nhcx.openapi.json   (OpenAPI 3.1 JSON specification)
 *   package/system/misc/nhcx.postman.json   (Postman Collection v2.1)
 *
 * Usage:
 *   node system/build-openapi.mjs
 *   npm --prefix system run build:openapi
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readCollection, resolveVars } from "./lib/bru.mjs";
import { toYaml } from "./lib/yaml.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const BRUNO_DIR = join(ROOT, "apis");
const OUT_DIR = join(__dirname, "misc");

const collection = readCollection(BRUNO_DIR);
const environment =
  collection.environments.find((e) => e.name === "sandbox") ??
  collection.environments[0];
const vars = environment?.vars ?? {};

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

const summaryOf = (request) => {
  const match = /## Summary\n\n([\s\S]*?)\n\n/.exec(request.docs ?? "");
  if (match) return match[1].trim();
  const first = prose(request.docs)
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && !l.startsWith("`"))[0];
  return first ?? request.name;
};

function serverFor(url) {
  const resolved = resolveVars(url, vars);
  try {
    const parsed = new URL(resolved);
    return { origin: `${parsed.protocol}//${parsed.host}`, path: parsed.pathname || "/" };
  } catch {
    return { origin: "", path: resolved };
  }
}

function schemaOf(value) {
  if (Array.isArray(value)) {
    return { type: "array", items: value.length ? schemaOf(value[0]) : {} };
  }
  if (value && typeof value === "object") {
    return {
      type: "object",
      properties: Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, schemaOf(item)])
      ),
    };
  }
  if (typeof value === "number")
    return { type: Number.isInteger(value) ? "integer" : "number" };
  if (typeof value === "boolean") return { type: "boolean" };
  return { type: "string" };
}

function operation(request, folder) {
  const example = exampleResponse(request.docs);
  const body = json(request.body);
  const headers = Object.entries(request.headers)
    .filter(([key]) => key.toLowerCase() !== "content-type")
    .map(([key, value]) => ({
      name: key,
      in: "header",
      required: key.startsWith("x-hcx-") && !key.includes("ben-abha"),
      description: key.startsWith("x-hcx-")
        ? "NHCX protected header, mirrored from the JWE envelope."
        : undefined,
      schema: { type: "string" },
      example: value,
    }));

  return {
    tags: [folder.name],
    summary: summaryOf(request),
    description: prose(request.docs),
    operationId: request.file
      .split("/")
      .pop()
      .replace(/\.bru$/, "")
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()),
    ...(headers.length ? { parameters: headers } : {}),
    ...(body
      ? {
          requestBody: {
            required: true,
            content: { "application/json": { schema: schemaOf(body), example: body } },
          },
        }
      : {}),
    responses: {
      200: {
        description: "Operation processed successfully.",
        ...(example
          ? {
              content: {
                "application/json": { schema: schemaOf(example), example },
              },
            }
          : {}),
      },
    },
  };
}

function toOpenApi() {
  const paths = {};
  const servers = new Map();

  for (const folder of collection.folders) {
    for (const request of folder.requests) {
      const { origin, path } = serverFor(request.url);
      if (origin) servers.set(origin, (servers.get(origin) ?? 0) + 1);
      const key = path || "/";
      paths[key] ??= {};
      paths[key][request.method.toLowerCase()] = {
        ...operation(request, folder),
        ...(origin ? { servers: [{ url: origin }] } : {}),
      };
    }
  }

  return {
    openapi: "3.1.0",
    info: {
      title: "NHCX API Specification",
      version: new Date().toISOString().slice(0, 10),
      summary: "OpenAPI specification for National Health Claims Exchange (NHCX) APIs.",
      description:
        "Generated automatically from the Bruno collection in package/apis/. Covers external gateway endpoints, " +
        "internal routing endpoints, registry lookups, session minting, and adjudicator hooks.",
    },
    servers: [...servers.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([url, count]) => ({ url, description: `${count} operations` })),
    tags: collection.folders.map((folder) => ({ name: folder.name })),
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "ABDM gateway authentication token.",
        },
      },
    },
    paths,
  };
}

function postmanUrl(raw) {
  const resolved = resolveVars(raw, vars);
  let parsed;
  try {
    parsed = new URL(resolved);
  } catch {
    return { raw };
  }
  const withVars = raw.includes("{{") ? raw : resolved;
  return {
    raw: withVars,
    protocol: parsed.protocol.replace(":", ""),
    host: parsed.hostname.split("."),
    path: parsed.pathname.split("/").filter(Boolean),
    ...(parsed.search
      ? { query: [...parsed.searchParams].map(([key, value]) => ({ key, value })) }
      : {}),
  };
}

function postmanRequest(request) {
  const example = exampleResponse(request.docs);
  const headers = Object.entries(request.headers).map(([key, value]) => ({
    key,
    value,
    type: "text",
  }));
  const item = {
    name: request.name,
    description: prose(request.docs),
    request: {
      method: request.method,
      header: headers,
      ...(request.body
        ? {
            body: {
              mode: "raw",
              raw: request.body,
              options: { raw: { language: "json" } },
            },
          }
        : {}),
      url: postmanUrl(request.url),
    },
    ...(example
      ? {
          response: [
            {
              name: "Documented response",
              originalRequest: {
                method: request.method,
                header: headers,
                url: postmanUrl(request.url),
              },
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
  return item;
}

function toPostman() {
  return {
    info: {
      name: "NHCX API Collection",
      schema:
        "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      description: "Postman export generated from Bruno collection.",
    },
    item: collection.folders.map((folder) => ({
      name: folder.name,
      item: folder.requests.map(postmanRequest),
    })),
    variable: Object.entries(vars).map(([key, value]) => ({
      key,
      value: String(value),
      type: "string",
    })),
  };
}

mkdirSync(OUT_DIR, { recursive: true });

const openapi = toOpenApi();
const postman = toPostman();

const openapiYamlPath = join(OUT_DIR, "nhcx.openapi.yaml");
const openapiJsonPath = join(OUT_DIR, "nhcx.openapi.json");
const postmanJsonPath = join(OUT_DIR, "nhcx.postman.json");

const yamlStr = toYaml(
  openapi,
  "Generated from package/apis by package/system/build-openapi.mjs. Edit the .bru files, not this."
);
const jsonStr = JSON.stringify(openapi, null, 2) + "\n";
const postmanStr = JSON.stringify(postman, null, 2) + "\n";

writeFileSync(openapiYamlPath, yamlStr);
writeFileSync(openapiJsonPath, jsonStr);
writeFileSync(postmanJsonPath, postmanStr);

const requestsCount = collection.folders.reduce(
  (sum, f) => sum + f.requests.length,
  0
);
console.log(
  `[build-openapi] Processed ${requestsCount} Bruno requests across ${collection.folders.length} folders.`
);
console.log(`[build-openapi] Wrote: ${openapiYamlPath}`);
console.log(`[build-openapi] Wrote: ${openapiJsonPath}`);
console.log(`[build-openapi] Wrote: ${postmanJsonPath}`);
