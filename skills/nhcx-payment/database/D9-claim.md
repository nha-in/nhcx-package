# D9. claim

#### D9T. TABLE
One row is one claim episode (case) around one selected policy, from eligibility to payment; primary key `id`; parent tables [D3. patient](D3-patient.md) and D4. encounter (in nhcx-coverage), both optional until the admission is linked.

#### D9D. DESCRIPTION
The case row. It holds the policy the operator selected, the coverage eligibility exchange and the payer's verdict flattened from it, the link to the admitted patient, the pre-authorisation draft header, and the case's stage. The legs of the case live in child tables: auth-requirements ruling D13 (in nhcx-coverage), lines D16 (in nhcx-preauth), pre-auth D18 (in nhcx-preauth), claim [D20](D20-claim-submission.md), payments [D21](D21-claim-payment.md), queries D23 (in nhcx-preauth) and the others that point here.

Create:
- Written when the operator picks a policy from the search result (S2). The policy must carry a member ID ("That policy has no member ID; a claim cannot be raised without one."). The row starts with `status = 'draft'`, `provisional = 1`, `created_at` = now and a fresh `external_id` (the public id every route uses), and the validation is sent at once (A2). **The validation gate**: a provisional row is not yet a case. It is hidden from the claim list (S5) and the dashboard, and only the gate page shows it, until the payer answers the validation with the policy in force and, when the reply returned several members, the desk has chosen the patient; then `provisional` becomes false and the case opens. A send that fails leaves the row provisional and the desk can send again. A `discovery` row is never a case of its own: its answer names covers, so only a later validation of one of them opens a case (rows stored as discovery before the gate read as provisional). When the search was started from the patient master (S13. Patient List (in nhcx-coverage), S15. Patient Detail (in nhcx-coverage)) the carried `patient_id` is written too; the admission is still linked later. It copies the search inputs (`search_id_type`, `search_id_value`), the policy fields, `patient_photo` and the raw policy as `policy_json`. `payer_name` is the payer's **registered name on the NHCX participant registry** ([G4. Registry and Certificates](../gateway/G4-registry.md) participant fetch, cached in the application and refreshed when the lookup is retried), looked up by `payer_id` when the case is opened; it is never the search row's `payerName`, a configuration row's `display`, the adapter's name or a configured default name. Configuration rows only choose the adapter ([PAYERS.md](../references/PAYERS.md)). When the registry lookup fails, `payer_name` stays null, the screens show the payer code, and the lookup is tried again the next time the case is opened.
- `claim_no` is allocated from the `claim` counter ([D30](D30-counter.md)) as `NM-<yy>-<mmdd><serial>`, month-and-day in 3 base32 characters and the serial in 6 (alphabet `0-9A-V`), so every number has the same length and sorts by date, then issue order [REF](../references/PAYERS.md#markers). Example: `NM-26-0SE000001`.

Eligibility check (A2):
- Sending sets `status = 'checking'`, `purpose`, `policy_code` (the one entered, else the stored one), `member_id`, `txn_id`, `correlation_id`, `checked_at` = now, `error_message` = null. A send that fails sets `status = 'error'` and `error_message`. The outbound `x-hcx-workflow_id` is `11` by default, or `claim_no` under the `eligibility_workflow_id` setting (A2).
- The verdict (C2 callback, or polling by `txn_id`) writes `inforce`, `outcome`, `disposition`, `auth_required`, `allowed_amount`, `used_amount`, `plan_name`, `plan_period_start`, `plan_period_end`, every person the payer returned as `beneficiaries_json`, and the whole bundle as `response_json`. The person columns (`beneficiary_member_id`, `beneficiary_name`, `patient_gender`, `patient_dob`, `patient_address`, `abha_number`, `patient_photo`, `relationship`) are written only when one person is chosen: the only one returned, or the one whose member id is `member_id` or an earlier `beneficiary_member_id`. A family card that returns several people and no such match leaves `beneficiary_member_id` null, and the desk chooses on S3 (below). Values the payer leaves empty are not written. Then `status`: `error` when `outcome = 'error'`, else `eligible` when in force, else `not-eligible`. A validation answered `eligible` on a provisional row turns it into a case (`provisional = 0`), unless the desk still has to choose the member. On a provisional row with several members the desk always chooses, even when a member id matches.
- **The insurance plan is fetched automatically.** When a validation leaves an open case (not provisional) `eligible` and the case holds no plan row (D10 (in nhcx-coverage)), the plan is requested without the desk asking: a `ready` plan of the same policy, facility HFR ID and payer is copied first, else the payer is asked. This runs after the verdict is committed, never raises, and a refusal or failure only means the desk fetches it from the Overview.
- The wallet (`allowed_amount`, `used_amount`) is read only from the reply's wallet row (a benefit typed `benefit` or `30`, or the admission item), never from a package rate ([F3. CoverageEligibilityResponse](../fhir/F3-coverage-eligibility-response.md)); a reply with no wallet row leaves both as they were. `benefit_items_json` is replaced unless the reply carries the wallet row alone and the stored list holds packages.

**In force** (`in_force(case)`): the case's validation answered eligible. It is true when `status = 'eligible'`, and also while a later benefits check ("Ask cover", `purpose = 'benefits'`) on an open case is `checking` or failed (`error`): neither withdraws the validation. Every gate below (admission link, pre-authorisation details, authorisation requirements, the pre-authorisation send, the plan refetch) uses in force, never the raw `status`.

Choose the beneficiary (S3, `POST claims/:caseid/beneficiary` with `member_id`):
- Allowed when `beneficiaries_json` holds a person with that member id. Writes `beneficiary_member_id`, `member_chosen_at` = now and that person's non-empty columns (name, gender, dob, address, ABHA, photo, relationship), `member_id` itself (the chosen person's id, so on a case opened on a different member of the same card the next check, the pre-authorisation and the claim go out for the person in the bed), and `policy_code` from the member when the case has none. Refused otherwise: "That member is not on the payer's answer." Flash: "<name> is the patient on this case."
- On a provisional row whose status is `eligible`, the choice opens the case (`provisional = 0`) and the insurance plan is then fetched automatically, as above. Choosing never unlinks an admission already linked.
- Until a person is chosen on a reply with several, the case is `eligible` but `beneficiary_pending` (A17) is true: the admission link and the plan fetch refuse with "Choose which member of the policy is the patient on the Overview tab first."
- `status = 'error'` with `error_message` also results from a ProtocolResponse on the callback, a protocol error found in the ledger, a [G9. Ledger](../gateway/G9-ledger.md) dispatch status of `dispatch_failed`, `dead` or `failed`, or a G9 ledger that no longer knows the `txn_id` (not found).
- A redelivered verdict for a row that is no longer `checking` is ignored, unless the row's last send is on record as failed (`status = 'error'`). Then the row is revived to `checking`, `error_message` cleared, and the verdict applied.

Status values and transitions (`status`):
- `draft` -> `checking` (check sent) or `error` (send failed).
- `checking` -> `eligible`, `not-eligible` or `error`.
- `error` -> `checking` (payer answered a send reported failed, or the check is sent again).
- `eligible`, `not-eligible`, `error` -> `checking` when the check is sent again ("Check again").

Link the admission (on the Claim tab; the claim needs it, the pre-authorisation does not):
- Checked in this order: a beneficiary is chosen when the reply offered several ("Choose which member of the policy is the patient on the Overview tab first."); the policy is in force ("Link an admission only after the payer has confirmed the policy is eligible."); the admission is a current IPD stay of a patient whose ABHA number matches `abha_number`, digits only (the stays offered are found by the case's ABHA, "That admission is not a current IPD stay of a patient with this claim's ABHA number." otherwise). The link is always an explicit action of the desk on one listed admission, never made by the application on its own. Writes `patient_id`, `encounter_id` and, if empty, `admission_date` from the stay's `period_start`. Every proof-of-presence row of the case that has no patient yet (D31 (in nhcx-coverage), captured before admission) is given this patient in the same step. Flash: "Admission linked to the claim."
- Unlink sets `patient_id` and `encounter_id` to null and keeps the draft fields. Flash: "Admission unlinked."

Pre-authorisation details (on the Pre-authorisation tab):
- The pre-authorisation owns its dates, diagnoses and treating doctors: it may be drafted and sent before the patient is admitted, so no linked patient or admission is needed, and a linked admission only pre-fills a form not yet saved, never fixes it.
- Save checks, in order: a planned `admission_date` ("Enter the admission date."); an `expected_discharge_date` that is empty or not before it ("The provisional discharge date cannot be before the admission date."); at least one ICD-10 diagnosis picked from the diagnosis terminology, its SNOMED CT concept mapped, never typed ("Pick at least one ICD-10 diagnosis - the payer needs it."); each care team role a known one ("Choose a valid care team role."); at least one active treating doctor ("Add the treating doctor - the payer needs one."). It writes `admission_date`, `expected_discharge_date`, `case_type = 'package'`, `package_code`, `package_name`, `preauth_total` and `preauth_saved_at` = now, replaces D25 (in nhcx-preauth) and D26 (in nhcx-preauth), and deletes any D27 rows, in the same transaction. Flash: "Pre-authorisation draft saved."
- The lines are never part of the save: every line is quoted from the insurance plan (D16 (in nhcx-preauth)). `package_code` / `package_name` are the first Procedure line (null when there is none), and `preauth_total` is the lines' total.

Stage (`stage`, `sub_stage`):
- Derived from the legs and stored whenever a leg is written, the verdict lands, the draft is saved or the state endpoint (A17) runs. The stored pair lets the claim list (S5) show and filter it without reading the legs.
- `stage`: `payment` when any payment notice exists; else `claim` when the claim leg exists and is not `draft`; else `enhancement` (last pre-auth send was `enhancement` or `enhancement_resubmit`) or `preauth` when a pre-auth leg exists; else `preauth` with `sub_stage = 'draft'` when `preauth_saved_at` is set; else `eligibility`.
- `sub_stage`: `draft`, `checking`, `eligible`, `not-eligible`, `requested`, `resubmitted`, `answered`, `queried`, `approved`, `partial`, `rejected`, `cancelling`, `cancelled`, `refused`, `noticed`, `paid`. At `eligibility` it is `status`, with `error` read as `draft`. At `payment` it is `paid` when anything has been paid, else `noticed`. On a leg it is the leg's status: a leg still `submitting` reads by its send kind (`requested`, `resubmitted` or `answered`), a leg in `error` reads `refused`, and an open payer query (D23 (in nhcx-preauth) `kind = 'query'`, status `open` or `error`) on a leg in `requested`, `answered` or `resubmitted` reads `queried`.

Other writes:
- An accepted pre-auth cancellation gives the claim a fresh `claim_no` [REF](../references/PAYERS.md#markers). The withdrawn number stays on the pre-auth leg (D18 (in nhcx-preauth) `claim_ref`).
- Every correlation id the case sends on (eligibility, plan, auth requirements, pre-authorisation, claim, query answers, Tasks, acknowledgements) is added to `correlation_ids` once, oldest first, and kept after a leg moves to a new thread; the Logs tab lists every message on those threads and `correlation_id`. Recording it never fails a send.
- A named document the desk takes off a leg's list (an X beside a plan-named document) is added to `dismissed_documents` as `<stage>:<code>` (`stage` `preauth` or `claim`), and removed again when restored. Only a code the plan or the ruling names for that leg can be dismissed ("That document is not one the plan names for this leg."). The leg's required documents are the named ones less the dismissed ones. Flashes: "Document taken off the list.", "Document put back on the list."
- Never deleted by any screen. The "clear transactional data" reset deletes all rows; `ON DELETE CASCADE` on the child tables removes their rows with it.

#### D9C. COLUMNS
| column | type | null/default | meaning (and allowed values) |
|---|---|---|---|
| id | INTEGER | primary key | row id |
| external_id | TEXT | NOT NULL, UNIQUE | a UUID minted when the case is opened; the `:caseid` of every claim route and API. Routes are never keyed on `claim_no`, which C7 replaces on an accepted cancellation. Not in the reference implementation's schema (it routed on `id`); add it, or route on `id` where the HMIS exposes integer ids [REF](../references/PAYERS.md#markers) |
| claim_no | TEXT | NOT NULL, UNIQUE | case number `<prefix>-<yy>-<mmdd><serial>` (prefix a setting, D30); `caseId` and `Claim.identifier`. Never a workflow id (the plan request and the status enquiry send `1`). Replaced by a fresh number when a cancellation is accepted (C7), so never used in a route |
| created_at | TEXT | NOT NULL | ISO timestamp the case was opened |
| status | TEXT | NOT NULL, default `'draft'` | eligibility status: `draft`, `checking`, `eligible`, `not-eligible`, `error`. Gates read in force (above), not this column alone |
| provisional | INTEGER | NOT NULL, default `0` | the validation gate (`1` provisional): from the policy pick (or a discovery) until the validation answers in force and the member is chosen; a provisional row is hidden from the lists and the dashboard. Rows stored before the gate are `0`, except discovery rows, set `1`. Added by migration |
| correlation_ids | JSON | NOT NULL, default `[]` | list of every correlation id the case has sent on, oldest first, each once; the Logs tab's threads. Added by migration |
| dismissed_documents | JSON | NOT NULL, default `[]` | list of `<stage>:<code>` keys, the plan-named documents the desk took off a leg's list (restorable). Added by migration |
| member_chosen_at | TEXT | null | ISO timestamp the desk chose the member on a reply with several. Added by migration |
| search_id_type | TEXT | null | how the beneficiary was searched: `MemberId`, `MobileNo`, `AbhaNumber` |
| benefit_items_json | JSON | null | every `insurance[].item` of the last eligibility reply with its benefits, cover, term and authorisation ([F3. CoverageEligibilityResponse](../fhir/F3-coverage-eligibility-response.md) "Itemised benefits"), written by C2; read by S3 and S8 |
| search_id_value | TEXT | null | the value searched |
| member_id | TEXT | NOT NULL | beneficiary / member ID from the selected policy; `pmjayId` [PAYER](../references/PAYERS.md#markers) and `subscriberId`. Replaced by the chosen member's id when the desk picks another member of the same card |
| beneficiary_member_id | TEXT | null | the member id of the person the desk (or an unambiguous reply) chose as the patient; null while a reply with several people awaits the choice. Added by migration |
| beneficiaries_json | TEXT | null | JSON list of every person the payer's reply returned (`{member_id, name, gender, dob, address, abha_number, photo, relationship, policy_code, plan_name, checked}`), what S3 lists to choose from. Added by migration |
| policy_code | TEXT | null | policy / plan identifier, for example `PMJAY/HP/S/G` [PAYER](../references/PAYERS.md#markers); `policyNumber` |
| beneficiary_name | TEXT | null | name from the search, then from the payer's Patient |
| abha_number | TEXT | null | ABHA number from the search, then from the payer's Patient; used to find the admission |
| mobile_number | TEXT | null | mobile number from the search |
| processing_id | TEXT | null | the policy's processing participant code from the policy search (A1); the `x-hcx-recipient_code` of every exchange on the case, falling back to `payer_id` when the registry gave none. Not in the reference implementation's schema, which sent to `payer_id` [REF](../references/PAYERS.md#markers); add it |
| payer_id | TEXT | null | payer participant code, with or without the `@hcx` suffix (for example `<payer code>`); `x-hcx-recipient_code`, and picks the payer adapter (see [PAYERS.md](../references/PAYERS.md)) |
| payer_name | TEXT | null | the payer's registered name from the NHCX participant registry (G4), cached; null until the lookup succeeds, never a guessed or configured name |
| product_id | TEXT | null | insurance product id |
| product_name | TEXT | null | insurance product name |
| policy_json | TEXT | null | JSON: the raw policy row as the search returned it |
| purpose | TEXT | null | last eligibility purpose: `validation`, `benefits`, `discovery` |
| txn_id | TEXT | null | [G9. Ledger](../gateway/G9-ledger.md) id of the outbound check |
| correlation_id | TEXT | null | `x-hcx-correlation_id` tying the last check to its on_check (also kept in `correlation_ids`) |
| checked_at | TEXT | null | ISO timestamp the check was sent |
| error_message | TEXT | null | why the check failed; null otherwise |
| inforce | INTEGER | null | `1` policy in force, `0` not |
| outcome | TEXT | null | CoverageEligibilityResponse.outcome: `complete`, `error`, `partial` |
| disposition | TEXT | null | CoverageEligibilityResponse.disposition |
| auth_required | INTEGER | null | `1` / `0` from the last item's `authorizationRequired` |
| allowed_amount | REAL | null | sum insured: the wallet's `allowedMoney` (what is left) plus `usedMoney`, read only from the wallet row ([F3. CoverageEligibilityResponse](../fhir/F3-coverage-eligibility-response.md)), never a package rate [PAYER](../references/PAYERS.md#markers) |
| used_amount | REAL | null | the wallet's `usedMoney` |
| plan_name | TEXT | null | Coverage.class[0].name |
| plan_period_start | TEXT | null | Coverage.period.start |
| plan_period_end | TEXT | null | Coverage.period.end |
| relationship | TEXT | null | subscriber relationship (`self`, `child` and so on), display else code |
| patient_gender | TEXT | null | gender from the payer's Patient |
| patient_dob | TEXT | null | birth date from the payer's Patient |
| patient_address | TEXT | null | address lines, district, state and postal code joined with ", " |
| patient_photo | TEXT | null | base64 of the image (JPEG or PNG, peeled once when the payer encoded it twice) or URL of the photo, from the search or the payer |
| response_json | TEXT | null | JSON: the full on_check bundle, for audit |
| patient_id | INTEGER | null | linked patient ([D3](D3-patient.md)) |
| encounter_id | INTEGER | null | linked IPD admission (D4 (in nhcx-coverage)) |
| admission_date | TEXT | null | `YYYY-MM-DD`, planned or actual; the check's `servicedDate` and the pre-auth period start |
| expected_discharge_date | TEXT | null | provisional discharge, `YYYY-MM-DD`; the pre-auth period end |
| case_type | TEXT | null | always `package` on a save: every line is quoted from the payer's insurance plan, and custom line items are retired. `nonpackage` is kept only as a value old rows may hold; the stored value never appears on a screen |
| package_code | TEXT | null | the first Procedure line's code |
| package_name | TEXT | null | its name |
| preauth_total | REAL | null | the lines' total (D16 (in nhcx-preauth)) when the details were saved |
| preauth_saved_at | TEXT | null | ISO timestamp the draft was last saved; set means the case has reached `preauth` / `draft` |
| stage | TEXT | null | `eligibility`, `preauth`, `enhancement`, `claim`, `payment`; migration only |
| sub_stage | TEXT | null | one of the sub-stages listed above; migration only |

#### D9K. KEYS AND INDEXES
- Primary key `id` (integer). Unique: `external_id` (the public id in routes and APIs).
- `patient_id` references [D3. patient](D3-patient.md) `id`, `ON DELETE SET NULL` (the case outlives a merged or removed patient record).
- `encounter_id` references D4. encounter (in nhcx-coverage) `id`, `ON DELETE SET NULL`.
- D26. claim_care_team (in nhcx-preauth) `practitioner_id` references [D2. practitioner](D2-practitioner.md) `id`, `ON DELETE PROTECT`: a practitioner named on a sent care team cannot be deleted, only retired.
- Referenced (`claim_id`, `ON DELETE CASCADE`) by D10 (in nhcx-coverage), D13 (in nhcx-coverage), D16 (in nhcx-preauth), D17 (in nhcx-preauth), D18 (in nhcx-preauth), D19 (in nhcx-preauth), [D20](D20-claim-submission.md), [D21](D21-claim-payment.md), D23 (in nhcx-preauth), D24 (in nhcx-preauth), D25 (in nhcx-preauth), D26 (in nhcx-preauth), D27, D28 (in nhcx-coverage), D29 (in nhcx-preauth). D13 (in nhcx-coverage), D18 (in nhcx-preauth) and [D20](D20-claim-submission.md) allow one row per claim.
- Unique: `claim_no`.
- Index: `ix_claim_status (status, id DESC)`. The lists and the dashboard filter `provisional = 0`.

#### D9U. USED BY
- Screens: [S5. Claim Master](../screens/S5-claim-master.md), [S6. Claim Detail](../screens/S6-claim-detail.md), [S12. Payments](../screens/S12-payments.md)
- APIs: [A10. Transaction Related](../apis/A10-txn-related.md), [A11. Transaction Dispatch](../apis/A11-txn-dispatch.md), [A13. Transaction List](../apis/A13-txn-list.md), [A17. Claim State](../apis/A17-claim-state.md)
- Callbacks: [C1. Callback Door](../callbacks/C1-callback-door.md), [C10. Payment Notice](../callbacks/C10-paymentnotice-request.md)
- FHIR: [F3. CoverageEligibilityResponse](../fhir/F3-coverage-eligibility-response.md), [F13. PaymentNotice](../fhir/F13-paymentnotice.md), [F14. Payment acknowledgement](../fhir/F14-payment-acknowledgement.md), [F15. Patient](../fhir/F15-patient.md), [F17. Organization](../fhir/F17-organization.md), [F18. Coverage](../fhir/F18-coverage.md)
- Database: [D1. organization](D1-organization.md), [D3. patient](D3-patient.md), [D20. claim_submission](D20-claim-submission.md), [D21. claim_payment](D21-claim-payment.md), [D30. counter](D30-counter.md), [D32. participant](D32-participant.md)
