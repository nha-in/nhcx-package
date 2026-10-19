# Database

The tables behind the claim, patient and practitioner screens. Screens (S), APIs (A) and callbacks (C) refer to these by D number. Each file has TABLE (T), DESCRIPTION (D), COLUMNS (C), KEYS AND INDEXES (K) and USED BY (U) sections.

## Master and clinical data

| # | Table | What one row is | File |
|---|---|---|---|
| [D1](D1-organization.md) | organization | The healthcare facility this installation represents. | [D1-organization.md](D1-organization.md) |
| [D2](D2-practitioner.md) | practitioner | Doctor or staff member of the facility. | [D2-practitioner.md](D2-practitioner.md) |
| [D3](D3-patient.md) | patient | Registered patient. | [D3-patient.md](D3-patient.md) |
| [D8](D8-terminology.md) | terminology | Concept in one code list (a picker), for example one ICD-10 diagnosis with its SNOMED mapping, one department or one payer adapter mapping. | [D8-terminology.md](D8-terminology.md) |
| [D32](D32-participant.md) | participant | The participant master: every payer and TPA on the exchange, government and private, pulled from the registry's participant list over a configured window (one year by default, ten in the sandbox) and refreshed daily. Primary key `code`. No parent table. | [D32-participant.md](D32-participant.md) |

## Claim

| # | Table | What one row is | File |
|---|---|---|---|
| [D9](D9-claim.md) | claim | Claim episode (case) around one selected policy, from eligibility to payment. | [D9-claim.md](D9-claim.md) |

## Package master and ruling

| # | Table | What one row is | File |
|---|---|---|---|
| [D11](D11-claim-plan-benefit.md) | claim_plan_benefit | Package (or covered benefit) in a claim's package master. | [D11-claim-plan-benefit.md](D11-claim-plan-benefit.md) |
| [D12](D12-claim-plan-form.md) | claim_plan_form | Payer questionnaire (dynamic form) shipped with a claim's package master. | [D12-claim-plan-form.md](D12-claim-plan-form.md) |
| [D13](D13-claim-auth.md) | claim_auth | The payer's authorisation-requirements ruling on a claim's procedure set. | [D13-claim-auth.md](D13-claim-auth.md) |
| [D15](D15-claim-auth-requirement.md) | claim_auth_requirement | Document or form the payer's ruling says the procedure set must be accompanied by. | [D15-claim-auth-requirement.md](D15-claim-auth-requirement.md) |

## Pre-authorisation draft

| # | Table | What one row is | File |
|---|---|---|---|
| [D16](D16-claim-line.md) | claim_line | Line the pre-authorisation quotes from the payer's package master: a procedure, an implant or a ward / ICU stratification tier. Primary key `id`. Parent table: `claim` (D9). | [D16-claim-line.md](D16-claim-line.md) |
| [D17](D17-claim-form-answer.md) | claim_form_answer | The answer to one question of one payer form (questionnaire) on one claim. Primary key `id`. Parent table: `claim` (D9); the form itself is a `claim_plan_form` row (D12) matched by `form_url`, not by a foreign key. | [D17-claim-form-answer.md](D17-claim-form-answer.md) |

## Legs and verdicts

| # | Table | What one row is | File |
|---|---|---|---|
| [D18](D18-claim-preauth.md) | claim_preauth | The pre-authorisation leg of one claim: the last send (first request, query answer, enhancement), the payer's verdict on it and any cancellation. Primary key `id`. Parent table: `claim` (D9), one row per claim. | [D18-claim-preauth.md](D18-claim-preauth.md) |
| [D20](D20-claim-submission.md) | claim_submission | The claim leg of one claim episode: how the stay ended, the last claim send and the payer's verdict on it. Primary key `id`. Parent table: `claim` (D9), one row per claim. | [D20-claim-submission.md](D20-claim-submission.md) |

## Payer messages and payments

| # | Table | What one row is | File |
|---|---|---|---|
| [D21](D21-claim-payment.md) | claim_payment | Payment the payer notified on a claim (a PaymentNotice), with the acknowledgement sent back for it. Primary key `id`. Parent table: `claim` (D9), many rows per claim; children in `claim_payment_detail` (D22). | [D21-claim-payment.md](D21-claim-payment.md) |
| [D23](D23-claim-query.md) | claim_query | Message the payer started on a claim over the communication route: a query for the desk to answer, a notification to acknowledge, or a note to read. Primary key `id`. Parent table: `claim` (D9), many rows per claim. | [D23-claim-query.md](D23-claim-query.md) |

## Draft details, documents and enquiries

| # | Table | What one row is | File |
|---|---|---|---|
| [D28](D28-claim-document.md) | claim_document | Supporting document attached to a claim for one leg: an uploaded PDF or image, or a health record the HMIS already holds, sent as its FHIR bundle (structured data), stored inline with the payer requirement it answers. Primary key `id`. Parent table: `claim` (D9). | [D28-claim-document.md](D28-claim-document.md) |
| [D29](D29-claim-enquiry.md) | claim_enquiry | Small Task exchange a claim starts beside its main legs: a status enquiry, a reprocess request or a balance release request. Primary key `id`. Parent table: `claim` (D9), many rows per claim. | [D29-claim-enquiry.md](D29-claim-enquiry.md) |

## Numbering

| # | Table | What one row is | File |
|---|---|---|---|
| [D30](D30-counter.md) | counter | Named number series and the last value handed out from it. Primary key `name`. No parent table. | [D30-counter.md](D30-counter.md) |
