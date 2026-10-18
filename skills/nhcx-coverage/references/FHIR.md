# FHIR

Every FHIR resource the application builds for NHCX or reads back, in one list. Each row links to its full spec in [../fhir/](../fhir/INDEX.md). Sent profiles are the NRCeS profiles under `https://nrces.in/ndhm/fhir/r4/StructureDefinition/`; received resources are read without checking a profile.

## Envelope

| # | Resource | Direction | What it is | Used by |
|---|---|---|---|---|
| [F1](../fhir/F1-bundle.md) | Bundle | both | The envelope of every NHCX message: bundle id, profile, anchor entry first and a fixed entry order, absolute URLs under `https://nhcx.abdm.gov.in` as references. | [A2](../apis/A2-coverage-eligibility-check.md), [A12](../apis/A12-txn-fhir.md), [C1](../callbacks/C1-callback-door.md), [C2](../callbacks/C2-coverage-eligibility-on-check.md) |

## Eligibility and plan

| # | Resource | Direction | What it is | Used by |
|---|---|---|---|---|
| [F2](../fhir/F2-coverage-eligibility-request.md) | CoverageEligibilityRequest | sent | The eligibility check, in a seven-entry bundle; one shape for validation, benefits, discovery and auth-requirements (which adds the quoted items). | [A2](../apis/A2-coverage-eligibility-check.md), [C2](../callbacks/C2-coverage-eligibility-on-check.md) |
| [F3](../fhir/F3-coverage-eligibility-response.md) | CoverageEligibilityResponse | received | The payer's verdict (in force, wallet, pre-auth needed) or its ruling on each quoted item with the documents and forms required. | [C2](../callbacks/C2-coverage-eligibility-on-check.md) |
| [F7](../fhir/F7-questionnaireresponse.md) | QuestionnaireResponse | sent | One per payer form answered for the leg being sent, pointed at from the Claim's supportingInfo. | [A18](../apis/A18-biometric-authentication.md) |

## Parties and supporting resources

| # | Resource | Direction | What it is | Used by |
|---|---|---|---|---|
| [F15](../fhir/F15-patient.md) | Patient | sent | The beneficiary: member id, ABHA and scheme identifiers, name, gender, birth date, phone from the linked patient, falling back to the policy. | [A2](../apis/A2-coverage-eligibility-check.md), [C2](../callbacks/C2-coverage-eligibility-on-check.md) |
| [F16](../fhir/F16-practitioner.md) | Practitioner and PractitionerRole | sent | The care team doctors (HPR id, degree coding) on claim-side bundles, and the fixed PractitionerRole that enters an eligibility check. | [A2](../apis/A2-coverage-eligibility-check.md), [C2](../callbacks/C2-coverage-eligibility-on-check.md) |
| [F17](../fhir/F17-organization.md) | Organization | sent and received | The provider (HFR id) and the payer (participant code). | [A2](../apis/A2-coverage-eligibility-check.md), [C2](../callbacks/C2-coverage-eligibility-on-check.md) |
| [F18](../fhir/F18-coverage.md) | Coverage | sent | The policy: policy code and member id, `NONE` for a discovery, plus the payer's Coverage read back (plan name, period, relationship). | [A2](../apis/A2-coverage-eligibility-check.md), [C2](../callbacks/C2-coverage-eligibility-on-check.md) |
| [F19](../fhir/F19-other-resources.md) | Other bundle resources | sent | Procedure (one per package, planned or completed), Location, and DocumentReference (one per health record sent as structured data), plus a table of which F file covers every other resource. | [A2](../apis/A2-coverage-eligibility-check.md), [C2](../callbacks/C2-coverage-eligibility-on-check.md) |
