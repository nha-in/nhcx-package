# Building and sending a JWE

A message on the exchange is a JSON Web Encryption token: a readable protected header and an encrypted body, serialised as five base64url parts joined by dots. The body is a FHIR bundle. This chapter builds one with an empty bundle, so that what you are testing is the envelope and the plumbing, not the FHIR.

## The protected header

Every field the exchange needs to route and log the message. All the `x-hcx-` names are fixed.

```json
{
  "alg": "RSA-OAEP-256",
  "enc": "A256GCM",
  "x-hcx-sender_code": "1000004446@hcx",
  "x-hcx-recipient_code": "1000003538@hcx",
  "x-hcx-api_call_id": "a1b2c3d4-e5f6-4890-abcd-ef1234567890",
  "x-hcx-request_id": "f0e1d2c3-b4a5-4978-8fed-cba987654321",
  "x-hcx-correlation_id": "11223344-5566-4788-99aa-bbccddeeff00",
  "x-hcx-workflow_id": "12",
  "x-hcx-timestamp": "2026-09-04T11:46:34+05:30",
  "x-hcx-status": "request.initiated",
  "x-hcx-ben-abha-id": "91-1234-5678-1234"
}
```

- `alg` and `enc` are the encryption. The protocol page says `RSA-OAEP`; the handbook, the code samples and every Postman body on the portal say `RSA-OAEP-256`. Use `-256`.
- The three IDs are fresh UUIDs. `api_call_id` is new per call, `request_id` per request, `correlation_id` per conversation and reused on the answer.
- `workflow_id` says which step this is. `12` is a new preauthorisation.
- `timestamp` is ISO 8601. Which zone is contested: the handbook says Indian time and that UTC will fail validation, the FAQ says UTC with a trailing `Z`. The sample bundles use `+05:30`, and the reference adapter sends Indian time with the offset written without a colon, `+0530`. Confirm before building; it is a validated field.
- `status` is always `request.initiated` on something you initiate.
- `ben-abha-id` is the beneficiary's ABHA number, hyphenated as `XX-XXXX-XXXX-XXXX`; any other form is refused with `NHCX-1018`. The policy lookup takes the same number without hyphens.

## The smallest possible bundle

```json
{
  "resourceType": "Bundle",
  "id": "smoke-test-001",
  "type": "collection",
  "timestamp": "2026-09-04T11:46:34+05:30",
  "entry": []
}
```

This is a valid FHIR Bundle with nothing in it. The exchange will accept it, because it only reads the header. The dummy payer will reject it, because there is no Claim inside. That rejection is what the next chapter catches.

## Sealing it

The recipe, from the message-security page. Base64url the header, generate a random content key, and encrypt that key with the recipient's public key using RSA-OAEP. Generate an IV, encrypt the bundle with AES-256-GCM using the header as additional authenticated data, and join the five parts. A JOSE library does all of it.

```js
bundle = json.encode(fhirBundle)

header = {
    "alg": "RSA-OAEP-256",
    "enc": "A256GCM",
    "x-hcx-sender_code":    sender,
    "x-hcx-recipient_code": recipient,
    "x-hcx-api_call_id":    randomUUID(),
    "x-hcx-request_id":     randomUUID(),
    "x-hcx-correlation_id": correlationId,
    "x-hcx-workflow_id":    workflowId,
    "x-hcx-timestamp":      currentISTTimestamp(),
    "x-hcx-status":         "request.initiated",
    "x-hcx-ben-abha-id":    abhaId
}

jwe = jose.encrypt(
    plaintext       = bundle,
    recipientKey    = recipientPublicKey,       // from the certificate fetched in the previous chapter
    protectedHeader = header,
    algorithm       = "RSA-OAEP-256",
    encryption      = "A256GCM"
)

body = { "payload": jwe }
```

> [!WARNING]
> This is pseudo-code, not something to paste. Use your language's JOSE library: `jose` on Node, `jwcrypto` on Python, Nimbus on Java, `System.IdentityModel.Tokens.Jwt` or `jose-jwt` on .NET.

The result is one long string with four dots in it. That is the whole message.
Java users can take the portal's `JWEPayloadUtil` sample as-is; it does the same thing with Nimbus, `JWEAlgorithm.RSA_OAEP_256` and `EncryptionMethod.A256GCM`, passing the `x-hcx-` fields as custom header parameters.

## Sending it

The request body is a JSON object with one field. The `x-hcx-` fields are not HTTP headers: they travel inside the JWE's protected header, sealed above. The only headers on the wire are the token and the content types. The Bruno request below repeats the `x-hcx-` values as HTTP headers as well; the reference adapter does not send them, and the protected header is where the exchange reads them.

<!-- build-docs:api 03-preauth/v1-preauth-submit.bru -->
```bash
curl --location --request POST 'https://apisbx.abdm.gov.in/hcx/v1/preauth/submit' \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --header 'bearer_auth: Bearer <access token>' \
  --header 'x-hcx-sender_code: 1000004446@hcx' \
  --header 'x-hcx-recipient_code: 1518@hcx' \
  --header 'x-hcx-api_call_id: <uuid>' \
  --header 'x-hcx-request_id: <uuid>' \
  --header 'x-hcx-correlation_id: <uuid>' \
  --header 'x-hcx-workflow_id: 12' \
  --header 'x-hcx-timestamp: <iso timestamp>' \
  --header 'x-hcx-status: request.initiated' \
  --header 'x-hcx-ben-abha-id: 91-7112-3456-7890' \
  --header 'x-hcx-use_case: New' \
  --data-raw '{
    "payload": "eyJhbGciOiJSU0EtT0FFUC0yNTYiLCJlbmMiOiJBMjU2R0NNIiwieC1oY3gtc2VuZGVyX2NvZGUiOi4uLn0.encrypted_key.iv.ciphertext.tag"
  }'
```
<!-- build-docs:end -->

## What comes straight back

`202 Accepted`. The receipt below is the shape the sources define for a *recipient* acknowledging a delivery, which is what your own callback must return in the next chapter. Treat it as the pattern rather than a guaranteed gateway body, and inspect a real response:

```json
{
  "timestamp": "04/09/2026 11:46:35:120",
  "api_call_id": "a1b2c3d4-e5f6-4890-abcd-ef1234567890",
  "correlation_id": "11223344-5566-4788-99aa-bbccddeeff00",
  "result": {
    "sender_code": "1000004446@hcx",
    "recipient_code": "1000003538@hcx",
    "entity_type": "preauth",
    "protocol_status": "request.queued"
  },
  "error": { "code": "", "message": "" }
}
```

This is not the decision. It says the envelope was valid and the message has been queued for the recipient. The decision, or in this case the rejection, comes later, on your callback.

If instead you get `400`, the envelope failed validation. If you get `401`, go back to the token chapter. Anything else about the bundle itself will not show up here at all; the exchange never opens it.
