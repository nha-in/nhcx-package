# Provider checklist

What a provider has to demonstrate to leave the sandbox, the test cases to run before asking, and where the first week's failures come from.

## The sandbox exit list

NHA's provider exit process names thirteen use cases. Each must be shown working against the dummy payer in the internal demo, then in the HTC demo.

1. Get participant list, `/fetch/participants/list`.
2. Get policy, `/participant/get/policies`.
3. Get public key, `/fetch/certs`.
4. Get auth token, `/get/session`.
5. Check coverage eligibility, `/v1/coverageeligibility/check`, answered on `/v1/coverageeligibility/on_check`.
6. Request insurance plan, `/v1/insuranceplan/request`, answered on `/v1/insuranceplan/on_request`.
7. Preauthorisation submission, `/v1/preauth/submit`, answered on `/v1/preauth/on_submit`.
8. Respond to a communication request, received on `/v1/communication/request`, answered on `/v1/communication/on_request`.
9. Claim submission, `/v1/claim/submit`, answered on `/v1/claim/on_submit`.
10. Claim search, `/v1/search/submit`, answered on `/v1/search/on_submit`. A caution: the Technical Specifications route `/search/submit` from NHA through NHCX to the payer, a cross-payer search for NHA or a regulator, and a provider's search over its own cases is `/claim/search` under the access-control policy. No source confirms which of the two the sandbox accepts from a provider.
11. Acknowledge payment notice, received on `/v1/paymentnotice/request`, answered on `/v1/paymentnotice/on_request`.
12. Reprocess or cancel, `/v1/task/submit`, answered on `/v1/task/on_submit`.
13. Get status, `/v1/status`, answered on `/v1/on_status`.

Every callback must accept both a `JWEPayload` and a `ProtocolResponse`, and answer with the 202 receipt within 30 seconds. `/v1/error` is not on the list but is required: it takes a plain JSON report of an undeliverable request and must still be answered `202`.

Under PMJAY, add biometric authentication in all three modes and the structured health-information types, and expect the PMJAY team demo as an extra step.

## Test cases

One id per case, by family: `ML1` beneficiary authentication, `PLN` insurance plan, `ELG` coverage eligibility, `PRE` preauthorisation, `CLM` claim, `PAY` payment, `COM` communication, `CBK` callbacks, `SES` session and keys. Cases marked PMJAY apply to the scheme only. The workflow codes named are the ones each leg must carry; the dummy payer's `process/request` hook drives approve, reject and query on demand, and `paymentNotice/init` drives a payment notice. The full list of NHA's own numbered scenarios is in NHCX Use Cases and the harness bundles in `fixtures/reference/payer/`.

### Beneficiary authentication

#### T-ML1-01 Validate the policy by ABHA

`CoverageEligibilityRequest` with purpose `validation` for a valid ABHA with consent. Expect a `CoverageEligibilityResponse` with `inforce: true`.

#### T-ML1-02 Biometric authentication in each mode (PMJAY)

Fingerprint, iris and face, each yielding a user token that rides on the eligibility check and the preauthorisation.

#### T-ML1-03 Consent fallback (PMJAY)

No biometric device: the plan's authentication consent questionnaire is answered instead, at admission and again at discharge.

#### T-ML1-04 Token refresh and expiry (PMJAY)

A user token refreshed before the preauthorisation; an expired one refused and re-obtained.

### Insurance plan

#### T-PLN-01 Fetch the package master

`InsurancePlan` request keyed on the beneficiary's own policy code and the provider id. Expect the master with packages, inclusions, exclusions, claim conditions and document requirements. A policy the hospital is not empanelled under is refused with `PAYR-1401`.

### Coverage eligibility

#### T-ELG-01 Auth-requirements before a preauthorisation

Purpose `auth-requirements` for a package. Expect eligible, balance sufficient, and the mandatory documents the preauthorisation must carry.

#### T-ELG-02 Benefits and discovery

Purpose `benefits` for a package, and `discovery` with no policy to find what the beneficiary holds.

#### T-ELG-03 Refusals

A policy not in force; a limit exhausted. The refusal is read off the response, not off a transport error.

### Preauthorisation

#### T-PRE-01 Submitted and approved

Workflow `12`, acknowledged on `20`, approved on `21`. The payer's case number arrives in `preAuthRef`.

#### T-PRE-02 Queried, answered and approved

Workflow `12`, `20`, `24`, `19`, `21`. The query on the case thread under PMJAY or over communication with another payer, then a positive adjudication.

#### T-PRE-03 Rejected, resubmitted, cancelled

Workflow `12`, `23`, `121`, `PC01`, `PC02`. The rejection carries `preAuthRef`; the resubmission reuses it; the cancel Task withdraws the case.

#### T-PRE-04 Enhancement queried, answered and approved

Workflow `13`, `241`, `131`, `22`, with the header `x-hcx-use_case: Enhancement`. A longer stay or an added package on the same case.

#### T-PRE-05 Implant, stratification and STG (PMJAY)

A package with an implant line, a ward tier as `item.modifier`, and the STG questionnaire answered under `supportingInfo`.

#### T-PRE-06 Auto-approval (PMJAY)

A first preauthorisation on a case whose packages all allow it comes back approved without a desk action.

### Claim

#### T-CLM-01 Approved

Workflow `15`, acknowledged on `25`, approved on `26`, after an approved preauthorisation, with the discharge biometric token or consent.

#### T-CLM-02 Queried, answered and approved

Workflow `15`, `25`, `27`, `151`, `26`. Under PMJAY the answer goes on `161`. The documents asked for ride in `supportingInfo`.

#### T-CLM-03 Rejected and reprocessed

Workflow `15`, `291`, then a reprocess Task on `36` with the justification attached, acknowledged on `37`, decided on `252` or `253`.

#### T-CLM-04 Discharge in every mode (PMJAY)

`DTH`, `DTM`, `LAMA` and `DAMA`, with the amount each one allows: `LM100` per day for LAMA or DAMA before or during surgery, the full package after surgery, and the death date under `ONS/DTM` for `DTM`.

#### T-CLM-05 Shortfall after partial payment (PMJAY)

A Task with reason `partialpayment` after payment notice `33` is acknowledged; refused before it.

#### T-CLM-06 Unusual cases (PMJAY)

An unspecified procedure `SGU100`; a cyclic procedure across several visits; a newborn on the parent's card; twins.

#### T-CLM-07 Provisional discharge

Where the payer supports it: submitted on `14`, then approved, rejected and queried.

### Payment

#### T-PAY-01 Payment notices acknowledged

Notices on `30`, `31` and `33`, each acknowledged on `17` under PMJAY or with the notice's own code on the generic network. The UTR on `33` is stored.

### Communication

#### T-COM-01 A communication of each reason

`additionalinfo`, `tatquery`, `grievance`, `walletupdate`, `policychange`, `claimArbitration`, each acknowledged within thirty seconds without touching the case status.

### Callbacks

#### T-CBK-01 The same callback twice

The second delivery is recognised by `x-hcx-api_call_id` and answered `202` without acting twice.

#### T-CBK-02 Unknown correlation id

A callback for a thread this system never opened is answered `202` and logged, not processed.

#### T-CBK-03 A protocol response

A `ProtocolResponse` body, with its `x-hcx-error_details`, handled without attempting to decrypt.

#### T-CBK-04 The error endpoint

A report on `/v1/error` answered `202` and surfaced to the desk as a failed delivery, not a case under review.

### Session and keys

#### T-SES-01 Token expiry mid-flow

A `401` on any call leads to a fresh session token and one retry, never a retry with the same token.

#### T-SES-02 Certificate rotation on the payer side

A decrypt failure on the payer's side clears the cached certificate and fetches it again before resending.

## PMJAY HMIS test cases

The NHCX-PMJAY-HMIS test case workbook carries eight worked cases for a hospital system integrating PMJAY through NHCX. They are reproduced here as published.

| Id | Scenario | Precondition | API or resource | Inputs | Validation | Expected output | Remark |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| `TC-ABHA-01` | Validate the PMJAY policy using ABHA | Valid ABHA, consent available | `CoverageEligibilityRequest`, purpose `validation` | ABHA `91-XXXX-XXXX-XXXX`, purpose `validation` | ABHA linkage and an active policy | `CoverageEligibilityResponse` with active coverage | Happy path |
| `TC-HBP-01` | Fetch the admissible HBP package | Policy validated | `InsurancePlan` | Plan id `PMJAY-TS-001`, provider id `HOSP123`, payer id `SHA-HARYANA` | Provider validated against the state's network hospitals | `InsurancePlan` with all HBP packages, their inclusions and exclusions, claim conditions and document requirements | State-specific HBP applied |
| `TC-CE-01` | Coverage eligibility for auth-requirements | Wallet available | `CoverageEligibilityRequest`, purpose `auth-requirements` | Amount `25000`, package `HBP-123` | Wallet balance and specialty rules | Eligible, balance sufficient | Preauth allowed |
| `TC-PA-01` | Submit a preauthorisation | Eligibility successful | `/preauth/submit`, `Claim` | Diagnosis `I10`, treatment plan, supporting documents, doctor details | Clinical and financial rules | Preauth id generated, status `PENDING` | Sent to workflow |
| `TC-PA-02` | Submit a preauthorisation query update | Preauthorisation submitted | `/preauth/submit`, `Claim` | Additional documents | Preauthorisation and treatment details match | Query details accepted for adjudication | Sent to workflow |
| `TC-CL-01` | Submit the claim after discharge | Preauthorisation approved | `/claim/submit`, `Claim` | Approved amount `23000`, documents attached | Preauthorisation and treatment details match | Claim accepted for adjudication | Sent to workflow |
| `TC-CL-02` | Submit a claim query update | Claim submitted | `/claim/submit`, `Claim` | Documents | Claim and treatment details match | Query details accepted for adjudication | Sent to workflow |
| `TC-CL-03` | Submit a CRC claim | Claim rejected or partially paid | `/task/submit`, `Task` | Not given | Claim and treatment details match | Not given | Not given |

`TC-CL-03` is incomplete in the workbook: it gives no inputs, expected output or remark. Both query updates go to the same endpoint as the first submission; the workflow code tells them apart, as PMJAY Provider sets out.

### The scenario list

The workbook's second sheet is a bare list of nineteen scenario names, with no steps, inputs or amounts. Many of them have no worked case above.

| No. | Scenario |
| :---- | :---- |
| 1 | Registration |
| 2 | Wallet update |
| 3 | Registration cancel |
| 4 | Preauthorisation submission |
| 5 | Preauthorisation query |
| 6 | Preauthorisation submitted with the query response |
| 7 | Preauthorisation enhancement |
| 8 | Preauthorisation with implant |
| 9 | Preauthorisation resubmission |
| 10 | Preauthorisation rejection |
| 11 | Preauthorisation approval |
| 12 | Preauthorisation cancel or delete |
| 13 | Discharge in multiple modes, and the amount calculation for each |
| 14 | Claim submission |
| 15 | Claim query |
| 16 | Claim rejection |
| 17 | Claim approval |
| 18 | Claim final paid, and update at the payer's bank transaction detail |
| 19 | CRC in case of claim rejection and partial payment |

The workbook does not give the amounts for scenario 13. The discharge modes and what each one allows are in T-CLM-04 above.

## Where the first week goes wrong

Roughly in the order the portal's own support list has them:

1. Wrong status word on a leg of the message.
2. No `/v1/error` endpoint.
3. Callback answering with something other than 202 and the receipt.
4. Envelope headers missing or malformed.
5. Registry id inside the bundle not matching the participant record.
6. `Accept: application/json` missing.
7. Sending to `payerid` instead of `processingid`.
8. Reusing a correlation id after an error.
9. Retrying a `401` with the same token.
10. Package code or display not matching the plan, character for character.

## Exchanges this documentation does not cover

The workflow sheet defines families that no NHA document describes beyond their codes. A participant may receive one; log it and escalate rather than ignore it.

- Final bill: `45` submitted, `46` approved, `47` queried, `181` query answered, `491` denied.
- Reimbursement claims: `R15`, `R151`, `R26`, `R27`, `R28`, `R291`, `R122`, `R252` to `R254`.
- Discharge correction: `DC01`, `DC02`.
- Preauthorisation arbitration: `41`, `42`.
- Wallet upgrade `34`, `35`; fraud alert `38`, `39`; grievance `G11`, `G12`, `G13`.
- `16`, for a preauthorisation resubmission.

## Before going live

- FHIR bundles emailed for NRCeS validation and passed.
- Internal demo with NHA, then the HTC demo.
- Production participant created through the passcode flow; certificate and callback URL registered; own certificate fetched back and checked.
- Under PMJAY, the HEM-to-participant mapping ticket raised, and staff briefed that in-flight TMS cases finish in TMS; see PMJAY Provider.
- A pilot on a few real cases before switching the whole hospital.
