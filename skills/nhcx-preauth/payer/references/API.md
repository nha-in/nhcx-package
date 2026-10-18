# APIs

Every call the application makes for NHCX, in one list. Each row links to its full spec in [../apis/](../apis/INDEX.md). All of them run in-process: outbound answers and payer-started messages go through [G7. Send](../gateway/G7-send.md), registry lookups through [G4. Registry and Certificates](../gateway/G4-registry.md) or [G10. Beneficiary Registry](../gateway/G10-beneficiary-registry.md), and the ledger reads through [G9. Ledger](../gateway/G9-ledger.md). Inbound messages from hospitals are the callbacks in [CALLBACK.md](CALLBACK.md).

## Outbound to NHCX

Answers to a hospital's message travel on its correlation id; a query and a payment notice open a thread of their own.

| # | API | Call | What it does | Answers | Screens |
|---|---|---|---|---|---|
| [A3](../apis/A3-preauth-answer.md) | Pre-auth Answer | `gateway.send("v1/preauth/on_submit")` | Acknowledges a filed pre-authorisation at once (queued, workflow 20) and sends the verdict when a person decides: approved, rejected, or the enhancement's approval or denial, on the submission's thread. | [C4](../callbacks/C4-preauth-submit.md), [C7](../callbacks/C7-task-submit.md) | [S3](../screens/S3-case-desk.md) |
| [A8](../apis/A8-status-answer.md) | Status Answer | `gateway.send("v1/on_status")`, `gateway.send("v1/task/on_submit")` | Answers a status enquiry with where the thread stands: the `x-hcx-status_response` header and a Task bundle, on the route the ask came in on. | [C8](../callbacks/C8-status-enquiry.md) | none |
| [A9](../apis/A9-task-answer.md) | Task Answer | `gateway.send("v1/task/on_submit")` | Answers a hospital's Task: a cancellation as accomplished (PC02), a reprocess or balance release as acknowledged (37) then decided on that thread (252, 253). | [C7](../callbacks/C7-task-submit.md) | [S3](../screens/S3-case-desk.md) |
| [A10](../apis/A10-predetermination-quote.md) | Predetermination Quote | `gateway.send("v1/preauth/on_submit")` | Prices a predetermination against the rules at once and answers with what the policy would allow; it opens no case and binds nobody. | [C1](../callbacks/C1-callback-door.md), [C6](../callbacks/C6-predetermination.md) | none |

## Ledger queries (polling)

Polling is the fallback when a callback is missed. Opening a case runs these for every thread still waiting on the hospital.

| # | API | Call | What it does | Answers | Screens |
|---|---|---|---|---|---|
| [A11](../apis/A11-txn-related.md) | Transaction Related | `ledger.related(txn_id)` | Lists the ledger rows on the same thread as a payer send, to find a hospital's reply (a Communication, a payment acknowledgement) when its callback was missed, and apply it as the callback would. | none | none |
| [A12](../apis/A12-txn-fhir.md) | Transaction FHIR | `ledger.fhir(txn_id)` | Reads one ledger row's decrypted bundle and headers, for A11 and the exchange log. | none | none |

## Application

| # | API | Call | What it does | Answers | Screens |
|---|---|---|---|---|---|
| [A13](../apis/A13-adjudicate.md) | Adjudicate | `PATCH cases/:id/line-items/:lineId`, `POST cases/:id/adjudicate`, `POST cases/:id/query` | The desk's decision service: decide each line (approved, partial, rejected, queried), then approve, reject or query the case, or raise a query before any decision; approving a claim debits the wallet; every decision triggers the answer (A3, A4, A5, A9). | [C4](../callbacks/C4-preauth-submit.md), [C7](../callbacks/C7-task-submit.md) | [S2](../screens/S2-cases.md), [S3](../screens/S3-case-desk.md) |
| [A15](../apis/A15-case-exchange.md) | Case Exchange Log | `GET cases/:id/exchange`, `GET cases/:id/exchange/:msgId`, `GET cases/:id/fhir`, `GET cases/:id/forms` | What went over the exchange about a case, in both directions with the bundles, the forms the hospital answered, and what this payer would send now; the state drivers and tests read. | [C4](../callbacks/C4-preauth-submit.md) | [S3](../screens/S3-case-desk.md) |

## Sandbox testing

| # | API | Call | What it does | Answers | Screens |
|---|---|---|---|---|---|
| [A19](../apis/A19-sandbox-scenarios.md) | Sandbox Scenarios | `GET scenarios`, `POST cases/:id/scenario` | The member-id presets the sandbox plays (cover in order, lapsed, restricted plan, partial, query) and the faults it injects on the way out (delay, drop, duplicate, malformed, stale correlation, wrong outcome; transport faults handed to the gateway) [SANDBOX](PAYERS.md#markers). | [C6](../callbacks/C6-predetermination.md) | [S3](../screens/S3-case-desk.md) |
