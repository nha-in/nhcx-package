# S4. Pre-authorisation Details and Admission Link Screen

#### S4R. ROUTE
No page of its own. Two cards of the Claim Detail shell S6:
- **Pre-authorisation details**: on claims/view/:caseid/preauth, under the line items and the two checks ([S8. Line Items](S8-line-items.md)) and above the forms, documents and send card ([S9. Pre-authorisation](S9-preauthorisation.md)).
- **Link the IPD admission** (and, once linked, **Linked admission**): on claims/view/:caseid/claim, at the top of the Claim tab under the proof of presence card ([S18. Beneficiary Verification](S18-beneficiary-verification.md)) and above the discharge (S11. Claim Submission (in nhcx-claim)).

Each action posts to its own endpoint, re-reads the case and leaves a flash above the tabs (S6): green with the message, red with the refusal verbatim.

| Endpoint | Purpose |
|---|---|
| `POST claims/:caseid/preauth` | Save the pre-authorisation details |
| `POST claims/:caseid/link` | Link the IPD admission (field `encounter`) |
| `POST claims/:caseid/unlink` | Detach the admission |

Breadcrumb: Claims (claims/list, S5) > <case number> (S6)

#### S4D. DESCRIPTION
**The pre-authorisation needs no admission.** It may be drafted and sent before the patient is in the bed (a planned admission, an intimation from the desk), and no linked patient or admission is needed for it. Its dates, diagnoses and treating doctors are its own: a linked admission only pre-fills a form that has never been saved, and never fixes it. The **claim** is the opposite: it bills a stay, so the IPD admission is linked on the Claim tab, and the claim is refused without it (S11. Claim Submission (in nhcx-claim)). This is the integrator's decision `preauth.admission` ([L1.A](../steps/L1-discovery.md)); its default is the behaviour described here.

The lines and the estimate are not part of this screen: every line is quoted from the insurance plan on the Line items card ([S8. Line Items](S8-line-items.md)), and the estimate is their total. Nothing goes to NHCX from this screen; the pre-authorisation is sent from S9.

---

**Card "Pre-authorisation details"** (Pre-authorisation tab, shown while the case is in force). A single form.

When the details have been saved before, a summary sits above the sections: Last saved (date and time), Estimated amount (`₹` with two decimals, or `-`).

The form is an accordion of three sections, all open, several open at once:

1. **Stay**, two columns:

| Field | Control | Rule |
|---|---|---|
| Planned admission date (required marker) | date picker, earliest today | Pre-filled, on a form never saved, from the linked admission's start when there is one. The picker offers no day before today (the facility's local date): a pre-authorisation is never raised back-dated. Once the payer holds the pre-authorisation (`submitting`, `queried`, `approved`, `partial`, `cancelling`), the date it was sent with may stay as it is |
| Provisional discharge date | date picker, optional | Must not be before the admission date |

2. **Diagnoses (ICD-10)**, with the muted hint "The ICD-10 diagnoses for this pre-authorisation." The payer adjudicates on ICD-10 (`Claim.diagnosis` is bound to `http://hl7.org/fhir/sid/icd-10`, [F8. Claim](../fhir/F8-claim.md)), so the desk picks the **ICD-10** term and only that, here, never on the admission. The application maps it to SNOMED CT through the diagnosis terminology ([D8. terminology](../database/D8-terminology.md) `alt_code`), holds both on the pre-authorisation ([D25. claim_diagnosis](../database/D25-claim-diagnosis.md)) and sends both on the wire, ICD-10 as the first coding and SNOMED CT as the second, so a payer can tie the claim to the ABDM records of the same stay. The desk never types a code and is never asked for a SNOMED code; a term with no SNOMED mapping goes out as ICD-10 alone.
   - Repeating rows. Each row has two selects: "Diagnosis (ICD-10)", blank "Select diagnosis", over the HMIS's own ICD-10 diagnosis list when it has one (the mapping names it), else the local D8 `diagnosis` list. Each option reads `<ICD-10 code> - <ICD-10 display> · SNOMED <code>`, or `<ICD-10 code> - <ICD-10 display> · no SNOMED mapping`; and "Type", options `diagnosis_types` Provisional (`provisional`, the default) and Final (`final`). The type is saved with the row ([D25. claim_diagnosis](../database/D25-claim-diagnosis.md) `dx_type`) and sent as the diagnosis type ([F8. Claim](../fhir/F8-claim.md)); a pre-authorisation usually carries provisional diagnoses, and the desk marks a diagnosis final once it is confirmed.
   - On a form never saved, the rows are pre-filled with the linked admission's unresolved diagnoses that carry an ICD-10 code. Otherwise they are the saved ones, else one empty row.
   - Each row has a red trash button; "Add diagnosis" (plus icon) adds a row.

3. **Treating doctor**, with the muted hint "The doctor treating the patient (planned, if not yet admitted)." Repeating rows with:
   - "Doctor" select, blank "Select doctor", options the facility's active practitioners ([S16. Practitioner Master](S16-practitioner-master.md)) as `<name> - <speciality>` (the name alone without one), sorted by name.
   - "Role" select, default `treating`:

| Value | Label |
|---|---|
| `admitting` | Admitting physician |
| `treating` | Treating doctor |
| `surgeon` | Surgeon |
| `anaesthetist` | Anaesthetist |
| `nurse` | Nursing lead |

   On a form never saved, the first row is pre-filled with the linked admission's consultant as `treating`; otherwise the saved team, else one empty `treating` row. "Add doctor" adds a row; each row has a trash button.

Footer: primary "Save details" (save icon).

**Save rules** (checked on the server in this order, each message shown verbatim as a red flash):

- Admission date empty: "Enter the admission date."
- Admission date before today, unless it is the date already sent to the payer: "The admission date cannot be before today; a pre-authorisation is not raised back-dated."
- Discharge before admission: "The provisional discharge date cannot be before the admission date."
- A diagnosis type other than provisional or final: "Mark each diagnosis provisional or final."
- No usable diagnosis: "Pick at least one ICD-10 diagnosis - the payer needs it."
- Unknown role: "Choose a valid care team role."
- No active doctor: "Add the treating doctor - the payer needs one."

Empty rows are ignored; a diagnosis picked twice is saved once; a doctor who is not an active practitioner is skipped. Saving replaces the saved diagnoses and team in one transaction, stamps D9 `preauth_saved_at`, sets `case_type` to `package`, takes the first Procedure line as the package and the sum of the quoted lines as the estimate. Pricing is never taken from this form. Flash on success: "Pre-authorisation draft saved."

---

**Card "Link the IPD admission"** (Claim tab, while no admission is linked). Which body shows depends on the case:

| Case state | Body |
|---|---|
| The payer returned several members and none is chosen | "Choose which member of the policy is the patient on the Overview tab first; the admission is linked to that member, never to whoever the payer listed first." (warning colour), no table |
| The case carries no ABHA number | "This policy carries no ABHA number, so it cannot be matched to an admission. Re-run the eligibility check - the payer's reply usually carries the beneficiary's ABHA." |
| ABHA number, no matching stay | the intro, then "No current IPD admission matches this ABHA number. Register the patient with this ABHA and admit them first." with two buttons, "Register patient" (user-plus icon, [S14. Patient Registration Form](S14-patient-registration-form.md)) and "New admission" (hospital icon, the HMIS's patient list) |
| ABHA number, matching stays | the intro, then the table |

Intro: "Link the claim to **<beneficiary name or member id>**'s IPD stay (ABHA <abha>). The claim bills this admission."

**ABHA is the key.** Matching stays are the current (not yet finished) IPD stays, in this facility, of every patient whose ABHA number has the same digits as the case's (the payer writes `91-7034-...`, the front desk may store it without dashes). Newest admission first. Whether a patient was carried from S1 makes no difference.

Table columns: Patient (name, a link to [S15. Patient Detail](S15-patient-detail.md)), MRN, Admission (encounter number, a link to the admission), Ward / bed (`ward / bed`, or the ward alone, or `-`), Admitted (date and time), Doctor (the stay's treating doctor, or `-`), and a primary "Link" button (link icon).

**The link is always the desk's action.** The application lists the candidates and never links one by itself, not even when exactly one stay matches.

Link rules, checked on the server in this order (red flash):
- A member must be chosen when the reply offered several: "Choose which member of the policy is the patient on the Overview tab first."
- The case must be in force: "Link an admission only after the payer has confirmed the policy is eligible."
- The stay must still be in the match list: "That admission is not a current IPD stay of a patient with this claim's ABHA number."

On success the case is linked to the stay's patient and the admission; the admission date is taken from the stay's start only when the case has none yet; a proof of presence taken before admission (a [S18. Beneficiary Verification](S18-beneficiary-verification.md) row belonging to the case alone, patient empty) moves to that patient. Flash: "Admission linked to the claim."

**Card "Linked admission"** (Claim tab, once linked). A detail list in three columns: Patient (link to S15), MRN, Admission (link), Ward / bed (`ward / bed`, dashes when missing), Admitted, Consultant. Header action "Unlink" (unlink icon, outline) confirms "Detach this claim from the admission? The preauth draft is kept." and then detaches the patient and admission, keeping the pre-authorisation details. Flash: "Admission unlinked."

Data: [D9. claim](../database/D9-claim.md)

Data: [D3. patient](../database/D3-patient.md)

Data: [D4. encounter](../database/D4-encounter.md)

Data: [D5. condition](../database/D5-condition.md)

Data: [D2. practitioner](../database/D2-practitioner.md)

Data: [D8. terminology](../database/D8-terminology.md)

Data: [D25. claim_diagnosis](../database/D25-claim-diagnosis.md)

Data: [D26. claim_care_team](../database/D26-claim-care-team.md)

#### S4L. LAYOUT
The arrangement below is the reference implementation's [REF](../references/PAYERS.md#markers): follow the target HMIS's own screen conventions. What is required is in DESCRIPTION and ACTIONS: the fields, options, columns, statuses, messages and actions.


```
Pre-authorisation tab:
|------------------------------------------------------------------|
| [Card] Pre-authorisation details                                 |
|  LAST SAVED              ESTIMATED AMOUNT                        |
|  18 Oct 2026, 8:41 am    ₹25,000.00                              |
|  v Stay                                                          |
|    Planned admission date *     Provisional discharge date       |
|    [dd-mm-yyyy]                 [dd-mm-yyyy]                     |
|  v Diagnoses (ICD-10)                                            |
|    The ICD-10 diagnoses for this pre-authorisation.              |
|    +----------------------------------------------------------+  |
|    | Diagnosis (ICD-10)                                       |  |
|    | [K35.8 - Acute appendicitis · SNOMED 74400008  v]   (bin)|  |
|    +----------------------------------------------------------+  |
|    [+ Add diagnosis]                                             |
|  v Treating doctor                                               |
|    | Doctor [Dr Rao - Surgery v]   Role [Treating doctor v] (bin)|
|    [+ Add doctor]                                                |
|  ----------------------------------------------------------------|
|                                          [(save) Save details]   |
|------------------------------------------------------------------|

Claim tab, before linking:
|------------------------------------------------------------------|
| [Card] Link the IPD admission                                    |
|  Link the claim to Asha Devi's IPD stay (ABHA 91-7034-...). ...  |
|  Patient | MRN | Admission | Ward / bed | Admitted | Doctor | [Link]
|  (empty: No current IPD admission matches this ABHA number...)   |
|  [Register patient]  [New admission]      (only when empty)      |
|------------------------------------------------------------------|

Claim tab, linked:
| [Card] Linked admission                              [Unlink]    |
|  PATIENT        MRN            ADMISSION                         |
|  WARD / BED     ADMITTED       CONSULTANT                        |
```

- The detail sections are an accordion that allows several sections open at once.
- Repeating rows (diagnoses, doctors) are bordered boxes with the fields inline and a red trash button at the end; they wrap on narrow screens. The Add button under each list is a small secondary button with a plus icon.
- Summary values show `-` when empty.

#### S4A. ACTIONS
1. Add diagnosis / Add doctor: add an empty row; the trash button removes a row. Empty rows are ignored on save.
2. Save details: validate and store the pre-authorisation details, then re-read the case with a flash. Sending happens on S9.
3. Link (on a stay row): attach the case to that admission and show the Linked admission card.
4. Patient name link: open Patient Detail S15. Admission link: open the admission in the HMIS.
5. Register patient: open Patient Registration Form S14.
6. New admission: open the HMIS's patient list to admit the patient (outside this screen map).
7. Unlink: after the confirm, detach the admission; the pre-authorisation details are kept.
8. Breadcrumb "Claims": go to Claim Master S5. Case number: go to Claim Detail S6.
