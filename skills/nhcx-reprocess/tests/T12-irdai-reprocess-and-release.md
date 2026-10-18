# T12. IRDAI Reprocess and Balance Release

#### T12D. DESCRIPTION

Both go out as a Task ([A6. Task Submit (cancel, status, reprocess, release)](../apis/A6-task-submit.md)) under the reprocess workflow id (36, [PAYERS.md](../references/PAYERS.md)). A decided claim is never sent again: the way back for a **rejected** claim is a reprocess, with reason `claimrejected` or `rejectiondisputed`, offered and accepted only on a `rejected` claim. The **balance release** is a separate action on an approved or part-approved claim not paid in full, carrying the amount still owed and a note, no reason code. The payer takes each in on `v1/task/on_submit` ([C8. Enquiry Reply](../callbacks/C8-enquiry-on-submit.md)) and, for a reprocess, decides the claim again.

#### T12S. SETUP

A claim rejected at the claim stage (T10. IRDAI Claim Approved, Part-approved and Rejected (in nhcx-claim)), a claim approved at the claim stage (T10. IRDAI Claim Approved, Part-approved and Rejected (in nhcx-claim)), and a claim paid in part (T11. IRDAI Payment Notice and Acknowledgement (in nhcx-payment), first instalment only).

#### T12G. GUI

1. [S11. Claim Submission](../screens/S11-claim-submission.md) on the approved claim: confirm "Ask for a reprocess" is not offered.
2. [S11. Claim Submission](../screens/S11-claim-submission.md) on the rejected claim: ask for a reprocess with reason `claimrejected` and a remark; wait.
3. Payer side: approve the case again; wait on [S11. Claim Submission](../screens/S11-claim-submission.md).
4. [S11. Claim Submission](../screens/S11-claim-submission.md) on the partly paid claim: ask for the balance, with the amount still owed and a note; wait.

#### T12L. CLI

1. [A6. Task Submit (cancel, status, reprocess, release)](../apis/A6-task-submit.md) reprocess on the approved claim: refused before any call.
2. [A6. Task Submit (cancel, status, reprocess, release)](../apis/A6-task-submit.md) reprocess on the rejected claim; wait for [C8. Enquiry Reply](../callbacks/C8-enquiry-on-submit.md); A14. Adjudicator User Role (in nhcx-preauth); A15. Adjudicator Process Case (in nhcx-preauth) `approve`; wait for the new verdict.
3. [A6. Task Submit (cancel, status, reprocess, release)](../apis/A6-task-submit.md) release on the partly paid claim with the amount; wait for [C8. Enquiry Reply](../callbacks/C8-enquiry-on-submit.md).

#### T12X. EXPECT

- A reprocess of any claim but a `rejected` one is refused with "Only a claim the payer has rejected can be sent back for reprocessing.", and the reason list offers only `claimrejected` and `rejectiondisputed`. Sending the decided claim again is refused with "The payer has decided this claim; it goes back for another look as a reprocess request, not as a claim sent again."
- Each Task goes out under workflow id 36, naming the claim, and is acknowledged on its own thread.
- After the payer approves again, the rejected claim shows `approved` and keeps the earlier rejection in its history. The new verdict may come back on the reprocess Task's own thread ([C8. Enquiry Reply](../callbacks/C8-enquiry-on-submit.md), a completed Task carrying the decision, the way the IRDAI test payer answers, 252 approved or 253 rejected) or on the claim's thread (C6. Claim Reply (in nhcx-claim)); both must settle the claim.
- The release request is shown against the partly paid claim with its amount and note; a later payment for the balance is recorded as a further instalment (T11. IRDAI Payment Notice and Acknowledgement (in nhcx-payment)).
