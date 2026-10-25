# T10. IRDAI Claim Approved, Part-approved and Rejected

#### T10D. DESCRIPTION

After discharge the claim leg goes out ([A5. Claim Submit](../apis/A5-claim-submit.md)) against the approved pre-authorisation and is decided by the payer, answered by [C6. Claim Reply](../callbacks/C6-claim-on-submit.md). A part-approval is decided per line: the payer approves less than was claimed on one or more lines.

#### T10S. SETUP

Three claims, each with an approved pre-authorisation ([T5. IRDAI Pre-authorisation Approved](T5-irdai-preauth-approved.md)), the IPD admission linked on the Claim tab (found by the case's ABHA number) and a discharge recorded. Before the claim is sent, the admission's bill is issued through the HMIS's own billing module (the record L1.3 `billing` found: an invoice, a bill, an account), so that the payment of [T11. IRDAI Payment Notice and Acknowledgement](T11-irdai-payment.md) has something to post to; a run that skips this leaves every payment `failed` with "The case is not on an encounter with a billing account; open the account first." and the D21 hook unproven [SANDBOX](../references/PAYERS.md#markers).

#### T10G. GUI

1. [S11. Claim Submission](../screens/S11-claim-submission.md) on the first claim: enter the bill lines matching the approval; send; payer side: approve.
2. [S11. Claim Submission](../screens/S11-claim-submission.md) on the second: send two lines; payer side: decide the lines first ([A15. Adjudicator Process Case](../apis/A15-adjudicator-process-case.md), the desk's line decision): the first `approved` in full, the second `partially_approved` at less than claimed; then `approve` the case.
3. [S11. Claim Submission](../screens/S11-claim-submission.md) on the third: send; payer side: reject with a remark.
4. Read each verdict on [S11. Claim Submission](../screens/S11-claim-submission.md).
5. On the first claim, between the send and the verdict: open the Pre-authorisation tab and try to add a line, save the details, attach a document and send an enhancement; after the verdict, try to cancel the pre-authorisation.

#### T10L. CLI

1. For each claim: [A5. Claim Submit](../apis/A5-claim-submit.md); [A14. Adjudicator User Role](../apis/A14-adjudicator-user-role.md); then [A15. Adjudicator Process Case](../apis/A15-adjudicator-process-case.md): `approve`; or the two line decisions followed by `approve`; or `reject` with a remark; wait for [C6. Claim Reply](../callbacks/C6-claim-on-submit.md).
2. On the first claim, while it is with the payer: call the line, details, document and [A4. Pre-auth Submit](../apis/A4-preauth-submit.md) enhancement services; after its verdict, [A6. Task Submit (cancel, status, reprocess, release)](../apis/A6-task-submit.md) cancel.

#### T10X. EXPECT

- Each claim goes out under the claim workflow id on its own correlation id, referring to its pre-authorisation.
- The first is `approved` for the claimed amount; the second is approved at the sum of the line amounts the payer allowed, with each line's allowed amount shown; the third is `rejected` with its reason.
- `outcome: complete` on the rejection is not read as an approval (CORE confusions).
- Once a claim is sent, its pre-authorisation is read only: adding a line, saving the pre-authorisation details, attaching a pre-authorisation document and sending an enhancement are each refused with "The claim has gone to the payer, so the pre-authorisation is read only: no enhancement or change can be made. It can only be cancelled while the payer is deciding the claim." While the claim is with the payer the pre-authorisation can still be cancelled; once the claim is decided a cancel is refused with "The payer has decided the claim; the pre-authorisation can no longer be cancelled."
- A claim refused at the door (it never reached the payer) leaves the pre-authorisation open and offers only "Send the claim again"; a decided claim is never sent again.
- "Ask where it stands" is offered on the claim once it is raised and still `submitting`.
