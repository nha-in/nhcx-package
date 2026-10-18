# D16. claim_line

#### D16T. TABLE
One row is one line the pre-authorisation quotes from the payer's package master: a procedure, an implant or a ward / ICU stratification tier. Primary key `id`. Parent table: `claim` (D9).

#### D16D. DESCRIPTION
The lines are the procedure set of the case. Every line is quoted from the payer's insurance plan: there are no custom line items, and the open rate (below) is the only price the desk types. They are chosen on the Line items card of the Pre-authorisation tab (S8) only once the plan (D10) is `ready` (else "Fetch the payer's insurance plan first, the preauth quotes its packages and its rates."); the price always comes from the plan (D11), never from the form. Only a quotable D11 row (`kind` `Procedure` or `Implant`) can be a line; a cover benefit (`kind` `Benefit`) or a row with no kind never can.

**Refused before any write**, in this order (each on add, update and remove where it applies):
- once the claim is with the payer, the pre-authorisation is read only ([CORE.md](../references/CORE.md) Instruction 14, [A4. Pre-auth Submit](../apis/A4-preauth-submit.md)): "The claim has gone to the payer, so the pre-authorisation is read only: no enhancement or change can be made. It can only be cancelled while the payer is deciding the claim."
- a posted kind other than `Procedure`, `Implant` or `Stratification`: "That is not something a preauth can quote."
- no code: "Nothing was selected."
- no `ready` plan: "Fetch the payer's insurance plan first, the preauth quotes its packages and its rates."

**Created.** Picking a match in the Code type-ahead (S8) inserts one row:

- `Procedure` or `Implant`: the code must be a D11 benefit of that `kind` **under the posted category** in the claim's plan (the pair (`category_code`, `code`) names the row, since a code is listed under several categories [PAYER](../references/PAYERS.md#markers)). `display`, `category_code`, `category_display` and `unit_price` (the benefit's `rate`; 0 when the price is open, for the desk to type) are copied from it. No row of that kind with the code: "<code> is not a <kind> in this plan." (with a category posted: "<code> is not a <kind> in this plan under <category>."). The code is on the plan, but not under the posted category: "<code> is not listed under <category> in this plan." No category posted and the code listed under several: "Pick the speciality this package is quoted under: <code> is listed under <category names, comma separated>." (`<kind>` is lower-cased.)
- `Stratification`: the tier is resolved through the procedure it is quoted with (`parent_code`), because different procedures price the same ward differently [PAYER](../references/PAYERS.md#markers). No parent: "Pick the procedure this ward tier belongs to." The tier must appear in that procedure's `extras` with type `Stratification` (else "That ward tier is not offered for this package."); its `label` becomes `display` and its `rate` becomes `unit_price`. The category is the parent procedure's.
- `seq` is the claim's highest `seq` plus 1, `quantity` is 1 and `amount` is `unit_price` rounded to 2 places. Flash: "<code> added."
- Adding a code already on the claim under the same kind and category: refused ("<code> is already on this preauth.") unless the package is **cyclic**, one the payer bills per cycle or session (the plan's conditions mark it, or the adapter lists it, [PAYERS.md](../references/PAYERS.md)) [PAYER](../references/PAYERS.md#markers). A cyclic package gets a new row with `cycle` = the highest cycle of that code on the claim plus 1 ("<code> added as cycle <n>."), up to the cycles the plan allows ("<code> allows <n> cycle(s); all are already on this preauth."). PMJAY answers an enhancement that raises a cycle's quantity with PAYR-1274 and wants a new item per cycle instead [PAYER](../references/PAYERS.md#markers); one row per cycle is what makes the enhancement a new item on the wire.

**Updated.** Saving the Line items table (S8) rewrites every line in one transaction:

- An empty posted quantity keeps the current one. A posted quantity that is not a whole number is refused ("The quantity of <code> must be a whole number."), and one that is not a number above 0 ("Enter a quantity for <code>."). On a cyclic line another cycle is another line, not a higher quantity.
- `unit_price` may be changed only where the price is **open**: the plan names no rate, or names 0 and offers no `Stratification` extra for the package. A rate of 0 with ward or ICU tiers is a fixed price made of its tiers, not an open one. Anywhere else the plan's rate stands. An empty open price is refused ("Enter a price for <code>."), and a negative one ("The price of <code> cannot be negative.").
- `amount` is always recomputed as `unit_price * quantity`, rounded to 2 places. Flash: "Lines updated."

**Deleted.** "Remove" on S8 deletes one row (a line or a tier): "Line removed." Rows also go when the claim is deleted (cascade) or when the whole transactional store is cleared.

**How the lines are read.**

- `lines_total` (the sum of `amount`) is the pre-authorisation's requested amount (D18 `requested_amount`) and the claim's `preauth_total` (D9; every case is a package case).
- The first `Procedure` line names the claim's `package_code` and `package_name` when the pre-authorisation details (S4) are saved.
- On the wire a `Stratification` line is not an item of its own: it rides as a `modifier` on its parent procedure's `Claim.item`, and its rate is inside that item's `net`. A tier with no `parent_code` (quoted before the column existed) falls back to the first procedure whose plan costs offer it, then to the first procedure.
- Enhancement: lines whose (code, cycle) is not in the last pre-authorisation bundle sent (D18 `request_json`, read back by `productOrService` code and the item's cycle sequence) are the enhancement lines, once D18 is `approved` or `partial`. A second cycle of a code already approved is therefore an enhancement line, as PMJAY requires [PAYER](../references/PAYERS.md#markers).
- The claim leg quotes these same lines, except that a LAMA or DAMA discharge before or during surgery (D20) replaces them all with the single procedure `LM100` [PAYER](../references/PAYERS.md#markers). That substitution is computed at send time and is not stored here.
- The auth-requirements ruling (D13) is stale when the set of non-`Stratification` codes here differs from the codes ruled on (D14).

There is no status column.

#### D16C. COLUMNS
| Column | Type | Null / default | Meaning |
|---|---|---|---|
| id | INTEGER | primary key | Row id |
| claim_id | INTEGER | NOT NULL | The claim (D9) the line is quoted on |
| seq | INTEGER | NOT NULL, default 1 | Order of addition within the claim |
| kind | TEXT | NOT NULL | `Procedure`, `Implant` or `Stratification` (shown as "Ward / ICU tier") |
| code | TEXT | NOT NULL | Package, implant or tier code from the payer's plan |
| display | TEXT | null | Name from the plan (tier: its label) |
| category_code | TEXT | null | Category code, sent as `Claim.item.category` |
| category_display | TEXT | null | Category name |
| unit_price | REAL | NOT NULL, default 0 | The plan's rate; hospital price only where the plan prices it at nothing |
| quantity | REAL | NOT NULL, default 1 | Whole number of times done or implants used |
| amount | REAL | NOT NULL, default 0 | `unit_price * quantity`, recomputed on every save |
| parent_code | TEXT | null | For `Stratification` only: the procedure code the tier was quoted through. Null for the other kinds. Added by migration |
| cycle | INTEGER | NOT NULL, default 1 | Cycle or session number for a cyclic package; 1 for every other line. Added by migration |

#### D16K. KEYS AND INDEXES
- Primary key `id` (integer).
- Foreign key `claim_id` references `claim (id)` (D9), `ON DELETE CASCADE`.
- Unique index `ux_claim_line` on `(claim_id, kind, category_code, code, cycle)`: a code appears once per kind, category and cycle on a claim.

#### D16U. USED BY
- Screens: [S8. Line Items](../screens/S8-line-items.md), [S9. Pre-authorisation](../screens/S9-preauthorisation.md)
- APIs: [A4. Pre-auth Submit](../apis/A4-preauth-submit.md), [A17. Claim State](../apis/A17-claim-state.md)
- FHIR: [F2. CoverageEligibilityRequest](../fhir/F2-coverage-eligibility-request.md), [F5. InsurancePlan](../fhir/F5-insuranceplan.md), [F8. Claim](../fhir/F8-claim.md), [F19. Other bundle resources](../fhir/F19-other-resources.md)
- Database: [D8. terminology](D8-terminology.md), [D9. claim](D9-claim.md), [D10. claim_plan](D10-claim-plan.md), [D11. claim_plan_benefit](D11-claim-plan-benefit.md), [D14. claim_auth_item](D14-claim-auth-item.md), [D15. claim_auth_requirement](D15-claim-auth-requirement.md), [D18. claim_preauth](D18-claim-preauth.md), [D19. claim_predetermination](D19-claim-predetermination.md)
