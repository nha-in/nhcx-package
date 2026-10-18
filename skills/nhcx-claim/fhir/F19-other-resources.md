# F19. Other bundle resources

#### F19R. RESOURCE
- `Procedure`, profile `https://nrces.in/ndhm/fhir/r4/StructureDefinition/Procedure`: **sent**, one per package, in the claim-side bundles (F8).
- `Location`, no `meta.profile`: **sent**, once, in the eligibility bundle (F2).
- `DocumentReference`, profile `https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentReference`: **sent**, one per health record attached as structured data, in the claim-side bundles (F8).
- Nothing else. Every other resource the bundles carry has its own file (list at the end).

#### F19D. DESCRIPTION
**Procedure.** One per procedure line of the claim, so the Claim can point at what is being done. The lines (`D16 claim_line`, in order) are first grouped: ward and ICU tiers (kind `Stratification`, or a code starting `STRAT` [PAYER](../references/PAYERS.md#markers)) fold onto the procedure they were quoted through and produce no Procedure; implants produce no Procedure. Every remaining line whose kind is `Procedure` gets one.

- fullUrl `https://nhcx.abdm.gov.in/procedure/<n>`, `id` `<n>`, n from 1 in line order.
- `status` depends on the leg: `preparation` on the pre-authorisation, enhancement, query update and predetermination (treatment not yet done); `completed` on the claim (`use: claim`).
- `code` is always the generic SNOMED concept `71388002` "Procedure (procedure)" [REF](../references/PAYERS.md#markers); the package is named in `code.text`. The package code itself goes on the Claim's `item[].productOrService` (F8), not here.
- `performedDateTime`: on the claim, the surgery date (`D20 claim_submission.surgery_date`) when recorded, else the admission; on every other leg the admission (`D9 claim.admission_date`). Dates are sent as instants: a bare date becomes `T00:00:00+05:30`.
- The Claim refers to each one from `procedure[]` (F8): `id` `Procedure/<n>`, `sequence` n, `type` the plan's procedure type for the package under `https://nhcx.abdm.gov.in/procedure-type` (code lower-cased, display capitalised; `conservative` when the plan does not say), `date` the same instant, `procedureReference` `{reference: <fullUrl>, display: <package display>}`. An item that is a procedure lists its own sequence in `procedureSequence`; any other item lists all of them.

On a LAMA or DAMA claim discharged before or during surgery the claim lines collapse to the single package `LM100`, so the claim carries one Procedure for it [PAYER](../references/PAYERS.md#markers).

**Location.** The facility as the place of service, referenced by `CoverageEligibilityRequest.facility` (F2). Fixed shape: the facility name and a pointer to the provider Organization. Same for every eligibility purpose. It is not sent in claim bundles.

**DocumentReference.** One per D28 row of the leg (the claim's discharge summary included) with `source = record` and `content_type` `application/fhir+json`: the patient's health record, picked from the HMIS's ABDM module, sent as the structured M2 bundle it already is rather than as a scan. This is the shape the live PMJAY provider sends and PMJAY adjudicates [PAYER](../references/PAYERS.md#markers); a payer whose adapter does not take records as FHIR gets the record as a PDF `valueAttachment` instead (PAYERS.md "Health records as FHIR").

- fullUrl `https://nhcx.abdm.gov.in/documentreference/<n>`, `id` `<n>`, n from 1 in D28 `id` order (on the claim, a discharge summary picked from records comes last), after the QuestionnaireResponses (F8 entries table).
- `status` `current`.
- `content[0].attachment`: `contentType` `application/fhir+json`, `data` base64 of the D28 `data` (the record's bundle JSON, the same encoding the leg uses for a PDF attachment), `title` the D28 label else filename.
- The Claim refers to it from `supportingInfo[]` (F8): category D28 `category` else `INV`, code D28 `code` else `ODN` under the document code system, `valueReference {reference: <fullUrl>, display: <label>}`. Nothing else on the resource: no `subject`, `type` or `date`, which the bundle inside carries.

**Not carried.** The claim-side bundles carry no Encounter, Condition, Binary or Observation. Diagnoses ride on `Claim.diagnosis` (an ICD-10 coding with the SNOMED CT coding beside it, F8); uploaded documents ride inline as base64 attachments on `Claim.supportingInfo` (F8) and `Communication.payload` (F12), health records as the DocumentReference above; admission, surgery and discharge dates ride on `Claim.supportingInfo` scalars (F8).

**Received.** Neither Procedure nor Location is read from any payer bundle. The payer's eligibility reply repeats the request's Location; it is ignored.

#### F19F. FIELDS
**Procedure (sent)**

| Element path | Value or source | Cardinality / notes |
|---|---|---|
| `id` | `1`, `2`, ... | |
| `meta.profile[0]` | `.../StructureDefinition/Procedure` | |
| `status` | `preparation` (pre-auth, enhancement, query update, predetermination), `completed` (claim) | |
| `code.coding[0]` | `http://snomed.info/sct` `71388002` "Procedure (procedure)" | constant |
| `code.text` | `D16 claim_line.display` | the package name |
| `subject` | `{reference: "https://nhcx.abdm.gov.in/patient"}` | F15 |
| `performedDateTime` | claim: `D20 claim_submission.surgery_date`, else `D9 claim.admission_date`; other legs: `D9 claim.admission_date`; as an instant | |

Not sent: `performer`, `reasonCode`, `bodySite`, `encounter`, `outcome`, `note`.

**Location (sent)**

| Element path | Value or source | Notes |
|---|---|---|
| `resourceType` | `Location` | fullUrl `https://nhcx.abdm.gov.in/location` |
| `name` | `D1 organization.name` (the default facility), else its HFR id | |
| `managingOrganization` | `{reference: "https://nhcx.abdm.gov.in/provider"}` | F17 |

No `id`, `meta`, `identifier`, `address` or `type`.

#### F19U. USED BY
- APIs: [A5. Claim Submit](../apis/A5-claim-submit.md)
- FHIR: [F1. Bundle](F1-bundle.md), [F8. Claim](F8-claim.md)
- Database: [D28. claim_document](../database/D28-claim-document.md)
