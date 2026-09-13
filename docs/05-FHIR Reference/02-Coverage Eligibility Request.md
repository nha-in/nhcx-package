# Coverage eligibility request

The provider asks the payer whether a policy is live, what it covers, and what a package will need. One `CoverageEligibilityRequest` carries all of that, and `purpose` decides which question is asked. It is the first exchange in a case, sent at registration or before treatment planning.

Sent on `/v1/coverageeligibility/check`, answered on `/v1/coverageeligibility/on_check`.

## The bundle

| # | Resource | Profile |
| :-- | :-- | :-- |
| 1 | `CoverageEligibilityRequest` | [CoverageEligibilityRequest](https://nrces.in/ndhm/fhir/r4/StructureDefinition-CoverageEligibilityRequest.html) |
| 2 | `Patient` | [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html) |
| 3 | `Organization (prov)` | [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 4 | `Organization (pay)` | [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 5 | `Location` | none declared; NRCeS [Location](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Location.html) |
| 6 | `Coverage` | [Coverage](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Coverage.html) |
| 7 | `PractitionerRole` | [PractitionerRole](https://nrces.in/ndhm/fhir/r4/StructureDefinition-PractitionerRole.html) |

## Elements

### 1. CoverageEligibilityRequest

NRCeS profile: [CoverageEligibilityRequest](https://nrces.in/ndhm/fhir/r4/StructureDefinition-CoverageEligibilityRequest.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `https://nhcx.abdm.gov.in` |
| `status` | `active` |
| `priority.coding[]` | `normal` Normal in `http://terminology.hl7.org/CodeSystem/processpriority` |
| `purpose` | `auth-requirements` |
| `patient` | reference `https://nhcx.abdm.gov.in/patient` |
| `created` | `2026-09-10T23:53:57+05:30` |
| `enterer` | reference `https://nhcx.abdm.gov.in/practitioner-role` |
| `provider` | reference `https://nhcx.abdm.gov.in/provider` |
| `insurer` | reference `https://nhcx.abdm.gov.in/payer` |
| `facility` | reference `https://nhcx.abdm.gov.in/location` |
| `insurance[]` | focal `true` |
| `insurance[].coverage` | reference `https://nhcx.abdm.gov.in/coverage` |
| `item[].category.coding[]` | `Surgical` Surgical in `https://nhcx.abdm.gov.in/category-code` |
| `item[].productOrService.coding[]` | `PROC-KNEE-01` Total Knee Replacement (Unilateral) in `https://nhcx.abdm.gov.in/product-code` |
| `item[].quantity` | value `1` |

### 2. Patient

NRCeS profile: [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | value `MRAV1985001` |
| `identifier[].type.coding[]` | `PMJAY` Pradhan Mantri Jan Aarogya Yojana (PMJAY) ID in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code` |
|  | `MB` Member Number in `http://terminology.hl7.org/CodeSystem/v2-0203` |

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

### 5. Location

NRCeS profile: [Location](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Location.html).

| Element | Example |
| :-- | :-- |
| `name` | `KyroCare Multispeciality Hospital` |
| `managingOrganization` | reference `https://nhcx.abdm.gov.in/provider` |

### 6. Coverage

NRCeS profile: [Coverage](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Coverage.html).

| Element | Example |
| :-- | :-- |
| `status` | `active` |
| `type.coding[]` | `HIP` health insurance plan policy in `http://terminology.hl7.org/CodeSystem/v3-ActCode` |
| `identifier[]` | value `POL7UMU001` |
| `identifier[].type.coding[]` | `NH` National Health Plan Identifier in `http://terminology.hl7.org/CodeSystem/v2-0203` |
| `subscriber` | reference `https://nhcx.abdm.gov.in/patient` |
| `subscriberId` | `MRAV1985001` |
| `beneficiary` | reference `https://nhcx.abdm.gov.in/patient` |
| `relationship.coding[]` | `self` in `http://terminology.hl7.org/CodeSystem/subscriber-relationship` |
| `payor[]` | reference `https://nhcx.abdm.gov.in/payer` |

### 7. PractitionerRole

NRCeS profile: [PractitionerRole](https://nrces.in/ndhm/fhir/r4/StructureDefinition-PractitionerRole.html).

| Element | Example |
| :-- | :-- |
| `code[].coding[]` | `307988006` Medical technician in `http://snomed.info/sct` |

## The four purposes

One builder, with `purpose` switched. The purposes differ in what they send and what the payer must return.

| Variant | What it asks | purpose | item |
| :-- | :-- | :-- | :-- |
| Discovery | Which policies does this person hold? Searches by ABHA or demographic identifiers. | `discovery` | none |
| Validation | Is the policy in force, and what is left in the wallet? | `validation` | none |
| Benefits | Is this package covered for this beneficiary? | `benefits` | `MG004C` Dengue shock syndrome (Dengue fever) in `https://nhcx.abdm.gov.in/product-code` |
| Auth-requirements | What must a preauthorisation carry for this package? | `auth-requirements` | `MG004C` Dengue shock syndrome (Dengue fever) in `https://nhcx.abdm.gov.in/product-code` |

## Rules

### 1. One purpose per request

`purpose[]` carries one of `discovery`, `validation`, `benefits`, `auth-requirements`.

### 2. Items make a question answerable

`item[]` is what makes `benefits` and `auth-requirements` answerable. `validation` does not need it. `discovery` omits `item[]` and `Coverage`.

### 3. Date of service

`servicedDate` is the date of service, not the date of asking.

### 4. The Coverage you send is a stub

It names the policy you mean, not its terms. Take the term and the class from the payer's `Coverage` in the response.

### 5. Parties by reference

`provider` and `insurer` reference `Organization` entries typed `prov` and `pay`, identified by `NPI` and `NIIP`. `facility` references a `Location` the provider manages, and `enterer` a `PractitionerRole`.

## PMJAY

The generic bundle above is what every payer takes, IRDAI-regulated insurers and TPAs included. PMJAY takes it with the changes and requirements below.

### What changes in the bundle

#### Elements PMJAY adds

| Element | Example |
| :-- | :-- |
| `CoverageEligibilityRequest.item[].modifier[].coding[]` | `STRAT006a` Routine Ward |

### What PMJAY specifies

- `item.category` is the package master's specialty code, such as `MG`, and `item.productOrService` the master's package code and display.
- The `Coverage` carries the scheme policy code typed `NH`, of the form `PMJAY/<state>/S/G`, from the policy lookup.
- Validation after registration returns the wallet; benefits and auth-requirements before a preauthorisation return what the package needs attached, including the consent questionnaire when there is no biometric token.

### What PMJAY requires

- The ward tier rides as `item.modifier` when the package allows one.
- Register the patient only after coverage is validated, and validate again every time treatment is added.

## Use cases, APIs and data elements

### B1 Check coverage eligibility (provider)

Is the policy in force, what is left in the wallet, and what must be attached. One endpoint, four purposes: discovery, validation, benefits, auth-requirements.

| | |
| :-- | :-- |
| **API** | `/v1/coverageeligibility/check` [`apis/02-eligibility/v1-coverageeligibility-check.bru`](../../apis/02-eligibility/v1-coverageeligibility-check.bru) |
| **Callback** | `/v1/coverageeligibility/on_check` [`apis/02-eligibility/v1-coverageeligibility-on-check.bru`](../../apis/02-eligibility/v1-coverageeligibility-on-check.bru) |
| **Workflow** | none; sits beside registration 10 and admission 11 |
| **Carries JWE** | yes |
| **Focal resource** | `CoverageEligibilityRequest` |

**Request headers**

| Header | Example value |
| :-- | :-- |
| `x-hcx-sender_code` | `1000004446@hcx` |
| `x-hcx-recipient_code` | `1518@hcx` |
| `x-hcx-api_call_id` | `{{$guid}}` |
| `x-hcx-request_id` | `{{$guid}}` |
| `x-hcx-correlation_id` | `{{$guid}}` |
| `x-hcx-workflow_id` | `11` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `request.initiated` |
| `x-hcx-ben-abha-id` | `91711234567890` |

**Workflow codes**

| Code | Name | Authored by | `x-hcx-status` | Means |
| :-- | :-- | :-- | :-- | :-- |
| `10` | Patient Registered | provider | `request.initiated` | Patient registered in system |
| `11` | Patient Admitted | provider | `request.initiated` | Patient admitted to hospital |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `purpose` | Eligibility Purpose | Case | `code` | `1..1` | `CoverageEligibilityRequest.purpose[0]` | `auth-requirements` | code system `http://hl7.org/fhir/eligibilityrequest-purpose` |
| `caseNumber` | Provider Reference | Case | `string` | `1..1` | `CoverageEligibilityRequest.identifier[0].value` | `PA0000000001` | also at `Bundle.id` |
| `servicedDate` | Date of Service | Case | `date` | `1..1` | `CoverageEligibilityRequest.servicedDate` | `2026-02-26` |  |
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
| `productOrService` | Package Code | Item | `string` | `0..*` | `CoverageEligibilityRequest.item[].productOrService.coding[0].code` | `MG004A` |  |

NRCeS profiles: [CoverageEligibilityRequest](https://nrces.in/ndhm/fhir/r4/StructureDefinition-CoverageEligibilityRequest.html), [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html), [Coverage](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Coverage.html), [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html).

### D3 Check coverage eligibility (pmjay)

Validation after registration returns the wallet, one benefit entry per wallet with allowed and used. Benefits and auth-requirements before a pre-authorisation return what the package needs attached. Register only after coverage is validated, and validate again every time treatment is added.

| | |
| :-- | :-- |
| **API** | `/v1/coverageeligibility/check` [`apis/02-eligibility/v1-coverageeligibility-check.bru`](../../apis/02-eligibility/v1-coverageeligibility-check.bru) |
| **Callback** | `/v1/coverageeligibility/on_check` [`apis/02-eligibility/v1-coverageeligibility-on-check.bru`](../../apis/02-eligibility/v1-coverageeligibility-on-check.bru) |
| **Workflow** | none (or 5 under PMJAY) |
| **Carries JWE** | yes |
| **Focal resource** | `CoverageEligibilityRequest` |

**Request headers**

| Header | Example value |
| :-- | :-- |
| `x-hcx-sender_code` | `1000004446@hcx` |
| `x-hcx-recipient_code` | `1518@hcx` |
| `x-hcx-api_call_id` | `{{$guid}}` |
| `x-hcx-request_id` | `{{$guid}}` |
| `x-hcx-correlation_id` | `{{$guid}}` |
| `x-hcx-workflow_id` | `11` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `request.initiated` |
| `x-hcx-ben-abha-id` | `91711234567890` |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `memberId` | PMJAY Family ID | Beneficiary | `string` | `1..1` | `Patient.identifier[type=PMJAY].value` | `PMJAY-HP-2024-998811` |  |
| `purpose` | Purpose | Case | `code` | `1..1` | `CoverageEligibilityRequest.purpose[0]` | `validation` |  |

NRCeS profiles: [CoverageEligibilityRequest](https://nrces.in/ndhm/fhir/r4/StructureDefinition-CoverageEligibilityRequest.html), [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html).
