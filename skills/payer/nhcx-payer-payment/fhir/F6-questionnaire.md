# F6. Questionnaire

#### F6R. RESOURCE
`Questionnaire`, `status: active`, inside the InsurancePlan bundle (F5), one per published form. Direction: sent by A2. Insurance Plan Answer (in nhcx-payer-coverage). A procedure's forms are also pointed at from an `auth-requirements` ruling (F3) as `fullUrl: <url>`, so a hospital that never fetched the plan still learns which forms to answer. No profile is declared [REF](../references/PAYERS.md#markers). The hospital's answers come back as F7.

#### F6D. DESCRIPTION
A form the payer wants filled. There are two owners and one shape:

- **A policy form** ([D12. policy](../database/D12-policy.md) questionnaires, set on S7. Policy Configurator (in nhcx-payer-coverage)): asked of every case on the product, whatever the package; a consent, a declaration, a pre-existing disease history.
- **A procedure form** ([D10. procedure_rule](../database/D10-procedure-rule.md) `questionnaires`, set on S9. Procedure Configurator (in nhcx-payer-coverage)): asked of every case quoting that procedure; a clinical history, findings, fitness for surgery. It belongs to the registry entry, so one form serves every product that covers the procedure.

Both are a title, an optional description ("shown to the hospital above the questions") and a list of typed questions, and both render the same way. They replace the standard treatment guideline (STG) questionnaire, which is no longer published: no `STG` code, no `/stgquestionnaire/` path, no form built from the documents a procedure wants [REF](../references/PAYERS.md#markers).

**The url.** `<payer base>/questionnaire/<owner>/<form id>`, the owner being the policy id or the procedure code, the form id the one the server issued when the form was first saved (`QNR-...`, or `form-<n>` for a form saved without one). Keying on the form id rather than the title means a retitled form keeps its url and the answers already filed against it. The url is only an address: it never tells a policy form from a procedure form, and `name` is `Questionnaire` for both. A hospital tells them apart by where the pointer sits on the plan: under `coverage[0].extension` for a policy form, under the package's `plan.specificCost` benefit for a procedure form (F5). The resource `id` is a deterministic UUID v5 of `Questionnaire/<policy id>/<form id>` or `Questionnaire/procedure/<procedure id>/<form id>` [REF](../references/PAYERS.md#markers).

**Items.** One per question with wording, in order: `linkId` `<form id>/<n>` counting from 1 (stable: answers come back under it), `text` the question, `type` the question's type (`string` when none was saved), `required` as configured, and for a `choice` one `answerOption.valueString` per non-blank answer. The types a form may ask in are the ones a hospital's form builder can render: `string`, `text`, `boolean`, `choice`, `date`, `dateTime`, `integer`, `decimal`, `attachment` (S7. Policy Configurator (in nhcx-payer-coverage) lists the labels).

**What is not published.** A form with no question that has wording is skipped and reported on the render ("Questionnaire "`<title>`" on `<owner>` asks no question, so it is not published. Give it a question, or remove it."); the configurator refuses to save one, so one here was edited behind its back. A procedure form of a procedure with no package rate is not published either, because the procedure has no `plan.specificCost` entry to point at it from (F5).

**Carried over.** When the procedure forms arrived, each procedure's old guideline questions were moved into one form of its own, id `clinical-details`, title "Clinical details", one required `string` question per old question; the old `stg_questions` column is kept and no longer read ([D10. procedure_rule](../database/D10-procedure-rule.md)).

#### F6F. FIELDS
| Element written | From | Notes |
|---|---|---|
| `id` | UUID v5 of the owner and the form id | deterministic |
| `meta.versionId` | `1` | |
| `url` | `<payer base>/questionnaire/<D12.id or D10.code>/<form id>` | the key the answer (F7), the pointer (F5) and the ruling (F3) name |
| `name` | `Questionnaire` | constant, for policy and procedure forms alike |
| `title` | the form's title | |
| `description` | the form's description | when set |
| `status` | `active` | |
| `item[].linkId` | `<form id>/<n>` | |
| `item[].text` | the question, trimmed | |
| `item[].type` | the question's type, else `string` | |
| `item[].required` | the question's required flag | |
| `item[].answerOption[].valueString` | the answers on offer | `choice` only |
| bundle entry `fullUrl` | the `url` | after the InsurancePlan and the Organization |

#### F6U. USED BY
- FHIR: [F1. Bundle](F1-bundle.md), [F4. Task (InsurancePlan request)](F4-task-insuranceplan.md), [F5. InsurancePlan](F5-insuranceplan.md)
- Database: [D10. procedure_rule](../database/D10-procedure-rule.md), [D12. policy](../database/D12-policy.md), [D13. policy_procedure](../database/D13-policy-procedure.md)
