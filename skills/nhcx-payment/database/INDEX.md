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
| [D13](D13-claim-auth.md) | claim_auth | The payer's authorisation-requirements ruling on a claim's procedure set. | [D13-claim-auth.md](D13-claim-auth.md) |

## Legs and verdicts

| # | Table | What one row is | File |
|---|---|---|---|
| [D20](D20-claim-submission.md) | claim_submission | The claim leg of one claim episode: how the stay ended, the last claim send and the payer's verdict on it. Primary key `id`. Parent table: `claim` (D9), one row per claim. | [D20-claim-submission.md](D20-claim-submission.md) |

## Payer messages and payments

| # | Table | What one row is | File |
|---|---|---|---|
| [D21](D21-claim-payment.md) | claim_payment | Payment the payer notified on a claim (a PaymentNotice), with the acknowledgement sent back for it. Primary key `id`. Parent table: `claim` (D9), many rows per claim; children in `claim_payment_detail` (D22). | [D21-claim-payment.md](D21-claim-payment.md) |
| [D22](D22-claim-payment-detail.md) | claim_payment_detail | Line of a payment notice's reconciliation breakdown: an amount paid or withheld. Primary key `id`. Parent table: `claim_payment` (D21). | [D22-claim-payment-detail.md](D22-claim-payment-detail.md) |

## Numbering

| # | Table | What one row is | File |
|---|---|---|---|
| [D30](D30-counter.md) | counter | Named number series and the last value handed out from it. Primary key `name`. No parent table. | [D30-counter.md](D30-counter.md) |
