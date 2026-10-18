# Tests

Every end-to-end test the skill writes, in one list. Each row links to its full spec in [../tests/](../tests/INDEX.md). Every test runs through the screens (GUI) and from the command line (CLI); [T1. Test Configuration](../tests/T1-test-configuration.md) is the configuration both read and [T2. Test Runners](../tests/T2-test-runners.md) the runner contract both follow. Step [L8](../steps/L8-e2e-tests.md) writes and runs them.

## Harness

| # | Test | Payer | What it proves | Screens | APIs | Callbacks |
|---|---|---|---|---|---|---|
| [T1](../tests/T1-test-configuration.md) | Test Configuration | both | The one configuration every end-to-end test reads: which payers, which member ids, which mode, how long to wait, and where the credentials come from. | none | [A10](../apis/A10-txn-related.md), [A13](../apis/A13-txn-list.md) | none |
| [T2](../tests/T2-test-runners.md) | Test Runners | both | The two runners every test is written for, GUI and CLI, and the contract they share: setup checks, live output, waiting for the payer, deciding the payer's side, and the report. | [S1](../screens/S1-search-policy.md), [S5](../screens/S5-claim-master.md), [S6](../screens/S6-claim-detail.md), [S13](../screens/S13-patient-list.md), [S15](../screens/S15-patient-detail.md) | [A10](../apis/A10-txn-related.md), [A13](../apis/A13-txn-list.md) | none |

## IRDAI payer

| # | Test | Payer | What it proves | Screens | APIs | Callbacks |
|---|---|---|---|---|---|---|
| [T3](../tests/T3-irdai-policy-and-eligibility.md) | IRDAI Policy Search and Eligibility | IRDAI test payer | Finds the IRDAI test beneficiary's policy by member id, then checks it in force: discovery and validation both answered. | [S1](../screens/S1-search-policy.md), [S2](../screens/S2-select-policy.md), [S3](../screens/S3-policy-discovery.md), [S5](../screens/S5-claim-master.md), [S6](../screens/S6-claim-detail.md), [S14](../screens/S14-patient-registration-form.md) | [A1](../apis/A1-policy-search.md), [A2](../apis/A2-coverage-eligibility-check.md) | [C2](../callbacks/C2-coverage-eligibility-on-check.md) |

## PMJAY payer and its adjudication

| # | Test | Payer | What it proves | Screens | APIs | Callbacks |
|---|---|---|---|---|---|---|
| [T13](../tests/T13-pmjay-eligibility-and-package-master.md) | PMJAY Eligibility, Package Master and Ruling | PMJAY test payer | Finds the PMJAY beneficiary's policy, checks it in force, requests PMJAY's package master without waiting for it, seeds one for the tests, and gets PMJAY's ruling on what the chosen package needs. | [S1](../screens/S1-search-policy.md), [S2](../screens/S2-select-policy.md), [S3](../screens/S3-policy-discovery.md), [S5](../screens/S5-claim-master.md) | [A1](../apis/A1-policy-search.md), [A2](../apis/A2-coverage-eligibility-check.md), [A18](../apis/A18-biometric-authentication.md) | [C2](../callbacks/C2-coverage-eligibility-on-check.md) |
| [T19](../tests/T19-pmjay-biometric-and-abha.md) | PMJAY Beneficiary Verification and ABHA | PMJAY test payer | Registers a patient from a verified ABHA, authenticates the beneficiary biometrically on the pre-authorisation so the token rides on the eligibility check and the pre-authorisation, and shows the consent questionnaire standing in when no token is held. | [S1](../screens/S1-search-policy.md), [S3](../screens/S3-policy-discovery.md), [S13](../screens/S13-patient-list.md), [S14](../screens/S14-patient-registration-form.md), [S15](../screens/S15-patient-detail.md), [S18](../screens/S18-beneficiary-verification.md) | [A2](../apis/A2-coverage-eligibility-check.md), [A18](../apis/A18-biometric-authentication.md), [A19](../apis/A19-abha-m1.md) | none |
