# Claim query and answer

The payer asking for something before it adjudicates a claim. A private insurer asks through a communication; PMJAY asks in the claim response and takes the whole claim back as the answer.

## The query

Sent on `/v1/communication/request`, workflow 27.

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
| `description` | `Share the final bill breakup and the discharge summary.` |
| `authoredOn` | `2026-09-10T23:52:39+05:30` |
| `requester` | reference `urn:uuid:39cd4b51-bddd-5cc1-a65a-6fa4a2a83cb5`, display `Organization` |
| `owner` | reference `urn:uuid:84d112ec-041c-57f8-986c-6619ccd8245e`, display `Organization` |
| `input[].type.coding[]` | `include` in `http://terminology.hl7.org/CodeSystem/financialtaskinputtype` |
| `input[].valueReference` | reference `urn:uuid:e6c95fe2-3bd5-5c9f-bf78-47959029cfe2`, display `CommunicationRequest` |

#### 2. CommunicationRequest

NRCeS profile: [CommunicationRequest](https://nrces.in/ndhm/fhir/r4/StructureDefinition-CommunicationRequest.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | value `NM-26-0SE00002K` |
| `basedOn[]` | reference `urn:uuid:5c997608-ee6c-5496-9fdb-f8415e3eb8d5`, display `Claim-claim` |
| `status` | `active` |
| `category[].coding[]` | `alert` in `http://terminology.hl7.org/CodeSystem/communication-category` |
| `priority` | `routine` |
| `payload[]` | contentString `Share the final bill breakup and the discharge summary.` |
| `authoredOn` | `2026-09-10T23:52:39+05:30` |
| `requester` | reference `urn:uuid:39cd4b51-bddd-5cc1-a65a-6fa4a2a83cb5`, display `Organization` |
| `recipient[]` | reference `urn:uuid:84d112ec-041c-57f8-986c-6619ccd8245e`, display `Organization` |
| `sender` | reference `urn:uuid:39cd4b51-bddd-5cc1-a65a-6fa4a2a83cb5`, display `Organization` |
| `reasonCode[]` | text `Share the final bill breakup and the discharge summary.` |
| `reasonCode[].coding[]` | `additionalinfo` Additional Information Request in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-reason-code` |

The `Claim`, `Patient`, `Organization`, `Practitioner`, `Coverage` entries are shaped as in the chapters that introduce them.

## The answer

Sent on `/v1/communication/on_request`, workflow 27, echoed.

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
| `authoredOn` | `2026-09-10T23:52:45+05:30` |
| `requester` | reference `https://nhcx.abdm.gov.in/provider`, display `Organization` |
| `owner` | reference `https://nhcx.abdm.gov.in/payer`, display `Organization` |
| `input[].type.coding[]` | `include` in `http://terminology.hl7.org/CodeSystem/financialtaskinputtype` |
| `input[].valueReference` | reference `urn:uuid:6840ec3f-7126-4bfc-8a56-c2a2e9576d8d`, display `Communication` |
| `reasonCode.coding[]` | `additionalinfo` Additional Information Request in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-reason-code` |

#### 2. Communication

NRCeS profile: [Communication](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Communication.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | value `NM-26-0SE00002K` |
| `basedOn[]` | reference `urn:uuid:e6c95fe2-3bd5-5c9f-bf78-47959029cfe2`, display `CommunicationRequest` |
| `inResponseTo[]` | reference `urn:uuid:e6c95fe2-3bd5-5c9f-bf78-47959029cfe2`, display `CommunicationRequest` |
| `about[]` | reference `https://nhcx.abdm.gov.in/claim/request`, display `Claim urn:uuid:5c997608-ee6c-5496-9fdb-f8415e3eb8d5` |
| `status` | `completed` |
| `category[].coding[]` | `notification` in `http://terminology.hl7.org/CodeSystem/communication-category` |
| `priority` | `routine` |
| `recipient[]` | reference `https://nhcx.abdm.gov.in/payer`, display `Organization` |
| `sender` | reference `https://nhcx.abdm.gov.in/provider`, display `Organization` |
| `payload[]` | contentString `Final bill and discharge summary attached.` |
| `payload[].contentAttachment` | contentType `application/pdf`, title `Proof of Identity (Aadhaar / Passport / Voter ID)`, creation `2026-09-10T23:52:21+05:30` |
|  | contentType `application/pdf`, title `Medical Certificate / Doctor Referral`, creation `2026-09-10T23:52:21+05:30` |
|  | contentType `application/pdf`, title `Radiology / X-Ray / CT / MRI Scan Reports`, creation `2026-09-10T23:52:21+05:30` |
| | and 6 more |
| `payload[].extension[]` | url `<participant-defined>`, valueString `POI` |
|  | url `<participant-defined>`, valueString `CER` |
|  | url `<participant-defined>`, valueString `RAD` |
| | and 6 more |

The `CommunicationRequest`, `Claim`, `Patient`, `Organization`, `Practitioner`, `Coverage` entries are shaped as in the chapters that introduce them.

## Rules

### 1. The generic query

A `Task` coded `poll`, reason `additionalinfo`, with an `include` input referencing a `CommunicationRequest` whose `basedOn` names the claim. Sent on `/v1/communication/request` under 27.

### 2. The generic answer

A `Task` coded `deliver` in `ndhm-task-codes`, `completed`, with an `include` input referencing a `Communication` whose `basedOn` names the request and whose `payload` carries the message and the documents. Posted on `/v1/communication/on_request`, echoing the correlation id and workflow id.

### 3. Keep attachments on their codes

When rebuilding a bundle to answer a query, key each attachment to its document code as you assemble it, and check the pairing before you send.

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
| `identifier[]` | system `https://hcx.pmjay.gov.in/v1/preauthorization`, value `NM-26-0SF00002T` |
| `identifier[].type.coding[]` | `CLN` Claim number in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code` |
| `status` | `active` |
| `use` | `claim` |
| `patient` | reference `https://payer.nha.gov.in/claim/v1/claim/on_submit/claimresponse/patient/PMJAY00…` |
| `created` | `2026-09-11T00:04:37+05:30` |
| `insurer` | reference `https://payer.nha.gov.in/claim/v1/claim/on_submit/claimresponse/organization/pa…` |
| `requestor` | reference `https://payer.nha.gov.in/claim/v1/claim/on_submit/claimresponse/organization/pr…` |
| `outcome` | `partial` |
| `disposition` | `query` |
| `payeeType.coding[]` | `provider` Provider in `http://terminology.hl7.org/CodeSystem/payeetype` |
| `item[]` | id `Item/Item/1`, itemSequence `1` |
| `item[].adjudication[].category.coding[]` | `submitted` Submitted Amount in `https://hl7.org/fhir/R4/valueset-adjudication.html` |
|  | `eligible` Eligible Amount in `https://hl7.org/fhir/R4/valueset-adjudication.html` |
|  | `reason` Reason for Adjudication in `https://hl7.org/fhir/R4/valueset-adjudication.html` |
| | and 3 more |
| `item[].adjudication[].amount` | value `1800` |
|  | value `2070` |
| `item[].adjudication[].reason.coding[]` | display ` : null` |
|  | `Queried` Queried |
| `item[].adjudication[]` | value `100` |
|  | value `0` |
| `adjudication[].category.coding[]` | `status` Status |
| `adjudication[].reason.coding[]` | `queried` Queried |
| `total[].category.coding[]` | `benefit` Benefit Amount in `https://hl7.org/fhir/R4/valueset-adjudication.html` |
|  | `submitted` Submitted Amount in `https://hl7.org/fhir/R4/valueset-adjudication.html` |
|  | `tax` Tax in `https://hl7.org/fhir/R4/valueset-adjudication.html` |
| | and 2 more |
| `total[].amount` | value `0` |
|  | value `1800` |
|  | value `2070` |
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
| 10 | `QuestionnaireResponse` | `QuestionnaireResponse`, which NRCeS does not publish; base FHIR [QuestionnaireResponse](https://hl7.org/fhir/R4/questionnaireresponse.html) |
| 11 | `QuestionnaireResponse` | `QuestionnaireResponse`, which NRCeS does not publish; base FHIR [QuestionnaireResponse](https://hl7.org/fhir/R4/questionnaireresponse.html) |
| 12 | `QuestionnaireResponse` | `QuestionnaireResponse`, which NRCeS does not publish; base FHIR [QuestionnaireResponse](https://hl7.org/fhir/R4/questionnaireresponse.html) |
| 13 | `QuestionnaireResponse` | `QuestionnaireResponse`, which NRCeS does not publish; base FHIR [QuestionnaireResponse](https://hl7.org/fhir/R4/questionnaireresponse.html) |

###### 1. Claim

NRCeS profile: [Claim](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Claim.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `https://nhcx.abdm.gov.in`, value `NM-26-0SF00002T` |
| `identifier[].type.coding[]` | `CLN` Claim number in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code` |
| `status` | `active` |
| `type.coding[]` | `737481003` Inpatient care management (procedure) in `http://snomed.info/sct` |
| `use` | `claim` |
| `patient` | reference `https://nhcx.abdm.gov.in/patient` |
| `billablePeriod` | start `2026-09-10T00:00:00+05:30`, end `2026-09-10T00:00:00+05:30` |
| `created` | `2026-09-11T00:04:45+05:30` |
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
| | and 24 more |
| `supportingInfo[].category.coding[]` | `INV` Document Type - Investigation in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
|  | `HDS` Hospital discharge summary in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
|  | `ONS` Period, start or end dates of aspects of the Condition. (e.g. admission, discha… in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
| | and 4 more |
| `supportingInfo[].code.coding[]` | `ODN` Death Certificate in `https://nhcx.abdm.gov.in/document-code` |
|  | `ODN` Clinical Note/Death Summary in `https://nhcx.abdm.gov.in/document-code` |
|  | `ODN` Mortality audit report in `https://nhcx.abdm.gov.in/document-code` |
| | and 17 more |
| `supportingInfo[].valueAttachment` | contentType `application/pdf`, title `Death Certificate` |
|  | contentType `application/pdf`, title `Clinical Note/Death Summary` |
|  | contentType `application/pdf`, title `Mortality audit report` |
| | and 10 more |
| `supportingInfo[].valueReference` | reference `https://nhcx.abdm.gov.in/questionnaireresponse/1`, display `Death` |
|  | reference `https://nhcx.abdm.gov.in/questionnaireresponse/2`, display `Discharge Against Medical Advice (DAMA)` |
|  | reference `https://nhcx.abdm.gov.in/questionnaireresponse/3`, display `Discharge Consent` |
| | and 3 more |
| `diagnosis[]` | sequence `1` |
| `diagnosis[].diagnosisCodeableConcept.coding[]` | `E11.9` Type 2 diabetes mellitus without complications in `http://hl7.org/fhir/sid/icd-10` |
| `diagnosis[].type[].coding[]` | `admitting` Admitting Diagnosis in `http://terminology.hl7.org/CodeSystem/ex-diagnosistype` |
| `diagnosis[].onAdmission.coding[]` | `yes` Yes in `http://terminology.hl7.org/CodeSystem/ex-diagnosis-on-admission` |
| `procedure[]` | id `Procedure/1`, sequence `1`, date `2026-09-10T00:00:00+05:30` |
| `procedure[].type[].coding[]` | `conservative` Conservative in `https://nhcx.abdm.gov.in/procedure-type` |
| `procedure[].procedureReference` | reference `https://nhcx.abdm.gov.in/procedure/1`, display `Pleural Effusion (Pleural Effusion)` |
| `insurance[]` | sequence `1`, focal `true`, preAuthRef `2026091110000795` |
| `insurance[].coverage` | reference `https://nhcx.abdm.gov.in/coverage` |
| `item[]` | id `Item/1`, sequence `1`, factor `1`, careTeamSequence `1`, diagnosisSequence `1`, procedureSequence `1`, informationSequence `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `11`, `12`, `13`, `14`, `15`, `16`, `17`, `18`, `19`, `20`, `21`, `22`, `23`, `24`, `25`, `26`, `27` |
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
| `questionnaire` | `https://payer.gov.in/policy/questionnaire/100025` |
| `status` | `completed` |
| `subject` | reference `https://nhcx.abdm.gov.in/patient` |
| `authored` | `2026-09-11T00:04:45+05:30` |
| `item[]` | linkId `100011`, text `Death Stage` |
|  | linkId `100098`, text `Death Date` |
|  | linkId `100099`, text `Death Certificate` |
| | and 2 more |
| `item[].answer[]` | valueString `Before Surgery/Treatment` |
|  | valueDateTime `2026-09-10T18:34:00+05:30` |
| `item[].answer[].valueAttachment` | contentType `application/pdf`, title `Death Certificate` |
|  | contentType `application/pdf`, title `Clinical Note/Death Summary` |
|  | contentType `application/pdf`, title `Mortality audit report` |

###### 9. QuestionnaireResponse

| Element | Example |
| :-- | :-- |
| `questionnaire` | `https://payer.gov.in/policy/questionnaire/100137` |
| `status` | `completed` |
| `subject` | reference `https://nhcx.abdm.gov.in/patient` |
| `authored` | `2026-09-11T00:04:45+05:30` |
| `item[]` | linkId `103020`, text `DAMA Stage` |
|  | linkId `101403`, text `In Treatment Photo with Doctor/PMAM` |
|  | linkId `100012`, text `Discharge Date` |
| | and 3 more |
| `item[].answer[]` | valueString `Before Surgery/Treatment` |
|  | valueDateTime `2026-09-10T18:34:00+05:30` |
| `item[].answer[].valueAttachment` | contentType `application/pdf`, title `In Treatment Photo with Doctor/PMAM` |
|  | contentType `application/pdf`, title `Upload Mangalkamana Patra` |
|  | contentType `application/pdf`, title `Feedback Form` |

###### 10. QuestionnaireResponse

| Element | Example |
| :-- | :-- |
| `questionnaire` | `https://payer.gov.in/policy/questionnaire/100466` |
| `status` | `completed` |
| `subject` | reference `https://nhcx.abdm.gov.in/patient` |
| `authored` | `2026-09-11T00:04:45+05:30` |
| `item[]` | linkId `135477`, text `Medical Superintendent Declaration Form (During Discharge)` |
| `item[].answer[].valueAttachment` | contentType `application/pdf`, title `Medical Superintendent Declaration Form (During Discharge)` |

###### 11. QuestionnaireResponse

| Element | Example |
| :-- | :-- |
| `questionnaire` | `https://payer.gov.in/policy/questionnaire/100005` |
| `status` | `completed` |
| `subject` | reference `https://nhcx.abdm.gov.in/patient` |
| `authored` | `2026-09-11T00:04:45+05:30` |
| `item[]` | linkId `100097`, text `Post Treatment Photo with Doctor/PMAM` |
|  | linkId `100096`, text `Discharge Summary` |
|  | linkId `101799`, text `Discharge Stage` |
| | and 4 more |
| `item[].answer[].valueAttachment` | contentType `application/pdf`, title `Post Treatment Photo with Doctor/PMAM` |
|  | contentType `application/pdf`, title `Discharge Summary` |
|  | contentType `application/pdf`, title `Feedback Form` |
| `item[].answer[]` | valueString `After Surgery/Treatment` |
|  | valueDateTime `2026-09-10T18:34:00+05:30` |
|  | valueString `Yes` |

###### 12. QuestionnaireResponse

| Element | Example |
| :-- | :-- |
| `questionnaire` | `https://payer.gov.in/policy/questionnaire/100022` |
| `status` | `completed` |
| `subject` | reference `https://nhcx.abdm.gov.in/patient` |
| `authored` | `2026-09-11T00:04:45+05:30` |
| `item[]` | linkId `100088`, text `Hospital Bill` |
|  | linkId `15201`, text `Justification Letter` |
|  | linkId `103013`, text `Bill Date` |
| | and 4 more |
| `item[].answer[].valueAttachment` | contentType `application/pdf`, title `Hospital Bill` |
|  | contentType `application/pdf`, title `Justification Letter` |
|  | contentType `application/pdf`, title `Any other document` |
| `item[].answer[]` | valueDateTime `2026-09-10T18:34:00+05:30` |
|  | valueString `Recorded.` |

###### 13. QuestionnaireResponse

| Element | Example |
| :-- | :-- |
| `questionnaire` | `https://payer.gov.in/policy/questionnaire/100136` |
| `status` | `completed` |
| `subject` | reference `https://nhcx.abdm.gov.in/patient` |
| `authored` | `2026-09-11T00:04:45+05:30` |
| `item[]` | linkId `100115`, text `LAMA Stage` |
|  | linkId `101403`, text `In Treatment Photo with Doctor/PMAM` |
|  | linkId `100101`, text `Surgery/Treatment Date` |
| | and 2 more |
| `item[].answer[]` | valueString `Before Surgery/Treatment` |
|  | valueDateTime `2026-09-10T18:34:00+05:30` |
|  | valueString `Yes` |
| `item[].answer[].valueAttachment` | contentType `application/pdf`, title `In Treatment Photo with Doctor/PMAM` |

The `Patient`, `Organization`, `Coverage`, `Practitioner`, `Procedure` entries are shaped as in the chapters that introduce them.

### What PMJAY specifies

- The query is a `ClaimResponse` with `outcome` `partial` and reason `queried` on 27, the question as free text in the item adjudication.
- The answer is a fresh submit of the whole claim, on the same claim number, under 161.

### What PMJAY requires

- Answer on 161. A claim query answered on 151, 19 or 16 is refused with `PAYR-1321`.
- The full bundle, rebuilt from your stored submission, never a delta.

## Use cases, APIs and data elements

### D10 Answer a claim query (pmjay)

As D7, on the claim endpoint: the query is a ClaimResponse on 27, the answer a fresh submit on 161. The sandbox refuses 151, 19 and 16 with PAYR-1321. The final adjudication then arrives with outcome complete and, often, a deductible adjudication naming why the eligible amount is less than the claimed one.

| | |
| :-- | :-- |
| **API** | `/v1/claim/submit` [`apis/05-claim/v1-claim-submit.bru`](../../apis/05-claim/v1-claim-submit.bru) |
| **Callback** | `/v1/claim/on_submit` [`apis/05-claim/v1-claim-on-submit.bru`](../../apis/05-claim/v1-claim-on-submit.bru) |
| **Workflow** | 161 |
| **Carries JWE** | yes |
| **Focal resource** | `Claim` |
| **Simulator console** | `/builder?family=claim&usecase=query-answer` |

**Request headers**

| Header | Example value |
| :-- | :-- |
| `x-hcx-sender_code` | `1000004446@hcx` |
| `x-hcx-recipient_code` | `1518@hcx` |
| `x-hcx-api_call_id` | `{{$guid}}` |
| `x-hcx-request_id` | `{{$guid}}` |
| `x-hcx-correlation_id` | `{{$guid}}` |
| `x-hcx-workflow_id` | `161` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `request.initiated` |
| `x-hcx-ben-abha-id` | `91711234567890` |
| `x-hcx-use_case` | `New` |

**Workflow codes**

| Code | Name | Authored by | `x-hcx-status` | Means |
| :-- | :-- | :-- | :-- | :-- |
| `161` | Claim Doc Query Response | status sheet only | `response.complete` |  |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `claimNumber` | Claim Number | Case | `string` | `1..1` | `Claim.identifier[0].value` | `CL26AA2600001` |  |
| `workflowId` | Workflow Code | Header | `string` | `1..1` | `Header.x-hcx-workflow_id` | `161` |  |

NRCeS profiles: [Claim](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Claim.html).
