# FHIR

Every FHIR resource the application builds for NHCX or reads from a hospital's message, in one list. Each row links to its full spec in [../fhir/](../fhir/INDEX.md). Sent profiles are the NRCeS profiles under `https://nrces.in/ndhm/fhir/r4/StructureDefinition/`; received resources are read without checking a profile.

## Envelope

| # | Resource | Direction | What it is | Used by |
|---|---|---|---|---|
| [F1](../fhir/F1-bundle.md) | Bundle | both | The envelope of every message: ids, profiles, entry order and absolute references; what this payer wraps its answers in and how it unwraps a hospital's bundle. | [A1](../apis/A1-eligibility-answer.md), [A2](../apis/A2-insurance-plan-answer.md), [A12](../apis/A12-txn-fhir.md), [A15](../apis/A15-case-exchange.md), [C1](../callbacks/C1-callback-door.md), [C2](../callbacks/C2-coverage-eligibility-check.md), [C3](../callbacks/C3-insurance-plan-request.md) |

## Eligibility and plan

| # | Resource | Direction | What it is | Used by |
|---|---|---|---|---|
| [F2](../fhir/F2-coverage-eligibility-request.md) | CoverageEligibilityRequest | received | A hospital's eligibility question: purposes, the handles it carries (member id, subscriber id, ABHA, mobile, name), the provider, and the items of an auth-requirements ask. | [A1](../apis/A1-eligibility-answer.md), [C1](../callbacks/C1-callback-door.md), [C2](../callbacks/C2-coverage-eligibility-check.md) |
| [F3](../fhir/F3-coverage-eligibility-response.md) | CoverageEligibilityResponse | sent | This payer's answer: in force with the wallet as benefit, lapsed with the reason, or no cover; per item for auth-requirements, the package rate and the documents and forms wanted at each stage, in the dialect the hospital reads. | [A1](../apis/A1-eligibility-answer.md), [C2](../callbacks/C2-coverage-eligibility-check.md) |
| [F4](../fhir/F4-task-insuranceplan.md) | Task (InsurancePlan request) | received | The hospital's plan request: a Task naming a policy number and the asking provider. | [A2](../apis/A2-insurance-plan-answer.md), [C1](../callbacks/C1-callback-door.md), [C3](../callbacks/C3-insurance-plan-request.md) |
| [F5](../fhir/F5-insuranceplan.md) | InsurancePlan | sent | The package master this payer publishes: the product, its coverage clauses with benefits and limits, each covered procedure with its rate, documents per leg and its own forms, the policy forms, proof of identity when biometric is required, exclusions and sub-limits; or an empty plan. | [A2](../apis/A2-insurance-plan-answer.md) |
| [F6](../fhir/F6-questionnaire.md) | Questionnaire | sent | A form the plan ships, the policy's or a procedure's, in one shape: a title, a description and typed questions, published at /questionnaire/<owner>/<form id> and named Questionnaire. | [A1](../apis/A1-eligibility-answer.md), [A2](../apis/A2-insurance-plan-answer.md) |

## Pre-authorisation and claim

| # | Resource | Direction | What it is | Used by |
|---|---|---|---|---|
| [F9](../fhir/F9-claimresponse.md) | ClaimResponse | sent | This payer's acknowledgement and verdict: outcome and claim-level adjudication from the decision, per-item adjudication from the line decisions, totals, the case number as preAuthRef, the remarks in the disposition. | [A15](../apis/A15-case-exchange.md) |
| [F10](../fhir/F10-task-claim-actions.md) | Task (claim actions and answers) | both | Received: cancel, reprocess, release, status and payment acknowledgement Tasks. Sent: the completed Task answering them, with the ClaimResponse or the status on its output. | [A12](../apis/A12-txn-fhir.md), [C1](../callbacks/C1-callback-door.md) |

## Parties and supporting resources

| # | Resource | Direction | What it is | Used by |
|---|---|---|---|---|
| [F15](../fhir/F15-patient.md) | Patient | both | Read from a hospital's bundle for the handles; written into answers as this payer's member. | [A1](../apis/A1-eligibility-answer.md), [C2](../callbacks/C2-coverage-eligibility-check.md) |
| [F16](../fhir/F16-practitioner.md) | Practitioner | received | The treating team as declared, kept on the case by HPR id. | none |
| [F17](../fhir/F17-organization.md) | Organization | both | Sent: this payer as the insurer Organization (IRDAI registration, ROHINI id, participant code) and the hospital named back by its HFR id. Received: the hospital's own Organization, read for its HFR id and name. | [A1](../apis/A1-eligibility-answer.md), [A2](../apis/A2-insurance-plan-answer.md), [C2](../callbacks/C2-coverage-eligibility-check.md), [C3](../callbacks/C3-insurance-plan-request.md) |
| [F18](../fhir/F18-coverage.md) | Coverage | both | Sent: the enrolment as Coverage with the product, member id, period and class. Received: the policy the hospital quotes. | [A1](../apis/A1-eligibility-answer.md), [C2](../callbacks/C2-coverage-eligibility-check.md) |
