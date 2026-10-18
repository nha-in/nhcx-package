# F3. CoverageEligibilityResponse

#### F3R. RESOURCE
`CoverageEligibilityResponse`. Direction: received on `coverageeligibility/on_check`. No NRCeS profile is required or checked. PMJAY sends `meta.profile` `http://hl7.org/fhir/StructureDefinition/CoverageEligibilityResponse` [PAYER](../references/PAYERS.md#markers).

#### F3D. DESCRIPTION
The payer's answer to F2, carried in a bundle that repeats the request's seven entries and then appends the payer's own `CoverageEligibilityResponse`, one or more `Patient` and `Coverage` pairs and Organizations. A reply may also carry only the response, Patient and Coverage.

**Which Patients are the payer's.** The request's own Patient is the one `CoverageEligibilityRequest.patient` points at (and the request's Coverage the one its `insurance[].coverage` points at); every other Patient is the payer's. A family policy answers with one Patient and one Coverage per member on the card, each Patient carrying that member's id (an identifier typed `MB`, or typed the payer's own way; the reader takes `MB` first, then the first identifier not typed `ABHA`, `JHN`, `MO` or `ADN` nor under a health-id or mobile system, else the Coverage's `subscriberId`) and each Coverage's `beneficiary` pointing at its Patient and `relationship` saying how the member relates to the subscriber [PAYER](../references/PAYERS.md#markers). The reader therefore returns a **list of beneficiaries**, one per payer Coverage whose `beneficiary` resolves (by fullUrl or `Type/id`) to a payer Patient, each Patient once; the request's own Patient and the request's own Coverage are left out. It marks the one `CoverageEligibilityResponse.patient` points at as `checked`. A reply with no such Coverage gives the one Patient the response points at, when it is not the request's own. Reading "the last Patient" picks one family member at random with respect to who is in the bed, and is wrong.

The same resource is read two ways, depending on which exchange the correlation id belongs to:

**Eligibility verdict** (answer to `validation`, `benefits`, `discovery`; C2). Read into the case row, D9 `claim`:
- `insurance[0].inforce` decides eligible or not. `outcome: error` makes the case `error`, else `inforce` true makes it `eligible`, else `not-eligible`.
- The wallet (sum insured, utilised, balance). Every `insurance[0].item[].benefit[]` that has `allowedMoney` is a candidate. The one typed `benefit` wins, then the one typed `30` ("Health Benefit Plan Coverage"), then the first benefit on the admission item (`productOrService` 305056002) or on an item naming no product [PAYER](../references/PAYERS.md#markers). **A benefit on a procedure line is that package's rate, never the cover**, and is never read as the wallet: a benefits answer that lists packages without a wallet row leaves `allowed_amount` and `used_amount` as they were (reading a package rate as the sum insured showed a negative balance). `allowedMoney` is what is left on the wallet and `usedMoney` what has gone; both are always taken from the same row. The sum insured is stored as left plus used, so the balance shown (sum insured minus used) equals `allowedMoney`.
- `item[].authorizationRequired`: the last item that states it wins.
- The beneficiaries: every payer Patient, with name, gender, birth date, address, ABHA, photo and member id, and from its Coverage the relationship. **The photo** is kept as the base64 of the image: data that already starts as a JPEG (`/9j/`) or PNG (`iVBORw0`) is kept as it is; data that decodes to such base64 (the PMJAY gateway encodes the photo twice) is peeled once; anything that is not an image is dropped [PAYER](../references/PAYERS.md#markers). A `photo[0].url` is kept when there is no data. Each entry also carries the policy from its Coverage (`policy_code`: `class[0].value`, else the first identifier, else `subscriberId`; `plan_name`: `class[0].name`). The whole list goes to D9 `beneficiaries_json`. The person columns of D9 are filled from **one** of them only when the choice is unambiguous: one person returned, or one whose member id equals the case's `member_id` (or an earlier choice, `beneficiary_member_id`). Otherwise they are left as they were and the desk chooses on S3. Policy Discovery (in nhcx-coverage) (C2. Coverage Eligibility Verdict (in nhcx-coverage)). On a provisional case (D9 `provisional`) with several members the desk always chooses, even when one member id matches, before the case opens.
- The policy: plan name and period from the last Coverage of the bundle (they agree on one card).

Both readings take the **last** `CoverageEligibilityResponse` of the bundle; a bundle with none is refused ("The payer reply carries no CoverageEligibilityResponse.").

**Itemised benefits** (every purpose; C2). Beside the verdict, every `insurance[].item` of the response is read whole into D9 `benefit_items_json`, because a `benefits` check is answered item by item and the desk has to see what the policy covers for each package. Per item: `productOrService` (the package code and display), `category`, `modifier[]`, `excluded`, `name`, `description`, `network`, `unit`, `term` (`annual` or `lifetime`, BenefitTermCodes), `authorizationRequired`, `authorizationSupporting[]` (the documents that support the authorisation), `authorizationUrl`, and every `benefit[]` with its `type` (BenefitTypeCodes: `benefit`, `Procedure`, `copay`, `deductible`, `visit`...) and `allowed[x]` / `used[x]` in whichever form the payer chose (`allowedMoney` with its currency, `allowedUnsignedInt` as a count, `allowedString` as text; the same for `used`). The wallet row PMJAY answers the family balance under is kept and flagged `wallet`, so the screens can set it apart from the packages: an item whose `productOrService` is 305056002, or an item naming no product whose benefits include one typed `benefit` or `30`. A `validation` answers with the wallet row alone: it never replaces a stored list that held packages, so the desk keeps seeing what the policy covers; a list with any non-wallet item always replaces the stored one. Nothing in the item is dropped: a payer that answers with a field this list does not name still has it in the stored bundle (`response_json`). Shown on the Overview as "Coverage benefits" and on the Pre-authorisation tab's Coverage benefits check card (S3. Policy Discovery (in nhcx-coverage), [S8. Line Items](../screens/S8-line-items.md)).

**Authorisation-requirements ruling** (answer to `auth-requirements`; C3). Read into D13 `claim_auth`, one D14 `claim_auth_item` per `insurance[0].item`, and one D15 `claim_auth_requirement` per distinct `authorizationSupporting` entry:
- Each item answers one quoted line: `authorizationRequired`, `excluded`, the first benefit's type and `allowedMoney`.
- `authorizationSupporting[]` is a list of CodeableConcepts whose free-text `text` says what each is; the text conventions below are the PMJAY dialect [PAYER](../references/PAYERS.md#markers). A text holding `fullUrl: <url>` is a **form** to answer (a Questionnaire, F6, from the plan, F5). Any other is a **document**, and its `Type: <stage>` says when it is due (a document with no `Type:` is due `pre`). `Procedure Code: <code>` names the package it is for. Matching is case-insensitive.
- A requirement is due at pre-authorisation when its stage is in the adapter's pre-authorisation stages (see [PAYERS.md](../references/PAYERS.md)) or D11's stage rule reads it as `pre` [PAYER](../references/PAYERS.md#markers); a form is not due at pre-authorisation just for being a form (a claim-stage STQ the ruling names rides on the claim). All others are due with the claim. With no `Type:`, the stage is read from the display by D11's stage rule.
- Requirements are de-duplicated on (kind, code, form url) across items.
- A ruling with no `authorizationSupporting` at all is valid. It asks for nothing beyond the package master's own list.

A ProtocolResponse in place of the bundle (F1) turns the case, or the ruling, to `error` with `<code>: <message>`.

#### F3F. FIELDS
Eligibility verdict, into D9 `claim`:

| Element read | Stored in | Notes |
|---|---|---|
| `outcome` | `claim.outcome` | `error` sets `claim.status` = `error` |
| `disposition` | `claim.disposition` | for example "Policy is currently in-force" |
| `insurance[0].inforce` | `claim.inforce` (1/0) | true sets `claim.status` = `eligible`, else `not-eligible` |
| `insurance[0].item[].authorizationRequired` | `claim.auth_required` (1/0) | last item stating it |
| `insurance[0].item[].benefit[].type.coding[].code` | chooses the wallet | `benefit`, then `30`, then the first on the admission item (305056002) or an item with no product; never a procedure line's benefit. No wallet row: the two amounts are not written |
| wallet `allowedMoney.value` + `usedMoney.value` | `claim.allowed_amount` | the sum insured |
| wallet `usedMoney.value` | `claim.used_amount` | |
| every payer Coverage whose `beneficiary` is a payer Patient (not the request's), with that Patient | `claim.beneficiaries_json`: list of `{member_id, name, gender, dob, address, abha_number, photo, relationship, policy_code, plan_name, checked}` | the whole list, every reply |
| chosen Patient `identifier[]` typed `MB`, else the first not typed `ABHA`, `JHN`, `MO` or `ADN`, else its Coverage's `subscriberId` | `claim.beneficiary_member_id` | null when the desk must choose |
| chosen Patient `name[0].text`, else `given` joined, else `family` | `claim.beneficiary_name` | |
| chosen Patient `gender` / `birthDate` | `claim.patient_gender` / `claim.patient_dob` | |
| chosen Patient `address[0]`: `line[]`, `district`, `state`, `postalCode` | `claim.patient_address` | joined with ", " |
| chosen Patient `identifier[]` with type code `ABHA` | `claim.abha_number` | |
| chosen Patient `photo[0].data` (base64 of a JPEG or PNG; a twice-encoded value peeled once; not an image dropped), else `.url` | `claim.patient_photo` | |
| chosen person's Coverage `relationship.coding[0].display`, else `.code` | `claim.relationship` | |
| last Coverage `class[0].name` | `claim.plan_name` | |
| last Coverage `period.start` / `period.end` | `claim.plan_period_start` / `claim.plan_period_end` | |
| the whole bundle | `claim.response_json` | |

"Chosen" is the one person when one is returned, else the one whose member id equals `claim.member_id` or `claim.beneficiary_member_id`; with no such person the chosen-person rows are not written. Empty values are not written, so a reply without a Patient keeps what the case already had.

Authorisation-requirements ruling, the **last** CoverageEligibilityResponse in the bundle:

| Element read | Stored in | Notes |
|---|---|---|
| `outcome`, `disposition` | D13 `claim_auth.outcome`, `.disposition` | `claim_auth.status` = `ready` |
| `insurance[0].inforce` | D13 `claim_auth.inforce` (1/0) | |
| `insurance[0].item[].productOrService.coding[0]` code / display (else `text`) | D14 `claim_auth_item.code` / `.display` | one row per item, `seq` from 1 |
| `item[].category.coding[0].code` | D14 `claim_auth_item.category_code` | |
| `item[].authorizationRequired` | D14 `claim_auth_item.auth_required` (1/0) | |
| `item[].excluded` | D14 `claim_auth_item.excluded` (1/0) | |
| `item[].benefit[0].type.coding[0].code` | D14 `claim_auth_item.benefit_type` | for example `Procedure` |
| `item[].benefit[0].allowedMoney.value` | D14 `claim_auth_item.allowed_amount` | |
| `item[].authorizationSupporting[].coding[0].code` / `.display` | D15 `claim_auth_requirement.code` / `.display` | |
| `authorizationSupporting[].text`, `fullUrl: <url>` | D15 `.kind` = `form`, `.form_url` = the url | |
| `authorizationSupporting[].text`, no `fullUrl:` | D15 `.kind` = `document` | |
| `authorizationSupporting[].text`, `Type: <stage>` | D15 `.stage` (lower case) | with none, D11's stage rule on the display (`pre` when it says nothing) |
| `authorizationSupporting[].text`, `Procedure Code: <code>` | D15 `.for_code` | else the item's own code |
| computed | D15 `.at_preauth` (1/0) | stage in the adapter's pre-authorisation stages, or read as `pre` |
| the whole bundle | D13 `claim_auth.response_json` | |

#### F3U. USED BY
- Callbacks: [C3. Authorisation Requirements Ruling](../callbacks/C3-auth-requirements-on-check.md)
- FHIR: [F1. Bundle](F1-bundle.md), [F2. CoverageEligibilityRequest](F2-coverage-eligibility-request.md), [F5. InsurancePlan](F5-insuranceplan.md), [F6. Questionnaire](F6-questionnaire.md), [F15. Patient](F15-patient.md)
- Database: [D9. claim](../database/D9-claim.md)
