# Envelope fields

Every field on the JWE protected header, with its obligation, its type and the
rule that governs it. JWE, Status and Errors in the Overview explains what the
envelope is and why it is separate from the letter. This chapter is the table
you check a field against while you are building one.

The authority here is the Technical Specifications page on the portal, which
carries the current header table, together with the ten sheets of the NHCX
Requests and Responses workbook, which state the obligation of each field per
exchange. Where the older Open Protocol page differs it is noted, because it is
still published and still read.

## The fields

| Field | Type | Obligation | What it carries |
| :---- | :---- | :---- | :---- |
| `alg` | String | Mandatory | Key wrapping. `RSA-OAEP-256` |
| `enc` | String | Mandatory | Content encryption. `A256GCM` |
| `x-hcx-sender_code` | String | Mandatory | Your participant code |
| `x-hcx-recipient_code` | String | Mandatory | The recipient's. For a provider, the processor code from the policy lookup |
| `x-hcx-api_call_id` | UUID | Mandatory | Fresh on every message, including responses |
| `x-hcx-request_id` | UUID | **Optional** | One per originating request. The Open Protocol page marks it Mandatory; the Technical Specifications page marks it Optional |
| `x-hcx-correlation_id` | UUID | Mandatory | The thread. See the rule below |
| `x-hcx-workflow_id` | String | **Optional** | Which step, or which case. See the two readings below |
| `x-hcx-timestamp` | datetime | Mandatory | See the format note below |
| `x-hcx-status` | String | Mandatory | Where this message stands. Values below |
| `x-hcx-ben-abha-id` | String | **Mandatory** | The beneficiary's ABHA number. Mandatory on every exchange, including those with no beneficiary in the payload |
| `x-hcx-use_case` | String | Optional | Values differ by exchange, see below |
| `x-hcx-error_details` | JSON object | Optional | `code`, `message`, `trace`. Mandatory on a protocol response |
| `x-hcx-debug_details` | JSON object | Optional | The same shape, for debugging |
| `x-hcx-debug_flag` | Enum | Optional | `Error`, `Info` or `Debug`. A server may ignore it |

**The `x-hcx-use_case` values are not one enum.** The workbook states them on
three sheets and they are not the same on all three.

| Sheet | Permitted values |
| :---- | :---- |
| Preauth | `New`, `Enhancement`, `Resubmit` |
| Status | `New`, `Enhancement`, `Resubmit` |
| Claim | `New`, `Resubmit` |

A claim cannot be enhanced, which is why `Enhancement` is absent from that row.
Both workbooks agree, sheet for sheet.

**`x-hcx-debug_flag` is typed two ways.** The Technical Specifications page
gives the enum as `Error`, `Info` or `Debug`. The NHCX Requests and Responses
workbook types it as Enum with the single value `INFO`, on its response
headers, and every header table in the FHIR Reference and every sample in the
API collection that carries the field sends `INFO`. The field is optional and a
server may ignore it. Where you send it, send `INFO`, as the samples do. No
source says whether a server checks the case of the value.

Three of those obligations are not stated anywhere else in this documentation
and are worth reading twice. `x-hcx-request_id` is optional. `x-hcx-workflow_id`
is optional. `x-hcx-ben-abha-id` is mandatory.

## The correlation ID rule, in full

The rule is stated in two halves in two places, which has been read as a
contradiction. It is not one. The workbook has twenty-five correlation rows:
twenty-four state one half or the other, and they fit together, and the
twenty-fifth gives the status enquiry its own rule.

| On a | Set `correlation_id` to | Rows stating it |
| :---- | :---- | :---- |
| Request | This message's own `api_call_id` | 8 |
| Response | The `correlation_id` of the request being answered | 16 |
| Status enquiry | The `api_call_id` of the message whose status you are asking about | 1 |

So the initiator seeds the thread from its own call ID, and every responder
echoes what it received. The Open Protocol page says the same thing in prose:
the correlation ID "may be chosen as the message_id of the original sender's
system. For return messages responders are expected to populate with the one in
the request."

The sandbox exit checklists describe the initiator's half; the protocol pages
describe the responder's. Build both and threading works.

Two further rules, and both bite on retries.

- `api_call_id` and `correlation_id` must be **different values** on a
  response. The exit checklists check this on every answering use case.
- A correlation ID that has failed is **retired**. The next attempt needs a
  fresh one. Reusing it earns `NHCX-1006`, duplicate request, or goes nowhere.

## The workflow code means two different things

This is the field most likely to be misunderstood, because the sources define
it twice and the definitions are not the same.

**As a step code.** The Workflow Status Sheet assigns a number to each step of
a claim: 12 a new preauthorisation, 21 approved, 24 queried, and so on. This is
the reading the Workflow Codes chapter documents and the one the reference
payer validates.

**As a case thread.** The Open Protocol page defines it as the "unique id of
workflow that may span over a series of message exchanges, e.g. an eligibility
check, a preauth and then claims submission for a patient may be linked with
such an id". The Technical Specifications page keeps both readings in one
sentence: "Workflow id depicts the current process/state of the case. It may
span over a series of message exchanges for a given transaction."

The field is **Optional** on all twenty-five rows of the workbook, across all
ten sheets, including CoverageEligibility and Insurance Plan. So the exchanges
for which the Workflow Status Sheet assigns no code are exchanges on which the
header may simply be omitted. There is nothing to negotiate.

In practice: send the step code where the sheet gives one, because that is what
the payer keys on. Send nothing where it does not. Agree the case-thread
reading with a payer only if one asks for it.

## Status words

The Technical Specifications page defines all seven.

| Value | Sent by | Meaning |
| :---- | :---- | :---- |
| `request.initiated` | The initiator | Starting the request cycle |
| `request.queued` | The exchange | Queued at NHCX, waiting to be processed |
| `request.dispatched` | The exchange | Successfully reached the recipient's system |
| `request.stopped` | The exchange | Stopped completely after failed attempts to reach the recipient |
| `response.partial` | The responder | A partial response, or an acknowledgement of the request |
| `response.complete` | The responder | The final response, closing the cycle |
| `response.error` | The responder | The request was rejected, or an error was met |

`request.stopped` is the one nothing else explains. It is what the exchange
records when redelivery has been exhausted, and it is the state behind a
retired correlation ID.

**The Open Protocol page carries a different set entirely**: `request.initiate`,
`request.retry`, `response.success`, `response.fail`,
`response.sender_not_supported`, `response.unhandled`,
`response.request_retry`. None of those seven appears in the workflow sheet, in
any sample, or in the gateway's own validation messages. It is a superseded
draft. Do not build against it, and be ready to meet it in older material.

## Timestamp

Contested in format and in zone, and the chapter on JWE, Status and Errors sets
out the disagreement. Two facts settle part of it.

- **The workbook types the field as a Unix timestamp** and gives `1706308383`
  as its example on every sheet. The handbook and the FAQ use ISO 8601. Every
  sample bundle uses ISO 8601 with `+05:30`.
- **There is one numeric tolerance.** The reference payer refuses a message
  whose timestamp is more than **24 hours** behind the current time, with
  `PAYR-1005`. That is the only bound any source states.

Send ISO 8601 with `+05:30`, because that is what the samples carry. Accept a
Unix epoch on the way in. Note that the ABDM sessions call is a different
matter: its `TIMESTAMP` header is UTC with a trailing `Z` and milliseconds, and
a drifted clock is refused.

## Domain headers

The Overview says a few facts may be written on the outside of the envelope for
the exchange's records. There is a naming convention for them and there are
named examples, which is more than this documentation has said before.

**The convention**, from both the Open Protocol and Technical Specifications
pages:

```
x-hcx-<use_case_name>-<parameter_name>
```

where `use_case_name` is under sixteen characters and ideally matches the API
path segment, and `parameter_name` is under thirty-two characters. Both pages
print the prefix as `x-NHCX-`. Send `x-hcx-`, for the reason given under The
header prefix below.

**The named examples.** The Notification Integration document carries four in
its `domain_values` table, which is what the exchange passes to a beneficiary's
app so it can render a message without opening anything:

| Header | What it carries |
| :---- | :---- |
| `x-hcx-amount_submitted` | The amount submitted by the provider |
| `x-hcx-benefit-category_type` | The benefit category, meaning the specialty |
| `x-hcx-benefit_code` | An array of the benefits or services submitted |
| `x-hcx-action` | The event type, such as `preauth_response` |

The eObjects page adds a `Usage` domain header on the Claim Request and Claim
Response, carrying `preauthorization` or `claim`.

And the access-control policy makes one of them load-bearing: an insurance
marketplace must "submit the acquired consent as part of the domain header"
before it may be given individual claim data. Access Control and Roles has the
rest.

Send none of these to a payer that has not asked for one. But they are named,
they have a convention, and the earlier statement in this documentation that no
source names any of them was wrong.

## The header prefix

The Open Protocol page writes every field as `x-NHCX-`. The Technical
Specifications page, the workbook, the FAQ, the Postman collections and every
sample write `x-hcx-`. Send `x-hcx-`.

## What the receipt carries

Not a protected header, but the shape every participant must return within
thirty seconds of a delivery.

```json
{
  "timestamp": "04/09/2026 11:46:41:305",
  "api_call_id": "<from the incoming header>",
  "correlation_id": "<from the incoming header>",
  "result": {
    "sender_code": "…",
    "recipient_code": "…",
    "entity_type": "preauth",
    "protocol_status": "request.queued"
  },
  "error": { "code": "", "message": "" }
}
```

HTTP `202`. Not `200`, not an empty body. `entity_type` is derived from the
path: the second-to-last segment, or the last where that is `v1`, with `on_`
stripped.
