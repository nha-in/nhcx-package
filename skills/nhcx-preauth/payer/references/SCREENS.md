# Screens

Every screen of the desk, the registry, the configuration and the finance flows, in one list. Each row links to its full spec in [../screens/](../screens/INDEX.md). Routes are the application's own; S4 to S9 are screens most payer systems already have, and only their NHCX additions are built.

## Desk

| # | Screen | Route | What it does | APIs | Callbacks |
|---|---|---|---|---|---|
| [S1](../screens/S1-overview.md) | Overview | `/` | The desk's home: counts of cases by stage, money approved and paid, cover lapsing, recent activity, and the queue of cases waiting on a person. | none | none |
| [S2](../screens/S2-cases.md) | Cases | `/cases` | Every case addressed to this payer, filtered by stage, search and money still owed; opens the case desk. | [A13](../apis/A13-adjudicate.md) | [C4](../callbacks/C4-preauth-submit.md), [C7](../callbacks/C7-task-submit.md) |
| [S3](../screens/S3-case-desk.md) | Case Desk | `/cases/:id` | One case from pre-authorisation to settlement: the dossier the hospital sent, per-line decisions, approve, reject or query, documents, the timeline, the exchange log and the FHIR preview. | [A3](../apis/A3-preauth-answer.md), [A9](../apis/A9-task-answer.md), [A13](../apis/A13-adjudicate.md), [A15](../apis/A15-case-exchange.md), [A19](../apis/A19-sandbox-scenarios.md) | [C4](../callbacks/C4-preauth-submit.md), [C7](../callbacks/C7-task-submit.md) |
