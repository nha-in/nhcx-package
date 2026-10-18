# D31. audit_log

#### D31T. TABLE
One row is one line of the trail: who did what to which record, and every message answered on the exchange; primary key `id`, an identity column. No parent table. The reference implementation names it `payer_audit_log` [REF](../references/PAYERS.md#markers).

#### D31D. DESCRIPTION
Money and health information are both the kind of thing you want to answer "who changed this, and when" about. Every write against member, policy, enrolment, case and payment data, and every sign-in attempt, appends a row with the acting account and its address.

**The exchange's receipts.** Every answer this payer sends writes a row under `entity_type` `nhcx_txn` with the inbound ledger id as `entity_id` and the answer's ledger id in the detail: `eligibility.answered`, `eligibility.lapsed`, `eligibility.no_cover`, `eligibility.auth_requirements` (A1. Eligibility Answer (in nhcx-coverage/payer)); `insuranceplan.answered`, `insuranceplan.no_plan` (A2. Insurance Plan Answer (in nhcx-coverage/payer)); `preauth.received`, `preauth.enhanced`, `preauth.resubmitted` (C4. Pre-auth Submit (in nhcx-preauth/payer)); `claim.received`, `claim.resubmitted` (a claim sent again answering a line-item query) (C5. Claim Submit (in nhcx-claim/payer)); `predetermination.answered` (A10. Predetermination Quote (in nhcx-preauth/payer)); `status.answered` (A8. Status Answer (in nhcx-preauth/payer)); `task.<code>.answered` (A9. Task Answer (in nhcx-preauth/payer)); `paymentnotice.answered` (A7. Payment Enquiry Answer (in nhcx-payment/payer)); `communication.received` ([C9. Communication](../callbacks/C9-communication.md)). Verdicts and notices are written under `case` and `payment`: `preauth.answered`, `claim.answered`, `reprocess.answered` (A3. Pre-auth Answer (in nhcx-preauth/payer), A4. Claim Answer (in nhcx-claim/payer), A9. Task Answer (in nhcx-preauth/payer)), `case.query_sent` ([A5. Query Request](../apis/A5-query-request.md)), `preauth.queried` and `claim.queried` (a line-item query on the leg's thread, [A13. Adjudicate](../apis/A13-adjudicate.md)), `case.query_raised` (Raise Query, [A13. Adjudicate](../apis/A13-adjudicate.md)), `payment.noticed` (A6. Payment Notice (in nhcx-payment/payer)).

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
- APIs: [A5. Query Request](../apis/A5-query-request.md), [A13. Adjudicate](../apis/A13-adjudicate.md)
- Callbacks: [C1. Callback Door](../callbacks/C1-callback-door.md), [C9. Communication](../callbacks/C9-communication.md)
- Database: [D2. staff](D2-staff.md), [D28. nhcx_delivery](D28-nhcx-delivery.md)
- Tests: [T8. Pre-auth Queried and Answered](../tests/T8-preauth-queried.md)
