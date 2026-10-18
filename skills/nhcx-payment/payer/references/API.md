# APIs

Every call the application makes for NHCX, in one list. Each row links to its full spec in [../apis/](../apis/INDEX.md). All of them run in-process: outbound answers and payer-started messages go through [G7. Send](../gateway/G7-send.md), registry lookups through [G4. Registry and Certificates](../gateway/G4-registry.md) or [G10. Beneficiary Registry](../gateway/G10-beneficiary-registry.md), and the ledger reads through [G9. Ledger](../gateway/G9-ledger.md). Inbound messages from hospitals are the callbacks in [CALLBACK.md](CALLBACK.md).

## Outbound to NHCX

Answers to a hospital's message travel on its correlation id; a query and a payment notice open a thread of their own.

| # | API | Call | What it does | Answers | Screens |
|---|---|---|---|---|---|
| [A6](../apis/A6-payment-notice.md) | Payment Notice | `gateway.send("v1/paymentnotice/request")` | Tells the hospital the money moved: a PaymentNotice with the reconciliation when a payment is raised, and again with the UTR when it completes; a new thread each time, workflow 30. | [C1](../callbacks/C1-callback-door.md), [C10](../callbacks/C10-payment-enquiry.md), [C11](../callbacks/C11-payment-acknowledgement.md) | [S10](../screens/S10-payments.md) |
| [A7](../apis/A7-payment-enquiry-answer.md) | Payment Enquiry Answer | `gateway.send("v1/paymentnotice/on_request")` | Answers a hospital's own PaymentNotice asking where the money is: the case's payments reconciled, or an OperationOutcome when the claim is unknown or unpaid. | [C10](../callbacks/C10-payment-enquiry.md) | none |

## Ledger queries (polling)

Polling is the fallback when a callback is missed. Opening a case runs these for every thread still waiting on the hospital.

| # | API | Call | What it does | Answers | Screens |
|---|---|---|---|---|---|
| [A11](../apis/A11-txn-related.md) | Transaction Related | `ledger.related(txn_id)` | Lists the ledger rows on the same thread as a payer send, to find a hospital's reply (a Communication, a payment acknowledgement) when its callback was missed, and apply it as the callback would. | [C11](../callbacks/C11-payment-acknowledgement.md) | none |
| [A12](../apis/A12-txn-fhir.md) | Transaction FHIR | `ledger.fhir(txn_id)` | Reads one ledger row's decrypted bundle and headers, for A11 and the exchange log. | none | none |

## Application

| # | API | Call | What it does | Answers | Screens |
|---|---|---|---|---|---|
| [A14](../apis/A14-disburse.md) | Disburse | `POST payments`, `POST payments/:id/complete`, `POST payments/:id/fail` | Raises a payment against an approved case, completes it with a UTR (or in one step), fails it, and settles the case when nothing approved is left; each movement sends A6. | [C11](../callbacks/C11-payment-acknowledgement.md) | [S10](../screens/S10-payments.md) |
| [A15](../apis/A15-case-exchange.md) | Case Exchange Log | `GET cases/:id/exchange`, `GET cases/:id/exchange/:msgId`, `GET cases/:id/fhir`, `GET cases/:id/forms` | What went over the exchange about a case, in both directions with the bundles, the forms the hospital answered, and what this payer would send now; the state drivers and tests read. | none | [S3](../screens/S3-case-desk.md) |
