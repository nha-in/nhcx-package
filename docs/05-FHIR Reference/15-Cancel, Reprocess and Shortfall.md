# Cancel, reprocess and shortfall

The post-decision exchanges. All are `Task` bundles on `/v1/task/submit`, answered on `/v1/task/on_submit`, and `Task.code` with its reason is the only thing that tells them apart.

## Cancel

Sent on `/v1/task/submit`, workflow PC01.

### The bundle

| # | Resource | Profile |
| :-- | :-- | :-- |
| 1 | `Task` | [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html) |
| 2 | `Organization (prov)` | [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 3 | `Organization (pay)` | [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |

### Elements

#### 1. Task

NRCeS profile: [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html).

| Element | Example |
| :-- | :-- |
| `status` | `requested` |
| `intent` | `order` |
| `code.coding[]` | `cancel` in `http://terminology.hl7.org/CodeSystem/financialtaskcode` |
| `authoredOn` | `2026-09-10T23:52:03+05:30` |
| `requester` | reference `https://nhcx.abdm.gov.in/provider` |
| `owner` | reference `https://nhcx.abdm.gov.in/payer` |
| `description` | `Treatment plan changed; withdrawn.` |
| `reasonCode.coding[]` | `treatmentplanchanged` Treatment plan changed during hospitalization in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-reason-code` |
| `input[]` | valueString `NM-26-0SE00002I` |
| `input[].type.coding[]` | `claimNumber` ClaimNumber in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-task-input-type-code` |
|  | `intimationNumber` Intimation Number in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-task-input-type-code` |

#### 2. Organization (prov)

NRCeS profile: [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `https://nhcx.abdm.gov.in`, value `IN1910000151` |
| `identifier[].type.coding[]` | `NPI` National provider identifier in `http://terminology.hl7.org/CodeSystem/v2-0203` |
| `type[].coding[]` | `prov` Healthcare Provider in `http://terminology.hl7.org/CodeSystem/organization-type` |
| `name` | `KyroCare Multispeciality Hospital` |

#### 3. Organization (pay)

NRCeS profile: [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `https://nhcx.abdm.gov.in`, value `1000004805` |
| `identifier[].type.coding[]` | `NIIP` National Insurance Payor Identifier (Payor) in `http://terminology.hl7.org/CodeSystem/v2-0203` |
| `type[].coding[]` | `pay` Payer in `http://terminology.hl7.org/CodeSystem/organization-type` |
| `name` | `Sandbox Payer` |

## Reprocess

Sent on `/v1/task/submit`, workflow 36.

### The bundle

| # | Resource | Profile |
| :-- | :-- | :-- |
| 1 | `Task` | [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html) |
| 2 | `Organization (prov)` | [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 3 | `Organization (pay)` | [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |

### Elements

#### 1. Task

NRCeS profile: [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html).

| Element | Example |
| :-- | :-- |
| `status` | `requested` |
| `intent` | `order` |
| `code.coding[]` | `reprocess` in `http://terminology.hl7.org/CodeSystem/financialtaskcode` |
| `authoredOn` | `2026-09-10T23:53:27+05:30` |
| `requester` | reference `https://nhcx.abdm.gov.in/provider` |
| `owner` | reference `https://nhcx.abdm.gov.in/payer` |
| `description` | `Package rate revised; please reassess the approved amount.` |
| `reasonCode.coding[]` | `claimrejected` Reprocess request due to claim rejected by payer in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-reason-code` |
| `basedOn[]` | display `Claim NM-26-0SE00002L` |
| `basedOn[].identifier` | system `https://nhcx.abdm.gov.in`, value `NM-26-0SE00002L` |
| `basedOn[].identifier.type.coding[]` | `CLN` Claim number in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code` |
| `input[]` | valueString `NM-26-0SE00002L` |
| `input[].type.coding[]` | `claimNumber` ClaimNumber in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-task-input-type-code` |
|  | `intimationNumber` Intimation Number in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-task-input-type-code` |
| `for.identifier` | value `MRAV1985001` |
| `for.identifier.type.coding[]` | `MB` Member Number in `http://terminology.hl7.org/CodeSystem/v2-0203` |

#### 2. Organization (prov)

NRCeS profile: [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `https://nhcx.abdm.gov.in`, value `IN1910000151` |
| `identifier[].type.coding[]` | `NPI` National provider identifier in `http://terminology.hl7.org/CodeSystem/v2-0203` |
| `type[].coding[]` | `prov` Healthcare Provider in `http://terminology.hl7.org/CodeSystem/organization-type` |
| `name` | `KyroCare Multispeciality Hospital` |

#### 3. Organization (pay)

NRCeS profile: [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `https://nhcx.abdm.gov.in`, value `1000004805` |
| `identifier[].type.coding[]` | `NIIP` National Insurance Payor Identifier (Payor) in `http://terminology.hl7.org/CodeSystem/v2-0203` |
| `type[].coding[]` | `pay` Payer in `http://terminology.hl7.org/CodeSystem/organization-type` |
| `name` | `Sandbox Payer` |

## Release

Sent on `/v1/task/submit`.

### The bundle

| # | Resource | Profile |
| :-- | :-- | :-- |
| 1 | `Task` | [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html) |
| 2 | `Organization (prov)` | [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 3 | `Organization (pay)` | [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |

### Elements

#### 1. Task

NRCeS profile: [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html).

| Element | Example |
| :-- | :-- |
| `status` | `requested` |
| `intent` | `order` |
| `code.coding[]` | `release` in `http://terminology.hl7.org/CodeSystem/financialtaskcode` |
| `description` | `Release the balance amount for claim EO26AA2700001` |
| `authoredOn` | `2026-03-05T11:20:00+05:30` |
| `requester` | reference `https://nhcx.abdm.gov.in/provider` |
| `owner` | reference `https://nhcx.abdm.gov.in/payer` |
| `reasonCode.coding[]` | `partialpayment` Reprocess request due to partial payment by payer in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-reason-code` |
| `basedOn[]` | display `Claim EO26AA2700001` |
| `basedOn[].identifier` | system `https://nhcx.abdm.gov.in`, value `EO26AA2700001` |
| `basedOn[].identifier.type.coding[]` | `CLN` Claim number in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code` |
| `input[]` | valueString `EO26AA2700001` |
| `input[].type.coding[]` | `claimNumber` ClaimNumber in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-task-input-type-code` |
|  | `amount` Amount in `https://nhcx.abdm.gov.in/task-input-type` |
| `input[].valueMoney` | value `1650`, currency `INR` |

#### 2. Organization (prov)

NRCeS profile: [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `https://nhcx.abdm.gov.in`, value `IN1910000151` |
| `identifier[].type.coding[]` | `NPI` National provider identifier in `http://terminology.hl7.org/CodeSystem/v2-0203` |
| `type[].coding[]` | `prov` Healthcare Provider in `http://terminology.hl7.org/CodeSystem/organization-type` |
| `name` | `Facility Name` |

#### 3. Organization (pay)

NRCeS profile: [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `https://nhcx.abdm.gov.in`, value `1518` |
| `identifier[].type.coding[]` | `NIIP` National Insurance Payor Identifier (Payor) in `http://terminology.hl7.org/CodeSystem/v2-0203` |
| `type[].coding[]` | `pay` Payer in `http://terminology.hl7.org/CodeSystem/organization-type` |
| `name` | `Insurance Company` |

## Cancellation done

Sent on `/v1/task/on_submit`, workflow PC02.

### The bundle

| # | Resource | Profile |
| :-- | :-- | :-- |
| 1 | `Task` | none declared; NRCeS [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html) |
| 2 | `ClaimResponse` | none declared; NRCeS [ClaimResponse](https://nrces.in/ndhm/fhir/r4/StructureDefinition-ClaimResponse.html) |
| 3 | `Patient` | none declared; NRCeS [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html) |
| 4 | `Organization (pay)` | none declared; NRCeS [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 5 | `Organization (prov)` | none declared; NRCeS [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 6 | `Coverage` | none declared; NRCeS [Coverage](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Coverage.html) |

### Elements

#### 1. Task

NRCeS profile: [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html).

| Element | Example |
| :-- | :-- |
| `status` | `completed` |
| `intent` | `order` |
| `code.coding[]` | `approve` Activate/approve the focal resource in `http://hl7.org/fhir/CodeSystem/task-code` |
| `description` | `Pre-authorisation withdrawn by 1000003463@hcx: Treatment plan changed; withdraw…` |
| `authoredOn` | `2026-09-10T23:52:05+05:30` |
| `requester` | reference `<participant-defined>` |
| `owner` | reference `<participant-defined>` |
| `output[].type.coding[]` | `include` Include in `http://terminology.hl7.org/CodeSystem/financialtaskinputtype` |
| `output[].valueReference` | reference `<participant-defined>` |

#### 2. ClaimResponse

NRCeS profile: [ClaimResponse](https://nrces.in/ndhm/fhir/r4/StructureDefinition-ClaimResponse.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `<participant-defined>`, value `NM-26-0SE00002I` |
| `identifier[].type.coding[]` | `CLN` Claim number in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code` |
| `status` | `active` |
| `type.coding[]` | `737481003` Inpatient care management (procedure) in `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-claim-type` |
| `use` | `preauthorization` |
| `patient` | reference `<participant-defined>` |
| `created` | `2026-09-10T23:52:05+05:30` |
| `insurer` | reference `<participant-defined>` |
| `requestor` | reference `<participant-defined>` |
| `outcome` | `complete` |
| `disposition` | `Pre-authorisation withdrawn by 1000003463@hcx: Treatment plan changed; withdraw…` |
| `payeeType.coding[]` | `provider` Provider in `http://terminology.hl7.org/CodeSystem/payeetype` |
| `adjudication[].category.coding[]` | `status` Status |
| `adjudication[].reason.coding[]` | `cancelled` Cancelled |
| `total[].category.coding[]` | `benefit` Benefit Amount in `https://hl7.org/fhir/R4/valueset-adjudication.html` |
|  | `submitted` Submitted Amount in `https://hl7.org/fhir/R4/valueset-adjudication.html` |
| `total[].amount` | value `150000` |

The `Patient`, `Organization`, `Coverage` entries are shaped as in the chapters that introduce them.

## Reprocess acknowledged

Sent on `/v1/task/on_submit`, workflow 37.

### The bundle

| # | Resource | Profile |
| :-- | :-- | :-- |
| 1 | `Task` | none declared; NRCeS [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html) |
| 2 | `ClaimResponse` | none declared; NRCeS [ClaimResponse](https://nrces.in/ndhm/fhir/r4/StructureDefinition-ClaimResponse.html) |
| 3 | `Patient` | none declared; NRCeS [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html) |
| 4 | `Organization (pay)` | none declared; NRCeS [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 5 | `Organization (prov)` | none declared; NRCeS [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 6 | `Coverage` | none declared; NRCeS [Coverage](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Coverage.html) |

### Elements

#### 1. Task

NRCeS profile: [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html).

| Element | Example |
| :-- | :-- |
| `status` | `accepted` |
| `intent` | `order` |
| `code.coding[]` | `approve` Activate/approve the focal resource in `http://hl7.org/fhir/CodeSystem/task-code` |
| `description` | `Claim reopened for reprocessing (round 1) at the request of 1000003463@hcx: Pac…` |
| `authoredOn` | `2026-09-10T23:53:28+05:30` |
| `requester` | reference `<participant-defined>` |
| `owner` | reference `<participant-defined>` |
| `output[].type.coding[]` | `include` Include in `http://terminology.hl7.org/CodeSystem/financialtaskinputtype` |
| `output[].valueReference` | reference `<participant-defined>` |

#### 2. ClaimResponse

NRCeS profile: [ClaimResponse](https://nrces.in/ndhm/fhir/r4/StructureDefinition-ClaimResponse.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `<participant-defined>`, value `NM-26-0SE00002L` |
| `identifier[].type.coding[]` | `CLN` Claim number in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code` |
| `status` | `active` |
| `type.coding[]` | `737481003` Inpatient care management (procedure) in `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-claim-type` |
| `use` | `claim` |
| `patient` | reference `<participant-defined>` |
| `created` | `2026-09-10T23:53:28+05:30` |
| `insurer` | reference `<participant-defined>` |
| `requestor` | reference `<participant-defined>` |
| `outcome` | `queued` |
| `disposition` | `Claim reopened for reprocessing (round 1) at the request of 1000003463@hcx: Pac…` |
| `payeeType.coding[]` | `provider` Provider in `http://terminology.hl7.org/CodeSystem/payeetype` |
| `adjudication[].category.coding[]` | `status` Status |
| `adjudication[].reason.coding[]` | `submitted` Submitted |
| `total[].category.coding[]` | `benefit` Benefit Amount in `https://hl7.org/fhir/R4/valueset-adjudication.html` |
|  | `submitted` Submitted Amount in `https://hl7.org/fhir/R4/valueset-adjudication.html` |
| `total[].amount` | value `0` |
|  | value `150000` |

The `Patient`, `Organization`, `Coverage` entries are shaped as in the chapters that introduce them.

## Rules

### 1. Cancel

`Task.code` `cancel`, a reason from `ndhm-reason-code` (`treatmentplanchanged`, `patientrequest`, `financialconstraints`, `alternativetreatment`, `duplicateclaim`, `administrativeerror`, `other`), and the inputs `claimNumber` and `intimationNumber`.

### 2. Reprocess

`Task.code` `reprocess`, reason `claimrejected` or `rejectiondisputed`, `basedOn` naming the claim by its `CLN` identifier, `for` the member, and the inputs `claimNumber` and `intimationNumber`, spelled so. Sent only for a claim the payer rejected: a claim is never resubmitted, and a reprocess is its only way back. `partialpayment` is not a reprocess reason; a claim paid short is not rejected, and its balance is asked for by release.

### 3. Release

`Task.code` `release`, reason `partialpayment`, with the claim number and the amount sought as a `valueMoney` input.

### 4. Nullify

The Reprocess sheet of the requests-and-responses workbook gives `Task.code` on `/v1/task/submit` as `reprocess`, `cancel`, `release` or `nullify`, as the use case needs, each with a `ClaimNumber` input carrying the claim number and `Task.status` `requested`; the answer is a `Task` whose output is the `ClaimResponse`. The provider sandbox exit checklist names the same four codes. The value sets describe `nullify` as closing a claim the provider submitted. No sample bundle, reason code or workflow code is published for it.

### 5. Suspend

`suspend` appears only as a code. The value sets list it, glossed "suspend the preauthorization or claim that was submitted by provider", beside the task output `claimsuspended`. No exchange carries it: no request shape, answer or workflow code is published.

### 6. The answer

A `Task` whose `output` of type `include` references a `ClaimResponse` in the same bundle. Read the result from that `ClaimResponse`'s adjudication reason, not from `outcome` and not from `Task.code`. A cancellation is `completed` with reason `cancelled`; a reprocess is `accepted` with the `ClaimResponse` `queued`, and the new verdict follows on the claim's own thread. A reprocess decision carried on the Task reply updates the claim.

### 7. Switch on system and code together

The Task code systems differ between request and response.

### 8. A cancelled case still reports money

Zero the figure yourself once the reason reads `cancelled`.

## PMJAY

The generic bundle above is what every payer takes, IRDAI-regulated insurers and TPAs included. PMJAY takes it with the changes and requirements below.

### What changes in the bundle

#### Cancel

The PMJAY bundle has the same resources, elements and systems as the generic one.

#### Reprocess

##### Elements PMJAY adds

| Element | Example |
| :-- | :-- |
| `Task.input[].valueAttachment` | contentType `application/pdf`, title `Medical Superintendent Declaration Form (During Admission)` |

##### Systems PMJAY binds differently

| Element | Generic | PMJAY |
| :-- | :-- | :-- |
| `Task.for.identifier.type.coding[]` | `http://terminology.hl7.org/CodeSystem/v2-0203` | `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code` |

### What PMJAY specifies

- A shortfall is asked for with reason `partialpayment` and an amount capped at the difference. The scheme's use case sheet words it as a reprocess `Task`; send it as the `release` Task, since a part-paid claim is not rejected, and confirm with the scheme.
- The reprocess carries the supporting document as a `document` input with a `valueAttachment`, and names the member by the `PMJAY` identifier, as the package's capture shows. The live PMJAY provider's reprocess of October 2026 carried `claimNumber` alone, its reason in `description`, and was accepted.
- The reprocess is acknowledged on 37; the new verdict then arrives on the claim's own thread.

### What PMJAY requires

- Cancel is allowed until the claim is raised, and refused once payment has been initiated (`PAYR-1257`).
- On a cancel, the intimation input is coded `initimationNumber`, spelled so, as the live PMJAY provider sends it and as the handbook notes real payloads do. The payer reads the case from it and refuses the published `intimationNumber` with `ERR-PYR-CLM-007`.
- Reprocess once, the moment the rejection arrives, with a supporting document. The Claim Review Committee is final.
- Shortfall only after payment notice 33 has arrived and been acknowledged on 17, once, and never after a reprocess.
- A `Task` coded `status` is not taken (`PAYR-1018`, `PAYR-1008`). Read where a case stands from the payer service instead.

## Use cases, APIs and data elements

### B8 Reprocess or cancel (provider)

One endpoint, several jobs, told apart by the Task's code and reason: reprocess with claimrejected or rejectiondisputed, only for a rejected claim; release with partialpayment for a short payment; cancel; status. A reprocess goes on 36 and is acknowledged on 37; a cancel goes on PC01 and is done on PC02; a status enquiry goes on 1 always. Reprocess and cancel carry the input intimationNumber. A supporting document is mandatory on a reprocess. A claim is never resubmitted: a reprocess is its only way back.

| | |
| :-- | :-- |
| **API** | `/v1/task/submit` [`apis/14-other/v1-task-submit.bru`](../../apis/14-other/v1-task-submit.bru) |
| **Callback** | `/v1/task/on_submit` [`apis/14-other/v1-task-on-submit.bru`](../../apis/14-other/v1-task-on-submit.bru) |
| **Workflow** | PC01 cancel, 36 reprocess or release, 1 status |
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
| `x-hcx-workflow_id` | `PC01` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `request.initiated` |
| `x-hcx-ben-abha-id` | `91-7112-3456-7890` |

**Workflow codes**

| Code | Name | Authored by | `x-hcx-status` | Means |
| :-- | :-- | :-- | :-- | :-- |
| `PC01` | Preauth Cancel Initiated | provider | `request.initiated` | Cancel an existing preauth |
| `36` | Claim Arbitration Request Submitted | provider | `request.initiated` | Reprocess/Erroneous request, with input intimationNumber; acknowledged on 37 |
| `1` | Insurance plan request and status enquiry | provider | `request.initiated`, `response.complete` | The insurance plan request and the status enquiry Task. The sheet names no code for either; both are sent under 1, never a correlation id, a UUID or a case number. The answer echoes 1. |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `taskCode` | Action Code | Task | `code` | `1..1` | `Task.code.coding[0].code` | `reprocess` |  |
| `taskReason` | Appeal Reason Code | Task | `code` | `1..1` | `Task.reasonCode.coding[0].code` | `claimrejected` |  |
| `originalCaseNumber` | Original Case Number | Task Input | `string` | `1..1` | `Task.input[type=claimNumber].valueString` | `NM-26-0SE00002L` |  |
| `appealDocument` | Supporting Document (mandatory on a reprocess) | Task Input | `base64Binary` | `0..1` | `Task.input[type=document].valueAttachment.data` | `JVBERi0xLjQK...` |  |

NRCeS profiles: [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html).

### D8 Cancel pre-authorisation (pmjay)

A Task with code cancel, the case number as input and one of seven reasons: treatmentplanchanged, patientrequest, financialconstraints, alternativetreatment, duplicateclaim, administrativeerror, other. Allowed at any point until the claim is raised.

| | |
| :-- | :-- |
| **API** | `/v1/task/submit` [`apis/14-other/v1-task-submit.bru`](../../apis/14-other/v1-task-submit.bru) |
| **Callback** | `/v1/task/on_submit` [`apis/14-other/v1-task-on-submit.bru`](../../apis/14-other/v1-task-on-submit.bru) |
| **Workflow** | PC01 |
| **Carries JWE** | yes |
| **Focal resource** | `Task` |
| **Simulator console** | `/builder?family=preauth&usecase=cancel` |

**Request headers**

| Header | Example value |
| :-- | :-- |
| `x-hcx-sender_code` | `1000004446@hcx` |
| `x-hcx-recipient_code` | `1518@hcx` |
| `x-hcx-api_call_id` | `{{$guid}}` |
| `x-hcx-request_id` | `{{$guid}}` |
| `x-hcx-correlation_id` | `{{$guid}}` |
| `x-hcx-workflow_id` | `PC01` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `request.initiated` |
| `x-hcx-ben-abha-id` | `91-7112-3456-7890` |

**Workflow codes**

| Code | Name | Authored by | `x-hcx-status` | Means |
| :-- | :-- | :-- | :-- | :-- |
| `PC01` | Preauth Cancel Initiated | provider | `request.initiated` | Cancel an existing preauth |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `taskCode` | Action Code | Task | `code` | `1..1` | `Task.code.coding[0].code` | `cancel` |  |
| `caseNumber` | Pre-auth Case Number | Task Input | `string` | `1..1` | `Task.input[type=claimNumber].valueString` | `NM-26-0SF00002R` |  |

NRCeS profiles: [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html).

### D11 Reprocess a rejected claim (pmjay)

An appeal, not a resubmission: a Task with code reprocess and reason claimrejected or rejectiondisputed, only for a rejected claim, a supporting document attached, no amount. Raise it the moment the rejection arrives. Once only; the Claim Review Committee is final.

| | |
| :-- | :-- |
| **API** | `/v1/task/submit` [`apis/14-other/v1-task-submit.bru`](../../apis/14-other/v1-task-submit.bru) |
| **Callback** | `/v1/task/on_submit` [`apis/14-other/v1-task-on-submit.bru`](../../apis/14-other/v1-task-on-submit.bru) |
| **Workflow** | 36 |
| **Carries JWE** | yes |
| **Focal resource** | `Task` |
| **Simulator console** | `/builder?family=claim&usecase=reprocess` |

**Request headers**

| Header | Example value |
| :-- | :-- |
| `x-hcx-sender_code` | `1000004446@hcx` |
| `x-hcx-recipient_code` | `1518@hcx` |
| `x-hcx-api_call_id` | `{{$guid}}` |
| `x-hcx-request_id` | `{{$guid}}` |
| `x-hcx-correlation_id` | `{{$guid}}` |
| `x-hcx-workflow_id` | `36` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `request.initiated` |
| `x-hcx-ben-abha-id` | `91-7112-3456-7890` |

**Workflow codes**

| Code | Name | Authored by | `x-hcx-status` | Means |
| :-- | :-- | :-- | :-- | :-- |
| `36` | Claim Arbitration Request Submitted | provider | `request.initiated` | Reprocess/Erroneous request, with input intimationNumber; acknowledged on 37 |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `taskCode` | Task Code | Task | `code` | `1..1` | `Task.code.coding[0].code` | `reprocess` |  |
| `taskReason` | Dispute Reason | Task | `code` | `1..1` | `Task.reasonCode.coding[0].code` | `claimrejected` |  |
| `claimNumber` | Rejected Claim ID | Task Input | `string` | `1..1` | `Task.input[type=claimNumber].valueString` | `NM-26-0SF00002U` |  |

NRCeS profiles: [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html).

### D12 Claim a shortfall (pmjay)

A Task with reason partialpayment and an amount capped at the difference, allowed only after payment notice 33 has arrived and been acknowledged with 17. Once only, and never after a reprocess. The scheme words it as a reprocess; a part-paid claim is not rejected, so send it as the release Task, code release, and confirm with the scheme.

| | |
| :-- | :-- |
| **API** | `/v1/task/submit` [`apis/14-other/v1-task-submit.bru`](../../apis/14-other/v1-task-submit.bru) |
| **Callback** | `/v1/task/on_submit` [`apis/14-other/v1-task-on-submit.bru`](../../apis/14-other/v1-task-on-submit.bru) |
| **Workflow** | 36 |
| **Carries JWE** | yes |
| **Focal resource** | `Task` |
| **Simulator console** | `/builder?family=claim&usecase=shortfall` |

**Request headers**

| Header | Example value |
| :-- | :-- |
| `x-hcx-sender_code` | `1000004446@hcx` |
| `x-hcx-recipient_code` | `1518@hcx` |
| `x-hcx-api_call_id` | `{{$guid}}` |
| `x-hcx-request_id` | `{{$guid}}` |
| `x-hcx-correlation_id` | `{{$guid}}` |
| `x-hcx-workflow_id` | `36` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `request.initiated` |
| `x-hcx-ben-abha-id` | `91-7112-3456-7890` |

**Workflow codes**

| Code | Name | Authored by | `x-hcx-status` | Means |
| :-- | :-- | :-- | :-- | :-- |
| `36` | Claim Arbitration Request Submitted | provider | `request.initiated` | Reprocess/Erroneous request, with input intimationNumber; acknowledged on 37 |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `taskCode` | Task Code | Task | `code` | `1..1` | `Task.code.coding[0].code` | `release` |  |
| `taskReason` | Reason Code | Task | `code` | `1..1` | `Task.reasonCode.coding[0].code` | `partialpayment` |  |
| `claimNumber` | Partially Paid Claim ID | Task Input | `string` | `1..1` | `Task.input[type=claimNumber].valueString` | `EO26AA2700001` |  |
| `balanceAmount` | Balance Sought | Task Input | `decimal` | `1..1` | `Task.input[type=amount].valueMoney.value` | `1650` |  |

NRCeS profiles: [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html).

### C10 Respond to a Task (payer)

The answer to a reprocess, shortfall or cancel. A cancellation done is PC02 and carries the case's ClaimResponse in its output; a reprocess on 36 is acknowledged on 37 as arbitration. Both payers answer this way.

| | |
| :-- | :-- |
| **API** | `/v1/task/on_submit` [`apis/14-other/v1-task-on-submit.bru`](../../apis/14-other/v1-task-on-submit.bru) |
| **Callback** | `/v1/task/submit` [`apis/14-other/v1-task-submit.bru`](../../apis/14-other/v1-task-submit.bru) |
| **Workflow** | 251 acknowledged, 252 approved, 253 rejected, 254 queried, PC02 cancelled, 37 arbitration acknowledged |
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
| `x-hcx-workflow_id` | `252` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `response.complete` |
| `x-hcx-ben-abha-id` | `91-7112-3456-7890` |

**Workflow codes**

| Code | Name | Authored by | `x-hcx-status` | Means |
| :-- | :-- | :-- | :-- | :-- |
| `251` | Reprocess Request Received | payer | `response.complete` | Reprocess request received |
| `252` | Reprocess Request Approved | payer | `response.complete` | Reprocess request approved |
| `253` | Reprocess Request Rejected | payer | `response.complete` | Reprocess request rejected |
| `254` | Reprocess Request Queried | payer | `request.initiated` | Reprocess request queried |
| `PC02` | Preauthorization Cancellation Accomplished | status sheet only | `response.complete` |  |
| `37` | Claim Arbitration Acknowledgement | status sheet only | `response.complete` |  |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `taskStatus` | Task Status | Task | `code` | `1..1` | `Task.status` | `accepted` |  |
| `outputDecision` | Decision Reference | Task Output | `reference` | `0..1` | `Task.output[0].valueReference.reference` | `https://payer.nha.gov.in/v1/task/on_submit/claimresponse/NM-26-0SF00002U` |  |

NRCeS profiles: [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html).
