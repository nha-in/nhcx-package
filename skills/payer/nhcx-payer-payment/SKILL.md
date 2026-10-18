---
name: nhcx-payer-payment
description: >-
  Build NHCX (India's National Health Claims Exchange) payer-side payments into an existing payer system: raising and completing a disbursement, sending the payment notice with its reconciliation when money moves and again with the UTR, recording the hospital's acknowledgement, and answering a hospital's payment enquiry, with the embedded NHCX gateway it needs. Use when a payer system must tell hospitals about payments over NHCX.
metadata:
  version: "1.2.0"
---

**Version 1.2.0**, built 2026-10-18, checked against NHA's NHCX package 1.0.0.

# READ FIRST: CORE
Before anything else, read [references/CORE.md](references/CORE.md) and keep it in mind for the whole task. Its **Instructions** are binding: follow them strictly in every step and every file, and re-read them at the start of each step (L1 to L8). Its **Confusions** settle what easily mixed-up terms mean; when a word is ambiguous, CORE.md decides. It also holds the base URLs and, for every exchange, the route it arrives on, the bundle, the callback that takes it in, the answer and the workflow id the answer travels under.

# UPDATE FIRST
At the start of every task, before L1, and at the start of every later prompt that continues the work, check whether the NHCX package carries a newer build of this skill, and if it does, install it and work from it.

**Independent of the MCP and of the knowledge source.** The check always reads the package on GitHub, whichever knowledge source L1.0 chose: a connected nhcx-docs MCP neither answers it nor skips it, and the MCP's `catalogue_info` version is never compared with the skill's. The skill's version is its own: it is not the package's release tag, nor the catalogue's version, nor `1.0.0`; only the version in `skills/manifest.json` is compared with it.

1. **Read the package's skills manifest.** The package (github.com/nha-in/nhcx-package) keeps a copy of the built skills under `skills/`, with `skills/manifest.json` naming their version (`version` for the provider skills, `companion.version` for the payer skills under `skills/payer/`) and `skills/CHECKSUMS.sha256` the hash of every file. Read it from `https://raw.githubusercontent.com/nha-in/nhcx-package/main/skills/manifest.json`; else from the latest release zip (`nhcx-package/skills/manifest.json`) (the zip of `https://api.github.com/repos/nha-in/nhcx-package/releases/latest`). A package already downloaded as the knowledge source is not read for this: it may be older than `main`.
2. **Compare** its `companion.version` with this build's `1.2.0`, part by part as numbers (1.10.0 is newer than 1.9.2).
3. **Newer in the package: pull and install it.** Download the package (the release zip whose skills manifest carries that version, else the `main` archive `https://codeload.github.com/nha-in/nhcx-package/zip/refs/heads/main`) into a new empty folder outside the target repository, and check every file under `skills/` against `CHECKSUMS.sha256`. Then replace the folder this SKILL.md was loaded from, and every sibling NHCX skill folder installed beside it (`nhcx-payer-full`, `nhcx-payer-coverage`, `nhcx-payer-preauth`, `nhcx-payer-claim`, `nhcx-payer-communication`, `nhcx-payer-payment`), with the package's copy of the same name, whole: no file of the old build is left behind. A skill installed by a plugin manager is updated through it when it offers that version, else its skills folder is replaced the same way. Nothing in the target repository or `nhcx-plan/` is touched by the install. Tell the user in one line ("Updated the NHCX skills from 1.8.0 to 1.9.0 from the NHCX package."), log it, then re-read this SKILL.md and CORE.md from the installed copy and carry on from them; VERSION then re-checks the finished steps against what changed.
4. **Same or older:** carry on with this build.
5. **Not reachable, or a checksum fails:** carry on with this build, say so to the user in one line, and log the reason. A copy that fails its checksums is never installed, not even in part.

Every check is recorded in `nhcx-plan/knowledge.json` under `skill_update` (`checked_at`, `source`, `package_skill_version`, `installed_version`, `result`: `current`, `updated`, `unreachable` or `checksum_failed`) and logged in `nhcx-plan/progress.json` (step `L0`, item `skill update`).

# GOAL
Add NHCX payment notices, acknowledgements and payment enquiries to the target payer system.

This skill holds only the specs this goal needs; the SCOPE section lists them. Specs it names but does not hold are marked with the skill that has them.

# REQUIREMENTS
- **The target payer system source**: an insurer's, TPA's or scheme's claims platform, with its build, test and migration commands working.
- **NHCX participant credentials** for the payer: participant code, ABDM client id and client secret, and the private key of the encryption certificate registered for that code. Where a separate participant processes the payer's claims, its code too.
- **A public URL** NHCX can reach, registered as the participant's `endpoint_url`, routed to the application's inbound path (`/in/<path>` or `/v1/<path>`). Every hospital's message arrives there.
- **A knowledge source**: the nhcx-docs MCP server, or network access to download the NHCX package (see KNOWLEDGE SOURCE).
- For end-to-end tests: sandbox credentials, the sandbox provider EMR that sends to this payer (signed in to by token login), and members seeded in this payer's registry for it to send about.

# KNOWLEDGE SOURCE
NHCX facts (API paths and headers, FHIR profiles and example bundles, codes, workflow ids, error codes, go-live rules) come from one knowledge source, chosen at the start of L1 and recorded in `nhcx-plan/knowledge.json`. Details: [references/KNOWLEDGE.md](references/KNOWLEDGE.md).

1. **nhcx-docs MCP.** If the `nhcx-docs` MCP server is connected (`catalogue_info` answers), use it: `search_docs`, `get_operation`, `get_fhir_profile`, `get_fhir_example`, `validate_fhir`, `validate_request`, `decode_error`.
2. **GitHub package.** Otherwise download the latest release zip from [github.com/nha-in/nhcx-package/releases](https://github.com/nha-in/nhcx-package/releases) (`nhcx-package-v<version>.zip`), keep it as `nhcx-plan/knowledge/nhcx-package-v<version>.zip`, extract it to `nhcx-plan/knowledge/nhcx-package/`, and check it against its `MANIFEST`.

On the protocol the knowledge source wins over these specs; on what the application does, the specs win. Statements that are not the protocol are marked [REF](references/PAYERS.md#markers) (a reference-implementation choice), [PAYER](references/PAYERS.md#markers) (depends on the scheme dialect this payer speaks) or [SANDBOX](references/PAYERS.md#markers) (seen only in the sandbox); every dialect-specific value is in [references/PAYERS.md](references/PAYERS.md). Its ids (NHA use cases such as `C5`) are not this skill's ids: write them as `nha:C5`.

# STEPS
Follow [steps/INDEX.md](steps/INDEX.md) in order. Each step writes one file under `nhcx-plan/` in the target repository, and every sub-step and file change is logged in `nhcx-plan/progress.json` and `nhcx-plan/progress.md` ([steps/LOG.md](steps/LOG.md)). At the end of every prompt, whatever it did, run the report builder to rebuild `nhcx-plan/report.html`: every plan file (progress, log, discovery, mapping, plan, code, validation, dry-run and end-to-end results) on its own tab of one self-contained page, errors first, with a refresh button; `nhcx-plan/make-report.sh` and `make-report.bat` rebuild it every 10 seconds ([steps/LOG.md](steps/LOG.md#logh-reporthtml)).

1. [L1 Discovery](steps/L1-discovery.md): the knowledge source, the target's technology, and every spec item in SCOPE found, partial or missing, with file and lines.
2. [L2 Mapping](steps/L2-mapping.md): target fields to database columns and FHIR elements.
3. [L3 Integration Planning](steps/L3-integration-planning.md): phases, steps and sub-steps for this target, in the build order of the [SCAFFOLDING](references/SCAFFOLDING.md), including the "Cases" and "Payments" entries on the payer system's home screen, sidebar or navbar.
4. [L4 Code Planning](steps/L4-code-planning.md): files, functions and order, laid out by mapping the [SCAFFOLDING](references/SCAFFOLDING.md) onto the target's conventions.
5. [L5 Write Code](steps/L5-write-code.md): file by file, recorded in `nhcx-plan/code.json`, keeping the scaffolding's dependency rules.
6. [L6 Validate Code](steps/L6-validate-code.md): each file against its specs.
7. [L7 Dry-run Tests](steps/L7-dry-run-tests.md): no network; fakes for NHCX and the registry; hospital messages fed straight to the door.
8. [L8 End-to-end Tests](steps/L8-e2e-tests.md): against the NHCX sandbox, the T tests in [references/TESTS.md](references/TESTS.md), each run through the screens (GUI) and from the command line (CLI), with the sandbox provider EMR sending the hospital's side.

# SCAFFOLDING
[references/SCAFFOLDING.md](references/SCAFFOLDING.md) is the shape the code takes in the target payer system. Read it before L3 and keep it open through L5.

- **One NHCX module** (`nhcx/`) holding `gateway/` (G, in-process), `fhir/` (F, pure builders and parsers), `services/` (A), `callbacks/` (C), `models/` and `migrations/` (D), `screens/` and `routes` (S), and the message `archive`.
- **Existing payer modules** change only for the fields NHCX needs: member ABHA number (D5), product UIN and plan type codes, the biometric setting and the policy's own questionnaires (D12), procedure package rate, the procedure's own questionnaires and document rules per phase (D10, D11), the payer's own participant and processing codes (D1), and the "Cases" and "Payments" navigation entries.
- **Dependency rules:** screens call services and read models; only services and callbacks write case tables; FHIR builders never touch the database or the gateway; the gateway knows nothing about cases; a reply found by polling is applied by the same callback handler.
- **Outside the repository:** the gateway config, client secret, private key, ledger and archive directories.
- **Tests** under `tests/nhcx/` (dry-run and end-to-end), and **plan files** under `nhcx-plan/`.
- **Build order** in phases, from the gateway foundation to the navigation entries; L3 plans in that order and leaves out phases whose specs are not in SCOPE.

L4 maps these placeholder names onto the target's own conventions (a Django app, a Spring module, a Node package); the split between parts and the dependency direction do not change.

# SCOPE
The specs this skill holds:

- **Screens** (4): [S1](screens/S1-overview.md), [S2](screens/S2-cases.md), [S3](screens/S3-case-desk.md), [S10](screens/S10-payments.md)
- **APIs** (6): [A6](apis/A6-payment-notice.md), [A7](apis/A7-payment-enquiry-answer.md), [A11](apis/A11-txn-related.md), [A12](apis/A12-txn-fhir.md), [A14](apis/A14-disburse.md), [A15](apis/A15-case-exchange.md)
- **Callbacks** (3): [C1](callbacks/C1-callback-door.md), [C10](callbacks/C10-payment-enquiry.md), [C11](callbacks/C11-payment-acknowledgement.md)
- **FHIR** (12): [F1](fhir/F1-bundle.md), [F4](fhir/F4-task-insuranceplan.md), [F5](fhir/F5-insuranceplan.md), [F6](fhir/F6-questionnaire.md), [F9](fhir/F9-claimresponse.md), [F10](fhir/F10-task-claim-actions.md), [F13](fhir/F13-paymentnotice.md), [F14](fhir/F14-paymentreconciliation.md), [F15](fhir/F15-patient.md), [F16](fhir/F16-practitioner.md), [F17](fhir/F17-organization.md), [F18](fhir/F18-coverage.md)
- **Database** (23): [D1](database/D1-payer.md), [D2](database/D2-staff.md), [D3](database/D3-document-type.md), [D4](database/D4-terminology-code.md), [D6](database/D6-subscription.md), [D10](database/D10-procedure-rule.md), [D11](database/D11-procedure-rule-doc.md), [D12](database/D12-policy.md), [D13](database/D13-policy-procedure.md), [D14](database/D14-policy-coverage-clause.md), [D15](database/D15-policy-clause-benefit.md), [D16](database/D16-policy-alias.md), [D17](database/D17-policy-exclusion.md), [D18](database/D18-policy-sub-limit.md), [D19](database/D19-case.md), [D25](database/D25-case-line-item.md), [D26](database/D26-case-timeline.md), [D27](database/D27-case-exchange-message.md), [D28](database/D28-nhcx-delivery.md), [D30](database/D30-payment.md), [D31](database/D31-audit-log.md), [D32](database/D32-id-sequence.md), [D33](database/D33-participant.md)
- **Gateway** (11): [G1](gateway/G1-embedding.md), [G2](gateway/G2-configuration.md), [G3](gateway/G3-session-token.md), [G4](gateway/G4-registry.md), [G5](gateway/G5-protocol-headers.md), [G6](gateway/G6-encryption.md), [G7](gateway/G7-send.md), [G8](gateway/G8-receive.md), [G9](gateway/G9-ledger.md), [G10](gateway/G10-beneficiary-registry.md), [G11](gateway/G11-startup-checks.md)
- **Tests** (4): [T1](tests/T1-test-configuration.md), [T2](tests/T2-test-runners.md), [T15](tests/T15-payment-noticed.md), [T16](tests/T16-payment-enquiry-answered.md)

Other skills built from the same source:

- **nhcx-payer-full**: the whole payer-side NHCX integration, every exchange end to end.
- **nhcx-payer-coverage**: coverage eligibility answers, the authorisation-requirements ruling and the insurance plan.
- **nhcx-payer-preauth**: pre-authorisation: filing, adjudication, enhancement, cancel, predetermination and status.
- **nhcx-payer-claim**: claim filing, its verdict, reprocess and balance release.
- **nhcx-payer-communication**: queries to the hospital and the replies to them.

# VERSION
This is nhcx-payer-payment version 1.2.0, built on 2026-10-18. Its protocol tables (workflow ids, statuses, base URLs) were checked against NHA's NHCX package 1.0.0 ([github.com/nha-in/nhcx-package](https://github.com/nha-in/nhcx-package)).

- Record it when the work starts: `nhcx-plan/knowledge.json` and the `target` of `nhcx-plan/progress.json` carry `skill` and `skill_version`, and the header of `nhcx-plan/report.html` shows them.
- UPDATE FIRST may have installed a newer build from the NHCX package at the start of the prompt; the version recorded is then the old one.
- If a later prompt runs with a different version of this skill than the one recorded, say so to the user before continuing, log it as a `corrected` entry naming both versions, and re-check the steps already done against the specs that changed.
- A knowledge source newer than 1.0.0 wins on the protocol, as KNOWLEDGE SOURCE says; note the difference in `knowledge.json`.

Changes in 1.2.0, to re-check against when an earlier build is continued:
- UPDATE FIRST: every prompt starts by reading the NHCX package's skills manifest (`skills/manifest.json`) and installs the package's build when it is newer, checked against `skills/CHECKSUMS.sha256`.
- Every step, sub-step, test and spec id shown to a person carries its name (`L3 Integration Planning`, `T3 ... (CLI): pass`), from `nhcx-plan/names.json`, written at L1.2 (LOG.md, LOGN).

# REFERENCES
- [references/CORE.md](references/CORE.md): base URLs, and every exchange from the payer's side with its route, bundles, callback, answer and workflow id, on one page.
- [references/KNOWLEDGE.md](references/KNOWLEDGE.md): the NHCX knowledge source, MCP or GitHub package, and which lookup answers which question.
- [references/SCREENS.md](references/SCREENS.md): every screen in scope, its route and what it does.
- [references/API.md](references/API.md): every API call in scope and what it does.
- [references/CALLBACK.md](references/CALLBACK.md): every NHCX callback in scope and what it does.
- [references/GATEWAY.md](references/GATEWAY.md): every part of the in-process NHCX gateway and what it does.
- [references/FHIR.md](references/FHIR.md): every FHIR resource in scope, sent or read, and what it is.
- [references/DATABASE.md](references/DATABASE.md): every table in scope, what one row is, and which screens, APIs, callbacks and FHIR resources use it.
- [references/PAYERS.md](references/PAYERS.md): the scheme dialects this payer may speak, the workflow ids of its sends, and what the [REF](references/PAYERS.md#markers), [PAYER](references/PAYERS.md#markers) and [SANDBOX](references/PAYERS.md#markers) markers mean.
- [references/OPERATIONS.md](references/OPERATIONS.md): production cutover, and running the application as more than one instance.
- [references/TESTS.md](references/TESTS.md): every end-to-end test in scope, each run through the screens and from the command line, with the sandbox provider EMR on the hospital's side.
- [references/READSETS.md](references/READSETS.md): for each screen, API, callback and gateway part, the other specs to read before implementing it.
- [references/SCAFFOLDING.md](references/SCAFFOLDING.md): the module layout in the target, what each part holds and where each spec lands.

# OUTPUT
In the target repository:
- **Code** in the NHCX module and the changed payer modules, as laid out in SCAFFOLDING.
- **Tests** under `tests/nhcx/`: dry-run (L7) and end-to-end (L8), the end-to-end ones with a GUI runner and a CLI runner (`nhcx-payer-e2e`).
- **Plan files** under `nhcx-plan/`: `knowledge.json`, `discovery.json`, `mapping.json`, `plan.json`, `code-plan.json`, `code.json`, `validation.json`, `dry-run.json`, `e2e.json`, `names.json` (the name of every id), the log `progress.json` with `progress.md`, and `report.html`, rebuilt at the end of every prompt by the report builder (`report.py` or the target language's equivalent) with its `make-report.sh` and `make-report.bat` beside it.
