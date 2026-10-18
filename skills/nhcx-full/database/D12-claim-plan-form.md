# D12. claim_plan_form

#### D12T. TABLE
One row is one payer questionnaire (dynamic form) shipped with a claim's package master; primary key `id`; parent table [D10. claim_plan](D10-claim-plan.md).

#### D12D. DESCRIPTION
The payer's InsurancePlan bundle carries Questionnaire resources: policy forms and standard-treatment-guideline (STG) checklists, PMJAY's "STQ", that a document requirement points at through its `documentationUrl`. Whose form it is comes from where the pointer sits ([F5. InsurancePlan](../fhir/F5-insuranceplan.md)): on the InsurancePlan or a `coverage[]` element it is a policy form ([D10](D10-claim-plan.md) `policy_documents`), on a package's `plan.specificCost` benefit it is that procedure's form ([D11](D11-claim-plan-benefit.md) `supporting_info`). The url never tells the two apart: a payer may publish every form as `/questionnaire/<owner>/<form id>` [PAYER](../references/PAYERS.md#markers). The payer sends the same form once for every benefit that needs it, so forms are collected by `url` and stored once per plan. Answers are stored per claim in [D17. claim_form_answer](D17-claim-form-answer.md), keyed by the same url (`form_url`).

Which forms a leg must carry (the one rule; F6, F7, A4, A5, S9 and S11 all follow it):
- **With a `ready` auth-requirements ruling ([D13](D13-claim-auth.md)), the ruling draws the line**: every form it names ([D15](D15-claim-auth-requirement.md) `form_url`, whatever its `Type`) is the pre-authorisation's, and every other form the master carries for the quoted packages and the policy is the claim's, answered at discharge. The payer asked for the first set before treating and will read the rest with the claim; the pre-authorisation leg therefore never carries a form the ruling did not name, except the scheme's consent form (below), and the claim leg never repeats a ruling-named form, except its own consent form.
- **Conditional forms** are offered only when they apply, on either leg: a questionnaire titled LAMA / Leaving Against Medical Advice or DAMA / Discharge Against Medical Advice only when that discharge type was recorded on the claim ([D20. claim_submission](D20-claim-submission.md) `discharge_mode`); a questionnaire titled Death only when the discharge is a death or the HMIS has the patient declared dead ([D3. patient](D3-patient.md) `deceased`). Until then they are not listed, so the desk is never asked to fill a form for something that did not happen [PAYER](../references/PAYERS.md#markers).
- **Without a ruling** (a payer that gives none, or before it arrives), the D11 stage rule decides, as below.
- Without a ruling: the quoted packages' own forms, named in `supporting_info[].form` of the quoted packages ([D11](D11-claim-plan-benefit.md)), their standard treatment guideline (STG) checklists, PMJAY's STQs, **classified by stage**: the pre-authorisation leg carries the forms whose `stage` is `pre`, the claim leg those whose `stage` is `post` (the stage rule is D11's; PMJAY files a pre-authorisation STQ and a claim STQ per package, and a form whose stage cannot be told is `pre`, offered at the pre-authorisation and again on the claim if it was not answered). PMJAY's ruling (C3) never names the STQ [PAYER](../references/PAYERS.md#markers); once a ruling is held, a package form it does not name moves to the claim leg (first bullet), so it is still carried.
- Without a ruling: the policy-wide forms named in the plan's `policy_documents[].form` ([D10](D10-claim-plan.md), the InsurancePlan's own and those pointed at from `coverage[]`) on the leg their stage names (the stored `stage`, else read from their title, `pre` when the title says nothing). A form answered earlier is offered again with the earlier answers filled in.
- When the payer requires proof of presence and no biometric token is held for the stage, the scheme's consent form for the stage (found by title in the master), whether or not anything lists it ([A18. Biometric Authentication](../apis/A18-biometric-authentication.md): Authentication Consent at pre-authorisation, Discharge Consent at the claim), is added to what the leg sends; a held token leaves it out of the send [PAYER](../references/PAYERS.md#markers).
- The other leg's consent form never shows on this leg. Forms are listed by title.
- Nothing is required unless the plan is `ready`.

Each question in `items` is a flattened Questionnaire item:
- `linkId` (this spelling, the FHIR name, never `link_id`: a parser that stores `link_id` leaves every screen reading `linkId` blank), `type`, `text` (the item's `prefix`, else its `text`), `required`.
- `depth`: nesting level, `0` for top-level items.
- `options`: `answerOption` `valueString`, else the valueCoding's display or code.
- `initial`: the first option marked `initialSelected`, the payer's default answer.

Lifecycle:
- Inserted when a plan reply is applied, after all the plan's earlier forms are deleted in the same transaction.
- Copied from another claim's `ready` plan when a master is reused.
- A refetch request does not delete forms. They are replaced when the reply is applied.
- Deleted with the plan (`ON DELETE CASCADE`).
- Never updated in place.

#### D12C. COLUMNS
| column | type | null/default | meaning (and allowed values) |
|---|---|---|---|
| id | INTEGER | primary key | row id |
| plan_id | INTEGER | NOT NULL | the package master ([D10](D10-claim-plan.md)) |
| url | TEXT | NOT NULL | Questionnaire.url; how requirements and answers name the form |
| form_id | TEXT | null | Questionnaire.id |
| title | TEXT | null | Questionnaire.title, else name, else url |
| kind | TEXT | null | the url path segment before the last one. `stgquestionnaire` marks an STG checklist (PMJAY's STQ) [PAYER](../references/PAYERS.md#markers); any other value is a form. It never says whether a form is the policy's or a procedure's (that is where it is pointed at from, above) |
| stage | TEXT | NOT NULL, default `pre` | `pre` (pre-authorisation) or `post` (claim), never both: the leg the form is answered on, read by D11's stage rule from the requirement that names it, the Questionnaire's `useContext` and its title. Added by migration |
| items | TEXT | NOT NULL | JSON list of questions `{linkId, type, text, required, depth, options, initial}` |

#### D12K. KEYS AND INDEXES
- Primary key `id` (integer).
- `plan_id` references [D10. claim_plan](D10-claim-plan.md) `id`, `ON DELETE CASCADE`.
- Unique index: `ux_claim_plan_form (plan_id, url)`.
- `url` is matched without a foreign key by [D15. claim_auth_requirement](D15-claim-auth-requirement.md) `form_url`, [D11](D11-claim-plan-benefit.md) `supporting_info[].form`, [D10](D10-claim-plan.md) `policy_documents[].form` and [D17. claim_form_answer](D17-claim-form-answer.md) `form_url`.

#### D12U. USED BY
- Screens: [S7. Insurance Plan](../screens/S7-insurance-plan.md), [S9. Pre-authorisation](../screens/S9-preauthorisation.md), [S11. Claim Submission](../screens/S11-claim-submission.md)
- APIs: [A3. Insurance Plan Request](../apis/A3-insurance-plan-request.md), [A17. Claim State](../apis/A17-claim-state.md)
- Callbacks: [C4. Insurance Plan Reply](../callbacks/C4-insuranceplan-on-request.md)
- FHIR: [F5. InsurancePlan](../fhir/F5-insuranceplan.md), [F6. Questionnaire](../fhir/F6-questionnaire.md), [F7. QuestionnaireResponse](../fhir/F7-questionnaireresponse.md)
- Database: [D10. claim_plan](D10-claim-plan.md), [D11. claim_plan_benefit](D11-claim-plan-benefit.md), [D15. claim_auth_requirement](D15-claim-auth-requirement.md), [D17. claim_form_answer](D17-claim-form-answer.md)
- Tests: [T13. PMJAY Eligibility, Package Master and Ruling](../tests/T13-pmjay-eligibility-and-package-master.md)
