# N3. Pre-authorisation and Biometric

#### GOAL
Request cashless approval from the payer: the pre-authorisation details and send, the beneficiary's biometric proof of presence where the payer needs it, the payer's verdict, query answers, enhancement, cancel and status. This is the first milestone that writes the claim-side FHIR, which N5 claim later reuses.

#### DEPENDS ON
N0 (gateway, case shell, parties) and N2 (the plan and the line items a pre-authorisation quotes).

#### DELIVERS
- Screens: [S4. Pre-authorisation Details and Admission Link](../screens/S4-claim-creation-form.md) (pre-authorisation details, admission linked on the Claim tab), [S9. Pre-authorisation](../screens/S9-preauthorisation.md) (the pre-authorisation tab, forms, documents and send), [S18. Beneficiary Verification](../screens/S18-beneficiary-verification.md) (biometric proof of presence at stage Preauth), [S16. Practitioner Master](../screens/S16-practitioner-master.md) (practitioner master, for the treating doctors).
- Services and callbacks: [A4. Pre-auth Submit](../apis/A4-preauth-submit.md) (pre-authorisation submit), [A6. Task Submit (cancel, status, reprocess, release)](../apis/A6-task-submit.md) (cancel and status; its reprocess and release part is delivered by N5), [A14. Adjudicator User Role](../apis/A14-adjudicator-user-role.md) to [A16. Gateway Token](../apis/A16-gateway-token.md), [A18. Biometric Authentication](../apis/A18-biometric-authentication.md) (biometric authentication), [C5. Pre-auth Reply](../callbacks/C5-preauth-on-submit.md) (on_submit), [C7. Cancel Reply](../callbacks/C7-cancel-on-submit.md) and [C8. Enquiry Reply](../callbacks/C8-enquiry-on-submit.md).
- FHIR: [F7. QuestionnaireResponse](../fhir/F7-questionnaireresponse.md) to [F10. Task (claim actions)](../fhir/F10-task-claim-actions.md) and [F19. Other bundle resources](../fhir/F19-other-resources.md) (the pre-authorisation bundle, the Claim resource with `use: preauthorization`, supporting information and the response read).

#### REUSES
From N0: [F1. Bundle](../fhir/F1-bundle.md), [F15. Patient](../fhir/F15-patient.md) to [F18. Coverage](../fhir/F18-coverage.md), [S6. Claim Detail](../screens/S6-claim-detail.md), [D9. claim](../database/D9-claim.md), the gateway and [C1. Callback Door](../callbacks/C1-callback-door.md). From N2: the plan, the quoted line items and the eligibility result the pre-authorisation draws on.

#### STEPS
Run the ordinary steps scoped to the ids above, writing `nhcx-plan/N3/`: discovery, mapping, plan (the Pre-authorisation phase), code plan, code, validation and dry-run. A milestone stops at dry-run; the live sandbox exchange (L8) runs once at the end across the whole lifecycle. [F8. Claim](../fhir/F8-claim.md) is built here for `use: preauthorization`; record it so N5 can extend the same builder for `use: claim` rather than fork it.

#### DONE WHEN
In dry-run (gateway mocked, callbacks stubbed): a pre-authorisation is sent from [S9. Pre-authorisation](../screens/S9-preauthorisation.md) (with biometric through [S18. Beneficiary Verification](../screens/S18-beneficiary-verification.md) where the payer requires it), a stubbed [C5. Pre-auth Reply](../callbacks/C5-preauth-on-submit.md) returns the payer's verdict and it shows on [S9. Pre-authorisation](../screens/S9-preauthorisation.md), and the pre-authorisation can be cancelled through [A6. Task Submit (cancel, status, reprocess, release)](../apis/A6-task-submit.md) while it is still open. The live sandbox proof is deferred to the final end-to-end step.
