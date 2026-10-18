# Insurance plan

The plan is the policy as data. It tells the hospital system what a policy covers, at what limits, under what conditions, and with which documents. So the treatment screen is built from the payer's own rules rather than from a PDF someone once read. Nothing on that screen should be typed in by hand if the plan already knows it.

## What the user does

The user never has to ask for the plan. It is fetched in the background and the treatment screen is built from it. Whenever a validation leaves a case in force and the case has no plan for its policy, HFR id and payer, fetch it then: reuse a ready plan of the same policy, facility and payer, else request one. The fetch never stops the case, and the desk can still fetch it again by hand.

**Choose what is being treated.** The categories (the payer's specialities), services or packages offered are the ones the plan lists for this hospital. Nothing else is shown, and nothing is typed in as a line of its own: every line is quoted from the plan, and the only price typed is a rate the plan leaves open.

**See the terms.** The limit for each benefit, any waiting period or exclusion that applies, and whether preauthorisation is required for it.

**See the requirements** as a checklist: the documents the plan lists as mandatory at policy level and per benefit, and any questionnaire the payer attaches to a benefit. Render the questionnaire from the plan's Questionnaire resource rather than hard-coding it. A form is policy-level or procedure-level by where the plan points at it, never by its URL: see "Where the forms are pointed at" below.

## What the system calls

```
POST /v1/insuranceplan/request     Task, code poll, inputs policyNumber and providerId
callback /v1/insuranceplan/on_request
```

Send it under `x-hcx-workflow_id` `1`. The plan belongs to the hospital and the policy, never to one case, and NHA publishes no workflow code for the request; the case number is never sent there.

Fetch once per policy the hospital deals with, and refresh on a schedule and whenever a payer communication with reason `policychange` arrives. The handbook's guidance is to fetch at registration or admission, before treatment planning, and alongside eligibility.

## What comes back, and how to store it

A collection bundle with one `InsurancePlan`, the `Organization`s, and one `Questionnaire` per requirement.

**Two shapes exist, and they are not layout variants.** A payer picks one per product, and which one arrives decides how the treatment screen works. A system that handles both needs two code paths behind one screen.

| | Package-based | Coverage-based |
| :---- | :---- | :---- |
| Sent by | Government schemes. PMJAY throughout | Private insurers and their TPAs |
| Structure | `plan → specificCost → category → benefit → cost`, with the rules on `coverage[]` alongside | `coverage → benefit → limit` |
| The unit | A named package at a fixed all-inclusive rate | A benefit with a money cap, such as ICU charges or room rent |
| What the user picks | A category (the payer's specialty), then a package. The rate is fixed unless the plan leaves it open | A service, then bills against it |
| Where the amount comes from | The plan's `Procedure` or `Stratification` cost line | The hospital's own bill, checked against the benefit limit |
| Rules arrive as | Sixteen `Claim-Condition` flags per package | `benefit.requirement` strings such as "Pre-authorisation required" |
| What blocks submission | A code or display differing from the plan, character for character | An amount over the limit, or a missing mandatory document |
| Sampled | Yes, one 21 MB payload | No sample in the published corpus |

PMJAY Provider covers what the package flags do. The FHIR Reference has a chapter for each shape.

### Storing it

Store the plan as data, not as a blob. Both shapes need the same five things pulled out and indexed.

| What to extract | Package-based | Coverage-based |
| :---- | :---- | :---- |
| The pickable list | Specialties from `coverage[].type`, packages from `benefit[]` | Cover types from `coverage[].type`, services from `benefit[]` |
| The money | `specificCost` cost lines, joined to the rules on the package code | `benefit.limit[].value` |
| The rules | The sixteen flags per package | The `requirement` string |
| The document checklist | `Claim-SupportingInfoRequirement`, package level plus plan level | The benefit's required documents |
| The forms | `Questionnaire` resources the requirements point at | As published by the insurer |

A scheme plan is large. The published PMJAY plan is 21 MB with 2,217 entries, and the live sandbox answers with about 45 MB encrypted, 33 MB once opened, 2,500 packages and 2,000 questionnaires. It cannot be handled by a naive JSON parser inside a request-response cycle. Stream it, or parse it once on a worker and store the result.

The message also arrives as a chunked body with no `Content-Length`, and every limit between the exchange and your parser meets it: the proxy's body cap (nginx `client_max_body_size`), the web framework's own cap and its habit of sizing the request from `Content-Length` (a Django app read an empty body until a middleware buffered the chunked stream and `DATA_UPLOAD_MAX_MEMORY_SIZE` was raised), the JOSE library's segment cap (Authlib refuses a compact JWE segment over 256 KB; use a library without the cap or run RSA-OAEP and AES-GCM directly), memory (hold the body once, never log or pretty-print it) and time (the callback must be acknowledged while the parse runs). Test the path with a 50 MB chunked body before the first live fetch. See Field Corrections, 6.

**One row per speciality.** The two shapes are merged, not concatenated, and the merge key is the pair (speciality, package code), never the code alone. A payer lists the same package under several specialities: PMJAY has Dengue (MG004A) under Cardiology, General Medicine and Paediatric medical management, and repeats 545 of its 1,537 codes that way. A parser keyed on the code keeps the first speciality and loses the one the case is treated under. Store the row unique on (plan, speciality, code), and when a desk quotes a code listed under several specialities make it pick one (the screens call it the Category), which is what goes out as the item's category. See Field Corrections, 8.

**A cover benefit is not a package.** The `coverage[]` block of a plan also lists the policy's own limits: Blood, ICU, Oxygen, Organ donor, Ambulance, each SNOMED CT coded and carrying no `id`. Store those as benefits of the policy and never offer one as a line; a build that did quoted SNOMED CT 87612001, Blood, as a pre-authorisation item. A benefit found only under `coverage[]` is a quotable package only when the payer names it as one by giving it its own `id`, as the PMJAY master does for its coverage-only packages.

**Where the forms are pointed at.** A policy-level form is pointed at from `InsurancePlan.coverage[].extension`; a procedure-level form from the package's own benefit under `plan[].specificCost[]`. The pointer is a `Claim-SupportingInfoRequirement` with category `INF`, code `ODN` and a `documentationUrl`. A form pointed at from coverage is a policy form, never one of the packages under that coverage, and a form not tagged to a procedure is policy-level. The URL decides nothing: a payer may publish every form under the same path shape.

Store the plan as data, not as a blob: benefits with their limits or rates, the conditions and exclusions from the plan's extensions, the document requirements, and the questionnaire URLs. Keep a version stamp on every stored plan, and record which version each submission used.

## What to validate before submitting

**The price of a line.** A price is open, typed by the hospital, only when the master names no rate for the package, or names zero and offers no ward or ICU tier for it. A zero rate with tiers is not open: the package is priced by its tiers alone and the desk cannot type over it. Carry each package's tiers, conditions and document requirements with the line, not the rate alone; a build that dropped them quoted the right package at the wrong structure. See Field Corrections, 9.

The plan is also the first line of validation, run on the server, not only in the browser:

- Codes and displays exactly as the plan has them, character for character, **including its misspellings**. The published PMJAY plan carries `Opthalmology` and `Transegender Procedure`, and a preauthorisation whose display differs from the plan's is rejected on the display.
- Amounts within the benefit's limit; quantities within what the plan allows.
- Every document the plan marks mandatory attached before submit is enabled.
- Under a package plan, implant and stratification counts within their maxima, and a standalone package with nothing else beside it.

A base rate of zero is not an error. In the published plan, package `MG004A` has a base limit of 0 INR and stratification limits of 1,800 to 4,500, meaning the payable amount is decided entirely by the bed category chosen. Do not treat 0 as missing data, and do not submit a zero-value item line.

## When the plan goes stale

**Whose plan it is.** A government scheme's master is the same for every case at the facility, so under PMJAY one copy per facility, refreshed on the triggers below, is right. A private insurer may answer the same policy and facility differently for different beneficiaries, so a cache keyed on facility and policy alone cannot be assumed across payers. Keep the master attached to the case it was fetched for, and make a facility-wide cache the payer adapter's decision.

Refresh on a `policychange` communication, on whatever periodic schedule operations accepts, and before treatment planning if the cached copy has no version stamp. The FRD says weekly; the scenario sheet says every fifteen days. Under PMJAY an outdated tariff version causes a rate mismatch and automatic rejection on suspicion of tampering.

Stamp the cache with the plan's scheme revision, and record on every preauthorisation and claim which revision it was built against. A rate that changed on the payer's side without a refresh on yours is the commonest cause of a reduced approval. The revision stamp is what turns that into a diagnosable event rather than a mystery.
