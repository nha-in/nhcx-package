# Read Sets

What to read before implementing one spec, so a task never needs the whole skill. Each row is one screen, API, callback or gateway part, and the FHIR, database and gateway specs it links to, followed through their own links (tables and hub specs such as the bundle envelope F1 and the claim table D9 are listed but not followed further). Only specs this skill holds are listed.

Always read, whatever the task: [CORE.md](CORE.md) (addresses and the exchange table), [F1. Bundle](../fhir/F1-bundle.md) (every bundle), [D9. claim](../database/D9-claim.md) (every case), [C1. Callback Door](../callbacks/C1-callback-door.md) (every reply), and the knowledge source ([KNOWLEDGE.md](KNOWLEDGE.md)).

## Screens

| To implement | What it is | Read with it |
|---|---|---|
| [S5](../screens/S5-claim-master.md) | Claim Master | nothing else |
| [S6](../screens/S6-claim-detail.md) | Claim Detail | nothing else |
| [S10](../screens/S10-communication.md) | Communication | [D9](../database/D9-claim.md), [D15](../database/D15-claim-auth-requirement.md), [D23](../database/D23-claim-query.md), [D28](../database/D28-claim-document.md) |
| [S19](../screens/S19-nhcx-settings.md) | NHCX Settings | [D1](../database/D1-organization.md), [D32](../database/D32-participant.md), [G2](../gateway/G2-configuration.md), [G4](../gateway/G4-registry.md), [G6](../gateway/G6-encryption.md), [G8](../gateway/G8-receive.md), [G11](../gateway/G11-startup-checks.md) |

## APIs

| To implement | What it is | Read with it |
|---|---|---|
| [A7](../apis/A7-communication-on-request.md) | Communication Reply | [F1](../fhir/F1-bundle.md), [F3](../fhir/F3-coverage-eligibility-response.md), [F8](../fhir/F8-claim.md), [F10](../fhir/F10-task-claim-actions.md), [F11](../fhir/F11-communicationrequest.md), [F12](../fhir/F12-communication.md), [F15](../fhir/F15-patient.md), [F16](../fhir/F16-practitioner.md), [F17](../fhir/F17-organization.md), [F18](../fhir/F18-coverage.md), [D8](../database/D8-terminology.md), [D23](../database/D23-claim-query.md), [D28](../database/D28-claim-document.md), [D32](../database/D32-participant.md), [G2](../gateway/G2-configuration.md), [G4](../gateway/G4-registry.md), [G5](../gateway/G5-protocol-headers.md), [G6](../gateway/G6-encryption.md), [G7](../gateway/G7-send.md), [G8](../gateway/G8-receive.md), [G9](../gateway/G9-ledger.md), [G11](../gateway/G11-startup-checks.md) |
| [A10](../apis/A10-txn-related.md) | Transaction Related | nothing else |
| [A11](../apis/A11-txn-dispatch.md) | Transaction Dispatch | nothing else |
| [A12](../apis/A12-txn-fhir.md) | Transaction FHIR | nothing else |
| [A13](../apis/A13-txn-list.md) | Transaction List | nothing else |
| [A17](../apis/A17-claim-state.md) | Claim State | nothing else |

## Callbacks

| To implement | What it is | Read with it |
|---|---|---|
| [C1](../callbacks/C1-callback-door.md) | Callback Door | nothing else |
| [C9](../callbacks/C9-communication-request.md) | Payer Communication | [D32](../database/D32-participant.md), [G2](../gateway/G2-configuration.md), [G4](../gateway/G4-registry.md), [G6](../gateway/G6-encryption.md), [G8](../gateway/G8-receive.md), [G11](../gateway/G11-startup-checks.md) |

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
