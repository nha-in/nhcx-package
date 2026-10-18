# Package System

Everything in the package that is not data lives here: the Node.js scripts for OpenAPI generation, documentation synchronisation, the AI corpus, mapping generation and FHIR bundle validation, their CLI wrappers in `bin/`, the npm manifest and dependencies, and the files they generate. The data they read (`apis/`, `docs/`, `fhir/`, `mappings/`, `usecases.yaml`, `workflow.yaml`, `nhcx-error.yaml`, `baseurl.yaml`) sits at the package root.

Commands below run from the package root. `make` there runs the documentation, corpus, Postman and manifest builders and writes the release to `dist/`; `make openapi`, `make validate`, `make eval` and `make ekadocs` run the others on their own, and the mapping generator is run by hand. See the package README. `npm --prefix system run <script>` runs one npm script in this directory without changing into it.

## Available Scripts

### 1. OpenAPI & Postman Builder (`build-openapi.mjs`)
Compiles all 83 Bruno `.bru` requests into standard API definitions. `make openapi` runs it and copies `misc/` to `dist/openapi/`.

```bash
# Run via npm:
npm --prefix system run build:openapi

# Or directly with node:
node system/build-openapi.mjs
```

**Outputs:**
- `system/misc/nhcx.openapi.yaml`: Complete OpenAPI 3.1 specification formatted as YAML.
- `system/misc/nhcx.openapi.json`: OpenAPI 3.1 specification in JSON format.
- `system/misc/nhcx.postman.json`: Postman Collection v2.1 export.

### 1b. Postman Collection Builder (`build-postman.mjs`)
Builds the collection integrators import: one file, four folders. **NHCX Onboarding (SANDBOX)** and **NHCX Onboarding (PROD)** hold the session token, participant creation and the registry; **NHCX Usecase (SANDBOX)** and **NHCX Usecase (PROD)** hold the session token and every exchange call. Hosts come from `baseurl.yaml`, every variable is prefixed `sbx_` or `prod_`, and each environment's folders authenticate with their own token.

```bash
# Run via make, or npm, or node:
make postman
npm --prefix system run build:postman
node system/build-postman.mjs --out dist/postman
```

**Outputs** (in `dist/postman/`, or `--out <dir>`):
- `nhcx.postman_collection.json`: Postman Collection v2.1, the four folders.
- `nhcx.postman_environment.json`: every variable, hosts filled in, credentials blank.
- `nhcx.postman_manifest.json`: the file names, the request count in all and per folder.

`make release` and `make package` write the same three files into the release as `postman/`.

### 2. Documentation Builder (`build-docs.mjs`)
Regenerates `01-Overview/05-NHCX Use Cases.md` and `01-Overview/06-Workflow Codes.md`, every chapter of `05-FHIR Reference` from the bundles in `package/fhir` and the rules in `package/fhir/reference.yaml`, the curl blocks (`build-docs:api`) from `package/apis/**/*.bru`, the error tables (`build-docs:errors`) from `package/nhcx-error.yaml`, and the address tables (`build-docs:baseurls`) from `package/baseurl.yaml`. Text between a `<!-- build-docs:... -->` marker and `<!-- build-docs:end -->` is overwritten on every run. Each FHIR chapter shows the generic bundle, then what PMJAY changes, computed from the PMJAY bundle, and what PMJAY specifies and requires.

```bash
# Run via npm:
npm --prefix system run build:docs

# Or directly with node:
node system/build-docs.mjs

# Or via CLI binary:
./system/bin/build-docs
```

### 3. FHIR Bundle Validator (`validate-bundles.mjs`)
Validates all 80 sample FHIR bundles against NRCeS profiles and reference integrity rules. Reports are written to `system/reports/` unless `--report <DIR>` names another directory; `make validate` writes them to `dist/reports/`. The validator is off in `make` and in CI for now; `FHIR_VALIDATE=1` puts it back.

```bash
# Run via npm:
npm --prefix system run validate

# Or directly with node:
node system/validate-bundles.mjs

# Or via CLI binary:
./system/bin/validate
```

### 4. Mapping Generator (`generate-all-mappings.mjs`)
Writes `package/mappings/<code>.yaml` and `package/mappings/index.yaml`.

```bash
node system/generate-all-mappings.mjs
```

### 5. AI Corpus Builder (`build-corpus.mjs`)
Writes `corpus/index/chunks.jsonl` and `corpus/index/facts.json`, the two files the NHCX chatbot reads. The sources and the chunking live in `lib/corpus.mjs`. Every documentation chapter, API folder and use case mapping is cut at its sections into chunks of up to ~1000 tokens of the package's own text, each placed as Section › Topic › Subtopic. A model on Amazon Bedrock (`lib/claude.mjs`, GLM-5 by default, with the chatbot's Bedrock key; see the package README) then indexes each page. For every chunk it writes a line of context, search keywords and the questions the chunk answers, and entries naming identifiers the package does not contain are rejected. The index is cached in `.cache/corpus/` under a hash of each page's chunks. The facts are read from the YAML data files.

```bash
# Run via make, which rebuilds the docs first:
make corpus

# Or directly with node:
node system/build-corpus.mjs                      # index changed pages, then write corpus/
node system/build-corpus.mjs --offline            # build from the cached index, never call the model
node system/build-corpus.mjs --no-index           # plain chunks, without the model's index
node system/build-corpus.mjs --test 05-fhir                # index one page to check the model works; writes nothing
CORPUS_MODEL=deepseek.v3.2 node system/build-corpus.mjs     # index with another Bedrock model
CORPUS_ENGINE=cli node system/build-corpus.mjs              # the claude CLI instead of Bedrock
```

### 6. Manifest (`build-manifest.mjs`)
Writes `MANIFEST` into a release directory: what the release holds, and every file of NHCX content in it with its size and sha256. `make` runs it on `dist/out/` as it packs the zip, so `MANIFEST` ships only in the release and never sits at the package root.

```bash
node system/build-manifest.mjs dist/out                    # dist/out/MANIFEST, versioned from system/package.json
node system/build-manifest.mjs dist/out --version 1.2.0    # for a tagged release
```

### 7. Corpus Evaluation (`eval-corpus.mjs`)
Scores a chunk index against `eval/questions.jsonl`: held-out questions, each tied to the verbatim passage that answers it, written by a different model than the one that indexes the corpus. Retrieval runs through `lib/bm25.mjs`, a line-for-line port of the chatbot's search and chunk selection. A question counts as answered when its passage reaches the context the chatbot's model reads.

```bash
make eval                                                    # score corpus/, by section and question type
node system/eval-corpus.mjs score a.jsonl b.jsonl            # compare chunk indexes
node system/eval-corpus.mjs score --k 10 --budget 6000 --per-page 3   # try the chatbot's retrieval settings
node system/eval-corpus.mjs chunking                         # compare chunk sizes, without the model
node system/eval-corpus.mjs questions                        # write questions for pages whose source changed
```

### 8. Docs Site Port (`build-ekadocs.mjs`)
Ports `docs/` and `apis/` into a checkout of github.com/nha-in/docs as its NHCX section, laid out like HIE-CM: the chapters as pages, one OpenAPI 3.1 file per Bruno folder with the callbacks as webhooks and the error codes as `x-abdm-errors`. Never part of `make`.

```bash
make ekadocs EKADOCS_DIR=../nha-docs                        # port into an existing checkout
node system/build-ekadocs.mjs <checkout> --branch docs/nhcx-base
```
