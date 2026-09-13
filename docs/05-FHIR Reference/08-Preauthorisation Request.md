# Preauthorisation request

The first bundle with clinical content. The provider asks the payer to approve a treatment before it is given. The spine is a `Claim` with `use` set to `preauthorization`.

Sent on `/v1/preauth/submit`, answered on `/v1/preauth/on_submit`, workflow 12 new, 121 resubmission.

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
| 8 | `QuestionnaireResponse` | `QuestionnaireResponse`, which NRCeS does not publish; base FHIR [QuestionnaireResponse](https://hl7.org/fhir/R4/questionnaireresponse.html) |

## Elements

### 1. Claim

NRCeS profile: [Claim](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Claim.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `https://nhcx.abdm.gov.in`, value `NM-26-0SE00002M` |
| `identifier[].type.coding[]` | `CLN` Claim number in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code` |
| `status` | `active` |
| `type.coding[]` | `737481003` Inpatient care management (procedure) in `http://snomed.info/sct` |
| `use` | `preauthorization` |
| `patient` | reference `https://nhcx.abdm.gov.in/patient` |
| `billablePeriod` | start `2026-09-10T00:00:00+05:30`, end `2026-09-10T00:00:00+05:30` |
| `created` | `2026-09-10T23:53:57+05:30` |
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
| | and 9 more |
| `supportingInfo[].category.coding[]` | `INV` Document Type - Investigation in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
|  | `ONS` Period, start or end dates of aspects of the Condition. (e.g. admission, discha… in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
|  | `OTH` Other in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
| | and 1 more |
| `supportingInfo[].code.coding[]` | `POI` Proof of Identity (Aadhaar / Passport / Voter ID) in `https://nhcx.abdm.gov.in/document-code` |
|  | `CER` Medical Certificate / Doctor Referral in `https://nhcx.abdm.gov.in/document-code` |
|  | `RAD` Radiology / X-Ray / CT / MRI Scan Reports in `https://nhcx.abdm.gov.in/document-code` |
| | and 9 more |
| `supportingInfo[].valueAttachment` | contentType `application/pdf`, title `Proof of Identity (Aadhaar / Passport / Voter ID)` |
|  | contentType `application/pdf`, title `Medical Certificate / Doctor Referral` |
|  | contentType `application/pdf`, title `Radiology / X-Ray / CT / MRI Scan Reports` |
| | and 6 more |
| `supportingInfo[].valueReference` | reference `https://nhcx.abdm.gov.in/questionnaireresponse/1`, display `Total Knee Replacement (Unilateral), Standard Treatment Guidelines` |
| `diagnosis[]` | sequence `1` |
| `diagnosis[].diagnosisCodeableConcept.coding[]` | `E11.9` Type 2 diabetes mellitus without complications in `http://hl7.org/fhir/sid/icd-10` |
| `diagnosis[].type[].coding[]` | `admitting` Admitting Diagnosis in `http://terminology.hl7.org/CodeSystem/ex-diagnosistype` |
| `diagnosis[].onAdmission.coding[]` | `yes` Yes in `http://terminology.hl7.org/CodeSystem/ex-diagnosis-on-admission` |
| `procedure[]` | id `Procedure/1`, sequence `1`, date `2026-09-10T00:00:00+05:30` |
| `procedure[].type[].coding[]` | `surgical` Surgical in `https://nhcx.abdm.gov.in/procedure-type` |
| `procedure[].procedureReference` | reference `https://nhcx.abdm.gov.in/procedure/1`, display `Total Knee Replacement (Unilateral)` |
| `insurance[]` | sequence `1`, focal `true` |
| `insurance[].coverage` | reference `https://nhcx.abdm.gov.in/coverage` |
| `item[]` | id `Item/1`, sequence `1`, factor `1`, careTeamSequence `1`, diagnosisSequence `1`, procedureSequence `1`, informationSequence `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `11`, `12` |
| `item[].productOrService.coding[]` | `PROC-KNEE-01` Total Knee Replacement (Unilateral) in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-procedure-code` |
| `item[].servicedPeriod` | start `2026-09-10`, end `2026-09-10` |
| `item[].quantity` | value `1` |
| `item[].unitPrice` | value `150000`, currency `INR` |
| `item[].net` | value `150000`, currency `INR` |
| `item[].category.coding[]` | `Surgical` Surgical in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-benefit-category` |
| `total` | value `150000`, currency `INR` |

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

### 8. QuestionnaireResponse

| Element | Example |
| :-- | :-- |
| `questionnaire` | `<participant-defined>` |
| `status` | `completed` |
| `subject` | reference `https://nhcx.abdm.gov.in/patient` |
| `authored` | `2026-09-10T23:53:57+05:30` |
| `item[]` | linkId `PROC-KNEE-01/stg/1`, text `Duration of symptoms and the conservative treatment tried (months of physiother…` |
|  | linkId `PROC-KNEE-01/stg/2`, text `Kellgren-Lawrence grade of osteoarthritis on the standing X-ray` |
|  | linkId `PROC-KNEE-01/stg/3`, text `Range of motion and deformity of the knee (flexion contracture, varus/valgus)` |
| | and 2 more |
| `item[].answer[]` | valueString `Recorded.` |

## Rules

### 1. The case number

`Claim.identifier`, typed `CLN`, carries the provider's case number. Every later message on the case, the payer's included, names it.

### 2. One focal insurance

Exactly one `Claim.insurance[]` entry carries `focal: true`.

### 3. Items

Each item links to the care team, diagnosis and procedure by sequence. `net` is `unitPrice` times `quantity`; do not compute with `factor`. `Claim.total` equals the sum of the item nets.

### 4. Documents

The mandatory document codes are the ones the auth-requirements answer returned. Send each code and display exactly as given.

### 5. The STG answers

Each package's STG questionnaire is answered as a `QuestionnaireResponse` in the bundle, with the `linkId`s the plan gives.

### 6. Claim.type

SNOMED `737481003`, Inpatient care management. Payers echo it, some under the `ndhm-claim-type` ValueSet URL.

### 7. References to records

A `valueReference` may point at the `Composition` heading an embedded record rather than at a `DocumentReference`. Follow the reference, then walk the record.

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

- `item.programCode` carries `AB-PMJAY` under `ndhm-program-code`.
- `item.modifier` carries the ward tier from the master's stratification codes, and `item.category` the master's specialty code.
- The Authentication Consent answer is a second `QuestionnaireResponse` beside the STG answers, with its attachments as `valueAttachment` and its dates as `valueDateTime`.
- Document codes are the `MAND` codes the auth-requirements answer returned.

### What PMJAY requires

- The biometric user token on the request, or the plan's Authentication Consent questionnaire answered as a `QuestionnaireResponse`. Refused with `PAYR-1256` otherwise.
- The STG questionnaire answered for every package that needs one. Refused with `PAYR-1254` otherwise.
- Not more than one day before admission, with the registration and admission dates as supporting information.
- One live preauthorisation per beneficiary per hospital. Refused with `PAYR-1238` while another is open.
- `LM100` is not allowed on a preauthorisation. Refused with `PAYR-1270`.
- Auto-approval only when this is the first preauthorisation on the case and every package carries `ApprovalNotRequired` `Y`.

## Use cases, APIs and data elements

### B3 Submit pre-authorisation (provider)

Permission to treat. A resubmission, an enhancement and a query answer all reuse the same bundle with a new correlation id and the original reference; only the workflow code tells them apart. The acknowledgement on 20 brings the payer's own case number, and the desk files everything under it.

| | |
| :-- | :-- |
| **API** | `/v1/preauth/submit` [`apis/03-preauth/v1-preauth-submit.bru`](../../apis/03-preauth/v1-preauth-submit.bru) |
| **Callback** | `/v1/preauth/on_submit` [`apis/03-preauth/v1-preauth-on-submit.bru`](../../apis/03-preauth/v1-preauth-on-submit.bru) |
| **Workflow** | 12 new, 121 resubmission, 13 enhancement; under PMJAY 19 answers a query and 131 an enhancement query |
| **Carries JWE** | yes |
| **Focal resource** | `Claim` |

**Request headers**

| Header | Example value |
| :-- | :-- |
| `x-hcx-sender_code` | `1000004446@hcx` |
| `x-hcx-recipient_code` | `1518@hcx` |
| `x-hcx-api_call_id` | `{{$guid}}` |
| `x-hcx-request_id` | `{{$guid}}` |
| `x-hcx-correlation_id` | `{{$guid}}` |
| `x-hcx-workflow_id` | `12` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `request.initiated` |
| `x-hcx-ben-abha-id` | `91711234567890` |
| `x-hcx-use_case` | `New` |

**Workflow codes**

| Code | Name | Authored by | `x-hcx-status` | Means |
| :-- | :-- | :-- | :-- | :-- |
| `12` | Preauth Request Initiated | provider | `request.initiated` | New preauth submission |
| `121` | Preauth Request Resubmitted | provider | `request.initiated` | Resubmission after query/rejection |
| `13` | Enhancement Request Initiated | provider | `request.initiated` | Enhancement (additional amount) request |
| `19` | Preauth Query Response Submitted | provider | `response.complete` | Response to payer's query on preauth |
| `131` | Enhancement Query Response Submitted | provider | `response.partial`, `response.error`, `response.complete` | Response to enhancement query |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `claimNumber` | Pre-auth Case Number | Case | `string` | `1..1` | `Claim.identifier[0].value` | `PA20260226001` | also at `Bundle.id` |
| `use` | Claim Use | Case | `code` | `1..1` | `Claim.use` | `preauthorization` |  |
| `preAuthRef` | Approval Reference (if enhancement) | Case | `string` | `0..1` | `Claim.insurance[0].preAuthRef[0]` | `APPR-2026-HP-00891` |  |
| `patientName` | Patient Full Name | Beneficiary | `string` | `1..1` | `Patient.name[0].text` | `Ramesh Chandra Sharma` |  |
| `memberId` | Scheme / Insurer Member ID | Beneficiary | `string` | `1..1` | `Patient.identifier[type=PMJAY].value` | `PMJAY-HP-2024-998811` | also at `Coverage.subscriberId` |
| `abhaNumber` | ABHA Number | Beneficiary | `string` | `0..1` | `Patient.identifier[type=ABHA].value` | `91234567890123` |  |
| `gender` | Gender | Beneficiary | `code` | `1..1` | `Patient.gender` | `male` | code system `http://hl7.org/fhir/administrative-gender` |
| `birthDate` | Date of Birth | Beneficiary | `date` | `1..1` | `Patient.birthDate` | `1982-06-15` |  |
| `patientPhone` | Mobile Phone | Beneficiary | `string` | `0..1` | `Patient.telecom[system=phone].value` | `9876543210` |  |
| `policyNumber` | Policy Number | Coverage | `string` | `1..1` | `Coverage.identifier[0].value` | `PMJAY/HP/S/G` |  |
| `facilityId` | Hospital Facility ID (HFR/NPI) | Provider | `string` | `1..1` | `Organization[type=prov].identifier[system=https://facility.abdm.gov.in].value` | `IN1910000151` |  |
| `providerName` | Hospital Name | Provider | `string` | `1..1` | `Organization[type=prov].name` | `Apex Multispeciality Hospital` |  |
| `payerId` | Payer Identifier (NIIP) | Payer | `string` | `1..1` | `Organization[type=pay].identifier[system=https://irdai.gov.in].value` | `1000003538` |  |
| `payerName` | Payer Name | Payer | `string` | `1..1` | `Organization[type=pay].name` | `National Health Authority - PMJAY` |  |
| `practitionerId` | Practitioner ID (HPID/HPIN) | Practitioner | `string` | `1..1` | `Practitioner.identifier[system=https://hpr.abdm.gov.in].value` | `21-8899-4455-6677` |  |
| `practitionerName` | Doctor Name | Practitioner | `string` | `1..1` | `Practitioner.name[0].text` | `Dr. Arvind Kumar` |  |
| `admissionDate` | Admission Date | Stay | `dateTime` | `1..1` | `Claim.billablePeriod.start` | `2026-02-26T10:00:00+05:30` |  |
| `dischargeDate` | Discharge Date | Stay | `dateTime` | `1..1` | `Claim.billablePeriod.end` | `2026-03-02T14:30:00+05:30` |  |
| `careSetting` | Care Setting | Stay | `code` | `1..1` | `Claim.type.coding[0].code` | `institutional` | code system `http://terminology.hl7.org/CodeSystem/claim-type` |
| `primaryDiagnosisCode` | Primary Diagnosis (ICD-10) | Clinical | `string` | `1..1` | `Claim.diagnosis[0].diagnosisCodeableConcept.coding[0].code` | `A97.0` | code system `http://hl7.org/fhir/sid/icd-10` |
| `procedureCode` | Package / Procedure Code | Clinical | `string` | `1..1` | `Claim.procedure[0].procedureCodeableConcept.coding[0].code` | `MG004A` |  |
| `estimatedTotal` | Estimated Package Amount | Billing | `decimal` | `1..1` | `Claim.total.value` | `15500.00` |  |

NRCeS profiles: [Claim](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Claim.html), [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html), [Coverage](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Coverage.html), [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html), [Practitioner](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Practitioner.html).

### D4 Submit pre-authorisation (pmjay)

Not more than one day before admission, with the biometric token or the consent response, the documents the auth-requirements answer asked for, the STG questionnaire for each package, and the registration and admission dates as supporting info. Auto-approved only if it is the first pre-authorisation for the case and every package allows it.

| | |
| :-- | :-- |
| **API** | `/v1/preauth/submit` [`apis/03-preauth/v1-preauth-submit.bru`](../../apis/03-preauth/v1-preauth-submit.bru) |
| **Callback** | `/v1/preauth/on_submit` [`apis/03-preauth/v1-preauth-on-submit.bru`](../../apis/03-preauth/v1-preauth-on-submit.bru) |
| **Workflow** | 12 |
| **Carries JWE** | yes |
| **Focal resource** | `Claim` |
| **Simulator console** | `/builder?family=preauth&usecase=initiate` |

**Request headers**

| Header | Example value |
| :-- | :-- |
| `x-hcx-sender_code` | `1000004446@hcx` |
| `x-hcx-recipient_code` | `1518@hcx` |
| `x-hcx-api_call_id` | `{{$guid}}` |
| `x-hcx-request_id` | `{{$guid}}` |
| `x-hcx-correlation_id` | `{{$guid}}` |
| `x-hcx-workflow_id` | `12` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `request.initiated` |
| `x-hcx-ben-abha-id` | `91711234567890` |
| `x-hcx-use_case` | `New` |

**Workflow codes**

| Code | Name | Authored by | `x-hcx-status` | Means |
| :-- | :-- | :-- | :-- | :-- |
| `12` | Preauth Request Initiated | provider | `request.initiated` | New preauth submission |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `claimNumber` | PMJAY Case Number | Case | `string` | `1..1` | `Claim.identifier[0].value` | `VB26AA2600001` |  |
| `patientName` | Patient Full Name | Beneficiary | `string` | `1..1` | `Patient.name[0].text` | `Ramesh Chandra Sharma` |  |
| `memberId` | Scheme / Insurer Member ID | Beneficiary | `string` | `1..1` | `Patient.identifier[type=PMJAY].value` | `PMJAY-HP-2024-998811` | also at `Coverage.subscriberId` |
| `abhaNumber` | ABHA Number | Beneficiary | `string` | `0..1` | `Patient.identifier[type=ABHA].value` | `91234567890123` |  |
| `gender` | Gender | Beneficiary | `code` | `1..1` | `Patient.gender` | `male` | code system `http://hl7.org/fhir/administrative-gender` |
| `birthDate` | Date of Birth | Beneficiary | `date` | `1..1` | `Patient.birthDate` | `1982-06-15` |  |
| `patientPhone` | Mobile Phone | Beneficiary | `string` | `0..1` | `Patient.telecom[system=phone].value` | `9876543210` |  |
| `facilityId` | Hospital Facility ID (HFR/NPI) | Provider | `string` | `1..1` | `Organization[type=prov].identifier[system=https://facility.abdm.gov.in].value` | `IN1910000151` |  |
| `providerName` | Hospital Name | Provider | `string` | `1..1` | `Organization[type=prov].name` | `Apex Multispeciality Hospital` |  |
| `payerId` | Payer Identifier (NIIP) | Payer | `string` | `1..1` | `Organization[type=pay].identifier[system=https://irdai.gov.in].value` | `1000003538` |  |
| `payerName` | Payer Name | Payer | `string` | `1..1` | `Organization[type=pay].name` | `National Health Authority - PMJAY` |  |
| `practitionerId` | Practitioner ID (HPID/HPIN) | Practitioner | `string` | `1..1` | `Practitioner.identifier[system=https://hpr.abdm.gov.in].value` | `21-8899-4455-6677` |  |
| `practitionerName` | Doctor Name | Practitioner | `string` | `1..1` | `Practitioner.name[0].text` | `Dr. Arvind Kumar` |  |
| `primaryDiagnosisCode` | Primary Diagnosis (ICD-10) | Clinical | `string` | `1..1` | `Claim.diagnosis[0].diagnosisCodeableConcept.coding[0].code` | `A97.0` | code system `http://hl7.org/fhir/sid/icd-10` |
| `procedureCode` | Package / Procedure Code | Clinical | `string` | `1..1` | `Claim.procedure[0].procedureCodeableConcept.coding[0].code` | `MG004A` |  |
| `patientPhoto` | Patient Photo on Bed (POI) | Documents | `base64Binary` | `1..1` | `Claim.supportingInfo[category=POI].valueAttachment.data` | `JVBERi0xLjQK...` |  |

NRCeS profiles: [Claim](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Claim.html), [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html), [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html), [Practitioner](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Practitioner.html).

### D5 Resubmit pre-authorisation (pmjay)

Revises an approved or rejected case for a different amount or package. Nullifies every earlier instance; the payer treats it as the new base request.

| | |
| :-- | :-- |
| **API** | `/v1/preauth/submit` [`apis/03-preauth/v1-preauth-submit.bru`](../../apis/03-preauth/v1-preauth-submit.bru) |
| **Callback** | `/v1/preauth/on_submit` [`apis/03-preauth/v1-preauth-on-submit.bru`](../../apis/03-preauth/v1-preauth-on-submit.bru) |
| **Workflow** | 121 |
| **Carries JWE** | yes |
| **Focal resource** | `Claim` |
| **Simulator console** | `/builder?family=preauth&usecase=resubmit` |

**Request headers**

| Header | Example value |
| :-- | :-- |
| `x-hcx-sender_code` | `1000004446@hcx` |
| `x-hcx-recipient_code` | `1518@hcx` |
| `x-hcx-api_call_id` | `{{$guid}}` |
| `x-hcx-request_id` | `{{$guid}}` |
| `x-hcx-correlation_id` | `{{$guid}}` |
| `x-hcx-workflow_id` | `121` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `request.initiated` |
| `x-hcx-ben-abha-id` | `91711234567890` |
| `x-hcx-use_case` | `Resubmit` |

**Workflow codes**

| Code | Name | Authored by | `x-hcx-status` | Means |
| :-- | :-- | :-- | :-- | :-- |
| `121` | Preauth Request Resubmitted | provider | `request.initiated` | Resubmission after query/rejection |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `claimNumber` | Existing Case Number | Case | `string` | `1..1` | `Claim.identifier[0].value` | `VB26AA2600001` |  |
| `workflowId` | Workflow Code | Header | `string` | `1..1` | `Header.x-hcx-workflow_id` | `121` |  |

NRCeS profiles: [Claim](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Claim.html).
