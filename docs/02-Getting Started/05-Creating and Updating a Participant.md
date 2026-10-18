# Creating and updating a participant

A participant record is your identity on the exchange. It holds your participant code, your role, your certificate and your callback address. You create it once, then update it whenever the certificate or the address changes.

The sandbox and production differ here. The sandbox is a single call each way. Production adds a one-time passcode to the registered mobile number at every step, so nobody can register a hospital they do not control. Both are shown.

## Sandbox: create

<!-- build-docs:api 11-onboarding-sandbox/participant-create.bru -->
```bash
curl --location --request POST 'https://apisbx.abdm.gov.in/pmjay/sbxhcx/participanthcxservice/participant/create' \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --header 'bearer_auth: Bearer <access token>' \
  --header 'source: internal' \
  --data-raw '{
    "linked_registry_codes": [
      "10001"
    ],
    "registryid": "<client id>",
    "participant_name": "Test Hospital",
    "scheme_code": "PMJAY",
    "state": "Haryana",
    "district": "Panchkula",
    "roles": [
      "10001"
    ],
    "primaryEmail": "integration@hospital.example",
    "phone": [
      "01123456789"
    ],
    "primaryMobile": "9876543210",
    "signing_cert_path": "",
    "encryption_cert": "<encryption cert>",
    "endpoint_url": "https://nhcx.hospital.example"
  }'
```
<!-- build-docs:end -->

Field by field:

| Field | What to put |
| :---- | :---- |
| `linked_registry_codes` | Which registry vouches for you. `10001` HFR, `10002` NIN, `10003` ROHINI, `10004` payer registry. |
| `registryid` | Your ID in the registry `linked_registry_codes` names: the HFR ID for a hospital, the IRDAI ID for a payer or TPA, the client ID for an end user application. The sandbox sample above fills in the ABDM client ID, which the sandbox accepts for testing when you hold no HFR ID yet; in production it must be the registry's ID. |
| `roles` | `10001` provider, `10002` payer, `10003` TPA. The full list is in the Overview. |
| `encryption_cert` | The base64 certificate from the previous chapter. |
| `signing_cert_path` | Optional. Leave empty. |

The response carries your new address:

```json
{ "participant_code": "1000004446@hcx" }
```

Keep it. It is `x-hcx-sender_code` on everything you send from now on. A hospital group creates one participant per facility, each with its own HFR ID, using the same credentials.

## Sandbox: update

The same shape, keyed on the participant code, used to change the certificate or the callback address:

<!-- build-docs:api 11-onboarding-sandbox/participant-update.bru -->
```bash
curl --location --request POST 'https://apisbx.abdm.gov.in/pmjay/sbxhcx/participanthcxservice/participant/update' \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --header 'bearer_auth: Bearer <access token>' \
  --data-raw '{
    "participant_code": "<participant code>",
    "participant_name": "Test Hospital",
    "scheme_code": "PMJAY",
    "roles": [
      "10001"
    ],
    "primaryEmail": "integration@hospital.example",
    "phone": [
      "01123456789"
    ],
    "primaryMobile": "9876543210",
    "endpoint_url": "https://nhcx.hospital.example",
    "signing_cert_path": "",
    "encryption_cert": "<encryption cert>"
  }'
```
<!-- build-docs:end -->

Two things the sandbox registry enforces that the field list does not say (observed 14 October 2026). It refuses a body that carries only the field being changed, with "Failed to update participant please check request", so send the record back whole in the shape above, `signing_cert_path` empty, with the change laid over it. And `encryption_cert` must be the Base64 of the PEM: a plain PEM is accepted, but the stored value no longer parses and every later `/fetch/certs` for the participant answers NHCX-1062 "Invalid encryption certificate" until it is sent again encoded.

`endpoint_url` is the base of your callback server, sometimes called the bridge URL. It can be set at creation as well as on update. The exchange appends the callback path to it: a preauthorisation decision arrives at `<endpoint_url>/v1/preauth/on_submit`. The rules for this address are in Receiving a Callback.

## Production: four steps

Base: `https://apisprod.nha.gov.in/pmjay/hcx/participanthcxservice`.

**1. Create.** `POST v2/participant/create`

```bash
curl --location --request POST 'https://apisprod.nha.gov.in/pmjay/hcx/participanthcxservice/v2/participant/create' \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --header 'bearer_auth: Bearer <access token>' \
  --data-raw '{
    "registrytype": "10001",
    "registryid": "XXXXX74586",
    "role": [
      "10001"
    ],
    "endpointurl": "https://nhcx.demohospital.example.in",
    "mobilenumber": "XXXX748348",
    "email": "sample@gmail.com"
  }'
```

The mobile number must match the one on your HFR record exactly, or for a payer the one NHA holds. The response gives `participantid` and a `transactionid`, and a passcode is sent to that mobile. The participant exists, in a pending state.

**2. Confirm.** `GET validate?transactionId=<id>&passcode=<code>`. Note the method: the two confirmation calls are GETs, not POSTs. The participant becomes active.

```bash
curl --location --request GET 'https://apisprod.nha.gov.in/pmjay/hcx/participanthcxservice/validate?transactionId=<transaction id>&passcode=<passcode>' \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --header 'bearer_auth: Bearer <access token>'
```

**3. Configure.** `POST v2/participant/update`

```bash
curl --location --request POST 'https://apisprod.nha.gov.in/pmjay/hcx/participanthcxservice/v2/participant/update' \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --header 'bearer_auth: Bearer <access token>' \
  --data-raw '{
    "participantcode": "XXXXX7583@hcx",
    "encryptioncert": "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0t...",
    "endpointurl": "https://nhcx.demotpa.example.in"
  }'
```

A second transaction ID and passcode arrive.

**4. Confirm again.** `GET update/validate?transactionId=<id>&passcode=<code>`. The certificate and address go live.

```bash
curl --location --request GET 'https://apisprod.nha.gov.in/pmjay/hcx/participanthcxservice/update/validate?transactionId=<transaction id>&passcode=<passcode>' \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --header 'bearer_auth: Bearer <access token>'
```

Passcodes and transaction IDs are valid for 24 hours. If one is lost, repeat that step; a new pair is issued.

## Replacing only the certificate

In production there is a shorter path that skips the passcode:

```bash
curl --location --request POST 'https://apisprod.nha.gov.in/pmjay/hcx/participanthcxservice/v2/update/cert' \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --header 'bearer_auth: Bearer <access token>' \
  --data-raw '{
    "participantId": "XXXX@hcx",
    "certificate": "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0t..."
  }'
```

Use it for the yearly rotation.

## Checking it worked

Fetch your own certificate back, using the Fetching a Recipient Certificate chapter's call with your own participant code. If what comes back matches what you registered, the record is live and other participants can seal messages for you.
