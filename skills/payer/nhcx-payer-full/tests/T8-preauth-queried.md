# T8. Pre-auth Queried and Answered

#### T8D. DESCRIPTION

Both query roads on one case [PAYER](../references/PAYERS.md#markers). First the line-item query, the PMJAY way: an adjudicator queries a line and the case through [A13. Adjudicate](../apis/A13-adjudicate.md); [A3. Pre-auth Answer](../apis/A3-preauth-answer.md) sends a ClaimResponse on the pre-auth thread, `outcome` `partial`, the line `Queried` (workflow 24, `response.complete`), and the thread is not marked answered; the hospital sends the pre-authorisation again (workflow 19, `request.initiated`), which [C4. Pre-auth Submit](../callbacks/C4-preauth-submit.md) takes as the answer and acknowledges (20). Then the question on the case as a whole: the desk's Raise Query, before any decision, goes out as a CommunicationRequest ([A5. Query Request](../apis/A5-query-request.md), workflow 24) on a thread of its own; the hospital's Communication arrives on [C9. Communication](../callbacks/C9-communication.md) and is filed with its document; the case is pending again and is approved as in [T6. Pre-auth Received and Approved](T6-preauth-approved.md).

#### T8S. SETUP

One member under the [T1. Test Configuration](T1-test-configuration.md) prefix enrolled on the default product. A desk account that may decide cases.

#### T8G. GUI

1. Hospital side, through the provider driver ([T2. Test Runners](T2-test-runners.md)): open a case, check eligibility, fetch the plan, add an implant line and a surgery line, and send the pre-authorisation.
2. [S2. Cases](../screens/S2-cases.md): open the pending case.
3. [S3. Case Desk](../screens/S3-case-desk.md): mark the implant line queried with "Implant invoice is missing.", write the same in the remarks, and Send Line-item Query.
4. [S3. Case Desk](../screens/S3-case-desk.md): the exchange log shows the acknowledgement and the line-item query out on the pre-auth thread; the thread still reads `awaiting verdict`.
5. Hospital side: the pre-authorisation tab shows the queried line with its question; answer it by sending the pre-authorisation again with a note.
6. [S3. Case Desk](../screens/S3-case-desk.md): the note is on the timeline, the implant line is `pending` again, the pre-auth thread is the resubmission's correlation id, and a second acknowledgement went out.
7. [S3. Case Desk](../screens/S3-case-desk.md): write "Was the patient referred from another hospital? Send the referral letter." in the remarks and Raise Query.
8. [S3. Case Desk](../screens/S3-case-desk.md): the case shows a query open; the exchange log shows the CommunicationRequest out on a query thread, and nothing new on the pre-auth thread.
9. Hospital side: the communication tab shows the query; reply with text and attach a PDF filed as a referral letter.
10. [S3. Case Desk](../screens/S3-case-desk.md): the reply is on the timeline, the document is under documents, the case is pending again with the query closed.
11. [S3. Case Desk](../screens/S3-case-desk.md): approve both lines and the case.
12. Hospital side: the pre-authorisation tab shows approved.

#### T8L. CLI

1. Seed the member and enrolment; through [A18. Provider Driver](../apis/A18-provider-driver.md), send the pre-authorisation with two lines.
2. Wait for the case through [A15. Case Exchange Log](../apis/A15-case-exchange.md); query the implant line and the case through [A13. Adjudicate](../apis/A13-adjudicate.md).
3. Read the exchange log through [A15. Case Exchange Log](../apis/A15-case-exchange.md): the line-item query on the pre-auth thread and its transaction.
4. Through [A18. Provider Driver](../apis/A18-provider-driver.md) `answer_query_by_resubmit`, send the pre-authorisation again with a note.
5. Wait for the case to be `pending` through [A15. Case Exchange Log](../apis/A15-case-exchange.md); raise a query through [A13. Adjudicate](../apis/A13-adjudicate.md) (`POST cases/:id/query`).
6. Through [A18. Provider Driver](../apis/A18-provider-driver.md), reply to the query with text and one document.
7. Wait for the reply on the case through [A15. Case Exchange Log](../apis/A15-case-exchange.md), polling the query thread through [A11. Transaction Related](../apis/A11-txn-related.md) after `NHCX_PAYER_TEST_POLL_AFTER_SECONDS`.
8. Approve the lines and the case through [A13. Adjudicate](../apis/A13-adjudicate.md); read the hospital's side through [A18. Provider Driver](../apis/A18-provider-driver.md).

#### T8X. EXPECT

- The line-item query is a ClaimResponse on `v1/preauth/on_submit`, on the pre-authorisation's own correlation id, workflow 24, `x-hcx-status` `response.complete`, `outcome` `partial`, the implant line's status `Queried` with the question as its reason ([F9. ClaimResponse](../fhir/F9-claimresponse.md)); [D19. case](../database/D19-case.md) `nhcx_answer_txn_id` stays empty.
- The resubmission is taken as the answer, not as a new case: the note on the timeline ("Query Answered"), the line back to `pending`, the pre-auth thread re-pointed at its correlation id, an acknowledgement on 20 `response.partial`.
- Raise Query touches no line and sends no ClaimResponse: the only message out is the CommunicationRequest on `v1/communication/request`, workflow 24, `x-hcx-status` `request.initiated`, on a fresh correlation id the gateway minted ([F11. CommunicationRequest](../fhir/F11-communicationrequest.md)); the case keeps that id as its query thread; [D31. audit_log](../database/D31-audit-log.md) holds `case.query_raised`.
- The request carries a Task coded `poll` with reason `additionalinfo` and one payload with the question [PAYER](../references/PAYERS.md#markers).
- The reply is filed on the case: the text on the timeline, one document, the adjudication `pending`, the query thread cleared ([D19. case](../database/D19-case.md)).
- The approval goes out on the pre-auth thread, workflow 21, as in [T6. Pre-auth Received and Approved](T6-preauth-approved.md), once only.
- The hospital's side shows the line-item query, the resubmission, the question, the reply sent, then the approval.
