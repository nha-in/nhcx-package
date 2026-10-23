# N1. Search Policy

#### GOAL
Find a beneficiary's insurance policy on NHCX and let the desk pick it: the patient and policy search that opens a case, the select screen, and the discovery path when none of the offered policies is the patient's. ABHA is captured here as the patient key the whole exchange uses.

#### DEPENDS ON
N0 (the gateway, the case shell, the party resources, the patient master).

#### DELIVERS
- S1. Search Policy (in nhcx-coverage) (search policy: patient and the search inputs shaped by the two [S19. NHCX Settings](../screens/S19-nhcx-settings.md) settings), S2. Select Policy (in nhcx-coverage) (select policy, with "None of these" to S17. Beneficiary Discovery (in nhcx-coverage)), S17. Beneficiary Discovery (in nhcx-coverage) (beneficiary discovery).
- A1. Policy Search (in nhcx-coverage) (policy search over the gateway).
- [A19. ABHA Create and Verify (ABDM M1)](../apis/A19-abha-m1.md) (ABHA create, link and verify), built only when the global bootstrap found the HMIS has no M1 of its own; when it has one, [A19. ABHA Create and Verify (ABDM M1)](../apis/A19-abha-m1.md) and the ABHA parts of the patient screens are dropped and the module is reused.
- [S13. Patient List](../screens/S13-patient-list.md) to [S15. Patient Detail](../screens/S15-patient-detail.md) (patient list, registration and detail), their NHCX additions only; a screen the HMIS already has gains the ABHA and member-id fields, it is not rebuilt.

#### REUSES
From N0: [S6. Claim Detail](../screens/S6-claim-detail.md) (the case this search opens), [F15. Patient](../fhir/F15-patient.md) to [F18. Coverage](../fhir/F18-coverage.md) (the party resources a policy result and a created ABHA fill), [D1. organization](../database/D1-organization.md) to [D3. patient](../database/D3-patient.md) (the patient master the case links to), the gateway and [C1. Callback Door](../callbacks/C1-callback-door.md).

#### STEPS
Run the ordinary steps scoped to the ids above, writing `nhcx-plan/N1/`: discovery, mapping, plan (the Policy phase, policy-search part), code plan, code, validation, dry-run, end-to-end.

#### DONE WHEN
On the sandbox: a policy search from S1. Search Policy (in nhcx-coverage) returns the beneficiary's policies on S2. Select Policy (in nhcx-coverage), selecting one opens a case on [S6. Claim Detail](../screens/S6-claim-detail.md), and "None of these" reaches S17. Beneficiary Discovery (in nhcx-coverage). Where the HMIS has no M1, an ABHA is verified or created through [A19. ABHA Create and Verify (ABDM M1)](../apis/A19-abha-m1.md) and carried on the case. Proven through the screens and from the command line.
