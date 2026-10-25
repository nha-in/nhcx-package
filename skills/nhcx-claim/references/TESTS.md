# Tests

Every end-to-end test the skill writes, in one list. Each row links to its full spec in [../tests/](../tests/INDEX.md). Every test runs through the screens (GUI) and from the command line (CLI); [T1. Test Configuration](../tests/T1-test-configuration.md) is the configuration both read and [T2. Test Runners](../tests/T2-test-runners.md) the runner contract both follow. Step [L8](../steps/L8-e2e-tests.md) writes and runs them.

## Harness

| # | Test | Payer | What it proves | Screens | APIs | Callbacks |
|---|---|---|---|---|---|---|
| [T1](../tests/T1-test-configuration.md) | Test Configuration | both | The one configuration every end-to-end test reads: which payers, which member ids, which mode, how long to wait, and where the credentials come from. | none | [A10](../apis/A10-txn-related.md), [A13](../apis/A13-txn-list.md), [A14](../apis/A14-adjudicator-user-role.md), [A16](../apis/A16-gateway-token.md) | none |
| [T2](../tests/T2-test-runners.md) | Test Runners | both | The two runners every test is written for, GUI and CLI, and the contract they share: setup checks, live output, waiting for the payer, deciding the payer's side, and the report. | [S5](../screens/S5-claim-master.md), [S6](../screens/S6-claim-detail.md) | [A6](../apis/A6-task-submit.md), [A10](../apis/A10-txn-related.md), [A13](../apis/A13-txn-list.md), [A14](../apis/A14-adjudicator-user-role.md), [A15](../apis/A15-adjudicator-process-case.md) | none |
| [T20](../tests/T20-functional-test-report.md) | Functional Test Report | both | The functional testing (FT) report compiled after the end-to-end run: a PDF with the whole process in screenshots, one numbered proof section per test step, and an Excel workbook of every test case with its result, built from e2e.json and the GUI runner's artifacts. | [S6](../screens/S6-claim-detail.md) | [A14](../apis/A14-adjudicator-user-role.md), [A15](../apis/A15-adjudicator-process-case.md) | none |

## IRDAI payer

| # | Test | Payer | What it proves | Screens | APIs | Callbacks |
|---|---|---|---|---|---|---|
| [T10](../tests/T10-irdai-claim.md) | IRDAI Claim Approved, Part-approved and Rejected | IRDAI test payer | Files three claims with the IRDAI test payer after discharge: one approved in full, one approved in part at line level, one rejected. | [S11](../screens/S11-claim-submission.md) | [A5](../apis/A5-claim-submit.md), [A6](../apis/A6-task-submit.md), [A14](../apis/A14-adjudicator-user-role.md), [A15](../apis/A15-adjudicator-process-case.md) | [C6](../callbacks/C6-claim-on-submit.md) |

## PMJAY payer and its adjudication

| # | Test | Payer | What it proves | Screens | APIs | Callbacks |
|---|---|---|---|---|---|---|
| [T17](../tests/T17-pmjay-claim-adjudicated.md) | PMJAY Claim Through the Role Walk | PMJAY test payer | Files a PMJAY claim after discharge and walks it through every Payer Service role to Claim Review Committee; a queried claim is answered under PMJAY's claim query workflow id. | [S11](../screens/S11-claim-submission.md) | [A5](../apis/A5-claim-submit.md), [A14](../apis/A14-adjudicator-user-role.md), [A15](../apis/A15-adjudicator-process-case.md) | [C6](../callbacks/C6-claim-on-submit.md) |
