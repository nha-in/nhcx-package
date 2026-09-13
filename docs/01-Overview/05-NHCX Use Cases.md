# NHCX Use Cases

A use case covers each stage of the claims lifecycle: onboarding providers and payers onto the network, verifying coverage, seeking preauthorisation, submitting claims, exchanging supporting information, and reconciling payments. Between them they deliver the core objectives of standardisation, traceability, and predictable auto-adjudication across India's National Health Claims Exchange (NHCX).

## Key Use Cases Overview

- **Onboarding Providers and Payers**: Onboard participants onto NHCX to validate and route requests to target applications.
- **Check Coverage Eligibility**: Called by providers to verify beneficiary coverage, policy validity, sum insured, sub-limits, and document requirements.
- **Preauth Request Submission**: Submitted by providers before admission or planned surgery. Payers respond with line-item adjudication via `on_submit`.
- **Predetermination Request**: Inquires expected coverage and deductible calculations for planned procedures without reserving policy balance.
- **Claim Request Submission**: Submitted by providers upon discharge with final bill, discharge summary, and itemised claims.
- **Communication Request**: Enables payers to query providers for additional documents (`additionalinfo`), flag turnaround-time breaches (`tatquery`), or issue policy updates.
- **Payment Notice & Reconciliation**: Payers notify providers of bank transfers (UTR), detailing claimed, approved, TDS, and settled amounts.
- **Reprocess / Cancel / Shortfall**: Providers appeal rejected claims (`reprocess`), request partial payment balance (`partialpayment`), or cancel approved preauthorisations.
- **Beneficiary Notifications**: Push notifications to personal health record (PHR) apps on claim status changes.

---

## Master Use Cases Matrix

All 40 NHA use cases by role, each with its API call and callback.

### Shared

#### A1 Get participant list

The participants in the registry, by role.

**API Call:** `/fetch/participants/list`

#### A2 Get policy

The policies a beneficiary holds, by mobile number or ABHA.

**API Call:** `/participant/get/policies`

#### A3 Get public key

The recipient's certificate, which is what the bundle is encrypted with.

**API Call:** `/fetch/certs`

#### A4 Get auth token

The ABDM session token every NHCX call carries, minted with the Milestone 1 client id and secret.

**API Call:** `/get/session`

#### A5 Get status

Where any request you made got to, by its correlation id.

**API Call:** `/v1/status`
**Callback:** `/v1/on_status`

#### A6 Receive errors

Where the exchange tells you a request could not be delivered after five attempts.

**API Call:** hosted only
**Callback:** `/v1/error`

### Provider

#### B1 Check coverage eligibility

Is the policy in force, what is left in the wallet, and what must be attached.

**API Call:** `/v1/coverageeligibility/check`
**Callback:** `/v1/coverageeligibility/on_check`

#### B2 Request insurance plan

A Task with code poll, keyed on policy number and provider id.

**API Call:** `/v1/insuranceplan/request`
**Callback:** `/v1/insuranceplan/on_request`

#### B3 Submit pre-authorisation

Permission to treat.

**API Call:** `/v1/preauth/submit`
**Callback:** `/v1/preauth/on_submit`

#### B4 Respond to a communication

Acknowledge or answer a message the payer sent about a case.

**API Call:** `/v1/communication/on_request`
**Callback:** `/v1/communication/request`

#### B5 Submit claim

Reimbursement after discharge.

**API Call:** `/v1/claim/submit`
**Callback:** `/v1/claim/on_submit`

#### B6 Search claims

Look up claim information by criteria.

**API Call:** `/v1/search/submit`
**Callback:** `/v1/search/on_submit`

#### B7 Acknowledge payment notice

The receipt for a payment notice, as a Task on this endpoint.

**API Call:** `/v1/paymentnotice/on_request`
**Callback:** `/v1/paymentnotice/request`

#### B8 Reprocess or cancel

One endpoint, several jobs, told apart by the Task's code and reason: reprocess with claimrejected, shortfall with partialpayment, cancel.

**API Call:** `/v1/task/submit`
**Callback:** `/v1/task/on_submit`

#### B9 Submit predetermination

What would the payer approve for this treatment?

**API Call:** `/v1/predetermination/submit`
**Callback:** `/v1/predetermination/on_submit`

### PMJAY

#### D1 Fetch the insurance plan

Keyed on provider id, policy code and participant id.

**API Call:** `/v1/insuranceplan/request`
**Callback:** `/v1/insuranceplan/on_request`

#### D2 Authenticate the beneficiary

Fingerprint, iris or face; all three must be built.

**API Call:** ABHA biometric auth init and verify (not NHCX)

#### D3 Check coverage eligibility

Validation after registration returns the wallet, one benefit entry per wallet with allowed and used.

**API Call:** `/v1/coverageeligibility/check`
**Callback:** `/v1/coverageeligibility/on_check`

#### D4 Submit pre-authorisation

Not more than one day before admission, with the biometric token or the consent response, the documents the auth-requirements answer asked for, the STG questionnaire for each package, and the registration and admission dates as supporting info.

**API Call:** `/v1/preauth/submit`
**Callback:** `/v1/preauth/on_submit`

#### D5 Resubmit pre-authorisation

Revises an approved or rejected case for a different amount or package.

**API Call:** `/v1/preauth/submit`
**Callback:** `/v1/preauth/on_submit`

#### D6 Raise an enhancement

Adds to an approved pre-authorisation, as many times as needed until discharge, one at a time, and only for packages whose plan flag allows it.

**API Call:** `/v1/preauth/submit`
**Callback:** `/v1/preauth/on_submit`

#### D7 Answer a pre-authorisation query

The query arrived as a ClaimResponse on 24, on the case's own thread, with the question in the item adjudication, not on the communication API.

**API Call:** `/v1/preauth/submit`
**Callback:** `/v1/preauth/on_submit`

#### D8 Cancel pre-authorisation

A Task with code cancel, the case number as input and one of seven reasons: treatmentplanchanged, patientrequest, financialconstraints, alternativetreatment, duplicateclaim, administrativeerror, other.

**API Call:** `/v1/task/submit`
**Callback:** `/v1/task/on_submit`

#### D9 Submit claim

There is no discharge submission: the claim asserts the discharge and carries its details.

**API Call:** `/v1/claim/submit`
**Callback:** `/v1/claim/on_submit`

#### D10 Answer a claim query

As D7, on the claim endpoint: the query is a ClaimResponse on 27, the answer a fresh submit on 161.

**API Call:** `/v1/claim/submit`
**Callback:** `/v1/claim/on_submit`

#### D11 Reprocess a rejected claim

An appeal, not a resubmission: a Task with code reprocess and reason claimrejected, a supporting document attached, no amount.

**API Call:** `/v1/task/submit`
**Callback:** `/v1/task/on_submit`

#### D12 Claim a shortfall

The same Task with reason partialpayment and an amount capped at the difference, allowed only after payment notice 33 has arrived and been acknowledged with 17.

**API Call:** `/v1/task/submit`
**Callback:** `/v1/task/on_submit`

#### D13 Acknowledge the payment notice

Three notices may arrive: 30 when the transfer is initiated, 31 when the bank processes it, 33 when it settles with the UTR.

**API Call:** `/v1/paymentnotice/on_request`
**Callback:** `/v1/paymentnotice/request`

### Payer

#### C1 Link ABHA with policy

Tie the ABHA number, mobile and member id to the policy's products at policy creation, naming the payer and the processor.

**API Call:** `/participant/link/abha/policy`

#### C2 De-link ABHA from policy

Undo C1.

**API Call:** `/participant/delink/abha/policy`

#### C3 Respond to coverage eligibility

The eligibility and plan details for the beneficiary asked about.

**API Call:** `/v1/coverageeligibility/on_check`
**Callback:** `/v1/coverageeligibility/check`

#### C4 Respond to insurance plan request

The plan as a benefit structure.

**API Call:** `/v1/insuranceplan/on_request`
**Callback:** `/v1/insuranceplan/request`

#### C5 Respond to pre-authorisation

The adjudicated pre-authorisation.

**API Call:** `/v1/preauth/on_submit`
**Callback:** `/v1/preauth/submit`

#### C6 Raise a communication

A message about a case, typed by its reason code: additionalinfo, tatquery for a turnaround breach, grievance, walletupdate, policychange, claimArbitration.

**API Call:** `/v1/communication/request`
**Callback:** `/v1/communication/on_request`

#### C7 Respond to claim

The adjudicated claim, item by item, with any deduction and its reason.

**API Call:** `/v1/claim/on_submit`
**Callback:** `/v1/claim/submit`

#### C8 Respond to search

The ClaimResponse objects matching the criteria asked for.

**API Call:** `/v1/search/on_submit`
**Callback:** `/v1/search/submit`

#### C9 Send payment notice

The money, on a new thread of its own, with the reconciliation itemised by type: approved, claimed, tds, servicetax, advance, recovered, penality.

**API Call:** `/v1/paymentnotice/request`
**Callback:** `/v1/paymentnotice/on_request`

#### C10 Respond to a Task

The answer to a reprocess, shortfall or cancel.

**API Call:** `/v1/task/on_submit`
**Callback:** `/v1/task/submit`

#### C11 Respond to predetermination

What the payer would approve for the proposed treatment.

**API Call:** `/v1/predetermination/on_submit`
**Callback:** `/v1/predetermination/submit`

### Patient app

#### E1 Subscribe to notifications

A patient app subscribes when the beneficiary logs in with their ABHA, and the most recent subscription wins.

**API Call:** `/v1/notification/subscribe`
**Callback:** `/v1/notification/on_subscribe`


---

## Shared Use Cases (Payer and Provider)

The following use cases are common to both Payer and Provider participants on the NHCX platform. None of them carries a workflow code, because they are registry and session calls rather than claim transactions.

### A1: Get participant list

- **Role / Side:** `shared`
- **API Called:** `/fetch/participants/list`
- **Carries JWE:** `false`
- **Simulator Console:** `/participants`
- **Data Element Mapping:** [`package/mappings/A1.yaml`](../../mappings/A1.yaml)

The participants in the registry, by role. How a provider finds a payer and a payer finds a provider.

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `roles` | Requested Role Filter | Request | `array[string]` | `1..*` | `Request.roles` | `["payor"]` |  |
| `participantCode` | Participant ID (@hcx) | Response | `string` | `1..1` | `Organization.identifier[system=https://nhcx.gov.in].value` | `1000003538@hcx` | also at `Header.x-hcx-recipient_code` |
| `participantName` | Entity Name | Response | `string` | `1..1` | `Organization.name` | `State Health Agency Himachal` |  |
| `endpointUrl` | Gateway Callback URL | Response | `url` | `1..1` | `Endpoint.address` | `https://payer.example.org/nhcx/v1` |  |
| `encryptionCertPath` | Encryption Certificate Path | Response | `url` | `1..1` | `Response.encryption_cert_path` | `https://apisbx.abdm.gov.in/certs/1000003538.pem` |  |

NRCeS profiles: [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html).

### A2: Get policy

- **Role / Side:** `shared`
- **API Called:** `/participant/get/policies`
- **Carries JWE:** `false`
- **Simulator Console:** `/search`
- **Data Element Mapping:** [`package/mappings/A2.yaml`](../../mappings/A2.yaml)

The policies a beneficiary holds, by mobile number or ABHA. Each names the insurer and the processor, and the processor is the recipient for every claim-side call.

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `mobile` | Beneficiary Mobile | Request | `string` | `0..1` | `Patient.telecom[system=phone].value` | `9876543210` |  |
| `abhaNumber` | ABHA Number | Request | `string` | `0..1` | `Patient.identifier[type=ABHA].value` | `91234567890123` |  |
| `policyNumber` | Discovered Policy Number | Response | `string` | `1..1` | `Coverage.identifier[0].value` | `POL-HOSP-2026-0045` |  |
| `insurerId` | Insurer Participant Code | Response | `string` | `1..1` | `Organization[type=pay].identifier[system=https://nhcx.gov.in].value` | `1000003538@hcx` |  |
| `processorId` | Claim Processor Participant Code | Response | `string` | `1..1` | `Organization[type=tpa].identifier[system=https://nhcx.gov.in].value` | `1000004520@hcx` |  |

NRCeS profiles: [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html), [Coverage](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Coverage.html), [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html).

### A3: Get public key

- **Role / Side:** `shared`
- **API Called:** `/fetch/certs`
- **Carries JWE:** `false`
- **Simulator Console:** `/participants`
- **Data Element Mapping:** [`package/mappings/A3.yaml`](../../mappings/A3.yaml)

The recipient's certificate, which is what the bundle is encrypted with. Fetched before anything is addressed to a participant.

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `participantCode` | Target Participant Code | Request | `string` | `1..1` | `Request.participant_code` | `1000003538@hcx` |  |
| `certData` | Public Key PEM Certificate | Response | `string` | `1..1` | `Response.certs[0]` | `-----BEGIN CERTIFICATE----- MIIBIjANBgkqhkiG9w0BAQEFAAO...` |  |

### A4: Get auth token

- **Role / Side:** `shared`
- **API Called:** `/get/session`
- **Carries JWE:** `false`
- **Simulator Console:** `/session`
- **Data Element Mapping:** [`package/mappings/A4.yaml`](../../mappings/A4.yaml)

The ABDM session token every NHCX call carries, minted with the Milestone 1 client id and secret.

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `clientId` | Client ID | Request | `string` | `1..1` | `Request.clientId` | `SBX_001205` |  |
| `clientSecret` | Client Secret | Request | `string` | `1..1` | `Request.clientSecret` | `secret_xyz` |  |
| `accessToken` | Bearer Access Token | Response | `string` | `1..1` | `Header.Authorization` | `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...` | also at `Header.bearer_auth` |
| `expiresIn` | Token Validity Seconds | Response | `integer` | `1..1` | `Response.expiresIn` | `3600` |  |

### A5: Get status

- **Role / Side:** `shared`
- **API Called:** `/v1/status`
- **Callback API:** `/v1/on_status`
- **Carries JWE:** `true`
- **Simulator Console:** `/status`
- **Data Element Mapping:** [`package/mappings/A5.yaml`](../../mappings/A5.yaml)
- **FHIR Reference:** [Predetermination, Status and Search, A5](../05-FHIR%20Reference/18-Predetermination,%20Status%20and%20Search.md#a5-get-status-shared)

Where any request you made got to, by its correlation id. The sandbox's own status page answers without a token.

### A6: Receive errors

- **Role / Side:** `shared`
- **API Called:** `(hosted only)`
- **Callback API:** `/v1/error`
- **Carries JWE:** `false`
- **Data Element Mapping:** [`package/mappings/A6.yaml`](../../mappings/A6.yaml)

Where the exchange tells you a request could not be delivered after five attempts. Without it a sender never learns that a request died, which looks exactly like a case still under review.

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `correlationId` | Failed Transaction ID | Error | `uuid` | `1..1` | `Header.x-hcx-correlation_id` | `4f9d2b80-13b4-4e2a-9e12-8f9024a56789` |  |
| `errorCode` | Error Code | Error | `string` | `1..1` | `Error.code` | `ERR_RECIPIENT_UNREACHABLE` |  |
| `errorMessage` | Error Description | Error | `string` | `1..1` | `Error.message` | `Recipient gateway timed out after 5 attempts` |  |

## Provider Use Cases

The following use cases are initiated by Provider participants (hospitals, daycare centers) to verify coverage, submit preauthorisations, answer queries, submit claims, and reconcile payments.

### B1: Check coverage eligibility

- **Role / Side:** `provider`
- **API Called:** `/v1/coverageeligibility/check`
- **Callback API:** `/v1/coverageeligibility/on_check`
- **Workflow ID:** `none; sits beside registration 10 and admission 11`
- **Carries JWE:** `true`
- **Data Element Mapping:** [`package/mappings/B1.yaml`](../../mappings/B1.yaml)
- **FHIR Reference:** [Coverage Eligibility Request, B1](../05-FHIR%20Reference/02-Coverage%20Eligibility%20Request.md#b1-check-coverage-eligibility-provider)
- **Sample FHIR Bundles (5):** [`B1-check.json`](../../fhir/B1/B1-check.json), [`auth-requirements.json`](../../fhir/B1/auth-requirements.json), [`benefits.json`](../../fhir/B1/benefits.json), [`discovery.json`](../../fhir/B1/discovery.json), [`validation.json`](../../fhir/B1/validation.json)

Is the policy in force, what is left in the wallet, and what must be attached. One endpoint, four purposes: discovery, validation, benefits, auth-requirements.

### B2: Request insurance plan

- **Role / Side:** `provider`
- **API Called:** `/v1/insuranceplan/request`
- **Callback API:** `/v1/insuranceplan/on_request`
- **Carries JWE:** `true`
- **Data Element Mapping:** [`package/mappings/B2.yaml`](../../mappings/B2.yaml)
- **FHIR Reference:** [Insurance Plan Request, B2](../05-FHIR%20Reference/04-Insurance%20Plan%20Request.md#b2-request-insurance-plan-provider)
- **Sample FHIR Bundles (2):** [`B2-request.json`](../../fhir/B2/B2-request.json), [`insurance-plan-request.json`](../../fhir/B2/insurance-plan-request.json)

A Task with code poll, keyed on policy number and provider id. The answer is the policy as a benefit structure: packages, rates, documents, questionnaires.

### B3: Submit pre-authorisation

- **Role / Side:** `provider`
- **API Called:** `/v1/preauth/submit`
- **Callback API:** `/v1/preauth/on_submit`
- **Workflow ID:** `12 new, 121 resubmission, 13 enhancement; under PMJAY 19 answers a query and 131 an enhancement query`
- **Carries JWE:** `true`
- **Data Element Mapping:** [`package/mappings/B3.yaml`](../../mappings/B3.yaml)
- **FHIR Reference:** [Preauthorisation Request, B3](../05-FHIR%20Reference/08-Preauthorisation%20Request.md#b3-submit-pre-authorisation-provider)
- **Sample FHIR Bundles (6):** [`B3-enhancement.json`](../../fhir/B3/B3-enhancement.json), [`B3-request.json`](../../fhir/B3/B3-request.json), [`preauth-cancel.json`](../../fhir/B3/preauth-cancel.json), [`preauth-enhancement.json`](../../fhir/B3/preauth-enhancement.json), [`preauth-queryupdate.json`](../../fhir/B3/preauth-queryupdate.json), [`preauth-request.json`](../../fhir/B3/preauth-request.json)

Permission to treat. A resubmission, an enhancement and a query answer all reuse the same bundle with a new correlation id and the original reference; only the workflow code tells them apart. The acknowledgement on 20 brings the payer's own case number, and the desk files everything under it.

### B4: Respond to a communication

- **Role / Side:** `provider`
- **API Called:** `/v1/communication/on_request`
- **Callback API:** `/v1/communication/request`
- **Workflow ID:** `24, 241 or 27, echoed from the payer's request`
- **Carries JWE:** `true`
- **Data Element Mapping:** [`package/mappings/B4.yaml`](../../mappings/B4.yaml)
- **FHIR Reference:** [Communication, B4](../05-FHIR%20Reference/17-Communication.md#b4-respond-to-a-communication-provider)
- **Sample FHIR Bundles (5):** [`B4-claim-query-answer.json`](../../fhir/B4/B4-claim-query-answer.json), [`B4-preauth-query-answer.json`](../../fhir/B4/B4-preauth-query-answer.json), [`communication-acknowledgement.json`](../../fhir/B4/communication-acknowledgement.json), [`communication-request.json`](../../fhir/B4/communication-request.json), [`communication-response.json`](../../fhir/B4/communication-response.json)

Acknowledge or answer a message the payer sent about a case. A generic or IRDAI payer raises its query here, as a CommunicationRequest task bundle carrying 24, 241 or 27; the answer is a Communication task bundle on on_request that echoes the request's correlation id and workflow id. The payer's reason code says what kind of message it was.

### B5: Submit claim

- **Role / Side:** `provider`
- **API Called:** `/v1/claim/submit`
- **Callback API:** `/v1/claim/on_submit`
- **Workflow ID:** `15 claim, 161 query answer under PMJAY, 14 provisional discharge where a payer supports one`
- **Carries JWE:** `true`
- **Data Element Mapping:** [`package/mappings/B5.yaml`](../../mappings/B5.yaml)
- **FHIR Reference:** [Claim Request, B5](../05-FHIR%20Reference/12-Claim%20Request.md#b5-submit-claim-provider)
- **Sample FHIR Bundles (5):** [`B5-request.json`](../../fhir/B5/B5-request.json), [`claim-queryupdate.json`](../../fhir/B5/claim-queryupdate.json), [`claim-release.json`](../../fhir/B5/claim-release.json), [`claim-reprocess.json`](../../fhir/B5/claim-reprocess.json), [`claim-request.json`](../../fhir/B5/claim-request.json)

Reimbursement after discharge. The amount may not exceed what the pre-authorisation approved. The acknowledgement on 25 brings the payer's case number. PMJAY takes a claim query answer on 161 only; 151, 19 and 16 are refused with PAYR-1321.

### B6: Search claims

- **Role / Side:** `provider`
- **API Called:** `/v1/search/submit`
- **Callback API:** `/v1/search/on_submit`
- **Carries JWE:** `true`
- **Data Element Mapping:** [`package/mappings/B6.yaml`](../../mappings/B6.yaml)
- **FHIR Reference:** [Predetermination, Status and Search, B6](../05-FHIR%20Reference/18-Predetermination,%20Status%20and%20Search.md#b6-search-claims-provider)
- **Sample FHIR Bundles (1):** [`claim-search.json`](../../fhir/B6/claim-search.json)

Look up claim information by criteria. The provider sandbox exit checklist names /v1/search/submit for claim search, while the Technical Specifications route /search/submit from NHA through NHCX to the payer: a cross-payer search for NHA or a regulator. A provider's search over its own cases is /claim/search in the protocol, which the access-control policy allows for requests that originated from the provider. No source confirms which of the two the sandbox accepts from a provider.

### B7: Acknowledge payment notice

- **Role / Side:** `provider`
- **API Called:** `/v1/paymentnotice/on_request`
- **Callback API:** `/v1/paymentnotice/request`
- **Workflow ID:** `30 echoed from the notice on the generic network; 17 under PMJAY`
- **Carries JWE:** `true`
- **Data Element Mapping:** [`package/mappings/B7.yaml`](../../mappings/B7.yaml)
- **FHIR Reference:** [Payment Notice and Acknowledgement, B7](../05-FHIR%20Reference/16-Payment%20Notice%20and%20Acknowledgement.md#b7-acknowledge-payment-notice-provider)
- **Sample FHIR Bundles (2):** [`B7-acknowledgement.json`](../../fhir/B7/B7-acknowledgement.json), [`payment-notice-ack.json`](../../fhir/B7/payment-notice-ack.json)

The receipt for a payment notice, as a Task on this endpoint. The notice arrives on a new thread of its own; a generic payer takes the acknowledgement with the notice's 30 echoed, PMJAY with 17.

### B8: Reprocess or cancel

- **Role / Side:** `provider`
- **API Called:** `/v1/task/submit`
- **Callback API:** `/v1/task/on_submit`
- **Workflow ID:** `PC01 cancel, 36 reprocess or shortfall`
- **Carries JWE:** `true`
- **Data Element Mapping:** [`package/mappings/B8.yaml`](../../mappings/B8.yaml)
- **FHIR Reference:** [Cancel, Reprocess and Shortfall, B8](../05-FHIR%20Reference/15-Cancel,%20Reprocess%20and%20Shortfall.md#b8-reprocess-or-cancel-provider)
- **Sample FHIR Bundles (2):** [`B8-cancel.json`](../../fhir/B8/B8-cancel.json), [`B8-reprocess.json`](../../fhir/B8/B8-reprocess.json)

One endpoint, several jobs, told apart by the Task's code and reason: reprocess with claimrejected, shortfall with partialpayment, cancel. A reprocess goes on 36 and is acknowledged on 37; a cancel goes on PC01 and is done on PC02. Both carry the input intimationNumber. A supporting document is mandatory on a reprocess.

### B9: Submit predetermination

- **Role / Side:** `provider`
- **API Called:** `/v1/predetermination/submit`
- **Callback API:** `/v1/predetermination/on_submit`
- **Carries JWE:** `true`
- **Data Element Mapping:** [`package/mappings/B9.yaml`](../../mappings/B9.yaml)
- **FHIR Reference:** [Predetermination, Status and Search, B9](../05-FHIR%20Reference/18-Predetermination,%20Status%20and%20Search.md#b9-submit-predetermination-provider)
- **Sample FHIR Bundles (1):** [`predetermination-request.json`](../../fhir/B9/predetermination-request.json)

What would the payer approve for this treatment? Same bundle shape as a pre-authorisation, asked before committing to one.

## PMJAY Scheme Use Cases

The following use cases govern the Pradhan Mantri Jan Arogya Yojana (AB PM-JAY) cashless lifecycle as detailed in the official NHA PMJAY Handbook. They follow strict Standard Treatment Guidelines (STG), mandatory biometrics, package rules, and Turnaround Time (TAT) auto-approvals.

### D1: Fetch the insurance plan

- **Role / Side:** `pmjay`
- **API Called:** `/v1/insuranceplan/request`
- **Callback API:** `/v1/insuranceplan/on_request`
- **Carries JWE:** `true`
- **Data Element Mapping:** [`package/mappings/D1.yaml`](../../mappings/D1.yaml)
- **FHIR Reference:** [Insurance Plan Request, D1](../05-FHIR%20Reference/04-Insurance%20Plan%20Request.md#d1-fetch-the-insurance-plan-pmjay)
- **Sample FHIR Bundles (1):** [`D1-request.json`](../../fhir/D1/D1-request.json)

Keyed on provider id, policy code and participant id. The answer is the scheme configuration for this hospital: specialities, packages, rates, Claim-Condition flags, mandatory documents and questionnaires. Over twenty megabytes; store it queryable, version it, refresh weekly and on any policychange communication.

### D2: Authenticate the beneficiary

- **Role / Side:** `pmjay`
- **API Called:** `ABHA biometric auth init and verify (not NHCX)`
- **Carries JWE:** `false`
- **Data Element Mapping:** [`package/mappings/D2.yaml`](../../mappings/D2.yaml)

Fingerprint, iris or face; all three must be built. Success yields a user token valid thirty minutes that rides on the eligibility check and the pre-authorisation; a fresh one rides on the claim. Where biometrics are impossible, a signed exemption consent and the matching questionnaire stand in, except on a cyclic case.

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `abhaNumber` | ABHA Number | Auth | `string` | `1..1` | `Patient.identifier[type=ABHA].value` | `91234567890123` |  |
| `authMode` | Authentication Mode | Auth | `string` | `1..1` | `Request.authMode` | `DEMOGRAPHICS` |  |
| `authToken` | Biometric Consent Token | Auth | `string` | `1..1` | `Response.token` | `bio-token-778899` |  |

NRCeS profiles: [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html).

### D3: Check coverage eligibility

- **Role / Side:** `pmjay`
- **API Called:** `/v1/coverageeligibility/check`
- **Callback API:** `/v1/coverageeligibility/on_check`
- **Carries JWE:** `true`
- **Data Element Mapping:** [`package/mappings/D3.yaml`](../../mappings/D3.yaml)
- **FHIR Reference:** [Coverage Eligibility Request, D3](../05-FHIR%20Reference/02-Coverage%20Eligibility%20Request.md#d3-check-coverage-eligibility-pmjay)
- **Sample FHIR Bundles (1):** [`D3-check.json`](../../fhir/D3/D3-check.json)

Validation after registration returns the wallet, one benefit entry per wallet with allowed and used. Benefits and auth-requirements before a pre-authorisation return what the package needs attached. Register only after coverage is validated, and validate again every time treatment is added.

### D4: Submit pre-authorisation

- **Role / Side:** `pmjay`
- **API Called:** `/v1/preauth/submit`
- **Callback API:** `/v1/preauth/on_submit`
- **Workflow ID:** `12`
- **Carries JWE:** `true`
- **Simulator Console:** `/builder?family=preauth&usecase=initiate`
- **Data Element Mapping:** [`package/mappings/D4.yaml`](../../mappings/D4.yaml)
- **FHIR Reference:** [Preauthorisation Request, D4](../05-FHIR%20Reference/08-Preauthorisation%20Request.md#d4-submit-pre-authorisation-pmjay)
- **Sample FHIR Bundles (1):** [`D4-request.json`](../../fhir/D4/D4-request.json)

Not more than one day before admission, with the biometric token or the consent response, the documents the auth-requirements answer asked for, the STG questionnaire for each package, and the registration and admission dates as supporting info. Auto-approved only if it is the first pre-authorisation for the case and every package allows it.

### D5: Resubmit pre-authorisation

- **Role / Side:** `pmjay`
- **API Called:** `/v1/preauth/submit`
- **Callback API:** `/v1/preauth/on_submit`
- **Workflow ID:** `121`
- **Carries JWE:** `true`
- **Simulator Console:** `/builder?family=preauth&usecase=resubmit`
- **Data Element Mapping:** [`package/mappings/D5.yaml`](../../mappings/D5.yaml)
- **FHIR Reference:** [Preauthorisation Request, D5](../05-FHIR%20Reference/08-Preauthorisation%20Request.md#d5-resubmit-pre-authorisation-pmjay)

Revises an approved or rejected case for a different amount or package. Nullifies every earlier instance; the payer treats it as the new base request.

### D6: Raise an enhancement

- **Role / Side:** `pmjay`
- **API Called:** `/v1/preauth/submit`
- **Callback API:** `/v1/preauth/on_submit`
- **Workflow ID:** `13, and 131 to answer an enhancement query raised on 241`
- **Carries JWE:** `true`
- **Simulator Console:** `/builder?family=preauth&usecase=enhance`
- **Data Element Mapping:** [`package/mappings/D6.yaml`](../../mappings/D6.yaml)
- **FHIR Reference:** [Preauthorisation Enhancement, D6](../05-FHIR%20Reference/10-Preauthorisation%20Enhancement.md#d6-raise-an-enhancement-pmjay)
- **Sample FHIR Bundles (2):** [`D6-enhancement-query-answer.json`](../../fhir/D6/D6-enhancement-query-answer.json), [`D6-enhancement.json`](../../fhir/D6/D6-enhancement.json)

Adds to an approved pre-authorisation, as many times as needed until discharge, one at a time, and only for packages whose plan flag allows it. The bundle carries the approved items and the ones now sought. A query on it arrives as a ClaimResponse on 241, on the case's own thread, and is answered by a fresh submit on 131.

### D7: Answer a pre-authorisation query

- **Role / Side:** `pmjay`
- **API Called:** `/v1/preauth/submit`
- **Callback API:** `/v1/preauth/on_submit`
- **Workflow ID:** `19`
- **Carries JWE:** `true`
- **Simulator Console:** `/builder?family=preauth&usecase=query-answer`
- **Data Element Mapping:** [`package/mappings/D7.yaml`](../../mappings/D7.yaml)
- **FHIR Reference:** [Preauthorisation Query and Answer, D7](../05-FHIR%20Reference/11-Preauthorisation%20Query%20and%20Answer.md#d7-answer-a-pre-authorisation-query-pmjay)
- **Sample FHIR Bundles (1):** [`D7-query-answer.json`](../../fhir/D7/D7-query-answer.json)

The query arrived as a ClaimResponse on 24, on the case's own thread, with the question in the item adjudication, not on the communication API. Answer with a fresh submit of the same bundle shape on this code, never as a new 12, which opens a second case.

### D8: Cancel pre-authorisation

- **Role / Side:** `pmjay`
- **API Called:** `/v1/task/submit`
- **Callback API:** `/v1/task/on_submit`
- **Workflow ID:** `PC01`
- **Carries JWE:** `true`
- **Simulator Console:** `/builder?family=preauth&usecase=cancel`
- **Data Element Mapping:** [`package/mappings/D8.yaml`](../../mappings/D8.yaml)
- **FHIR Reference:** [Cancel, Reprocess and Shortfall, D8](../05-FHIR%20Reference/15-Cancel,%20Reprocess%20and%20Shortfall.md#d8-cancel-pre-authorisation-pmjay)
- **Sample FHIR Bundles (1):** [`D8-cancel.json`](../../fhir/D8/D8-cancel.json)

A Task with code cancel, the case number as input and one of seven reasons: treatmentplanchanged, patientrequest, financialconstraints, alternativetreatment, duplicateclaim, administrativeerror, other. Allowed at any point until the claim is raised.

### D9: Submit claim

- **Role / Side:** `pmjay`
- **API Called:** `/v1/claim/submit`
- **Callback API:** `/v1/claim/on_submit`
- **Workflow ID:** `15`
- **Carries JWE:** `true`
- **Simulator Console:** `/builder?family=claim&usecase=submit`
- **Data Element Mapping:** [`package/mappings/D9.yaml`](../../mappings/D9.yaml)
- **FHIR Reference:** [Claim Request, D9](../05-FHIR%20Reference/12-Claim%20Request.md#d9-submit-claim-pmjay)
- **Sample FHIR Bundles (1):** [`D9-request.json`](../../fhir/D9/D9-request.json)

There is no discharge submission: the claim asserts the discharge and carries its details. Four dates, the discharge type under category DIS with the stage as its value, a fresh biometric token, and LM100 as the single procedure in place of the approved items on a LAMA or DAMA discharge before or during surgery. The amount may not exceed what was approved.

### D10: Answer a claim query

- **Role / Side:** `pmjay`
- **API Called:** `/v1/claim/submit`
- **Callback API:** `/v1/claim/on_submit`
- **Workflow ID:** `161`
- **Carries JWE:** `true`
- **Simulator Console:** `/builder?family=claim&usecase=query-answer`
- **Data Element Mapping:** [`package/mappings/D10.yaml`](../../mappings/D10.yaml)
- **FHIR Reference:** [Claim Query and Answer, D10](../05-FHIR%20Reference/14-Claim%20Query%20and%20Answer.md#d10-answer-a-claim-query-pmjay)
- **Sample FHIR Bundles (1):** [`D10-query-answer.json`](../../fhir/D10/D10-query-answer.json)

As D7, on the claim endpoint: the query is a ClaimResponse on 27, the answer a fresh submit on 161. The sandbox refuses 151, 19 and 16 with PAYR-1321. The final adjudication then arrives with outcome complete and, often, a deductible adjudication naming why the eligible amount is less than the claimed one.

### D11: Reprocess a rejected claim

- **Role / Side:** `pmjay`
- **API Called:** `/v1/task/submit`
- **Callback API:** `/v1/task/on_submit`
- **Workflow ID:** `36`
- **Carries JWE:** `true`
- **Simulator Console:** `/builder?family=claim&usecase=reprocess`
- **Data Element Mapping:** [`package/mappings/D11.yaml`](../../mappings/D11.yaml)
- **FHIR Reference:** [Cancel, Reprocess and Shortfall, D11](../05-FHIR%20Reference/15-Cancel,%20Reprocess%20and%20Shortfall.md#d11-reprocess-a-rejected-claim-pmjay)
- **Sample FHIR Bundles (1):** [`D11-reprocess.json`](../../fhir/D11/D11-reprocess.json)

An appeal, not a resubmission: a Task with code reprocess and reason claimrejected, a supporting document attached, no amount. Raise it the moment the rejection arrives. Once only; the Claim Review Committee is final.

### D12: Claim a shortfall

- **Role / Side:** `pmjay`
- **API Called:** `/v1/task/submit`
- **Callback API:** `/v1/task/on_submit`
- **Workflow ID:** `36`
- **Carries JWE:** `true`
- **Simulator Console:** `/builder?family=claim&usecase=shortfall`
- **Data Element Mapping:** [`package/mappings/D12.yaml`](../../mappings/D12.yaml)
- **FHIR Reference:** [Cancel, Reprocess and Shortfall, D12](../05-FHIR%20Reference/15-Cancel,%20Reprocess%20and%20Shortfall.md#d12-claim-a-shortfall-pmjay)

The same Task with reason partialpayment and an amount capped at the difference, allowed only after payment notice 33 has arrived and been acknowledged with 17. Once only, and never after a reprocess.

### D13: Acknowledge the payment notice

- **Role / Side:** `pmjay`
- **API Called:** `/v1/paymentnotice/on_request`
- **Callback API:** `/v1/paymentnotice/request`
- **Workflow ID:** `17`
- **Carries JWE:** `true`
- **Simulator Console:** `/builder?family=paymentnotice&usecase=acknowledge`
- **Data Element Mapping:** [`package/mappings/D13.yaml`](../../mappings/D13.yaml)
- **FHIR Reference:** [Payment Notice and Acknowledgement, D13](../05-FHIR%20Reference/16-Payment%20Notice%20and%20Acknowledgement.md#d13-acknowledge-the-payment-notice-pmjay)
- **Sample FHIR Bundles (1):** [`D13-acknowledgement.json`](../../fhir/D13/D13-acknowledgement.json)

Three notices may arrive: 30 when the transfer is initiated, 31 when the bank processes it, 33 when it settles with the UTR. The reconciliation splits the amount into what was paid and what was deducted as tax. Keep the UTR; it is the reference for any dispute.

## Payer Use Cases

The following use cases are implemented by Payer participants (Insurance Companies and Third Party Administrators) to respond to provider inquiries, adjudicate claims, raise queries, and settle payments.

### C1: Link ABHA with policy

- **Role / Side:** `payer`
- **API Called:** `/participant/link/abha/policy`
- **Carries JWE:** `false`
- **Simulator Console:** `/participants`
- **Data Element Mapping:** [`package/mappings/C1.yaml`](../../mappings/C1.yaml)

Tie the ABHA number, mobile and member id to the policy's products at policy creation, naming the payer and the processor. This is what makes A2 answer.

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `abhaNumber` | ABHA Number | Link | `string` | `1..1` | `Patient.identifier[type=ABHA].value` | `91234567890123` |  |
| `policyNumber` | Policy Number | Link | `string` | `1..1` | `Coverage.identifier[0].value` | `POL-HOSP-2026-0045` |  |
| `payerId` | Insurer Participant Code | Link | `string` | `1..1` | `Organization.identifier.value` | `1000003538@hcx` |  |

NRCeS profiles: [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html), [Coverage](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Coverage.html), [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html).

### C2: De-link ABHA from policy

- **Role / Side:** `payer`
- **API Called:** `/participant/delink/abha/policy`
- **Carries JWE:** `false`
- **Data Element Mapping:** [`package/mappings/C2.yaml`](../../mappings/C2.yaml)

Undo C1. Only the party named as payer or processor on the link may do this.

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `abhaNumber` | ABHA Number | Delink | `string` | `1..1` | `Patient.identifier[type=ABHA].value` | `91234567890123` |  |
| `policyNumber` | Policy Number | Delink | `string` | `1..1` | `Coverage.identifier[0].value` | `POL-HOSP-2026-0045` |  |

NRCeS profiles: [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html), [Coverage](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Coverage.html).

### C3: Respond to coverage eligibility

- **Role / Side:** `payer`
- **API Called:** `/v1/coverageeligibility/on_check`
- **Callback API:** `/v1/coverageeligibility/check`
- **Carries JWE:** `true`
- **Data Element Mapping:** [`package/mappings/C3.yaml`](../../mappings/C3.yaml)
- **FHIR Reference:** [Coverage Eligibility Response, C3](../05-FHIR%20Reference/03-Coverage%20Eligibility%20Response.md#c3-respond-to-coverage-eligibility-payer)
- **Sample FHIR Bundles (7):** [`C3-benefits-pmjay.json`](../../fhir/C3/C3-benefits-pmjay.json), [`C3-response-generic.json`](../../fhir/C3/C3-response-generic.json), [`C3-response-pmjay.json`](../../fhir/C3/C3-response-pmjay.json), [`benefits-response.json`](../../fhir/C3/benefits-response.json), [`coverage-eligibility.json`](../../fhir/C3/coverage-eligibility.json), [`discovery-response.json`](../../fhir/C3/discovery-response.json), [`validation-response.json`](../../fhir/C3/validation-response.json)

The eligibility and plan details for the beneficiary asked about. A payer may instead answer with a forward instruction, asking the exchange to pass the request to another payer.

### C4: Respond to insurance plan request

- **Role / Side:** `payer`
- **API Called:** `/v1/insuranceplan/on_request`
- **Callback API:** `/v1/insuranceplan/request`
- **Carries JWE:** `true`
- **Data Element Mapping:** [`package/mappings/C4.yaml`](../../mappings/C4.yaml)
- **FHIR Reference:** [Insurance Plan Response Overview, C4](../05-FHIR%20Reference/05-Insurance%20Plan%20Response%20Overview.md#c4-respond-to-insurance-plan-request-payer)
- **Sample FHIR Bundles (2):** [`C4-response-generic.json`](../../fhir/C4/C4-response-generic.json), [`C4-response-pmjay.json`](../../fhir/C4/C4-response-pmjay.json)

The plan as a benefit structure. Under PMJAY this is the scheme configuration for one hospital and can exceed twenty megabytes.

### C5: Respond to pre-authorisation

- **Role / Side:** `payer`
- **API Called:** `/v1/preauth/on_submit`
- **Callback API:** `/v1/preauth/submit`
- **Workflow ID:** `20 received, 21 approved, 23 rejected, 24 queried, 22 enhancement approved, 231 denied, 241 queried`
- **Carries JWE:** `true`
- **Data Element Mapping:** [`package/mappings/C5.yaml`](../../mappings/C5.yaml)
- **FHIR Reference:** [Preauthorisation Response, C5](../05-FHIR%20Reference/09-Preauthorisation%20Response.md#c5-respond-to-pre-authorisation-payer)
- **Sample FHIR Bundles (10):** [`C5-approved-wf21-pmjay.json`](../../fhir/C5/C5-approved-wf21-pmjay.json), [`C5-approved-wf21.json`](../../fhir/C5/C5-approved-wf21.json), [`C5-enhancement-approved-wf22-pmjay.json`](../../fhir/C5/C5-enhancement-approved-wf22-pmjay.json), [`C5-enhancement-approved-wf22.json`](../../fhir/C5/C5-enhancement-approved-wf22.json), [`C5-queried-wf24.json`](../../fhir/C5/C5-queried-wf24.json), [`C5-received-wf20-pmjay.json`](../../fhir/C5/C5-received-wf20-pmjay.json), [`C5-received-wf20.json`](../../fhir/C5/C5-received-wf20.json), [`C5-rejected-wf23-pmjay.json`](../../fhir/C5/C5-rejected-wf23-pmjay.json), [`C5-rejected-wf23.json`](../../fhir/C5/C5-rejected-wf23.json), [`preauth-queried.json`](../../fhir/C5/preauth-queried.json)

The adjudicated pre-authorisation. The acknowledgement on 20 travels as response.partial and carries the payer's own case number; the decisions travel as response.complete. Read outcome and the adjudication amounts together: complete covers approval and denial alike. Under PMJAY a query is this ClaimResponse on 24 or 241, on the case's own thread.

### C6: Raise a communication

- **Role / Side:** `payer`
- **API Called:** `/v1/communication/request`
- **Callback API:** `/v1/communication/on_request`
- **Workflow ID:** `24, 241, 27 for a generic payer's queries; N02 and the intimation codes for the rest`
- **Carries JWE:** `true`
- **Data Element Mapping:** [`package/mappings/C6.yaml`](../../mappings/C6.yaml)
- **FHIR Reference:** [Communication, C6](../05-FHIR%20Reference/17-Communication.md#c6-raise-a-communication-payer)
- **Sample FHIR Bundles (3):** [`C6-claim-query-wf27.json`](../../fhir/C6/C6-claim-query-wf27.json), [`C6-notification-wfN02.json`](../../fhir/C6/C6-notification-wfN02.json), [`C6-preauth-query-wf24.json`](../../fhir/C6/C6-preauth-query-wf24.json)

A message about a case, typed by its reason code: additionalinfo, tatquery for a turnaround breach, grievance, walletupdate, policychange, claimArbitration. A generic or IRDAI payer raises its document queries here, as a CommunicationRequest task bundle carrying 24, 241 or 27, and takes the answer as a Communication task bundle on on_request echoing the correlation id and workflow id. PMJAY does not use it for queries; its query is the ClaimResponse on the case's own thread.

### C7: Respond to claim

- **Role / Side:** `payer`
- **API Called:** `/v1/claim/on_submit`
- **Callback API:** `/v1/claim/submit`
- **Workflow ID:** `25 received, 26 approved, 27 queried, 28 in process, 29 forwarded, 291 denied`
- **Carries JWE:** `true`
- **Data Element Mapping:** [`package/mappings/C7.yaml`](../../mappings/C7.yaml)
- **FHIR Reference:** [Claim Response, C7](../05-FHIR%20Reference/13-Claim%20Response.md#c7-respond-to-claim-payer)
- **Sample FHIR Bundles (9):** [`C7-approved-deduction-wf26-pmjay.json`](../../fhir/C7/C7-approved-deduction-wf26-pmjay.json), [`C7-approved-wf26-pmjay.json`](../../fhir/C7/C7-approved-wf26-pmjay.json), [`C7-approved-wf26.json`](../../fhir/C7/C7-approved-wf26.json), [`C7-queried-wf27.json`](../../fhir/C7/C7-queried-wf27.json), [`C7-received-wf25-pmjay.json`](../../fhir/C7/C7-received-wf25-pmjay.json), [`C7-received-wf25.json`](../../fhir/C7/C7-received-wf25.json), [`C7-rejected-wf291-pmjay.json`](../../fhir/C7/C7-rejected-wf291-pmjay.json), [`C7-rejected-wf291.json`](../../fhir/C7/C7-rejected-wf291.json), [`claim-queried.json`](../../fhir/C7/claim-queried.json)

The adjudicated claim, item by item, with any deduction and its reason. The acknowledgement on 25 travels as response.partial with the payer's case number. Under PMJAY a query is this ClaimResponse on 27, answered by a fresh submit on 161.

### C8: Respond to search

- **Role / Side:** `payer`
- **API Called:** `/v1/search/on_submit`
- **Callback API:** `/v1/search/submit`
- **Carries JWE:** `true`
- **Data Element Mapping:** [`package/mappings/C8.yaml`](../../mappings/C8.yaml)
- **FHIR Reference:** [Predetermination, Status and Search, C8](../05-FHIR%20Reference/18-Predetermination,%20Status%20and%20Search.md#c8-respond-to-search-payer)
- **Sample FHIR Bundles (1):** [`search-response.json`](../../fhir/C8/search-response.json)

The ClaimResponse objects matching the criteria asked for.

### C9: Send payment notice

- **Role / Side:** `payer`
- **API Called:** `/v1/paymentnotice/request`
- **Callback API:** `/v1/paymentnotice/on_request`
- **Workflow ID:** `30 initiated, 31 processed, 33 settled`
- **Carries JWE:** `true`
- **Data Element Mapping:** [`package/mappings/C9.yaml`](../../mappings/C9.yaml)
- **FHIR Reference:** [Payment Notice and Acknowledgement, C9](../05-FHIR%20Reference/16-Payment%20Notice%20and%20Acknowledgement.md#c9-send-payment-notice-payer)
- **Sample FHIR Bundles (3):** [`C9-notice-tds-wf30-pmjay.json`](../../fhir/C9/C9-notice-tds-wf30-pmjay.json), [`C9-notice-wf30.json`](../../fhir/C9/C9-notice-wf30.json), [`payment-notice.json`](../../fhir/C9/payment-notice.json)

The money, on a new thread of its own, with the reconciliation itemised by type: approved, claimed, tds, servicetax, advance, recovered, penality. The bank's UTR rides on the settled notice.

### C10: Respond to a Task

- **Role / Side:** `payer`
- **API Called:** `/v1/task/on_submit`
- **Callback API:** `/v1/task/submit`
- **Workflow ID:** `251 acknowledged, 252 approved, 253 rejected, 254 queried, PC02 cancelled, 37 arbitration acknowledged`
- **Carries JWE:** `true`
- **Data Element Mapping:** [`package/mappings/C10.yaml`](../../mappings/C10.yaml)
- **FHIR Reference:** [Cancel, Reprocess and Shortfall, C10](../05-FHIR%20Reference/15-Cancel,%20Reprocess%20and%20Shortfall.md#c10-respond-to-a-task-payer)
- **Sample FHIR Bundles (4):** [`C10-arbitration-wf37-pmjay.json`](../../fhir/C10/C10-arbitration-wf37-pmjay.json), [`C10-arbitration-wf37.json`](../../fhir/C10/C10-arbitration-wf37.json), [`C10-cancelled-wfPC02-pmjay.json`](../../fhir/C10/C10-cancelled-wfPC02-pmjay.json), [`C10-cancelled-wfPC02.json`](../../fhir/C10/C10-cancelled-wfPC02.json)

The answer to a reprocess, shortfall or cancel. A cancellation done is PC02 and carries the case's ClaimResponse in its output; a reprocess on 36 is acknowledged on 37 as arbitration. Both payers answer this way.

### C11: Respond to predetermination

- **Role / Side:** `payer`
- **API Called:** `/v1/predetermination/on_submit`
- **Callback API:** `/v1/predetermination/submit`
- **Carries JWE:** `true`
- **Data Element Mapping:** [`package/mappings/C11.yaml`](../../mappings/C11.yaml)
- **FHIR Reference:** [Predetermination, Status and Search, C11](../05-FHIR%20Reference/18-Predetermination,%20Status%20and%20Search.md#c11-respond-to-predetermination-payer)
- **Sample FHIR Bundles (1):** [`predetermination-response.json`](../../fhir/C11/predetermination-response.json)

What the payer would approve for the proposed treatment.

## Beneficiary & Patient App Use Cases

Personal health record apps and beneficiary portals register on NHCX to receive real-time updates on a patient's claims and authorizations.

### E1: Subscribe to notifications

- **Role / Side:** `patient`
- **API Called:** `/v1/notification/subscribe`
- **Callback API:** `/v1/notification/on_subscribe`
- **Workflow ID:** `N01 to a payer, N02 to a provider, N03 to a beneficiary, N04 acknowledgement`
- **Carries JWE:** `false`
- **Data Element Mapping:** [`package/mappings/E1.yaml`](../../mappings/E1.yaml)

A patient app subscribes when the beneficiary logs in with their ABHA, and the most recent subscription wins. Topics: workflow_events for claim progress, network_events for exchange maintenance, participant_events for changes to payers and providers.

**Data elements**

| Element | Label | Group | Type | Card. | FHIR path | Example | Notes |
| :-- | :-- | :-- | :-- | :--: | :-- | :-- | :-- |
| `abhaNumber` | Beneficiary ABHA | Subscription | `string` | `1..1` | `Patient.identifier[type=ABHA].value` | `91234567890123` |  |
| `topic` | Subscription Topic | Subscription | `string` | `1..*` | `Subscription.criteria` | `workflow_events` |  |
| `endpointUrl` | Push Notification URL | Subscription | `url` | `1..1` | `Subscription.channel.endpoint` | `https://phrapp.example.org/webhook/claims` |  |

NRCeS profiles: [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html).

---

## FHIR Builder Use Cases

The NHCX FHIR Builder provides pre-configured templates and presets for generating conforming bundles across claim lifecycle stages:

| Bundle | Step | Label | Template | Endpoint | Flow | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `coverage` | `discovery` | **Discovery** | `coverage-eligibility` | `v1/coverageeligibility/check` | `request` | Which policy does this beneficiary hold? The fallback when policy lookup has not answered it. |
| `coverage` | `validation` | **Validation** | `coverage-eligibility` | `v1/coverageeligibility/check` | `request` | Is the policy in force today, and what is left in the wallet. Called after registration. |
| `coverage` | `auth-requirements` | **Auth-requirements** | `coverage-eligibility` | `v1/coverageeligibility/check` | `request` | Is this package covered here, and what must the pre-authorisation carry. The call to make before every pre-authorisation. |
| `coverage` | `benefits` | **Benefits** | `coverage-eligibility` | `v1/coverageeligibility/check` | `request` | How much cover remains, against which packages. Called before a pre-authorisation. |
| `insurance` | `request` | **Fetch the plan** | `insurance-plan` | `v1/insuranceplan/request` | `request` | A poll Task keyed on the policy number and the provider id. The answer is the policy as a benefit structure. |
| `preauth` | `initiate` | **Initiate** | `claim` | `v1/preauth/submit` | `request` | The first pre-authorisation for a case: permission to treat. |
| `preauth` | `resubmit` | **Resubmit** | `claim` | `v1/preauth/submit` | `request` | Revise an approved or rejected case. Nullifies every earlier instance; keep the same case number. |
| `preauth` | `enhance` | **Enhancement** | `claim` | `v1/preauth/submit` | `request` | Add to an approved pre-authorisation. Quote its approval reference, and only add packages the plan allows to be enhanced. |
| `preauth` | `query-answer` | **Answer a query** | `claim` | `v1/preauth/submit` | `request` | The payer asked for more. Same bundle, same case number, the extra documents attached; never a fresh 12. |
| `preauth` | `predetermination` | **Predetermination** | `claim` | `v1/predetermination/submit` | `request` | What would the payer approve for this treatment? Asked before committing to a pre-authorisation, on its own endpoint. |
| `preauth` | `cancel` | **Cancel** | `claim-cancel` | `v1/task/submit` | `request` | Withdraw an active pre-authorisation with a Task. Allowed at any point until the claim is raised. |
| `claim` | `submit` | **Submit** | `claim` | `v1/claim/submit` | `request` | Reimbursement after discharge. Under PMJAY this also asserts the discharge, so it carries the discharge type and dates. |
| `claim` | `query-answer` | **Answer a query** | `claim` | `v1/claim/submit` | `request` | The claim processing doctor asked for more. Same bundle, same case number, the extra evidence attached. |
| `claim` | `reprocess` | **Reprocess** | `claim-reprocess` | `v1/task/submit` | `request` | Appeal a rejected claim with a Task and a supporting document. Once only; the Committee is final. |
| `claim` | `shortfall` | **Shortfall** | `claim-release` | `v1/task/submit` | `request` | The claim was paid short. Ask for the difference, after payment notice 33 has been acknowledged. |
| `paymentnotice` | `acknowledge` | **Acknowledge** | `payment-ack` | `v1/paymentnotice/on_request` | `on_request` | The receipt for a payment notice. Acknowledging does not resolve whatever the notice was about. |
| `search` | `search` | **Search** | `search` | `v1/search/submit` | `request` | Where a case got to, asked as a Task. Check Status answers the same question without a bundle. |

---

## The 100 Official NHCX Test Use Cases

NHA specifies a formal test matrix of 100 numbered use cases covering every scenario an integrator must demonstrate for network certification. The complete reference manifest is preserved at `fixtures/usecases.txt`.

| Case IDs | Scenario Category | Exchanges Involved | Key Verification Criteria | Fixture Reference |
| :--- | :--- | :--- | :--- | :--- |
| **1 to 3** | Insurance Plan | `/insuranceplan/request` & `on_request` | Plan query (`Task` poll), package master response (`InsurancePlan`), error response | `fixtures/reference/provider/insurance/` |
| **4 to 7** | Coverage Validation | `/coverageeligibility/check` & `on_check` | Purpose `validation`. Checks policy in force, active dates, error handling | `fixtures/reference/provider/coverage/validation/` |
| **8 to 10** | Coverage Discovery | `/coverageeligibility/check` & `on_check` | Purpose `discovery`. Discovers policy from ABHA when policy number unknown | `fixtures/reference/provider/coverage/discovery/` |
| **11 to 13** | Auth-Requirements | `/coverageeligibility/check` & `on_check` | Purpose `auth-requirements`. Returns mandatory document codes (`MAND...`) | `fixtures/reference/provider/coverage/authrequirements/` |
| **14 to 16** | Preauth with Biometric Token | `/preauth/submit` & `on_submit` | Valid biometric token in header/token. Ack (wf20) & approval (wf21) | `fixtures/reference/provider/preauth/request/` |
| **17 to 19** | Preauth without Token (Consent) | `/preauth/submit` & `on_submit` | Physical consent form uploaded in supportingInfo questionnaire | `fixtures/collection/provider/preauth/` |
| **20 to 22** | Preauth Newborn Registration | `/preauth/submit` & `on_submit` | Newborn registered under mother's ABHA/PMJAY policy, birth certificate | [`docs/05-FHIR Reference/12-Claim Request.md`](../05-FHIR%20Reference/12-Claim%20Request.md) |
| **23 to 25** | Preauth with STG | `/preauth/submit` & `on_submit` | Standard Treatment Guidelines questionnaire answered under supportingInfo | `fixtures/collection/pmjay-payer/insurance/` |
| **26 to 28** | Preauth with Implant & Attendant | `/preauth/submit` & `on_submit` | Implant product details and attendant certification included | `fixtures/reference/provider/preauth/request/` |
| **29 to 31** | Preauth Query & Resolution | `/preauth/submit` / `/communication/` | Payer queries additional remarks/documents; provider answers (wf19/131) | `fixtures/reference/provider/preauth/queryupdate/` |
| **32 to 34** | Preauth Standalone Procedure | `/preauth/submit` & `on_submit` | Single stand-alone medical or surgical package booking | `fixtures/reference/provider/preauth/request/` |
| **35 to 37** | Preauth Cyclic Procedure | `/preauth/submit` & `on_submit` | Recurring cyclic treatments (e.g. hemodialysis, chemotherapy cycles) | `fixtures/collection/provider/preauth/` |
| **38 to 40** | Preauth Unspecified Procedure | `/preauth/submit` & `on_submit` | Unspecified surgical package (`SGU100`) with surgical notes attached | `fixtures/reference/provider/preauth/request/` |
| **41 to 43** | Enhancement: Length of Stay | `/preauth/submit` & `on_submit` | Increase in LOS (`x-hcx-use_case: Enhancement`), updated clinical justification | `fixtures/reference/provider/preauth/enhancement/` |
| **44 to 46** | Enhancement: Additional Procedures | `/preauth/submit` & `on_submit` | Additional secondary procedures or STG questionnaire inclusion | `fixtures/reference/provider/preauth/enhancement/` |
| **47 to 49** | Resubmission with STG | `/preauth/submit` & `on_submit` | Procedure modification/addition after rejection with STG questionnaire | `fixtures/reference/provider/preauth/request/` |
| **50 to 52** | Resubmission without STG | `/preauth/submit` & `on_submit` | Procedure modification/addition after rejection without STG questionnaire | `fixtures/reference/provider/preauth/request/` |
| **53 to 54** | Preauth Cancellation | `/task/submit` & `on_submit` | Cancellation `Task` (`PC01`/`PC02`) referencing original preauthorisation | `fixtures/reference/payer/task/cancelled/` |
| **55 to 57** | Claim Cyclic Procedure | `/claim/submit` & `on_submit` | Claim submission for completed cyclic treatment cycle | `fixtures/collection/provider/claim/` |
| **58 to 60** | Claim Live Discharge | `/claim/submit` & `on_submit` | Normal completed discharge to home (`DTH`). Final bills and summary | `fixtures/reference/provider/claim/request/` |
| **61 to 63** | Claim Query & Resolution | `/claim/submit` / `/communication/` | Payer raises query on claim (wf27); provider submits answer (wf141/151) | `fixtures/reference/provider/claim/queryupdate/` |
| **64 to 72** | Claim LAMA Scenarios | `/claim/submit` & `on_submit` | LAMA before surgery (`LM100` per diem), after surgery (package), during surgery (`LM100`) | `fixtures/reference/payer/claim/approved/` |
| **73 to 81** | Claim DAMA Scenarios | `/claim/submit` & `on_submit` | DAMA before surgery (`LM100`), after surgery (package), during surgery (`LM100`) | `fixtures/reference/payer/claim/approved/` |
| **82 to 90** | Claim Death Scenarios | `/claim/submit` & `on_submit` | Discharge to mortuary (`DTM`). Before, after, and during surgery | `fixtures/collection/provider/claim/` |
| **91 to 93** | Claim Erroneous Request | `/claim/submit` & `on_submit` | Erroneous submission corrected with remaining balance and mandatory docs | `fixtures/reference/provider/claim/request/` |
| **94 to 96** | Claim Reprocess / Dispute | `/task/submit` & `on_submit` | Reprocess `Task` (code 36) with appeal justification and mandatory docs | `fixtures/reference/provider/claim/reprocess/` |
| **97 to 100**| Payment Notice & Settlement | `/paymentnotice/request` & `on_request` | Payment initiation (wf30), ack (wf17/31), cleared update, and final ack | `fixtures/reference/payer/payment/notice/` |

## Testing Against the Dummy Payer

The sandbox hosts a payer that answers back, participant ID `1000003538@hcx`. It handles insurance plan, coverage eligibility, preauthorisation, claim, payment notice and communication. For the plan call use provider ID `32722` and policy `100217`.

Two test hooks drive its decisions:
- `dummyhcxpayer/process/request` makes it approve, reject or query a preauthorisation or claim you have submitted, by correlation ID.
- `dummyhcxpayer/paymentNotice/init` makes it send you a payment notice.

A query from the dummy payer arrives as a communication request, which you answer on `/v1/communication/on_request` before the final decision comes back on `on_submit`.

---

## Workflow Codes Cross-Reference

Endpoints alone do not identify a transaction. A new preauthorisation, a resubmission, an enhancement and a query response all travel on `/v1/preauth/submit` with the same bundle. The workflow code in the header is what tells them apart, and each code expects a particular status word. See [Workflow Codes](06-Workflow%20Codes.md) for the complete state machines and code tables.
