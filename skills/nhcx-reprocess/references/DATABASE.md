# Database

Every table behind the claim, patient and practitioner flows, in one list. Each row links to its full spec in [../database/](../database/INDEX.md), which gives the columns, keys and indexes. D1 to D8 are tables most HMIS already have (extended where NHCX needs a field); D9 to D32 are new for claims. D19 (predetermination) and D27 (custom line items) are retired: no screen writes them, and they are kept only so rows written earlier are still read.

## Master and clinical data

| # | Table | What one row is | Screens | APIs | Callbacks | FHIR |
|---|---|---|---|---|---|---|
| [D1](../database/D1-organization.md) | organization | The healthcare facility this installation represents. | [S19](../screens/S19-nhcx-settings.md) | [A12](../apis/A12-txn-fhir.md) | none | [F17](../fhir/F17-organization.md) |
| [D2](../database/D2-practitioner.md) | practitioner | Doctor or staff member of the facility. | none | none | none | [F16](../fhir/F16-practitioner.md) |
| [D3](../database/D3-patient.md) | patient | Registered patient. | none | none | none | [F15](../fhir/F15-patient.md) |
| [D8](../database/D8-terminology.md) | terminology | Concept in one code list (a picker), for example one ICD-10 diagnosis with its SNOMED mapping, one department or one payer adapter mapping. | none | none | none | none |
| [D32](../database/D32-participant.md) | participant | The participant master: every payer and TPA on the exchange, government and private, pulled from the registry's participant list over a configured window (one year by default, ten in the sandbox) and refreshed daily. Primary key `code`. No parent table. | [S19](../screens/S19-nhcx-settings.md) | none | none | none |

## Claim

| # | Table | What one row is | Screens | APIs | Callbacks | FHIR |
|---|---|---|---|---|---|---|
| [D9](../database/D9-claim.md) | claim | Claim episode (case) around one selected policy, from eligibility to payment. | [S5](../screens/S5-claim-master.md), [S6](../screens/S6-claim-detail.md), [S11](../screens/S11-claim-submission.md) | [A6](../apis/A6-task-submit.md), [A10](../apis/A10-txn-related.md), [A11](../apis/A11-txn-dispatch.md), [A13](../apis/A13-txn-list.md), [A17](../apis/A17-claim-state.md) | [C1](../callbacks/C1-callback-door.md), [C8](../callbacks/C8-enquiry-on-submit.md) | [F3](../fhir/F3-coverage-eligibility-response.md), [F10](../fhir/F10-task-claim-actions.md), [F15](../fhir/F15-patient.md), [F17](../fhir/F17-organization.md), [F18](../fhir/F18-coverage.md) |

## Package master and ruling

| # | Table | What one row is | Screens | APIs | Callbacks | FHIR |
|---|---|---|---|---|---|---|
| [D11](../database/D11-claim-plan-benefit.md) | claim_plan_benefit | Package (or covered benefit) in a claim's package master. | [S11](../screens/S11-claim-submission.md) | [A17](../apis/A17-claim-state.md) | none | [F3](../fhir/F3-coverage-eligibility-response.md) |
| [D12](../database/D12-claim-plan-form.md) | claim_plan_form | Payer questionnaire (dynamic form) shipped with a claim's package master. | [S11](../screens/S11-claim-submission.md) | [A17](../apis/A17-claim-state.md) | none | none |
| [D13](../database/D13-claim-auth.md) | claim_auth | The payer's authorisation-requirements ruling on a claim's procedure set. | [S6](../screens/S6-claim-detail.md), [S19](../screens/S19-nhcx-settings.md) | [A10](../apis/A10-txn-related.md), [A11](../apis/A11-txn-dispatch.md), [A13](../apis/A13-txn-list.md), [A17](../apis/A17-claim-state.md) | [C1](../callbacks/C1-callback-door.md) | [F3](../fhir/F3-coverage-eligibility-response.md) |
| [D15](../database/D15-claim-auth-requirement.md) | claim_auth_requirement | Document or form the payer's ruling says the procedure set must be accompanied by. | [S11](../screens/S11-claim-submission.md) | [A17](../apis/A17-claim-state.md) | none | [F3](../fhir/F3-coverage-eligibility-response.md) |

## Pre-authorisation draft

| # | Table | What one row is | Screens | APIs | Callbacks | FHIR |
|---|---|---|---|---|---|---|
| [D16](../database/D16-claim-line.md) | claim_line | Line the pre-authorisation quotes from the payer's package master: a procedure, an implant or a ward / ICU stratification tier. Primary key `id`. Parent table: `claim` (D9). | [S11](../screens/S11-claim-submission.md) | [A17](../apis/A17-claim-state.md) | none | none |
| [D17](../database/D17-claim-form-answer.md) | claim_form_answer | The answer to one question of one payer form (questionnaire) on one claim. Primary key `id`. Parent table: `claim` (D9); the form itself is a `claim_plan_form` row (D12) matched by `form_url`, not by a foreign key. | [S11](../screens/S11-claim-submission.md) | none | none | none |

## Legs and verdicts

| # | Table | What one row is | Screens | APIs | Callbacks | FHIR |
|---|---|---|---|---|---|---|
| [D18](../database/D18-claim-preauth.md) | claim_preauth | The pre-authorisation leg of one claim: the last send (first request, query answer, enhancement), the payer's verdict on it and any cancellation. Primary key `id`. Parent table: `claim` (D9), one row per claim. | [S5](../screens/S5-claim-master.md), [S6](../screens/S6-claim-detail.md) | [A6](../apis/A6-task-submit.md), [A10](../apis/A10-txn-related.md), [A11](../apis/A11-txn-dispatch.md), [A12](../apis/A12-txn-fhir.md), [A13](../apis/A13-txn-list.md), [A17](../apis/A17-claim-state.md) | [C1](../callbacks/C1-callback-door.md) | [F10](../fhir/F10-task-claim-actions.md) |
| [D20](../database/D20-claim-submission.md) | claim_submission | The claim leg of one claim episode: how the stay ended, the last claim send and the payer's verdict on it. Primary key `id`. Parent table: `claim` (D9), one row per claim. | [S5](../screens/S5-claim-master.md), [S6](../screens/S6-claim-detail.md), [S11](../screens/S11-claim-submission.md) | [A6](../apis/A6-task-submit.md), [A10](../apis/A10-txn-related.md), [A11](../apis/A11-txn-dispatch.md), [A12](../apis/A12-txn-fhir.md), [A13](../apis/A13-txn-list.md), [A17](../apis/A17-claim-state.md) | [C1](../callbacks/C1-callback-door.md), [C8](../callbacks/C8-enquiry-on-submit.md) | [F10](../fhir/F10-task-claim-actions.md) |

## Payer messages and payments

| # | Table | What one row is | Screens | APIs | Callbacks | FHIR |
|---|---|---|---|---|---|---|
| [D21](../database/D21-claim-payment.md) | claim_payment | Payment the payer notified on a claim (a PaymentNotice), with the acknowledgement sent back for it. Primary key `id`. Parent table: `claim` (D9), many rows per claim; children in `claim_payment_detail` (D22). | [S5](../screens/S5-claim-master.md), [S6](../screens/S6-claim-detail.md), [S11](../screens/S11-claim-submission.md) | [A17](../apis/A17-claim-state.md) | [C1](../callbacks/C1-callback-door.md) | none |
| [D23](../database/D23-claim-query.md) | claim_query | Message the payer started on a claim over the communication route: a query for the desk to answer, a notification to acknowledge, or a note to read. Primary key `id`. Parent table: `claim` (D9), many rows per claim. | [S5](../screens/S5-claim-master.md), [S6](../screens/S6-claim-detail.md), [S11](../screens/S11-claim-submission.md) | [A17](../apis/A17-claim-state.md) | [C1](../callbacks/C1-callback-door.md) | none |

## Draft details, documents and enquiries

| # | Table | What one row is | Screens | APIs | Callbacks | FHIR |
|---|---|---|---|---|---|---|
| [D28](../database/D28-claim-document.md) | claim_document | Supporting document attached to a claim for one leg: an uploaded PDF or image, or a health record the HMIS already holds, sent as its FHIR bundle (structured data), stored inline with the payer requirement it answers. Primary key `id`. Parent table: `claim` (D9). | [S11](../screens/S11-claim-submission.md) | [A17](../apis/A17-claim-state.md) | none | [F10](../fhir/F10-task-claim-actions.md) |
| [D29](../database/D29-claim-enquiry.md) | claim_enquiry | Small Task exchange a claim starts beside its main legs: a status enquiry, a reprocess request or a balance release request. Primary key `id`. Parent table: `claim` (D9), many rows per claim. | [S6](../screens/S6-claim-detail.md), [S11](../screens/S11-claim-submission.md) | [A6](../apis/A6-task-submit.md), [A10](../apis/A10-txn-related.md), [A11](../apis/A11-txn-dispatch.md), [A13](../apis/A13-txn-list.md), [A17](../apis/A17-claim-state.md) | [C1](../callbacks/C1-callback-door.md), [C8](../callbacks/C8-enquiry-on-submit.md) | [F10](../fhir/F10-task-claim-actions.md) |

## Numbering

| # | Table | What one row is | Screens | APIs | Callbacks | FHIR |
|---|---|---|---|---|---|---|
| [D30](../database/D30-counter.md) | counter | Named number series and the last value handed out from it. Primary key `name`. No parent table. | none | none | none | none |

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
