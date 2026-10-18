# APIs

Every call the application makes into the embedded NHCX gateway (G), the NHCX or ABDM route that call puts on the wire, the payer-side calls made outside the exchange, and the application's own JSON endpoint. Screens refer to these by A number. Each file has ENDPOINT (E), DESCRIPTION (D), REQUEST (Q), RESPONSE (S), PSEUDOCODE (P) and USED BY (U) sections, and refers to FHIR resources by F number ([../fhir/](../fhir/INDEX.md)), tables by D number ([../database/](../database/INDEX.md)), replies by C number ([../callbacks/](../callbacks/INDEX.md)) and gateway parts by G number ([../gateway/](../gateway/INDEX.md)).

## Conventions

- The application calls G in-process, as function calls, never over HTTP. There is no gateway base URL, no gateway API key and no gateway HTTP timeout.
- Every outbound bundle goes through `gateway.send(path, envelope)`, [G7. Send](../gateway/G7-send.md), which completes the protocol headers ([G5. Protocol Headers](../gateway/G5-protocol-headers.md)), encrypts for the recipient ([G6. Encryption](../gateway/G6-encryption.md)) and posts to NHCX synchronously: when it returns, NHCX has answered. The arguments are the NHCX path (for example `v1/preauth/submit`) and the envelope `{jwe_headers, fhir}`: the `x-hcx-*` headers the application sets and the FHIR bundle. The result (`SendResult`) carries `ok` (NHCX answered 2xx), `txn_id` (the ledger id, also as `ledger_id`), `correlation_id`, `request_id`, `api_call_id`, the full `headers` the message went out under, NHCX's HTTP status (`gateway_status`, 202 when NHCX took it) and NHCX's reply (`response`).
- A failure comes back as a G7 `SendError`: `code`, `message`, `retryable`. A result with `ok` false (NHCX did not accept it) is a failed send too. Either is shown on the screen as a red message, never a 500: the error's `message`, or for `ok` false, NHCX's own `response.error.code: response.error.message`, else `GATEWAY_HTTP_<status>: NHCX did not accept the message`.
- A failed send may still name the ids it went out under: a `SendError` raised after the headers were built carries `txn_id`, `correlation_id` and the minted `headers`, and a result with `ok` false always carries them. When it does, the leg is kept under those ids and marked failed, because the message may have reached NHCX anyway (a connection dropped after the request was written is reported as unreachable). When it names none (a path or payload G7 refused before minting ids), nothing went out.
- Every correlation id a case's send goes out under (the result's, or the one a failed send names) is added once to the case's thread list ([D9. claim](../database/D9-claim.md) `correlation_ids`), which the Logs tab reads with the ids on the case's own rows. The write never breaks a send: a failure to record it is only logged.
- The `x-hcx-status` is set by the sending API, never left to the path default: `request.initiated` on every request path, query answers on `v1/preauth/submit` and `v1/claim/submit` included, and `response.complete` only on an `on_` path (A7, A8) ([CORE.md](../references/CORE.md) section 3).
- Every message G sends or receives, accepted, refused or failed, is recorded in the [G9. Ledger](../gateway/G9-ledger.md). Polling reads it in-process (A10 to A13).
- Every outbound FHIR payload and its acknowledgement is also archived beside the claim, so a bundle can be read back later.
- A18 and A19 are ABDM calls beside the exchange, plain JSON with the session token and no ledger row: the beneficiary's biometric authentication, defined in full in A18, and the ABHA service (M1), whose calls A19 names on the MCP.
- There is no A9: the inbound door it once described became the callbacks, C1 to C10. Inbound messages are the callbacks in [../callbacks/](../callbacks/INDEX.md), taken in by [G8. Receive](../gateway/G8-receive.md).

## Outbound to NHCX

| # | API | Call | File |
|---|---|---|---|
| [A5](A5-claim-submit.md) | Claim Submit | `gateway.send("v1/claim/submit")` | [A5-claim-submit.md](A5-claim-submit.md) |
| [A6](A6-task-submit.md) | Task Submit (cancel, status, reprocess, release) | `gateway.send("v1/task/submit")` | [A6-task-submit.md](A6-task-submit.md) |

## Ledger queries (polling)

Polling is the fallback when a callback is missed. Opening a claim runs these for every leg still waiting.

| # | API | Call | File |
|---|---|---|---|
| [A10](A10-txn-related.md) | Transaction Related | `ledger.related(txn_id)` | [A10-txn-related.md](A10-txn-related.md) |
| [A11](A11-txn-dispatch.md) | Transaction Dispatch | `ledger.dispatch(txn_id)` | [A11-txn-dispatch.md](A11-txn-dispatch.md) |
| [A12](A12-txn-fhir.md) | Transaction FHIR | `ledger.fhir(txn_id)` | [A12-txn-fhir.md](A12-txn-fhir.md) |
| [A13](A13-txn-list.md) | Transaction List | `ledger.list()` | [A13-txn-list.md](A13-txn-list.md) |

## Payer adjudication (sandbox testing)

| # | API | Call | File |
|---|---|---|---|
| [A14](A14-adjudicator-user-role.md) | Adjudicator User Role | payer service `get/user-role`, or the IRDAI desk | [A14-adjudicator-user-role.md](A14-adjudicator-user-role.md) |
| [A15](A15-adjudicator-process-case.md) | Adjudicator Process Case | payer service `process/case`, or the IRDAI desk | [A15-adjudicator-process-case.md](A15-adjudicator-process-case.md) |
| [A16](A16-gateway-token.md) | Gateway Token | `gateway.token(participant)` (G3) | [A16-gateway-token.md](A16-gateway-token.md) |

## ABDM calls beside the exchange

Plain JSON to ABDM with the session token: the beneficiary's biometric authentication and their ABHA. No JWE, no protocol headers, no ledger row.

| # | API | Call | File |
|---|---|---|---|
| [A18](A18-biometric-authentication.md) | Biometric Authentication | `abdm.biometric.init / capture / verify / refresh` | [A18-biometric-authentication.md](A18-biometric-authentication.md) |

## Application

| # | API | Call | File |
|---|---|---|---|
| [A17](A17-claim-state.md) | Claim State | `GET claims/view/:caseid/state` | [A17-claim-state.md](A17-claim-state.md) |
