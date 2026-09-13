#!/usr/bin/env node
/**
 * NHCX FHIR Bundle Validator CLI & Report Generator
 *
 * Validates all HL7 FHIR R4 bundles in package/fhir/ organized by use case against
 * NHCX / NRCeS structural rules, reference integrity, required data elements,
 * financial totals, timestamp formats, and profile declarations.
 *
 * Usage:
 *   node system/validate-bundles.mjs
 *   node system/validate-bundles.mjs --usecase B1
 *   node system/validate-bundles.mjs --report custom-reports/
 *   node system/validate-bundles.mjs --strict
 *   npm --prefix system run validate:bundles
 */

import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const FHIR_DIR = join(ROOT, "fhir");

// Parse CLI flags
const args = process.argv.slice(2);
let targetUseCase = null;
let reportDir = join(__dirname, "reports");
let strict = false;
let jsonOnly = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--usecase" || args[i] === "-u") {
    targetUseCase = args[++i].toUpperCase();
  } else if (args[i] === "--report" || args[i] === "-r") {
    reportDir = resolve(process.cwd(), args[++i]);
  } else if (args[i] === "--strict") {
    strict = true;
  } else if (args[i] === "--json") {
    jsonOnly = true;
  } else if (args[i] === "--help" || args[i] === "-h") {
    console.log(`
NHCX FHIR Bundle Validator CLI

Options:
  -u, --usecase <CODE>   Validate only bundles for a specific use case (e.g. B1, B3, C5)
  -r, --report <DIR>     Directory to write validation report (default: system/reports/)
      --strict           Fail (exit 1) if any warnings are encountered
      --json             Output raw JSON summary to stdout
  -h, --help             Show this help message
`);
    process.exit(0);
  }
}

// Expected focal resources by use case (allows alternative standard representations)
const FOCAL_MAP = {
  A5: ["Task"],
  B1: ["CoverageEligibilityRequest"],
  B2: ["Task"],
  B3: ["Claim", "Task"], // Task for cancellation
  B4: ["Task", "Communication", "CommunicationRequest"], // TaskBundle for communication
  B5: ["Claim", "Task"], // Task for release and reprocess
  B6: ["Task"],
  B7: ["PaymentReconciliation", "Task"], // Task paymentack or PaymentReconciliation
  B8: ["Task"],
  B9: ["Claim"],
  C3: ["CoverageEligibilityResponse"],
  C4: ["InsurancePlan"],
  C5: ["ClaimResponse"],
  C6: ["Task", "CommunicationRequest", "Communication"],
  C7: ["ClaimResponse"],
  C8: ["Task"],
  C9: ["PaymentReconciliation"],
  C10: ["Task"],
  C11: ["ClaimResponse"],
  D1: ["Task"],
  D3: ["CoverageEligibilityRequest"],
  D4: ["Claim"],
  D6: ["Claim"],
  D7: ["Claim"],
  D8: ["Task"],
  D9: ["Claim"],
  D10: ["Claim"],
  D11: ["Task"],
  D13: ["PaymentReconciliation", "Task"]
};

const RFC3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?([+-]\d{2}:?\d{2}|Z)$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const isObject = (v) => typeof v === "object" && v !== null && !Array.isArray(v);

function collectReferences(node, path, out) {
  if (Array.isArray(node)) {
    node.forEach((child, i) => collectReferences(child, `${path}[${i}]`, out));
    return;
  }
  if (!isObject(node)) return;
  for (const [key, value] of Object.entries(node)) {
    if (key === "reference" && typeof value === "string") {
      out.push({ path: `${path}.reference`, value, keyName: path.split(".").pop() });
    } else {
      collectReferences(value, `${path}.${key}`, out);
    }
  }
}

function moneyValue(node) {
  if (!isObject(node)) return null;
  const value = node.value;
  return typeof value === "number" ? value : null;
}

function checkClaim(claim, path, findings) {
  const require = (key, why) => {
    const value = claim[key];
    if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
      findings.push({ severity: "error", path: `${path}.${key}`, message: `Claim.${key} is required.`, fix: why });
    }
  };

  require("use", "Must be 'preauthorization', 'claim', or 'predetermination'.");
  require("status", "Must be active on submission.");
  require("patient", "A reference to the Patient entry.");
  require("provider", "The hospital Organization entry.");
  require("insurer", "The payer Organization entry.");
  require("insurance", "At least one insurance entry, one of them focal: true.");
  require("item", "The packages or line items being claimed.");
  require("total", "The total amount of the claim.");

  const insurance = claim.insurance;
  if (Array.isArray(insurance) && insurance.length > 0 && !insurance.some((i) => isObject(i) && i.focal === true)) {
    findings.push({
      severity: "error",
      path: `${path}.insurance`,
      message: "No insurance entry is marked focal.",
      fix: "Exactly one insurance[] entry must carry focal: true - it names the primary policy."
    });
  }

  const items = claim.item;
  const total = moneyValue(claim.total);
  if (Array.isArray(items) && total !== null) {
    const sum = items.reduce((acc, item) => acc + (isObject(item) ? (moneyValue(item.net) ?? 0) : 0), 0);
    if (Math.abs(sum - total) > 0.05) {
      findings.push({
        severity: "warning",
        path: `${path}.total`,
        message: `Claim.total (${total}) differs from sum of item nets (${sum}).`,
        fix: "Check line item tariff rates and verify item nets add up to total."
      });
    }
  }

  if (Array.isArray(items)) {
    const diagnosisCount = Array.isArray(claim.diagnosis) ? claim.diagnosis.length : 0;
    items.forEach((item, i) => {
      if (!isObject(item)) return;
      const seq = item.diagnosisSequence;
      if (Array.isArray(seq)) {
        for (const s of seq) {
          if (typeof s === "number" && (s < 1 || s > diagnosisCount)) {
            findings.push({
              severity: "error",
              path: `${path}.item[${i}].diagnosisSequence`,
              message: `diagnosisSequence ${s} has no matching Claim.diagnosis entry.`,
              fix: "The sequences are 1-based integer indices into Claim.diagnosis, not codes."
            });
          }
        }
      }
      if (item.productOrService === undefined) {
        findings.push({
          severity: "error",
          path: `${path}.item[${i}].productOrService`,
          message: "Every claim item requires productOrService.",
          fix: "Supply package or procedure code from package master."
        });
      }
    });
  }
}

function checkEligibilityRequest(req, path, findings, isResponseEcho = false) {
  const purpose = req.purpose;
  if (!Array.isArray(purpose) || purpose.length === 0) {
    findings.push({
      severity: "error",
      path: `${path}.purpose`,
      message: "CoverageEligibilityRequest.purpose is required.",
      fix: "Must be one of: discovery, validation, auth-requirements, benefits."
    });
  }
  const requiredKeys = isResponseEcho ? ["patient", "insurer", "created"] : ["patient", "insurer", "provider", "created"];
  for (const key of requiredKeys) {
    if (req[key] === undefined) {
      findings.push({ severity: "error", path: `${path}.${key}`, message: `CoverageEligibilityRequest.${key} is required.` });
    }
  }
}

function checkEligibilityResponse(resp, path, findings) {
  if (!resp.outcome) {
    findings.push({ severity: "error", path: `${path}.outcome`, message: "CoverageEligibilityResponse.outcome is required." });
  }
  for (const key of ["patient", "insurer", "created"]) {
    if (resp[key] === undefined) {
      findings.push({ severity: "warning", path: `${path}.${key}`, message: `CoverageEligibilityResponse.${key} should be present.` });
    }
  }
}

function checkClaimResponse(cr, path, findings) {
  if (!cr.outcome) {
    findings.push({ severity: "error", path: `${path}.outcome`, message: "ClaimResponse.outcome is required." });
  }
  if (!cr.use) {
    findings.push({ severity: "warning", path: `${path}.use`, message: "ClaimResponse.use should be present." });
  }
}

function checkTask(task, path, findings) {
  for (const key of ["status", "intent", "code"]) {
    if (task[key] === undefined) {
      findings.push({ severity: "error", path: `${path}.${key}`, message: `Task.${key} is required.` });
    }
  }
  const asks = Array.isArray(task.input) && task.input.length > 0;
  const reports = Array.isArray(task.output) && task.output.length > 0;
  if (!asks && !reports) {
    findings.push({
      severity: "warning",
      path: `${path}.input`,
      message: "Task carries neither input nor output.",
      fix: "Task should carry inputs (case reference) or outputs (ClaimResponse reference)."
    });
  }
}

function checkPaymentReconciliation(pr, path, findings) {
  if (!pr.status) {
    findings.push({ severity: "error", path: `${path}.status`, message: "PaymentReconciliation.status is required." });
  }
  if (!pr.paymentAmount) {
    findings.push({ severity: "warning", path: `${path}.paymentAmount`, message: "PaymentReconciliation.paymentAmount is recommended." });
  }
}

function validateBundle(bundle, expectedFocals) {
  const findings = [];

  if (!isObject(bundle)) {
    return [{ severity: "error", path: "", message: "Not a valid JSON object." }];
  }
  if (bundle.resourceType !== "Bundle") {
    findings.push({
      severity: "error",
      path: "resourceType",
      message: `Expected resourceType "Bundle", found "${bundle.resourceType}".`
    });
  }
  if (bundle.type !== "collection" && bundle.type !== "document") {
    findings.push({
      severity: "warning",
      path: "type",
      message: `Bundle.type is "${bundle.type}". NHCX message bundles typically use "collection".`
    });
  }
  if (typeof bundle.timestamp !== "string" || !RFC3339.test(bundle.timestamp)) {
    findings.push({
      severity: "warning",
      path: "timestamp",
      message: "Bundle.timestamp is missing or not RFC 3339 format."
    });
  } else if (!bundle.timestamp.includes("+05:30")) {
    findings.push({
      severity: "info",
      path: "timestamp",
      message: `Timestamp does not use +05:30 Indian Standard Time offset (${bundle.timestamp}).`
    });
  }

  const entries = bundle.entry;
  if (!Array.isArray(entries) || entries.length === 0) {
    findings.push({ severity: "error", path: "entry", message: "Bundle has no entries." });
    return findings;
  }

  const isResponseBundle = entries.some(e => e.resource?.resourceType?.endsWith("Response"));

  const addressable = new Set();
  entries.forEach((entry) => {
    if (isObject(entry)) {
      if (typeof entry.fullUrl === "string") {
        addressable.add(entry.fullUrl);
        if (entry.fullUrl.startsWith("urn:uuid:")) addressable.add(entry.fullUrl.replace("urn:uuid:", ""));
      }
      if (isObject(entry.resource) && typeof entry.resource.id === "string") {
        addressable.add(entry.resource.id);
        addressable.add(`${entry.resource.resourceType}/${entry.resource.id}`);
      }
    }
  });

  entries.forEach((entry, i) => {
    const path = `entry[${i}]`;
    if (!isObject(entry)) {
      findings.push({ severity: "error", path, message: "Entry is not an object." });
      return;
    }
    if (typeof entry.fullUrl !== "string" || entry.fullUrl.length === 0) {
      findings.push({ severity: "error", path: `${path}.fullUrl`, message: "Entry has no fullUrl." });
    }
    const res = entry.resource;
    if (!isObject(res)) {
      findings.push({ severity: "error", path: `${path}.resource`, message: "Entry has no resource." });
      return;
    }
    if (typeof res.resourceType !== "string") {
      findings.push({ severity: "error", path: `${path}.resource.resourceType`, message: "Resource has no resourceType." });
      return;
    }

    const meta = res.meta;
    if (!isObject(meta) || !Array.isArray(meta.profile) || meta.profile.length === 0) {
      findings.push({
        severity: "warning",
        path: `${path}.resource.meta.profile`,
        message: `${res.resourceType} declares no meta.profile (NRCeS profile recommended).`
      });
    }

    const rpath = `${path}.resource`;
    if (res.resourceType === "Claim") checkClaim(res, rpath, findings);
    if (res.resourceType === "CoverageEligibilityRequest") checkEligibilityRequest(res, rpath, findings, isResponseBundle);
    if (res.resourceType === "CoverageEligibilityResponse") checkEligibilityResponse(res, rpath, findings);
    if (res.resourceType === "ClaimResponse") checkClaimResponse(res, rpath, findings);
    if (res.resourceType === "Task") checkTask(res, rpath, findings);
    if (res.resourceType === "PaymentReconciliation") checkPaymentReconciliation(res, rpath, findings);

    for (const key of ["created", "authoredOn"]) {
      const v = res[key];
      if (typeof v === "string" && !RFC3339.test(v)) {
        findings.push({ severity: "warning", path: `${rpath}.${key}`, message: `${key} is not RFC 3339: ${v}` });
      }
    }
    for (const key of ["servicedDate", "paymentDate", "birthDate"]) {
      const v = res[key];
      if (typeof v === "string" && !DATE.test(v)) {
        findings.push({ severity: "warning", path: `${rpath}.${key}`, message: `${key} should be YYYY-MM-DD: ${v}` });
      }
    }
  });

  // Check focal resource matches first entry or exists in bundle
  const firstRes = entries[0]?.resource?.resourceType;
  if (expectedFocals && expectedFocals.length > 0) {
    const matchesFirst = expectedFocals.includes(firstRes);
    if (!matchesFirst) {
      const hasAnyFocal = entries.some(e => expectedFocals.includes(e.resource?.resourceType));
      if (!hasAnyFocal) {
        findings.push({
          severity: "error",
          path: "entry",
          message: `Expected focal resource (${expectedFocals.join(" or ")}) is missing from bundle (first entry is "${firstRes}").`
        });
      } else {
        findings.push({
          severity: "info",
          path: "entry[0]",
          message: `First entry is "${firstRes}"; bundle carries focal resource ${expectedFocals.join("/")}.`
        });
      }
    }
  }

  // Reference integrity (no dangling references!)
  const references = [];
  collectReferences(entries, "entry", references);
  const dangling = new Map();
  for (const { path, value } of references) {
    if (!addressable.has(value) && !dangling.has(value)) {
      // External URL references are valid
      if (value.startsWith("http://") || value.startsWith("https://")) continue;
      const m = path.match(/^entry\[(\d+)\]/);
      const entryIdx = m ? parseInt(m[1], 10) : -1;
      const resType = entryIdx >= 0 ? entries[entryIdx]?.resource?.resourceType : "";

      // In query responses, basedOn, request, focus, or sender/recipient inside an echoed CommunicationRequest point to prior transaction IDs
      if (path.includes(".basedOn") || path.includes(".request") || path.includes(".focus") || (resType === "CommunicationRequest" && (path.includes(".sender") || path.includes(".recipient")))) {
        findings.push({
          severity: "info",
          path,
          message: `Historical correlation reference "${value}" refers to preceding exchange event.`
        });
        continue;
      }
      dangling.set(value, path);
    }
  }
  for (const [value, path] of dangling) {
    findings.push({
      severity: "error",
      path,
      message: `Dangling reference "${value}" does not match any entry fullUrl or id in this bundle.`
    });
  }

  return findings;
}

// ---------------------------------------------------------------------------
// Run Validation across all use-case directories in package/fhir/
// ---------------------------------------------------------------------------

if (!existsSync(FHIR_DIR)) {
  console.error(`FHIR directory not found: ${FHIR_DIR}`);
  process.exit(1);
}

const ucDirs = readdirSync(FHIR_DIR)
  .filter((f) => statSync(join(FHIR_DIR, f)).isDirectory())
  .filter((f) => (targetUseCase ? f.toUpperCase() === targetUseCase : true))
  .sort();

const results = [];
let totalErrors = 0;
let totalWarnings = 0;
let totalFiles = 0;

for (const uc of ucDirs) {
  const dirPath = join(FHIR_DIR, uc);
  const files = readdirSync(dirPath).filter((f) => f.endsWith(".json")).sort();
  const expectedFocals = FOCAL_MAP[uc] || [];

  for (const file of files) {
    totalFiles++;
    const filePath = join(dirPath, file);
    let parsed;
    try {
      parsed = JSON.parse(readFileSync(filePath, "utf8"));
    } catch (e) {
      results.push({
        useCase: uc,
        file: `package/fhir/${uc}/${file}`,
        status: "FAIL",
        errors: 1,
        warnings: 0,
        infos: 0,
        entryCount: 0,
        focal: expectedFocals[0] || "Unknown",
        resourceTypes: [],
        findings: [{ severity: "error", path: "", message: `JSON Parse Error: ${e.message}` }]
      });
      totalErrors++;
      continue;
    }

    const findings = validateBundle(parsed, expectedFocals);
    const errors = findings.filter((f) => f.severity === "error").length;
    const warnings = findings.filter((f) => f.severity === "warning").length;
    const infos = findings.filter((f) => f.severity === "info").length;

    totalErrors += errors;
    totalWarnings += warnings;

    const resourceTypes = [
      ...new Set(
        Array.isArray(parsed.entry)
          ? parsed.entry.map((e) => e.resource?.resourceType).filter(Boolean)
          : []
      )
    ];

    const status = errors > 0 ? "FAIL" : warnings > 0 ? (strict ? "FAIL" : "WARN") : "PASS";

    results.push({
      useCase: uc,
      file: `package/fhir/${uc}/${file}`,
      status,
      errors,
      warnings,
      infos,
      entryCount: Array.isArray(parsed.entry) ? parsed.entry.length : 0,
      focal: parsed.entry?.[0]?.resource?.resourceType || "None",
      resourceTypes,
      findings
    });
  }
}

// ---------------------------------------------------------------------------
// Generate Reports (Markdown & JSON)
// ---------------------------------------------------------------------------

mkdirSync(reportDir, { recursive: true });

const passedCount = results.filter((r) => r.status === "PASS").length;
const warnCount = results.filter((r) => r.status === "WARN").length;
const failCount = results.filter((r) => r.status === "FAIL").length;
const conformanceRate = totalFiles > 0 ? (((passedCount + warnCount) / totalFiles) * 100).toFixed(1) : "0.0";

const reportData = {
  timestamp: new Date().toISOString(),
  totalBundles: totalFiles,
  useCasesCovered: ucDirs.length,
  passed: passedCount,
  warnings: warnCount,
  failures: failCount,
  conformanceRate: `${conformanceRate}%`,
  strictMode: strict,
  results
};

// Write JSON Report
const jsonReportPath = join(reportDir, "validation-report.json");
writeFileSync(jsonReportPath, JSON.stringify(reportData, null, 2), "utf8");

// Write Markdown Report
let md = `# NHCX FHIR Bundle Validation Report

**Generated:** ${reportData.timestamp}  
**Target Scope:** ${targetUseCase ? `Use Case ${targetUseCase}` : "All Use Cases (A5, B1..B9, C3..C11, D1..D13)"}  
**Total Bundles Audited:** ${totalFiles} across ${ucDirs.length} use cases  

---

## Executive Summary

| Metric | Count | Status |
| :--- | :--- | :--- |
| **Total Bundles** | ${totalFiles} | - |
| **Pass (No Issues)** | ${passedCount} | ✅ Compliant |
| **Warning (Advisory/Minor)** | ${warnCount} | ⚠️ Valid Wire Structure |
| **Fail (Critical Errors)** | ${failCount} | ${failCount === 0 ? "✅ None" : "❌ Non-compliant"} |
| **Conformance Rate** | **${conformanceRate}%** | ${failCount === 0 ? "✅ 100% Gateway Ready" : "⚠️ Corrections Needed"} |

---

## Use Case Audit Summary Table

| Use Case | Bundle File | Entries | Focal Resource | Other Resources | Errors | Warnings | Result |
| :--- | :--- | :---: | :--- | :--- | :---: | :---: | :---: |
`;

for (const r of results) {
  const icon = r.status === "PASS" ? "✅ PASS" : r.status === "WARN" ? "⚠️ WARN" : "❌ FAIL";
  const otherTypes = r.resourceTypes.filter((t) => t !== r.focal).slice(0, 3).join(", ") || "-";
  md += `| **${r.useCase}** | \`${r.file.split("/").pop()}\` | ${r.entryCount} | \`${r.focal}\` | ${otherTypes} | ${r.errors} | ${r.warnings} | ${icon} |\n`;
}

md += `\n---\n\n## Detailed Findings by Bundle\n\n`;

const bundlesWithIssues = results.filter((r) => r.findings.some((f) => f.severity === "error" || f.severity === "warning"));

if (bundlesWithIssues.length === 0) {
  md += `✅ **All ${totalFiles} bundles passed validation with 0 errors.**\n`;
} else {
  for (const b of bundlesWithIssues) {
    md += `### \`${b.file}\` (${b.useCase})\n\n`;
    md += `- **Entries**: ${b.entryCount}\n`;
    md += `- **Primary Resource**: \`${b.focal}\`\n`;
    md += `- **Resource Types**: ${b.resourceTypes.map((t) => `\`${t}\``).join(", ")}\n\n`;
    md += `| Severity | Path | Issue & Rule | Recommendation / Fix |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    for (const f of b.findings.filter((x) => x.severity !== "info")) {
      const sev = f.severity === "error" ? "❌ ERROR" : "⚠️ WARN";
      md += `| ${sev} | \`${f.path || "root"}\` | ${f.message.replace(/\|/g, "\\|")} | ${f.fix ? f.fix.replace(/\|/g, "\\|") : "-"} |\n`;
    }
    md += `\n`;
  }
}

const mdReportPath = join(reportDir, "validation-report.md");
writeFileSync(mdReportPath, md, "utf8");

// Output to console
if (jsonOnly) {
  console.log(JSON.stringify(reportData, null, 2));
} else {
  console.log("==================================================================");
  console.log("  NHCX FHIR Bundle Validator - Execution Summary");
  console.log("==================================================================");
  console.log(`  Scanned: ${totalFiles} bundles across ${ucDirs.length} use cases`);
  console.log(`  Passed:  ${passedCount} bundles (0 warnings, 0 errors)`);
  console.log(`  Warned:  ${warnCount} bundles (advisory profile/timestamp notices)`);
  console.log(`  Failed:  ${failCount} bundles`);
  console.log(`  Rate:    ${conformanceRate}% Conformance`);
  console.log("------------------------------------------------------------------");
  console.log(`  Report (MD):   ${mdReportPath}`);
  console.log(`  Report (JSON): ${jsonReportPath}`);
  console.log("==================================================================");
}

if (strict && (totalErrors > 0 || totalWarnings > 0)) {
  process.exit(1);
} else if (totalErrors > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
