# Gap register

> [!NOTE]
> **Status, 13 September 2026.** Every item below was re-checked against the chapter text and the NHA sources, and the ones found unresolved were fixed then. The Status section at the end gives each item's standing and where the fix is. Two items were overtaken on 18 October 2026, A1 for two exchanges and B4 in full, and three open questions in Part E narrowed or closed; the last section, Status, 18 October 2026, says how. What no source settles is in Part E, and in the onboarding list in Governance and Audit.

What the handbook does not say, and what in the source corpus says it.

Drawn up 11 September 2026 against documentation version 2.1.0. Every row was
checked against the mirrored NHA corpus, now kept under `knowledge/sources`, and
against the earlier organisation of the same material under
`SHCXv4/docs/l1` and `SHCXv4/docs/release`. Where a gap can be closed from a
source already in this repository, the source is named with its path. Where it
cannot, the entry says so.

The register is in four parts. Part A is corrections: places where the handbook
states something the corpus contradicts. Those come first because they are
wrong rather than absent, and an integrator acting on them makes a decision
they did not need to make. Part B is missing chapters. Part C is thin coverage
inside chapters that exist. Part D is defects and maintenance. Part E lists
what genuinely has no answer, so that nobody goes looking again.

---

## Part A: corrections

### A1. The workflow code header is optional, and the handbook says nobody says so

JWE, Status and Errors closes with two points it calls unanswerable. The first
reads: "The workflow code for eligibility, insurance plan, search,
predetermination and status. The workflow sheet lists none. The header is not
marked optional anywhere. Agree a value with your payer in writing before the
first call."

`x-hcx-workflow_id` is marked **Optional** on all twenty-five rows where it
appears, across all ten sheets, in
`reference/nhcx-site/doc/documents/NHCX Requests and Responses for UseCases.md`.
That includes the CoverageEligibility and Insurance Plan sheets, the two
exchanges the handbook names. The PMJAY variant of the same workbook,
`reference/nhcx-site/doc/hmisdocuments/NHCX Services - Request and Response.md`,
agrees sheet for sheet.

Send no workflow code on those exchanges. The open question is closed and the
paragraph telling integrators to negotiate it should go.

### A2. The correlation ID rule is fully determined, not contested

The same chapter treats the correlation ID as a genuine clash: the protocol
pages say copy the request's `correlation_id`, the exit checklists say use the
request's `api_call_id`, and the chapter judges the checklist reading to be one
that "makes threading impossible".

The workbook states both halves of a single rule, and they are consistent.
Counted across the corpus:

| Rule as written | Rows | Where it applies |
| :---- | :---- | :---- |
| "Correlation ID should be same as API caller ID" | 8 | On a **request**, every exchange |
| "Correlation ID should be same as correlation of the request" | 16 | On a **response**, every exchange |
| "…same as API caller ID of the request that requires a status check" | 1 | `/v1/status` only |

So the initiator seeds the thread by setting `correlation_id` to its own
`api_call_id`, and the responder echoes the `correlation_id` it received. The
exit checklist describes the initiator's rule, the protocol page the
responder's. Neither is wrong and threading works. The status exchange is the
one case where the correlation ID points at another message's call ID, which is
what makes a status enquiry resolvable at all.

This should replace the contested-point row in the JWE chapter's decision
table, and the payer exit-checklist note in Payer Overview that says "Confirm
which the gateway pairs on before the demo".

### A3. Domain headers are named in the sources

The same closing section says: "Domain headers. This chapter says a few facts
may be written on the outside of the envelope and that each use case says which
it allows. No use case chapter names one, in this documentation or in the
sources behind it. Send none until a payer asks for one."

Two sources name them.

`reference/nhcx-site/doc/documents/NHCX Notification Integration.md` lists, in
its `domain_values` table, `x-hcx-amount_submitted` (amount submitted by the
provider), `x-hcx-benefit-category_type` (the specialty), `x-hcx-benefit_code`
(an array of the benefits or services submitted) and `x-hcx-action` (the event
type). These are the facts the exchange carries in clear so a beneficiary's app
can render a notification without opening anything.

`reference/nhcx-site/pages/domain-specifications__healthcare-operation-policy__access-control.md`
requires an insurance marketplace to "submit the acquired consent as part of
the domain header" before it may see individual claim data. That is a domain
header with a policy attached to it.

### A4. `x-hcx-use_case` is an envelope field and the field table omits it

The envelope table in JWE, Status and Errors lists ten fields plus `alg` and
`enc`. `x-hcx-use_case` appears twenty-five times in the workbook, marked
Optional throughout, and the Preauth request row gives its values:
**New / Enhancement / Resubmit**.

This matters beyond completeness. Preauthorisation Enhancement in the FHIR
Reference opens by saying nothing in the payload distinguishes an enhancement
from a resubmission or from a first request, and that "the declaration that
this is an enhancement lives entirely at the protocol layer, in the workflow ID
and the correlation ID". There is a header whose whole purpose is to make that
declaration, and the chapter does not know about it.

Add the field to the envelope table, and add a line to the enhancement chapter.

### A5. `x-hcx-ben-abha-id` is optional

The workbook marks it Mandatory on every request and every response on every
sheet, including exchanges with no beneficiary in the payload such as the
insurance plan poll. That is wrong: the field is optional. The handbook marks
it Optional, and the sandbox accepts messages that leave it out. Send it when
the beneficiary has an ABHA number.

### A6. `x-hcx-debug_flag` has a documented value

The envelope table groups `error_details`, `debug_details` and `debug_flag` as
"used only when something has gone wrong" and gives no values. The workbook
types `x-hcx-debug_flag` as an enum and gives `INFO`.

### A7. PAYR-1114 is cited and never defined

PMJAY Sandbox Run says the item category rule holds "exactly as `PAYR-1114`
says". That code is defined nowhere in the handbook. It is defined in
`reference/nhcx-site/doc/documents/Standard Error Codes.md`, Coverage Error
Codes sheet:

> Invalid speciality code received as %s for item %s. Please try again with
> valid data. Speciality code is available as the code of the category for
> specific cost of plan in insurance plan.

This is a symptom of B2 below rather than a fault of its own.

---

## Part B: missing chapters

### B1. Biometric authentication

The largest hole. Biometric verification gates every PMJAY preauthorisation and
every PMJAY claim. The handbook describes it in prose twice, in PMJAY Use Cases
D2 and in PMJAY Provider, and gives no endpoint, no header, no body, no
response and no error anywhere. An integrator can build every other exchange
from this set and still not get a patient registered.

The corpus carries the whole thing:

- `reference/nhcx-site/doc/hmisdocuments/Biometric Authentication Implementation Steps.md`
- `reference/nhcx-site/doc/hmisdocuments/Biometric Authentication APIs Postman Collection.md`
- `reference/nhcx-site/doc/hmisdocuments/FaceAuth Postman Collection.md`

What a chapter written from them would carry, none of which is in the handbook
today:

| Point | Detail |
| :---- | :---- |
| Fingerprint and iris base path | `https://apisbx.abdm.gov.in/hcx/abha/biometric/auth/{init,verify}` |
| Refresh | `GET .../hcx/abha/biometric/auth/refresh/token`, with the refresh token in an `R-token` header |
| Face auth base path | `https://apisbx.abdm.gov.in/pmjay/sbxhcx/abdmproxy/abha/biometric/...`, a different host path from the other two |
| Face auth sequence | `faceauth/init`, then a QR at `https://phrsbx.abdm.gov.in/face-auth?txnId=…` scanned in the ABHA app, then `capture/pid` polled until `COMPLETE`, then `v2/auth/verify` |
| Two headers on every call | `process: Preauth|Discharge` and `payerid: <participant code>` |
| Authorisation header | `Authorization`, not `bearer_auth`, which the handbook notes in passing but never ties to these calls |
| `scope` and `authMode` | `["abha-login","aadhaar-bio-verify"]` with `FINGERPRINT`, `aadhaar-iris-verify` with `IRIS`, `aadhaar-face-verify` with `FACE_AUTH` |
| Token lifetimes | `expiresIn` 1800 seconds, `refreshExpiresIn` 1296000 seconds, which is 15 days |
| Refresh discipline | The source advises calling refresh once within every 10 days to keep a chain alive indefinitely |
| Aadhaar encryption | A published X.509 public key and the transformation `RSA/ECB/OAEPWithSHA-1AndMGF1Padding` |
| What comes back | `token`, `refreshToken` and an ABHA profile including name, gender, date of birth, address and photo |

Note that `process: Preauth|Discharge` is the header behind the handbook's
recurring phrase "process type Discharge" in the cyclic-procedure rules. The
handbook uses the term without ever saying it is an HTTP header.

This existed as its own section in the earlier tree, at
`SHCXv4/docs/l1/08-biometric-authentication/`, with the two Postman collections
beside it. It was dropped rather than never written.

### B2. An error-code directory

`PAYR-` codes are the most frequently consulted thing in a live integration.
The handbook scatters them across ten chapters and never lists them. Codes and
Value Sets names the `ClaimError` and `PreauthError` families and lists
neither, and carries no `PAYR-1xxx` at all.

`reference/nhcx-site/doc/documents/Standard Error Codes.md` holds 376 rows over
seven sheets:

| Sheet | Rows |
| :---- | :---- |
| Bridge Error | 137 |
| Claim Error Codes | 82 |
| Preauth Error Codes | 80 |
| Coverage Error Codes | 26 |
| Payer Error Codes | 22 |
| NHCX Error Codes | 21 |
| Insurance Plan Error | 8 |

The earlier tree had this as `SHCXv4/docs/l1/11-reference/01-standard-error-codes.md`
and again as a 12,500-word directory at
`SHCXv4/docs/release/agy_tmp/l2/09-codes-and-references/03-error-codes.md`.
Both were dropped.

### B3. A troubleshooting chapter

The handbook has no symptom-to-cause path. A reader with a failure in hand has
to know which chapter their error belongs to before they can look it up.

`SHCXv4/docs/release/agy_tmp/l2/11-troubleshooting/` held four pages, including
a diagnostic playbook built on a five-layer fault isolation model: HTTP
transport, gateway routing, JWE envelope, FHIR schema, adjudication rules, with
the code ranges that belong to each layer. That model is the right spine for
this set and it is already written.

### B4. The status exchange

On both sandbox exit checklists. Named in Provider Overview as the thing to
call when a case goes quiet. Named in the Provider UI Guide as the prerequisite
for offering a refresh control. Covered in half a page of Predetermination,
Status and Search and nowhere else.

The Status sheet of
`reference/nhcx-site/doc/documents/NHCX Requests and Responses for UseCases.md`
gives the complete header table for both directions: payload an empty string,
`correlation_id` set to the `api_call_id` of the message being asked about,
`x-hcx-status` `request.dispatched` on the callback, `x-hcx-use_case` carrying
New, Enhancement or Resubmit, and `x-hcx-error_details` where the original
failed.

### B5. Search

Provider exit item 10. No provider chapter. The Search sheet in the same
workbook gives both directions in full, and confirms the handbook's observation
that the Task code is stated inconsistently: the request row says `code` is
`status` while the callback description says `code=poll`.

### B6. Notifications and the beneficiary service provider

One bullet in NHCX Use Cases (E1). The source is a complete integration
document: `reference/nhcx-site/doc/documents/NHCX Notification Integration.md`.
It carries the subscribe-on-login model and its last-linked-wins rule, the
subscribe payload field by field, the callback payload, the six event types
with their status values, a four-row error table, and the token, callback and
privacy requirements. It is also where the domain headers of A3 are named.

### B7. The access-control matrix

Participants and Policies disposes of this in one sentence: "Each role comes
with a fixed list of what it may send and receive."

`reference/nhcx-site/pages/domain-specifications__healthcare-operation-policy__access-control.md`
is that list, as a matrix of role against allowed action, and it carries
material consequences the handbook never mentions:

- `research` sees aggregate and anonymised data only.
- `member.isnp` sees the same, plus individual claims where the beneficiary has
  consented, with the consent carried in the domain header.
- `agency.sponsor` has payer-equivalent access.
- `HIE/HIO.NHCX`, another exchange, can never see the payload at all.
- Providers may run search and status against their own requests; payers
  against their own payment notices. This settles the contradiction noted in
  Part D below.

### B8. Governance and operating policy

Five pages in the corpus with no counterpart in the handbook.

| Page | What it carries |
| :---- | :---- |
| `…healthcare-operation-policy__guidelines-event-audits.md` | Every event digitally signed and logged; append-only logs; retention for a period set by law; the audit trail transparently available to the customer |
| `…data-security-and-privacy__audit-and-reporting.md` | The audit log must be queryable by participants through an API; each instance publishes its report list and its archival policy |
| `…data-security-and-privacy__transport-security.md` | TLS everywhere, HTTPS only in production |
| `…healthcare-operation-policy__guidelines-for-grienvance-redressal.md` | Nodal governance bodies contactable through the registry, published grievance types and SLAs, escalation to the operator, reopening, a versioned policy signed at onboarding |
| `…healthcare-operation-policy__guidlines-beneficiary.md` | Aadhaar eKYC and Aadhaar authentication as the general beneficiary-verification route, of which PMJAY biometrics is one case |

The first review of this set noted the absence of a security, privacy and
retention chapter. These pages are what it would be built from.

### B9. The participant registry attribute table

`reference/nhcx-site/pages/technical-specifications__open-protocol__registries.md`
gives the registry's fields with their obligations and cardinalities. The
handbook covers the status values and misses the rest, including
`payment_details`, which holds a UPI ID or an account number and IFSC code and
is the only place on the network where a participant's bank details live.

### B10. Cross-gateway relay

One Glossary bullet and a paragraph in JWE, Status and Errors treat multiple
exchange instances as a formatting curiosity. The appendix at
`reference/nhcx-site/pages/technical-specifications__appendix-NHCX-relay-example.md`
names three concrete scenarios: a provider and payer onboarded to different
instances, a beneficiary treated out of state, and **top-up policies where the
primary and secondary insurer sit on different instances**. Secondary and
top-up cover is not mentioned anywhere in the handbook.

### B11. The payer service workflow guide

`reference/nhcx-site/hmisdocuments/External_NHCX_Payer_Service_API_Workflow_Guide.docx`
is the authority for the role walk that PMJAY Sandbox Run documents from
observation. It is the only payer-side operational guide in the corpus, and the
handbook reaches it only through a provider chapter.

It is also the one file in `hmisdocuments/` with no extraction under `doc/` and
no row in `doc/INDEX.md`. Extracting it is a prerequisite for writing against
it, and is a fault in the mirror rather than in the handbook.

---

## Part C: thin coverage inside existing chapters

**The sandbox API specifications.** `reference/nhcx-site/README.md` lists twelve
Swagger endpoints, one per service, including the three the handbook calls
unobserved: status, search and notifications. No chapter mentions that a live
specification exists for any exchange. That is the authoritative API surface
and the reader is never pointed at it.

**The test matrix.** Provider Checklist cites the test cases and reproduces
none. `reference/nhcx-site/doc/hmisdocuments/NHCX-PMJAY-HMIS Test Cases.md`
carries eight worked cases with preconditions, inputs, validation rules and
expected output, plus a nineteen-row scenario list that includes registration
cancel, wallet update and discharge in multiple modes with the amount
calculation for each.

**Named but never explained**, all of them scheme rules that decide money:

| Item | Where it appears now |
| :---- | :---- |
| `GstApplicable`, `GstPercentage` | One row of the flags table in PMJAY Provider |
| `IncentiveApplicable`, and the `incentive` adjudication total | One row, and one word in a totals list |
| `LengthOfStay`, the maximum length of stay | One row, though it bounds the `LM100` day count |
| `nullify`, `suspend`, `release` Task codes | Listed, with the admission that the sources say no more |
| The eligibility forward instruction | Two sentences, no fields, no flow |
| `request.stopped` | In the status list and the glossary, never explained |
| Turnaround time | Drives queue order, auto-approval and alerts across six chapters, with no window values anywhere |

**Aadhaar eKYC** as the non-PMJAY beneficiary verification route, from B8.

---

## Part D: defects and maintenance

| Defect | Where |
| :---- | :---- |
| `billablePeriod` is attributed to "chapter 01's tenth rule". Rule 10 is the base64 double-encoding rule. Stale after rules 12 to 14 were added | FHIR Reference 06 |
| The Sources block is duplicated, seven lines apart, with identical text | FHIR Reference 05, lines 70 and 77 |
| A 20 MB whole-bundle maximum is stated in four chapters and a 21 MB plan response in five. The contradiction is never remarked on | Overview 09, Provider 03 and 07, FHIR Reference 01, 04, 05, 18 |
| "Search is not a provider exchange" contradicts NHCX Use Cases B6, Provider Checklist item 10 and Adjudicating Claims. The access-control matrix in B7 settles it: providers may search their own requests | FHIR Reference 16 |
| "Exchanges this documentation does not cover" appears verbatim in two chapters, so two copies must be kept in step | Provider 09, Payer 08 |
| The chapter on the two query modes, now Payer Flexibility, sat outside the numbering as 10a and appeared in none of the nine reading paths | Overview, README |
| Cross-reference style varies: "Chapter 05/06", "chapter 12", "the next chapter", "the Preauthorisation Response chapter". No stable identifiers, so nothing can be deep-linked | Throughout |
| `External_NHCX_Payer_Service_API_Workflow_Guide.docx` is not extracted and not indexed in the mirror | `reference/nhcx-site/doc/INDEX.md` |

---

## Part E: what has no answer

These stay open. Nothing in the corpus settles them, and the handbook is right
to say so. Collected here so the question is asked once, at onboarding, rather
than rediscovered per chapter.

- **The NHCX public key** for validating the JWT on inbound calls, and the
  header it arrives in. Until it is supplied, every callback endpoint built
  from these documents accepts unauthenticated patient data.
- **The `/v1/error` body schema.** Field names are unpublished.
- **The production base addresses.** The participant service's, the ABDM
  gateway's, the use-case base `https://apisprod.nha.gov.in/hcx` and the portal
  `https://nhcx.abdm.gov.in` are published; the ABDM proxy, the PMJAY payer
  service and the dummy payer have none, and are confirmed at onboarding. Base
  URLs lists them all.
- **`currency` on money fields.** Every sample now carries `INR` on
  `Claim.total` and on `PaymentNotice`, but no source states that it is
  required.
- **Payment notices 31 and 33.** Only the initiation is sampled, so the settled
  notice that carries a real bank reference has never been observed.
- **Timestamp format and zone**, which remains genuinely contested between the
  protocol page, the handbook, the FAQ and the samples.
- **Turnaround-time windows.** The `ScheduledTATApproval` flag and the
  `tatquery` reason exist, FAQ 13 says there is no fixed TAT, and no window
  values are published.
- **The forward instruction.** One sentence in the coverage eligibility source;
  no fields and no flow are published.
- **Which search endpoint the sandbox accepts from a provider.** The exit
  checklist names `/v1/search/submit`, which the specification routes from NHA
  to the payer; the policy's own-case form is `/claim/search`.
- **`suspend`** appears only as a code, with a one-line gloss in the value sets.

*(Note: the earlier concern about missing rejection samples is closed. The package carries a rejected preauthorisation on workflow 23, `fhir/C5/C5-rejected-wf23.json` and `fhir/C5/C5-rejected-wf23-pmjay.json`, and a rejected claim on workflow 291, `fhir/C7/C7-rejected-wf291.json` and `fhir/C7/C7-rejected-wf291-pmjay.json`, rendered in FHIR Reference 09 and 13.)*


---

## Suggested order

1. **Part A**, all seven. They are corrections to live text, they are cheap, and
   two of them remove decisions integrators are currently told to negotiate.
2. **B1, biometric authentication.** The one thing that cannot be built from
   this set at all, with a complete source and a dropped predecessor chapter.
3. **B2 and B3, the error directory and the troubleshooting chapter.** Both
   existed in the earlier tree and both are what a reader reaches for under
   pressure.
4. **B4 and B5, status and search.** Small, fully sourced, and both are on the
   exit checklists the set is meant to get a reader through.
5. **B7 and B8, access control and governance.** These are what a compliance
   reviewer asks for and there is nothing to hand them today.
6. **Part C**, folded into the chapters that already exist.
7. **B6, B9, B10, B11** as the material allows, with B11 blocked on extracting
   the file.

---

## Status, 13 September 2026

Every item was re-checked against the chapter text and the sources, and the
ones found unresolved were fixed then. Resolved means the chapter now says what
the item asks, from a source. Open means no source settles it; the question is
in Part E and in the onboarding list in Governance and Audit.

| Item | Status | Where |
| :---- | :---- | :---- |
| A1, the workflow code is optional | Resolved | JWE, Status and Errors; Envelope Fields |
| A2, the correlation rule | Resolved: one rule for request, response and status, over 25 workbook rows (8, 16 and 1) | Payer Overview; JWE, Status and Errors; Envelope Fields |
| A3, domain headers | Resolved; the prefix is `x-hcx-` throughout | JWE, Status and Errors; Envelope Fields |
| A4, `x-hcx-use_case` | Resolved; the enhancement has its own request, workflow 13 with `Enhancement`, and each use case shows its own workflow code | Envelope Fields; FHIR Reference |
| A5, `x-hcx-ben-abha-id` | Resolved | JWE, Status and Errors; Envelope Fields |
| A6, `x-hcx-debug_flag` | Resolved; send `INFO` if you send it | Envelope Fields |
| A7, `PAYR-1114` | Resolved | Error Codes; Troubleshooting |
| B1, biometric authentication | Resolved, with the face scope on `auth/init` and the headers given per call | Biometric Authentication |
| B2, the error directory | Resolved: eighteen collisions, not twenty; `ERR-PYR-CLM-007` as a code met live; live messages that contradict the sheet noted; ClaimError and PreauthError listed | Error Codes; FHIR Reference, Codes and Value Sets |
| B3, troubleshooting | Resolved | Troubleshooting |
| B4, the status exchange | Resolved: the payload is an empty string, and there is no status Task | Status and Search; FHIR Reference, Status and Search |
| B5, search | Resolved, stated once and alike everywhere; which endpoint the sandbox accepts from a provider is open | Status and Search; Access Control and Roles; Provider Checklist; NHCX Use Cases |
| B6, notifications | Resolved; the request goes to the portal host with `Authorization` | Notifications and Patient Apps |
| B7, access control | Resolved | Access Control and Roles |
| B8, governance | Resolved | Governance and Audit |
| B9, registry attributes | Resolved | Access Control and Roles |
| B10, cross-gateway relay | Resolved, trimmed to the source's three scenarios | JWE, Status and Errors |
| B11, the payer service guide | Resolved, with the guide named as the source | PMJAY Adjudication APIs |
| Sandbox API specifications | Resolved, twelve rows | Environments and Addresses; Introduction; Status and Search; Notifications and Patient Apps |
| The HMIS test matrix | Resolved: the eight test cases and the nineteen scenarios | Provider Checklist |
| GST and incentive | Resolved with the sourced description and the worked totals; no rate is published | PMJAY Provider |
| `LengthOfStay` | Resolved | PMJAY Scheme Rules; PMJAY Provider |
| `release`, `nullify`, `suspend` | Resolved for `release` and `nullify`; `suspend` is open | FHIR Reference, Cancel, Reprocess and Shortfall; Preauthorisation |
| The forward instruction | Open; the routing patterns that no source gave were removed | Registration and Eligibility; Eligibility Response |
| `request.stopped` | Resolved | JWE, Status and Errors; Envelope Fields; Status and Search |
| Turnaround time | Open; the window hours that no source gave were removed | Payer Checklist; Governance and Audit |
| Aadhaar eKYC | Resolved | Governance and Audit; Registration and Eligibility |
| The Part D defects | Resolved: the rule reference, the duplicate Sources block, the size limits, the search contradiction and the duplicated list (one copy, in the Provider Checklist) | FHIR Reference; PMJAY Provider; Provider Checklist |
| Cross-references | Resolved: chapters are named rather than numbered, and generated links are relative inside the package | Throughout |
| The payer service guide's extraction | Resolved in the source mirror | `knowledge/sources` |
| Found on the re-check | Two PMJAY rules cite codes the sheets read differently: `PAYR-1322` for one request at a time, which is the live message rather than the sheet's, and `PAYR-1018` and `PAYR-1008` for a refused Task. Left as the live readings and flagged here | FHIR Reference, Preauthorisation Enhancement; Cancel, Reprocess and Shortfall |

---

## Status, 18 October 2026

Two resolutions above no longer hold as written. Building a Provider, Field
Corrections, records the runs against the sandbox payer that changed them.

| Item | Status now | Where |
| :---- | :---- | :---- |
| A1, the workflow code is optional | Overtaken for two exchanges. The insurance plan request and the status enquiry travel under `x-hcx-workflow_id` `1`, always: no NHCX workflow code names either, and a build that sent the leg's correlation ID there got an empty workflow id back. The insurance plan request never carries the case number. Elsewhere the step code is sent where the sheet gives one; the eligibility sample carries `11`, Patient Admitted | Field Corrections; Status and Search; Envelope Fields |
| B4, the status exchange | Overtaken. The sandbox refuses `/v1/status` with `NHCX-1012`, whatever correlation ID it carries, so "the payload is an empty string, and there is no status Task" is no longer the build. The status enquiry is a `Task` coded `status`, with the input `claimNumber` alone, on `/v1/task/submit`, answered on `/v1/task/on_submit`, on a fresh correlation ID. A2's third row, the status correlation pointing at another message's call ID, applies only to the `/v1/status` form the sandbox refuses | Status and Search; Field Corrections |
| Query answers on a submit path | New, not in the register before. An answer to a preauthorisation or claim query (workflow 19, 131, 151, or 161 under PMJAY) on `/v1/preauth/submit` or `/v1/claim/submit` travels as `x-hcx-status` `request.initiated`. The workflow sheet pairs those codes with `response.complete`, which NHCX refuses on a submit path with `NHCX-1011` | Field Corrections; Workflow Codes; Payer Flexibility |
| Production base addresses (Part E) | Narrowed. NHA's environments page publishes the production use-case base, `https://apisprod.nha.gov.in/hcx`, and the production portal, `https://nhcx.abdm.gov.in`. `baseurl.yaml` still leaves the exchange's production address blank, so the generated address tables do too | Base URLs; Environments and Addresses |
| `currency`, and the coverage-based plan (Part E) | `currency`: narrowed, every Claim and PaymentNotice sample carries `INR`, and no source says it is required. The coverage-based plan: closed, `fhir/C4/C4-response-generic.json` is a live capture of it, rendered in FHIR Reference 07 | Governance and Audit; FHIR Reference, Insurance Plan Response, Coverage-Based |
| Reprocess and claim resubmission | New. A decided claim is never sent again. A rejected claim goes back as a reprocess `Task` on workflow 36, reason `claimrejected` or `rejectiondisputed`, offered only for a rejected claim; a part-paid claim's balance is asked for as a `release` Task | Field Corrections; Discharge and Claim; FHIR Reference, Cancel, Reprocess and Shortfall |

