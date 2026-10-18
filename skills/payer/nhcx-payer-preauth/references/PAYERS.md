# Payers and schemes

NHCX standardises the envelope, not what a payer puts in it. Which code system a package is quoted in, whether a programme code is expected on every claim line, how a query is asked and answered, whether authorisation requirements are ruled on, and which workflow id each answer travels under: these differ by scheme. The application keeps them in one place, a **scheme profile**, chosen per hosted participant code, and the exchange code asks the profile instead of hard-coding a scheme. This page is that one place.

## Markers

The specs mark every statement that is not the NHCX protocol itself:

| Marker | Means | What to do |
|---|---|---|
| [REF](PAYERS.md#markers) | A choice the reference desk made (a layout, a label, an id format, a default, the `payer_` table prefix). The protocol does not require it. | Follow it unless the target has a reason not to; record a different choice in `nhcx-plan/plan.json`. |
| [PAYER](PAYERS.md#markers) | Behaviour that depends on the scheme profile (a PMJAY rule, a workflow id, a query mode). | Read the value from the profile below, never hard-code it; check it against the knowledge source. |
| [SANDBOX](PAYERS.md#markers) | Something observed on the NHCX sandbox or built for it (scenarios, faults, the sandbox provider EMR, multi-tenant client ids), not written in any specification. | Expect it in the sandbox; do not build it into production without confirming it. |

Unmarked statements are the protocol or this application's own design, and are followed as written. On the protocol the knowledge source ([KNOWLEDGE.md](KNOWLEDGE.md)) wins.

## Choosing the profile

- A configuration row maps each participant code this deployment answers for to a profile key. The payer's own code ([D1. payer](../database/D1-payer.md) participant code) and its processing code take the insurer's profile; a hosted scheme code (a PMJAY scheme desk beside the insurer, [G2. Configuration and Participants](../gateway/G2-configuration.md) hosted codes) takes `pmjay` [REF](PAYERS.md#markers).
- The profile is chosen by the code the request was addressed to (`x-hcx-recipient_code` of the inbound message, kept on the case as its recipient code, [D19. case](../database/D19-case.md)). Every answer on that case uses the same profile.
- Codes are matched on their numeric part, so `1518`, `1518@hcx` and `1518@HCX` are the same participant.
- A code with no row gets the **generic** profile: plain NRCeS bundles with none of any scheme's extras.

## The profiles

| Property | `pmjay` (PMJAY scheme payer, a State Health Agency) | `kyrocare` (the reference sandbox payer) | `generic` |
|---|---|---|---|
| Package code system on the plan and the ruling | `https://payer.pmjay.nha.gov.in` | this payer's own procedure system ([F5. InsurancePlan](../fhir/F5-insuranceplan.md)) [REF](PAYERS.md#markers) | this payer's own procedure system |
| Programme code expected on every claim line | `AB-PMJAY`; a line without it is still filed, with a timeline note [REF](PAYERS.md#markers) | none | none |
| Rules on authorisation requirements (`auth-requirements`, A1. Eligibility Answer (in nhcx-payer-coverage)) | yes: rate, documents and forms per package | yes | eligibility only: items answered with the cover, no requirements |
| Document stages named in the ruling | `pre`, `discharge`, `claim` from the procedure rules ([D11. procedure_rule_doc](../database/D11-procedure-rule-doc.md)) | the same | none |
| Publishes a package master (A2. Insurance Plan Answer (in nhcx-payer-coverage)) | yes | yes | yes |
| Multiple-procedure factors applied when pricing a quote ([A10. Predetermination Quote](../apis/A10-predetermination-quote.md)) | 1, 0.5, 0.25 (costliest in full, second at half, the rest at a quarter) | 1, 0.5, 0.25 | none |
| How it asks for more (query mode) | `resubmit`: the query rides in a ClaimResponse on the case's thread and the answer comes as a fresh submit under 19 or 131 ([C4. Pre-auth Submit](../callbacks/C4-preauth-submit.md)), 151 on a claim (C5. Claim Submit (in nhcx-payer-claim)) | both: a query on lines rides in the ClaimResponse on the submission's thread, PMJAY's way, answered by a resubmission ([A3. Pre-auth Answer](../apis/A3-preauth-answer.md), A4. Claim Answer (in nhcx-payer-claim), [C4. Pre-auth Submit](../callbacks/C4-preauth-submit.md), C5. Claim Submit (in nhcx-payer-claim)); a question on the case as a whole (Raise Query, or no line queried) is a CommunicationRequest on a thread of its own (A5. Query Request (in nhcx-payer-communication)), answered with a Communication (C9. Communication (in nhcx-payer-communication)) | the same as `kyrocare` |
| Acknowledges a filing at once ([A3. Pre-auth Answer](../apis/A3-preauth-answer.md), A4. Claim Answer (in nhcx-payer-claim)) | yes, `queued` on 20 or 25 | yes | yes |
| Answers a status enquiry ([A8. Status Answer](../apis/A8-status-answer.md)) | no: the live scheme refuses the Task; this desk answers anyway [REF](PAYERS.md#markers) | yes | yes |
| Reprocess reason codes it takes | `claimrejected`, `partialpayment`, `rejectiondisputed`, read as the reason's words; no code is refused | the same | the same |
| Proof of presence on a send (C2. Coverage Eligibility Check (in nhcx-payer-coverage), [C4. Pre-auth Submit](../callbacks/C4-preauth-submit.md), C5. Claim Submit (in nhcx-payer-claim)) | required by the live scheme: the beneficiary's biometric user token on the headers, else the Authentication Consent (pre-authorisation) or Discharge Consent (claim) QuestionnaireResponse; this desk records which it found | asked for on the plan only when the product requires biometric (per policy, [D12. policy](../database/D12-policy.md) `require_biometric`: the InsurancePlan then carries POI / ADN, [F5. InsurancePlan](../fhir/F5-insuranceplan.md)); a token is recorded when sent, and no send is refused without one | the same |

The `kyrocare` profile is the reference desk's own: an IRDAI-style insurer that speaks the PMJAY dialect for plans, rulings and line-item queries and asks about a case as a whole by CommunicationRequest. Replace it with the profile of the payer being built.

## Workflow ids

The `x-hcx-workflow_id` each answer or send travels under, per profile, and the `x-hcx-status` NHA's workflow sheet pairs it with. An environment override may replace any workflow id. The status is set by the send, never left to the gateway's path default: an acknowledgement goes out as `response.partial` on a response path, a query as `request.initiated` on a request path.

| Send (kind) | `pmjay` | `kyrocare` | `generic` | API | `x-hcx-status` |
|---|---|---|---|---|---|
| Pre-authorisation acknowledged (`preauth_ack`) | 20 | 20 | 20 | A3 | `response.partial` |
| Pre-authorisation approved (`preauth_approved`) | 21 | 21 | 21 | A3 | `response.complete` |
| Pre-authorisation rejected (`preauth_rejected`) | 23 | 23 | 23 | A3 | `response.complete` |
| Enhancement approved (`enhancement_approved`) | 22 | 22 | 22 | A3 | `response.complete` |
| Enhancement denied (`enhancement_denied`) | 231 | 231 | 231 | A3 | `response.complete` |
| Claim acknowledged (`claim_ack`) | 25 | 25 | 25 | A4 | `response.partial` |
| Claim approved (`claim_approved`) | 26 | 26 | 26 | A4 | `response.complete` |
| Claim rejected (`claim_rejected`) | 291 | 291 | 291 | A4 | `response.complete` |
| Query on a pre-authorisation (`preauth_query`), as a CommunicationRequest | 24 | 24 | 24 | A5 | `request.initiated` |
| Query on an enhancement (`enhancement_query`), as a CommunicationRequest | 241 | 241 | 241 | A5 | `request.initiated` |
| Query on a claim (`claim_query`), as a CommunicationRequest | 27 | 27 | 27 | A5 | `request.initiated` |
| Cancellation accomplished (`cancel_done`) | PC02 | PC02 | PC02 | A9 | `response.complete` |
| Reprocess or release acknowledged (`reprocess_ack`) | 37 | 37 | 37 | A9 | `response.complete` |
| Reprocess approved (`reprocess_approved`) | 252 | 252 | 252 | A9 | `response.complete` |
| Reprocess rejected (`reprocess_rejected`) | 253 | 253 | 253 | A9 | `response.complete` |
| Payment notice, raised and completed (`payment_notice`) | 30 | 30 | 30 | A6 | `request.initiated` |

The reprocess or release acknowledgement on 37 is the one send where the reference departs from the sheet: it goes out as `response.partial`, because the exchange closes a thread on `response.complete` and the decision that follows on the same thread (252, 253) would then have nowhere to travel [REF](PAYERS.md#markers). NHA pairs 37 with `response.complete` only, as the table says; confirm the pairing with the scheme before going live.

Answers that take no code of their own echo the request's `x-hcx-workflow_id`, all as `response.complete`, but only when it has the shape of a published workflow code (`^[A-Z]{0,2}[0-9]{1,4}$`: `1`, `11`, `121`, `PC01`): the eligibility answer and ruling (A1), the status answer (A8) and the payment-enquiry answer (A7). Anything else, such as a hospital's case number or a correlation id, is never repeated and the header is left off. The insurance plan (A2) falls back to `1` instead, because a plan request is hospital-level and the hospital sends `1` on it. The predetermination quote (A10) echoes its ask's workflow id as sent. NHA pairs 24, 241 and 27 with `request.initiated` because the query is a request this payer makes on the communication route. A **line-item query** uses the same codes but rides in the ClaimResponse on the submission's own `on_submit` thread (24, or 241 after an enhancement, on `v1/preauth/on_submit` through [A3. Pre-auth Answer](../apis/A3-preauth-answer.md); 27 on `v1/claim/on_submit` through A4. Claim Answer (in nhcx-payer-claim)), and there it goes as `response.complete`, because it answers the submission's thread, as the scheme lists 27 and as the live PMJAY payer sends it [REF](PAYERS.md#markers). Like the reprocess acknowledgement, confirm the pairing with the scheme before going live.

## What arrives

The hospital's sends carry workflow ids of their own; nothing routes on them ([C1. Callback Door](../callbacks/C1-callback-door.md) classifies by the bundle). Kept on the case's exchange log for the record:

| Arrives as | Hospital's workflow id | Status word | Taken in by |
|---|---|---|---|
| Eligibility check, ruling | 11; an older hospital sent its case number, which is not echoed [REF](PAYERS.md#markers) | `request.initiated` | C2 |
| Insurance plan request | 1: hospital-level, never case-specific | `request.initiated` | C3 |
| Status enquiry | 1 always: no NHCX code names a status check; an older hospital sent the leg's correlation id | `request.initiated` | C8 |
| Pre-authorisation | 12 | `request.initiated` | C4 |
| Pre-authorisation resubmitted after a rejection | 121 | `request.initiated` | C4 (a fresh case when the old one is closed) |
| Line-item query answered by resubmitting the pre-authorisation [PAYER](PAYERS.md#markers) | 19, 131 | `request.initiated` (NHCX refuses `response.complete` on a submit route with NHCX-1011); not read | C4 |
| Enhancement | 13 | `request.initiated` | C4 |
| Cancel | PC01 | `request.initiated` | C7 |
| Claim | 15 | `request.initiated` | C5 |
| Claim line-item query answered by sending the claim again [PAYER](PAYERS.md#markers) | 151, or 161 on the SHA sandbox [SANDBOX](PAYERS.md#markers) | `request.initiated`; not read | C5 |
| Reprocess, release | 36 | `request.initiated` | C7 |
| Payment acknowledgement | 17, or the notice's own | `response.complete` | C11 |
| Query answer as a Communication | the query's own | `response.complete` | C9 |

**A decided claim is never sent again.** A hospital does not resubmit a claim this payer has decided: a claim naming a case at `payment`, `rejected` or `settled` is refused (C5. Claim Submit (in nhcx-payer-claim)). The way back is a reprocess Task (36, [C7. Task Submit](../callbacks/C7-task-submit.md)), and the reference hospital offers one only for a claim this payer rejected (reasons `claimrejected`, `rejectiondisputed`); a release (36) asks for the balance on an approved claim and is separate. A claim refused at the door, which never reached this payer, may come again as a first filing. The claim sent again under 151 above is the answer to a line-item query on a claim still open, not a resubmission of a decision.

## Sandbox participant codes

Seen on the NHCX sandbox [SANDBOX](PAYERS.md#markers). They are examples, not constants: a build reads every participant code from configuration.

| Code | Is |
|---|---|
| `1000004805@hcx` | the reference sandbox payer desk, profile `kyrocare` |
| `1000004806@hcx` | the sandbox provider EMR's facility, the hospital that sends to it in the end-to-end tests |
| `1518@hcx` | the PMJAY (NHA) scheme payer on the NHCX sandbox, profile `pmjay` |

## Test participants

The end-to-end tests ([TESTS.md](TESTS.md)) drive the hospital's side through the sandbox provider EMR (A18. Provider Driver). The values below are the defaults the test configuration ([T1. Test Configuration](../tests/T1-test-configuration.md)) starts from, except where the table says otherwise.

| Counterpart | Fixed at | Signed in by | Facility code it sends as | Variable |
|---|---|---|---|---|
| Sandbox provider EMR | `https://nhcxai.abdm.gov.in/uat/` (API at `/api/provider`) | token login with this payer's own ABDM session token ([G3. Session Token](../gateway/G3-session-token.md)), then `PUT auth/participants` naming the facility code | asked from the integrator, no default | `NHCX_PAYER_TEST_FACILITY` |

**The sandbox provider EMR is fixed.** It is not a setting and has no URL variable: its screens are at `https://nhcxai.abdm.gov.in/uat/`, its API at `https://nhcxai.abdm.gov.in/api/provider`. It is signed in to only by token login, with this payer's own ABDM session token: there is no username, password or desk account to configure or ask for.

**The facility code is asked once.** A facility participant code registered under the integrator's client id, so the sandbox provider EMR can send as it and NHCX delivers its messages to this payer. It is asked from the integrator ([T1. Test Configuration](../tests/T1-test-configuration.md)), never guessed or taken from an example, and a test without it is `blocked` with that reason. The members and enrolments the tests run against are seeded here, in this payer's own registry ([D5. member](../database/D5-member.md), [D6. subscription](../database/D6-subscription.md)), so nothing else is asked for.
