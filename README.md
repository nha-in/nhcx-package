# NHCX Integration Package

A consolidated, production-grade package containing all APIs, wire-tested sample FHIR R4 bundles, canonical workflow definitions, use-case specifications, field mapping dictionaries, and automated OpenAPI tooling for the **National Health Claims Exchange (NHCX)** under the **Ayushman Bharat Digital Mission (ABDM)**.

---

## Directory Overview

```text
package/
├── apis/                   # 82 APIs in Bruno format (both request & callback, external & internal)
│   ├── 01-session/         # ABDM Gateway session token minting
│   ├── 02-eligibility/     # Coverage eligibility check & on_check (/v1 and /internal/v1)
│   ├── 03-preauth/         # Pre-authorisation submit & on_submit (/v1 and /internal/v1)
│   ├── 04-predetermination/# Cost & coverage predetermination
│   ├── 05-claim/           # Discharge claim submit & on_submit (/v1 and /internal/v1)
│   ├── 06-payment-notice/  # Payment notice request & on_request
│   ├── 07-communication/   # Queries, documentation requests, notifications
│   ├── 08-status/          # Request dispatch tracking & search
│   ├── 09-insurance-plan/  # Package master & tariff policy polling
│   ├── 10-registry/        # Participant registry, certificates (/fetch/certs), policies
│   ├── 11-onboarding/      # Participant onboarding & registration
│   ├── 12-adjudicator/     # PMJAY sandbox adjudicator simulation hooks
│   ├── 13-other/           # Health checks, error callbacks, webhooks
│   ├── environments/       # Sandbox host definitions & credentials
│   ├── bruno.json          # Bruno collection manifest
│   └── collection.bru      # Global auth & headers configuration
│
├── fhir/                   # Sample JSON FHIR R4 bundles packed by use case
│   ├── B1/                 # Coverage eligibility (Discovery, Validation, Benefits, Auth-Requirements)
│   ├── B2/                 # Insurance plan package master request
│   ├── B3/                 # Pre-authorisation (New, Enhancement, Query Update, Cancel)
│   ├── B4/                 # Communication (Preauth & Claim query replies with attachments)
│   ├── B5/                 # Claim submission (Discharge, Query Update, Release, Reprocess)
│   ├── B6/                 # Claim search Task bundle
│   ├── B7/                 # Payment notice acknowledgment
│   ├── B8/                 # Tasks (Reprocess dispute, Pre-auth cancellation)
│   ├── B9/                 # Predetermination treatment cost estimate request
│   ├── C3/                 # Payer coverage eligibility responses (Generic & PMJAY)
│   ├── C4/                 # Payer insurance plan responses with tariffs & questionnaires
│   ├── C5/                 # Payer preauth decisions (Ack wf20, Approved wf21, Denied wf23, Queried wf24)
│   ├── C6/                 # Payer communication queries & push notifications
│   ├── C7/                 # Payer claim decisions (Ack wf25, Approved wf26, Queried wf27, Denied wf291)
│   ├── C8/                 # Payer search response Task bundle
│   ├── C9/                 # Payer payment remittance notice (wf30 with bank UTR & TDS)
│   ├── C10/                # Payer task decisions (Cancel done PC02, Arbitration ack wf37)
│   ├── C11/                # Payer predetermination response
│   ├── D1..D13/            # Dedicated PMJAY State Health Agency (SHA) wire bundles
│   ├── index.yaml          # Machine-readable catalog of all bundles
│   └── README.md           # Guide to FHIR bundle directory
│
├── workflow.yaml           # Canonical catalogue of all 74 workflow IDs & 6 code families
├── usecases.yaml           # Complete specification of all NHA (A1..E1) & Builder use cases
├── nhcx-error.yaml         # Every gateway and payer error code, by code space
│
├── mappings/               # 40 Use Case Field definitions & FHIR element mappings (A1..E1)
│   ├── A1.yaml..A6.yaml    # Shared use cases
│   ├── B1.yaml..B9.yaml    # Provider use cases
│   ├── C1.yaml..C11.yaml   # Payer use cases
│   ├── D1.yaml..D13.yaml   # PMJAY Scheme use cases
│   ├── E1.yaml             # Patient notification mapping
│   ├── index.yaml          # Master mapping catalog
│   └── README.md           # Guide to mapping definitions
│
├── docs/                   # Complete 72-chapter NHCX guide & reference
│   ├── 01-Overview/        # Fundamentals, architecture, use cases, workflow codes
│   ├── 02-Network Roles/   # Gateway, trust store, registry, certificate exchange
│   ├── 03-Building a Provider/ # Hospital & daycare integration guide
│   ├── 04-Building a Payer/    # Insurer & TPA integration guide
│   ├── 05-FHIR Reference/  # NRCeS profiles, bundles, mappings
│   └── 06-Reference/       # API catalog, error codes, troubleshooting, governance
│
├── corpus/                 # The AI corpus the NHCX chatbot answers from (section 8)
├── Makefile                # `make` rebuilds the content and releases it (section 8)
├── dist/                   # Build output: the release, in dist/out/ and dist/release/package.zip
├── .github/workflows/      # A GitHub release builds nhcx-package-v<version>.zip in CI (section 8)
│
└── system/                 # Everything that is not data: tooling (100% Node.js) and its output
    ├── build-docs.mjs      # Documentation compiler from package sources
    ├── build-openapi.mjs   # OpenAPI 3.1 & Postman exporter
    ├── build-corpus.mjs    # AI corpus builder: chunks, a model's index of every chunk, facts
    ├── eval-corpus.mjs     # Scores the corpus as the chatbot retrieves it
    ├── eval/               # The held-out question set the corpus is scored with
    ├── build-manifest.mjs  # Writes the release's MANIFEST
    ├── generate-all-mappings.mjs # Mapping file generator
    ├── validate-bundles.mjs# Bundle schema & reference validator
    ├── lib/                # Shared Bruno parser & YAML emitter modules
    ├── bin/                # CLI wrappers: validate (nhcx-validate), build-docs (nhcx-build-docs)
    ├── misc/               # Generated OpenAPI 3.1 (YAML, JSON) & Postman Collection v2.1
    ├── reports/            # Generated bundle validation reports
    ├── package.json        # NPM package manifest with build scripts
    ├── node_modules/       # Installed dependencies
    └── README.md           # Script usage instructions
```

Commands below run from the package root. `npm --prefix system run <script>` runs an npm script in `system/` without changing into it.

---

## 1. APIs (`package/apis`)

The `apis/` directory is a complete [Bruno](https://www.usebruno.com) collection containing all **82 APIs** required to integrate with NHCX:
- **Both Directions**: Every exchange includes both the triggering outbound request (e.g. `/v1/claim/submit`) and the inbound callback webhook (e.g. `/v1/claim/on_submit`).
- **Both Layers**: Includes external gateway endpoints (`/v1/...`) and internal service handlers (`/internal/v1/...`).
- **Authentication**: Pre-configured for ABDM session token minting with automatic bearer token propagation.

---

## 2. Sample FHIR Bundles (`package/fhir`)

Packed into clean, dedicated directories by use case code:
- `package/fhir/B1/` through `package/fhir/B9/` for generic hospital provider operations.
- `package/fhir/C3/` through `package/fhir/C11/` for payer responses and adjudication verdicts.
- `package/fhir/D1/` through `package/fhir/D13/` for government scheme (PMJAY) transactions.

All bundles are valid HL7 FHIR R4 `Bundle` resources of type `collection` conformant to NRCeS India profiles.

---

## 3. Workflows & Use Cases (`workflow.yaml`, `usecases.yaml`)

- **`workflow.yaml`**: Covers all 74 workflow IDs across pre-authorisation (12, 13, 20, 21, 23, 24, 121, PC01, PC02), claims (15, 25, 26, 27, 28, 29, 291, 151, 36, 37), settlements (30, 31, 33, 17), and specialized families (Grievance, Return Payment, Notifications).
- **`usecases.yaml`**: Documents all 40 NHA-defined use cases (Shared A1-A6, Provider B1-B9, Payer C1-C11, Scheme D1-D13, Patient E1) and 17 builder workflows.

---

## 4. Field Mappings (`package/mappings`)

- **`package/mappings/A1.yaml`**: The canonical master data dictionary. Details field keys, data types, cardinalities, validation constraints, NRCeS code systems, and exact FHIR paths for:
  1. Participant Registry & Routing (`A1`)
  2. Beneficiary & Demographics
  3. Facility & Practitioner Identifiers (NPI, HFR, HPIN, HPID)
  4. Clinical Diagnoses (ICD-10) & Procedures (SNOMED / Package codes)
  5. Billing Line Items, Rates & Totals
  6. Supporting Clinical Documents & Base64 Attachments
  7. Adjudication Outcomes & Settlement UTRs
- Modular use case files: `B1.yaml`, `B2.yaml`, `B3.yaml`, `B4.yaml`, `B5.yaml`, `B7.yaml`, `B8.yaml`.
- **NRCeS profiles.** Every mapping file names the NRCeS profile of its focal resource in `nrces_profile`, and the profile of every resource its fields map in `profiles`. Each resolves to its published definition at `https://nrces.in/ndhm/fhir/r4/StructureDefinition-<Type>.html`. `system/generate-all-mappings.mjs` writes both, and the documentation links the same profiles under every data element table.

---

## 5. OpenAPI Tooling (`package/system`)

Generate or update OpenAPI and Postman artifacts in `system/misc/` anytime using:

```bash
npm --prefix system run build:openapi
# Or: node system/build-openapi.mjs
```

---

## 6. Bundle Validator CLI & Automated Reports (`package/system/validate-bundles.mjs`)

Validate all HL7 FHIR R4 bundles organized by use case against NHCX / NRCeS structural rules, reference integrity, required data elements, and financial totals.

### Running the Validator

```bash
# Validate all 64 bundles across all use cases:
npm --prefix system run validate

# Or using the direct CLI binary:
./system/bin/validate

# Filter by a specific usecase (e.g. B1, B3, C5):
node system/validate-bundles.mjs --usecase B1

# Strict mode (fails on warnings as well as errors):
node system/validate-bundles.mjs --strict

# Custom report output directory:
node system/validate-bundles.mjs --report custom-reports/
```

### Generated Reports
Every run automatically outputs:
- **Markdown Report**: [`system/reports/validation-report.md`](system/reports/validation-report.md)
- **JSON Report**: [`system/reports/validation-report.json`](system/reports/validation-report.json)

---

## 7. Dynamic Documentation Builder (`package/system/build-docs.mjs`)

The use case, workflow, API, error and FHIR content in `package/docs/` is generated from the package sources. The FHIR Reference is rendered whole from the bundles in `package/fhir` and the rules in `package/fhir/reference.yaml`: each chapter shows the generic bundle every payer takes, IRDAI-regulated insurers and TPAs included, then what PMJAY changes and what PMJAY requires. Whenever a source file changes, rebuild with a single command:

```bash
# Rebuild all synced documentation:
npm --prefix system run build:docs

# Or directly with node:
node system/build-docs.mjs

# Or via CLI binary:
./system/bin/build-docs
```

---

## 8. Make, the Release and the AI Corpus (`Makefile`)

Run `make` in the package root:

```bash
make                                        # rebuild docs and corpus, release
make validate                               # validate the FHIR bundles into dist/reports/ (off in make and CI for now)
make corpus                                 # the AI corpus only, after rebuilding the docs
make eval                                   # score the corpus as the chatbot retrieves it
CORPUS_MODEL=claude-sonnet-5 make corpus    # index the corpus with another model
make openapi                                # OpenAPI 3.1 and Postman, into dist/openapi/
make ekadocs EKADOCS_DIR=../nha-docs        # port docs and apis into a github.com/nha-in/docs checkout (not in `make`)
make package VERSION=v1.2.0                 # what a GitHub release runs: dist/release/nhcx-package-v1.2.0.zip
make clean                                  # remove dist/
```

`make` rebuilds `docs/` and `corpus/` in place, and then releases the package's NHCX content, and only that:

- `dist/out/`: `apis/`, `docs/`, `fhir/`, `mappings/`, `corpus/`, `usecases.yaml`, `workflow.yaml`, `nhcx-error.yaml`, `baseurl.yaml` and `MANIFEST`. The tooling in `system/`, this README and the `Makefile` stay out. `MANIFEST` lists every file with its size and sha256. It is written into the release as it is packed and exists nowhere else, never at the package root.
- `dist/release/package.zip`: the same, under one folder, `nhcx-package/`.

Publishing a release on GitHub builds the package in CI (`.github/workflows/release.yml`) and attaches it to the release as `nhcx-package-v<version>.zip`, where the version is the release's tag without a leading `v`. CI runs `make package`. It rebuilds `docs/` and fails if the result differs from the committed docs, and writes `MANIFEST` with the release's version. It does not index the corpus, because that needs the chatbot's Bedrock key. The release therefore carries the committed `corpus/`, so run `make` and commit before tagging. To rebuild the package for an existing tag, run the workflow by hand from the Actions tab and give it that tag.

The FHIR bundle validator is off for now, in `make` and in CI. `make validate` runs it on its own, and `FHIR_VALIDATE=1` puts it back in front of `make` and `make package`.

### The AI corpus

`corpus/` is what the NHCX chatbot (`services/chatbot`) answers from. The chatbot reads it from the release, `dist/release/package.zip`, and nothing else: it takes the two files below out of the zip, checks them against the zip's `MANIFEST`, and unpacks them into its own cache. Rebuild with `make` and restart the chatbot to pick up a new corpus.

- `corpus/index/chunks.jsonl`: chunks of the package's own text, each placed as Section › Topic › Subtopic and indexed by a model.
- `corpus/index/facts.json`: exact-lookup tables for workflow codes, status values, error codes, endpoints, constants and glossary terms, read from the data files, not written by the model.

`system/build-corpus.mjs` cuts every documentation chapter, every API folder and every use case mapping at its sections. The `/internal` twin of an API request is folded into the public request it mirrors, and near-identical chunks are merged. The text stays the package's own, so an answer quotes the docs exactly. A model on Amazon Bedrock then reads each page and indexes it. For every chunk it writes a line of context saying where the chunk sits, search keywords including the words people use that the text does not, and the questions the chunk answers. The context line leads the chunk's text, and the keywords and questions go where the chatbot's search weighs them most. An entry that names a code, endpoint, header or element the package does not contain is rejected. The index is cached in `system/.cache/corpus/` under a hash of each page's chunks, so `make` only calls the model for pages whose content changed. `--offline` builds from the cache without calling the model.

Chunk size and how the model's index is used were chosen by measurement. `system/eval-corpus.mjs` runs a held-out set of 524 questions, written by a different model and each tied to the verbatim passage that answers it, through a line-for-line port of the chatbot's retrieval. It counts how often that passage reaches the context the chatbot's model reads. Run it with `make eval` before changing how the corpus is cut or indexed.

With the chatbot's retrieval as it ships (6 chunks, 3500 tokens, 2 per page), plain section chunks put the answer in front of the chatbot's model for 68.9% of the questions, and the indexed corpus for 74.8%. Most of the gain comes from the questions the model writes for each chunk; its keywords alone made no difference. The questions are model-written on both sides, so real questions will score somewhat lower, but the options rank the same.

Widening the chatbot's retrieval is worth as much again, and takes the indexed corpus to 84.2%. Set this in the chatbot's environment:

```bash
NHCX_PACKAGE=<package>/dist/release/package.zip   # the release to answer from (found automatically in this tree)
NHCX_RETRIEVAL_K=10               # chunks per answer (default 6)
NHCX_CONTEXT_BUDGET=6000          # tokens of context (default 3500)
NHCX_RETRIEVAL_PER_PAGE=3         # chunks from one page (default 2)
```

### The model that indexes the corpus

A model on Amazon Bedrock, called with the NHCX chatbot's Bedrock API key through the same `bedrock-mantle` endpoint the chatbot uses (`system/lib/claude.mjs`):

- **Key:** read from `../services/chatbot/.env`, where the chatbot keeps it as `OPENAI_API_KEY`. `CORPUS_ENV_FILE` points at another `.env`, and `AWS_BEARER_TOKEN_BEDROCK` is used only when that file holds no key. The key is never printed.
- **Model:** `CORPUS_MODEL`, default `zai.glm-5` (GLM-5), in the chatbot's region, `ap-south-1`. GLM-5 was chosen over Kimi K2.5 and DeepSeek V3.2 by indexing the same page with each; it wrote the most synonyms and questions, which is what the eval rewards.
- **Claude:** every Claude model on this account returns 403, because Anthropic's model agreement has not been accepted. Once the account owner accepts it in the Bedrock console, `CORPUS_MODEL=claude-opus-5` indexes with Opus 5 in `us-east-1`, with Opus 4.8 as its refusal fallback.
- **Region:** `CORPUS_BEDROCK_REGION` overrides the default.
- **Check a model:** `node system/build-corpus.mjs --test [page]` indexes one page and prints the result, without touching the cache or `corpus/`.
- **Other engine:** `CORPUS_ENGINE=cli` uses the claude CLI instead.

A model the account cannot call stops the build at once with the reason, and `corpus/` is left as it was.
