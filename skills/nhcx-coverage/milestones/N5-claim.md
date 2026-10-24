# N5. Claim

#### GOAL
File the cashless claim after discharge: the discharge details, the claim-stage documents and forms, the claim request and its query answers, the payer's verdict and status, and the reprocess of a rejected claim or the release of a withheld balance. The claim locks the pre-authorisation behind it, as the core rule in [references/SCAFFOLDING.md](../references/SCAFFOLDING.md) says.

#### DEPENDS ON
N0 (gateway, case shell) and N3 (the approved pre-authorisation the claim bills, the claim-side FHIR built there).

#### DELIVERS
- S11. Claim Submission (in nhcx-claim) (the Claim tab: discharge, documents, forms and the claim send; biometric at stage Discharge reuses [S18. Beneficiary Verification](../screens/S18-beneficiary-verification.md)).
- A5. Claim Submit (in nhcx-claim) (claim submit), and the reprocess and release part of A6. Task Submit (cancel, status, reprocess, release) (in nhcx-preauth) (workflow 36, `claimrejected` or `rejectiondisputed`, and a balance release).
- C6. Claim Reply (in nhcx-claim) (on_submit for the claim).

#### REUSES
From N0: [F1. Bundle](../fhir/F1-bundle.md), [F15. Patient](../fhir/F15-patient.md) to [F18. Coverage](../fhir/F18-coverage.md), [S6. Claim Detail](../screens/S6-claim-detail.md), [D9. claim](../database/D9-claim.md), the gateway and [C1. Callback Door](../callbacks/C1-callback-door.md). From N3: the pre-authorisation, [S18. Beneficiary Verification](../screens/S18-beneficiary-verification.md) (now at stage Discharge), C8. Enquiry Reply (in nhcx-preauth), and the F8. Claim (in nhcx-preauth) builder, **extended** here for `use: claim` (billable period admission to discharge) rather than forked; [F7. QuestionnaireResponse](../fhir/F7-questionnaireresponse.md), F9. ClaimResponse (in nhcx-preauth), F10. Task (claim actions) (in nhcx-preauth) and [F19. Other bundle resources](../fhir/F19-other-resources.md) reused for the claim leg.

#### STEPS
Run the ordinary steps scoped to the ids above, writing `nhcx-plan/N5/`: discovery, mapping, plan (the Claim phase), code plan, code, validation and dry-run. A milestone stops at dry-run; the live sandbox exchange (L8) runs once at the end across the whole lifecycle. The code plan reuses the F8. Claim (in nhcx-preauth) builder from N3's `code.json` and records the `use: claim` extension; it does not plan a second builder.

#### DONE WHEN
In dry-run (gateway mocked, callbacks stubbed): a claim is submitted from S11. Claim Submission (in nhcx-claim) after discharge against an approved pre-authorisation, a stubbed C6. Claim Reply (in nhcx-claim) returns the verdict and it shows on the case, a rejected claim goes back as a reprocess through A6. Task Submit (cancel, status, reprocess, release) (in nhcx-preauth), and the pre-authorisation is read only once the claim has reached the payer. The live sandbox proof is deferred to the final end-to-end step.
