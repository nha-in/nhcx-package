# Read Sets

What to read before implementing one spec, so a task never needs the whole skill. Each row is one screen, API, callback or gateway part, and the FHIR, database and gateway specs it links to, followed through their own links (tables and hub specs such as the bundle envelope F1 and the claim table D9 are listed but not followed further). Only specs this skill holds are listed.

Always read, whatever the task: [CORE.md](CORE.md) (addresses and the exchange table), [F1. Bundle](../fhir/F1-bundle.md) (every bundle), [D9. claim](../database/D9-claim.md) (every case), [C1. Callback Door](../callbacks/C1-callback-door.md) (every reply), and the knowledge source ([KNOWLEDGE.md](KNOWLEDGE.md)).

## Screens

| To implement | What it is | Read with it |
|---|---|---|
| [S5](../screens/S5-claim-master.md) | Claim Master | nothing else |
| [S6](../screens/S6-claim-detail.md) | Claim Detail | nothing else |
| [S11](../screens/S11-claim-submission.md) | Claim Submission | [D9](../database/D9-claim.md), [D11](../database/D11-claim-plan-benefit.md), [D12](../database/D12-claim-plan-form.md), [D15](../database/D15-claim-auth-requirement.md), [D16](../database/D16-claim-line.md), [D17](../database/D17-claim-form-answer.md), [D20](../database/D20-claim-submission.md), [D21](../database/D21-claim-payment.md), [D23](../database/D23-claim-query.md), [D28](../database/D28-claim-document.md), [D29](../database/D29-claim-enquiry.md) |
| [S18](../screens/S18-beneficiary-verification.md) | Beneficiary Verification | [D3](../database/D3-patient.md), [D31](../database/D31-biometric-auth.md) |
| [S19](../screens/S19-nhcx-settings.md) | NHCX Settings | [D1](../database/D1-organization.md), [D13](../database/D13-claim-auth.md), [D32](../database/D32-participant.md), [G2](../gateway/G2-configuration.md), [G4](../gateway/G4-registry.md), [G6](../gateway/G6-encryption.md), [G8](../gateway/G8-receive.md), [G11](../gateway/G11-startup-checks.md) |

## APIs

| To implement | What it is | Read with it |
|---|---|---|
| [A5](../apis/A5-claim-submit.md) | Claim Submit | [F1](../fhir/F1-bundle.md), [F3](../fhir/F3-coverage-eligibility-response.md), [F7](../fhir/F7-questionnaireresponse.md), [F8](../fhir/F8-claim.md), [F15](../fhir/F15-patient.md), [F16](../fhir/F16-practitioner.md), [F17](../fhir/F17-organization.md), [F18](../fhir/F18-coverage.md), [F19](../fhir/F19-other-resources.md), [D8](../database/D8-terminology.md), [D12](../database/D12-claim-plan-form.md), [D20](../database/D20-claim-submission.md), [D32](../database/D32-participant.md), [G2](../gateway/G2-configuration.md), [G4](../gateway/G4-registry.md), [G5](../gateway/G5-protocol-headers.md), [G6](../gateway/G6-encryption.md), [G7](../gateway/G7-send.md), [G8](../gateway/G8-receive.md), [G9](../gateway/G9-ledger.md), [G11](../gateway/G11-startup-checks.md) |
| [A6](../apis/A6-task-submit.md) | Task Submit (cancel, status, reprocess, release) | [F1](../fhir/F1-bundle.md), [F10](../fhir/F10-task-claim-actions.md), [F17](../fhir/F17-organization.md), [D18](../database/D18-claim-preauth.md), [D29](../database/D29-claim-enquiry.md), [D32](../database/D32-participant.md), [G2](../gateway/G2-configuration.md), [G4](../gateway/G4-registry.md), [G5](../gateway/G5-protocol-headers.md), [G6](../gateway/G6-encryption.md), [G7](../gateway/G7-send.md), [G8](../gateway/G8-receive.md), [G9](../gateway/G9-ledger.md), [G11](../gateway/G11-startup-checks.md) |
| [A10](../apis/A10-txn-related.md) | Transaction Related | nothing else |
| [A11](../apis/A11-txn-dispatch.md) | Transaction Dispatch | nothing else |
| [A12](../apis/A12-txn-fhir.md) | Transaction FHIR | nothing else |
| [A13](../apis/A13-txn-list.md) | Transaction List | nothing else |
| [A14](../apis/A14-adjudicator-user-role.md) | Adjudicator User Role | [D1](../database/D1-organization.md), [D9](../database/D9-claim.md), [D18](../database/D18-claim-preauth.md), [D20](../database/D20-claim-submission.md), [G3](../gateway/G3-session-token.md) |
| [A15](../apis/A15-adjudicator-process-case.md) | Adjudicator Process Case | [D1](../database/D1-organization.md), [D9](../database/D9-claim.md), [D18](../database/D18-claim-preauth.md), [D20](../database/D20-claim-submission.md), [D24](../database/D24-claim-adjudication.md), [G3](../gateway/G3-session-token.md) |
| [A16](../apis/A16-gateway-token.md) | Gateway Token | [D1](../database/D1-organization.md), [D32](../database/D32-participant.md), [G2](../gateway/G2-configuration.md), [G3](../gateway/G3-session-token.md), [G4](../gateway/G4-registry.md), [G6](../gateway/G6-encryption.md), [G8](../gateway/G8-receive.md), [G11](../gateway/G11-startup-checks.md) |
| [A17](../apis/A17-claim-state.md) | Claim State | nothing else |
| [A18](../apis/A18-biometric-authentication.md) | Biometric Authentication | [F7](../fhir/F7-questionnaireresponse.md), [D3](../database/D3-patient.md), [D9](../database/D9-claim.md), [D12](../database/D12-claim-plan-form.md), [D28](../database/D28-claim-document.md), [D31](../database/D31-biometric-auth.md), [G3](../gateway/G3-session-token.md) |

## Callbacks

| To implement | What it is | Read with it |
|---|---|---|
| [C1](../callbacks/C1-callback-door.md) | Callback Door | nothing else |
| [C6](../callbacks/C6-claim-on-submit.md) | Claim Reply | [F9](../fhir/F9-claimresponse.md), [D32](../database/D32-participant.md), [G2](../gateway/G2-configuration.md), [G4](../gateway/G4-registry.md), [G6](../gateway/G6-encryption.md), [G8](../gateway/G8-receive.md), [G9](../gateway/G9-ledger.md), [G11](../gateway/G11-startup-checks.md) |
| [C8](../callbacks/C8-enquiry-on-submit.md) | Enquiry Reply | [D32](../database/D32-participant.md), [G2](../gateway/G2-configuration.md), [G4](../gateway/G4-registry.md), [G6](../gateway/G6-encryption.md), [G8](../gateway/G8-receive.md), [G11](../gateway/G11-startup-checks.md) |

## Gateway

| To implement | What it is | Read with it |
|---|---|---|
| [G1](../gateway/G1-embedding.md) | Embedding | nothing else |
| [G2](../gateway/G2-configuration.md) | Configuration and Participants | [D32](../database/D32-participant.md), [G4](../gateway/G4-registry.md), [G6](../gateway/G6-encryption.md), [G8](../gateway/G8-receive.md), [G11](../gateway/G11-startup-checks.md) |
| [G3](../gateway/G3-session-token.md) | Session Token | nothing else |
| [G4](../gateway/G4-registry.md) | Registry and Certificates | [D32](../database/D32-participant.md), [G2](../gateway/G2-configuration.md), [G6](../gateway/G6-encryption.md), [G8](../gateway/G8-receive.md), [G11](../gateway/G11-startup-checks.md) |
| [G5](../gateway/G5-protocol-headers.md) | Protocol Headers | nothing else |
| [G6](../gateway/G6-encryption.md) | Encryption | nothing else |
| [G7](../gateway/G7-send.md) | Send | nothing else |
| [G8](../gateway/G8-receive.md) | Receive | [D32](../database/D32-participant.md), [G2](../gateway/G2-configuration.md), [G4](../gateway/G4-registry.md), [G6](../gateway/G6-encryption.md), [G11](../gateway/G11-startup-checks.md) |
| [G9](../gateway/G9-ledger.md) | Ledger | nothing else |
| [G10](../gateway/G10-beneficiary-registry.md) | Beneficiary Registry | nothing else |
| [G11](../gateway/G11-startup-checks.md) | Startup Checks and Health | nothing else |
