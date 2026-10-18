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
| [T11](../tests/T11-irdai-payment.md) | IRDAI Payment Notice and Acknowledgement | IRDAI test payer | The IRDAI test payer pays an approved claim; the provider records the payment with its UTR and TDS, acknowledges it, and keeps a second instalment beside the first. | [S12](../screens/S12-payments.md) | [A8](../apis/A8-paymentnotice-on-request.md) | [C10](../callbacks/C10-paymentnotice-request.md) |

## PMJAY payer and its adjudication

| # | Test | Payer | What it proves | Screens | APIs | Callbacks |
|---|---|---|---|---|---|---|
| [T18](../tests/T18-pmjay-payment-status-cancel.md) | PMJAY Payment Notice, Status Refusal and Cancel | PMJAY test payer | Acknowledges PMJAY's payment notice under its own workflow id, records PMJAY's refusal of a status enquiry as expected, and cancels a pending pre-authorisation. | [S12](../screens/S12-payments.md) | [A8](../apis/A8-paymentnotice-on-request.md) | [C10](../callbacks/C10-paymentnotice-request.md) |
