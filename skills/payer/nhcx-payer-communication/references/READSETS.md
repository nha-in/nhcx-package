# Read Sets

What to read before implementing one spec, so a task never needs the whole skill. Each row is one screen, API, callback or gateway part, and the FHIR, database and gateway specs it links to, followed through their own links (tables and hub specs such as the bundle envelope F1 and the case table D19 are listed but not followed further). Only specs this skill holds are listed.

Always read, whatever the task: [CORE.md](CORE.md) (addresses and the exchange table), [F1. Bundle](../fhir/F1-bundle.md) (every bundle), [D19. case](../database/D19-case.md) (every case), [C1. Callback Door](../callbacks/C1-callback-door.md) (every inbound message), and the knowledge source ([KNOWLEDGE.md](KNOWLEDGE.md)).

## Screens

| To implement | What it is | Read with it |
|---|---|---|
| [S1](../screens/S1-overview.md) | Overview | nothing else |
| [S2](../screens/S2-cases.md) | Cases | nothing else |
| [S3](../screens/S3-case-desk.md) | Case Desk | nothing else |

## APIs

| To implement | What it is | Read with it |
|---|---|---|
| [A5](../apis/A5-query-request.md) | Query Request | [F1](../fhir/F1-bundle.md), [F9](../fhir/F9-claimresponse.md), [F11](../fhir/F11-communicationrequest.md), [F15](../fhir/F15-patient.md), [F17](../fhir/F17-organization.md), [F18](../fhir/F18-coverage.md), [D1](../database/D1-payer.md), [D19](../database/D19-case.md), [D25](../database/D25-case-line-item.md), [D26](../database/D26-case-timeline.md), [D27](../database/D27-case-exchange-message.md), [D31](../database/D31-audit-log.md), [G5](../gateway/G5-protocol-headers.md), [G7](../gateway/G7-send.md) |
| [A11](../apis/A11-txn-related.md) | Transaction Related | nothing else |
| [A12](../apis/A12-txn-fhir.md) | Transaction FHIR | nothing else |
| [A13](../apis/A13-adjudicate.md) | Adjudicate | nothing else |
| [A15](../apis/A15-case-exchange.md) | Case Exchange Log | nothing else |

## Callbacks

| To implement | What it is | Read with it |
|---|---|---|
| [C1](../callbacks/C1-callback-door.md) | Callback Door | nothing else |
| [C9](../callbacks/C9-communication.md) | Communication | [F1](../fhir/F1-bundle.md), [F9](../fhir/F9-claimresponse.md), [F11](../fhir/F11-communicationrequest.md), [F12](../fhir/F12-communication.md), [D3](../database/D3-document-type.md), [D19](../database/D19-case.md), [D23](../database/D23-case-document.md), [D24](../database/D24-case-document-file.md), [D25](../database/D25-case-line-item.md), [D26](../database/D26-case-timeline.md), [D27](../database/D27-case-exchange-message.md), [D31](../database/D31-audit-log.md), [G7](../gateway/G7-send.md), [G8](../gateway/G8-receive.md) |

## Gateway

| To implement | What it is | Read with it |
|---|---|---|
| [G1](../gateway/G1-embedding.md) | Embedding | nothing else |
| [G2](../gateway/G2-configuration.md) | Configuration and Participants | nothing else |
| [G3](../gateway/G3-session-token.md) | Session Token | nothing else |
| [G4](../gateway/G4-registry.md) | Registry and Certificates | [D33](../database/D33-participant.md) |
| [G5](../gateway/G5-protocol-headers.md) | Protocol Headers | nothing else |
| [G6](../gateway/G6-encryption.md) | Encryption | nothing else |
| [G7](../gateway/G7-send.md) | Send | nothing else |
| [G8](../gateway/G8-receive.md) | Receive | nothing else |
| [G9](../gateway/G9-ledger.md) | Ledger | nothing else |
| [G10](../gateway/G10-beneficiary-registry.md) | Beneficiary Registry | nothing else |
| [G11](../gateway/G11-startup-checks.md) | Startup Checks and Health | nothing else |
