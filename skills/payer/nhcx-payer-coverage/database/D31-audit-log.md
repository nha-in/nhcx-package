# D31. audit_log

#### D31T. TABLE
One row is one line of the trail: who did what to which record, and every message answered on the exchange; primary key `id`, an identity column. No parent table. The reference implementation names it `payer_audit_log` [REF](../references/PAYERS.md#markers).

#### D31D. DESCRIPTION
Money and health information are both the kind of thing you want to answer "who changed this, and when" about. Every write against member, policy, enrolment, case and payment data, and every sign-in attempt, appends a row with the acting account and its address.

**The exchange's receipts.** Every answer this payer sends writes a row under `entity_type` `nhcx_txn` with the inbound ledger id as `entity_id` and the answer's ledger id in the detail: `eligibility.answered`, `eligibility.lapsed`, `eligibility.no_cover`, `eligibility.auth_requirements` ([A1. Eligibility Answer](../apis/A1-eligibility-answer.md)); `insuranceplan.answered`, `insuranceplan.no_plan` ([A2. Insurance Plan Answer](../apis/A2-insurance-plan-answer.md)); `preauth.received`, `preauth.enhanced`, `preauth.resubmitted` (C4. Pre-auth Submit (in nhcx-payer-preauth)); `claim.received`, `claim.resubmitted` (a claim sent again answering a line-item query) (C5. Claim Submit (in nhcx-payer-claim)); `predetermination.answered` (A10. Predetermination Quote (in nhcx-payer-preauth)); `status.answered` (A8. Status Answer (in nhcx-payer-preauth)); `task.<code>.answered` (A9. Task Answer (in nhcx-payer-preauth)); `paymentnotice.answered` (A7. Payment Enquiry Answer (in nhcx-payer-payment)); `communication.received` (C9. Communication (in nhcx-payer-communication)). Verdicts and notices are written under `case` and `payment`: `preauth.answered`, `claim.answered`, `reprocess.answered` (A3. Pre-auth Answer (in nhcx-payer-preauth), A4. Claim Answer (in nhcx-payer-claim), A9. Task Answer (in nhcx-payer-preauth)), `case.query_sent` (A5. Query Request (in nhcx-payer-communication)), `preauth.queried` and `claim.queried` (a line-item query on the leg's thread, A13. Adjudicate (in nhcx-payer-preauth)), `case.query_raised` (Raise Query, A13. Adjudicate (in nhcx-payer-preauth)), `payment.noticed` (A6. Payment Notice (in nhcx-payer-payment)).

The row under `nhcx_txn` is read back by the callback door ([C1. Callback Door](../callbacks/C1-callback-door.md)): an inbound transaction with a receipt was already answered, and the gateway retrying it is a duplicate ([D28. nhcx_delivery](D28-nhcx-delivery.md)).

**Never fails the caller.** A request that succeeded is not reported as failed because the log behind it could not be written; a failure is logged loudly instead.

Delete: never.

#### D31C. COLUMNS
| column | type | null/default | meaning (and allowed values) |
|---|---|---|---|
| id | BIGINT | primary key, identity | row id |
| at | TIMESTAMPTZ | NOT NULL, default now | when |
| user_id | VARCHAR(36) | null | the acting account ([D2. staff](D2-staff.md)); null for the exchange |
| action | VARCHAR(48) | NOT NULL | dotted action name, as above |
| entity_type | VARCHAR(32) | NOT NULL | `member`, `policy`, `subscription`, `case`, `payment`, `nhcx_txn`, `auth` |
| entity_id | VARCHAR(64) | null | the record's id, or the ledger id |
| detail | VARCHAR(500) | null | one line: the sender, correlation id, case and answer transaction |
| ip | VARCHAR(45) | null | the caller's address |

#### D31K. KEYS AND INDEXES
- Primary key `id`.
- Foreign key `user_id` references the account table (`ON DELETE SET NULL`).
- Indexes: `idx_audit_at` on `at`; `idx_audit_entity` on `(entity_type, entity_id, at)`; `idx_audit_user` on `(user_id, at)`.

#### D31U. USED BY
- APIs: [A1. Eligibility Answer](../apis/A1-eligibility-answer.md), [A2. Insurance Plan Answer](../apis/A2-insurance-plan-answer.md), [A16. ABHA Policy Link](../apis/A16-abha-policy-link.md)
- Callbacks: [C1. Callback Door](../callbacks/C1-callback-door.md), [C2. Coverage Eligibility Check](../callbacks/C2-coverage-eligibility-check.md), [C3. Insurance Plan Request](../callbacks/C3-insurance-plan-request.md)
- FHIR: [F2. CoverageEligibilityRequest](../fhir/F2-coverage-eligibility-request.md), [F3. CoverageEligibilityResponse](../fhir/F3-coverage-eligibility-response.md), [F4. Task (InsurancePlan request)](../fhir/F4-task-insuranceplan.md)
- Database: [D2. staff](D2-staff.md), [D28. nhcx_delivery](D28-nhcx-delivery.md)
- Tests: [T3. Eligibility Validation and Discovery Answered](../tests/T3-eligibility-answered.md), [T4. Auth-requirements Ruling Answered](../tests/T4-auth-requirements-ruled.md), [T5. Insurance Plan Served](../tests/T5-insurance-plan-served.md)
