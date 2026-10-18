# APIs

Every call the application makes for NHCX, in one list. Each row links to its full spec in [../apis/](../apis/INDEX.md). All of them run in-process: outbound messages go through [G7. Send](../gateway/G7-send.md), lookups through [G9. Ledger](../gateway/G9-ledger.md) or [G10. Beneficiary Registry](../gateway/G10-beneficiary-registry.md). Inbound messages are the callbacks in [CALLBACK.md](CALLBACK.md).

## Outbound to NHCX

| # | API | Call | What it does | Replies | Screens |
|---|---|---|---|---|---|
| [A5](../apis/A5-claim-submit.md) | Claim Submit | `gateway.send("v1/claim/submit")` | Files the claim after discharge: the pre-auth bundle with `use: claim`, the pre-auth reference, the completed procedure, discharge details and claim-stage documents; also answers a claim query. Needs the IPD admission linked; a decided claim is never sent again. | [C1](../callbacks/C1-callback-door.md), [C6](../callbacks/C6-claim-on-submit.md) | [S11](../screens/S11-claim-submission.md), [S18](../screens/S18-beneficiary-verification.md) |
| [A6](../apis/A6-task-submit.md) | Task Submit (cancel, status, reprocess, release) | `gateway.send("v1/task/submit")` | Sends a Task for a follow-up: cancel the pre-authorisation, ask the status of a leg, ask for a rejected claim to be reprocessed, or ask for the unpaid balance to be released. | [C1](../callbacks/C1-callback-door.md), [C8](../callbacks/C8-enquiry-on-submit.md) | [S11](../screens/S11-claim-submission.md) |

## Ledger queries (polling)

Polling is the fallback when a callback is missed. Opening a claim runs these for every leg still waiting.

| # | API | Call | What it does | Replies | Screens |
|---|---|---|---|---|---|
| [A10](../apis/A10-txn-related.md) | Transaction Related | `ledger.related(txn_id)` | Lists every ledger row on the same thread as a send, newest first, to find the payer's reply and apply it as its callback would. | [C1](../callbacks/C1-callback-door.md), [C6](../callbacks/C6-claim-on-submit.md), [C8](../callbacks/C8-enquiry-on-submit.md) | [S11](../screens/S11-claim-submission.md) |
| [A11](../apis/A11-txn-dispatch.md) | Transaction Dispatch | `ledger.dispatch(txn_id)` | Says what became of a send's dispatch to NHCX (`dispatched`, `dispatch_failed`); a refusal's text is read from the entry. | [C8](../callbacks/C8-enquiry-on-submit.md) | [S11](../screens/S11-claim-submission.md) |
| [A12](../apis/A12-txn-fhir.md) | Transaction FHIR | `ledger.fhir(txn_id)` | Returns the stored, decrypted envelope of one ledger row, so a poll can read what a reply says. | [C1](../callbacks/C1-callback-door.md), [C6](../callbacks/C6-claim-on-submit.md), [C8](../callbacks/C8-enquiry-on-submit.md) | none |
| [A13](../apis/A13-txn-list.md) | Transaction List | `ledger.list()` | Lists the ledger to find a ProtocolResponse rejection addressed to one of our sends (for example PAYR-1008). | [C1](../callbacks/C1-callback-door.md) | none |

## Payer adjudication (sandbox testing)

| # | API | Call | What it does | Replies | Screens |
|---|---|---|---|---|---|
| [A14](../apis/A14-adjudicator-user-role.md) | Adjudicator User Role | payer service `get/user-role`, or the IRDAI desk | Reads which payer role holds a case now, and so which actions are legal. | none | none |
| [A15](../apis/A15-adjudicator-process-case.md) | Adjudicator Process Case | payer service `process/case`, or the IRDAI desk | Takes one decision on a pre-auth or claim, or walks a case through every role (at most 8 rounds) until it is decided. | none | none |
| [A16](../apis/A16-gateway-token.md) | Gateway Token | `gateway.token(participant)` (G3) | Supplies the ABDM session token the payer service calls need, unless a payer service token is configured. | none | [S19](../screens/S19-nhcx-settings.md) |

## ABDM calls beside the exchange

Plain JSON to ABDM with the session token: the beneficiary's biometric authentication and their ABHA. No JWE, no protocol headers, no ledger row.

| # | API | Call | What it does | Replies | Screens |
|---|---|---|---|---|---|
| [A18](../apis/A18-biometric-authentication.md) | Biometric Authentication | `abdm.biometric.init / capture / verify / refresh` | Proves the beneficiary is at the hospital: a fingerprint, iris or face authentication against their ABHA through ABDM's biometric service, as the proof of presence card on the Pre-authorisation tab (stage Preauth) and on the Claim tab (stage Discharge), before admission too. Optional for any payer, required by a government payer or a plan asking for the Aadhaar proof of identity. The user token it yields rides on the eligibility check, the pre-authorisation and the claim; the scheme's consent questionnaire stands in only where no capture is possible. | none | [S18](../screens/S18-beneficiary-verification.md) |

## Application

| # | API | Call | What it does | Replies | Screens |
|---|---|---|---|---|---|
| [A17](../apis/A17-claim-state.md) | Claim State | `GET claims/view/:caseid/state` | Runs the same polls as opening the claim, then returns everything the claim's tabs show as one JSON document, for scripted drivers and tests. | [C6](../callbacks/C6-claim-on-submit.md), [C8](../callbacks/C8-enquiry-on-submit.md) | [S6](../screens/S6-claim-detail.md) |
