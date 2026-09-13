/**
 * Renders the FHIR Reference chapters.
 *
 * Every chapter comes from two places in package/fhir: the bundles, which give
 * the structure, the elements and the codes, and reference.yaml, which gives
 * the rules, the PMJAY specifications and the PMJAY requirements. What PMJAY
 * changes in a bundle is not written down anywhere: it is computed here by
 * comparing the PMJAY bundle for an exchange with the generic one.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import YAML from "yaml";

const isPrim = (v) => v === null || typeof v !== "object";
const isPrimArray = (v) => Array.isArray(v) && v.every(isPrim);
const isLeaf = (v) => isPrim(v) || isPrimArray(v);
const SKIP_KEYS = new Set(["data", "div"]);
const SKIP_ROOT = new Set(["resourceType", "id", "meta", "text", "contained"]);
const MAX_VALUES = 3;
const MAX_ELEMENTS = 70;
const NRCES_SD = "https://nrces.in/ndhm/fhir/r4/StructureDefinition/";
const HL7_SD = "http://hl7.org/fhir/StructureDefinition/";

/** The page a profile's canonical URL is published at. */
function profilePage(canonical) {
  if (canonical.startsWith(NRCES_SD)) return `https://nrces.in/ndhm/fhir/r4/StructureDefinition-${canonical.slice(NRCES_SD.length)}.html`;
  if (canonical.startsWith(HL7_SD)) return `https://hl7.org/fhir/R4/${canonical.slice(HL7_SD.length).toLowerCase()}.html`;
  return canonical;
}
const profileLink = (canonical, label) => `[${label || canonical.split("/").pop()}](${profilePage(canonical)})`;

export function makeFhirReference({ fhirDir, spec, escapePipe, useCaseBlock, chapterDir }) {
  const cache = new Map();
  let profileMap = null;
  // Profiles a bundle declares that NRCeS does not publish. They are named, and
  // the base FHIR definition is linked instead.
  const unpublished = new Set(spec.nrces_unpublished || []);
  const declaredLink = (p, label) => {
    const name = p.split("/").pop();
    if (p.startsWith(NRCES_SD) && unpublished.has(name)) {
      return `${label || `\`${name}\``}, which NRCeS does not publish; base FHIR [${name}](https://hl7.org/fhir/R4/${name.toLowerCase()}.html)`;
    }
    return profileLink(p, label);
  };

  /**
   * The NRCeS profile for each resource type: the ones the bundles declare,
   * plus the ones reference.yaml names for resources payers send without one.
   */
  function profiles() {
    if (profileMap) return profileMap;
    profileMap = new Map();
    for (const f of allBundles()) for (const r of load(f).entries) for (const p of r.meta?.profile || []) {
      if (p.startsWith(NRCES_SD) && !unpublished.has(r.resourceType) && !profileMap.has(r.resourceType)) profileMap.set(r.resourceType, p);
    }
    for (const t of spec.nrces_profiles || []) if (!profileMap.has(t)) profileMap.set(t, `${NRCES_SD}${t}`);
    return profileMap;
  }
  const nrcesLine = (type) => (profiles().get(type) ? [`NRCeS profile: ${profileLink(profiles().get(type))}.`, ""] : []);
  // The chapters sit side by side in chapterDir, so a link to one is its file name.
  const chapterLink = (ch) => (chapterDir ? `[${ch.title}](${encodeURI(ch.file)})` : ch.title);
  const mask = spec.participant_defined_systems || [];
  const pmjayFiles = collectPmjayFiles(spec);
  // The scheme of every bundle, from fhir/index.yaml, so a PMJAY bundle the
  // chapters do not pair with a generic one is still counted as PMJAY.
  const schemeOf = new Map();
  try {
    const index = YAML.parse(readFileSync(join(fhirDir, "index.yaml"), "utf8"));
    for (const [code, uc] of Object.entries(index.use_cases || {})) for (const f of uc.files || []) if (f.scheme) schemeOf.set(`${code}/${f.file}`, f.scheme);
  } catch { /* no index: fall back to the chapters and the D prefix */ }

  // ---------------------------------------------------------------------------
  // Loading and flattening
  // ---------------------------------------------------------------------------

  function load(rel) {
    if (cache.has(rel)) return cache.get(rel);
    const file = join(fhirDir, rel);
    if (!existsSync(file)) throw new Error(`reference.yaml names a bundle that does not exist: fhir/${rel}`);
    const bundle = JSON.parse(readFileSync(file, "utf8"));
    const entries = (bundle.entry || []).map((e) => e.resource).filter(Boolean);
    const loaded = { rel, bundle, entries };
    cache.set(rel, loaded);
    return loaded;
  }

  /**
   * A resource as rows. A row is either a primitive at a path, or the
   * primitive fields of one object at a path: a coding, a reference, an amount.
   * That keeps a coding on one line instead of three.
   */
  function rows(resource) {
    const out = [];
    const type = resource.resourceType;
    const walk = (node, path) => {
      if (isLeaf(node)) return void out.push({ path, value: node });
      if (Array.isArray(node)) return void node.forEach((v) => walk(v, `${path}[]`));
      const fields = Object.entries(node).filter(([k]) => !SKIP_KEYS.has(k));
      const leaf = fields.filter(([, v]) => isLeaf(v));
      if (leaf.length) out.push({ path, value: Object.fromEntries(leaf) });
      for (const [k, v] of fields) if (!isLeaf(v)) walk(v, `${path}.${k}`);
    };
    for (const [k, v] of Object.entries(resource)) {
      if (SKIP_ROOT.has(k)) continue;
      if (isLeaf(v)) out.push({ path: `${type}.${k}`, value: v });
      else walk(v, `${type}.${k}`);
    }
    return out;
  }

  const filterRows = (list, { only, exclude } = {}) =>
    list.filter(
      (r) =>
        (!only || only.some((p) => r.path === p || r.path.startsWith(`${p}.`) || r.path.startsWith(`${p}[`))) &&
        !(exclude || []).some((p) => r.path === p || r.path.startsWith(`${p}.`) || r.path.startsWith(`${p}[`))
    );

  // ---------------------------------------------------------------------------
  // Formatting
  // ---------------------------------------------------------------------------

  // A participant-defined host anywhere in a string, a system or a reference, is masked.
  const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const maskRe = mask.length ? new RegExp("(" + mask.map(escapeRe).join("|") + ")[^\\s`\"'|)]*", "g") : null;
  // Text from one participant's test traffic that has no place in a specification.
  const redacts = (spec.redact || []).map((r) =>
    typeof r === "string" ? { re: new RegExp(r, "gi"), to: "" } : { re: new RegExp(r.pattern, "gi"), to: r.replace ?? "" }
  );
  const masked = (s) => {
    let out = maskRe ? String(s).replace(maskRe, "<participant-defined>") : String(s);
    for (const { re, to } of redacts) out = out.replace(re, () => to);
    return out;
  };
  const trunc = (s, n = 80) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
  const tick = (v) => `\`${masked(trunc(String(v))).replace(/`/g, "'").replace(/\|/g, "\\|")}\``;
  const plain = (v) => escapePipe(masked(trunc(String(v))));
  const one = (x) => (Array.isArray(x) ? x.map(tick).join(", ") : tick(x));

  function fmt(value) {
    if (isPrim(value)) return tick(value);
    if (Array.isArray(value)) return value.map(tick).join(", ");
    const keys = Object.keys(value);
    if ("code" in value || ("system" in value && "display" in value)) {
      const parts = [];
      if (value.code !== undefined) parts.push(tick(value.code));
      if (value.display !== undefined) parts.push(plain(value.display));
      if (value.system !== undefined) parts.push(`in ${tick(value.system)}`);
      for (const k of keys) if (!["code", "display", "system"].includes(k)) parts.push(`${k} ${one(value[k])}`);
      return parts.join(" ");
    }
    return keys.map((k) => `${k} ${one(value[k])}`).join(", ");
  }

  const stripType = (path, type) => (path.startsWith(`${type}.`) ? path.slice(type.length + 1) : path);

  function grouped(list) {
    const m = new Map();
    for (const r of list) {
      const f = fmt(r.value);
      if (!m.has(r.path)) m.set(r.path, []);
      const vals = m.get(r.path);
      if (!vals.includes(f)) vals.push(f);
    }
    return m;
  }

  function elementTable(list, type) {
    const m = grouped(list);
    if (!m.size) return ["No elements beyond the identifiers.", ""];
    const out = ["| Element | Example |", "| :-- | :-- |"];
    let n = 0;
    for (const [path, vals] of m) {
      if (n++ >= MAX_ELEMENTS) break;
      vals.slice(0, MAX_VALUES).forEach((v, i) => out.push(`| ${i ? "" : `\`${stripType(path, type)}\``} | ${v} |`));
      if (vals.length > MAX_VALUES) out.push(`| | and ${vals.length - MAX_VALUES} more |`);
    }
    if (m.size > MAX_ELEMENTS) out.push(`| | and ${m.size - MAX_ELEMENTS} more elements |`);
    out.push("");
    return out;
  }

  function entryLabel(r) {
    if (r.resourceType === "Organization") {
      const code = r.type?.[0]?.coding?.[0]?.code;
      if (code) return `Organization (${code})`;
    }
    return r.resourceType;
  }
  const profileOf = (r) => {
    const p = r.meta?.profile?.[0];
    if (p) return declaredLink(p);
    const n = profiles().get(r.resourceType);
    return n ? `none declared; NRCeS ${profileLink(n)}` : "none";
  };

  function bundleTable(b) {
    const out = ["| # | Resource | Profile |", "| :-- | :-- | :-- |"];
    b.entries.forEach((r, i) => out.push(`| ${i + 1} | \`${entryLabel(r)}\` | ${profileOf(r)} |`));
    out.push("");
    return out;
  }

  // types: the resource types to show elements for; the rest are named in the bundle table only.
  function entryElements(b, section, H, types = section.elements) {
    const out = [];
    const skipped = new Set();
    b.entries.forEach((r, i) => {
      if (types && !types.includes(r.resourceType)) return void skipped.add(r.resourceType);
      const list = filterRows(rows(r), section);
      if (!list.length) return;
      out.push(`${H} ${i + 1}. ${entryLabel(r)}`, "", ...nrcesLine(r.resourceType), ...elementTable(list, r.resourceType));
    });
    if (skipped.size) out.push(`The ${[...skipped].map((s) => `\`${s}\``).join(", ")} entries are shaped as in the chapters that introduce them.`, "");
    return out;
  }

  // ---------------------------------------------------------------------------
  // What PMJAY changes
  // ---------------------------------------------------------------------------

  function systemsByPath(list) {
    const m = new Map();
    for (const r of list) {
      if (r.value && !isPrim(r.value) && !Array.isArray(r.value) && typeof r.value.system === "string") {
        if (!m.has(r.path)) m.set(r.path, new Set());
        m.get(r.path).add(masked(r.value.system));
      }
    }
    return m;
  }

  function diffSection(section, H) {
    const g = load(section.generic);
    const p = load(section.pmjay);
    const out = [];
    const focalG = g.entries[0]?.resourceType;
    const focalP = p.entries[0]?.resourceType;
    if (focalG !== focalP) {
      out.push(
        `PMJAY uses a different bundle for this step, headed by \`${focalP}\` rather than \`${focalG}\`.`,
        "",
        ...bundleTable(p),
        ...entryElements(p, section, `${H}#`, section.pmjay_elements)
      );
      return out;
    }
    const count = (list) => list.reduce((m, r) => m.set(r.resourceType, (m.get(r.resourceType) || 0) + 1), new Map());
    const cg = count(g.entries);
    const cp = count(p.entries);
    const addedTypes = [...cp].filter(([t, n]) => n > (cg.get(t) || 0));
    const droppedTypes = [...cg].filter(([t, n]) => n > (cp.get(t) || 0));
    const sharedTypes = new Set([...cg.keys()].filter((t) => cp.has(t)));

    const rg = filterRows(g.entries.flatMap(rows), section);
    const rp = filterRows(p.entries.flatMap(rows), section);
    const typeOf = (path) => path.split(".")[0].replace(/\[\]$/, "");
    const pathsG = new Set(rg.map((r) => r.path));
    const pathsP = new Set(rp.map((r) => r.path));
    const addedRows = rp.filter((r) => sharedTypes.has(typeOf(r.path)) && !pathsG.has(r.path));
    const droppedRows = rg.filter((r) => sharedTypes.has(typeOf(r.path)) && !pathsP.has(r.path));
    const sg = systemsByPath(rg);
    const sp = systemsByPath(rp);
    const changedSystems = [...sg].filter(([path, set]) => {
      const other = sp.get(path);
      return other && [...set].sort().join() !== [...other].sort().join();
    });

    if (!addedTypes.length && !droppedTypes.length && !addedRows.length && !droppedRows.length && !changedSystems.length) {
      out.push("The PMJAY bundle has the same resources, elements and systems as the generic one.", "");
      return out;
    }
    if (addedTypes.length || droppedTypes.length) {
      out.push(`${H} Resources`, "");
      for (const [t, n] of addedTypes) out.push(`- PMJAY adds ${n - (cg.get(t) || 0)} \`${t}\`.`);
      for (const [t, n] of droppedTypes) out.push(`- PMJAY leaves out ${n - (cp.get(t) || 0)} \`${t}\`.`);
      out.push("");
      for (const [t] of addedTypes) {
        if (sharedTypes.has(t)) continue;
        if (section.pmjay_elements && !section.pmjay_elements.includes(t)) continue;
        const first = p.entries.find((r) => r.resourceType === t);
        out.push(`${H}# ${t}`, "", ...nrcesLine(t), ...elementTable(filterRows(rows(first), section), t));
      }
    }
    if (addedRows.length) {
      out.push(`${H} Elements PMJAY adds`, "", ...elementTable(addedRows, ""));
    }
    if (droppedRows.length) {
      out.push(`${H} Elements PMJAY leaves out`, "", ...elementTable(droppedRows, ""));
    }
    if (changedSystems.length) {
      out.push(`${H} Systems PMJAY binds differently`, "", "| Element | Generic | PMJAY |", "| :-- | :-- | :-- |");
      for (const [path, set] of changedSystems) {
        out.push(`| \`${path}\` | ${[...set].map(tick).join(", ")} | ${[...sp.get(path)].map(tick).join(", ")} |`);
      }
      out.push("");
    }
    return out;
  }

  // ---------------------------------------------------------------------------
  // Variants, flags, requirements, exclusions, questionnaires
  // ---------------------------------------------------------------------------

  function variantTable(v) {
    const fields = v.fields || [];
    const hasWorkflow = (v.items || []).some((i) => i.workflow);
    const hasNote = (v.items || []).some((i) => i.note);
    const head = ["Variant", ...(hasWorkflow ? ["Workflow"] : []), ...(hasNote ? ["What it asks"] : []), ...fields.map((f) => f.label)];
    const out = [`| ${head.join(" | ")} |`, `| ${head.map(() => ":--").join(" | ")} |`];
    for (const item of v.items || []) {
      const all = load(item.file).entries.flatMap(rows);
      const cells = fields.map((f) => {
        const vals = [...new Set(all.filter((r) => r.path === f.path).map((r) => fmt(r.value)))];
        return vals.length ? vals.slice(0, 2).join("; ") : "none";
      });
      out.push(`| ${[item.label, ...(hasWorkflow ? [item.workflow ? `\`${item.workflow}\`` : ""] : []), ...(hasNote ? [escapePipe(item.note || "")] : []), ...cells].join(" | ")} |`);
    }
    out.push("");
    return out;
  }

  function walkJson(node, visit) {
    if (Array.isArray(node)) return node.forEach((n) => walkJson(n, visit));
    if (node && typeof node === "object") {
      visit(node);
      for (const v of Object.values(node)) walkJson(v, visit);
    }
  }
  const valueOf = (node) => {
    const key = Object.keys(node).find((k) => k.startsWith("value"));
    if (!key) return undefined;
    const v = node[key];
    if (v && typeof v === "object") return v.coding?.[0]?.code ?? v.coding?.[0]?.display ?? v.text ?? JSON.stringify(v);
    return v;
  };

  function flagTable(resource, meanings = {}) {
    const flags = new Map();
    walkJson(resource, (n) => {
      if (typeof n.url !== "string" || !n.url.includes("Claim-Condition/")) return;
      const name = n.url.split("Claim-Condition/")[1];
      const v = valueOf(n);
      if (!flags.has(name)) flags.set(name, new Set());
      if (v !== undefined) flags.get(name).add(String(v));
    });
    const names = [...new Set([...flags.keys(), ...Object.keys(meanings)])];
    if (!names.length) return [];
    const out = ["| Flag | Values in the plan | What it governs |", "| :-- | :-- | :-- |"];
    for (const name of names) {
      const vals = flags.has(name) ? [...flags.get(name)].slice(0, 5).map(tick).join(", ") : "not carried";
      out.push(`| \`${name}\` | ${vals} | ${escapePipe(meanings[name] || "")} |`);
    }
    out.push("");
    return out;
  }

  function requirementTable(resource) {
    const found = new Map();
    let links = 0;
    walkJson(resource, (n) => {
      if (typeof n.url !== "string" || !n.url.includes("Claim-SupportingInfoRequirement")) return;
      const tail = n.url.split("Claim-SupportingInfoRequirement")[1] || "";
      const stage = ["preauth", "discharge", "claim"].find((s) => tail.includes(`/${s}/`)) || "";
      walkJson(n, (c) => {
        if (c.url === "documentationUrl") links += 1;
        for (const coding of c.valueCodeableConcept?.coding || []) {
          const key = `${coding.code}|${stage}`;
          if (!found.has(key)) found.set(key, { ...coding, stage, count: 0 });
          found.get(key).count += 1;
        }
      });
    });
    if (!found.size) return [];
    const out = ["| Code | Display | Stage | System |", "| :-- | :-- | :-- | :-- |"];
    for (const c of found.values()) out.push(`| \`${c.code}\` | ${plain(c.display || "")} | ${c.stage || "any"} | ${c.system ? tick(c.system) : "none"} |`);
    out.push("");
    if (links) out.push(`${links} of the requirements link a questionnaire through \`documentationUrl\`.`, "");
    return out;
  }

  function exclusionTable(resource) {
    const rowsOut = [];
    walkJson(resource, (n) => {
      if (typeof n.url !== "string" || !n.url.includes("Claim-Exclusion")) return;
      const cells = {};
      for (const c of n.extension || []) cells[c.url] = valueOf(c);
      rowsOut.push(cells);
    });
    if (!rowsOut.length) return [];
    const keys = [...new Set(rowsOut.flatMap((r) => Object.keys(r)))];
    const out = [`| ${keys.join(" | ")} |`, `| ${keys.map(() => ":--").join(" | ")} |`];
    for (const r of rowsOut) out.push(`| ${keys.map((k) => (r[k] === undefined ? "" : plain(r[k]))).join(" | ")} |`);
    out.push("");
    return out;
  }

  function questionnaireTable(b) {
    const qs = b.entries.filter((r) => r.resourceType === "Questionnaire");
    if (!qs.length) return [];
    const out = ["| Title | Items | Item types | Question in |", "| :-- | :-- | :-- | :-- |"];
    for (const q of qs) {
      const items = [];
      walkJson(q.item || [], (n) => n.linkId && items.push(n));
      const types = [...new Set(items.map((i) => i.type).filter(Boolean))].map(tick).join(", ");
      const where = items.some((i) => i.text) ? "`text`" : items.some((i) => i.prefix) ? "`prefix`" : "";
      out.push(`| ${plain(q.title || q.name || q.url || "")} | ${items.length} | ${types} | ${where} |`);
    }
    out.push("");
    return out;
  }

  // ---------------------------------------------------------------------------
  // Chapter parts shared by every kind
  // ---------------------------------------------------------------------------

  const para = (t) => (t ? [String(t).trim(), ""] : []);
  const ruleList = (rules) => (rules || []).flatMap((r, i) => [`### ${i + 1}. ${r.title}`, "", String(r.text).trim(), ""]);
  const bullets = (list) => (list || []).map((t) => `- ${String(t).trim()}`).concat([""]);

  function endpointLine(o) {
    const bits = [];
    if (o.endpoint) bits.push(`Sent on \`${o.endpoint}\``);
    if (o.callback) bits.push(`answered on \`${o.callback}\``);
    if (o.workflow) bits.push(`workflow ${o.workflow}`);
    return bits.length ? [`${bits.join(", ")}.`, ""] : [];
  }

  function pmjayBlock(ch, computed) {
    const pm = ch.pmjay || {};
    const out = ["## PMJAY", ""];
    out.push(...para(pm.note || "The generic bundle above is what every payer takes, IRDAI-regulated insurers and TPAs included. PMJAY takes it with the changes and requirements below."));
    if (computed.length) out.push("### What changes in the bundle", "", ...computed);
    if (pm.specifics?.length) out.push("### What PMJAY specifies", "", ...bullets(pm.specifics));
    if (pm.requires?.length) out.push("### What PMJAY requires", "", ...bullets(pm.requires));
    return out;
  }

  const stripMarkers = (s) => s.replace(/<!-- build-docs:(start|end) -->\n?/g, "").trim();
  const useCases = (ch) => (ch.use_cases?.length ? ["", stripMarkers(useCaseBlock(ch.use_cases)), ""] : []);

  // ---------------------------------------------------------------------------
  // Chapters
  // ---------------------------------------------------------------------------

  function exchangeChapter(ch) {
    const out = [`# ${ch.title}`, "", ...para(ch.summary), ...endpointLine(ch)];
    const sections = ch.sections || [];
    const multi = sections.length > 1;
    const computed = [];
    for (const s of sections) {
      const H = multi ? "###" : "##";
      if (multi) out.push(`## ${s.title}`, "", ...para(s.summary), ...endpointLine(s));
      // An exchange with no FHIR payload (status) is described in its summary alone.
      if (!s.generic) continue;
      const g = load(s.generic);
      out.push(`${H} The bundle`, "", ...bundleTable(g), `${H} Elements`, "", ...entryElements(g, s, `${H}#`));
      if (s.pmjay) {
        if (multi) computed.push(`#### ${s.title}`, "");
        computed.push(...diffSection(s, multi ? "#####" : "####"));
      }
    }
    if (ch.questionnaires) {
      const qs = questionnaireTable(load(sections[0].generic));
      if (qs.length) out.push("## Questionnaires", "", ...qs);
    }
    if (ch.variants) out.push(`## ${ch.variants.title}`, "", ...para(ch.variants.intro), ...variantTable(ch.variants));
    if (ch.rules?.length) out.push("## Rules", "", ...ruleList(ch.rules));
    if (!computed.length && !ch.pmjay?.note) computed.push("PMJAY sends this exchange in the generic shape.", "");
    out.push(...pmjayBlock(ch, computed), ...useCases(ch));
    return out;
  }

  function shapeChapter(ch) {
    const b = load(ch.bundle);
    const plan = b.entries[0];
    const out = [`# ${ch.title}`, "", ...para(ch.summary)];
    out.push("## The bundle", "", ...bundleTable(b));
    out.push("## Elements", "", ...nrcesLine(plan.resourceType), ...elementTable(filterRows(rows(plan), { only: ch.only, exclude: ch.exclude }), plan.resourceType));
    const flags = flagTable(plan, ch.flags);
    if (flags.length) out.push("## Claim-Condition flags", "", ...flags);
    const reqs = requirementTable(plan);
    if (reqs.length) out.push("## Supporting-information requirements", "", ...reqs);
    const excl = exclusionTable(plan);
    if (excl.length) out.push("## Exclusions", "", ...excl);
    const qs = questionnaireTable(b);
    if (qs.length) out.push("## Questionnaires", "", ...qs);
    if (ch.rules?.length) out.push("## Rules", "", ...ruleList(ch.rules));
    out.push(...pmjayBlock(ch, []));
    return out;
  }

  function allBundles() {
    const out = [];
    for (const dir of readdirSync(fhirDir).sort()) {
      const d = join(fhirDir, dir);
      if (!statSync(d).isDirectory()) continue;
      for (const f of readdirSync(d).filter((n) => n.endsWith(".json")).sort()) out.push(`${dir}/${f}`);
    }
    return out;
  }

  function conventionsChapter(c) {
    const out = [`# ${c.title}`, "", ...para(c.summary), "## Rules", "", ...ruleList(c.rules)];
    const byType = new Map();
    for (const ch of spec.chapters) {
      const files = [
        ...(ch.sections || []).flatMap((s) => [s.generic, s.pmjay].filter(Boolean)),
        ...(ch.bundle ? [ch.bundle] : []),
      ];
      for (const f of files) for (const r of load(f).entries) {
        if (!byType.has(r.resourceType)) byType.set(r.resourceType, new Set());
        byType.get(r.resourceType).add(ch);
      }
    }
    out.push("## Resources by exchange", "", "Each resource the bundles carry, its NRCeS profile, and the exchanges that use it.", "");
    for (const [t, set] of [...byType].sort((a, b) => a[0].localeCompare(b[0]))) {
      out.push(`### ${t}`, "", ...nrcesLine(t), ...[...set].map((ch) => `- ${chapterLink(ch)}`), "");
    }
    const declared = new Set();
    for (const f of allBundles()) for (const r of load(f).entries) for (const p of r.meta?.profile || []) declared.add(p);
    out.push("## Profiles in use", "", "The profiles the bundles declare in `meta.profile`, each linked to its published definition.", "", ...[...declared].sort().map((p) => `- ${declaredLink(p, `\`${p}\``)}`), "");
    out.push(...pmjayBlock(c, []));
    return out;
  }

  function codesChapter(c) {
    const out = [`# ${c.title}`, "", ...para(c.summary), "## Codes in the bundles", ""];
    const bySystem = new Map();
    for (const f of allBundles()) {
      const flavour = pmjayFiles.has(f) || f.startsWith("D") || schemeOf.get(f) === "pmjay" ? "PMJAY" : "generic";
      for (const r of load(f).entries) {
        for (const row of rows(r)) {
          const v = row.value;
          if (!v || isPrim(v) || Array.isArray(v) || typeof v.system !== "string" || v.code === undefined) continue;
          if (masked(v.system) !== v.system) continue;
          if (!bySystem.has(v.system)) bySystem.set(v.system, new Map());
          const codes = bySystem.get(v.system);
          const key = String(v.code);
          if (!codes.has(key)) codes.set(key, { display: v.display, paths: new Set(), flavours: new Set() });
          const e = codes.get(key);
          if (!e.display && v.display) e.display = v.display;
          e.paths.add(row.path.replace(/\[\]/g, ""));
          e.flavours.add(flavour);
        }
      }
    }
    for (const [system, codes] of [...bySystem].sort((a, b) => a[0].localeCompare(b[0]))) {
      out.push(`### \`${system}\``, "", "| Code | Display | Where | Used by |", "| :-- | :-- | :-- | :-- |");
      for (const [code, e] of [...codes].sort((a, b) => a[0].localeCompare(b[0])).slice(0, 60)) {
        const where = [...e.paths].slice(0, 2).map((p) => `\`${p}\``).join(", ");
        const who = e.flavours.size === 2 ? "both" : [...e.flavours][0];
        out.push(`| ${tick(code)} | ${plain(e.display || "")} | ${where} | ${who} |`);
      }
      if (codes.size > 60) out.push(`| | and ${codes.size - 60} more | | |`);
      out.push("");
    }
    out.push("## Value sets", "", "The codes the specifications define beyond those the bundles carry.", "");
    for (const vs of c.value_sets || []) {
      out.push(`### ${vs.title}`, "");
      if (vs.system) out.push(`System \`${vs.system}\`.`, "");
      if (vs.note) out.push(String(vs.note).trim(), "");
      out.push("| Code | Meaning | Notes |", "| :-- | :-- | :-- |");
      for (const [code, meaning, note] of vs.codes) out.push(`| \`${code}\` | ${escapePipe(meaning)} | ${escapePipe(note || "")} |`);
      out.push("");
    }
    if (c.system_defects?.length) {
      out.push("## Where the systems are wrong", "", "The code is usually right. The system it is bound to often is not. Match on the code, and take the system from the exchange you are building.", "");
      out.push("| What | The problem |", "| :-- | :-- |");
      for (const [what, problem] of c.system_defects) out.push(`| ${escapePipe(what)} | ${problem} |`);
      out.push("");
    }
    return out;
  }

  function render(ch) {
    const kind = ch === spec.conventions ? "conventions" : ch === spec.codes ? "codes" : ch.kind || "exchange";
    const lines =
      kind === "conventions" ? conventionsChapter(ch) : kind === "codes" ? codesChapter(ch) : kind === "shape" ? shapeChapter(ch) : exchangeChapter(ch);
    return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
  }

  return {
    chapters: [spec.conventions, ...spec.chapters, spec.codes].filter(Boolean),
    render,
    profileLinks: (types) => [...new Set(types)].filter((t) => profiles().has(t)).map((t) => profileLink(profiles().get(t))),
  };
}

function collectPmjayFiles(spec) {
  const out = new Set();
  for (const ch of spec.chapters || []) for (const s of ch.sections || []) if (s.pmjay) out.add(s.pmjay);
  return out;
}
