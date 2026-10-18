# F9. ClaimResponse

#### F9R. RESOURCE
`ClaimResponse`, no profile, the `SUBSETTED` tag (F1). Direction: sent on `v1/preauth/on_submit` (a pre-authorisation, an enhancement, a predetermination: A3. Pre-auth Answer (in nhcx-preauth/payer), A10. Predetermination Quote (in nhcx-preauth/payer)) and on `v1/claim/on_submit` (a claim: A4. Claim Answer (in nhcx-claim/payer)), on the submission's correlation id; and inside the Task answer on `v1/task/on_submit` when a reprocessed claim is decided (F10, A9. Task Answer (in nhcx-preauth/payer)). Beside it, in the scheme's order: the Patient (F15), the payer Organization, the hospital Organization (F17), the Coverage (F18), every fullUrl resolvable under `<payer base>/preauthorization/v1/preauth/on_submit/claimresponse` or `<payer base>/claim/v1/claim/on_submit/claimresponse`.

#### F9D. DESCRIPTION
The same resource is sent twice on one thread: once when the submission is filed and once when a person decides. Nothing in it is decided by rules; everything comes off the case ([D19. case](../database/D19-case.md)) and its lines ([D25. case_line_item](../database/D25-case-line-item.md)).

**Outcome and status together.** A hospital never reads `outcome` alone: it takes `outcome` and the claim-level `adjudication[]` entry categorised `status` as a pair [PAYER](../references/PAYERS.md#markers). This payer writes exactly one such entry, `category.coding[0].code` `status`, `reason.coding[0].code` the word, neither on a code system, and the pair is:

| Case decision (`D19.adjudication_status`) | `outcome` | status reason | `disposition` |
|---|---|---|---|
| `pending` (the acknowledgement at filing) | `queued` | `submitted` | "Request acknowledged and accepted for further processing." |
| `approved`, in full | `complete` | `approved` | the remarks, else "Pre-authorisation approved for INR <approved>." |
| `approved`, less than claimed | `partial` | `approved` | the remarks, else "... approved for INR <approved> of INR <claimed> claimed." |
| `rejected` | `error` | `rejected` | the remarks, else "Pre-authorisation rejected." |
| `queried` | `partial` | `queried` | the remarks, else "More information is needed before this can be decided." |
| `cancelled` | `error` | `cancelled` | "The pre-authorisation was withdrawn." |

"Claim" replaces "Pre-authorisation" on the claim leg. A predetermination adds every rule finding to the disposition as "<rule> [<severity>] <path>: sent <x>; required <y>. <remedy>", because the scheme carries no `error[]` and no `processNote` and the disposition is the only place a finding can live [REF](../references/PAYERS.md#markers) (A10. Predetermination Quote (in nhcx-preauth/payer)).

The acknowledgement goes out under workflow 20 (pre-authorisation) or 25 (claim) with `x-hcx-status` `response.partial`; a verdict under 21, 22, 23, 231, 26 or 291 with `response.complete` ([PAYERS.md](../references/PAYERS.md)) [PAYER](../references/PAYERS.md#markers). A **line-item query** is sent as this ClaimResponse, the PMJAY way [PAYER](../references/PAYERS.md#markers): the queried pair above (`partial`, `queried`), each queried line's item status `Queried` with its question as the reason, on the submission's own thread under 24, 241 or 27 with `response.complete` [REF](../references/PAYERS.md#markers) (A3. Pre-auth Answer (in nhcx-preauth/payer), A4. Claim Answer (in nhcx-claim/payer)). It does not mark the thread answered: the hospital answers by resubmitting, and the decision on the resubmission is the verdict. A question on the case as a whole is not a ClaimResponse: it travels as F11 on its own thread ([A5. Query Request](../apis/A5-query-request.md)), and the queried pair is then only what a status enquiry or a preview renders.

**Per item.** One `item[]` per line of the case in position order, `itemSequence` from 1, `id` `Item/<D25.id>`, and four adjudications on the scheme's value set `https://hl7.org/fhir/R4/valueset-adjudication.html`: `submitted` (the claimed amount), `eligible` (the approved amount), `reason` (the adjudicator's words as a coding display: the query remarks, else the remarks, else "Not payable under this policy." on a rejected line; blank when the line was allowed in full, and then the disposition), and `status` (`Requested` until decided, then `Approved` for approved and partly approved lines, `Rejected`, `Queried`). A hospital keys its per-item table on these categories [PAYER](../references/PAYERS.md#markers).

**Totals by category, never by position.** `benefit` (the approved total), `submitted` (the claimed total), and `eligible` (the approved total again, with the element `id` `<member id>/<plan code>` the scheme writes). A pre-authorisation query carries no `eligible` total, as the scheme's does not; a claim query keeps it [REF](../references/PAYERS.md#markers).

**`preAuthRef`.** This payer's case number (`D19.claim_no`, `CL/<yy>/<mmdd><serial>` [REF](../references/PAYERS.md#markers)) on every pre-authorisation answer, the rejection included, and on the claim's acknowledgement but not on the claim's verdict, which is where the scheme writes it [PAYER](../references/PAYERS.md#markers). The hospital keeps the reference and quotes it on the claim; on the desk the case is found by it and by the hospital's own claim number (C5. Claim Submit (in nhcx-claim/payer)).

`type` (SNOMED `737481003` "Inpatient care management (procedure)" on `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-claim-type`) is written on the pre-authorisation acknowledgement and on a Task's ClaimResponse only, as the scheme does [REF](../references/PAYERS.md#markers).

#### F9F. FIELDS
| Element written | From | Notes |
|---|---|---|
| `id` | the hospital's claim number: `D19.nhcx_claim_ref` (pre-auth), `D19.nhcx_claim_submission_ref` else `.nhcx_claim_ref` (claim), `D19.nhcx_reprocess_claim_ref` (reprocess) | |
| `identifier[0]` | type `CLN` "Claim number" (`https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code`), `system` `<payer base>/v1/<use>`, `value` the same number | what the hospital's desk searches on |
| `status` | `active` | |
| `type` | the inpatient claim type | acknowledgement and Task answers only |
| `use` | `preauthorization`, `claim` or `predetermination` | |
| `patient.reference` | `<anchor>/patient/<member id>` | `D19.member_id` |
| `created` | now, IST | |
| `insurer.reference` | `<anchor>/organization/payer/<payer code without @hcx>` | `D1.nhcx_participant_id` |
| `requestor.reference` | `<anchor>/organization/provider/<D19.hospital_hfr_id>` | else the recipient code's numeric part |
| `outcome` | the table | |
| `disposition` | `D19.adjudication_remarks`, else the sentence; findings appended on a quote | |
| `preAuthRef` | `D19.claim_no` | pre-authorisation, and the claim acknowledgement |
| `payeeType` | `provider` "Provider" (`http://terminology.hl7.org/CodeSystem/payeetype`) | |
| `item[].itemSequence` | position of the `D25` row, from 1 | |
| `item[].adjudication[]` `submitted`, `eligible` | `D25.claimed_amount`, `D25.approved_amount` | |
| `item[].adjudication[]` `reason` | `D25.query_remarks`, else `D25.remarks`, else the default | display only, no code |
| `item[].adjudication[]` `status` | from `D25.status` | code and display the same word |
| `adjudication[0]` | category `status`, reason the word | one entry |
| `total[]` `benefit`, `submitted` | `D19.total_approved`, `D19.total_claimed` | |
| `total[]` `eligible` | `D19.total_approved`, `id` `<D19.member_id>/<D12.uin>` | not on a pre-authorisation query |

#### F9U. USED BY
- APIs: [A13. Adjudicate](../apis/A13-adjudicate.md), [A15. Case Exchange Log](../apis/A15-case-exchange.md)
- FHIR: [F1. Bundle](F1-bundle.md), [F11. CommunicationRequest](F11-communicationrequest.md), [F15. Patient](F15-patient.md), [F16. Practitioner](F16-practitioner.md), [F17. Organization](F17-organization.md), [F18. Coverage](F18-coverage.md)
- Database: [D19. case](../database/D19-case.md), [D25. case_line_item](../database/D25-case-line-item.md)
- Tests: [T8. Pre-auth Queried and Answered](../tests/T8-preauth-queried.md)
