# Preauthorisation

The preauthorisation is the first bundle that carries clinical content, and the one the payer scrutinises hardest. Everything the treatment screen collected becomes a `Claim` resource with `use` set to `preauthorization`.

## What the user does

The form has five sections, and the order below is the order payers read them.

**Medical information.** Findings, history, the clinical picture that justifies admission.

**Admission information.** Registration date, admission date, admission details.

**Treatment.** Diagnosis as ICD-10 codes, the treatment plan as services or packages chosen from the plan, investigations, and the care team with each doctor's registration number.

**Finance.** The amount per line, from the plan where the plan fixes it. The total may not exceed what eligibility said remains; check it on the server before enabling submit.

**Documents.** The checklist comes from the eligibility call with purpose auth-requirements, made from this screen before submission. Each document is one file of at most 2 MB. Do not let the user submit with a mandatory item missing; the payer will query, and the round trip costs a day.

## What the system calls

```
POST /v1/coverageeligibility/check     purpose: benefits, then auth-requirements
POST /v1/preauth/submit                workflow 12
callback /v1/preauth/on_submit
```

Send to the processor code. Store the correlation ID against the case; every follow-up on this preauthorisation will reuse the reference and carry a new correlation ID.

## What goes in the bundle

A collection bundle. The `Claim` is the spine; everything else is referenced from it by `urn:uuid`.

| Resource | Why it is there |
| :---- | :---- |
| `Claim` | `use = preauthorization`, `type` inpatient, patient, provider, insurer, coverage, billable period, diagnosis, procedure, items, care team, supporting info, total |
| `Patient` | Member ID and ABHA number as identifiers |
| `Organization` ×2 | Provider with its HFR ID as NPI; insurer with its registry ID as NIIP |
| `Coverage` | The policy, with the product code |
| `Practitioner` per doctor | Name and medical registration number, referenced from the care team |
| `Procedure` | One per procedure, referenced from `Claim.procedure` |
| `DocumentReference` per document | A PDF or image in `attachment.data`, or a structured FHIR bundle where the payer asks for one |
| `QuestionnaireResponse` | Answers to any questionnaire the plan or the eligibility response attached, referenced from a supporting-info entry. A policy or case-level response uses category `INF` with code `ODN`; the FRD gives `INF` with code `AT` for questionnaire answers generally. The payer names `ODN` in its own rejection message, so send that for the case-level one and confirm the rest. |

The item is where most rejections originate. Each `Claim.item` carries the category, the service or package as `productOrService`, quantity, unit price and net, and points at the diagnosis, procedure, care team and supporting-info entries it relates to by sequence number. The codes and displays must match the plan exactly.

Two supporting-info entries carry the dates: registration date as code `EDT` under category `OTH`, admission date as code `ADDD` under category `ONS`. Full element tables are in the FHIR Reference.

## What the payer checks before a human sees it

The reference payer refuses these on arrival, with a named code, before the case reaches a doctor's queue. Every one of them is cheaper to catch on your own server.

| Check | The code you get if you skip it |
| :---- | :---- |
| Every `Claim.item` carries a FHIR element `id` | `PAYR-1027`, "invalid item id". Structural, not a code lookup |
| Every `supportingInfo` entry carries a `sequence`, numbered from 1 with no gaps | `PAYR-1019` |
| The `Practitioner` carries an identifier typed `HPIN` | `PAYR-1083` |
| No preauthorisation already live for this beneficiary at this hospital | `PAYR-1238`, which names the reference number holding it |
| Documents in `pdf`, `jpg`, `jpeg`, `png` or `fhir+json` | `PAYR-1008` |
| The package code is in the plan's master | `PAYR-1248`, which names the code |
| The policy is one the hospital is empanelled under | `PAYR-1401` |

Refusals arrive in order: the bundle is validated first, and scheme rules are applied only to a bundle that passed. So `PAYR-1238`, the one-live-preauthorisation rule, is perversely the first sign the bundle itself is right.

The `PAYR-102x` block is structural throughout. When you meet one, check ids and sequences before you go looking at values.

## Reading the answer

The callback carries a `ClaimResponse`. Read two fields together, never one:

| `outcome` | Adjudication reason | Meaning | Workflow |
| :---- | :---- | :---- | :---- |
| `complete` | `approved` | Approved. `preAuthRef` is the reference for the claim. | 21 |
| `partial` | `approved` | Approved at a reduced amount. `processNote` says why. | 21 |
| `partial` | `queried` | The payer wants more. The case stays open. | 24 |
| `complete` | `cancelled` | Rejected. Reason in `disposition` and a denial code from the `PreauthError` family. | 23 |

`outcome = complete` alone does not mean approved; it also means rejected. The adjudication reason is the difference.

## When the payer wants more

On the general network, a query arrives as a **communication request** on `/v1/communication/request`, with reason `additionalinfo` and the case number. The provider attaches what was asked and answers on `/v1/communication/on_request`. The payer then issues the decision on `/v1/preauth/on_submit`. The queried `ClaimResponse` with workflow 24 tells the provider the case is waiting; the communication tells it what for.

Some payers instead take the answer on the preauthorisation endpoint itself with workflow 19. PMJAY does; PMJAY Provider covers it.

## Follow-ups on the same case

All reuse this screen's bundle with a new correlation ID, the original reference, and a different workflow code.

**Answering a query** adds one more entry wherever it is sent: the overall case remarks, under category `NMI` with code `CQD`, as a string. Send it. The handbook says an answer without it is rejected. The one sampled answer that the payer accepted and then approved carries no such entry, so treat it as required until a payer tells you otherwise.

- **Enhancement** (13). Against an approved case, for additional procedures or days. The bundle lists the already-approved items and the new ones.
- **Resubmission** (121). Revises a request after a query or rejection.
- **Cancel** (PC01). A Task, not a Claim: code `cancel`, the case number as input, a reason from the list (treatment plan changed, patient request, financial constraints, alternative treatment, duplicate, administrative error, other). Allowed until the claim is raised. The workflow sheet gives PC01 for this and PC02 for the answer; the handbook gives 122 in two places, including the heading of its cancellation-reason appendix. Confirm which the payer accepts.

The Task resource carries more codes than these two. The provider exit checklist names `reprocess`, `cancel`, `release` and `nullify`, and the value set adds `approve`, `search`, `poll` and `suspend`. `nullify` is described in Cancel, Reprocess and Shortfall in the FHIR Reference. `suspend` is not described in any source beyond its place in the value set.

Payers enforce sequencing and say so: no approved record for this enhancement, a case already in progress, a claim already raised. Surface their errors as they are.
