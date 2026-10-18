# D27. case_exchange_message

#### D27T. TABLE
One row is one message exchanged about one case ([D19. case](D19-case.md)) over NHCX, in either direction, with the bundle as it went over the wire; primary key `id`, ordered by `seq`. The reference implementation names it `payer_case_exchange_messages` [REF](../references/PAYERS.md#markers).

#### D27D. DESCRIPTION
The evidence. The timeline ([D26. case_timeline](D26-case-timeline.md)) says what happened in words; this table holds the messages themselves, so an operator can read what the hospital sent and what this payer answered, and a driver or test can read the case's state off it ([A15. Case Exchange Log](../apis/A15-case-exchange.md), `GET cases/:id/exchange`, `.../exchange/:msgId` with the payload). It is the application's own log beside the gateway's ledger ([G9. Ledger](../gateway/G9-ledger.md)): the ledger holds every envelope by transaction, this holds the ones that belong to a case.

**Written** by every callback and every send, after the message has arrived or gone:

| Direction | Kind | Written by |
|---|---|---|
| `in` | `preauth` | C4. Pre-auth Submit (in nhcx-payer-preauth), for a new case, an enhancement or a resubmission (the summary says which) |
| `in` | `claim` | C5. Claim Submit (in nhcx-payer-claim) |
| `in` | `communication` | [C9. Communication](../callbacks/C9-communication.md) |
| `in` | `task` | C7. Task Submit (in nhcx-payer-preauth), C8. Status Enquiry (in nhcx-payer-preauth), C11. Payment Acknowledgement (in nhcx-payer-payment) |
| `in` | `paymentnotice` | C10. Payment Enquiry (in nhcx-payer-payment) |
| `out` | `claimresponse` | A3. Pre-auth Answer (in nhcx-payer-preauth), A4. Claim Answer (in nhcx-payer-claim): the acknowledgement, a line-item query ("Line-item query sent: `<asks>`") and the verdict, one row each; a dropped or delayed answer is recorded with a note and the bundle that was withheld [SANDBOX](../references/PAYERS.md#markers) |
| `out` | `communicationrequest` | [A5. Query Request](../apis/A5-query-request.md) |
| `out` | `task` | A9. Task Answer (in nhcx-payer-preauth), the reprocess verdict included; A8. Status Answer (in nhcx-payer-preauth) as `status` |
| `out` | `paymentnotice` | A6. Payment Notice (in nhcx-payer-payment) |
| `out` | `paymentreconciliation` | A7. Payment Enquiry Answer (in nhcx-payer-payment) |

Kinds, exact strings: `preauth`, `claimresponse`, `claim`, `communicationrequest`, `communication`, `paymentnotice`, `paymentreconciliation`, `task`, `status`, `predetermination`; anything else is written as `task`.

**One message, one row.** A redelivery, or a second copy of the application writing to the same database, carries the same transaction id, and two rows for one message read as two exchanges that never happened: a row with the same case, direction, kind and `txn_id` is not written again.

**Never fails the caller.** The message already went over the wire or arrived; losing the application's copy is the lesser failure, so a write error is logged and the id comes back empty.

The answered forms a hospital sent (F7. QuestionnaireResponse (in nhcx-payer-preauth)) are read back off the `in` rows of kind `preauth` and `claim` ([A15. Case Exchange Log](../apis/A15-case-exchange.md), `GET cases/:id/forms`), which is why the payload is kept whole.

Delete: never; cascade with the case.

#### D27C. COLUMNS
| column | type | null/default | meaning (and allowed values) |
|---|---|---|---|
| id | VARCHAR(24) | primary key | `MSG-<random>` [REF](../references/PAYERS.md#markers) |
| seq | BIGINT | NOT NULL, identity, UNIQUE | insertion order |
| case_id | VARCHAR(24) | NOT NULL | the case ([D19. case](D19-case.md)) |
| direction | VARCHAR(32) | NOT NULL | `in`, `out` |
| kind | VARCHAR(40) | NOT NULL | one of the kinds above |
| correlation_id | VARCHAR(128) | null | the thread the message travelled on |
| txn_id | VARCHAR(128) | null | the ledger id ([G9. Ledger](../gateway/G9-ledger.md)) |
| counterparty | VARCHAR(64) | null | the other participant, `<facility code>` form |
| summary | VARCHAR(1000) | NOT NULL, default `''` | one line for the log, cut to 1000 characters |
| payload | JSONB | null | the bundle as sent or received; left out of a list, present on a read |
| at | TIMESTAMPTZ | NOT NULL, default now | when |

#### D27K. KEYS AND INDEXES
- Primary key `id`. Unique `uq_exchange_messages_seq` on `seq`.
- Foreign key `case_id` references [D19. case](D19-case.md) `id` (`ON DELETE CASCADE`).
- Check `ck_exchange_messages_direction`.
- Indexes: `idx_exchange_messages_case` on `(case_id, seq)`; `idx_exchange_messages_correlation` on `correlation_id`.

#### D27U. USED BY
- Screens: [S3. Case Desk](../screens/S3-case-desk.md)
- APIs: [A5. Query Request](../apis/A5-query-request.md), [A12. Transaction FHIR](../apis/A12-txn-fhir.md), [A13. Adjudicate](../apis/A13-adjudicate.md), [A15. Case Exchange Log](../apis/A15-case-exchange.md)
- Callbacks: [C1. Callback Door](../callbacks/C1-callback-door.md), [C9. Communication](../callbacks/C9-communication.md)
- FHIR: [F1. Bundle](../fhir/F1-bundle.md), [F12. Communication](../fhir/F12-communication.md)
- Database: [D19. case](D19-case.md), [D26. case_timeline](D26-case-timeline.md)
