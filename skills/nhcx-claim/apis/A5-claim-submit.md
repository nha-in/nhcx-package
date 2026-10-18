# A5. Claim Submit

#### A5E. ENDPOINT
In-process: `gateway.send("v1/claim/submit", envelope)`, [G7. Send](../gateway/G7-send.md), which encrypts it and posts it to NHCX for the payer: `POST {nhcx}/v1/claim/submit`. The verdict comes back asynchronously on `claim/on_submit` (taken in by [G8. Receive](../gateway/G8-receive.md), callback C6 through the callback door C1, type `claim`, or found by polling the [G9. Ledger](../gateway/G9-ledger.md), A10 / A11 / A12 / A13).

#### A5D. DESCRIPTION
Files the claim once the patient has left: the pre-authorisation's bundle with `use: claim`, the payer's pre-auth reference on the insurance line, the Procedure marked completed, the claim-stage documents and forms, and the discharge on `supportingInfo`. It is also the route for answering a claim query in `resubmit` mode. A claim the payer has decided is never sent again on this route: a rejected claim goes back for another look as a reprocess request (A6), and an approved or partial claim's balance is asked for as a release (A6).

**Send kinds.**

| Where the claim stands | Kind |
|---|---|
| No claim record, or `draft` | `claim` |
| `queried` | `claim_query_response` |
| `approved`, `partial` or `rejected` | refused: "The payer has decided this claim; it goes back for another look as a reprocess request, not as a claim sent again." |
| `error` (refused at the door, never reached the payer) | the kind that failed is sent again (`claim_query_response`, or `claim_resubmit` on a row written before resubmission was retired), else `claim` |
| `submitting` | refused: "The claim is with the payer; wait for its answer before sending again." |

FHIR: [F1. Bundle](../fhir/F1-bundle.md) (the bundle id and Claim anchor of each kind), [F8. Claim](../fhir/F8-claim.md)

**Status (`x-hcx-status`).** Set by the send, not left to the gateway's path default: `request.initiated` for every kind, a claim query answer included. A query answer goes on `v1/claim/submit`, a request path, and NHCX refuses `response.complete` there with NHCX-1011 "Invalid Status" [SANDBOX](../references/PAYERS.md#markers); the live PMJAY provider sends its query answer as `request.initiated` [PAYER](../references/PAYERS.md#markers) (see [PAYERS.md](../references/PAYERS.md)).

**Workflow ids (`x-hcx-workflow_id`)**, from the payer adapter (see [PAYERS.md](../references/PAYERS.md)) [PAYER](../references/PAYERS.md#markers), overridable per environment (a JSON object of kind to workflow id):

| Kind | `gov` | `generic` |
|---|---|---|
| `claim` | 15 | 15 |
| `claim_query_response` | 151 (adapter default; 161 as a sandbox configuration override [SANDBOX](../references/PAYERS.md#markers)) | 151 |
| `claim_resubmit` | none (not offered) | none (not offered) |

No adapter offers `claim_resubmit`: a decided claim is never sent again [REF](../references/PAYERS.md#markers). A rejected claim goes back as a reprocess Task (A6, workflow 36), and a claim refused at the door may be sent again as the kind that failed.

The SHA sandbox refuses 16, 151 and 19 on a claim with PAYR-1321 "Invalid workflow id" and takes 161 for a query answer [SANDBOX](../references/PAYERS.md#markers). The adapter's value stays the published 151; a sandbox run sets 161 through the per-environment override, so the sandbox quirk never becomes the adapter's default.

**Use case (`x-hcx-use_case`).** Every claim send carries it, to every payer, whether or not the payer reads it: `New` for `claim`, `Resubmit` for `claim_query_response` (see [PAYERS.md](../references/PAYERS.md)).

**Headers set by the application** (G7 generates the rest, [G5. Protocol Headers](../gateway/G5-protocol-headers.md)): `x-hcx-sender_code` = facility participant code; `x-hcx-recipient_code` = the case's processing id (D9 `processing_id`), else the claim's payer id, else the configured default payer code; `x-hcx-workflow_id` as above; `x-hcx-status` `request.initiated`; `x-hcx-use_case` as above; `x-hcx-ben-abha-id` = the token's ABHA when [A18. Biometric Authentication](A18-biometric-authentication.md) holds a stage-`Discharge` authentication, else the case's ABHA number, left out when none is known; the user-token header with the stage-`Discharge` token when one is held.

**The claim bills a stay.** Unlike the pre-authorisation, the claim needs the IPD admission linked to the case (D9 `encounter_id`). The admission is linked on the Claim tab ([S11. Claim Submission](../screens/S11-claim-submission.md)), chosen among the current IPD stays of patients holding the case's ABHA number, once the policy is in force; the next action reads "Link the IPD admission" once the pre-authorisation is approved and nothing is linked.

**Checks before sending**, in order:
1. "Claim not found."
2. The send-kind refusals above.
3. On `claim_query_response` with no reply text: "Write the reply to the payer's query before answering it."
4. no admission linked: "Link the patient's IPD admission on the Claim tab before sending the claim."
5. "Record how the patient was discharged before claiming."
6. "A claim goes in against an approved pre-authorisation." (the pre-auth must be `approved` or `queried`)
7. "Set the facility's HFR ID and NHCX participant code under Settings before submitting."
8. "Enter the planned admission date on the pre-authorisation."
9. "Quote at least one ICD-10 diagnosis."
10. "Add at least one doctor to the care team."
11. "Add at least one line, the procedure being done."

Success flash: "Claim submitted to the payer."

#### A5Q. REQUEST

The arguments passed to G7 Send:

| Field | Type | Notes |
|---|---|---|
| `jwe_headers` | object | The headers above. When a stage-`Discharge` token is held, the Discharge Consent form is left out of the bundle |
| `fhir` | Bundle | The Claim bundle |

The resources are those of the pre-authorisation bundle (A4 REQUEST), with the claim leg's differences: `use` claim, the pre-auth reference, the discharge, the claim lines (a LAMA or DAMA discharge before or during surgery collapses them to the single procedure `LM100` [PAYER](../references/PAYERS.md#markers)), the Procedure completed, and only the claim-stage documents and forms.

FHIR: [F1. Bundle](../fhir/F1-bundle.md), [F8. Claim](../fhir/F8-claim.md), [F15. Patient](../fhir/F15-patient.md), [F17. Organization](../fhir/F17-organization.md), [F18. Coverage](../fhir/F18-coverage.md), [F16. Practitioner and PractitionerRole](../fhir/F16-practitioner.md), [F19. Other bundle resources](../fhir/F19-other-resources.md) (Procedure), [F7. QuestionnaireResponse](../fhir/F7-questionnaireresponse.md)

Envelope (a government payer, first claim):

```json
{
  "jwe_headers": {"x-hcx-sender_code": "<facility code>",
                  "x-hcx-recipient_code": "<payer code>",
                  "x-hcx-workflow_id": "15",
                  "x-hcx-status": "request.initiated",
                  "x-hcx-use_case": "New"},
  "fhir": <F1 Bundle carrying F8 Claim (use claim, preAuthRef, discharge), F15 Patient, F17 provider and payer Organizations, F18 Coverage, F16 Practitioner, F19 Procedure (completed), F7 QuestionnaireResponse per answered claim-leg form>
}
```

A query answer under the `gov` adapter goes under the claim query-response workflow id (151; 161 under the sandbox override [SANDBOX](../references/PAYERS.md#markers)) [PAYER](../references/PAYERS.md#markers), still `request.initiated`, with the reply text riding on the Claim as the "Claim query detail" entry (F8), for example "Final bill and discharge summary attached again; the ward stay was two days as billed.".

#### A5S. RESPONSE

**Acknowledgement:** the G7 result, `{"ok": true, "gateway_status": 202, "txn_id", "correlation_id", "request_id", "headers", "response", ...}`. The claim leg becomes `submitting` under its ids (`txn_id`, `correlation_id`); the previous verdict fields are cleared. On a query answer the question being answered is kept so it can still be shown.

**Failed send.** When the failure names ids, the leg is kept under them as refused at the door: a query answer goes back to `queried` with the question restored and the message recorded, so the question stays open; any other kind becomes `error`. A later answer on the failed send's correlation reopens the leg. Either way the correlation id joins the case's thread list (`correlation_ids`) for the Logs tab.

Data: [D20. claim_submission](../database/D20-claim-submission.md)

Reply: [C6. Claim Reply](../callbacks/C6-claim-on-submit.md)

**Polling** (claim `submitting`, on each load of S6): A10 (G9 related) with the claim's `txn_id`, newest inbound ClaimResponse via A12. With none, a refused payer answer when one G hosts both participants, or a ProtocolResponse for this correlation found through A13 (type `claim`) and A12, is applied as a refusal at the door; then A11 (G9 dispatch), where `dispatch_failed` is also a refusal at the door with the ledger's `errorMessage` / `errorCode` / "Dispatch to NHCX failed.". When G9 no longer holds the transaction (A10 not found), the claim turns to `error`: "The gateway no longer has this transaction, its ledger was reset after the claim was sent. Submit again."

#### A5P. PSEUDOCODE

```
// shared send convention (every outbound bundle), in-process through G7: SEND and
// remember_thread exactly as A2P; gather and requires_proof as A4P

function submit_claim(case_id, reply):
    case  = claim[case_id]                 or refuse "Claim not found."
    kind  = claim_send_kind(case_id)                       // may refuse
    state = claim_submission for the case
    answering = (kind == claim_query_response)
    question  = (state.query_note or state.disposition) if answering and state exists
    answer = null
    if answering:
        answer = trim(reply)
        if answer empty: refuse "Write the reply to the payer's query before answering it."
    if case.encounter_id empty:                            // the claim bills a stay
        refuse "Link the patient's IPD admission on the Claim tab before sending the claim."
    if state missing or state.discharge_mode empty:
        refuse "Record how the patient was discharged before claiming."
    granted = claim_preauth for the case
    if granted missing or granted.status not in {approved, queried}:
        refuse "A claim goes in against an approved pre-authorisation."
    lines = claim_line rows, or, for a LAMA / DAMA discharge before or during surgery, the single
            procedure LM100 at its claim_plan_benefit rate, quantity = days admitted (admission to
            discharge, at least 1) [PAYER](../references/PAYERS.md#markers) (display "LAMA / DAMA procedure", rate 0 when the plan
            has no such package [REF](../references/PAYERS.md#markers))
    token = biometric_headers(case, case.payer_id, Discharge)  // A18: {} when none is held
    dossier = gather(case, kind, leg = claim, lines, reply = answer,
                     preauth_ref = granted.preauth_ref, discharge = state,
                     holds_token = token is not empty)        // refusals 7 to 11, A4P
        // documents: claim-stage rows minus form files; the discharge summary is the claim-stage
        // document whose code the ruling or plan names a "discharge summary", else the newest HDS row;
        // it and every other HDS row leave the ordinary attachments
        // forms: the claim leg's (A17 required_forms), the Discharge Consent added when proof is
        // required and no stage-Discharge token is held, left out when one is
    bundle = F1 Bundle for leg claim, flow queryupdate if answering else request,
             carrying F8 Claim (use claim, billable period admission to discharge date
             else admission, preAuthRef = granted.preauth_ref, discharge mode, stage,
             surgery, discharge and death instants, summary, documents, reply text
             as the query detail when answering, total), F15 Patient, F17 Organizations,
             F18 Coverage, F16 Practitioners, F19 Procedures (completed), F7 QuestionnaireResponses
    workflow = workflow_id(adapter, kind)

    ack, failed = SEND("v1/claim/submit", {
        jwe_headers: {x-hcx-sender_code: org.participant_code,
                      x-hcx-recipient_code: case.processing_id or case.payer_id or default payer code,
                      x-hcx-workflow_id: workflow,
                      x-hcx-status: request.initiated,              // every kind, a query answer too (NHCX-1011)
                      x-hcx-use_case: use_case_for(kind),           // New, or Resubmit for a query answer
                      x-hcx-ben-abha-id: token's ABHA or hyphenated(case.abha_number) or left out,
                      <user-token header>: token or left out},
        fhir: bundle}, case)

    values = {status: submitting, txn_id: ack.txn_id, correlation_id: ack.correlation_id,
              submitted_at: now, settled_at: null, error_message: null,
              claim_ref: case.claim_no, outcome: null, adjudication: null, disposition: null,
              approved_amount: null, eligible_amount: null, submitted_amount: null,
              items_json: null, api_call_id: null, requested_amount: the bundle's Claim total,
              submission_kind: kind, workflow_id: workflow, request_json: bundle,
              response_json: null, reply_text: answer}
    if question: values.query_note = question
    if failed:                                              // refused at the door
        values.status = error; values.error_message = failed.message
        if answering:
            values.status = queried; values.disposition = question   // the question stays open
    UPDATE claim_submission[state.id] SET values; recompute case stage
    if failed: raise failed
    return "Claim submitted to the payer."

function claim_send_kind(case_id):
    state = claim_submission for the case
    if state is none or state.status == draft: return claim
    if state.status == error:
        return state.submission_kind if in {claim_query_response, claim_resubmit} else claim
    if state.status == queried: return claim_query_response
    if state.status in {rejected, partial, approved}:     // no adapter offers claim_resubmit
        refuse "The payer has decided this claim; it goes back for another look as a reprocess request, not as a claim sent again."
    if state.status == submitting:
        refuse "The claim is with the payer; wait for its answer before sending again."
    return claim
```

#### A5U. USED BY
- Screens: [S11. Claim Submission](../screens/S11-claim-submission.md), [S18. Beneficiary Verification](../screens/S18-beneficiary-verification.md)
- APIs: [A6. Task Submit (cancel, status, reprocess, release)](A6-task-submit.md), [A10. Transaction Related](A10-txn-related.md), [A11. Transaction Dispatch](A11-txn-dispatch.md), [A13. Transaction List](A13-txn-list.md), [A17. Claim State](A17-claim-state.md), [A18. Biometric Authentication](A18-biometric-authentication.md)
- Callbacks: [C6. Claim Reply](../callbacks/C6-claim-on-submit.md)
- FHIR: [F8. Claim](../fhir/F8-claim.md), [F9. ClaimResponse](../fhir/F9-claimresponse.md), [F15. Patient](../fhir/F15-patient.md), [F17. Organization](../fhir/F17-organization.md), [F18. Coverage](../fhir/F18-coverage.md)
- Database: [D12. claim_plan_form](../database/D12-claim-plan-form.md), [D31. biometric_auth](../database/D31-biometric-auth.md)
- Tests: [T10. IRDAI Claim Approved, Part-approved and Rejected](../tests/T10-irdai-claim.md), [T17. PMJAY Claim Through the Role Walk](../tests/T17-pmjay-claim-adjudicated.md)
