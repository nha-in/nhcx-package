# T17. PMJAY Claim Through the Role Walk

#### T17D. DESCRIPTION

The PMJAY claim leg ([A5. Claim Submit](../apis/A5-claim-submit.md)) is decided through the full role walk ([A15. Adjudicator Process Case](../apis/A15-adjudicator-process-case.md)): CEX-Trust, CPD-Trust, Medical Audit Committee, ACO-Trust, SHA-Trust, then Claim Review Committee, at most 8 rounds. PMJAY acknowledges the claim, then decides it, both as [C6. Claim Reply](../callbacks/C6-claim-on-submit.md). A queried claim is answered by sending the claim again under PMJAY's claim query-response workflow id; a decided claim is never sent again, for any payer ([PAYERS.md](../references/PAYERS.md#workflow-ids)): a rejected one goes back as a reprocess.

#### T17S. SETUP

Two PMJAY claims with an approved pre-authorisation ([T14. PMJAY Pre-authorisation Through the Payer Service](T14-pmjay-preauth-adjudicated.md)), the IPD admission linked on the Claim tab and a discharge recorded, each with the Discharge Consent answered on the claim's forms card ([S11. Claim Submission](../screens/S11-claim-submission.md)) unless a stage-Discharge token is held ([T19. PMJAY Beneficiary Verification and ABHA](T19-pmjay-biometric-and-abha.md)): without either the claim is refused PAYR-1363 [SANDBOX](../references/PAYERS.md#markers). The sandbox may decide a claim by itself as it does a pre-authorisation; the desk steps are then recorded `skipped (sandbox auto-decided)` and the test passes on the decision, and the second claim (the query) ends `blocked`, cause `sandbox`, when the package is auto-decided.

#### T17G. GUI

1. First claim, [S11. Claim Submission](../screens/S11-claim-submission.md): enter the bill and send; wait for the acknowledgement; payer side: `approve` cycle; wait for the decision on [S11. Claim Submission](../screens/S11-claim-submission.md).
2. Second claim, [S11. Claim Submission](../screens/S11-claim-submission.md): send; payer side: `query` cycle with a remark; answer on [S11. Claim Submission](../screens/S11-claim-submission.md); payer side: `approve` cycle; wait.

#### T17L. CLI

1. [A5. Claim Submit](../apis/A5-claim-submit.md); wait for [C6. Claim Reply](../callbacks/C6-claim-on-submit.md) (acknowledgement); [A14. Adjudicator User Role](../apis/A14-adjudicator-user-role.md); [A15. Adjudicator Process Case](../apis/A15-adjudicator-process-case.md) cycle `approve`; wait for [C6. Claim Reply](../callbacks/C6-claim-on-submit.md) (decision).
2. [A5. Claim Submit](../apis/A5-claim-submit.md); [A15. Adjudicator Process Case](../apis/A15-adjudicator-process-case.md) cycle `query`; wait for [C6. Claim Reply](../callbacks/C6-claim-on-submit.md) (queried); [A5. Claim Submit](../apis/A5-claim-submit.md) as the query answer; [A15. Adjudicator Process Case](../apis/A15-adjudicator-process-case.md) cycle `approve`; wait for [C6. Claim Reply](../callbacks/C6-claim-on-submit.md).

#### T17X. EXPECT

- The approve cycle's trail walks the roles in the order above, with each role's own action name (CEX-Trust `Forward`, CPD-Trust `cpdApprove`, the rest `Approve`), and stops `completed` at Claim Review Committee within 8 rounds; or the sandbox auto-decided and the steps read `skipped (sandbox auto-decided)` [SANDBOX](../references/PAYERS.md#markers).
- The first claim ends `approved` with PMJAY's amount, shown on [S11. Claim Submission](../screens/S11-claim-submission.md).
- The query answer goes out under PMJAY's claim query-response workflow id with `request.initiated`, and the second claim ends `approved`.
- A decided claim is never sent again: the send is refused with "The payer has decided this claim; it goes back for another look as a reprocess request, not as a claim sent again.", and "Ask for a reprocess" appears only on a rejected claim.
- From the moment each claim is sent its pre-authorisation is read only (an enhancement or any change is refused with "The claim has gone to the payer, so the pre-authorisation is read only: no enhancement or change can be made. It can only be cancelled while the payer is deciding the claim."), and once the claim is decided its pre-authorisation can no longer be cancelled.
