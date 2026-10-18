# Callbacks

Every message NHCX delivers to the application. NHCX posts it to the application's public inbound route (`/in/<path>` or `/v1/<path>`, whichever the registered `endpoint_url` points at); [G8. Receive](../gateway/G8-receive.md) decrypts it and hands it in-process to C1, then records it and C1's outcome in [G9. Ledger](../gateway/G9-ledger.md). APIs (A) and screens (S) refer to these by C number. Each file has ENDPOINT (E), DESCRIPTION (D), REQUEST (Q), PSEUDOCODE (P), RESPONSE (S) and USED BY (U) sections.

| # | Callback | NHCX route | Answers | File |
|---|---|---|---|---|
| [C1](C1-callback-door.md) | Callback Door | every route | [A7](../apis/A7-communication-on-request.md), [A10](../apis/A10-txn-related.md), [A13](../apis/A13-txn-list.md) | [C1-callback-door.md](C1-callback-door.md) |
| [C9](C9-communication-request.md) | Payer Communication | `v1/communication/request` | [A7](../apis/A7-communication-on-request.md) | [C9-communication-request.md](C9-communication-request.md) |
