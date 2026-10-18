# S3. Policy Discovery Screen

#### S3R. ROUTE
claims/view/:caseid/eligibility

Shown as the first tab of the Claim Detail screen S6, labelled "Overview" (tab key `eligibility`). It is also the tab S6 opens on when no tab, or an unknown one, is named.

| Endpoint | Purpose |
|---|---|
| `POST claims/:caseid/check_again` | Send the validation again with the case's last purpose (default `validation`), policy code and member id |
| `POST claims/:caseid/beneficiary` | Choose which member of the policy is the patient (field `member_id`) |
| `POST claims/:caseid/plan/fetch` | Fetch or refetch the insurance plan ([S7. Insurance Plan](S7-insurance-plan.md); field `refresh`) |

Breadcrumb (from S6): Claims (claims/list, S5) > <case number>

Every action posts, re-reads the case and leaves a flash above the tabs (S6): green with the message on success, red with the refusal verbatim.

#### S3D. DESCRIPTION
Who the beneficiary is, which policy the case runs on, and what the payer said when the policy was validated. The validation itself is sent before the case exists, from the validation gate of [S2. Select Policy](S2-select-policy.md): a case appears in the lists only once its validation has answered in force. This tab shows that answer and resends it. It holds no form: the purpose is always `validation`, and the policy code and member id are the case's. The benefits check is sent from the Pre-authorisation tab ([S8. Line Items](S8-line-items.md)) and the discovery from its own page ([S17. Beneficiary Discovery](S17-beneficiary-discovery.md)).

The tab is a stack of cards, in this order:
1. Members on this cover (only on a case still waiting for the desk to choose the patient)
2. Beneficiary details
3. Policy details
4. Validation

No card on this tab shows a correlation id or a transaction id (they are on the Logs tab of [S6. Claim Detail](S6-claim-detail.md) only), and the adapter's name is never shown.

**Members on this cover.** A family policy answers the validation with every member on the card, not one person: PMJAY returns one Patient per member, three or more on a family card [PAYER](../references/PAYERS.md#markers). The reply is read into a list ([F3. CoverageEligibilityResponse](../fhir/F3-coverage-eligibility-response.md), D9 `beneficiaries_json`). The patient is normally chosen on the validation gate of [S2. Select Policy](S2-select-policy.md), before the case exists; this card is shown only on a case that still waits for that choice (the reply holds more than one person and none is chosen), for example an older case. Intro: "The payer returned <n> members on this cover. Choose the one who is the patient; nothing is taken as the patient, and no admission can be linked, until you do."

One card per member, two side by side on a wide screen:
- the member's photo, or an initials avatar of the same size when there is none;
- the name (or "Unnamed member") over the member id in monospace;
- a small neutral tag "answered about" on the member the payer's reply is about;
- one line "<Gender> · born <date of birth> · <Relationship>", leaving out what is missing;
- when an admission is already linked and the member's name shares no word (of three letters or more) with the admitted patient's, a warning line "Does not match the admitted patient: named differently from the admitted patient (<name>)."
- a button "This is the patient"; on the chosen member it reads "The patient on this case", is disabled, and the card is highlighted in the primary tone.

The application never picks for the desk. Until the choice is made the admission link, the plan fetch and every send are refused with "Choose which member of the policy is the patient on the Overview tab first." Choosing writes the person's details (name, gender, date of birth, address, ABHA, photo, relationship) onto the case and makes their member id the case's `member_id`, so the pre-authorisation and the claim go out for the person in the bed. A member id not on the reply is refused: "That member is not on the payer's answer." Success flash: "<name> is the patient on this case." When the choice is what brings the case into force, the insurance plan is fetched for it at once ([S7. Insurance Plan](S7-insurance-plan.md)).

Why this matters: a member id is shared across a family card, and a child's admission under the parent's details would send the parent's name, age and ABHA on the pre-authorisation and attach the claim to the parent's record. Response order says nothing about who is in the bed.

**Beneficiary details card.** A photo on the left (a URL, a data URI, or bare base64 read as JPEG, 5rem square, rounded corners; with no photo an initials avatar of the same size in the primary tone), then a three-column detail grid. An empty value shows "-":

| Label | Value |
|---|---|
| Name | beneficiary name |
| Member ID | member id |
| ABHA | ABHA number |
| Mobile | mobile number |
| Gender | gender, title-cased |
| Date of birth | date of birth |
| Address | full address |
| Found by | "<identifier label> · <identifier value>" from the S1 search, for example "Member ID · MD5SLS4X5" |

Name, gender, date of birth, address, photo and a corrected ABHA come from the payer's validation reply, and only once it is clear which person they belong to.

**Policy details card.** A three-column detail grid:

| Label | Value |
|---|---|
| Policy code | policy code |
| Product | product name (or "-") over the product id, muted |
| Payer | payer name (or "-") over the payer id, muted |
| Plan | plan name |
| Plan period | "<start date> → <end date>" (dates only) |
| Relationship | relationship, title-cased |

**Validation card.** Title "Validation" with the case's status chip beside it (not shown while the case is a draft). One header button:

| Case status | Button | Style |
|---|---|---|
| `draft` | "Send validation" (send icon) | primary |
| `checking` | "Send again" (refresh icon), behind the confirm "The payer has not replied to the last check yet. Send the same eligibility check again?" | secondary |
| any other | "Check again" (refresh icon) | secondary |

Status chips:

| Status | Chip |
|---|---|
| `checking` | Awaiting payer (info) |
| `eligible` | Eligible (success) |
| `not-eligible` | Not eligible (danger) |
| `error` | Error (danger) |

Body by status:
- `draft`: "The validation has not been sent to the payer yet."
- `checking`: "Eligibility validation sent to the payer; awaiting the on_check reply. Use Refresh to check for it.", then the muted poll note "Could not poll the gateway: <error>" when the last poll failed, then Sent at.
- `error`: the error in the danger colour, or "The exchange failed.", then Checked at.
- `eligible` and `not-eligible`: a "Wallet" heading over three stat tiles, then a detail grid of Policy active, Disposition and Checked at.

Wallet tiles (money as "₹" with thousands separators and no decimals, or "-" when not reported):

| Tile | Icon | Tone |
|---|---|---|
| Sum insured | shield-check | default |
| Utilised | trending-down | warning |
| Wallet balance | wallet | success when eligible, danger when not |

The wallet is read only from the reply's policy-wallet benefit (the benefit row of category `30`) or, failing that, the admission item; never from a package rate, which is a price and not a balance (reading one produced negative balances). Policy active reads "Active (in force)", "Not active (not in force)", or "-" when the payer did not say (`insurance[].inforce`).

**In force.** The case is in force when the validation said eligible. A benefits check sent later from the Pre-authorisation tab that is still in flight (`checking`) or whose send failed (`error`) does not withdraw it. Every gate that needs a policy in force (the pre-authorisation tab and its send, the authorisation requirements, the admission link, the plan refetch row below) asks this, never the raw case status.

**Insurance plan row.** At the foot of the Validation card, whenever the case is in force, a muted bordered row: "Insurance plan: fetched <date and time>", or "Insurance plan: being fetched from the payer…" while the fetch is out, or "Insurance plan: not fetched yet". On its right a small outline button: "Refetch insurance plan" (refresh icon, spinning and disabled while the fetch is out) when the case holds a plan row, else "Fetch insurance plan". It asks the payer for the plan again ([S7. Insurance Plan](S7-insurance-plan.md)), with the same guards and flashes. This is the only place the plan is refetched from; there is no Insurance plan tab.

Sending (Send validation, Check again, Send again), checked in this order before anything is sent; each failure is a red flash:
- "Choose whether this check is a validation, a benefits check or a discovery." (the server's guard on the purpose; this tab always sends the case's last purpose, default `validation`)
- "Member ID is required for an eligibility check."
- "Policy code is required for a validation check." (or "... for a benefits check." when the last purpose was a benefits check)
- "Set the facility's HFR ID under Settings before raising claims."
- "Set the facility's NHCX participant code under Settings before raising claims."

API: [A2. Coverage Eligibility Check](../apis/A2-coverage-eligibility-check.md)

After a queued send the case moves to Awaiting payer (`checking`) and any earlier error is cleared. Flash: "Eligibility request queued to the payer." A failed send leaves the case `error` and flashes the error in red.

**Waiting for the reply.** Every load of S6 (and the Refresh button) looks once for the reply while the case is `checking`. A poll failure leaves the case waiting and shows the poll note.

Callback: [C2. Coverage Eligibility Verdict](../callbacks/C2-coverage-eligibility-on-check.md)

API: [A10. Transaction Related](../apis/A10-txn-related.md) (poll)

API: [A12. Transaction FHIR](../apis/A12-txn-fhir.md) (poll)

API: [A13. Transaction List](../apis/A13-txn-list.md) (poll, rejection lookup)

API: [A11. Transaction Dispatch](../apis/A11-txn-dispatch.md) (poll, dispatch status)

Data: [D9. claim](../database/D9-claim.md)

#### S3L. LAYOUT
The arrangement below is the reference implementation's [REF](../references/PAYERS.md#markers): follow the target HMIS's own screen conventions. What is required is in DESCRIPTION and ACTIONS: the fields, options, columns, statuses, messages and actions.


```
|------------------------------------------------------------------|
| [S6 header, next actions and tab bar; Overview tab active]       |
|------------------------------------------------------------------|
| [Card] Members on this cover          (only while still to choose)|
|  The payer returned 3 members on this cover. Choose the one ...  |
|  +----------------------------+ +----------------------------+   |
|  | (AD) Asha Devi  [answered about] | (RK) Ravi Kumar          |   |
|  |      MD5SLS4X5             | |      MD5SLS4X5-02          |   |
|  | Female · born 1984-02-11 · Self | Male · born 2012-06-01 ·  |   |
|  | [This is the patient]      | | [This is the patient]      |   |
|  +----------------------------+ +----------------------------+   |
|------------------------------------------------------------------|
| [Card] Beneficiary details                                       |
|  +------+  NAME            MEMBER ID        ABHA                 |
|  | photo|  Asha Devi       MD5SLS4X5        91703412374240       |
|  | / AD |  MOBILE          GENDER           DATE OF BIRTH        |
|  +------+  -               Female           1984-02-11           |
|            ADDRESS         FOUND BY                              |
|            ...             Member ID · MD5SLS4X5                 |
|------------------------------------------------------------------|
| [Card] Policy details                                            |
|  POLICY CODE     PRODUCT               PAYER                     |
|  PMJAY/HP/S/G    PMJAY for Himachal    Nhcx Pmjay                |
|                  PMJAY/HP/S/G          <payer code>              |
|  PLAN            PLAN PERIOD           RELATIONSHIP              |
|  ...             2026-04-01 → 2027-03-31   Self                  |
|------------------------------------------------------------------|
| [Card] Validation [Eligible]                  [(o) Check again]  |
|  Wallet                                                          |
|  [Sum insured  ] [Utilised     ] [Wallet balance]                |
|  [₹500,000     ] [₹305,951     ] [₹194,049      ]                |
|  POLICY ACTIVE        DISPOSITION          CHECKED AT            |
|  Active (in force)    ...                  18 Oct 2026, 8:41 am  |
|  +------------------------------------------------------------+  |
|  | Insurance plan: fetched 18 Oct 2026, 8:43 am               |  |
|  |                               [(o) Refetch insurance plan] |  |
|  +------------------------------------------------------------+  |
|------------------------------------------------------------------|

While awaiting the payer:
| [Card] Validation [Awaiting payer]             [(o) Send again]  |
|  Eligibility validation sent to the payer; awaiting the on_check |
|  reply. Use Refresh to check for it.                             |
|  Could not poll the gateway: ...   (muted, only on failure)      |
|  SENT AT                                                         |
```

- Detail grids use small uppercase muted labels over the value, three columns from small screens up.
- The stat tiles sit in a grid: one column on phones, three from small screens up.
- The member cards sit in a grid: one column on phones, two from medium screens up.

#### S3A. ACTIONS
1. Send validation / Check again: run the guards, send the validation (A2), set the case to Awaiting payer, and re-read S6 on this tab with "Eligibility request queued to the payer."
2. Send again (only while awaiting the payer): after the confirm, resend the same check. The check is never offered as a second, parallel exchange, so two checks on one case cannot be answered out of order; this button is the only way out of a stalled exchange.
3. Refresh (in the S6 header while awaiting): re-read S6, which polls once for the on_check reply.
4. This is the patient: post the member id, write that person onto the case, re-read S6 on this tab with "<name> is the patient on this case."
5. Fetch insurance plan / Refetch insurance plan: S7's fetch, from the plan row of the Validation card.
6. After the validation is in force the next action is on the Pre-authorisation tab ("Fetch the package master" while no plan is ready, then "Quote the treatment"). With the patient still to choose, the members card on this tab is the next step.
