# Core

The NHCX facts every task needs, on one page: the addresses per environment, the calls that are not exchanges, and for each exchange the route, the bundle sent, the workflow id it travels under, the callback that answers it and the bundle that comes back. The knowledge source ([KNOWLEDGE.md](KNOWLEDGE.md)) is the authority behind every value here (`baseurl.yaml`, `workflow.yaml` and `usecases.yaml` in the package; `search_docs` and `get_operation` on the MCP). Check a value there before relying on it, and when they differ, the knowledge source wins.

NHA use-case codes are written `nha:B3`; bare ids (A4, C5, F8) are this skill's specs.

## Instructions

Follow these strictly, in every step and every file. When a spec seems to say otherwise, stop and resolve it against this list and the knowledge source; record the resolution under `corrections` in the current plan file.

1. **The gateway is inside the application.** Call it as functions ([G7. Send](../gateway/G7-send.md) `gateway.send`, [G9. Ledger](../gateway/G9-ledger.md) `ledger.*`, [G10. Beneficiary Registry](../gateway/G10-beneficiary-registry.md), [G3. Session Token](../gateway/G3-session-token.md)). Never call a separate gateway service over HTTP, and never mount any gateway route except the inbound route and the health checks ([G1. Embedding](../gateway/G1-embedding.md)).
2. **NHCX facts come from the knowledge source, never from memory.** Paths, headers, profiles, codes and workflow ids are checked there ([KNOWLEDGE.md](KNOWLEDGE.md)). On the protocol it wins over every spec; on what the application does, the specs win.
3. **Nothing payer- or environment-specific is hard-coded.** Participant codes, base URLs, workflow ids and scheme rules come from configuration or the payer adapter ([PAYERS.md](PAYERS.md)). Production URLs are set explicitly.
4. **One way out, one way in.** Every message leaves through `gateway.send`. Every message arrives through [G8. Receive](../gateway/G8-receive.md) and `C1.receive(envelope, delivery)`, which routes it to one callback. A reply found by polling (A10 to A13) is applied by that same callback handler, never by separate code.
5. **Replies are matched by `x-hcx-correlation_id`** (a payment notice by the claim number it carries), never by workflow id, route or timing.
6. **Every callback is safe to receive twice.** It answers `settled`, `unmatched`, `ignored` or `rejected` (NHCX gets 202, no redelivery) or `error` (NHCX gets 502 and redelivers). Only an unexpected fault is `error`.
7. **A failed send that names its ids keeps them.** Store the ids from the send result on the leg and mark it failed; the message may still have reached NHCX.
8. **Keep the layers.** Screens call services and read models. Only services (A) and callbacks (C) write claim tables. FHIR builders and parsers never touch the database or the gateway ([SCAFFOLDING.md](SCAFFOLDING.md)).
9. **No secrets in the repository.** Client secret, private key and payer desk credentials come from configuration or the environment.
10. **Treat markers as defined.** [REF](PAYERS.md#markers) may be chosen differently (record it); [PAYER](PAYERS.md#markers) values come from the payer adapter; [SANDBOX](PAYERS.md#markers) behaviour is not relied on in production.
11. **Work the steps in order and log them.** L1 to L8, one plan file each, every sub-step and file change in `nhcx-plan/progress.json` ([LOG.md](../steps/LOG.md)). Re-read this page at the start of each step.
12. **Build on the host, not beside it.** No spec assumes a framework: L1 records the target's stack and the component it uses for each kind (type-ahead, select, table, chip, card, accordion, dialog, date picker, file input, flash or toast, tabs with a dot badge), and every screen is built from those. An HMIS that has its own M1 (ABHA create, link and verify, the ABHA identifier, the session token) keeps it, without the user being asked; [A19. ABHA Create and Verify (ABDM M1)](../apis/A19-abha-m1.md) is only for one that has none.
13. **End every prompt by rebuilding the report.** The last action of every prompt, whatever it did, is to run the report builder (`nhcx-plan/report.py` or the target language's equivalent), which rewrites `nhcx-plan/report.html` from the plan files: every plan file on its own tab, errors first, with a refresh button; `make-report.sh` and `make-report.bat` rebuild it every 10 seconds for anyone watching ([LOG.md](../steps/LOG.md#logh-reporthtml)).
14. **Once the claim has gone to the payer, the pre-authorisation is read only.** Once the pre-authorisation is approved and the claim has gone to the payer, the pre-authorisation is read only: no enhancement or any change (lines, details, its documents, forms, dismissals, a send); only a cancellation, and only until the payer decides the claim. The lock is read from the claim leg alone: it holds while the claim is `submitting`, `queried`, `approved`, `partial` or `rejected`; a claim still a draft, or one refused at the door (`error`, it never reached the payer), leaves the pre-authorisation open. Every write to the pre-authorisation leg checks it first and refuses with "The claim has gone to the payer, so the pre-authorisation is read only: no enhancement or change can be made. It can only be cancelled while the payer is deciding the claim." (the claim leg's own writes are never refused by it). A cancellation is refused once the claim is `approved`, `partial` or `rejected` with "The payer has decided the claim; the pre-authorisation can no longer be cancelled."
15. **Run the newest build of the skill.** At the start of every prompt, whatever the knowledge source and whether or not the MCP is connected, read the NHCX package's skills manifest on GitHub (`skills/manifest.json` in github.com/nha-in/nhcx-package); when it names a newer version than this build, pull the package's copy, check it against `skills/CHECKSUMS.sha256`, install it over this one and continue from the installed copy (SKILL.md, UPDATE FIRST). Never install a copy that fails its checksums.
16. **Every id a person reads carries its name.** Steps, sub-steps, tests and specs are written `L3 Integration Planning`, `T3 IRDAI Policy Search and Eligibility (CLI): pass`, never a bare `L3` or `T3`, in progress.md, report.html and every progress message to the user; the names come from `nhcx-plan/names.json` ([LOG.md](../steps/LOG.md#logn-every-id-with-its-name)).

## Confusions

Terms and behaviours that are easy to mix up, with the reading this skill uses.

| Easily confused | Correct reading |
|---|---|
| This skill's ids and NHA's use-case codes | `A1` is our policy search; `nha:A1` is NHA's participant list. `C5` is our pre-auth reply callback; `nha:C5` is NHA's "respond to pre-authorisation" (a payer use case). Always prefix NHA codes with `nha:`. |
| "Gateway" | Here, the in-process module G. NHA's documents also call the NHCX exchange itself "the gateway", and ABDM has its own session gateway. Write "the exchange" for NHCX and "sessions" for ABDM. |
| Workflow id, correlation id, api call id, request id, ledger id | Workflow id (`x-hcx-workflow_id`): which step of the claim flow this is. Correlation id: the thread, kept by every reply. API call id: one message, kept across NHCX's redeliveries (the dedupe key). Request id: one request. Ledger id (`txn_id`): our own record in [G9. Ledger](../gateway/G9-ledger.md), never sent to NHCX. |
| Payer id and processing id | The policy search returns both. The **processing id** is the participant that handles the policy on NHCX (for PMJAY, the state health agency) and is the recipient of every message; the **payer id** only chooses the payer adapter. They are often equal in the sandbox, which hides the mistake. |
| `x-hcx-status` on a query answer | A query answer goes on a request route (`.../submit`) and travels as `request.initiated`, like every submission there: NHCX refuses `response.complete` on it with NHCX-1011 [SANDBOX](PAYERS.md#markers). Only a send on an `on_` route (the payment acknowledgement, a communication reply) is `response.complete`. A query answer refused at the door leaves the leg `queried`, its question still open. |
| Our workflow ids and the payer's | The table in section 4 is what we send. The payer's replies carry their own (PMJAY: 20, 21, 25, 26 and others [PAYER](PAYERS.md#markers)); nothing routes on them. |
| An id we pass and the id that goes out | Correlation, request and api call ids that are not plain UUIDs are silently replaced when sending ([G5. Protocol Headers](../gateway/G5-protocol-headers.md)). Store the ids from the send result, never the ones passed in. |
| NHCX's 202 on a send | The exchange accepted the message for delivery. It says nothing about the payer's decision, which arrives later on the callback. |
| `outcome: complete` in a ClaimResponse | Not an approval: it comes back for a rejection too [PAYER](PAYERS.md#markers). The decision is read from the adjudication (F9. ClaimResponse (in nhcx-preauth)). |
| Request and `on_` routes for payer-started exchanges | For payment notices and payer communications the payer calls `.../request` and we answer on `.../on_request`, the opposite way round from every exchange we start. |
| Two coverage replies on one route | The eligibility verdict ([C2. Coverage Eligibility Verdict](../callbacks/C2-coverage-eligibility-on-check.md)) and the authorisation-requirements ruling (C3. Authorisation Requirements Ruling (in nhcx-preauth)) both arrive on `v1/coverageeligibility/on_check`; the correlation id decides which. Likewise `v1/task/on_submit` carries the cancel answer (C7. Cancel Reply (in nhcx-preauth)) and enquiry answers (C8. Enquiry Reply (in nhcx-preauth)). |
| A `ProtocolResponse` | A refusal of our message by NHCX or the payer, not an answer to it. It arrives in place of a bundle, on the same thread. |
| The redelivery flag | A hint, not a reason to skip: a first delivery that failed is also on the ledger. Handlers dedupe by the api call id stored on the leg. |
| Query mode | A line-item query (a ClaimResponse naming the queried items) and every query of a `resubmit` payer (the `gov` adapter) are answered by sending the leg again from its own tab (A4. Pre-auth Submit (in nhcx-preauth), A5. Claim Submit (in nhcx-claim)); a standalone CommunicationRequest query of a `communication` payer is answered with a Communication on the Communication tab (C9. Payer Communication (in nhcx-communication), A7. Communication Reply (in nhcx-communication)) [PAYER](PAYERS.md#markers). A CommunicationRequest from a `resubmit` payer is a notification. |
| Claim number, claim reference, pre-auth reference | The claim number is our case number, sent as `Claim.identifier` (`claim_ref` keeps the one a leg went under). The pre-auth reference (`preAuthRef`) is the payer's number for its approval. |
| Member id, policy code, product id | The member id identifies the beneficiary on the policy. The policy code identifies the policy or plan; some registries return only a product id, used as the policy code then [REF](PAYERS.md#markers). |
| ABHA number and ABHA address | The 14-digit number (what links a claim to an admission) and the `name@abdm` style address; they are different fields ([D3. patient](../database/D3-patient.md)). |
| HFR id and participant code | The HFR id identifies the facility in the health facility registry (the provider Organization's identifier, [F17. Organization](../fhir/F17-organization.md)); the participant code (`...@hcx`) is its address on NHCX. |
| Sandbox participant codes | Examples only ([PAYERS.md](PAYERS.md)). Every code comes from configuration. |
| Predetermination and status routes | NHA lists `v1/predetermination/submit` and `v1/status`. The desk offers no predetermination: every line is quoted from the payer's insurance plan and the pre-authorisation is the request. A status enquiry goes as a Task on `v1/task/submit` under workflow id `1` [REF](PAYERS.md#markers); it is asked of the pre-authorisation only while it is `submitting`, and of the claim once raised. |
| Step ids, section letters, log ids | `L1` to `L8` are steps; `S1L` is the LAYOUT section of S1; `LOG-0042` is a progress log entry; `X1` to `X10` are the end-to-end exchanges of L8. |
| A9 | There is no A9: the inbound door it once described became the callbacks, C1 to C10. |
| Session token, user token, X-token, T-token | The **session token** is the application's own, minted from its client id ([G3. Session Token](../gateway/G3-session-token.md)) and sent as `Authorization: Bearer` on every ABDM call and as `bearer_auth` on the exchange. The **user token** is the beneficiary's, from a biometric verification ([A18. Biometric Authentication](../apis/A18-biometric-authentication.md)), thirty minutes, carried on the request headers under PMJAY. The **X-token** and **T-token** are ABHA M1's ([A19. ABHA Create and Verify (ABDM M1)](../apis/A19-abha-m1.md)): the X-token opens the person's ABHA profile, the T-token only chooses the account after a mobile login. None of the three is ever sent in another's place. |
| Biometric authentication and the consent questionnaire | A live capture ([A18. Biometric Authentication](../apis/A18-biometric-authentication.md), the proof-of-presence card [S18. Beneficiary Verification](../screens/S18-beneficiary-verification.md) on the Pre-authorisation and Claim tabs) is optional for any payer and its token rides on the sends whenever the desk holds one. Under the `gov` adapter, or when the plan's policy documents carry code ADN, it is required, and where none is possible the scheme's Authentication Consent and Discharge Consent forms are answered in the bundle instead ([F7. QuestionnaireResponse](../fhir/F7-questionnaireresponse.md)): one or the other goes, never both, and a cyclic case takes only the capture. The stage is the screen's: Preauth on the Pre-authorisation tab, Discharge on the Claim tab. It works before admission: a capture may belong to the case alone and moves to the patient when the admission is linked. |

## 1. Environments and base URLs

| Service | Used for | Sandbox | Production |
|---|---|---|---|
| ABDM sessions | the session token every call carries ([G3](../gateway/G3-session-token.md)), `POST /api/hiecm/gateway/v3/sessions` | `https://dev.abdm.gov.in` | `https://apis.abdm.gov.in` (published by ABDM; confirm in the onboarding letter) |
| NHCX exchange | every exchange, under `/v1` ([G7](../gateway/G7-send.md)) | `https://apisbx.abdm.gov.in/hcx` | shared by NHA after sandbox exit |
| Participant service (registry) | participant records, certificates, policies ([G4](../gateway/G4-registry.md), [G10](../gateway/G10-beneficiary-registry.md)) | `https://apisbx.abdm.gov.in/pmjay/sbxhcx/participanthcxservice` | `https://apisprod.nha.gov.in/pmjay/hcx/participanthcxservice` |
| PMJAY payer service, role lookup | sandbox adjudication (A14 (in nhcx-preauth)) [PAYER](PAYERS.md#markers) | `https://apisbx.abdm.gov.in` + `/pmjay/sbxhcx/nhcxpayerservice/v1/get/user-role` | not published |
| PMJAY payer service, act on a case | sandbox adjudication (A15 (in nhcx-preauth)) [PAYER](PAYERS.md#markers) | `https://apisbeta.nha.gov.in` + `/pmjay/hcx/nhcxpayerservice/wrapper/process/case` | not published |
| NHCX portal | the portal and its published API specifications | `https://hcxsbx.abdm.gov.in` | not published |

| Setting | Sandbox | Production |
|---|---|---|
| `X-CM-ID` on the session call | `sbx` | `abdm` |
| This application's inbound route | the public URL registered as the participant's `endpoint_url`, routed to `/in/<path>` or `/v1/<path>` ([G8](../gateway/G8-receive.md)) | the same, on HTTPS (TLS 1.2 or newer), a domain name hosted in India, no IP address and no port; NHCX's source addresses allowed in ([OPERATIONS.md](OPERATIONS.md)) |

The gateway's production table ([G2. Configuration and Participants](../gateway/G2-configuration.md)) is this table. A host swap of the sandbox names (`apisbx` to `apis`, `sbxhcx` to `hcx`, `dev` to `live`) is wrong and must not be used. Set every production URL explicitly in configuration from the onboarding letter; the NHCX exchange base has no published production address.

## 2. Calls that are not exchanges

Plain JSON with the session token: no JWE, no protocol headers, no ledger row.

| NHA use case | Call | Does | This skill |
|---|---|---|---|
| nha:A4 | sessions (above) | trade client id and secret for the session token | [G3](../gateway/G3-session-token.md) |
| nha:A3 | registry `/fetch/certs` | a participant's encryption certificate | [G4](../gateway/G4-registry.md) |
| nha:A1 | registry `/fetch/participants/list`, `/participant/search` | participant records | [G4](../gateway/G4-registry.md) |
| nha:A2 | registry `/participant/get/policies` | a beneficiary's policies by member id, mobile or ABHA number | [A1](../apis/A1-policy-search.md), [G10](../gateway/G10-beneficiary-registry.md) |
| nha:C1, nha:C2 | registry `/participant/link/abha/policy`, `/participant/delink/abha/policy` | link or unlink an ABHA number and a policy | [G10](../gateway/G10-beneficiary-registry.md) |
| nha:D2 | ABDM biometric service: `auth/init`, `auth/verify`, `auth/refresh/token` on one host, `faceauth/init`, `capture/pid`, `v2/auth/verify` on another | the beneficiary's fingerprint, iris or face authentication against their ABHA; the user token that rides on the eligibility check, pre-authorisation and claim, optional for any payer and required by PMJAY | [A18](../apis/A18-biometric-authentication.md), defined in full; the proof-of-presence card is [S18](../screens/S18-beneficiary-verification.md) |
| ABDM M1 | ABHA service `/abha/api/v3/...` | create an ABHA from an Aadhaar OTP, or verify an existing one by OTP, and fill the patient file from the profile | the HMIS's own M1 when it has one, reused without asking; else [A19](../apis/A19-abha-m1.md), the calls read from the MCP's M1 catalogue |

## 3. Protocol defaults

- Every exchange is one FHIR Bundle ([F1. Bundle](../fhir/F1-bundle.md)) encrypted as a compact JWE to the recipient's certificate ([G6. Encryption](../gateway/G6-encryption.md)), with the `x-hcx-*` headers in the protected header ([G5. Protocol Headers](../gateway/G5-protocol-headers.md)).
- `x-hcx-status`: `request.initiated` on every send to a request path, **query answers included** (workflow 19, 131, 151, 161 on `v1/preauth/submit` or `v1/claim/submit`; NHCX refuses `response.complete` there with NHCX-1011), and `response.complete` only on an `on_` path. The sending API sets it; the gateway's path default is only a fallback ([G5. Protocol Headers](../gateway/G5-protocol-headers.md), [PAYERS.md](PAYERS.md)).
- `x-hcx-recipient_code`: the policy's **processing id** from the policy search, not its payer id (NHCX-1003 otherwise); the payer id only picks the payer adapter ([A1. Policy Search](../apis/A1-policy-search.md), [D9. claim](../database/D9-claim.md)).
- A reply keeps the request's `x-hcx-correlation_id`; callbacks match on it ([C1. Callback Door](../callbacks/C1-callback-door.md)).
- A refusal comes back as a plain `ProtocolResponse` instead of a bundle, on the same thread ([C1. Callback Door](../callbacks/C1-callback-door.md), [A13. Transaction List](../apis/A13-txn-list.md)).
- Workflow ids below are the provider's sends. The payer's replies carry their own; callbacks never route on them.

## 4. Exchanges

"Workflow id" gives the `gov` value first and the `generic` value when it differs; [PAYERS.md](PAYERS.md) has every adapter. Every send is made through `gateway.send` ([G7. Send](../gateway/G7-send.md)); every reply is taken in by [G8. Receive](../gateway/G8-receive.md) and routed by [C1. Callback Door](../callbacks/C1-callback-door.md).

### Eligibility and plan

| Exchange | NHA | Our API | Send route | Bundle sent | Workflow id | Reply route | Bundle back | Callback |
|---|---|---|---|---|---|---|---|---|
| Coverage eligibility (validation, benefits, discovery) | nha:B1, nha:D3 | [A2](../apis/A2-coverage-eligibility-check.md) | `v1/coverageeligibility/check` | [F2](../fhir/F2-coverage-eligibility-request.md) with [F15](../fhir/F15-patient.md) to [F18](../fhir/F18-coverage.md) | 11 (NHA's sample) by default; a setting sends the case number instead [REF](PAYERS.md#markers) | `v1/coverageeligibility/on_check` | [F3](../fhir/F3-coverage-eligibility-response.md) | [C2](../callbacks/C2-coverage-eligibility-on-check.md) |
| Authorisation requirements on the chosen lines | nha:B1 | [A2](../apis/A2-coverage-eligibility-check.md) (purpose `auth-requirements`) | `v1/coverageeligibility/check` | [F2](../fhir/F2-coverage-eligibility-request.md) with items | as eligibility: 11 by default, the case number under the setting [REF](PAYERS.md#markers) | `v1/coverageeligibility/on_check` | [F3](../fhir/F3-coverage-eligibility-response.md) | C3 (in nhcx-preauth) |
| Insurance plan (package master) | nha:B2, nha:D1 | A3 (in nhcx-preauth) | `v1/insuranceplan/request` | F4 (in nhcx-preauth) (Task only) | `1`: the plan is the hospital's and the policy's, never a case's; the case number is never sent [PAYER](PAYERS.md#markers) | `v1/insuranceplan/on_request` | F5 (in nhcx-preauth) with F6 (in nhcx-preauth) | C4 (in nhcx-preauth) |

### Pre-authorisation

| Exchange | NHA | Our API | Send route | Bundle sent | Workflow id | Reply route | Bundle back | Callback |
|---|---|---|---|---|---|---|---|---|
| Pre-authorisation | nha:B3, nha:D4 | A4 (in nhcx-preauth) | `v1/preauth/submit` | F8 (in nhcx-preauth) (`use: preauthorization`) with [F7](../fhir/F7-questionnaireresponse.md), [F15](../fhir/F15-patient.md) to [F19](../fhir/F19-other-resources.md) | 12 | `v1/preauth/on_submit` | F9 (in nhcx-preauth) | C5 (in nhcx-preauth) |
| Pre-auth resubmitted after a rejection | nha:D5 | A4 (in nhcx-preauth) | `v1/preauth/submit` | F8 (in nhcx-preauth) | 121 (defined; the reference never sends it [REF](PAYERS.md#markers)) | `v1/preauth/on_submit` | F9 (in nhcx-preauth) | C5 (in nhcx-preauth) |
| Pre-auth query answer | nha:D7 | A4 (in nhcx-preauth) (resubmit query mode) [PAYER](PAYERS.md#markers) | `v1/preauth/submit` | F8 (in nhcx-preauth) with the answer | 19, status `request.initiated` | `v1/preauth/on_submit` | F9 (in nhcx-preauth) | C5 (in nhcx-preauth) |
| Enhancement | nha:D6 | A4 (in nhcx-preauth) | `v1/preauth/submit` | F8 (in nhcx-preauth) with the added lines | 13 | `v1/preauth/on_submit` | F9 (in nhcx-preauth) | C5 (in nhcx-preauth) |
| Enhancement query answer | nha:D6 | A4 (in nhcx-preauth) | `v1/preauth/submit` | F8 (in nhcx-preauth) | 131, status `request.initiated` | `v1/preauth/on_submit` | F9 (in nhcx-preauth) | C5 (in nhcx-preauth) |
| Cancel the pre-authorisation | nha:D8 | A6 (in nhcx-preauth) (cancel) | `v1/task/submit` | F10 (in nhcx-preauth) (Task `cancel`) | PC01 | `v1/task/on_submit` | F10 (in nhcx-preauth) pointing at F9 (in nhcx-preauth) | C7 (in nhcx-preauth) |

Payer workflow ids on pre-auth replies [PAYER](PAYERS.md#markers): 20 received, 21 approved, 22 enhancement approved, 23 rejected, 24 queried; PC02 cancellation accomplished.

### Claim and after

| Exchange | NHA | Our API | Send route | Bundle sent | Workflow id | Reply route | Bundle back | Callback |
|---|---|---|---|---|---|---|---|---|
| Claim | nha:B5, nha:D9 | A5 (in nhcx-claim) | `v1/claim/submit` | F8 (in nhcx-preauth) (`use: claim`) with [F7](../fhir/F7-questionnaireresponse.md), [F15](../fhir/F15-patient.md) to [F19](../fhir/F19-other-resources.md) | 15 | `v1/claim/on_submit` | F9 (in nhcx-preauth) | C6 (in nhcx-claim) |
| Claim query answer | nha:D10 | A5 (in nhcx-claim) | `v1/claim/submit` | F8 (in nhcx-preauth) with the answer | 151 (published) for every adapter; the SHA sandbox takes only 161, set as a configuration override [SANDBOX](PAYERS.md#markers); status `request.initiated` | `v1/claim/on_submit` | F9 (in nhcx-preauth) | C6 (in nhcx-claim) |
| Reprocess a rejected claim | nha:D11 | A6 (in nhcx-preauth) (reprocess) | `v1/task/submit` | F10 (in nhcx-preauth) (Task) | 36 | `v1/task/on_submit` | F10 (in nhcx-preauth) | C8 (in nhcx-preauth) |
| Release the unpaid balance | nha:D12 | A6 (in nhcx-preauth) (release) | `v1/task/submit` | F10 (in nhcx-preauth) (Task) | 36 | `v1/task/on_submit` | F10 (in nhcx-preauth) | C8 (in nhcx-preauth) |
| Status of a leg | nha:A5 | A6 (in nhcx-preauth) (status) | `v1/task/submit` with a status Task [REF](PAYERS.md#markers); NHA lists `v1/status` | F10 (in nhcx-preauth) (Task) | `1` always: no NHCX workflow code names a status check, so never the leg's correlation id [REF](PAYERS.md#markers) | `v1/task/on_submit` or `v1/on_status` | F10 (in nhcx-preauth) | C8 (in nhcx-preauth) |

A decided claim is never sent again under any adapter: A5. Claim Submit (in nhcx-claim) refuses it and a rejected claim goes back as a reprocess (A6. Task Submit (cancel, status, reprocess, release) (in nhcx-preauth), reasons `claimrejected` or `rejectiondisputed`). A claim refused at the door never reached the payer and may be sent again under 15 (or 151 when it was a query answer). The release is offered on an approved or partially approved claim.

Payer workflow ids on claim replies [PAYER](PAYERS.md#markers): 25 received, 26 approved. A `gov` payer does not answer a status enquiry ([PAYERS.md](PAYERS.md)).

### Payer-started exchanges

| Exchange | NHA | Arrives on | Bundle in | Callback | Our answer | Answer route | Bundle out | Workflow id |
|---|---|---|---|---|---|---|---|---|
| Payer query, notification or note | nha:C6 (payer), nha:B4 (provider) | `v1/communication/request` | F11 (in nhcx-communication) (a note: a bare F12 (in nhcx-communication)) | C9 (in nhcx-communication) | A7 (in nhcx-communication): reply to a query, acknowledge a notification | `v1/communication/on_request` | F12 (in nhcx-communication) | the request's own, on the request's correlation id |
| Payment notice | nha:C9 (payer), nha:B7, nha:D13 (provider) | `v1/paymentnotice/request` | F13 (in nhcx-payment) | C10 (in nhcx-payment) | A8 (in nhcx-payment): acknowledge | `v1/paymentnotice/on_request` | F14 (in nhcx-payment) | 17; generic: the notice's own |

### Not built by this skill

| NHA | Route | Note |
|---|---|---|
| nha:A6 | `v1/error` (inbound) | delivered by [G8](../gateway/G8-receive.md) with type `error`, which [C1](../callbacks/C1-callback-door.md) ignores [REF](PAYERS.md#markers) |
| nha:B9 | `v1/predetermination/submit` | predetermination: not offered on the desk; lines are quoted from the insurance plan and sent as the pre-authorisation |
| nha:B6 | `v1/search/submit`, `v1/search/on_submit` | claim search: not specified here |
| nha:E1 | `v1/notification/subscribe`, `v1/notification/on_subscribe` | notification subscription: not specified here |
| nha:D2 | ABHA biometric authentication | not an NHCX exchange, but built: [A18](../apis/A18-biometric-authentication.md), section 2 |

## 5. Where the details are

| For | Read |
|---|---|
| What each API does, step by step | the A spec, and [READSETS.md](READSETS.md) for what to read with it |
| What each reply does to the case | the C spec |
| Every element of a bundle | the F spec, and the knowledge source's example bundles |
| Payer differences | [PAYERS.md](PAYERS.md) |
| Going live, addresses that change, inbound IPs | [OPERATIONS.md](OPERATIONS.md) |
