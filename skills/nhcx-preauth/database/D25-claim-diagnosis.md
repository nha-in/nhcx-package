# D25. claim_diagnosis

#### D25T. TABLE
One row is one diagnosis quoted on a claim's pre-authorisation draft, held in ICD-10 with its mapped SNOMED CT. Primary key `id`. Parent table: `claim` (D9).

#### D25D. DESCRIPTION
**Written.** Only by saving the pre-authorisation details (S4) on the Pre-authorisation tab. The pre-authorisation owns its diagnoses: it may be written before the patient is admitted, so no linked admission is needed, and nothing is taken from or fixed by one. The save runs in one transaction: every D25 and D26 row of the claim is deleted (and any retired D27 row), then the new sets are inserted with `seq` 1, 2, 3 in order. There is no single-row edit or delete. Once the claim is with the payer the save is refused before anything else is checked ([CORE.md](../references/CORE.md) Instruction 14): "The claim has gone to the payer, so the pre-authorisation is read only: no enhancement or change can be made. It can only be cancelled while the payer is deciding the claim."

Where the diagnoses come from: the ICD-10 diagnoses the desk picks on the form, each a `diagnosis` term (D8); a code that is not a term is skipped, and one picked twice is kept once. When an admission is linked and the form has never been saved, the form is pre-filled from the admission's unresolved conditions (D5, category `diagnosis`) that carry an ICD-10 code; the desk may change them, and only what is saved counts.

For a term: `icd10_code` and `icd10_display` are the term's code and display; `snomed_code` and `snomed_display` are its mapped SNOMED CT concept (the terminology's mapping, else the term's `alt_code`, `alt_display`), empty when there is none. The desk picks ICD-10 ([S4. Pre-authorisation Details and Admission Link](../screens/S4-claim-creation-form.md)); the SNOMED CT is mapped, never typed, and its absence never refuses a save. At least one diagnosis is required ("Pick at least one ICD-10 diagnosis - the payer needs it."). Each diagnosis is sent to the save as its ICD-10 code (taken as `provisional`) or as `{code, type}` with `type` `provisional` or `final`; any other type is refused "Mark each diagnosis provisional or final." and is stored as `dx_type`.

**Read.** Every pre-authorisation, enhancement and claim bundle requires at least one row ("Quote at least one ICD-10 diagnosis.") and sends each row as one Claim diagnosis in `seq` order, with the ICD-10 coding first and the SNOMED CT coding second when the row has one ([F8. Claim](../fhir/F8-claim.md)).

**Deleted.** On every draft save (replaced), by cascade with the claim, or when the transactional store is cleared. There is no status column.

#### D25C. COLUMNS
| Column | Type | Null / default | Meaning |
|---|---|---|---|
| id | INTEGER | primary key | Row id |
| claim_id | INTEGER | NOT NULL | The claim (D9) |
| seq | INTEGER | NOT NULL, default 1 | Order on the draft, from 1 |
| snomed_code | TEXT | null | SNOMED CT code mapped from the ICD-10 term (empty when the term has no mapping); sent as the second coding when set |
| snomed_display | TEXT | null | SNOMED CT display |
| icd10_code | TEXT | NOT NULL | ICD-10 code the desk picked; the payer adjudicates on it; sent as the first coding |
| icd10_display | TEXT | null | ICD-10 display |
| dx_type | TEXT | NOT NULL, default `provisional` | `provisional` or `final`, as the desk marks the row on [S4. Pre-authorisation Details and Admission Link](../screens/S4-claim-creation-form.md); sent as the diagnosis type ([F8. Claim](../fhir/F8-claim.md): SNOMED CT 148006 Preliminary diagnosis, or 89100005 Final diagnosis) |

#### D25K. KEYS AND INDEXES
- Primary key `id` (integer).
- Foreign key `claim_id` references `claim (id)` (D9), `ON DELETE CASCADE`.
- Index `ix_claim_dx` on `(claim_id, seq)`.
- The codes are not foreign keys; they are copied from `terminology` (D8).

#### D25U. USED BY
- Screens: [S4. Pre-authorisation Details and Admission Link](../screens/S4-claim-creation-form.md)
- APIs: [A4. Pre-auth Submit](../apis/A4-preauth-submit.md)
- FHIR: [F8. Claim](../fhir/F8-claim.md)
- Database: [D4. encounter](D4-encounter.md), [D5. condition](D5-condition.md), [D9. claim](D9-claim.md), [D18. claim_preauth](D18-claim-preauth.md), [D19. claim_predetermination](D19-claim-predetermination.md), [D26. claim_care_team](D26-claim-care-team.md)
