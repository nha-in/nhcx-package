# Tests

Every end-to-end test the skill writes, in one list. Each row links to its full spec in [../tests/](../tests/INDEX.md). Every test runs through the desk screens (GUI) and from the command line (CLI); [T1. Test Configuration](../tests/T1-test-configuration.md) is the configuration both read and [T2. Test Runners](../tests/T2-test-runners.md) the runner contract both follow. The hospital's side is the sandbox provider EMR, driven through A18. Provider Driver. Step [L8](../steps/L8-e2e-tests.md) writes and runs them.

## Harness

| # | Test | Provider side | What it proves | Screens | APIs | Callbacks |
|---|---|---|---|---|---|---|
| [T1](../tests/T1-test-configuration.md) | Test Configuration | both | The one configuration every end-to-end test reads: the sandbox provider EMR, the facility code it sends as, the member ids seeded here, the mode, the waits. | none | [A11](../apis/A11-txn-related.md) | none |
| [T2](../tests/T2-test-runners.md) | Test Runners | both | The GUI and CLI runners, their shared contract: setup checks, driving the hospital through A18, waiting for a message to arrive, deciding on the desk, the report. | [S2](../screens/S2-cases.md), [S3](../screens/S3-case-desk.md) | [A11](../apis/A11-txn-related.md), [A12](../apis/A12-txn-fhir.md), [A13](../apis/A13-adjudicate.md), [A15](../apis/A15-case-exchange.md) | [C1](../callbacks/C1-callback-door.md), [C9](../callbacks/C9-communication.md) |

## Queries

| # | Test | Provider side | What it proves | Screens | APIs | Callbacks |
|---|---|---|---|---|---|---|
| [T8](../tests/T8-preauth-queried.md) | Pre-auth Queried and Answered | sandbox provider EMR | The desk queries a line; the ClaimResponse goes back on the pre-auth thread; the hospital resubmits; then a Raise Query goes out as a CommunicationRequest and is answered with a document; the case is approved. | [S2](../screens/S2-cases.md), [S3](../screens/S3-case-desk.md) | [A5](../apis/A5-query-request.md), [A11](../apis/A11-txn-related.md), [A13](../apis/A13-adjudicate.md), [A15](../apis/A15-case-exchange.md) | [C9](../callbacks/C9-communication.md) |
