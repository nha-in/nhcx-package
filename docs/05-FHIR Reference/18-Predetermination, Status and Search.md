# Predetermination, status and search

Three exchanges that are specified and seldom used. Confirm support with the payer before building any of them.

## Predetermination request

Sent on `/v1/predetermination/submit`.

### The bundle

| # | Resource | Profile |
| :-- | :-- | :-- |
| 1 | `Claim` | [Claim](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Claim.html) |
| 2 | `Patient` | [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html) |
| 3 | `Organization (prov)` | [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 4 | `Organization (pay)` | [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 5 | `Coverage` | [Coverage](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Coverage.html) |
| 6 | `Practitioner` | [Practitioner](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Practitioner.html) |
| 7 | `Procedure` | [Procedure](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Procedure.html) |

### Elements

#### 1. Claim

NRCeS profile: [Claim](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Claim.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `https://nhcx.abdm.gov.in`, value `PD0000000001` |
| `identifier[].type.coding[]` | `CLN` Claim number in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code` |
| `status` | `active` |
| `type.coding[]` | `737481003` Inpatient care management (procedure) in `http://snomed.info/sct` |
| `use` | `predetermination` |
| `patient` | reference `https://nhcx.abdm.gov.in/patient` |
| `billablePeriod` | start `2026-02-22T10:00:00+05:30`, end `2026-02-27T11:00:00+05:30` |
| `created` | `2026-02-22T15:49:36+05:30` |
| `insurer` | reference `https://nhcx.abdm.gov.in/payer` |
| `provider` | reference `https://nhcx.abdm.gov.in/provider` |
| `priority.coding[]` | `normal` Normal in `http://terminology.hl7.org/CodeSystem/processpriority` |
| `careTeam[]` | sequence `1` |
| `careTeam[].provider` | reference `https://nhcx.abdm.gov.in/practitioner` |
| `careTeam[].role.coding[]` | `primary` Primary provider in `http://terminology.hl7.org/CodeSystem/claimcareteamrole` |
| `careTeam[].qualification.coding[]` | `394802001` General medicine in `http://snomed.info/sct` |
| `supportingInfo[]` | id `SupportingInformation/1`, sequence `1` |
|  | id `SupportingInformation/2`, sequence `2` |
|  | id `SupportingInformation/3`, sequence `3` |
| | and 3 more |
| `supportingInfo[].category.coding[]` | `INV` Document Type - Investigation in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
|  | `ONS` Period, start or end dates of aspects of the Condition. (e.g. admission, discha… in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
|  | `OTH` Other in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
| `supportingInfo[].code.coding[]` | `MAND0408` Clinical notes detailing history and Admission notes showing vitals and examina… in `https://nhcx.abdm.gov.in/document-code` |
|  | `MAND0455` CXR PA view or CECT chest abdomen and pelvis in `https://nhcx.abdm.gov.in/document-code` |
|  | `MAND0409` Any investigations done in `https://nhcx.abdm.gov.in/document-code` |
| | and 3 more |
| `supportingInfo[].valueAttachment` | contentType `application/pdf`, title `Clinical notes detailing history and Admission notes showing vitals and examina…` |
|  | contentType `application/pdf`, title `CXR PA view or CECT chest abdomen and pelvis` |
|  | contentType `application/pdf`, title `Any investigations done` |
| | and 1 more |
| `diagnosis[]` | sequence `1` |
| `diagnosis[].diagnosisCodeableConcept.coding[]` | `A97` Dengue in `http://hl7.org/fhir/sid/icd-10` |
| `diagnosis[].type[].coding[]` | `admitting` Admitting Diagnosis in `http://terminology.hl7.org/CodeSystem/ex-diagnosistype` |
| `diagnosis[].onAdmission.coding[]` | `yes` Yes in `http://terminology.hl7.org/CodeSystem/ex-diagnosis-on-admission` |
| `procedure[]` | id `Procedure/1`, sequence `1`, date `2026-02-24T09:30:00+05:30` |
| `procedure[].type[].coding[]` | `conservative` Conservative in `https://nhcx.abdm.gov.in/procedure-type` |
| `procedure[].procedureReference` | reference `https://nhcx.abdm.gov.in/procedure/1`, display `Pleural Effusion` |
| `insurance[]` | sequence `1`, focal `true` |
| `insurance[].coverage` | reference `https://nhcx.abdm.gov.in/coverage` |
| `item[]` | id `Item/1`, sequence `1`, careTeamSequence `1`, diagnosisSequence `1`, procedureSequence `1`, informationSequence `1`, `2`, `3`, `4`, `5`, `6`, factor `0.5` |
| `item[].category.coding[]` | `MG` General Medicine in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-benefit-category` |
| `item[].productOrService.coding[]` | `MG0111A` Pleural Effusion in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-procedure-code` |
| `item[].modifier[].coding[]` | `STRAT006b` HDU |
| `item[].programCode[].coding[]` | `AB-PMJAY` Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY) in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-program-code` |
| `item[].servicedPeriod` | start `2026-02-22`, end `2026-02-27` |
| `item[].quantity` | value `1` |
| `item[].unitPrice` | value `3300`, currency `INR` |
| `item[].net` | value `3300`, currency `INR` |
| `total` | value `3300`, currency `INR` |

The `Patient`, `Organization`, `Coverage`, `Practitioner`, `Procedure` entries are shaped as in the chapters that introduce them.

## Predetermination response

Sent on `/v1/predetermination/on_submit`.

### The bundle

| # | Resource | Profile |
| :-- | :-- | :-- |
| 1 | `ClaimResponse` | none declared; NRCeS [ClaimResponse](https://nrces.in/ndhm/fhir/r4/StructureDefinition-ClaimResponse.html) |
| 2 | `Patient` | none declared; NRCeS [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html) |
| 3 | `Organization (pay)` | none declared; NRCeS [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 4 | `Organization (prov)` | none declared; NRCeS [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 5 | `Coverage` | none declared; NRCeS [Coverage](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Coverage.html) |

### Elements

#### 1. ClaimResponse

NRCeS profile: [ClaimResponse](https://nrces.in/ndhm/fhir/r4/StructureDefinition-ClaimResponse.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `<participant-defined>`, value `NM-26-0SE00002M` |
| `identifier[].type.coding[]` | `CLN` Claim number in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code` |
| `status` | `active` |
| `use` | `predetermination` |
| `patient` | reference `<participant-defined>` |
| `created` | `2026-09-10T23:54:09+05:30` |
| `insurer` | reference `<participant-defined>` |
| `requestor` | reference `<participant-defined>` |
| `outcome` | `complete` |
| `disposition` | `Approved after the status enquiry.` |
| `preAuthRef` | `CL/26/0SE000108` |
| `payeeType.coding[]` | `provider` Provider in `http://terminology.hl7.org/CodeSystem/payeetype` |
| `item[]` | id `Item/LI-899f9802`, itemSequence `1` |
| `item[].adjudication[].category.coding[]` | `submitted` Submitted Amount in `https://hl7.org/fhir/R4/valueset-adjudication.html` |
|  | `eligible` Eligible Amount in `https://hl7.org/fhir/R4/valueset-adjudication.html` |
|  | `reason` Reason for Adjudication in `https://hl7.org/fhir/R4/valueset-adjudication.html` |
| | and 1 more |
| `item[].adjudication[].amount` | value `150000` |
| `item[].adjudication[].reason.coding[]` | display `Approved after the status enquiry.` |
|  | `Approved` Approved |
| `adjudication[].category.coding[]` | `status` Status |
| `adjudication[].reason.coding[]` | `approved` Approved |
| `total[].category.coding[]` | `benefit` Benefit Amount in `https://hl7.org/fhir/R4/valueset-adjudication.html` |
|  | `submitted` Submitted Amount in `https://hl7.org/fhir/R4/valueset-adjudication.html` |
|  | `eligible` Eligible Amount |
| `total[].amount` | value `150000` |
| `total[]` | id `MRAV1985001/SANDBOX-DEFAULT-01` |

The `Patient`, `Organization`, `Coverage` entries are shaped as in the chapters that introduce them.

## Status

A sender asks what became of a request it made. There is no FHIR payload either way. The Status sheet of the requests-and-responses workbook says the request payload "should be empty string": no bundle, no `Task`, no resource. Everything the call needs travels in the protected header. `x-hcx-correlation_id` is the `x-hcx-api_call_id` of the request whose status is sought, `x-hcx-status` is `request.initiated`, `x-hcx-workflow_id` and `x-hcx-use_case` (`New`, `Enhancement` or `Resubmit`) are optional, and `x-hcx-ben-abha-id` is mandatory. The status comes back on `/v1/on_status`, again in the protected header: `x-hcx-status` `request.dispatched`, the correlation id of the request, and `x-hcx-error_details` (`code`, `message`, `trace`) where it failed. The sheet gives the callback no payload section. The sandbox exit checklists word the request payload as the "encrypted payload of request for which the status is seeking for" and describe no bundle for it.

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

### 1. Predetermination

What would the payer approve for this treatment? The preauthorisation bundles with `Claim.use` `predetermination`. Nothing is reserved.

### 2. Status

No bundle and no `Task`. Send an empty payload with the correlation id set to the call id of the request you are asking about, and read the answer from the callback's protected header.

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

### B9 Submit predetermination (provider)

What would the payer approve for this treatment? Same bundle shape as a pre-authorisation, asked before committing to one.

| | |
| :-- | :-- |
| **API** | `/v1/predetermination/submit` [`apis/04-predetermination/v1-predetermination-submit.bru`](../../apis/04-predetermination/v1-predetermination-submit.bru) |
| **Callback** | `/v1/predetermination/on_submit` [`apis/04-predetermination/v1-predetermination-on_submit.bru`](../../apis/04-predetermination/v1-predetermination-on_submit.bru) |
| **Carries JWE** | yes |
| **Focal resource** | `Claim` |

**Request headers**

| Header | Example value |
| :-- | :-- |
| `Content-Type` | `application/json` |
| `x-hcx-sender_code` | `{{participantCode}}` |
| `x-hcx-recipient_code` | `{{recipientCode}}` |
| `x-hcx-api_call_id` | `{{$guid}}` |
| `x-hcx-correlation_id` | `{{correlationId}}` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `request.initiated` |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `claimNumber` | Predetermination Reference | Case | `string` | `1..1` | `Claim.identifier[0].value` | `PD0000000001` |  |
| `use` | Claim Use | Case | `code` | `1..1` | `Claim.use` | `predetermination` |  |
| `patientName` | Patient Full Name | Beneficiary | `string` | `1..1` | `Patient.name[0].text` | `Ramesh Chandra Sharma` |  |
| `memberId` | Scheme / Insurer Member ID | Beneficiary | `string` | `1..1` | `Patient.identifier[type=PMJAY].value` | `PMJAY-HP-2024-998811` | also at `Coverage.subscriberId` |
| `abhaNumber` | ABHA Number | Beneficiary | `string` | `0..1` | `Patient.identifier[type=ABHA].value` | `91234567890123` |  |
| `gender` | Gender | Beneficiary | `code` | `1..1` | `Patient.gender` | `male` | code system `http://hl7.org/fhir/administrative-gender` |
| `birthDate` | Date of Birth | Beneficiary | `date` | `1..1` | `Patient.birthDate` | `1982-06-15` |  |
| `patientPhone` | Mobile Phone | Beneficiary | `string` | `0..1` | `Patient.telecom[system=phone].value` | `9876543210` |  |
| `policyNumber` | Policy Number | Coverage | `string` | `1..1` | `Coverage.identifier[0].value` | `PMJAY/HP/S/G` |  |
| `primaryDiagnosisCode` | Primary Diagnosis (ICD-10) | Clinical | `string` | `1..1` | `Claim.diagnosis[0].diagnosisCodeableConcept.coding[0].code` | `A97.0` | code system `http://hl7.org/fhir/sid/icd-10` |
| `procedureCode` | Package / Procedure Code | Clinical | `string` | `1..1` | `Claim.procedure[0].procedureCodeableConcept.coding[0].code` | `MG004A` |  |

NRCeS profiles: [Claim](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Claim.html), [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html), [Coverage](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Coverage.html).

### C11 Respond to predetermination (payer)

What the payer would approve for the proposed treatment.

| | |
| :-- | :-- |
| **API** | `/v1/predetermination/on_submit` [`apis/04-predetermination/v1-predetermination-on_submit.bru`](../../apis/04-predetermination/v1-predetermination-on_submit.bru) |
| **Callback** | `/v1/predetermination/submit` [`apis/04-predetermination/v1-predetermination-submit.bru`](../../apis/04-predetermination/v1-predetermination-submit.bru) |
| **Carries JWE** | yes |
| **Focal resource** | `ClaimResponse` |

**Request headers**

| Header | Example value |
| :-- | :-- |
| `Content-Type` | `application/json` |
| `x-hcx-sender_code` | `{{participantCode}}` |
| `x-hcx-recipient_code` | `{{recipientCode}}` |
| `x-hcx-api_call_id` | `{{$guid}}` |
| `x-hcx-correlation_id` | `{{correlationId}}` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `response.complete` |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `use` | Claim Use | Verdict | `code` | `1..1` | `ClaimResponse.use` | `predetermination` |  |
| `estimatedApproval` | Estimated Approved Benefit | Verdict | `decimal` | `1..1` | `ClaimResponse.total[category=benefit].amount.value` | `15500.00` |  |

NRCeS profiles: [ClaimResponse](https://nrces.in/ndhm/fhir/r4/StructureDefinition-ClaimResponse.html).

### A5 Get status (shared)

Where any request you made got to, by its correlation id. The sandbox's own status page answers without a token.

| | |
| :-- | :-- |
| **API** | `/v1/status` [`apis/08-status/v1-status.bru`](../../apis/08-status/v1-status.bru) |
| **Callback** | `/v1/on_status` [`apis/13-other/v1-on_status.bru`](../../apis/13-other/v1-on_status.bru) |
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
| `x-hcx-ben-abha-id` | `91711234567890` |

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
| `x-hcx-ben-abha-id` | `91711234567890` |

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
| `x-hcx-correlation_id` | `{{$guid}}` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `response.complete` |
| `x-hcx-ben-abha-id` | `91711234567890` |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `taskStatus` | Search Task Status | Task | `code` | `1..1` | `Task.status` | `completed` |  |
| `claimResponseRef` | Matching ClaimResponse | Task Output | `reference` | `0..*` | `Task.output[].valueReference.reference` | `ClaimResponse/cr-approved-1` |  |

NRCeS profiles: [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html).
