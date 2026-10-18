# D28. claim_document

#### D28T. TABLE
One row is one supporting file (PDF or image) attached to a claim for one leg, stored inline with the payer requirement it answers. Primary key `id`. Parent table: `claim` (D9).

#### D28D. DESCRIPTION
**Created.** Every path goes through one insert that checks the file:

- The claim must exist.
- The content type (lower-cased, parameters dropped) must be `application/pdf`, `image/jpeg`, `image/png` or `image/webp`.
- The file must not be empty and must be at most 10 MB (10 * 1024 * 1024 bytes) [REF](../references/PAYERS.md#markers).
- Refusals, verbatim: no file chosen "Choose a PDF or image to attach."; a type outside the list "Only JPEG image, PDF, PNG image, WebP image files can be attached."; an empty file "That file is empty."; over the limit "A document may be at most 10 MB."; on the named-documents row with no file at all "Choose a PDF for at least one of them."; a code the leg was not asked for "That is not a document this pre-authorisation was asked for." (on the claim: "That is not a document this claim was asked for."; `HDS` is always allowed on the claim). When several files go at once and one fails, the message ends " (<n> of <total> attached before the failure.)" (" (<n> attached before the failure.)" on the named-documents row), and nothing is kept. Flash: "<n> document(s) attached."
- `filename` defaults to `document`; blank `label`, `code` and `category` are stored as null; `stage` defaults to `preauth`; `size` is the byte count; `uploaded_at` is now; `source` is `upload` for a chosen file and `record` for a health record picked from the HMIS, with `record_ref` naming it.

**From the HMIS's health records, not only from a file.** An HMIS with an ABDM module ([SCAFFOLDING.md](../references/SCAFFOLDING.md) section 4a) already holds, or can build, the patient's health records as ABDM M2 document bundles: the discharge summary, diagnostic reports, prescriptions, OP consultation notes, the invoice (the eight `hiType`s, read with the `abdm-m2` prompt and the atoms named in [KNOWLEDGE.md](../references/KNOWLEDGE.md)). Every place a file is chosen (S9, S10, S11 and a form's file question, D17) also offers "From records". **The records are found by the case's ABHA number** (D9 `abha_number`, digits): the records of every HMIS patient holding those digits, always, whether or not a patient or an admission is linked to the case, so a pre-authorisation drafted before admission can still attach them; a record of anyone else is refused ("That record is not one of this patient's."). The picker lists the linked admission's records first (when it is the ABHA holder's), then the other encounters', newest first, then the patient-level ones (invoices, files on the patient), each row showing the record's name with its date and time written out beside it (for example "18 Oct 2026, 8:41 am"), and its `hiType`, and the desk ticks the ones to attach ("Tick at least one record to attach."; flash "<n> record(s) attached from the patient's file."). Without an ABDM module: "This HMIS has no ABDM module, so health records cannot be picked; upload the file instead." The list is read from the HMIS's own record tables, whether or not the module has staged or linked the record to ABDM yet: at least OPConsultation (an outpatient visit), Prescription, DiagnosticReport, DischargeSummary, HealthDocumentRecord (a file on the admission or the patient) and Invoice (the billing module's invoice). Where the module has no bundle builder for a type, the application builds that type's bundle itself with the module's helpers (the NRCES profile's Composition around the record and its files; see the `abdm-m2` atoms), so every listed record can go as structured data. What is stored is the record's **M2 document bundle itself**, as JSON (`content_type` `application/fhir+json`): a picked record is the payer's structured data, not a scan, and it rides in the claim bundle as a `DocumentReference` entry that the supportingInfo row points at (F8, F19). This is how the live PMJAY provider sends the hospital's own records and PMJAY adjudicates them [PAYER](../references/PAYERS.md#markers). Only for a payer whose adapter does not take records as FHIR ([PAYERS.md](../references/PAYERS.md) "Health records as FHIR") is the record's own file stored instead (the discharge summary's PDF, a report's uploaded files, the file itself); a record with no file of its own is listed but not attachable ("<title> has nothing to attach: the record carries no document and the HMIS cannot render it."; a structured-only record for such a payer: "<title> is held as a structured record only, and it cannot be sent to this payer as FHIR."). The row is a full D28 row (the bytes are copied, so a later edit of the record does not change what the payer saw), `source = 'record'`, `record_ref` = `<hiType>:<source>:<id>` (the HMIS table the record came from and its row id, enough to open the record on its own page), `filename` `<hiType>.json` for a bundle, else the file's own name, `label` the requirement's display or the record's title, and `code` the requirement's code when attached against one, else the default below. Default `code` by `hiType` [REF](../references/PAYERS.md#markers): DischargeSummary `HDS`, DiagnosticReport `DIA`, Prescription `PRE`, Invoice `MB`, OPConsultation `CD`, ImmunizationRecord `CER`, HealthDocumentRecord and WellnessRecord `ODN`. A record attached twice to one leg is refused ("<title> is already attached to this leg.").

The paths that create rows:

| Path | Screen | code | category | stage | Replaces |
|---|---|---|---|---|---|
| Pick health records from the HMIS ("From records") | S9, S10, S11 | the requirement's code when picked against one, else the hiType default above | `HDS` when the code is `HDS`, else `INV` against a requirement, else null | the leg's | against a requirement, every other row with the same `code` |
| Attach any files under a chosen code | S9 (or S11 with `stage` `claim`) | the code chosen (the payer's, or one of the common codes below) | null | `preauth` or `claim` | nothing |
| Attach against a payer requirement | S9 | the requirement's code | `INV` | `preauth` | every other row on the claim with the same `code` |
| Attach claim-stage requirements | S11 | the requirement's code | `INV` | `claim` | every other row on the claim with the same `code` |
| Discharge summary | S11 | `HDS` | `HDS` | `claim` | every other `HDS` row on the claim |
| File answer to a form question | S9, S11 | null | null | the form's leg | nothing (D17 holds the id) |
| New file on a query reply | S10 | the requirement's or chosen code | null | the queried leg (D23 `stage`) | nothing |

Every path that creates, replaces, removes or dismisses a `preauth` row is refused once the claim is with the payer, the pre-authorisation being read only ([CORE.md](../references/CORE.md) Instruction 14, [A4. Pre-auth Submit](../apis/A4-preauth-submit.md)): "The claim has gone to the payer, so the pre-authorisation is read only: no enhancement or change can be made. It can only be cancelled while the payer is deciding the claim." A `claim` row is never refused by that rule.

A requirement must be one the payer named for that leg, from the auth-requirements ruling (D15) when there is one, else the package master (D11). The replace step deletes by `claim_id` and `code` only, whatever the stage.

Common codes offered on every upload: `CD` Clinical document (the default), `HDS` Hospital discharge summary, `DIA` Diagnostic and laboratory reports, `RAD` Radiology / scan reports, `PRE` Doctor's prescription notes, `CER` Medical certificate / referral, `EST` Cost estimate, `MB` Medical and pharmacy bills, `INV` Final hospital invoice, `OTR` Operation theatre notes, `ICU` ICU chart, `IMP` Implant invoice and sticker, `POI` Proof of identity, `KYC` KYC / bank proof, `FCF` Filled claim form, `PAU` Pre-authorisation approval letter, `ODN` Other document [PAYER](../references/PAYERS.md#markers). The "Filed as" choice on a free upload offers only these NHCX codes, never a plan's own requirement codes (`MAND...` [PAYER](../references/PAYERS.md#markers)): a plan-named document is filed through its own named row.

**Read.**

- A leg's bundle (pre-authorisation, enhancement, query answer on `preauth`; claim on `claim`) carries the rows of its own `stage`, except rows used as a form's file answer (those ride inside the QuestionnaireResponse). Each goes with its `code` (else `ODN`), its `category` (else `INV`) [REF](../references/PAYERS.md#markers), its `label` (else `filename`), content type and base64 data.
- On the claim, the discharge summary is the claim-stage row whose code the payer named as a discharge summary, else the newest `HDS` row. It is sent under the `HDS` category and left out of the ordinary attachments.
- Without a ruling, a document required for the claim is no longer asked for when a `preauth` row already carries its code.
- A plan-named document the desk dismissed for a leg (D9 `dismissed_documents`, `<stage>:<code>`) is not asked for on that leg; a row already attached under that code is still sent. Dismissing is offered only for a code the leg's list names (else "That document is not one the plan names for this leg."), flash "Document taken off the list."; restoring removes the key, flash "Document put back on the list."
- A query reply (D23) and a reprocess request (D29) may attach any rows of the claim, by id.
- Viewing a row serves `data` inline under `content_type`.

**Deleted.** "Remove" on S9 or S11 (the claim-stage documents card) deletes one row ("Document removed.") and returns to S9. Rows are also replaced as in the table above, removed by cascade with the claim, or cleared with the transactional store. A D17 answer or D23 / D29 id list that pointed at a deleted row is left as it is. There is no status column.

#### D28C. COLUMNS
| Column | Type | Null / default | Meaning |
|---|---|---|---|
| id | INTEGER | primary key | Row id |
| claim_id | INTEGER | NOT NULL | The claim (D9) |
| filename | TEXT | NOT NULL | Uploaded file name (default `document`) |
| content_type | TEXT | NOT NULL | `application/pdf`, `image/jpeg`, `image/png`, `image/webp` |
| label | TEXT | null | Title shown and sent; a requirement's display, a form question's text, `Hospital discharge summary`, or what was typed |
| code | TEXT | null | Payer requirement code it answers (for example `MAND0671` [PAYER](../references/PAYERS.md#markers)), a common code, or `HDS`. Migration also adds it |
| category | TEXT | null | Supporting-info category: `INV`, `HDS`, or null (sent as `INV`). Migration also adds it |
| stage | TEXT | NOT NULL, default `preauth` | Leg it was attached for: `preauth` or `claim`. Migration also adds it |
| size | INTEGER | NOT NULL, default 0 | Size in bytes |
| data | BLOB | NOT NULL | The file |
| uploaded_at | TEXT | NOT NULL | When it was attached |
| source | TEXT | NOT NULL, default `upload` | `upload` (a chosen file) or `record` (a health record of the HMIS, through its ABDM module). Added by migration |
| record_ref | TEXT | null | `<hiType>:<source>:<id>` of the HMIS record the bytes were taken from (source = the record's table, for example the encounter, prescription, diagnostic report, discharge summary upload, file upload or invoice); null for an upload. Added by migration |

A `source = record` row whose `content_type` is `application/fhir+json` holds the record's bundle; its `filename` ends `.json`. The screens show it as "From records · <hiType>" and open it **on its own HMIS page** ("Open diagnostic report", "Open prescription", "Open OP consultation", "Open invoice", the encounter's files), found from `record_ref`, never as its `.json` or a file download (S9). It is still sent to the payer as FHIR. When the record is gone or has no page, no link is shown.

#### D28K. KEYS AND INDEXES
- Primary key `id` (integer).
- Foreign key `claim_id` references `claim (id)` (D9), `ON DELETE CASCADE`.
- Index `ix_claim_doc` on `(claim_id, id)`.
- Referenced without a foreign key by D17 (`answer` of a file question), D23 (`reply_documents`) and D29 (`document_ids`).

#### D28U. USED BY
- Screens: [S9. Pre-authorisation](../screens/S9-preauthorisation.md), [S10. Communication](../screens/S10-communication.md), [S11. Claim Submission](../screens/S11-claim-submission.md)
- APIs: [A1. Policy Search](../apis/A1-policy-search.md), [A7. Communication Reply](../apis/A7-communication-on-request.md), [A17. Claim State](../apis/A17-claim-state.md), [A18. Biometric Authentication](../apis/A18-biometric-authentication.md), [A19. ABHA Create and Verify (ABDM M1)](../apis/A19-abha-m1.md)
- FHIR: [F7. QuestionnaireResponse](../fhir/F7-questionnaireresponse.md), [F8. Claim](../fhir/F8-claim.md), [F10. Task (claim actions)](../fhir/F10-task-claim-actions.md), [F12. Communication](../fhir/F12-communication.md), [F19. Other bundle resources](../fhir/F19-other-resources.md)
- Database: [D3. patient](D3-patient.md), [D9. claim](D9-claim.md), [D15. claim_auth_requirement](D15-claim-auth-requirement.md), [D17. claim_form_answer](D17-claim-form-answer.md), [D18. claim_preauth](D18-claim-preauth.md), [D19. claim_predetermination](D19-claim-predetermination.md), [D23. claim_query](D23-claim-query.md), [D29. claim_enquiry](D29-claim-enquiry.md)
