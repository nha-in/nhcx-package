# F10. Task (claim actions)

#### F10R. RESOURCE
`Task`, profile `https://nrces.in/ndhm/fhir/r4/StructureDefinition/Task`, the anchor of a bundle with profile `https://nrces.in/ndhm/fhir/r4/StructureDefinition/TaskBundle` (F1). Direction: sent (cancel, status, reprocess, release) and received (the payer's Task reply on `task/on_submit`, which carries no profile).

#### F10D. DESCRIPTION
Every follow-up on an existing case that is not a Claim goes as a Task asking the payer to do something with that case. Four kinds are sent:

| Kind | Asks | Leg | Anchor (`entry[0].fullUrl`) | Bundle `id` |
|---|---|---|---|---|
| cancel | withdraw the pre-authorisation | pre-authorisation | `https://nhcx.abdm.gov.in/preauth/cancel` | `preauth-cancel-request-generic` |
| status | where does the leg stand | pre-authorisation or claim | `.../preauth/status` or `.../claim/status` | `preauth-status-request-generic` or `claim-status-request-generic` |
| reprocess | look at a rejected claim again, with evidence | claim | `.../claim/reprocess` | `claim-reprocess-request-generic` |
| release | pay the unpaid balance of a partly paid claim | claim | `.../claim/release` | `claim-release-request-generic` |

**Bundle entries**, in order: the Task at the anchor, then the provider Organization at `https://nhcx.abdm.gov.in/provider` and the payer Organization at `.../payer` (F17). No resource in a Task bundle carries an `id`. There is no Patient: the beneficiary is named on a reprocess Task's `for` only.

**Common to every kind:** `status` `requested`, `intent` `order`, `code` on `http://terminology.hl7.org/CodeSystem/financialtaskcode` with **no display**, `authoredOn` now, `requester` the provider, `owner` the payer. Inputs are typed on `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-task-input-type-code` and carry a `valueString`, except the release amount. Reasons are on `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-reason-code`. "The claim number" is the number the leg went out under (D18 or D20 `claim_ref`), else the current D9 `claim.claim_no`.

Rules:
- The input that names the case beside `claimNumber`, on a cancel and a reprocess, is a payer adapter property (see [PAYERS.md](../references/PAYERS.md), "The adapters") [PAYER](../references/PAYERS.md#markers): the misspelt `initimationNumber` under the `gov` adapter (PMJAY), `intimationNumber` under `generic`, the same for both kinds. Spelt `intimationNumber`, the PMJAY sandbox refused a cancel with ERR-PYR-CLM-007 "No prior preauthorization or claim record found for case number Claim/cancel/<claim number>"; the same cancel spelt `initimationNumber` was accepted (PC02) [SANDBOX](../references/PAYERS.md#markers). An earlier run saw PMJAY refuse a **reprocess** spelt `initimationNumber` with PAYR-1008 [SANDBOX](../references/PAYERS.md#markers); the property is set from what the payer accepts, never hard-coded, and is one value per adapter today.
- A cancel with reason `other` needs a note: it is the only thing the payer can read.
- A status Task is not in the NHCX reference bundles. It is the same shape on `/<leg>/status`, sent on the task route because the NHCX sandbox refuses `v1/status` (A6) [SANDBOX](../references/PAYERS.md#markers). Its `x-hcx-workflow_id` is always `1`: no NHCX workflow code names a status check (its Task codes are 36, reprocess, and PC01, cancel), so it never carries the leg's correlation id (a UUID is not a workflow id) nor a stage code that means something else. It is offered on the pre-authorisation only while that leg is `submitting`, and on the claim once the claim is raised.
- The payment acknowledgement is also a Task on the same pattern (code `status`, status `completed`); it is specified in F14.
- A reprocess or release names the claim twice: on `basedOn` (a `CLN` identifier) and as the `claimNumber` input.
- A reprocess (`x-hcx-workflow_id` 36) is offered and sent only for a claim the payer has **rejected** (D20 `rejected`; "Only a claim the payer has rejected can be sent back for reprocessing."). A decided claim is never sent again as a claim (D20), so a reprocess is the only way back for a rejected one; an `approved` or `partial` claim asks for its unpaid balance with a release instead [PAYER](../references/PAYERS.md#markers).

**The payer's reply** is a Task bundle: the payer's Task, and usually a ClaimResponse that the Task's `output[].valueReference` points at, resolved inside the same bundle by `fullUrl` (or by resource `id` after any `urn:uuid:` prefix) and read as F9. The reply's own `code` (for example `approve` on `http://hl7.org/fhir/CodeSystem/task-code`), `requester`, `owner` and anchors are not read.

| Reply to | Accepted when | Then |
|---|---|---|
| cancel (C7) | Task `status` is absent, `completed` or `accepted`, and the ClaimResponse `outcome` is not `error` | pre-authorisation `cancelled`; the claim number is retired and the case continues under a new number |
| cancel (C7), otherwise | | pre-authorisation back to the status it had before the cancel (`pre_cancel_status`, else `approved`) with "The payer did not accept the cancellation." |
| status (C8) | always answered (a payer may refuse the enquiry instead; PMJAY does, see [PAYERS.md](../references/PAYERS.md) [PAYER](../references/PAYERS.md#markers)) | the entity status is taken from the envelope header `x-hcx-status_response.entity_status`, else the Task output coded `claimStatus` (`valueString`), else `not-found` when the Task `status` is `rejected`, else `unknown` |
| reprocess, release (C8) | Task `status` is `completed`, `accepted` or `in-progress` | `reopened`: the claim leg goes back to `submitting` and the new verdict arrives on the claim's own thread (F9) |
| reprocess, release (C8), otherwise | | `refused` |

When several Task replies are on a cancel thread (two payer copies can answer one Task [SANDBOX](../references/PAYERS.md#markers)), any acceptance wins over refusals, and for 15 minutes after a refusal the thread is still watched for a late acceptance [REF](../references/PAYERS.md#markers).

#### F10F. FIELDS
Sent Task, per kind:

| Element | cancel | status | reprocess | release |
|---|---|---|---|---|
| `meta.profile[0]` | `.../StructureDefinition/Task` | same | same | same |
| `status` / `intent` | `requested` / `order` | same | same | same |
| `code.coding[0].code` | `cancel` | `status` | `reprocess` | `release` |
| `authoredOn` | now, `+05:30` | same | same | same |
| `requester.reference` | `https://nhcx.abdm.gov.in/provider` | same | same | same |
| `owner.reference` | `https://nhcx.abdm.gov.in/payer` | same | same | same |
| `description` | the operator's note (D18 `claim_preauth.cancel_note`), else "Cancel the preauthorization `<claim number>`" | "Status of `<claim number>`" | the reason in words (required; D29 `claim_enquiry.reason`) | the note (D29 `reason`), else "Release the balance amount for claim `<claim number>`" |
| `reasonCode` | D18 `cancel_reason` with its display (table below) | none | D29 `reason_code` with its display (table below) | `partialpayment` "Reprocess request due to partial payment by payer" |
| `basedOn[0]` | none | none | `{identifier: {type: ndhm-identifier-type-code CLN "Claim number", system: "https://nhcx.abdm.gov.in", value: <claim number>}, display: "Claim <claim number>"}` | same as reprocess |
| `input[]` `claimNumber` "ClaimNumber" | the claim number | the claim number | the claim number | the claim number |
| `input[]` the intimation input, type code from the adapter (`initimationNumber` under `gov`, `intimationNumber` under `generic`) [PAYER](../references/PAYERS.md#markers), display "Intimation Number" | the claim number | none | the claim number | none |
| `input[]` `document` "Document" | none | none | one per chosen D28 document: `valueAttachment {contentType: D28 content_type (else application/pdf), data: base64, title: D28 label, else filename}`; ids kept in D29 `document_ids` | none |
| `input[]` `amount` "Amount" | none | none | none | type on `https://nhcx.abdm.gov.in/task-input-type`; `valueMoney {value: the amount owed as entered on the release form, rounded to 2 decimals, currency: "INR"}` (also stored in D29 `amount`; the sent bundle is in D29 `request_json`) |
| `for.identifier` | none | none | value D9 `claim.member_id`; type `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code` `PMJAY` "Pradhan Mantri Jan Aarogya Yojana (PMJAY) ID" on the `gov` adapter, else `http://terminology.hl7.org/CodeSystem/v2-0203` `MB` "Member Number" [PAYER](../references/PAYERS.md#markers) | none |

Cancel reasons (`reasonCode`):

| Code | Display |
|---|---|
| `treatmentplanchanged` | Treatment plan changed during hospitalization |
| `patientrequest` | Patient requested cancellation |
| `financialconstraints` | Financial constraints |
| `alternativetreatment` | Alternative treatment chosen |
| `duplicateclaim` | Duplicate claim / preauth |
| `administrativeerror` | Administrative error |
| `other` | Other reason |

Reprocess reasons (`reasonCode`; both adapters allow the two a rejected claim can carry, see [PAYERS.md](../references/PAYERS.md)) [PAYER](../references/PAYERS.md#markers):

| Code | Display |
|---|---|
| `claimrejected` | Reprocess request due to claim rejected by payer |
| `rejectiondisputed` | Rejection disputed, additional evidence provided |

`partialpayment` ("Reprocess request due to partial payment by payer") is not a reprocess reason: a partly paid claim is not rejected. It is the fixed `reasonCode` of the release Task.

A reprocess with no description of its own defaults to "Reprocess the claim `<claim number>`" (or "Please cancel the preauth for claim `<claim number>`" with reason `partialpayment`, a quirk kept as is [REF](../references/PAYERS.md#markers), reached only by a row written before reprocess was limited to rejected claims), but the application always requires the reason text, so the default is not reached from the screens.

Received Task reply, elements read:

| Element read | Stored in | Notes |
|---|---|---|
| `Task.status` | cancel: decides accepted (above); reprocess / release: D29 `claim_enquiry.answer` `reopened` or `refused` | |
| `Task.output[].valueReference.reference` | resolves the ClaimResponse in the bundle | read as F9 |
| ClaimResponse `outcome`, `disposition` (F9) | cancel: D18 `claim_preauth.outcome`, `.disposition`; reprocess / release: D29 `detail` = the disposition, else the Task `description` | an `outcome` of `error` refuses a cancel |
| `Task.output[]` with `type.coding[0].code` `claimStatus`, `valueString` | status: D29 `answer`, when the header gives none | |
| `Task.description` | status: D29 `detail` (first part) | |
| envelope `x-hcx-status_response` (object, or a string holding JSON): `entity_status`, `stage`, `outcome`, `total_approved`, `total_paid` | status: D29 `answer` = `entity_status`; `detail` adds "stage: ...; outcome: ...; total_approved: ...; total_paid: ..." joined with "; " | not FHIR, a protocol header |
| the whole bundle | D18 `response_json` (cancel), D29 `response_json` (others) | D29 `status` `answered`, `answered_at` |

#### F10U. USED BY
- APIs: [A7. Communication Reply](../apis/A7-communication-on-request.md)
- FHIR: [F1. Bundle](F1-bundle.md), [F17. Organization](F17-organization.md)
