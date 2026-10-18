# Database

Every table behind the desk, the registry, the products and the payments, in one list. Each row links to its full spec in [../database/](../database/INDEX.md), which gives the columns, keys and indexes. D1 to D18 are tables most payer systems already have (extended where NHCX needs a field); D19 to D32 are new for the cases, the exchange and the payments.

## Master data

| # | Table | What one row is | Screens | APIs | Callbacks | FHIR |
|---|---|---|---|---|---|---|
| [D1](../database/D1-payer.md) | payer | The insurer this deployment is: name, IRDAI registration, ROHINI id, NHCX participant and processing codes, contact details. | none | [A5](../apis/A5-query-request.md), [A12](../apis/A12-txn-fhir.md), [A15](../apis/A15-case-exchange.md) | [C1](../callbacks/C1-callback-door.md) | [F1](../fhir/F1-bundle.md), [F9](../fhir/F9-claimresponse.md), [F17](../fhir/F17-organization.md) |
| [D2](../database/D2-staff.md) | staff | A desk account's half: which payer it works for and its role (adjudicator decides, finance disburses, admin both). | none | none | none | none |
| [D3](../database/D3-document-type.md) | document_type | The NHCX document taxonomy a policy may demand and a case document is filed under. | [S3](../screens/S3-case-desk.md) | none | [C1](../callbacks/C1-callback-door.md) | [F12](../fhir/F12-communication.md) |
| [D31](../database/D31-audit-log.md) | audit_log | Every write and every exchange receipt, by whom and when. | none | [A5](../apis/A5-query-request.md), [A13](../apis/A13-adjudicate.md) | [C1](../callbacks/C1-callback-door.md), [C9](../callbacks/C9-communication.md) | none |

## Members and enrolments

| # | Table | What one row is | Screens | APIs | Callbacks | FHIR |
|---|---|---|---|---|---|---|
| [D33](../database/D33-participant.md) | participant | The participant master: every provider, payer and TPA on the exchange, government and private, pulled from the registry's participant list over a configured window (one year by default, ten in the sandbox) and refreshed daily. Primary key `code`. No parent table. | none | none | none | none |

## Case

| # | Table | What one row is | Screens | APIs | Callbacks | FHIR |
|---|---|---|---|---|---|---|
| [D19](../database/D19-case.md) | case | One claim dossier from pre-authorisation to settlement: patient snapshot, hospital, admission, stage, totals, adjudication, and the exchange routing slips of the pre-auth, claim, query and reprocess threads. | [S1](../screens/S1-overview.md), [S2](../screens/S2-cases.md), [S3](../screens/S3-case-desk.md) | [A5](../apis/A5-query-request.md), [A11](../apis/A11-txn-related.md), [A13](../apis/A13-adjudicate.md), [A15](../apis/A15-case-exchange.md) | [C1](../callbacks/C1-callback-door.md), [C9](../callbacks/C9-communication.md) | [F1](../fhir/F1-bundle.md), [F9](../fhir/F9-claimresponse.md), [F11](../fhir/F11-communicationrequest.md), [F12](../fhir/F12-communication.md), [F15](../fhir/F15-patient.md), [F17](../fhir/F17-organization.md), [F18](../fhir/F18-coverage.md) |
| [D23](../database/D23-case-document.md) | case_document | A document on a case: code, phase, type, where the bytes are. | [S3](../screens/S3-case-desk.md) | none | [C9](../callbacks/C9-communication.md) | [F12](../fhir/F12-communication.md) |
| [D24](../database/D24-case-document-file.md) | case_document_file | The bytes of a document that arrived inline. | [S3](../screens/S3-case-desk.md) | none | [C9](../callbacks/C9-communication.md) | [F12](../fhir/F12-communication.md) |
| [D25](../database/D25-case-line-item.md) | case_line_item | One bill line with its claimed and approved amounts and its decision, the round it arrived in. | [S2](../screens/S2-cases.md), [S3](../screens/S3-case-desk.md) | [A5](../apis/A5-query-request.md), [A13](../apis/A13-adjudicate.md) | [C9](../callbacks/C9-communication.md) | [F9](../fhir/F9-claimresponse.md), [F11](../fhir/F11-communicationrequest.md), [F12](../fhir/F12-communication.md) |
| [D26](../database/D26-case-timeline.md) | case_timeline | One event on the case's trail. | [S3](../screens/S3-case-desk.md) | [A5](../apis/A5-query-request.md), [A11](../apis/A11-txn-related.md), [A13](../apis/A13-adjudicate.md), [A15](../apis/A15-case-exchange.md) | [C9](../callbacks/C9-communication.md) | [F12](../fhir/F12-communication.md) |

## Exchange

| # | Table | What one row is | Screens | APIs | Callbacks | FHIR |
|---|---|---|---|---|---|---|
| [D27](../database/D27-case-exchange-message.md) | case_exchange_message | One message about a case, in or out, with its bundle. | [S3](../screens/S3-case-desk.md) | [A5](../apis/A5-query-request.md), [A12](../apis/A12-txn-fhir.md), [A13](../apis/A13-adjudicate.md), [A15](../apis/A15-case-exchange.md) | [C1](../callbacks/C1-callback-door.md), [C9](../callbacks/C9-communication.md) | [F1](../fhir/F1-bundle.md), [F12](../fhir/F12-communication.md) |
| [D28](../database/D28-nhcx-delivery.md) | nhcx_delivery | One delivery taken in, keyed by api call id, so a redelivery is refused. | none | [A11](../apis/A11-txn-related.md), [A12](../apis/A12-txn-fhir.md) | [C1](../callbacks/C1-callback-door.md) | none |

## Numbering

| # | Table | What one row is | Screens | APIs | Callbacks | FHIR |
|---|---|---|---|---|---|---|
| [D32](../database/D32-id-sequence.md) | id_sequence | The next number of each human-readable id series. | none | none | none | none |
