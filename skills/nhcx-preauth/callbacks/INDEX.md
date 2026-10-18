# Callbacks

Every message NHCX delivers to the application. NHCX posts it to the application's public inbound route (`/in/<path>` or `/v1/<path>`, whichever the registered `endpoint_url` points at); [G8. Receive](../gateway/G8-receive.md) decrypts it and hands it in-process to C1, then records it and C1's outcome in [G9. Ledger](../gateway/G9-ledger.md). APIs (A) and screens (S) refer to these by C number. Each file has ENDPOINT (E), DESCRIPTION (D), REQUEST (Q), PSEUDOCODE (P), RESPONSE (S) and USED BY (U) sections.

| # | Callback | NHCX route | Answers | File |
|---|---|---|---|---|
| [C1](C1-callback-door.md) | Callback Door | every route | [A2](../apis/A2-coverage-eligibility-check.md), [A6](../apis/A6-task-submit.md), [A10](../apis/A10-txn-related.md), [A13](../apis/A13-txn-list.md) | [C1-callback-door.md](C1-callback-door.md) |
| [C3](C3-auth-requirements-on-check.md) | Authorisation Requirements Ruling | `v1/coverageeligibility/on_check` | [A2](../apis/A2-coverage-eligibility-check.md) | [C3-auth-requirements-on-check.md](C3-auth-requirements-on-check.md) |
| [C4](C4-insuranceplan-on-request.md) | Insurance Plan Reply | `v1/insuranceplan/on_request` | [A3](../apis/A3-insurance-plan-request.md) | [C4-insuranceplan-on-request.md](C4-insuranceplan-on-request.md) |
| [C5](C5-preauth-on-submit.md) | Pre-auth Reply | `v1/preauth/on_submit` | [A4](../apis/A4-preauth-submit.md) | [C5-preauth-on-submit.md](C5-preauth-on-submit.md) |
| [C7](C7-cancel-on-submit.md) | Cancel Reply | `v1/task/on_submit` | [A6](../apis/A6-task-submit.md) | [C7-cancel-on-submit.md](C7-cancel-on-submit.md) |
| [C8](C8-enquiry-on-submit.md) | Enquiry Reply | `v1/task/on_submit`, status route | [A6](../apis/A6-task-submit.md) | [C8-enquiry-on-submit.md](C8-enquiry-on-submit.md) |
