# Claim request

The request for payment once treatment is done. The same `Claim` as the preauthorisation with `use` set to `claim`, carrying the finalised dates, bill and documents.

Sent on `/v1/claim/submit`, answered on `/v1/claim/on_submit`, workflow 15.

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

## Elements

### 1. Claim

NRCeS profile: [Claim](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Claim.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `https://nhcx.abdm.gov.in`, value `NM-26-0SE00002L` |
| `identifier[].type.coding[]` | `CLN` Claim number in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code` |
| `status` | `active` |
| `type.coding[]` | `737481003` Inpatient care management (procedure) in `http://snomed.info/sct` |
| `use` | `claim` |
| `patient` | reference `https://nhcx.abdm.gov.in/patient` |
| `billablePeriod` | start `2026-09-10T00:00:00+05:30`, end `2026-09-10T00:00:00+05:30` |
| `created` | `2026-09-10T23:53:21+05:30` |
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
| | and 7 more |
| `supportingInfo[].category.coding[]` | `INV` Document Type - Investigation in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
|  | `HDS` Hospital discharge summary in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
|  | `ONS` Period, start or end dates of aspects of the Condition. (e.g. admission, discha… in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
| | and 2 more |
| `supportingInfo[].code.coding[]` | `MB` Medical & Pharmacy Bills Itemized in `https://nhcx.abdm.gov.in/document-code` |
|  | `IMP` Medical Implant Invoice & Barcode Sticker in `https://nhcx.abdm.gov.in/document-code` |
|  | `FCF` Filled NHCX Claim Form (Signed) in `https://nhcx.abdm.gov.in/document-code` |
| | and 7 more |
| `supportingInfo[].valueAttachment` | contentType `application/pdf`, title `Medical & Pharmacy Bills Itemized` |
|  | contentType `application/pdf`, title `Medical Implant Invoice & Barcode Sticker` |
|  | contentType `application/pdf`, title `Filled NHCX Claim Form (Signed)` |
| | and 2 more |
| `diagnosis[]` | sequence `1` |
| `diagnosis[].diagnosisCodeableConcept.coding[]` | `E11.9` Type 2 diabetes mellitus without complications in `http://hl7.org/fhir/sid/icd-10` |
| `diagnosis[].type[].coding[]` | `admitting` Admitting Diagnosis in `http://terminology.hl7.org/CodeSystem/ex-diagnosistype` |
| `diagnosis[].onAdmission.coding[]` | `yes` Yes in `http://terminology.hl7.org/CodeSystem/ex-diagnosis-on-admission` |
| `procedure[]` | id `Procedure/1`, sequence `1`, date `2026-09-10T00:00:00+05:30` |
| `procedure[].type[].coding[]` | `surgical` Surgical in `https://nhcx.abdm.gov.in/procedure-type` |
| `procedure[].procedureReference` | reference `https://nhcx.abdm.gov.in/procedure/1`, display `Total Knee Replacement (Unilateral)` |
| `insurance[]` | sequence `1`, focal `true`, preAuthRef `CL/26/0SE000107` |
| `insurance[].coverage` | reference `https://nhcx.abdm.gov.in/coverage` |
| `item[]` | id `Item/1`, sequence `1`, factor `1`, careTeamSequence `1`, diagnosisSequence `1`, procedureSequence `1`, informationSequence `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10` |
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
| `status` | `completed` |
| `code` | text `Total Knee Replacement (Unilateral)` |
| `code.coding[]` | `71388002` Procedure (procedure) in `http://snomed.info/sct` |
| `subject` | reference `https://nhcx.abdm.gov.in/patient` |
| `performedDateTime` | `2026-09-10T00:00:00+05:30` |

## Rules

### 1. What a claim adds

The final bill under `MB` and the discharge summary under `HDS`, with the implant invoice, the operation notes and the signed claim form where the plan asks for them.

### 2. The stay

`billablePeriod` carries the admission and the discharge.

### 3. Sequences may have gaps

Map supporting information by `sequence` and resolve `item.informationSequence` through the map.

### 4. The amount

May not exceed what the preauthorisation approved.

### 5. Cyclic treatment

One supporting-info entry per cycle, with `timingPeriod`, listed in the item's `informationSequence`, its record referenced from `valueReference`.

### 6. Newborn

The parent stays the primary `Patient`; the child is a second `Patient` linked with `link.type` `refer`, with gender and birth date, and a proof of birth under category `DOB`, code `BCF` or `DCB`.

## PMJAY

The generic bundle above is what every payer takes, IRDAI-regulated insurers and TPAs included. PMJAY takes it with the changes and requirements below.

### What changes in the bundle

#### Resources

- PMJAY adds 4 `QuestionnaireResponse`.

##### QuestionnaireResponse

| Element | Example |
| :-- | :-- |
| `questionnaire` | `https://payer.gov.in/policy/questionnaire/100025` |
| `status` | `completed` |
| `subject` | reference `https://nhcx.abdm.gov.in/patient` |
| `authored` | `2026-09-11T00:25:00+05:30` |
| `item[]` | linkId `100011`, text `Death Stage` |
|  | linkId `100098`, text `Death Date` |
|  | linkId `100099`, text `Death Certificate` |
| | and 2 more |
| `item[].answer[]` | valueString `Before Surgery/Treatment` |
|  | valueDateTime `2026-09-10T18:54:00+05:30` |
| `item[].answer[].valueAttachment` | contentType `application/pdf`, title `Death Certificate` |
|  | contentType `application/pdf`, title `Clinical Note/Death Summary` |
|  | contentType `application/pdf`, title `Mortality audit report` |

#### Elements PMJAY adds

| Element | Example |
| :-- | :-- |
| `Claim.supportingInfo[].valueReference` | reference `https://nhcx.abdm.gov.in/questionnaireresponse/1`, display `Death` |
|  | reference `https://nhcx.abdm.gov.in/questionnaireresponse/2`, display `Discharge Consent` |
|  | reference `https://nhcx.abdm.gov.in/questionnaireresponse/3`, display `Discharge Information` |
| | and 1 more |
| `Claim.item[].modifier[].coding[]` | `STRAT006a` Routine Ward |
| `Claim.item[].programCode[].coding[]` | `AB-PMJAY` Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY) in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-program-code` |

### What PMJAY specifies

- Dates ride as supporting information: the stay under category `ONS`, code `ADDD`, the encounter under `OTH`, code `EDT`, and the surgery under code `PSP`, each as a `valueString` in `+05:30`. The live PMJAY provider sends instead `ADDD` under categories `ADMD`, `SURD` and `DSCHD` beside `EDT`, at midnight `+00:00`, and the payer takes it; read both forms.
- Discharge types `DTH`, `DTM`, `LAMA` and `DAMA` under category `DIS`, with the stage, before, during or after surgery, as the `valueString`.
- LAMA or DAMA before or during surgery voids the approved packages: one item `LM100`, quantity the days admitted, capped by the package's `LengthOfStay`. After surgery the package stays billable.
- A death records its date under category `ONS`, code `DTM`.
- The discharge consent and the other policy questionnaires ride as `QuestionnaireResponse` resources, each referenced from a `supportingInfo` entry.

### What PMJAY requires

- Send the claim under the preauthorisation's own number. Refused with `ERR-PYR-CLM-007` otherwise.
- The discharge status under `DIS` and the admission and discharge dates. The claim is refused without them.
- Bill the package alone, at the whole amount. Room rent, consultations and investigations are not items.
- A fresh biometric token at discharge, or the plan's Discharge Consent questionnaire answered. Refused with `PAYR-1363` otherwise.
- `LM100` as the single procedure on LAMA or DAMA before or during surgery (`PAYR-1362`), and the death date under `ONS` / `DTM` (`PAYR-1096`).
- Each cycle's `timingPeriod` matches the biometric capture for that cycle.

## Use cases, APIs and data elements

### B5 Submit claim (provider)

Reimbursement after discharge. The amount may not exceed what the pre-authorisation approved. The acknowledgement on 25 brings the payer's case number. PMJAY takes a claim query answer on 161 only; 151, 19 and 16 are refused with PAYR-1321.

| | |
| :-- | :-- |
| **API** | `/v1/claim/submit` [`apis/05-claim/v1-claim-submit.bru`](../../apis/05-claim/v1-claim-submit.bru) |
| **Callback** | `/v1/claim/on_submit` [`apis/05-claim/v1-claim-on-submit.bru`](../../apis/05-claim/v1-claim-on-submit.bru) |
| **Workflow** | 15 claim, 161 query answer under PMJAY, 14 provisional discharge where a payer supports one |
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
| `x-hcx-workflow_id` | `15` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `request.initiated` |
| `x-hcx-ben-abha-id` | `91-7112-3456-7890` |
| `x-hcx-use_case` | `New` |

**Workflow codes**

| Code | Name | Authored by | `x-hcx-status` | Means |
| :-- | :-- | :-- | :-- | :-- |
| `15` | Claim Request Initiated | provider | `request.initiated` | Final claim submission |
| `161` | Claim Doc Query Response | status sheet only | `response.complete`; the answer is sent as `request.initiated` | The claim query answer PMJAY takes. Sent as request.initiated on v1/claim/submit, as the live PMJAY provider sends it; the sheet's response.complete is refused there with NHCX-1011 |
| `14` | Discharge Submitted | provider | `request.initiated` | Discharge summary submitted |
| `151` | Claim Query Response Submitted | provider | `response.complete`; the answer is sent as `request.initiated` | Response to claim query, as published; the PMJAY sandbox refuses it with PAYR-1321 and takes 161 (Claim Doc Query Response). Sent as request.initiated on v1/claim/submit: NHCX refuses response.complete on a submit path with NHCX-1011 |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `claimNumber` | Final Claim Number | Case | `string` | `1..1` | `Claim.identifier[0].value` | `NM-26-0SE00002L` | also at `Bundle.id` |
| `use` | Claim Use | Case | `code` | `1..1` | `Claim.use` | `claim` |  |
| `preAuthRef` | Approved Pre-auth Reference | Case | `string` | `1..1` | `Claim.insurance[0].preAuthRef[0]` | `CL/26/0SE000107` |  |
| `patientName` | Patient Full Name | Beneficiary | `string` | `1..1` | `Patient.name[0].text` | `E2E Nano UV0I4` |  |
| `memberId` | Scheme / Insurer Member ID | Beneficiary | `string` | `1..1` | `Patient.identifier[type=PMJAY].value` | `MRAV1985001` | also at `Coverage.subscriberId` |
| `abhaNumber` | ABHA Number | Beneficiary | `string` | `0..1` | `Patient.identifier[type=ABHA].value` | `91-1234-1234-1234` |  |
| `gender` | Gender | Beneficiary | `code` | `1..1` | `Patient.gender` | `male` | code system `http://hl7.org/fhir/administrative-gender` |
| `birthDate` | Date of Birth | Beneficiary | `date` | `1..1` | `Patient.birthDate` | `1985-06-15` |  |
| `patientPhone` | Mobile Phone | Beneficiary | `string` | `0..1` | `Patient.telecom[system=phone].value` | `9876543210` |  |
| `policyNumber` | Policy Number | Coverage | `string` | `1..1` | `Coverage.identifier[0].value` | `POL7UMU001` |  |
| `facilityId` | Hospital Facility ID (HFR/NPI) | Provider | `string` | `1..1` | `Organization[type=prov].identifier[type=NPI].value` | `IN1910000151` |  |
| `providerName` | Hospital Name | Provider | `string` | `1..1` | `Organization[type=prov].name` | `KyroCare Multispeciality Hospital` |  |
| `payerId` | Payer Identifier (NIIP) | Payer | `string` | `1..1` | `Organization[type=pay].identifier[type=NIIP].value` | `1000004805` |  |
| `payerName` | Payer Name | Payer | `string` | `1..1` | `Organization[type=pay].name` | `Sandbox Payer` |  |
| `practitionerId` | Practitioner ID (HPID/HPIN) | Practitioner | `string` | `1..1` | `Practitioner.identifier[system=https://hpr.abdm.gov.in].value` | `71-8422-5818-7201` |  |
| `practitionerName` | Doctor Name | Practitioner | `string` | `1..1` | `Practitioner.name[0].text` | `Dr. Ananya Rao` |  |
| `admissionDate` | Admission Date | Stay | `dateTime` | `1..1` | `Claim.billablePeriod.start` | `2026-09-10T00:00:00+05:30` |  |
| `dischargeDate` | Discharge Date | Stay | `dateTime` | `1..1` | `Claim.billablePeriod.end` | `2026-09-10T00:00:00+05:30` |  |
| `careSetting` | Claim Type (care setting) | Stay | `code` | `1..1` | `Claim.type.coding[0].code` | `737481003` | code system `http://snomed.info/sct` |
| `primaryDiagnosisCode` | Primary Diagnosis (ICD-10) | Clinical | `string` | `1..1` | `Claim.diagnosis[0].diagnosisCodeableConcept.coding[0].code` | `E11.9` | code system `http://hl7.org/fhir/sid/icd-10` |
| `procedureCode` | Package / Procedure Code | Clinical | `string` | `1..1` | `Claim.item[0].productOrService.coding[0].code` | `PROC-KNEE-01` | code system `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-procedure-code` |
| `finalBilledAmount` | Total Claim Amount | Billing | `decimal` | `1..1` | `Claim.total.value` | `150000` |  |

NRCeS profiles: [Claim](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Claim.html), [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html), [Coverage](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Coverage.html), [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html), [Practitioner](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Practitioner.html).

### D9 Submit claim (pmjay)

There is no discharge submission: the claim asserts the discharge and carries its details. Four dates, the discharge type under category DIS with the stage as its value, a fresh biometric token, and LM100 as the single procedure in place of the approved items on a LAMA or DAMA discharge before or during surgery. The amount may not exceed what was approved.

| | |
| :-- | :-- |
| **API** | `/v1/claim/submit` [`apis/05-claim/v1-claim-submit.bru`](../../apis/05-claim/v1-claim-submit.bru) |
| **Callback** | `/v1/claim/on_submit` [`apis/05-claim/v1-claim-on-submit.bru`](../../apis/05-claim/v1-claim-on-submit.bru) |
| **Workflow** | 15 |
| **Carries JWE** | yes |
| **Focal resource** | `Claim` |
| **Simulator console** | `/builder?family=claim&usecase=submit` |

**Request headers**

| Header | Example value |
| :-- | :-- |
| `x-hcx-sender_code` | `1000004446@hcx` |
| `x-hcx-recipient_code` | `1518@hcx` |
| `x-hcx-api_call_id` | `{{$guid}}` |
| `x-hcx-request_id` | `{{$guid}}` |
| `x-hcx-correlation_id` | `{{$guid}}` |
| `x-hcx-workflow_id` | `15` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `request.initiated` |
| `x-hcx-ben-abha-id` | `91-7112-3456-7890` |
| `x-hcx-use_case` | `New` |

**Workflow codes**

| Code | Name | Authored by | `x-hcx-status` | Means |
| :-- | :-- | :-- | :-- | :-- |
| `15` | Claim Request Initiated | provider | `request.initiated` | Final claim submission |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `claimNumber` | PMJAY Claim Number | Case | `string` | `1..1` | `Claim.identifier[0].value` | `NM-26-0SF000030` |  |
| `dischargeSummary` | Hospital Discharge Summary (HDS) | Documents | `base64Binary` | `1..1` | `Claim.supportingInfo[category=HDS].valueAttachment.data` | `JVBERi0xLjQK...` |  |
| `patientName` | Patient Full Name | Beneficiary | `string` | `1..1` | `Patient.name[0].text` | `E2E Nano VZ4Q2` |  |
| `memberId` | Scheme / Insurer Member ID | Beneficiary | `string` | `1..1` | `Patient.identifier[type=PMJAY].value` | `PMJAY0000X` | also at `Coverage.subscriberId` |
| `abhaNumber` | ABHA Number | Beneficiary | `string` | `0..1` | `Patient.identifier[type=ABHA].value` | `91-0000-0000-0000` |  |
| `gender` | Gender | Beneficiary | `code` | `1..1` | `Patient.gender` | `male` | code system `http://hl7.org/fhir/administrative-gender` |
| `birthDate` | Date of Birth | Beneficiary | `date` | `1..1` | `Patient.birthDate` | `2002-01-01` |  |
| `patientPhone` | Mobile Phone | Beneficiary | `string` | `0..1` | `Patient.telecom[system=phone].value` | `9876543210` |  |
| `facilityId` | Hospital Facility ID (HFR/NPI) | Provider | `string` | `1..1` | `Organization[type=prov].identifier[type=NPI].value` | `IN1910000151` |  |
| `providerName` | Hospital Name | Provider | `string` | `1..1` | `Organization[type=prov].name` | `KyroCare Multispeciality Hospital` |  |
| `payerId` | Payer Identifier (NIIP) | Payer | `string` | `1..1` | `Organization[type=pay].identifier[type=NIIP].value` | `1518` |  |
| `payerName` | Payer Name | Payer | `string` | `1..1` | `Organization[type=pay].name` | `PMJAY / Ayushman Bharat` |  |
| `practitionerId` | Practitioner ID (HPID/HPIN) | Practitioner | `string` | `1..1` | `Practitioner.identifier[system=https://hpr.abdm.gov.in].value` | `71-8422-5818-7201` |  |
| `practitionerName` | Doctor Name | Practitioner | `string` | `1..1` | `Practitioner.name[0].text` | `Dr. Ananya Rao` |  |

NRCeS profiles: [Claim](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Claim.html), [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html), [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html), [Practitioner](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Practitioner.html).
