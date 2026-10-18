# Database

Every table behind the desk, the registry, the products and the payments, in one list. Each row links to its full spec in [../database/](../database/INDEX.md), which gives the columns, keys and indexes. D1 to D18 are tables most payer systems already have (extended where NHCX needs a field); D19 to D32 are new for the cases, the exchange and the payments.

## Master data

| # | Table | What one row is | Screens | APIs | Callbacks | FHIR |
|---|---|---|---|---|---|---|
| [D1](../database/D1-payer.md) | payer | The insurer this deployment is: name, IRDAI registration, ROHINI id, NHCX participant and processing codes, contact details. | none | [A6](../apis/A6-payment-notice.md), [A7](../apis/A7-payment-enquiry-answer.md), [A12](../apis/A12-txn-fhir.md), [A15](../apis/A15-case-exchange.md) | [C1](../callbacks/C1-callback-door.md) | [F1](../fhir/F1-bundle.md), [F5](../fhir/F5-insuranceplan.md), [F9](../fhir/F9-claimresponse.md), [F10](../fhir/F10-task-claim-actions.md), [F17](../fhir/F17-organization.md) |
| [D2](../database/D2-staff.md) | staff | A desk account's half: which payer it works for and its role (adjudicator decides, finance disburses, admin both). | none | none | none | none |
| [D3](../database/D3-document-type.md) | document_type | The NHCX document taxonomy a policy may demand and a case document is filed under. | [S3](../screens/S3-case-desk.md) | none | [C1](../callbacks/C1-callback-door.md) | [F5](../fhir/F5-insuranceplan.md) |
| [D4](../database/D4-terminology-code.md) | terminology_code | The published value sets the configurator picks codes from (plan types, SNOMED clauses, categories). | none | none | none | [F5](../fhir/F5-insuranceplan.md) |
| [D31](../database/D31-audit-log.md) | audit_log | Every write and every exchange receipt, by whom and when. | none | [A6](../apis/A6-payment-notice.md), [A7](../apis/A7-payment-enquiry-answer.md), [A14](../apis/A14-disburse.md) | [C1](../callbacks/C1-callback-door.md), [C10](../callbacks/C10-payment-enquiry.md), [C11](../callbacks/C11-payment-acknowledgement.md) | [F4](../fhir/F4-task-insuranceplan.md), [F13](../fhir/F13-paymentnotice.md) |

## Members and enrolments

| # | Table | What one row is | Screens | APIs | Callbacks | FHIR |
|---|---|---|---|---|---|---|
| [D6](../database/D6-subscription.md) | subscription | One enrolment of a member on a product: cover period, wallet balance, status, ABHA link state. | [S1](../screens/S1-overview.md), [S3](../screens/S3-case-desk.md) | none | [C1](../callbacks/C1-callback-door.md) | [F4](../fhir/F4-task-insuranceplan.md), [F5](../fhir/F5-insuranceplan.md), [F10](../fhir/F10-task-claim-actions.md), [F15](../fhir/F15-patient.md), [F18](../fhir/F18-coverage.md) |
| [D33](../database/D33-participant.md) | participant | The participant master: every provider, payer and TPA on the exchange, government and private, pulled from the registry's participant list over a configured window (one year by default, ten in the sandbox) and refreshed daily. Primary key `code`. No parent table. | none | none | none | none |

## Products and procedures

| # | Table | What one row is | Screens | APIs | Callbacks | FHIR |
|---|---|---|---|---|---|---|
| [D10](../database/D10-procedure-rule.md) | procedure_rule | One procedure in the registry: codes, category, package rate, and the procedure's own questionnaires. | none | none | none | [F5](../fhir/F5-insuranceplan.md), [F6](../fhir/F6-questionnaire.md) |
| [D11](../database/D11-procedure-rule-doc.md) | procedure_rule_doc | Which document a procedure wants at which phase. | none | none | none | [F5](../fhir/F5-insuranceplan.md) |
| [D12](../database/D12-policy.md) | policy | One product: name, UIN, type, plan type, sum assured, status. | [S1](../screens/S1-overview.md) | none | none | [F4](../fhir/F4-task-insuranceplan.md), [F5](../fhir/F5-insuranceplan.md), [F6](../fhir/F6-questionnaire.md), [F9](../fhir/F9-claimresponse.md), [F10](../fhir/F10-task-claim-actions.md), [F18](../fhir/F18-coverage.md) |
| [D13](../database/D13-policy-procedure.md) | policy_procedure | A procedure a policy covers. | none | none | none | [F5](../fhir/F5-insuranceplan.md) |
| [D14](../database/D14-policy-coverage-clause.md) | policy_coverage_clause | A SNOMED coverage clause of a policy. | none | none | none | [F5](../fhir/F5-insuranceplan.md) |
| [D15](../database/D15-policy-clause-benefit.md) | policy_clause_benefit | A benefit under a clause, with its limit. | none | none | none | [F5](../fhir/F5-insuranceplan.md) |
| [D16](../database/D16-policy-alias.md) | policy_alias | An alternate name a product is filed under. | none | none | none | [F4](../fhir/F4-task-insuranceplan.md), [F5](../fhir/F5-insuranceplan.md) |
| [D17](../database/D17-policy-exclusion.md) | policy_exclusion | A standard exclusion clause of a policy. | none | none | none | [F5](../fhir/F5-insuranceplan.md) |
| [D18](../database/D18-policy-sub-limit.md) | policy_sub_limit | A sub-limit of a policy on one concept. | none | none | none | [F5](../fhir/F5-insuranceplan.md) |

## Case

| # | Table | What one row is | Screens | APIs | Callbacks | FHIR |
|---|---|---|---|---|---|---|
| [D19](../database/D19-case.md) | case | One claim dossier from pre-authorisation to settlement: patient snapshot, hospital, admission, stage, totals, adjudication, and the exchange routing slips of the pre-auth, claim, query and reprocess threads. | [S1](../screens/S1-overview.md), [S2](../screens/S2-cases.md), [S3](../screens/S3-case-desk.md), [S10](../screens/S10-payments.md) | [A6](../apis/A6-payment-notice.md), [A7](../apis/A7-payment-enquiry-answer.md), [A11](../apis/A11-txn-related.md), [A14](../apis/A14-disburse.md), [A15](../apis/A15-case-exchange.md) | [C1](../callbacks/C1-callback-door.md), [C11](../callbacks/C11-payment-acknowledgement.md) | [F1](../fhir/F1-bundle.md), [F9](../fhir/F9-claimresponse.md), [F10](../fhir/F10-task-claim-actions.md), [F13](../fhir/F13-paymentnotice.md), [F14](../fhir/F14-paymentreconciliation.md), [F15](../fhir/F15-patient.md), [F17](../fhir/F17-organization.md), [F18](../fhir/F18-coverage.md) |
| [D25](../database/D25-case-line-item.md) | case_line_item | One bill line with its claimed and approved amounts and its decision, the round it arrived in. | [S2](../screens/S2-cases.md), [S3](../screens/S3-case-desk.md) | none | none | [F9](../fhir/F9-claimresponse.md) |
| [D26](../database/D26-case-timeline.md) | case_timeline | One event on the case's trail. | [S3](../screens/S3-case-desk.md) | [A11](../apis/A11-txn-related.md), [A14](../apis/A14-disburse.md), [A15](../apis/A15-case-exchange.md) | [C11](../callbacks/C11-payment-acknowledgement.md) | [F10](../fhir/F10-task-claim-actions.md) |

## Exchange

| # | Table | What one row is | Screens | APIs | Callbacks | FHIR |
|---|---|---|---|---|---|---|
| [D27](../database/D27-case-exchange-message.md) | case_exchange_message | One message about a case, in or out, with its bundle. | [S3](../screens/S3-case-desk.md) | [A6](../apis/A6-payment-notice.md), [A7](../apis/A7-payment-enquiry-answer.md), [A12](../apis/A12-txn-fhir.md), [A15](../apis/A15-case-exchange.md) | [C1](../callbacks/C1-callback-door.md), [C10](../callbacks/C10-payment-enquiry.md), [C11](../callbacks/C11-payment-acknowledgement.md) | [F1](../fhir/F1-bundle.md), [F10](../fhir/F10-task-claim-actions.md), [F13](../fhir/F13-paymentnotice.md) |
| [D28](../database/D28-nhcx-delivery.md) | nhcx_delivery | One delivery taken in, keyed by api call id, so a redelivery is refused. | none | [A11](../apis/A11-txn-related.md), [A12](../apis/A12-txn-fhir.md) | [C1](../callbacks/C1-callback-door.md) | none |

## Payments

| # | Table | What one row is | Screens | APIs | Callbacks | FHIR |
|---|---|---|---|---|---|---|
| [D30](../database/D30-payment.md) | payment | One disbursement against a case: amount, TDS, net, mode, beneficiary, UTR, status, notice transaction and acknowledgement. | [S1](../screens/S1-overview.md), [S10](../screens/S10-payments.md) | [A6](../apis/A6-payment-notice.md), [A7](../apis/A7-payment-enquiry-answer.md), [A11](../apis/A11-txn-related.md), [A14](../apis/A14-disburse.md), [A15](../apis/A15-case-exchange.md) | [C10](../callbacks/C10-payment-enquiry.md), [C11](../callbacks/C11-payment-acknowledgement.md) | [F10](../fhir/F10-task-claim-actions.md), [F13](../fhir/F13-paymentnotice.md), [F14](../fhir/F14-paymentreconciliation.md) |

## Numbering

| # | Table | What one row is | Screens | APIs | Callbacks | FHIR |
|---|---|---|---|---|---|---|
| [D32](../database/D32-id-sequence.md) | id_sequence | The next number of each human-readable id series. | [S10](../screens/S10-payments.md) | [A14](../apis/A14-disburse.md) | none | none |
