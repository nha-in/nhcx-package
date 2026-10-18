# NHCX integration documentation

A documentation set for building on the National Health Claims Exchange, written for the people who have to make it work: the hospital or insurer deciding what to build, the operations team that will run it, and the engineers writing the integration. It covers the exchange as NHA defines it for any payer, and PMJAY as the scheme that runs on it with its own rules.

The chapters are built from the NHCX sandbox portal's published documents (Source, below), the sample bundles in `fhir/` and the package's data files: `usecases.yaml`, `workflow.yaml`, `nhcx-error.yaml` and `baseurl.yaml`. The use case, workflow, error, address and FHIR Reference content is generated from those files by `system/build-docs.mjs`; the rest is written by hand. Building a Provider 13 records the corrections of October 2026, the last on 18 October.

## How it is organised

| Section | What it is for | Start with |
| :---- | :---- | :---- |
| **01 Overview** | What NHCX is, how a claim moves across it, who is on it, what a message is, every use case and workflow code, and what PMJAY changes. Written to be read by someone who has never seen an API. | [01 Introduction](01-Overview/01-Introduction.md) |
| **02 Getting Started** | The base framework every participant builds before any use case: token, keys, participant record, finding the recipient, sealing a message, receiving a callback. Ends with a live round trip, and with the adapter that does the whole of it for you. | [01 The Base Framework](02-Getting%20Started/01-The%20Base%20Framework.md) |
| **03 Building a Provider** | The hospital side, screen by screen: what the user does, what the system calls, what goes in the bundle. Generic flow first, PMJAY differences in one chapter, then the screens in the UI Guide, the sandbox exit checklist, and last the record of a live PMJAY sandbox run. | [01 Provider Overview](03-Building%20a%20Provider/01-Provider%20Overview.md) |
| **04 Building a Payer** | The insurer, scheme or TPA side: the queues, the callbacks to host, the answers to build, the screens each desk works from, and the sandbox exit checklist. | [01 Payer Overview](04-Building%20a%20Payer/01-Payer%20Overview.md) |
| **05 FHIR Reference** | The bundles, one chapter per exchange, each showing the generic bundle every payer takes, then what PMJAY changes and requires, with every code and value set. | [01 Bundles and Conventions](05-FHIR%20Reference/01-Bundles%20and%20Conventions.md) |
| **06 Reference** | What you look up rather than read: every error code either side can send, a symptom-first troubleshooting chapter, the envelope field table with its obligations, the access-control matrix, the governance and audit obligations, every address, and the notification exchange for patient apps. | [02 Troubleshooting](06-Reference/02-Troubleshooting.md) |
| **07 Go Live** | Leaving the sandbox and switching to production: certification, production credentials, registering again, the addresses that change, and the PMJAY cutover. | [01 Going Live](07-Go%20Live/01-Going%20Live.md) |

## Complete Table of Contents

### 01 Overview
1. [01 Introduction](01-Overview/01-Introduction.md): What NHCX is, objectives, participants, machine-readable specifications
2. [02 How Claims Move on NHCX](01-Overview/02-How%20Claims%20Move%20on%20NHCX.md): End-to-end claim journey in plain language
3. [03 Participants and Policies](01-Overview/03-Participants%20and%20Policies.md): Registry records, identifiers, policy lookups
4. [04 JWE, Status and Errors](01-Overview/04-JWE,%20Status%20and%20Errors.md): Envelope/letter model, cross-gateway relay, unified correlation ID, status lifecycle (`request.stopped`)
5. [05 NHCX Use Cases](01-Overview/05-NHCX%20Use%20Cases.md): Catalog of all 38 NHA use cases across A, B, C, D, E series
6. [06 Workflow Codes](01-Overview/06-Workflow%20Codes.md): The 74 workflow IDs and their message directions
7. [07 Payer Flexibility](01-Overview/07-Payer%20Flexibility.md): How each payer configures queries, answers and case numbers
8. [08 PMJAY on NHCX](01-Overview/08-PMJAY%20on%20NHCX.md): What the Ayushman Bharat scheme changes on the network
9. [09 PMJAY Use Cases](01-Overview/09-PMJAY%20Use%20Cases.md): PMJAY-specific use cases D1 to D13
10. [10 PMJAY Scheme Rules](01-Overview/10-PMJAY%20Scheme%20Rules.md): Package-based tariffs, LM100 LAMA/DAMA arithmetic and `LengthOfStay` bounding
11. [11 Glossary](01-Overview/11-Glossary.md): Definitive glossary of protocol, healthcare, and scheme terms

### 02 Getting Started
1. [01 The Base Framework](02-Getting%20Started/01-The%20Base%20Framework.md): Six-step base client architecture
2. [02 Base URLs](02-Getting%20Started/02-Base%20URLs.md): Every service's base in the sandbox and in production, from `baseurl.yaml`
3. [03 Session Token](02-Getting%20Started/03-Session%20Token.md): Minting and refreshing ABDM gateway session JWTs
4. [04 Your Certificate](02-Getting%20Started/04-Your%20Certificate.md): RSA-2048 key pair generation and self-signed certificate assembly
5. [05 Creating and Updating a Participant](02-Getting%20Started/05-Creating%20and%20Updating%20a%20Participant.md): Registry onboarding and participant updates
6. [06 Finding Participants and Policies](02-Getting%20Started/06-Finding%20Participants%20and%20Policies.md): Search endpoints and policy resolution
7. [07 Fetching a Recipient Certificate](02-Getting%20Started/07-Fetching%20a%20Recipient%20Certificate.md): Certificate discovery and caching discipline
8. [08 Building and Sending a JWE](02-Getting%20Started/08-Building%20and%20Sending%20a%20JWE.md): RSA-OAEP-256 + A256GCM compact serialisation
9. [09 Receiving a Callback](02-Getting%20Started/09-Receiving%20a%20Callback.md): Asynchronous callback listener and 202 receipt handling
10. [10 NHCX Adapter](02-Getting%20Started/10-NHCX%20Adapter.md): Turnkey protocol adapter implementation, optional
11. [11 Status and Search](02-Getting%20Started/11-Status%20and%20Search.md): Status enquiry (a `status` Task on `/v1/task/submit` under workflow `1`; the sandbox refuses `/v1/status`) and search queries (`/v1/search/submit`)

### 03 Building a Provider
1. [01 Provider Overview](03-Building%20a%20Provider/01-Provider%20Overview.md): Hospital integration architecture and queue flow
2. [02 Registration and Eligibility](03-Building%20a%20Provider/02-Registration%20and%20Eligibility.md): Patient intake, Aadhaar eKYC and biometrics, and the coverage check
3. [03 Biometric Authentication](03-Building%20a%20Provider/03-Biometric%20Authentication.md): ABDM biometric pipeline: Fingerprint, Iris, FaceAuth, and exemption consent
4. [04 Insurance Plan](03-Building%20a%20Provider/04-Insurance%20Plan.md): Dynamic package master retrieval and caching
5. [05 Preauthorisation](03-Building%20a%20Provider/05-Preauthorisation.md): Preauth request submission, clinical attachments, and query handling
6. [06 Discharge and Claim](03-Building%20a%20Provider/06-Discharge%20and%20Claim.md): Cashless claim submission, discharge types, and billing evidence
7. [07 Payment and Communication](03-Building%20a%20Provider/07-Payment%20and%20Communication.md): Payment reconciliations (wf 30, 31, 33) and out-of-band communication
8. [08 PMJAY Provider](03-Building%20a%20Provider/08-PMJAY%20Provider.md): PMJAY-specific HMIS rules, STG questionnaires, GST, incentives, and size limits
9. [09 UI Guide](03-Building%20a%20Provider/09-UI%20Guide.md): Provider desk wireframes and UX recommendations
10. [10 Provider Checklist](03-Building%20a%20Provider/10-Provider%20Checklist.md): Sandbox exit list, 33 test cases by family (T-ML1, T-PLN, T-ELG, T-PRE, T-CLM, T-PAY, T-COM, T-CBK, T-SES, T-STA), first-week failures
11. [11 PMJAY Sandbox Run](03-Building%20a%20Provider/11-PMJAY%20Sandbox%20Run.md): A full PMJAY case on the sandbox in order, the refusals met and what each means, with placeholders for your own values
12. [12 PMJAY Adjudication APIs](03-Building%20a%20Provider/12-PMJAY%20Adjudication%20APIs.md): The two payer service calls that read and drive a PMJAY case, the role walk, and what the desk refuses
13. [13 Field Corrections](03-Building%20a%20Provider/13-Field%20Corrections.md): The thirteen findings of the October 2026 hospital build review, what was corrected and how each piece works now: members on a family card, specialities, open prices, cycles, SNOMED beside ICD-10, large masters, posting payments to the bill, the settings screen and key rotation; then the 18 October 2026 second pass: workflow ids that name no step, query answers sent as requests, and a claim that goes back only as a reprocess

### 04 Building a Payer
1. [01 Payer Overview](04-Building%20a%20Payer/01-Payer%20Overview.md): Insurer and TPA ingestion architecture
2. [02 Policies and Plans](04-Building%20a%20Payer/02-Policies%20and%20Plans.md): Publishing policy master and 21 MB plan bundles
3. [03 Eligibility Response](04-Building%20a%20Payer/03-Eligibility%20Response.md): Constructing coverage eligibility answers across all 4 purposes
4. [04 Adjudicating Preauthorisation](04-Building%20a%20Payer/04-Adjudicating%20Preauthorisation.md): Evaluating medical necessity, raising queries, approval, and rejection
5. [05 Adjudicating Claims](04-Building%20a%20Payer/05-Adjudicating%20Claims.md): Adjudicating claims, deductions, dispute handling, and rejection bundles
6. [06 Payment Notice and Communication](04-Building%20a%20Payer/06-Payment%20Notice%20and%20Communication.md): Dispatching payment notices and operational intimations
7. [07 UI Guide](04-Building%20a%20Payer/07-UI%20Guide.md): Payer adjudication desk screens and workflow
8. [08 Payer Checklist](04-Building%20a%20Payer/08-Payer%20Checklist.md): Payer sandbox exit list, the four validations, 26 test cases by family (T-ELG, T-PLN, T-PRE, T-CLM, T-TSK, T-PAY, T-COM, T-ENV)

### 05 FHIR Reference
1. [01 Bundles and Conventions](05-FHIR%20Reference/01-Bundles%20and%20Conventions.md): Universal bundle rules, profiles, IDs, base64 encoding, and size limits
2. [02 Coverage Eligibility Request](05-FHIR%20Reference/02-Coverage%20Eligibility%20Request.md): Resource breakdown and fields
3. [03 Coverage Eligibility Response](05-FHIR%20Reference/03-Coverage%20Eligibility%20Response.md): Response bundle, wallet breakdown, and inforce flags
4. [04 Insurance Plan Request](05-FHIR%20Reference/04-Insurance%20Plan%20Request.md): Task-based plan polling request
5. [05 Insurance Plan Response Overview](05-FHIR%20Reference/05-Insurance%20Plan%20Response%20Overview.md): Collection bundle overview and questionnaires
6. [06 Insurance Plan Response, Package-Based](05-FHIR%20Reference/06-Insurance%20Plan%20Response,%20Package-Based.md): PMJAY package structure and claim condition extensions
7. [07 Insurance Plan Response, Coverage-Based](05-FHIR%20Reference/07-Insurance%20Plan%20Response,%20Coverage-Based.md): Commercial insurance plan layout
8. [08 Preauthorisation Request](05-FHIR%20Reference/08-Preauthorisation%20Request.md): Preauth Claim bundle, items, and ABDM clinical attachments
9. [09 Preauthorisation Response](05-FHIR%20Reference/09-Preauthorisation%20Response.md): ClaimResponse, approvals, queries, and verified rejection bundles (wf 23)
10. [10 Preauthorisation Enhancement](05-FHIR%20Reference/10-Preauthorisation%20Enhancement.md): Enhancement payload, header `x-hcx-use_case: Enhancement`, and increment totals
11. [11 Preauthorisation Query and Answer](05-FHIR%20Reference/11-Preauthorisation%20Query%20and%20Answer.md): Query resolution on preauth thread (wf 24 / 19)
12. [12 Claim Request](05-FHIR%20Reference/12-Claim%20Request.md): Final claim bundle, `billablePeriod`, discharge evidence, and invoice attachments
13. [13 Claim Response](05-FHIR%20Reference/13-Claim%20Response.md): Claim decisions, item adjudications, and verified rejection bundles (wf 291)
14. [14 Claim Query and Answer](05-FHIR%20Reference/14-Claim%20Query%20and%20Answer.md): Claim query updates (wf 27 / 151)
15. [15 Cancel, Reprocess and Shortfall](05-FHIR%20Reference/15-Cancel,%20Reprocess%20and%20Shortfall.md): Task-based cancel (`cancel`), reprocess (`reprocess`), balance release (`release`) and `nullify`
16. [16 Payment Notice and Acknowledgement](05-FHIR%20Reference/16-Payment%20Notice%20and%20Acknowledgement.md): Payment notices, reconciliations, and payment receipts
17. [17 Communication](05-FHIR%20Reference/17-Communication.md): Out-of-band communication payloads and reason codes
18. [18 Status and Search](05-FHIR%20Reference/18-Status%20and%20Search.md): Specification and schemas for status and search
19. [19 Codes and Value Sets](05-FHIR%20Reference/19-Codes%20and%20Value%20Sets.md): All code systems, bindings, and known NHA discrepancies

### 06 Reference
1. [01 Error Codes](06-Reference/01-Error%20Codes.md): Directory of 309 error codes, the three code spaces, and collisions
2. [02 Troubleshooting](06-Reference/02-Troubleshooting.md): Five-layer fault isolation model and symptom-first diagnostic playbook
3. [03 Envelope Fields](06-Reference/03-Envelope%20Fields.md): Full JWE header table, obligations, and correlation rules
4. [04 Access Control and Roles](06-Reference/04-Access%20Control%20and%20Roles.md): Role permissions, search rights, consent headers, and registry attributes (`payment_details`)
5. [05 Governance and Audit](06-Reference/05-Governance%20and%20Audit.md): Security layers, dual JWTs, log retention, grievance redressal, and onboarding checklist
6. [06 Environments and Addresses](06-Reference/06-Environments%20and%20Addresses.md): Sandbox/production URLs, firewall IPs, token headers, and 12 sandbox Swagger specifications
7. [07 Notifications and Patient Apps](06-Reference/07-Notifications%20and%20Patient%20Apps.md): Beneficiary service provider integration, subscription model, and push events

### 07 Go Live
1. [01 Going Live](07-Go%20Live/01-Going%20Live.md): Sandbox exit, production credentials, registering in production, switching addresses, the network path, the PMJAY cutover and the pilot

---

### Additional Core References
- [Gap Register (`GAPS.md`)](GAPS.md): Historical resolution audit of all protocol contradictions and gaps
- [Use cases (`usecases.yaml`)](../usecases.yaml): The 38 NHA use cases (A1 to A6, B1 to B8, C1 to C10, D1 to D13, E1) and the 16 builder use cases, the source of Overview 05
- [Workflow codes (`workflow.yaml`)](../workflow.yaml): The 74 workflow IDs, the source of Overview 06
- [Error codes (`nhcx-error.yaml`)](../nhcx-error.yaml): Every gateway and payer error code, the source of Reference 01
- [Bruno collection (`apis/`)](../apis/): The 83 requests and callbacks, by folder; `make openapi` exports them as OpenAPI 3.1 into `dist/openapi/`, and `make postman` builds the Postman collection, which the release carries as `postman/`


## Reading paths

- **Deciding whether to build.** Overview 01 and 02, then 07 and 08 if PMJAY is in scope.
- **Running the claims desk.** Overview 02, then Building a Provider 01 and 02, or Building a Payer 01.
- **Designing the screens.** Building a Provider 09, or Building a Payer 07, alongside the flow chapter for whatever is being designed.
- **Engineering a provider.** Getting Started end to end, then Building a Provider, then the FHIR Reference as needed. Overview 04 and 06 before the second use case.
- **Integrating without building the protocol yourself.** Getting Started 10, the NHCX Adapter, then the FHIR Reference for the bundles you still have to write.
- **Engineering a payer.** Getting Started end to end, then Building a Payer, then the FHIR Reference. Overview 04 and 06 before the second use case.
- **Going live.** Go Live 01, Going Live, once the exit checklist for your side is done; Getting Started 02 for the addresses that change.
- **Going live against PMJAY.** Building a Provider 11 first, then 08, then FHIR Reference 08 and 12, then Go Live 01.
- **Writing bundles.** FHIR Reference 01 first, then the chapter for the exact exchange and direction you are building, then 19 for codes.
- **Looking something up.** Getting Started 02 for a base URL. Reference 01 for an error code, 03 for an envelope field, 06 for an address. Overview 06 for workflow codes, 11 for terms, FHIR Reference 19 for value sets and the bindings the samples get wrong.
- **Something has broken.** Reference 02, Troubleshooting, which is organised by symptom rather than by exchange.
- **Building for PMJAY biometrics.** Building a Provider 03, then Overview 09 for when each authentication is required.
- **Setting up each payer.** Overview 07, Payer Flexibility, before you write the query path.
- **Compliance, audit or legal review.** Reference 04 and 05.

## Conventions

- **Diagrams** carry no colours of their own. Every diagram is drawn in one theme by whatever renders it, so they all look alike; the parties are told apart by their labels and lanes.
- **Where NHA's documents disagree with each other**, the text says so and names which reading the live samples follow rather than picking silently. Around fifteen such points are flagged in the Overview alone, and more in the FHIR Reference, where the published payloads contradict the profiles they claim to follow.
- **What has been verified against the running sandbox is marked as such.** Coverage eligibility in all four purposes, the insurance plan, the preauthorisation, an enhancement, the claim, and the Payer Service adjudication of all three were run against the SHA HP sandbox payer on 5 and 6 September 2026, end to end to an approved claim, and are recorded in Building a Provider 11. Building a Provider 13 adds the rules the reference hospital build's October 2026 runs against the sandbox payer settled. Everything else is built from the published documents, collections and samples, and the adapter chapter from that application's source.
- **British spelling**, preauthorisation rather than preauthorization, except inside code and FHIR values, which are quoted as they are.

## Source

The NHCX sandbox portal at `hcxsbx.abdm.gov.in`: its content pages, the 27 documents on its Documents page, the 12 on its HMIS Documents page, and the two Media Center files, as mirrored on 1 September 2026. The newest of these are the Workflow Status Sheets (18 August 2026), the Standard Error Codes (11 August), the PMJAY Integration Handbook (14 August) and FAQ v1.2 (21 August).
