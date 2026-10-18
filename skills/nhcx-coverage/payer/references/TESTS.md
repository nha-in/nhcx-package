# Tests

Every end-to-end test the skill writes, in one list. Each row links to its full spec in [../tests/](../tests/INDEX.md). Every test runs through the desk screens (GUI) and from the command line (CLI); [T1. Test Configuration](../tests/T1-test-configuration.md) is the configuration both read and [T2. Test Runners](../tests/T2-test-runners.md) the runner contract both follow. The hospital's side is the sandbox provider EMR, driven through A18. Provider Driver. Step [L8](../steps/L8-e2e-tests.md) writes and runs them.

## Harness

| # | Test | Provider side | What it proves | Screens | APIs | Callbacks |
|---|---|---|---|---|---|---|
| [T1](../tests/T1-test-configuration.md) | Test Configuration | both | The one configuration every end-to-end test reads: the sandbox provider EMR, the facility code it sends as, the member ids seeded here, the mode, the waits. | [S4](../screens/S4-members.md), [S5](../screens/S5-subscriptions.md) | [A11](../apis/A11-txn-related.md) | none |
| [T2](../tests/T2-test-runners.md) | Test Runners | both | The GUI and CLI runners, their shared contract: setup checks, driving the hospital through A18, waiting for a message to arrive, deciding on the desk, the report. | [S2](../screens/S2-cases.md), [S3](../screens/S3-case-desk.md) | [A11](../apis/A11-txn-related.md), [A12](../apis/A12-txn-fhir.md), [A15](../apis/A15-case-exchange.md) | [C1](../callbacks/C1-callback-door.md) |

## Coverage and plan

| # | Test | Provider side | What it proves | Screens | APIs | Callbacks |
|---|---|---|---|---|---|---|
| [T3](../tests/T3-eligibility-answered.md) | Eligibility Validation and Discovery Answered | sandbox provider EMR | The hospital checks a member by member id, then discovers by ABHA and mobile; in force, lapsed and no cover are each answered. | [S1](../screens/S1-overview.md), [S4](../screens/S4-members.md), [S5](../screens/S5-subscriptions.md), [S11](../screens/S11-fhir-preview.md) | [A1](../apis/A1-eligibility-answer.md), [A12](../apis/A12-txn-fhir.md), [A15](../apis/A15-case-exchange.md) | [C2](../callbacks/C2-coverage-eligibility-check.md) |
| [T4](../tests/T4-auth-requirements-ruled.md) | Auth-requirements Ruling Answered | sandbox provider EMR | The hospital asks about a package set; the ruling names the rate, documents and forms. | [S1](../screens/S1-overview.md), [S7](../screens/S7-policy-configurator.md), [S8](../screens/S8-procedures.md), [S9](../screens/S9-procedure-configurator.md) | [A1](../apis/A1-eligibility-answer.md), [A12](../apis/A12-txn-fhir.md), [A15](../apis/A15-case-exchange.md) | [C2](../callbacks/C2-coverage-eligibility-check.md) |
| [T5](../tests/T5-insurance-plan-served.md) | Insurance Plan Served | sandbox provider EMR | The hospital requests the package master by product and by an unknown code; the plan and the empty plan come back. | [S7](../screens/S7-policy-configurator.md), [S11](../screens/S11-fhir-preview.md) | [A2](../apis/A2-insurance-plan-answer.md), [A12](../apis/A12-txn-fhir.md), [A15](../apis/A15-case-exchange.md) | [C3](../callbacks/C3-insurance-plan-request.md) |
