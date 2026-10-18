# Preauthorisation enhancement

Extends an approved preauthorisation: a longer stay or an added package. The same endpoint and the same case number, under workflow 13, with the header `x-hcx-use_case: Enhancement` and a new correlation id.

Sent on `/v1/preauth/submit`, answered on `/v1/preauth/on_submit`, workflow 13, and 131 to answer an enhancement query.

## The bundle

| # | Resource | Profile |
| :-- | :-- | :-- |
| 1 | `Claim` | [Claim](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Claim.html) |
| 2 | `Patient` | [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html) |
| 3 | `Organization (prov)` | [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 4 | `Organization (pay)` | [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 5 | `Coverage` | [Coverage](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Coverage.html) |
| 6 | `Practitioner` | [Practitioner](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Practitioner.html) |
| 7 | `Procedure` | [Procedure](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Procedure.html) |
| 8 | `Procedure` | [Procedure](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Procedure.html) |
| 9 | `QuestionnaireResponse` | `QuestionnaireResponse`, which NRCeS does not publish; base FHIR [QuestionnaireResponse](https://hl7.org/fhir/R4/questionnaireresponse.html) |

## Elements

### 1. Claim

NRCeS profile: [Claim](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Claim.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `https://nhcx.abdm.gov.in`, value `NM-26-0SE00002G` |
| `identifier[].type.coding[]` | `CLN` Claim number in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code` |
| `status` | `active` |
| `type.coding[]` | `737481003` Inpatient care management (procedure) in `http://snomed.info/sct` |
| `use` | `preauthorization` |
| `patient` | reference `https://nhcx.abdm.gov.in/patient` |
| `billablePeriod` | start `2026-09-10T00:00:00+05:30`, end `2026-09-10T00:00:00+05:30` |
| `created` | `2026-09-10T23:50:33+05:30` |
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
| | and 8 more |
| `supportingInfo[].category.coding[]` | `INV` Document Type - Investigation in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
|  | `ONS` Period, start or end dates of aspects of the Condition. (e.g. admission, discha… in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
|  | `OTH` Other in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
| | and 1 more |
| `supportingInfo[].code.coding[]` | `POI` Proof of Identity (Aadhaar / Passport / Voter ID) in `https://nhcx.abdm.gov.in/document-code` |
|  | `CER` Medical Certificate / Doctor Referral in `https://nhcx.abdm.gov.in/document-code` |
|  | `RAD` Radiology / X-Ray / CT / MRI Scan Reports in `https://nhcx.abdm.gov.in/document-code` |
| | and 8 more |
| `supportingInfo[].valueAttachment` | contentType `application/pdf`, title `Proof of Identity (Aadhaar / Passport / Voter ID)` |
|  | contentType `application/pdf`, title `Medical Certificate / Doctor Referral` |
|  | contentType `application/pdf`, title `Radiology / X-Ray / CT / MRI Scan Reports` |
| | and 5 more |
| `supportingInfo[].valueReference` | reference `https://nhcx.abdm.gov.in/questionnaireresponse/1`, display `Total Knee Replacement (Unilateral), Standard Treatment Guidelines` |
| `diagnosis[]` | sequence `1` |
| `diagnosis[].diagnosisCodeableConcept.coding[]` | `E11.9` Type 2 diabetes mellitus without complications in `http://hl7.org/fhir/sid/icd-10` |
| `diagnosis[].type[].coding[]` | `admitting` Admitting Diagnosis in `http://terminology.hl7.org/CodeSystem/ex-diagnosistype` |
| `diagnosis[].onAdmission.coding[]` | `yes` Yes in `http://terminology.hl7.org/CodeSystem/ex-diagnosis-on-admission` |
| `procedure[]` | id `Procedure/1`, sequence `1`, date `2026-09-10T00:00:00+05:30` |
|  | id `Procedure/2`, sequence `2`, date `2026-09-10T00:00:00+05:30` |
| `procedure[].type[].coding[]` | `surgical` Surgical in `https://nhcx.abdm.gov.in/procedure-type` |
| `procedure[].procedureReference` | reference `https://nhcx.abdm.gov.in/procedure/1`, display `Total Knee Replacement (Unilateral)` |
|  | reference `https://nhcx.abdm.gov.in/procedure/2`, display `Acute Appendectomy (Laparoscopic)` |
| `insurance[]` | sequence `1`, focal `true` |
| `insurance[].coverage` | reference `https://nhcx.abdm.gov.in/coverage` |
| `item[]` | id `Item/1`, sequence `1`, factor `1`, careTeamSequence `1`, diagnosisSequence `1`, procedureSequence `1`, informationSequence `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `11` |
|  | id `Item/2`, sequence `2`, factor `1`, careTeamSequence `1`, diagnosisSequence `1`, procedureSequence `2`, informationSequence `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `11` |
| `item[].productOrService.coding[]` | `PROC-KNEE-01` Total Knee Replacement (Unilateral) in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-procedure-code` |
|  | `PROC-APP-02` Acute Appendectomy (Laparoscopic) in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-procedure-code` |
| `item[].servicedPeriod` | start `2026-09-10`, end `2026-09-10` |
| `item[].quantity` | value `1` |
| `item[].unitPrice` | value `150000`, currency `INR` |
|  | value `45000`, currency `INR` |
| `item[].net` | value `150000`, currency `INR` |
|  | value `45000`, currency `INR` |
| `item[].category.coding[]` | `Surgical` Surgical in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-benefit-category` |
| `total` | value `195000`, currency `INR` |

### 2. Patient

NRCeS profile: [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | value `MRAV1985001` |
|  | value `91-1234-1234-1234` |
| `identifier[].type.coding[]` | `PMJAY` Pradhan Mantri Jan Aarogya Yojana (PMJAY) ID in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code` |
|  | `ABHA` Ayushman Bharat Health Account (ABHA) ID in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code` |
|  | `MB` Member Number in `http://terminology.hl7.org/CodeSystem/v2-0203` |
| `name[]` | text `<patient name>` |
| `telecom[]` | system `phone`, value `9876543210` |
| `gender` | `male` |
| `birthDate` | `1985-06-15` |

### 3. Organization (prov)

NRCeS profile: [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `https://nhcx.abdm.gov.in`, value `IN1910000151` |
| `identifier[].type.coding[]` | `NPI` National provider identifier in `http://terminology.hl7.org/CodeSystem/v2-0203` |
| `type[].coding[]` | `prov` Healthcare Provider in `http://terminology.hl7.org/CodeSystem/organization-type` |
| `name` | `KyroCare Multispeciality Hospital` |

### 4. Organization (pay)

NRCeS profile: [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `https://nhcx.abdm.gov.in`, value `1000004805` |
| `identifier[].type.coding[]` | `NIIP` National Insurance Payor Identifier (Payor) in `http://terminology.hl7.org/CodeSystem/v2-0203` |
| `type[].coding[]` | `pay` Payer in `http://terminology.hl7.org/CodeSystem/organization-type` |
| `name` | `Sandbox Payer` |

### 5. Coverage

NRCeS profile: [Coverage](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Coverage.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | value `POL7UMU001` |
| `identifier[].type.coding[]` | `NH` National Health Plan Identifier in `http://terminology.hl7.org/CodeSystem/v2-0203` |
| `status` | `active` |
| `type.coding[]` | `HIP` health insurance plan policy in `http://terminology.hl7.org/CodeSystem/v3-ActCode` |
| `subscriber` | reference `https://nhcx.abdm.gov.in/patient` |
| `subscriberId` | `MRAV1985001` |
| `beneficiary` | reference `https://nhcx.abdm.gov.in/patient` |
| `relationship.coding[]` | `self` in `http://terminology.hl7.org/CodeSystem/subscriber-relationship` |
| `payor[]` | reference `https://nhcx.abdm.gov.in/payer` |

### 6. Practitioner

NRCeS profile: [Practitioner](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Practitioner.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `https://nhcx.abdm.gov.in`, value `71-8422-5818-7201` |
|  | system `https://hpr.abdm.gov.in`, value `71-8422-5818-7201` |
| `identifier[].type.coding[]` | `HPID` Healthcare Professional ID (HPID) in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code` |
|  | `HPIN` Health Practitioner ID issued by NDHM in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code` |
| `name[]` | text `Dr. Ananya Rao` |
| `qualification[].code.coding[]` | `MD` Doctor of Medicine in `http://terminology.hl7.org/CodeSystem/v2-0360` |

### 7. Procedure

NRCeS profile: [Procedure](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Procedure.html).

| Element | Example |
| :-- | :-- |
| `status` | `preparation` |
| `code` | text `Total Knee Replacement (Unilateral)` |
| `code.coding[]` | `71388002` Procedure (procedure) in `http://snomed.info/sct` |
| `subject` | reference `https://nhcx.abdm.gov.in/patient` |
| `performedDateTime` | `2026-09-10T00:00:00+05:30` |

### 8. Procedure

NRCeS profile: [Procedure](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Procedure.html).

| Element | Example |
| :-- | :-- |
| `status` | `preparation` |
| `code` | text `Acute Appendectomy (Laparoscopic)` |
| `code.coding[]` | `71388002` Procedure (procedure) in `http://snomed.info/sct` |
| `subject` | reference `https://nhcx.abdm.gov.in/patient` |
| `performedDateTime` | `2026-09-10T00:00:00+05:30` |

### 9. QuestionnaireResponse

| Element | Example |
| :-- | :-- |
| `questionnaire` | `<participant-defined>` |
| `status` | `completed` |
| `subject` | reference `https://nhcx.abdm.gov.in/patient` |
| `authored` | `2026-09-10T23:50:33+05:30` |
| `item[]` | linkId `PROC-KNEE-01/stg/1`, text `Duration of symptoms and the conservative treatment tried (months of physiother…` |
|  | linkId `PROC-KNEE-01/stg/2`, text `Kellgren-Lawrence grade of osteoarthritis on the standing X-ray` |
|  | linkId `PROC-KNEE-01/stg/3`, text `Range of motion and deformity of the knee (flexion contracture, varus/valgus)` |
| | and 2 more |
| `item[].answer[]` | valueString `Recorded.` |

## Rules

### 1. The protocol says enhancement, not the payload

`Claim.use` stays `preauthorization` and the case number is unchanged. The workflow code and `x-hcx-use_case` declare the enhancement.

### 2. Cumulative

Carry the approved items and the ones now sought. `Claim.total` is the sum of all of them.

### 3. No link in the payload

`Claim.related` is absent. The case number and your stored correlation ids are the thread.

### 4. One at a time

Refused when there is no approval, when a request on the case is still open, or after the claim has been raised.

### 5. Order

Response items can come back out of order; read by `itemSequence`. Order a case's messages by receipt, not by `Bundle.timestamp`.

## PMJAY

The generic bundle above is what every payer takes, IRDAI-regulated insurers and TPAs included. PMJAY takes it with the changes and requirements below.

### What changes in the bundle

#### Resources

- PMJAY adds 1 `QuestionnaireResponse`.

#### Elements PMJAY adds

| Element | Example |
| :-- | :-- |
| `Claim.item[].modifier[].coding[]` | `STRAT006a` Routine Ward |
| `Claim.item[].programCode[].coding[]` | `AB-PMJAY` Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY) in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-program-code` |
| `QuestionnaireResponse.item[].answer[].valueAttachment` | contentType `application/pdf`, title `Medical Superintendent Declaration Form (During Admission)` |

### What PMJAY specifies

- On the response, the `benefit` total is the increment and the wallet's `eligible` total is cumulative.
- The acknowledgement carries no `preAuthRef`. Carry the parent case id onto the enhancement yourself.
- A query on an enhancement arrives on 241 and is answered by a fresh submit on 131.

### What PMJAY requires

- Only packages flagged `EnhancementAllowed` `Y` may be added.
- One `Conservative` package per case. Refused with `PAYR-1245`.
- One request at a time on a case. Refused with `PAYR-1322`.

## Use cases, APIs and data elements

### D6 Raise an enhancement (pmjay)

Adds to an approved pre-authorisation, as many times as needed until discharge, one at a time, and only for packages whose plan flag allows it. The bundle carries the approved items and the ones now sought. A query on it arrives as a ClaimResponse on 241, on the case's own thread, and is answered by a fresh submit on 131.

| | |
| :-- | :-- |
| **API** | `/v1/preauth/submit` [`apis/03-preauth/v1-preauth-enhancement.bru`](../../apis/03-preauth/v1-preauth-enhancement.bru) |
| **Callback** | `/v1/preauth/on_submit` [`apis/03-preauth/v1-preauth-on-submit.bru`](../../apis/03-preauth/v1-preauth-on-submit.bru) |
| **Workflow** | 13, and 131 to answer an enhancement query raised on 241 |
| **Carries JWE** | yes |
| **Focal resource** | `Claim` |
| **Simulator console** | `/builder?family=preauth&usecase=enhance` |

**Request headers**

| Header | Example value |
| :-- | :-- |
| `x-hcx-sender_code` | `1000004446@hcx` |
| `x-hcx-recipient_code` | `1518@hcx` |
| `x-hcx-api_call_id` | `{{$guid}}` |
| `x-hcx-request_id` | `{{$guid}}` |
| `x-hcx-correlation_id` | `{{$guid}}` |
| `x-hcx-workflow_id` | `13` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `request.initiated` |
| `x-hcx-ben-abha-id` | `91-7112-3456-7890` |
| `x-hcx-use_case` | `Enhancement` |

**Workflow codes**

| Code | Name | Authored by | `x-hcx-status` | Means |
| :-- | :-- | :-- | :-- | :-- |
| `13` | Enhancement Request Initiated | provider | `request.initiated` | Enhancement (additional amount) request |
| `131` | Enhancement Query Response Submitted | provider | `response.partial`, `response.error`, `response.complete`; the answer is sent as `request.initiated` | Response to enhancement query. Sent as request.initiated on v1/preauth/submit: NHCX refuses response.complete on a submit path with NHCX-1011 |
| `241` | Enhancement Request Queried | payer | `request.initiated` | Enhancement request queried by payer |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `claimNumber` | Case Number | Case | `string` | `1..1` | `Claim.identifier[0].value` | `NM-26-0SF000031` |  |
| `preAuthRef` | Initial Approval Reference | Case | `string` | `0..1` | `Claim.insurance[0].preAuthRef[0]` |  |  |
| `workflowId` | Workflow Code | Header | `string` | `1..1` | `Header.x-hcx-workflow_id` | `13` |  |

NRCeS profiles: [Claim](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Claim.html).
