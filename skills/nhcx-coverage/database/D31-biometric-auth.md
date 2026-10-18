# D31. biometric_auth

#### D31T. TABLE
One row is one attempt to authenticate a patient against their ABHA through ABDM's biometric service ([A18. Biometric Authentication](../apis/A18-biometric-authentication.md)); primary key `id`; parent tables [D3. patient](D3-patient.md) (`patient_id`, nullable) and, when the attempt was made from a case, [D9. claim](D9-claim.md) (`claim_id`, nullable). A row has at least one of the two.

#### D31D. DESCRIPTION
The proof of presence PMJAY wants (and any payer whose plan asks for proof of identity `ADN`, [D10](D10-claim-plan.md)), kept where the sends can read it. **It works before admission**: a pre-authorisation may be authenticated before the patient is admitted or linked, so a row made from a case with no linked patient has `patient_id` null and belongs to the case alone, its ABHA the case's. When the admission is linked ([D9](D9-claim.md)), every such row of the case is given the patient in the same step, and from then on it is the patient's. The stage is the screen's: `Preauth` on the Pre-authorisation tab, `Discharge` on the Claim tab. A verified row holds the user token (thirty minutes) and the refresh token (fifteen days). The **current** authentication for a patient (or, while the case has no patient, for the case), a payer (numeric part of the code matched) and a stage is the newest verified row whose user token is still good, failing that the newest whose refresh token is; that is the row [A2. Coverage Eligibility Check](../apis/A2-coverage-eligibility-check.md), A4. Pre-auth Submit (in nhcx-preauth) and A5. Claim Submit (in nhcx-claim) carry, refreshing it first when the user token has lapsed. Rows are never deleted by a screen: the scheme checks each cycle's recorded start and end against the biometric timestamps on a cyclic case, so every attempt, its method and the moment it succeeded stay on record.

Lifecycle:
- Created `initiated` by A18 init, with the service's `txn_id` and message; `failed` with the reason when the service refused the init. Init needs a patient or a case ("Choose a patient.") and the payer ("Choose the payer the authentication is for."); the ABHA is the one given, else the case's, else the patient's.
- A face attempt moves to `captured` when `capture/pid` answers `COMPLETE`.
- `verified` by A18 verify: the tokens, their expiries, the ABHA matched and `verified_at`. `failed` when the service did not verify.
- A refresh replaces `user_token` and `token_expires_at`, and `refresh_token` and `refresh_expires_at` when a new refresh token came.
- `patient_id` filled from null when the case's admission is linked.
- Removed only by the "clear transactional data" reset and by the cascade from its patient.

Never on a screen or in an API answer: `user_token` and `refresh_token`. The API reports `token_valid` (verified, token present, `token_expires_at` in the future) and `refreshable` (verified, refresh token present, `refresh_expires_at` in the future) instead.

#### D31C. COLUMNS
| column | type | null/default | meaning (and allowed values) |
|---|---|---|---|
| id | INTEGER | primary key | row id |
| patient_id | INTEGER | null, FK patient | whose authentication, cascade on delete; null while the case it was made from has no linked patient (the row is then the case's), filled when the admission is linked. Made nullable by migration |
| claim_id | INTEGER | null, FK claim | the case it was made from; set null when the case goes |
| payer_code | TEXT | NOT NULL | the payer participant code the authentication is for (`payerid` on the calls) |
| stage | TEXT | NOT NULL | `Preauth` or `Discharge`: the scheme's process type, and which sends carry the token |
| method | TEXT | NOT NULL | `FINGERPRINT`, `IRIS` or `FACE_AUTH` |
| status | TEXT | NOT NULL, default `'initiated'` | `initiated`, `captured`, `verified`, `failed` |
| txn_id | TEXT | null | the service's transaction id from init |
| abha_number | TEXT | null | the ABHA authenticated, 14 digits; from the init request, replaced by the account the service matched |
| user_token | TEXT | null | the user token, thirty minutes; server only |
| token_expires_at | TIMESTAMP | null | when the user token lapses |
| refresh_token | TEXT | null | the refresh token, fifteen days from the call that issued it; server only |
| refresh_expires_at | TIMESTAMP | null | when the refresh token lapses |
| message | TEXT | null | the service's last message, or the refusal |
| requested_by | TEXT | null | the user who started it |
| verified_at | TIMESTAMP | null | when the service verified it |
| created_at | TIMESTAMP | NOT NULL | stamped on create |
| updated_at | TIMESTAMP | NOT NULL | stamped on every write |

#### D31K. KEYS AND INDEXES
- Primary key `id`.
- Foreign keys: `patient_id` to [D3. patient](D3-patient.md) (nullable, on delete cascade); `claim_id` to [D9. claim](D9-claim.md) (on delete set null).
- Index `ix_biometric_auth_current` on `(patient_id, payer_code, stage, created_at)`: the current-token lookup every send makes. While the case has no linked patient, the lookup is by `claim_id` instead, and so is the attempt a capture, verify or refresh names: with a patient linked the attempt must be that patient's, without one it must be the case's, else it is not found.

#### D31U. USED BY
- Screens: [S18. Beneficiary Verification](../screens/S18-beneficiary-verification.md)
- APIs: [A18. Biometric Authentication](../apis/A18-biometric-authentication.md)
- Database: [D9. claim](D9-claim.md), [D10. claim_plan](D10-claim-plan.md)
- Tests: [T19. PMJAY Beneficiary Verification and ABHA](../tests/T19-pmjay-biometric-and-abha.md)
