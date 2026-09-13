# NHCX package build. `make` rebuilds the package's NHCX content and releases it:
#
#   docs/, corpus/             rebuilt in place from the package sources. A model on Amazon
#                              Bedrock (GLM-5 by default) indexes the corpus, with the chatbot's
#                              Bedrock key; only pages whose content changed go to the model again.
#   dist/out/                  the release: apis, docs, fhir, mappings, corpus,
#                              usecases.yaml, workflow.yaml, nhcx-error.yaml, baseurl.yaml and
#                              MANIFEST, which is written there and never at the package root
#   dist/release/package.zip   dist/out, zipped under nhcx-package/
#   dist/reports/              the FHIR bundle validation report, when the validator runs
#
# The FHIR bundle validator is off for now: release and package skip it unless FHIR_VALIDATE=1,
# and make validate runs it on its own.
#
# Targets: make docs | corpus | validate | release | package | eval | openapi | ekadocs | clean
# make package VERSION=<tag> is what a GitHub release runs (.github/workflows/release.yml): it
# rebuilds docs/ and fails if they differ from the committed ones, writes MANIFEST for that
# version and zips dist/release/nhcx-package-v<version>.zip. It never calls the model,
# so the release carries the committed corpus/: run `make` and commit before tagging.
# CORPUS_MODEL=<Bedrock model id> picks the model that indexes the corpus (default zai.glm-5);
# CORPUS_BEDROCK_REGION the Bedrock region; CORPUS_ENGINE=cli the claude CLI.
# make eval scores the corpus against system/eval/questions.jsonl, as the chatbot retrieves.
# make ekadocs, never part of `make`, ports docs/ and apis/ into github.com/nha-in/docs as its
# NHCX section, laid out like HIE-CM: pages, one OpenAPI file per Bruno folder, error codes.
# EKADOCS_DIR=<your checkout> writes there; without it the repository is cloned to dist/ekadocs.
# It always ports onto EKADOCS_BRANCH (docs/nhcx-base), cloned or pulled fresh first.

SYSTEM  := system
DIST    := dist
OUT     := $(DIST)/out
RELEASE := $(DIST)/release
STAGE   := $(DIST)/stage
NAME    := nhcx-package
NODE    ?= node
RSYNC   := rsync -a --delete --exclude .DS_Store
CONTENT := apis docs fhir mappings corpus
FILES   := usecases.yaml workflow.yaml nhcx-error.yaml baseurl.yaml
EKADOCS_REPO ?= https://github.com/nha-in/docs
EKADOCS_DIR  ?= $(DIST)/ekadocs
EKADOCS_BRANCH ?= docs/nhcx-base
# A release version (a tag such as v1.2.0) names the zip nhcx-package-v1.2.0.zip.
VERSION ?=
VER     := $(VERSION:v%=%)
ZIP     := $(if $(VER),$(NAME)-v$(VER).zip,package.zip)
# The FHIR bundle validator is off for now; FHIR_VALIDATE=1 runs it before release and package.
FHIR_VALIDATE ?= 0
CHECKS  := $(if $(filter 1,$(FHIR_VALIDATE)),validate)

.PHONY: all deps docs check-docs corpus validate release package eval openapi ekadocs clean help

all: release

help:
	@sed -n '/^[^#]/q;s/^# \{0,1\}//p' Makefile

# dist/out with its MANIFEST, and dist/release/$(ZIP) with dist/out under one folder, $(NAME)/
define pack
	rm -rf $(OUT) $(STAGE)
	rm -f $(RELEASE)/$(ZIP)
	mkdir -p $(OUT) $(RELEASE) $(STAGE)
	$(RSYNC) $(CONTENT) $(OUT)/
	cp $(FILES) $(OUT)/
	$(NODE) $(SYSTEM)/build-manifest.mjs $(OUT) $(if $(VER),--version $(VER))
	$(RSYNC) $(OUT)/ $(STAGE)/$(NAME)/
	cd $(STAGE) && zip -rqX ../release/$(ZIP) $(NAME)
	rm -rf $(STAGE)
	@echo "release: $(RELEASE)/$(ZIP)"
endef

deps:
	@test -d $(SYSTEM)/node_modules/yaml || (cd $(SYSTEM) && npm install --no-audit --no-fund)

docs: deps
	$(NODE) $(SYSTEM)/build-docs.mjs

# Rebuild docs/ and fail if that changed anything: the docs were not rebuilt after a source changed.
check-docs: deps
	rm -rf $(DIST)/docs-before
	mkdir -p $(DIST)
	cp -R docs $(DIST)/docs-before
	$(NODE) $(SYSTEM)/build-docs.mjs
	@diff -rq $(DIST)/docs-before docs || { echo "docs/ is out of date with the package sources: run make and commit" >&2; exit 1; }
	rm -rf $(DIST)/docs-before

corpus: docs
	$(NODE) $(SYSTEM)/build-corpus.mjs

validate: deps
	$(NODE) $(SYSTEM)/validate-bundles.mjs --report $(DIST)/reports

release: $(CHECKS) corpus
	$(pack)

# The release a GitHub release builds: the committed docs/ and corpus/, never the model.
package: check-docs $(CHECKS)
	$(pack)

eval: deps
	$(NODE) $(SYSTEM)/eval-corpus.mjs score --detail

openapi: deps
	$(NODE) $(SYSTEM)/build-openapi.mjs
	$(RSYNC) $(SYSTEM)/misc/ $(DIST)/openapi/

ekadocs: docs
	$(NODE) $(SYSTEM)/build-ekadocs.mjs $(EKADOCS_DIR) --repo $(EKADOCS_REPO) --branch $(EKADOCS_BRANCH)

clean:
	rm -rf $(DIST)
