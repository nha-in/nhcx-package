# Claim response

The payer's adjudication of a submitted claim, on `/v1/claim/on_submit`. The same bundle carries an acknowledgement, an approval, a query and a rejection.

Sent on `/v1/claim/on_submit`.

## The bundle

| # | Resource | Profile |
| :-- | :-- | :-- |
| 1 | `ClaimResponse` | none declared; NRCeS [ClaimResponse](https://nrces.in/ndhm/fhir/r4/StructureDefinition-ClaimResponse.html) |
| 2 | `Patient` | none declared; NRCeS [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html) |
| 3 | `Organization (pay)` | none declared; NRCeS [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 4 | `Organization (prov)` | none declared; NRCeS [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 5 | `Coverage` | none declared; NRCeS [Coverage](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Coverage.html) |

## Elements

### 1. ClaimResponse

NRCeS profile: [ClaimResponse](https://nrces.in/ndhm/fhir/r4/StructureDefinition-ClaimResponse.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `<participant-defined>`, value `NM-26-0SE00002L` |
| `identifier[].type.coding[]` | `CLN` Claim number in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code` |
| `status` | `active` |
| `use` | `claim` |
| `patient` | reference `<participant-defined>` |
| `created` | `2026-09-10T23:53:32+05:30` |
| `insurer` | reference `<participant-defined>` |
| `requestor` | reference `<participant-defined>` |
| `outcome` | `complete` |
| `disposition` | `Reprocessed and approved.` |
| `payeeType.coding[]` | `provider` Provider in `http://terminology.hl7.org/CodeSystem/payeetype` |
| `item[]` | id `Item/LI-558aa12a`, itemSequence `1` |
| `item[].adjudication[].category.coding[]` | `submitted` Submitted Amount in `https://hl7.org/fhir/R4/valueset-adjudication.html` |
|  | `eligible` Eligible Amount in `https://hl7.org/fhir/R4/valueset-adjudication.html` |
|  | `reason` Reason for Adjudication in `https://hl7.org/fhir/R4/valueset-adjudication.html` |
| | and 1 more |
| `item[].adjudication[].amount` | value `150000` |
| `item[].adjudication[].reason.coding[]` | display `Reprocessed and approved.` |
|  | `Approved` Approved |
| `adjudication[].category.coding[]` | `status` Status |
| `adjudication[].reason.coding[]` | `approved` Approved |
| `total[].category.coding[]` | `benefit` Benefit Amount in `https://hl7.org/fhir/R4/valueset-adjudication.html` |
|  | `submitted` Submitted Amount in `https://hl7.org/fhir/R4/valueset-adjudication.html` |
|  | `eligible` Eligible Amount |
| `total[].amount` | value `150000` |
| `total[]` | id `MRAV1985001/SANDBOX-DEFAULT-01` |

### 2. Patient

NRCeS profile: [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `<participant-defined>`, value `MRAV1985001` |
| `identifier[].type.coding[]` | `MB` Member Number in `http://terminology.hl7.org/CodeSystem/v2-0203` |
| `name[]` | family `Kumar`, given `Ravi`, text `Ravi Kumar` |
| `gender` | `male` |
| `birthDate` | `1985-06-15` |

### 3. Organization (pay)

NRCeS profile: [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html).

| Element | Example |
| :-- | :-- |
| `active` | `true` |
| `identifier[]` | system `https://facility.abdm.gov.in`, value `1000004805` |
| `identifier[].type.coding[]` | `NIIP` National Insurance Payor Identifier (Payor) in `http://terminology.hl7.org/CodeSystem/v2-0203` |
| `type[].coding[]` | `pay` Payer in `http://terminology.hl7.org/CodeSystem/organization-type` |
| `name` | `Sandbox Payer` |

### 4. Organization (prov)

NRCeS profile: [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html).

| Element | Example |
| :-- | :-- |
| `active` | `true` |
| `identifier[]` | system `https://facility.abdm.gov.in`, value `IN1910000151` |
| `identifier[].type.coding[]` | `NPI` National provider identifier in `http://terminology.hl7.org/CodeSystem/v2-0203` |
| `type[].coding[]` | `prov` Healthcare Provider in `http://terminology.hl7.org/CodeSystem/organization-type` |
| `name` | `KyroCare Multispeciality Hospital` |

### 5. Coverage

NRCeS profile: [Coverage](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Coverage.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `<participant-defined>`, value `SANDBOX-DEFAULT-01` |
| `identifier[].type.coding[]` | `NH` National Health Plan Identifier in `http://terminology.hl7.org/CodeSystem/v2-0203` |
| `status` | `active` |
| `type.coding[]` | `HIP` health insurance plan policy in `http://terminology.hl7.org/CodeSystem/v3-ActCode` |
| `beneficiary` | reference `<participant-defined>` |
| `period` | start `2026-01-01T00:00:00+05:30`, end `2026-12-31T00:00:00+05:30` |
| `payor[]` | reference `<participant-defined>` |
| `class[]` | id `POL7UMU002`, value `SANDBOX-DEFAULT-01` |
| `class[].type.coding[]` | `XV` Health Plan Identifier in `http://terminology.hl7.org/CodeSystem/v2-0203` |

## The answers

The same bundle, told apart by the workflow code, `outcome` and the claim-level adjudication reason.

| Variant | Workflow | outcome | reason |
| :-- | :-- | :-- | :-- |
| Acknowledged | `25` | `queued` | `submitted` Submitted |
| Approved | `26` | `complete` | `approved` Approved |
| Queried | `27` | `partial` | `queried` Queried |
| Rejected | `291` | `error` | `rejected` Rejected |

## Rules

### 1. queued is not partial

The acknowledgement is `queued` with claim-level reason `submitted`; a query is `partial` with reason `queried`, and can approve some items while it queries others. Read the claim-level reason, then `disposition`, then the totals.

### 2. Deductions

Item-level `deductible` adjudications carry the amount and the reason. Sum them before reporting an approved figure.

### 3. Joining

Join the response to the claim by `identifier.value`.

### 4. Settlement is separate

An approval closes adjudication, not the money. The claim closes on the payment notice.

### 5. Submitted amounts

Do not reconcile your submitted amount against the payer's `submitted` total; it comes from the payer's own record.

## PMJAY

The generic bundle above is what every payer takes, IRDAI-regulated insurers and TPAs included. PMJAY takes it with the changes and requirements below.

### What changes in the bundle

PMJAY sends this exchange in the generic shape.

### What PMJAY specifies

- `total[]` adds `tax` and `incentive` lines beside `benefit` and `submitted`.
- The adjudication reason carries the desk's audit trail, with mixed date formats. Display it; never parse a timestamp from it.
- A benefit of 0 on a query means undetermined, not refused.

## Use cases, APIs and data elements

### C7 Respond to claim (payer)

The adjudicated claim, item by item, with any deduction and its reason. The acknowledgement on 25 travels as response.partial with the payer's case number. Under PMJAY a query is this ClaimResponse on 27, answered by a fresh submit on 161.

| | |
| :-- | :-- |
| **API** | `/v1/claim/on_submit` [`apis/05-claim/v1-claim-on-submit.bru`](../../apis/05-claim/v1-claim-on-submit.bru) |
| **Callback** | `/v1/claim/submit` [`apis/05-claim/v1-claim-submit.bru`](../../apis/05-claim/v1-claim-submit.bru) |
| **Workflow** | 25 received, 26 approved, 27 queried, 28 in process, 29 forwarded, 291 denied |
| **Carries JWE** | yes |
| **Focal resource** | `ClaimResponse` |

**Request headers**

| Header | Example value |
| :-- | :-- |
| `x-hcx-sender_code` | `1518@hcx` |
| `x-hcx-recipient_code` | `1000004446@hcx` |
| `x-hcx-api_call_id` | `{{$guid}}` |
| `x-hcx-request_id` | `{{$guid}}` |
| `x-hcx-correlation_id` | `{{correlationId}}` |
| `x-hcx-workflow_id` | `26` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `response.complete` |
| `x-hcx-ben-abha-id` | `91-7112-3456-7890` |
| `x-hcx-debug_flag` | `INFO` |

**Workflow codes**

| Code | Name | Authored by | `x-hcx-status` | Means |
| :-- | :-- | :-- | :-- | :-- |
| `25` | Claim Request Received | payer | `response.partial`, `response.error` | Final claim received by payer |
| `26` | Claim Request Approved | payer | `response.complete` | Final claim approved |
| `27` | Claim Request Queried | payer | `request.initiated`, `response.partial/complete` | Final claim queried - payer needs additional documents; under PMJAY answer with 161 |
| `28` | Claim Request In Process | payer | `response.partial` | Final claim is being processed by payer |
| `29` | Claim Forwarded | payer | `response.partial` | Claim forwarded to another processing entity |
| `291` | Claim Doc Deny | status sheet only | `response.complete` |  |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `outcome` | Claim Outcome | Adjudication | `code` | `1..1` | `ClaimResponse.outcome` | `complete` |  |
| `approvedBenefit` | Approved Claim Amount | Financials | `decimal` | `1..1` | `ClaimResponse.total[category=benefit].amount.value` | `150000` |  |
| `copayAmount` | Beneficiary Co-payment | Financials | `decimal` | `0..1` | `ClaimResponse.total[category=copay].amount.value` | `0.00` |  |
| `deductionReason` | Deduction Justification | Adjudication | `string` | `0..1` | `ClaimResponse.item[].adjudication[category=deductible].reason.coding[0].display` | `Non-Covered Service: The claimed service is not covered under the policy and therefore the amount is deducted.` |  |

NRCeS profiles: [ClaimResponse](https://nrces.in/ndhm/fhir/r4/StructureDefinition-ClaimResponse.html).
