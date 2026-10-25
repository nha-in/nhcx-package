# D11. claim_plan_benefit

#### D11T. TABLE
One row is one package (or covered benefit) under one category in a claim's package master; primary key `id`; parent table D10. claim_plan (in nhcx-coverage).

#### D11D. DESCRIPTION
The InsurancePlan comes in one of two shapes, and both flatten to this table:
- Approach 1, package master: `plan -> specificCost -> category -> benefit -> cost`.
- Approach 2, indemnity: `coverage -> benefit -> limit`.

When a bundle carries both, they are merged on the pair **(category `category_code`, package `code`)**, never on the code alone. `specificCost` wins, and `coverage` adds only pairs it did not carry. A payer lists the same package under several categories: PMJAY lists Dengue (`MG004A`, `MG004B`, `MG004C`) under Cardiology (`MC`), General Medicine (`MG`) and Paediatric medical management (`MP`), and repeats 545 of its 1,537 codes across categories [PAYER](../references/PAYERS.md#markers). Each such listing is one row, so a code can appear more than once per plan but a pair at most once. A parser that keeps the first listing of a code shows Dengue under Cardiology only and loses the category the case is treated under.

Approach 1 row:
- `category_*` from `specificCost.category`; `code` / `display` from `benefit.type`.
- The cost typed `Procedure` is `rate` / `currency`, and `cost_type` is then `Procedure`.
- Every other cost (`Stratification`, `Implant` [PAYER](../references/PAYERS.md#markers)) goes into `extras` as `{type, code, label, rate, currency}`, `code` and `label` taken from its first qualifier.
- `kind` is `Procedure` when a rate was found. Otherwise it is `Implant` when one of its extras is an `Implant`, else null.
- `conditions` merges the plan-level and benefit-level claim conditions. `supporting_info` is the plan-level plus benefit-level document requirements; a form pointed at from the benefit is that procedure's own form.

Approach 2 row:
- `category_*` from `coverage.type`.
- The limit whose code is empty or equal to the benefit code is `rate` / `currency`; the other limits go into `extras` as `{type: "Limit", code, label, rate, currency}`.
- `kind` is `Implant` when the code was named as an implant qualifier under Approach 1. Otherwise the row is a package only when the payer names it as one, by giving the benefit its own `id` (PMJAY's master does, for its coverage-only packages [PAYER](../references/PAYERS.md#markers)): `kind` `Procedure`. A benefit with no `id` is a bare cover benefit of the policy (Blood, ICU, Oxygen, Organ donor, Ambulance: SNOMED CT coded limits): `kind` `Benefit`.
- `cost_type` and `requirement` are `benefit.requirement`.
- `conditions` / `supporting_info` merge the coverage-level and benefit-level ones, except that a coverage-level requirement pointing at a form is a policy form: it goes to D10. claim_plan (in nhcx-coverage) `policy_documents` and never onto the packages under that coverage (F5. InsurancePlan (in nhcx-preauth)).
- A pair `specificCost` already carried is not a second row: it takes from the coverage benefit only what it lacks (conditions, document requirements, the category).

`rate = 0` means bundled, not free [PAYER](../references/PAYERS.md#markers). A null `rate` means the benefit has no package rate of its own. **A line's price is open** (the desk types it, S8.1) only when the row names no rate, or names `0` and has no `Stratification` extra; a `0` rate with ward or ICU tiers is a fixed price made up of its tiers, and the desk cannot type over it.

Lifecycle:
- Inserted when a plan reply is applied, numbered `seq` 1, 2, ... in merge order. All earlier rows of the plan are deleted first, in the same transaction.
- Copied from another claim's `ready` plan when a master is reused (A3. Insurance Plan Request (in nhcx-preauth)), in one bulk insert.
- Deleted when the plan is refetched (the request deletes them at once) or when the plan row is deleted (`ON DELETE CASCADE`).
- Never updated in place.

**Quotable.** A row is quotable as a line only when `kind` is `Procedure` or `Implant`. A `Benefit` row (a cover benefit such as Blood or Ambulance) and a row with no `kind` (a package-master benefit with neither a rate nor an implant tier) are shown in the plan but are never a line, and are not counted in the line search's Category list [PAYER](../references/PAYERS.md#markers). Quoting a cover benefit put SNOMED CT `87612001` "Blood" on a pre-authorisation as an item.

Reads:
- The line picker filters by `category_code` (the desk's "Category"; "All" by default), `kind` ("All", `Procedure`, `Implant`), and `code` or `display` LIKE the search text (2 letters or more), ordered by `seq`. Its Category list holds only categories with a quotable row, each counted by its quotable rows; the plan summary keeps the full list, counted by every row. The package detail is read by the row's `id`; the add call names the row by its `kind` and the pair (`category_code`, `code`), never by `code` alone.
- An implant tier in `extras` is joined back to the benefit with the same `code` in the same category. The packages that allow an implant are found by searching `extras` for its code.
- The price of a claim line ([D16](D16-claim-line.md)) is read from here, never from the form. The line keeps the category it was picked under (`category_code`), and readers that need one row per quoted code take the row of the line's category, else the first.
- The claim state ([A17. Claim State](../apis/A17-claim-state.md)) lists every column but `conditions` and `supporting_info`; the package detail (S7.1 (in nhcx-preauth), `GET claims/:caseid/plan/benefits/:id`) returns the whole row, those two included, so the tiers, conditions and documents a package carries are what the screens show.
- Without a ruling, `supporting_info` of the quoted codes lists the documents (entries with a `code` other than `STG` [PAYER](../references/PAYERS.md#markers) and no `form`) and the forms (entries with a `form`) the leg needs: those whose `stage` is the leg's (`pre` for the pre-authorisation, `post` for the claim); the claim also lists any `pre` document not attached at the pre-authorisation.
**Stage of a requirement (pre or post, never both).** Every document or form the payer asks for belongs to exactly one leg: `pre` (the pre-authorisation) or `post` (the claim, after discharge). There is no third value: a requirement is wanted at one of the two stages, and a payer that wants the same document on both legs names it twice, once per stage, and PMJAY's own portal files its STG checklists the same way, as a pre-authorisation STQ and a claim STQ ("STQ", standard treatment questionnaire, is PMJAY's name for the STG checklist; this skill writes STG/STQ) [PAYER](../references/PAYERS.md#markers). The stage is read once, when the master or the ruling is applied, in this order, and stored (`supporting_info[].stage` here, D12 `stage`, D15 `stage` and `at_preauth`):
0. The leg named in the requirement extension's own url: the sandbox payer writes `.../<package>/preauth/<code>` and `.../<package>/claim/<code>` under `Claim-SupportingInfoRequirement`, and the live PMJAY provider reads `/preauth/` as `pre` and `/claim/` as `post` from that url before anything else [PAYER](../references/PAYERS.md#markers).
1. The payer's own word when it gives one: the ruling's `Type:` ([D15. claim_auth_requirement](D15-claim-auth-requirement.md)), a `stage`, `Type` or `useContext` child on the requirement or the Questionnaire. `pre`, `preauth`, `pre-auth`, `pre-authorisation`, `admission` read as `pre`; `post`, `claim`, `discharge`, `final`, `settlement` read as `post`.
2. Otherwise the requirement's own wording, its display and the questionnaire's title, as whole words, case ignored: `pre`, `preauth` / `pre-auth` / `pre auth`, `pre-authorisation`, `admission` or `before` names the pre-authorisation; `post`, `discharge`, `intra`, `during`, `after`, `final bill`, `hospital bill`, `bill`, `invoice`, `settlement`, `lama`, `dama`, `death` or `mortality` names the claim (a bill, a leaving or discharge against advice and a death are known only at discharge). Only wording that names the claim and not the pre-authorisation gives `post`; wording that names both, or neither, goes on to step 3 (PMJAY's masters name "Post procedure photograph", "Intra operative photograph", "Discharge summary" and "Final bill" without a structured stage [PAYER](../references/PAYERS.md#markers)).
3. Otherwise `pre`: an unclassified requirement is asked for at the pre-authorisation, the earlier leg, and the claim lists it again if it was not attached then, so nothing is dropped. (Before 1.7.0 this case was a third value, `both`; a stored `both` is read as `pre`.)
**Stored as `pre` or `post` only.** `supporting_info[].stage`, D12 `stage` and D15 `stage` hold one of these two words and nothing else. A writer that files `preauth`, `claim`, `discharge` or a blank (a test seed, an older row) is read through step 1 (`preauth` is `pre`; `claim` and `discharge` are `post`; blank is step 3) and corrected on the next write; a stored word is never compared with the leg's word raw. A reader that compared a stored `claim` with `post` matched neither leg and dropped the form; a seed that wrote codes with no display and no stage left every PMJAY document `pre` [SANDBOX](../references/PAYERS.md#markers). Every writer of these three places, the test seed included, runs the rule above on write.

The classification is a chip on every requirement table (S7.1, S8.2, S9, S11): "Pre-auth" or "Post (claim)", one of the two. The pre-authorisation leg offers `pre`; the claim leg offers `post`, and any `pre` document not yet attached. It is a reading aid and a default, not a gate: a desk may still attach any document on either leg. On the leg's own documents and forms (S9, S11) the chip stays hidden until the authorisation-requirements ruling ([D13](D13-claim-auth.md)) has been asked.


#### D11C. COLUMNS
| column | type | null/default | meaning (and allowed values) |
|---|---|---|---|
| id | INTEGER | primary key | row id |
| plan_id | INTEGER | NOT NULL | the package master (D10 (in nhcx-coverage)) |
| seq | INTEGER | NOT NULL, default `1` | order in the plan |
| category_code | TEXT | null | category or coverage type code |
| category_display | TEXT | null | its display |
| code | TEXT | NOT NULL | package or benefit code |
| display | TEXT | null | package name |
| kind | TEXT | null | what the code names: `Procedure` or `Implant` (quotable), `Benefit` (a cover benefit of the policy, never a line), or null. Added by migration |
| rate | REAL | null | package rate; `0` means bundled |
| currency | TEXT | null | currency or unit of the rate, for example `INR` |
| cost_type | TEXT | null | `Procedure` (Approach 1 with a rate) or Approach 2 `benefit.requirement` |
| requirement | TEXT | null | Approach 2 `benefit.requirement` |
| conditions | TEXT | null | JSON object: claim-condition name to value, for example `{"IsDayCare": "Y"}` |
| extras | TEXT | null | JSON list of tiers paid over the rate: `{type, code, label, rate, currency}`, `type` one of `Stratification`, `Implant`, `Limit`. Added by migration |
| supporting_info | TEXT | null | JSON list of document requirements: `{code, display, category, category_display, form, stage}`, where `form` is the Questionnaire url when the requirement is a form and `stage` is `pre` or `post` (the rule above; a `both` stored before 1.7.0 reads as `pre`). Added by migration |

#### D11K. KEYS AND INDEXES
- Primary key `id` (integer).
- `plan_id` references D10. claim_plan (in nhcx-coverage) `id`, `ON DELETE CASCADE`.
- Unique: `(plan_id, category_code, code)`. The same code under another category is another row.
- Index: `ix_claim_plan_benefit (plan_id, seq)`.
- `supporting_info[].form` names a [D12. claim_plan_form](D12-claim-plan-form.md) `url` (no foreign key).

#### D11U. USED BY
- Screens: [S11. Claim Submission](../screens/S11-claim-submission.md)
- APIs: [A17. Claim State](../apis/A17-claim-state.md)
- FHIR: [F3. CoverageEligibilityResponse](../fhir/F3-coverage-eligibility-response.md), [F8. Claim](../fhir/F8-claim.md)
- Database: [D12. claim_plan_form](D12-claim-plan-form.md), [D15. claim_auth_requirement](D15-claim-auth-requirement.md), [D16. claim_line](D16-claim-line.md), [D28. claim_document](D28-claim-document.md)
