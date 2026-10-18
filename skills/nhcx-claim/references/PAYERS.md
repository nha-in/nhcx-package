# Payers

NHCX standardises the envelope, not what a payer puts in it. Package codes, the workflow id each exchange travels under, how a payer asks a question, whether it rules on authorisation requirements: these differ by payer. The application keeps them in one place, a **payer adapter**, chosen per payer participant code, and the exchange code asks the adapter instead of hard-coding a scheme. This page is that one place.

## Markers

The specs mark every statement that is not the NHCX protocol itself:

| Marker | Means | What to do |
|---|---|---|
| [REF](PAYERS.md#markers) | A choice the reference implementation made (a layout, a label, an id format, a default). The protocol does not require it. | Follow it unless the target has a reason not to; record a different choice in `nhcx-plan/plan.json`. |
| [PAYER](PAYERS.md#markers) | Behaviour that depends on the payer adapter (for example a PMJAY rule or a workflow id). | Read the value from the adapter below, never hard-code it; check it against the knowledge source. |
| [SANDBOX](PAYERS.md#markers) | Something observed on the NHCX sandbox or a sandbox payer, not written in any specification. | Expect it in the sandbox; do not rely on it in production without confirming it. |

Unmarked statements are the protocol or this application's own design, and are followed as written. On the protocol the knowledge source ([KNOWLEDGE.md](KNOWLEDGE.md)) wins.

## Choosing the adapter

There are two adapters, `gov` (a government scheme: PMJAY and the State Health Agencies) and `generic` (every other payer). They are chosen per payer, in this order:

1. **The participant master's entity type** ([D32. participant](../database/D32-participant.md), the registry's list of PAYER and TPA participants pulled daily, each flagged `gov` or `pvt`): a payer flagged `gov` gets the `gov` adapter, any other flag gets `generic`. This decides for every payer the master holds.
2. A payer the master does not hold: a **configuration row** mapping its participant code to an adapter key (in the reference implementation, rows of kind `payer_adapter` in the code lists, [D8. terminology](../database/D8-terminology.md), with the participant code as `code`, a label as `display` and the adapter key as `extra`), then a module setting mapping codes to adapter keys.
3. Else its **registered name**: a name that starts with `SHA` (a State Health Agency) gets `gov`. The match ignores case and leading spaces. The name is the one remembered, else the participant master's, else looked up once on the participant registry ([G4. Registry and Certificates](../gateway/G4-registry.md)) when the payer is first used and remembered; a lookup that fails is tried again after a few minutes.
4. Else `generic`: a plain NRCeS bundle with none of a scheme's extras. A new payer therefore needs no configuration.

- The retired keys are read as today's, so stored rows and overrides keep working: `pmjay` reads as `gov`, `kyrocare` as `generic`.
- The adapter is chosen by the policy's **payer id**. Messages are addressed to its **processing id** (the participant that handles the policy on NHCX), which can be a different code; see [CORE.md](CORE.md).
- Codes are matched on their numeric part, so `1518`, `1518@hcx` and `1518@HCX` are the same payer.
- **The adapter's name is never shown to the desk.** The payer's name shown anywhere is its registered name on the participant registry ([G4. Registry and Certificates](../gateway/G4-registry.md)), from the master or cached in the application, never a configuration row's `display`, the adapter's name, the search row's `payerName` or a configured default (registry names seen in the sandbox: `Sandbox Payer` for the IRDAI test payer, `SHA HP` for the PMJAY test payer). A payer whose registry lookup failed is shown by its code.
- A workflow id missing from an adapter's table falls back to the `gov` table's value for that kind; a kind no table defines is refused ("No workflow id is defined for '<kind>'.").

## The adapters

| Property | `gov` (PMJAY, State Health Agency) | `generic` |
|---|---|---|
| Payer code system | `https://payer.pmjay.nha.gov.in` | `https://nhcx.abdm.gov.in` |
| Programme code on every claim line | `AB-PMJAY` ("Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)") | none |
| Authorisation requirements check (A2 `auth-requirements`, C3) sent on its own before a pre-authorisation or an enhancement | yes | no (a payer with nothing to say only slows the send) |
| Authorisation requirements check asked by the desk (the "Authorisation requirements" card on the Pre-authorisation tab, once a line is quoted) | allowed, optional, never a condition of the send | allowed, optional, never a condition of the send |
| Benefits check on the quoted set (A2 `benefits`, the "Coverage benefits check" card beside it) | allowed, optional, never a condition of the send | allowed, optional, never a condition of the send |
| Discharge intimation before the claim (S11, only when the integration asks for it) | none over NHCX: the discharge rides on the claim | none, unless the payer defines one |
| Document stages wanted at pre-authorisation | `pre` | `pre` |
| Health records as FHIR (D28 "From records" sent as a `DocumentReference` with `application/fhir+json`, F19) | yes: the live PMJAY provider sends the hospital's structured records this way and PMJAY adjudicates them [PAYER](PAYERS.md#markers) | yes, the NRCES Claim profile allows it; a payer that refuses the entry is set to `no` and gets the record's PDF as a `valueAttachment` instead |
| STG checklists (D12 `stgquestionnaire`) | called STQ; one per package per stage, a pre-authorisation STQ and a claim STQ, classified by D11's stage rule from the requirement and the questionnaire title; the ruling never names them | those the plan ships, staged by the same D11 rule |
| Publishes a package master (A3, C4) | yes; a second request for the same policy is refused while one is outstanding (PAYR-1406), so none is sent while one is `fetching` [SANDBOX](PAYERS.md#markers) | yes |
| Multiple-procedure factors (`Claim.item.factor`) | 1, 0.5, 0.25 (costliest in full, second at half, the rest at a quarter) | none |
| How it asks for more (query mode) | `resubmit`: the query is a ClaimResponse on the case's own thread (a line-item query names the queried items), answered by submitting the leg again from its tab under the query-response workflow id; a CommunicationRequest from it is a notification, acknowledged, never answered | `communication`: a CommunicationRequest on a thread of its own, answered with a Communication (A7) on the Communication tab; a line-item query in a ClaimResponse is still answered by resubmitting |
| Task input naming the case beside `claimNumber` (A6, F10), one value per adapter for every Task kind | `initimationNumber`, the payer's own misspelling (`intimationNumber` is refused on a cancel with ERR-PYR-CLM-007) [SANDBOX](PAYERS.md#markers); an earlier run saw a reprocess spelt `initimationNumber` refused with PAYR-1008 [SANDBOX](PAYERS.md#markers), so the value is set from what the payer accepts | `intimationNumber` |
| Answers a status enquiry (A6 status) | no: it refuses the Task (PAYR-1018, or PAYR-1008 with a reason code); read the case's state from its desk instead | yes |
| Proof of presence (A18, S18) | required: the beneficiary's user token on the headers of the eligibility check, pre-authorisation and claim, else the Authentication Consent (questionnaire `100024`) answered in the pre-authorisation bundle and the Discharge Consent (`100466`) in the claim bundle; both are attachment questions (the signed declaration), so the desk uploads them on the leg's forms card, which offers the form whenever no token is held even when nothing lists it; refused by name without either (PAYR-1256, PAYR-1363) | optional: the token is sent when the desk has one; required as under `gov` when the plan's policy documents carry code ADN (proof of identity POI/ADN) |
| Reprocess reason codes | `claimrejected`, `rejectiondisputed`: a reprocess is asked only of a rejected claim | same |
| Reprocess member type | `PMJAY` | `MB` |
| Adjudication desk (sandbox testing, A14, A15) | the NHCX Payer Service | none (the IRDAI test payer's desk is fixed, [Test participants](#test-participants)) |

The authorisation requirements check is not a scheme feature and is not required of anyone. The desk may ask any payer for a ruling; a payer with nothing to say answers without one. No pre-authorisation waits for a ruling, and the adapter only decides whether the check also goes out unasked before a send.

## Workflow ids

The `x-hcx-workflow_id` each send travels under, per adapter, the `x-hcx-status` NHA's workflow sheet pairs it with, and the status the send actually goes with. An environment override may replace any workflow id (an override still written under a retired key, `pmjay`, applies to `gov`). The status is set by the send, never by the gateway's path default: every send to a request path, query answers included, is `request.initiated` (NHCX refuses `response.complete` on `v1/preauth/submit` and `v1/claim/submit` with NHCX-1011 [SANDBOX](PAYERS.md#markers), and the live PMJAY provider sends its 19 and 161 as `request.initiated` [PAYER](PAYERS.md#markers)); only a send on an `on_` path is `response.complete`. Where the two columns differ, "Sent as" is what goes out. A query answer refused at the door leaves the leg `queried`, its question still open.

| Send (kind) | `gov` | `generic` | API | NHA's `x-hcx-status` | Sent as |
|---|---|---|---|---|---|
| Pre-authorisation (`preauth`) | 12 | 12 | A4 | `request.initiated` | `request.initiated` |
| Pre-auth resubmitted after a rejection (`preauth_resubmit`) | 121 | 121 | A4 (defined; the reference send logic never chooses it) | `request.initiated` | `request.initiated` |
| Pre-auth query answer (`preauth_query_response`) | 19 | 19 | A4 | `response.complete` | `request.initiated` [SANDBOX](PAYERS.md#markers) |
| Enhancement (`enhancement`) | 13 | 13 | A4 | `request.initiated` | `request.initiated` |
| Enhancement query answer (`enhancement_resubmit`) | 131 | 131 | A4 | `response.complete` | `request.initiated` [SANDBOX](PAYERS.md#markers) |
| Cancel (`cancel`) | PC01 | PC01 | A6 | `request.initiated` | `request.initiated` |
| Claim (`claim`) | 15 | 15 | A5 | `request.initiated` | `request.initiated` |
| Claim resubmitted (`claim_resubmit`) | not offered: PMJAY refuses 16 with PAYR-1321 [SANDBOX](PAYERS.md#markers) | not offered: a decided claim is never sent again; a rejected one goes back as a reprocess (A6, 36) | A5 | `request.initiated` | `request.initiated` |
| Claim query answer (`claim_query_response`) | 151, the published value, as the adapter default; the SHA sandbox refuses 151 and 19 with PAYR-1321 and takes 161, so a sandbox run sets 161 as a configuration override, never as the adapter's value [SANDBOX](PAYERS.md#markers) | 151 | A5 | `response.complete` | `request.initiated` [SANDBOX](PAYERS.md#markers) |
| Payment acknowledgement (`payment_ack`) | 17 | the notice's own workflow id, echoed back | A8 | `response.complete` | `response.complete` |
| Reprocess (`reprocess`) | 36 | 36 | A6 | `request.initiated` | `request.initiated` |
| Balance release (`release`) | 36 | 36 | A6 | `request.initiated` | `request.initiated` |

Three sends do not take their workflow id from this table. **The eligibility check (A2, every purpose) sends `11`** (Patient Admitted, NHA's own sample) by default, with a module setting (`eligibility_workflow_id`: `11` or `case`) to send the case number instead for a payer that wants it; both are accepted by the sandbox payers. **The insurance plan request (A3) sends `1`**: the plan belongs to the hospital and the policy, never to a case, NHA publishes no workflow code for it, and the live PMJAY provider sends `1` [PAYER](PAYERS.md#markers); the case number is never sent (a legacy `case` setting reads as `1`). **The status enquiry (A6 status) sends `1` always**: NHCX's workflow codes name no status check (its only Task codes are 36 and PC01), so it never carries the leg's correlation id. Confirm against the knowledge source (`workflow.yaml` in the package).

The payer's replies carry workflow ids of their own [PAYER](PAYERS.md#markers). The callbacks never route on them; they match on correlation ids. They do read them for the **status**: when a reply's `x-hcx-workflow_id` is one of the payer-side codes below, that code says what the reply is, and the bundle is read for the amounts and words only. A workflow id outside the list (a case number echoed back, for example) says nothing, and the bundle decides as [F9. ClaimResponse](../fhir/F9-claimresponse.md) describes.

| Reply workflow id | Leg status |
|---|---|
| 20, 25, 18, 251, 28, 29, 37 | `submitting`: received and under adjudication, an acknowledgement |
| 21, 22, 26, 252 | `approved` (`partial` when the bundle says the approval is partial) |
| 23, 231, 291, 253 | `rejected` |
| 24, 241, 27, 254 | `queried` |

An error wins over both: a reply with `x-hcx-status` `response.error`, a `ClaimResponse.error`, or an `error` outcome that is not a rejection is an error whatever its workflow id (see [F9. ClaimResponse](../fhir/F9-claimresponse.md)).

## Use case

Every pre-authorisation and claim send carries `x-hcx-use_case`, to every payer, whether or not the payer reads it. It is the same for all adapters.

| Send (kind) | `x-hcx-use_case` |
|---|---|
| `preauth`, `claim` | `New` |
| `enhancement` | `Enhancement` |
| `preauth_resubmit`, `preauth_query_response`, `enhancement_resubmit`, `claim_query_response`, `claim_resubmit` | `Resubmit` |

## Sandbox participant codes

Seen in the reference implementation's sandbox runs [SANDBOX](PAYERS.md#markers). They are examples, not constants: a build reads every participant code from configuration.

| Code | Is |
|---|---|
| `1518@hcx` | the PMJAY (NHA) payer on the NHCX sandbox, adapter `gov` |
| `1000004805@hcx` | the reference implementation's IRDAI sandbox payer portal, adapter `generic` |

What the sandbox registry finds [SANDBOX](PAYERS.md#markers): the IRDAI test beneficiary `MRAJ2004001` is found by **Member id** and not by the same person's ABHA number (`91-3333-2222-1111` returns no policy); a search by ABHA `91-7182-8065-4077` also returns no policy; and no search returns a beneficiary name (S2 shows "Unknown" by design, the name arrives with the eligibility verdict). A policy search started from the patient master (S13. Patient List (in nhcx-coverage), S15. Patient Detail (in nhcx-coverage)) must therefore offer Member id beside the ABHA number and mobile.

## Test participants

The end-to-end tests ([TESTS.md](TESTS.md)) run against two payers. The values below are the defaults the test configuration ([T1. Test Configuration](../tests/T1-test-configuration.md)) starts from, except where the table says otherwise.

| Test payer | Participant code | Adapter | Adjudication desk (A14, A15) | Member id | Variable |
|---|---|---|---|---|---|
| IRDAI test payer | `1000004957@hcx` (Sandbox Payer NHA) | `generic` | IRDAI payer desk (`irdai-payer`), fixed at `https://nhcxai.abdm.gov.in/uat/` (API at `/api/payer`), signed in to by token login | `MRAJ2004001` | `NHCX_TEST_IRDAI_PAYER`, `NHCX_TEST_IRDAI_MEMBER_ID` |
| PMJAY test payer | `1518@hcx` (PMJAY, NHA) | `gov` | NHCX Payer Service (`nhcx-payer-service`) | asked from the integrator, no default | `NHCX_TEST_PMJAY_PAYER`, `NHCX_TEST_PMJAY_MEMBER_ID` |

**The IRDAI payer desk is fixed.** It is not a setting and has no variable: its screens are at `https://nhcxai.abdm.gov.in/uat/`, its API at `https://nhcxai.abdm.gov.in/api/payer`. It is signed in to only by token login, with the facility's own ABDM session token (A14): there is no username, password or desk account to configure or ask for.

**PMJAY needs one value only the integrator has**: a PMJAY beneficiary's member id that the sandbox knows. It is asked from the integrator ([T1. Test Configuration](../tests/T1-test-configuration.md)), never guessed or taken from an example, and a PMJAY test without it is `blocked` with that reason. The beneficiary's ABHA number is not asked for: the registry returns it with the policy (A1. Policy Search (in nhcx-coverage)). The facility's HFR id is not asked for either: it is the one on the facility's own record ([D1. organization](../database/D1-organization.md)), which every bundle already carries.

**PMJAY's package master is slow, may not arrive at all, and is never waited for.** The PMJAY sandbox has answered an insurance plan request (A3. Insurance Plan Request (in nhcx-preauth)) in 15 to 60 minutes, and has also not answered within a whole session (requested at 20:23, still `fetching` after 50 minutes); meanwhile it refuses a second request for the same policy (PAYR-1406) [SANDBOX](PAYERS.md#markers). Nothing may depend on it: the tests request it once and move on, and run on a seeded package master instead (T13. PMJAY Eligibility, Package Master and Ruling (in nhcx-coverage)), which is the only source of PMJAY STG questions in a sandbox run. Note also that the knowledge package's PMJAY plan sample (`fhir/C4/C4-response-pmjay.json`) carries five plan questionnaires and **no** STG questionnaires, so neither the sample nor a late plan supplies them.
