# Database

Every table behind the claim, patient and practitioner flows, in one list. Each row links to its full spec in [../database/](../database/INDEX.md), which gives the columns, keys and indexes. D1 to D8 are tables most HMIS already have (extended where NHCX needs a field); D9 to D32 are new for claims. D19 (predetermination) and D27 (custom line items) are retired: no screen writes them, and they are kept only so rows written earlier are still read.

## Master and clinical data

| # | Table | What one row is | Screens | APIs | Callbacks | FHIR |
|---|---|---|---|---|---|---|
| [D1](../database/D1-organization.md) | organization | The healthcare facility this installation represents. | [S1](../screens/S1-search-policy.md), [S19](../screens/S19-nhcx-settings.md) | [A12](../apis/A12-txn-fhir.md) | none | [F2](../fhir/F2-coverage-eligibility-request.md), [F17](../fhir/F17-organization.md), [F19](../fhir/F19-other-resources.md) |
| [D2](../database/D2-practitioner.md) | practitioner | Doctor or staff member of the facility. | none | none | none | [F16](../fhir/F16-practitioner.md) |
| [D3](../database/D3-patient.md) | patient | Registered patient. | [S13](../screens/S13-patient-list.md), [S14](../screens/S14-patient-registration-form.md), [S15](../screens/S15-patient-detail.md), [S18](../screens/S18-beneficiary-verification.md) | [A18](../apis/A18-biometric-authentication.md), [A19](../apis/A19-abha-m1.md) | none | [F15](../fhir/F15-patient.md) |
| [D4](../database/D4-encounter.md) | encounter | One OPD visit or IPD admission of a patient. | [S15](../screens/S15-patient-detail.md) | [A17](../apis/A17-claim-state.md) | none | none |
| [D5](../database/D5-condition.md) | condition | Chief complaint, diagnosis or medical-history problem of a patient. | [S15](../screens/S15-patient-detail.md) | none | none | none |
| [D6](../database/D6-observation.md) | observation | Measured or coded finding (a vital sign reading, a lab analyte, a wellness or dialysis reading). | [S15](../screens/S15-patient-detail.md) | none | none | none |
| [D7](../database/D7-allergy.md) | allergy | Allergy or intolerance of a patient. | [S15](../screens/S15-patient-detail.md) | none | none | none |
| [D8](../database/D8-terminology.md) | terminology | Concept in one code list (a picker), for example one ICD-10 diagnosis with its SNOMED mapping, one department or one payer adapter mapping. | [S15](../screens/S15-patient-detail.md) | none | none | none |
| [D32](../database/D32-participant.md) | participant | The participant master: every payer and TPA on the exchange, government and private, pulled from the registry's participant list over a configured window (one year by default, ten in the sandbox) and refreshed daily. Primary key `code`. No parent table. | [S2](../screens/S2-select-policy.md), [S17](../screens/S17-beneficiary-discovery.md), [S19](../screens/S19-nhcx-settings.md) | [A1](../apis/A1-policy-search.md) | none | none |

## Claim

| # | Table | What one row is | Screens | APIs | Callbacks | FHIR |
|---|---|---|---|---|---|---|
| [D9](../database/D9-claim.md) | claim | Claim episode (case) around one selected policy, from eligibility to payment. | [S2](../screens/S2-select-policy.md), [S3](../screens/S3-policy-discovery.md), [S5](../screens/S5-claim-master.md), [S6](../screens/S6-claim-detail.md), [S17](../screens/S17-beneficiary-discovery.md) | [A1](../apis/A1-policy-search.md), [A2](../apis/A2-coverage-eligibility-check.md), [A10](../apis/A10-txn-related.md), [A11](../apis/A11-txn-dispatch.md), [A13](../apis/A13-txn-list.md), [A17](../apis/A17-claim-state.md), [A18](../apis/A18-biometric-authentication.md) | [C1](../callbacks/C1-callback-door.md), [C2](../callbacks/C2-coverage-eligibility-on-check.md) | [F2](../fhir/F2-coverage-eligibility-request.md), [F3](../fhir/F3-coverage-eligibility-response.md), [F15](../fhir/F15-patient.md), [F17](../fhir/F17-organization.md), [F18](../fhir/F18-coverage.md), [F19](../fhir/F19-other-resources.md) |

## Package master and ruling

| # | Table | What one row is | Screens | APIs | Callbacks | FHIR |
|---|---|---|---|---|---|---|
| [D10](../database/D10-claim-plan.md) | claim_plan | The payer's package master (InsurancePlan) for one claim's policy and provider pair. | [S6](../screens/S6-claim-detail.md) | [A10](../apis/A10-txn-related.md), [A11](../apis/A11-txn-dispatch.md), [A13](../apis/A13-txn-list.md), [A17](../apis/A17-claim-state.md) | [C1](../callbacks/C1-callback-door.md) | none |
| [D11](../database/D11-claim-plan-benefit.md) | claim_plan_benefit | Package (or covered benefit) in a claim's package master. | none | [A17](../apis/A17-claim-state.md) | none | [F3](../fhir/F3-coverage-eligibility-response.md) |
| [D12](../database/D12-claim-plan-form.md) | claim_plan_form | Payer questionnaire (dynamic form) shipped with a claim's package master. | none | [A17](../apis/A17-claim-state.md) | none | [F7](../fhir/F7-questionnaireresponse.md) |
| [D13](../database/D13-claim-auth.md) | claim_auth | The payer's authorisation-requirements ruling on a claim's procedure set. | [S6](../screens/S6-claim-detail.md), [S19](../screens/S19-nhcx-settings.md) | [A2](../apis/A2-coverage-eligibility-check.md), [A10](../apis/A10-txn-related.md), [A11](../apis/A11-txn-dispatch.md), [A13](../apis/A13-txn-list.md), [A17](../apis/A17-claim-state.md) | [C1](../callbacks/C1-callback-door.md) | [F3](../fhir/F3-coverage-eligibility-response.md) |
| [D14](../database/D14-claim-auth-item.md) | claim_auth_item | The payer's ruling on one line of the procedure set. | none | [A2](../apis/A2-coverage-eligibility-check.md) | none | [F3](../fhir/F3-coverage-eligibility-response.md) |
| [D15](../database/D15-claim-auth-requirement.md) | claim_auth_requirement | Document or form the payer's ruling says the procedure set must be accompanied by. | none | [A2](../apis/A2-coverage-eligibility-check.md), [A17](../apis/A17-claim-state.md) | none | [F3](../fhir/F3-coverage-eligibility-response.md) |

## Draft details, documents and enquiries

| # | Table | What one row is | Screens | APIs | Callbacks | FHIR |
|---|---|---|---|---|---|---|
| [D28](../database/D28-claim-document.md) | claim_document | Supporting document attached to a claim for one leg: an uploaded PDF or image, or a health record the HMIS already holds, sent as its FHIR bundle (structured data), stored inline with the payer requirement it answers. Primary key `id`. Parent table: `claim` (D9). | none | [A1](../apis/A1-policy-search.md), [A17](../apis/A17-claim-state.md), [A18](../apis/A18-biometric-authentication.md), [A19](../apis/A19-abha-m1.md) | none | [F7](../fhir/F7-questionnaireresponse.md), [F19](../fhir/F19-other-resources.md) |
| [D31](../database/D31-biometric-auth.md) | biometric_auth | One biometric authentication of a beneficiary against their ABHA (fingerprint, iris or face), for one payer at one stage of the case, holding the user token that rides on the exchange and the refresh token that renews it. Primary key `id`. Parent tables: `patient` (D3), `claim` (D9, optional). | [S18](../screens/S18-beneficiary-verification.md) | [A18](../apis/A18-biometric-authentication.md) | none | none |

## Numbering

| # | Table | What one row is | Screens | APIs | Callbacks | FHIR |
|---|---|---|---|---|---|---|
| [D30](../database/D30-counter.md) | counter | Named number series and the last value handed out from it. Primary key `name`. No parent table. | [S2](../screens/S2-select-policy.md) | none | none | none |

## Column types on a typed ORM

The DnC tables give SQLite-style types (`TEXT`, `REAL`, `INTEGER`, `BLOB`). On a typed database or ORM map them once, the same way everywhere:

| DnC type | Becomes | Notes |
|---|---|---|
| `TEXT` holding an ISO instant the application writes (`created_at`, `submitted_at`, `settled_at`, `checked_at`, `requested_at`, `fetched_at`, `answered_at`, `received_at`, `acknowledged_at`, `*_at`) | an aware timestamp | stored in UTC, shown in the facility's zone |
| `TEXT` holding a **payer-supplied FHIR date** (D9 `plan_period_start`, `plan_period_end`, `patient_dob`; D20 `discharge_date`, `surgery_date`, `death_date`; D21 `payment_date`; D22 `date`) | **text, as received** | a FHIR date may be partial (`2026`, `2026-09`) or carry a time; parsing it to a date column loses or refuses values |
| `REAL` money | `DECIMAL(14, 2)` | never a float |
| `INTEGER` used as 0/1 (`inforce`, `auth_required`, `required`, `at_preauth`, `excluded`, `success`, `active`, D9 `provisional`) | boolean | |
| `TEXT` named `*_json`, and the JSON list or object columns (D9 `correlation_ids`, `dismissed_documents`; D10 `policy_documents`; D11 `conditions`, `extras`, `supporting_info`; D12 `items`; D23 `questions`, `reply_documents`; D29 `document_ids`; D32 `raw`) | a JSON column | indexed only where a DnK says so; a list column with a default starts as `[]` |
| `BLOB` (D28 `data`) | the database's binary type, or file storage with the path in the column | |
| `TEXT` status columns | text with the DnD values as named constants | not an enum type: payers add statuses |

Index and constraint names are given in the DnK sections; a database or ORM that limits name length (30 characters is a common limit) shortens them as D19 does.
