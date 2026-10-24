# N6. Payment

#### GOAL
Record the payer's money: receive the payment notice and its reconciliation breakdown, match it to the claim, post it to the billing module, and acknowledge it. N6 closes the claim lifecycle.

#### DEPENDS ON
N0 (gateway, case shell, billing) and N5 (the claim a payment is matched to).

#### DELIVERS
- [S12. Payments](../screens/S12-payments.md) (the Payments tab: the payment notice, the reconciliation breakdown and the shortfall against the approved amount).
- [A8. Payment Notice Acknowledgement](../apis/A8-paymentnotice-on-request.md) (acknowledge the payment notice).
- [C10. Payment Notice](../callbacks/C10-paymentnotice-request.md) (the inbound payment notice).
- [F13. PaymentNotice](../fhir/F13-paymentnotice.md) and [F14. Payment acknowledgement](../fhir/F14-payment-acknowledgement.md) (the payment notice read and its acknowledgement).

#### REUSES
From N0: [F1. Bundle](../fhir/F1-bundle.md), [S6. Claim Detail](../screens/S6-claim-detail.md), the billing or accounts module discovery found, the gateway and [C1. Callback Door](../callbacks/C1-callback-door.md). From N5: the claim and its approved amount the payment is reconciled against.

#### STEPS
Run the ordinary steps scoped to the ids above, writing `nhcx-plan/N6/`: discovery, mapping, plan (the Payment phase), code plan, code, validation and dry-run. A milestone stops at dry-run; the live sandbox exchange (L8) runs once at the end across the whole lifecycle.

#### DONE WHEN
In dry-run (gateway mocked, callbacks stubbed): a payment notice replayed through a stubbed [C10. Payment Notice](../callbacks/C10-paymentnotice-request.md) is received on [S12. Payments](../screens/S12-payments.md), matched to its claim with the reconciliation breakdown and any shortfall shown, posted to billing and acknowledged through [A8. Payment Notice Acknowledgement](../apis/A8-paymentnotice-on-request.md). The live sandbox proof is deferred to the final end-to-end step. Once every milestone's dry-run is green, the final end-to-end step proves the whole lifecycle N1 to N6 against the sandbox.
