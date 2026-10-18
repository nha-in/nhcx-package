# APIs

Every call the application makes into the embedded NHCX gateway (G) and the NHCX or ABDM route that call puts on the wire, the desk's own services that decide and pay, and the calls made outside the exchange for sandbox testing. Screens refer to these by A number. Each file has ENDPOINT (E), DESCRIPTION (D), REQUEST (Q), RESPONSE (S), PSEUDOCODE (P) and USED BY (U) sections, and refers to FHIR resources by F number ([../fhir/](../fhir/INDEX.md)), tables by D number ([../database/](../database/INDEX.md)), the messages they answer by C number ([../callbacks/](../callbacks/INDEX.md)) and gateway parts by G number ([../gateway/](../gateway/INDEX.md)).

## Conventions

- The application calls G in-process, as function calls, never over HTTP. There is no gateway base URL, no gateway API key and no gateway HTTP timeout. The reference payer talks to a gateway over HTTP [REF](../references/PAYERS.md#markers); this skill embeds it, exactly as the provider skill does.
- Every outbound bundle goes through `gateway.send(path, envelope)`, [G7. Send](../gateway/G7-send.md), which completes the protocol headers ([G5. Protocol Headers](../gateway/G5-protocol-headers.md)), encrypts for the recipient ([G6. Encryption](../gateway/G6-encryption.md)) and posts to NHCX synchronously: when it returns, NHCX has answered. The arguments are the NHCX path (for example `v1/preauth/on_submit`) and the envelope `{jwe_headers, fhir}`: the `x-hcx-*` headers the application sets and the FHIR bundle. The result (`SendResult`) carries `ok` (NHCX answered 2xx), `txn_id` (the ledger id, also as `ledger_id`), `correlation_id`, `request_id`, `api_call_id`, the full `headers` the message went out under, NHCX's HTTP status (`gateway_status`, 202 when NHCX took it) and NHCX's reply (`response`).
- **An answer travels on the request's thread.** Everything this payer sends in reply to a hospital (A1 to A4, A7 to A10) carries the request's `x-hcx-correlation_id` verbatim, the request's own `x-hcx-workflow_id` unless the scheme gives the answer one of its own ([PAYERS.md](../references/PAYERS.md)), and `x-hcx-status` `response.complete` (`response.partial` on an acknowledgement). Without the correlation id the hospital's poll can never match the answer.
- **A query and a payment notice open a thread of their own.** A5 and A6 pass no correlation id; G7 mints one and the send result carries it. It is stored on the case or the payment, because the hospital's reply comes back under it.
- A failure comes back as a G7 `SendError`: `code`, `message`, `retryable`. A result with `ok` false (NHCX did not accept it) is a failed send too. Either is shown on the desk as a red message, never a 500: the error's `message`, or for `ok` false, NHCX's own `response.error.code: response.error.message`, else `GATEWAY_HTTP_<status>: NHCX did not accept the message`.
- **A failed send never undoes a decision.** A verdict, a query or a payment is recorded whatever the gateway does; the case keeps its correlation ids, the trail says the send failed, and the desk offers it again. A failed send may still name the ids it went out under: a `SendError` raised after the headers were built carries `txn_id`, `correlation_id` and the minted `headers`, and a result with `ok` false always carries them. When it does, they are kept on the trail because the message may have reached NHCX anyway.
- **An answer sent on the spot is sent inside the delivery.** A1, A2, A7, A8 and A10 run while [G8. Receive](../gateway/G8-receive.md) is still holding the hospital's message: the callback answers, then the door tells NHCX the delivery was taken. A gateway that cannot queue the answer fails the delivery (`error`), so NHCX redelivers and the question is answered next time.
- Every message G sends or receives, accepted, refused or failed, is recorded in the [G9. Ledger](../gateway/G9-ledger.md). Polling reads it in-process (A11, A12). Every message about a case is also written to the case's exchange log ([D27. case_exchange_message](../database/D27-case-exchange-message.md)) with its bundle, so a bundle can be read back later without the ledger.
- There is no inbound API here: everything a hospital sends arrives as a callback ([../callbacks/](../callbacks/INDEX.md)), taken in by [G8. Receive](../gateway/G8-receive.md) and routed by [C1. Callback Door](../callbacks/C1-callback-door.md).

## Outbound to NHCX

Answers to a hospital's message travel on its correlation id; a query and a payment notice open a thread of their own.

| # | API | Call | File |
|---|---|---|---|
| [A6](A6-payment-notice.md) | Payment Notice | `gateway.send("v1/paymentnotice/request")` | [A6-payment-notice.md](A6-payment-notice.md) |
| [A7](A7-payment-enquiry-answer.md) | Payment Enquiry Answer | `gateway.send("v1/paymentnotice/on_request")` | [A7-payment-enquiry-answer.md](A7-payment-enquiry-answer.md) |

## Ledger queries (polling)

Polling is the fallback when a callback is missed. Opening a case runs these for every thread still waiting on the hospital.

| # | API | Call | File |
|---|---|---|---|
| [A11](A11-txn-related.md) | Transaction Related | `ledger.related(txn_id)` | [A11-txn-related.md](A11-txn-related.md) |
| [A12](A12-txn-fhir.md) | Transaction FHIR | `ledger.fhir(txn_id)` | [A12-txn-fhir.md](A12-txn-fhir.md) |

## Application

| # | API | Call | File |
|---|---|---|---|
| [A14](A14-disburse.md) | Disburse | `POST payments`, `POST payments/:id/complete`, `POST payments/:id/fail` | [A14-disburse.md](A14-disburse.md) |
| [A15](A15-case-exchange.md) | Case Exchange Log | `GET cases/:id/exchange`, `GET cases/:id/exchange/:msgId`, `GET cases/:id/fhir`, `GET cases/:id/forms` | [A15-case-exchange.md](A15-case-exchange.md) |
