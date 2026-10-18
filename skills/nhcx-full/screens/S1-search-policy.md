# S1. Search Policy Screen

#### S1R. ROUTE
claims/search

Optional query: `patient` (the patient the claim is for, carried through to S2 so the case opens linked to them), `id_type` and `id_value` (prefill), `mode=walkin` (the desk pressed Skip and starts without a registered patient). The patient master opens this screen with `patient`: "Search insurance policy" on [S15. Patient Detail](S15-patient-detail.md) or a row of [S13. Patient List](S13-patient-list.md) passes the patient, and the identifiers prefill from the patient's record.

Breadcrumb: Claims (claims/list, S5) > Claim management

Reached from "New claim" on Claim management [S5. Claim Master](S5-claim-master.md) (the navigation's "Management" entry under Claims opens that list).

#### S1D. DESCRIPTION
The start of a new claim, as the first two steps of the **Claim Management stepper**: Patient, Search policy, Select policy ([S2. Select Policy](S2-select-policy.md)), Claim ([S6. Claim Detail](S6-claim-detail.md)). The stepper is drawn above the cards on S1 and S2, the current step filled and earlier steps ticked, so the desk always sees where it stands. The screen is two cards, the second shown once the first is answered.

**Two facility settings** shape the screen, kept on [S19. NHCX Settings](S19-nhcx-settings.md) ([D1. organization](../database/D1-organization.md) `registration_required`, `capture_member_id`, both on by default):

| Setting | On | Off |
|---|---|---|
| A claim needs a registered patient | the Patient card's help reads "This facility registers patients before a claim. Find the patient or register them, or press Skip and link them later." | the help reads "Find the patient on the register, or press Skip to start on the policy identifiers alone." |
| Ask for the member id at the start | Member ID is offered as an identifier beside the ABHA number and the mobile number | the search starts from the ABHA number or the mobile number only (Member ID still appears when the URL names it) |

The registration setting changes the wording only. The desk may always skip the patient step: a pre-authorisation needs no patient, and the IPD admission the claim bills is linked later on the Claim tab ([S4. Pre-authorisation Details and Admission Link](S4-claim-creation-form.md)).

**Step 1, the Patient card** (title "Patient"). Who the claim is for.
- With a patient chosen it shows the name, UHID, age and gender, mobile and "ABHA <number>", with "Change patient" in the card header.
- Without one it shows the help line above, then the **host's type-ahead** over the facility's own patients (placeholder "Search by name or UHID"). It matches by name (2 letters or more) and by UHID (a term with a digit and only letters, digits, `/` and `-`), both debounced, merged and deduplicated to at most 10 people. Each option reads `<name> · <age> <gender> · <mobile>`; an option found by UHID also carries `UHID <the term typed>`, so the type-ahead's own filter keeps it. Before 2 letters the list says "Type at least two letters of the name, or the UHID"; with no match the host's own "no patients found" text. Picking an option chooses the patient. Beside it, "Register a new patient" opens the HMIS's registration form ([S14. Patient Registration Form](S14-patient-registration-form.md)).
- The facility's patients are searched through what the facility holds for them (its encounters, in the reference implementation [REF](../references/PAYERS.md#markers)), not the HMIS-wide patient list, because staff of one facility may not see the global list.
- "Skip" in the card header leaves the patient out. The card then reads "Patient selection skipped. The claim starts on the policy identifiers alone; the patient is registered and the admission linked later, before the claim." with "Choose a patient instead" to go back. The choice is carried in the URL (`mode=walkin`), so a refresh keeps it.

**Step 2, the Search card** ("Search the beneficiary's policy"), shown once a patient is chosen or Skip is pressed. The operator searches on one identifier the beneficiary carries; the app looks up every policy linked to it on the NHCX Beneficiary Identification System (BIS).

Identifier types, in this order:

| Value (sent upstream) | Label | Offered | Default |
|---|---|---|---|
| `AbhaNumber` | ABHA number | always | when the patient has an ABHA number, and always when no patient is chosen |
| `MobileNo` | Mobile number | always | when the patient has no ABHA number but a mobile |
| `MemberId` | Member ID | when the facility captures the member id at the start, or the URL names it | for a patient with neither [REF](../references/PAYERS.md#markers): it is what is printed on the card |

**Prefill and the changed-value marker.** With a patient chosen, the value field shows the patient's own value for the chosen kind (the ABHA number from the patient's identifiers, the mobile from the patient's phone), and switching the kind shows that kind's value. The moment the desk edits the value so it differs from the record, the field turns amber and a line appears under it: a chip "Changed", the note "The patient's record holds <value>." and a link "Use the patient's value" that puts the record's value back. The marker is a reminder, not a block: a changed value is searched as typed, and the case keeps what was searched ("Found by" on [S3. Policy Discovery](S3-policy-discovery.md)). A typed value survives a change of kind (S1A 5). Without a patient the field is empty and the desk types. A letter typed into the value can only be a member id (an ABHA or mobile number is digits), so the kind moves to Member ID by itself; digits never move it.

Under the field a one-line help for the chosen kind: "14 digits, with or without spaces or hyphens." (ABHA), "10 digits, without the country code." (mobile), "The member id printed on the beneficiary's card, as printed." (member id).

API: [A1. Policy Search](../apis/A1-policy-search.md)

Rules:
- Validation happens before any call, on the screen and again on the server ([A1. Policy Search](../apis/A1-policy-search.md)), each failure a red message in a card under the form, in this order: an unknown identifier type gets "Choose what kind of identifier you are searching with."; an empty value "Enter an identifier value to search for."; an ABHA number that is not 14 digits once spaces and hyphens are removed "An ABHA number has 14 digits."; a mobile number that is not 10 digits once spaces, hyphens and a leading +91 are removed "A mobile number has 10 digits.". The cleaned digits are what goes upstream; a member id goes as typed.
- Any upstream failure shows as a red error message inside a card on the screen, never as a 500.
- The search is a GET with the type and value in the query string, so a result can be bookmarked and a refresh repeats the search.
- The sandbox returns no beneficiary name or photo at this stage [SANDBOX](../references/PAYERS.md#markers).

#### S1L. LAYOUT
The arrangement below is the reference implementation's [REF](../references/PAYERS.md#markers): follow the target HMIS's own screen conventions. What is required is in DESCRIPTION and ACTIONS: the settings, the two steps, the fields, options, messages and actions. Every control is the host's own component of that kind (type-ahead, select, card, chip, flash), as L1 records it.

```
|------------------------------------------------------------------|
| Claims > Claim management                                        |
| (1) Patient ── (2) Search policy ── (3) Select policy ── (4) Claim|
|------------------------------------------------------------------|
| [Card] Patient                                        [Skip]     |
|  Find the patient on the register, or press Skip ...             |
|  [type-ahead: Search by name or UHID   v]  [Register a new       |
|                                               patient]           |
|   Asha Devi · UHID 1234 · 42 Y Female · 98xxxxxx10  (options)    |
|------------------------------------------------------------------|
| [Card] Search the beneficiary's policy                           |
|  Identifier type      Identifier value                           |
|  [ABHA number    v]   [91703412374240____]   [(search) Search    |
|                        (amber when changed)             policies]|
|  [Changed] The patient's record holds 91703412374241.            |
|            [(undo) Use the patient's value]                      |
|  14 digits, with or without spaces or hyphens.                   |
|------------------------------------------------------------------|
| [Card, only when validation failed]                              |
|  <error message in danger colour>                                |
|------------------------------------------------------------------|
```

- The stepper is a row of numbered circles joined by short rules; the current step's circle is filled, a done step shows a tick.
- The Patient card's header holds "Skip" (no patient chosen), "Choose a patient instead" (after Skip) or "Change patient" (a patient chosen).
- The Search card holds a single filter row with the fields and button side by side (they wrap on narrow screens); the identifier value input is at least 16rem wide; the changed-value line spans the row beneath it.
- Fields in this row have no bottom margin, so labelled fields line up with the button.

#### S1A. ACTIONS
1. Choose a patient (a type-ahead option): reload with `patient=<id>`; the Search card appears, prefilled from the record.
2. Skip / Choose a patient instead: switch the mode (`mode=walkin` or none) in one navigation; Skip clears the patient.
3. Register a new patient: open the HMIS's patient registration ([S14. Patient Registration Form](S14-patient-registration-form.md)); on return, find the new patient here.
4. Change patient: drop the patient and show the search box again (a typed identifier is kept only when no patient was chosen).
5. Change identifier type: switch the dropdown; a typed value keeps its text, an untouched field shows the patient's value for the new kind.
6. Use the patient's value: put the record's value back and clear the marker.
7. Search policies: validate, and go to the Select Policy screen S2 (claims/search/results) with the identifier type, the cleaned value, the `patient` when one was chosen, and the returned policies. S2 shows zero results as "No policy matches that identifier."
8. Breadcrumb "Claims": go back to the Claim dashboard S5 without searching.
