# Coverage eligibility response

The payer's answer on `on_check`. It says whether the coverage is in force, what is left in the wallet, and which items need authorisation and which documents.

Sent on `/v1/coverageeligibility/on_check`.

## The bundle

| # | Resource | Profile |
| :-- | :-- | :-- |
| 1 | `CoverageEligibilityResponse` | [CoverageEligibilityResponse](https://nrces.in/ndhm/fhir/r4/StructureDefinition-CoverageEligibilityResponse.html) |
| 2 | `Patient` | [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html) |
| 3 | `Coverage` | [Coverage](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Coverage.html) |
| 4 | `CoverageEligibilityRequest` | [CoverageEligibilityRequest](https://nrces.in/ndhm/fhir/r4/StructureDefinition-CoverageEligibilityRequest.html) |
| 5 | `Organization (ins)` | [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |

## Elements

### 1. CoverageEligibilityResponse

NRCeS profile: [CoverageEligibilityResponse](https://nrces.in/ndhm/fhir/r4/StructureDefinition-CoverageEligibilityResponse.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `<participant-defined>`, value `SUB-00001` |
| `status` | `active` |
| `purpose` | `auth-requirements` |
| `patient` | reference `urn:uuid:89aac2db-25ae-5b55-90a7-886c6be48ca7`, display `Ravi Kumar` |
| `created` | `2026-09-10` |
| `request` | reference `urn:uuid:4955a87f-deb4-59e6-b795-100a2d705c98`, display `CoverageEligibilityRequest` |
| `outcome` | `complete` |
| `disposition` | `Policy is in force until 2026-12-31. INR 5000 of cover remains. All 1 requested…` |
| `insurer` | reference `urn:uuid:39cd4b51-bddd-5cc1-a65a-6fa4a2a83cb5`, display `Sandbox Payer` |
| `insurance[]` | inforce `true` |
| `insurance[].coverage` | reference `urn:uuid:966d4b2b-591b-50b6-bbbb-d504d3c6897f`, display `Sandbox Default Policy` |
| `insurance[].benefitPeriod` | start `2026-01-01`, end `2026-12-31` |
| `insurance[].item[]` | authorizationRequired `true` |
| `insurance[].item[].productOrService` | text `Total Knee Replacement (Unilateral)` |
| `insurance[].item[].productOrService.coding[]` | `PROC-KNEE-01` Total Knee Replacement (Unilateral) in `<participant-defined>` |
|  | `737481003` Total Knee Replacement (Unilateral) in `http://snomed.info/sct` |
|  | `0SRC0JZ` Total Knee Replacement (Unilateral) in `http://www.cms.gov/Medicare/Coding/ICD10` |
| `insurance[].item[].benefit[].type.coding[]` | `benefit` Benefit in `http://terminology.hl7.org/CodeSystem/benefit-type` |
| `insurance[].item[].benefit[].allowedMoney` | value `150000`, currency `INR` |
| `insurance[].item[].authorizationSupporting[]` | text `Type: pre
Procedure Code: PROC-KNEE-01` |
|  | text `Type: post
Procedure Code: PROC-KNEE-01` |
|  | text `fullUrl: <participant-defined>` |
| `insurance[].item[].authorizationSupporting[].coding[]` | `POI` Proof of Identity (Aadhaar / Passport / Voter ID) in `<participant-defined>` |
|  | `CER` Medical Certificate / Doctor Referral in `<participant-defined>` |
|  | `RAD` Radiology / X-Ray / CT / MRI Scan Reports in `<participant-defined>` |
| | and 7 more |

### 2. Patient

NRCeS profile: [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `<participant-defined>`, value `MRAV1985001` |
|  | system `https://healthid.ndhm.gov.in`, value `91-1234-1234-1234` |
| `identifier[].type.coding[]` | `ABHA` Ayushman Bharat Health Account (ABHA) ID in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code` |
| `name[]` | text `Ravi Kumar` |
| `telecom[]` | system `phone`, value `9876543210`, use `mobile` |
| `gender` | `male` |
| `birthDate` | `1985-06-15` |

### 3. Coverage

NRCeS profile: [Coverage](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Coverage.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `<participant-defined>`, value `SUB-00001` |
| `status` | `active` |
| `type.coding[]` | `HIP` health insurance plan policy in `http://terminology.hl7.org/CodeSystem/v3-ActCode` |
| `subscriber` | reference `urn:uuid:89aac2db-25ae-5b55-90a7-886c6be48ca7`, display `Ravi Kumar` |
| `subscriberId` | `MRAV1985001` |
| `beneficiary` | reference `urn:uuid:89aac2db-25ae-5b55-90a7-886c6be48ca7`, display `Ravi Kumar` |
| `relationship.coding[]` | `self` Self in `http://terminology.hl7.org/CodeSystem/subscriber-relationship` |
| `period` | start `2026-01-01`, end `2026-12-31` |
| `payor[]` | reference `urn:uuid:39cd4b51-bddd-5cc1-a65a-6fa4a2a83cb5`, display `Sandbox Payer` |
| `class[]` | value `POL7UMU002`, name `Sandbox Default Policy` |
| `class[].type.coding[]` | `plan` Plan in `http://terminology.hl7.org/CodeSystem/coverage-class` |

### 4. CoverageEligibilityRequest

NRCeS profile: [CoverageEligibilityRequest](https://nrces.in/ndhm/fhir/r4/StructureDefinition-CoverageEligibilityRequest.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `<participant-defined>`, value `4955a87f-deb4-59e6-b795-100a2d705c98` |
| `status` | `active` |
| `priority.coding[]` | `normal` Normal in `http://terminology.hl7.org/CodeSystem/processpriority` |
| `purpose` | `auth-requirements` |
| `patient` | reference `urn:uuid:89aac2db-25ae-5b55-90a7-886c6be48ca7`, display `Ravi Kumar` |
| `created` | `2026-09-10T23:53:59+05:30` |
| `insurer` | reference `urn:uuid:39cd4b51-bddd-5cc1-a65a-6fa4a2a83cb5`, display `Sandbox Payer` |
| `insurance[]` | focal `true` |
| `insurance[].coverage` | reference `urn:uuid:966d4b2b-591b-50b6-bbbb-d504d3c6897f`, display `Sandbox Default Policy` |

### 5. Organization (ins)

NRCeS profile: [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html).

| Element | Example |
| :-- | :-- |
| `type[].coding[]` | `ins` Insurance Company in `http://terminology.hl7.org/CodeSystem/organization-type` |
| `name` | `Sandbox Payer` |
| `address[]` | city `Bengaluru`, state `Karnataka`, country `India` |

## Rules

### 1. Read the answer in three places

`outcome`, `insurance[].inforce` and `insurance[].item[]`. `disposition` is prose for a human.

### 2. Match to the request by reference

Use `CoverageEligibilityResponse.request.reference`, never a resource id, to join the answer to what you sent.

### 3. Items come back in your own codes

`insurance[].item[].productOrService` carries the package code you sent, for example `MG004A`, as NHA's published PMJAY bundles show. Match items by that code. The numbers in the handbook's response table (100005, 100478, 100063, 100012) are not item codes; in the published bundles they are questionnaire, document-requirement and question identifiers.

### 4. Index entries by fullUrl

A response can carry more than one `Patient` or `Organization`. Index by `fullUrl`, not by resource type.

### 5. Money

`allowedMoney` is the balance remaining and `usedMoney` the amount used, not the sum insured. There is one benefit per wallet; read them all.

### 6. Build for the fuller form

`benefit[]` with `Procedure`, `Investigation` and `Stratification` types for benefits, and `authorizationSupporting[]` with the mandatory document codes for auth-requirements. Tolerate a leaner answer.

### 7. Documents by stage

`authorizationSupporting[]` lists the documents the next request must carry. Its `text` names the stage: pre for the preauthorisation, post for the claim.

### 8. The identifier is not a correlation key

`CoverageEligibilityResponse.identifier` identifies the beneficiary at the hospital. Correlate on the protocol headers.

## PMJAY

The generic bundle above is what every payer takes, IRDAI-regulated insurers and TPAs included. PMJAY takes it with the changes and requirements below.

### What changes in the bundle

PMJAY uses a different bundle for this step, headed by `CoverageEligibilityRequest` rather than `CoverageEligibilityResponse`.

| # | Resource | Profile |
| :-- | :-- | :-- |
| 1 | `CoverageEligibilityRequest` | [CoverageEligibilityRequest](https://nrces.in/ndhm/fhir/r4/StructureDefinition-CoverageEligibilityRequest.html) |
| 2 | `Patient` | [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html) |
| 3 | `Organization (prov)` | [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 4 | `Organization (pay)` | [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 5 | `Location` | none declared; NRCeS [Location](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Location.html) |
| 6 | `Coverage` | [Coverage](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Coverage.html) |
| 7 | `PractitionerRole` | [PractitionerRole](https://nrces.in/ndhm/fhir/r4/StructureDefinition-PractitionerRole.html) |
| 8 | `CoverageEligibilityResponse` | [CoverageEligibilityResponse](https://hl7.org/fhir/R4/coverageeligibilityresponse.html) |
| 9 | `Patient` | none declared; NRCeS [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html) |
| 10 | `Coverage` | none declared; NRCeS [Coverage](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Coverage.html) |
| 11 | `Organization (pay)` | none declared; NRCeS [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 12 | `Organization (prov)` | none declared; NRCeS [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |

##### 8. CoverageEligibilityResponse

NRCeS profile: [CoverageEligibilityResponse](https://nrces.in/ndhm/fhir/r4/StructureDefinition-CoverageEligibilityResponse.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `https://hcx.pmjay.gov.in/v1/coverageeligibility/check`, value `PMJAY0000X-IN1910000151` |
| `status` | `active` |
| `purpose` | `auth-requirements` |
| `patient` | reference `https://payer.nha.gov.in/coverageeligibility/v1/coverageeligibility/on_check/co…` |
| `created` | `2026-09-11T00:32:42+05:30` |
| `requestor` | reference `https://payer.nha.gov.in/coverageeligibility/v1/coverageeligibility/on_check/co…` |
| `request` | reference `https://nhcx.abdm.gov.in/coverage-eligibility/request` |
| `outcome` | `complete` |
| `disposition` | `Policy is currently in-force` |
| `insurer` | reference `https://payer.nha.gov.in/coverageeligibility/v1/coverageeligibility/on_check/co…` |
| `insurance[]` | inforce `true` |
| `insurance[].coverage` | reference `https://payer.nha.gov.in/coverageeligibility/v1/coverageeligibility/on_check/co…` |
| `insurance[].item[]` | excluded `false`, authorizationRequired `true` |
| `insurance[].item[].category.coding[]` | `MG` General Medicine |
| `insurance[].item[].productOrService.coding[]` | `MG0111A` Pleural Effusion (Pleural Effusion) |
|  | `MG072C` Acute Haemodialysis (Acute Haemodialysis) |
| `insurance[].item[].benefit[].type.coding[]` | `Procedure` Procedure in `https://hl7.org/fhir/R4/codesystem-benefit-type.html` |
| `insurance[].item[].benefit[].allowedMoney` | value `2070`, currency `INR` |
|  | value `1725`, currency `INR` |
| `insurance[].item[].authorizationSupporting[]` | text `Type: pre
 Procedure Code:MG0111A` |
|  | text `fullUrl: https://payer.gov.in/policy/questionnaire/100003` |
|  | text `fullUrl: https://payer.gov.in/policy/questionnaire/100008` |
| | and 7 more |
| `insurance[].item[].authorizationSupporting[].coding[]` | `MAND0409` any investigations done |
|  | `MAND0408` Clinical notes detailing history and Admission notes showing vitals and examina… |
|  | `MAND0455` CXR PA view or CECT chest abdomen and pelvis |
| | and 9 more |

The `CoverageEligibilityRequest`, `Patient`, `Organization`, `Location`, `Coverage`, `PractitionerRole` entries are shaped as in the chapters that introduce them.

### What PMJAY specifies

- The bundle echoes the whole request first and then gives the answer, with the payer's own `Patient`, `Coverage` and both `Organization` entries.
- A PMJAY answer can carry only `item.excluded` and `item.authorizationRequired`, without `benefitPeriod`, `benefit[]` or `authorizationSupporting[]`. The documents then come from the plan.
- The payer's `Patient` can differ from yours in name, gender and birth date. Do not overwrite your record from it.

## Use cases, APIs and data elements

### C3 Respond to coverage eligibility (payer)

The eligibility and plan details for the beneficiary asked about. A payer may instead answer with a forward instruction, asking the exchange to pass the request to another payer.

| | |
| :-- | :-- |
| **API** | `/v1/coverageeligibility/on_check` [`apis/02-eligibility/v1-coverageeligibility-on-check.bru`](../../apis/02-eligibility/v1-coverageeligibility-on-check.bru) |
| **Callback** | `/v1/coverageeligibility/check` [`apis/02-eligibility/v1-coverageeligibility-check.bru`](../../apis/02-eligibility/v1-coverageeligibility-check.bru) |
| **Workflow** | none NHA publishes; the PMJAY payer answers on 5, a code not on NHA's Workflow Status Sheet |
| **Carries JWE** | yes |
| **Focal resource** | `CoverageEligibilityResponse` |

**Request headers**

| Header | Example value |
| :-- | :-- |
| `x-hcx-sender_code` | `1518@hcx` |
| `x-hcx-recipient_code` | `1000004446@hcx` |
| `x-hcx-api_call_id` | `{{$guid}}` |
| `x-hcx-request_id` | `{{$guid}}` |
| `x-hcx-correlation_id` | `{{correlationId}}` |
| `x-hcx-workflow_id` | `11` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `response.complete` |
| `x-hcx-ben-abha-id` | `91-7112-3456-7890` |
| `x-hcx-debug_flag` | `INFO` |

**Workflow codes**

| Code | Name | Authored by | `x-hcx-status` | Means |
| :-- | :-- | :-- | :-- | :-- |
| `5` | PMJAY eligibility and plan answer | payer |  | Seen, not sent: the PMJAY payer answered a coverage eligibility check and an insurance plan request under 5 on the 17 Oct 2026 sandbox run, with x-hcx-error_details 100. Accept it on those callbacks; never send it. The status it came with was not archived. |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `outcome` | Verdict Outcome | Verdict | `code` | `1..1` | `CoverageEligibilityResponse.outcome` | `complete` |  |
| `inforce` | Policy In Force | Coverage | `boolean` | `1..1` | `CoverageEligibilityResponse.insurance[0].inforce` | `true` |  |
| `allowedMoney` | Remaining Balance Amount | Benefit | `decimal` | `0..1` | `CoverageEligibilityResponse.insurance[0].item[].benefit[type=benefit].allowedMoney.value` | `150000` |  |

NRCeS profiles: [CoverageEligibilityResponse](https://nrces.in/ndhm/fhir/r4/StructureDefinition-CoverageEligibilityResponse.html).
