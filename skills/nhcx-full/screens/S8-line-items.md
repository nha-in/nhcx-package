# S8. Line Items Screen

#### S8R. ROUTE
Cards on claims/view/:caseid/preauth, the Pre-authorisation tab of S6. There is no Line items tab and no picker page: the retired keys `lines` and `validate` open the Pre-authorisation tab, and the old picker route (`lines/choose`) is not built.

Breadcrumb: Claims (claims/list, S5) > <case number> (S6)

Parts in this file:
- The Line items card: the first card of the Pre-authorisation tab (under the proof of presence card of [S18. Beneficiary Verification](S18-beneficiary-verification.md) when the payer needs one).
- S8.1, the add row, the lines table and the suggestions, all inside the Line items card (the old Choose Line Items page).
- S8.2, the Authorisation requirements card, beside the Benefits check card under the Line items card, once a line is quoted.

Every action here posts to its own endpoint, re-reads the case and leaves a flash above the tabs (S6): green with the message on success, red with the refusal verbatim.

#### S8D. DESCRIPTION
What the pre-authorisation quotes: the procedures being done, the implants the payer approves for them, and the ward or ICU tier the stay runs at. **Every line comes from the payer's insurance plan** ([S7. Insurance Plan](S7-insurance-plan.md)), priced at the payer's rate. There are no custom line items and no local price list: the only price the desk ever types is an open rate (below). D9 `case_type` is always `package`; the stored value `nonpackage` is kept only for old rows.

Line kinds:

| Value | Label | Chip tone |
|---|---|---|
| `Procedure` | Procedure | info |
| `Implant` | Implant | warning |
| `Stratification` | Ward / ICU tier | neutral |

A ward or ICU tier is not a line of its own. Its rate is inside the amount of the procedure it was quoted through [PAYER](../references/PAYERS.md#markers). So the table never lists a tier as a row: it shows in the "Ward / ICU tier" column of its procedure. A tier whose procedure has been removed hangs off the first remaining procedure; with no procedure at all it shows as its own row.

**"Category" everywhere.** The plan's grouping of packages (PMJAY calls it a speciality) is labelled **Category** on every screen and in every message the desk reads, refusals included.

**Before the plan is ready** (no plan, or a status other than `ready`): the card is replaced by the Insurance plan fetch card of [S7. Insurance Plan](S7-insurance-plan.md) (fetch, waiting, error), so the desk fetches the plan where the lines are quoted.

**With the plan ready**: a card titled "Line items", in three parts (S8.1): the add row, the lines table, and the suggestions.

**The two checks** sit side by side under the Line items card (stacked on a narrow screen), and only once at least one line is quoted: the **Benefits check** card (left) and the **Authorisation requirements** card (right, S8.2). Whether each is offered is the integrator's decision `preauth.benefitsFirst` and `preauth.authRequirementsFirst` ([L1.A](../steps/L1-discovery.md)), offered by default. Both are checks, never gates: a pre-authorisation is sent with or without them, an unfavourable answer is shown and does not block, and a payer that never answers (PMJAY's sandbox) holds nothing up [SANDBOX](../references/PAYERS.md#markers). A benefits check in flight (`checking`) or whose send failed (`error`) does not withdraw the case's validation: the case stays in force and the Pre-authorisation tab stays open.

**Benefits check card.** Title "Benefits check". Header button "Ask what the policy covers" (wallet icon, outline style); while the case is `checking` it reads "Awaiting the payer" and is disabled. Body: "Sends the <n> quoted line(s) to the payer as a benefits check: what does the policy cover for these packages? Optional, before the pre-authorisation; the pre-authorisation can go without it." Once a benefits check has been sent (the case's last purpose is `benefits`):
- "Last benefits check: <status>, <when>."
- When the payer has answered, a muted box "What the payer answered" with "Outcome: <outcome>" and the disposition sentence (for example "All 1 requested items are covered; pre-authorisation is required and the documents listed must accompany it.").
- When not waiting, the **coverage benefits table**, one row per `insurance.item` of the reply (the benefit summary is must-support, so every row the payer sent is shown); empty "The payer listed no itemised benefits on its last reply.":

| Column | Content |
|---|---|
| Item | the product's display (else the item's name, else its code, else "Policy wallet"), over a muted line `<code> · <category>` (with " · Policy wallet" on the wallet row) and the item's description |
| Cover | chip "Covered" (success) or "Excluded" (danger), or `-`; under it "Term: <term>" and "Network: <network>" when given |
| Authorisation | "Required", "Not required" (`authorizationRequired`), or `-` |
| Benefits | one line per `benefit`: "<benefit type>: allowed <allowed>", with " · used <used>" when given; money as `₹`, a count or text as sent |
| Supporting documents | the `authorizationSupporting` codes (display, else code), comma separated, or `-` |

No correlation id is shown on this card (it is on the Logs tab of [S6. Claim Detail](S6-claim-detail.md)).

The button sends A2 `benefits` for the case's policy code and member id, with the same checks as the validation on [S3. Policy Discovery](S3-policy-discovery.md). Flash: "Eligibility request queued to the payer."

Data: [D16. claim_line](../database/D16-claim-line.md)

Data: [D10. claim_plan](../database/D10-claim-plan.md)

Data: [D11. claim_plan_benefit](../database/D11-claim-plan-benefit.md)

#### S8L. LAYOUT
The arrangement below is the reference implementation's [REF](../references/PAYERS.md#markers): follow the target HMIS's own screen conventions. What is required is in DESCRIPTION and ACTIONS: the fields, options, columns, statuses, messages and actions.


```
|------------------------------------------------------------------|
| [Card] Line items                                                |
|  Code                          Category           Type           |
|  [(search) Item or package code, or name]  [All v]  [All v]      |
|   +--------------------------------------------+                 |
|   | Appendicectomy                 [Procedure] |  (matches)      |
|   | SB039A · General Surgery          ₹20,000  |                 |
|   +--------------------------------------------+                 |
|  ----------------------------------------------------------------|
|  Kind | Item | Category | Ward / ICU tier | Rate | Quantity | Amount |  |
|  [Procedure] Appendicectomy  General  [ICU · STRAT01] +₹5,000 [Remove]
|               SB039A                  ₹20,000  [1]  ₹25,000  [Remove]
|                                             Total ₹25,000        |
|  ----------------------------------------------------------------|
|                                         [(save) Update lines]    |
|  ----------------------------------------------------------------|
|  Suggested by the payer's plan                                   |
|  v Implants approved for these procedures                        |
|    Code | Implant | Rate | [+ Add]                               |
|  v Ward and ICU tiers                                            |
|    Code | Tier | For | Rate | [+ Add]                            |
|------------------------------------------------------------------|
| [Card] Benefits check            | [Card] Authorisation          |
|   [(wallet) Ask what the policy  |  requirements [Validated]     |
|    covers]                       |      [(refresh) Check again]  |
|------------------------------------------------------------------|
```

- The add row's fields wrap on narrow screens; the matches list opens under the Code field.
- Chips and amounts are compact; the table scrolls sideways inside its card on narrow screens.
- Add and Remove are extra-small buttons; Remove is the danger style and always confirms.

#### S8A. ACTIONS
1. Type a code or name (two letters or more), or pick a Category: list the plan's matches under the Code field.
2. Pick a match (click, or Enter for the first): add it as a line at the plan's rate, clear the field and re-read the case.
3. Edit a quantity or an open rate, then Update lines: recompute the amounts and re-read the case.
4. Remove (line or tier): after the confirm, take it off and re-read the case.
5. Add (a suggested implant or tier): add the line at the plan's rate and re-read the case.
6. Ask what the policy covers: send the benefits check on the quoted set (A2 `benefits`) with "Eligibility request queued to the payer."
7. Validate procedure set / Check again: S8.2.
8. Breadcrumb "Claims": S5. Case number: S6.

---

## S8.1 Choose Line Items (inside the Line items card)

#### S8.1R. ROUTE
No route of its own: the add row, the lines table and the suggestions are the body of the Line items card on claims/view/:caseid/preauth.

#### S8.1D. DESCRIPTION
**The add row.** Three fields side by side:

| Field | Control | Behaviour |
|---|---|---|
| Code | type-ahead, placeholder "Item or package code, or name", a search icon inside it | Matches the plan's packages whose code or name contains the text, any case, once two letters or more are typed (or a Category is chosen); waits a quarter second after typing stops; lists at most 20 |
| Category | select, default "All" | Only the categories that hold a quotable package (a Procedure or an Implant), each as `<name> (<count>)`, counted by those packages and sorted by name. A cover benefit such as an ambulance or a room sub-limit is not a line, so a category holding only such benefits is not listed |
| Type | select, default "All" | `Procedure` or `Implant` |

The matches list opens under the Code field. Each match shows the package name (else its code) over a muted line `<code> · <category>`, and on the right the kind chip with the rate under it: the rate in whole rupees; "<rate> +<k> tier(s), up to <rate plus the dearest tier>" when ward or ICU tiers are priced over it; "tiers only" when the rate is zero and tiers exist; "open" when the plan names no rate, or zero with no tier. A benefit a pre-authorisation cannot quote (a policy-wide allowance) is never listed. While the first search runs the list reads "Loading..."; with no match it reads "Nothing matches that search." Escape closes the list; a click outside closes it.

Picking a match adds it: the server is told the kind, the code and the category (`category_code`). One row per package **per category**: Dengue `MG004A` is three rows on a PMJAY master, and the desk picks the one for the category the case is treated under, which is what goes out as `Claim.item.category` [PAYER](../references/PAYERS.md#markers).

**The lines table.** One form. Columns:

| Column | Content |
|---|---|
| Kind | Kind chip |
| Item | Name, code underneath; a small "cycle <n>" tag for the second cycle onward |
| Category | Category name, or `-` |
| Ward / ICU tier | One chip per tier, `<tier label> · <tier code>`, with `+₹<amount>` beside it and its own red "Remove" button (confirm "Take this tier off the preauth?"); `-` when none |
| Rate | The plan's rate, `₹` whole rupees. Where the price is **open** (the plan names no rate, or names zero and offers no ward or ICU tier for the package), a number field instead (min 0, step 0.01), since such a package is billed at the hospital's own price [PAYER](../references/PAYERS.md#markers). A zero rate with tiers is not open: the package is priced by its tiers alone and cannot be typed over |
| Quantity | Number field (min 1, step 1), whole numbers |
| Amount | `₹` whole rupees |
| (action) | Red "Remove" button, confirm "Take this line off the preauth?" |

Under the table, right-aligned: "Total ₹<sum of all line amounts>" (tiers included). A footer with the primary "Update lines" button (save icon). What is typed is kept until the lines themselves change. Empty state (no table, no button): "Nothing quoted yet. Type a package code or name above to add it from the insurance plan."

**The suggestions** (only when there is something to suggest), under the table, headed "Suggested by the payer's plan". Built from the procedures already quoted, from what their plan entries allow, leaving out codes already quoted and each code only once. An accordion with up to two sections, both open:
- "Implants approved for these procedures": columns Code, Implant, Rate, and a primary "Add" button (plus icon) that adds it as an `Implant` line.
- "Ward and ICU tiers": the procedures' `Stratification` tiers. Columns Code, Tier, For (procedure name with its code underneath), Rate, and "Add" that adds it as a `Stratification` line quoted through that procedure (`parent_code`).

**Adding a line.** The price is read from the plan at add time, never from the screen: a Procedure or Implant takes the benefit's rate under that category (an open price starts at 0 and is typed in the table), a tier takes the rate its parent procedure lists for it (different procedures price the same ward differently [PAYER](../references/PAYERS.md#markers)). The new line starts at quantity 1. Rules, each shown verbatim as a red flash:
- Kind not one of the three: "That is not something a preauth can quote."
- No code: "Nothing was selected."
- Plan not ready: "Fetch the payer's insurance plan first, the preauth quotes its packages and its rates."
- Category given and the code is not under it: "<code> is not listed under <category code> in this plan."
- Category missing when the code is listed under more than one: "Pick the category this package is quoted under: <code> is listed under <names>."
- Tier with an unknown parent: "Pick the procedure this ward tier belongs to."
- Tier the parent does not offer: "That ward tier is not offered for this package."
- Code not in the plan as that kind: "<code> is not a <kind in lower case> in this plan." (with " under <category code>" before the full stop when a category was given)
- Already quoted, and the package is not cyclic: "<code> is already on this preauth."
- Already quoted, and the package **is** cyclic (the plan's conditions mark it so, or the adapter lists it, [PAYERS.md](../references/PAYERS.md)) [PAYER](../references/PAYERS.md#markers): a new line is added as the next cycle, flash "<code> added as cycle <n>." PMJAY wants one item per cycle on an enhancement, so a second cycle is a second line, not a quantity of 2 ([D16. claim_line](../database/D16-claim-line.md)). When every allowed cycle is already quoted: "<code> allows <n> cycle(s); all are already on this preauth."
- Success: "<code> added."

**Update lines rules** (red flash, verbatim):
- A price is read only for a line whose price is open; everywhere else the plan's rate stands whatever is posted.
- Open price not a number: "Enter a price for <code>."
- Open price below zero: "The price of <code> cannot be negative."
- Quantity with a fraction: "The quantity of <code> must be a whole number."
- Quantity zero, negative or unreadable: "Enter a quantity for <code>."
- An empty quantity keeps the current quantity. Every amount is recomputed as `unit price × quantity`, rounded to two decimals.
- Success flash: "Lines updated."

Remove (line or tier): deletes that line only. Flash "Line removed."

Changing the lines after the payer has ruled on them marks the ruling stale on S8.2.

Data: [D16. claim_line](../database/D16-claim-line.md)

Data: [D11. claim_plan_benefit](../database/D11-claim-plan-benefit.md)

#### S8.1L. LAYOUT
See S8L: the add row, the table with its footer and the suggestions are three parts of one card, divided by rules.

#### S8.1A. ACTIONS
1. Pick a match: add the line at the plan's rate.
2. Update lines: store the quantities and open rates, recompute amounts.
3. Remove (line or tier): after the confirm, take it off.
4. Add (suggested implant or tier): add the line at the plan's rate.

---

## S8.2 Authorisation Requirements

#### S8.2R. ROUTE
Card on claims/view/:caseid/preauth, beside the Benefits check card under the Line items card, shown once a line is quoted. Its action posts and re-reads the case.

#### S8.2D. DESCRIPTION
The payer's ruling on the quoted procedure set: whether each line needs authorisation or is excluded, and which documents and forms this particular set needs. The adapter's name is not shown.

Card title in every state: "Authorisation requirements", with the ruling's status chip beside it once asked.

States:

| State | Body | Header action |
|---|---|---|
| Never asked | "The <n> quoted line(s) can go to the payer as a auth-requirements check: it rules on each one and names the documents and forms this particular procedure set needs. The check is optional; the pre-authorisation can be sent without it." | primary "Validate procedure set" (shield-check icon) |
| `checking` | "Procedure set sent; awaiting the payer's ruling. Use Refresh to check for it." with Sent at | "Check again" (refresh icon) |
| `error` | The error in the danger colour, or "The exchange failed." | "Check again" |
| `ready` | Ruling (below) | "Check again" |

Ruling statuses: `checking` Awaiting payer (info), `ready` Validated (success), `error` Error (danger).

**Ready state.** If the lines have changed since the ruling (compared by code, ward tiers and quantities ignored), a warning chip "The line items have changed since this ruling" and "The payer ruled on a different procedure set. Check again so the documents and forms it names are the ones this set needs." sit at the top. Then a detail list: Disposition, Outcome, Checked at.

Then an accordion, all sections open:
1. "Ruling on <n> line(s)": columns Line (name, code underneath), Authorisation (`Required`, `Not required`, or ` - ` when the payer said nothing), Excluded (danger chip `Excluded`, or `No`), Benefit (benefit type code or `-`), Allowed (`₹`). Empty: "The payer ruled on no lines."
2. "Needed for this pre-authorisation (<n>)": requirements the payer marked for the pre-authorisation stage.
3. "Needed later, with the claim (<n>)", only when there are any, with the muted note "The payer marked these for a stage after pre-authorisation, so they are not asked for here."

Requirement tables: columns Kind (chip `Form` info or `Document` warning), Code, What, For (the line code it belongs to), Stage. Empty: "Nothing listed."

Asking the ruling is also what shows the pre-authorisation and claim stage badges on the documents and forms of [S9. Pre-authorisation](S9-preauthorisation.md) and [S11. Claim Submission](S11-claim-submission.md): until it has been asked, those badges are hidden, because the split between the two legs is the ruling's.

**Sending.** Checked before any call (red flash):
- Case not in force: "Check the policy's eligibility before validating a procedure set against it."
- No lines: "Choose the line items first, this checks the procedure set, so there has to be one."
- Facility setup missing: "Set the facility's HFR ID and NHCX participant code under Settings before checking requirements."

API: [A2. Coverage Eligibility Check](../apis/A2-coverage-eligibility-check.md) (purpose auth-requirements)

A fingerprint of the set sent is kept with the ruling. Asking again clears the previous ruling's lines and requirements. Flash: "Procedure set sent to the payer for validation."

**Waiting.** Each load of the claim screen polls once while the ruling is `checking`. A failed poll changes nothing and the card keeps saying it is awaiting.

Callback: [C3. Authorisation Requirements Ruling](../callbacks/C3-auth-requirements-on-check.md)

API: [A10. Transaction Related](../apis/A10-txn-related.md) (poll)

API: [A11. Transaction Dispatch](../apis/A11-txn-dispatch.md) (poll, dispatch status)

A reply with no ruling is an error: "The payer reply carries no CoverageEligibilityResponse."

The pre-authorisation also asks this check by itself, without waiting, when a set has not been asked about yet, because some payers answer it rarely and the request must not be held up for it [SANDBOX](../references/PAYERS.md#markers).

The forms named here are answered on S9 (and the claim-stage ones on S11), not on this card.

Data: [D13. claim_auth](../database/D13-claim-auth.md)

Data: [D14. claim_auth_item](../database/D14-claim-auth-item.md)

Data: [D15. claim_auth_requirement](../database/D15-claim-auth-requirement.md)

#### S8.2L. LAYOUT

```
|------------------------------------------------------------------|
| [Card] Authorisation requirements [Validated]  [(refresh) Check again]
|  [! The line items have changed since this ruling]  (when stale) |
|  DISPOSITION        OUTCOME           CHECKED AT                 |
|  v Ruling on 2 line(s)                                           |
|    Line | Authorisation | Excluded | Benefit | Allowed           |
|  v Needed for this pre-authorisation (3)                         |
|    Kind | Code | What | For | Stage                             |
|  v Needed later, with the claim (1)                              |
|------------------------------------------------------------------|
```

#### S8.2A. ACTIONS
1. Validate procedure set / Check again: send the check and re-read the case with a flash.
2. Refresh (case header, S6): re-read and poll for the ruling.
