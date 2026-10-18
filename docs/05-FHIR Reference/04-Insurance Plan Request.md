# Insurance plan request

One `Task` asking a payer for the plan behind a policy. There is no patient and no clinical content, because the plan belongs to the policy and the hospital, not to an admission. Sent once per policy and cached.

Sent on `/v1/insuranceplan/request`, answered on `/v1/insuranceplan/on_request`.

## The bundle

| # | Resource | Profile |
| :-- | :-- | :-- |
| 1 | `Task` | [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html) |

## Elements

### 1. Task

NRCeS profile: [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html).

| Element | Example |
| :-- | :-- |
| `status` | `requested` |
| `intent` | `order` |
| `code.coding[]` | `poll` in `http://terminology.hl7.org/CodeSystem/financialtaskcode` |
| `input[]` | valueString `POL7UMU001` |
|  | valueString `IN1910000151` |
| `input[].type.coding[]` | `policyNumber` in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-task-input-type-code` |
|  | `providerId` in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-task-input-type-code` |

## Rules

### 1. The Task code system

`poll` under `http://terminology.hl7.org/CodeSystem/financialtaskcode`, not the older `https://nhcx.abdm.gov.in/api`.

### 2. Intent

`order`. Some element tables say `original-order`; the bundle sends `order`.

### 3. Inputs

`valueString`, typed `policyNumber` and `providerId` under `ndhm-task-input-type-code`. Both are required, one of each: the policy number and the hospital's HFR ID (`facilityId` in the data elements below). Together they narrow the answer to the packages this hospital is empanelled for.

### 4. No case yet

No case exists, so the bundle carries no case number. The callback is the only link between request and answer.

### 5. Workflow id 1

Send `x-hcx-workflow_id` `1`. The plan belongs to the hospital and the policy, never to one case, and NHA publishes no workflow code for the request, so the case number is never sent there.

### 6. Fetched when the policy is in force

Fetch it whenever a validation leaves a case in force and no plan is held for that policy, HFR ID and payer. Reuse a ready plan of the same three before requesting another.

### 7. Task codes differ by system across the exchange

`poll`, `cancel`, `reprocess`, `release` and `status` in `financialtaskcode`; `deliver` in `ndhm-task-codes`; `approve` in `http://hl7.org/fhir/CodeSystem/task-code`. Switch on system and code together.

### 8. When to send it

Once per policy, not per patient. Refresh on a `policychange` communication and on your own schedule.

## PMJAY

The generic bundle above is what every payer takes, IRDAI-regulated insurers and TPAs included. PMJAY takes it with the changes and requirements below.

### What changes in the bundle

The PMJAY bundle has the same resources, elements and systems as the generic one.

### What PMJAY specifies

- `policyNumber` is the beneficiary's own policy code from the policy lookup, of the form `PMJAY/<state>/S/G`.
- `providerId` is the hospital's HFR ID, the same value as on its participant record.
- The live PMJAY provider's request differs from the rules above and is still answered: its `Task` carries no `code`, `intent` `plan`, a `requester` naming the provider `Organization` it adds as a second entry, and the bundle carries an unrelated case number as `Bundle.identifier`. Send the generic shape; expect this one.

### What PMJAY requires

- A policy the hospital is not empanelled under is refused with `PAYR-1401`.
- Refresh weekly per the FRD, or every fifteen days per the scenario sheet, and at once on renewal, amendment or a `policychange` communication.

## Use cases, APIs and data elements

### B2 Request insurance plan (provider)

A Task with code poll, keyed on policy number and provider id, under workflow id 1, never a case number. The answer is the policy as a benefit structure: packages, rates, documents, questionnaires. Fetch it once a validation leaves a case in force and no plan is held for that policy, HFR id and payer.

| | |
| :-- | :-- |
| **API** | `/v1/insuranceplan/request` [`apis/09-insurance-plan/v1-insuranceplan-request.bru`](../../apis/09-insurance-plan/v1-insuranceplan-request.bru) |
| **Callback** | `/v1/insuranceplan/on_request` [`apis/09-insurance-plan/v1-insuranceplan-on-request.bru`](../../apis/09-insurance-plan/v1-insuranceplan-on-request.bru) |
| **Workflow** | 1 (hospital-level: the plan belongs to the hospital and the policy, never a case number) |
| **Carries JWE** | yes |
| **Focal resource** | `Task` |

**Request headers**

| Header | Example value |
| :-- | :-- |
| `x-hcx-sender_code` | `1000004446@hcx` |
| `x-hcx-recipient_code` | `1518@hcx` |
| `x-hcx-api_call_id` | `{{$guid}}` |
| `x-hcx-request_id` | `{{$guid}}` |
| `x-hcx-correlation_id` | `{{$guid}}` |
| `x-hcx-workflow_id` | `1` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `request.initiated` |
| `x-hcx-ben-abha-id` | empty |

**Workflow codes**

| Code | Name | Authored by | `x-hcx-status` | Means |
| :-- | :-- | :-- | :-- | :-- |
| `1` | Insurance plan request and status enquiry | provider | `request.initiated`, `response.complete` | The insurance plan request and the status enquiry Task. The sheet names no code for either; both are sent under 1, never a correlation id, a UUID or a case number. The answer echoes 1. |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `taskCode` | Task Code | Task | `code` | `1..1` | `Task.code.coding[0].code` | `poll` |  |
| `policyNumber` | Policy Number | Task Input | `string` | `1..1` | `Task.input[type=policyNumber].valueString` | `POL7UMU001` |  |
| `facilityId` | Provider HFR ID | Task Input | `string` | `1..1` | `Task.input[type=providerId].valueString` | `IN1910000151` |  |

NRCeS profiles: [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html).

### D1 Fetch the insurance plan (pmjay)

Keyed on provider id, policy code and participant id. The answer is the scheme configuration for this hospital: specialities, packages, rates, Claim-Condition flags, mandatory documents and questionnaires. Over twenty megabytes; store it queryable, version it, refresh weekly and on any policychange communication.

| | |
| :-- | :-- |
| **API** | `/v1/insuranceplan/request` [`apis/09-insurance-plan/v1-insuranceplan-request.bru`](../../apis/09-insurance-plan/v1-insuranceplan-request.bru) |
| **Callback** | `/v1/insuranceplan/on_request` [`apis/09-insurance-plan/v1-insuranceplan-on-request.bru`](../../apis/09-insurance-plan/v1-insuranceplan-on-request.bru) |
| **Workflow** | 1 (hospital-level: the plan belongs to the hospital and the policy, never a case number) |
| **Carries JWE** | yes |
| **Focal resource** | `Task` |

**Request headers**

| Header | Example value |
| :-- | :-- |
| `x-hcx-sender_code` | `1000004446@hcx` |
| `x-hcx-recipient_code` | `1518@hcx` |
| `x-hcx-api_call_id` | `{{$guid}}` |
| `x-hcx-request_id` | `{{$guid}}` |
| `x-hcx-correlation_id` | `{{$guid}}` |
| `x-hcx-workflow_id` | `1` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `request.initiated` |
| `x-hcx-ben-abha-id` | empty |

**Workflow codes**

| Code | Name | Authored by | `x-hcx-status` | Means |
| :-- | :-- | :-- | :-- | :-- |
| `1` | Insurance plan request and status enquiry | provider | `request.initiated`, `response.complete` | The insurance plan request and the status enquiry Task. The sheet names no code for either; both are sent under 1, never a correlation id, a UUID or a case number. The answer echoes 1. |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `taskCode` | Task Code | Task | `code` | `1..1` | `Task.code.coding[0].code` | `poll` |  |
| `schemeId` | Scheme Policy Identifier | Task Input | `string` | `1..1` | `Task.input[type=policyNumber].valueString` | `PMJAY/HP/S/G` |  |
| `providerId` | Hospital HFR ID | Task Input | `string` | `1..1` | `Task.input[type=providerId].valueString` | `IN1910000151` |  |

NRCeS profiles: [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html).
