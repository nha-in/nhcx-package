# PMJAY sandbox run

Everything before this chapter was written from NHA's documents. This one is written from a full case run against the live NHCX sandbox with a State Health Agency (SHA) as the payer: policy lookup, coverage, package master, preauthorisation, adjudication, enhancement, claim and the claim's walk through the payer's roles, to approval. It records what the SHA accepted and refused, in the order a hospital meets it. Where this chapter and an earlier one disagree, this one is the evidence.

Identifiers, amounts and dates from the run are replaced by placeholders. Yours will differ; the rules will not.

## Before you start

- A provider participant on the sandbox, with its certificate and callback URL registered.
- The SHA payer's participant code, and the policy code and member id of a beneficiary it covers, from the policy lookup.
- A session token from the ABDM gateway. The same token is used for the NHCX calls and for the payer service that adjudicates the case.
- One beneficiary per deployment. The scheme allows one live preauthorisation per beneficiary per hospital, so two teams sharing a beneficiary block each other.

## The journey in order

### 1. Find the policy

`/participant/get/policies` by ABHA, member id or mobile. Take the policy code and the `processingid` from the answer. Every later call is addressed to the processing id, and the package master is keyed on this policy code, not on any other the hospital knows of.

### 2. Check coverage

`/v1/coverageeligibility/check` with each purpose: `discovery`, `validation`, `benefits`, `auth-requirements`. Validation returns the coverage period and the wallet; auth-requirements returns what the preauthorisation must carry, including the consent questionnaire when there is no biometric token. The reference coverage bundles pass unchanged.

### 3. Fetch the package master

`/v1/insuranceplan/request` with a plan Task keyed on the beneficiary's own policy code and the provider id. A policy the hospital is not empanelled under is refused with `PAYR-1401`; ask again with the code from step 1. The master is large, over a thousand packages, so store it queryable and read every package attribute from it rather than from code.

### 4. Raise the preauthorisation

`/v1/preauth/submit` on workflow `12`. The acknowledgement comes back on `20`, the decision later on `21`, `23` or `24`, on the request's own correlation id. The bundle passes only with all of the following, each learned from a refusal listed further down:

- A FHIR element `id` on the Claim and on every item, procedure and supporting-info entry.
- The practitioner identified by `HPIN` as well as `HPID`.
- The package code, display and specialty exactly as the master has them, the specialty being the code of the category the master files the package under.
- The ward tier from the master's stratification codes as `item.modifier`, where the package allows one.
- The plan's authentication consent questionnaire answered, when there is no biometric token.
- A `sequence` on every supporting-info entry, numbered from 1 with no gaps.

The SHA prices the package itself: the benefit approved is the master's rate for the tier, whatever amount was asked.

### 5. Adjudicate on the payer service

A PMJAY case is not decided over NHCX. It sits at `request.initiated` until someone acts on it in the SHA's Transaction Management System. In the sandbox that someone is you, through two endpoints of the NHCX Payer Service. Both take the ordinary session token in `bearer_auth`.

First ask who holds the case:

<!-- build-docs:api 12-adjudicator/adjudicator-role.bru -->
```bash
curl --location --request POST 'https://apisbx.abdm.gov.in/pmjay/sbxhcx/nhcxpayerservice/v1/get/user-role' \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --header 'bearer_auth: Bearer <access token>' \
  --data-raw '{
    "caseid": "<case number>",
    "payerid": "<payer code>"
  }'
```
<!-- build-docs:end -->

```json
{ "currentuserrole": "PPD-Trust", "errormessage": null }
```

`caseid` is the SHA's case id, the digits at the end of its case reference. It is not the hospital's claim number; asked about that, the service answers that no data exists for the case id. The SHA hands the case id out in two places: inside a `PAYR-1238` refusal of a later request, and in its acknowledgement and status answers once a request is accepted. Store it beside the claim number the moment it is seen.

Then act, with the action spelled as the role that holds the case expects:

<!-- build-docs:api 12-adjudicator/adjudicator-process.bru -->
```bash
curl --location --request POST 'https://apisbeta.nha.gov.in/pmjay/hcx/nhcxpayerservice/wrapper/process/case' \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --header 'bearer_auth: Bearer <access token>' \
  --data-raw '{
    "casenumber": "<case number>",
    "action": "Approve",
    "receivercode": "<payer code>",
    "usecase": "PREAUTH",
    "correlationid": "<correlation id>",
    "sendercode": "<participant code>",
    "memberid": "<member id>",
    "remarks": "ok"
  }'
```
<!-- build-docs:end -->

The roles a case may pass through, and the actions each takes:

- Preauthorisation, `PPD-Trust`: `Approve`, `Reject`, `Query`; `usecase` is `PREAUTH`.
- Claim, first desk, `CEX-Trust`: `Forward`; `usecase` is `CLAIM`.
- Claim, second desk, `CPD-Trust`: `cpdApprove`, `cpdReject`, `Pending`; `usecase` is `CLAIM`.
- Medical Audit Committee: `Approve`, `Reject`, `iQuery`; `usecase` is `Medical Audit Committee`.
- Claim, `ACO-Trust`: `Approve`, `Reject`, `Pending`; `usecase` is `CLAIM`.
- Claim, `SHA-Trust`: `Approve`, `Reject`, `Pending`; `usecase` is `CLAIM`.
- Claim Review Committee: `Approve`, `Reject`, `Pending`; `usecase` is `Claim Review Committee`.

Read the role before every action, use the exact spelling, and mint a new correlation id per call. The decision then comes back over NHCX as the `ClaimResponse` on the request's own thread, so the desk call and the callback are two halves of one step.

### 6. Enhance

`/v1/preauth/submit` on workflow `13` with `x-hcx-use_case: Enhancement`, carrying the approved items and the ones now sought. Three rules:

- The acknowledgement carries no `preAuthRef`. The enhancement is decided on the case its parent opened, so carry the parent's case id onto it; the desk answers only for that case.
- Only one package of type `Conservative` per case. An enhancement on a conservative case adds a `Medical` package, or an add-on the master flags as enhanceable, or is refused with `PAYR-1245`.
- One request at a time on a case. A claim raised while the enhancement is still queued is refused with `PAYR-1322`, and the role lookup still answers `PPD-Trust` because the case has not left the preauthorisation queue.

The SHA may answer `queued` again when asked to approve an enhancement and decide it in its own time, a minute later or several. Report the scheme's pace; do not assert it away.

### 7. Claim

`/v1/claim/submit` on workflow `15`. Beyond the preauthorisation rules:

- Send it under the preauthorisation's own number. A claim under a number of its own finds no case and is refused with `ERR-PYR-CLM-007`. The claim still owns its correlation id, so the answer lands on the right record.
- Bill the package alone, at the whole amount. A PMJAY rate is all-inclusive; room rent, consultations and investigations are not items and are refused as invalid item codes.
- Answer the plan's discharge consent questionnaire when there is no discharge biometric token, or meet `PAYR-1363`.
- Attach documents as `application/pdf`, `application/jpg`, `application/jpeg`, `application/png` or `application/fhir+json`. Anything else, `text/plain` included, is refused with `PAYR-1008`.

### 8. Walk the claim through the roles

Read the role, act, read again. On the run the claim was forwarded by `CEX-Trust`, approved by `CPD-Trust` as `cpdApprove`, then by `ACO-Trust` and `SHA-Trust`, after which the role lookup answered with no role at all: the case was decided and the verdict arrived on the claim's own thread. Neither committee held the case. The seven roles are the ones a case may pass through, not a queue every case walks, and a cycle that assumes the next role in the list will be refused.

Two answers from the desk mean "try again shortly": no event found for the correlation id, while the exchange is still delivering the request, and case not found, while the case is mid-filing. Retry on both.

## Refusals you will meet

Each of these arrived on the run, in roughly this order. The message is the SHA's; the reading is what it turned out to mean.

### PAYR-1027 Invalid item id

The item has no FHIR element `id`. Not a package-code problem: the same bundle was refused with several valid codes until the ids were added. `PAYR-1028`, invalid item sequence, and `PAYR-1029`, invalid bundle id, are the same kind of fault.

### PAYR-1083 No HPR details for the practitioner

The SHA looks the doctor up by the identifier typed `HPIN` from the NRCeS identifier-type code system. Send the HPR id twice, as `HPID` and as `HPIN`, alongside the registration number typed `MD`:

```json
"identifier": [
  { "type": { "coding": [{ "system": "https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code", "code": "HPID" }] }, "system": "https://nhcx.abdm.gov.in", "value": "<HPR id>" },
  { "type": { "coding": [{ "system": "http://terminology.hl7.org/CodeSystem/v2-0203", "code": "MD" }] }, "system": "https://nhcx.abdm.gov.in", "value": "<registration number>" },
  { "type": { "coding": [{ "system": "https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code", "code": "HPIN" }] }, "system": "https://hpr.abdm.gov.in", "value": "<HPR id>" }
]
```

The sandbox did not check the id against the registry; a well-formed one was enough. Production may not be as kind.

### PAYR-1238 An active preauthorisation exists

A scheme rule, not a bundle fault, and it arrives after the bundle has passed validation. The refusal names the SHA's case reference; its last digits are the case id the payer service wants. Clear it with a cancel Task on `PC01` from the hospital that raised it, or a `Reject` at `PPD-Trust`.

### PAYR-1256 and PAYR-1363 Consent questionnaire missing

No biometric token and no consent answer. The questionnaire is the plan's: its url and link ids come out of the package master and change per SHA, so read them off the master. The answer rides as a `QuestionnaireResponse` naming that url, referenced from a supporting-info entry of category `INF`, code `ODN`. `PAYR-1256` is at the preauthorisation, `PAYR-1363` at the claim.

### PAYR-1019 Invalid sequence in supporting info

An entry without a `sequence`, typically one appended after the rest were numbered. Number the list after it is complete.

### PAYR-1008 Invalid content type, or invalid code and reason

On an attachment: a content type outside the five the SHA reads. On a Task: a code and reason combination the scheme does not take, see below.

### ERR-PYR-CLM-007 No prior preauthorisation for the case

The claim was sent under a number of its own. Send it under the preauthorisation's number.

### PAYR-1245 Only one conservative procedure per case

The enhancement added a second `Conservative` package. Add a `Medical` package or an enhanceable add-on instead.

### PAYR-1322 Active instance found for the case

A second request while the previous one is still queued. Wait for the decision.

### PAYR-1401 Policy not allowed for the hospital

The package master was asked for under a policy the hospital is not empanelled for. Use the beneficiary's policy code from the eligibility answer.

## What the package master decides

Read every package attribute from the master; none of it belongs in code.

- Package code and display: `item.productOrService`, under the NDHM procedure-code system.
- Specialty: `item.category`, under the NDHM benefit-category system. Its value is the code of the category the master files the package under, exactly as `PAYR-1114` says. A generic category is wrong for every PMJAY package.
- `ProcedureType`: `Claim.procedure.type`, `conservative`, `medical` or `surgical`. Decides the one-conservative-per-case rule.
- `StratificationAllowed` and the tiers: whether a ward tier rides as `item.modifier`, code and display only, no system. A general, semi-private, private or deluxe bed is the routine ward tier, an HDU bed the HDU tier, an ICU bed the ICU tier without ventilator unless the record says otherwise. The tier's rate is what the SHA pays; the amount asked stays the hospital's own.
- `ApprovalNotRequired`: whether a preauthorisation is needed at all.
- `EnhancementAllowed`: whether the package may be added on an enhancement.

The master also says what the claim may carry: the package alone. The generic flow, where every bill line is an item, stays right for an indemnity payer.

## What the sandbox will not take

- A status enquiry as a `Task` coded `status`, refused with `PAYR-1018` without a reason code and `PAYR-1008` with one. Where a case stands is read from the payer service's role lookup, not asked for over NHCX.
- A reprocess `Task` with reason `partialpayment` before payment notice `33` has arrived and been acknowledged, refused the same way. The combination is validated before the case is looked at.

Both refusals cite a document of valid code-and-reason combinations that NHA does not publish with the rest of its material.

## What this changes in the earlier chapters

- Bundles and Conventions: element ids on every Claim bundle, and the `HPIN` identifier on every Practitioner.
- Preauthorisation Request: the sample's `factor: 0.5`, its `MP` category system and the SNOMED system on the package code are tolerated, not needed. `factor` 1, the master's category under the NDHM benefit-category system and the package under the NDHM procedure-code system pass.
- Building a Provider 07: the specialty is the master's category code, the ward tier the master's stratification code, the claim the package alone. The mandatory documents the sample carries were not demanded at submission; expect them to be queried for.
- Error Codes: `PAYR-1027`, `PAYR-1019` and `PAYR-1029` are structural, not code lookups. `PAYR-1008` is about a content type or a code-and-reason combination, depending on where it lands.
- Discharge and Claim: under PMJAY the claim carries the preauthorisation's number, the package alone at the whole amount, the discharge consent questionnaire, and documents in a content type the payer reads.
