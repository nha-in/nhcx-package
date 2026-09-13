# Payer flexibility

NHCX gives each payer room to run a few parts of the exchange its own way. The endpoints, the envelope and the bundles stay the same for every payer. What a payer can choose is how it raises a query, how much detail its answers carry, and when it first sends its own case number. Build your integration to handle every option, keep a setting per payer, and one integration works with any payer on the network. Today PMJAY uses one set of options and private insurers use another.

## In short

- **Query mode.** A payer raises a query either on the claim thread, as a `ClaimResponse`, or through the communication API, as a `CommunicationRequest`. PMJAY uses the first, private insurers the second. Answer in the mode the query came in.
- **Answer detail.** Every payer uses the same core entries, workflow ids and status words. PMJAY adds a few fields on top. A reader built for the full set reads every payer.
- **Case number.** The payer's own case number arrives in `preAuthRef`. When it first arrives depends on the payer. File the case under it.
- **Task spelling.** The reprocess and cancel Tasks both carry `intimationNumber`, whatever the payer.

## Query mode

Hold a query mode per payer and route the answer by it.

### On the claim thread

PMJAY uses this mode. The query arrives as a `ClaimResponse` with `outcome` `partial`, on the case's own thread. Its workflow id is 24 for a pre-authorisation, 241 for an enhancement and 27 for a claim.

The answer is the whole bundle again, on `/v1/preauth/submit` or `/v1/claim/submit`, under a new correlation id. Its workflow id is 19, 131 or 161.

In this mode a claim query answered on 151, 19 or 16 is refused with `PAYR-1321`; 161 is the id PMJAY takes. The desk's reply travels on the bundle's `CQD` supporting information, so a resubmission that carries no reply is decided as if none was given.

A `CommunicationRequest` in this mode is not a query. It is a notification: a turnaround-time alert, a grievance, a wallet or policy change, a request for extra information, or an arbitration intimation, named in `Task.reasonCode`. Acknowledge it with the same Task bundle, `Task.status` `completed`, within thirty seconds, and leave the case's status alone.

### Through the communication API

Private insurers use this mode. The query arrives as a `CommunicationRequest` task bundle on `/v1/communication/request`, on a new thread, carrying 24, 241 or 27 with `request.initiated`. A `CommunicationRequest` carrying `additionalinfo`, or no reason code at all, is the query itself.

The answer is a `Communication` task bundle on `/v1/communication/on_request`, on the request's own correlation id, echoing the request's workflow id.

## Answer detail

Every payer answers with the same core set of workflow ids and status words.

| Message | Workflow id | Status |
| :---- | :---- | :---- |
| Pre-authorisation or enhancement received | 20 | `response.partial` |
| Pre-authorisation approved, rejected | 21, 23 | `response.complete` |
| Enhancement approved, denied | 22, 231 | `response.complete` |
| Claim received | 25 | `response.partial` |
| Claim approved, rejected | 26, 291 | `response.complete` |
| Cancellation done | PC02 | `response.complete` |
| Arbitration acknowledged | 37 | `response.complete` |
| Payment notice | 30 | `request.initiated`, on a new thread |

A `ClaimResponse` bundle from any payer carries the `ClaimResponse`, the `Patient`, both `Organization` entries and the `Coverage`, in that order. Item adjudications carry `submitted`, `eligible` and `benefit`; totals carry the same three. PMJAY adds `eligpercent`, `eligquant`, `tax` and `incentive`; a private insurer omits them and adds nothing of its own. A reader built for the full set reads every payer without a change.

## When the case number arrives

The payer's own number for the case arrives in `ClaimResponse.preAuthRef`. A private insurer sends it on every answer, the acknowledgement on 20 or 25 included. PMJAY sends it on the first answer that decides or queries a pre-authorisation, on 21, 23 or 24, and on the claim's acknowledgement on 25; its acknowledgement on 20 carries none. `ClaimResponse.identifier` stays the hospital's own number on every answer. The payer's desk files the case under its own number and every later action names it. Keep it on the record the moment it arrives. A desk asked about a case by the hospital's own number answers that no such case exists.

## One spelling on the Task

The cancel and reprocess Tasks both carry their second input as `intimationNumber`. A reprocess under any other spelling is refused with `PAYR-1008`. Reprocess goes on 36 and is acknowledged on 37, and the new verdict follows on the claim's own thread.

## Next steps

- Cancel, reprocess and shortfall, in the FHIR Reference: the Task bundles element by element
- Communication, in the FHIR Reference: the query and the notification on one endpoint pair
- Claim query and answer, in the FHIR Reference: the scheme's query inside the claim response
- Sample bundles, in the FHIR Reference: the collection every shape here is taken from
