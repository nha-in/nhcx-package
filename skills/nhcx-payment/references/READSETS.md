# Read Sets

What to read before implementing one spec, so a task never needs the whole skill. Each row is one screen, API, callback or gateway part, and the FHIR, database and gateway specs it links to, followed through their own links (tables and hub specs such as the bundle envelope F1 and the claim table D9 are listed but not followed further). Only specs this skill holds are listed.

Always read, whatever the task: [CORE.md](CORE.md) (addresses and the exchange table), [F1. Bundle](../fhir/F1-bundle.md) (every bundle), [D9. claim](../database/D9-claim.md) (every case), [C1. Callback Door](../callbacks/C1-callback-door.md) (every reply), and the knowledge source ([KNOWLEDGE.md](KNOWLEDGE.md)).

## Screens

| To implement | What it is | Read with it |
|---|---|---|
| [S5](../screens/S5-claim-master.md) | Claim Master | nothing else |
| [S6](../screens/S6-claim-detail.md) | Claim Detail | nothing else |
| [S12](../screens/S12-payments.md) | Payments | [D9](../database/D9-claim.md), [D20](../database/D20-claim-submission.md), [D21](../database/D21-claim-payment.md), [D22](../database/D22-claim-payment-detail.md), [G7](../gateway/G7-send.md) |
| [S19](../screens/S19-nhcx-settings.md) | NHCX Settings | [D1](../database/D1-organization.md), [D32](../database/D32-participant.md), [G2](../gateway/G2-configuration.md), [G4](../gateway/G4-registry.md), [G6](../gateway/G6-encryption.md), [G8](../gateway/G8-receive.md), [G11](../gateway/G11-startup-checks.md) |

## APIs

| To implement | What it is | Read with it |
|---|---|---|
| [A8](../apis/A8-paymentnotice-on-request.md) | Payment Notice Acknowledgement | [F1](../fhir/F1-bundle.md), [F14](../fhir/F14-payment-acknowledgement.md), [F17](../fhir/F17-organization.md), [D21](../database/D21-claim-payment.md), [G5](../gateway/G5-protocol-headers.md), [G7](../gateway/G7-send.md), [G9](../gateway/G9-ledger.md) |
| [A10](../apis/A10-txn-related.md) | Transaction Related | nothing else |
| [A11](../apis/A11-txn-dispatch.md) | Transaction Dispatch | nothing else |
| [A12](../apis/A12-txn-fhir.md) | Transaction FHIR | nothing else |
| [A13](../apis/A13-txn-list.md) | Transaction List | nothing else |
| [A17](../apis/A17-claim-state.md) | Claim State | nothing else |

## Callbacks

| To implement | What it is | Read with it |
|---|---|---|
| [C1](../callbacks/C1-callback-door.md) | Callback Door | nothing else |
| [C10](../callbacks/C10-paymentnotice-request.md) | Payment Notice | [D21](../database/D21-claim-payment.md), [D32](../database/D32-participant.md), [G2](../gateway/G2-configuration.md), [G4](../gateway/G4-registry.md), [G6](../gateway/G6-encryption.md), [G8](../gateway/G8-receive.md), [G11](../gateway/G11-startup-checks.md) |

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
