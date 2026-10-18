# Preauthorisation query and answer

When the payer wants more before it decides. A private insurer raises the query as a communication and takes the answer as one. PMJAY raises it as a `ClaimResponse` on the case's own thread and takes the answer as the whole preauthorisation, resubmitted.

## The query

Sent on `/v1/communication/request`, workflow 24.

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

## The answer

Sent on `/v1/communication/on_request`, workflow 24, echoed.

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
| `status` | `completed` |
| `intent` | `order` |
| `code.coding[]` | `deliver` in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-task-codes` |
| `authoredOn` | `2026-09-10T23:51:53+05:30` |
| `requester` | reference `https://nhcx.abdm.gov.in/provider`, display `Organization` |
| `owner` | reference `https://nhcx.abdm.gov.in/payer`, display `Organization` |
| `input[].type.coding[]` | `include` in `http://terminology.hl7.org/CodeSystem/financialtaskinputtype` |
| `input[].valueReference` | reference `urn:uuid:3e398f2b-ab14-41e5-8939-d7746eea43de`, display `Communication` |
| `reasonCode.coding[]` | `additionalinfo` Additional Information Request in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-reason-code` |

#### 2. Communication

NRCeS profile: [Communication](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Communication.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | value `NM-26-0SE00002I` |
| `basedOn[]` | reference `urn:uuid:4b35a6eb-3f99-5d0c-b0c8-5b2f049fdbde`, display `CommunicationRequest` |
| `inResponseTo[]` | reference `urn:uuid:4b35a6eb-3f99-5d0c-b0c8-5b2f049fdbde`, display `CommunicationRequest` |
| `about[]` | reference `https://nhcx.abdm.gov.in/preauth/request`, display `Claim urn:uuid:c1a17d6e-c718-58de-8d3d-fd4c0607d729` |
| `status` | `completed` |
| `category[].coding[]` | `notification` in `http://terminology.hl7.org/CodeSystem/communication-category` |
| `priority` | `routine` |
| `recipient[]` | reference `https://nhcx.abdm.gov.in/payer`, display `Organization` |
| `sender` | reference `https://nhcx.abdm.gov.in/provider`, display `Organization` |
| `payload[]` | contentString `X-ray and clinical notes attached as asked.` |
| `payload[].contentAttachment` | contentType `application/pdf`, title `Proof of Identity (Aadhaar / Passport / Voter ID)`, creation `2026-09-10T23:51:40+05:30` |
|  | contentType `application/pdf`, title `Medical Certificate / Doctor Referral`, creation `2026-09-10T23:51:40+05:30` |
|  | contentType `application/pdf`, title `Radiology / X-Ray / CT / MRI Scan Reports`, creation `2026-09-10T23:51:40+05:30` |
| | and 5 more |
| `payload[].extension[]` | url `<participant-defined>`, valueString `POI` |
|  | url `<participant-defined>`, valueString `CER` |
|  | url `<participant-defined>`, valueString `RAD` |
| | and 5 more |

The `CommunicationRequest`, `Claim`, `Patient`, `Organization`, `Practitioner`, `Coverage` entries are shaped as in the chapters that introduce them.

## Rules

### 1. The generic query

A `Task` coded `poll`, reason `additionalinfo`, with an `include` input referencing a `CommunicationRequest` whose `basedOn` names the preauthorisation. Sent on `/v1/communication/request` under 24.

### 2. The generic answer

A `Task` coded `deliver` in `ndhm-task-codes`, `completed`, with an `include` input referencing a `Communication` whose `basedOn` names the request and whose `payload` carries the message and the documents. Posted on `/v1/communication/on_request`, echoing the correlation id and workflow id.

### 3. An answer on the submit path is a request

A line-item query, a `ClaimResponse` naming the queried items, is answered by sending the preauthorisation again, whatever the payer's query mode. That answer, on `/v1/preauth/submit` under 19 or 131, goes as `x-hcx-status` `request.initiated`: the workflow sheet pairs those codes with `response.complete`, and NHCX refuses that on a submit path with `NHCX-1011`. An answer refused at the door leaves the question open.

## PMJAY

The generic bundle above is what every payer takes, IRDAI-regulated insurers and TPAs included. PMJAY takes it with the changes and requirements below.

### What changes in the bundle

#### The query

PMJAY uses a different bundle for this step, headed by `ClaimResponse` rather than `Task`.

| # | Resource | Profile |
| :-- | :-- | :-- |
| 1 | `ClaimResponse` | none declared; NRCeS [ClaimResponse](https://nrces.in/ndhm/fhir/r4/StructureDefinition-ClaimResponse.html) |
| 2 | `Patient` | none declared; NRCeS [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html) |
| 3 | `Organization (pay)` | none declared; NRCeS [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 4 | `Organization (prov)` | none declared; NRCeS [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 5 | `Coverage` | none declared; NRCeS [Coverage](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Coverage.html) |

###### 1. ClaimResponse

NRCeS profile: [ClaimResponse](https://nrces.in/ndhm/fhir/r4/StructureDefinition-ClaimResponse.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `https://hcx.pmjay.gov.in/v1/preauthorization`, value `NM-26-0SF000031` |
| `identifier[].type.coding[]` | `CLN` Claim number in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code` |
| `status` | `active` |
| `use` | `preauthorization` |
| `patient` | reference `https://payer.nha.gov.in/preauthorization/v1/preauth/on_submit/claimresponse/pa…` |
| `created` | `2026-09-11T00:33:03+05:30` |
| `insurer` | reference `https://payer.nha.gov.in/preauthorization/v1/preauth/on_submit/claimresponse/or…` |
| `requestor` | reference `https://payer.nha.gov.in/preauthorization/v1/preauth/on_submit/claimresponse/or…` |
| `outcome` | `partial` |
| `disposition` | `query` |
| `preAuthRef` | `2026091110000817` |
| `payeeType.coding[]` | `provider` Provider in `http://terminology.hl7.org/CodeSystem/payeetype` |
| `item[]` | id `Item/Item/2`, itemSequence `2` |
|  | id `Item/Item/1`, itemSequence `1` |
| `item[].adjudication[].category.coding[]` | `submitted` Submitted Amount in `https://hl7.org/fhir/R4/valueset-adjudication.html` |
|  | `eligible` Eligible Amount in `https://hl7.org/fhir/R4/valueset-adjudication.html` |
|  | `reason` Reason for Adjudication in `https://hl7.org/fhir/R4/valueset-adjudication.html` |
| | and 3 more |
| `item[].adjudication[].amount` | value `1500` |
|  | value `1725` |
|  | value `1800` |
| | and 1 more |
| `item[].adjudication[].reason.coding[]` | display ` : Request acknowledged and accepted for further processing.` |
|  | `Queried` Queried |
|  | `Approved` Approved |
| `item[].adjudication[]` | value `0` |
|  | value `100` |
|  | value `1` |
| `adjudication[].category.coding[]` | `status` Status |
| `adjudication[].reason.coding[]` | `queried` Queried |
| `total[].category.coding[]` | `benefit` Benefit Amount in `https://hl7.org/fhir/R4/valueset-adjudication.html` |
|  | `submitted` Submitted Amount in `https://hl7.org/fhir/R4/valueset-adjudication.html` |
|  | `tax` Tax in `https://hl7.org/fhir/R4/valueset-adjudication.html` |
| | and 2 more |
| `total[].amount` | value `2070` |
|  | value `1725` |
|  | value `0` |
| | and 1 more |
| `total[]` | id `PMJAY0000X/PMJAY-T` |

The `Patient`, `Organization`, `Coverage` entries are shaped as in the chapters that introduce them.

#### The answer

PMJAY uses a different bundle for this step, headed by `Claim` rather than `Task`.

| # | Resource | Profile |
| :-- | :-- | :-- |
| 1 | `Claim` | [Claim](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Claim.html) |
| 2 | `Patient` | [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html) |
| 3 | `Organization (prov)` | [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 4 | `Organization (pay)` | [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 5 | `Coverage` | [Coverage](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Coverage.html) |
| 6 | `Practitioner` | [Practitioner](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Practitioner.html) |
| 7 | `Procedure` | [Procedure](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Procedure.html) |
| 8 | `QuestionnaireResponse` | `QuestionnaireResponse`, which NRCeS does not publish; base FHIR [QuestionnaireResponse](https://hl7.org/fhir/R4/questionnaireresponse.html) |
| 9 | `QuestionnaireResponse` | `QuestionnaireResponse`, which NRCeS does not publish; base FHIR [QuestionnaireResponse](https://hl7.org/fhir/R4/questionnaireresponse.html) |

###### 1. Claim

NRCeS profile: [Claim](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Claim.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `https://nhcx.abdm.gov.in`, value `NM-26-0SE00002N` |
| `identifier[].type.coding[]` | `CLN` Claim number in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code` |
| `status` | `active` |
| `type.coding[]` | `737481003` Inpatient care management (procedure) in `http://snomed.info/sct` |
| `use` | `preauthorization` |
| `patient` | reference `https://nhcx.abdm.gov.in/patient` |
| `billablePeriod` | start `2026-09-10T00:00:00+05:30`, end `2026-09-10T00:00:00+05:30` |
| `created` | `2026-09-10T23:55:36+05:30` |
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
| | and 6 more |
| `supportingInfo[].category.coding[]` | `INV` Document Type - Investigation in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
|  | `ONS` Period, start or end dates of aspects of the Condition. (e.g. admission, discha… in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
|  | `OTH` Other in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
| | and 2 more |
| `supportingInfo[].code.coding[]` | `MAND0455` CXR PA view or CECT chest abdomen and pelvis in `https://nhcx.abdm.gov.in/document-code` |
|  | `MAND0409` any investigations done in `https://nhcx.abdm.gov.in/document-code` |
|  | `MAND0570` Planned line of management in `https://nhcx.abdm.gov.in/document-code` |
| | and 5 more |
| `supportingInfo[].valueAttachment` | contentType `application/pdf`, title `CXR PA view or CECT chest abdomen and pelvis` |
|  | contentType `application/pdf`, title `any investigations done` |
|  | contentType `application/pdf`, title `Planned line of management` |
| | and 1 more |
| `supportingInfo[].valueReference` | reference `https://nhcx.abdm.gov.in/questionnaireresponse/1`, display `Admission Details` |
|  | reference `https://nhcx.abdm.gov.in/questionnaireresponse/2`, display `Authentication Consent` |
| `diagnosis[]` | sequence `1` |
| `diagnosis[].diagnosisCodeableConcept.coding[]` | `E11.9` Type 2 diabetes mellitus without complications in `http://hl7.org/fhir/sid/icd-10` |
| `diagnosis[].type[].coding[]` | `admitting` Admitting Diagnosis in `http://terminology.hl7.org/CodeSystem/ex-diagnosistype` |
| `diagnosis[].onAdmission.coding[]` | `yes` Yes in `http://terminology.hl7.org/CodeSystem/ex-diagnosis-on-admission` |
| `procedure[]` | id `Procedure/1`, sequence `1`, date `2026-09-10T00:00:00+05:30` |
| `procedure[].type[].coding[]` | `conservative` Conservative in `https://nhcx.abdm.gov.in/procedure-type` |
| `procedure[].procedureReference` | reference `https://nhcx.abdm.gov.in/procedure/1`, display `Pleural Effusion (Pleural Effusion)` |
| `insurance[]` | sequence `1`, focal `true` |
| `insurance[].coverage` | reference `https://nhcx.abdm.gov.in/coverage` |
| `item[]` | id `Item/1`, sequence `1`, factor `1`, careTeamSequence `1`, diagnosisSequence `1`, procedureSequence `1`, informationSequence `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9` |
| `item[].productOrService.coding[]` | `MG0111A` Pleural Effusion (Pleural Effusion) in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-procedure-code` |
| `item[].servicedPeriod` | start `2026-09-10`, end `2026-09-10` |
| `item[].quantity` | value `1` |
| `item[].unitPrice` | value `1800`, currency `INR` |
| `item[].net` | value `1800`, currency `INR` |
| `item[].category.coding[]` | `MG` General Medicine in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-benefit-category` |
| `item[].modifier[].coding[]` | `STRAT006a` Routine Ward |
| `item[].programCode[].coding[]` | `AB-PMJAY` Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY) in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-program-code` |
| `total` | value `1800`, currency `INR` |

###### 8. QuestionnaireResponse

| Element | Example |
| :-- | :-- |
| `questionnaire` | `https://payer.gov.in/policy/questionnaire/100020` |
| `status` | `completed` |
| `subject` | reference `https://nhcx.abdm.gov.in/patient` |
| `authored` | `2026-09-10T23:55:36+05:30` |
| `item[]` | linkId `100075`, text `Admission Date` |
|  | linkId `100074`, text `Surgery/Treatment Start Date` |
|  | linkId `100073`, text `Admission Type` |
| | and 1 more |
| `item[].answer[]` | valueDateTime `2026-09-10T18:25:00+05:30` |
|  | valueString `PLANNED` |
|  | valueString `Yes` |

###### 9. QuestionnaireResponse

| Element | Example |
| :-- | :-- |
| `questionnaire` | `https://payer.gov.in/policy/questionnaire/100024` |
| `status` | `completed` |
| `subject` | reference `https://nhcx.abdm.gov.in/patient` |
| `authored` | `2026-09-10T23:55:36+05:30` |
| `item[]` | linkId `100093`, text `Medical Superintendent Declaration Form (During Admission)` |
|  | linkId `100095`, text `Remarks` |
| `item[].answer[].valueAttachment` | contentType `application/pdf`, title `Medical Superintendent Declaration Form (During Admission)` |
| `item[].answer[]` | valueString `Recorded.` |

The `Patient`, `Organization`, `Coverage`, `Practitioner`, `Procedure` entries are shaped as in the chapters that introduce them.

### What PMJAY specifies

- The query arrives on `/v1/preauth/on_submit` under 24: a `ClaimResponse` with `outcome` `partial` and reason `queried`.
- The question is free text in `disposition` and in `item.adjudication` where the category is `reason`, in `reason.coding.display`, on the queried item; the other items can already read `Approve`. On a live case it grows into a log, split by `|` into turns and by `~` into user, timestamp, type, comment and desk. Tolerate a single segment, treat the literal `null` as empty, and never put `|` or `~` in anything you send back.
- The log is cumulative. The answer you sent reappears in it on the next response, which is the only sign it was read.
- The answer is the whole preauthorisation bundle again on `/v1/preauth/submit` under 19, on the same case number. The package's capture carries the reply under `supportingInfo` category `NMI`, code `CQD`; the live PMJAY provider sends no reply text and resends only the new documents, numbered on from the first submission.
- Send supporting-info dates in `+05:30`. The live PMJAY provider sends them at midnight `+00:00` and the payer takes them, so read both.

### What PMJAY requires

- Answer on 19, never on a new 12, which opens a second case.
- Query remarks, when sent, go under `supportingInfo` category `NMI`, code `CQD`, as a `valueString`. Refused with `PAYR-1504` otherwise.

## Use cases, APIs and data elements

### D7 Answer a pre-authorisation query (pmjay)

The query arrived as a ClaimResponse on 24, on the case's own thread, with the question in the item adjudication, not on the communication API. Answer with a fresh submit of the same bundle shape on this code, never as a new 12, which opens a second case.

| | |
| :-- | :-- |
| **API** | `/v1/preauth/submit` [`apis/03-preauth/v1-preauth-submit.bru`](../../apis/03-preauth/v1-preauth-submit.bru) |
| **Callback** | `/v1/preauth/on_submit` [`apis/03-preauth/v1-preauth-on-submit.bru`](../../apis/03-preauth/v1-preauth-on-submit.bru) |
| **Workflow** | 19 |
| **Carries JWE** | yes |
| **Focal resource** | `Claim` |
| **Simulator console** | `/builder?family=preauth&usecase=query-answer` |

**Request headers**

| Header | Example value |
| :-- | :-- |
| `x-hcx-sender_code` | `1000004446@hcx` |
| `x-hcx-recipient_code` | `1518@hcx` |
| `x-hcx-api_call_id` | `{{$guid}}` |
| `x-hcx-request_id` | `{{$guid}}` |
| `x-hcx-correlation_id` | `{{$guid}}` |
| `x-hcx-workflow_id` | `19` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `request.initiated` |
| `x-hcx-ben-abha-id` | `91-7112-3456-7890` |
| `x-hcx-use_case` | `New` |

**Workflow codes**

| Code | Name | Authored by | `x-hcx-status` | Means |
| :-- | :-- | :-- | :-- | :-- |
| `19` | Preauth Query Response Submitted | provider | `response.complete`; the answer is sent as `request.initiated` | Response to payer's query on preauth. Sent as request.initiated on v1/preauth/submit: NHCX refuses response.complete on a submit path with NHCX-1011 |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `claimNumber` | Case Number | Case | `string` | `1..1` | `Claim.identifier[0].value` | `NM-26-0SE00002N` |  |
| `workflowId` | Workflow Code | Header | `string` | `1..1` | `Header.x-hcx-workflow_id` | `19` |  |
| `queryAnswerText` | Query Answer (NMI) | Documents | `string` | `1..1` | `Claim.supportingInfo[category=NMI].valueString` | `Pre-operative investigation reports attached: CBC, RFT, chest X-ray and ECG.` |  |

NRCeS profiles: [Claim](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Claim.html).
