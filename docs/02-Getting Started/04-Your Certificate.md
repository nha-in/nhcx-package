# Your certificate

Every message on the exchange is sealed for the receiver. For anyone to send you anything, you need a key pair: a private half you keep, and a public half, wrapped in a certificate, that you publish through your participant record.

## Making the key pair

Three commands, on a machine you control.

```bash
# 1. A 2048-bit RSA private key
openssl genpkey -algorithm RSA -out private.key -pkeyopt rsa_keygen_bits:2048

# 2. A signing request. It will ask for country, state, organisation and so on.
openssl req -new -key private.key -out request.csr

# 3. A self-signed X.509 certificate, valid for a year
openssl x509 -req -in request.csr -signkey private.key -out certificate.crt -days 365
```

`private.key` is the secret. It opens every letter addressed to you. It never leaves your server and it is never sent to NHCX.

`certificate.crt` is public. It is what other participants use to seal messages for you.

## Encoding it for registration

The participant service takes the certificate as a single base64 string, not as a file.

```bash
base64 -w 0 certificate.crt > certificate.b64      # Linux
base64 -i certificate.crt -o certificate.b64       # macOS
```

The contents of `certificate.b64` go into the `encryption_cert` field in the next chapter. It will start with `LS0tLS1CRUdJTi`, which is `-----BEGIN` in base64.

## Keeping it

- Store `private.key` where your callback service can read it and nothing else can.
- Note the expiry. A year from now the certificate lapses and every sender's encryption for you fails.
- NHA recommends replacing the key once a year. Replacing it is a certificate update on the participant record, covered next; there is no passcode step for a certificate-only change.
- If the private key may have leaked, generate a new pair, update the record, and tell NHA.

## A note on what you will see from others

When you fetch another participant's certificate later, you may get back a full X.509 certificate or, for some participants, a bare public key in SPKI form. Your code should try the certificate first and fall back to the key. The portal's Java sample loads the certificate with `CertificateFactory` and takes `getPublicKey()` from it; the Python equivalent is in Building and Sending a JWE.
