# Tests

Every end-to-end test the skill writes, in one list. Each row links to its full spec in [../tests/](../tests/INDEX.md). Every test runs through the desk screens (GUI) and from the command line (CLI); [T1. Test Configuration](../tests/T1-test-configuration.md) is the configuration both read and [T2. Test Runners](../tests/T2-test-runners.md) the runner contract both follow. The hospital's side is the sandbox provider EMR, driven through A18. Provider Driver. Step [L8](../steps/L8-e2e-tests.md) writes and runs them.

## Harness

| # | Test | Provider side | What it proves | Screens | APIs | Callbacks |
|---|---|---|---|---|---|---|
| [T1](../tests/T1-test-configuration.md) | Test Configuration | both | The one configuration every end-to-end test reads: the sandbox provider EMR, the facility code it sends as, the member ids seeded here, the mode, the waits. | none | [A11](../apis/A11-txn-related.md) | none |
| [T2](../tests/T2-test-runners.md) | Test Runners | both | The GUI and CLI runners, their shared contract: setup checks, driving the hospital through A18, waiting for a message to arrive, deciding on the desk, the report. | [S2](../screens/S2-cases.md), [S3](../screens/S3-case-desk.md) | [A11](../apis/A11-txn-related.md), [A12](../apis/A12-txn-fhir.md), [A13](../apis/A13-adjudicate.md), [A15](../apis/A15-case-exchange.md) | [C1](../callbacks/C1-callback-door.md) |

## Claim

| # | Test | Provider side | What it proves | Screens | APIs | Callbacks |
|---|---|---|---|---|---|---|
| [T12](../tests/T12-claim-approved.md) | Claim Received and Approved | sandbox provider EMR | The claim files the final bill on the pre-authorised case, is approved, the wallet is debited, and the verdict goes out on the claim's thread. | [S2](../screens/S2-cases.md), [S3](../screens/S3-case-desk.md) | [A4](../apis/A4-claim-answer.md), [A13](../apis/A13-adjudicate.md), [A15](../apis/A15-case-exchange.md) | [C5](../callbacks/C5-claim-submit.md) |
| [T13](../tests/T13-claim-lama-death.md) | LAMA and Death Claims | sandbox provider EMR | Claims discharged LAMA or DAMA and a death case are filed with their discharge blocks. | [S2](../screens/S2-cases.md), [S3](../screens/S3-case-desk.md) | [A13](../apis/A13-adjudicate.md), [A15](../apis/A15-case-exchange.md) | [C5](../callbacks/C5-claim-submit.md) |
| [T14](../tests/T14-reprocess-and-release.md) | Reprocess and Balance Release | sandbox provider EMR | The hospital disputes a decided claim and asks for a balance; the case reopens, the cover comes back, and the new decision goes on the Task's thread. | [S2](../screens/S2-cases.md), [S3](../screens/S3-case-desk.md) | [A9](../apis/A9-task-answer.md), [A13](../apis/A13-adjudicate.md), [A15](../apis/A15-case-exchange.md) | [C5](../callbacks/C5-claim-submit.md), [C7](../callbacks/C7-task-submit.md) |
