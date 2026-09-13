#!/usr/bin/env node
/**
 * Rebuilds the generated parts of package/docs from the package sources.
 *
 * Whole chapters:
 *   usecases.yaml    -> docs/01-Overview/05-NHCX Use Cases.md
 *   workflow.yaml    -> docs/01-Overview/06-Workflow Codes.md
 *   nhcx-error.yaml  -> the code tables in docs/06-Reference/01-Error Codes.md (build-docs:errors markers)
 *   baseurl.yaml     -> every build-docs:baseurls block (Base URLs, and Environments and Addresses)
 *
 * Every chapter in docs/05-FHIR Reference, whole, from the bundles in fhir/ and
 * fhir/reference.yaml: the generic bundle and its elements, the rules, what
 * PMJAY changes (computed by comparing bundles) and what PMJAY specifies and
 * requires, plus the "Use cases, APIs and data elements" section built from
 * usecases.yaml, workflow.yaml, mappings/<code>.yaml and apis/**\/*.bru.
 *
 * Every curl in the docs is rendered from a Bruno request: a chapter marks the
 * spot with <!-- build-docs:api <folder>/<file>.bru --> ... <!-- build-docs:end -->
 * and the builder fills it from apis/, hosts taken from the sandbox environment.
 *
 * Usage: npm --prefix system run build:docs   |   node system/build-docs.mjs   |   system/bin/build-docs
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import { parseBru, readCollection } from "./lib/bru.mjs";
import { makeFhirReference } from "./lib/fhir-reference.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_DIR = resolve(__dirname, "..");
const WORKSPACE_DIR = resolve(PACKAGE_DIR, "..");
const DOCS_DIR = join(PACKAGE_DIR, "docs");
const USECASES_DOC_DIR = join(DOCS_DIR, "01-Overview");

const APIS_DIR = join(PACKAGE_DIR, "apis");
const MAPPINGS_DIR = join(PACKAGE_DIR, "mappings");
const FHIR_DIR = join(PACKAGE_DIR, "fhir");
const USECASES_FILE = join(PACKAGE_DIR, "usecases.yaml");
const WORKFLOW_FILE = join(PACKAGE_DIR, "workflow.yaml");
const ERRORS_FILE = join(PACKAGE_DIR, "nhcx-error.yaml");
const BASEURL_FILE = join(PACKAGE_DIR, "baseurl.yaml");
const FHIR_INDEX_FILE = join(FHIR_DIR, "index.yaml");
const REFERENCE_FILE = join(FHIR_DIR, "reference.yaml");

/** The first sentence of a description, for a one-line summary. */
function firstSentence(text) {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  const m = t.match(/^.+?[.!?](?=\s+[A-Z`(]|$)/);
  return m ? m[0] : t;
}

function escapePipe(text) {
  if (text === null || text === undefined) return "";
  return String(text).replace(/\|/g, "\\|").replace(/\n/g, " ").trim();
}

// -----------------------------------------------------------------------------
// 1. Build Use Cases Document
// -----------------------------------------------------------------------------
function buildUsecasesDoc(ucData) {
  const out = [];
  // A fixture lies outside package/ and is not in the release: shown as a path, not linked.
  const fx = (path) => workspaceRef(path, USECASES_DOC_DIR);
  out.push("# NHCX Use Cases");
  out.push("");
  out.push(
    "A use case covers each stage of the claims lifecycle: onboarding providers and payers onto the network, verifying coverage, seeking preauthorisation, submitting claims, exchanging supporting information, and reconciling payments. Between them they deliver the core objectives of standardisation, traceability, and predictable auto-adjudication across India's National Health Claims Exchange (NHCX)."
  );
  out.push("");
  out.push("## Key Use Cases Overview");
  out.push("");
  out.push(
    "- **Onboarding Providers and Payers**: Onboard participants onto NHCX to validate and route requests to target applications."
  );
  out.push(
    "- **Check Coverage Eligibility**: Called by providers to verify beneficiary coverage, policy validity, sum insured, sub-limits, and document requirements."
  );
  out.push(
    "- **Preauth Request Submission**: Submitted by providers before admission or planned surgery. Payers respond with line-item adjudication via `on_submit`."
  );
  out.push(
    "- **Predetermination Request**: Inquires expected coverage and deductible calculations for planned procedures without reserving policy balance."
  );
  out.push(
    "- **Claim Request Submission**: Submitted by providers upon discharge with final bill, discharge summary, and itemised claims."
  );
  out.push(
    "- **Communication Request**: Enables payers to query providers for additional documents (`additionalinfo`), flag turnaround-time breaches (`tatquery`), or issue policy updates."
  );
  out.push(
    "- **Payment Notice & Reconciliation**: Payers notify providers of bank transfers (UTR), detailing claimed, approved, TDS, and settled amounts."
  );
  out.push(
    "- **Reprocess / Cancel / Shortfall**: Providers appeal rejected claims (`reprocess`), request partial payment balance (`partialpayment`), or cancel approved preauthorisations."
  );
  out.push(
    "- **Beneficiary Notifications**: Push notifications to personal health record (PHR) apps on claim status changes."
  );
  out.push("");
  out.push("---");
  out.push("");
  out.push("## Master Use Cases Matrix");
  out.push("");
  out.push(
    `All ${(ucData.nha_use_cases || []).length} NHA use cases by role, each with its API call and callback.`
  );
  out.push("");
  const nhaCases = ucData.nha_use_cases || [];
  const roleGroups = [
    ["Shared", "shared"],
    ["Provider", "provider"],
    ["PMJAY", "pmjay"],
    ["Payer", "payer"],
    ["Patient app", "patient"],
  ];
  for (const [role, side] of roleGroups) {
    const list = nhaCases.filter((uc) => uc.side === side);
    if (!list.length) continue;
    out.push(`### ${role}`);
    out.push("");
    // Title, a one-line description, the API call and its callback. Nothing
    // else: the envelope, workflow codes and chapter links are in the
    // per-use-case sections below.
    for (const uc of list) {
      out.push(`#### ${uc.code || ""} ${uc.title || ""}`);
      out.push("");
      const summary = firstSentence(uc.what_it_does);
      if (summary) out.push(summary, "");
      const api = String(uc.api || "");
      out.push(`**API Call:** ${api.startsWith("/") ? `\`${api}\`` : api.replace(/^\((.*)\)$/, "$1")}`);
      if (uc.callback) out.push(`**Callback:** \`${uc.callback}\``);
      out.push("");
    }
  }
  out.push("");
  out.push("---");
  out.push("");

  const sections = [
    ["Shared Use Cases (Payer and Provider)", "shared", "A"],
    ["Provider Use Cases", "provider", "B"],
    ["PMJAY Scheme Use Cases", "pmjay", "D"],
    ["Payer Use Cases", "payer", "C"],
    ["Beneficiary & Patient App Use Cases", "patient", "E"],
  ];

  for (const [secTitle, secSide, prefix] of sections) {
    const matching = nhaCases.filter(
      (uc) => uc.side === secSide || (uc.code && uc.code.startsWith(prefix))
    );
    if (!matching.length) continue;

    out.push(`## ${secTitle}`);
    out.push("");
    if (secSide === "shared") {
      out.push(
        "The following use cases are common to both Payer and Provider participants on the NHCX platform. None of them carries a workflow code, because they are registry and session calls rather than claim transactions."
      );
    } else if (secSide === "provider") {
      out.push(
        "The following use cases are initiated by Provider participants (hospitals, daycare centers) to verify coverage, submit preauthorisations, answer queries, submit claims, and reconcile payments."
      );
    } else if (secSide === "pmjay") {
      out.push(
        "The following use cases govern the Pradhan Mantri Jan Arogya Yojana (AB PM-JAY) cashless lifecycle as detailed in the official NHA PMJAY Handbook. They follow strict Standard Treatment Guidelines (STG), mandatory biometrics, package rules, and Turnaround Time (TAT) auto-approvals."
      );
    } else if (secSide === "payer") {
      out.push(
        "The following use cases are implemented by Payer participants (Insurance Companies and Third Party Administrators) to respond to provider inquiries, adjudicate claims, raise queries, and settle payments."
      );
    } else if (secSide === "patient") {
      out.push(
        "Personal health record apps and beneficiary portals register on NHCX to receive real-time updates on a patient's claims and authorizations."
      );
    }
    out.push("");

    for (const uc of matching) {
      const code = uc.code || "";
      const title = uc.title || "";
      const api = uc.api || "";
      const callback = uc.callback;
      const jwe = uc.carries_jwe;
      const wf = uc.workflow || uc.workflow_code;
      const desc = uc.what_it_does || "";
      const consolePage = uc.console_page;

      out.push(`### ${code}: ${title}`);
      out.push("");
      out.push(`- **Role / Side:** \`${uc.side || ""}\``);
      out.push(`- **API Called:** \`${api}\``);
      if (callback) out.push(`- **Callback API:** \`${callback}\``);
      if (wf) out.push(`- **Workflow ID:** \`${wf}\``);
      out.push(`- **Carries JWE:** \`${jwe ? "true" : "false"}\``);
      if (consolePage) out.push(`- **Simulator Console:** \`${consolePage}\``);

      const mappingFile = join(MAPPINGS_DIR, `${code}.yaml`);
      if (existsSync(mappingFile)) {
        out.push(`- **Data Element Mapping:** ${fileLink(`package/mappings/${code}.yaml`, mappingFile, USECASES_DOC_DIR)}`);
      }
      const chapterRef = chapterRefLink(code, USECASES_DOC_DIR);
      if (chapterRef) out.push(`- **FHIR Reference:** ${chapterRef}`);

      const fhirUcDir = join(FHIR_DIR, code);
      if (existsSync(fhirUcDir)) {
        const bundles = readdirSync(fhirUcDir)
          .filter((f) => f.endsWith(".json"))
          .sort();
        const bundleLinks = bundles
          .map((b) => fileLink(b, join(fhirUcDir, b), USECASES_DOC_DIR))
          .join(", ");
        out.push(`- **Sample FHIR Bundles (${bundles.length}):** ${bundleLinks}`);
      }

      out.push("");
      out.push(desc);
      out.push("");
      // Use cases with no FHIR Reference chapter (registry, session, auth,
      // notifications) carry their data elements here instead.
      if (!chapterRef && CTX.mappings.has(code)) {
        out.push(...dataElementTable(CTX.mappings.get(code)));
      }
    }
  }

  const builderCases = ucData.builder_use_cases || [];
  if (builderCases.length) {
    out.push("---");
    out.push("");
    out.push("## FHIR Builder Use Cases");
    out.push("");
    out.push(
      "The NHCX FHIR Builder provides pre-configured templates and presets for generating conforming bundles across claim lifecycle stages:"
    );
    out.push("");
    out.push("| Bundle | Step | Label | Template | Endpoint | Flow | Description |");
    out.push("| :--- | :--- | :--- | :--- | :--- | :--- | :--- |");
    for (const b of builderCases) {
      out.push(
        `| \`${b.bundle || ""}\` | \`${b.step || ""}\` | **${b.label || ""}** | \`${b.template || ""}\` | \`${b.endpoint || ""}\` | \`${b.flow || ""}\` | ${escapePipe(b.what_it_is || "")} |`
      );
    }
    out.push("");
  }

  out.push("---");
  out.push("");
  out.push("## The 100 Official NHCX Test Use Cases");
  out.push("");
  out.push(
    `NHA specifies a formal test matrix of 100 numbered use cases covering every scenario an integrator must demonstrate for network certification. The complete reference manifest is preserved at ${fx("fixtures/usecases.txt")}.`
  );
  out.push("");
  out.push(
    "| Case IDs | Scenario Category | Exchanges Involved | Key Verification Criteria | Fixture Reference |"
  );
  out.push("| :--- | :--- | :--- | :--- | :--- |");
  out.push(
    `| **1 to 3** | Insurance Plan | \`/insuranceplan/request\` & \`on_request\` | Plan query (\`Task\` poll), package master response (\`InsurancePlan\`), error response | ${fx("fixtures/reference/provider/insurance/")} |`
  );
  out.push(
    `| **4 to 7** | Coverage Validation | \`/coverageeligibility/check\` & \`on_check\` | Purpose \`validation\`. Checks policy in force, active dates, error handling | ${fx("fixtures/reference/provider/coverage/validation/")} |`
  );
  out.push(
    `| **8 to 10** | Coverage Discovery | \`/coverageeligibility/check\` & \`on_check\` | Purpose \`discovery\`. Discovers policy from ABHA when policy number unknown | ${fx("fixtures/reference/provider/coverage/discovery/")} |`
  );
  out.push(
    `| **11 to 13** | Auth-Requirements | \`/coverageeligibility/check\` & \`on_check\` | Purpose \`auth-requirements\`. Returns mandatory document codes (\`MAND...\`) | ${fx("fixtures/reference/provider/coverage/authrequirements/")} |`
  );
  out.push(
    `| **14 to 16** | Preauth with Biometric Token | \`/preauth/submit\` & \`on_submit\` | Valid biometric token in header/token. Ack (wf20) & approval (wf21) | ${fx("fixtures/reference/provider/preauth/request/")} |`
  );
  out.push(
    `| **17 to 19** | Preauth without Token (Consent) | \`/preauth/submit\` & \`on_submit\` | Physical consent form uploaded in supportingInfo questionnaire | ${fx("fixtures/collection/provider/preauth/")} |`
  );
  out.push(
    `| **20 to 22** | Preauth Newborn Registration | \`/preauth/submit\` & \`on_submit\` | Newborn registered under mother's ABHA/PMJAY policy, birth certificate | ${fileLink("docs/05-FHIR Reference/12-Claim Request.md", join(FHIR_REFERENCE_DIR, "12-Claim Request.md"), USECASES_DOC_DIR)} |`
  );
  out.push(
    `| **23 to 25** | Preauth with STG | \`/preauth/submit\` & \`on_submit\` | Standard Treatment Guidelines questionnaire answered under supportingInfo | ${fx("fixtures/collection/pmjay-payer/insurance/")} |`
  );
  out.push(
    `| **26 to 28** | Preauth with Implant & Attendant | \`/preauth/submit\` & \`on_submit\` | Implant product details and attendant certification included | ${fx("fixtures/reference/provider/preauth/request/")} |`
  );
  out.push(
    `| **29 to 31** | Preauth Query & Resolution | \`/preauth/submit\` / \`/communication/\` | Payer queries additional remarks/documents; provider answers (wf19/131) | ${fx("fixtures/reference/provider/preauth/queryupdate/")} |`
  );
  out.push(
    `| **32 to 34** | Preauth Standalone Procedure | \`/preauth/submit\` & \`on_submit\` | Single stand-alone medical or surgical package booking | ${fx("fixtures/reference/provider/preauth/request/")} |`
  );
  out.push(
    `| **35 to 37** | Preauth Cyclic Procedure | \`/preauth/submit\` & \`on_submit\` | Recurring cyclic treatments (e.g. hemodialysis, chemotherapy cycles) | ${fx("fixtures/collection/provider/preauth/")} |`
  );
  out.push(
    `| **38 to 40** | Preauth Unspecified Procedure | \`/preauth/submit\` & \`on_submit\` | Unspecified surgical package (\`SGU100\`) with surgical notes attached | ${fx("fixtures/reference/provider/preauth/request/")} |`
  );
  out.push(
    `| **41 to 43** | Enhancement: Length of Stay | \`/preauth/submit\` & \`on_submit\` | Increase in LOS (\`x-hcx-use_case: Enhancement\`), updated clinical justification | ${fx("fixtures/reference/provider/preauth/enhancement/")} |`
  );
  out.push(
    `| **44 to 46** | Enhancement: Additional Procedures | \`/preauth/submit\` & \`on_submit\` | Additional secondary procedures or STG questionnaire inclusion | ${fx("fixtures/reference/provider/preauth/enhancement/")} |`
  );
  out.push(
    `| **47 to 49** | Resubmission with STG | \`/preauth/submit\` & \`on_submit\` | Procedure modification/addition after rejection with STG questionnaire | ${fx("fixtures/reference/provider/preauth/request/")} |`
  );
  out.push(
    `| **50 to 52** | Resubmission without STG | \`/preauth/submit\` & \`on_submit\` | Procedure modification/addition after rejection without STG questionnaire | ${fx("fixtures/reference/provider/preauth/request/")} |`
  );
  out.push(
    `| **53 to 54** | Preauth Cancellation | \`/task/submit\` & \`on_submit\` | Cancellation \`Task\` (\`PC01\`/\`PC02\`) referencing original preauthorisation | ${fx("fixtures/reference/payer/task/cancelled/")} |`
  );
  out.push(
    `| **55 to 57** | Claim Cyclic Procedure | \`/claim/submit\` & \`on_submit\` | Claim submission for completed cyclic treatment cycle | ${fx("fixtures/collection/provider/claim/")} |`
  );
  out.push(
    `| **58 to 60** | Claim Live Discharge | \`/claim/submit\` & \`on_submit\` | Normal completed discharge to home (\`DTH\`). Final bills and summary | ${fx("fixtures/reference/provider/claim/request/")} |`
  );
  out.push(
    `| **61 to 63** | Claim Query & Resolution | \`/claim/submit\` / \`/communication/\` | Payer raises query on claim (wf27); provider submits answer (wf141/151) | ${fx("fixtures/reference/provider/claim/queryupdate/")} |`
  );
  out.push(
    `| **64 to 72** | Claim LAMA Scenarios | \`/claim/submit\` & \`on_submit\` | LAMA before surgery (\`LM100\` per diem), after surgery (package), during surgery (\`LM100\`) | ${fx("fixtures/reference/payer/claim/approved/")} |`
  );
  out.push(
    `| **73 to 81** | Claim DAMA Scenarios | \`/claim/submit\` & \`on_submit\` | DAMA before surgery (\`LM100\`), after surgery (package), during surgery (\`LM100\`) | ${fx("fixtures/reference/payer/claim/approved/")} |`
  );
  out.push(
    `| **82 to 90** | Claim Death Scenarios | \`/claim/submit\` & \`on_submit\` | Discharge to mortuary (\`DTM\`). Before, after, and during surgery | ${fx("fixtures/collection/provider/claim/")} |`
  );
  out.push(
    `| **91 to 93** | Claim Erroneous Request | \`/claim/submit\` & \`on_submit\` | Erroneous submission corrected with remaining balance and mandatory docs | ${fx("fixtures/reference/provider/claim/request/")} |`
  );
  out.push(
    `| **94 to 96** | Claim Reprocess / Dispute | \`/task/submit\` & \`on_submit\` | Reprocess \`Task\` (code 36) with appeal justification and mandatory docs | ${fx("fixtures/reference/provider/claim/reprocess/")} |`
  );
  out.push(
    `| **97 to 100**| Payment Notice & Settlement | \`/paymentnotice/request\` & \`on_request\` | Payment initiation (wf30), ack (wf17/31), cleared update, and final ack | ${fx("fixtures/reference/payer/payment/notice/")} |`
  );
  out.push("");
  out.push("## Testing Against the Dummy Payer");
  out.push("");
  out.push(
    "The sandbox hosts a payer that answers back, participant ID `1000003538@hcx`. It handles insurance plan, coverage eligibility, preauthorisation, claim, payment notice and communication. For the plan call use provider ID `32722` and policy `100217`."
  );
  out.push("");
  out.push("Two test hooks drive its decisions:");
  out.push(
    "- `dummyhcxpayer/process/request` makes it approve, reject or query a preauthorisation or claim you have submitted, by correlation ID."
  );
  out.push("- `dummyhcxpayer/paymentNotice/init` makes it send you a payment notice.");
  out.push("");
  out.push(
    "A query from the dummy payer arrives as a communication request, which you answer on `/v1/communication/on_request` before the final decision comes back on `on_submit`."
  );
  out.push("");
  out.push("---");
  out.push("");
  out.push("## Workflow Codes Cross-Reference");
  out.push("");
  out.push(
    `Endpoints alone do not identify a transaction. A new preauthorisation, a resubmission, an enhancement and a query response all travel on \`/v1/preauth/submit\` with the same bundle. The workflow code in the header is what tells them apart, and each code expects a particular status word. See [Workflow Codes](${relHref(USECASES_DOC_DIR, join(USECASES_DOC_DIR, "06-Workflow Codes.md"))}) for the complete state machines and code tables.`
  );
  out.push("");

  const targetFile = join(DOCS_DIR, "01-Overview", "05-NHCX Use Cases.md");
  writeFileSync(targetFile, out.join("\n"), "utf8");
  console.log(`Generated: ${targetFile}`);
}

// -----------------------------------------------------------------------------
// 2. Build Workflow Codes Document
// -----------------------------------------------------------------------------
function buildWorkflowsDoc(wfData) {
  const out = [];
  out.push("# Workflow Codes");
  out.push("");
  out.push(
    "Endpoints alone do not identify an NHCX transaction. A new preauthorisation, a resubmission, an enhancement and a query response all travel on `/v1/preauth/submit` carrying the same bundle. What separates them is the workflow code in the `x-hcx-workflow_id` header. Each code also expects a particular status word, given here beside it. The source is the official Workflow Status Sheet on the portal, updated 18 August 2026, which remains the authority as codes are added."
  );
  out.push("");
  out.push(
    "The A-series registry and session calls carry no workflow code because they are infrastructure calls rather than claim transactions."
  );
  out.push("");
  out.push("## Workflow Code Prefix Families");
  out.push("");
  out.push(
    "NHA organizes workflow codes into numeric mainline cashless codes and alphanumeric families:"
  );
  out.push("");
  out.push("| Prefix | Family Name | Scope & Operational Coverage |");
  out.push("| :---: | :--- | :--- |");
  for (const fam of wfData.families || []) {
    out.push(
      `| **\`${fam.prefix || ""}\`** | **${escapePipe(fam.name || "")}** | ${escapePipe(fam.covers || "")} |`
    );
  }
  out.push("");
  out.push("---");
  out.push("");
  out.push("## Mainline Cashless State Machines");
  out.push("");
  out.push(
    "In the diagrams below, each arrow carries the workflow code of the message that moves the case."
  );
  out.push("");
  out.push("### Preauthorisation Lifecycle");
  out.push("");
  out.push("```mermaid");
  out.push("stateDiagram-v2");
  out.push("  [*] --> Requested: 12");
  out.push("  Requested --> Received: 20");
  out.push("  Received --> Approved: 21");
  out.push("  Received --> Rejected: 23");
  out.push("  Received --> Queried: 24");
  out.push("  Queried --> QueryAnswered: 19");
  out.push("  QueryAnswered --> Received");
  out.push("  Rejected --> Resubmitted: 121");
  out.push("  Resubmitted --> Received: 251");
  out.push("  Approved --> EnhancementAsked: 13");
  out.push("  EnhancementAsked --> Approved: 22");
  out.push("  EnhancementAsked --> EnhancementDenied: 231");
  out.push("  EnhancementAsked --> EnhancementQueried: 241");
  out.push("  EnhancementQueried --> EnhancementAnswered: 131");
  out.push("  EnhancementAnswered --> Approved: 22");
  out.push("  EnhancementAnswered --> EnhancementDenied: 231");
  out.push("  Received --> CancelAsked: PC01");
  out.push("  Approved --> CancelAsked: PC01");
  out.push("  CancelAsked --> Cancelled: PC02");
  out.push("  Approved --> [*]");
  out.push("```");
  out.push("");
  out.push("### Claim Lifecycle");
  out.push("");
  out.push("```mermaid");
  out.push("stateDiagram-v2");
  out.push("  [*] --> Submitted: 15");
  out.push("  Submitted --> Received: 25");
  out.push("  Received --> InProcess: 28");
  out.push("  InProcess --> Forwarded: 29");
  out.push("  Forwarded --> InProcess");
  out.push("  InProcess --> Queried: 27");
  out.push("  Queried --> QueryAnswered: 151");
  out.push("  QueryAnswered --> InProcess");
  out.push("  InProcess --> Approved: 26");
  out.push("  InProcess --> Denied: 291");
  out.push("  Denied --> ArbitrationAsked: 36");
  out.push("  ArbitrationAsked --> ArbitrationAcknowledged: 37");
  out.push("  ArbitrationAcknowledged --> ReprocessApproved: 252");
  out.push("  ArbitrationAcknowledged --> ReprocessRejected: 253");
  out.push("  ArbitrationAcknowledged --> ReprocessQueried: 254");
  out.push("  ReprocessQueried --> ArbitrationAcknowledged");
  out.push("  Approved --> [*]");
  out.push("```");
  out.push("");
  out.push("### Payment & Settlement Lifecycle");
  out.push("");
  out.push("```mermaid");
  out.push("stateDiagram-v2");
  out.push("  [*] --> Initiated: 30");
  out.push("  Initiated --> Processed: 31");
  out.push("  Processed --> Settled: 33, UTR available");
  out.push("  Settled --> Acknowledged: 17, sent by the provider");
  out.push("  Acknowledged --> [*]");
  out.push("```");
  out.push("");
  out.push("---");
  out.push("");
  out.push("## Master Catalog of All 74 Workflow Codes");
  out.push("");
  out.push(
    "Complete index of all published codes:"
  );
  out.push("");
  out.push(
    "| Code | Meaning / Name | Sent By | Permitted Statuses | Stages / Outcomes | Reused |"
  );
  out.push(
    "| :--- | :--- | :--- | :--- | :--- | :---: |"
  );

  for (const c of wfData.codes || []) {
    const codeStr = String(c.code ?? "");
    const name = c.name || "";
    // Codes known only from the Workflow Status Sheet have no author; leave the cell empty.
    const rawAuthor = /status sheet only/i.test(c.authored_by || "") ? "" : c.authored_by || "";
    const author = rawAuthor.charAt(0).toUpperCase() + rawAuthor.slice(1);
    const statuses = (c.statuses || []).map((s) => `\`${s}\``).join(", ");
    const stages = (c.stages || []).join(", ");
    const reused = c.reused ? "Yes" : "No";
    out.push(
      `| **\`${codeStr}\`** | ${escapePipe(name)} | ${author} | ${statuses} | ${escapePipe(stages)} | ${reused} |`
    );
  }

  out.push("");
  out.push("---");
  out.push("");
  out.push("## Reconciled Discrepancies and Authority Rules");
  out.push("");
  // The handbook-versus-sheet disagreements are data (workflow.yaml
  // `disagreements`), so the count and the rows follow the file.
  const disagreements = wfData.disagreements || [];
  const COUNT_WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
  const countWord = (n) => COUNT_WORDS[n] ?? String(n);
  out.push(
    `${countWord(disagreements.length)} ${disagreements.length === 1 ? "code is" : "codes are"} published differently in the PMJAY Handbook and the Workflow Status Sheet, resolved here by taking the Workflow Status Sheet as the definitive authority:`
  );
  out.push("");
  out.push("| Code | PMJAY Handbook | Workflow Status Sheet |");
  out.push("| :--- | :--- | :--- |");
  for (const d of disagreements) {
    out.push(`| **\`${escapePipe(String(d.code ?? ""))}\`** | ${escapePipe(d.handbook || "")} | ${escapePipe(d.sheet || "")} |`);
  }
  out.push("");
  out.push(
    "The same authority settles these conflicts across official NHA publications (Workflow Status Sheet vs PMJAY Handbook vs Value Sets):"
  );
  out.push("");
  out.push(
    "1. **251**: Reconciled as Preauthorisation Resubmission acknowledgement in the sheet; the PMJAY handbook uses it in its claim reprocess section."
  );
  out.push(
    "2. **Cancellation (PC01 vs 122)**: The sheet and handbook code table prescribe `PC01` (request) and `PC02` (completion). The handbook prose mentions `122`, which clashes with `R122` (reimbursement claim reprocess). Integrators should strictly use `PC01` and `PC02` on `/v1/task/submit`."
  );
  out.push(
    "3. **18**: Defined as Preauthorisation Query Acknowledgement in the sheet; the handbook repurposes it for claim reprocess."
  );
  out.push(
    "4. **Reprocess (36 vs 18)**: Section 11 gives `18` for reprocess, while Section 12 gives `36` (Claim Arbitration). Integrators should use `36` with task code `reprocess` and reason `claimrejected`."
  );
  out.push(
    "5. **Shortfall**: Rides on `36` as a Task with code `reprocess` and reason `partialpayment`, raised only after payment notice `33` has arrived and been acknowledged with `17`."
  );
  out.push(
    "6. **25 and 291**: Named as Claim *Document* acknowledgement and denial in the sheet, and Claim request received and denied in the value sets. Both refer to the same transition."
  );
  out.push("");
  out.push("### Protocol Fault Flags");
  out.push("");
  out.push(
    "The source sheet's audit flags mark certain code-and-status pairs as protocol errors rather than normal traffic:"
  );
  out.push(
    "- For `131`, `45`, `47`, and `30`, sending **either** `response.partial` or `response.error` is flagged as an invalid state transition."
  );
  out.push("- `18` sent with `response.error` is flagged as an invalid terminal state.");
  out.push(
    "- Query `27` sent as `response.partial` or `response.complete` is invalid (must be `request.initiated`)."
  );
  out.push("");

  const targetFile = join(DOCS_DIR, "01-Overview", "06-Workflow Codes.md");
  writeFileSync(targetFile, out.join("\n"), "utf8");
  console.log(`Generated: ${targetFile}`);
}

// -----------------------------------------------------------------------------
// 4. FHIR Reference chapters: one generated section per chapter, use case wise
// -----------------------------------------------------------------------------

const FHIR_REFERENCE_DIR = join(DOCS_DIR, "05-FHIR Reference");

// Which existing chapter documents which use cases. A use case not listed here
// gets its data elements inline in 01-Overview/05-NHCX Use Cases.md instead.
// Filled from the use_cases of each chapter in package/fhir/reference.yaml.
let FHIR_CHAPTERS = [];
const CHAPTER_OF = new Map();

const BLOCK_START = "<!-- build-docs:start -->";
const BLOCK_END = "<!-- build-docs:end -->";

// Everything the builders share, filled in by main().
let CTX = null;

/** The href from a chapter in fromDir to absPath: relative, with / separators, URI-encoded. */
function relHref(fromDir, absPath) {
  return encodeURI(relative(fromDir, absPath).split(sep).join("/"));
}

/**
 * A link from a chapter in fromDir to a file inside package/, relative to the
 * chapter so it holds inside the release zip. A file outside package/ is not in
 * the release: its path is shown as inline code, with no link.
 */
function fileLink(label, absPath, fromDir, anchor = "") {
  const inPackage = relative(PACKAGE_DIR, absPath);
  if (!inPackage || inPackage.startsWith("..") || isAbsolute(inPackage)) return `\`${label}\``;
  return `[\`${label}\`](${relHref(fromDir, absPath)}${anchor})`;
}

/** A path under the workspace root, such as fixtures/..., labelled with that path. */
function workspaceRef(path, fromDir) {
  return fileLink(path, join(WORKSPACE_DIR, path), fromDir);
}

function slugify(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9 -]/g, "").trim().replace(/\s+/g, "-");
}

function ucHeading(uc) {
  return `${uc.code} ${uc.title} (${uc.side})`;
}

/** Link from a chapter in fromDir to the FHIR Reference section for a use case, or "" if it has none. */
function chapterRefLink(code, fromDir) {
  const file = CHAPTER_OF.get(code);
  const uc = CTX.ucByCode.get(code);
  if (!file || !uc) return "";
  // The chapter by its name, not its number.
  const label = file.replace(/\.md$/, "").replace(/^\d\d-/, "");
  return `[${label}, ${code}](${relHref(fromDir, join(FHIR_REFERENCE_DIR, file))}#${slugify(ucHeading(uc))})`;
}

function bruLink(req, fromDir) {
  return fileLink(`apis/${req.dir}/${req.file.split("/").pop()}`, req.file, fromDir);
}

/**
 * The request a use case shows: the one it names under request: in
 * usecases.yaml (<folder>/<file>.bru), else the first whose path matches its API.
 */
function requestFor(uc) {
  if (uc.request) {
    const named = CTX.requestByRef.get(uc.request);
    if (named) return named;
    console.warn(`  ${uc.code}: request "${uc.request}" is not in apis/; showing the first request on ${uc.api}`);
  }
  return requestsForPath(uc.api)[0];
}

/** Bruno requests whose url path equals the API path (the /internal twins are left out). */
function requestsForPath(api) {
  if (!api || !api.startsWith("/")) return [];
  const want = api.toLowerCase();
  return CTX.requests.filter((r) => r.url.replace(/^\{\{[^}]+\}\}/, "").toLowerCase() === want);
}

/** Workflow codes named in free text, resolved against workflow.yaml. */
function workflowCodesIn(...texts) {
  const found = new Map();
  for (const text of texts) {
    if (!text) continue;
    for (const token of String(text).match(/\b(?:[A-Z]{1,2}\d{1,3}|\d{2,3})\b/g) || []) {
      const wf = CTX.wfByCode.get(token);
      if (wf && !found.has(token)) found.set(token, wf);
    }
  }
  return [...found.values()];
}

function dataElementTable(mapping) {
  const out = [];
  out.push("**Data elements**");
  out.push("");
  out.push("| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |");
  out.push("| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |");
  for (const f of mapping.fields || []) {
    const notes = [];
    if (f.code_system) notes.push(`code system \`${f.code_system}\``);
    for (const at of f.also_at || []) notes.push(`also at \`${at}\``);
    const example = f.example_value === undefined || f.example_value === null ? "" : `\`${escapePipe(f.example_value)}\``;
    out.push(
      `| \`${f.key}\` | ${escapePipe(f.label)} | ${escapePipe(f.group)} | \`${f.data_type}\` | \`${f.cardinality}\` | \`${escapePipe(f.fhir_path)}\` | ${example} | ${notes.join("; ")} |`
    );
  }
  out.push("");
  // The NRCeS profile of every resource the mapping names.
  const types = [mapping.focal_resource, ...(mapping.fields || []).map((f) => f.fhir_resource)]
    .map((t) => String(t || "").match(/^[A-Z][A-Za-z]+/)?.[0])
    .filter(Boolean);
  const links = CTX.reference ? CTX.reference.profileLinks(types) : [];
  if (links.length) out.push(`NRCeS profiles: ${links.join(", ")}.`, "");
  return out;
}

function renderUseCase(uc) {
  const mapping = CTX.mappings.get(uc.code) || null;
  const out = [];
  out.push(`### ${ucHeading(uc)}`);
  out.push("");
  if (uc.what_it_does) {
    out.push(uc.what_it_does);
    out.push("");
  }

  const req = requestFor(uc);
  const cb = uc.callback ? requestsForPath(uc.callback)[0] : null;
  const rows = [];
  rows.push(["API", `\`${uc.api}\`${req ? ` ${bruLink(req, FHIR_REFERENCE_DIR)}` : ""}`]);
  if (uc.callback) rows.push(["Callback", `\`${uc.callback}\`${cb ? ` ${bruLink(cb, FHIR_REFERENCE_DIR)}` : ""}`]);
  const wfText = uc.workflow || (mapping && mapping.workflow);
  if (wfText && !/^none$/i.test(wfText)) rows.push(["Workflow", escapePipe(wfText)]);
  rows.push(["Carries JWE", uc.carries_jwe ? "yes" : "no"]);
  if (mapping && mapping.focal_resource) rows.push(["Focal resource", `\`${mapping.focal_resource}\``]);
  if (uc.console_page) rows.push(["Simulator console", `\`${uc.console_page}\``]);
  out.push("| | |");
  out.push("| :-- | :-- |");
  for (const [k, v] of rows) out.push(`| **${k}** | ${v} |`);
  out.push("");

  // A use case that shares its request with another step (a resubmission, a
  // query answer, a cancel) names its own header values under request_headers.
  const headers = { ...(req ? req.headers : {}), ...(uc.request_headers || {}) };
  if (req && Object.keys(headers).length) {
    out.push("**Request headers**");
    out.push("");
    out.push("| Header | Example value |");
    out.push("| :-- | :-- |");
    for (const [k, v] of Object.entries(headers)) out.push(`| \`${k}\` | \`${escapePipe(v)}\` |`);
    out.push("");
  }

  const codes = workflowCodesIn(uc.workflow, mapping && mapping.workflow);
  if (codes.length) {
    out.push("**Workflow codes**");
    out.push("");
    out.push("| Code | Name | Authored by | `x-hcx-status` | Means |");
    out.push("| :-- | :-- | :-- | :-- | :-- |");
    for (const wf of codes) {
      out.push(
        `| \`${wf.code}\` | ${escapePipe(wf.name)} | ${escapePipe(wf.authored_by || "")} | ${(wf.statuses || []).map((s) => `\`${s}\``).join(", ")} | ${escapePipe(wf.means || "")} |`
      );
    }
    out.push("");
  }

  if (mapping && mapping.fields && mapping.fields.length) out.push(...dataElementTable(mapping));
  return out;
}

function renderChapterBlock(codes) {
  const out = [];
  out.push(BLOCK_START);
  out.push("## Use cases, APIs and data elements");
  out.push("");
  for (const code of codes) {
    const uc = CTX.ucByCode.get(code);
    if (!uc) {
      console.warn(`  (skipped ${code}: not in usecases.yaml)`);
      continue;
    }
    out.push(...renderUseCase(uc));
  }
  while (out[out.length - 1] === "") out.pop();
  out.push(BLOCK_END);
  return out.join("\n");
}

/** Replace the marked section of a chapter, or add it at the end. */
function injectBlock(file, block) {
  let text = readFileSync(file, "utf8");
  const s = text.indexOf(BLOCK_START);
  const e = s === -1 ? -1 : text.indexOf(BLOCK_END, s);
  if (s !== -1 && e !== -1 && e > s) {
    text = text.slice(0, s) + block + text.slice(e + BLOCK_END.length);
  } else {
    const at = text.lastIndexOf("\n*Sources:");
    if (at !== -1) {
      text = `${text.slice(0, at).replace(/\s+$/, "")}\n\n${block}\n\n${text.slice(at + 1)}`;
    } else {
      text = `${text.replace(/\s+$/, "")}\n\n${block}\n`;
    }
  }
  writeFileSync(file, text, "utf8");
}

function buildFhirChapters() {
  for (const ch of CTX.reference.chapters) {
    const target = join(FHIR_REFERENCE_DIR, ch.file);
    writeFileSync(target, CTX.reference.render(ch), "utf8");
    console.log(`Generated: ${target}`);
  }
}

// -----------------------------------------------------------------------------
// 5. API blocks: every curl in the docs is rendered from a Bruno request
// -----------------------------------------------------------------------------
//
// A chapter marks where a request goes:
//
//   <!-- build-docs:api 01-session/session-token.bru -->
//   <!-- build-docs:end -->
//
// and the builder fills the space between with a curl rendered from that file,
// hosts resolved from the sandbox environment and unset variables shown as
// <placeholders>. The markers stay, so the next build replaces the same block.

const API_MARKER = /<!-- build-docs:api ([^\s]+) -->[\s\S]*?<!-- build-docs:end -->/g;

function placeholderFor(name) {
  if (name === "token") return "<access token>";
  if (name === "$guid") return "<uuid>";
  if (name === "$isoTimestamp") return "<iso timestamp>";
  if (name === "$timestamp") return "<unix timestamp>";
  const words = name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
  return `<${words}>`;
}

/** Fill {{vars}} from the sandbox environment; anything unset becomes a placeholder. */
function fillVars(text) {
  return String(text).replace(/\{\{\s*([\w$-]+)\s*\}\}/g, (whole, name) => {
    const value = CTX.env[name];
    return value !== undefined && String(value).trim() !== "" ? value : placeholderFor(name);
  });
}

function shellQuote(text) {
  return `'${String(text).replace(/'/g, `'\\''`)}'`;
}

function renderCurl(req) {
  const lines = [];
  let url = fillVars(req.url);
  const query = Object.entries(req.query || {}).map(([k, v]) => `${k}=${fillVars(v)}`);
  if (query.length) url += `?${query.join("&")}`;
  lines.push(`curl --location --request ${req.method} ${shellQuote(url)}`);

  // Bruno sends the collection's headers with every request that inherits its
  // auth; a request with auth: none is on its own and carries only its own headers.
  const headers = req.auth === "none" ? { ...req.headers } : { ...CTX.collectionHeaders, ...req.headers };
  for (const [k, v] of Object.entries(headers)) lines.push(`  --header ${shellQuote(`${k}: ${fillVars(v)}`)}`);

  if (req.body && req.body.trim()) {
    let body = fillVars(req.body).trim();
    try {
      body = JSON.stringify(JSON.parse(body), null, 2);
    } catch {
      // not strict JSON, keep it as written
    }
    const indented = body.split("\n").map((l, i) => (i === 0 ? l : `  ${l}`)).join("\n");
    lines.push(`  --data-raw ${shellQuote(indented)}`);
  }
  return `${lines.join(" \\\n")}`;
}

function walkMarkdown(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walkMarkdown(p));
    else if (name.endsWith(".md")) out.push(p);
  }
  return out;
}

function buildApiBlocks() {
  let blocks = 0;
  for (const file of walkMarkdown(DOCS_DIR)) {
    const text = readFileSync(file, "utf8");
    if (!text.includes("<!-- build-docs:api ")) continue;
    const next = text.replace(API_MARKER, (whole, ref) => {
      const req = CTX.requestByRef.get(ref);
      if (!req) {
        console.warn(`  Unknown request "${ref}" in ${file}; block left as it was`);
        return whole;
      }
      blocks += 1;
      return `<!-- build-docs:api ${ref} -->\n\`\`\`bash\n${renderCurl(req)}\n\`\`\`\n<!-- build-docs:end -->`;
    });
    if (next !== text) writeFileSync(file, next, "utf8");
  }
  console.log(`Rendered ${blocks} API blocks from apis/`);
}

/** Paths quoted in the docs that no Bruno request serves. Warnings only. */
function checkDocumentedPaths() {
  const known = new Set(CTX.requests.map((r) => requestPath(r.url)));
  const seen = new Map();
  for (const file of walkMarkdown(DOCS_DIR)) {
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(/`((?:\/(?:v1|v2|V2|internal)\/|\/fetch\/|\/participant\/|\/product\/|\/update\/|\/get\/)[A-Za-z0-9_/.-]+)`/g)) {
      const path = m[1].toLowerCase().replace(/\/$/, "");
      if (!known.has(path)) seen.set(path, (seen.get(path) || new Set()).add(file.slice(DOCS_DIR.length + 1)));
    }
  }
  if (!seen.size) return;
  console.warn(`Paths quoted in docs with no request in apis/ (${seen.size}):`);
  for (const [path, files] of [...seen].sort()) console.warn(`  ${path}  <- ${[...files].join(", ")}`);
}

function requestPath(url) {
  return String(url).replace(/^\{\{[^}]+\}\}/, "").toLowerCase().replace(/\?.*$/, "");
}

// -----------------------------------------------------------------------------
// 6. Error code tables, from nhcx-error.yaml
// -----------------------------------------------------------------------------
//
//   <!-- build-docs:errors spaces -->        the code spaces with counts
//   <!-- build-docs:errors collisions -->    PAYR-10xx codes the two payer sheets read differently
//   <!-- build-docs:errors bands -->         reference payer bands with counts
//   <!-- build-docs:errors gateway -->       NHCX- codes
//   <!-- build-docs:errors standard -->      standard payer codes
//   <!-- build-docs:errors reference:12 -->  reference payer PAYR-12xx; "14+" means 1400 and above

const ERRORS_MARKER = /<!-- build-docs:errors ([^\s]+) -->[\s\S]*?<!-- build-docs:end -->/g;

function errorNumber(code) {
  return Number(String(code).split("-")[1]);
}

function renderErrorsTable(key) {
  const d = CTX.errors;
  const codes = d.codes || [];
  const inSpace = (id) => codes.filter((c) => c.space === id);
  const codeRows = (list) => [
    "| Code | Message |",
    "| :---- | :---- |",
    ...list.map((c) => `| \`${c.code}\` | ${escapePipe(c.message)} |`),
  ];
  const bandCount = (band) => {
    if (band.startsWith("NHCX")) return inSpace("gateway").length;
    const n = Number(band.replace(/\D/g, "").slice(0, 2));
    const top = band === "PAYR-14xx";
    return inSpace("reference-payer").filter((c) => (top ? errorNumber(c.code) >= n * 100 : Math.floor(errorNumber(c.code) / 100) === n)).length;
  };
  if (key === "spaces") {
    return [
      "| Space | Prefix | Count | Who sends it | Where it arrives |",
      "| :---- | :---- | :---- | :---- | :---- |",
      ...(d.spaces || []).map((s) => `| ${s.name} | \`${s.prefix}\` | ${inSpace(s.id).length} | ${escapePipe(s.sent_by)} | ${escapePipe(s.arrives).replace(/(\/v1\/error)/, "`$1`")} |`),
    ];
  }
  if (key === "collisions") {
    return [
      "| Code | Standard sheet says | Reference payer says |",
      "| :---- | :---- | :---- |",
      ...(d.collisions || []).map((c) => `| \`${c.code}\` | ${escapePipe(c.standard_payer)} | ${escapePipe(c.reference_payer)} |`),
    ];
  }
  if (key === "bands") {
    return [
      "| Band | Codes | What rejected it | What it means for you |",
      "| :---- | :---- | :---- | :---- |",
      ...(d.bands || []).map((b) => `| \`${b.band}\` | ${bandCount(b.band)} | ${escapePipe(b.rejected_by)} | ${escapePipe(b.means)} |`),
    ];
  }
  if (key === "gateway") return codeRows(inSpace("gateway"));
  if (key === "standard") return codeRows(inSpace("standard-payer"));
  if (key.startsWith("reference:")) {
    const spec = key.slice("reference:".length);
    const n = parseInt(spec, 10);
    const plus = spec.endsWith("+");
    return codeRows(inSpace("reference-payer").filter((c) => (plus ? errorNumber(c.code) >= n * 100 : Math.floor(errorNumber(c.code) / 100) === n)));
  }
  return null;
}

function buildErrorBlocks() {
  let blocks = 0;
  for (const file of walkMarkdown(DOCS_DIR)) {
    const text = readFileSync(file, "utf8");
    if (!text.includes("<!-- build-docs:errors ")) continue;
    const next = text.replace(ERRORS_MARKER, (whole, key) => {
      const rows = renderErrorsTable(key);
      if (!rows) {
        console.warn(`  Unknown errors table "${key}" in ${file}; block left as it was`);
        return whole;
      }
      blocks += 1;
      return `<!-- build-docs:errors ${key} -->\n${rows.join("\n")}\n<!-- build-docs:end -->`;
    });
    if (next !== text) writeFileSync(file, next, "utf8");
  }
  console.log(`Rendered ${blocks} error tables from nhcx-error.yaml`);
}

// -----------------------------------------------------------------------------
// Base URL tables, from baseurl.yaml
// -----------------------------------------------------------------------------
// A chapter marks the spot with <!-- build-docs:baseurls --> ... <!-- build-docs:end -->.

const BASEURLS_MARKER = /<!-- build-docs:baseurls -->[\s\S]*?<!-- build-docs:end -->/g;

function renderBaseUrls() {
  const { environments = {}, services = [] } = CTX.baseUrls;
  const cell = (url, note) => (url ? `\`${url}\`${note ? `. ${escapePipe(note)}` : ""}` : escapePipe(note || "Not published"));
  // The bases first, where the eye lands; what each service is for after, so
  // the table stays three columns wide and nothing scrolls out of view.
  const rows = [
    "| Service | Sandbox | Production |",
    "| :---- | :---- | :---- |",
    ...services.map((s) => `| ${escapePipe(s.name)} | ${cell(s.sandbox)} | ${cell(s.production, s.production_note)} |`),
    "",
    "What each one serves:",
    "",
    ...services.map((s) => `- **${s.name}**: ${String(s.used_for || "").replace(/\.$/, "")}.`),
  ];
  const sbx = environments.sandbox?.cm_id;
  const prod = environments.production?.cm_id;
  if (sbx && prod) rows.push("", `The ABDM gateway also reads \`X-CM-ID\` on the session call: \`${sbx}\` in the sandbox, \`${prod}\` in production.`);
  return rows.join("\n");
}

function buildBaseUrlBlocks() {
  // baseurl.yaml and the collection's sandbox environment must agree, and every
  // variable a request starts from must be a listed service.
  const services = CTX.baseUrls.services || [];
  for (const s of services) {
    if (!s.variable) continue;
    const value = CTX.env[s.variable];
    if (!value) console.warn(`  baseurl.yaml: ${s.id} names ${s.variable}, which the sandbox environment does not set`);
    else if (value !== s.sandbox && !value.startsWith(`${s.sandbox}/`)) console.warn(`  baseurl.yaml: ${s.id} sandbox ${s.sandbox} does not match ${s.variable} = ${value}`);
  }
  const listed = new Set(services.map((s) => s.variable).filter(Boolean));
  const unlisted = new Set(CTX.requests.map((r) => String(r.url || "").match(/^\{\{(\w+)\}\}/)?.[1]).filter((v) => v && !listed.has(v)));
  for (const v of unlisted) console.warn(`  baseurl.yaml has no service for {{${v}}}`);

  const table = renderBaseUrls();
  let blocks = 0;
  for (const file of walkMarkdown(DOCS_DIR)) {
    const text = readFileSync(file, "utf8");
    if (!text.includes("<!-- build-docs:baseurls -->")) continue;
    const next = text.replace(BASEURLS_MARKER, () => {
      blocks += 1;
      return `<!-- build-docs:baseurls -->\n${table}\n<!-- build-docs:end -->`;
    });
    if (next !== text) writeFileSync(file, next, "utf8");
  }
  console.log(`Rendered ${blocks} base URL tables from baseurl.yaml`);
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------
function main() {
  console.log("Building NHCX documentation from package sources...");
  const ucData = YAML.parse(readFileSync(USECASES_FILE, "utf8"));
  const wfData = YAML.parse(readFileSync(WORKFLOW_FILE, "utf8"));
  const fiData = YAML.parse(readFileSync(FHIR_INDEX_FILE, "utf8"));
  const errors = YAML.parse(readFileSync(ERRORS_FILE, "utf8"));
  const baseUrls = YAML.parse(readFileSync(BASEURL_FILE, "utf8"));

  const collection = readCollection(APIS_DIR);
  const requests = collection.folders.flatMap((f) => f.requests.map((r) => ({ ...r, dir: f.dir })));
  const requestByRef = new Map(requests.map((r) => [`${r.dir}/${r.file.split("/").pop()}`, r]));
  const env = (collection.environments.find((e) => e.name === "sandbox") || collection.environments[0] || { vars: {} }).vars;
  const collectionHeaders = parseBru(readFileSync(join(APIS_DIR, "collection.bru"), "utf8")).headers || {};

  const ucByCode = new Map((ucData.nha_use_cases || []).map((uc) => [uc.code, uc]));
  const wfByCode = new Map((wfData.codes || []).map((wf) => [String(wf.code), wf]));
  const mappings = new Map();
  for (const code of ucByCode.keys()) {
    const file = join(MAPPINGS_DIR, `${code}.yaml`);
    if (existsSync(file)) mappings.set(code, YAML.parse(readFileSync(file, "utf8")));
  }
  CTX = { ucData, wfData, fiData, errors, requests, requestByRef, env, collectionHeaders, ucByCode, wfByCode, mappings, baseUrls };
  const refSpec = YAML.parse(readFileSync(REFERENCE_FILE, "utf8"));
  FHIR_CHAPTERS = (refSpec.chapters || []).filter((c) => c.use_cases?.length).map((c) => [c.file, c.use_cases]);
  for (const [file, codes] of FHIR_CHAPTERS) for (const code of codes) CHAPTER_OF.set(code, file);
  CTX.reference = makeFhirReference({ fhirDir: FHIR_DIR, spec: refSpec, escapePipe, useCaseBlock: renderChapterBlock, chapterDir: FHIR_REFERENCE_DIR });

  buildUsecasesDoc(ucData);
  buildWorkflowsDoc(wfData);
  buildFhirChapters();
  buildApiBlocks();
  buildErrorBlocks();
  buildBaseUrlBlocks();
  checkDocumentedPaths();
  console.log("Done.");
}

main();
