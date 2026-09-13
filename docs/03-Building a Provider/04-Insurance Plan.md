# Insurance plan

The plan is the policy as data. It tells the hospital system what a policy covers, at what limits, under what conditions, and with which documents. So the treatment screen is built from the payer's own rules rather than from a PDF someone once read. Nothing on that screen should be typed in by hand if the plan already knows it.

## What the user does

The user never asks for the plan. It is fetched in the background and the treatment screen is built from it.

**Choose what is being treated.** The specialties, services or packages offered are the ones the plan lists for this hospital. Nothing else is shown.

**See the terms.** The limit for each benefit, any waiting period or exclusion that applies, and whether preauthorisation is required for it.

**See the requirements** as a checklist: the documents the plan lists as mandatory at policy level and per benefit, and any questionnaire the payer attaches to a benefit. Render the questionnaire from the plan's Questionnaire resource rather than hard-coding it.

## What the system calls

```
POST /v1/insuranceplan/request     Task, code poll, inputs policyNumber and providerId
callback /v1/insuranceplan/on_request
```

Fetch once per policy the hospital deals with, and refresh on a schedule and whenever a payer communication with reason `policychange` arrives. The handbook's guidance is to fetch at registration or admission, before treatment planning, and alongside eligibility.

## What comes back, and how to store it

A collection bundle with one `InsurancePlan`, the `Organization`s, and one `Questionnaire` per requirement.

**Two shapes exist, and they are not layout variants.** A payer picks one per product, and which one arrives decides how the treatment screen works. A system that handles both needs two code paths behind one screen.

| | Package-based | Coverage-based |
| :---- | :---- | :---- |
| Sent by | Government schemes. PMJAY throughout | Private insurers and their TPAs |
| Structure | `plan → specificCost → category → benefit → cost`, with the rules on `coverage[]` alongside | `coverage → benefit → limit` |
| The unit | A named package at a fixed all-inclusive rate | A benefit with a money cap, such as ICU charges or room rent |
| What the user picks | A specialty, then a package. The rate is fixed and not editable | A service, then bills against it |
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

A scheme plan is large. The published PMJAY plan is 21 MB with 2,217 entries, and it cannot be handled by a naive JSON parser inside a request-response cycle. Stream it, or parse it once on a worker and store the result.

Store the plan as data, not as a blob: benefits with their limits or rates, the conditions and exclusions from the plan's extensions, the document requirements, and the questionnaire URLs. Keep a version stamp on every stored plan, and record which version each submission used. A rate that changed on the payer's side without a refresh on yours is the commonest cause of a reduced approval.

## What to validate before submitting

The plan is also the first line of validation, run on the server, not only in the browser:

- Codes and displays exactly as the plan has them, character for character, **including its misspellings**. The published PMJAY plan carries `Opthalmology` and `Transegender Procedure`, and a preauthorisation whose display differs from the plan's is rejected on the display.
- Amounts within the benefit's limit; quantities within what the plan allows.
- Every document the plan marks mandatory attached before submit is enabled.
- Under a package plan, implant and stratification counts within their maxima, and a standalone package with nothing else beside it.

A base rate of zero is not an error. In the published plan, package `MG004A` has a base limit of 0 INR and stratification limits of 1,800 to 4,500, meaning the payable amount is decided entirely by the bed category chosen. Do not treat 0 as missing data, and do not submit a zero-value item line.

## When the plan goes stale

Refresh on a `policychange` communication, on whatever periodic schedule operations accepts, and before treatment planning if the cached copy has no version stamp. The FRD says weekly; the scenario sheet says every fifteen days. Under PMJAY an outdated tariff version causes a rate mismatch and automatic rejection on suspicion of tampering.

Stamp the cache with the plan's scheme revision, and record on every preauthorisation and claim which revision it was built against. A rate that changed on the payer's side without a refresh on yours is the commonest cause of a reduced approval. The revision stamp is what turns that into a diagnosable event rather than a mystery.
