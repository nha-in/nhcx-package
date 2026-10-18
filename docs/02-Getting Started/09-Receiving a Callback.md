# Receiving a callback

Every answer on the exchange arrives at your server, not in the response to your call. This chapter builds the endpoint that receives it, and closes the loop opened in the previous one.

## What to host

Under the `endpoint_url` you registered, the exchange will POST to a path per use case. For a provider that starts with:

```
/v1/coverageeligibility/on_check
/v1/insuranceplan/on_request
/v1/preauth/on_submit
/v1/claim/on_submit
/v1/search/on_submit
/v1/communication/request
/v1/paymentnotice/request
/v1/task/on_submit
/v1/on_status
/v1/error
```

A payer hosts the mirror set, the `submit` and `check` sides. Both host `/v1/error`; it is where the exchange reports a message it could not deliver after five attempts, and without it you never find out.

Build one handler and route by path. The body shape and the steps are the same for all of them except `/v1/error`, which is described below.

## Rules for the address

- A domain name, over HTTPS with TLS 1.2 or newer. Not an IP address, not a port number.
- Hosted in India.
- Reachable from the exchange's outbound addresses: allow `3.109.99.210`, `13.126.152.0` and `13.200.129.223` through the firewall.
- Answering within 30 seconds. Anything slower is treated as a failed delivery and retried.

## What arrives

A POST with a JSON body of two fields:

```json
{ "type": "JWEPayload", "payload": "eyJhbGciOiJSU0EtT0FFUC0yNTYi...." }
```

`type` is `JWEPayload` when there is a sealed bundle to open. It is `ProtocolResponse` when the recipient refused the message; then the body carries the `x-hcx-` fields in the clear, `x-hcx-status` set to `response.error`, and the reason in `x-hcx-error_details`:

```json
{
  "type": "ProtocolResponse",
  "x-hcx-sender_code": "1000003538@hcx",
  "x-hcx-recipient_code": "1000004446@hcx",
  "x-hcx-api_call_id": "…",
  "x-hcx-correlation_id": "11223344-5566-4788-99aa-bbccddeeff00",
  "x-hcx-workflow_id": "12",
  "x-hcx-timestamp": "…",
  "x-hcx-status": "response.error",
  "x-hcx-error_details": { "code": "…", "message": "…", "trace": "…" },
  "x-hcx-entity-type": "preauth"
}
```

`/v1/error` is the exception to the two shapes above. It carries no `payload` and no `x-hcx-` fields. What arrives is a plain JSON report of the request the exchange gave up on, with the rejection details. Its field names are not published, so do not parse it against a fixed schema. Store it whole, and answer it with `202` and the receipt like every other delivery. Fill in whatever identifiers the report happens to carry, and leave the rest of the receipt empty. Do not answer `/v1/error` with a `4xx` because the body is not a shape you recognise. Every delivery the exchange makes to you, on any of the paths listed above, is answered `202`.

The exchange signs its calls to you with a JWT: RS256 over its own private key, carrying the claims `jti`, `iss`, `sub` (the same value as `iss`), `iat` and `exp`. Validate the signature against the NHCX public key before trusting anything in the body.

**This is the one instruction in this documentation you cannot follow from it.** The API Security page gives the algorithm and the claims above, but no published source gives the NHCX public key or an address to fetch it from, and none names the header the token arrives in. Every integration built from these documents alone has therefore shipped with signature checking disabled, because the alternative, rejecting everything, makes the endpoint useless.

Do not leave that as an accident. Build the check, put the key in configuration, and treat a missing key as a deliberate, logged, temporary state rather than a silent default. Ask for the key during onboarding, at the same time you register your endpoint, and turn the check on the day you get it. Until then your callback address is an unauthenticated endpoint that accepts patient data. Keep it behind whatever else you have: an allow-list of the exchange's addresses, mutual TLS at your edge, a shared secret in a header the exchange agrees to send.

## Answer first, read second

The 30-second clock starts when the request lands. Do the minimum, send the receipt, and process afterwards.

The receipt is the same shape you received in the previous chapter, with the roles reversed:

```json
{
  "timestamp": "04/09/2026 11:46:41:305",
  "api_call_id": "<from the incoming header>",
  "correlation_id": "<from the incoming header>",
  "result": {
    "sender_code": "1000003538@hcx",
    "recipient_code": "1000004446@hcx",
    "entity_type": "preauth",
    "protocol_status": "request.queued"
  },
  "error": { "code": "", "message": "" }
}
```

HTTP status `202`. Not `200`, not an empty body. For a `JWEPayload` the header fields come from the decrypted protected header; for a `ProtocolResponse` they are already in the clear.

## Opening it

The mirror of sealing. Read the body, decide which of the two shapes it is, and for a `JWEPayload` unwrap the compact string with your own private key, the one behind the certificate on your participant record. The protected header comes out of the token in the clear; the bundle is the decrypted plaintext.

```text
body = json.decode(httpRequest.body)

if body.type == "ProtocolResponse":
    header = fields of body whose name starts with "x-hcx-"
    bundle = none
else:
    token = jose.decrypt(
        compact    = body.payload,
        privateKey = ourPrivateKey,             // PKCS8, the pair of the registered certificate
        algorithm  = "RSA-OAEP-256",
        encryption = "A256GCM"
    )
    header = token.protectedHeader
    bundle = json.decode(token.plaintext)

respond 202 with the receipt above
handle(header, bundle)
```

> [!WARNING]
> This is pseudo-code, not something to paste. Use the same JOSE library you sealed with; decrypting is the reverse call on the same object.

`openssl genpkey` wrote the private key in PKCS8 form, which is what every JOSE library loads directly. If decryption fails, the message was sealed with a certificate that is not the one on your participant record; go back to the update call and check what is registered.

## Then, in order

1. **Match the conversation.** `x-hcx-correlation_id` pairs this answer with the request you sent. Look it up. If you do not recognise it, log it and stop; do not act on it.
2. **Read the status.** `response.complete` is a final answer, `response.partial` an interim one, `response.error` a refusal.
3. **Read the workflow code.** It says what kind of answer this is: `21` a preauthorisation approved, `24` a query raised, and so on. The full table is in the Overview.
4. **Store the raw message** before doing anything with it. Disputes are settled on what was actually received.
5. **Act on the bundle**, if there is one. A `ClaimResponse` for a preauthorisation, a `CoverageEligibilityResponse` for an eligibility check, and so on.

Make the handler idempotent. The exchange retries on a missed receipt, so the same message can arrive twice; the `x-hcx-api_call_id` tells you it is the same one.

## Closing the loop

Send the empty bundle from the previous chapter to the dummy payer, then trigger its answer:

<!-- build-docs:api 13-adjudicator/dummy-payer-process-request.bru -->
```bash
curl --location --request POST 'https://apisbx.abdm.gov.in/pmjay/sbxhcx/dummyhcxpayer/process/request' \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --header 'bearer_auth: Bearer <access token>' \
  --data-raw '{
    "action": "Approve",
    "method": "Preauth",
    "correlationId": "<correlation id>"
  }'
```
<!-- build-docs:end -->

`action` is `Approve`, `Reject` or `Query`; `method` is `Preauth` or `Claim`. Your `/v1/preauth/on_submit` then receives the answer, either a sealed `ClaimResponse` or a `ProtocolResponse` carrying the refusal, with the correlation ID you sent. A `Query` action makes the dummy payer raise a communication request instead, which you answer on `/v1/communication/on_request` before the decision arrives.

Whichever comes back, that message proves the whole framework. Your token works, your participant record is live, the exchange can reach your address, the dummy payer could open your message, and you could read its reply. Nothing that follows changes any of it, only what goes in the bundle.

## Where next

- A **provider** goes to the B-series in the Overview's NHCX Use Cases chapter, starting with Check Coverage Eligibility, and to the sample bundles on the portal for a real Claim to put inside.
- A **payer** goes to the C-series, and hosts the `submit` and `check` endpoints this chapter described for the other side.
- Both should read JWE, Status and Errors in the Overview before writing a second use case; it is where the status words and the retry rules live.
