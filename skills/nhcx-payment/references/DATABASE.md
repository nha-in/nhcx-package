# Database

Every table behind the claim, patient and practitioner flows, in one list. Each row links to its full spec in [../database/](../database/INDEX.md), which gives the columns, keys and indexes. D1 to D8 are tables most HMIS already have (extended where NHCX needs a field); D9 to D32 are new for claims. D19 (predetermination) and D27 (custom line items) are retired: no screen writes them, and they are kept only so rows written earlier are still read.

## Master and clinical data

| # | Table | What one row is | Screens | APIs | Callbacks | FHIR |
|---|---|---|---|---|---|---|
| [D1](../database/D1-organization.md) | organization | The healthcare facility this installation represents. | [S19](../screens/S19-nhcx-settings.md) | [A12](../apis/A12-txn-fhir.md) | none | [F14](../fhir/F14-payment-acknowledgement.md), [F17](../fhir/F17-organization.md) |
| [D2](../database/D2-practitioner.md) | practitioner | Doctor or staff member of the facility. | none | none | none | [F16](../fhir/F16-practitioner.md) |
| [D3](../database/D3-patient.md) | patient | Registered patient. | none | none | none | [F15](../fhir/F15-patient.md) |
| [D8](../database/D8-terminology.md) | terminology | Concept in one code list (a picker), for example one ICD-10 diagnosis with its SNOMED mapping, one department or one payer adapter mapping. | none | none | none | none |
| [D32](../database/D32-participant.md) | participant | The participant master: every payer and TPA on the exchange, government and private, pulled from the registry's participant list over a configured window (one year by default, ten in the sandbox) and refreshed daily. Primary key `code`. No parent table. | [S19](../screens/S19-nhcx-settings.md) | none | none | none |

## Claim

| # | Table | What one row is | Screens | APIs | Callbacks | FHIR |
|---|---|---|---|---|---|---|
| [D9](../database/D9-claim.md) | claim | Claim episode (case) around one selected policy, from eligibility to payment. | [S5](../screens/S5-claim-master.md), [S6](../screens/S6-claim-detail.md), [S12](../screens/S12-payments.md) | [A10](../apis/A10-txn-related.md), [A11](../apis/A11-txn-dispatch.md), [A13](../apis/A13-txn-list.md), [A17](../apis/A17-claim-state.md) | [C1](../callbacks/C1-callback-door.md), [C10](../callbacks/C10-paymentnotice-request.md) | [F3](../fhir/F3-coverage-eligibility-response.md), [F13](../fhir/F13-paymentnotice.md), [F14](../fhir/F14-payment-acknowledgement.md), [F15](../fhir/F15-patient.md), [F17](../fhir/F17-organization.md), [F18](../fhir/F18-coverage.md) |

## Legs and verdicts

| # | Table | What one row is | Screens | APIs | Callbacks | FHIR |
|---|---|---|---|---|---|---|
| [D20](../database/D20-claim-submission.md) | claim_submission | The claim leg of one claim episode: how the stay ended, the last claim send and the payer's verdict on it. Primary key `id`. Parent table: `claim` (D9), one row per claim. | [S5](../screens/S5-claim-master.md), [S6](../screens/S6-claim-detail.md), [S12](../screens/S12-payments.md) | [A10](../apis/A10-txn-related.md), [A11](../apis/A11-txn-dispatch.md), [A12](../apis/A12-txn-fhir.md), [A13](../apis/A13-txn-list.md), [A17](../apis/A17-claim-state.md) | [C1](../callbacks/C1-callback-door.md), [C10](../callbacks/C10-paymentnotice-request.md) | [F13](../fhir/F13-paymentnotice.md) |

## Payer messages and payments

| # | Table | What one row is | Screens | APIs | Callbacks | FHIR |
|---|---|---|---|---|---|---|
| [D21](../database/D21-claim-payment.md) | claim_payment | Payment the payer notified on a claim (a PaymentNotice), with the acknowledgement sent back for it. Primary key `id`. Parent table: `claim` (D9), many rows per claim; children in `claim_payment_detail` (D22). | [S5](../screens/S5-claim-master.md), [S6](../screens/S6-claim-detail.md), [S12](../screens/S12-payments.md) | [A8](../apis/A8-paymentnotice-on-request.md), [A17](../apis/A17-claim-state.md) | [C1](../callbacks/C1-callback-door.md), [C10](../callbacks/C10-paymentnotice-request.md) | [F13](../fhir/F13-paymentnotice.md), [F14](../fhir/F14-payment-acknowledgement.md) |
| [D22](../database/D22-claim-payment-detail.md) | claim_payment_detail | Line of a payment notice's reconciliation breakdown: an amount paid or withheld. Primary key `id`. Parent table: `claim_payment` (D21). | [S12](../screens/S12-payments.md) | none | [C10](../callbacks/C10-paymentnotice-request.md) | [F13](../fhir/F13-paymentnotice.md) |

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
