# Communication

The payer's asynchronous channel to the provider: a turnaround alert, a grievance, a policy or wallet change, or a request for documents. The provider acknowledges within thirty seconds, whether or not the issue is resolved.

## The request

Sent on `/v1/communication/request`.

### The bundle

| # | Resource | Profile |
| :-- | :-- | :-- |
| 1 | `Task` | [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html) |
| 2 | `CommunicationRequest` | [CommunicationRequest](https://nrces.in/ndhm/fhir/r4/StructureDefinition-CommunicationRequest.html) |
| 3 | `Claim` | [Claim](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Claim.html) |
| 4 | `Patient` | [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html) |
| 5 | `Organization (ins)` | [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 6 | `Organization (prov)` | [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 7 | `Practitioner` | [Practitioner](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Practitioner.html) |
| 8 | `Coverage` | [Coverage](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Coverage.html) |

### Elements

#### 1. Task

NRCeS profile: [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html).

| Element | Example |
| :-- | :-- |
| `status` | `requested` |
| `intent` | `order` |
| `reasonCode.coding[]` | `additionalinfo` Additional Information Request in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-reason-code` |
| `code.coding[]` | `poll` in `http://terminology.hl7.org/CodeSystem/financialtaskcode` |
| `description` | `Share the pre-operative X-ray and the clinical notes.` |
| `authoredOn` | `2026-09-10T23:51:47+05:30` |
| `requester` | reference `urn:uuid:39cd4b51-bddd-5cc1-a65a-6fa4a2a83cb5`, display `Organization` |
| `owner` | reference `urn:uuid:84d112ec-041c-57f8-986c-6619ccd8245e`, display `Organization` |
| `input[].type.coding[]` | `include` in `http://terminology.hl7.org/CodeSystem/financialtaskinputtype` |
| `input[].valueReference` | reference `urn:uuid:4b35a6eb-3f99-5d0c-b0c8-5b2f049fdbde`, display `CommunicationRequest` |

#### 2. CommunicationRequest

NRCeS profile: [CommunicationRequest](https://nrces.in/ndhm/fhir/r4/StructureDefinition-CommunicationRequest.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | value `NM-26-0SE00002I` |
| `basedOn[]` | reference `urn:uuid:c1a17d6e-c718-58de-8d3d-fd4c0607d729`, display `Claim-preauth` |
| `status` | `active` |
| `category[].coding[]` | `alert` in `http://terminology.hl7.org/CodeSystem/communication-category` |
| `priority` | `routine` |
| `payload[]` | contentString `Share the pre-operative X-ray and the clinical notes.` |
| `authoredOn` | `2026-09-10T23:51:47+05:30` |
| `requester` | reference `urn:uuid:39cd4b51-bddd-5cc1-a65a-6fa4a2a83cb5`, display `Organization` |
| `recipient[]` | reference `urn:uuid:84d112ec-041c-57f8-986c-6619ccd8245e`, display `Organization` |
| `sender` | reference `urn:uuid:39cd4b51-bddd-5cc1-a65a-6fa4a2a83cb5`, display `Organization` |
| `reasonCode[]` | text `Share the pre-operative X-ray and the clinical notes.` |
| `reasonCode[].coding[]` | `additionalinfo` Additional Information Request in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-reason-code` |

The `Claim`, `Patient`, `Organization`, `Practitioner`, `Coverage` entries are shaped as in the chapters that introduce them.

## A notification

Sent on `/v1/communication/request`, workflow N02.

### The bundle

| # | Resource | Profile |
| :-- | :-- | :-- |
| 1 | `Task` | none declared; NRCeS [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html) |
| 2 | `CommunicationRequest` | none declared; NRCeS [CommunicationRequest](https://nrces.in/ndhm/fhir/r4/StructureDefinition-CommunicationRequest.html) |
| 3 | `Organization (pay)` | none declared; NRCeS [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 4 | `Organization (prov)` | none declared; NRCeS [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |

### Elements

#### 1. Task

NRCeS profile: [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html).

| Element | Example |
| :-- | :-- |
| `status` | `completed` |
| `intent` | `proposal` |
| `code.coding[]` | `poll` Poll in `http://terminology.hl7.org/CodeSystem/financialtaskcode` |
| `reasonCode.coding[]` | `information` Information in `http://terminology.hl7.org/CodeSystem/communication-category` |
| `input[].type.coding[]` | `include` Include in `http://terminology.hl7.org/CodeSystem/financialtaskinputtype` |
| `input[].valueReference` | reference `https://payer.pmajy.nha.gov.in/CommunicationRequest/1a857700-c6f3-49e1-b5d1-049…`, display `Communication` |

#### 2. CommunicationRequest

NRCeS profile: [CommunicationRequest](https://nrces.in/ndhm/fhir/r4/StructureDefinition-CommunicationRequest.html).

| Element | Example |
| :-- | :-- |
| `status` | `completed` |
| `category[].coding[]` | `notification` Notification in `http://terminology.hl7.org/CodeSystem/communication-category` |
| `payload[]` | contentString `Required Message for the provider` |
| `recipient[]` | reference `https://payer.nha.gov.in/v1/communication/request/organization/provider/1000003…` |
| `sender` | reference `https://payer.nha.gov.in/v1/communication/request/organization/payer/1518@hcx` |

The `Organization` entries are shaped as in the chapters that introduce them.

## The acknowledgement

Sent on `/v1/communication/on_request`.

### The bundle

| # | Resource | Profile |
| :-- | :-- | :-- |
| 1 | `Task` | [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html) |
| 2 | `Communication` | [Communication](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Communication.html) |
| 3 | `CommunicationRequest` | [CommunicationRequest](https://nrces.in/ndhm/fhir/r4/StructureDefinition-CommunicationRequest.html) |
| 4 | `Claim` | [Claim](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Claim.html) |
| 5 | `Patient` | [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html) |
| 6 | `Organization (prov)` | [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 7 | `Organization (pay)` | [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 8 | `Practitioner` | [Practitioner](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Practitioner.html) |
| 9 | `Coverage` | [Coverage](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Coverage.html) |

### Elements

#### 1. Task

NRCeS profile: [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html).

| Element | Example |
| :-- | :-- |
| `authoredOn` | `2026-03-08T11:01:00+05:30` |
| `code.coding[]` | `deliver` in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-task-codes` |
| `input[].type.coding[]` | `include` in `http://terminology.hl7.org/CodeSystem/financialtaskinputtype` |
| `input[].valueReference` | display `Communication`, reference `urn:uuid:7d9e2a64-3b1f-4f0c-8a5e-6c4b2d9f1e37` |
| `intent` | `order` |
| `owner` | display `Organization`, reference `https://nhcx.abdm.gov.in/payer` |
| `reasonCode.coding[]` | `additionalinfo` Additional information request in `https://nhcx.abdm.gov.in/communication-reason` |
| `requester` | display `Organization`, reference `https://nhcx.abdm.gov.in/provider` |
| `status` | `completed` |

#### 2. Communication

NRCeS profile: [Communication](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Communication.html).

| Element | Example |
| :-- | :-- |
| `about[]` | display `Claim VB26AA2600001`, reference `https://nhcx.abdm.gov.in/preauth/request` |
| `basedOn[]` | display `CommunicationRequest`, reference `urn:uuid:08f1bb6f-c3f5-4578-b5e8-c042764e2477` |
| `category[].coding[]` | `notification` in `http://terminology.hl7.org/CodeSystem/communication-category` |
| `identifier[]` | value `4524657454` |
| `payload[]` | contentString `The angiography report is attached.` |
| `payload[].contentAttachment` | contentType `application/pdf`, title `Angiography report` |
| `payload[].extension[]` | url `<participant-defined>`, valueString `DIA` |
| `priority` | `routine` |
| `recipient[]` | display `Organization`, reference `https://nhcx.abdm.gov.in/payer` |
| `sender` | display `Organization`, reference `https://nhcx.abdm.gov.in/provider` |
| `status` | `completed` |

The `CommunicationRequest`, `Claim`, `Patient`, `Organization`, `Practitioner`, `Coverage` entries are shaped as in the chapters that introduce them.

## Rules

### 1. The push pattern

`Task.code` `poll` with an input of type `include` referencing the resource being delivered, a `CommunicationRequest` from the payer. `intent` is `order` on a request and `proposal` on a notification. Resolve the reference and read its type.

### 2. Switch on the reason

`Task.reasonCode` from `ndhm-reason-code`: `tatquery`, `grievance`, `walletupdate`, `policychange`, `additionalinfo`, `claimArbitration`. Accept the misspelling `claimArbitartion` on receipt.

### 3. Notifications

A notification carries its reason under the communication-category system, such as `information`, and a `CommunicationRequest` with category `notification` and the message in `payload`.

### 4. Category, priority, topic

`category` `alert`, `reminder`, `notification`, `instruction` or `questionnaire`; `priority` `routine`, `urgent`, `asap` or `stat`; `topic` `progress-update` for anything about a live case.

### 5. completed is the event

`Task.status` and `Communication.status` read `completed` when the message is delivered. Do not close a case on them.

### 6. The acknowledgement

A `Task` coded `deliver`, `completed`, whose `include` input references a `Communication` with `basedOn` naming the request. Same correlation id. Take each organisation's role from `Organization.type`, not from the identifier type.

## PMJAY

The generic bundle above is what every payer takes, IRDAI-regulated insurers and TPAs included. PMJAY takes it with the changes and requirements below.

### What changes in the bundle

PMJAY sends this exchange in the generic shape.

### What PMJAY specifies

- PMJAY does not use this channel for queries. A PMJAY `CommunicationRequest` is a notification: a turnaround alert, a grievance, a wallet or policy change, or an arbitration intimation.

### What PMJAY requires

- Acknowledge within thirty seconds with the same Task bundle and `Task.status` `completed`, and leave the case's status alone.

## Use cases, APIs and data elements

### C6 Raise a communication (payer)

A message about a case, typed by its reason code: additionalinfo, tatquery for a turnaround breach, grievance, walletupdate, policychange, claimArbitration. A generic or IRDAI payer raises its document queries here, as a CommunicationRequest task bundle carrying 24, 241 or 27, and takes the answer as a Communication task bundle on on_request echoing the correlation id and workflow id. PMJAY does not use it for queries; its query is the ClaimResponse on the case's own thread.

| | |
| :-- | :-- |
| **API** | `/v1/communication/request` [`apis/07-communication/v1-communication-request.bru`](../../apis/07-communication/v1-communication-request.bru) |
| **Callback** | `/v1/communication/on_request` [`apis/07-communication/v1-communication-on-request.bru`](../../apis/07-communication/v1-communication-on-request.bru) |
| **Workflow** | 24, 241, 27 for a generic payer's queries; N02 and the intimation codes for the rest |
| **Carries JWE** | yes |
| **Focal resource** | `CommunicationRequest / Task` |

**Request headers**

| Header | Example value |
| :-- | :-- |
| `x-hcx-sender_code` | `1518@hcx` |
| `x-hcx-recipient_code` | `1000004446@hcx` |
| `x-hcx-api_call_id` | `{{$guid}}` |
| `x-hcx-request_id` | `{{$guid}}` |
| `x-hcx-correlation_id` | `{{$guid}}` |
| `x-hcx-workflow_id` | `24` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `request.initiated` |
| `x-hcx-ben-abha-id` | `91-7112-3456-7890` |

**Workflow codes**

| Code | Name | Authored by | `x-hcx-status` | Means |
| :-- | :-- | :-- | :-- | :-- |
| `24` | Preauth Request Queried | payer | `request.initiated` | Payer needs more information - respond using workflow 19 |
| `241` | Enhancement Request Queried | payer | `request.initiated` | Enhancement request queried by payer |
| `27` | Claim Request Queried | payer | `request.initiated`, `response.partial/complete` | Final claim queried - payer needs additional documents; under PMJAY answer with 161 |
| `N02` | Notifications Intended To Provider | status sheet only | `request.initiated` |  |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `taskReason` | Query Reason | Query | `code` | `1..1` | `Task.reasonCode.coding[0].code` | `additionalinfo` |  |
| `queryText` | Query Questions | Query | `string` | `1..1` | `CommunicationRequest.payload[0].contentString` | `Share the pre-operative X-ray and the clinical notes.` |  |

NRCeS profiles: [CommunicationRequest](https://nrces.in/ndhm/fhir/r4/StructureDefinition-CommunicationRequest.html), [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html).

### B4 Respond to a communication (provider)

Acknowledge or answer a message the payer sent about a case. A generic or IRDAI payer raises its query here, as a CommunicationRequest task bundle carrying 24, 241 or 27; the answer is a Communication task bundle on on_request that echoes the request's correlation id and workflow id. The payer's reason code says what kind of message it was.

| | |
| :-- | :-- |
| **API** | `/v1/communication/on_request` [`apis/07-communication/v1-communication-on-request.bru`](../../apis/07-communication/v1-communication-on-request.bru) |
| **Callback** | `/v1/communication/request` [`apis/07-communication/v1-communication-request.bru`](../../apis/07-communication/v1-communication-request.bru) |
| **Workflow** | 24, 241 or 27, echoed from the payer's request |
| **Carries JWE** | yes |
| **Focal resource** | `Communication / Task` |

**Request headers**

| Header | Example value |
| :-- | :-- |
| `x-hcx-sender_code` | `1000004446@hcx` |
| `x-hcx-recipient_code` | `1518@hcx` |
| `x-hcx-api_call_id` | `{{$guid}}` |
| `x-hcx-request_id` | `{{$guid}}` |
| `x-hcx-correlation_id` | `{{correlationId}}` |
| `x-hcx-workflow_id` | `24` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `response.complete` |
| `x-hcx-ben-abha-id` | `91-7112-3456-7890` |

**Workflow codes**

| Code | Name | Authored by | `x-hcx-status` | Means |
| :-- | :-- | :-- | :-- | :-- |
| `24` | Preauth Request Queried | payer | `request.initiated` | Payer needs more information - respond using workflow 19 |
| `241` | Enhancement Request Queried | payer | `request.initiated` | Enhancement request queried by payer |
| `27` | Claim Request Queried | payer | `request.initiated`, `response.partial/complete` | Final claim queried - payer needs additional documents; under PMJAY answer with 161 |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `communicationId` | Case Number the answer is filed under | Case | `string` | `1..1` | `Communication.identifier[0].value` | `NM-26-0SE00002I` |  |
| `queryRequestId` | Original Query Reference | Case | `reference` | `1..1` | `Communication.basedOn[0].reference` | `urn:uuid:4b35a6eb-3f99-5d0c-b0c8-5b2f049fdbde` |  |
| `replyText` | Clarification Text | Payload | `string` | `0..1` | `Communication.payload[0].contentString` | `X-ray and clinical notes attached as asked.` |  |
| `attachmentData` | Attached Document Base64 | Payload | `base64Binary` | `0..*` | `Communication.payload[].contentAttachment.data` | `JVBERi0xLjQK...` |  |

NRCeS profiles: [Communication](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Communication.html).
