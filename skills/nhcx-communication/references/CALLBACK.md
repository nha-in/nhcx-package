# Callbacks

Every message NHCX delivers to the application, in one list. Each row links to its full spec in [../callbacks/](../callbacks/INDEX.md). NHCX posts to the application's public route (`/in/<path>` or `/v1/<path>`); [G8. Receive](../gateway/G8-receive.md) decrypts it and calls C1 in-process, then records the message and C1's outcome in [G9. Ledger](../gateway/G9-ledger.md). Every handler answers `settled`, `unmatched`, `ignored`, `rejected` or `error`; only `error` makes NHCX redeliver.

| # | Callback | NHCX route | What it does | Matched by | Writes | Answers | Screens |
|---|---|---|---|---|---|---|---|
| [C1](../callbacks/C1-callback-door.md) | Callback Door | every route | Takes each decrypted message, archives it beside its case, and routes it by type to C2 to C10. Holds the shared rules: redelivery, refusals (ProtocolResponse), reopening a failed send. | type from the path | [D9](../database/D9-claim.md), [D23](../database/D23-claim-query.md) | [A7](../apis/A7-communication-on-request.md), [A10](../apis/A10-txn-related.md), [A13](../apis/A13-txn-list.md) | [S6](../screens/S6-claim-detail.md) |
| [C9](../callbacks/C9-communication-request.md) | Payer Communication | `v1/communication/request` | Files a payer query, notification or note on the right leg; a query opens it for reply, a notification is acknowledged automatically. | the case the message names | [D9](../database/D9-claim.md), [D23](../database/D23-claim-query.md) | [A7](../apis/A7-communication-on-request.md) | [S10](../screens/S10-communication.md) |
