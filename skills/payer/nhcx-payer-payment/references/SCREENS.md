# Screens

Every screen of the desk, the registry, the configuration and the finance flows, in one list. Each row links to its full spec in [../screens/](../screens/INDEX.md). Routes are the application's own; S4 to S9 are screens most payer systems already have, and only their NHCX additions are built.

## Desk

| # | Screen | Route | What it does | APIs | Callbacks |
|---|---|---|---|---|---|
| [S1](../screens/S1-overview.md) | Overview | `/` | The desk's home: counts of cases by stage, money approved and paid, cover lapsing, recent activity, and the queue of cases waiting on a person. | none | none |
| [S2](../screens/S2-cases.md) | Cases | `/cases` | Every case addressed to this payer, filtered by stage, search and money still owed; opens the case desk. | none | none |
| [S3](../screens/S3-case-desk.md) | Case Desk | `/cases/:id` | One case from pre-authorisation to settlement: the dossier the hospital sent, per-line decisions, approve, reject or query, documents, the timeline, the exchange log and the FHIR preview. | [A15](../apis/A15-case-exchange.md) | none |

## Finance

| # | Screen | Route | What it does | APIs | Callbacks |
|---|---|---|---|---|---|
| [S10](../screens/S10-payments.md) | Payments | `/payments` | The disbursement desk: approved cases with money owed, raising a payment, recording the UTR or a failure, and the payment notices that went out. | [A6](../apis/A6-payment-notice.md), [A14](../apis/A14-disburse.md) | [C11](../callbacks/C11-payment-acknowledgement.md) |
