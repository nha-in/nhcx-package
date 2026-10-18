# T14. Reprocess and Balance Release

#### T14D. DESCRIPTION

A reprocess Task arrives on [C7. Task Submit](../callbacks/C7-task-submit.md) for a rejected claim, the only claim a hospital asks to have reprocessed (it never sends a decided claim again): the case reopens for a person, whatever the claim had drawn on the cover is credited back (a rejected claim drew nothing), and [A9. Task Answer](../apis/A9-task-answer.md) acknowledges at once (workflow 37) on the Task's thread. The decision that follows goes out on that same thread as a completed Task carrying the ClaimResponse (252 or 253), because the claim's own thread was completed by the verdict being disputed. A release Task, naming the balance, is the same road. Reopening an open case is refused, and so is the decided claim sent again as a claim ([C5. Claim Submit](../callbacks/C5-claim-submit.md)).

#### T14S. SETUP

One member under the [T1. Test Configuration](T1-test-configuration.md) prefix enrolled on the default product; note the wallet. A claim rejected on the desk (as [T7. Pre-auth Rejected](T7-preauth-rejected.md) but at the claim stage: file the claim as in [T12. Claim Received and Approved](T12-claim-approved.md) and reject it). A desk account that may decide cases.

#### T14G. GUI

1. Hospital side, through the provider driver ([T2. Test Runners](T2-test-runners.md)): send a pre-authorisation, have it approved, file the claim; [S3. Case Desk](../screens/S3-case-desk.md): reject the claim with "Within the waiting period.".
2. Hospital side: ask for a reprocess with the reason "The admission was an emergency.".
3. [S2. Cases](../screens/S2-cases.md): the case is at stage `claim`, pending again, with the reprocess count 1; open it.
4. [S3. Case Desk](../screens/S3-case-desk.md): the timeline says the claim was reopened at the hospital's request; the exchange log shows the Task in and the acknowledgement out.
5. [S5. Subscriptions](../screens/S5-subscriptions.md): the wallet is unchanged, because the rejected claim never drew on it.
6. Hospital side: ask for a reprocess again; the claim tab shows the refusal.
7. [S3. Case Desk](../screens/S3-case-desk.md): approve every line and the claim on review.
8. Hospital side: the claim tab shows the reprocess decided, approved.

#### T14L. CLI

1. Seed, send, approve, file and reject through [A18. Provider Driver](../apis/A18-provider-driver.md) and [A13. Adjudicate](../apis/A13-adjudicate.md).
2. Through [A18. Provider Driver](../apis/A18-provider-driver.md), send the reprocess Task; wait for the case through [A15. Case Exchange Log](../apis/A15-case-exchange.md).
3. Through [A18. Provider Driver](../apis/A18-provider-driver.md), send the reprocess Task again; read the exchange log.
4. Approve the lines and the claim through [A13. Adjudicate](../apis/A13-adjudicate.md); read the exchange log; read the hospital's side through [A18. Provider Driver](../apis/A18-provider-driver.md).
5. On a second case with the claim approved and not yet paid, through [A18. Provider Driver](../apis/A18-provider-driver.md) send a release Task with the balance; read the case through [A15. Case Exchange Log](../apis/A15-case-exchange.md).
6. Through [A18. Provider Driver](../apis/A18-provider-driver.md), send the first case's claim again as a claim after the new decision; read the delivery outcome.

#### T14X. EXPECT

- The reprocess delivery is answered `reprocessing`; the case's adjudication is `pending`, `reprocess_count` 1, and [D19. case](../database/D19-case.md) holds the Task's correlation id as the reprocess thread.
- The acknowledgement goes out on `v1/task/on_submit` on the Task's correlation id, workflow 37, `response.partial` so the thread stays open for the decision ([A9. Task Answer](../apis/A9-task-answer.md)), the Task `accepted`, the ClaimResponse on its output `queued` ([F10. Task (claim actions and answers)](../fhir/F10-task-claim-actions.md)).
- The wallet balance is what it was before the rejected claim: no credit is written, because nothing was drawn. On the released case the approved amount is credited back (a [D8. wallet_entry](../database/D8-wallet-entry.md) entry names the reprocess).
- The second reprocess is answered `refused` and the Task goes back `rejected` with "<claim number> is still open, there is nothing to reopen." in words.
- The new decision goes out on the reprocess thread as a completed Task with the ClaimResponse, workflow 252 (approved) or 253 (rejected), never on the claim's own thread; the reprocess thread is then cleared.
- A release Task on the approved, unpaid case reopens it the same way, with the balance asked for in the timeline; a case with money paid answers "<claim number> has been paid and cannot be reprocessed.".
- The claim sent again after the decision is refused at the callback: "The pre-authorisation <claim number> is <stage> and cannot take a claim" (`rejected`), and nothing on the case changes.
