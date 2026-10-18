# FHIR

The FHIR resources the application builds for NHCX and reads back from it. APIs (A) and callbacks (C) refer to these by F number. Each file has RESOURCE (R), DESCRIPTION (D), FIELDS (F) and USED BY (U) sections.

## Envelope

| # | Resource | Direction | File |
|---|---|---|---|
| [F1](F1-bundle.md) | Bundle | both | [F1-bundle.md](F1-bundle.md) |

## Eligibility and plan

| # | Resource | Direction | File |
|---|---|---|---|
| [F3](F3-coverage-eligibility-response.md) | CoverageEligibilityResponse | received | [F3-coverage-eligibility-response.md](F3-coverage-eligibility-response.md) |

## Payer communication and payment

| # | Resource | Direction | File |
|---|---|---|---|
| [F13](F13-paymentnotice.md) | PaymentNotice | received | [F13-paymentnotice.md](F13-paymentnotice.md) |
| [F14](F14-payment-acknowledgement.md) | Payment acknowledgement | sent | [F14-payment-acknowledgement.md](F14-payment-acknowledgement.md) |

## Parties and supporting resources

| # | Resource | Direction | File |
|---|---|---|---|
| [F15](F15-patient.md) | Patient | sent | [F15-patient.md](F15-patient.md) |
| [F16](F16-practitioner.md) | Practitioner and PractitionerRole | sent | [F16-practitioner.md](F16-practitioner.md) |
| [F17](F17-organization.md) | Organization | sent and received | [F17-organization.md](F17-organization.md) |
| [F18](F18-coverage.md) | Coverage | sent | [F18-coverage.md](F18-coverage.md) |
