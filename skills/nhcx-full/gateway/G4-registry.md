# G4. Registry and Certificates

#### G4E. ENTRY

In-process, on the ABDM client of one profile (`identity_for(code).client`, G2):

| Call | Returns |
|---|---|
| `client.certificate(code)` | recipient public key and certificate PEM, from the cache when fresh |
| `client.fetch_certificate(code)` | the same, always from the registry, refreshing the cache |
| `client.forget_certificate(code)` | nothing; drops one cache entry |
| `client.own_key()` | this profile's own public key, or none |
| `client.fetch_participant(code)` | the participant's registry record |
| `client.fetch_participants(role, entity_type, from_date, to_date)` | every participant of one role listed in a registration window, narrowed to government or private; the rows of the participant master [D32. participant](../database/D32-participant.md) |
| `client.post_registry(path, body)` | status and raw body of any other registry call |
| `client.update_participant(fields, roles = none)` | the registry's answer to `participant/update` for this profile's own record: the record is fetched first and sent back in the registry's sample shape (name, email, mobile, an empty `signing_cert_path`, the endpoint, the roles, `scheme_code`) with `fields` laid over it, because the sandbox refuses a body carrying only the changed field [SANDBOX](../references/PAYERS.md#markers). An `encryption_cert` field is sent base64-encoded (a raw PEM is accepted but then breaks `/fetch/certs`, NHCX-1062 [SANDBOX](../references/PAYERS.md#markers)). Used only by [S19. NHCX Settings](../screens/S19-nhcx-settings.md): registering the `endpoint_url` and publishing a staged certificate ([G2. Configuration and Participants](G2-configuration.md) `rotate_key`). A non-2xx answer fails `PARTICIPANT_UPDATE_HTTP_<status>` "participant registry refused the update of <field names>" (with the registry's reason when it gives one); a success drops the cached certificate |

HTTP routes the gateway calls, all `POST` with the session token (G3 `post_with_token`), base `urls.participant`:

| Call | URL | Body |
|---|---|---|
| certificate | `<urls.participant>/fetch/certs` | `{"participantid": "<code>@hcx"}` |
| record | `<urls.participant>/participant/search` | `{"participant_code": c, "participantcode": c, "participantid": c}` (all three spellings [REF](../references/PAYERS.md#markers)) |
| list | `<urls.participant>/fetch/participants/list` | `{"role": "PAYER" \| "PROVIDER" \| "TPA", "fromdate": "dd/MM/yyyy", "todate": "dd/MM/yyyy", "entitytype": "Gov" \| "Pvt"}` |
| update | `<urls.participant>/participant/update` | this profile's record with the changed fields laid over it |
| other | `<urls.participant>/<path>` | the caller's body, unchanged |

Sandbox base: `https://apisbx.abdm.gov.in/pmjay/sbxhcx/participanthcxservice`. Production base: `https://apisprod.nha.gov.in/pmjay/hcx/participanthcxservice` ([G2. Configuration and Participants](G2-configuration.md), [CORE.md](../references/CORE.md) section 1).

#### G4D. DESCRIPTION

NHCX messages are encrypted to the recipient's registered encryption certificate, so every send needs the recipient's public key. The registry is also where a participant's record (name, status, `endpoint_url`, roles) and the beneficiary policy calls live.

**Certificate cache.** One in-memory cache shared by every profile, since a certificate describes the counterparty, not us. Keyed by the lowercased code with `@hcx`. An entry lives `certs.cacheHours` (24) [REF](../references/PAYERS.md#markers). `certificate` answers from the cache while the entry is unexpired, else calls `fetch_certificate`. Reads take a shared lock and writes an exclusive one; two concurrent misses for the same code both go to the registry, and the last one written wins. Nothing is persisted. Failures are never cached: in particular the registry answers participants without a certificate with the text "Invalid Certificate Found" in place of a PEM, which fails to parse and is reported as `CERT_NOT_FOUND` every time [SANDBOX](../references/PAYERS.md#markers).

**Self-key guard.** When the registry hands back one of this gateway's own public keys (`owns_key`, G2) for a code the gateway does not hold itself, a payload encrypted with it could only be opened here, not at the recipient. With `certs.refuseSelfKey` true (the production default) that is `SELF_ENCRYPTION_KEY` and nothing is cached. In sandbox (default false) it is logged as a warning and used, because sandbox participants are often onboarded under one credential and really do share a certificate [SANDBOX](../references/PAYERS.md#markers). A code the gateway holds itself (a participant sending to itself, or one hosted participant writing to another) is never refused.

**Which client asks.** A send fetches the recipient's certificate with the sender's client (G7), so the sender's token is used. The startup checks (G11) use each profile's own client for its own code. `post_registry` for policies uses the default participant's client (G10).

**`forget_certificate`** drops a stale entry so the next `certificate` goes to the registry. Use it when a recipient has rotated its certificate and a send fails at their end; otherwise the old key is used until the entry expires.

**`own_key`** is the public half of the profile's private key; the startup check (G11) compares it with what `fetch_certificate` returns for our own code.

**`fetch_participant`** accepts either answer shape: the record itself, or `{"participants": [...]}`, in which case the entry whose code matches is used, else the first entry.

**`fetch_participants`** (nha:A1) is the participant list behind the participant master ([D32. participant](../database/D32-participant.md)). The registry has no name search: it lists one role at a time for a registration window, dates `dd/MM/yyyy` only (any other format is a 400 or an empty list), and `entitytype` `Gov` narrows to government schemes and `Pvt` to private participants; **sent without an entity type it answers the private list only** [SANDBOX](../references/PAYERS.md#markers), so the master is filled with two calls per role. The window is the caller's; the participant master ([D32. participant](../database/D32-participant.md)) passes `participant.windowYears` back from today, 1 by default and 10 in the sandbox, whose test payers were registered years ago [SANDBOX](../references/PAYERS.md#markers). The answer arrives as `{"participantdetails": [...]}`, `{"participants": [...]}` or a bare array, each row `participantcode`, `participantname`, `address`, `state` (no status, endpoint or roles: those come per code from `fetch_participant`). Rows without a code are dropped and codes are normalised. In the sandbox the payer list holds 49 government and 201 private payers, the provider list over 12,000 rows [SANDBOX](../references/PAYERS.md#markers); the call is a read, repeated safely, and is made by the default participant's client on a schedule, not per search.

**`post_registry`** exists for registry calls the gateway does not model (policy search and the ABHA link calls, G10). It adds the token handling, the refresh on 401 and the timeout, and interprets nothing: the caller gets the status and body as the registry sent them. Registry error bodies look like `{"error": {"code": "NHCX-1016", "message": "..."}}` or carry a top-level `message`.

#### G4Q. INPUT

| Field | Default | Notes |
|---|---|---|
| `code` | required | participant code, with or without `@hcx`; normalised (G5) |
| `path` | required for `post_registry` | registry path, leading slash optional, for example `participant/get/policies` |
| `body` | required for `post_registry` | JSON value |
| `urls.participant` | env default (G2) | registry base |
| `certs.cacheHours` | `24` | cache lifetime |
| `certs.refuseSelfKey` | true in production, false in sandbox | self-key guard |
| `outboundTimeoutSeconds` | `30` | per call |

#### G4S. OUTPUT

`certificate` and `fetch_certificate` return `(public key, PEM string)`. The PEM is whatever the registry sent (it may be base64 of a PEM, see G6 key parsing).

`fetch_participant` returns:

| Field | Taken from (first non-blank) |
|---|---|
| `code` | `participant_code`, `participantcode`, `participantid`; normalised with `@hcx` |
| `name` | `participant_name`, `participantname`, `name` |
| `status` | `status` |
| `endpointUrl` | `endpoint_url`, `endpointurl`, `endpointUrl` |
| `roles` | the string items of `roles`, else of `role_code` |
| `raw` | the whole record |

`post_registry` returns `(status, raw body)`.

Errors (shape in G3S):

| Code | Message | Retryable |
|---|---|---|
| `NO_RECIPIENT` | `participant code is empty` | no |
| `CERT_FETCH_HTTP_<status>` | `participant registry refused the certificate lookup for <code>` | when status >= 500 or 429 |
| `CERT_FETCH_BAD_JSON` | `registry response is not JSON` | yes |
| `CERT_NOT_FOUND` | `registry returned no encryption certificate for <code>` | no |
| `CERT_NOT_FOUND` | `registry returned no usable certificate for <code>: "<first 120 characters of what it sent>"` | no |
| `SELF_ENCRYPTION_KEY` | `registry certificate for <code> is this adapter's own key; a payload encrypted with it would be unreadable at the far end` | no |
| `PARTICIPANT_HTTP_<status>` | `participant registry refused the search for <code>` | when status >= 500 or 429 |
| `PARTICIPANT_BAD_JSON` | `registry response is not JSON` | no |
| `PARTICIPANT_NOT_FOUND` | `registry has no record for <code>` | no |
| `PARTICIPANT_ROLE` | `unknown participant role '<role>'` | no |
| `PARTICIPANT_HTTP_<status>` | `participant registry refused the <role> list` | when status >= 500 or 429 |
| `CERT_FETCH_UNREACHABLE`, `CERT_FETCH_READ_ERROR`, `CERT_FETCH_REQUEST`, `MARSHAL_ERROR`, `TOKEN_*` | from `post_with_token` (G3). The `CERT_FETCH_` prefix is used for every registry call, including the participant search and `post_registry` [REF](../references/PAYERS.md#markers) | see G3 |

Upstream status and the clipped upstream body travel with the `_HTTP_` and `_BAD_JSON` errors. A send that fails with one of these reports it to the application as is (G7).

#### G4P. PSEUDOCODE

```text
client.certificate(code):
  code = normalize_code(code)                                   # G5
  if code == "": fail NO_RECIPIENT "participant code is empty"
  read-lock; entry = certs[lower(code)]; unlock
  if entry and now < entry.expires: return entry.key, entry.pem
  return client.fetch_certificate(code)

client.fetch_certificate(code):
  code = normalize_code(code)
  if code == "": fail NO_RECIPIENT
  (status, raw) = post_with_token(client, urls.participant + "/fetch/certs",
                                  {participantid: code}, "CERT_FETCH")                  # G3
  if status not 2xx: fail CERT_FETCH_HTTP_<status> (status, clipped raw)
  out = parse JSON object or fail CERT_FETCH_BAD_JSON
  pem = first non-blank trimmed string of out.encryption_cert, out.encryptionCert, out.cert
  if pem == "": fail CERT_NOT_FOUND "registry returned no encryption certificate for <code>"
  pub = parse_public_key(pem)                                   # G6
        or fail CERT_NOT_FOUND "registry returned no usable certificate for <code>: <quoted first 120 chars>"
  if profiles.owns_key(pub) and not profiles.is_local(code):                      # G2
      if refuses_self_key(): fail SELF_ENCRYPTION_KEY           # certs.refuseSelfKey, else env == production
      log warning "registry certificate is this adapter's own key" (participant = code)
  write-lock; certs[lower(code)] = {pem, key: pub, expires: now + cacheHours}; unlock
  log "certificate fetched"
  return pub, pem

client.forget_certificate(code):
  write-lock; delete certs[lower(normalize_code(code))]; unlock

client.own_key():
  return client.profile ? public half of client.profile.key : none

client.fetch_participant(code):
  code = normalize_code(code)
  (status, raw) = post_with_token(client, urls.participant + "/participant/search",
                     {participant_code: code, participantcode: code, participantid: code}, "CERT_FETCH")
  if status not 2xx: fail PARTICIPANT_HTTP_<status>
  out = parse JSON object or fail PARTICIPANT_BAD_JSON
  rec = out
  if out.participants is a list:
      rec = first item whose code (participant_code | participantcode | participantid) is same_code as code  # G5
      if none and list not empty: rec = first item
  if rec is none or rec has no code: fail PARTICIPANT_NOT_FOUND
  roles = string items of rec.roles; if none, string items of rec.role_code
  return {code: normalize_code(rec code), name, status, endpointUrl, roles, raw: rec}

client.post_registry(path, body):
  endpoint = trimRight(urls.participant, "/") + "/" + trimLeft(path, "/")
  return post_with_token(client, endpoint, body, "CERT_FETCH")       # status and raw, uninterpreted
```

#### G4U. USED BY
- Screens: [S2. Select Policy](../screens/S2-select-policy.md), [S19. NHCX Settings](../screens/S19-nhcx-settings.md)
- APIs: [A1. Policy Search](../apis/A1-policy-search.md)
- FHIR: [F17. Organization](../fhir/F17-organization.md)
- Database: [D9. claim](../database/D9-claim.md), [D32. participant](../database/D32-participant.md)
- Gateway: [G1. Embedding](G1-embedding.md), [G2. Configuration and Participants](G2-configuration.md), [G3. Session Token](G3-session-token.md), [G6. Encryption](G6-encryption.md), [G7. Send](G7-send.md), [G11. Startup Checks and Health](G11-startup-checks.md)
