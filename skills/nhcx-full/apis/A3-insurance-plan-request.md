# A3. Insurance Plan Request

#### A3E. ENDPOINT
In-process: `gateway.send("v1/insuranceplan/request", envelope)`, [G7. Send](../gateway/G7-send.md). G7 encrypts and posts it to NHCX: `POST {nhcx}/v1/insuranceplan/request`. The payer answers asynchronously with `v1/insuranceplan/on_request`, taken in by [G8. Receive](../gateway/G8-receive.md) and handed to the callback door C1 (type `insurance`), or found by polling the [G9. Ledger](../gateway/G9-ledger.md) (A10 to A13).

#### A3D. DESCRIPTION
Asks the payer for its package master (the InsurancePlan) for this policy and this facility: every empanelled category, the packages under it, their rates, ward and implant tiers, claim conditions, the documents each package needs and the questionnaires those documents point at. It is the only exchange whose request carries no clinical content: a discovery `Task` naming a policy number and the facility's HFR ID.

The master is held per case ([D10. claim_plan](../database/D10-claim-plan.md)): the payer may answer the same policy and facility differently for different beneficiaries, so what one case was priced on is never assumed to hold for another. On a first fetch the app first looks for a `ready` master already held on another case with the same payer, the same policy code and the same facility HFR ID. When there is one, the newest is copied onto this case with its packages and forms and no request goes out. "Fetch again" (refresh) always asks the payer. A full scheme master runs to tens of megabytes [PAYER](../references/PAYERS.md#markers).

**Fetched without asking.** The desk rarely presses the button:
- when a validation leaves an open case (not provisional) in force and the case holds no plan row (C2, and the desk choosing the patient on a family cover), `plan_on_case_created` runs `request_plan` as a first fetch: the held master is copied, else the payer is asked. It runs after the verdict is committed, beside the callback's answer, and **never raises**: a refusal (no HFR ID, a request outstanding) is logged and the desk can still fetch from the Overview;
- when the case is opened (S6) or its plan is read, a case with a policy code and no plan row takes a held `ready` master by copy only; nothing is sent from there.

JWE headers: the app sets these; G7 generates the rest ([G5. Protocol Headers](../gateway/G5-protocol-headers.md)).
- `x-hcx-sender_code`: the facility's NHCX participant code.
- `x-hcx-recipient_code`: the case's `processing_id`, else its `payer_id`, else the configured default payer code.
- `x-hcx-workflow_id`: `1`. The plan belongs to the hospital and the policy, never to a case, and NHA publishes no workflow code for the request; the live PMJAY provider sends `1` and PMJAY answers it [PAYER](../references/PAYERS.md#markers). The case number is never sent: a module setting (`plan_workflow_id`, default `1`) may name another value, and a legacy `case` value reads as `1`. The exchange is found again by its correlation id, which the plan row keeps.
- `x-hcx-status`: `request.initiated`.

**One request at a time for a government payer.** PMJAY answers a plan request in 15 to 60 minutes and refuses a second request for the same policy meanwhile (PAYR-1406) [SANDBOX](../references/PAYERS.md#markers). Under the `gov` adapter, while a request for the same payer (numeric part of the code), policy and HFR ID is still `fetching` and was sent less than 60 minutes ago (on this case or another), no second one is sent, on a first fetch or a refresh: re-sending would overwrite the outstanding correlation id and leave the real answer unmatched.

Refused before any call, in this order:
- "Claim not found."
- while the payer returned several members and none is chosen yet: "Choose which member of the policy is the patient on the Overview tab first."
- (a first fetch copies a held master here, and stops)
- "Set the facility's HFR ID under Settings before fetching a package master."
- "Set the facility's NHCX participant code under Settings before fetching a package master."
- with neither a policy code nor an HFR ID: "A plan request needs a policy code or the facility's HFR ID."
- a request outstanding under the `gov` adapter: "The package master of <policy code> was already requested at <YYYY-MM-DD HH:MM:SS> (correlation <correlation id>); the payer refuses a second request meanwhile (PAYR-1406), so none is sent."

Flashes: "Insurance plan requested from the payer." after a send; "Using the package master already held for this policy - Fetch again asks the payer for a new one." after a copy.

#### A3Q. REQUEST

The envelope's fields are the arguments passed to G7 Send.

| Field | Type | Required | Value |
|---|---|---|---|
| `jwe_headers.x-hcx-sender_code` | string | yes | facility participant code |
| `jwe_headers.x-hcx-recipient_code` | string | yes | payer participant code |
| `jwe_headers.x-hcx-workflow_id` | string | yes | `1` [PAYER](../references/PAYERS.md#markers) |
| `jwe_headers.x-hcx-status` | string | yes | `request.initiated` |
| `fhir` | object | yes | a Task bundle naming the policy number (when the case has one) and the facility HFR ID |

FHIR: [F1. Bundle](../fhir/F1-bundle.md), [F4. Task (InsurancePlan discovery)](../fhir/F4-task-insuranceplan.md)

Envelope, from a case file:

```json
{
 "jwe_headers": {
  "x-hcx-sender_code": "<facility code>",
  "x-hcx-recipient_code": "<payer code>",
  "x-hcx-workflow_id": "1",
  "x-hcx-status": "request.initiated"
 },
 "fhir": <F1 Bundle carrying one F4 Task (policyNumber POL7UMU001, providerId IN1910000151)>
}
```

#### A3S. RESPONSE
Acknowledgement: the G7 result, `{"ok": true, "gateway_status": 202, "txn_id": "...", "correlation_id": "...", "request_id": "...", "headers": {...}, "response": ...}`. The plan goes to `fetching` under its ids (`txn_id`, `correlation_id`) and every earlier result is cleared. A refetch deletes the case's stored packages before the answer lands, so a stale package cannot survive. A failed send that names its ids keeps them and sets the plan to `error` (shared convention). The correlation id joins the case's thread list (`correlation_ids`) as on every send.

Plan statuses: `fetching` (Awaiting payer), `ready`, `empty` (No plan returned), `error`.

Data: [D10. claim_plan](../database/D10-claim-plan.md), [D11. claim_plan_benefit](../database/D11-claim-plan-benefit.md), [D12. claim_plan_form](../database/D12-claim-plan-form.md)

Reply: [C4. Insurance Plan Reply](../callbacks/C4-insuranceplan-on-request.md)

- A failed dispatch comes back from G7 at once as a failed send. While polling, a failed dispatch read from the G9 ledger (A11) or a transaction G9 no longer holds (A10) sets the plan to `error`.

#### A3P. PSEUDOCODE

```
// shared send convention (every outbound bundle), in-process through G7: SEND and
// remember_thread exactly as A2P

// the desk's "Fetch insurance plan" / "Fetch again" (refresh)
function plan_fetch_route(case_id, refresh):
    case = claim[case_id]                  or refuse "Claim not found."
    if case.beneficiary_pending: refuse "Choose which member of the policy is the patient on the Overview tab first."
    return request_plan(case_id, refresh)

function request_plan(case_id, refresh = false):
    case = claim[case_id]                  or refuse "Claim not found."
    org = the case's facility profile
    if not refresh and reuse_plan(case_id, org.identifier_value):
        return {reused: true, message: "Using the package master already held for this policy - Fetch again asks the payer for a new one."}

    if org.identifier_value empty:
        refuse "Set the facility's HFR ID under Settings before fetching a package master."
    if org.participant_code empty:
        refuse "Set the facility's NHCX participant code under Settings before fetching a package master."

    provider_id = org.identifier_value
    policy_code = trim(case.policy_code)
    if policy_code empty and provider_id empty:
        refuse "A plan request needs a policy code or the facility's HFR ID."
    if adapter(case.payer_id) is gov and policy_code:
        pending = newest claim_plan WHERE status = fetching AND policy_code = policy_code
                  AND provider_id = provider_id AND requested_at >= now - 60 minutes
                  AND numeric part of its case's payer_id == numeric part of case.payer_id
        if pending:
            refuse "The package master of <policy_code> was already requested at <pending.requested_at,
                    local, YYYY-MM-DD HH:MM:SS> (correlation <pending.correlation_id>); the payer refuses
                    a second request meanwhile (PAYR-1406), so none is sent."
    bundle = F1 Bundle carrying F4 Task with input policyNumber (when policy_code)
             and input providerId (provider_id)

    ack, failed = SEND("v1/insuranceplan/request", {
        jwe_headers: {x-hcx-sender_code: org.participant_code,
                      x-hcx-recipient_code: case.processing_id or case.payer_id or default payer code,
                      x-hcx-workflow_id: settings.plan_workflow_id or "1",   // "case" reads as "1"
                      x-hcx-status: request.initiated},
        fhir: bundle}, case)

    values = {status: fetching, txn_id: ack.txn_id, correlation_id: ack.correlation_id,
              requested_at: now, fetched_at: null, error_message: null,
              policy_code: policy_code or null, provider_id,
              plan_identifier: null, plan_title: null, plan_type: null,
              sum_insured: null, policy_documents: null, response_json: null}   // every earlier result, D10
    if failed: values.status = error; values.error_message = failed.message
    in one transaction:
        if no claim_plan row for the case: INSERT claim_plan (values, claim_id)
        else:
            DELETE claim_plan_benefit WHERE plan_id = plan.id
            UPDATE claim_plan[plan.id] SET values
    if failed: raise failed
    return {reused: false, message: "Insurance plan requested from the payer."}

function reuse_plan(case_id, hfr_id):
    if trim(case.policy_code) empty or hfr_id empty: return false
    source = newest claim_plan (by fetched_at, then id) WHERE status = ready
             AND claim_id != case_id AND policy_code = case.policy_code
             AND provider_id = hfr_id AND its case's payer_id = case.payer_id
    if none: return false
    in one transaction:
        copy every source column except id and claim_id onto this case's claim_plan
            (INSERT, or DELETE its claim_plan_benefit and claim_plan_form rows and UPDATE)
        copy every claim_plan_benefit and claim_plan_form row of source onto this plan,
            in one bulk insert per table (a master is thousands of rows; never row by row)
    return true

// a validation left an open case in force (C2, or the desk choosing the patient on S3)
function plan_on_case_created(case_id):                      // never raises
    case = claim[case_id]
    if case missing or case.provisional or case.status != eligible: return
    if a claim_plan row exists for the case: return          // already held, fetching, empty or error
    try: return request_plan(case_id, refresh = false).message
    catch any refusal or error: log it; return none          // the desk can still fetch
    // run after the verdict's write is committed, off the callback's own answer

// opening the case (S6) or reading its plan: copy only, nothing is sent
function reuse_on_open(case_id):
    if case.provisional or case.policy_code empty or a claim_plan row exists: return
    try: reuse_plan(case_id, org HFR ID) catch any error: log it
```

#### A3U. USED BY
- Screens: [S7. Insurance Plan](../screens/S7-insurance-plan.md)
- APIs: [A2. Coverage Eligibility Check](A2-coverage-eligibility-check.md), [A10. Transaction Related](A10-txn-related.md), [A11. Transaction Dispatch](A11-txn-dispatch.md), [A13. Transaction List](A13-txn-list.md)
- Callbacks: [C2. Coverage Eligibility Verdict](../callbacks/C2-coverage-eligibility-on-check.md), [C4. Insurance Plan Reply](../callbacks/C4-insuranceplan-on-request.md)
- FHIR: [F4. Task (InsurancePlan discovery)](../fhir/F4-task-insuranceplan.md)
- Database: [D10. claim_plan](../database/D10-claim-plan.md), [D11. claim_plan_benefit](../database/D11-claim-plan-benefit.md)
- Tests: [T3. IRDAI Policy Search and Eligibility](../tests/T3-irdai-policy-and-eligibility.md), [T4. IRDAI Insurance Plan and Authorisation Requirements](../tests/T4-irdai-plan-and-auth-requirements.md), [T13. PMJAY Eligibility, Package Master and Ruling](../tests/T13-pmjay-eligibility-and-package-master.md)
