# L2. Mapping

#### L2G. GOAL
Map the fields the specs need to where they live in the target HMIS, and to the FHIR elements they feed. The result says, for each column or element that resolves to something already in the target (or needs a transform, lookup, or conflict resolution): take it from here, transform it like this. A table the target does not have at all is recorded once in `tables[]` as `new`; its columns are **not** enumerated one by one in `fields[]`, because there is no target location to record and L5 reads those columns straight from the D spec. Enumerate a field only when the entry carries information a later step acts on: a real target source (`mapped`), or a `missing`/`conflict` with a resolution.

#### L2I. INPUTS
- `nhcx-plan/discovery.json` (entities, found tables and models).
- The knowledge source: `get_atom` and `get_fhir_profile` (MCP), or `mappings/` and `docs/05-FHIR Reference/` (package), for where each data element sits and which code systems apply.
- [database](../database/INDEX.md) columns (DnC), [fhir](../fhir/INDEX.md) fields (FnF), and the screen fields that feed them (SnD, SnL).

### L2.1 Map master data (D1, D2, D3, D8)
For facility, practitioner, patient and code lists: pair each spec column with the target's table and column. Pay attention to the identifiers NHCX needs: ABHA number and address (D3), HPR id, registration number and qualification (D2), HFR id and participant code (D1). When discovery found an M1 (`abdm.m1`), D3's ABHA number and address and the session token map to the module's own fields and functions, never to new NHCX columns, and the ABHA lookup that finds records and admissions maps to `abdm.abha.lookup`.

### L2.2 Map clinical and admission data (D4, D5)
Admission or encounter, dates, ward, treating doctor, diagnoses with ICD-10 codes (and the SNOMED CT mapping, when the target holds one). Note how the target marks an admission as current and how it stores diagnosis codes.

### L2.3 Map claim data (D9 to D30)
Most claim tables are new in a target without NHCX. A claim table with no existing counterpart is recorded **once** in `tables[]` as `new`; do not write a `fields[]` entry per column for it, because there is no target location to record and L5 takes those columns from the D spec. Only when a claim table pairs with an existing insurance or TPA table (`existing` or `extend`) do its columns that come from that table get a `fields[]` entry (status `mapped`, with the target column), plus any column that is `conflict`. Always record in `fields[]` where the target keeps policy, payer and member id today.

### L2.4 Map FHIR elements (F15 to F18 first, then F2, F8, F4, F7, F10, F12, F14)
For each element in FnF that the application fills, name its source: a D column (spec side) and the target column it comes from, or a constant. An element whose source D column belongs to a wholly-`new` table (L2.3) needs **no** `fields[]` entry: it is fed from that table's new column, which L5 reads from the spec. Enumerate an element only when its source resolves to a real target column (`mapped`), or when it is `missing`/`conflict`. For each element the application reads (F3, F5, F6, F9, F11, F13), name the D column it lands in, under the same rule.

### L2.5 Map code systems
ICD-10, SNOMED, the payer's package codes, document type codes, degree codes (F16), gender and relationship codes. For each, record whether the target stores the code, only a display text, or nothing, and what transform or lookup is needed.

### L2.6 Map screen elements onto the host's components
For every screen in scope, list the kinds of component its spec names (type-ahead, select, table, chip, card, accordion, dialog, date picker, file input, flash or toast, tabs with a dot badge) and pair each with the host component from `technology.components`. A kind the host lacks is `missing` with the fix "write a minimal one, styled with the host's tokens". Record the pairs under `components`.

### L2.7 Mark gaps and conflicts
A field the target does not hold is `missing` with the proposed fix (new column, new form field on which screen). A field held with a different meaning or type is `conflict` with the resolution.

#### L2O. OUTPUT
`nhcx-plan/mapping.json`:

```json
{
  "fields": [
    {
      "spec": "D3.abha_number",
      "fhir": ["F15:identifier[1].value"],
      "target": {"table": "", "column": "", "file": "", "lines": ""},
      "transform": "digits only, 14 characters",
      "status": "mapped | missing | conflict",
      "resolution": "",
      "screens": ["S14"]
    }
  ],
  "codes": [
    {"system": "ICD-10", "spec": ["D25.icd10_code", "F8:diagnosis[].diagnosisCodeableConcept.coding[0]"],
     "target": {"table": "", "column": ""}, "status": "mapped | lookup | missing", "notes": ""},
    {"system": "SNOMED CT", "spec": ["D25.snomed_code", "F8:diagnosis[].diagnosisCodeableConcept.coding[1]"],
     "target": {"table": "", "column": ""}, "status": "mapped | lookup | missing", "notes": ""}
  ],
  "components": [
    {"screen": "S8", "kind": "type-ahead", "host": {"component": "", "file": ""}, "status": "mapped | missing"}
  ],
  "tables": [
    {"spec": "D18", "status": "new | existing | extend", "target_table": ""}
  ],
  "_note": "fields[] holds only columns/elements that resolve to a real target location (mapped) or are missing/conflict. A wholly-new table (tables[] status new) is NOT expanded column-by-column in fields[]; L5 reads its columns from the D spec.",
  "corrections": []
}
```

#### L2L. LOG
Record in `nhcx-plan/progress.json` and regenerate `nhcx-plan/progress.md`, as [LOG.md](LOG.md) describes. One entry per sub-step, with the D and F ids it mapped. L2.6 logs the component pairs per screen. L2.7 logs each `missing` or `conflict` it recorded, and every write to `nhcx-plan/mapping.json`.

#### L2X. EXIT
- Every D table (D1 to D30) has exactly one `tables[]` entry (`new`, `existing` or `extend`).
- Every column that resolves to a real target location has a `mapped` `fields[]` entry; every `missing` and every `conflict` column has a `fields[]` entry with a resolution L3 can turn into work. A column of a wholly-`new` table is covered by that table's `tables[]` entry and is **not** listed in `fields[]`.
- Every application-filled F element whose source resolves to a real target column has a `mapped` entry; an element fed from a `new`-table column is covered by that table and is not listed.
- No entry is `mapped` without a target location.
- Every component kind a screen in scope names is paired with a host component, or is `missing` because `technology.components` records it `none`.
- Every sub-step of L2 has its `started` and closing entries in progress.json, and every file changed is named in one.
