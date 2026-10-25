# D10. claim_plan

#### D10T. TABLE
One row is the payer's package master (InsurancePlan) for one claim's policy and provider pair; primary key `id`; parent table [D9. claim](D9-claim.md) (one row per claim).

#### D10D. DESCRIPTION
The package master is fetched over NHCX with an InsurancePlan discovery Task (A3, answered on C4). The Task carries only the policy number and the facility's HFR ID. The reply's InsurancePlan is flattened into this row, its packages into [D11. claim_plan_benefit](D11-claim-plan-benefit.md) and its Questionnaires into [D12. claim_plan_form](D12-claim-plan-form.md). The master is held per claim, not once per facility: a payer may answer the same policy and facility differently for different beneficiaries, so the answer a case was priced on is kept with that case.

A `ready` plan decides what the rest of the claim uses. Every line (D16 (in nhcx-preauth)) is quoted from its benefits, with its price; there are no custom lines and no local package list. Its documents and forms are the fallback requirement list when there is no auth-requirements ruling ([D13](D13-claim-auth.md)), and its `policy_documents` say whether the policy asks for proof of presence (a requirement coded `ADN`, [D31](D31-biometric-auth.md)) [PAYER](../references/PAYERS.md#markers).

Request (automatic when the case opens, the desk's "Fetch" while none is held, or "Refetch"):
- **Automatic.** When a validation answers with the policy in force and leaves an open case (not provisional, [D9](D9-claim.md)), or choosing the patient on a provisional case opens it, and the case holds no plan row, the plan is requested without the desk asking: first by reuse (below), else by sending A3. It never raises: a refusal (no HFR ID, a request still outstanding) or a failed send is logged, and the desk can still fetch from the Overview. It runs after the verdict is committed and acknowledged, never inside the callback's transaction.
- Unless the operator asks to refresh, a master this facility already holds is reused (only when the case has a policy code and the facility an HFR ID). The source is the newest `ready` row of another claim with the same `policy_code`, `provider_id` and claim `payer_id`, ordered by `fetched_at DESC, id DESC`. All its columns except `id`, `claim_id` and `response_json` are copied onto this claim's row, inserted or overwritten; `response_json` stays null on a reused row, because the audit copy is the source row's and a PMJAY master is some 18 MB decrypted (29 reused copies made a 645 MB database in one afternoon [SANDBOX](../references/PAYERS.md#markers)). This claim's benefits and forms are deleted, and the source's are copied. No NHCX call is made.
- Otherwise the request needs the facility's HFR ID and participant code ([D1](D1-organization.md)) and sends A3 with `x-hcx-workflow_id` = `1`: the plan is the hospital's under the policy, never a case's, so the case number is never sent (a legacy `case` setting reads as `1`) [PAYER](../references/PAYERS.md#markers). Written: `status = 'fetching'`, `txn_id`, `correlation_id`, `requested_at` = now, `policy_code` (the claim's, or null), `provider_id` (HFR ID). Nulled: `fetched_at`, `error_message`, `plan_identifier`, `plan_title`, `plan_type`, `sum_insured`, `policy_documents`, `response_json`. A send that fails writes `status = 'error'` and `error_message`.
- A payer that refuses a second plan request while one is outstanding (the `gov` adapter, PAYR-1406) [SANDBOX](../references/PAYERS.md#markers): while a row of the same payer, `policy_code` and `provider_id` is `fetching` and was requested less than 60 minutes ago, no second request is sent, on a first fetch or a refetch; the refusal names when it was asked.
- The first request inserts the row. A later one updates it and deletes its benefits in the same transaction; a refetch replaces the master wholesale.

Reply (C4 callback, or polling by `txn_id`):
- A parsed plan writes `plan_identifier`, `plan_title`, `plan_type`, `sum_insured`, `policy_documents`, `fetched_at` = now, `error_message` = null, `response_json`. `status` becomes `ready` when there is at least one benefit, else `empty`. The benefits and forms are deleted and re-inserted in one transaction.
- A reply carrying no InsurancePlan is stored as an empty plan (`status = 'empty'`), with `error_message` ending "The payer has no package master filed under this policy."
- `status = 'error'` with `error_message` on a ProtocolResponse, a protocol error in the ledger, a dispatch status of `dispatch_failed`, `dead` or `failed`, or a ledger 404 ("... Fetch again.").
- A redelivery for a row no longer `fetching` is ignored unless the last send is on record as failed; then the row is revived to `fetching` and the reply applied.

Status values and transitions:
- (none) -> `fetching` (request sent) or `error` (send failed); (none) -> copied status (normally `ready`) on reuse.
- `fetching` -> `ready`, `empty` or `error`.
- `ready`, `empty`, `error` -> `fetching` on a refetch.

Delete: never directly. The row goes with its claim (`ON DELETE CASCADE`) or with the "clear transactional data" reset.

#### D10C. COLUMNS
| column | type | null/default | meaning (and allowed values) |
|---|---|---|---|
| id | INTEGER | primary key | row id; `plan_id` of benefits and forms |
| claim_id | INTEGER | NOT NULL, UNIQUE | the claim ([D9](D9-claim.md)) |
| status | TEXT | NOT NULL, default `'fetching'` | `fetching`, `ready`, `empty`, `error` |
| txn_id | TEXT | null | [G9. Ledger](../gateway/G9-ledger.md) id of the request |
| correlation_id | TEXT | null | ties the request to its on_request |
| requested_at | TEXT | null | ISO timestamp of the request |
| fetched_at | TEXT | null | ISO timestamp the reply was applied |
| error_message | TEXT | null | why the fetch failed, or the note on an empty plan |
| policy_code | TEXT | null | Task.input `policyNumber` sent |
| provider_id | TEXT | null | Task.input `providerId` sent, the facility's HFR ID |
| plan_identifier | TEXT | null | InsurancePlan.identifier[0].value, else InsurancePlan.id |
| plan_title | TEXT | null | InsurancePlan.name |
| plan_type | TEXT | null | display of InsurancePlan.type[0], else of the first plan[].type |
| sum_insured | REAL | null | first plan[].generalCost[].cost.value |
| policy_documents | TEXT | null | JSON list of policy-wide requirements, each `{code, display, category, category_display, form, stage}`: those on the InsurancePlan itself, then every form pointed at from a `coverage[]` element (a policy form, never one of the packages under it, F5. InsurancePlan (in nhcx-preauth)); one entry per form url. Every claim under the policy needs them; a `code` of `ADN` makes proof of presence required. Added by migration |
| response_json | TEXT | null | JSON: the full on_request bundle, for audit |

#### D10K. KEYS AND INDEXES
- Primary key `id` (integer).
- `claim_id` references [D9. claim](D9-claim.md) `id`, `ON DELETE CASCADE`.
- Referenced by [D11. claim_plan_benefit](D11-claim-plan-benefit.md) and [D12. claim_plan_form](D12-claim-plan-form.md) (`plan_id`, `ON DELETE CASCADE`).
- Unique: `claim_id` (one package master per claim).
- Index: `ix_claim_plan_corr (correlation_id)`, used to match the reply.

#### D10U. USED BY
- Screens: [S6. Claim Detail](../screens/S6-claim-detail.md), [S17. Beneficiary Discovery](../screens/S17-beneficiary-discovery.md)
- APIs: [A10. Transaction Related](../apis/A10-txn-related.md), [A11. Transaction Dispatch](../apis/A11-txn-dispatch.md), [A13. Transaction List](../apis/A13-txn-list.md), [A17. Claim State](../apis/A17-claim-state.md)
- Callbacks: [C1. Callback Door](../callbacks/C1-callback-door.md)
- Database: [D8. terminology](D8-terminology.md), [D9. claim](D9-claim.md), [D11. claim_plan_benefit](D11-claim-plan-benefit.md), [D12. claim_plan_form](D12-claim-plan-form.md), [D13. claim_auth](D13-claim-auth.md), [D31. biometric_auth](D31-biometric-auth.md), [D32. participant](D32-participant.md)
- Tests: [T13. PMJAY Eligibility, Package Master and Ruling](../tests/T13-pmjay-eligibility-and-package-master.md)
