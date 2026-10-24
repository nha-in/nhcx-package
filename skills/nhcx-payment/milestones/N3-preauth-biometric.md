# N3. Pre-authorisation and Biometric

#### GOAL
Request cashless approval from the payer: the pre-authorisation details and send, the beneficiary's biometric proof of presence where the payer needs it, the payer's verdict, query answers, enhancement, cancel and status. This is the first milestone that writes the claim-side FHIR, which N5 claim later reuses.

#### DEPENDS ON
N0 (gateway, case shell, parties) and N2 (the plan and the line items a pre-authorisation quotes).

#### DELIVERS
- Screens: S4. Pre-authorisation Details and Admission Link (in nhcx-preauth) (pre-authorisation details, admission linked on the Claim tab), S9. Pre-authorisation (in nhcx-preauth) (the pre-authorisation tab, forms, documents and send), S18. Beneficiary Verification (in nhcx-coverage) (biometric proof of presence at stage Preauth), S16. Practitioner Master (in nhcx-preauth) (practitioner master, for the treating doctors).
- Services and callbacks: A4. Pre-auth Submit (in nhcx-preauth) (pre-authorisation submit), A6. Task Submit (cancel, status, reprocess, release) (in nhcx-preauth) (cancel and status; its reprocess and release part is delivered by N5), A14. Adjudicator User Role (in nhcx-preauth) to A16. Gateway Token (in nhcx-preauth), A18. Biometric Authentication (in nhcx-coverage) (biometric authentication), C5. Pre-auth Reply (in nhcx-preauth) (on_submit), C7. Cancel Reply (in nhcx-preauth) and C8. Enquiry Reply (in nhcx-preauth).
- FHIR: F7. QuestionnaireResponse (in nhcx-coverage) to F10. Task (claim actions) (in nhcx-preauth) and F19. Other bundle resources (in nhcx-coverage) (the pre-authorisation bundle, the Claim resource with `use: preauthorization`, supporting information and the response read).

#### REUSES
From N0: [F1. Bundle](../fhir/F1-bundle.md), [F15. Patient](../fhir/F15-patient.md) to [F18. Coverage](../fhir/F18-coverage.md), [S6. Claim Detail](../screens/S6-claim-detail.md), [D9. claim](../database/D9-claim.md), the gateway and [C1. Callback Door](../callbacks/C1-callback-door.md). From N2: the plan, the quoted line items and the eligibility result the pre-authorisation draws on.

#### STEPS
Run the ordinary steps scoped to the ids above, writing `nhcx-plan/N3/`: discovery, mapping, plan (the Pre-authorisation phase), code plan, code, validation and dry-run. A milestone stops at dry-run; the live sandbox exchange (L8) runs once at the end across the whole lifecycle. F8. Claim (in nhcx-preauth) is built here for `use: preauthorization`; record it so N5 can extend the same builder for `use: claim` rather than fork it.

N3 is the largest milestone, but run it straight through without stopping to confirm. Do not pause between its steps (discovery, mapping, plan, code plan, code, validation, dry-run) to report progress or ask permission to continue: there is no confirmation gate inside a milestone. The only halt allowed before dry-run is green is a genuine blocker that no default resolves (a spec the knowledge source does not cover, a contradiction in the target). Size or elapsed time is not such a blocker; keep going to this milestone's dry-run done-when, then go straight on to N4 and N5.

#### DONE WHEN
In dry-run (gateway mocked, callbacks stubbed): a pre-authorisation is sent from S9. Pre-authorisation (in nhcx-preauth) (with biometric through S18. Beneficiary Verification (in nhcx-coverage) where the payer requires it), a stubbed C5. Pre-auth Reply (in nhcx-preauth) returns the payer's verdict and it shows on S9. Pre-authorisation (in nhcx-preauth), and the pre-authorisation can be cancelled through A6. Task Submit (cancel, status, reprocess, release) (in nhcx-preauth) while it is still open. The live sandbox proof is deferred to the final end-to-end step.
