# NHCX Sample FHIR Bundles

This directory holds HL7 FHIR R4 sample bundles organized by **NHCX Use Case**, some captured from sandbox exchanges and some written to the specification:

- **B-Series (Provider Generic Network)**: `B1` to `B9`
- **C-Series (Payer Adjudication & Callbacks)**: `C3` to `C11`
- **D-Series (PMJAY Scheme Provider Operations)**: `D1` to `D13`

Every bundle is a FHIR R4 `Bundle` of type `collection`. `system/validate-bundles.mjs` checks their structure, references and totals. They are not all conformant to the NRCeS NDHM profiles: the captures keep what each payer actually sent, including codes outside the NRCeS code systems, such as `ODN`, `additionalinfo` and `UTR`, and PMJAY's own systems and displays.

---

## Directory Index

| Use Case | Category | Operations / Scenarios | Key Resources | Samples |
| :--- | :--- | :--- | :--- | :--- |
| **B1** | Coverage Eligibility | Validation, Discovery, Benefits, Auth Requirements | `CoverageEligibilityRequest`, `Patient`, `Coverage` | `B1-check.json`, `discovery.json`, `validation.json`, `benefits.json`, `auth-requirements.json` |
| **B2** | Insurance Plan | Package master query (poll) | `Task` | `B2-request.json`, `insurance-plan-request.json` |
| **B3** | Pre-authorisation | Initial request (wf12), Enhancement (wf13), Query reply (wf19), Cancellation | `Claim` (preauthorization), `Condition`, `Procedure` | `B3-request.json`, `B3-enhancement.json`, `preauth-request.json`, `preauth-enhancement.json`, `preauth-queryupdate.json`, `preauth-cancel.json` |
| **B4** | Communication | Query answer with attachments (wf24, wf27), acknowledgement; the payer's request it answers | `Task`, `Communication` | `B4-preauth-query-answer.json`, `B4-claim-query-answer.json`, `communication-request.json`, `communication-response.json`, `communication-acknowledgement.json` |
| **B5** | Claim Submission | Discharge claim (wf15), Query reply (PMJAY wf161), Release, Reprocess of a rejected claim | `Claim` (claim), bills (`MB`), `Procedure`, `Condition` | `B5-request.json`, `claim-request.json`, `claim-queryupdate.json`, `claim-release.json`, `claim-reprocess.json` |
| **B6** | Claim Search | Case number and policy search | `Task` (search) | `claim-search.json` |
| **B7** | Payment Acknowledgment | Acknowledge remittance (wf17/30) | `Task` | `B7-acknowledgement.json`, `payment-notice-ack.json` |
| **B8** | Task (Cancel / Reprocess) | Cancellation (PC01), Reprocess of a rejected claim (wf36) | `Task` (cancel/reprocess) | `B8-cancel.json`, `B8-reprocess.json` |
| **B9** | Predetermination | Treatment cost predetermination (not in the provider flow; reference shape) | `Claim` (predetermination) | `predetermination-request.json` |
| **C3** | Coverage Response | Discovery, validation, benefits and auth-requirements responses, generic and PMJAY (the request echoed first) | `CoverageEligibilityResponse` | `C3-response-generic.json`, `discovery-response.json`, `validation-response.json`, `benefits-response.json`, `C3-response-pmjay.json`, `coverage-eligibility.json`, `C3-benefits-pmjay.json` |
| **C4** | Insurance Plan Response | Package tariffs, questionnaires, rules | `InsurancePlan`, `Questionnaire` | `C4-response-generic.json`, `C4-response-pmjay.json` |
| **C5** | Preauth Response | Received (wf20), Approved (wf21), Enhancement approved (wf22), Rejected (wf23), Queried (wf24), generic and PMJAY | `ClaimResponse` | `C5-received-wf20.json`, `C5-approved-wf21.json`, `C5-enhancement-approved-wf22.json`, `C5-rejected-wf23.json`, `preauth-queried.json`, `C5-queried-wf24.json`, `C5-received-wf20-pmjay.json`, `C5-approved-wf21-pmjay.json`, `C5-enhancement-approved-wf22-pmjay.json`, `C5-rejected-wf23-pmjay.json` |
| **C6** | Communication Query | Payer asks for docs (wf24, wf27, N02) | `Task`, `CommunicationRequest` | `C6-preauth-query-wf24.json`, `C6-claim-query-wf27.json`, `C6-notification-wfN02.json` |
| **C7** | Claim Response | Received (wf25), Approved (wf26), Approved with a deduction (wf26), Queried (wf27), Rejected (wf291), generic and PMJAY | `ClaimResponse` | `C7-received-wf25.json`, `C7-approved-wf26.json`, `claim-queried.json`, `C7-rejected-wf291.json`, `C7-received-wf25-pmjay.json`, `C7-approved-wf26-pmjay.json`, `C7-approved-deduction-wf26-pmjay.json`, `C7-queried-wf27.json`, `C7-rejected-wf291-pmjay.json` |
| **C8** | Search Response | Return matching ClaimResponses | `Task`, `ClaimResponse` | `search-response.json` |
| **C9** | Payment Notice | Settlement remittance advice (wf30), with TDS or an RF deduction | `PaymentReconciliation` | `C9-notice-wf30.json`, `payment-notice.json`, `C9-notice-tds-wf30-pmjay.json` |
| **C10**| Task Response | Cancellation done (PC02), Arbitration ack (wf37), generic and PMJAY | `Task`, `ClaimResponse` | `C10-cancelled-wfPC02.json`, `C10-arbitration-wf37.json`, `C10-cancelled-wfPC02-pmjay.json`, `C10-arbitration-wf37-pmjay.json` |
| **C11**| Predetermination Response | Pre-treatment estimation verdict on B9 (reference shape) | `ClaimResponse` | `predetermination-response.json` |
| **D1-D13** | PMJAY Scheme Bundles | Specialized SHA Himachal / PMJAY payloads | Mixed | See D1, D3, D4, D6, D7, D8, D9, D10, D11, D13 subdirectories |

## How to read the collection

Each side splits in two.

- **Provider, Example**: bundles written to the specification, in the generic shape a provider sends to any payer, IRDAI-regulated insurers and TPAs included, with placeholders throughout. The lower-case files such as `preauth-request.json`.
- **Provider, From the wire**: bundles captured on the sandbox run against the PMJAY payer, with the beneficiary's identifiers replaced. The D-series, and the capitalised B-series files such as `B3-request.json`.
- **Payer, Generic**: what any payer on the exchange sends, IRDAI-regulated insurers and TPAs included, whether captured or written.
- **Payer, PMJAY**: what the PMJAY State Health Agency itself sent, the `-pmjay` files among them.

`index.yaml` is the machine-readable catalogue of the same bundles. For each file it gives a label and summary, the direction (request or response), the side that sends it, the scheme (generic, or PMJAY for the State Health Agency), the workflow id, the focal resource, the endpoint, the builder use case where a provider builds it, and whether it was taken from a live sandbox exchange or written to the specification. A file ending in `-pmjay` is the PMJAY payer's own message for the same step as its generic sibling.

There is no bundle for status (A5). `/v1/status` and `/v1/on_status` carry an empty payload; everything travels in the protected header.
