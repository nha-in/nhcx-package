# Callbacks

Every message NHCX delivers to this payer: a hospital's questions and submissions, and its replies to what this payer sent. NHCX posts each one to the application's public inbound route (`/in/<path>` or `/v1/<path>`, whichever the payer's registered `endpoint_url` points at); [G8. Receive](../gateway/G8-receive.md) decrypts it and hands it in-process to C1, then records it and C1's outcome in [G9. Ledger](../gateway/G9-ledger.md). APIs (A) and screens (S) refer to these by C number. Each file has ENDPOINT (E), DESCRIPTION (D), REQUEST (Q), PSEUDOCODE (P), RESPONSE (S) and USED BY (U) sections.

## Conventions

- **The bundle routes, not the path.** C1 classifies every message by its focal resource (a CoverageEligibilityRequest, a Task asking for a plan, a Claim by its `use`, a PaymentNotice, a Communication, any other Task) and only then hands it to C2 to C11. The path it arrived on is bookkeeping: gateways spell the same route differently, and a message read by its path was dead-lettered as a 404 [REF](../references/PAYERS.md#markers).
- **One message, once.** NHCX redelivers a message it did not see accepted, and a second copy of the application sharing a database delivers it again. C1 records every delivery by its `x-hcx-api_call_id` in [D28. nhcx_delivery](../database/D28-nhcx-delivery.md) before anything is applied, so a repeat answers `ignored` without filing anything twice. Every handler is also safe on its own: a case is keyed by the correlation id it opened under, a document is not filed twice under the same code, title and size, a quote is one per correlation id.
- **Answered now, or answered later.** Eligibility checks, plan requests, predeterminations, status enquiries and payment enquiries are answered inside the same delivery (C2, C3, C6, C8, C10 call A1, A2, A10, A8, A7). A pre-authorisation and a claim are filed and acknowledged at once (outcome `queued`), and the verdict follows when a person decides (A13. Adjudicate (in nhcx-preauth/payer)). A Task is answered on its own thread (A9. Task Answer (in nhcx-preauth/payer)). A Communication and a payment acknowledgement need no answer.
- **Every handler answers** `settled`, `unmatched`, `ignored`, `rejected` or `error`, and G8 turns it into NHCX's answer: only `error` makes NHCX redeliver. A message that can never be applied (no correlation id, no enrolment for the patient, a bill against a withdrawn case) is `rejected` with the reason, because redelivery cannot help.

| # | Callback | NHCX route | Answered by | File |
|---|---|---|---|---|
| [C1](C1-callback-door.md) | Callback Door | every route | [A1](../apis/A1-eligibility-answer.md) | [C1-callback-door.md](C1-callback-door.md) |
| [C2](C2-coverage-eligibility-check.md) | Coverage Eligibility Check | `v1/coverageeligibility/check` | [A1](../apis/A1-eligibility-answer.md), [A2](../apis/A2-insurance-plan-answer.md) | [C2-coverage-eligibility-check.md](C2-coverage-eligibility-check.md) |
| [C3](C3-insurance-plan-request.md) | Insurance Plan Request | `v1/insuranceplan/request` | [A1](../apis/A1-eligibility-answer.md), [A2](../apis/A2-insurance-plan-answer.md) | [C3-insurance-plan-request.md](C3-insurance-plan-request.md) |

## Flow

C2 and C3 answer before any case exists. C4 opens the case and C6 prices without one. C9 brings the hospital's answer to a query (A5. Query Request (in nhcx-communication/payer)) back onto the case. C5 files the bill. C7 carries the hospital's Tasks (cancel, reprocess, release), C8 its status enquiries. C10 is a hospital asking where its money is; C11 is the hospital confirming it saw the money this payer sent (A6. Payment Notice (in nhcx-payment/payer)).
