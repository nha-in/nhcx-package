# Milestones

How this skill runs the build. The work is cut into **milestones**: one vertical slice of the claim lifecycle at a time, each carried from discovery through dry-run (discovery, mapping, plan, code, validation and dry-run) before the next begins. This is the only mode; the whole integration is never discovered, then mapped, then planned in one layered pass. A milestone stops at dry-run; the live sandbox exchange (L8 end-to-end) is **not** run per milestone but once at the very end, across the whole lifecycle, after every milestone's dry-run is green.

The milestones are the phases of [references/SCAFFOLDING.md](../references/SCAFFOLDING.md) section 12 and the phases L3 already names, promoted to be the outer loop of the build. A milestone owns a set of spec ids, declares the milestones it depends on, and reuses what they built rather than rebuilding it.

## Why

- A working slice sooner: N1 policy search is discovered, planned, written and proven on the sandbox before N5 claim is looked at, so the integration is demonstrable from early on and resumable between prompts at a feature boundary, not mid-mapping.
- Less speculative work: a milestone's mapping and code plan cover only the specs it delivers, so nothing is enumerated that no code of that milestone consumes. This is the same saving as the L2 and L4 trims, taken to the whole build.
- A report a person reads by feature: each milestone shows its own step status and its own done-when, so progress reads as "N1 done, N2 done, N3 in progress", not eight flat layers at once.

## The milestones

| # | Milestone | Delivers (spec ids it builds) | Depends on |
|---|---|---|---|
| **N0** | [Foundation](N0-foundation.md) | the shared base every slice needs: [G1. Embedding](../gateway/G1-embedding.md) to [G11. Startup Checks and Health](../gateway/G11-startup-checks.md), [C1. Callback Door](../callbacks/C1-callback-door.md), [A10. Transaction Related](../apis/A10-txn-related.md) to [A13. Transaction List](../apis/A13-txn-list.md), [A17. Claim State](../apis/A17-claim-state.md), [S5. Claim Master](../screens/S5-claim-master.md), [S6. Claim Detail](../screens/S6-claim-detail.md), [S19. NHCX Settings](../screens/S19-nhcx-settings.md), [F1. Bundle](../fhir/F1-bundle.md), [F15. Patient](../fhir/F15-patient.md) to [F18. Coverage](../fhir/F18-coverage.md), [D1. organization](../database/D1-organization.md) to [D3. patient](../database/D3-patient.md), [D9. claim](../database/D9-claim.md), [D30. counter](../database/D30-counter.md), [D32. participant](../database/D32-participant.md) | none |
| **N1** | [Search Policy](N1-search-policy.md) | [S1. Search Policy](../screens/S1-search-policy.md), [S2. Select Policy](../screens/S2-select-policy.md), [S17. Beneficiary Discovery](../screens/S17-beneficiary-discovery.md), [A1. Policy Search](../apis/A1-policy-search.md), [A19. ABHA Create and Verify (ABDM M1)](../apis/A19-abha-m1.md), [S13. Patient List](../screens/S13-patient-list.md) to [S15. Patient Detail](../screens/S15-patient-detail.md) | N0 |
| **N2** | [Coverage and Insurance](N2-coverage-insurance.md) | [S3. Policy Discovery](../screens/S3-policy-discovery.md), [A2. Coverage Eligibility Check](../apis/A2-coverage-eligibility-check.md), [C2. Coverage Eligibility Verdict](../callbacks/C2-coverage-eligibility-on-check.md), [F2. CoverageEligibilityRequest](../fhir/F2-coverage-eligibility-request.md), [F3. CoverageEligibilityResponse](../fhir/F3-coverage-eligibility-response.md), [D31. biometric_auth](../database/D31-biometric-auth.md); [S7. Insurance Plan](../screens/S7-insurance-plan.md), [S8. Line Items](../screens/S8-line-items.md), [A3. Insurance Plan Request](../apis/A3-insurance-plan-request.md), [C3. Authorisation Requirements Ruling](../callbacks/C3-auth-requirements-on-check.md), [C4. Insurance Plan Reply](../callbacks/C4-insuranceplan-on-request.md), [F4. Task (InsurancePlan discovery)](../fhir/F4-task-insuranceplan.md) to [F6. Questionnaire](../fhir/F6-questionnaire.md) | N0, N1 |
| **N3** | [Pre-authorisation and Biometric](N3-preauth-biometric.md) | [S4. Pre-authorisation Details and Admission Link](../screens/S4-claim-creation-form.md), [S9. Pre-authorisation](../screens/S9-preauthorisation.md), [S18. Beneficiary Verification](../screens/S18-beneficiary-verification.md), [S16. Practitioner Master](../screens/S16-practitioner-master.md), [A4. Pre-auth Submit](../apis/A4-preauth-submit.md), [A6. Task Submit (cancel, status, reprocess, release)](../apis/A6-task-submit.md), [A14. Adjudicator User Role](../apis/A14-adjudicator-user-role.md) to [A16. Gateway Token](../apis/A16-gateway-token.md), [A18. Biometric Authentication](../apis/A18-biometric-authentication.md), [C5. Pre-auth Reply](../callbacks/C5-preauth-on-submit.md), [C7. Cancel Reply](../callbacks/C7-cancel-on-submit.md), [C8. Enquiry Reply](../callbacks/C8-enquiry-on-submit.md), [F7. QuestionnaireResponse](../fhir/F7-questionnaireresponse.md) to [F10. Task (claim actions)](../fhir/F10-task-claim-actions.md), [F19. Other bundle resources](../fhir/F19-other-resources.md) | N0, N2 |
| **N4** | [Communication](N4-communication.md) | [S10. Communication](../screens/S10-communication.md), [A7. Communication Reply](../apis/A7-communication-on-request.md), [C9. Payer Communication](../callbacks/C9-communication-request.md), [F11. CommunicationRequest](../fhir/F11-communicationrequest.md), [F12. Communication](../fhir/F12-communication.md) | N0, N3 |
| **N5** | [Claim](N5-claim.md) | [S11. Claim Submission](../screens/S11-claim-submission.md), [A5. Claim Submit](../apis/A5-claim-submit.md), [C6. Claim Reply](../callbacks/C6-claim-on-submit.md) (and the reprocess and release part of [A6. Task Submit (cancel, status, reprocess, release)](../apis/A6-task-submit.md)) | N0, N3 |
| **N6** | [Payment](N6-payment.md) | [S12. Payments](../screens/S12-payments.md), [A8. Payment Notice Acknowledgement](../apis/A8-paymentnotice-on-request.md), [C10. Payment Notice](../callbacks/C10-paymentnotice-request.md), [F13. PaymentNotice](../fhir/F13-paymentnotice.md), [F14. Payment acknowledgement](../fhir/F14-payment-acknowledgement.md) | N0, N5 |

The database tables a milestone needs are whatever its delivered screens, APIs, callbacks and FHIR specs reach (the read sets in [references/READSETS.md](../references/READSETS.md)); they are not listed again here, and a table reached by two milestones is built by the earlier one and reused by the later.

## Dependency order

```
N0 Foundation
  └─ N1 Search Policy
       └─ N2 Coverage and Insurance
            └─ N3 Pre-authorisation and Biometric
                 ├─ N4 Communication
                 └─ N5 Claim
                      └─ N6 Payment
```

Build N0 first, then follow the arrows. N4 and N5 both sit on N3 and may be built in either order; N6 needs N5. A milestone whose specs are entirely outside SCOPE (a focused skill such as `nhcx-coverage` holds only some) is dropped, with its reason logged; its dependents then reuse from the earliest milestone still present, or declare the gap as an external prerequisite.

## Deliver and reuse

Each milestone file names two sets:
- **Delivers**: the spec ids this milestone builds for the first time. Each spec is delivered by exactly one milestone across the whole build.
- **Reuses**: spec ids an earlier milestone built that this one reads or extends (for example N5 claim reuses the [F8. Claim](../fhir/F8-claim.md) builder N3 wrote for the pre-authorisation and extends it for `use: claim`; N5 and N4 reuse the [S6. Claim Detail](../screens/S6-claim-detail.md) case shell and the [C1. Callback Door](../callbacks/C1-callback-door.md) dispatcher from N0). A milestone never rebuilds a reused spec; it records the extension it makes, if any.

## How a milestone is run

A one-time **global bootstrap** runs before N0: the knowledge source (L1.0), the NHCX scan (L1.1), the target's technology and component kit (L1.2) and the ABDM module (L1.3). These are properties of the target, not of a slice, so they are found once and read by every milestone.

Then, for each milestone in dependency order, the ordinary steps run **scoped to the specs that milestone delivers**, from discovery through dry-run only:

| Within a milestone | The step, scoped | Writes |
|---|---|---|
| discovery | [L1](../steps/L1-discovery.md) sub-steps L1.4 to L1.9, over the delivered ids only | `nhcx-plan/<Nx>/discovery.json` |
| mapping | [L2](../steps/L2-mapping.md), over the delivered ids only | `nhcx-plan/<Nx>/mapping.json` |
| plan | [L3](../steps/L3-integration-planning.md), this milestone's phase and its done-when | `nhcx-plan/<Nx>/plan.json` |
| code plan | [L4](../steps/L4-code-planning.md) | `nhcx-plan/<Nx>/code-plan.json` |
| code | [L5](../steps/L5-write-code.md) | source files, `nhcx-plan/<Nx>/code.json` |
| validation | [L6](../steps/L6-validate-code.md) | `nhcx-plan/<Nx>/validation.json` |
| dry-run | [L7](../steps/L7-dry-run-tests.md) | test files, `nhcx-plan/<Nx>/dry-run.json` |

[L8 end-to-end](../steps/L8-e2e-tests.md) does **not** run inside a milestone. It runs once, after the last milestone's dry-run is green, across the whole lifecycle (see "The final end-to-end step" below).

The global bootstrap writes `nhcx-plan/knowledge.json` and the technology part of `nhcx-plan/discovery.json` once, at the root, not per milestone.

## Done when

A milestone is **done** only when its done-when holds **in dry-run**: the slice's code is written, validated, and its dry-run tests pass with the gateway mocked and the payer callbacks stubbed, so the slice's behaviour (the phase `done_when` L3.4 defines) is proven without a live exchange. Until then it is `in progress`, whatever its code status. A milestone is never half-built into the next: N3 is not started until N2's dry-run done-when passes, because N3 quotes line items from the plan N2 fetched. The live sandbox proof is deferred to the final end-to-end step.

## The final end-to-end step

After the last milestone's dry-run is green, [L8](../steps/L8-e2e-tests.md) runs **once**, against the sandbox, across the whole lifecycle N1 to N6: a single exchange driven through the screens and from the command line, reusing each milestone's dry-run scenario but now with the real gateway and the hosted payer. It reads each `nhcx-plan/<Nx>/dry-run.json` and writes one `nhcx-plan/e2e.json` at the root (not per milestone). A milestone whose live leg fails here is reopened and its dry-run revisited; the final step is green only when the whole chain N1 to N6 completes against the sandbox.

## The report

`nhcx-plan/report.html` is organised by milestone: the header shows the milestones as a row with each one's state (done, in progress, blocked, not started) and its dry-run done-when; opening a milestone shows its own discovery, mapping, plan, code, validation and dry-run tabs, errors first. The global bootstrap (knowledge source and technology) is one shared tab, and the final end-to-end run (once the milestones are green) is one shared tab after the milestones, reading the root `nhcx-plan/e2e.json`. The builder and its wrappers are written in the bootstrap, as [LOG.md](../steps/LOG.md) describes, and rebuilt at the end of every prompt.

## Relation to the steps

The step files ([steps/INDEX.md](../steps/INDEX.md)) define what each step does and are read unchanged. The milestone is the outer loop: one milestone runs through every step over the ids it delivers, then the next milestone does the same. A step is never run across the whole integration at once.
