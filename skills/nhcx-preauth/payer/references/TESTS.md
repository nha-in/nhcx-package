# Tests

Every end-to-end test the skill writes, in one list. Each row links to its full spec in [../tests/](../tests/INDEX.md). Every test runs through the desk screens (GUI) and from the command line (CLI); [T1. Test Configuration](../tests/T1-test-configuration.md) is the configuration both read and [T2. Test Runners](../tests/T2-test-runners.md) the runner contract both follow. The hospital's side is the sandbox provider EMR, driven through A18. Provider Driver. Step [L8](../steps/L8-e2e-tests.md) writes and runs them.

## Harness

| # | Test | Provider side | What it proves | Screens | APIs | Callbacks |
|---|---|---|---|---|---|---|
| [T1](../tests/T1-test-configuration.md) | Test Configuration | both | The one configuration every end-to-end test reads: the sandbox provider EMR, the facility code it sends as, the member ids seeded here, the mode, the waits. | none | [A11](../apis/A11-txn-related.md) | none |
| [T2](../tests/T2-test-runners.md) | Test Runners | both | The GUI and CLI runners, their shared contract: setup checks, driving the hospital through A18, waiting for a message to arrive, deciding on the desk, the report. | [S2](../screens/S2-cases.md), [S3](../screens/S3-case-desk.md) | [A11](../apis/A11-txn-related.md), [A12](../apis/A12-txn-fhir.md), [A13](../apis/A13-adjudicate.md), [A15](../apis/A15-case-exchange.md) | [C1](../callbacks/C1-callback-door.md) |

## Pre-authorisation

| # | Test | Provider side | What it proves | Screens | APIs | Callbacks |
|---|---|---|---|---|---|---|
| [T6](../tests/T6-preauth-approved.md) | Pre-auth Received and Approved | sandbox provider EMR | A pre-authorisation opens a case, is acknowledged, every line is approved on the desk, and the verdict reaches the hospital. | [S2](../screens/S2-cases.md), [S3](../screens/S3-case-desk.md) | [A3](../apis/A3-preauth-answer.md), [A13](../apis/A13-adjudicate.md), [A15](../apis/A15-case-exchange.md) | [C4](../callbacks/C4-preauth-submit.md) |
| [T7](../tests/T7-preauth-rejected.md) | Pre-auth Rejected | sandbox provider EMR | The desk rejects; the hospital reads outcome error with the reason. | [S2](../screens/S2-cases.md), [S3](../screens/S3-case-desk.md) | [A3](../apis/A3-preauth-answer.md), [A13](../apis/A13-adjudicate.md), [A15](../apis/A15-case-exchange.md) | [C4](../callbacks/C4-preauth-submit.md) |
| [T9](../tests/T9-enhancement-approved.md) | Enhancement Received and Approved | sandbox provider EMR | The hospital adds lines under the same number; they join the case for a fresh decision; the enhancement verdict goes out (22). | [S2](../screens/S2-cases.md), [S3](../screens/S3-case-desk.md) | [A3](../apis/A3-preauth-answer.md), [A13](../apis/A13-adjudicate.md), [A15](../apis/A15-case-exchange.md) | [C4](../callbacks/C4-preauth-submit.md) |
| [T10](../tests/T10-preauth-cancelled.md) | Pre-auth Cancelled | sandbox provider EMR | The hospital cancels with a Task; the case is withdrawn and PC02 goes back. | [S2](../screens/S2-cases.md), [S3](../screens/S3-case-desk.md) | [A9](../apis/A9-task-answer.md), [A15](../apis/A15-case-exchange.md) | [C7](../callbacks/C7-task-submit.md) |
| [T11](../tests/T11-predetermination-quoted.md) | Predetermination Quoted | sandbox provider EMR | A predetermination is priced at once and opens no case. | [S1](../screens/S1-overview.md), [S2](../screens/S2-cases.md) | [A10](../apis/A10-predetermination-quote.md), [A12](../apis/A12-txn-fhir.md), [A19](../apis/A19-sandbox-scenarios.md) | [C6](../callbacks/C6-predetermination.md) |

## Status and redelivery

| # | Test | Provider side | What it proves | Screens | APIs | Callbacks |
|---|---|---|---|---|---|---|
| [T17](../tests/T17-status-answered.md) | Status Enquiry Answered | sandbox provider EMR | The hospital asks where a thread stands, on the task route and with the status filter. | [S3](../screens/S3-case-desk.md) | [A8](../apis/A8-status-answer.md), [A12](../apis/A12-txn-fhir.md), [A13](../apis/A13-adjudicate.md), [A15](../apis/A15-case-exchange.md) | [C8](../callbacks/C8-status-enquiry.md) |
| [T18](../tests/T18-redelivery-ignored.md) | Redelivery and Duplicates | sandbox provider EMR | The same pre-authorisation delivered twice opens one case; a second copy of a claim files its documents once. | [S2](../screens/S2-cases.md), [S3](../screens/S3-case-desk.md) | [A13](../apis/A13-adjudicate.md), [A15](../apis/A15-case-exchange.md) | [C1](../callbacks/C1-callback-door.md), [C4](../callbacks/C4-preauth-submit.md) |
