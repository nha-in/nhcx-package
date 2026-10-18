# Payment notice and acknowledgement

The payer's notice that money has moved against an approved claim, and the provider's acknowledgement. The only exchange that carries actual money rather than an adjudicated figure.

## The notice

Sent on `/v1/paymentnotice/request`, workflow 30 initiated, 31 processed, 33 settled.

### The bundle

| # | Resource | Profile |
| :-- | :-- | :-- |
| 1 | `Task` | none declared; NRCeS [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html) |
| 2 | `PaymentNotice` | none declared; NRCeS [PaymentNotice](https://nrces.in/ndhm/fhir/r4/StructureDefinition-PaymentNotice.html) |
| 3 | `PaymentReconciliation` | none declared; NRCeS [PaymentReconciliation](https://nrces.in/ndhm/fhir/r4/StructureDefinition-PaymentReconciliation.html) |
| 4 | `Organization (prov)` | none declared; NRCeS [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 5 | `Organization (pay)` | none declared; NRCeS [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |

### Elements

#### 1. Task

NRCeS profile: [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html).

| Element | Example |
| :-- | :-- |
| `status` | `requested` |
| `intent` | `order` |
| `code.coding[]` | `deliver` deliver in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-task-codes` |
| `description` | `Settled in full: INR 135000 paid against INR 150000 approved.` |
| `authoredOn` | `2026-09-10T23:53:39+05:30` |
| `requester` | reference `<participant-defined>` |
| `owner` | reference `<participant-defined>` |
| `input[].type.coding[]` | `status` Status code in `http://terminology.hl7.org/CodeSystem/financialtaskinputtype` |
| `input[].valueReference` | reference `<participant-defined>` |

#### 2. PaymentNotice

NRCeS profile: [PaymentNotice](https://nrces.in/ndhm/fhir/r4/StructureDefinition-PaymentNotice.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `<participant-defined>`, value `NM-26-0SE00002L` |
| `identifier[].type.coding[]` | `CLN` Claim number in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code` |
| `status` | `active` |
| `created` | `2026-09-10T23:53:39+05:30` |
| `payment` | reference `<participant-defined>` |
| `recipient` | reference `<participant-defined>` |
| `amount` | value `135000`, currency `INR` |
| `paymentStatus.coding[]` | `cleared` Cleared in `http://terminology.hl7.org/CodeSystem/paymentstatus` |

#### 3. PaymentReconciliation

NRCeS profile: [PaymentReconciliation](https://nrces.in/ndhm/fhir/r4/StructureDefinition-PaymentReconciliation.html).

| Element | Example |
| :-- | :-- |
| `identifier[]` | system `<participant-defined>`, value `NM-26-0SE00002L` |
| `identifier[].type.coding[]` | `CLN` Claim number in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code` |
| `status` | `active` |
| `created` | `2026-09-10T23:53:39+05:30` |
| `disposition` | `Settled in full: INR 135000 paid against INR 150000 approved.` |
| `paymentDate` | `2026-09-10` |
| `paymentAmount` | value `135000`, currency `INR` |
| `paymentIdentifier` | system `<participant-defined>`, value `UTR1789064619092` |
| `paymentIdentifier.type.coding[]` | `UTR` Unique Transaction Reference in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code` |
| `detail[]` | id `PAY-2026-0009/TDS`, date `2026-09-10` |
|  | id `PAY-2026-0009/Payment`, date `2026-09-10` |
| `detail[].identifier` | system `<participant-defined>`, value `PAY-2026-0009/TDS` |
|  | system `<participant-defined>`, value `PAY-2026-0009/Payment` |
| `detail[].identifier.type.coding[]` | `PLAC` Placer Identifier in `https://https://nrces.in/ndhm/fhir/r4/ValueSet-ndhm-identifier-type-code.html` |
| `detail[].type.coding[]` | `TDS` TDS in `http://hl7.org/fhir/ValueSet/payment-type` |
|  | `Payment` Payment in `http://hl7.org/fhir/ValueSet/payment-type` |
| `detail[].amount` | value `15000` |
|  | value `135000` |

The `Organization` entries are shaped as in the chapters that introduce them.

## The acknowledgement

Sent on `/v1/paymentnotice/on_request`, workflow 30 echoed; 17 under PMJAY.

### The bundle

| # | Resource | Profile |
| :-- | :-- | :-- |
| 1 | `Task` | [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html) |
| 2 | `Organization (prov)` | [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 3 | `Organization (pay)` | [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |

### Elements

#### 1. Task

NRCeS profile: [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html).

| Element | Example |
| :-- | :-- |
| `status` | `completed` |
| `intent` | `order` |
| `code.coding[]` | `status` in `http://terminology.hl7.org/CodeSystem/financialtaskcode` |
| `authoredOn` | `2026-09-10T23:53:40+05:30` |
| `requester` | reference `https://nhcx.abdm.gov.in/provider` |
| `owner` | reference `https://nhcx.abdm.gov.in/payer` |
| `description` | `Received the payment for claim NM-26-0SE00002L` |
| `output[].type.coding[]` | `status` Status in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-task-output-type` |
|  | `claimNumber` ClaimNumber in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-task-input-type-code` |
| `output[].valueCodeableConcept.coding[]` | `paymentack` Payment is acknowledged in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-task-output-value` |
| `output[]` | valueString `NM-26-0SE00002L` |

The `Organization` entries are shaped as in the chapters that introduce them.

## Rules

### 1. The notice

A `Task` coded `deliver` in `ndhm-task-codes` whose input references the `PaymentNotice`. The `Payment` line of `detail[]` is the net that reaches the account; `PaymentNotice.amount` is the net in the samples and the gross from a live PMJAY payer, so never read the net from it. `PaymentReconciliation` carries the payment date, the `UTR` and one `detail[]` line per money type.

### 2. The arithmetic

Net plus the deductions equals the adjudicated benefit, not the submitted amount. Run the check on every notice and flag a case that fails it.

### 3. The acknowledgement

A `Task` coded `status` in `financialtaskcode`, `completed`, with an output `paymentack` and the claim number as a second output. It confirms receipt, not agreement.

### 4. Three notices

30, 31 and 33, each with its own correlation id. The bank reference arrives on 33. Keep the path for the acknowledgement configurable per payer.

## PMJAY

The generic bundle above is what every payer takes, IRDAI-regulated insurers and TPAs included. PMJAY takes it with the changes and requirements below.

### What changes in the bundle

#### The notice

##### Systems PMJAY binds differently

| Element | Generic | PMJAY |
| :-- | :-- | :-- |
| `PaymentNotice.identifier[]` | `<participant-defined>` | `https://hcx.pmjay.gov.in/v1/preauthorization` |
| `PaymentReconciliation.identifier[]` | `<participant-defined>` | `https://hcx.pmjay.gov.in/v1/preauthorization` |
| `PaymentReconciliation.paymentIdentifier` | `<participant-defined>` | `https://payer.gov.in` |
| `PaymentReconciliation.detail[].identifier` | `<participant-defined>` | `https://hcx.pmjay.gov.in/v1/claim` |

#### The acknowledgement

The PMJAY bundle has the same resources, elements and systems as the generic one.

### What PMJAY specifies

- Deduction lines use the scheme's own codes, such as `RF` or `TDS`, beside the `Payment` line.
- A live SHA notice of October 2026 gave `PaymentNotice.amount` and `paymentAmount` as the gross, the `TDS` and `Payment` lines summing to it; the package's PMJAY samples give the net there.
- The notice names the claim under `https://hcx.pmjay.gov.in/v1/preauthorization`.
- Before 33 the `UTR` field can carry a scheme reference rather than a bank reference. Store it; reconcile against the bank only on 33.

### What PMJAY requires

- Acknowledge each notice on 17.
- Keep the UTR from 33; the shortfall window opens only once 33 is acknowledged.

## Use cases, APIs and data elements

### C9 Send payment notice (payer)

The money, on a new thread of its own, with the reconciliation itemised by type: approved, claimed, tds, servicetax, advance, recovered, penality. The bank's UTR rides on the settled notice.

| | |
| :-- | :-- |
| **API** | `/v1/paymentnotice/request` [`apis/06-payment-notice/v1-paymentnotice-request.bru`](../../apis/06-payment-notice/v1-paymentnotice-request.bru) |
| **Callback** | `/v1/paymentnotice/on_request` [`apis/06-payment-notice/v1-paymentnotice-on-request.bru`](../../apis/06-payment-notice/v1-paymentnotice-on-request.bru) |
| **Workflow** | 30 initiated, 31 processed, 33 settled |
| **Carries JWE** | yes |
| **Focal resource** | `PaymentReconciliation` |

**Request headers**

| Header | Example value |
| :-- | :-- |
| `x-hcx-sender_code` | `1518@hcx` |
| `x-hcx-recipient_code` | `1000004446@hcx` |
| `x-hcx-api_call_id` | `{{$guid}}` |
| `x-hcx-request_id` | `{{$guid}}` |
| `x-hcx-correlation_id` | `{{$guid}}` |
| `x-hcx-workflow_id` | `30` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `request.initiated` |
| `x-hcx-ben-abha-id` | `91-7112-3456-7890` |

**Workflow codes**

| Code | Name | Authored by | `x-hcx-status` | Means |
| :-- | :-- | :-- | :-- | :-- |
| `30` | Payment Initiated | payer | `request.initiated`, `response.partial`, `response.error` | Payment initiated by payer, on a new thread |
| `31` | Payment Processed | payer | `request.initiated` | Payment has been processed |
| `33` | Payment Settled | payer | `request.initiated` | Payment has been fully settled |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `utrNumber` | Bank UTR Number | Payment | `string` | `1..1` | `PaymentReconciliation.paymentIdentifier.value` | `UTR1789064619092` |  |
| `paymentDate` | Remittance Date | Payment | `date` | `1..1` | `PaymentReconciliation.paymentDate` | `2026-09-10` |  |
| `settledAmount` | Net Bank Remittance Amount | Payment | `decimal` | `1..1` | `PaymentReconciliation.paymentAmount.value` | `135000` |  |
| `tdsDeduction` | Tax Deducted at Source (TDS) | Payment Detail | `decimal` | `0..1` | `PaymentReconciliation.detail[type=TDS].amount.value` | `15000` |  |

NRCeS profiles: [PaymentReconciliation](https://nrces.in/ndhm/fhir/r4/StructureDefinition-PaymentReconciliation.html).

### B7 Acknowledge payment notice (provider)

The receipt for a payment notice, as a Task on this endpoint. The notice arrives on a new thread of its own; a generic payer takes the acknowledgement with the notice's 30 echoed, PMJAY with 17.

| | |
| :-- | :-- |
| **API** | `/v1/paymentnotice/on_request` [`apis/06-payment-notice/v1-paymentnotice-on-request.bru`](../../apis/06-payment-notice/v1-paymentnotice-on-request.bru) |
| **Callback** | `/v1/paymentnotice/request` [`apis/06-payment-notice/v1-paymentnotice-request.bru`](../../apis/06-payment-notice/v1-paymentnotice-request.bru) |
| **Workflow** | 30 echoed from the notice on the generic network; 17 under PMJAY |
| **Carries JWE** | yes |
| **Focal resource** | `Task` |

**Request headers**

| Header | Example value |
| :-- | :-- |
| `x-hcx-sender_code` | `1000004446@hcx` |
| `x-hcx-recipient_code` | `1518@hcx` |
| `x-hcx-api_call_id` | `{{$guid}}` |
| `x-hcx-request_id` | `{{$guid}}` |
| `x-hcx-correlation_id` | `{{correlationId}}` |
| `x-hcx-workflow_id` | `17` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `response.complete` |
| `x-hcx-ben-abha-id` | `91-7112-3456-7890` |
| `x-hcx-debug_flag` | `INFO` |

**Workflow codes**

| Code | Name | Authored by | `x-hcx-status` | Means |
| :-- | :-- | :-- | :-- | :-- |
| `30` | Payment Initiated | payer | `request.initiated`, `response.partial`, `response.error` | Payment initiated by payer, on a new thread |
| `17` | Payment Received | provider | `response.complete` | Payment received acknowledgment under PMJAY; a generic payer takes it with the notice's 30 echoed |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `taskCode` | Task Code | Task | `code` | `1..1` | `Task.code.coding[0].code` | `status` | code system `http://terminology.hl7.org/CodeSystem/financialtaskcode` |
| `status` | Acknowledgment Status | Task | `code` | `1..1` | `Task.status` | `completed` |  |
| `ackValue` | Acknowledgment | Task Output | `code` | `1..1` | `Task.output[type=status].valueCodeableConcept.coding[0].code` | `paymentack` | code system `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-task-output-value` |
| `claimNumber` | Claim Number paid | Task Output | `string` | `1..1` | `Task.output[type=claimNumber].valueString` | `NM-26-0SE00002L` |  |

NRCeS profiles: [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html).

### D13 Acknowledge the payment notice (pmjay)

Three notices may arrive: 30 when the transfer is initiated, 31 when the bank processes it, 33 when it settles with the UTR. The reconciliation splits the amount into what was paid and what was deducted as tax. Keep the UTR; it is the reference for any dispute.

| | |
| :-- | :-- |
| **API** | `/v1/paymentnotice/on_request` [`apis/06-payment-notice/v1-paymentnotice-on-request.bru`](../../apis/06-payment-notice/v1-paymentnotice-on-request.bru) |
| **Callback** | `/v1/paymentnotice/request` [`apis/06-payment-notice/v1-paymentnotice-request.bru`](../../apis/06-payment-notice/v1-paymentnotice-request.bru) |
| **Workflow** | 17 |
| **Carries JWE** | yes |
| **Focal resource** | `Task` |
| **Simulator console** | `/builder?family=paymentnotice&usecase=acknowledge` |

**Request headers**

| Header | Example value |
| :-- | :-- |
| `x-hcx-sender_code` | `1000004446@hcx` |
| `x-hcx-recipient_code` | `1518@hcx` |
| `x-hcx-api_call_id` | `{{$guid}}` |
| `x-hcx-request_id` | `{{$guid}}` |
| `x-hcx-correlation_id` | `{{correlationId}}` |
| `x-hcx-workflow_id` | `17` |
| `x-hcx-timestamp` | `{{$isoTimestamp}}` |
| `x-hcx-status` | `response.complete` |
| `x-hcx-ben-abha-id` | `91-7112-3456-7890` |
| `x-hcx-debug_flag` | `INFO` |

**Workflow codes**

| Code | Name | Authored by | `x-hcx-status` | Means |
| :-- | :-- | :-- | :-- | :-- |
| `17` | Payment Received | provider | `response.complete` | Payment received acknowledgment under PMJAY; a generic payer takes it with the notice's 30 echoed |

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `taskCode` | Task Code | Task | `code` | `1..1` | `Task.code.coding[0].code` | `status` | code system `http://terminology.hl7.org/CodeSystem/financialtaskcode` |
| `status` | Acknowledgment Status | Task | `code` | `1..1` | `Task.status` | `completed` |  |
| `ackValue` | Acknowledgment | Task Output | `code` | `1..1` | `Task.output[type=status].valueCodeableConcept.coding[0].code` | `paymentack` | code system `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-task-output-value` |
| `claimNumber` | Claim Number paid | Task Output | `string` | `1..1` | `Task.output[type=claimNumber].valueString` | `NM-26-0SF000030` |  |
| `workflowId` | Workflow Code | Header | `string` | `1..1` | `Header.x-hcx-workflow_id` | `17` |  |

NRCeS profiles: [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html).
