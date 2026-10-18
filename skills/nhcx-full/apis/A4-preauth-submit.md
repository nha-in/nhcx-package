# A4. Pre-auth Submit

#### A4E. ENDPOINT
In-process: `gateway.send("v1/preauth/submit", envelope)`, [G7. Send](../gateway/G7-send.md), which encrypts it and posts it to NHCX for the payer: `POST {nhcx}/v1/preauth/submit`. The payer's answer comes back asynchronously on `preauth/on_submit` (taken in by [G8. Receive](../gateway/G8-receive.md), callback C5 through the callback door C1, type `preauth`, or found by polling the [G9. Ledger](../gateway/G9-ledger.md), A10 / A11 / A12 / A13).

#### A4D. DESCRIPTION
Sends the pre-authorisation Claim bundle (`Claim.use = preauthorization`) for one case, in four send kinds that share one bundle and differ only in the Claim's anchor, the bundle id and the workflow id.

**What the pre-authorisation owns.** The pre-authorisation may be drafted and sent before the patient is admitted, so nothing it sends is taken from, or fixed by, an admission: the planned admission date, the expected discharge date, the ICD-10 diagnoses (picked, SNOMED CT mapped, never typed) and the treating doctors with their roles are the draft's own (D9, D25, D26, saved from [S9. Pre-authorisation](../screens/S9-preauthorisation.md)). A linked admission only pre-fills a draft not yet saved. No linked patient or admission is needed to send; the Patient in the bundle is the linked patient's when there is one, else the case's own beneficiary details (member id, ABHA number, name, mobile, gender, birth date). The admission is linked on the Claim tab, and only the claim (A5) needs it.

**Read only once the claim is with the payer** ([CORE.md](../references/CORE.md) Instruction 14). Once the claim (A5, D20) has reached the payer (`submitting`, `queried`, `approved`, `partial` or `rejected`), the pre-authorisation can no longer change: every send here, and every write to the pre-authorisation leg (its lines, its details, its documents, forms and records, a document taken off its list), is refused with "The claim has gone to the payer, so the pre-authorisation is read only: no enhancement or change can be made. It can only be cancelled while the payer is deciding the claim." A claim still a draft, or refused at the door (`error`, it never reached the payer), leaves the pre-authorisation open. The claim leg's own writes are never refused by this rule. The cancel ([A6. Task Submit (cancel, status, reprocess, release)](A6-task-submit.md)) stays possible until the payer decides the claim (`approved`, `partial` or `rejected`); then it is refused with "The payer has decided the claim; the pre-authorisation can no longer be cancelled."

**Every line is quoted from the insurance plan.** The lines are the D16 rows quoted from the case's plan; there are no custom line items, and the only price the desk types is a rate the plan leaves open. The case type is always `package`.

**Send kinds.** The kind is worked out from where the pre-authorisation stands:

| Where the pre-auth stands | Kind | Answers a query |
|---|---|---|
| the claim has reached the payer (checked first) | refused: "The claim has gone to the payer, so the pre-authorisation is read only: no enhancement or change can be made. It can only be cancelled while the payer is deciding the claim." | |
| Nothing sent, `cancelled`, `error`, `rejected` | `preauth` | no |
| `queried` | `preauth_query_response` | yes |
| `approved` / `partial` with lines added since the decision | `enhancement` | no |
| `queried`, when the last send was an enhancement round | `enhancement_resubmit` | yes |
| `approved` / `partial`, nothing added | refused: "The pre-authorisation is already decided; add a line to ask for an enhancement." | |
| `submitting` / `cancelling` | refused: "The pre-authorisation is with the payer; wait for its answer before sending again." | |

FHIR: [F1. Bundle](../fhir/F1-bundle.md) (the bundle id and Claim anchor of each kind), [F8. Claim](../fhir/F8-claim.md)

A line counts as added when its code (or a ward tier code riding as a modifier) is not in the Claim of the last bundle sent. After a rejection the next send is a fresh `preauth` (12), not a resubmission: PMJAY refuses 121 there with PAYR-1214 [PAYER](../references/PAYERS.md#markers).

**Which query is answered here.** A query the payer raises inside its ClaimResponse (a line-item query: outcome `partial` with queried items, C5) and every query from a `resubmit`-mode payer are answered by resubmitting the pre-authorisation from this tab, as `preauth_query_response` with the reply text. A standalone CommunicationRequest query from a `communication`-mode payer is answered on the Communication tab ([A7. Communication Reply](A7-communication-on-request.md)).

**Status (`x-hcx-status`).** Set by the send, not left to the gateway's path default: `request.initiated` for every kind, a query answer included. A query answer goes on `v1/preauth/submit`, a request path, and NHCX refuses `response.complete` there with NHCX-1011 "Invalid Status" [SANDBOX](../references/PAYERS.md#markers); the live PMJAY provider sends its 19 as `request.initiated` [PAYER](../references/PAYERS.md#markers). Only a send on an `on_` path (A7, A8) is `response.complete` (see [PAYERS.md](../references/PAYERS.md)).

**Workflow ids (`x-hcx-workflow_id`).** Read from the payer adapter chosen by the claim's payer participant code (see [PAYERS.md](../references/PAYERS.md)) [PAYER](../references/PAYERS.md#markers). There are two adapters, `gov` (PMJAY and the State Health Agencies) and `generic`, chosen by the payer's entity type in the participant master (`gov` gives `gov`, any other gives `generic`); only a payer the master does not hold falls back to a configuration row, then the registry-name rule, else `generic`. Both carry the same table here.

| Kind | `gov` | `generic` |
|---|---|---|
| `preauth` | 12 | 12 |
| `preauth_query_response` | 19 | 19 |
| `enhancement` | 13 | 13 |
| `enhancement_resubmit` | 131 | 131 |
| `preauth_resubmit` (defined, never chosen by the send logic) | 121 | 121 |

A per-environment override (a JSON object of kind to workflow id, per adapter or for every adapter) wins over the adapter, key by key; an override still written under a retired key (`pmjay`, `kyrocare`) is read as `gov` or `generic`. A kind with no id anywhere is refused with "No workflow id is defined for '<kind>'.".

**Headers set by the application.** G7 generates ([G5. Protocol Headers](../gateway/G5-protocol-headers.md)) `x-hcx-api_call_id`, `x-hcx-request_id`, `x-hcx-correlation_id` and the timestamp.

| Header | Value |
|---|---|
| `x-hcx-sender_code` | The facility's NHCX participant code (Settings) |
| `x-hcx-recipient_code` | The case's processing id (D9 `processing_id`), else the claim's payer id, else the configured default payer code |
| `x-hcx-workflow_id` | From the table above |
| `x-hcx-status` | `request.initiated` |
| `x-hcx-use_case` | `New` for `preauth`, `Enhancement` for `enhancement`, `Resubmit` for `preauth_query_response`, `enhancement_resubmit` and `preauth_resubmit`. Sent to every payer, whether or not it reads it (see [PAYERS.md](../references/PAYERS.md)) |
| `x-hcx-ben-abha-id` | The token's ABHA when [A18. Biometric Authentication](A18-biometric-authentication.md) holds a stage-`Preauth` authentication, else the case's ABHA number (14 digits, hyphenated); left out when none is known |
| the user-token header | The stage-`Preauth` user token when one is held ([A18. Biometric Authentication](A18-biometric-authentication.md)); left out otherwise |

**Before a send**, the app fires the payer's `auth-requirements` coverage check (A2 `ensure_auth_requirements`) when the adapter sends it unasked (see [PAYERS.md](../references/PAYERS.md)) [PAYER](../references/PAYERS.md#markers), the policy is in force, lines exist, and this procedure set has not been ruled on (or the last ruling is in `error`). It never waits for the answer, and a failure of that check does not stop the send.

**Proof of presence.** It is required on the case when the payer's adapter requires it, or when the case's insurance plan asks for the Aadhaar proof of identity (a plan-level requirement coded `ADN`, PMJAY's `NHCXProofOfIdentity`, category POI). Then the next action reads "Authenticate the beneficiary" until a stage-`Preauth` token is held, and without a token the scheme's Authentication Consent form rides instead ([A18. Biometric Authentication](A18-biometric-authentication.md)).

**Checks before sending**, in order, each raised as the screen's red message:
1. "Claim not found."
2. the policy not in force (A2 `in_force`): "Submit a preauth only after the payer has confirmed the policy is eligible."
3. The send-kind refusals above, the read-only refusal first.
4. On a query-answering kind with no reply text: "Write the reply to the payer's query before answering it."
5. "Set the facility's HFR ID and NHCX participant code under Settings before submitting."
6. "Enter the planned admission date on the pre-authorisation."
7. "Quote at least one ICD-10 diagnosis."
8. "Add at least one doctor to the care team."
9. "Add at least one line, the procedure being done."

Success flash: "Pre-authorisation submitted to the payer."

**Predetermination is retired.** A predetermination (`Claim.use = predetermination`, the same dossier sent as "what would you pay for this", workflow `12`) was once sent on this route. No screen offers it any more and nothing new is built for it. Quote rows ([D19. claim_predetermination](../database/D19-claim-predetermination.md)) written before still show their answer, and a reply to one is still applied (C5) and polled (A10).

#### A4Q. REQUEST

The arguments passed to G7 Send:

| Field | Type | Notes |
|---|---|---|
| `jwe_headers` | object | The headers above. When a stage-`Preauth` token is held, the Authentication Consent form is left out of the bundle |
| `fhir` | Bundle | The Claim bundle |

FHIR: [F1. Bundle](../fhir/F1-bundle.md), [F8. Claim](../fhir/F8-claim.md), [F15. Patient](../fhir/F15-patient.md), [F17. Organization](../fhir/F17-organization.md), [F18. Coverage](../fhir/F18-coverage.md), [F16. Practitioner and PractitionerRole](../fhir/F16-practitioner.md), [F19. Other bundle resources](../fhir/F19-other-resources.md) (Procedure), [F7. QuestionnaireResponse](../fhir/F7-questionnaireresponse.md)

The bundle always carries every quoted line, also on an enhancement.

Envelope (a government payer, first pre-authorisation):

```json
{
  "jwe_headers": {
    "x-hcx-sender_code": "<facility code>",
    "x-hcx-recipient_code": "<payer code>",
    "x-hcx-workflow_id": "12",
    "x-hcx-status": "request.initiated",
    "x-hcx-use_case": "New"
  },
  "fhir": <F1 Bundle carrying F8 Claim (use preauthorization), F15 Patient, F17 provider and payer Organizations, F18 Coverage, F16 Practitioner per care-team doctor, F19 Procedure per procedure line, F7 QuestionnaireResponse per answered form>
}
```

A query answer (workflow 19 [PAYER](../references/PAYERS.md#markers), still `request.initiated`, use case `Resubmit`) differs only in the Claim anchor, the bundle id, and the reply text riding on the Claim as the "Claim query detail" entry (F8).

#### A4S. RESPONSE

**Acknowledgement** (the G7 result, NHCX status 202):

```json
{"ok": true,
 "gateway_status": 202,
 "txn_id": "7UPG003U",
 "ledger_id": "7UPG003U",
 "correlation_id": "f8425e75-52e0-4413-a915-39a7bad38ee2",
 "request_id": "0b398fdf-0516-4935-9ebb-a0dc90a06bb6",
 "headers": {"x-hcx-correlation_id": "f8425e75-52e0-4413-a915-39a7bad38ee2", "...": "..."},
 "response": "<NHCX's acceptance>"}
```

The leg becomes `submitting` under the acknowledgement's ids (`txn_id`, `correlation_id`), and the verdict fields are cleared. An enhancement keeps the payer's pre-auth reference and counts one more round; a query answer keeps the reference and the round count. The correlation id joins the case's thread list (`correlation_ids`) for the Logs tab, also on a failed send that named it.

**Failed send.** Per the shared conventions. When the failure names ids, by kind:
- `preauth`: the leg is `error` with the message, under the failed send's ids.
- A query answer (`preauth_query_response`, `enhancement_resubmit`): the question stays open. The leg stays `queried` with the payer's question and decision as they were, and only `error_message` is written, so the desk can answer again; the leg's ids are not replaced (the thread is still remembered on the case).
- `enhancement`: the approval stands. The leg goes back to `approved` and **keeps the approval's columns** (`settled_at`, `outcome`, `adjudication`, `disposition`, `approved_amount`, `eligible_amount`, `submitted_amount`, `items_json`, `requested_amount`, and `request_json` and `response_json` of the last accepted send), and the failed send writes its own ids (`txn_id`, `correlation_id`, `submitted_at`), `error_message`, `submission_kind`, `workflow_id` and `enhancement_no`. The added lines stay unsent and are offered again.

If the payer later answers on a failed send's correlation, the leg reopens and the answer is applied (C1 `revive`).

Data: [D18. claim_preauth](../database/D18-claim-preauth.md)

Reply: [C5. Pre-auth Reply](../callbacks/C5-preauth-on-submit.md)

**Polling** (while the leg is `submitting`, on each load of S6): A10 (G9 related) with the leg's `txn_id`; the newest inbound entry not sent by this facility whose bundle (A12) carries a ClaimResponse is applied. With no reply: a failed payer answer when one G hosts both participants ("The payer answered, but NHCX refused its reply..."), or a ProtocolResponse for this correlation found through A13 (type `preauth`) and A12, is applied as a refusal at the door. Otherwise A11 (G9 dispatch) is read, and a dispatch status of `dispatch_failed` turns the leg to `error` (`approved` for an enhancement round) with the ledger's `errorMessage`, else `errorCode`, else "Dispatch to NHCX failed.". When G9 no longer holds the transaction (A10 not found), the leg turns to `error`: "The gateway no longer has this transaction, its ledger was reset after the preauth was sent. Submit again."

#### A4P. PSEUDOCODE

```
// shared send convention (every outbound bundle), in-process through G7: SEND and
// remember_thread exactly as A2P; in_force as A2P

function submit_preauth(case_id, reply):
    case = claim[case_id]                  or refuse "Claim not found."
    if not in_force(case):
        refuse "Submit a preauth only after the payer has confirmed the policy is eligible."
    existing = claim_preauth for the case
    kind     = preauth_send_kind(case_id)                 // may refuse
    adapter  = payer adapter for case.payer_id (generic when the master and the rows name none)
    answer = null
    if kind in {preauth_query_response, enhancement_resubmit}:
        answer = trim(reply)
        if answer empty: refuse "Write the reply to the payer's query before answering it."

    ensure_auth_requirements(case_id)                     // A2; fire and forget
    token = biometric_headers(case, case.payer_id, Preauth)   // A18: {} when none is held
    holds_token = token is not empty

    dossier = gather(case, kind, leg = preauth, reply = answer, holds_token)   // refusals 5 to 9
    bundle  = F1 Bundle for leg preauth, carrying F8 Claim (use preauthorization,
              claim number, planned admission to expected discharge, diagnoses, care team, items,
              documents, reply text as the query detail when answering, total),
              F15 Patient, F17 Organizations, F18 Coverage, F16 Practitioners,
              F19 Procedures, F7 QuestionnaireResponses;
              program code and multiple-procedure factors from the adapter
    workflow = workflow_id(adapter, kind)   // env override, else adapter; else
                                            // refuse "No workflow id is defined for '<kind>'."

    ack, failed = SEND("v1/preauth/submit", {
        jwe_headers: {x-hcx-sender_code: org.participant_code,
                      x-hcx-recipient_code: case.processing_id or case.payer_id or default payer code,
                      x-hcx-workflow_id: workflow,
                      x-hcx-status: request.initiated,              // every kind, a query answer too (NHCX-1011)
                      x-hcx-use_case: use_case_for(kind),
                      x-hcx-ben-abha-id: token's ABHA or hyphenated(case.abha_number) or left out,
                      <user-token header>: token or left out},
        fhir: bundle}, case)

    values = {status: submitting, txn_id: ack.txn_id, correlation_id: ack.correlation_id,
              submitted_at: now, settled_at: null, error_message: null,
              claim_ref: case.claim_no, preauth_ref: null, outcome: null, adjudication: null,
              disposition: null, approved_amount: null, eligible_amount: null,
              submitted_amount: null, items_json: null, api_call_id: null,
              requested_amount: the bundle's Claim total, submission_kind: kind,
              reply_text: answer, workflow_id: workflow, request_json: bundle, response_json: null}
    if existing and kind in {enhancement, enhancement_resubmit}:
        values.preauth_ref    = existing.preauth_ref
        values.enhancement_no = (existing.enhancement_no or 0) + (1 if kind == enhancement else 0)
    else if existing and kind in {preauth_resubmit, preauth_query_response}:
        values.preauth_ref    = existing.preauth_ref
        values.enhancement_no = existing.enhancement_no
    if failed:                                              // refused at the door
        values.error_message = failed.message
        if kind in {enhancement, enhancement_resubmit}:
            values.status = approved
            if existing: copy from existing settled_at, outcome, adjudication, disposition,
                         approved_amount, eligible_amount, submitted_amount, items_json,
                         requested_amount, request_json, response_json
        else:
            values.status = error
        if existing and kind in {preauth_query_response, enhancement_resubmit}:
            values = {status: queried, error_message: failed.message}   // the question stays open
    in one transaction:
        if existing is none: INSERT claim_preauth (values, claim_id)
        else:                UPDATE claim_preauth[existing.id] SET values
        recompute case stage
    if failed: raise failed
    return "Pre-authorisation submitted to the payer."

function preauth_send_kind(case_id):
    ensure_preauth_open(case_id)                          // refuses once the claim is with the payer
    existing = claim_preauth for the case
    if existing is none or existing.status in {cancelled, error}: return preauth
    added = claim_line rows whose code is not in the last sent Claim (items and tier modifiers)
    if existing.status in {approved, partial}:
        if added empty: refuse "The pre-authorisation is already decided; add a line to ask for an enhancement."
        return enhancement
    if existing.status == queried:
        if existing.enhancement_no > 0 and existing.submission_kind in {enhancement, enhancement_resubmit}:
            return enhancement_resubmit
        return preauth_query_response
    if existing.status == rejected: return preauth
    if existing.status in {submitting, cancelling}:
        refuse "The pre-authorisation is with the payer; wait for its answer before sending again."
    return preauth

// shared with A5: the dossier, refusals in this order
function gather(case, kind, leg, lines = none, reply, preauth_ref = none, discharge = none, holds_token):
    org = the case's facility profile
    if org HFR ID or participant code empty:
        refuse "Set the facility's HFR ID and NHCX participant code under Settings before submitting."
    if case.admission_date empty:                   // the planned date, the draft's own
        refuse "Enter the planned admission date on the pre-authorisation."
    diagnoses = claim_diagnosis rows (by seq) with an ICD-10 code
    if none: refuse "Quote at least one ICD-10 diagnosis."
    care_team = claim_care_team rows joined to practitioner (by seq); a missing practitioner skipped
    if none: refuse "Add at least one doctor to the care team."
    lines = lines or claim_line rows
    if none: refuse "Add at least one line, the procedure being done."
    patient    = patient[case.patient_id] when linked, else the case's own beneficiary details
    proc_type  = per procedure line, ProcedureType condition from claim_plan_benefit, else conservative
    offers     = per procedure, the Stratification tier codes the plan offers under it
    forms      = leg_forms(case, leg, holds_token, requires_proof(case))   // A17 required_forms, then:
                 the leg's consent form added when proof is required and no token is held, left out
                 when a token is held; answers saved for the leg; unanswered forms dropped
    documents  = claim_document rows at stage `leg`, minus files given as form answers
                 (on the claim leg, the discharge summary taken out, A5)
    return {input for F8, adapter, org.participant_code}

// every write to the pre-authorisation leg (lines, details, its documents, forms, records,
// a dismissed document) and every send calls this first; a claim-leg write never does
function ensure_preauth_open(case_id, stage = preauth):
    if stage == preauth and claim_submission.status of the case in
            {submitting, queried, approved, partial, rejected}:
        refuse "The claim has gone to the payer, so the pre-authorisation is read only: no enhancement or change can be made. It can only be cancelled while the payer is deciding the claim."

function requires_proof(case):
    return adapter(case.payer_id).proof_of_presence == required
        or any claim_plan.policy_documents entry of the case has code "ADN"
```

#### A4U. USED BY
- Screens: [S9. Pre-authorisation](../screens/S9-preauthorisation.md), [S14. Patient Registration Form](../screens/S14-patient-registration-form.md), [S15. Patient Detail](../screens/S15-patient-detail.md), [S16. Practitioner Master](../screens/S16-practitioner-master.md), [S18. Beneficiary Verification](../screens/S18-beneficiary-verification.md)
- APIs: [A2. Coverage Eligibility Check](A2-coverage-eligibility-check.md), [A5. Claim Submit](A5-claim-submit.md), [A7. Communication Reply](A7-communication-on-request.md), [A10. Transaction Related](A10-txn-related.md), [A11. Transaction Dispatch](A11-txn-dispatch.md), [A13. Transaction List](A13-txn-list.md), [A17. Claim State](A17-claim-state.md), [A18. Biometric Authentication](A18-biometric-authentication.md)
- Callbacks: [C5. Pre-auth Reply](../callbacks/C5-preauth-on-submit.md)
- FHIR: [F8. Claim](../fhir/F8-claim.md), [F9. ClaimResponse](../fhir/F9-claimresponse.md), [F12. Communication](../fhir/F12-communication.md), [F15. Patient](../fhir/F15-patient.md), [F17. Organization](../fhir/F17-organization.md), [F18. Coverage](../fhir/F18-coverage.md)
- Database: [D12. claim_plan_form](../database/D12-claim-plan-form.md), [D16. claim_line](../database/D16-claim-line.md), [D17. claim_form_answer](../database/D17-claim-form-answer.md), [D18. claim_preauth](../database/D18-claim-preauth.md), [D28. claim_document](../database/D28-claim-document.md), [D31. biometric_auth](../database/D31-biometric-auth.md)
- Tests: [T5. IRDAI Pre-authorisation Approved](../tests/T5-irdai-preauth-approved.md), [T6. IRDAI Pre-authorisation Rejected and Sent Again](../tests/T6-irdai-preauth-rejected.md), [T7. IRDAI Query Answered](../tests/T7-irdai-query-answered.md), [T8. IRDAI Enhancement](../tests/T8-irdai-enhancement.md), [T10. IRDAI Claim Approved, Part-approved and Rejected](../tests/T10-irdai-claim.md), [T14. PMJAY Pre-authorisation Through the Payer Service](../tests/T14-pmjay-preauth-adjudicated.md), [T15. PMJAY Query Answered by Resubmission](../tests/T15-pmjay-query-by-resubmission.md), [T16. PMJAY Rejection and Enhancement](../tests/T16-pmjay-rejection-and-enhancement.md), [T19. PMJAY Beneficiary Verification and ABHA](../tests/T19-pmjay-biometric-and-abha.md)
