# S2. Select Policy Screen

#### S2R. ROUTE
claims/search/results?id_type=<type>&id_value=<value>[&patient=<id>]

Breadcrumb: Claims (claims/list, S5) > Claim management > Select policy

Select posts to: claims (POST), then goes to the validation gate claims/view/:caseid/validating (S2.1), which opens claims/view/:caseid (S6) once the policy is in force.

#### S2D. DESCRIPTION
Step 3 of the Claim Management stepper (the stepper row shows "Select policy" as the current step). It lists every policy the Beneficiary Identification System (BIS) returned for the identifier searched on S1, and lets the operator pick one. Picking a policy starts a case around it, sends the validation, and waits on the validation gate (S2.1). The case becomes a case, listed and opened on the Claim Detail screen S6, only when the payer answers that the policy is in force.

With a patient carried, a line "For patient <name>" with a "Clear" button sits above the search card; Clear drops the patient from the query string.

The search card from S1 stays at the top of this screen, pre-filled with the identifier type and value (and, with a patient carried, the changed-value marker when the value differs from the record), so the operator can correct the identifier and search again without going back. The results card sits below it.

**None of these.** The results card's header always carries a secondary button to the discovery page [S17. Beneficiary Discovery](S17-beneficiary-discovery.md), whatever the registry answered: "Discover with a payer" when no policy came back, "None of these? Discover with a payer" when some did. The registry lists only the policies linked to the identifier; a beneficiary whose cover is not linked yet, or whose card carries another identifier, is still found by asking the payer directly. The button carries the identifier and the patient to S17, which lists every payer on the exchange from the participant master ([D32. participant](../database/D32-participant.md)), government and private in one list.

API: [A1. Policy Search](../apis/A1-policy-search.md)

Results table columns:

| Column header | Main line | Muted sub-line |
|---|---|---|
| Member ID | `member_id`, or "-" | |
| Product / policy | `product_name`, or "-" | `policy_code`, else `product_id` |
| Payer | the payer's registered name from the participant registry (`payer_name`, G4, cached), else the code | `payer_id` |
| ABHA | `abha_number`, or "-" | |
| Mobile | `mobile_number`, or "-" | |
| (blank header) | Select button | |

The table shows no beneficiary name and never a placeholder such as "Unknown": the registry returns no name at this stage [SANDBOX](../references/PAYERS.md#markers), and a name it did return is not yet verified. The name, gender, date of birth, address and ABHA arrive with the payer's eligibility reply and are shown on S3 once the desk has confirmed the beneficiary. The row's `name`, when any, is still kept on the opened case (D9) for S3 to compare against.

The card title counts the rows: "1 policy found", or "N policies found" for any other count (including "0 policies found"). The "None of these" button sits at the title's right.

Select sends the whole normalised policy back to the server as a JSON string, with the search identifier:

```
POST claims
id_type=MemberId
id_value=<the searched value>
patient=<patient id, when the search was started from the patient master>
policy={"member_id": "MD5SLS4X5", "name": null, "policy_code": "PMJAY/HP/S/G",
        "payer_id": "<payer code>", "payer_name": "<registry name, or null>",
        "product_id": "PMJAY/HP/S/G", "product_name": "PMJAY for Himachal",
        "abha_number": "91703412374240", "mobile_number": "", "photo": null,
        "raw": { ...the BIS row... }}
```

Opening the case saves a new row around the chosen policy and the search identifier (shown on S3 as "Found by"), with D9 `patient_id` set when a `patient` was carried from S1 or the patient master ([S13. Patient List](S13-patient-list.md), [S15. Patient Detail](S15-patient-detail.md)), marks it **provisional**, and sends the validation at once ([A2. Coverage Eligibility Check](../apis/A2-coverage-eligibility-check.md) purpose `validation`). A provisional row is hidden from every list, count and payer filter ([S5. Claim Master](S5-claim-master.md)) until the payer's answer puts it in force. The carried patient is where the search started, not a confirmed link: the IPD admission is linked by the desk on the Claim tab (S4. Pre-authorisation Details and Admission Link (in nhcx-preauth)), found by the case's ABHA number. The case number takes the form `NM-<yy>-<mmdd><serial>`, month-day and serial in base32, so numbers sort by date and then issue order [REF](../references/PAYERS.md#markers). The payer name is the registry's (G4), looked up by the payer id and cached; it never falls back to a configured label, the adapter's name or a default name, and a payer whose lookup failed is shown by its code.

Data: [D9. claim](../database/D9-claim.md)

Data: [D30. counter](../database/D30-counter.md)

Rules:
- A policy without a member ID cannot open a claim. The server refuses with "That policy has no member ID; a claim cannot be raised without one." and the message shows in red in a card on this screen; nothing is created.
- An unreadable `policy` field is treated as an empty policy, which fails the same member ID rule.
- Selecting the same policy twice opens two separate rows. There is no duplicate check at this step.
- On success the flash (an info toast) reads "Validating the policy with the payer." When the send itself failed it reads "The validation was not sent: <reason>"; the row stays provisional and the gate offers "Validate again".

#### S2L. LAYOUT
The arrangement below is the reference implementation's [REF](../references/PAYERS.md#markers): follow the target HMIS's own screen conventions. What is required is in DESCRIPTION and ACTIONS: the fields, options, columns, statuses, messages and actions.


```
|------------------------------------------------------------------|
| Claims > Claim management > Select policy                        |
| (✓) Patient ── (✓) Search policy ── (3) Select policy ── (4) Claim|
|------------------------------------------------------------------|
| [Card] Search the beneficiary's policy                           |
|  Identifier type      Identifier value                           |
|  [Member ID      v]   [MD5SLS4X5_________]   [(search) Search    |
|                                                         policies]|
|------------------------------------------------------------------|
|                                                                  |
| [Card] 1 policy found          [(search) None of these? Discover |
|                                                    with a payer] |
|------------------------------------------------------------------|
| Member ID   | Product / policy   | Payer       | ABHA    | Mobile |  |
|-------------|--------------------|-------------|---------|--------|--|
| MD5SLS4X5   | PMJAY for Himachal | Nhcx Pmjay  | 9170... | -      |[(+) Select]
|             | PMJAY/HP/S/G       | <payer code>|         |        |  |
|------------------------------------------------------------------|

Empty result:
| [Card] 0 policies found              [(search) Discover with a payer]
|  No policy matches that identifier.   (muted text, no table)     |

Search failed:
| [Card, no title]                                                 |
|  <error message in danger colour>     [Discover with a payer]    |
```

- The search card is the S1 card, pre-filled.
- The results card sits below it with a gap. It holds a single scrollable table (it scrolls sideways on narrow screens).
- Two-line cells show the main value over a smaller muted line.
- Each row ends with an extra-small primary "Select" button with a circle-plus icon. The column has no header.
- When there are no rows the table is replaced by the muted line "No policy matches that identifier."
- The "None of these" button is the outline style with a search icon, in the results card header, on every result.
- When the lookup failed the results card is replaced by an untitled card holding the error in the danger colour and the "Discover with a payer" button. A validation or Select refusal shows in the same card without the button.
- Every control is the host's own component of that kind (table, select, card, chip, toast), as L1 records it.

#### S2A. ACTIONS
1. Select: post the chosen policy with the search identifier, open a provisional case, send the validation and go to the validation gate S2.1 with the flash "Validating the policy with the payer." If the policy has no member ID, stay here with the red message "That policy has no member ID; a claim cannot be raised without one."
2. Search policies: run the S1 search again with the edited type or value (validated as on S1) and refresh this list.
3. None of these / Discover with a payer: go to the discovery page S17 with the identifier type and value, and the patient when one was carried.
4. Clear (beside "For patient <name>"): drop the patient and reload the list.
5. Breadcrumb "Claims": go to the Claim dashboard S5.

---

## S2.1 Validation Gate

#### S2.1R. ROUTE
claims/view/:caseid/validating

Reached from Select on S2 and from choosing a cover on S17. Breadcrumb: Claims (S5) > Claim management. The stepper shows "Claim" as the current step.

#### S2.1D. DESCRIPTION
The page that waits on the validation. Nothing is created until the payer answers that the policy is in force: the row stays provisional, hidden from every list. The page reads the case again every 4 seconds while the validation is `checking` [REF](../references/PAYERS.md#markers); it has nothing to type, so a re-read loses nothing.

One card, by state:

| State | Card title | Body | Actions |
|---|---|---|---|
| Waiting (`checking`, or in force and being opened) | "Validating the policy with the payer" | "The case opens as soon as the payer answers that the policy is in force. Nothing is created until then." Then Name, Policy code, Payer | none |
| In force, one member | (no card) | the case is no longer provisional; the page replaces itself with the case's Overview tab ([S6. Claim Detail](S6-claim-detail.md), [S3. Policy Discovery](S3-policy-discovery.md)) | |
| In force, several members on the cover | "Policy in force: choose the patient" | "<payer's disposition> The cover has <n> members. Select the one being treated and press Continue; the case is created with that member's details." Then one **card per member** (a radio group): the payer's photo, else an avatar of the member's initials; the name (else "Unnamed member"); the member id; then relationship, gender and "born <dob>". Selecting a card marks it (a tick and a ring); one at a time | primary "Continue", disabled until a card is selected |
| Not in force (not eligible, or error) | "Policy not in force" | "The payer did not confirm the policy as in force, so no case was created." Then Name, Policy code, Payer, Disposition (the error, else the payer's disposition) | "Back to search" (to S1) and primary "Validate again" |

Continue copies the chosen member onto the case (name, gender, date of birth, address, ABHA, photo, relationship, and the member's own id as the case's member id), stamps the choice, and takes the case out of provisional. A member id that is not one the payer returned is refused. An in-force answer that is still provisional is always the member choice, never shown as "not in force".

When a validation leaves a case in force, its insurance plan is fetched without asking: a ready plan held for the same policy, HFR id and payer is reused, else the plan is requested (S7. Insurance Plan (in nhcx-preauth)). This never refuses and never blocks the case.

The payer's adapter is never named on this page, and no correlation id or transaction id is shown (they are on the Logs tab of [S6. Claim Detail](S6-claim-detail.md) only).

API: [A2. Coverage Eligibility Check](../apis/A2-coverage-eligibility-check.md)

Callback: [C2. Coverage Eligibility Verdict](../callbacks/C2-coverage-eligibility-on-check.md)

Data: [D9. claim](../database/D9-claim.md)

#### S2.1L. LAYOUT

```
|------------------------------------------------------------------|
| Claims > Claim management                                        |
| (✓) Patient ── (✓) Search policy ── (✓) Select policy ── (4) Claim|
|------------------------------------------------------------------|
| [Card] Policy in force: choose the patient                       |
|  Eligible. The cover has 3 members. Select the one ...           |
|  [(photo) Asha Devi     ] [(RK) Ravi Kumar     ] [(SD) Sita Devi]|
|  [ MD5SLS4X5        (v) ] [ MD5SLS4X6          ] [ MD5SLS4X7    ]|
|  [ Self · Female · born..] [ Son · Male · born.. ] [ ...         ]|
|                                                     [Continue]   |
|------------------------------------------------------------------|
```

- Member cards sit two or three to a row and stack on narrow screens. The avatar is the host's avatar component.

#### S2.1A. ACTIONS
1. Select a member card: mark it as the patient (one at a time).
2. Continue: choose that member, open the case and land on its Overview tab (S6).
3. Validate again: resend the validation and keep waiting.
4. Back to search: go to S1.
