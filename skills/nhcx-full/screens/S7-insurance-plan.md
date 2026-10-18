# S7. Insurance Plan Screen

#### S7R. ROUTE
No tab and no page of its own. There is no Insurance plan tab: the retired keys `plan` and `procedure` open the Pre-authorisation tab of S6. The plan shows in two places:
- the **Insurance plan card**, in place of the Line items card on the Pre-authorisation tab ([S8. Line Items](S8-line-items.md)) while the plan is not `ready`;
- the **insurance plan row** at the foot of the Validation card on the Overview tab ([S3. Policy Discovery](S3-policy-discovery.md)), whenever the case is in force.

| Endpoint | Purpose |
|---|---|
| `POST claims/:caseid/plan/fetch` | Fetch (`refresh` false: reuse a held plan, else ask the payer) or refetch (`refresh` true: always ask the payer) |
| `GET claims/:caseid/plan` | The plan's summary (S7.2's form count among it) |
| `GET claims/:caseid/plan/benefits` | The plan's packages, filtered by text, category and type (the Code type-ahead of [S8. Line Items](S8-line-items.md)) |
| `GET claims/:caseid/plan/benefits/:benefitid` | One package in full (S7.1) |
| `GET claims/:caseid/plan/forms` and `GET claims/:caseid/plan/forms/:formid` | The plan's questionnaires (S7.2, S7.3) |

Breadcrumb (from S6): Claims (claims/list, S5) > <case number>

#### S7D. DESCRIPTION
The payer's package master for this policy and this facility: every empanelled category, the packages under it, their rates, the tiers paid on top, their claim conditions, the documents they need and the questionnaires the payer ships with them. The line items of [S8. Line Items](S8-line-items.md) are quoted only from this master, so a pre-authorisation cannot be priced until it is `ready`. The plan's grouping of packages (PMJAY calls it a speciality) is labelled **Category** on every screen and in every message the desk reads.

**Fetched by itself.** Whenever a validation leaves an open case in force and the case holds no plan row (the case was just created on the validation gate of [S2. Select Policy](S2-select-policy.md), or the desk chose the patient among several members on [S3. Policy Discovery](S3-policy-discovery.md)), the plan is fetched without the desk asking: first a `ready` plan already held on another case of the same policy code, the same facility HFR ID and the same payer is copied onto this case (nothing is sent); only when there is none is the payer asked. This never raises: a refusal (no HFR ID, a request already outstanding) is logged, and the desk can still fetch. Whether this happens is the integration decision `plan.trigger` ([L1.A](../steps/L1-discovery.md)), automatic by default; with `manual` the desk presses "Fetch insurance plan". Whether a stored master is refreshed on a schedule is `plan.refresh`: manual by default, only the desk's refetch refreshes it. The fetch runs beside the validation's acknowledgement, never inside it, so the payer's callback is answered at once.

**Insurance plan card** (Pre-authorisation tab, in place of the Line items card while the plan is not `ready`). Title "Insurance plan", with the plan's status chip beside it once there is a plan row. Intro: "The payer's **package master** for this policy and this facility: every empanelled category, the packages under it and their rates. The app asks for it with an InsurancePlan discovery Task - a lookup that carries no clinical content, only the policy code and the facility's HFR ID - and the payer answers asynchronously, exactly like the eligibility check."

| Plan state | Header button | Body under the intro |
|---|---|---|
| no plan row | primary "Fetch insurance plan" (download icon) | nothing |
| `fetching` | secondary "Fetch again" (refresh icon), behind the confirm "The payer has not returned the plan yet. Send the discovery Task again?" | "Discovery Task sent to the payer; awaiting the on_request reply. Use Refresh to check for it.", the muted poll note "Could not poll the gateway: <error>" when the last poll failed, then Sent at |
| `error` | primary "Fetch again", behind the confirm "Fetch the insurance plan again? The packages stored for this claim are replaced by whatever the payer returns." | the error in the danger colour, or "The exchange failed." |
| `empty` | secondary "Fetch again", the same confirm | nothing |

Plan statuses:

| Status | Label | Chip tone |
|---|---|---|
| `fetching` | Awaiting payer | info |
| `ready` | Ready | success |
| `empty` | No plan returned | warning |
| `error` | Error | danger |

Once the plan is `ready` the card gives way to the Line items card of [S8. Line Items](S8-line-items.md).

**Insurance plan row** (Overview, foot of the Validation card, only while the case is in force): "Insurance plan: fetched <date and time>", "Insurance plan: being fetched from the payer…" or "Insurance plan: not fetched yet", and a small outline button "Refetch insurance plan" (refresh icon; a refetch, `refresh` true) when the case holds a plan row, else "Fetch insurance plan" (a first fetch). The button is disabled, its icon spinning, while the plan is `fetching`.

**Fetching**, by the desk or by itself. Checked before any call (red flash, verbatim):
- The patient still to choose among several members ([S3. Policy Discovery](S3-policy-discovery.md)): "Choose which member of the policy is the patient on the Overview tab first."
- On a first fetch (not a refetch), a `ready` plan of the same policy code, facility HFR ID and payer held on another case is copied onto this case with its packages and forms, the newest one; no request goes out. Flash: "Using the package master already held for this policy - Fetch again asks the payer for a new one."
- The facility must have an HFR ID: "Set the facility's HFR ID under Settings before fetching a package master."
- The facility must have an NHCX participant code: "Set the facility's NHCX participant code under Settings before fetching a package master."
- With neither a policy code nor an HFR ID: "A plan request needs a policy code or the facility's HFR ID."
- A payer that refuses a second request while one is outstanding (PMJAY answers in 15 to 60 minutes and refuses another for the same policy meanwhile, PAYR-1406 [SANDBOX](../references/PAYERS.md#markers)): while a request for the same payer, policy and HFR ID is still `fetching` and was sent less than an hour ago, none is sent, on a first fetch or a refetch: "The package master of <policy code> was already requested at <date and time>; the payer refuses a second request meanwhile (PAYR-1406), so none is sent." Re-sending would overwrite the outstanding correlation id and leave the real answer unmatched. Which payers behave so is in [PAYERS.md](../references/PAYERS.md).

The request carries the policy code and the facility's HFR ID, and travels with `x-hcx-workflow_id` `1`: the plan is the hospital's, never a case's, so it never carries the case number. Flash: "Insurance plan requested from the payer." A send clears every earlier result and the case's packages before the new answer lands, so a stale package cannot survive it. A failed send leaves the plan `error` and flashes the error in red.

API: [A3. Insurance Plan Request](../apis/A3-insurance-plan-request.md)

The plan is the hospital's for the policy, not the case's: a row is kept on each case ([D10. claim_plan](../database/D10-claim-plan.md)) so the case reads its own copy, but a ready plan of the same policy code, HFR ID and payer is reused rather than requested again (`plan.scope`, once and reused by default). A full PMJAY master is tens of megabytes [SANDBOX](../references/PAYERS.md#markers).

**The reader must carry every field the payer sends.** The InsurancePlan the sandbox returns is checked against the knowledge package's InsurancePlan example ([F5. InsurancePlan](../fhir/F5-insuranceplan.md)): every element the example holds (plan, coverage, benefits, limits, specific costs, the questionnaire extension, the document requirements) has a column or a JSON field in [D10. claim_plan](../database/D10-claim-plan.md) to [D12. claim_plan_form](../database/D12-claim-plan-form.md), and L6 fails the build when the reader drops one. A field the hospital does not show is still stored, so a later screen can read it without a refetch.

**Waiting for the answer.** There is no timer: every load of the claim screen polls once while the plan is `fetching` (the S6 Refresh button reloads and polls). A failure of the poll itself shows as the poll note on the Insurance plan card.

Callback: [C4. Insurance Plan Reply](../callbacks/C4-insuranceplan-on-request.md)

API: [A10. Transaction Related](../apis/A10-txn-related.md) (poll)

API: [A11. Transaction Dispatch](../apis/A11-txn-dispatch.md) (poll, dispatch status)

A reply that carries no InsurancePlan at all (only the payer's Organization) settles as `empty` with the F5 message "The payer reply carries no InsurancePlan. The payer has no package master filed under this policy.", as C4 and D10 say; it is a legitimate answer, not an error. A reply with a plan but zero packages is `empty` too. Only a `ProtocolResponse` or a transport failure is `error`.

Data: [D10. claim_plan](../database/D10-claim-plan.md)

Data: [D11. claim_plan_benefit](../database/D11-claim-plan-benefit.md)

Data: [D12. claim_plan_form](../database/D12-claim-plan-form.md)

#### S7L. LAYOUT
The arrangement below is the reference implementation's [REF](../references/PAYERS.md#markers): follow the target HMIS's own screen conventions. What is required is in DESCRIPTION and ACTIONS: the fields, options, columns, statuses, messages and actions.


```
Pre-authorisation tab, plan not ready:
|------------------------------------------------------------------|
| [Card] Insurance plan [Awaiting payer]          [(o) Fetch again]|
|  The payer's package master for this policy and this facility:   |
|  every empanelled category, the packages under it and ...        |
|  Discovery Task sent to the payer; awaiting the on_request       |
|  reply. Use Refresh to check for it.                             |
|  SENT AT                                                         |
|  18 Oct 2026, 8:43 am                                            |
|------------------------------------------------------------------|

Overview tab, foot of the Validation card:
|  +------------------------------------------------------------+  |
|  | Insurance plan: fetched 18 Oct 2026, 8:43 am               |  |
|  |                               [(o) Refetch insurance plan] |  |
|  +------------------------------------------------------------+  |
```

#### S7A. ACTIONS
1. Fetch insurance plan (no plan row, either place): reuse a held plan or send the discovery Task, then re-read the case with a flash.
2. Fetch again (Insurance plan card) / Refetch insurance plan (Overview): after the confirm where the card has one, always ask the payer; the case's packages are replaced by the answer.
3. Refresh (case header, S6): re-read and poll once for the `on_request` reply.
4. Once `ready`: the Line items card of [S8. Line Items](S8-line-items.md) replaces the Insurance plan card, and the line items are quoted from the plan.

---

## S7.1 Package Detail

#### S7.1R. ROUTE
No page of its own: `GET claims/:caseid/plan/benefits/:benefitid` returns one package in full. There is no package browser on the claim screen.

#### S7.1D. DESCRIPTION
Everything the payer published about one package under one category: the whole D11 row, including the tiers, the claim conditions and the documents, which the claim state ([A17. Claim State](../apis/A17-claim-state.md)) leaves out for size. A package id that does not belong to this case is "not found".

What reads it:
- the Line items card of [S8. Line Items](S8-line-items.md): the implants the plan approves for a quoted procedure and the ward or ICU tiers priced over it are offered under the lines table, and a tier's price is the one its procedure lists;
- the documents and forms of [S9. Pre-authorisation](S9-preauthorisation.md) and [S11. Claim Submission](S11-claim-submission.md): the documents a quoted package requires, with their stage (D11's stage rule: "Pre-auth" or "Post (claim)"), and the questionnaires they name.

The fields a package carries (code, type, category, rate, currency, requirement; implants allowed, ward and ICU tiers, claim conditions such as GovtReserved, Standalone, IsDayCare, ApprovalNotRequired, ImplantApplicable, StratificationAllowed, ProcedureType [PAYER](../references/PAYERS.md#markers), documents required) are all stored, whether or not a screen shows them.

Data: [D11. claim_plan_benefit](../database/D11-claim-plan-benefit.md)

Data: [D12. claim_plan_form](../database/D12-claim-plan-form.md)

---

## S7.2 Plan Forms

#### S7.2R. ROUTE
No page of its own: `GET claims/:caseid/plan/forms` lists the plan's questionnaires, matched by title or form id as a substring.

#### S7.2D. DESCRIPTION
Every questionnaire the payer shipped with the plan. A form pointed at from the policy's coverage is a policy form; a form pointed at from a package is that package's form, never confused with the policy's. The forms are answered where the leg needs them: the pre-authorisation forms on [S9. Pre-authorisation](S9-preauthorisation.md), the claim forms on [S11. Claim Submission](S11-claim-submission.md). There is no "All forms" browser.

Data: [D12. claim_plan_form](../database/D12-claim-plan-form.md)

---

## S7.3 Form Detail

#### S7.3R. ROUTE
No page of its own: `GET claims/:caseid/plan/forms/:formid` returns one questionnaire with its questions. A form id that does not belong to this case is "not found".

#### S7.3D. DESCRIPTION
One questionnaire: its title, description and typed questions, nested ones included, each with whether it is required and its answer options. The forms cards of [S9. Pre-authorisation](S9-preauthorisation.md) and [S11. Claim Submission](S11-claim-submission.md) read it to draw the answer fields. Answer types: `attachment` File, `choice` Choice, `datetime` Date & time, `date` Date, `time` Time, `string` Text, `text` Long text, `boolean` Yes / no, `integer` / `decimal` / `quantity` Number, `url` Link; any other type shows as sent.

Data: [D12. claim_plan_form](../database/D12-claim-plan-form.md)
