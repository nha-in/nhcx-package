# Tests

Every end-to-end test the skill writes, in one list. Each row links to its full spec in [../tests/](../tests/INDEX.md). Every test runs through the screens (GUI) and from the command line (CLI); [T1. Test Configuration](../tests/T1-test-configuration.md) is the configuration both read and [T2. Test Runners](../tests/T2-test-runners.md) the runner contract both follow. Step [L8](../steps/L8-e2e-tests.md) writes and runs them.

## Harness

| # | Test | Payer | What it proves | Screens | APIs | Callbacks |
|---|---|---|---|---|---|---|
| [T1](../tests/T1-test-configuration.md) | Test Configuration | both | The one configuration every end-to-end test reads: which payers, which member ids, which mode, how long to wait, and where the credentials come from. | none | [A10](../apis/A10-txn-related.md), [A13](../apis/A13-txn-list.md) | none |
| [T2](../tests/T2-test-runners.md) | Test Runners | both | The two runners every test is written for, GUI and CLI, and the contract they share: setup checks, live output, waiting for the payer, deciding the payer's side, and the report. | [S5](../screens/S5-claim-master.md), [S6](../screens/S6-claim-detail.md) | [A6](../apis/A6-task-submit.md), [A10](../apis/A10-txn-related.md), [A13](../apis/A13-txn-list.md) | none |

## IRDAI payer

| # | Test | Payer | What it proves | Screens | APIs | Callbacks |
|---|---|---|---|---|---|---|
| [T12](../tests/T12-irdai-reprocess-and-release.md) | IRDAI Reprocess and Balance Release | IRDAI test payer | Asks the IRDAI test payer to look again at a rejected claim, and to release the unpaid balance of a partly paid one. | [S11](../screens/S11-claim-submission.md) | [A6](../apis/A6-task-submit.md) | [C8](../callbacks/C8-enquiry-on-submit.md) |
