# Tests

The end-to-end tests the skill writes into the target, one spec per scenario. Every test runs two ways, and both are required: through the screens (GUI, a browser driving the S screens) and from the command line (CLI, a runner calling the A services). Both take the same configuration ([T1. Test Configuration](T1-test-configuration.md)), share the same runner contract ([T2. Test Runners](T2-test-runners.md)), and pass or fail on the same expectations. Each file has DESCRIPTION (D), SETUP (S), GUI (G), CLI (L) and EXPECT (X) sections, and refers to screens by S number, APIs by A number and callbacks by C number.

The IRDAI tests run against the IRDAI test payer and decide its side through the IRDAI payer desk (A14, A15). The PMJAY tests run against the PMJAY test payer and decide its side through the NHCX Payer Service role walk (A14, A15). Both payers, their member ids and the variables that override them are in [PAYERS.md](../references/PAYERS.md#test-participants).

## Harness

| # | Test | Payer | File |
|---|---|---|---|
| [T1](T1-test-configuration.md) | Test Configuration | both | [T1-test-configuration.md](T1-test-configuration.md) |
| [T2](T2-test-runners.md) | Test Runners | both | [T2-test-runners.md](T2-test-runners.md) |

## IRDAI payer

| # | Test | Payer | File |
|---|---|---|---|
| [T11](T11-irdai-payment.md) | IRDAI Payment Notice and Acknowledgement | IRDAI test payer | [T11-irdai-payment.md](T11-irdai-payment.md) |

## PMJAY payer and its adjudication

| # | Test | Payer | File |
|---|---|---|---|
| [T18](T18-pmjay-payment-status-cancel.md) | PMJAY Payment Notice, Status Refusal and Cancel | PMJAY test payer | [T18-pmjay-payment-status-cancel.md](T18-pmjay-payment-status-cancel.md) |

## Order

T1 and T2 first: nothing runs without the configuration and the two runners. Then the IRDAI tests in order, T3 to T12, then the PMJAY tests, T13 to T19. Within a payer the order is the claim's own: eligibility and plan, pre-authorisation, the payer's questions, claim, payment, and what follows a decision. Each test opens its own claim, so a failure in one does not leave the next without a starting point.
