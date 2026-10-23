# Milestones

An alternative way to run the build (an experiment). Instead of taking every spec through discovery, then every spec through mapping, then planning the whole integration at once, the work is cut into **milestones**: one vertical slice of the claim lifecycle at a time, each carried end to end (discovery, mapping, plan, code, validation, dry-run and its own sandbox proof) before the next begins.

The milestones are the phases of [references/SCAFFOLDING.md](../references/SCAFFOLDING.md) section 12 and the phases L3 already names, promoted to be the outer loop of the build. A milestone owns a set of spec ids, declares the milestones it depends on, and reuses what they built rather than rebuilding it.

## Why

- A working slice sooner: N1 policy search is discovered, planned, written and proven on the sandbox before N5 claim is looked at, so the integration is demonstrable from early on and resumable between prompts at a feature boundary, not mid-mapping.
- Less speculative work: a milestone's mapping and code plan cover only the specs it delivers, so nothing is enumerated that no code of that milestone consumes. This is the same saving as the L2 and L4 trims, taken to the whole build.
- A report a person reads by feature: each milestone shows its own step status and its own done-when, so progress reads as "N1 done, N2 done, N3 in progress", not eight flat layers at once.

## The milestones

| # | Milestone | Delivers (spec ids it builds) | Depends on |
|---|---|---|---|
| **N0** | [Foundation](N0-foundation.md) | the shared base every slice needs: [G1. Embedding](../gateway/G1-embedding.md) to [G11. Startup Checks and Health](../gateway/G11-startup-checks.md), [C1. Callback Door](../callbacks/C1-callback-door.md), [A10. Transaction Related](../apis/A10-txn-related.md) to [A13. Transaction List](../apis/A13-txn-list.md), [A17. Claim State](../apis/A17-claim-state.md), [S5. Claim Master](../screens/S5-claim-master.md), [S6. Claim Detail](../screens/S6-claim-detail.md), [S19. NHCX Settings](../screens/S19-nhcx-settings.md), [F1. Bundle](../fhir/F1-bundle.md), [F15. Patient](../fhir/F15-patient.md) to [F18. Coverage](../fhir/F18-coverage.md), [D1. organization](../database/D1-organization.md) to [D3. patient](../database/D3-patient.md), [D9. claim](../database/D9-claim.md), [D30. counter](../database/D30-counter.md), [D32. participant](../database/D32-participant.md) | none |
| **N1** | [Search Policy](N1-search-policy.md) | S1. Search Policy (in nhcx-coverage), S2. Select Policy (in nhcx-coverage), S17. Beneficiary Discovery (in nhcx-coverage), A1. Policy Search (in nhcx-coverage), A19. ABHA Create and Verify (ABDM M1) (in nhcx-coverage), S13. Patient List (in nhcx-coverage) to S15. Patient Detail (in nhcx-coverage) | N0 |
| **N2** | [Coverage and Insurance](N2-coverage-insurance.md) | S3. Policy Discovery (in nhcx-coverage), A2. Coverage Eligibility Check (in nhcx-coverage), C2. Coverage Eligibility Verdict (in nhcx-coverage), F2. CoverageEligibilityRequest (in nhcx-coverage), [F3. CoverageEligibilityResponse](../fhir/F3-coverage-eligibility-response.md), D31. biometric_auth (in nhcx-coverage); S7. Insurance Plan (in nhcx-preauth), S8. Line Items (in nhcx-preauth), A3. Insurance Plan Request (in nhcx-preauth), C3. Authorisation Requirements Ruling (in nhcx-preauth), C4. Insurance Plan Reply (in nhcx-preauth), F4. Task (InsurancePlan discovery) (in nhcx-preauth) to F6. Questionnaire (in nhcx-preauth) | N0, N1 |
| **N3** | [Pre-authorisation and Biometric](N3-preauth-biometric.md) | S4. Pre-authorisation Details and Admission Link (in nhcx-preauth), S9. Pre-authorisation (in nhcx-preauth), S18. Beneficiary Verification (in nhcx-coverage), S16. Practitioner Master (in nhcx-preauth), A4. Pre-auth Submit (in nhcx-preauth), A6. Task Submit (cancel, status, reprocess, release) (in nhcx-preauth), A14. Adjudicator User Role (in nhcx-preauth) to A16. Gateway Token (in nhcx-preauth), A18. Biometric Authentication (in nhcx-coverage), C5. Pre-auth Reply (in nhcx-preauth), C7. Cancel Reply (in nhcx-preauth), C8. Enquiry Reply (in nhcx-preauth), F7. QuestionnaireResponse (in nhcx-coverage) to [F10. Task (claim actions)](../fhir/F10-task-claim-actions.md), F19. Other bundle resources (in nhcx-coverage) | N0, N2 |
| **N4** | [Communication](N4-communication.md) | [S10. Communication](../screens/S10-communication.md), [A7. Communication Reply](../apis/A7-communication-on-request.md), [C9. Payer Communication](../callbacks/C9-communication-request.md), [F11. CommunicationRequest](../fhir/F11-communicationrequest.md), [F12. Communication](../fhir/F12-communication.md) | N0, N3 |
| **N5** | [Claim](N5-claim.md) | S11. Claim Submission (in nhcx-claim), A5. Claim Submit (in nhcx-claim), C6. Claim Reply (in nhcx-claim) (and the reprocess and release part of A6. Task Submit (cancel, status, reprocess, release) (in nhcx-preauth)) | N0, N3 |
| **N6** | [Payment](N6-payment.md) | S12. Payments (in nhcx-payment), A8. Payment Notice Acknowledgement (in nhcx-payment), C10. Payment Notice (in nhcx-payment), F13. PaymentNotice (in nhcx-payment), F14. Payment acknowledgement (in nhcx-payment) | N0, N5 |

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

Then, for each milestone in dependency order, the ordinary steps run **scoped to the specs that milestone delivers**:

| Within a milestone | The step, scoped | Writes |
|---|---|---|
| discovery | [L1](../steps/L1-discovery.md) sub-steps L1.4 to L1.9, over the delivered ids only | `nhcx-plan/<Nx>/discovery.json` |
| mapping | [L2](../steps/L2-mapping.md), over the delivered ids only | `nhcx-plan/<Nx>/mapping.json` |
| plan | [L3](../steps/L3-integration-planning.md), this milestone's phase and its done-when | `nhcx-plan/<Nx>/plan.json` |
| code plan | [L4](../steps/L4-code-planning.md) | `nhcx-plan/<Nx>/code-plan.json` |
| code | [L5](../steps/L5-write-code.md) | source files, `nhcx-plan/<Nx>/code.json` |
| validation | [L6](../steps/L6-validate-code.md) | `nhcx-plan/<Nx>/validation.json` |
| dry-run | [L7](../steps/L7-dry-run-tests.md) | test files, `nhcx-plan/<Nx>/dry-run.json` |
| end-to-end | [L8](../steps/L8-e2e-tests.md), the milestone's done-when against the sandbox | test files, `nhcx-plan/<Nx>/e2e.json` |

The global bootstrap writes `nhcx-plan/knowledge.json` and the technology part of `nhcx-plan/discovery.json` once, at the root, not per milestone.

## Done when

A milestone is **done** only when its done-when holds: a sandbox exchange, run through the screens and from the command line, that proves the slice works end to end (the phase `done_when` L3.4 already defines). Until then it is `in progress`, whatever its code status. A milestone is never half-built into the next: N3 is not started until N2's done-when passes, because N3 quotes line items from the plan N2 fetched.

## The report

`nhcx-plan/report.html` is organised by milestone: the header shows the milestones as a row with each one's state (done, in progress, blocked, not started) and its done-when; opening a milestone shows its own discovery, mapping, plan, code, validation, dry-run and end-to-end tabs, errors first. The global bootstrap (knowledge source and technology) is one shared tab. The builder and its wrappers are written in the bootstrap, as [LOG.md](../steps/LOG.md) describes, and rebuilt at the end of every prompt.

## Relation to the layered steps

The step files ([steps/INDEX.md](../steps/INDEX.md)) are unchanged: they define what each step does. Milestones change only the **order** they run in, from "every spec through one step, then the next step" to "one milestone through every step, then the next milestone", and the **scope** each run covers. A build may use either mode; this folder is the milestone mode.
