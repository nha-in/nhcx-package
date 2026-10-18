# F5. InsurancePlan

#### F5R. RESOURCE
`InsurancePlan`, `meta.profile` `https://nrces.in/ndhm/fhir/r4/StructureDefinition/InsurancePlan`, in a bundle profiled `.../InsurancePlanBundle` (F1). Direction: sent on `v1/insuranceplan/on_request` by [A2. Insurance Plan Answer](../apis/A2-insurance-plan-answer.md), answering [C3. Insurance Plan Request](../callbacks/C3-insurance-plan-request.md) on the request's correlation id. Entries: the InsurancePlan at `urn:uuid:<plan id>`, the payer Organization (F17) at `urn:uuid:<org id>`, then one Questionnaire (F6) per published form, the priced procedures' forms first and the policy's after, each at its canonical `url`.

Extensions written: `https://nrces.in/ndhm/fhir/r4/StructureDefinition/Claim-Condition`, `.../Claim-Exclusion`, `.../Claim-SupportingInfoRequirement`.

#### F5D. DESCRIPTION
One product ([D12. policy](../database/D12-policy.md)) rendered as the plan a hospital reads into its package master. When the request named an enrolment (the subscription id an eligibility answer handed out), the plan is that person's cover: the period and plan type come from [D6. subscription](../database/D6-subscription.md). Without one it is the product on offer: the period is the calendar year of today, and the render notes that it was assumed [REF](../references/PAYERS.md#markers).

**Two trees, both written.** The hospital reads `plan[].specificCost[]` first and `coverage[]` for whatever it did not carry, merged on the pair (category code, package code) (the provider skill's rule, so a package listed under several specialities is written once per speciality), so this payer writes the priced procedures in both places with the same benefit `id` [PAYER](../references/PAYERS.md#markers):

- `coverage[]`: one entry per SNOMED coverage clause ([D14. policy_coverage_clause](../database/D14-policy-coverage-clause.md)) with its benefits ([D15. policy_clause_benefit](../database/D15-policy-clause-benefit.md)) and limits, then one entry per procedure category ([D10. procedure_rule](../database/D10-procedure-rule.md)) holding one benefit per covered procedure ([D13. policy_procedure](../database/D13-policy-procedure.md)). A clause with no benefits is written as a benefit of itself, because `coverage.benefit` is 1..*.
- `plan[0]`: `identifier` the product name (`use: official`), `type` the plan type (`https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-plan-type`), `generalCost[0].cost` the sum assured, then `specificCost[]`: one per sub-limit ([D18. policy_sub_limit](../database/D18-policy-sub-limit.md)) with a cost typed `fullcoverage`, and one per procedure category whose benefits are the **priced** procedures with a cost typed `Procedure` ("Selected treatment or service or product is a type of procedure or package", ndhm-plan-type). A procedure without a package rate is listed under `coverage[]` only and never priced [REF](../references/PAYERS.md#markers).

**A procedure benefit** (`coverage[].benefit[]` and `plan[].specificCost[].benefit[]` alike): `id` the package code, `type` the code in the payer's own system `<base>/CodeSystem/procedure` with the SNOMED and ICD-10-PCS codings beside it when the registry holds them, and these extensions as siblings:
1. one `Claim-Condition` (element `id` `<package>/Claim-Condition`) with sub-extensions `ProcedureType` (the category), `IsDayCare` (`Y` when the category is Day Care) and `ImplantApplicable` (`Y` when a required document is filed under the NDHM implant category `IMP`), each at url `<Claim-Condition>/<name>` with `id` `<package>/<name>`; nothing else is asserted, because an unrecorded condition written as `N` would invent a rule [REF](../references/PAYERS.md#markers);
2. the document requirements in PMJAY's package-master shape [PAYER](../references/PAYERS.md#markers): **one** `Claim-SupportingInfoRequirement` (url the bare extension url, `id` `<package>/Claim-SupportingInfoRequirement`) holding one child per required document ([D11. procedure_rule_doc](../database/D11-procedure-rule-doc.md), `required` true only), each child at url `<Claim-SupportingInfoRequirement>/<package>/<leg>/<doc code>` with two children of its own: `category` (the document type's NDHM supporting-information category, `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category`) and `code` (the document code and name on `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code`, [D3. document_type](../database/D3-document-type.md)), their element ids `<package>/<leg>/<doc code>/category` and `.../code`. The leg segment is `preauth` for phase `preauth` and `claim` for phases `discharge` and `claim`, because a hospital reader tells a pre-authorisation document from a claim one by that segment and the discharge documents are due with the claim; a document named twice on one leg is written once. A document type with no category is left out and reported. A procedure that demands nothing gets no requirement extension at all;
3. **on the `plan[].specificCost[]` benefit only**, one form pointer per procedure form (F6): a `Claim-SupportingInfoRequirement` at url `<Claim-SupportingInfoRequirement>/<package>/<form id>`, element `id` `<package>/<form id>`, with children `category` `INF` "Additional info related to claim", `code` `ODN` "Other document" (on `ndhm-supportinginfo-code`) and `documentationUrl` a `valueReference` to the Questionnaire's url with the form's title as display. The pointer is never repeated under `coverage[]`: a pointer under coverage is a policy form.

A procedure **without a package rate** has no `plan.specificCost` entry, so its forms have nowhere to be pointed at from: they are **not published**, and the render reports it ("Procedure `<code>` has questionnaires but no package rate, so it has no entry under plan.specificCost to carry them and they are not published. Set a rate.") beside the usual note that the procedure is listed without a price.

**Policy forms.** The forms the product asks of every case ([D12. policy](../database/D12-policy.md) questionnaires, set on [S7. Policy Configurator](../screens/S7-policy-configurator.md)) are pointed at from **`coverage[0].extension`**, the first coverage entry, which is the policy-wide part of the plan: one pointer each, the same shape as a procedure's (category `INF`, code `ODN`, `documentationUrl`), at url `<Claim-SupportingInfoRequirement>/plan/<form id>` with element `id` `plan/<form id>`. A plan with no coverage at all carries no policy form pointer. A hospital reading the plan treats a form pointed at from coverage as a policy form, asked whatever the package, and never as one of the packages listed under that coverage [PAYER](../references/PAYERS.md#markers).

**The url never says which.** Every form, the policy's and the procedure's alike, is published at `<payer base>/questionnaire/<owner>/<form id>` (owner the policy id or the procedure code) and named "Questionnaire" (F6). Nothing in the url or the name tells a policy form from a procedure form; only where the pointer sits does.

**Root extensions.** One `Claim-Exclusion` per exclusion ([D17. policy_exclusion](../database/D17-policy-exclusion.md)): `category` the exclusion code (`https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-claim-exclusion`), `statement` the wording, and `item` the one SNOMED concept it names when there is one. Then, **only when the product requires biometric authentication** ([D12. policy](../database/D12-policy.md) `require_biometric`, a per-policy setting on [S7. Policy Configurator](../screens/S7-policy-configurator.md)), PMJAY's plan-level proof of identity [PAYER](../references/PAYERS.md#markers): one `Claim-SupportingInfoRequirement` with element `id` `NHCXProofOfIdentity` and two children, `SupportInfoCategory` (`POI` "Proof of identity" on the supporting-info category system) and `SupportInfoCode` (`ADN` "Aadhaar Number" on `ndhm-supportinginfo-code`). A hospital reading it authenticates the beneficiary (biometric or OTP) before the pre-authorisation. A product that does not require it carries no POI/ADN requirement, so a hospital is never sent to authenticate for nothing.

**No treatment-guideline form.** The standard treatment guideline (STG) questionnaire is no longer published: there is no `STG` requirement, no `/stgquestionnaire/` path and no form built from a procedure's documents. A procedure's clinical questions are its own forms (F6).

**The empty plan.** A request naming a product this payer does not file is answered, not refused: a bundle carrying the payer Organization and no InsurancePlan, because the IG allows an empty plan and silence would leave the hospital polling ([A2. Insurance Plan Answer](../apis/A2-insurance-plan-answer.md)). A retired product's code answers with the default policy the enrolments were moved onto [REF](../references/PAYERS.md#markers).

**Issues.** The render reports where the data fell short of the profile (no UIN, no coverage at all, a code with no display) as a list beside the bundle, shown on the FHIR preview ([S11. FHIR Preview](../screens/S11-fhir-preview.md)); the bundle still goes.

#### F5F. FIELDS
| Element written | From | Notes |
|---|---|---|
| `id` | UUID v5 of `InsurancePlan/<D12.id>` | deterministic [REF](../references/PAYERS.md#markers) |
| `meta.versionId`, `meta.profile[0]` | `1`, the InsurancePlan profile | |
| `identifier[0]` | `system` `https://irdai.gov.in`, `value` `D12.uin`; without a UIN, `value` `D12.id` and a warning | |
| `status` | `D12.status` | `draft`, `active`, `retired` |
| `type[0].coding[0]` | `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-insuranceplan-type`, `D12.type_code`, display from [D4. terminology_code](../database/D4-terminology-code.md) | |
| `name` | `D12.name` | |
| `alias[]` | `D16.alias` | |
| `period` | `D6.pstart`, `D6.pend`; else the calendar year | |
| `ownedBy`, `administeredBy` | `urn:uuid:<org id>`, display `D1.name` | one Organization does both; a TPA points `administeredBy` elsewhere [REF](../references/PAYERS.md#markers) |
| `extension[]` (`Claim-Exclusion`) | `D17.code`, `.statement`, `.item_snomed_code`, `.item_display` | |
| `extension[]` (`NHCXProofOfIdentity`) | `POI` / `ADN` | only when `D12.require_biometric` |
| `coverage[].type` | SNOMED `D14.snomed_code` / `.display`, or `<base>/CodeSystem/procedure-category` `D10.category` | |
| `coverage[].extension[]` (`Claim-Condition`, child `claim-condition`) | `D14.claim_condition` | when set |
| `coverage[0].extension[]` (form pointers) | one per policy form: `INF`, `ODN`, `documentationUrl` the F6 url | policy forms only |
| `coverage[].benefit[].type` | SNOMED `D15.snomed_code` / `.display`, or the procedure concept | |
| `coverage[].benefit[].limit[0].value` | `D15.limit_value`, `.limit_comparator`, `.limit_unit` | when set |
| `coverage[].benefit[].id` | `D10.code` | procedure benefits only |
| `coverage[].benefit[].extension[]` | the conditions and the nested document requirements above | procedure benefits only; never a form pointer |
| `plan[0].identifier[0]` | `use` `official`, `value` `D12.name` | |
| `plan[0].type` | `D6.plan_type_code`, else `D12.plan_type_code` | ndhm-plan-type |
| `plan[0].generalCost[0].cost` | `D12.total_assured`, `INR` | |
| `plan[0].specificCost[]` (sub-limits) | `category` and `benefit[0].type` SNOMED `D18.snomed_code` / `.display`; `cost[0].type` `fullcoverage`, `value` `D18.amount` unit `INR` | |
| `plan[0].specificCost[]` (procedures) | `category` the procedure category; `benefit[]` per priced procedure with the same `id`, `type` and extensions as under `coverage[]`, then the procedure's form pointers; `cost[0].type` `Procedure` (ndhm-plan-type), `value` `D10.package_rate` unit `INR` | the only place a procedure form is pointed at from |
| Questionnaire entries | F6, one per published form: each priced procedure's forms, then the policy's | at `fullUrl` = the Questionnaire's `url` |

#### F5U. USED BY
- Screens: [S7. Policy Configurator](../screens/S7-policy-configurator.md), [S8. Procedures](../screens/S8-procedures.md), [S9. Procedure Configurator](../screens/S9-procedure-configurator.md)
- APIs: [A2. Insurance Plan Answer](../apis/A2-insurance-plan-answer.md)
- FHIR: [F1. Bundle](F1-bundle.md), [F3. CoverageEligibilityResponse](F3-coverage-eligibility-response.md), [F4. Task (InsurancePlan request)](F4-task-insuranceplan.md), [F6. Questionnaire](F6-questionnaire.md), [F11. CommunicationRequest](F11-communicationrequest.md), [F17. Organization](F17-organization.md)
- Database: [D4. terminology_code](../database/D4-terminology-code.md), [D10. procedure_rule](../database/D10-procedure-rule.md), [D11. procedure_rule_doc](../database/D11-procedure-rule-doc.md), [D12. policy](../database/D12-policy.md), [D13. policy_procedure](../database/D13-policy-procedure.md), [D14. policy_coverage_clause](../database/D14-policy-coverage-clause.md), [D15. policy_clause_benefit](../database/D15-policy-clause-benefit.md), [D16. policy_alias](../database/D16-policy-alias.md), [D17. policy_exclusion](../database/D17-policy-exclusion.md), [D18. policy_sub_limit](../database/D18-policy-sub-limit.md)
- Tests: [T5. Insurance Plan Served](../tests/T5-insurance-plan-served.md)
