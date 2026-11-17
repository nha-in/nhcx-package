# D20. claim_submission

#### D20T. TABLE
One row is the claim leg of one claim episode: how the stay ended, the last claim send and the payer's verdict on it. Primary key `id`. Parent table: `claim` (D9), one row per claim.

#### D20D. DESCRIPTION
The claim carries everything the pre-authorisation did plus the discharge. It is a separate exchange from the pre-authorisation (D18), with its own thread, and it can go in after a pre-authorisation was queried.

**Created.** The first time the row is needed: saving the discharge or sending the claim on Claim Submission (S11) inserts `{claim_id, status: 'draft'}` if there is no row yet.

**Discharge.** "Save discharge" on S11 writes `discharge_mode`, `discharge_stage`, `discharge_date`, `surgery_date` and `death_date`. It is refused while `status` is `submitting`. Rules: the mode must be `normal`, `lama`, `dama` or `death`; the stage must be `Before Surgery`, `During Surgery` or `After Surgery` [PAYER](../references/PAYERS.md#markers); the discharge date is required ("Enter the discharge date."), not after today in the facility's local date ("The discharge date cannot be after today."), not before the admission date ("The discharge date cannot be before the admission date."), and not before the day the pre-authorisation was sent (D18 `submitted_at`, as a facility local date; "The discharge date cannot be before the pre-authorisation date."); a surgery date may not be before admission, and the discharge may not be before the surgery; `death` requires a date and time of death (a date alone is refused), and any other mode clears `death_date`. A row in `draft` or `error` goes (back) to `draft`; any other status is kept.

A `lama` or `dama` discharge at `Before Surgery` or `During Surgery` makes the claim quote the single procedure the payer's configured LAMA / DAMA procedure ([D33. payer_config](D33-payer-config.md) `lama_dama_procedure`, `LM100` on both defaults) instead of the pre-authorised lines (the payer disqualifies the rest) [PAYER](../references/PAYERS.md#markers); a payer configured with none keeps the lines. That is computed at send time from these two columns.

**Sending.** Checked in this order: a query answer needs the desk's reply text ("Write the reply to the payer's query before answering it."); the IPD admission must be linked on the case (D9 `encounter_id`; "Link the patient's IPD admission on the Claim tab before sending the claim."), since unlike the pre-authorisation the claim bills a stay; a discharge must be recorded ("Record how the patient was discharged before claiming."); the pre-authorisation (D18) must be `approved`, `partial` (approved for less than asked) or `queried` ("A claim goes in against an approved pre-authorisation."). Every claim send, a query answer included, travels as `x-hcx-status: request.initiated`, and its correlation id is added to the case's thread list (D9 `correlation_ids`). Each send writes `status` `submitting`, `txn_id`, `correlation_id`, `submitted_at`, `claim_ref` (the current claim number), `requested_amount` (the sent Claim's total), `submission_kind`, `workflow_id`, `reply_text`, `request_json`, and clears `settled_at`, `error_message`, `outcome`, `adjudication`, `disposition`, `approved_amount`, `eligible_amount`, `submitted_amount`, `items_json`, `api_call_id` and `response_json`. A send refused at the door that named ids is kept under them: `error` with the message, or `queried` again with the question restored for a query answer. A query answer also keeps the question in `query_note` (the earlier `query_note`, else the earlier `disposition`).

**Which send it is** (`submission_kind`):

| Current row | Next send | Workflow id (`gov` adapter, PMJAY; `generic`; see [PAYERS.md](../references/PAYERS.md)) [PAYER](../references/PAYERS.md#markers) |
|---|---|---|
| none or `draft` | `discharge` where the discharge stage applies (below), else `claim` | 14; 15 |
| a discharge row (`submission_kind` `discharge` or `discharge_query_response`) `queried` | `discharge_query_response` (reply text required) | 141; 141 |
| a discharge row `rejected` | `discharge` again, corrected: a rejected discharge is never reprocessed and never opens the claim [PAYER](../references/PAYERS.md#markers) | 14; 14 |
| a discharge row `approved` or `partial` | `claim`, the final claim | 15; 15 |
| a discharge row `error` | the kind that failed (`discharge` or `discharge_query_response`) | 14 or 141 |
| a discharge row `submitting` | refused: "The claim is with the payer; wait for its answer before sending again." | |
| `queried` | `claim_query_response` (reply text required) | 161 [PAYER](../references/PAYERS.md#markers); 151 |
| `rejected`, `partial` or `approved` | refused: a decided claim is never sent again, by any adapter: "The payer has decided this claim; it goes back for another look as a reprocess request, not as a claim sent again." A `rejected` claim goes back as a reprocess request (D29); an `approved` or `partial` one may ask for its balance (D29 release) [PAYER](../references/PAYERS.md#markers) | none; none |
| `error` | the same kind as the failed send (`claim_query_response`, or `claim_resubmit` on a row written before resubmission was retired), else `claim`: a claim refused at the door never reached the payer, so it may be sent again | |
| `submitting` | refused: "The claim is with the payer; wait for its answer before sending again." | |

**Statuses** (exact strings): `draft`, `submitting`, `approved`, `partial`, `queried`, `rejected`, `error`.

**The discharge stage** [PAYER](../references/PAYERS.md#markers). Some payers validate the discharge before they take the final claim: the discharge information, the clinical summary and the documents go first, the payer answers approved, rejected or queried, and only an approved discharge lets the final financial claim go. Both payer configuration defaults turn it on ([D33. payer_config](D33-payer-config.md) `discharge_step` 1 for GOV and PVT), and a payer row with 0 sends the claim directly ([PAYERS.md](../references/PAYERS.md)); the integration decision `claim.dischargeStep` (L1.A: `where-payer-requires`, `always`, `never`) decides per case from the case's payer. The discharge is not a separate table: it rides on this row, as the send kinds `discharge` (workflow 14) and `discharge_query_response` (141), on the same endpoint and in the same bundle as the claim (`v1/claim/submit`, `Claim.use` `claim`, the discharge on `supportingInfo`, the discharge summary under `HDS`; A5. Claim Submit (in nhcx-claim), F8. Claim (in nhcx-preauth)). Its verdict is read like any claim reply (261 approved, 262 rejected, 263 queried, else the ClaimResponse, C6. Claim Reply (in nhcx-claim)) and is copied into the `discharge_*` columns, so when the final claim reuses the row the discharge's verdict stays beside it. The discharge's approval is not the claim's: S12 reads no approved amount from a row whose last send is a discharge kind, a reprocess ("Only a claim the payer has rejected can be sent back for reprocessing.") and a balance release ("Only a decided claim can have its balance asked for.") are refused on one, and a late reply on the discharge's correlation id after the final claim went is `ignored`. A final claim refused at the door leaves the approved discharge standing: only `error_message` and `txn_id` are written, so the final claim may be sent again.

**The payer's reply** (C6, or polling when the claim is opened) is read exactly as for the pre-authorisation (D18 table) [PAYER](../references/PAYERS.md#markers): outcome `queued` / `acknowledged` or reason `submitted` / `acknowledged` keeps `submitting`; reason `cancelled`, `rejected` or `denied` is `rejected` (the `rejected` and `denied` reasons are a correction to the reference implementation, which read them as `queried`); reason `queried` is `queried`; outcome `error` with no rejecting reason, `ClaimResponse.error`, or an envelope `response.error` is `error`, which decides nothing (F9. ClaimResponse (in nhcx-preauth)); `partial` with reason `approved` is `partial`; `complete` with reason `approved` or none is `approved`; anything else `queried`. It writes the flattened reply, `api_call_id`, `settled_at` (for a decision), `response_json`, clears `error_message` and copies `correlation_id` into `thread_correlation_id`. A redelivery (same `x-hcx-api_call_id`, or with none, the same outcome and adjudication) is ignored.

**Refusals.** A ProtocolResponse, a peer or protocol error found by polling, a failed dispatch or a failed send sets `status` `error` with the message. A refused `claim_query_response` instead goes back to `queried` with the question restored into `disposition`, so the desk answers again. `correlation_id` is put back to `thread_correlation_id` when there is one. A ledger 404 sets `error`.

**The pre-authorisation lock** ([CORE.md](../references/CORE.md), Instruction 14). This row's `status` alone decides whether the pre-authorisation (D18) may still change. While it is `submitting`, `queried`, `approved`, `partial` or `rejected` the claim has reached the payer, and every pre-authorisation-stage write (lines, details, its documents and forms, dismissals, a pre-authorisation or enhancement send) is refused with "The claim has gone to the payer, so the pre-authorisation is read only: no enhancement or change can be made. It can only be cancelled while the payer is deciding the claim." Once it is `approved`, `partial` or `rejected` the cancel is refused too: "The payer has decided the claim; the pre-authorisation can no longer be cancelled." A row in `draft` or `error` (refused at the door, it never reached the payer) leaves the pre-authorisation open. The claim leg's own writes (discharge, claim-stage documents and forms, the claim send) are never refused by this rule.

**Reprocess and release.** When the payer accepts a reprocess or balance release Task (D29, C8), this row goes back to `submitting` with `settled_at` and `error_message` cleared: the new verdict comes on the claim's own thread.

**Revival.** A row on record as a failed send goes back to `submitting` when the payer answers on its thread.

**Deleted.** Never by the application; by cascade with the claim or when the transactional store is cleared. Every change also recomputes the claim's `stage` and `sub_stage` (D9).

#### D20C. COLUMNS
| Column | Type | Null / default | Meaning |
|---|---|---|---|
| id | INTEGER | primary key | Row id |
| claim_id | INTEGER | NOT NULL, unique | The claim (D9) |
| status | TEXT | NOT NULL, default `draft` | `draft`, `submitting`, `approved`, `partial`, `queried`, `rejected`, `error` |
| discharge_mode | TEXT | null | `normal`, `lama`, `dama`, `death` (sent as `DTH`, `LAMA`, `DAMA`, `DTM`) [PAYER](../references/PAYERS.md#markers) |
| discharge_stage | TEXT | null | `Before Surgery`, `During Surgery`, `After Surgery` |
| discharge_date | TEXT | null | Discharge date or date-time |
| surgery_date | TEXT | null | Surgery date or date-time |
| death_date | TEXT | null | Date and time of death; mode `death` only |
| txn_id | TEXT | null | [G9. Ledger](../gateway/G9-ledger.md) id of the last send |
| correlation_id | TEXT | null | Correlation id of the last send |
| submitted_at | TEXT | null | When the last send went |
| settled_at | TEXT | null | When a decision was applied |
| error_message | TEXT | null | Why the last send failed or was refused |
| claim_ref | TEXT | null | The claim number the claim went under |
| preauth_ref | TEXT | null | `ClaimResponse.preAuthRef` as echoed on the claim's reply. Migration also adds it |
| api_call_id | TEXT | null | `x-hcx-api_call_id` of the last reply applied |
| adjudication | TEXT | null | Claim-level adjudication reason code, lower case |
| query_note | TEXT | null | The payer's query trail; during a query answer, the question being answered |
| outcome | TEXT | null | `ClaimResponse.outcome` |
| disposition | TEXT | null | `ClaimResponse.disposition` |
| approved_amount | REAL | null | `total` category `benefit` |
| eligible_amount | REAL | null | `total` category `eligible` |
| submitted_amount | REAL | null | `total` category `submitted` |
| requested_amount | REAL | null | The claim's lines total when sent |
| items_json | TEXT | null | JSON list, one entry per `ClaimResponse.item` (same shape as D18), including `deductible` and `deduction_reason` |
| submission_kind | TEXT | null | `claim`, `claim_query_response`, `discharge`, `discharge_query_response`; `claim_resubmit` only on rows written before resubmission was retired |
| workflow_id | TEXT | null | The `x-hcx-workflow_id` the last send carried |
| request_json | TEXT | null | The bundle as sent |
| response_json | TEXT | null | The last reply applied |
| thread_correlation_id | TEXT | null | The correlation id the payer last answered on. Migration only |
| reply_text | TEXT | null | The desk's answer on a query-answer send (the `CQD` entry [PAYER](../references/PAYERS.md#markers)). Migration only |
| discharge_status | TEXT | null | The discharge stage's own status (`submitting`, `approved`, `partial`, `queried`, `rejected`, `error`), written by every discharge send and its replies and kept once the final claim goes. Migration only |
| discharge_correlation_id | TEXT | null | The correlation id of the last discharge send. Migration only |
| discharge_submitted_at | TEXT | null | When the last discharge send went. Migration only |
| discharge_settled_at | TEXT | null | When the discharge was decided. Migration only |
| discharge_disposition | TEXT | null | The payer's words on the discharge (its query, else its disposition). Migration only |
| discharge_approved_amount | REAL | null | `total` category `benefit` on the discharge's verdict; never the claim's approved amount. Migration only |
| discharge_items_json | TEXT | null | The discharge verdict's per-item adjudication (same shape as `items_json`). Migration only |

#### D20K. KEYS AND INDEXES
- Primary key `id` (integer).
- Foreign key `claim_id` references `claim (id)` (D9), `ON DELETE CASCADE`; `claim_id` is UNIQUE.
- Index `ix_claim_submission_corr` on `(correlation_id)`.
- Index `ix_claim_submission_dcorr` on `(discharge_correlation_id)`. Payer-initiated messages are also matched on `claim_ref`.

#### D20U. USED BY
- Screens: [S5. Claim Master](../screens/S5-claim-master.md), [S6. Claim Detail](../screens/S6-claim-detail.md), [S12. Payments](../screens/S12-payments.md)
- APIs: [A10. Transaction Related](../apis/A10-txn-related.md), [A11. Transaction Dispatch](../apis/A11-txn-dispatch.md), [A12. Transaction FHIR](../apis/A12-txn-fhir.md), [A13. Transaction List](../apis/A13-txn-list.md), [A17. Claim State](../apis/A17-claim-state.md)
- Callbacks: [C1. Callback Door](../callbacks/C1-callback-door.md), [C10. Payment Notice](../callbacks/C10-paymentnotice-request.md)
- FHIR: [F13. PaymentNotice](../fhir/F13-paymentnotice.md)
- Database: [D9. claim](D9-claim.md), [D21. claim_payment](D21-claim-payment.md), [D33. payer_config](D33-payer-config.md)
