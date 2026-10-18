# FHIR

Every FHIR resource the application builds for NHCX or reads from a hospital's message, in one list. Each row links to its full spec in [../fhir/](../fhir/INDEX.md). Sent profiles are the NRCeS profiles under `https://nrces.in/ndhm/fhir/r4/StructureDefinition/`; received resources are read without checking a profile.

## Envelope

| # | Resource | Direction | What it is | Used by |
|---|---|---|---|---|
| [F1](../fhir/F1-bundle.md) | Bundle | both | The envelope of every message: ids, profiles, entry order and absolute references; what this payer wraps its answers in and how it unwraps a hospital's bundle. | [A5](../apis/A5-query-request.md), [A12](../apis/A12-txn-fhir.md), [A15](../apis/A15-case-exchange.md), [C1](../callbacks/C1-callback-door.md), [C9](../callbacks/C9-communication.md) |

## Pre-authorisation and claim

| # | Resource | Direction | What it is | Used by |
|---|---|---|---|---|
| [F9](../fhir/F9-claimresponse.md) | ClaimResponse | sent | This payer's acknowledgement and verdict: outcome and claim-level adjudication from the decision, per-item adjudication from the line decisions, totals, the case number as preAuthRef, the remarks in the disposition. | [A13](../apis/A13-adjudicate.md), [A15](../apis/A15-case-exchange.md) |

## Queries and payment

| # | Resource | Direction | What it is | Used by |
|---|---|---|---|---|
| [F11](../fhir/F11-communicationrequest.md) | CommunicationRequest | sent | This payer's query: one payload per thing wanted, about the Claim, addressed to the hospital, wrapped in a Task coded poll, on a fresh thread. | [A5](../apis/A5-query-request.md), [A13](../apis/A13-adjudicate.md), [A15](../apis/A15-case-exchange.md) |
| [F12](../fhir/F12-communication.md) | Communication | received | The hospital's reply: texts, attachments with their document codes, and the references it hangs on. | [C1](../callbacks/C1-callback-door.md), [C9](../callbacks/C9-communication.md) |

## Parties and supporting resources

| # | Resource | Direction | What it is | Used by |
|---|---|---|---|---|
| [F15](../fhir/F15-patient.md) | Patient | both | Read from a hospital's bundle for the handles; written into answers as this payer's member. | [A5](../apis/A5-query-request.md) |
| [F16](../fhir/F16-practitioner.md) | Practitioner | received | The treating team as declared, kept on the case by HPR id. | none |
| [F17](../fhir/F17-organization.md) | Organization | both | Sent: this payer as the insurer Organization (IRDAI registration, ROHINI id, participant code) and the hospital named back by its HFR id. Received: the hospital's own Organization, read for its HFR id and name. | [A5](../apis/A5-query-request.md) |
| [F18](../fhir/F18-coverage.md) | Coverage | both | Sent: the enrolment as Coverage with the product, member id, period and class. Received: the policy the hospital quotes. | [A5](../apis/A5-query-request.md) |
