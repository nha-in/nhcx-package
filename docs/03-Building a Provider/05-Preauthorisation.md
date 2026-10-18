# Preauthorisation

The preauthorisation is the first bundle that carries clinical content, and the one the payer scrutinises hardest. Everything the treatment screen collected becomes a `Claim` resource with `use` set to `preauthorization`.

## What the user does

The form has five sections, and the order below is the order payers read them.

**Medical information.** Findings, history, the clinical picture that justifies admission.

**Admission information.** The planned admission date (required), the expected discharge date, admission details.

**Treatment.** Diagnosis as ICD-10 codes, the treatment plan as services or packages chosen from the plan, investigations, and the care team with each doctor's registration number and role.

**Finance.** The amount per line, from the plan. The total may not exceed what eligibility said remains; check it on the server before enabling submit.

**Documents.** The checklist comes from the plan and from the eligibility call with purpose auth-requirements, made from this screen before submission. Each document is one file of at most 2 MB. Do not let the user submit with a mandatory item missing; the payer will query, and the round trip costs a day.

**The pre-authorisation does not wait for the admission.** The planned admission date, the expected discharge date, the ICD-10 diagnoses and the treating doctors belong to the pre-authorisation, are entered on it, and can be sent before the patient is admitted. No linked patient or admission is needed to draft or send it. A linked admission only pre-fills a form not yet saved, never fixes it. The IPD admission is linked at claim time, found by the case's ABHA number; Discharge and Claim covers it.

**Every line is quoted from the plan.** There are no custom line items: the desk picks a package or item the insurance plan lists, and the only price it types is a rate the plan leaves open. There is no predetermination step in the provider flow; the pre-authorisation is the request. The coverage benefits check and the authorisation requirements check sit on this step, beside the quoted lines, and neither is a condition of sending.

**Records are found by ABHA.** A health record attached as a document is found by the case's ABHA number, across every patient holding those digits, whether or not a patient or admission is linked. A structured record goes to the payer as FHIR, a `DocumentReference` carrying the record with content type `application/fhir+json`, and is opened for staff on its own HMIS page, never as its JSON.

**Proof of presence** is captured on this step, stage `Preauth`, when the payer or the plan requires it. Biometric Authentication has the calls.

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

**The diagnosis carries two codings.** The payer adjudicates on ICD-10 and `Claim.diagnosis` is bound to `http://hl7.org/fhir/sid/icd-10`, while the HMIS and the ABDM health records of the same stay are coded in SNOMED CT. The desk picks the ICD-10 code; the system maps it to the SNOMED CT concept through its diagnosis terminology and sends both codings on the one `diagnosisCodeableConcept`: ICD-10 first, because a payer that reads only the first coding must find it there, SNOMED CT second (`http://snomed.info/sct`), so a payer can tie the claim to the discharge summary. A code with no mapping goes out as ICD-10 alone; never SNOMED alone, never SNOMED first. A CodeableConcept may carry several codings of one concept, and the binding is met when one of them is from the bound system. See Field Corrections, 10.

**Cyclic packages are one item per cycle.** Chemotherapy, dialysis and the other packages the master marks cyclic (`CyclicProcedure`, with `MaximumCyclesAllowed`) are quoted once per cycle on an enhancement: a second cycle is a second item, not a quantity of two, and a line carries which cycle it is. See Field Corrections, 12.

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

On the general network, a standalone query, raised before any decision, may arrive as a **communication request** on `/v1/communication/request`, with reason `additionalinfo` and the case number. The provider attaches what was asked and answers on `/v1/communication/on_request`. The payer then issues the decision on `/v1/preauth/on_submit`. The queried `ClaimResponse` with workflow 24 tells the provider the case is waiting; the communication tells it what for.

Some payers instead take the answer on the preauthorisation endpoint itself with workflow 19. PMJAY does; PMJAY Provider covers it.

## Follow-ups on the same case

All reuse this screen's bundle with a new correlation ID, the original reference, and a different workflow code.

**Answering a query** travels as `x-hcx-status: request.initiated`, like every send on `/v1/preauth/submit`; the workflow sheet pairs 19 and 131 with `response.complete`, and NHCX refuses that on a submit path with `NHCX-1011`. An answer refused at the door leaves the leg queried, its question still open. A line-item query, a `ClaimResponse` naming the queried items, is answered by sending the pre-authorisation again, whatever the payer's query mode. The answer adds one more entry wherever it is sent: the overall case remarks, under category `NMI` with code `CQD`, as a string. Send it. The handbook says an answer without it is rejected. The one sampled answer that the payer accepted and then approved carries no such entry, so treat it as required until a payer tells you otherwise.

- **Enhancement** (13). Against an approved case, for additional procedures or days, and only until the claim is submitted. The bundle lists the already-approved items and the new ones.
- **Resubmission** (121). Revises a request after a query or rejection, as the workflow sheet defines it. The reference hospital build never sends 121: a query is answered on 19, and a rejected pre-authorisation is sent again as a new request on 12.
- **Cancel** (PC01). A Task, not a Claim: code `cancel`, the case number as input, a reason from the list (treatment plan changed, patient request, financial constraints, alternative treatment, duplicate, administrative error, other). Allowed while the claim, if raised, is still with the payer, being decided or queried; refused once the payer has decided the claim. The workflow sheet gives PC01 for this and PC02 for the answer; the handbook gives 122 in two places, including the heading of its cancellation-reason appendix. Confirm which the payer accepts.

The Task resource carries more codes than these two. The provider exit checklist names `reprocess`, `cancel`, `release` and `nullify`, and the value set adds `approve`, `search`, `poll` and `suspend`. `nullify` is described in Cancel, Reprocess and Shortfall in the FHIR Reference. `suspend` is not described in any source beyond its place in the value set.

## Once the claim is submitted

The core rule: once the pre-authorisation is approved and the claim submitted, no enhancement and no change is made to the pre-authorisation. Its lines, details, documents and forms are read only, and a send on it is refused: "The claim has gone to the payer, so the pre-authorisation is read only: no enhancement or change can be made. It can only be cancelled while the payer is deciding the claim." It can be cancelled while the claim is being decided or queried, and not after: "The payer has decided the claim; the pre-authorisation can no longer be cancelled." A claim still a draft, or refused at the door, leaves the pre-authorisation open.

The status enquiry is asked of the pre-authorisation only while it is waiting for the payer's answer. Once it is decided, the enquiry is asked of the claim. Status and Search has the `Task`.

Payers enforce sequencing and say so: no approved record for this enhancement, a case already in progress, a claim already raised. Surface their errors as they are.
