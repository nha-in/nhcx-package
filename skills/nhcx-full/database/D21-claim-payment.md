# D21. claim_payment

#### D21T. TABLE
One row is one payment the payer notified on a claim (a PaymentNotice), with the acknowledgement sent back for it. Primary key `id`. Parent table: `claim` (D9), many rows per claim; children in `claim_payment_detail` (D22).

#### D21D. DESCRIPTION
This is the one leg the payer starts. It posts a payment notice when money moves and expects an acknowledgement straight back. There is no correlation id of ours to match on, so the claim is found by the claim number inside the bundle.

**Created.** By the payment notice callback (C10):

1. The bundle is flattened from its `PaymentNotice`, `PaymentReconciliation` and `Task`. A bundle with neither of the first two is refused ("That is not a payment notice.").
2. A notice whose correlation id is already on a row is a redelivery and is ignored.
3. The claim number is read from the `CLN`-typed identifier on the PaymentNotice, else the PaymentReconciliation, else the Task, else the first entry's untyped identifier. It is matched against `claim.claim_no`, then against the `claim_ref` of D20 and D18 (a cancellation retires numbers). No match: the notice is `unmatched` and nothing is stored.
4. If a row on the same claim has the same `notice_id` (the payer sends one notice when the transfer is initiated, workflow `30`, `paid`, no UTR, and one when it clears, workflow `31`, `cleared`, with the UTR [PAYER](../references/PAYERS.md#markers)), that row is updated with the new notice, its acknowledgement is reset (`ack_status` `pending`, `ack_txn_id`, `ack_correlation_id`, `acknowledged_at`, `ack_error` cleared) and its D22 rows are replaced. `notice_id` is the payment's identity, read in this order ([F13. PaymentNotice](../fhir/F13-paymentnotice.md)): `PaymentNotice.id`; else the payment id in the PaymentReconciliation's `detail[]` placer identifier (`<paymentId>/Payment`, the part before the slash: the sandbox payer sends no `PaymentNotice.id` at all and names the payment only this way, on both notices [SANDBOX](../references/PAYERS.md#markers)); else nothing. With no identity at all, the earlier row is the newest `paid` row on the same claim with no `utr`, the same `amount` and the same `payment_date` (the initiation this notice completes). Otherwise a new row is inserted. A build that keyed on `PaymentNotice.id` alone showed every payment twice on S12, an "Initiated, UTR awaited" card that never filled beside the cleared one, and the desk read it as a missing UTR [SANDBOX](../references/PAYERS.md#markers).
5. The acknowledgement is sent at once (below), right after the billing posting of step 6. A failed acknowledgement does not fail the callback.
6. Before the acknowledgement, a notice that reports money that moved is **posted to the HMIS's billing** (below). A failed posting does not fail the callback either, and the acknowledgement still goes.

**Posting to the HMIS's billing.** A payment notice is money the hospital has received; recording it on the claim alone leaves the admission's bill unpaid in the HMIS and the finance desk reconciling by hand. So a notice that reports money that moved is posted to the HMIS's own billing or accounts module through one service hook, `billing.post_payer_payment(claim, payment)`, which the L2 mapping binds to the HMIS's payment records (L1.3 `billing` in `discovery.json`; [SCAFFOLDING.md](../references/SCAFFOLDING.md), section 4, Billing).
- **Money that moved:** `payment_status` (case ignored) is `cleared`; or it is `paid`, `complete` or `completed` and the row has a `utr`; or the row has an `amount` and a `utr` and its status is not `initiated`, `pending` or `queued`. A `paid` notice without a UTR is the workflow-30 initiation: nothing is posted until the UTR arrives. Anything else, or no amount, is refused: "Nothing has been paid on this notice yet; there is no payment to post."
- **The account:** the billing account of the linked admission (D9 `encounter_id`), else the patient's open account at the facility. None: `billing_status` `failed` with "The case is not on an encounter with a billing account; open the account first." and that refusal.
- **What is posted:** one payment record on that account for `amount`, issuer the insurer, reference = `utr`, dated when the notice was received, narration the payer's disposition (else "NHCX payment on claim `<claim number>`") and a note naming the claim number; the account is then rebalanced. The record is tagged with this row's id, so a second posting of the same row (a notice about the same payment, a second click) updates that record instead of adding money twice. Nothing else is posted: the shortfall between billed and approved is not written to the bill.
- **Outcome:** `posted` with `billing_ref` (the HMIS record's id) and `billing_posted_at`, flash "Posted to the hospital bill (account `<account name>`)."; a failure writes `failed` with `billing_error` and refuses "The payment could not be posted to the bill: `<error>`".

**Billing statuses** (`billing_status`): empty (nothing posted yet), `posted`, `failed`. S12 "Post to bill" posts the row again, whatever its status.

**Acknowledgement statuses** (`ack_status`, exact strings): `pending`, `sent`, `error`.

- `pending` to `sent`: the acknowledgement Task went (A8). Writes `ack_txn_id`, `ack_correlation_id`, `acknowledged_at`, clears `ack_error`. It goes to `sender_code` (else the claim's payer), carries this notice's `correlation_id`, and its workflow id is the adapter's `payment_ack` (see [PAYERS.md](../references/PAYERS.md)) [PAYER](../references/PAYERS.md#markers), else this row's `workflow_id`, else `claim_ref`, else the claim number.
- `pending` to `error`: the send failed. Writes `ack_error` and, when [G7. Send](../gateway/G7-send.md) named them, `ack_txn_id` and `ack_correlation_id`.
- `error` to `sent`: re-sent by hand from Payments (S12).

**Reading the money.** `paid_total` counts rows whose `payment_status` is `cleared`, or `paid` with a `utr` (any case); a `paid` row with no `utr` is money on its way (the workflow-30 initiation) and is skipped [PAYER](../references/PAYERS.md#markers). It counts each UTR once (newest row wins; a row without a UTR counts by its id).

**The shortfall** ([S12. Payments](../screens/S12-payments.md)) is a different reading: what the notices account for: per notice (the newest row of each PaymentNotice id, else each row), the sum of its reference lines ([D22. claim_payment_detail](D22-claim-payment-detail.md): the payment, the TDS and every other deduction line), else its `amount` when it has no lines; summed over the notices, set against the claim's approved amount (the claim leg's `approved_amount`, [D20. claim_submission](D20-claim-submission.md)), never the claimed amount. Equal means no shortfall; otherwise approved minus accounted, never below 0; `-` until the claim has an approved amount and a notice has arrived. The claim stage becomes `payment` as soon as one notice exists: `paid` when that total is above 0, else `noticed`.

**Deleted.** Never by the application; by cascade with the claim or when the transactional store is cleared.

#### D21C. COLUMNS
| Column | Type | Null / default | Meaning |
|---|---|---|---|
| id | INTEGER | primary key | Row id |
| claim_id | INTEGER | NOT NULL | The claim (D9) the notice names |
| claim_ref | TEXT | null | The claim number the notice named |
| correlation_id | TEXT | null, unique | The payer's correlation id; dedupes redeliveries |
| sender_code | TEXT | null | `x-hcx-sender_code` of the notice; the acknowledgement goes back to it |
| workflow_id | TEXT | null | `x-hcx-workflow_id` of the notice |
| received_at | TEXT | NOT NULL | When the notice was stored |
| disposition | TEXT | null | `PaymentReconciliation.disposition`, else `Task.description`, else the payment status display, else the reconciliation outcome, else "Payment notice" |
| payment_status | TEXT | null | `PaymentNotice.paymentStatus` code, for example `paid`, `cleared` |
| payment_date | TEXT | null | `PaymentReconciliation.paymentDate`, else the date part of `PaymentNotice.created` |
| amount | REAL | null | `PaymentNotice.amount.value`, else `PaymentReconciliation.paymentAmount.value` |
| currency | TEXT | null | Currency of that amount |
| utr | TEXT | null | Unique Transaction Reference: `PaymentReconciliation.paymentIdentifier.value`; a placeholder value (`Not available`, `N/A`, `NA`, `none`, `null`, `-`, case ignored) is stored as null so it never reads as a UTR [SANDBOX](../references/PAYERS.md#markers) |
| notice_json | TEXT | null | The notice bundle as received |
| ack_status | TEXT | NOT NULL, default `pending` | `pending`, `sent`, `error` |
| ack_txn_id | TEXT | null | Ledger id of the acknowledgement |
| ack_correlation_id | TEXT | null | Correlation id the acknowledgement went out under |
| acknowledged_at | TEXT | null | When the acknowledgement went |
| ack_error | TEXT | null | Why the acknowledgement failed |
| notice_id | TEXT | null | The payment's identity: `PaymentNotice.id`, else the payment id from the reconciliation's `detail[]` placer identifier (rule 4); a later notice with the same identity updates this row. Migration only |
| billing_status | TEXT | null | empty (not posted yet), `posted`, `failed`: whether the payment reached the HMIS's billing. Added by migration |
| billing_ref | TEXT | null | The id of the HMIS payment record the posting created or updated. Added by migration |
| billing_error | TEXT | null | Why the posting failed. Added by migration |
| billing_posted_at | TEXT | null | When the posting succeeded. Added by migration |

#### D21K. KEYS AND INDEXES
- Primary key `id` (integer).
- Foreign key `claim_id` references `claim (id)` (D9), `ON DELETE CASCADE`. D22 rows reference this table.
- Index `ix_claim_payment` on `(claim_id, id DESC)`; notices are listed newest first.
- Unique index `ux_claim_payment_corr` on `(correlation_id)`. SQLite allows several nulls.

#### D21U. USED BY
- Screens: [S5. Claim Master](../screens/S5-claim-master.md), [S6. Claim Detail](../screens/S6-claim-detail.md), [S11. Claim Submission](../screens/S11-claim-submission.md), [S12. Payments](../screens/S12-payments.md)
- APIs: [A8. Payment Notice Acknowledgement](../apis/A8-paymentnotice-on-request.md), [A17. Claim State](../apis/A17-claim-state.md)
- Callbacks: [C1. Callback Door](../callbacks/C1-callback-door.md), [C10. Payment Notice](../callbacks/C10-paymentnotice-request.md)
- FHIR: [F13. PaymentNotice](../fhir/F13-paymentnotice.md), [F14. Payment acknowledgement](../fhir/F14-payment-acknowledgement.md)
- Database: [D9. claim](D9-claim.md), [D22. claim_payment_detail](D22-claim-payment-detail.md), [D29. claim_enquiry](D29-claim-enquiry.md)
- Tests: [T10. IRDAI Claim Approved, Part-approved and Rejected](../tests/T10-irdai-claim.md), [T11. IRDAI Payment Notice and Acknowledgement](../tests/T11-irdai-payment.md)
