# Status and search

Two exchanges that are not about a claim's progress but about finding out what
happened to one. Both sides build them, both are on the sandbox exit
checklists, and neither carries clinical content. Status asks the exchange
where a message went. Search asks a payer for cases matching criteria.

They belong here rather than in the provider or payer sections because they are
shared: the A-series, built once, used by both.

## Status

A sender asks the exchange what became of a message it already sent. It is a
protocol operation, not a FHIR one.

| | |
| :---- | :---- |
| Call | `POST /v1/status` |
| Callback | `POST /v1/on_status` |
| Payload | **An empty string.** No bundle, no Task, no resource of any kind |

Everything travels in the protected header. That is the whole design, and it is
why a status check costs nothing to answer.

### The request header

| Field | Value |
| :---- | :---- |
| `x-hcx-status` | `request.initiated` |
| `x-hcx-correlation_id` | **The `api_call_id` of the message whose status you are asking about** |
| `x-hcx-api_call_id` | A fresh UUID, as always |
| `x-hcx-sender_code`, `x-hcx-recipient_code` | The same two codes as the message you are asking about: you, and its recipient |
| `x-hcx-ben-abha-id` | Optional |
| `x-hcx-workflow_id` | Optional |
| `x-hcx-use_case` | Optional. `New`, `Enhancement` or `Resubmit` on the status sheet |

The correlation rule is the exception that proves the rule set out in Envelope
Fields. Everywhere else a correlation ID threads a conversation. Here it points
at another message's call ID, because that is the only way to name the message
you are asking about. Keep your own `api_call_id` values; without them you
cannot ask this question at all.

### The answer

Arrives on `/v1/on_status`, again with an empty payload.

| Field | What it tells you |
| :---- | :---- |
| `x-hcx-status` | `request.dispatched` where the message reached the recipient. The other exchange-side values are `request.queued` and `request.stopped` |
| `x-hcx-error_details` | Present where the original failed, with `code`, `message` and `trace` |
| `x-hcx-correlation_id` | The correlation of your status request |

`request.stopped` is the one to act on. It means redelivery was exhausted and
the correlation has been retired, so the original request is dead and a retry
needs a fresh correlation ID.

### When to call it

Not on a timer. The exchange delivers answers to your callback, and polling for
something that will arrive on its own is wasted traffic on both sides. Call it
when a case has gone quiet for longer than the payer's expected turnaround, and
call it from a support screen rather than from the claims desk.

The Provider UI Guide makes the point the other way round: do not offer a
chase control unless you have implemented this exchange behind it, because a
control that does nothing is worse than no control. A Refresh button that reads
again what the callbacks have stored is not a chase, and is the default.

### A note on the path

The Technical Specifications table names the pair `/hcx/status` and
`/NHCX/on_status`. The sandbox Postman collection uses
`https://apisbx.abdm.gov.in/hcx/v1/status` and `/hcx/v1/on_status`. Build
against the Postman form, which is what the sandbox serves, and keep the path
configurable.

The status service's sandbox specification is at
`https://hcxsbx.abdm.gov.in/statushcxservice/swagger-ui-custom.html`.
Environments and Addresses lists it with the others.

### The status enquiry as a Task

The sandbox refuses `/v1/status` with `NHCX-1012`, whatever correlation ID it
carries. What works is asking the payer: a `Task` coded `status` on
`/v1/task/submit`, answered on `/v1/task/on_submit`.

| Field | Value |
| :---- | :---- |
| `Task.code` | `status`, from the financial task code system |
| `Task.input` | `claimNumber` alone, the case's claim number |
| `Task.status`, `intent` | `requested`, `order` |
| `x-hcx-workflow_id` | **`1`, always**, for the preauthorisation and the claim alike |
| `x-hcx-correlation_id` | A fresh one, as on any request. The enquiry is its own thread |
| `x-hcx-status` | `request.initiated` |

**Why `1`.** No NHCX workflow code names a status check: the only Task codes
the workflow sheet gives are 36, reprocess, and PC01, cancel. So the header
never carries the leg's correlation ID, which is a UUID and not a workflow id,
nor a stage code that means something else. A build that sent the claim's
correlation ID there got an answer with an empty workflow id. The insurance
plan request goes under `1` for a similar reason: it belongs to the hospital and
the policy, not to one case.

The answer is a `Task` whose output includes a `ClaimResponse`, read with the
parser you already have. Ask it of the preauthorisation only while that is
waiting for the payer; once it is decided, ask it of the claim. A payer that
answers no status Task, PMJAY among them, is not asked: the screen does not
offer the action, and "What neither exchange gives you" below says what to do
instead.

## Search

Two different exchanges share the word. A provider may search, but only its
own cases, and the sources do not settle which endpoint that search goes to.

| | Own-case search | Cross-payer search |
| :---- | :---- | :---- |
| Endpoints | `/preauth/search`, `/claim/search`, `/paymentnotice/search`, each with its `on_search` | `/v1/search/submit`, `/v1/search/on_submit` |
| Who calls it | The participant whose messages these were | NHA, or a regulator such as IRDAI |
| Scope | Requests that originated from the caller | Any claim, at every payer |
| Also serves | Status lookups on those resources | |

The access-control policy is explicit that providers may make search and status
requests for requests that originated from them, and that payers may do the
same for their own payment notices. A provider's search over its own cases is
`/claim/search` under that policy. A regulator's search is forwarded by the
exchange to every payer, each answering under the regulator's policies.

The Technical Specifications route `/search/submit` from NHA through NHCX to
the payer: a cross-payer search for NHA or a regulator. But the provider
sandbox exit checklist, item 10 "Claim Search", names `/v1/search/submit`, and
the payer exit checklist expects that search to arrive from a provider. No
source confirms which of the two endpoints the sandbox accepts from a provider.
Treat it as open: confirm with NHA before the demo, and keep the endpoint
configurable. Access Control and Roles sets out the same rule.

The search service's sandbox specification is at
`https://hcxsbx.abdm.gov.in/searchhcxservice/swagger-ui-custom.html`.

### The request bundle

A `Task` in a collection bundle.

| Element | Value |
| :---- | :---- |
| `Task.status` | `requested` |
| `Task.basedOn` | The request reference being searched for |
| `Task.code` | See the warning below |
| `Task.input[]` | One or more criteria, each with a type from the input value set and a `valueString` |

Input types, from
`https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-task-input-type-code`:

| Input | What it narrows by |
| :---- | :---- |
| `ClaimNumber` | The case number |
| `IntimationNumber` | The intimation number |
| `PolicyNumber` | The member's policy |
| `ProductNumber` | The benefit product |
| `PayerId`, `ProviderId` | The two participants |
| `FromDate`, `ToDate` | The window |
| `FinanceYear` | Policy or financial year |
| `ServiceCode` | A benefit or service code |

### The answer

A `Task` bundle whose `output` references the matching `ClaimResponse`
resources in the same bundle, resolved exactly as a reprocess or cancel answer
is. Parse those with the `ClaimResponse` parser you already have.

**A search may be answered across several callbacks.** `response.partial` is
valid on `/v1/search/on_submit`, and only the last carries `response.complete`.
Accumulate against the correlation ID rather than treating the first answer as
the whole result set.

### The Task code is stated three ways

The value set defines `search` as the code for searching claim responses. The
Search sheet of the same workbook gives `status` on the request and `poll` on
the callback. Nothing has been observed, so none can be confirmed.

Agree the code with the payer in writing before you build this, and record what
you agreed. It is the one field that decides whether the message reaches the
right queue.

## What neither exchange gives you

Under PMJAY, where a case actually stands is not readable over NHCX. A case
sits at `request.initiated` until somebody acts on it in the scheme's own
system, and a `Task` coded `status` is refused. The role lookup on the payer
service is what answers that question instead; PMJAY Adjudication APIs in
Building a Provider has it.

So a provider system needs both: the status exchange for "did my message
arrive", and, for PMJAY, the role lookup for "who is holding this case now".
