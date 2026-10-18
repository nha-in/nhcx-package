# Field corrections, October 2026

What a hospital build against this documentation got wrong, what was corrected, and how each corrected piece now works. The findings come from an independent review of an AI-built NHCX integration into an open-source HMIS in October 2026, checked against the generated code and the sandbox traffic. Thirteen were raised. Twelve are corrected here and in the reference implementation; one was judged wrong as raised and is explained at the end. Each entry names the chapter that now carries the rule.

## The findings and the corrections

### 1. No screen to configure the participant or rotate the key

The participant code, the registry record and the encryption key were settings an operator edited in a file and restarted for. A settings screen now shows the participant code the deployment sends as, what the registry holds for it (status, name, roles, callback endpoint) with a re-check, and corrects the endpoint when the registry points elsewhere. The encryption key has three slots, active, staged and previous, and a rotation is three steps that need no restart: stage a new key and its certificate, register the staged certificate with the registry so payers start encrypting with it, then activate it. The key it replaces becomes the previous key, which still opens messages a payer encrypted a minute before the switch, until it is retired. A staged key opens nothing. See the UI Guide, Settings, and Creating and Updating a Participant.

### 2 and 3. The ABDM module the HMIS already had was built a second time

The HMIS carried a full ABDM module: ABHA creation and verification, the health facility id, the ABDM session token. The build wrote all of it again inside the NHCX code and stored the ABHA under a second identifier system, so an ABHA linked through the HMIS was invisible to NHCX and the reverse. The rule is now explicit: discovery of the target system looks for an ABDM module first, and when one exists NHCX reads and writes the ABHA through it, takes the facility's HFR id from it and shares its session token. The ABHA flows are built only when no module exists. See Provider Overview, what to reuse.

### 4 and 5. The first beneficiary on a family card was taken as the patient, and linked without asking

PMJAY answers an eligibility check on a family card with one Patient and one Coverage per member, three or more on a card. The build read the first Patient and attached the stay to it, which on a family card attaches a child's admission to the parent's record or the reverse. Every payer Patient is now read, each through its own Coverage's `beneficiary` reference, into a list of members with name, gender, date of birth, member id and relationship to the subscriber. The one the response's own `patient` names is marked as the member the payer answered about. The desk chooses which member is in the bed; nothing is taken as the patient until it does, and a member whose gender, year of birth or name disagrees with the patient on file is flagged beside the choice. Linking the admission is always an explicit act. See Registration and Eligibility, reading the answer, and the UI Guide.

### 6. A large package master was refused, then crashed the backend

A PMJAY package master is about 45 MB encrypted and 33 MB decrypted, and it arrives as a chunked body with no `Content-Length`. The build read an empty body (its web framework sizes the request from `Content-Length`), its JOSE library refused a segment that large, and its development logger ran out of memory printing the stored JSON. The rule now names each limit a 50 MB message meets on the way in: read a chunked body to its end, raise the framework's own body limit (Django's `DATA_UPLOAD_MAX_MEMORY_SIZE`, for one) and the proxy's (`client_max_body_size`), decrypt with a library that has no segment cap or run RSA-OAEP and AES-GCM directly, hold the body once, never log it, and parse the packages in one pass. The dry-run tests post a 50 MB chunked body. See Insurance Plan, what comes back.

### 7. The package master was fetched for every case

Raised as a defect; not changed. A government scheme's master is the same for every case at a facility, so caching it once per facility and refreshing on a trigger is right for PMJAY. A private insurer may answer the same policy and facility differently for different beneficiaries, so a master cannot be assumed facility-wide across payers. The master stays attached to the case it was fetched for; a facility-wide cache is the payer adapter's decision, not the exchange's. See Insurance Plan, when the plan goes stale.

### 8. Only one speciality of a package survived

A payer lists the same package under several specialities. PMJAY lists Dengue (MG004A) under Cardiology, General Medicine and Paediatric medical management, and repeats 545 of its 1,537 codes that way. The parser merged the two plan shapes on the package code alone and kept the first speciality, so Dengue appeared under Cardiology only and a case treated under General Medicine could not quote it there. The merge key is now the pair (speciality, package code), the stored row is unique on that pair, and the line a desk adds names the speciality it is quoted under, which is what goes out as the item's category. A code listed under several specialities asks the desk to pick one. See Insurance Plan, storing it.

### 9. Rate, tiers, documents and conditions were mapped wrongly on a line

The line items read the package's rate but lost its ward and ICU tiers, its document requirements and its claim conditions, and treated every zero rate as a price the hospital types. The rule is now: a price is open, typed by the hospital, only when the master names no rate, or names zero and offers no tier for the package. A zero rate with tiers is priced by its tiers alone and cannot be typed over. The claim state carries each package's tiers and the counts of its conditions and documents, and a package detail call returns the whole row so the screens show what the master actually says. See Insurance Plan, what to validate before submitting.

### 10. The diagnosis selector asked for ICD-10 the clinician does not use

The payer adjudicates on ICD-10, which is what `Claim.diagnosis` is bound to on NHCX, while the HMIS and the ABDM health records of the same stay are coded in SNOMED CT. The desk picks the ICD-10 code; the system maps it to the SNOMED CT concept through its diagnosis terminology and sends both on the one diagnosis: the ICD-10 coding first, because a payer reading only the first coding must find it there, and the SNOMED CT coding second, so a payer can tie the claim to the discharge summary without a mapping of its own. A code with no mapping goes out as ICD-10 alone. Never SNOMED alone, never SNOMED first. See Preauthorisation, what goes in the bundle.

### 11. No way to give structured data

The forms the payer attaches to a package, the treatment-guideline questionnaires and the policy forms, were shown only when a ruling demanded one, so a desk that wanted to answer a form could not find it. The forms card is now always on the pre-authorisation once the case is on a plan: the forms the quoted packages carry, the policy-wide forms, and an empty state that says the payer lists none for the quoted packages. See the UI Guide, preauthorisation.

### 12. No way to resubmit

Raised against the build, where resubmission and enhancement did exist; the failure observed was the scheme refusing an enhancement under the sandbox's own rule. What was missing was cycles: a cyclic package (chemotherapy, dialysis) is quoted once per cycle on an enhancement, as one item per cycle, never as a quantity of two. A line now carries its cycle, a cyclic package already on the request is added again as the next cycle, and the master's maximum cycles is enforced. See Preauthorisation, what goes in the bundle.

### 13. Payments stopped at the claim

A payment notice settled the claim and went no further; the hospital's own bill did not know the payer had paid. A settled payment is now posted to the bill the stay is charged against as a payer-payment line (date, payer, mode, reference, amount, claim), the claim records whether that posting happened and where, the posting is best effort on the callback path (the notice is acknowledged whether or not the bill could be written) and the desk can post it again by hand. The payments screen shows the shortfall against the claimed amount beside the settled amount. See Payment and Communication, what to reconcile.

## Why five of these were the documentation's fault

The generated code followed the text it was given. Five findings traced to that text rather than to the code: the "coexistence" rule that told the builder to keep a separate ABHA identifier system (2, 3); "the last Patient in the bundle" as the person the payer answered about (4); the merge on package code alone (8); and the ICD-10 selector (10). The sixth, the large payload (6), was described as a byte cap that was enough for one web stack and not another. All six passages are rewritten above and in the chapters they belong to.

## 18 October 2026

A second pass, after the reference hospital build ran its cases end to end against the sandbox payer and its bundles were compared with a live PMJAY provider's. These are rules the documentation stated loosely or not at all. Each is now stated in the chapter named.

### Workflow ids that name no step

The status enquiry is a `Task` coded `status` on `/v1/task/submit` (the sandbox refuses `/v1/status` with `NHCX-1012`), sent under `x-hcx-workflow_id` `1` always. No NHCX workflow code names a status check; the only Task codes are 36, reprocess, and PC01, cancel. The build had sent the leg's correlation id there, which is a UUID and not a workflow id, and the payer answered with an empty one. The insurance plan request also goes under `1`: the plan belongs to the hospital and the policy, never to one case, so the case number is never sent. See Status and Search, and Envelope Fields.

### A query answer is a request

An answer sent on `/v1/preauth/submit` or `/v1/claim/submit` (workflow 19, 131, 151, or 161 under PMJAY) travels as `x-hcx-status: request.initiated`. The workflow sheet pairs those codes with `response.complete`, and NHCX refuses that on a submit path with `NHCX-1011`, Invalid Status. Only a send on an `on_` path, such as the payment acknowledgement, is `response.complete`. An answer refused at the door leaves the leg queried, its question still open. See Workflow Codes and Payer Flexibility.

### A claim is never resubmitted

A claim the payer has decided does not go again. A rejected claim goes back as a reprocess, a `Task` on workflow 36, with reason `claimrejected` or `rejectiondisputed`; a reprocess is offered and accepted only for a rejected claim. `partialpayment` is not a reprocess reason, since a part-paid claim is not rejected: its unpaid balance is asked for as a `release` Task. A claim refused at the door, which never reached the payer, may be sent again. The reprocess decision, a `ClaimResponse` carried on the Task reply, updates the claim. See Discharge and Claim.

### The pre-authorisation is read only once the claim is with the payer

Once the pre-authorisation is approved and the claim submitted, no enhancement and no change to the pre-authorisation is made: its lines, details, documents and forms are read only. It can be cancelled while the claim is at the payer, being decided or queried, and not after the claim is decided. A claim still a draft, or refused at the door, leaves the pre-authorisation open. See Preauthorisation.

### The pre-authorisation does not wait for the admission

The planned admission date, the expected discharge date, the ICD-10 diagnoses and the treating doctors belong to the pre-authorisation and are entered on it. A pre-authorisation may be drafted and sent before the patient is admitted. A linked admission only pre-fills a form not yet saved. The IPD admission is linked at claim time, found by the case's ABHA number, and the claim needs it. See Preauthorisation and Discharge and Claim.

### Every line comes from the plan

There are no custom line items. Every line is quoted from the insurance plan, and the only price a desk types is an open rate. There is no predetermination step in the provider flow: the pre-authorisation is the request. The coverage benefits check and the authorisation requirements check sit on the pre-authorisation step, side by side, once a line is quoted. "Speciality" is called Category on the screens. See Insurance Plan and the UI Guide.

### A cover benefit is not a package

A benefit found only under `coverage[]` is a quotable package only when the payer names it as one, which it does by giving the benefit its own `id`. A bare cover benefit, such as Blood, ICU, Oxygen, Organ donor or Ambulance, is a SNOMED CT-coded limit of the policy with no `id`, and is never offered as a line. The build had quoted SNOMED CT 87612001, Blood, as a pre-authorisation item. See Insurance Plan, and Policies and Plans.

### Where a payer's forms are pointed at

A policy-level form is pointed at from `InsurancePlan.coverage[].extension`, and a procedure-level form from the package's own `plan.specificCost` benefit. A form not tagged to a procedure is policy-level. The form's URL never decides which: every form may be published under one path shape. See Insurance Plan, and Policies and Plans.

### The insurance plan arrives without being asked for

When a validation leaves a case in force and the case has no plan for its policy, HFR id and payer, the plan is fetched automatically: a ready plan of the same policy, facility and payer is reused, else one is requested. The desk can still fetch it again by hand. See Insurance Plan.

### Proof of presence, by stage

The stage is the screen's: `Preauth` on the pre-authorisation, `Discharge` on the claim. An authentication may be done before admission, belonging to the case alone, and moves to the patient when the admission is linked. See Biometric Authentication.

### Records found by ABHA

Records offered as documents are found by the case's ABHA number, across every patient holding those digits, whether or not a patient or admission is linked yet. A structured record is sent to the payer as FHIR, a `DocumentReference` carrying the record, and opened for staff on its own HMIS page, never as its JSON. See Preauthorisation.

### Two payer behaviours

There are two adapter behaviours and no more: `gov`, for a payer whose participant record has entity type Gov, and `generic`, for every other. The adapter's name is never shown to the desk. A provider's participant list asks the registry for payers and TPAs only. See Payer Flexibility, and Finding Participants and Policies.

### The case screen

The case tabs are Overview, Pre-authorisation, Claim, Communication, Payments and Logs. Claim and Payments appear only once a pre-authorisation has been raised. Correlation ids and transaction ids appear only on Logs, newest first. A dot beside a tab says the payer has sent something new there. Whether answers are fetched by a Refresh button or by polling is the integration's choice, and a manual Refresh is the default. An empty Communication tab says so in plain words. See the UI Guide.
