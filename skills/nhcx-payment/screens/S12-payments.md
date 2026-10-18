# S12. Payments Screen

#### S12R. ROUTE
claims/view/:caseid/payments

This is the Payments tab of the Claim Detail shell S6. Its route is `claims/view/:caseid/payments`. The tab appears only once a pre-authorisation has been raised on the case; before that, a link to it opens the Pre-authorisation tab ([S6. Claim Detail](S6-claim-detail.md)).

| Endpoint | Purpose |
|---|---|
| `POST claims/:caseid/payments/:pid/ack` | Send a payment notice's acknowledgement (again) |
| `POST claims/:caseid/payments/:pid/post` | Post the payment to the HMIS's bill (again) |

Breadcrumb: Claims (claims/list, S5) > `<claim number>`

#### S12D. DESCRIPTION
Every payment notice the payer has sent about this claim, newest first, and what each did to the admission's bill in the HMIS. The payer starts this leg, not the hospital. There is nothing to submit here. The actions are re-sending an acknowledgement that failed or is pending, and posting a payment to the bill again.

**Intro card.** The card is titled "Payments" and reads: "The payer starts this leg: it posts a **payment notice** when money moves, typically one when payment is initiated and another when it clears, matched to this claim by the `CLN` number inside it. Each is acknowledged back automatically the moment it lands."

Below the text are four stat tiles, in this order:

| Tile | Value | Tone |
|---|---|---|
| Notices | Count of notices on the claim | default |
| Shortfall | Claimed minus paid so far (never below zero), once something is paid and a claim is filed; else `-` | warning when above zero |
| Paid so far | Paid total (see below) | success when above zero |
| Claimed | The claim's requested amount, `-` before a claim is filed | default |

**Empty state.** When no notice has arrived, a centred placeholder with an inbox icon reads: "No payment notice yet. One arrives from NHCX when the payer moves money for this claim."

**One card per notice.**
- **Title:** the notice's disposition. When there is none, the title is "Payment notice".
- **Chips:**
  - **Payment status chip.** When the notice only announces an initiated payment (no UTR yet and a disposition containing "initiat" [REF](../references/PAYERS.md#markers)), the chip reads "Initiated, UTR awaited" in the warning tone. Otherwise it shows the payer's payment status code, coloured as follows:

    | Payment status | Tone |
    |---|---|
    | `paid`, `cleared` | success |
    | `issued` | info |
    | `pending`, `partial` | warning |
    | `failed`, `returned` | danger |
    | anything else | info |

  - **Acknowledgement chip:**

    | Ack status | Label | Tone |
    |---|---|---|
    | `pending` | Not acknowledged | warning |
    | `sent` | Acknowledged | success |
    | `error` | Acknowledgement failed | danger |

  - **Billing chip**, only once a posting was tried:

    | Billing status | Label | Tone |
    |---|---|---|
    | `posted` | posted to the bill | success |
    | `failed` | not posted to the bill | danger |

- **Billing error.** When the last posting failed, its error text sits under the chips in the danger colour.
- **Detail list** (three columns): Amount, Currency, Payment date, UTR, Claim number (the `CLN` the notice named), Received, Acknowledged. No correlation id or transaction id is shown; they are on the Logs tab ([S6. Claim Detail](S6-claim-detail.md)).
- **Breakdown table.** Shown when the reconciliation carries detail lines. Columns: Reference, Type (display, else code), Date, Amount.
- **Acknowledgement error.** When the last acknowledgement failed, its error text is shown in the danger colour.
- **Header actions.** A secondary "Post to bill" ("Post to bill again" once posted). When the acknowledgement is not `sent`, a primary button with a check icon: "Acknowledge" when pending, "Acknowledge again" after an error.

Callback: [C10. Payment Notice](../callbacks/C10-paymentnotice-request.md)

**Repeat and new notices.**
- **A later notice for the same payment.** Such a notice (same notice id on the same claim) updates the earlier notice instead of adding one: new values, a fresh breakdown, and the acknowledgement reset to `pending`. It is then acknowledged again on the new thread.
- **A new notice.** A new notice adds a card and recomputes the case's stage. With any notice, the case is at stage Payment, sub-stage "Paid" when the paid total is above zero, otherwise "Payment initiated".

**Automatic acknowledgement.** Every notice is acknowledged the moment it lands.

API: [A8. Payment Notice Acknowledgement](../apis/A8-paymentnotice-on-request.md)

A failed acknowledgement never rejects the notice:
- The notice is recorded.
- The notice keeps the acknowledgement status `error` with the message, and the card offers "Acknowledge again".

**Manual acknowledgement.** Refusals, verbatim as an error flash: "Payment notice not found." (also when the notice does not belong to this claim) and "Set the facility's HFR ID and NHCX participant code under Settings first." On success it flashes "Payment acknowledged to the payer." and re-reads the tab. A send failure flashes the error from [G7. Send](../gateway/G7-send.md) ("The acknowledgement was not accepted." when the gateway gave no words). The acknowledgement is an `on_` send, so it travels as `response.complete` ([A8. Payment Notice Acknowledgement](../apis/A8-paymentnotice-on-request.md)).

**Posting to the HMIS's bill.** Every notice that reports money that moved (status `paid`, `cleared`, `complete` or `completed`, or an amount with a UTR whose status is not initiated, pending or queued) is posted to the stay's bill the moment it lands ([D21. claim_payment](../database/D21-claim-payment.md)): an insurer receipt for the amount under the UTR, on the billing account of the linked admission, else the patient's open account at the facility. The posting goes through the one billing hook the integration bound to the HMIS's receipt records; the hospital's own billing screens then show the bill settled or part-settled, without re-keying. A failed posting never rejects the notice: it is recorded as `failed` with its reason. Posting twice (a redelivered notice, a second click) updates the same receipt and never doubles the money. "Post to bill" / "Post to bill again" re-runs it. Refusals, verbatim:
- "Nothing has been paid on this notice yet; there is no payment to post."
- "The case is not on an encounter with a billing account; open the account first."
- "The payment could not be posted to the bill: <reason>"

Success flash: "Posted to the hospital bill (account <account name>)."

**Paid total.** "Paid so far", the S6 header chip "Paid ₹X", the balance on the S11 release form and the "paid in full" checks all use the same sum. The rules are:
- Only notices whose status is `paid` or `cleared` count.
- A notice that only announces an initiated payment does not count.
- Each UTR is counted once, and the newest notice for that UTR wins. PMJAY sends one notice on initiation and another on clearing, both stamped `paid` for the full amount [PAYER](../references/PAYERS.md#markers). Adding them up would double the total.
- A notice with no UTR counts under its own id.

The result is rounded to 2 decimals.

**Wallet balance.** This is a different figure. It is not shown on this tab. It appears as the "Wallet balance" tile of the wallet on the Overview tab's validation card (S3. Policy Discovery (in nhcx-coverage)). It is computed as the allowed amount minus the used amount, with a missing used amount counted as 0. It is empty (`-`) when the payer reported no allowed amount. The tile is green when the policy is eligible and red when it is not. It comes from the coverage eligibility answer (its benefit rows), never from a package rate or a payment notice.

Data: [D9. claim](../database/D9-claim.md)

Data: [D20. claim_submission](../database/D20-claim-submission.md)

Data: [D21. claim_payment](../database/D21-claim-payment.md)

Data: [D22. claim_payment_detail](../database/D22-claim-payment-detail.md)

**Header signals in S6.**
- The "Paid ₹X" chip appears once the paid total is above zero.
- The Next buttons offer "Acknowledge the payment notice" while any notice's acknowledgement is `pending` or `error`. Otherwise they offer "Settled".
- Before any notice arrives, a decided claim offers "Await the payment notice".
- The Payments tab carries a dot when a notice arrived since the tab was last open ([S6. Claim Detail](S6-claim-detail.md)).

#### S12L. LAYOUT
The arrangement below is the reference implementation's [REF](../references/PAYERS.md#markers): follow the target HMIS's own screen conventions. What is required is in DESCRIPTION and ACTIONS: the fields, options, columns, statuses, messages and actions. Build it from the host's own card, stat tile, chip, table and flash (the component kit, [SCREENS.md](../references/SCREENS.md)).


```
|------------------------------------------------------------------|
| Claims > NM-000123                                               |
| <Beneficiary name>   [NM-000123] [Payment: Paid] [Paid ₹40,000]  |
| Next: [Settled]                                                  |
|------------------------------------------------------------------|
| Overview | Pre-authorisation | Claim | Communication | *Payments* | Logs |
|------------------------------------------------------------------|
| [Card] Payments                                                  |
|  The payer starts this leg: it posts a payment notice ...        |
|  [Notices 2] [Shortfall ₹10,000] [Paid so far ₹40,000] [Claimed ₹50,000] |
|------------------------------------------------------------------|
| [Card] Payment cleared          [Post to bill] [(v) Acknowledge] |
|  [paid] [Not acknowledged] [posted to the bill]                  |
|  Amount ₹40,000   Currency INR      Payment date 2026-09-20      |
|  UTR 12345678     Claim number ...  Received ...                 |
|  Acknowledged -                                                  |
|  Reference | Type | Date | Amount                                |
|  <ack error in danger colour, when one failed>                   |
|------------------------------------------------------------------|
| [Card] Payment initiated                                         |
|  [Initiated, UTR awaited] [Acknowledged]                         |
|  ...                                                             |
|------------------------------------------------------------------|
```

- The intro card comes first, then one card per notice, newest first.
- With no notice, the intro card is followed by a card holding the empty-state placeholder.
- The stat tiles sit in four columns from small screens up.
- The chips sit in a wrapping row at the top of each notice card.
- The post and acknowledge buttons sit in the card header, right-aligned.

#### S12A. ACTIONS
1. Acknowledge / Acknowledge again: send the payment acknowledgement for that notice and reload S12, where the chip shows "Acknowledged" or the error.
1a. Post to bill / Post to bill again: post the receipt to the HMIS's bill and reload S12, where the billing chip shows whether it was posted, with the error when not.
2. Refresh (S6 header, when shown): reload S6 on this tab. Notices arrive pushed through the callback door, so a reload shows new ones.
3. Next "Acknowledge the payment notice" (S6 header): come to this tab.
4. Claim tab: go to Claim Submission S11, for example to ask for the unpaid balance.
5. Breadcrumb "Claims": go to the Claim Master S5.
