# FHIR

Every FHIR resource the application builds for NHCX or reads from a hospital's message, in one list. Each row links to its full spec in [../fhir/](../fhir/INDEX.md). Sent profiles are the NRCeS profiles under `https://nrces.in/ndhm/fhir/r4/StructureDefinition/`; received resources are read without checking a profile.

## Envelope

| # | Resource | Direction | What it is | Used by |
|---|---|---|---|---|
| [F1](../fhir/F1-bundle.md) | Bundle | both | The envelope of every message: ids, profiles, entry order and absolute references; what this payer wraps its answers in and how it unwraps a hospital's bundle. | [A6](../apis/A6-payment-notice.md), [A7](../apis/A7-payment-enquiry-answer.md), [A12](../apis/A12-txn-fhir.md), [A15](../apis/A15-case-exchange.md), [C1](../callbacks/C1-callback-door.md), [C10](../callbacks/C10-payment-enquiry.md), [C11](../callbacks/C11-payment-acknowledgement.md) |

## Eligibility and plan

| # | Resource | Direction | What it is | Used by |
|---|---|---|---|---|
| [F4](../fhir/F4-task-insuranceplan.md) | Task (InsurancePlan request) | received | The hospital's plan request: a Task naming a policy number and the asking provider. | [C1](../callbacks/C1-callback-door.md) |
| [F5](../fhir/F5-insuranceplan.md) | InsurancePlan | sent | The package master this payer publishes: the product, its coverage clauses with benefits and limits, each covered procedure with its rate, documents per leg and its own forms, the policy forms, proof of identity when biometric is required, exclusions and sub-limits; or an empty plan. | none |
| [F6](../fhir/F6-questionnaire.md) | Questionnaire | sent | A form the plan ships, the policy's or a procedure's, in one shape: a title, a description and typed questions, published at /questionnaire/<owner>/<form id> and named Questionnaire. | none |

## Pre-authorisation and claim

| # | Resource | Direction | What it is | Used by |
|---|---|---|---|---|
| [F9](../fhir/F9-claimresponse.md) | ClaimResponse | sent | This payer's acknowledgement and verdict: outcome and claim-level adjudication from the decision, per-item adjudication from the line decisions, totals, the case number as preAuthRef, the remarks in the disposition. | [A15](../apis/A15-case-exchange.md) |
| [F10](../fhir/F10-task-claim-actions.md) | Task (claim actions and answers) | both | Received: cancel, reprocess, release, status and payment acknowledgement Tasks. Sent: the completed Task answering them, with the ClaimResponse or the status on its output. | [A6](../apis/A6-payment-notice.md), [A7](../apis/A7-payment-enquiry-answer.md), [A12](../apis/A12-txn-fhir.md), [C1](../callbacks/C1-callback-door.md), [C11](../callbacks/C11-payment-acknowledgement.md) |

## Queries and payment

| # | Resource | Direction | What it is | Used by |
|---|---|---|---|---|
| [F13](../fhir/F13-paymentnotice.md) | PaymentNotice | both | Sent: this payer's notice that money moved, with the amount, the status and the claim number, wrapped in a Task and paired with the reconciliation. Received: a hospital asking where the money is. | [A6](../apis/A6-payment-notice.md), [A7](../apis/A7-payment-enquiry-answer.md), [C1](../callbacks/C1-callback-door.md), [C10](../callbacks/C10-payment-enquiry.md) |
| [F14](../fhir/F14-paymentreconciliation.md) | PaymentReconciliation | sent | The breakdown beside a notice or answering an enquiry: each completed payment as a Payment line and a TDS line with amount and date, the last UTR as the payment identifier; an error reconciliation with an OperationOutcome when the claim is unknown. | [A6](../apis/A6-payment-notice.md), [A7](../apis/A7-payment-enquiry-answer.md), [A15](../apis/A15-case-exchange.md), [C10](../callbacks/C10-payment-enquiry.md) |

## Parties and supporting resources

| # | Resource | Direction | What it is | Used by |
|---|---|---|---|---|
| [F15](../fhir/F15-patient.md) | Patient | both | Read from a hospital's bundle for the handles; written into answers as this payer's member. | none |
| [F16](../fhir/F16-practitioner.md) | Practitioner | received | The treating team as declared, kept on the case by HPR id. | none |
| [F17](../fhir/F17-organization.md) | Organization | both | Sent: this payer as the insurer Organization (IRDAI registration, ROHINI id, participant code) and the hospital named back by its HFR id. Received: the hospital's own Organization, read for its HFR id and name. | [A6](../apis/A6-payment-notice.md), [A7](../apis/A7-payment-enquiry-answer.md), [C10](../callbacks/C10-payment-enquiry.md) |
| [F18](../fhir/F18-coverage.md) | Coverage | both | Sent: the enrolment as Coverage with the product, member id, period and class. Received: the policy the hospital quotes. | none |
