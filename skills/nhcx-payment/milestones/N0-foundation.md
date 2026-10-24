# N0. Foundation

#### GOAL
Build the shared base every later milestone stands on: the NHCX gateway embedded in the application, the callback dispatcher and the message ledger, the case shell and dashboard, the facility's NHCX settings and participant master, the bundle envelope, the party resources and the master data. Nothing in N0 is specific to one leg of the claim; everything after it reuses N0.

#### DEPENDS ON
Nothing. N0 runs first, after the global bootstrap (the knowledge source and the target's technology, component kit and ABDM module, found once).

#### DELIVERS
- Gateway: [G1. Embedding](../gateway/G1-embedding.md) to [G11. Startup Checks and Health](../gateway/G11-startup-checks.md) (JWE, `x-hcx` headers, ABDM session tokens, registry lookups, the inbound route, the ledger).
- Dispatch and polling: [C1. Callback Door](../callbacks/C1-callback-door.md) (the dispatcher, wired first to a stub that answers `unmatched` until later milestones add handlers), [A10. Transaction Related](../apis/A10-txn-related.md) to [A13. Transaction List](../apis/A13-txn-list.md) (ledger and status queries), [A17. Claim State](../apis/A17-claim-state.md).
- Shell and settings: [S5. Claim Master](../screens/S5-claim-master.md) (claim dashboard), [S6. Claim Detail](../screens/S6-claim-detail.md) (case detail shell with its tabs, each tab filled by a later milestone), [S19. NHCX Settings](../screens/S19-nhcx-settings.md) (NHCX settings: facility profile, participant registry record, key rotation, participant master), the "Claims" navigation entry.
- Envelope and parties: [F1. Bundle](../fhir/F1-bundle.md) (the bundle envelope every exchange wraps), [F15. Patient](../fhir/F15-patient.md) to [F18. Coverage](../fhir/F18-coverage.md) (Patient, Organization, Practitioner, Coverage), reused by every bundle after.
- Data and master: [D1. organization](../database/D1-organization.md) to [D3. patient](../database/D3-patient.md) (facility, practitioner, patient master, through the HMIS's own M1 when discovery found one), [D9. claim](../database/D9-claim.md) (the claim row every case hangs from), [D30. counter](../database/D30-counter.md) (numbering), [D32. participant](../database/D32-participant.md) (the participant master and its daily refresh).

#### REUSES
Nothing; N0 is the base.

#### STEPS
Run the ordinary steps scoped to the ids above, writing `nhcx-plan/N0/`: discovery ([L1](../steps/L1-discovery.md) L1.4 to L1.9), mapping ([L2](../steps/L2-mapping.md)), plan ([L3](../steps/L3-integration-planning.md), the Foundation, Data and Facility-settings phases), code plan ([L4](../steps/L4-code-planning.md)), code ([L5](../steps/L5-write-code.md)), validation ([L6](../steps/L6-validate-code.md)) and dry-run ([L7](../steps/L7-dry-run-tests.md)). A milestone stops at dry-run; the live sandbox exchange ([L8](../steps/L8-e2e-tests.md)) runs once at the end across the whole lifecycle, not per milestone. The gateway plumbing is where [L4](../steps/L4-code-planning.md) does list functions, since the specs do not fix its layout.

#### DONE WHEN
In dry-run (gateway mocked, callbacks stubbed): the embedded gateway builds and encrypts a probe and parses a stubbed 202, a registry lookup ([G4. Registry and Certificates](../gateway/G4-registry.md)) is wired, and an inbound message replayed into the route reaches [C1. Callback Door](../callbacks/C1-callback-door.md), which answers `unmatched` and writes a ledger row. The [S19. NHCX Settings](../screens/S19-nhcx-settings.md) settings page renders the participant record and key-rotation state, and the participant master ([D32. participant](../database/D32-participant.md)) is populated and refreshable. The live sandbox proof is deferred to the final end-to-end step.
