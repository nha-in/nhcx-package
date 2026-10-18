# F15. Patient

#### F15R. RESOURCE
- `resourceType`: `Patient`
- Profile in `meta.profile`: `https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient`
- Direction: **sent** at `https://nhcx.abdm.gov.in/patient` in every claim-side bundle and in the eligibility bundle. **Received**: the payer's own Patient in the eligibility reply, read back onto the claim.

#### F15D. DESCRIPTION
The beneficiary. Three variants are sent, all at fullUrl `https://nhcx.abdm.gov.in/patient` and all referenced from the other entries by that url:

| Variant | Bundle | Built from | Content |
|---|---|---|---|
| Claim-bundle Patient | pre-auth, predetermination, enhancement, query update (F8 via A4), claim (F8 via A5) | the linked patient, with the claim row as fallback (the claim row alone before admission) | identifiers, name, phone, gender, birth date; `id` `1` |
| Communication-reply Patient | reply to a query (F12 via A7) | lifted unchanged from the queried leg's sent bundle; when no leg went out, built as the claim-bundle Patient from the **claim row only** | as above |
| Eligibility Patient | CoverageEligibilityRequest bundle (F2 via A2) | the member id, plus a discovery's handles | identifiers (and a discovery's mobile), nothing else; no `id` |

**Identifiers.** The member id goes twice, whatever the payer, as NHA's sample bundles send it [REF](../references/PAYERS.md#markers): first typed `PMJAY` "Pradhan Mantri Jan Aarogya Yojana (PMJAY) ID" under `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code`, last typed `MB` "Member Number" under `http://terminology.hl7.org/CodeSystem/v2-0203`. The ABHA number, typed `ABHA`, goes between the two when one is known. No `system` on any of them. A Patient with no member id (a discovery by policy number) carries the ABHA identifier alone, when given. The facility MRN and the ABHA address are not sent.

**Fallbacks.** The claim-bundle Patient takes each demographic from the linked patient (`D3 patient`, the one the claim is linked to through `D9 claim.patient_id` when the admission is linked; linking requires a current IPD stay of a patient whose ABHA number matches the claim's, digits only) and falls back to the claim row. The ABHA number is the claim row's, else the linked patient's. The claim row's values come from the policy search (A1: name, ABHA number, mobile number) and are overwritten by the payer's Patient when an eligibility reply arrives (C2: name, gender, birth date, ABHA, address, photo). A pre-authorisation may be sent before admission, with no patient linked: its Patient is then built from the claim row alone.

**Eligibility Patient.** Demographics are deliberately not sent: they are the payer's to return. The builder takes the identifiers only, so A2 need not read the linked patient at all (a check runs before any patient is linked); a name, gender, birth date, phone, MRN, district or state handed to it is ignored.

#### F15F. FIELDS
**Claim-bundle Patient (sent)**

| Element path | Value or source | Cardinality / notes |
|---|---|---|
| `id` | `1` | |
| `meta.profile[0]` | `.../StructureDefinition/Patient` | |
| `identifier[0].type` | `PMJAY` "Pradhan Mantri Jan Aarogya Yojana (PMJAY) ID" under `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code` | always |
| `identifier[0].value` | `D9 claim.member_id` | required on the claim |
| `identifier[1].type` | `ABHA` "Ayushman Bharat Health Account (ABHA) ID" under `ndhm-identifier-type-code` | only when an ABHA number is known |
| `identifier[1].value` | `D9 claim.abha_number`, trimmed, else `D3 patient.abha_number` | |
| `identifier[last].type` | `MB` "Member Number" under `http://terminology.hl7.org/CodeSystem/v2-0203` | always |
| `identifier[last].value` | `D9 claim.member_id` | |
| `name[0].text` | `D3 patient.name`, else `D9 claim.beneficiary_name` | always present, empty text if both are empty |
| `telecom[0]` | `{system: "phone", value: D3 patient.phone, else D9 claim.mobile_number}` | only when a phone is known |
| `gender` | `D3 patient.gender`, else `D9 claim.patient_gender`, lower-cased | only when known |
| `birthDate` | `D3 patient.birth_date`, else `D9 claim.patient_dob` | only when known |

Not sent: `address`, `photo`, `given`/`family` names, MRN, ABHA address, `active`, `deceased`.

**Eligibility Patient (sent)**

| Element path | Value or source |
|---|---|
| `meta.profile[0]` | `.../StructureDefinition/Patient` |
| `identifier[0]` and `identifier[last]` | types `PMJAY` and `MB` (as above), value the member id entered on the check form (A2); left out on a discovery by policy number |
| `identifier[]` typed `ABHA`, between the two | the ABHA number given as additional information on a discovery (A2); on a discovery by policy number, with no member id, it is the only member-side identifier |
| `identifier[]` typed `ADN` "Adhaar number" under `ndhm-identifier-type-code` | the Aadhaar number given as additional information on a discovery (A2), 12 digits; absent otherwise |
| `telecom[0]` | `{system: "phone", value: <mobile>}`, the mobile given as additional information on a discovery; absent otherwise |

**Payer's Patient (received, eligibility reply)**. The reply repeats the request's Patient and appends the payer's, one per member on a family card; every payer Patient is read into the beneficiaries list and the chosen one onto `D9 claim` ([F3. CoverageEligibilityResponse](F3-coverage-eligibility-response.md), C2. Coverage Eligibility Verdict (in nhcx-coverage)):

| Element path | Stored in |
|---|---|
| `identifier[]` typed `MB`, else the first identifier whose type is not `ABHA`, `JHN`, `MO` or `ADN` (nor under a health-id or mobile system), else the Coverage's `subscriberId` | `member_id` of the person (payers type the member id their own way; the reader does not depend on any scheme-specific type) |
| `name[0].text`, else `given` joined with spaces, else `family` | `beneficiary_name` |
| `gender` | `patient_gender` |
| `birthDate` | `patient_dob` |
| `address[0].line[]`, `.district`, `.state`, `.postalCode` | `patient_address`, joined with `, ` |
| `identifier[]` whose first type coding code is `ABHA` | `abha_number` |
| `photo[0].data`, else `photo[0].url` | `patient_photo` |

Empty values are not written. Patients in ClaimResponse, Task, communication and payment bundles are not read.

#### F15U. USED BY
- Screens: [S9. Pre-authorisation](../screens/S9-preauthorisation.md)
- APIs: [A2. Coverage Eligibility Check](../apis/A2-coverage-eligibility-check.md), [A4. Pre-auth Submit](../apis/A4-preauth-submit.md)
- Callbacks: [C3. Authorisation Requirements Ruling](../callbacks/C3-auth-requirements-on-check.md), [C5. Pre-auth Reply](../callbacks/C5-preauth-on-submit.md), [C7. Cancel Reply](../callbacks/C7-cancel-on-submit.md), [C8. Enquiry Reply](../callbacks/C8-enquiry-on-submit.md)
- FHIR: [F2. CoverageEligibilityRequest](F2-coverage-eligibility-request.md), [F7. QuestionnaireResponse](F7-questionnaireresponse.md), [F8. Claim](F8-claim.md), [F18. Coverage](F18-coverage.md), [F19. Other bundle resources](F19-other-resources.md)
- Database: [D3. patient](../database/D3-patient.md)
