# APIs

Every call the application makes for NHCX, in one list. Each row links to its full spec in [../apis/](../apis/INDEX.md). All of them run in-process: outbound answers and payer-started messages go through [G7. Send](../gateway/G7-send.md), registry lookups through [G4. Registry and Certificates](../gateway/G4-registry.md) or [G10. Beneficiary Registry](../gateway/G10-beneficiary-registry.md), and the ledger reads through [G9. Ledger](../gateway/G9-ledger.md). Inbound messages from hospitals are the callbacks in [CALLBACK.md](CALLBACK.md).

## Outbound to NHCX

Answers to a hospital's message travel on its correlation id; a query and a payment notice open a thread of their own.

| # | API | Call | What it does | Answers | Screens |
|---|---|---|---|---|---|
| [A5](../apis/A5-query-request.md) | Query Request | `gateway.send("v1/communication/request")` | Asks the hospital about the case as a whole (the desk's Raise Query, or a query with no line queried): a CommunicationRequest on a thread of its own, the minted correlation id kept on the case; resend when the first attempt did not leave. | [C1](../callbacks/C1-callback-door.md), [C9](../callbacks/C9-communication.md) | [S3](../screens/S3-case-desk.md) |

## Ledger queries (polling)

Polling is the fallback when a callback is missed. Opening a case runs these for every thread still waiting on the hospital.

| # | API | Call | What it does | Answers | Screens |
|---|---|---|---|---|---|
| [A11](../apis/A11-txn-related.md) | Transaction Related | `ledger.related(txn_id)` | Lists the ledger rows on the same thread as a payer send, to find a hospital's reply (a Communication, a payment acknowledgement) when its callback was missed, and apply it as the callback would. | none | none |
| [A12](../apis/A12-txn-fhir.md) | Transaction FHIR | `ledger.fhir(txn_id)` | Reads one ledger row's decrypted bundle and headers, for A11 and the exchange log. | none | none |

## Application

| # | API | Call | What it does | Answers | Screens |
|---|---|---|---|---|---|
| [A13](../apis/A13-adjudicate.md) | Adjudicate | `PATCH cases/:id/line-items/:lineId`, `POST cases/:id/adjudicate`, `POST cases/:id/query` | The desk's decision service: decide each line (approved, partial, rejected, queried), then approve, reject or query the case, or raise a query before any decision; approving a claim debits the wallet; every decision triggers the answer (A3, A4, A5, A9). | none | [S2](../screens/S2-cases.md), [S3](../screens/S3-case-desk.md) |
| [A15](../apis/A15-case-exchange.md) | Case Exchange Log | `GET cases/:id/exchange`, `GET cases/:id/exchange/:msgId`, `GET cases/:id/fhir`, `GET cases/:id/forms` | What went over the exchange about a case, in both directions with the bundles, the forms the hospital answered, and what this payer would send now; the state drivers and tests read. | none | [S3](../screens/S3-case-desk.md) |
