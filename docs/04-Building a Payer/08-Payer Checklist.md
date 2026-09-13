# Payer checklist

What a payer has to demonstrate to leave the sandbox, the validations the certification checks on every response, the test cases to run, and how to test without a real provider.

## The sandbox exit list

NHA's payer exit process names fifteen use cases.

1. Link ABHA with policy, `/participant/link/abha/policy`.
2. Get policy, `/participant/get/policies`.
3. De-link ABHA from policy, `/participant/delink/abha/policy`.
4. Get participant list, `/fetch/participants/list`.
5. Get public key, `/fetch/certs`.
6. Get auth token, `/get/session`.
7. Respond to coverage eligibility, received on `/v1/coverageeligibility/check`, answered on `/v1/coverageeligibility/on_check`.
8. Respond to insurance plan request, received on `/v1/insuranceplan/request`, answered on `/v1/insuranceplan/on_request`.
9. Respond to preauthorisation, received on `/v1/preauth/submit`, answered on `/v1/preauth/on_submit`.
10. Raise a communication request, `/v1/communication/request`, acknowledged on `/v1/communication/on_request`.
11. Respond to claim, received on `/v1/claim/submit`, answered on `/v1/claim/on_submit`.
12. Respond to search, received on `/v1/search/submit`, answered on `/v1/search/on_submit`.
13. Send payment notice, `/v1/paymentnotice/request`, acknowledged on `/v1/paymentnotice/on_request`.
14. Respond to a task, received on `/v1/task/submit`, answered on `/v1/task/on_submit`.
15. Get status, `/v1/status`, answered on `/v1/on_status`.

Plus `/v1/error` and, where the payer is a scheme, the biometric token validation.

## The four validations on every response

The checklist repeats them for every answering use case, so the certification will check them on every one:

1. Payload validates against the NRCeS profiles.
2. `api_call_id` and `correlation_id` are different values.
3. `correlation_id` matches the request being answered.
4. `recipient_code` equals the request's `sender_code`.

And each answer is prepared one of two ways: a sealed bundle when the request was processed, or a protocol response when it could not be opened or failed validation.

## Testing without a provider

There is no dummy provider on the sandbox. The practical route is to build the provider's calling half from Getting Started and the provider section, point it at your own participant code, and drive your queues from it. The sample bundles on the portal give you real PMJAY-shaped requests to feed in: every eligibility purpose, a preauthorisation and its query answer, an enhancement, a cancellation, a claim and its query answer.

## Test cases

One id per case, by family: `ELG` coverage eligibility, `PLN` insurance plan, `PRE` preauthorisation, `CLM` claim, `TSK` tasks, `PAY` payment, `COM` communication, `ENV` envelope and queue. Cases marked PMJAY apply to the scheme only. The workflow codes named are the ones the payer's answer must carry.

### Coverage eligibility

#### T-ELG-01 Validate the policy

A request by ABHA with purpose `validation`. Answer on `/v1/coverageeligibility/on_check` with `inforce: true` and the wallet balance, after checking the ABHA linkage and that the member is active.

#### T-ELG-02 Auth-requirements

Purpose `auth-requirements` for a package. Answer with `authorizationRequired: true` and the mandatory documents and STG codes, after checking wallet adequacy and the specialty constraints.

#### T-ELG-03 Every purpose and the refusals

`discovery` and `benefits` answered; an exhausted family wallet and a hospital not authorised for the policy refused inside the sealed response, not in the envelope.

### Insurance plan

#### T-PLN-01 Publish the plan

Answer on `/v1/insuranceplan/on_request` with the collection bundle: empanelled packages, claim-condition flags, STG questionnaires and the rate master, carrying a version.

### Preauthorisation

#### T-PRE-01 Acknowledge, then approve

Acknowledge on `20` as `response.partial`, then approve on `21` as `response.complete` with `preAuthRef`, after STG validation and biometric token verification.

#### T-PRE-02 Query and its answer

Raise the query on `24`, on the case thread under PMJAY or over communication otherwise. Take the answer on `19`, clear the hold, then decide on `21`.

#### T-PRE-03 Reject with a denial code

Decide on `23` with the denial reason inside the `ClaimResponse`.

#### T-PRE-04 Reduce with a note

Approve on `21` for less than asked, with the adjudication note that says why.

#### T-PRE-05 Auto-approval and TAT approval (PMJAY)

A first preauthorisation whose packages all carry `ApprovalNotRequired` is approved without a desk action. A package flagged `ScheduledTATApproval` is approved by the system when the window lapses, with the disposition "Auto approved by system".

#### T-PRE-06 Enhancement approved and denied

Approve on `22`; deny on `231`; query on `241`.

#### T-PRE-07 Resubmission and cancellation

A resubmission on `121` treated as the new base request. A cancel Task on `PC01` answered `PC02` before payment, and refused after payment has been initiated.

### Claim

#### T-CLM-01 Acknowledge, then approve

Acknowledge on `25`, then approve on `26`, after verifying the discharge biometric token, matching the preauthorisation, and calculating incentives and tax.

#### T-CLM-02 Query and its answer

Raise the query on `27`; take the answer on `151`, or `161` under PMJAY; then decide on `26` or `291`.

#### T-CLM-03 Reduce, in process, forward, reject

`26` for less than claimed with the deduction reason per item; `28` in process; `29` forwarded; `291` rejected.

#### T-CLM-04 Every discharge type (PMJAY)

`DTH`, `DTM`, `LAMA` and `DAMA` each priced as the scheme rules say, with `LM100` per day for LAMA or DAMA before surgery.

#### T-CLM-05 Unusual cases (PMJAY)

An unspecified procedure; a cyclic procedure with per-visit biometrics; a newborn on the parent's card; twins; implants within their maximums.

### Tasks

#### T-TSK-01 Reprocess

A reprocess Task on `36` acknowledged on `37` with the Task `accepted`, then re-adjudicated on `252` or `253`, the `ClaimResponse` in the Task's output.

#### T-TSK-02 Shortfall

A `partialpayment` Task accepted after payment notice `33` has been acknowledged, and refused before it.

#### T-TSK-03 The Committee's answer

The Claim Review Committee's decision returned inside a Task, not as a bare `ClaimResponse`.

### Payment

#### T-PAY-01 Three notices

`30`, `31` and `33` in turn, with the UTR and the TDS line on `33`, and the provider's acknowledgement recorded. Net plus deductions equals the approved amount.

#### T-PAY-02 Return payment

`RP1` intimation, `RP2` acknowledged, `RP3` failed.

### Communication

#### T-COM-01 Each reason

`additionalinfo`, `tatquery`, `grievance`, `walletupdate`, `policychange` and `claimArbitration`, each acknowledged by the provider within thirty seconds; `tatquery` sent when a preauthorisation or claim has passed the payer's own turnaround threshold.

### Envelope and queue

#### T-ENV-01 Duplicate request on one correlation id

The second delivery is recognised and not processed twice.

#### T-ENV-02 A request while another is in progress

Refused, with `PAYR-1322` under PMJAY, until the first is decided.

#### T-ENV-03 A malformed bundle

Answered with a protocol response, not a sealed bundle.

#### T-ENV-04 Queue ordered by time remaining

Preauthorisation and claim queues indexed by `received_at` plus the turnaround window, so the case with the least time left comes first and the breach alert fires before the window lapses. No window values are published. The plan's `ScheduledTATApproval` flag says only that the system approves the case after "a specified time period (varies with policy)", and the FAQ's answer on reprocess is "No fixed TAT as of now". Agree the windows at onboarding; Governance and Audit lists the question.

## Where payers go wrong

- Answering with `outcome = complete` and no adjudication reason, so the provider cannot tell approval from rejection.
- Reusing the request's `api_call_id` as the response's.
- Sending business refusals in the envelope, where the exchange logs them, instead of inside the sealed response.
- Rates changed in the plan master without a version bump, so every provider's next claim looks tampered.
- Sending `33` before the bank has confirmed, which opens the shortfall window early.
- TAT auto-approval firing because the queue was not ordered by time remaining.

## Exchanges this documentation does not cover

The workflow families that no NHA document describes beyond their codes are listed once, under the same heading in Provider Checklist. A payer may receive one too; log it and escalate rather than ignore it.

## Before going live

- Enrolment through the NHA or IRDAI portal with the payer or TPA role, the IRDAI registry id without leading zeros, and the production certificate and callback address.
- Every policy linked with the correct processor.
- The plan master versioned and published for every empanelled hospital.
- FHIR bundles validated by NRCeS; internal demo; HTC demo.
