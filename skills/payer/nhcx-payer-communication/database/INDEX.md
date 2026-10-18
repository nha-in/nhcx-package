# Database

The tables behind the desk, registry, configuration and payment screens. Screens (S), APIs (A) and callbacks (C) refer to these by D number. Each file has TABLE (T), DESCRIPTION (D), COLUMNS (C), KEYS AND INDEXES (K) and USED BY (U) sections.

D1 to D18 are tables most payer systems already have: the insurer's own record, staff and roles, the document taxonomy, members, enrolments and their wallets, products and the procedures they cover. They are extended only where NHCX needs a column (the participant codes on the payer, the ABHA number and link state on an enrolment, the package rate, treatment-guideline questions and per-phase document rules on a procedure, the SNOMED clauses and exclusions the InsurancePlan is rendered from). D19 to D33 are new for the exchange: the case and its children, the messages and deliveries, the quotes, the payments, the numbering, and the participant master pulled from the registry.

Table names are written without the reference implementation's `payer_` prefix [REF](../references/PAYERS.md#markers). Primary keys are the business identifiers the desk reads out (a case id, a claim number, a payment number), allocated from [D32. id_sequence](D32-id-sequence.md) so the prefix and width are decided in one place [REF](../references/PAYERS.md#markers). Child rows that are never quoted (line items, documents, timeline entries) take short random ids [REF](../references/PAYERS.md#markers). Money is a fixed-point decimal with two places; timestamps carry a time zone and are stored in UTC.

## Master data

| # | Table | What one row is | File |
|---|---|---|---|
| [D1](D1-payer.md) | payer | The insurer this deployment is: name, IRDAI registration, ROHINI id, NHCX participant and processing codes, contact details. | [D1-payer.md](D1-payer.md) |
| [D2](D2-staff.md) | staff | A desk account's half: which payer it works for and its role (adjudicator decides, finance disburses, admin both). | [D2-staff.md](D2-staff.md) |
| [D3](D3-document-type.md) | document_type | The NHCX document taxonomy a policy may demand and a case document is filed under. | [D3-document-type.md](D3-document-type.md) |
| [D31](D31-audit-log.md) | audit_log | Every write and every exchange receipt, by whom and when. | [D31-audit-log.md](D31-audit-log.md) |

## Members and enrolments

| # | Table | What one row is | File |
|---|---|---|---|
| [D33](D33-participant.md) | participant | The participant master: every provider, payer and TPA on the exchange, government and private, pulled from the registry's participant list over a configured window (one year by default, ten in the sandbox) and refreshed daily. Primary key `code`. No parent table. | [D33-participant.md](D33-participant.md) |

## Case

| # | Table | What one row is | File |
|---|---|---|---|
| [D19](D19-case.md) | case | One claim dossier from pre-authorisation to settlement: patient snapshot, hospital, admission, stage, totals, adjudication, and the exchange routing slips of the pre-auth, claim, query and reprocess threads. | [D19-case.md](D19-case.md) |
| [D23](D23-case-document.md) | case_document | A document on a case: code, phase, type, where the bytes are. | [D23-case-document.md](D23-case-document.md) |
| [D24](D24-case-document-file.md) | case_document_file | The bytes of a document that arrived inline. | [D24-case-document-file.md](D24-case-document-file.md) |
| [D25](D25-case-line-item.md) | case_line_item | One bill line with its claimed and approved amounts and its decision, the round it arrived in. | [D25-case-line-item.md](D25-case-line-item.md) |
| [D26](D26-case-timeline.md) | case_timeline | One event on the case's trail. | [D26-case-timeline.md](D26-case-timeline.md) |

## Exchange

| # | Table | What one row is | File |
|---|---|---|---|
| [D27](D27-case-exchange-message.md) | case_exchange_message | One message about a case, in or out, with its bundle. | [D27-case-exchange-message.md](D27-case-exchange-message.md) |
| [D28](D28-nhcx-delivery.md) | nhcx_delivery | One delivery taken in, keyed by api call id, so a redelivery is refused. | [D28-nhcx-delivery.md](D28-nhcx-delivery.md) |

## Numbering

| # | Table | What one row is | File |
|---|---|---|---|
| [D32](D32-id-sequence.md) | id_sequence | The next number of each human-readable id series. | [D32-id-sequence.md](D32-id-sequence.md) |
