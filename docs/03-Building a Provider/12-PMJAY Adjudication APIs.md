# PMJAY adjudication APIs

A PMJAY case is not decided over NHCX. The exchange carries the submission to
the scheme and carries the verdict back, but the decision itself is taken in
the State Health Agency's own Transaction Management System, by a named role,
on that system's schedule. Between the two sits the NHCX Payer Service, which
is how an external integrator reads and drives that queue.

The previous chapter, PMJAY Sandbox Run, records what one case did; this one
is the interface.

The source for the endpoints, the roles and their action names is the NHCX
Payer Service API Workflow Guide for External Integrators, a supporting
document on the portal's NHCX-PMJAY-HMIS Integration page, and it remains the
authority on them. What the service did beyond the guide, the case id it
insists on, its refusals and its pace, is from that sandbox run.

It matters to two audiences. A scheme payer building its own side needs to know
what shape the exchange expects a role-based queue to present. An integrator
testing against the sandbox needs it because there is no other way to make a
PMJAY case move.

## Two endpoints, two hosts

| What | Where |
| :---- | :---- |
| Who holds the case | `POST https://apisbx.abdm.gov.in/pmjay/sbxhcx/nhcxpayerservice/v1/get/user-role` |
| Act on the case | `POST https://apisbeta.nha.gov.in/pmjay/hcx/nhcxpayerservice/wrapper/process/case` |

Both take an ordinary ABDM session token on `bearer_auth`, with
`Content-Type: application/json` and `Accept: application/json`. The token is
the same one every other call uses, minted from the participant's client ID and
secret at the sessions endpoint. In the sandbox it lives 1,200 seconds.

Note that the two endpoints sit on different hosts. That is not a
documentation error; it is how the service is deployed.

Both addresses are sandbox addresses. `apisbeta.nha.gov.in` is the only
published address for acting on a case, and no production host is published
for either call. Ask for both production hosts at onboarding and keep them
configurable, as Base URLs advises for every other service.

## Who holds the case

<!-- build-docs:api 13-adjudicator/adjudicator-role.bru -->
```bash
curl --location --request POST 'https://apisbx.abdm.gov.in/pmjay/sbxhcx/nhcxpayerservice/v1/get/user-role' \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --header 'bearer_auth: Bearer <access token>' \
  --data-raw '{
    "caseid": "<case number>",
    "payerid": "<payer code>"
  }'
```
<!-- build-docs:end -->

```json
{ "currentuserrole": "PPD-Trust", "errormessage": null }
```

**`caseid` is the scheme's case id, not the hospital's claim number.** It is
the digits at the end of the case reference the payer issues. Asked about a hospital's own number the
service answers that no data was found and tells you to use the current active
case id.

A hospital therefore has to learn the scheme's case id for every
preauthorisation it raises. The sandbox gives it out in two places: inside the
`PAYR-1238` refusal of the next request for that beneficiary, and, once a
request is accepted, in the payer's acknowledgement and status answers on the
case. Store it beside your own claim number the moment it appears.

**Read the role before every action.** The service moves cases on its own
schedule, and the role that answers is the only one whose action names are
legal. A cycle that assumes the next step in the table will be refused.

**A preauthorisation role on a claim means "not yet".** If the role lookup
still answers `PPD-Trust` while you are asking about a claim, the case has not
left the preauthorisation queue. The role names where the case is, not what you
are asking about.

## Acting on the case

One endpoint, one body shape, with the action spelled exactly as the table
gives it for the role that currently holds the case.

<!-- build-docs:api 13-adjudicator/adjudicator-process.bru -->
```bash
curl --location --request POST 'https://apisbeta.nha.gov.in/pmjay/hcx/nhcxpayerservice/wrapper/process/case' \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --header 'bearer_auth: Bearer <access token>' \
  --data-raw '{
    "casenumber": "<case number>",
    "action": "Approve",
    "receivercode": "<payer code>",
    "usecase": "PREAUTH",
    "correlationid": "<correlation id>",
    "sendercode": "<participant code>",
    "memberid": "<member id>",
    "remarks": "ok"
  }'
```
<!-- build-docs:end -->

| Field | What it carries |
| :---- | :---- |
| `casenumber` | The scheme's case id, as above |
| `action` | Exactly as the role's row gives it. Case-sensitive |
| `usecase` | `PREAUTH`, `CLAIM`, or the committee's own name |
| `receivercode` | The payer's registry id, without the `@hcx` suffix |
| `sendercode` | The provider's participant code, without the suffix |
| `memberid` | The beneficiary |
| `correlationid` | **A fresh UUID for every call** |
| `remarks` | Free text the desk records |

## The role walk

| Step | Role | Actions | `usecase` |
| :---- | :---- | :---- | :---- |
| Preauthorisation | `PPD-Trust` | `Approve`, `Reject`, `Query` | `PREAUTH` |
| Claim 1 | `CEX-Trust` | `Forward` | `CLAIM` |
| Claim 2 | `CPD-Trust` | `cpdApprove`, `cpdReject`, `Pending` | `CLAIM` |
| Claim 3 | Medical Audit Committee | `Approve`, `Reject`, `iQuery` | `Medical Audit Committee` |
| Claim 4 | `ACO-Trust` | `Approve`, `Reject`, `Pending` | `CLAIM` |
| Claim 5 | `SHA-Trust` | `Approve`, `Reject`, `Pending` | `CLAIM` |
| Claim 6 | Claim Review Committee | `Approve`, `Reject`, `Pending` | `Claim Review Committee` |

Four things about that table.

**A preauthorisation is one decision. A claim walks a queue.** The roles map
onto the scheme's own staff: the Preauthorisation Processing Doctor, the claim
executive, the Claim Processing Doctor, the audit and accounts roles, the State
Health Agency and, on appeal, the Claim Review Committee.

**The action names are not consistent between roles.** `CPD-Trust` takes
`cpdApprove` and `cpdReject`; every other role takes `Approve` and `Reject`.
Sending `Approve` to `CPD-Trust` is refused.

**`usecase` changes at the two committees** and carries the committee's full
name with spaces, not a code.

**Not every case walks all six.** On the run recorded in PMJAY Sandbox Run the
claim was forwarded by `CEX-Trust`, approved by `CPD-Trust`, then by
`ACO-Trust` and `SHA-Trust`, after which the role lookup answered with no role
at all. Neither committee held the case. The six steps are the roles a case
*may* pass through, not a queue every case walks.

## How the decision comes back

The desk call and the NHCX callback are two halves of one step. Acting on the
case makes the scheme issue its verdict, and that verdict arrives at the
provider over NHCX as an ordinary `ClaimResponse` on the original request's
correlation id.

So a provider system driving this in a sandbox has to hold both threads: the
payer service call it just made, and the callback it is waiting for. They are
correlated by the case, not by the correlation id of the desk call, which is
fresh every time.

## What it refuses, and what those refusals mean

- **`No Data found with the caseid <id>. Please use the current active case id.`**

  You asked with the hospital's claim number instead of the scheme's case id.

- **`Event Meta Log not found for correlationId`**

  The exchange has not finished delivering the request you are acting on. Try
  again shortly.

- **`Case not found for caseId`**

  The case is mid-filing. Try again shortly.

- **An action refused for the current role**

  Read the role again. It has moved, or it never was what you assumed.

The first is a modelling error and needs a fix. The second and third are timing
and are safely retried.

## What it will not do

**It is not a status API over NHCX.** A `Task` coded `status` sent to the
scheme is refused, first with `PAYR-1018` for a missing reason code and then
with `PAYR-1008` for a code and reason combination the scheme does not accept.
Where a case stands is read here, not asked for over the exchange.

**It re-queues rather than answering immediately.** The scheme acknowledges an
enhancement it has been asked to approve by answering `queued` again, and
decides in its own time. On one run the enhancement was approved a minute after
the ask; on another it was still queued five minutes on, with the same bundle.
Nothing in what you send changes that, and a test suite has to report the
scheme's pace rather than assert it away.

**One request at a time on a case.** `PAYR-1322`, which the sandbox sends as
"active instance found" although the error sheet gives it another message, is
the rule behind most of the timings above. A claim raised while an enhancement is
still queued is refused, and the role lookup still answers with the
preauthorisation role because the case has not left that queue.

## What a scheme payer should take from this

If you are building the payer side rather than testing against it, the shape
worth copying is the separation. The exchange carries messages; the queue
decides cases; the two are joined by a case id the payer issues and the
provider stores. Three consequences follow for your own build.

- **Issue a case number on the first answer and repeat it on every later one.**
  The provider files the case under it and every subsequent action names it. A
  desk asked about a case by the hospital's own number should still find it,
  but the published reference implementation does not, which is why the
  provider has to learn yours.
- **Acknowledge before you decide.** Answer every submission at once with an
  interim response, or the exchange retires the correlation before your
  adjudicator gets to it. Error Codes covers `NHCX-1010`.
- **Expose where a case is.** Whatever your equivalent of the role lookup is,
  a provider needs it, because your queue is invisible from the exchange.
