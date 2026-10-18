# FHIR

Every FHIR resource the application builds for NHCX or reads back, in one list. Each row links to its full spec in [../fhir/](../fhir/INDEX.md). Sent profiles are the NRCeS profiles under `https://nrces.in/ndhm/fhir/r4/StructureDefinition/`; received resources are read without checking a profile.

## Envelope

| # | Resource | Direction | What it is | Used by |
|---|---|---|---|---|
| [F1](../fhir/F1-bundle.md) | Bundle | both | The envelope of every NHCX message: bundle id, profile, anchor entry first and a fixed entry order, absolute URLs under `https://nhcx.abdm.gov.in` as references. | [A6](../apis/A6-task-submit.md), [A12](../apis/A12-txn-fhir.md), [C1](../callbacks/C1-callback-door.md), [C8](../callbacks/C8-enquiry-on-submit.md) |

## Eligibility and plan

| # | Resource | Direction | What it is | Used by |
|---|---|---|---|---|
| [F3](../fhir/F3-coverage-eligibility-response.md) | CoverageEligibilityResponse | received | The payer's verdict (in force, wallet, pre-auth needed) or its ruling on each quoted item with the documents and forms required. | none |

## Pre-authorisation and claim

| # | Resource | Direction | What it is | Used by |
|---|---|---|---|---|
| [F10](../fhir/F10-task-claim-actions.md) | Task (claim actions) | sent and received | A follow-up on a case: cancel, status, reprocess or release, and the payer's Task answers to them. | [A6](../apis/A6-task-submit.md), [C8](../callbacks/C8-enquiry-on-submit.md) |

## Parties and supporting resources

| # | Resource | Direction | What it is | Used by |
|---|---|---|---|---|
| [F15](../fhir/F15-patient.md) | Patient | sent | The beneficiary: member id, ABHA and scheme identifiers, name, gender, birth date, phone from the linked patient, falling back to the policy. | [C8](../callbacks/C8-enquiry-on-submit.md) |
| [F16](../fhir/F16-practitioner.md) | Practitioner and PractitionerRole | sent | The care team doctors (HPR id, degree coding) on claim-side bundles, and the fixed PractitionerRole that enters an eligibility check. | none |
| [F17](../fhir/F17-organization.md) | Organization | sent and received | The provider (HFR id) and the payer (participant code). | [A6](../apis/A6-task-submit.md), [C8](../callbacks/C8-enquiry-on-submit.md) |
| [F18](../fhir/F18-coverage.md) | Coverage | sent | The policy: policy code and member id, `NONE` for a discovery, plus the payer's Coverage read back (plan name, period, relationship). | none |
