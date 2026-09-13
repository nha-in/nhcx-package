# Insurance plan response

The payer's answer to the poll, and the largest message on NHCX. It is the policy as data: what the hospital may bill, at what rate, under what rules, with which documents and on which forms. Everything on a treatment-planning screen comes from here.

Sent on `/v1/insuranceplan/on_request`.

## The bundle

| # | Resource | Profile |
| :-- | :-- | :-- |
| 1 | `InsurancePlan` | [InsurancePlan](https://nrces.in/ndhm/fhir/r4/StructureDefinition-InsurancePlan.html) |
| 2 | `Organization (ins)` | [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 3 | `Questionnaire` | none |
| 4 | `Questionnaire` | none |
| 5 | `Questionnaire` | none |
| 6 | `Questionnaire` | none |
| 7 | `Questionnaire` | none |

## Elements

### 1. InsurancePlan

NRCeS profile: [InsurancePlan](https://nrces.in/ndhm/fhir/r4/StructureDefinition-InsurancePlan.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `https://irdai.gov.in`, value `SANDBOX-DEFAULT-01` |
| `status` | `active` |
| `type[].coding[]` | `01` Hospitalisation Indemnity Policy in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-insuranceplan-type` |
| `name` | `Sandbox Default Policy` |
| `alias` | `Sandbox Default`, `Default` |
| `period` | start `2026-01-01`, end `2026-12-31` |
| `ownedBy` | reference `urn:uuid:39cd4b51-bddd-5cc1-a65a-6fa4a2a83cb5`, display `Sandbox Payer` |
| `administeredBy` | reference `urn:uuid:39cd4b51-bddd-5cc1-a65a-6fa4a2a83cb5`, display `Sandbox Payer` |
| `plan[].identifier[]` | use `official`, value `Sandbox Default Policy` |
| `plan[].type.coding[]` | `01` Individual in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-plan-type` |
| `plan[].generalCost[].cost` | value `500000`, currency `INR` |

### 2. Organization (ins)

NRCeS profile: [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html).

| Element | Example |
| :-- | :-- |
| `type[].coding[]` | `ins` Insurance Company in `http://terminology.hl7.org/CodeSystem/organization-type` |
| `name` | `Sandbox Payer` |
| `address[]` | city `Bengaluru`, state `Karnataka`, country `India` |

### 3. Questionnaire

| Element | Example |
| :-- | :-- |
| `url` | `<participant-defined>` |
| `name` | `STG Questionnaire` |
| `title` | `Paediatric Pneumonia, PICU Management, Standard Treatment Guidelines` |
| `status` | `active` |

### 4. Questionnaire

| Element | Example |
| :-- | :-- |
| `url` | `<participant-defined>` |
| `name` | `STG Questionnaire` |
| `title` | `Percutaneous Transluminal Coronary Angioplasty (PTCA), Standard Treatment Guide…` |
| `status` | `active` |

### 5. Questionnaire

| Element | Example |
| :-- | :-- |
| `url` | `<participant-defined>` |
| `name` | `STG Questionnaire` |
| `title` | `Cataract Surgery with Foldable IOL, Standard Treatment Guidelines` |
| `status` | `active` |

### 6. Questionnaire

| Element | Example |
| :-- | :-- |
| `url` | `<participant-defined>` |
| `name` | `STG Questionnaire` |
| `title` | `Acute Appendectomy (Laparoscopic), Standard Treatment Guidelines` |
| `status` | `active` |

### 7. Questionnaire

| Element | Example |
| :-- | :-- |
| `url` | `<participant-defined>` |
| `name` | `STG Questionnaire` |
| `title` | `Total Knee Replacement (Unilateral), Standard Treatment Guidelines` |
| `status` | `active` |

## Questionnaires

| Title | Items | Item types | Question in |
| :-- | :-- | :-- | :-- |
| Paediatric Pneumonia, PICU Management, Standard Treatment Guidelines | 4 | `string` | `text` |
| Percutaneous Transluminal Coronary Angioplasty (PTCA), Standard Treatment Guide… | 5 | `string` | `text` |
| Cataract Surgery with Foldable IOL, Standard Treatment Guidelines | 4 | `string` | `text` |
| Acute Appendectomy (Laparoscopic), Standard Treatment Guidelines | 4 | `string` | `text` |
| Total Knee Replacement (Unilateral), Standard Treatment Guidelines | 5 | `string` | `text` |

## Rules

### 1. Two shapes

Coverage-based, sent by private insurers and TPAs: benefits with money limits, rules as prose. Package-based, sent by government schemes: named packages at fixed rates, rules as flags. The next two chapters take each shape.

### 2. Two type codes

`InsurancePlan.type` says what kind of insurance this is. `plan.type` says how it is sold, individual or group.

### 3. Identifier

A private insurer's plan is identified under `https://irdai.gov.in`. A scheme plan is identified under NHA hosts, with the policy code and the revision.

### 4. The wallet

`plan.generalCost` is the sum insured, or the family wallet under a scheme.

### 5. Cache per policy

Stamp the cache with the plan's revision identifier, and record on every preauthorisation and claim which revision it was built against.

### 6. The first line of validation

Codes and displays, amounts, quantities and mandatory documents are checked against the cached plan on the server before anything is sent.

### 7. The forms

The `Questionnaire` resources are the payer's forms. Render them from the plan, never hard-code them, because they change with the plan.

## PMJAY

The generic bundle above is what every payer takes, IRDAI-regulated insurers and TPAs included. PMJAY takes it with the changes and requirements below.

### What changes in the bundle

#### Elements PMJAY adds

| Element | Example |
| :-- | :-- |
| `InsurancePlan.identifier[].type.coding[]` | `NH` National Health Plan Identifier in `http://terminology.hl7.org/CodeSystem/v2-0203` |
|  | `XV` Health Plan Identifier in `http://terminology.hl7.org/CodeSystem/v2-0203` |
| `Organization.identifier[]` | system `https://facility.abdm.gov.in`, value `1518` |
| `Organization.identifier[].type.coding[]` | `NIIP` National Insurance Payor Identifier (Payor) in `http://terminology.hl7.org/CodeSystem/v2-0203` |
| `Organization.active` | `true` |
| `Organization.contact[].telecom[]` | system `phone`, value `9000000003` |

#### Elements PMJAY leaves out

| Element | Example |
| :-- | :-- |
| `InsurancePlan.alias` | `Sandbox Default`, `Default` |
| `InsurancePlan.plan[].identifier[]` | use `official`, value `Sandbox Default Policy` |
| `Organization.address[]` | city `Bengaluru`, state `Karnataka`, country `India` |

#### Systems PMJAY binds differently

| Element | Generic | PMJAY |
| :-- | :-- | :-- |
| `InsurancePlan.identifier[]` | `https://irdai.gov.in` | `https://hcx.pmjay.gov.in/v1/InsurancePlan`, `https://payer.nha.gov.in` |

### What PMJAY specifies

- Package-based throughout: `InsurancePlan.type` `07` Universal Health Policy, `plan.type` `03` Group.
- `identifier` carries the policy code typed `NH` and the scheme revision typed `XV`; the revision is what the cache is stamped with.
- A full scheme plan carries thousands of `Questionnaire` entries, many of them repeated. Deduplicate on `fullUrl`.

### What PMJAY requires

- Keep the revision on every submission. An outdated tariff causes a rate mismatch and a rejection on suspicion of tampering.

## Use cases, APIs and data elements

### C4 Respond to insurance plan request (payer)

The plan as a benefit structure. Under PMJAY this is the scheme configuration for one hospital and can exceed twenty megabytes.

| | |
| :-- | :-- |
| **API** | `/v1/insuranceplan/on_request` [`apis/09-insurance-plan/v1-insuranceplan-on-request.bru`](../../apis/09-insurance-plan/v1-insuranceplan-on-request.bru) |
| **Callback** | `/v1/insuranceplan/request` [`apis/09-insurance-plan/v1-insuranceplan-request.bru`](../../apis/09-insurance-plan/v1-insuranceplan-request.bru) |
| **Workflow** | none (or 5 under PMJAY) |
| **Carries JWE** | yes |
| **Focal resource** | `InsurancePlan` |

**Request headers**

| Header | Example value |
| :-- | :-- |
| `x-hcx-sender_code` | `1518@hcx` |
| `x-hcx-recipient_code` | `1000004446@hcx` |
| `x-hcx-api_call_id` | `{{$guid}}` |
| `x-hcx-request_id` | `{{$guid}}` |
| `x-hcx-correlation_id` | `{{$guid}}` |
| `x-hcx-workflow_id` | `` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `response.complete` |
| `x-hcx-ben-abha-id` | `` |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `planName` | Insurance Plan Name | Plan | `string` | `1..1` | `InsurancePlan.name` | `PMJAY Ayushman Bharat` |  |
| `packageCode` | Benefit Package Code | Plan Cost | `string` | `1..*` | `InsurancePlan.plan[].specificCost[].benefit[].type.coding[0].code` | `MG004A` |  |
| `packageRate` | Agreed Tariff Rate | Plan Cost | `decimal` | `1..*` | `InsurancePlan.plan[].specificCost[].benefit[].cost[0].value.value` | `15500.00` |  |

NRCeS profiles: [InsurancePlan](https://nrces.in/ndhm/fhir/r4/StructureDefinition-InsurancePlan.html).
