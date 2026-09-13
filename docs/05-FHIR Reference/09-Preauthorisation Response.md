# Preauthorisation response

The payer's answer, on the provider's `/v1/preauth/on_submit` callback. A collection bundle whose spine is a `ClaimResponse` carrying the request's case number. The same shape carries an acknowledgement, an approval, a query and a rejection.

Sent on `/v1/preauth/on_submit`.

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
| `identifier[]` | system `<participant-defined>`, value `NM-26-0SE00002M` |
| `identifier[].type.coding[]` | `CLN` Claim number in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code` |
| `status` | `active` |
| `use` | `preauthorization` |
| `patient` | reference `<participant-defined>` |
| `created` | `2026-09-10T23:54:09+05:30` |
| `insurer` | reference `<participant-defined>` |
| `requestor` | reference `<participant-defined>` |
| `outcome` | `complete` |
| `disposition` | `Approved after the status enquiry.` |
| `preAuthRef` | `CL/26/0SE000108` |
| `payeeType.coding[]` | `provider` Provider in `http://terminology.hl7.org/CodeSystem/payeetype` |
| `item[]` | id `Item/LI-899f9802`, itemSequence `1` |
| `item[].adjudication[].category.coding[]` | `submitted` Submitted Amount in `https://hl7.org/fhir/R4/valueset-adjudication.html` |
|  | `eligible` Eligible Amount in `https://hl7.org/fhir/R4/valueset-adjudication.html` |
|  | `reason` Reason for Adjudication in `https://hl7.org/fhir/R4/valueset-adjudication.html` |
| | and 1 more |
| `item[].adjudication[].amount` | value `150000` |
| `item[].adjudication[].reason.coding[]` | display `Approved after the status enquiry.` |
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
| Acknowledged | `20` | `queued` | `submitted` Submitted |
| Approved | `21` | `complete` | `approved` Approved |
| Enhancement approved | `22` | `complete` | `approved` Approved |
| Rejected | `23` | `error` | `rejected` Rejected |
| Queried | `24` | `partial` | `queried` Queried |

## Rules

### 1. Read outcome with the reason

`outcome` `complete` covers approval and rejection alike. Read it with `adjudication[].reason` at claim level.

### 2. Answer early, decide later

Acknowledge at once on 20 as `response.partial`, then decide on 21 or 23 as `response.complete`, or the exchange retires the correlation before the adjudicator gets to it.

### 3. The case number

`preAuthRef` carries the payer's own case number. Store it on arrival; later requests on the case name it.

### 4. Items by sequence

Read item adjudication by `itemSequence`, never by array position. A reduced amount does not force `outcome` to `partial`; reconcile the amounts yourself.

### 5. Totals

`total[]` carries `benefit`, `submitted` and `eligible`. The `eligible` total names the member and the plan in its `id`; key on the category and the `id` together.

### 6. disposition is prose

For a human. Route on `outcome` and the adjudication codes.

### 7. Match on the case number

Join the response to the request on `identifier` and `preAuthRef`, never on the provider identifier or name, which can change shape between request and response.

### 8. Adjudication systems

Some senders bind adjudication categories to a documentation URL. Match on the code.

## PMJAY

The generic bundle above is what every payer takes, IRDAI-regulated insurers and TPAs included. PMJAY takes it with the changes and requirements below.

### What changes in the bundle

PMJAY sends this exchange in the generic shape.

### What PMJAY specifies

- A rejection is `outcome` `error` with reason `rejected` and benefit 0. Generic payers send `complete` with `cancelled` or `rejected`. Handle both.
- A query is `outcome` `partial` with reason `queried`, the question as free text in the item adjudication; see the query chapter.
- `preAuthRef` carries the scheme's case id. It is what the payer service uses to address the case.

### What PMJAY requires

- Store the case reference the moment it arrives. Enhancements, claims and the payer service address the case by it.

## Use cases, APIs and data elements

### C5 Respond to pre-authorisation (payer)

The adjudicated pre-authorisation. The acknowledgement on 20 travels as response.partial and carries the payer's own case number; the decisions travel as response.complete. Read outcome and the adjudication amounts together: complete covers approval and denial alike. Under PMJAY a query is this ClaimResponse on 24 or 241, on the case's own thread.

| | |
| :-- | :-- |
| **API** | `/v1/preauth/on_submit` [`apis/03-preauth/v1-preauth-on-submit.bru`](../../apis/03-preauth/v1-preauth-on-submit.bru) |
| **Callback** | `/v1/preauth/submit` [`apis/03-preauth/v1-preauth-submit.bru`](../../apis/03-preauth/v1-preauth-submit.bru) |
| **Workflow** | 20 received, 21 approved, 23 rejected, 24 queried, 22 enhancement approved, 231 denied, 241 queried |
| **Carries JWE** | yes |
| **Focal resource** | `ClaimResponse` |

**Request headers**

| Header | Example value |
| :-- | :-- |
| `x-hcx-sender_code` | `1518@hcx` |
| `x-hcx-recipient_code` | `1000004446@hcx` |
| `x-hcx-api_call_id` | `{{$guid}}` |
| `x-hcx-request_id` | `{{$guid}}` |
| `x-hcx-correlation_id` | `{{$guid}}` |
| `x-hcx-workflow_id` | `21` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `response.complete` |
| `x-hcx-ben-abha-id` | `91711234567890` |
| `x-hcx-debug_flag` | `INFO` |

**Workflow codes**

| Code | Name | Authored by | `x-hcx-status` | Means |
| :-- | :-- | :-- | :-- | :-- |
| `20` | Preauth Request Received | payer | `response.partial`, `response.error` | Payer has received and acknowledged the preauth request |
| `21` | Preauth Request Approved | payer | `response.complete` | Preauth fully approved - proceed with treatment |
| `23` | Preauth Request Rejected | payer | `response.complete` | Preauth rejected - review error/processNote for reason |
| `24` | Preauth Request Queried | payer | `request.initiated` | Payer needs more information - respond using workflow 19 |
| `22` | Enhancement Request Approved | payer | `response.complete` | Enhancement request approved by payer |
| `231` | Enhancement Deny | status sheet only | `response.complete` |  |
| `241` | Enhancement Request Queried | payer | `request.initiated` | Enhancement request queried by payer |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `outcome` | Verdict Outcome | Verdict | `code` | `1..1` | `ClaimResponse.outcome` | `complete` |  |
| `preAuthRef` | Payer Case Tracking ID | Verdict | `string` | `0..1` | `ClaimResponse.preAuthRef` | `APPR-2026-HP-00891` |  |
| `approvedAmount` | Approved Pre-auth Sanction | Financials | `decimal` | `0..1` | `ClaimResponse.total[category=benefit].amount.value` | `15500.00` |  |
| `disposition` | Adjudicator Remarks | Verdict | `string` | `0..1` | `ClaimResponse.disposition` | `Approved by PPD-Trust committee` |  |

NRCeS profiles: [ClaimResponse](https://nrces.in/ndhm/fhir/r4/StructureDefinition-ClaimResponse.html).
