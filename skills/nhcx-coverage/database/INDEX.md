# Database

The tables behind the claim, patient and practitioner screens. Screens (S), APIs (A) and callbacks (C) refer to these by D number. Each file has TABLE (T), DESCRIPTION (D), COLUMNS (C), KEYS AND INDEXES (K) and USED BY (U) sections.

## Master and clinical data

| # | Table | What one row is | File |
|---|---|---|---|
| [D1](D1-organization.md) | organization | The healthcare facility this installation represents. | [D1-organization.md](D1-organization.md) |
| [D2](D2-practitioner.md) | practitioner | Doctor or staff member of the facility. | [D2-practitioner.md](D2-practitioner.md) |
| [D3](D3-patient.md) | patient | Registered patient. | [D3-patient.md](D3-patient.md) |
| [D4](D4-encounter.md) | encounter | One OPD visit or IPD admission of a patient. | [D4-encounter.md](D4-encounter.md) |
| [D5](D5-condition.md) | condition | Chief complaint, diagnosis or medical-history problem of a patient. | [D5-condition.md](D5-condition.md) |
| [D6](D6-observation.md) | observation | Measured or coded finding (a vital sign reading, a lab analyte, a wellness or dialysis reading). | [D6-observation.md](D6-observation.md) |
| [D7](D7-allergy.md) | allergy | Allergy or intolerance of a patient. | [D7-allergy.md](D7-allergy.md) |
| [D8](D8-terminology.md) | terminology | Concept in one code list (a picker), for example one ICD-10 diagnosis with its SNOMED mapping, one department or one payer adapter mapping. | [D8-terminology.md](D8-terminology.md) |
| [D32](D32-participant.md) | participant | The participant master: every payer and TPA on the exchange, government and private, pulled from the registry's participant list over a configured window (one year by default, ten in the sandbox) and refreshed daily. Primary key `code`. No parent table. | [D32-participant.md](D32-participant.md) |

## Claim

| # | Table | What one row is | File |
|---|---|---|---|
| [D9](D9-claim.md) | claim | Claim episode (case) around one selected policy, from eligibility to payment. | [D9-claim.md](D9-claim.md) |

## Package master and ruling

| # | Table | What one row is | File |
|---|---|---|---|
| [D10](D10-claim-plan.md) | claim_plan | The payer's package master (InsurancePlan) for one claim's policy and provider pair. | [D10-claim-plan.md](D10-claim-plan.md) |
| [D11](D11-claim-plan-benefit.md) | claim_plan_benefit | Package (or covered benefit) in a claim's package master. | [D11-claim-plan-benefit.md](D11-claim-plan-benefit.md) |
| [D12](D12-claim-plan-form.md) | claim_plan_form | Payer questionnaire (dynamic form) shipped with a claim's package master. | [D12-claim-plan-form.md](D12-claim-plan-form.md) |
| [D13](D13-claim-auth.md) | claim_auth | The payer's authorisation-requirements ruling on a claim's procedure set. | [D13-claim-auth.md](D13-claim-auth.md) |
| [D14](D14-claim-auth-item.md) | claim_auth_item | The payer's ruling on one line of the procedure set. | [D14-claim-auth-item.md](D14-claim-auth-item.md) |
| [D15](D15-claim-auth-requirement.md) | claim_auth_requirement | Document or form the payer's ruling says the procedure set must be accompanied by. | [D15-claim-auth-requirement.md](D15-claim-auth-requirement.md) |

## Draft details, documents and enquiries

| # | Table | What one row is | File |
|---|---|---|---|
| [D28](D28-claim-document.md) | claim_document | Supporting document attached to a claim for one leg: an uploaded PDF or image, or a health record the HMIS already holds, sent as its FHIR bundle (structured data), stored inline with the payer requirement it answers. Primary key `id`. Parent table: `claim` (D9). | [D28-claim-document.md](D28-claim-document.md) |
| [D31](D31-biometric-auth.md) | biometric_auth | One biometric authentication of a beneficiary against their ABHA (fingerprint, iris or face), for one payer at one stage of the case, holding the user token that rides on the exchange and the refresh token that renews it. Primary key `id`. Parent tables: `patient` (D3), `claim` (D9, optional). | [D31-biometric-auth.md](D31-biometric-auth.md) |

## Numbering

| # | Table | What one row is | File |
|---|---|---|---|
| [D30](D30-counter.md) | counter | Named number series and the last value handed out from it. Primary key `name`. No parent table. | [D30-counter.md](D30-counter.md) |
