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
| [A4](../apis/A4-claim-answer.md) | Claim Answer | [F1](../fhir/F1-bundle.md), [F9](../fhir/F9-claimresponse.md), [F15](../fhir/F15-patient.md), [F17](../fhir/F17-organization.md), [F18](../fhir/F18-coverage.md), [D1](../database/D1-payer.md), [D5](../database/D5-member.md), [D6](../database/D6-subscription.md), [D8](../database/D8-wallet-entry.md), [D12](../database/D12-policy.md), [D19](../database/D19-case.md), [D25](../database/D25-case-line-item.md), [D27](../database/D27-case-exchange-message.md), [D31](../database/D31-audit-log.md), [G7](../gateway/G7-send.md) |
| [A9](../apis/A9-task-answer.md) | Task Answer | [F1](../fhir/F1-bundle.md), [F4](../fhir/F4-task-insuranceplan.md), [F5](../fhir/F5-insuranceplan.md), [F6](../fhir/F6-questionnaire.md), [F9](../fhir/F9-claimresponse.md), [F10](../fhir/F10-task-claim-actions.md), [F15](../fhir/F15-patient.md), [F17](../fhir/F17-organization.md), [F18](../fhir/F18-coverage.md), [D1](../database/D1-payer.md), [D3](../database/D3-document-type.md), [D4](../database/D4-terminology-code.md), [D6](../database/D6-subscription.md), [D10](../database/D10-procedure-rule.md), [D11](../database/D11-procedure-rule-doc.md), [D12](../database/D12-policy.md), [D13](../database/D13-policy-procedure.md), [D14](../database/D14-policy-coverage-clause.md), [D15](../database/D15-policy-clause-benefit.md), [D16](../database/D16-policy-alias.md), [D17](../database/D17-policy-exclusion.md), [D18](../database/D18-policy-sub-limit.md), [D19](../database/D19-case.md), [D25](../database/D25-case-line-item.md), [D26](../database/D26-case-timeline.md), [D27](../database/D27-case-exchange-message.md), [D30](../database/D30-payment.md), [D31](../database/D31-audit-log.md), [G7](../gateway/G7-send.md) |
| [A11](../apis/A11-txn-related.md) | Transaction Related | nothing else |
| [A12](../apis/A12-txn-fhir.md) | Transaction FHIR | nothing else |
| [A13](../apis/A13-adjudicate.md) | Adjudicate | nothing else |
| [A15](../apis/A15-case-exchange.md) | Case Exchange Log | nothing else |

## Callbacks

| To implement | What it is | Read with it |
|---|---|---|
| [C1](../callbacks/C1-callback-door.md) | Callback Door | nothing else |
| [C5](../callbacks/C5-claim-submit.md) | Claim Submit | [F1](../fhir/F1-bundle.md), [F2](../fhir/F2-coverage-eligibility-request.md), [F3](../fhir/F3-coverage-eligibility-response.md), [F6](../fhir/F6-questionnaire.md), [F7](../fhir/F7-questionnaireresponse.md), [F8](../fhir/F8-claim.md), [F9](../fhir/F9-claimresponse.md), [F11](../fhir/F11-communicationrequest.md), [F12](../fhir/F12-communication.md), [F15](../fhir/F15-patient.md), [F16](../fhir/F16-practitioner.md), [F17](../fhir/F17-organization.md), [F18](../fhir/F18-coverage.md), [F19](../fhir/F19-other-resources.md), [D3](../database/D3-document-type.md), [D5](../database/D5-member.md), [D6](../database/D6-subscription.md), [D10](../database/D10-procedure-rule.md), [D11](../database/D11-procedure-rule-doc.md), [D12](../database/D12-policy.md), [D13](../database/D13-policy-procedure.md), [D19](../database/D19-case.md), [D20](../database/D20-case-diagnosis.md), [D21](../database/D21-case-procedure.md), [D22](../database/D22-case-doctor.md), [D23](../database/D23-case-document.md), [D24](../database/D24-case-document-file.md), [D25](../database/D25-case-line-item.md), [D26](../database/D26-case-timeline.md), [D27](../database/D27-case-exchange-message.md), [D29](../database/D29-predetermination-quote.md), [D31](../database/D31-audit-log.md), [G7](../gateway/G7-send.md), [G8](../gateway/G8-receive.md) |
| [C7](../callbacks/C7-task-submit.md) | Task Submit | [F1](../fhir/F1-bundle.md), [F4](../fhir/F4-task-insuranceplan.md), [F5](../fhir/F5-insuranceplan.md), [F6](../fhir/F6-questionnaire.md), [F9](../fhir/F9-claimresponse.md), [F10](../fhir/F10-task-claim-actions.md), [F15](../fhir/F15-patient.md), [F17](../fhir/F17-organization.md), [F18](../fhir/F18-coverage.md), [D1](../database/D1-payer.md), [D3](../database/D3-document-type.md), [D4](../database/D4-terminology-code.md), [D6](../database/D6-subscription.md), [D8](../database/D8-wallet-entry.md), [D10](../database/D10-procedure-rule.md), [D11](../database/D11-procedure-rule-doc.md), [D12](../database/D12-policy.md), [D13](../database/D13-policy-procedure.md), [D14](../database/D14-policy-coverage-clause.md), [D15](../database/D15-policy-clause-benefit.md), [D16](../database/D16-policy-alias.md), [D17](../database/D17-policy-exclusion.md), [D18](../database/D18-policy-sub-limit.md), [D19](../database/D19-case.md), [D25](../database/D25-case-line-item.md), [D26](../database/D26-case-timeline.md), [D27](../database/D27-case-exchange-message.md), [D30](../database/D30-payment.md), [D31](../database/D31-audit-log.md), [G8](../gateway/G8-receive.md) |

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
