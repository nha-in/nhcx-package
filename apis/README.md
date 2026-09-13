# NHCX API Collection (Bruno)

Comprehensive, production-ready Bruno collection containing all **82 API operations** across the National Health Claims Exchange (NHCX), ABDM Gateway, Participant Registry, and PMJAY Adjudicator services.

This collection includes **both** sides of every exchange:
1. **Outbound Requests & Inbound Callbacks**: Every asynchronous exchange is represented with both the triggering request (`/check`, `/submit`, `/request`) and its corresponding callback (`/on_check`, `/on_submit`, `/on_request`).
2. **External Gateway & Internal Handlers**: Covers external NHCX endpoints (`/v1/...`) and internal routing endpoints (`/internal/v1/...`).
3. **Payer & Provider Roles**: Complete coverage for both hospital provider desk workflows and payer/adjudication desk processing.

---

## 1. Quick Start with Bruno

1. Download and install [Bruno](https://www.usebruno.com/).
2. Open Bruno, choose **Open Collection**, and select this directory: `package/apis`.
3. In the top-right environment selector, pick **sandbox**.
4. Configure your credentials in `environments/sandbox.bru`:
   - `clientId`: Your ABDM Milestone 1 / NHCX Client ID
   - `clientSecret`: Your Client Secret
   - `token`: Automatically populated by the session endpoint
5. Run **01-session > Session token** once.
   - The embedded post-response script automatically saves the token to the `token` variable.
   - All other requests in the collection automatically pass it as `Authorization: Bearer {{token}}` and `bearer_auth: Bearer {{token}}`.

---

## 2. Environment Variables (`environments/sandbox.bru`)

| Variable | Default Host / Value | Purpose |
| :--- | :--- | :--- |
| `nhcxBase` | `https://apisbx.abdm.gov.in/hcx` | NHCX Exchange Core Operations |
| `registryBase` | `https://apisbx.abdm.gov.in/pmjay/sbxhcx/participanthcxservice` | Participant Registry, Certificates, Policies |
| `sessionsUrl` | `https://dev.abdm.gov.in/api/hiecm/gateway/v3/sessions` | ABDM Gateway Auth Token Minting |
| `adjudicatorRoleUrl` | `https://apisbx.abdm.gov.in/pmjay/sbxhcx/nhcxpayerservice/v1/get/user-role` | PMJAY sandbox adjudicator, role lookup |
| `adjudicatorProcessUrl` | `https://apisbeta.nha.gov.in/pmjay/hcx/nhcxpayerservice/wrapper/process/case` | PMJAY adjudicator, act on a case |
| `dummyPayerBase` | `https://apisbx.abdm.gov.in/pmjay/sbxhcx/dummyhcxpayer` | Sandbox dummy payer test hooks |
| `abdmProxyBase` | `https://apisbx.abdm.gov.in/pmjay/sbxhcx/abdmproxy` | ABDM proxy for face authentication |
| `clientId` | `your-client-id` | Gateway Client ID |
| `clientSecret` | `your-client-secret` | Gateway Client Secret |

---

## 3. Directory & API Overview

| Folder | Endpoints Included | Description |
| :--- | :--- | :--- |
| `01-session/` | `POST /sessions` | Mints ABDM bearer token using M1 client ID and secret. |
| `02-eligibility/` | `/v1/coverageeligibility/check`, `/on_check`, plus `/internal/v1/...` | Verifies insurance coverage in force, wallet balance, and authorization requirements. |
| `03-preauth/` | `/v1/preauth/submit`, `/on_submit`, plus `/internal/v1/...` | Cashless pre-authorisation submission, enhancements, queries, and adjudication callbacks. |
| `04-predetermination/`| `/v1/predetermination/submit`, `/on_submit` | Cost and coverage estimates prior to formal admission. |
| `05-claim/` | `/v1/claim/submit`, `/on_submit`, plus `/internal/v1/...` | Final discharge claim submission, dispute/settlement responses, query handling. |
| `06-payment-notice/` | `/v1/paymentnotice/request`, `/on_request`, plus `/internal/v1/...` | Settlement advice, bank UTR remittance, TDS/deductions, provider acknowledgment. |
| `07-communication/` | `/v1/communication/request`, `/on_request`, plus `/internal/v1/...` | Query requests, clinical documentation requests, TAT alerts, beneficiary communications. |
| `08-status/` | `/v1/status`, `/v1/search/submit`, `/on_submit` | Request dispatch status tracking and audit/investigation search. |
| `09-insurance-plan/` | `/v1/insuranceplan/request`, `/on_request`, plus `/internal/v1/...` | Empanelled packages, tariff master, STG questionnaires, co-pay rules. |
| `10-registry/` | Participant search, certs (`/fetch/certs`), policy lookup (`/participant/get/policies`), etc. | Participant registry lookup, receiver encryption certificates, policy binding. |
| `11-onboarding/` | Participant registration, KYC, endpoints, update APIs | Onboarding new payers, providers, and TPAs onto NHCX. |
| `12-adjudicator/` | Dummy payer process hooks (`/process/request`, `/paymentNotice/init`) | Direct simulation hooks for sandbox testing. |
| `13-other/` | Notifications (`/v1/notification/subscribe`), errors (`/v1/error`), ping/health | Webhooks, error handling, system health checks. |
| `14-biometric/` | ABHA biometric `auth/init`, `auth/verify`, `auth/refresh/token`, face auth `faceauth/init`, `capture/pid`, `v2/auth/verify` | Beneficiary authentication before a PMJAY pre-authorisation or claim; the user token rides on the exchange calls. |

---

## 4. Message Envelopes & JWE

All operations on `/v1/...` transfer encrypted HL7 FHIR R4 bundles packaged in a JSON Web Encryption (JWE) compact serialization envelope. In this Bruno collection:
- Headers prefixed with `x-hcx-*` mirror the JWE protected header on the wire.
- The request body provides the JSON structure containing payload placeholders or encrypted ciphertext.
- To generate and encrypt payloads directly from structured forms, see the FHIR bundles in `../fhir/` and mapping definitions in `../mappings/`.
