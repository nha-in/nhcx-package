# NHCX API Collection (Bruno)

Comprehensive, production-ready Bruno collection containing **83 requests** across the National Health Claims Exchange (NHCX), ABDM Gateway, Participant Registry, and PMJAY Adjudicator services.

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
   - `clientId`: Your ABDM sandbox client ID
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
| `portalBase` | `https://hcxsbx.abdm.gov.in` | NHCX portal, notification subscribe |
| `cmId` | `sbx` | `X-CM-ID` on the session call |
| `clientId` | empty, fill in | Gateway Client ID |
| `clientSecret` | empty, fill in | Gateway Client Secret |
| `correlationId` | empty | The request's correlation ID, echoed on every `on_` callback |
| `originalApiCallId` | empty | The `api_call_id` of the message a `/v1/status` call asks about |

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
| `10-registry/` | Participant search, certs (`/fetch/certs`), policy lookup (`/participant/get/policies`), etc. | Participant registry lookup, receiver encryption certificates, policy binding. Creating and updating a participant are in the two onboarding folders. |
| `11-onboarding-sandbox/` | `/participant/create`, `/participant/update` | Onboarding on the sandbox: one call to create a participant and one to update it, no passcode. |
| `12-onboarding-production/` | `/v2/participant/create`, `/validate`, `/v2/participant/update`, `/update/validate`, `/v2/update/cert` | Onboarding in production: the four passcode-confirmed steps, and the certificate-only shortcut. |
| `13-adjudicator/` | PMJAY payer service (`/v1/get/user-role`, `/wrapper/process/case`), dummy payer hooks (`/process/request`, `/paymentNotice/init`), `/update/abhanumber` | Acting on a PMJAY case as the adjudicator, sandbox simulation hooks, and replacing a placeholder ABHA number. |
| `14-other/` | Task (`/v1/task/submit`, `/on_submit`, plus `/internal/v1/...`), `/v1/error`, `/v1/on_status`, `/v1/delete`, notifications (`/v1/notification/subscribe`, `/on_subscribe`), Swagger documents | Cancel (PC01), reprocess and balance release (36), status enquiry (workflow 1), error reports, troubleshooting, notification subscription and the service's own API documents. |
| `15-biometric/` | ABHA biometric `auth/init`, `auth/verify`, `auth/refresh/token`, face auth `faceauth/init`, `capture/pid`, `v2/auth/verify` | Beneficiary authentication before a PMJAY pre-authorisation or claim; the user token rides on the exchange calls. |

---

## 4. Message Envelopes & JWE

All operations on `/v1/...` transfer encrypted HL7 FHIR R4 bundles packaged in a JSON Web Encryption (JWE) compact serialization envelope. In this Bruno collection:
- Headers prefixed with `x-hcx-*` mirror the JWE protected header on the wire.
- The request body provides the JSON structure containing payload placeholders or encrypted ciphertext.
- To generate and encrypt payloads directly from structured forms, see the FHIR bundles in `../fhir/` and mapping definitions in `../mappings/`.
