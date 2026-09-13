# Payment and communication

Two exchanges arrive unasked. The payer initiates both, and the provider's job is to receive, act, and acknowledge.

## Payment notices

### What the user sees

A payments screen, per case, showing the sequence as it happens: initiated, processed, settled. On settlement, the UTR number, the gross amount, the TDS and other deductions, and the net. A button to acknowledge. Reconciliation staff will match the UTR against the bank statement, so print it as text they can read and select. Copyable means a copy control next to the printed value, not the value tucked inside an input box in its place.

### What the system hosts

```
callback /v1/paymentnotice/request     workflows 30, 31, 33
```

Three notices can arrive for one claim, and each is a fresh delivery to acknowledge: 30 when the payer initiates, 31 when the bank processes, 33 when it settles. Only 33 carries the UTR. Mark the case settled on 33, not before.

### What comes in

A collection bundle: a `Task` with code `deliver` wrapping a `PaymentNotice` and a `PaymentReconciliation`, plus the two `Organization`s.

- `PaymentNotice.amount` is the net paid; `paymentStatus` is `paid` or `cleared`.
- `PaymentReconciliation.paymentIdentifier.value` is the UTR.
- `PaymentReconciliation.detail[]` itemises the money: one line with type `TDS`, one with type `Payment`, and any others the payer uses (approved amount, service tax, advance, recovered, penalty). Net plus deductions should equal the approved amount; if it does not, flag it.

### The acknowledgement

A `Task` with `status = completed`, code `status`, and an output of type `status` whose value is `paymentack`, plus the claim number as a second output. Workflow 17. Send it to the payer.

Where it goes is stated two ways on the portal: the Payment document and exit checklist say `/v1/paymentnotice/on_request`; the handbook says `/v1/task/submit`. Build to send to `on_request` and make the path configurable per payer.

## Communication requests

### What the user sees

An inbox. Each message has a reason, a priority and a body, and needs a different response. A request for additional information needs documents attached; this is how a payer asks for more on a case. A turnaround-time alert goes to the claims desk to chase. A grievance needs a reply and possibly a corrective action. A benefit update should refresh the balance shown on the case. A policy change should trigger a plan refresh. An arbitration acknowledgement just tells the desk the appeal has been received.

### What the system hosts

```
callback /v1/communication/request
reply    /v1/communication/on_request
```

Switch on `Task.reasonCode`: `additionalinfo`, `tatquery`, `grievance`, `walletupdate`, `policychange`, `claimArbitration`. Build the `additionalinfo` path first; it is the query channel on the general network. Then `tatquery`, which the handbook reports as the most common reason in live traffic.

### What comes in, and what goes back

A collection bundle: a `Task` with code `poll` and an input of type `include` pointing at a `Communication`, plus the `Organization`s. On the `Communication`: `category` (reminder, notification, instruction or questionnaire), `priority` (routine, urgent, asap, stat), `topic` (usually progress-update), and the case reference as its identifier.

The answer is the same bundle shape sent back with the same correlation ID, the provider `Organization` first, and `Task.status = completed`. For a plain acknowledgement, send it within the 30-second window regardless of whether the underlying issue is resolved. For an `additionalinfo` request, the answer carries the requested documents as well.

## What to reconcile

The reconciliation is what accounts works from, so store its lines rather than only the net.

| Line type | What it is |
| :---- | :---- |
| `Payment` | The net amount the bank moved |
| `TDS` | Tax deducted at source |
| `approvedamount`, `claimedamount` | What was granted and what was asked |
| `servicetax`, `advance`, `recovered`, `penality` | Other adjustments the payer applies. Note the spelling of the last one; it is the payer's |

Net plus deductions should equal the approved amount. When it does not, flag it rather than silently accepting the difference, because that is the only place a short payment shows up before the shortfall window opens.

A return payment, where money has to come back, has its own codes: RP1 intimation, RP2 acknowledged, RP3 failed.

## Two acknowledgements, and they are different things

The screen should not confuse them, and neither should the code.

| | Transport acknowledgement | Business acknowledgement |
| :---- | :---- | :---- |
| What it is | The `202` and receipt your callback returns | A `Task` on workflow 17 sent back to the payer |
| When | Automatically, within 30 seconds of the notice arriving | When the notice has been recorded against the claim |
| Who sees it | Nobody. It is protocol | The desk, as a button and a sent state |
| What it means | The message was taken in | The provider has recorded the payment |
| What happens without it | The exchange retries five times, then retires the correlation ID | Under PMJAY, the shortfall window never opens |

## Notifications for patients

If the hospital also runs a patient app, it can subscribe on the beneficiary's behalf and receive the same events as human-readable messages. That is a separate participant role, covered under the E-series in the Overview.
