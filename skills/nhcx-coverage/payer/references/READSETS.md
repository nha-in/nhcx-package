# Read Sets

What to read before implementing one spec, so a task never needs the whole skill. Each row is one screen, API, callback or gateway part, and the FHIR, database and gateway specs it links to, followed through their own links (tables and hub specs such as the bundle envelope F1 and the case table D19 are listed but not followed further). Only specs this skill holds are listed.

Always read, whatever the task: [CORE.md](CORE.md) (addresses and the exchange table), [F1. Bundle](../fhir/F1-bundle.md) (every bundle), [D19. case](../database/D19-case.md) (every case), [C1. Callback Door](../callbacks/C1-callback-door.md) (every inbound message), and the knowledge source ([KNOWLEDGE.md](KNOWLEDGE.md)).

## Screens

| To implement | What it is | Read with it |
|---|---|---|
| [S1](../screens/S1-overview.md) | Overview | nothing else |
| [S2](../screens/S2-cases.md) | Cases | nothing else |
| [S3](../screens/S3-case-desk.md) | Case Desk | nothing else |
| [S4](../screens/S4-members.md) | Members | [F1](../fhir/F1-bundle.md), [F2](../fhir/F2-coverage-eligibility-request.md), [F3](../fhir/F3-coverage-eligibility-response.md), [F17](../fhir/F17-organization.md), [D3](../database/D3-document-type.md), [D5](../database/D5-member.md), [D6](../database/D6-subscription.md), [D10](../database/D10-procedure-rule.md), [D11](../database/D11-procedure-rule-doc.md), [D12](../database/D12-policy.md), [D13](../database/D13-policy-procedure.md), [D19](../database/D19-case.md), [D31](../database/D31-audit-log.md), [D32](../database/D32-id-sequence.md) |
| [S5](../screens/S5-subscriptions.md) | Subscriptions | [D4](../database/D4-terminology-code.md), [D6](../database/D6-subscription.md), [D7](../database/D7-subscription-family-member.md), [D8](../database/D8-wallet-entry.md), [D9](../database/D9-abha-link-event.md), [G10](../gateway/G10-beneficiary-registry.md) |
| [S6](../screens/S6-policies.md) | Policies | [D4](../database/D4-terminology-code.md), [D12](../database/D12-policy.md), [D13](../database/D13-policy-procedure.md), [D16](../database/D16-policy-alias.md) |
| [S7](../screens/S7-policy-configurator.md) | Policy Configurator | [F3](../fhir/F3-coverage-eligibility-response.md), [F5](../fhir/F5-insuranceplan.md), [F6](../fhir/F6-questionnaire.md), [D3](../database/D3-document-type.md), [D4](../database/D4-terminology-code.md), [D5](../database/D5-member.md), [D6](../database/D6-subscription.md), [D10](../database/D10-procedure-rule.md), [D11](../database/D11-procedure-rule-doc.md), [D12](../database/D12-policy.md), [D13](../database/D13-policy-procedure.md), [D14](../database/D14-policy-coverage-clause.md), [D15](../database/D15-policy-clause-benefit.md), [D16](../database/D16-policy-alias.md), [D17](../database/D17-policy-exclusion.md), [D18](../database/D18-policy-sub-limit.md), [D31](../database/D31-audit-log.md) |
| [S8](../screens/S8-procedures.md) | Procedures | [F5](../fhir/F5-insuranceplan.md), [F6](../fhir/F6-questionnaire.md), [D3](../database/D3-document-type.md), [D4](../database/D4-terminology-code.md), [D6](../database/D6-subscription.md), [D10](../database/D10-procedure-rule.md), [D11](../database/D11-procedure-rule-doc.md), [D12](../database/D12-policy.md), [D13](../database/D13-policy-procedure.md), [D14](../database/D14-policy-coverage-clause.md), [D15](../database/D15-policy-clause-benefit.md), [D17](../database/D17-policy-exclusion.md), [D18](../database/D18-policy-sub-limit.md) |
| [S9](../screens/S9-procedure-configurator.md) | Procedure Configurator | [F3](../fhir/F3-coverage-eligibility-response.md), [F5](../fhir/F5-insuranceplan.md), [F6](../fhir/F6-questionnaire.md), [D3](../database/D3-document-type.md), [D4](../database/D4-terminology-code.md), [D5](../database/D5-member.md), [D6](../database/D6-subscription.md), [D10](../database/D10-procedure-rule.md), [D11](../database/D11-procedure-rule-doc.md), [D12](../database/D12-policy.md), [D13](../database/D13-policy-procedure.md), [D14](../database/D14-policy-coverage-clause.md), [D15](../database/D15-policy-clause-benefit.md), [D17](../database/D17-policy-exclusion.md), [D18](../database/D18-policy-sub-limit.md), [D31](../database/D31-audit-log.md) |
| [S11](../screens/S11-fhir-preview.md) | FHIR Preview | [D27](../database/D27-case-exchange-message.md) |
| [S12](../screens/S12-organisation.md) | Organisation | [F17](../fhir/F17-organization.md), [D1](../database/D1-payer.md), [D33](../database/D33-participant.md), [G2](../gateway/G2-configuration.md), [G4](../gateway/G4-registry.md), [G5](../gateway/G5-protocol-headers.md) |

## APIs

| To implement | What it is | Read with it |
|---|---|---|
| [A1](../apis/A1-eligibility-answer.md) | Eligibility Answer | [F1](../fhir/F1-bundle.md), [F2](../fhir/F2-coverage-eligibility-request.md), [F3](../fhir/F3-coverage-eligibility-response.md), [F6](../fhir/F6-questionnaire.md), [F15](../fhir/F15-patient.md), [F17](../fhir/F17-organization.md), [F18](../fhir/F18-coverage.md), [D1](../database/D1-payer.md), [D3](../database/D3-document-type.md), [D5](../database/D5-member.md), [D6](../database/D6-subscription.md), [D10](../database/D10-procedure-rule.md), [D11](../database/D11-procedure-rule-doc.md), [D12](../database/D12-policy.md), [D13](../database/D13-policy-procedure.md), [D19](../database/D19-case.md), [D31](../database/D31-audit-log.md), [G5](../gateway/G5-protocol-headers.md), [G7](../gateway/G7-send.md) |
| [A2](../apis/A2-insurance-plan-answer.md) | Insurance Plan Answer | [F1](../fhir/F1-bundle.md), [F4](../fhir/F4-task-insuranceplan.md), [F5](../fhir/F5-insuranceplan.md), [F6](../fhir/F6-questionnaire.md), [F9](../fhir/F9-claimresponse.md), [F10](../fhir/F10-task-claim-actions.md), [F15](../fhir/F15-patient.md), [F17](../fhir/F17-organization.md), [F18](../fhir/F18-coverage.md), [D1](../database/D1-payer.md), [D3](../database/D3-document-type.md), [D4](../database/D4-terminology-code.md), [D6](../database/D6-subscription.md), [D10](../database/D10-procedure-rule.md), [D11](../database/D11-procedure-rule-doc.md), [D12](../database/D12-policy.md), [D13](../database/D13-policy-procedure.md), [D14](../database/D14-policy-coverage-clause.md), [D15](../database/D15-policy-clause-benefit.md), [D16](../database/D16-policy-alias.md), [D17](../database/D17-policy-exclusion.md), [D18](../database/D18-policy-sub-limit.md), [D19](../database/D19-case.md), [D25](../database/D25-case-line-item.md), [D26](../database/D26-case-timeline.md), [D27](../database/D27-case-exchange-message.md), [D30](../database/D30-payment.md), [D31](../database/D31-audit-log.md), [G7](../gateway/G7-send.md) |
| [A11](../apis/A11-txn-related.md) | Transaction Related | nothing else |
| [A12](../apis/A12-txn-fhir.md) | Transaction FHIR | nothing else |
| [A15](../apis/A15-case-exchange.md) | Case Exchange Log | nothing else |
| [A16](../apis/A16-abha-policy-link.md) | ABHA Policy Link | [D1](../database/D1-payer.md), [D5](../database/D5-member.md), [D6](../database/D6-subscription.md), [D9](../database/D9-abha-link-event.md), [D12](../database/D12-policy.md), [D31](../database/D31-audit-log.md), [G2](../gateway/G2-configuration.md), [G3](../gateway/G3-session-token.md), [G10](../gateway/G10-beneficiary-registry.md) |
| [A17](../apis/A17-participant-lookup.md) | Participant Lookup | [D1](../database/D1-payer.md), [D19](../database/D19-case.md), [D33](../database/D33-participant.md), [G2](../gateway/G2-configuration.md), [G3](../gateway/G3-session-token.md), [G4](../gateway/G4-registry.md), [G7](../gateway/G7-send.md) |
| [A20](../apis/A20-abha-m1.md) | ABHA Create and Verify (ABDM M1) | [D5](../database/D5-member.md), [G3](../gateway/G3-session-token.md) |

## Callbacks

| To implement | What it is | Read with it |
|---|---|---|
| [C1](../callbacks/C1-callback-door.md) | Callback Door | nothing else |
| [C2](../callbacks/C2-coverage-eligibility-check.md) | Coverage Eligibility Check | [F1](../fhir/F1-bundle.md), [F2](../fhir/F2-coverage-eligibility-request.md), [F3](../fhir/F3-coverage-eligibility-response.md), [F15](../fhir/F15-patient.md), [F17](../fhir/F17-organization.md), [F18](../fhir/F18-coverage.md), [D3](../database/D3-document-type.md), [D5](../database/D5-member.md), [D6](../database/D6-subscription.md), [D10](../database/D10-procedure-rule.md), [D11](../database/D11-procedure-rule-doc.md), [D12](../database/D12-policy.md), [D13](../database/D13-policy-procedure.md), [D19](../database/D19-case.md), [D31](../database/D31-audit-log.md), [G8](../gateway/G8-receive.md), [G9](../gateway/G9-ledger.md) |
| [C3](../callbacks/C3-insurance-plan-request.md) | Insurance Plan Request | [F1](../fhir/F1-bundle.md), [F4](../fhir/F4-task-insuranceplan.md), [F5](../fhir/F5-insuranceplan.md), [F6](../fhir/F6-questionnaire.md), [F9](../fhir/F9-claimresponse.md), [F10](../fhir/F10-task-claim-actions.md), [F15](../fhir/F15-patient.md), [F17](../fhir/F17-organization.md), [F18](../fhir/F18-coverage.md), [D1](../database/D1-payer.md), [D3](../database/D3-document-type.md), [D4](../database/D4-terminology-code.md), [D6](../database/D6-subscription.md), [D10](../database/D10-procedure-rule.md), [D11](../database/D11-procedure-rule-doc.md), [D12](../database/D12-policy.md), [D13](../database/D13-policy-procedure.md), [D14](../database/D14-policy-coverage-clause.md), [D15](../database/D15-policy-clause-benefit.md), [D16](../database/D16-policy-alias.md), [D17](../database/D17-policy-exclusion.md), [D18](../database/D18-policy-sub-limit.md), [D19](../database/D19-case.md), [D25](../database/D25-case-line-item.md), [D26](../database/D26-case-timeline.md), [D27](../database/D27-case-exchange-message.md), [D30](../database/D30-payment.md), [D31](../database/D31-audit-log.md), [G8](../gateway/G8-receive.md) |

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
