# Fetching a recipient certificate

Before you can seal a message for anyone, you need their public key. The participant service hands it out against a participant code.

## The call

<!-- build-docs:api 10-registry/fetch-certs.bru -->
```bash
curl --location --request POST 'https://apisbx.abdm.gov.in/pmjay/sbxhcx/participanthcxservice/fetch/certs' \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --header 'bearer_auth: Bearer <access token>' \
  --data-raw '{
    "participantid": "1518@hcx"
  }'
```
<!-- build-docs:end -->

That participant code, `1518@hcx`, is the PMJAY payer the Bruno request is written for. The sandbox dummy payer is `1000003538@hcx`, and for the smoke test at the end of this section it is the recipient.

## What comes back

Key material in PEM text. None of the source documents gives the JSON envelope it arrives in, only the material itself, so inspect one response before writing the parser. Usually a full X.509 certificate:

```
-----BEGIN CERTIFICATE-----
MIID0zCCArugAwIBAgIUax...
-----END CERTIFICATE-----
```

Sometimes, for a participant who registered a bare key, an SPKI public key:

```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEF...
-----END PUBLIC KEY-----
```

Handle both. Try to load it as a certificate and take the public key out of it; if that fails, load it as a public key directly. The handbook's rule of thumb is that anything under about 400 bytes is a bare key.

## Cache it

Keys change rarely. Fetching one before every message is a round trip that buys nothing, and the portal's own code sample says to store certificates locally rather than call this endpoint repeatedly. Cache by participant code for 24 hours, and refresh early if a decryption on the other side starts failing, which is the sign that they rotated.

## Whose certificate

The participant code to fetch is the `processingid` from the policy lookup in the previous chapter, not the insurer's `payerid`. For the smoke test it is the dummy payer's code, `1000003538@hcx`.
