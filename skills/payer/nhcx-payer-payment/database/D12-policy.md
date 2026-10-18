# D12. policy

#### D12T. TABLE
One row is one product the payer sells: what it covers and up to how much; primary key `id`. No parent table. The cover period belongs to the enrolment ([D6. subscription](D6-subscription.md)), not the product. The reference implementation names it `payer_policies` [REF](../references/PAYERS.md#markers).

#### D12D. DESCRIPTION
The product is what a plan request (C3. Insurance Plan Request (in nhcx-payer-coverage)) names and what the InsurancePlan ([F5. InsurancePlan](../fhir/F5-insuranceplan.md)) renders: this row for the identity, type and sum assured, with its children for the covered procedures ([D13. policy_procedure](D13-policy-procedure.md)), coverage clauses and benefits ([D14. policy_coverage_clause](D14-policy-coverage-clause.md), [D15. policy_clause_benefit](D15-policy-clause-benefit.md)), aliases ([D16. policy_alias](D16-policy-alias.md)), exclusions ([D17. policy_exclusion](D17-policy-exclusion.md)), sub-limits ([D18. policy_sub_limit](D18-policy-sub-limit.md)) and the policy's own forms (below).

**Biometric.** `require_biometric` says the product asks for proof of presence. When true, the InsurancePlan carries PMJAY's plan-level proof of identity (category `POI`, code `ADN`, Aadhaar number) and a hospital reading it authenticates the beneficiary, by biometric or OTP, before the pre-authorisation ([F5. InsurancePlan](../fhir/F5-insuranceplan.md)) [PAYER](../references/PAYERS.md#markers). Off by default: a plan asks for it only when the underwriter says so on S7. Policy Configurator (in nhcx-payer-coverage). Added by migration 0005.

**Policy forms.** The forms the product asks of every case, whatever the package (a consent, a declaration, a pre-existing disease history), are a child table, one row per form (the reference names it `payer_policy_questionnaires` [REF](../references/PAYERS.md#markers), migration 0003): `id` (the server-issued form id, `QNR-...` [REF](../references/PAYERS.md#markers), at most 24), `policy_id` (cascades with the policy), `title` (at most 300; unique per policy, `uq_policy_questionnaires_title`), `description` (at most 2000, null), `questions` (one JSON document: `[{text, type, required, options}]`, because the configurator edits a form whole and nothing queries inside one), `position` (index `idx_policy_questionnaires_order` on `(policy_id, position)`). Each is published at `/questionnaire/<policy id>/<form id>` and pointed at from `coverage[0].extension` ([F5. InsurancePlan](../fhir/F5-insuranceplan.md), [F6. Questionnaire](../fhir/F6-questionnaire.md)). A procedure's own forms are on the procedure ([D10. procedure_rule](D10-procedure-rule.md)), not here.

Finding the product a hospital means (A2. Insurance Plan Answer (in nhcx-payer-coverage)): by `id`, by `uin`, by an alias, or by the enrolment id an eligibility answer handed out (which resolves through [D6. subscription](D6-subscription.md) to the person's own cover). A code that names a retired product resolves to the default product the enrolments were moved onto [SANDBOX](../references/PAYERS.md#markers); a code matching nothing is answered with an empty plan, not refused.

Create:
- From the Policy Configurator (S7. Policy Configurator (in nhcx-payer-coverage)) through `POST policies`. `id` is `POL` plus the filing day code and a three-character counter that restarts each day, in the sortable base32 alphabet, for example `POL7UMV001` [REF](../references/PAYERS.md#markers). `type_code` and `plan_type_code` come from the value sets in [D4. terminology_code](D4-terminology-code.md); `total_assured` must be positive. The children are written in the same transaction.

Update:
- `PATCH policies/:id`: the columns here and every child list, the forms included, replaced whole; a form keeps its id across saves.
- The default product every account sees is read-only for everyone and cannot be removed [SANDBOX](../references/PAYERS.md#markers).

Statuses (`status`): `draft`, `active`, `retired`, `unknown`. Only the product's filing state; an enrolment's own `status` says whether cover is in force.

Delete:
- Soft: `deleted_at` set. Refused while anybody is still enrolled on it ("still referenced").

#### D12C. COLUMNS
| column | type | null/default | meaning (and allowed values) |
|---|---|---|---|
| id | CITEXT, at most 24 | primary key | `POL<day code><counter>` [REF](../references/PAYERS.md#markers); `InsurancePlan.identifier` |
| name | VARCHAR(200) | NOT NULL | the product's name |
| uin | CITEXT, at most 64 | null | IRDAI's Unique Identification Number for the filed product; null while a plan is configured before it is filed |
| status | VARCHAR(32) | NOT NULL, default `'active'` | `draft`, `active`, `retired`, `unknown` |
| type_code | VARCHAR(64) | NOT NULL, default `'01'` | ndhm-insuranceplan-type code ([D4. terminology_code](D4-terminology-code.md)) |
| plan_type_code | VARCHAR(64) | NOT NULL, default `'01'` | ndhm-plan-type code: individual, floater, group ([D4. terminology_code](D4-terminology-code.md)) |
| total_assured | NUMERIC(14,2) | NOT NULL | the sum assured; the opening wallet of an enrolment |
| require_biometric | BOOLEAN | NOT NULL, default false | the plan asks for proof of presence: the InsurancePlan carries POI / ADN (migration 0005) |
| owner_client_id | CITEXT, at most 64 | null | the sign-up account that filed it; empty is shared [SANDBOX](../references/PAYERS.md#markers) |
| created_at | TIMESTAMPTZ | NOT NULL, default now | |
| updated_at | TIMESTAMPTZ | NOT NULL, default now | bumped by trigger |
| deleted_at | TIMESTAMPTZ | null | set when retired |

#### D12K. KEYS AND INDEXES
- Primary key `id`.
- Checks: `ck_policies_status`; `ck_policies_assured` (`total_assured > 0`); `ck_policies_id_len` (at most 24); `ck_policies_uin_len` (at most 64); `ck_policies_owner_len`.
- Indexes: `idx_policies_live_name` on `(deleted_at, name)`; `idx_policies_owner` on `owner_client_id`.
- Referenced by [D13. policy_procedure](D13-policy-procedure.md), [D14. policy_coverage_clause](D14-policy-coverage-clause.md), [D16. policy_alias](D16-policy-alias.md), [D17. policy_exclusion](D17-policy-exclusion.md), [D18. policy_sub_limit](D18-policy-sub-limit.md) and the policy forms table (`ON DELETE CASCADE`) and by [D6. subscription](D6-subscription.md) `policy_id` (`ON DELETE RESTRICT`).

#### D12U. USED BY
- Screens: [S1. Overview](../screens/S1-overview.md)
- FHIR: [F4. Task (InsurancePlan request)](../fhir/F4-task-insuranceplan.md), [F5. InsurancePlan](../fhir/F5-insuranceplan.md), [F6. Questionnaire](../fhir/F6-questionnaire.md), [F9. ClaimResponse](../fhir/F9-claimresponse.md), [F10. Task (claim actions and answers)](../fhir/F10-task-claim-actions.md), [F18. Coverage](../fhir/F18-coverage.md)
- Database: [D4. terminology_code](D4-terminology-code.md), [D6. subscription](D6-subscription.md), [D10. procedure_rule](D10-procedure-rule.md), [D13. policy_procedure](D13-policy-procedure.md), [D14. policy_coverage_clause](D14-policy-coverage-clause.md), [D16. policy_alias](D16-policy-alias.md), [D17. policy_exclusion](D17-policy-exclusion.md), [D18. policy_sub_limit](D18-policy-sub-limit.md)
