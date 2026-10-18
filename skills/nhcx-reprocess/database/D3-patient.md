# D3. patient

#### D3T. TABLE
One row is one registered patient; primary key `id`; parent table [D1. organization](D1-organization.md) (`managing_org_id`).

#### D3D. DESCRIPTION
The patient register. **The ABHA number is the patient key across the exchange**: a claim is linked to a patient through the admission (the claim's ABHA number is compared digits-only with `abha_number` here, and the patient of the chosen current IPD stay is written to [D9. claim](D9-claim.md) `patient_id`), and the health records a claim may attach ([D28. claim_document](D28-claim-document.md) "From records") are those of every patient holding the case's ABHA digits, whether or not a patient is linked. When the HMIS already has an ABDM (M1) module, its ABHA is the one read; it is reused without asking.

Once linked, the pre-authorisation and claim bundles take `name`, `gender`, `birth_date` and `phone` from this row, each falling back to what the case holds from the search and the payer (D9), and the ABHA number from the case, else from this row ([F15. Patient](../fhir/F15-patient.md)). The eligibility check reads nothing from this row: it sends identifiers only. Before a patient is linked (a pre-authorisation sent before admission) the bundles are built from the case alone.

`abha_number` and `abha_address` are written by hand on the form, or, better, by the ABHA service through A19. ABHA Create and Verify (ABDM M1) (in nhcx-coverage): a verified or newly created ABHA, with the name, gender, date of birth and mobile the service holds filling what the form left blank. The ABHA number is unique across patients, so a second registration under the same ABHA is refused ("Another patient is already registered with that ABHA number").

**When the HMIS has an ABDM module** that already holds the ABHA (its own ABHA model, or an identifier configuration under its own system URL), these two columns are not added: NHCX reads and writes the ABHA through that record, under that system, and the claim's admission match reads the same value ([SCAFFOLDING.md](../references/SCAFFOLDING.md), section 4a). One patient has one ABHA in the HMIS, visible to the module and to NHCX alike.

Lifecycle:
- Created from the registration form (S14). `name` and `phone` are mandatory ("Name and mobile number are mandatory."). On create the application allocates `mrn` from the `mrn` counter as `MRN` plus five digits (`MRN00001`) [REF](../references/PAYERS.md#markers), stamps `created_at` and `updated_at`, and sets `managing_org_id` to the facility row. `gender` falls back to `unknown`; `country` is always written as `India`.
- Updated from the same form: every form field is overwritten and `updated_at` is stamped. `mrn` and `managing_org_id` do not change.
- No screen deletes a patient or sets `deceased`. Rows are removed only by the "clear transactional data" reset, which deletes every patient row and the counters.

#### D3C. COLUMNS
| column | type | null/default | meaning (and allowed values) |
|---|---|---|---|
| id | INTEGER | primary key | row id |
| mrn | TEXT | NOT NULL, UNIQUE | medical record number, `MRN00001` style; Patient.identifier type MR |
| abha_number | TEXT | null | ABHA number as typed (with or without dashes); matched digits-only against the claim |
| abha_address | TEXT | null | ABHA address |
| name | TEXT | NOT NULL | full name; Patient.name.text |
| given_name | TEXT | null | given name |
| family_name | TEXT | null | family name |
| gender | TEXT | NOT NULL | `male`, `female`, `other`, `unknown` |
| birth_date | TEXT | null | `YYYY-MM-DD` |
| age_years | INTEGER | null | age, captured when the date of birth is unknown |
| phone | TEXT | NOT NULL | mobile number; Patient.telecom |
| email | TEXT | null | email |
| marital_status_code | TEXT | null | code from the `marital_status` terminology kind |
| marital_status_display | TEXT | null | its display |
| blood_group | TEXT | null | value from the `blood_group` terminology kind, for example `B+` |
| address_line | TEXT | null | street address |
| city | TEXT | null | city |
| district | TEXT | null | district; `districtCode` on the eligibility check |
| state | TEXT | null | state; `stateCode` on the eligibility check |
| postal_code | TEXT | null | PIN code |
| country | TEXT | NOT NULL, default `'India'` | country |
| contact_name | TEXT | null | emergency contact name |
| contact_relation | TEXT | null | emergency contact relationship |
| contact_phone | TEXT | null | emergency contact phone |
| managing_org_id | INTEGER | null | the facility row ([D1](D1-organization.md)) set at registration |
| deceased | INTEGER | NOT NULL, default `0` | `1` deceased, `0` not; no screen writes it |
| created_at | TEXT | NOT NULL | ISO timestamp of registration |
| updated_at | TEXT | NOT NULL | ISO timestamp of the last edit |

#### D3K. KEYS AND INDEXES
- Primary key `id` (integer).
- `managing_org_id` references [D1. organization](D1-organization.md) `id`.
- Referenced by D4. encounter (in nhcx-coverage), D5. condition (in nhcx-coverage), D6. observation (in nhcx-coverage), D7. allergy (in nhcx-coverage) (`patient_id`, NOT NULL) and [D9. claim](D9-claim.md) (`patient_id`, nullable), and by EMR tables outside this spec.
- Unique: `mrn`.
- Indexes: `ix_patient_name (name)`, `ix_patient_phone (phone)`.

#### D3U. USED BY
- FHIR: [F15. Patient](../fhir/F15-patient.md)
- Database: [D1. organization](D1-organization.md), [D9. claim](D9-claim.md), [D12. claim_plan_form](D12-claim-plan-form.md), [D30. counter](D30-counter.md)
