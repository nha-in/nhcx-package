# Environments and addresses

Every address this documentation uses, together with the live specifications
the portal publishes. Addresses are scattered through the chapters that need
them; this is where you check one.

## Base URLs

The base of every service, in both environments. Base URLs, in Getting
Started, explains how a path is appended to them and what is easy to get wrong.

<!-- build-docs:baseurls -->
| Service | Sandbox | Production |
| :---- | :---- | :---- |
| ABDM session token | `https://dev.abdm.gov.in` | `https://apis.abdm.gov.in`. ABDM's published production gateway. Confirm it in your onboarding letter. |
| NHCX exchange | `https://apisbx.abdm.gov.in/hcx` | Shared by NHA after sandbox exit. |
| Participant service | `https://apisbx.abdm.gov.in/pmjay/sbxhcx/participanthcxservice` | `https://apisprod.nha.gov.in/pmjay/hcx/participanthcxservice` |
| ABDM proxy | `https://apisbx.abdm.gov.in/pmjay/sbxhcx/abdmproxy` | Not published. Confirm at onboarding. |
| PMJAY payer service, role lookup | `https://apisbx.abdm.gov.in` | Not published. Confirm at onboarding. |
| PMJAY payer service, act on a case | `https://apisbeta.nha.gov.in` | Not published. Confirm at onboarding. |
| Dummy payer | `https://apisbx.abdm.gov.in/pmjay/sbxhcx/dummyhcxpayer` | A sandbox test hook only. |
| NHCX portal | `https://hcxsbx.abdm.gov.in` | Not published. |
| Face authentication page | `https://phrsbx.abdm.gov.in/face-auth` | Not published. |

What each one serves:

- **ABDM session token**: The session token every other call carries, at /api/hiecm/gateway/v3/sessions.
- **NHCX exchange**: Every use-case call under /v1, fingerprint and iris authentication under /abha.
- **Participant service**: Creating and updating a participant, the registry search, certificates and policies.
- **ABDM proxy**: Face authentication for PMJAY biometrics.
- **PMJAY payer service, role lookup**: The roles a PMJAY adjudicator user holds, at /pmjay/sbxhcx/nhcxpayerservice/v1/get/user-role.
- **PMJAY payer service, act on a case**: Acting on a PMJAY case, at /pmjay/hcx/nhcxpayerservice/wrapper/process/case.
- **Dummy payer**: The sandbox test hooks that make the dummy payer answer.
- **NHCX portal**: The portal, the live Swagger specifications it publishes, and notification subscribe.
- **Face authentication page**: The QR page a patient opens to complete face authentication, with ?txnId=<txnId>.

The ABDM gateway also reads `X-CM-ID` on the session call: `sbx` in the sandbox, `abdm` in production.
<!-- build-docs:end -->

## Full sandbox addresses

| What | Address |
| :---- | :---- |
| Session token | `https://dev.abdm.gov.in/api/hiecm/gateway/v3/sessions` |
| Use-case calls | `https://apisbx.abdm.gov.in/hcx/v1` |
| Dummy payer test hook | `https://apisbx.abdm.gov.in/pmjay/sbxhcx/dummyhcxpayer/process/request` |
| Dummy payer payment hook | `https://apisbx.abdm.gov.in/pmjay/sbxhcx/dummyhcxpayer/paymentNotice/init` |
| Biometric, fingerprint and iris | `https://apisbx.abdm.gov.in/hcx/abha/biometric/auth/{init,verify}` |
| Biometric, token refresh | `https://apisbx.abdm.gov.in/hcx/abha/biometric/auth/refresh/token` |
| Biometric, face | `https://apisbx.abdm.gov.in/pmjay/sbxhcx/abdmproxy/abha/biometric/` |
| Face auth QR page | `https://phrsbx.abdm.gov.in/face-auth?txnId=<txnId>` |
| PMJAY payer service, role lookup | `https://apisbx.abdm.gov.in/pmjay/sbxhcx/nhcxpayerservice/v1/get/user-role` |
| PMJAY payer service, act on a case | `https://apisbeta.nha.gov.in/pmjay/hcx/nhcxpayerservice/wrapper/process/case` |
| Notification subscribe | `https://hcxsbx.abdm.gov.in/v1/notification/subscribe` |
| The portal itself | `https://hcxsbx.abdm.gov.in` |

The production addresses NHA has not published follow, elsewhere, the pattern
of swapping the sandbox hostname, and the NHCX Adapter's own source says as
much in a comment, but that is an inference. Check every one against your
onboarding letter and make every one configurable. Going Live has the order
the switch happens in.

## Headers, by service

Which header carries the token is not uniform, and this is a common first-day
failure.

| Service | Token header | Other required headers |
| :---- | :---- | :---- |
| ABDM sessions | none | `REQUEST-ID`, `TIMESTAMP`, `X-CM-ID` |
| Participant service | `bearer_auth: Bearer <token>` | `Accept`, `Content-Type`, sometimes `X-CM-ID` |
| Use-case endpoints | `bearer_auth: Bearer <token>` | `Accept`, `Content-Type` |
| Biometric endpoints | `Authorization: Bearer <token>` | `process`, `payerid` |
| PMJAY payer service | `bearer_auth: Bearer <token>` | `Accept`, `Content-Type` |
| Notification service | `Authorization: Bearer <token>` | `Content-Type` |

The sources are not unanimous about `bearer_auth` against `Authorization` on
the exchange's own endpoints: the authentication note and the FAQ both write
the example as `Authorization`. Sending both headers with the same value is
what the adapter does and it costs nothing.

`Accept: application/json` is the portal's sixth most common mistake when
omitted.

## Firewall

The exchange calls your callback from three addresses. All three must be
allowed inbound.

```
3.109.99.210
13.126.152.0
13.200.129.223
```

Your callback address itself must be a domain name over HTTPS with TLS 1.2 or
newer, hosted in India, not an IP address and not carrying a port number.

## Live API specifications

The portal publishes a Swagger document per service. These are the
authoritative API surface and they cover three exchanges for which no sample
bundle exists anywhere, so they are the only concrete description of those
available.

| Service | Specification |
| :---- | :---- |
| Coverage eligibility | `https://hcxsbx.abdm.gov.in/coverageeligibilityhcxservice/swagger-ui-custom.html` |
| Preauthorisation | `https://hcxsbx.abdm.gov.in/preauthhcxservice/swagger-ui-custom.html` |
| Claim | `https://hcxsbx.abdm.gov.in/claimhcxservice/swagger-ui-custom.html` |
| Request additional attachments | `https://hcxsbx.abdm.gov.in/communicationhcxservice/swagger-ui-custom.html` |
| Payment | `https://hcxsbx.abdm.gov.in/servicehcxpayment/swagger-ui-custom.html` |
| Status check | `https://hcxsbx.abdm.gov.in/statushcxservice/swagger-ui-custom.html` |
| Reprocess, the Task service | `https://hcxsbx.abdm.gov.in/taskhcxservice/swagger-ui-custom.html` |
| Search | `https://hcxsbx.abdm.gov.in/searchhcxservice/swagger-ui-custom.html` |
| Insurance plan | `https://hcxsbx.abdm.gov.in/insuranceplanhcxservice/swagger-ui/index.html` |
| Communication | `https://hcxsbx.abdm.gov.in/communicationhcxservice/swagger-ui/index.html` |
| Participant | `https://hcxsbx.abdm.gov.in/participanthcxservice/swagger-ui/index.html` |
| Notifications | `https://hcxsbx.abdm.gov.in/subscriptionhcxservice/swagger-ui/index.html` |

The service names are worth noting on their own. Reprocess is served by
`taskhcxservice`, notifications by `subscriptionhcxservice`, payment by
`servicehcxpayment`. A name in a log will not always match the exchange you
think you are calling.

## The endpoint set

Every path in the V1 cashless use case, with its direction.

| Exchange | Action | Callback | Direction |
| :---- | :---- | :---- | :---- |
| Coverage eligibility | `/v1/coverageeligibility/check` | `/v1/coverageeligibility/on_check` | provider to payer |
| Insurance plan | `/v1/insuranceplan/request` | `/v1/insuranceplan/on_request` | provider to payer |
| Preauthorisation | `/v1/preauth/submit` | `/v1/preauth/on_submit` | provider to payer |
| Predetermination | `/v1/predetermination/submit` | `/v1/predetermination/on_submit` | provider to payer |
| Claim | `/v1/claim/submit` | `/v1/claim/on_submit` | provider to payer |
| Communication | `/v1/communication/request` | `/v1/communication/on_request` | payer to provider |
| Payment notice | `/v1/paymentnotice/request` | `/v1/paymentnotice/on_request` | payer to provider |
| Task: reprocess, cancel | `/v1/task/submit` | `/v1/task/on_submit` | provider to payer |
| Cross-payer search | `/v1/search/submit` | `/v1/search/on_submit` | NHA or regulator to payer |
| Own-case search | `/preauth/search`, `/claim/search`, `/paymentnotice/search` | the matching `on_search` | originator to payer |
| Status | `/v1/status` | `/v1/on_status` | either party to the exchange |
| Error report | | `/v1/error` | exchange to every participant |
| Notifications | `/v1/notification/subscribe` | `/v1/notification/on_subscribe` | patient app to exchange |

Predetermination is listed on the Technical Specifications page among the APIs
"designed and deployed in the sandbox environment", which is more than the FHIR
Reference chapter on it can say. No payer in the corpus is recorded as having
implemented it.

The status pair is named two ways. The Technical Specifications table gives
`/hcx/status` and `/NHCX/on_status`; the Postman collection uses
`/hcx/v1/status` and `/hcx/v1/on_status`. Build against the Postman form, which
is what the sandbox serves, and keep the path configurable.

## A defect in the published table

The FAQ's own base-URL table gives the payment notice address as
`https://apisbx.abdm.gov.inhcx/v1/paymentnotice/on_request`, with the slash
after the hostname missing. Anyone copying it will get a DNS failure rather
than an API error, which is a confusing first symptom. The address is
`https://apisbx.abdm.gov.in/hcx/v1/paymentnotice/on_request`.
