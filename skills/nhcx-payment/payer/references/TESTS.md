# Tests

Every end-to-end test the skill writes, in one list. Each row links to its full spec in [../tests/](../tests/INDEX.md). Every test runs through the desk screens (GUI) and from the command line (CLI); [T1. Test Configuration](../tests/T1-test-configuration.md) is the configuration both read and [T2. Test Runners](../tests/T2-test-runners.md) the runner contract both follow. The hospital's side is the sandbox provider EMR, driven through A18. Provider Driver. Step [L8](../steps/L8-e2e-tests.md) writes and runs them.

## Harness

| # | Test | Provider side | What it proves | Screens | APIs | Callbacks |
|---|---|---|---|---|---|---|
| [T1](../tests/T1-test-configuration.md) | Test Configuration | both | The one configuration every end-to-end test reads: the sandbox provider EMR, the facility code it sends as, the member ids seeded here, the mode, the waits. | none | [A11](../apis/A11-txn-related.md) | none |
| [T2](../tests/T2-test-runners.md) | Test Runners | both | The GUI and CLI runners, their shared contract: setup checks, driving the hospital through A18, waiting for a message to arrive, deciding on the desk, the report. | [S2](../screens/S2-cases.md), [S3](../screens/S3-case-desk.md), [S10](../screens/S10-payments.md) | [A11](../apis/A11-txn-related.md), [A12](../apis/A12-txn-fhir.md), [A14](../apis/A14-disburse.md), [A15](../apis/A15-case-exchange.md) | [C1](../callbacks/C1-callback-door.md), [C11](../callbacks/C11-payment-acknowledgement.md) |

## Payment

| # | Test | Provider side | What it proves | Screens | APIs | Callbacks |
|---|---|---|---|---|---|---|
| [T15](../tests/T15-payment-noticed.md) | Payment Notices and Acknowledgement | sandbox provider EMR | Finance raises and completes a payment; two notices go out; the hospital's acknowledgement is recorded. | [S10](../screens/S10-payments.md) | [A6](../apis/A6-payment-notice.md), [A11](../apis/A11-txn-related.md), [A14](../apis/A14-disburse.md), [A15](../apis/A15-case-exchange.md) | [C11](../callbacks/C11-payment-acknowledgement.md) |
| [T16](../tests/T16-payment-enquiry-answered.md) | Payment Enquiry Answered | sandbox provider EMR | The hospital asks where the money is; the reconciliation comes back. | [S3](../screens/S3-case-desk.md), [S10](../screens/S10-payments.md) | [A7](../apis/A7-payment-enquiry-answer.md), [A12](../apis/A12-txn-fhir.md), [A14](../apis/A14-disburse.md), [A15](../apis/A15-case-exchange.md) | [C10](../callbacks/C10-payment-enquiry.md) |
