# FHIR

Every FHIR resource the application builds for NHCX or reads back, in one list. Each row links to its full spec in [../fhir/](../fhir/INDEX.md). Sent profiles are the NRCeS profiles under `https://nrces.in/ndhm/fhir/r4/StructureDefinition/`; received resources are read without checking a profile.

## Envelope

| # | Resource | Direction | What it is | Used by |
|---|---|---|---|---|
| [F1](../fhir/F1-bundle.md) | Bundle | both | The envelope of every NHCX message: bundle id, profile, anchor entry first and a fixed entry order, absolute URLs under `https://nhcx.abdm.gov.in` as references. | [A5](../apis/A5-claim-submit.md), [A6](../apis/A6-task-submit.md), [A12](../apis/A12-txn-fhir.md), [C1](../callbacks/C1-callback-door.md), [C6](../callbacks/C6-claim-on-submit.md), [C8](../callbacks/C8-enquiry-on-submit.md) |

## Eligibility and plan

| # | Resource | Direction | What it is | Used by |
|---|---|---|---|---|
| [F3](../fhir/F3-coverage-eligibility-response.md) | CoverageEligibilityResponse | received | The payer's verdict (in force, wallet, pre-auth needed) or its ruling on each quoted item with the documents and forms required. | none |
| [F7](../fhir/F7-questionnaireresponse.md) | QuestionnaireResponse | sent | One per payer form answered for the leg being sent, pointed at from the Claim's supportingInfo. | [A5](../apis/A5-claim-submit.md), [A18](../apis/A18-biometric-authentication.md) |

## Pre-authorisation and claim

| # | Resource | Direction | What it is | Used by |
|---|---|---|---|---|
| [F8](../fhir/F8-claim.md) | Claim | sent | One document for every leg: pre-auth, enhancement, claim and query answers (predetermination retired); items, diagnoses, care team, supportingInfo documents, total. | [A5](../apis/A5-claim-submit.md), [A17](../apis/A17-claim-state.md) |
| [F9](../fhir/F9-claimresponse.md) | ClaimResponse | received | The payer's verdict on a Claim: decision from the adjudication, not `outcome` alone; approved, eligible and submitted totals; per-item results; pre-auth reference. | [A17](../apis/A17-claim-state.md), [C6](../callbacks/C6-claim-on-submit.md), [C8](../callbacks/C8-enquiry-on-submit.md) |
| [F10](../fhir/F10-task-claim-actions.md) | Task (claim actions) | sent and received | A follow-up on a case: cancel, status, reprocess or release, and the payer's Task answers to them. | [A6](../apis/A6-task-submit.md), [C8](../callbacks/C8-enquiry-on-submit.md) |

## Parties and supporting resources

| # | Resource | Direction | What it is | Used by |
|---|---|---|---|---|
| [F15](../fhir/F15-patient.md) | Patient | sent | The beneficiary: member id, ABHA and scheme identifiers, name, gender, birth date, phone from the linked patient, falling back to the policy. | [A5](../apis/A5-claim-submit.md), [C6](../callbacks/C6-claim-on-submit.md), [C8](../callbacks/C8-enquiry-on-submit.md) |
| [F16](../fhir/F16-practitioner.md) | Practitioner and PractitionerRole | sent | The care team doctors (HPR id, degree coding) on claim-side bundles, and the fixed PractitionerRole that enters an eligibility check. | [A5](../apis/A5-claim-submit.md) |
| [F17](../fhir/F17-organization.md) | Organization | sent and received | The provider (HFR id) and the payer (participant code). | [A5](../apis/A5-claim-submit.md), [A6](../apis/A6-task-submit.md), [C6](../callbacks/C6-claim-on-submit.md), [C8](../callbacks/C8-enquiry-on-submit.md) |
| [F18](../fhir/F18-coverage.md) | Coverage | sent | The policy: policy code and member id, `NONE` for a discovery, plus the payer's Coverage read back (plan name, period, relationship). | [A5](../apis/A5-claim-submit.md), [C6](../callbacks/C6-claim-on-submit.md) |
| [F19](../fhir/F19-other-resources.md) | Other bundle resources | sent | Procedure (one per package, planned or completed), Location, and DocumentReference (one per health record sent as structured data), plus a table of which F file covers every other resource. | [A5](../apis/A5-claim-submit.md) |
