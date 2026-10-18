# S5. Claim Master Screen

#### S5R. ROUTE
claims (the Claim dashboard)
claims/list?stage=<stage>&sub_stage=<sub-stage>&status=<status>&payer=<code>&search=<text>&page=<n>[&patient=<id>] (Claim management, the claim list)

`patient` narrows the list to one patient's cases; the patient master's "Claims" shortcut ([S13. Patient List](S13-patient-list.md), [S15. Patient Detail](S15-patient-detail.md)) opens the list this way, with "For patient <name>" and "Clear" above it.

| Endpoint | Purpose |
|---|---|
| `GET claims/dashboard?period=day\|week\|month\|year\|all&date=YYYY-MM-DD&payer=` | The dashboard's counts and money for the period, and the facility's payers for the filter |
| `GET claims?stage=&sub_stage=&status=&payer=&search=&patient=&limit=&offset=` | The list |

A date that is not `YYYY-MM-DD` is refused: "Enter the date as YYYY-MM-DD."

Page titles: Claim dashboard, Claim management. The Claims item of the navigation opens as one module with exactly two entries under it, labelled "Dashboard" (claims) and "Management" (claims/list); discovery is not a navigation entry, it opens from the Management header and from S2.

#### S5D. DESCRIPTION
**One module, two screens.** *Claim dashboard* says where the facility's cases stand; *Claim management* is the ledger of cases, where a claim is opened (the stepper, S1. Search Policy (in nhcx-coverage)), a discovery started (S17. Beneficiary Discovery (in nhcx-coverage)) and an existing case found ([S6. Claim Detail](S6-claim-detail.md)). Neither screen makes an NHCX call: the stage of each case is updated whenever a leg moves (a payer answer lands, a send goes out, a case is opened on S6), so both are current without anyone opening a case. This is the shape of the live PMJAY provider's home and claim list [REF](../references/PAYERS.md#markers).

**What is counted.** Only real cases: a row still **provisional** (behind the validation gate, S2. Select Policy (in nhcx-coverage)) is never listed, counted or offered as a payer, and a discovery that found no policy is left out.

**Payer filter.** Both screens filter by payer. The options are the payers on this facility's cases, one per payer: codes that differ only in their `@` suffix or its case (`<digits>`, `<digits>@hcx`, `<digits>@HCX`) are one payer, matched on the part before `@`. Each option shows the payer's name (the registry's, else the code); blank "All payers". A payer carried in the URL that is not in the list is still offered by its code. The filter goes with every tile and tab into the list.

**Claim dashboard.** One card. Its header is one line: the period's label as the title ("18 Oct 2026", "13 Oct - 19 Oct 2026", "October 2026", "2026"), then the period switch Day / Week / Month / Year (default Day), a date picker (default today), the payer select, and "Open the claim list". The period filters by the date the case was opened. Below, rows of tiles, each a count that opens the list filtered the same way:

| Row | Tiles (tone) |
|---|---|
| (stages) | Draft (stage `eligibility`), Pre-authorisation (`preauth` and `enhancement`, info), Claim (`claim`, info), Paid (`payment`, success) |
| Pre-authorisation | Submitted (`requested`, `resubmitted`, `answered`; info), Queried (warning), Approved (`approved`, `partial`; success), Rejected (danger) |
| Claim | Submitted, Queried, Approved, Rejected, the same way |
| Payment | In process: claims approved with no payment notice yet (info, opens `claim` / `approved`); Initiated: a payment notice received (warning, `payment` / `noticed`); Paid: the payment reconciled (success, `payment` / `paid`) |

Under the tiles, two bar charts drawn to scale: "Cases by stage" and "New cases per day". An empty period reads "No cases opened in this period." under each chart.

**Claim management.** A row of quick tabs, each with its all-time count (on the payer chosen): All, Draft (stage `eligibility`), Pre-authorisation (`preauth`), Queried (sub-stage `queried`, any stage), Claim (`claim`), Rejected (sub-stage `rejected`, any stage), Paid (`payment`). Then one card whose header is one line: the title "<n> claim(s)", then a search box, the payer select, the status select, "New claim" (primary) and "Discovery". Every tab and filter is a URL parameter, so a view can be bookmarked; changing a filter goes back to page 1.

**Search box.** Placeholder "Search patient, member id, claim no.". It matches the patient (beneficiary) name, member id, claim number, policy code and ABHA number as a contains match. It is debounced: the list follows once typing pauses (400 ms [REF](../references/PAYERS.md#markers)) and the term is written to the URL as `search`.

Table columns, newest case first (by case id, descending), 14 rows a page with "Previous", "Page <p> of <q>" and "Next" when there is more than one page:

| Column header | Content |
|---|---|
| Beneficiary | beneficiary name (else "Unknown") as a link to S6, over `<case number> · <member id>` (muted) |
| Policy | product name, else plan name, else "-", over the policy code (muted) |
| Payer | payer name, or "-" |
| Stage | the stage label, or "-" |
| Sub stage | the sub-stage chip, or "-" |
| Opened | the date the case was opened, `YYYY-MM-DD` |
| Amount | the pre-authorisation total quoted on the case (D9 `preauth_total`), `₹` with thousands separators; "-" until lines are quoted |

**Status filter.** Status is the result of the coverage eligibility check (S3), not the whole case. Values, in the select's order, with a blank first option "All claims":

| Value | Label | Tone |
|---|---|---|
| `draft` | Draft | warning |
| `checking` | Awaiting payer | info |
| `eligible` | Eligible | success |
| `not-eligible` | Not eligible | danger |
| `error` | Error | danger |

An unknown `status` value in the URL is ignored and shows all claims. The same chips are the case's status on S3.

**Stage and sub-stage.** Where the case stands. S6's header chip reads "<Stage>: <Sub-stage>", toned by the sub-stage; this list shows the two in their own columns.

Stages (the leg the case is on, in the order a case walks them):

| Value | Label |
|---|---|
| `eligibility` | Draft |
| `preauth` | Preauth |
| `enhancement` | Preauth (enhancement) |
| `claim` | Claim |
| `payment` | Payment |

Sub-stages (what was last done with that leg):

| Value | Label | Tone |
|---|---|---|
| `draft` | Create | warning |
| `checking` | Validating | info |
| `eligible` | Validated | success |
| `not-eligible` | Not covered | danger |
| `requested` | Submitted | info |
| `resubmitted` | Resubmitted | info |
| `answered` | Query answered | info |
| `queried` | Queried | warning |
| `approved` | Approved | success |
| `partial` | Partially approved | warning |
| `rejected` | Rejected | danger |
| `cancelling` | Withdrawing | warning |
| `cancelled` | Withdrawn | danger |
| `refused` | Refused at the door | danger |
| `noticed` | Payment initiated | info |
| `paid` | Paid | success |

How the pair is worked out (read off the legs, never typed in):
- Any payment notice on the case: `payment`, with `paid` when money has settled, else `noticed`.
- Else a claim that has been sent (not a draft): `claim`, with the claim leg's sub-stage.
- Else a pre-authorisation that has been sent: `preauth`, or `enhancement` when the last send was an enhancement, with that leg's sub-stage.
- Else a saved but unsent pre-authorisation: `preauth` / `draft`.
- Else `eligibility`, with the eligibility status as the sub-stage (`error` shows as `draft`).
- A leg's sub-stage is its own status. A send still in flight reads by what it went out as: `requested` for a first send, `resubmitted` for a resubmission, `answered` for a query response. A leg in error reads `refused`.
- A payer query that is still unanswered turns a leg that is with the payer (`requested`, `answered`, `resubmitted`) into `queried`.

Data: [D9. claim](../database/D9-claim.md)

Data: [D18. claim_preauth](../database/D18-claim-preauth.md)

Data: [D20. claim_submission](../database/D20-claim-submission.md)

Data: D21. claim_payment (in nhcx-claim)

Data: [D23. claim_query](../database/D23-claim-query.md)

**Empty state.** With no rows (none at all, or none matching) the table is replaced by the muted line "No claims yet. Start from a policy search."

No correlation id, transaction id or adapter name appears on either screen.

#### S5L. LAYOUT
The arrangement below is the reference implementation's [REF](../references/PAYERS.md#markers): follow the target HMIS's own screen conventions. What is required is in DESCRIPTION and ACTIONS: the fields, options, columns, statuses, messages and actions. Every control is the host's own component of that kind (date picker, select, table, chip, card), as L1 records it.

```
Claim dashboard:
|------------------------------------------------------------------------------|
| 18 Oct 2026   [Day|Week|Month|Year] [2026-10-18] [All payers v] [Open the claim list]
|------------------------------------------------------------------------------|
| [Draft 4] [Pre-authorisation 19] [Claim 24] [Paid 45]                        |
| Pre-authorisation: [Submitted 7] [Queried 2] [Approved 9] [Rejected 1]       |
| Claim:             [Submitted 6] [Queried 1] [Approved 15] [Rejected 2]      |
| Payment:           [In process 5] [Initiated 3] [Paid 45]                    |
| Cases by stage [▇▇▇▇ 12]          New cases per day [▁▂▃▅ 4]                 |
|------------------------------------------------------------------------------|

Claim management:
|------------------------------------------------------------------------------|
| [All 92] [Draft 4] [Pre-authorisation 19] [Queried 3] [Claim 24] [Rejected 3] [Paid 45] |
| [Card] 92 claim(s) [Search patient, member id, claim no.] [All payers v]     |
|                    [All claims v] [New claim] [Discovery]                    |
|------------------------------------------------------------------------------|
| Beneficiary        | Policy       | Payer   | Stage   | Sub stage  | Opened     | Amount  |
| Asha Devi (link)   | PMJAY for HP | SHA HP  | Preauth | [Approved] | 2026-09-10 | ₹45,000 |
| NM-26-0SE.. · MD5..| PMJAY/HP/S/G |         |         |            |            |         |
|                         [Previous]  Page 1 of 7  [Next]                      |
|------------------------------------------------------------------------------|
```

- Each header is one line that wraps only on narrow screens.
- Tiles are small bordered boxes tinted by their tone; a tile is a button.
- The table scrolls sideways on narrow screens. Two-line cells show a main value over a muted line.

#### S5A. ACTIONS
1. New claim: open the stepper at its first step, S1 (carrying `patient` when the list is filtered to one).
2. Discovery: open the discovery page S17.
3. A dashboard tile, or "Open the claim list": go to Claim management with the tile's stage and sub-stage, and the payer.
4. Period, date or payer on the dashboard: reload it with `?period=&date=&payer=`.
5. Quick tab: reload the list with its `stage` or `sub_stage`.
6. Search, payer or status: reload the list with the filter, from page 1. "All claims" clears the status.
7. Previous / Next: the previous or next page.
8. Beneficiary link: open the case on S6, which lands on its first tab, Overview (S3).
9. Clear (beside "For patient <name>"): drop the patient filter.
