# Status and search

Two exchanges that are specified and seldom used. Confirm support with the payer before building either of them.

## Status

A sender asks what became of a request it made. There is no FHIR payload either way. The Status sheet of the requests-and-responses workbook says the request payload "should be empty string": no bundle, no `Task`, no resource. Everything the call needs travels in the protected header. `x-hcx-correlation_id` is the `x-hcx-api_call_id` of the request whose status is sought, `x-hcx-status` is `request.initiated`, `x-hcx-workflow_id` and `x-hcx-use_case` (`New`, `Enhancement` or `Resubmit`) are optional, and so is `x-hcx-ben-abha-id`. The status comes back on `/v1/on_status`, again in the protected header: `x-hcx-status` `request.dispatched`, the correlation id of the request, and `x-hcx-error_details` (`code`, `message`, `trace`) where it failed. The sheet gives the callback no payload section. The sandbox exit checklists word the request payload as the "encrypted payload of request for which the status is seeking for" and describe no bundle for it.

Sent on `/v1/status`, answered on `/v1/on_status`.

## Search

Sent on `/v1/search/submit`.

### The bundle

| # | Resource | Profile |
| :-- | :-- | :-- |
| 1 | `Task` | [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html) |
| 2 | `Organization` | none declared; NRCeS [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 3 | `Organization` | none declared; NRCeS [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |

### Elements

#### 1. Task

NRCeS profile: [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `https://nhcx.gov.in/task`, value `SR0000000001` |
| `status` | `requested` |
| `intent` | `order` |
| `code.coding[]` | `search` Search in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-task-codes` |
| `description` | `Search claim records for case CL0000000001` |
| `authoredOn` | `2026-02-26T12:00:00+05:30` |
| `requester` | reference `urn:uuid:e0000001-0000-0000-0000-000000000002` |
| `owner` | reference `urn:uuid:e0000001-0000-0000-0000-000000000003` |
| `input[]` | valueString `CL0000000001` |
| `input[].type.coding[]` | `ClaimNumber` Claim Number in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code` |

The `Organization` entries are shaped as in the chapters that introduce them.

## Search response

Sent on `/v1/search/on_submit`.

### The bundle

| # | Resource | Profile |
| :-- | :-- | :-- |
| 1 | `Task` | [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html) |
| 2 | `ClaimResponse` | none declared; NRCeS [ClaimResponse](https://nrces.in/ndhm/fhir/r4/StructureDefinition-ClaimResponse.html) |
| 3 | `Patient` | none declared; NRCeS [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html) |
| 4 | `Organization` | none declared; NRCeS [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |

### Elements

#### 1. Task

NRCeS profile: [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html).

| Element | Example |
| :-- | :-- |
| `status` | `completed` |
| `intent` | `order` |
| `code.coding[]` | `search` Search in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-task-codes` |
| `output[].type.coding[]` | `ClaimResponse` in `http://hl7.org/fhir/resource-types` |
| `output[].valueReference` | reference `urn:uuid:e0000001-0000-0000-0000-000000000011` |

#### 2. ClaimResponse

NRCeS profile: [ClaimResponse](https://nrces.in/ndhm/fhir/r4/StructureDefinition-ClaimResponse.html).

| Element | Example |
| :-- | :-- |
| `status` | `active` |
| `type.coding[]` | `institutional` |
| `use` | `claim` |
| `patient` | reference `Patient/1` |
| `insurer` | reference `Organization/2` |
| `outcome` | `complete` |

The `Patient`, `Organization` entries are shaped as in the chapters that introduce them.

## Rules

### 1. Status

No bundle and no `Task`. Send an empty payload with the correlation id set to the call id of the request you are asking about, and read the answer from the callback's protected header.

### 2. The status enquiry as a Task

The sandbox refuses `/v1/status` with `NHCX-1012`. Ask the payer instead: a `Task` coded `status` in `financialtaskcode` on `/v1/task/submit`, `status` `requested`, `intent` `order`, the input `claimNumber` alone, a fresh correlation id, `x-hcx-status` `request.initiated` and `x-hcx-workflow_id` `1` always, for the preauthorisation and the claim alike. No NHCX workflow code names a status check (the Task codes are 36, reprocess, and PC01, cancel), so the header never carries the leg's correlation id or a fresh UUID. The answer is a `Task` whose output includes a `ClaimResponse`.

### 3. Search

`Task.code` `search` in `ndhm-task-codes`, with inputs from the task input-type value set, such as `ClaimNumber`, `PolicyNumber`, `FromDate` and `ToDate`. The answer is a `Task`, `completed`, whose outputs reference the matching `ClaimResponse` resources in the same bundle, possibly across several callbacks on one correlation id.

### 4. Agree the codes

The task code for search is given more than one way in the specifications. Agree it with the payer in writing first.

## PMJAY

The generic bundle above is what every payer takes, IRDAI-regulated insurers and TPAs included. PMJAY takes it with the changes and requirements below.

### What changes in the bundle

PMJAY sends this exchange in the generic shape.

### What PMJAY requires

- A status enquiry as a `Task` is refused. Read where a case stands from the payer service's role lookup.

## Use cases, APIs and data elements

### A5 Get status (shared)

Where any request you made got to, by its correlation id. The sandbox's own status page answers without a token. The sandbox refuses /v1/status with NHCX-1012; to ask the payer where a case stands, send a Task coded status on /v1/task/submit under workflow id 1.

| | |
| :-- | :-- |
| **API** | `/v1/status` [`apis/08-status/v1-status.bru`](../../apis/08-status/v1-status.bru) |
| **Callback** | `/v1/on_status` [`apis/14-other/v1-on_status.bru`](../../apis/14-other/v1-on_status.bru) |
| **Carries JWE** | yes |
| **Focal resource** | `None; the payload is an empty string and the protected header carries the call` |
| **Simulator console** | `/status` |

**Request headers**

| Header | Example value |
| :-- | :-- |
| `x-hcx-sender_code` | `1000004446@hcx` |
| `x-hcx-recipient_code` | `1518@hcx` |
| `x-hcx-api_call_id` | `{{$guid}}` |
| `x-hcx-request_id` | `{{$guid}}` |
| `x-hcx-correlation_id` | `{{originalApiCallId}}` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `request.initiated` |
| `x-hcx-ben-abha-id` | `91-7112-3456-7890` |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `correlationId` | API call ID of the request being checked | Header | `uuid` | `1..1` | `Header.x-hcx-correlation_id` | `4f9d2b80-13b4-4e2a-9e12-8f9024a56789` |  |
| `status` | Dispatch Status | Callback Header | `string` | `1..1` | `Header.x-hcx-status` | `request.dispatched` |  |

### B6 Search claims (provider)

Look up claim information by criteria. The provider sandbox exit checklist names /v1/search/submit for claim search, while the Technical Specifications route /search/submit from NHA through NHCX to the payer: a cross-payer search for NHA or a regulator. A provider's search over its own cases is /claim/search in the protocol, which the access-control policy allows for requests that originated from the provider. No source confirms which of the two the sandbox accepts from a provider.

| | |
| :-- | :-- |
| **API** | `/v1/search/submit` [`apis/08-status/v1-search-submit.bru`](../../apis/08-status/v1-search-submit.bru) |
| **Callback** | `/v1/search/on_submit` [`apis/08-status/v1-search-on-submit.bru`](../../apis/08-status/v1-search-on-submit.bru) |
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
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `request.initiated` |
| `x-hcx-ben-abha-id` | `91-7112-3456-7890` |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `taskCode` | Task Code | Task | `code` | `1..1` | `Task.code.coding[0].code` | `search` |  |
| `claimNumber` | Search Claim Number | Task Input | `string` | `0..1` | `Task.input[type=ClaimNumber].valueString` | `CL0000000001` |  |
| `policyNumber` | Search Policy Number | Task Input | `string` | `0..1` | `Task.input[type=PolicyNumber].valueString` | `PMJAY/HP/S/G` |  |

NRCeS profiles: [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html).

### C8 Respond to search (payer)

The ClaimResponse objects matching the criteria asked for.

| | |
| :-- | :-- |
| **API** | `/v1/search/on_submit` [`apis/08-status/v1-search-on-submit.bru`](../../apis/08-status/v1-search-on-submit.bru) |
| **Callback** | `/v1/search/submit` [`apis/08-status/v1-search-submit.bru`](../../apis/08-status/v1-search-submit.bru) |
| **Carries JWE** | yes |
| **Focal resource** | `Task` |

**Request headers**

| Header | Example value |
| :-- | :-- |
| `x-hcx-sender_code` | `1518@hcx` |
| `x-hcx-recipient_code` | `1000004446@hcx` |
| `x-hcx-api_call_id` | `{{$guid}}` |
| `x-hcx-request_id` | `{{$guid}}` |
| `x-hcx-correlation_id` | `{{correlationId}}` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `response.complete` |
| `x-hcx-ben-abha-id` | `91-7112-3456-7890` |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `taskStatus` | Search Task Status | Task | `code` | `1..1` | `Task.status` | `completed` |  |
| `claimResponseRef` | Matching ClaimResponse | Task Output | `reference` | `0..*` | `Task.output[].valueReference.reference` | `urn:uuid:e0000001-0000-0000-0000-000000000011` |  |

NRCeS profiles: [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html).
