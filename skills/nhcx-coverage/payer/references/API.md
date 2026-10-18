# APIs

Every call the application makes for NHCX, in one list. Each row links to its full spec in [../apis/](../apis/INDEX.md). All of them run in-process: outbound answers and payer-started messages go through [G7. Send](../gateway/G7-send.md), registry lookups through [G4. Registry and Certificates](../gateway/G4-registry.md) or [G10. Beneficiary Registry](../gateway/G10-beneficiary-registry.md), and the ledger reads through [G9. Ledger](../gateway/G9-ledger.md). Inbound messages from hospitals are the callbacks in [CALLBACK.md](CALLBACK.md).

## Outbound to NHCX

Answers to a hospital's message travel on its correlation id; a query and a payment notice open a thread of their own.

| # | API | Call | What it does | Answers | Screens |
|---|---|---|---|---|---|
| [A1](../apis/A1-eligibility-answer.md) | Eligibility Answer | `gateway.send("v1/coverageeligibility/on_check")` | Answers a coverage eligibility check on the spot: the enrolment found by member id, ABHA, mobile or subscriber id as in force, lapsed or no cover; for `auth-requirements`, the ruling per quoted package with its rate, documents and forms. | [C1](../callbacks/C1-callback-door.md), [C2](../callbacks/C2-coverage-eligibility-check.md), [C3](../callbacks/C3-insurance-plan-request.md) | [S4](../screens/S4-members.md), [S5](../screens/S5-subscriptions.md), [S8](../screens/S8-procedures.md), [S9](../screens/S9-procedure-configurator.md), [S11](../screens/S11-fhir-preview.md) |
| [A2](../apis/A2-insurance-plan-answer.md) | Insurance Plan Answer | `gateway.send("v1/insuranceplan/on_request")` | Serves the package master for the product a plan request names (by product id, UIN, alias or the enrolment id an eligibility answer handed out), or an empty plan when nothing matches. | [C2](../callbacks/C2-coverage-eligibility-check.md), [C3](../callbacks/C3-insurance-plan-request.md) | [S6](../screens/S6-policies.md), [S7](../screens/S7-policy-configurator.md), [S8](../screens/S8-procedures.md), [S9](../screens/S9-procedure-configurator.md), [S11](../screens/S11-fhir-preview.md) |

## Ledger queries (polling)

Polling is the fallback when a callback is missed. Opening a case runs these for every thread still waiting on the hospital.

| # | API | Call | What it does | Answers | Screens |
|---|---|---|---|---|---|
| [A11](../apis/A11-txn-related.md) | Transaction Related | `ledger.related(txn_id)` | Lists the ledger rows on the same thread as a payer send, to find a hospital's reply (a Communication, a payment acknowledgement) when its callback was missed, and apply it as the callback would. | none | none |
| [A12](../apis/A12-txn-fhir.md) | Transaction FHIR | `ledger.fhir(txn_id)` | Reads one ledger row's decrypted bundle and headers, for A11 and the exchange log. | none | none |

## Application

| # | API | Call | What it does | Answers | Screens |
|---|---|---|---|---|---|
| [A15](../apis/A15-case-exchange.md) | Case Exchange Log | `GET cases/:id/exchange`, `GET cases/:id/exchange/:msgId`, `GET cases/:id/fhir`, `GET cases/:id/forms` | What went over the exchange about a case, in both directions with the bundles, the forms the hospital answered, and what this payer would send now; the state drivers and tests read. | none | [S3](../screens/S3-case-desk.md), [S11](../screens/S11-fhir-preview.md) |
| [A16](../apis/A16-abha-policy-link.md) | ABHA Policy Link | `registry.abha_link(body)`, `registry.abha_delink(body)` | Links or unlinks a member's ABHA number to their enrolment at ABDM through the registry (G10), records every attempt, and keeps the link local when no gateway is configured. | none | [S5](../screens/S5-subscriptions.md), [S12](../screens/S12-organisation.md) |
| [A17](../apis/A17-participant-lookup.md) | Participant Lookup | `registry.participant(code)` | Names participant codes through the registry (G4) so the desk shows who a code is; used by the organisation screen and the case list. | none | [S12](../screens/S12-organisation.md) |
| [A20](../apis/A20-abha-m1.md) | ABHA Create and Verify (ABDM M1) | `abdm.abha.enrol / login` | Puts a verified ABHA on a member's record: an existing ABHA verified by the OTP sent to its mobile, or a new one created from an Aadhaar OTP with an address chosen. The calls are ABDM's M1 and come from the MCP; this spec says what the desk does with them. | none | [S4](../screens/S4-members.md) |
