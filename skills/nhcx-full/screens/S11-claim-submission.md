# S11. Claim Submission Screen

#### S11R. ROUTE
claims/view/:caseid/claim

The Claim tab of the Claim Detail shell S6. It appears only once a pre-authorisation has been raised; before that a link to it opens the Pre-authorisation tab. Every action posts to its own endpoint, re-reads the case and leaves a flash above the tabs (S6): green with the message, red with the refusal verbatim.

| Endpoint | Purpose |
|---|---|
| `POST claims/:caseid/link` / `unlink` | Link or detach the IPD admission ([S4. Pre-authorisation Details and Admission Link](S4-claim-creation-form.md)) |
| `POST claims/:caseid/discharge` | Record how the stay ended |
| `POST claims/:caseid/documents/required` with `stage=claim` | Attach files against the discharge summary and the claim-stage codes (multipart) |
| `POST claims/:caseid/documents/dismiss` with `stage=claim` | Take a named document off the claim's list |
| `POST claims/:caseid/documents` with `stage=claim` | Attach any files for the claim (multipart) |
| `POST claims/:caseid/records/attach` with `stage=claim` | Attach health records found by ABHA ([S9. Pre-authorisation](S9-preauthorisation.md)'s picker) |
| `POST claims/:caseid/documents/:did/delete` | Remove a document |
| `POST claims/:caseid/forms` with `stage=claim` | Save one claim-stage form's answers (multipart) |
| `POST claims/:caseid/claim` | Send the claim, or a query answer (optional field `reply`) |
| `POST claims/:caseid/status` with `stage=claim` | Ask the payer where the claim stands |
| `POST claims/:caseid/reprocess` | Send a rejected claim back for another look |
| `POST claims/:caseid/release` | Ask for the unpaid balance of a part-paid claim |

Breadcrumb: Claims (claims/list, S5) > <case number>

#### S11D. DESCRIPTION
The claim is filed once the patient has left, against the stay it bills.

**When the claim can start.** The claim needs a pre-authorisation with status `approved` or `queried`. Until one exists the tab shows a single card titled "Claim": "A claim goes in against an **approved** pre-authorisation, once the patient has left. Get the pre-authorisation answered on the previous tab first." (the proof of presence card, when needed, still shows above it). A `partial` pre-authorisation does not open the claim.

**What the tab shows**, top to bottom:
1. **Proof of presence** ([S18. Beneficiary Verification](S18-beneficiary-verification.md), stage `Discharge`), only when the payer or its plan asks for it: a fresh capture whose token rides on the claim. The pre-authorisation's token never serves the claim. Without one, a payer that requires proof of presence gets the Discharge Consent form answered in the bundle instead.
2. **Link the IPD admission**, or **Linked admission** once linked ([S4. Pre-authorisation Details and Admission Link](S4-claim-creation-form.md)): the stay found by the case's ABHA number. The claim needs it.
3. **Discharge**.
4. **Documents for the claim**.
5. **Forms for the claim**.
6. **Claim**, the send card. **Once the claim has been sent (its status is anything but `draft`) it moves to the top** (under the proof of presence card): the payer's verdict is the first thing to read.

**The admission is mandatory for a claim**, unlike the pre-authorisation ([S9. Pre-authorisation](S9-preauthorisation.md)): the send is refused without a linked admission. The S6 next action "Link the IPD admission" opens this tab once the pre-authorisation is approved and nothing is linked. The integration decision `claim.admissionRequired` (L1.A) defaults to yes; only a hospital that bills day-care with no HMIS admission answers no. When `claim.dischargeIntimation` (L1.A) is yes, the tab gains a "Discharge intimation" step that sends the payer the intimation the adapter defines ([PAYERS.md](../references/PAYERS.md)) before the claim; by default there is none.

**Queries, by level.** As on the pre-authorisation ([S9. Pre-authorisation](S9-preauthorisation.md)): a query inside the payer's claim verdict, or any query from a payer that takes answers by resubmission, is answered from this tab; a standalone query (a CommunicationRequest) on [S10. Communication](S10-communication.md).

**A claim is never sent again once decided.** No adapter offers a claim resubmission. A decided claim goes back for another look only as a reprocess request, and only when the payer has **rejected** it; an approved or part-approved claim with money still owed asks for its balance instead. A claim refused at the door (it never reached the payer, status `error`) may still be sent again.

**The claim locks the pre-authorisation.** Once the claim has gone to the payer (sent, queried or decided; a draft or a claim refused at the door does not count), the Pre-authorisation tab is read only: no enhancement, no change, no send, only Cancel until the payer decides the claim ([S9. Pre-authorisation](S9-preauthorisation.md), core rule). This tab's own cards are never locked by it.

**Polling.** Each load of S6 checks the claim while it is `submitting`, and any status, reprocess or release request still `asking`.

API: [A10. Transaction Related](../apis/A10-txn-related.md), [A11. Transaction Dispatch](../apis/A11-txn-dispatch.md) (poll)

Callback: [C6. Claim Reply](../callbacks/C6-claim-on-submit.md)

Callback: [C8. Enquiry Reply](../callbacks/C8-enquiry-on-submit.md)

Money shows as `₹12,345`; a missing value as `-`. No card shows a correlation id or a transaction id (they are on the Logs tab of [S6. Claim Detail](S6-claim-detail.md)).

---

**Discharge card.** Title "Discharge". One form in a two-column grid:

| Field | Control | Help |
|---|---|---|
| Discharge type (required) | select, blank "Select": `normal` Normal discharge, `lama` LAMA, `dama` DAMA, `death` Death | "Normal discharge, LAMA, DAMA or death in hospital." |
| Stage (required) | select, blank "Select": Before Surgery, During Surgery, After Surgery | "Whether that was before, during or after surgery." |
| Discharge date (required) | date picker, earliest the later of the admission date and the pre-authorisation date, latest today | No day after today (the facility's local date) is offered: a discharge has happened before the claim goes. No day before the admission, or before the day the pre-authorisation was sent (D18 `submitted_at`), is offered either: the claim bills the stay the pre-authorisation approved. When the earliest and the latest fall on the **same day** (the pre-authorisation was sent today, or admission and discharge are the same day), that day stays selectable and the picker is **never disabled or read-only**: the single valid day is still chosen by the desk, not locked away |
| Surgery date | date picker | "Leave blank for a conservative case." |
| Date and time of death | date and time picker | "Required when the discharge type is death." |

**LAMA / DAMA rule.** When the type is LAMA or DAMA and the stage is Before Surgery or During Surgery, a warning chip "Claimed as LM100 only" appears with: "The payer accepts only **LM100** for a LAMA / DAMA case that ended before or during surgery, and disqualifies everything the pre-authorisation approved. The claim below quotes it in their place." [PAYER](../references/PAYERS.md#markers) The claim then quotes the single procedure `LM100` at the plan's rate, quantity the number of days admitted (admission to discharge, at least 1), in place of every pre-authorised line. Its name falls back to "LAMA / DAMA procedure", its rate to 0 when the plan has no such package.

"Save discharge" (primary, save icon), right-aligned, is hidden while the claim is `submitting`; the server refuses the save then too. Checks, in order, each a red flash:
- "The claim is with the payer; wait for its answer before changing the discharge."
- "Choose how the patient was discharged."
- "Choose whether that was before, during or after surgery."
- "Enter the discharge date."
- "The discharge date cannot be after today."
- "The discharge date cannot be before the admission date."
- "The discharge date cannot be before the pre-authorisation date."
- "The surgery date cannot be before the admission date."
- "The discharge date cannot be before the surgery date."
- "Enter the date and time of death." (type Death with no time of death)
- "Enter the time of death as well as the date." (a date with no time)

For any type other than Death the death time is cleared. Success: "Discharge recorded." Saving opens the claim in `draft` when none exists; an `error` claim goes back to `draft`. Recording the discharge changes which conditional forms the Forms card lists.

**Documents for the claim card.** Title "Documents for the claim". The same parts and rules as the pre-authorisation's ([S9. Pre-authorisation](S9-preauthorisation.md)), filed at `stage=claim`:

*Requirements.* Table columns: Code, Document (the package code as a muted sub-line), Stage (chip, **only once the authorisation-requirements ruling has been asked**; the discharge summary reads "Post (claim)"), Attached (the newest file under that code, a record opening on its own HMIS page, or "not attached yet"), Choose a PDF (file input `req_<code>`), From records (the records picker opened for that code; on the discharge summary row the admission's DischargeSummary record comes first, so the summary the HMIS already filed goes as structured data without a scan), and an X "Not needed: take it off the list" on every row but the discharge summary.
- The first row is always `HDS` Hospital discharge summary; it cannot be taken off the list.
- The other rows are the documents the payer deferred to the claim: with a ruling, its requirements not due at pre-authorisation; without one, the plan's documents for the quoted packages whose stage is `post` (D11's stage rule) and any `pre` document not attached at the pre-authorisation stage. A row the desk took off the list stays off (stored as `claim:<code>`).

Under the table, the note "The discharge summary is always wanted; the rest are the requirements the payer's ruling deferred to this stage." (when nothing else is listed and no summary is attached: "Only the discharge summary is listed, run the authorisation-requirements check on the pre-authorisation tab to learn what else this payer wants with the claim."), the records picker button and the primary "Attach chosen files". Each code keeps one file; a new one replaces the old. The summary is filed under code and category `HDS`, labelled "Hospital discharge summary". Refusals: "Choose a PDF for at least one of them." and "That is not a document this claim was asked for." The X's flashes and refusal are S9's.

*Everything attached for the claim.* Columns: File (opens in a new tab, a record on its own HMIS page), Filed as (label, code as a muted sub-line), Size, Uploaded, and "Remove" with the confirm "Remove this document from the claim?" (flash "Document removed."). Empty: "Nothing beyond the requirements yet." Below it the upload row: "Files (PDF or image)" (several, required marker), "Filed as" (only the NHCX document codes of [S9. Pre-authorisation](S9-preauthorisation.md), each "<code> - <label>", `CD` by default; never a plan's own codes), "Label", and "Attach". The upload rules of S9 apply: PDF, JPEG, PNG or WebP, at most 10 MB, not empty; " (<n> attached before the failure.)" on a failure part way through; success "<n> document(s) attached."

**Forms for the claim card.** Title "Forms for the claim". The payer's questionnaires for the claim leg (D12's rule); with none to show, "The payer lists no forms for the quoted packages yet. Quote the line items first; the forms the package master attaches to them appear here." The forms listed:
- With a ruling: every form the plan carries for the quoted packages and the policy that the ruling did not name (the ruling's forms were the pre-authorisation's; the rest are answered at discharge).
- Without a ruling: the quoted packages' forms whose stage is `post` (their claim-stage treatment guideline checklists, PMJAY's claim STQ) and the policy's own forms; the pre-authorisation's forms already answered on S9 are not asked again [PAYER](../references/PAYERS.md#markers).
- On either: the scheme's Discharge Consent form when the plan carries one, never the Authentication Consent form. Conditional forms only when they apply: the LAMA or DAMA questionnaire once that discharge type is recorded above; the Death questionnaire when the discharge type is Death or the HMIS has the patient declared dead.
- Sorted by title.

Without a stage `Discharge` token held ([S18. Beneficiary Verification](S18-beneficiary-verification.md)), the application answers the Discharge Consent form by itself for a payer that requires proof of presence; the claim is refused PAYR-1363 without one or the other [PAYER](../references/PAYERS.md#markers).

Each form is an accordion item "<form title> - <answered>/<total> answered", the stage chip beside it only once the ruling has been asked, the questions in a two-column grid with S9's typed controls and help texts, and its own "Save answers". Saving follows S9's rules (blank clears, a chosen file is attached at the claim stage labelled with the question text, a file question left empty keeps its file); flash "Answers saved.", with " <n> file(s) attached." when files went. Answers are kept once per case, form and question, each filed against the leg it was last saved on.

API: [A5. Claim Submit](../apis/A5-claim-submit.md) (answered forms)

---

**Claim card.** Title "Claim", with the status chip once a claim row exists.

| Status | Label | Tone |
|---|---|---|
| `draft` | Draft | warning |
| `submitting` | Awaiting payer | info |
| `approved` | Final approval | success |
| `partial` | Final approval | success |
| `queried` | Query raised | warning |
| `rejected` | Rejected | danger |
| `error` | Error | danger |

The payer's decision on the claim is final: approved in full or in part, the claim reads "Final approval", and the approved amount beside it says how much. Only the pre-authorisation ([S9. Pre-authorisation](S9-preauthorisation.md)) keeps "Approved" and "Partially approved".

Header actions: "Ask where it stands" (help icon, secondary) once the claim is `submitting` or decided (`approved`, `partial`, `rejected`, `queried`), only for a payer that answers a status Task; and the send button when the claim has a send left (none while `submitting` or `queried`).

States of the card:

1. **Not sent** (no claim yet, or `draft`). What the claim will quote, a table: Kind (chip: Procedure info, Implant warning), Item (name, code as a sub-line), Rate, Quantity, Amount, then a bold right-aligned "Total ₹<sum>". With a LAMA / DAMA discharge before or during surgery the table shows only `LM100`. Empty: "Nothing to claim, quote the line items on the pre-authorisation tab first." Header: primary "Submit claim" (send icon), behind the confirm "Send this claim to the payer?".
2. **`submitting`.** "Claim submitted; awaiting the payer's `on_submit` reply. Use Refresh to check for it, or ask the payer where it stands." Once the payer has acknowledged it (workflow 25, or a `queued` ClaimResponse, [C6. Claim Reply](../callbacks/C6-claim-on-submit.md)): "Acknowledged by the payer. The claim is under adjudication." Then Sent at and Claimed, the status enquiry rows and the reprocess rows.
3. **`error`.** The error text in the danger colour, or "The exchange failed.", and "What the payer said" when the payer answered with an error (its `ClaimResponse.error` entries, process notes, an "Open <title> (PDF)" link for a `form`). Shown, never obeyed. Header: the send button, the same kind as the send that failed ("Submit claim", or "Answer the query (<workflow>)").
4. **Decided or queried** (`approved`, `partial`, `rejected`, `queried`):
   - Three stat tiles: "Claimed"; "Approved" (success tone when `approved`, warning otherwise); "Status" (the label above).
   - Detail grid: Disposition; Outcome (`<outcome> · <adjudication>`); Claimed under (the claim number sent); Settled at; Sent as (the button words of the last send); Our reply; Submitted / eligible (only when the payer gave an eligible amount).
   - "What the payer said", as in the `error` state, when the reply carries any.
   - The per-item verdict table of S9: Item, Status chip, Eligible, Eligible %, Deducted, The payer's note.
   - On `queried`: the payer's query as a code block, then the reply form when the query is answered here, else the Communication pointer.
   - Otherwise, the Communication pointer when a standalone query is open on the claim: "The payer has asked <n> question(s) on this leg by CommunicationRequest. The answer goes back as a Communication on the request's own thread, with the documents it asked for, from the Communication tab."
   - The status enquiry rows.
   - On `rejected`, not paid in full: the **Reprocess** section (below).
   - On `approved` or `partial` with something paid and a balance still owed: the **Balance release** section (below).

**Send kinds.**

| Where the claim stands | Button label |
|---|---|
| Not sent / `draft` | Submit claim |
| `queried` | Answer the query (<workflow id>) [PAYER](../references/PAYERS.md#markers) |
| `error` | the label of the kind that failed |
| `approved` / `partial` / `rejected` | no button; refused: "The payer has decided this claim; it goes back for another look as a reprocess request, not as a claim sent again." |
| `submitting` | refused: "The claim is with the payer; wait for its answer before sending again." |

**Replying to a query** (status `queried`, answered here). A form with the required multi-line field "Reply to the payer's query", the help text "Goes to the payer as the claim query detail, with everything attached and answered on this tab since the query.", and the small primary button "Answer the query (<workflow id>)" (151, or 161 under the sandbox override [SANDBOX](../references/PAYERS.md#markers)). The question being answered is kept, so the card still shows it while the answer is out. A standalone query shows only the Communication pointer with "Open the Communication tab", and the claim is not sent again.

**Submit checks**, on the server in this order, each a red flash:
- The send-kind refusals above.
- On a query answer with no reply text: "Write the reply to the payer's query before answering it."
- "Link the patient's IPD admission on the Claim tab before sending the claim."
- "Record how the patient was discharged before claiming."
- "A claim goes in against an approved pre-authorisation."
- "Set the facility's HFR ID and NHCX participant code under Settings before submitting."
- "Enter the planned admission date on the pre-authorisation."
- "Quote at least one ICD-10 diagnosis."
- "Add at least one doctor to the care team."
- "Add at least one line, the procedure being done."

The send carries the proof of presence token of stage `Discharge` when one is held. A query answer travels as `x-hcx-status: request.initiated` (NHCX refuses `response.complete` on a submit path with NHCX-1011); a query answer refused at the door leaves the claim `queried`.

API: [A5. Claim Submit](../apis/A5-claim-submit.md) (claim, query answer)

The claim becomes `submitting`; flash "Claim submitted to the payer."

**Reading the verdict.** Callback: [C6. Claim Reply](../callbacks/C6-claim-on-submit.md)

**Status enquiry.** "Ask where it stands" as on S9, with `stage=claim`, hidden for a payer that answers no status Task (PMJAY) [PAYER](../references/PAYERS.md#markers); a direct post is refused with S9's text. With nothing sent: "The claim has not been submitted yet." Success: "Status enquiry sent to the payer." The Task travels with `x-hcx-workflow_id` `1`.

API: [A6. Task Submit](../apis/A6-task-submit.md) (status)

Callback: [C8. Enquiry Reply](../callbacks/C8-enquiry-on-submit.md)

**Enquiry rows.** Each kind of request (status, reprocess, release) shows in its own table: Asked, The payer said, Answered; newest first, at most 5. `asking`: chip "Asking, use Refresh" (info). `error`: chip "Failed" (danger) and the error. Otherwise a chip with the answer (approved or reopened success; partial or queried warning; rejected, refused or not-found danger; anything else info), the amount and a muted detail.

**Reprocess** (a section under a rule, heading "Reprocess"). Shown only when the claim is `rejected` and not paid in full. The S6 next action "Ask for a reprocess" appears only on a rejected claim.

| Field | Control |
|---|---|
| Why (required) | select: `claimrejected` Reprocess request due to claim rejected by payer (default); `rejectiondisputed` Rejection disputed, additional evidence provided |
| Ask the payer to reprocess the claim | multi-line text, 2 rows. Help: "A Task coded reprocess under workflow 36. The payer reopens the claim for a person, and the new verdict arrives on the claim's own thread." [PAYER](../references/PAYERS.md#markers) |
| Evidence to send with it | one checkbox per document on the claim (label or file name, code muted). Help: "Each rides on the Task as a supportingDocument input." Shown only when there are documents |

Button: primary "Send reprocess request"; the reprocess rows sit under it. Refusals, in order:
- "Only a claim the payer has rejected can be sent back for reprocessing."
- "A claim that has been paid in full cannot be reprocessed."
- "Say why the claim should be looked at again."
- "Choose why the claim is being sent back." (a reason the payer's adapter does not allow)
- "That document is not on this claim."
- "Set the facility's HFR ID and NHCX participant code under Settings first."

Success: "Reprocess request sent to the payer."

API: [A6. Task Submit](../apis/A6-task-submit.md) (reprocess)

Callback: [C8. Enquiry Reply](../callbacks/C8-enquiry-on-submit.md)

The row reads `reopened` when the payer accepts, and the claim goes back to `submitting` and waits for the new verdict on its own thread; otherwise `refused`, with the payer's disposition or description as detail.

**Balance release** (a section under a rule, heading "Balance release"). Shown when the claim is `approved` or `partial`, something has been paid and a balance is still owed (the claimed amount minus the paid total).

| Field | Control |
|---|---|
| Balance to release (₹) (required) | number, step 0.01, min 0.01, max the balance, prefilled with the balance. Help: "₹<paid> paid of ₹<claimed>." |
| Note to the payer | multi-line text, 2 rows. Help: "A Task coded release, reason partialpayment, under the arbitration workflow (36). The payer reopens the claim for the balance; the payment notice follows on the claim's own thread." [PAYER](../references/PAYERS.md#markers) |

Button: primary "Ask for the balance"; the release rows sit under it. Refusals: "Only a decided claim can have its balance asked for.", "A claim that has been paid in full has no balance.", "Say how much of the claim is still owed." (blank, zero, or not a number). Success: "Balance release request sent to the payer."

API: [A6. Task Submit](../apis/A6-task-submit.md) (release)

Callback: [C8. Enquiry Reply](../callbacks/C8-enquiry-on-submit.md)

The money itself arrives as a payment notice ([S12. Payments](S12-payments.md)).

Data: [D9. claim](../database/D9-claim.md)

Data: [D11. claim_plan_benefit](../database/D11-claim-plan-benefit.md)

Data: [D12. claim_plan_form](../database/D12-claim-plan-form.md)

Data: [D15. claim_auth_requirement](../database/D15-claim-auth-requirement.md)

Data: [D16. claim_line](../database/D16-claim-line.md)

Data: [D17. claim_form_answer](../database/D17-claim-form-answer.md)

Data: [D20. claim_submission](../database/D20-claim-submission.md)

Data: [D21. claim_payment](../database/D21-claim-payment.md)

Data: [D23. claim_query](../database/D23-claim-query.md)

Data: [D28. claim_document](../database/D28-claim-document.md)

Data: [D29. claim_enquiry](../database/D29-claim-enquiry.md)

#### S11L. LAYOUT
The arrangement below is the reference implementation's [REF](../references/PAYERS.md#markers): follow the target HMIS's own screen conventions. What is required is in DESCRIPTION and ACTIONS: the fields, options, columns, statuses, messages and actions.


```
|------------------------------------------------------------------|
| Claims > NM-26-0SE000001                                         |
| Asha Devi        [NM-26-0SE000001] [Claim: Rejected]             |
| Next: [Ask for a reprocess]                                      |
|------------------------------------------------------------------|
| Overview | Pre-authorisation | *Claim* | Communication | Payments | Logs |
|------------------------------------------------------------------|
| [Card] Discharge verification (S18, stage Discharge; when needed)|
|------------------------------------------------------------------|
| [Card] Claim [Rejected]                  [(?) Ask where it stands]|
|  [Claimed ₹50,000]  [Approved ₹0]  [Status Rejected]             |
|  DISPOSITION  OUTCOME  CLAIMED UNDER  SETTLED AT  SENT AS        |
|  Item | Status | Eligible | Eligible % | Deducted | Payer's note |
|  Asked | The payer said | Answered                               |
|  --------------------------------------------------------------  |
|  Reprocess                                                       |
|  Why [Reprocess request due to claim rejected v]                 |
|  Ask the payer to reprocess the claim [______________]           |
|  Evidence: [ ] Discharge summary  HDS                            |
|                                        [Send reprocess request]  |
|------------------------------------------------------------------|
| [Card] Linked admission (S4)                         [Unlink]    |
|------------------------------------------------------------------|
| [Card] Discharge                                                 |
|  Discharge type [v]            Stage [v]                         |
|  Discharge date [date]         Surgery date [date]               |
|  Date and time of death [date time]                              |
|  [Claimed as LM100 only]  (LAMA / DAMA before or during surgery) |
|                                             [Save discharge]     |
|------------------------------------------------------------------|
| [Card] Documents for the claim                                   |
|  Code | Document | Stage | Attached | Choose a PDF | From records | X |
|  HDS  | Hospital discharge summary | not attached yet | [file]   |
|  <note>                     [From records] [Attach chosen files] |
|  Everything attached for the claim                               |
|  File | Filed as | Size | Uploaded | [Remove]                    |
|  [Files...] [CD - Clinical document v] [Label____] [Attach]      |
|------------------------------------------------------------------|
| [Card] Forms for the claim                                       |
|  > Discharge consent - 0/2 answered                              |
|------------------------------------------------------------------|
```

- Before the claim is sent the order is admission, Discharge, Documents, Forms, Claim. After it is sent the Claim card comes first, as drawn.
- Stat tiles: one column on phones, two on small screens, three on large. Detail grids: three columns.
- The discharge, reprocess and release forms use a two-column grid with the button right-aligned.
- The Save discharge button is hidden while the claim is with the payer.

#### S11A. ACTIONS
1. Proof of presence: see S18 (stage Discharge).
2. Link / Unlink the IPD admission: see S4.
3. Save discharge: run the checks, record the discharge, re-read the case.
4. Attach chosen files: file one document per requirement (the summary under `HDS`), re-read the case.
5. X on a named document: take it off the claim's list.
6. Attach: file any number of claim-stage documents; From records: attach records found by ABHA.
7. File link: open the upload in a new tab, or a record on its own HMIS page.
8. Remove: after the confirm, delete the document, re-read the case.
9. Save answers: store one claim-stage form's answers and files.
10. Submit claim / Answer the query: confirm (Submit claim from draft only), run the checks, send the claim, re-read the case with the card awaiting the payer.
11. Ask where it stands: send the status Task; the answer appears in the enquiry rows.
12. Send reprocess request (rejected claim only): send the reprocess Task; the answer appears in the reprocess rows.
13. Ask for the balance: send the release Task; the payment follows on S12.
14. Open the Communication tab: go to S10.
15. Refresh (S6 header): re-read the case, polling the claim and every open request.
16. Breadcrumb "Claims": go to S5.
