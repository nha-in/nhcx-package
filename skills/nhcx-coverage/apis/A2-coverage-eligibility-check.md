# A2. Coverage Eligibility Check

#### A2E. ENDPOINT
In-process: `gateway.send("v1/coverageeligibility/check", envelope)`, [G7. Send](../gateway/G7-send.md). G7 encrypts and posts it to NHCX: `POST {nhcx}/v1/coverageeligibility/check`. The payer answers asynchronously with `v1/coverageeligibility/on_check`, taken in by [G8. Receive](../gateway/G8-receive.md) and handed to the callback door C1 (type `coverage`), or found by polling the [G9. Ledger](../gateway/G9-ledger.md) (A10 to A13).

#### A2D. DESCRIPTION
Sends a `CoverageEligibilityRequest` bundle to the payer. The app builds the bundle itself; G7 only completes the headers, encrypts and dispatches it. The call returns NHCX's acceptance only; the verdict arrives later on the same correlation id.

One bundle shape serves four purposes:

| Purpose | Asked when | Policy code | `item[]` | Stored on |
|---|---|---|---|---|
| `validation` | at registration: is the policy in force? Also the gate that turns a provisional case into a case (below) | required | none | the case |
| `benefits` | "Ask cover", before a pre-authorisation or an enhancement: what does the policy cover for the lines quoted so far? | required | the lines quoted so far, when there are any | the case |
| `discovery` | the policy is not yet known: find active coverage | optional (`NONE` in the bundle) | none | the case |
| `auth-requirements` | on the chosen procedure set, before a pre-authorisation and again before an enhancement | the case's, `NONE` if it has none | the quoted procedure set, required | the ruling (`claim_auth`), not the case |

The first three are the eligibility check, sent with the purpose, policy code and member id. `auth-requirements` is the procedure-set ruling, sent two ways:
- by the operator, to any payer: the check is optional and is not tied to an adapter;
- automatically, and never waited on, just before a pre-authorisation or enhancement is submitted (A4), when the case's policy is in force (`in_force`, below), it has lines, the payer's adapter sends this check unasked ([PAYERS.md](../references/PAYERS.md)), and the set has not already been asked about (a ruling not in `error` whose fingerprint equals the current set). A failure of this automatic send is swallowed and the pre-authorisation goes anyway.

**The validation gate.** A case is provisional (hidden from the claim lists) from the moment it is opened (a policy chosen from the search, S2, or a cover taken from a discovery, S17) until a validation answers that the policy is in force. Opening it sends the validation at once; a refused send leaves it provisional with the reason ("The validation was not sent: <reason>"), and the desk sends it again. The verdict (C2) clears the flag only for a `validation` answering in force, and only once the patient is known: on a cover with several members the desk first chooses the patient ([S3. Policy Discovery](../screens/S3-policy-discovery.md)). A discovery's answer names covers and never makes a case.

**`in_force(case)`.** Every gate that asks "is the policy in force?" (the automatic and the manual auth-requirements check, the admission link, the pre-authorisation send, the pre-authorisation screen, the plan refetch row) reads this, never the raw status: the validation said `eligible`, and a later benefits check that is waiting (`checking`) or whose send failed (`error`) does not withdraw it. So `in_force` is true when the case's status is `eligible`, or when the case is not provisional, its last purpose is `benefits` and its status is `checking` or `error`.

**The insurance plan follows the validation.** When a validation leaves an open case (not provisional) `eligible` and the case holds no plan row, and again when choosing the patient on a several-member cover opens the case, the plan is fetched without the desk asking (A3 `plan_on_case_created`): a `ready` plan of the same policy, HFR id and payer is copied first, else the payer is asked. It never raises; the desk can still fetch.

JWE headers: the app sets these, plus the beneficiary's user token when the case has a linked patient and the desk holds a current stage-`Preauth` authentication for that patient and this payer ([A18. Biometric Authentication](A18-biometric-authentication.md), any payer, every purpose; a case with no patient yet sends none), and `x-hcx-ben-abha-id` whenever an ABHA number is known: the token's ABHA when a token is held, else the case's ABHA number (14 digits, sent as `XX-XXXX-XXXX-XXXX`), else the header is **left out**. The beneficiary's ABHA is never mandatory for a check: a beneficiary found by member id with no ABHA is checked without the header. G7 generates ([G5. Protocol Headers](../gateway/G5-protocol-headers.md)) `x-hcx-api_call_id`, `x-hcx-request_id`, `x-hcx-correlation_id` and `x-hcx-timestamp`.
- `x-hcx-sender_code`: the facility's NHCX participant code (Settings).
- `x-hcx-recipient_code`: the policy's `processing_id` from the policy search (A1), else its `payer_id`, else the configured default payer code. NHA's documentation is explicit that the recipient is the processing id, not the payer id (NHCX-1003 otherwise) [REF](../references/PAYERS.md#markers). A discovery sent on an existing case to a payer chosen on [S17. Beneficiary Discovery](../screens/S17-beneficiary-discovery.md) goes to that payer.
- `x-hcx-workflow_id`: `11` (Patient Admitted, NHA's own sample) for every purpose, the one default; a module setting (`eligibility_workflow_id`, `11` or `case`) sends the case number instead for a payer that wants it. Both are accepted by the sandbox payers [SANDBOX](../references/PAYERS.md#markers). (The adapter's workflow-id table is not used for this call; see [PAYERS.md](../references/PAYERS.md).)
- `x-hcx-status`: `request.initiated`.

Refused before any call, eligibility check (in this order):
- "Claim not found."
- purpose not validation, benefits or discovery: "Choose whether this check is a validation, a benefits check or a discovery."
- no member id, unless it is a discovery that names a policy number: "Member ID is required for an eligibility check."
- "Policy code is required for a validation check." / "Policy code is required for a benefits check."
- "Set the facility's HFR ID under Settings before raising claims."
- "Set the facility's NHCX participant code under Settings before raising claims."

Refused before any call, auth-requirements:
- "Claim not found."
- not `in_force`: "Check the policy's eligibility before validating a procedure set against it."
- no lines: "Choose the line items first, this checks the procedure set, so there has to be one."
- "Set the facility's HFR ID and NHCX participant code under Settings before checking requirements."

Success flashes: "Eligibility request queued to the payer." (a check, a resend, a discovery) and "Procedure set sent to the payer for validation." (auth-requirements).

**The handle of a discovery.** A discovery sent from the discovery page ([S17. Beneficiary Discovery](../screens/S17-beneficiary-discovery.md)) names the policy by **one of two handles**, `id_type` `PolicyNo` or `MemberId` with `id_value`: a policy number goes out as the Coverage identifier typed `NH` ([F18. Coverage](../fhir/F18-coverage.md)) and the bundle names no member (no `subscriberId`, no `MB` identifier); a member id goes out as `subscriberId` and the Patient identifier typed `MB` ([F15. Patient](../fhir/F15-patient.md)). Older callers that named the person by `AbhaNumber` or `MobileNo` are still read: the value becomes that additional handle below.

**Additional information on a discovery.** The request may also carry what else the desk knows about the person, so the payer has more than one handle to match on. Each is optional and is left out of the bundle when empty ([F15. Patient](../fhir/F15-patient.md)):

| Field | Rule | In the bundle |
|---|---|---|
| Aadhaar number | 12 digits once spaces and hyphens are removed, else "An Aadhaar number has 12 digits" | Patient identifier typed `ADN` |
| Mobile number | 10 digits once spaces, hyphens and a leading +91 are removed, else "A mobile number has 10 digits" | Patient `telecom`, system `phone` |
| ABHA number | 14 digits once spaces and hyphens are removed, else "An ABHA number has 14 digits" | Patient identifier typed `ABHA`; also the `x-hcx-ben-abha-id` header |

Refused before any call, in this order: "Choose the payer to ask", "Enter the policy number or the member id to ask about", then the three digit rules above. The patient is optional: the desk may discover on the policy handles alone and link a registered patient later.

The Aadhaar number is sent to the payer and kept in the stored bundle; screens that list a check show its last four digits only.

**A discovery needs a case to land on.** C2 matches the verdict by correlation id against a D9 row, and a discovery started from [S17. Beneficiary Discovery](../screens/S17-beneficiary-discovery.md) usually has none yet. So `discover()` opens a draft, provisional case for the chosen payer first (D9: `status` `draft`, `provisional` true, `patient_id` when one was chosen, `payer_id` and `processing_id` the payer code, `member_id` the member id given (empty for a policy-number discovery), `policy_code` the policy number given, `abha_number` and `mobile_number` from the additional information), then sends on it; the cover the desk picks from the answer is applied to that same case (policy code, member id, product and plan name, beneficiary name), which stays provisional and is validated at once. The facility guard (HFR id and participant code set) is checked **before** the case is created, so a refusal leaves no orphan case. A discovery sent from an existing case goes on that case, to the payer chosen on the page.

The bundle builder itself refuses a bundle without a member id ("A coverage check needs the member id to ask about."; a discovery that carries a policy number is the one exception), without the facility registry id ("A coverage check needs the facility's registry id.") or without a payer code ("A coverage check needs the payer's participant code.").

#### A2Q. REQUEST

The envelope's fields are the arguments passed to G7 Send.

| Field | Type | Required | Value |
|---|---|---|---|
| `jwe_headers.x-hcx-sender_code` | string | yes | facility participant code |
| `jwe_headers.x-hcx-recipient_code` | string | yes | payer participant code |
| `jwe_headers.x-hcx-workflow_id` | string | yes | `11`, or the case number under the setting |
| `jwe_headers.x-hcx-status` | string | yes | `request.initiated` |
| `jwe_headers.x-hcx-ben-abha-id` | string | no | the token's or the case's ABHA number, left out when none is known |
| `fhir` | object | yes | the `CoverageEligibilityRequest` bundle |

FHIR: [F1. Bundle](../fhir/F1-bundle.md), [F2. CoverageEligibilityRequest](../fhir/F2-coverage-eligibility-request.md), [F15. Patient](../fhir/F15-patient.md), [F17. Organization](../fhir/F17-organization.md), [F18. Coverage](../fhir/F18-coverage.md), [F16. Practitioner and PractitionerRole](../fhir/F16-practitioner.md), [F19. Other bundle resources](../fhir/F19-other-resources.md) (Location)

Envelope, an auth-requirements check from a case file:

```json
{
 "jwe_headers": {
  "x-hcx-sender_code": "<facility code>",
  "x-hcx-recipient_code": "<payer code>",
  "x-hcx-workflow_id": "11",
  "x-hcx-status": "request.initiated"
 },
 "fhir": <F1 Bundle carrying F2 CoverageEligibilityRequest (purpose auth-requirements), F15 Patient, F17 provider and payer Organizations, F19 Location, F18 Coverage, F16 PractitionerRole>
}
```

A validation or discovery check is the same envelope with its own purpose and no `item`.

#### A2S. RESPONSE
Acknowledgement, the G7 result:

```
{"ok": true, "gateway_status": 202, "txn_id": "01M07CJ...", "ledger_id": "01M07CJ...",
 "correlation_id": "<uuid>", "request_id": "<uuid>",
 "headers": {"x-hcx-correlation_id": "<uuid>", ...}, "response": <NHCX's acceptance>, ...}
```

The ids (`txn_id`, `correlation_id`) are stored on the leg (the case for the first three purposes, the ruling for auth-requirements), the leg goes to `checking` and any earlier error is cleared. A re-asked ruling drops the previous ruling's items and requirements. A benefits check puts the case itself in `checking` (and `error` on a failed send); `in_force` keeps the pre-authorisation open meanwhile. The correlation id is also added to the case's thread list (`correlation_ids`, D9) for the Logs tab, whether the send succeeded or failed under ids. NHCX itself answers G7 `202 request.queued`.

A failed send that names its ids keeps them on the leg, sets it to `error` with the G7 error's message (or NHCX's refusal when `ok` is false), and raises the error (shared convention). A failed send naming no ids leaves the leg as it was.

Data: [D9. claim](../database/D9-claim.md), [D13. claim_auth](../database/D13-claim-auth.md), [D14. claim_auth_item](../database/D14-claim-auth-item.md), [D15. claim_auth_requirement](../database/D15-claim-auth-requirement.md)

Reply: [C2. Coverage Eligibility Verdict](../callbacks/C2-coverage-eligibility-on-check.md) (validation, benefits, discovery), C3. Authorisation Requirements Ruling (in nhcx-preauth) (auth-requirements)

- A dispatch that failed (for example `CERT_NOT_FOUND` for an unregistered recipient) comes back from G7 at once as a failed send under its ids; A11 reads the same outcome from the G9 ledger.

#### A2P. PSEUDOCODE

```
// shared send convention (every outbound bundle), in-process through G7
function SEND(path, envelope, case):
    // envelope.jwe_headers carries x-hcx-status as the send kind sets it (PAYERS.md)
    try:
        result = gateway.send(path, envelope)       // G7 Send, posts to {nhcx}/<path>
    catch gateway_unavailable as e:
        refuse "The NHCX gateway is not available: " + e.message   // nothing went out
    catch send_error:                               // G7 SendError {code, message, retryable, ...}
        archive envelope and send_error with the case (outbound)
        remember_thread(case, send_error.correlation_id)
        if send_error names ids (txn_id, correlation_id):
            return ack = those ids, failed = send_error
        raise send_error                            // nothing went out; nothing written
    archive envelope and result with the case (outbound)
    remember_thread(case, result.correlation_id)
    ack = {txn_id: result.txn_id, correlation_id: result.correlation_id,
           request_id: result.request_id}
    if not result.ok:                               // NHCX did not accept it; ledger row "rejected"
        return ack, failed = NHCX's refusal (APIs conventions)
    return ack, failed = none

function remember_thread(case, correlation_id):     // the Logs tab's threads (A13); never raises
    if correlation_id and correlation_id not in case.correlation_ids:
        UPDATE claim[case.id] SET correlation_ids = case.correlation_ids + [correlation_id]

function in_force(case):
    if case.status == eligible: return true
    return not case.provisional and case.purpose == benefits and case.status in {checking, error}

// validation, benefits, discovery
function run_check(case_id, purpose, policy_code, member_id, extras = none, payer_code = none):
    case = claim[case_id]                  or refuse "Claim not found."
    if purpose not in {validation, benefits, discovery}:
        refuse "Choose whether this check is a validation, a benefits check or a discovery."
    policy_code = trim(policy_code); member_id = trim(member_id)
    if member_id empty and not (purpose == discovery and policy_code):
        refuse "Member ID is required for an eligibility check."
    if purpose in {validation, benefits} and policy_code empty:
        refuse "Policy code is required for a <purpose> check."
    org = the case's facility profile
    if org.identifier_value empty:
        refuse "Set the facility's HFR ID under Settings before raising claims."
    if org.participant_code empty:
        refuse "Set the facility's NHCX participant code under Settings before raising claims."

    // gather
    adapter = payer adapter for payer_code or case.payer_id
    // no patient row is read: the eligibility Patient (F15) carries identifiers only, no demographics
    items   = (purpose == benefits) ? eligibility items from claim_line (one per package
              or implant, ward tiers as modifiers) : []

    // build (builder refuses missing member id, registry id or payer code)
    bundle = build F2 CoverageEligibilityRequest bundle (F1) with purpose, member id,
             policy code (else NONE), F15 Patient (plus extras: Aadhaar, mobile, ABHA on a discovery),
             F17 provider (org HFR ID, name) and payer (payer_code or case.payer_id or default
             payer code; the registry's name), F18 Coverage, F19 Location, F16 PractitionerRole, items

    // headers
    token = case.patient_id ? biometric_headers(case, payer_code or case.payer_id, Preauth) : {}   // A18; {} when none held
    abha  = token's ABHA or hyphenated(case.abha_number when it has 14 digits) or none

    // call
    ack, failed = SEND("v1/coverageeligibility/check", {
        jwe_headers: {x-hcx-sender_code: org.participant_code,
                      x-hcx-recipient_code: payer_code or case.processing_id or case.payer_id
                                            or default payer code,
                      x-hcx-workflow_id: case.claim_no if settings.eligibility_workflow_id == "case" else "11",
                      x-hcx-status: request.initiated,
                      x-hcx-ben-abha-id: abha (left out when none),
                      <user-token header>: token (left out when none)},
        fhir: bundle}, case)

    // write
    UPDATE claim[case_id] SET status = checking, purpose, policy_code = policy_code or
        the stored one, member_id, txn_id = ack.txn_id, correlation_id = ack.correlation_id,
        checked_at = now, error_message = null; recompute case stage
    if failed:
        same update with status = error, error_message = failed.message
        raise failed

// "Send again" while awaiting: the same check, the case's last purpose (default validation)
function resend_check(case_id):
    run_check(case_id, case.purpose or validation, case.policy_code, case.member_id)

// opening a case (S2 Select, S17 cover chosen): provisional, validated at once
function open_and_validate(case_id):
    UPDATE claim[case_id] SET provisional = true
    try: run_check(case_id, validation, case.policy_code, case.member_id)
         flash "Validating the policy with the payer."
    catch refusal r: flash "The validation was not sent: " + r.message   // stays provisional

// discovery from the discovery page (S17)
function discover(patient_id, payer_code, id_type, id_value, extra, case_id = none):
    payer_code = trim(payer_code)
    if payer_code empty: refuse "Choose the payer to ask"
    policy_no = id_value if id_type == PolicyNo
    member    = id_value if id_type == MemberId else trim(extra.member_id)
    if id_type == AbhaNumber: extra.abha_number = id_value      // older callers
    if id_type == MobileNo:   extra.mobile = id_value
    if policy_no empty and member empty: refuse "Enter the policy number or the member id to ask about"
    check the Aadhaar (12), mobile (10, a leading +91 dropped) and ABHA (14) digit rules, refusing with their texts
    if case_id:                                              // a discovery on an existing case
        return run_check(case_id, discovery, policy_no, member, extra, payer_code)
    org = the facility profile
    if org.identifier_value empty or org.participant_code empty:
        refuse the Settings message above                    // checked BEFORE any case is created
    case_id = INSERT claim {status: draft, provisional: true, patient_id (optional),
                            payer_id: payer_code, processing_id: payer_code, payer_name: registry name,
                            member_id: member or "", policy_code: policy_no or null,
                            abha_number: extra.abha_number, mobile_number: extra.mobile,
                            search_id_type, search_id_value, claim_no: next number}
    run_check(case_id, discovery, policy_no, member, extra)
    return case_id                                           // the chosen cover is applied to this case

// auth-requirements, by the operator
function request_auth(case_id):
    case = claim[case_id]                  or refuse "Claim not found."
    if not in_force(case):
        refuse "Check the policy's eligibility before validating a procedure set against it."
    // any payer may be asked: the adapter decides only the automatic send below
    lines = claim_line rows of the case
    if lines empty:
        refuse "Choose the line items first, this checks the procedure set, so there has to be one."
    org = the case's facility profile
    if org HFR ID or participant code empty:
        refuse "Set the facility's HFR ID and NHCX participant code under Settings before checking requirements."

    bundle = build F2 bundle with purpose auth-requirements, case.member_id,
             case.policy_code, org HFR ID and name, payer code and name,
             items = eligibility items from lines

    ack, failed = SEND("v1/coverageeligibility/check", envelope as above, case)

    values = {status: checking, txn_id: ack.txn_id, correlation_id: ack.correlation_id,
              requested_at: now, settled_at: null, error_message: null,
              outcome: null, disposition: null, inforce: null, response_json: null,
              asked_codes: fingerprint of the quoted procedure set}
    if failed: values.status = error; values.error_message = failed.message
    in one transaction:
        if no claim_auth row for the case: INSERT claim_auth (values, claim_id)
        else:
            DELETE claim_auth_item        WHERE auth_id = ruling.id
            DELETE claim_auth_requirement WHERE auth_id = ruling.id
            UPDATE claim_auth[ruling.id] SET values
    if failed: raise failed

// auth-requirements, automatic (called by A4 before each pre-auth or enhancement send)
function ensure_auth_requirements(case_id):
    case = claim[case_id]
    if case missing or not in_force(case) or no claim_line rows: return false
    if not adapter.auth_requirements:                                  return false
    ruling = claim_auth for the case
    if ruling exists and ruling.status != error
       and ruling.asked_codes == fingerprint of current set:           return false
    try: request_auth(case_id)
    catch any refusal or G7 error: return false                        // swallowed; the send goes on
    return true
```

#### A2U. USED BY
- Screens: [S2. Select Policy](../screens/S2-select-policy.md), [S3. Policy Discovery](../screens/S3-policy-discovery.md), [S17. Beneficiary Discovery](../screens/S17-beneficiary-discovery.md)
- APIs: [A1. Policy Search](A1-policy-search.md), [A10. Transaction Related](A10-txn-related.md), [A11. Transaction Dispatch](A11-txn-dispatch.md), [A13. Transaction List](A13-txn-list.md), [A18. Biometric Authentication](A18-biometric-authentication.md)
- Callbacks: [C1. Callback Door](../callbacks/C1-callback-door.md), [C2. Coverage Eligibility Verdict](../callbacks/C2-coverage-eligibility-on-check.md)
- FHIR: [F1. Bundle](../fhir/F1-bundle.md), [F15. Patient](../fhir/F15-patient.md), [F18. Coverage](../fhir/F18-coverage.md)
- Database: [D9. claim](../database/D9-claim.md), [D13. claim_auth](../database/D13-claim-auth.md), [D31. biometric_auth](../database/D31-biometric-auth.md)
- Gateway: [G1. Embedding](../gateway/G1-embedding.md), [G5. Protocol Headers](../gateway/G5-protocol-headers.md), [G7. Send](../gateway/G7-send.md)
- Tests: [T3. IRDAI Policy Search and Eligibility](../tests/T3-irdai-policy-and-eligibility.md), [T13. PMJAY Eligibility, Package Master and Ruling](../tests/T13-pmjay-eligibility-and-package-master.md), [T19. PMJAY Beneficiary Verification and ABHA](../tests/T19-pmjay-biometric-and-abha.md)
