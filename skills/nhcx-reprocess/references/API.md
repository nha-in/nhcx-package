# APIs

Every call the application makes for NHCX, in one list. Each row links to its full spec in [../apis/](../apis/INDEX.md). All of them run in-process: outbound messages go through [G7. Send](../gateway/G7-send.md), lookups through [G9. Ledger](../gateway/G9-ledger.md) or [G10. Beneficiary Registry](../gateway/G10-beneficiary-registry.md). Inbound messages are the callbacks in [CALLBACK.md](CALLBACK.md).

## Outbound to NHCX

| # | API | Call | What it does | Replies | Screens |
|---|---|---|---|---|---|
| [A6](../apis/A6-task-submit.md) | Task Submit (cancel, status, reprocess, release) | `gateway.send("v1/task/submit")` | Sends a Task for a follow-up: cancel the pre-authorisation, ask the status of a leg, ask for a rejected claim to be reprocessed, or ask for the unpaid balance to be released. | [C1](../callbacks/C1-callback-door.md), [C8](../callbacks/C8-enquiry-on-submit.md) | [S11](../screens/S11-claim-submission.md) |

## Ledger queries (polling)

Polling is the fallback when a callback is missed. Opening a claim runs these for every leg still waiting.

| # | API | Call | What it does | Replies | Screens |
|---|---|---|---|---|---|
| [A10](../apis/A10-txn-related.md) | Transaction Related | `ledger.related(txn_id)` | Lists every ledger row on the same thread as a send, newest first, to find the payer's reply and apply it as its callback would. | [C1](../callbacks/C1-callback-door.md), [C8](../callbacks/C8-enquiry-on-submit.md) | [S11](../screens/S11-claim-submission.md) |
| [A11](../apis/A11-txn-dispatch.md) | Transaction Dispatch | `ledger.dispatch(txn_id)` | Says what became of a send's dispatch to NHCX (`dispatched`, `dispatch_failed`); a refusal's text is read from the entry. | [C8](../callbacks/C8-enquiry-on-submit.md) | [S11](../screens/S11-claim-submission.md) |
| [A12](../apis/A12-txn-fhir.md) | Transaction FHIR | `ledger.fhir(txn_id)` | Returns the stored, decrypted envelope of one ledger row, so a poll can read what a reply says. | [C1](../callbacks/C1-callback-door.md), [C8](../callbacks/C8-enquiry-on-submit.md) | none |
| [A13](../apis/A13-txn-list.md) | Transaction List | `ledger.list()` | Lists the ledger to find a ProtocolResponse rejection addressed to one of our sends (for example PAYR-1008). | [C1](../callbacks/C1-callback-door.md) | none |

## Application

| # | API | Call | What it does | Replies | Screens |
|---|---|---|---|---|---|
| [A17](../apis/A17-claim-state.md) | Claim State | `GET claims/view/:caseid/state` | Runs the same polls as opening the claim, then returns everything the claim's tabs show as one JSON document, for scripted drivers and tests. | [C8](../callbacks/C8-enquiry-on-submit.md) | [S6](../screens/S6-claim-detail.md) |
