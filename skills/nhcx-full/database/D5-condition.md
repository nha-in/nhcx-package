# D5. condition

#### D5T. TABLE
One row is one chief complaint, diagnosis or medical-history problem of a patient; primary key `id`; parent tables [D3. patient](D3-patient.md) and [D4. encounter](D4-encounter.md) (optional).

#### D5D. DESCRIPTION
The claim reads this table only to pre-fill the pre-authorisation's diagnoses. When an admission is linked and the pre-authorisation details have never been saved, the admission's rows with `category = 'diagnosis'` and `clinical_status != 'resolved'` (ordered by `id`) that carry an `icd10_code` are offered on the form, with the terminology's SNOMED CT mapping or the row's own SNOMED code; a row with no `icd10_code` is not offered. The desk may change them; only what is saved goes to [D25. claim_diagnosis](D25-claim-diagnosis.md). The pre-authorisation owns its diagnoses, so an admission linked later never replaces them.

Lifecycle:
- `chief-complaint` and `diagnosis` rows are written by the OPD and IPD clinical record forms. Each save deletes that encounter's rows of that category and inserts the submitted rows again (replace, not update). A complaint is written with `clinical_status = 'active'`. A diagnosis takes the status chosen on the form (`active`, `recurrence`, `remission`, `resolved`), default `active`. Both get `verification_status = 'confirmed'` and `recorded_at` = now. A coded diagnosis copies ICD-10 from the terminology row's `code` / `display` and SNOMED CT from its `alt_code` / `alt_display`.
- `medical-history` rows are added from the patient chart (S15 "Add a problem"), attached to an encounter or chart-level (`encounter_id` null), with `clinical_status` one of `active`, `recurrence`, `remission`, `resolved`, `inactive`. A problem needs a coded diagnosis or a description.
- Deleted from the chart only when chart-level: `DELETE ... WHERE id = ? AND patient_id = ? AND encounter_id IS NULL`. Encounter rows go only by the replace-on-save above or by the "clear transactional data" reset.

#### D5C. COLUMNS
| column | type | null/default | meaning (and allowed values) |
|---|---|---|---|
| id | INTEGER | primary key | row id |
| patient_id | INTEGER | NOT NULL | the patient ([D3](D3-patient.md)) |
| encounter_id | INTEGER | null | the visit or admission ([D4](D4-encounter.md)); null for a chart-level problem |
| category | TEXT | NOT NULL | `chief-complaint`, `diagnosis`, `medical-history` |
| clinical_status | TEXT | NOT NULL, default `'active'` | `active`, `recurrence`, `remission`, `resolved`, `inactive` (the last only from the chart) |
| verification_status | TEXT | NOT NULL, default `'confirmed'` | always `confirmed` as written |
| snomed_code | TEXT | null | Condition.code SNOMED CT coding, mapped from the ICD-10 term |
| snomed_display | TEXT | null | its display |
| icd10_code | TEXT | null | Condition.code ICD-10 coding; the code the desk picks and the payer reads |
| icd10_display | TEXT | null | its display |
| text | TEXT | NOT NULL | the label shown: coded display, or the typed text |
| onset | TEXT | null | onset date or text |
| severity_code | TEXT | null | severity; no screen writes it |
| severity_display | TEXT | null | its display |
| note | TEXT | null | clinical note (for a diagnosis, the typed text) |
| recorded_at | TEXT | NOT NULL | ISO timestamp written |

#### D5K. KEYS AND INDEXES
- Primary key `id` (integer).
- `patient_id` references [D3. patient](D3-patient.md) `id`.
- `encounter_id` references [D4. encounter](D4-encounter.md) `id`.
- No unique constraints.
- Index: `ix_condition_enc (encounter_id, category)`.

#### D5U. USED BY
- Screens: [S4. Pre-authorisation Details and Admission Link](../screens/S4-claim-creation-form.md), [S15. Patient Detail](../screens/S15-patient-detail.md)
- Database: [D3. patient](D3-patient.md), [D4. encounter](D4-encounter.md), [D25. claim_diagnosis](D25-claim-diagnosis.md)
