# Tests

Every end-to-end test the skill writes, in one list. Each row links to its full spec in [../tests/](../tests/INDEX.md). Every test runs through the screens (GUI) and from the command line (CLI); [T1. Test Configuration](../tests/T1-test-configuration.md) is the configuration both read and [T2. Test Runners](../tests/T2-test-runners.md) the runner contract both follow. Step [L8](../steps/L8-e2e-tests.md) writes and runs them.

## Harness

| # | Test | Payer | What it proves | Screens | APIs | Callbacks |
|---|---|---|---|---|---|---|
| [T1](../tests/T1-test-configuration.md) | Test Configuration | both | The one configuration every end-to-end test reads: which payers, which member ids, which mode, how long to wait, and where the credentials come from. | none | [A10](../apis/A10-txn-related.md), [A13](../apis/A13-txn-list.md) | none |
| [T2](../tests/T2-test-runners.md) | Test Runners | both | The two runners every test is written for, GUI and CLI, and the contract they share: setup checks, live output, waiting for the payer, deciding the payer's side, and the report. | [S5](../screens/S5-claim-master.md), [S6](../screens/S6-claim-detail.md) | [A10](../apis/A10-txn-related.md), [A13](../apis/A13-txn-list.md) | none |

## IRDAI payer

| # | Test | Payer | What it proves | Screens | APIs | Callbacks |
|---|---|---|---|---|---|---|
| [T7](../tests/T7-irdai-query-answered.md) | IRDAI Query Answered | IRDAI test payer | The IRDAI test payer asks a question on a pre-authorisation; the provider answers it with text and a document, and the payer then approves. | [S10](../screens/S10-communication.md) | [A7](../apis/A7-communication-on-request.md) | [C9](../callbacks/C9-communication-request.md) |
