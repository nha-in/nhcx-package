# Tests

The end-to-end tests the skill writes into the target payer system, one spec per scenario. Every test runs two ways, and both are required: through the desk screens (GUI, a browser driving the S screens) and from the command line (CLI, a runner calling the A services). Both take the same configuration ([T1. Test Configuration](T1-test-configuration.md)), share the same runner contract ([T2. Test Runners](T2-test-runners.md)), and pass or fail on the same expectations. Each file has DESCRIPTION (D), SETUP (S), GUI (G), CLI (L) and EXPECT (X) sections, and refers to screens by S number, APIs by A number and callbacks by C number.

The hospital's side of every exchange is driven through the sandbox provider EMR (A18. Provider Driver): the runner signs in to it by token login, has it send the message under test, and reads what it shows once this payer has answered. The facility code it sends as, and the members the tests seed here, are in [T1. Test Configuration](T1-test-configuration.md).

## Harness

| # | Test | Provider side | File |
|---|---|---|---|
| [T1](T1-test-configuration.md) | Test Configuration | both | [T1-test-configuration.md](T1-test-configuration.md) |
| [T2](T2-test-runners.md) | Test Runners | both | [T2-test-runners.md](T2-test-runners.md) |

## Queries

| # | Test | Provider side | File |
|---|---|---|---|
| [T8](T8-preauth-queried.md) | Pre-auth Queried and Answered | sandbox provider EMR | [T8-preauth-queried.md](T8-preauth-queried.md) |

## Order

T1 and T2 first: nothing runs without the configuration and the two runners. Then coverage and plan, T3 to T5; pre-authorisation, T6, T7, T9, T10 and T11; queries, T8; claim, T12 to T14; payment, T15 and T16; then status and redelivery, T17 and T18. Within a group the order is the case's own: what the hospital sends first is tested first. Each test seeds its own member and enrolment and opens its own case, so tests run in any order and a failure in one leaves the next its own starting point.
