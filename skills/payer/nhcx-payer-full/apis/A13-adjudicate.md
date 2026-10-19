# A13. Adjudicate

#### A13E. ENDPOINT

Inbound to the application (the desk's own JSON endpoints, not a call into G), behind a signed-in session with a payer desk role:

| Call | Does |
|---|---|
| `PATCH /cases/:id/line-items/:lineId` | records one line's decision and rolls the case totals up |
| `POST /cases/:id/adjudicate` | approves, rejects or queries the case as a whole, and sends the answer over the exchange |
| `POST /cases/:id/query` | raises a query on the case before any decision ("Raise Query"): no line is touched, nothing is decided, and the question goes out at once as a CommunicationRequest ([A5. Query Request](A5-query-request.md)) |

`:id` is the case id ([D19. case](../database/D19-case.md)), `:lineId` the line id ([D25. case_line_item](../database/D25-case-line-item.md)). Roles: an adjudicator or an admin decides; finance may not [REF](../references/PAYERS.md#markers).

#### A13D. DESCRIPTION

A pre-authorisation or a claim is never decided by rules: it is filed by [C4. Pre-auth Submit](../callbacks/C4-preauth-submit.md) or [C5. Claim Submit](../callbacks/C5-claim-submit.md) and waits for a person. This service is that person's decision, in two steps: the lines first, then the case. The case's approved amount is the sum of what the lines allow, so approving the dossier is the moment the money is fixed.

**Deciding a line.** A line's decision and its money agree, and the service settles the arithmetic before the database enforces it:

| Decision sent | What is stored |
|---|---|
| `approved` | `approved_amount` = the claimed amount, whatever was sent |
| `rejected` | `approved_amount` = 0 |
| `partially_approved` | the amount sent; `0` or less turns the line `rejected`, the claimed amount or more turns it `approved` |
| `queried` | `approved_amount` = 0, and `query_remarks` says what is being asked |
| `pending` | `approved_amount` = 0: the decision is taken back |

`query_remarks` is kept only on a `queried` line. Every line decision writes a timeline event ("Line Item Approved", "Line Item Partially Approved", "Line Item Rejected", "Line Item Queried", "Line Item Updated"), then recomputes D19 `total_claimed` and `total_approved` from the lines.

**Deciding the case.** Three actions, each on a case whose stage is `preauth` or `claim`:

| Action | Case | Then |
|---|---|---|
| `approve` | refused while any line is `queried`; refused when every line is `rejected`; every line still `pending` is approved first, in full, or on a claim line that carries `preauth_approved_amount` ([D25. case_line_item](../database/D25-case-line-item.md)) at no more than that (below the claim `partially_approved`, 0 `rejected`); a line decision on such a line is held to the same cap; then `adjudication_status` `approved` and the stage moves on (`preauth` to `claim`, `claim` to `payment`) | the verdict goes out: [A3. Pre-auth Answer](A3-preauth-answer.md) on a pre-authorisation, [A4. Claim Answer](A4-claim-answer.md) on a claim, [A9. Task Answer](A9-task-answer.md) on a claim reopened by a reprocess Task |
| `reject` | `adjudication_status` `rejected`, stage `rejected` | the verdict goes out the same way |
| `query` | `adjudication_status` `queried`, the stage stays | **with a line `queried`**: a line-item query on the submission's own thread ([A3. Pre-auth Answer](A3-preauth-answer.md) on `v1/preauth/on_submit`, [A4. Claim Answer](A4-claim-answer.md) on `v1/claim/on_submit`), a ClaimResponse with outcome `partial`, reason `queried`, each queried line `Queried` with its question; the thread is **not** marked answered, so the verdict that follows the hospital's resubmission still goes. **With no line queried** (or on a claim reopened by a reprocess, whose own thread is closed): a CommunicationRequest on a thread of its own ([A5. Query Request](A5-query-request.md)), and nothing on the submission's thread |

**Cover is drawn down on the claim, not the pre-authorisation.** Approving a claim debits the approved amount from the enrolment's wallet ([D6. subscription](../database/D6-subscription.md) `wallet_balance`) and writes the ledger entry ([D8. wallet_entry](../database/D8-wallet-entry.md)) in the same transaction. An approval larger than the cover left is refused rather than discovered at settlement; a pre-authorisation is a promise and moves no money. A reprocess ([C7. Task Submit](../callbacks/C7-task-submit.md)) credits it back.

**Two ways to ask, the PMJAY shape for lines.** A question about particular lines is a line-item query: it rides back on the thread the submission came on, as the live PMJAY payer sends one, under the leg's query workflow (24, 241 after an enhancement, 27 on a claim) with `x-hcx-status` `response.complete` [PAYER](../references/PAYERS.md#markers). The hospital answers it by sending the pre-authorisation or the claim again (request.initiated, [C4. Pre-auth Submit](../callbacks/C4-preauth-submit.md), [C5. Claim Submit](../callbacks/C5-claim-submit.md)), which reopens the thread for the decision. A question about the case as a whole, with no line queried, goes out as a CommunicationRequest ([A5. Query Request](A5-query-request.md)) and is answered with a Communication ([C9. Communication](../callbacks/C9-communication.md)). The desk's **Raise Query** is that second kind, asked before anything is decided.

**Raise Query.** `POST /cases/:id/query` with `question`. It puts the case to `queried` with the question as its remarks and records who asked and when (`adjudicated_by`, `adjudicated_at`: the schema requires a time on every status but `pending`, [D19. case](../database/D19-case.md) `ck_cases_adjudicated`), leaves every line and the stage alone, writes the timeline event "Query Raised" with the question, audits `case.query_raised` with the stage, and sends the CommunicationRequest at once ([A5. Query Request](A5-query-request.md)). It is open while the case is open for decision and its status is `pending` or `queried` (a second question replaces the first and opens a fresh thread); a decided stage is refused, because a query is raised before the decision. The desk enables the button only for an adjudicator; the reference server leaves the role to the desk [REF](../references/PAYERS.md#markers), and a build applies the same role check as the case decision ("Your role does not allow this").

**The answer is sent once, when there is a decision.** The exchange keeps the submission's thread open only while it is being answered, so [C4. Pre-auth Submit](../callbacks/C4-preauth-submit.md) and [C5. Claim Submit](../callbacks/C5-claim-submit.md) acknowledge at filing (workflow 20 or 25, `response.partial`) and this service sends the decision (`response.complete`) on the same thread. A gateway that is down does not undo the decision: it is recorded, the case keeps its correlation ids, and the desk offers the send again ([S3. Case Desk](../screens/S3-case-desk.md)).

**Messages, verbatim.** Raise Query: "Say what the hospital is being asked for" (field `question`), "No case with that id", "This case has moved past adjudication and can no longer be decided", "This stage has been decided; a query is raised before the decision". Line decision: "Choose a decision for this line", "An approved amount cannot be negative", "Say what is being queried, so the hospital knows what to send", "Only an adjudicator can decide line items", "No such line item on this case". Case decision: "Choose whether to approve, query or reject", "Record why, so the hospital knows what to do next" (reject and query), "No case with that id", "This case has moved past adjudication and can no longer be decided", "A line item is still under query, raise the query or reject the case", "Every line item was rejected, this case can only be rejected", "There is not enough cover left on this policy" (with field `amount`: "This is more than the remaining wallet balance"), "Your role does not allow this".

Data: [D19. case](../database/D19-case.md), [D25. case_line_item](../database/D25-case-line-item.md), [D26. case_timeline](../database/D26-case-timeline.md), [D6. subscription](../database/D6-subscription.md), [D8. wallet_entry](../database/D8-wallet-entry.md), [D31. audit_log](../database/D31-audit-log.md).

#### A13Q. REQUEST

**Line decision**, `PATCH /cases/:id/line-items/:lineId`:

| Field | Type | Required | Notes |
|---|---|---|---|
| `status` | string | yes | `pending`, `approved`, `partially_approved`, `rejected`, `queried` |
| `approved_amount` | number | for `partially_approved` | what this payer allows on the line; ignored for the other decisions |
| `remarks` | string | no | the adjudicator's note on the line, trimmed |
| `query_remarks` | string | for `queried` | what the hospital is asked for on this line |

```json
{"status": "partially_approved", "approved_amount": 12000, "remarks": "Implant priced at the package rate"}
```

**Case decision**, `POST /cases/:id/adjudicate`:

| Field | Type | Required | Notes |
|---|---|---|---|
| `action` | string | yes | `approve`, `reject` or `query` |
| `remarks` | string | for `reject` and `query` | why; on `query` it is the text the hospital reads ([F11. CommunicationRequest](../fhir/F11-communicationrequest.md)) |

```json
{"action": "query", "remarks": "Send the ICU chart and the implant invoice"}
```

**Raise Query**, `POST /cases/:id/query`:

| Field | Type | Required | Notes |
|---|---|---|---|
| `question` | string | yes | what the hospital is asked; trimmed; becomes the case remarks and the request's payload ([F11. CommunicationRequest](../fhir/F11-communicationrequest.md)) |

```json
{"question": "Was the patient referred from another hospital? Send the referral letter."}
```

#### A13S. RESPONSE

`200` with the case as the desk shows it (the [D19. case](../database/D19-case.md) row with its lines, documents, timeline and exchange routing slip), after the decision and, on a case decision, after the answer was queued. The fields the desk reads back:

| Key | Content |
|---|---|
| `stage` | `preauth`, `claim`, `payment`, `settled`, `rejected`, `cancelled` |
| `adjudication` | `{"status", "remarks", "adjudicated_by", "adjudicated_at"}`; `status` is `pending`, `approved`, `rejected`, `queried` or `cancelled` |
| `line_items[]` | `{"id", "code", "modifier_code", "modifier_display", "description", "quantity", "unit_cost", "claimed_amount", "approved_amount", "status", "remarks", "query_remarks", "enhancement_no"}` |
| `total_claimed`, `total_approved`, `total_paid` | the running totals |
| `exchange` | the routing slip ([D19. case](../database/D19-case.md)): `answer_txn_id` set when a pre-auth verdict went out, `claim_answer_txn_id` when a claim verdict did, `query_correlation_id` and `query_txn_id` when a query did |
| `timeline[]` | the trail, newest last |

```json
{
  "id": "CASE-1017", "claim_no": "CL/26/0SE0000V9", "stage": "claim",
  "adjudication": {"status": "approved", "remarks": "Pre-auth approved", "adjudicated_by": "Asha Rao", "adjudicated_at": "2026-09-30T10:14:05.000Z"},
  "line_items": [{"id": "LI-7UQ2", "description": "Surgeon and anaesthetist fees", "claimed_amount": 69000, "approved_amount": 69000, "status": "approved"}],
  "total_claimed": 69000, "total_approved": 69000, "total_paid": 0,
  "exchange": {"correlation_id": "5b1f0c1e-...", "sender_code": "<facility code>", "recipient_code": "<payer code>", "claim_ref": "NM-26-0SE000001", "answer_txn_id": "7UPG003U"}
}
```

Raise Query answers `200` with the case after the CommunicationRequest was queued (its `exchange.query_correlation_id` and `query_txn_id` set), or with the case alone when it could not be. Errors: `422` `{"error": "Some details need correcting", "fields": {...}}` for a bad body; `403` for a role that may not decide; `404` "No case with that id"; `409` with the case-state messages above. A decision that was recorded but whose answer could not be queued is still `200`: the trail says "could not queue" and the send is offered again.

#### A13P. PSEUDOCODE

When: the desk's line rows and its Approve, Reject and Query buttons ([S3. Case Desk](../screens/S3-case-desk.md)). Also the sandbox scenarios, which decide through the same service ([A19. Sandbox Scenarios](A19-sandbox-scenarios.md)) [SANDBOX](../references/PAYERS.md#markers).

```text
DECIDE_LINE(case_id, line_id, decision, actor):
    validate: status in LineItemStatuses           or refuse "Choose a decision for this line"
              approved_amount >= 0                  or refuse "An approved amount cannot be negative"
              status == "queried" implies query_remarks not blank
                                                    or refuse "Say what is being queried, so the hospital knows what to send"
    if not CanAdjudicate(actor.role): refuse 403 "Only an adjudicator can decide line items"
    in one transaction, case row locked:
        case = D19 by case_id                       or refuse 404 "No such line item on this case"
        if case.stage not in (preauth, claim):      refuse 409 "This case has moved past adjudication and can no longer be decided"
        line = D25 by line_id and case_id           or refuse 404
        approved = round2(decision.approved_amount); status = decision.status
        switch status:
            approved:            approved = line.claimed_amount
            rejected, pending, queried: approved = 0
            partially_approved:  if approved <= 0: status, approved = rejected, 0
                                 elif approved >= line.claimed_amount: status, approved = approved, line.claimed_amount
        write D25[line]: status, approved_amount = approved, remarks, query_remarks (null unless queried)
        write D19[case]: total_claimed = sum(D25.claimed_amount), total_approved = sum(D25.approved_amount)
        append D26: title "Line Item <Approved|Partially Approved|Rejected|Queried|Updated>",
                    description "<line.description>, approved <approved> of <claimed> claimed.", actor
    audit (D31): action "line_item.<status>", entity case, detail line_id
    return the case

ADJUDICATE(case_id, action, remarks, actor):
    validate: action in (approve, reject, query)    or refuse "Choose whether to approve, query or reject"
              action in (reject, query) implies remarks not blank
                                                    or refuse "Record why, so the hospital knows what to do next"
    before = D19 by case_id                         or refuse 404 "No case with that id"   # the stage being decided
    if not CanAdjudicate(actor.role): refuse 403 "Your role does not allow this"
    in one transaction, case row locked:
        if case.stage not in (preauth, claim): refuse 409 "This case has moved past adjudication and can no longer be decided"
        switch action:
            approve:
                if any D25 line of the case is queried:      refuse 409 "A line item is still under query, raise the query or reject the case"
                if lines > 0 and every line is rejected:     refuse 409 "Every line item was rejected, this case can only be rejected"
                write D25 where status == pending: status = approved, approved_amount = claimed_amount
                recompute D19 totals; approved = D19.total_approved
                next_stage = claim if stage == preauth else payment
                status = approved; title = "Pre-Authorization Approved" or "Claim Approved for Disbursement"
                if stage == claim and approved > 0:
                    balance = D6[case.subscription_id].wallet_balance, locked
                    if balance < approved: refuse 409 "There is not enough cover left on this policy"
                    write D6: wallet_balance = balance - approved
                    insert D8: direction debit, amount approved, balance_after, reason "Claim <case_id> approved", actor
            reject:  next_stage = rejected; status = rejected; title = "Claim Rejected"
            query:   next_stage = stage;    status = queried;  title = "Additional Information Requested"
        write D19: stage = next_stage, adjudication_status = status, adjudication_remarks = remarks,
                   adjudicated_by = actor, adjudicated_at = now
        append D26: title, description remarks, actor
    audit (D31): action "case.<action>", entity case, detail stage
    record = ANSWER(before.stage, D19 by case_id)     # below; never fails the decision
    return record

ANSWER(decided_stage, record):                       # only a case that came off the exchange has anyone waiting
    if record.adjudication_status == queried:
        if any D25 line of the case is queried and record.exchange.reprocess_correlation_id not set:
            return LINE_QUERY(decided_stage, record)  # on the submission's own thread, PMJAY shape
        return A5.send_query(record)                  # a question on the case alone, on a thread of its own
    if decided_stage == preauth:
        txn = A3.send_verdict(record)                 # the pre-auth thread; writes D19.nhcx_answer_txn_id
    else if decided_stage == claim:
        if record.exchange.reprocess_correlation_id set:
            txn = A9.send_reprocess_verdict(record)   # the reprocess Task's thread; clears the reprocess slip
        else:
            txn = A4.send_verdict(record)             # the claim thread; writes D19.nhcx_claim_answer_txn_id
    return record read again

LINE_QUERY(decided_stage, record):                   # A3 or A4; reports, never fails the decision
    leg = claim if decided_stage == claim else preauth
    thread = record.nhcx_claim_correlation_id if leg == claim else record.nhcx_correlation_id
    if thread empty: return record
    if gateway not configured: log "case <id> was queried but no gateway is configured, so <hospital> was not asked"; return record
    bundle = F9 bundle(use = leg's use, the case as it stands)   # outcome partial, reason queried, queried items Queried
    headers = {x-hcx-sender_code: payer code, x-hcx-recipient_code: record.nhcx_sender_code,
               x-hcx-correlation_id: thread, x-hcx-workflow_id: query_workflow(record),   # 24, 241 or 27 (A5)
               x-hcx-status: "response.complete"}
    ack = SEND("v1/" + leg + "/on_submit", {jwe_headers: headers, fhir: bundle}, record)
        on failure f: log "could not queue the line query on case <id> for <hospital>: <f>"; return record
    # the thread is NOT marked answered: nhcx_answer_txn_id / nhcx_claim_answer_txn_id stay as they were
    asked = [record.adjudication_remarks] if set + for each queried line: (line.code or line.description) + ": " + line.query_remarks
    INSERT D27 {direction: out, kind: claimresponse, correlation_id: thread, txn_id: ack.txn_id,
                summary: "Line-item query sent: " + join(asked, "; "), payload: bundle}
    INSERT D26 {title: "Line-item Query Sent over NHCX",
                description: "<hospital> asked, on the <leg>'s own thread: " + join(asked, "; "), actor: "NHCX", type: warning}
    INSERT D31 audit {action: leg + ".queried", entity: case, detail: "<hospital> asked on the <leg> thread, correlation <thread>, txn <ack.txn_id>"}
    return record

RAISE_QUERY(case_id, question, actor):               # POST cases/:id/query
    validate: question not blank                     or refuse 422 field question "Say what the hospital is being asked for"
    in one transaction, case row locked:
        case = D19 by case_id                        or refuse 404 "No case with that id"
        if case.stage not in (preauth, claim):       refuse 409 "This case has moved past adjudication and can no longer be decided"
        if case.adjudication_status not in (pending, queried):
                                                     refuse 409 "This stage has been decided; a query is raised before the decision"
        write D19: adjudication_status = queried, adjudication_remarks = question,
                   adjudicated_by = actor, adjudicated_at = now      # ck_cases_adjudicated: no status but pending without a time
        append D26: title "Query Raised", description question, actor, type warning
    audit (D31): action "case.query_raised", entity case, detail stage
    return A5.send_query(D19 by case_id)             # no line touched, so always the CommunicationRequest
```

#### A13U. USED BY
- Screens: [S2. Cases](../screens/S2-cases.md), [S3. Case Desk](../screens/S3-case-desk.md), [S5. Subscriptions](../screens/S5-subscriptions.md)
- APIs: [A3. Pre-auth Answer](A3-preauth-answer.md), [A4. Claim Answer](A4-claim-answer.md), [A5. Query Request](A5-query-request.md), [A9. Task Answer](A9-task-answer.md), [A15. Case Exchange Log](A15-case-exchange.md), [A18. Provider Driver](A18-provider-driver.md), [A19. Sandbox Scenarios](A19-sandbox-scenarios.md)
- Callbacks: [C4. Pre-auth Submit](../callbacks/C4-preauth-submit.md), [C5. Claim Submit](../callbacks/C5-claim-submit.md), [C7. Task Submit](../callbacks/C7-task-submit.md)
- FHIR: [F11. CommunicationRequest](../fhir/F11-communicationrequest.md), [F12. Communication](../fhir/F12-communication.md)
- Database: [D2. staff](../database/D2-staff.md), [D6. subscription](../database/D6-subscription.md), [D8. wallet_entry](../database/D8-wallet-entry.md), [D19. case](../database/D19-case.md), [D25. case_line_item](../database/D25-case-line-item.md), [D26. case_timeline](../database/D26-case-timeline.md), [D31. audit_log](../database/D31-audit-log.md)
- Tests: [T2. Test Runners](../tests/T2-test-runners.md), [T6. Pre-auth Received and Approved](../tests/T6-preauth-approved.md), [T7. Pre-auth Rejected](../tests/T7-preauth-rejected.md), [T8. Pre-auth Queried and Answered](../tests/T8-preauth-queried.md), [T9. Enhancement Received and Approved](../tests/T9-enhancement-approved.md), [T12. Claim Received and Approved](../tests/T12-claim-approved.md), [T13. LAMA and Death Claims](../tests/T13-claim-lama-death.md), [T14. Reprocess and Balance Release](../tests/T14-reprocess-and-release.md), [T15. Payment Notices and Acknowledgement](../tests/T15-payment-noticed.md), [T16. Payment Enquiry Answered](../tests/T16-payment-enquiry-answered.md), [T17. Status Enquiry Answered](../tests/T17-status-answered.md), [T18. Redelivery and Duplicates](../tests/T18-redelivery-ignored.md)
