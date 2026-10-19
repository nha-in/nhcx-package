# S9. Pre-authorisation Screen

#### S9R. ROUTE
claims/view/:caseid/preauth

The Pre-authorisation tab of the Claim Detail shell S6, always shown. The retired keys `lines`, `plan`, `procedure`, `validate` and `verification` open it. Every action posts to its own endpoint, re-reads the case and leaves a flash above the tabs (S6): green with the message, red with the refusal verbatim.

| Endpoint | Purpose |
|---|---|
| `POST claims/:caseid/preauth` | Save the pre-authorisation details ([S4. Pre-authorisation Details and Admission Link](S4-claim-creation-form.md)) |
| `POST claims/:caseid/forms` | Save one payer form's answers (multipart) |
| `POST claims/:caseid/documents/required` | Attach files against the payer's named document codes (multipart) |
| `POST claims/:caseid/documents/dismiss` | Take a named document off the leg's list, or put it back (`stage`, `code`, `restore`) |
| `POST claims/:caseid/documents` | Attach any files under a chosen code (multipart) |
| `GET claims/:caseid/records` and `POST claims/:caseid/records/attach` | List the health records found by ABHA, attach the ticked ones |
| `GET claims/:caseid/documents/:did` | Open an uploaded document |
| `POST claims/:caseid/documents/:did/delete` | Remove a document |
| `POST claims/:caseid/submit` | Send the pre-authorisation, an enhancement or a query answer (optional field `reply`) |
| `POST claims/:caseid/cancel` | Ask the payer to cancel (fields `reason`, `note`) |
| `POST claims/:caseid/status` | Ask the payer where the leg stands (field `stage=preauth`) |

Breadcrumb: Claims (claims/list, S5) > <case number>

#### S9D. DESCRIPTION
Everything the pre-authorisation needs, in the order the desk fills it, and the card that sends it and shows what the payer said. There is no Line items, Insurance plan, Validate, Verification or Predetermination tab: their parts live here, and a quote (predetermination) is not offered.

**What the tab shows**, top to bottom:

1. **Proof of presence** ([S18. Beneficiary Verification](S18-beneficiary-verification.md), stage `Preauth`), only when the payer or its plan asks for it: the adapter requires it, or the plan's policy documents carry the Aadhaar proof of identity (`POI` with code `ADN`). The S6 next action is then "Authenticate the beneficiary".
2. When the case is **not in force** (the validation has not said eligible; S3. Policy Discovery (in nhcx-coverage)), one card titled "Pre-authorisation" reading "The pre-authorisation opens once the payer has confirmed the policy is **eligible**. Check the policy on the Overview tab first." and nothing else. Otherwise:
3. **Line items** ([S8. Line Items](S8-line-items.md)); while the plan is not `ready`, the Insurance plan card of [S7. Insurance Plan](S7-insurance-plan.md) in its place.
4. Once at least one line is quoted, side by side (stacked on a narrow screen): **Benefits check** and **Authorisation requirements** ([S8. Line Items](S8-line-items.md), S8.2). Both are optional and never hold the send.
5. **Pre-authorisation details** ([S4. Pre-authorisation Details and Admission Link](S4-claim-creation-form.md)): planned dates, ICD-10 diagnoses, treating doctors.
6. **Forms the payer requires**, once the plan is ready (or any form applies).
7. **Supporting documents**.
8. **Pre-authorisation**, the send card. **Once a pre-authorisation exists it moves to the top of this stack** (under the proof of presence card), because the payer's answer is the first thing to read.

**No admission is needed.** The pre-authorisation may be drafted and sent before the patient is in the bed (a planned admission, an intimation from the desk); no linked patient or admission is asked for. The IPD admission is linked on the Claim tab, because the claim bills it ([S4. Pre-authorisation Details and Admission Link](S4-claim-creation-form.md), S11. Claim Submission (in nhcx-claim)). The integration decision `preauth.admission` ([L1.A](../steps/L1-discovery.md)) may tighten this to *against a stay* for a hospital that wants it, never the other way. With `preauth.autoCancelHours` above 0, an `approved` pre-authorisation whose case has no admission linked within that many hours of the approval is withdrawn: a cancel Task (A6, reason `patient not admitted`) goes out, the card shows "Withdrawn automatically: the patient was not admitted within <n> hours of the approval." and the case can be reopened by a fresh pre-authorisation; an admission linked before it fires stops it. 0 (the default) means never.

**Read only once the claim is with the payer (core rule).** Once the pre-authorisation is approved and the claim has gone to the payer (the claim sent, queried or decided; a claim still a draft, or refused at the door, leaves it open), this tab is read only: no enhancement, no change to the lines, the details, the documents, the forms or the documents taken off the list, and no send. Only Cancel remains, and only until the payer decides the claim.
- An amber notice with a lock icon sits at the top of the tab: "The claim is with the payer, so this pre-authorisation is read only: no enhancement or change can be made. It can still be cancelled until the payer decides the claim." while the claim is with the payer, and "The payer has decided the claim, so this pre-authorisation is read only and can no longer be cancelled." once the payer has decided it.
- Every editable card of the tab (line items, both checks, details, forms, documents) is shown disabled. The send card stays, without a send button; its cancel form shows only while the pre-authorisation can still be cancelled.
- The server refuses every change to the pre-authorisation leg (lines, details, its documents and forms, a send) with "The claim has gone to the payer, so the pre-authorisation is read only: no enhancement or change can be made. It can only be cancelled while the payer is deciding the claim.", and a cancel once the claim is decided with "The payer has decided the claim; the pre-authorisation can no longer be cancelled." The claim leg's own writes are never refused by this rule.

**Queries, by level.** How a payer's query reaches the desk follows the adapter's query mode ([PAYERS.md](../references/PAYERS.md)): a **line-item** query (a ClaimResponse `queried` on the pre-authorisation's own thread, with the queried items) is answered from this tab by sending the pre-authorisation again with the reply; so is any query from a payer that takes answers by resubmission. Only a standalone query (a CommunicationRequest on a thread of its own) is read and answered on the Communication tab (S10. Communication (in nhcx-communication)). The same two levels hold for the claim (S11. Claim Submission (in nhcx-claim)).

**Polling.** Each load of S6 checks every exchange of this tab still open: the pre-authorisation while `submitting`, the cancel Task while `cancelling`, any status enquiry `asking`. A failed check never breaks the page. How the desk learns of an answer is `responses.check` ([S6. Claim Detail](S6-claim-detail.md)).

API: [A10. Transaction Related](../apis/A10-txn-related.md), [A11. Transaction Dispatch](../apis/A11-txn-dispatch.md) (poll)

Callback: [C5. Pre-auth Reply](../callbacks/C5-preauth-on-submit.md)

Callback: [C7. Cancel Reply](../callbacks/C7-cancel-on-submit.md)

Callback: [C8. Enquiry Reply](../callbacks/C8-enquiry-on-submit.md)

---

**Forms the payer requires.** The payer's structured data: its questionnaires for this procedure set, each a form with typed fields, never free text. Card title "Forms the payer requires". With no form to show: "The payer lists no forms for the quoted packages yet. Quote the line items first; the forms the package master attaches to them appear here." Which forms are listed (nothing without a ready plan):
- With the payer's authorisation-requirements ruling in: exactly the questionnaires the ruling names (D12: the ruling draws the line; every other package and policy form is the claim's).
- Without a ruling: the questionnaires the plan attaches to the quoted packages whose stage is `pre` (D11's stage rule), and the policy's own forms (a form pointed at from the coverage is a policy form, never a package's); the `post` forms wait for the claim (S11. Claim Submission (in nhcx-claim)) [PAYER](../references/PAYERS.md#markers).
- On either: the scheme's Authentication Consent form when the plan carries one; never the claim's Discharge Consent form; never a LAMA, DAMA or Death form (they belong to the discharge).
- Sorted by title.

When no proof of presence token is held and the payer requires one, the application answers the Authentication Consent form by itself and sends it; with a token held the consent form is left out, because a token and a consent are not both sent [PAYER](../references/PAYERS.md#markers).

Each form is one accordion item (several open at once) titled "<form title> - <answered>/<total> answered". Beside the title, a stage chip ("Pre-auth" or "Post (claim)"), **only once the authorisation-requirements ruling has been asked** (the split between the legs is the ruling's). Inside, the questions sit in a two-column grid, each labelled with its text (or its question id), a red required marker on a required question. Each question renders by its declared answer type:

| Type | Control |
|---|---|
| `attachment` | file input (PDF or image); an attached file shows a link "attached" that opens it |
| `choice`, or any question with options | select, blank "-", preselecting the saved answer, else the payer's initial answer |
| `boolean` | select "-", "Yes", "No" |
| `text` | multi-line text |
| `date` | date picker |
| `dateTime` | date and time picker |
| `time` | time field |
| `integer`, `decimal`, `quantity` | number field (whole numbers for `integer`) |
| `url` | link field |
| anything else | text field |

The help text under each field is the answer type ("File", "Choice", "Date & time", "Date", "Time", "Text", "Long text", "Yes / no", "Number", "Link"); an unknown type shows the payer's own spelling. The required marker is shown, never enforced. A form with no questions reads "This form carries no questions."

Each form has its own primary "Save answers" button (save icon), right-aligned under the grid. It posts as multipart to `claims/:caseid/forms` with `form_url` and `stage=preauth`, one field `qa_<question id>` per question:
- each answer is kept per form and question, filed against the leg it was saved on;
- a blank answer clears the saved one;
- a chosen file is attached to the case as a document at the pre-authorisation stage, labelled with the question text, and the answer points to that document; a file question left without a new file keeps the file already given;
- the upload rules below apply.

Flash: "Answers saved.", with " <n> file(s) attached." added when files went up.

API: [A4. Pre-auth Submit](../apis/A4-preauth-submit.md) (answered forms)

**Supporting documents card.** Title "Supporting documents". Three parts:

*Documents the payer named* (only when there are any). With a ruling: its document requirements due at pre-authorisation. Without one: the documents the plan names for the quoted packages whose stage is `pre` (codes other than `STG` [PAYER](../references/PAYERS.md#markers)); the `post` ones are listed on S11. Claim Submission (in nhcx-claim). Nothing without a ready plan. Table columns:

| Column | Content |
|---|---|
| Code | the requirement's code, monospace |
| Document | its display, the package code it belongs to as a muted sub-line |
| Stage | stage chip "Pre-auth" or "Post (claim)", **only once the ruling has been asked** (column hidden before) |
| Attached | the newest file filed under that code (opening it as below), or "not attached yet" |
| Choose a PDF | a file input `req_<code>` (PDF or image) |
| From records | the records picker, opened for that code |
| (action) | an X button, "Not needed: take it off the list" |

The X takes a plan-named document off this leg's list (stored on the case as `<stage>:<code>`; the endpoint's `restore` puts it back, a convenience the reference screen does not offer [REF](../references/PAYERS.md#markers)): flash "Document taken off the list." (restored: "Document put back on the list."); a code the plan does not name for this leg: "That document is not one the plan names for this leg." Under the table: "Named by the payer's authorisation-requirements ruling for this procedure set. Re-choosing a file replaces what is attached for that code." and the primary button "Attach chosen files" (paperclip icon). One file is kept per code; a new one replaces the old; empty inputs are skipped. Refusals: "Choose a PDF for at least one of them." and "That is not a document this pre-authorisation was asked for."

*Everything attached* at the pre-authorisation stage. Columns:

| Column | Content |
|---|---|
| File | an uploaded file's name, opening it in a new tab; a record attached from the HMIS opens **on its own HMIS page** (the diagnostic report, the prescriptions of its admission, the admission's notes, the invoice, the files of the admission or patient), labelled "Open <record type in lower case>" (for example "Open diagnostic report"), never as its `.json` |
| Filed as | label, with the code as a muted sub-line |
| Type | PDF, JPEG image, PNG image, WebP image (a structured record shows its type) |
| Source | "Uploaded", or "From records · <hiType>" |
| Size | "x.x MB", or whole KB with a 1 KB minimum |
| Uploaded | date and time |
| (action) | extra-small danger "Remove", confirm "Remove this document from the claim?", flash "Document removed." |

Empty: "No documents attached yet. The payer expects the admission note and the beneficiary's ID as a minimum." [PAYER](../references/PAYERS.md#markers)

*Upload row*, one wrapping row: "Files (PDF or image)" (file input, several, required marker), "Filed as" (select, `CD` by default), "Label" (text), the primary "Attach" button (paperclip icon), and the records picker button. "Filed as" offers **only the NHCX document codes**, each as "<code> - <label>", never a plan's own codes (such as PMJAY's `MAND...`), which are filed through their named row above:

| Code | Label |
|---|---|
| CD | Clinical document (case sheet, notes) |
| HDS | Hospital discharge summary |
| DIA | Diagnostic & laboratory reports |
| RAD | Radiology / scan reports |
| PRE | Doctor's prescription notes |
| CER | Medical certificate / referral |
| EST | Cost estimate |
| MB | Medical & pharmacy bills |
| INV | Final hospital invoice |
| OTR | Operation theatre notes |
| ICU | ICU chart |
| IMP | Implant invoice & sticker |
| POI | Proof of identity |
| KYC | KYC / bank proof |
| FCF | Filled claim form |
| PAU | Pre-authorisation approval letter |
| ODN | Other document |

Upload rules for every upload on the tab: PDF, JPEG, PNG and WebP only; at most 10 MB a file [REF](../references/PAYERS.md#markers); empty files refused. Messages: "Choose a PDF or image to attach.", "Only JPEG image, PDF, PNG image, WebP image files can be attached.", "That file is empty." and "A document may be at most 10 MB." A failure part way through says how many had gone up, for example " (2 of 3 attached before the failure.)". Success: "<n> document(s) attached." Documents are filed at stage `preauth`. The beneficiary's Aadhaar, where the payer wants it (`documents.aadhaar`), rides as supporting information: the identifier typed `ADN` on the Patient ([F15. Patient](../fhir/F15-patient.md)).

*The records picker.* A secondary "From records" button (folder icon; tooltip "Attach a health record the HMIS already holds instead of uploading a scan."), present only when the HMIS has an ABDM module ([SCAFFOLDING 4a](../references/SCAFFOLDING.md)); without one the button is absent, not disabled, and a direct post is refused "This HMIS has no ABDM module, so health records cannot be picked; upload the file instead." It opens a dialog "The patient's health records" with the description "Records the ABDM module holds for this patient: the linked admission's first. Tick the ones to attach; each is filed under its type's code unless you change it." (opened from a named row: "Pick the record that answers requirement <code>. It is filed under that code and replaces what was attached for it.").

**Records are found by the case's ABHA number**, always: the records of every patient in the HMIS whose ABHA number has the case's digits, whether or not a patient or admission is linked. The linked admission's records come first, then the patients' other encounters', then the patient-level ones (invoices, files), read from the HMIS's own tables (D28: OPConsultation, Prescription, DiagnosticReport, DischargeSummary, HealthDocumentRecord, Invoice). Above the table: "Records the ABDM module holds as structured data are sent to the payer as FHIR records, the way PMJAY takes them; scans and report files go as PDF." Columns:

| Column | Content |
|---|---|
| (checkbox) | disabled, and the row dimmed, when the record cannot be attached |
| Type | the `hiType` in words (Discharge summary, Diagnostic report, Prescription, OP consultation, Invoice, Immunisation, Health document, Wellness), with "Sent as a FHIR record" or "Sent as a file" under it |
| Record | the record's name with its date and time written out beside it ("18 Oct 2026, 8:41 am"); why it cannot be attached, in amber, when it cannot |
| Admission | the encounter it belongs to, with "This admission" on the linked one |
| Filed as | a select of the NHCX codes, preset by type (D28's defaults), enabled once ticked; the requirement's code, fixed, when opened from a named row |

Footer: "Close" and the primary "Attach selected" (disabled until one is ticked). While loading, a spinner; a failed read: "The patient's records could not be read."; empty: "The HMIS holds no health records for this patient yet. Records are created on the admission (discharge summary, reports, prescriptions) and appear here." Attaching copies each record into the case as a D28 row with `source = record`: the record's FHIR bundle as structured data (`application/fhir+json`, sent to the payer as a DocumentReference, [F19. Other bundle resources](../fhir/F19-other-resources.md)), or its PDF or image for a payer whose adapter does not take FHIR records. Success: "<n> record(s) attached from the patient's file." Refusals: "Tick at least one record to attach.", "That record is not one of this patient's.", "<title> is already attached to this leg.", "<title> is held as a structured record only, and it cannot be sent to this payer as FHIR." (a prescription, OP consultation or invoice to a payer that takes no FHIR), "<title> has nothing to attach: the record carries no document and the HMIS cannot render it."

---

**Pre-authorisation card (the send card).** Title "Pre-authorisation", with the status chip once sent. Money shows as `₹12,345`, missing values as `-`. No correlation id or transaction id is shown (they are on the Logs tab of [S6. Claim Detail](S6-claim-detail.md)).

| Status | Label | Tone |
|---|---|---|
| `submitting` | Awaiting payer | info |
| `approved` | Approved | success |
| `partial` | Partially approved | warning |
| `queried` | Query raised | warning |
| `rejected` | Rejected | danger |
| `cancelling` | Cancelling | warning |
| `cancelled` | Cancelled | danger |
| `error` | Error | danger |

Header actions: the send button (below), and "Ask where it stands" (help icon, outline) **only while the pre-authorisation is `submitting`** and only for a payer that answers a status Task. Once the payer has decided, the question is asked of the claim once it is raised (S11. Claim Submission (in nhcx-claim)).

States of the card:

1. **Not sent.** "Everything above goes to the payer as one FHIR Claim bundle: the beneficiary, the admission, the diagnoses, the care team, the <n> quoted line(s) at ₹<total>, the attached documents and the answered forms." Header: primary "Submit to payer" (send icon, no confirm). Until the pre-authorisation details have been saved once ([S4. Pre-authorisation Details and Admission Link](S4-claim-creation-form.md), D9 `preauth_saved_at` empty) the button is disabled with the help text "Save the preauth draft first (Stay, diagnoses, doctor and case above)."
2. **`submitting`.** "Submitted; awaiting the payer's `on_submit` reply. Use Refresh to check for it, or ask the payer where it stands." Once the payer has acknowledged the send (workflow 20, or a `queued` ClaimResponse, [C5. Pre-auth Reply](../callbacks/C5-preauth-on-submit.md)) the line reads "Acknowledged by the payer. The pre-authorisation is under adjudication." with the outcome as an info chip beside it. Then Sent at, Requested, and the Pre-auth reference when the acknowledgement carried one; the Communication pointer (below) when the payer has an open standalone query on this leg; the status enquiry rows; and the cancel form. No send button while the pre-authorisation is with the payer.
3. **`cancelling`.** "Cancellation sent to the payer; awaiting its answer to the Task. Use Refresh to check for it." Then Reason (in words), Note, Sent at.
4. **`cancelled`.** "The payer accepted the cancellation; this pre-authorisation is withdrawn." When the claim number was retired it adds: "The payer holds **<old number>** against the withdrawn pre-authorisation, so the episode carries on as **<new number>**, anything sent under the old number would be a duplicate of a cancelled case." Then Reason, Note, Withdrawn under, Pre-auth reference, Cancelled at, Disposition. Header: "Submit to payer" with the confirm "Send this pre-authorisation to the payer?" (a fresh pre-authorisation).
5. **`error`.** The error text in the danger colour, or "The exchange failed.", then "What the payer said" (below) when the payer answered with an error. Header: the send button for the kind of send that failed. An error is shown, never obeyed: nothing else on the case is blocked, and the send can be made again.
6. **Decided or queried** (`approved`, `partial`, `rejected`, `queried`):
   - Three stat tiles: "Requested"; "Approved" (success tone when `approved`, warning otherwise); "Pre-auth reference".
   - Detail grid: Status, Disposition, Outcome (`<outcome> · <adjudication>`, because the outcome alone does not say what happened), Settled at, Enhancements (round count or `-`), Sent as (the button words of the last send, such as "Answer the query (19)" [PAYER](../references/PAYERS.md#markers)), Our reply, and Case stands at (only when the payer gave an eligible amount).
   - "What the payer said", when the reply carries any: its `ClaimResponse.error` entries in the danger colour, its process notes, and "Open <title> (PDF)" for a `form` attachment, opened in a new tab.
   - The per-item verdict table, when the payer ruled per item: Item (sequence), Status (chip: approved success, queried warning, rejected danger, anything else info), Eligible, Eligible %, Deducted (amount, the deduction reason muted under it), The payer's note (`|` shown as ` · `, cut to 240 characters).
   - The enhancement block (below), on `approved` or `partial` with lines added.
   - "What the payer says": the payer's query text as a code block.
   - On `queried`: the reply form when the query is answered here (a payer that takes answers by resubmission, or no standalone query open on this leg), else the Communication pointer.
   - The cancel form, on `approved`, `partial` and `queried`.
   - Header: with lines added since an `approved` or `partial` decision, "Submit enhancement (₹<added total>, workflow 13)" [PAYER](../references/PAYERS.md#markers) with the confirm "Send the added lines to the payer as an enhancement of this pre-authorisation?"; on `rejected` "Submit to payer" (a fresh pre-authorisation). No send button on `approved` or `partial` with nothing added, and none in the header on `queried` (the reply form carries it).

**Send kinds.**

| Where the pre-auth stands | Button label |
|---|---|
| Not sent, `cancelled`, `error`, `rejected` | Submit to payer |
| `queried` | Answer the query (19) [PAYER](../references/PAYERS.md#markers) |
| `queried` after an enhancement | Answer the enhancement query (131) [PAYER](../references/PAYERS.md#markers) |
| `approved` / `partial` with lines added | Submit enhancement (₹<added total>, workflow 13) [PAYER](../references/PAYERS.md#markers) |
| `approved` / `partial`, nothing added | refused: "The pre-authorisation is already decided; add a line to ask for an enhancement." |
| `submitting` / `cancelling` | refused: "The pre-authorisation is with the payer; wait for its answer before sending again." |
| any, once the claim is with the payer | no button; refused: "The claim has gone to the payer, so the pre-authorisation is read only: no enhancement or change can be made. It can only be cancelled while the payer is deciding the claim." |

**Submit checks**, on the server in this order, each a red flash:
- "Submit a preauth only after the payer has confirmed the policy is eligible." (the case not in force)
- The send-kind refusals above.
- A new pre-authorisation whose admission date is before today: "The admission date cannot be before today; a pre-authorisation is not raised back-dated." (a query answer or an enhancement is not refused).
- On a query answer with no reply text: "Write the reply to the payer's query before answering it."
- "Set the facility's HFR ID and NHCX participant code under Settings before submitting."
- "Enter the planned admission date on the pre-authorisation."
- "Quote at least one ICD-10 diagnosis."
- "Add at least one doctor to the care team."
- "Add at least one line, the procedure being done."

No admission is asked for. Before the bundle is built, when the quoted set has not been asked about yet, the authorisation-requirements check is sent by itself ([S8. Line Items](S8-line-items.md), S8.2), without waiting for its answer [SANDBOX](../references/PAYERS.md#markers). The send carries the proof of presence token of stage `Preauth` when one is held ([S18. Beneficiary Verification](S18-beneficiary-verification.md)). A query answer travels as `x-hcx-status: request.initiated`, like every send on a submit path (NHCX refuses `response.complete` there with NHCX-1011); a query answer refused at the door leaves the leg `queried`, the question still open.

API: [A2. Coverage Eligibility Check](../apis/A2-coverage-eligibility-check.md) (auth-requirements, when not yet asked)

API: [A4. Pre-auth Submit](../apis/A4-preauth-submit.md) (pre-authorisation, enhancement, query answer)

The leg becomes `submitting` and the flash reads "Pre-authorisation submitted to the payer." A failed send flashes its error; an enhancement whose send failed returns to its decided state.

**Reading the reply.** Callback: [C5. Pre-auth Reply](../callbacks/C5-preauth-on-submit.md)

**Enhancement.** After an `approved` or `partial` decision, any line whose code was not in the last bundle sent counts as added. A warning-toned block shows the chip "Enhancement pending: <n> new line(s), ₹<total>", each added line with "Quantity <q>, ₹<amount>", and the muted line "Added since the payer decided. Sending the enhancement asks for these against the same pre-authorisation." The enhancement keeps the pre-auth reference and counts the round in Enhancements.

**Replying to a query** (status `queried`, answered here). A form with the required multi-line field "Reply to the payer's query", the help text "Goes to the payer as the claim query detail, with everything attached and answered on this tab since the query.", and a small primary button labelled with the send kind (send icon). The answer is the pre-authorisation sent again with the reply, so the desk corrects the lines, documents and forms above first.

**Communication pointer** (a standalone query, answered on S10. Communication (in nhcx-communication)). A bordered box: "<payer name> asks for more by CommunicationRequest and takes the answer as a Communication on that thread. A question from it arrives on the Communication tab; this leg is not submitted again to answer it." with an outline button "Open the Communication tab".

**Cancel form.** Shown while the status is `submitting`, `approved`, `partial` or `queried`, and only while the payer has not decided the claim; never after a rejection, never twice. One wrapping row above a rule:
- "Cancel because": select, blank "Select a reason":

| Value | Label |
|---|---|
| `treatmentplanchanged` | Treatment plan changed during hospitalization |
| `patientrequest` | Patient requested cancellation |
| `financialconstraints` | Financial constraints |
| `alternativetreatment` | Alternative treatment chosen |
| `duplicateclaim` | Duplicate claim / preauth |
| `administrativeerror` | Administrative error |
| `other` | Other reason |

- "Note": text field, at least 18rem wide.
- Danger button "Cancel pre-authorisation" (x icon), confirm "Ask the payer to cancel this pre-authorisation?".

Refusals: "The payer has decided the claim; the pre-authorisation can no longer be cancelled.", "There is no pre-authorisation to cancel.", "A pre-authorisation that is <status label, lower case> cannot be cancelled.", "Choose why the pre-authorisation is being cancelled.", and, for Other with no note, "Describe the reason, with “Other reason” the note is the only thing the payer can read." Success: "Cancellation sent to the payer."

API: [A6. Task Submit](../apis/A6-task-submit.md) (cancel)

Callback: [C7. Cancel Reply](../callbacks/C7-cancel-on-submit.md)

The leg goes to `cancelling`. On acceptance the status becomes `cancelled`, **the claim number is retired, and the case continues under a freshly minted number** [REF](../references/PAYERS.md#markers); the old number stays on the pre-auth as "Withdrawn under". On refusal the status returns to `approved` with "The payer did not accept the cancellation." recorded.

**Status enquiry ("Ask where it stands").** Offered only while the pre-authorisation is `submitting`, and only for payers that answer a status Task. PMJAY does not ([PAYERS.md](../references/PAYERS.md)) [PAYER](../references/PAYERS.md#markers), so the button is hidden, and a direct post is refused "<payer name> answers no status enquiry over NHCX; read where the case stands on its own desk, and the verdict arrives on this thread." Other refusals: "No pre-authorisation has been sent yet.", "Set the facility's HFR ID and NHCX participant code under Settings first." Success: "Status enquiry sent to the payer." The status Task travels with `x-hcx-workflow_id` `1`, never the leg's correlation id.

API: [A6. Task Submit](../apis/A6-task-submit.md) (status)

Callback: [C8. Enquiry Reply](../callbacks/C8-enquiry-on-submit.md)

The answers sit in a table in the `submitting` state, newest first, at most 5: Asked, The payer said, Answered. `asking`: chip "Asking, use Refresh" (info). `error`: chip "Failed" (danger) and the error. Otherwise a chip with the answer (approved or reopened success; partial or queried warning; rejected, refused or not-found danger; anything else info), the amount and a muted detail (stage, outcome, total approved, total paid).

Reprocess and balance release belong to the claim, not the pre-authorisation (S11. Claim Submission (in nhcx-claim)).

Data: [D9. claim](../database/D9-claim.md)

Data: [D11. claim_plan_benefit](../database/D11-claim-plan-benefit.md)

Data: [D12. claim_plan_form](../database/D12-claim-plan-form.md)

Data: [D15. claim_auth_requirement](../database/D15-claim-auth-requirement.md)

Data: [D16. claim_line](../database/D16-claim-line.md)

Data: [D17. claim_form_answer](../database/D17-claim-form-answer.md)

Data: [D18. claim_preauth](../database/D18-claim-preauth.md)

Data: [D19. claim_predetermination](../database/D19-claim-predetermination.md)

Data: [D23. claim_query](../database/D23-claim-query.md)

Data: [D28. claim_document](../database/D28-claim-document.md)

Data: [D29. claim_enquiry](../database/D29-claim-enquiry.md)

Data: [D30. counter](../database/D30-counter.md)

#### S9L. LAYOUT
The arrangement below is the reference implementation's [REF](../references/PAYERS.md#markers): follow the target HMIS's own screen conventions. What is required is in DESCRIPTION and ACTIONS: the fields, options, columns, statuses, messages and actions.


```
|------------------------------------------------------------------|
| Claims > NM-26-0SE000001                                         |
| Asha Devi        [NM-26-0SE000001] [Preauth: Approved] [Refresh] |
| Next: [Send the enhancement (1 added)]                           |
|------------------------------------------------------------------|
| Overview | *Pre-authorisation* | Claim | Communication | Payments | Logs |
|------------------------------------------------------------------|
| [Card] Proof of presence (S18, stage Preauth; only when needed)  |
|------------------------------------------------------------------|
| [Card] Pre-authorisation [Approved]                              |
|                      [(>) Submit enhancement (₹5,000, workflow 13)]
|  [Requested ₹25,000]  [Approved ₹20,000]  [Pre-auth ref ABC123]  |
|  STATUS  DISPOSITION  OUTCOME  SETTLED AT  ENHANCEMENTS  SENT AS |
|  Item | Status | Eligible | Eligible % | Deducted | Payer's note |
|  [Enhancement pending: 1 new line(s), ₹5,000]                    |
|  -------------------------------------------------------------   |
|  Cancel because [Select a reason v]  Note [______] [Cancel pre-auth]
|------------------------------------------------------------------|
| [Card] Line items (S8)                                           |
|------------------------------------------------------------------|
| [Card] Benefits check (S8)     | [Card] Authorisation reqs (S8.2)|
|------------------------------------------------------------------|
| [Card] Pre-authorisation details (S4)                            |
|------------------------------------------------------------------|
| [Card] Forms the payer requires                                  |
|  > Treatment guideline - 3/5 answered  [Pre-auth]                |
|------------------------------------------------------------------|
| [Card] Supporting documents                                      |
|  Documents the payer named                                       |
|  Code | Document | Stage | Attached | Choose a PDF | From records | X |
|  [Attach chosen files]                                           |
|  File | Filed as | Type | Source | Size | Uploaded | [Remove]     |
|  [Files...] [CD - Clinical document v] [Label__] [Attach] [From records]
|------------------------------------------------------------------|
```

- Before anything is sent, the Pre-authorisation card sits last. Once a pre-authorisation exists it moves to the top, under the proof of presence card, as drawn.
- Stat tiles sit in a grid: one column on phones, two on small screens, three on large.
- Detail grids are three columns.
- Header actions sit in the card header, right-aligned. Send buttons are primary with a send icon; the cancel button is the danger style.
- The cancel form and the upload row are single wrapping rows with labelled fields aligned to the button.

#### S9A. ACTIONS
1. Proof of presence: see S18 (stage Preauth).
2. Line items, Benefits check, Authorisation requirements: see S8.
3. Save details: see S4.
4. Save answers: store one form's answers and files, re-read the case.
5. Attach chosen files: attach one file per named code, re-read the case.
6. X on a named document: take it off the list, re-read the case.
7. Attach: attach the chosen files under the code and label, re-read the case.
8. From records: open the records picker; Attach selected attaches the ticked records.
9. File link: open the upload in a new tab, or a record on its own HMIS page.
10. Remove: after the confirm, delete the document, re-read the case.
11. Submit to payer / Submit enhancement / Answer the query: run the checks, send the bundle, re-read the case with the card awaiting the payer.
12. Cancel pre-authorisation: after the confirm, send the cancel Task, re-read the case in `cancelling`.
13. Ask where it stands (while `submitting`): send the status Task, re-read the case; the answer appears in the enquiry rows.
14. Open the Communication tab: go to S10.
15. Refresh (S6 header): re-read the case, polling every exchange still open.
16. Breadcrumb "Claims": go to S5.
