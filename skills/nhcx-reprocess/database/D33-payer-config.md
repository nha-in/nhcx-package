# D33. payer_config

#### D33T. TABLE
One row is one set of payer behaviours. Two rows always exist and are never deleted: **id 0, GOV**, the default for every government scheme (PMJAY and the State Health Agencies), and **id 1, PVT**, the default for every other payer. Every further row (id 2 onward) belongs to one payer by its participant code and overrides the default it is based on. Primary key `id`. No parent table.

#### D33D. DESCRIPTION
Everything the application does differently from one payer to another is read from this table, never from code: whether the authorisation requirements check and the coverage benefits check go out by themselves when the line items change, how often an open check is polled, whether proof of presence is required, how the payer asks for more, whether the discharge goes before the final claim, which procedure a LAMA or DAMA claim collapses to, the workflow ids of every send, and the rest of the properties [PAYERS.md](../references/PAYERS.md) lists. What PAYERS.md calls the `gov` adapter is row 0 and the `generic` adapter is row 1; wherever a spec reads "the adapter's" property, it reads this table through `payer_config_for` (below).

**The two default rows.** A migration creates them with the values below, which are today's behaviour, so an install upgraded to this table behaves exactly as before except for the two automatic checks the GOV row turns on. Their `payer_code` is null, every behaviour column is set (none is left empty), and they may be edited on [S20. Payer Configuration](../screens/S20-payer-configuration.md) but not deleted or deactivated.

| Column | id 0 GOV | id 1 PVT |
|---|---|---|
| `base` | `gov` | `pvt` |
| `payer_system` | `https://payer.pmjay.nha.gov.in` | `https://nhcx.abdm.gov.in` |
| `programme_code`, `programme_display` | `AB-PMJAY`, "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)" | empty, empty |
| `auth_requirements` | `auto` | `manual` |
| `coverage_benefits` | `manual` | `manual` |
| `check_poll_seconds` | 15 | 15 |
| `proof_of_presence` | `required` | `optional` |
| `preauth_document_stages` | `pre` | `pre` |
| `records_as_fhir` | 1 | 1 |
| `package_master` | 1 | 1 |
| `procedure_factors` | `1,0.5,0.25` | empty |
| `query_mode` | `resubmit` | `communication` |
| `task_case_input` | `initimationNumber` [SANDBOX](../references/PAYERS.md#markers) | `intimationNumber` |
| `status_enquiry` | 0 | 1 |
| `claim_search` | 1 | 0 |
| `discharge_step` | 1 | 1 |
| `lama_dama_procedure` | `LM100` | `LM100` |
| `custom_lines` | 0 | 1 |
| `communication_reply` | `pmjay` | `generic` |
| `reprocess_reasons` | `claimrejected,rejectiondisputed` | `claimrejected,rejectiondisputed` |
| `reprocess_member_type` | `PMJAY` | `MB` |
| `adjudication_desk` | `nhcx-payer-service` | empty |
| `workflow_ids` | `{"preauth":"12","preauth_resubmit":"121","preauth_query_response":"19","enhancement":"13","enhancement_resubmit":"131","cancel":"PC01","claim":"15","claim_query_response":"161","discharge":"14","discharge_query_response":"141","payment_ack":"17","reprocess":"36","release":"36","communication_preauth":"19","communication_claim":"161"}` | the same, with `claim_query_response` `151` and without `payment_ack` (the notice's own workflow id is echoed back) |

`auth_requirements` `auto` on the GOV row keeps what the `gov` adapter did (the check went out unasked before every pre-authorisation and enhancement) and adds the automatic check on line changes below. `lama_dama_procedure` is `LM100` on both rows because the collapse applied to every payer until now; a private payer that does not want it gets a row with the value empty.

**A payer's own row.** Added on [S20. Payer Configuration](../screens/S20-payer-configuration.md) for one payer picked from the participant master ([D32. participant](D32-participant.md)), or by code when the master does not hold it. `base` is the default it inherits from, set from the master's `entity_type` (`gov` or `pvt`) when the row is added and changeable. Every behaviour column on a payer row may be **empty (null)**, which means "as the default row of my base"; only what differs from the default is stored. `active` 0 keeps the row but ignores it, so the payer falls back to its default. A code may have one row only ("This payer already has a configuration.").

**Reading it: `payer_config_for(payer_id)`.** For the case's payer id (the policy's payer, not the processing id, [CORE.md](../references/CORE.md)):
1. the active row whose `payer_code` matches the payer id on its numeric part (the code with or without `@hcx`, in any case, is one payer), else none;
2. the default row: that row's `base` when there is one; else `gov` (row 0) when the participant master flags the payer `gov` or its registered name starts with `SHA` (case and leading spaces ignored); else `pvt` (row 1);
3. each column is the payer row's value when it is not null, else the default row's. `workflow_ids` is merged key by key: the payer row's keys over the default row's.

A per-environment workflow override (a JSON object of kind to workflow id, as before, for a sandbox quirk such as 161 on the SHA sandbox [SANDBOX](../references/PAYERS.md#markers)) is applied last, over the merged `workflow_ids`. A workflow kind neither the rows nor the override define is refused: "No workflow id is defined for '<kind>'." The resolved configuration is read afresh for each send and each screen load; it is not cached across requests, so a change on [S20. Payer Configuration](../screens/S20-payer-configuration.md) applies to the next action.

**Migration from earlier builds.** The `payer_adapter` rows of [D8. terminology](D8-terminology.md) and the module setting that mapped codes to adapter keys become payer rows here: one row per code, `base` `gov` for `gov` or `pmjay`, `pvt` for `generic` or `kyrocare`, every behaviour column null. Those sources are then no longer read.

**What each behaviour does.**
- `auth_requirements`: `auto`, the payer rules on procedure sets and the check (A2. Coverage Eligibility Check (in nhcx-coverage) `auth-requirements`) is sent by itself: after every change to the case's line items ([D16. claim_line](D16-claim-line.md): a line added, its package or code changed, a line removed; quantities and ward tiers do not change the set) and before every pre-authorisation and enhancement send, whenever the set's fingerprint differs from the last ruling's; the card on S8. Line Items (in nhcx-preauth) polls while the ruling is `checking`. `manual`, the desk may ask from the card and nothing goes unasked. `off`, the payer does not rule on procedure sets: the card is not shown and the check is never sent.
- `coverage_benefits`: the same three values for the benefits check on the quoted set (A2. Coverage Eligibility Check (in nhcx-coverage) `benefits`, the "Benefits check" card on S8. Line Items (in nhcx-preauth)): `auto` sends it after every change of the set and polls while the case is `checking`; `manual` leaves it to the desk; `off` hides the card.
- `check_poll_seconds`: how often a card whose check is out with the payer re-reads that check by itself (0: only on each load of the case, as before). Polling re-reads the one check, never the page, so nothing typed elsewhere is lost.
- `proof_of_presence`: `required` or `optional`, as A18. Biometric Authentication (in nhcx-coverage) reads it; the integration decision `verification.biometric` `where-payer-requires` follows it.
- `discharge_step`: 1 on both defaults, so every payer gets the discharge (workflow 14) first ([D20. claim_submission](D20-claim-submission.md)); a payer row set to 0 sends the claim directly (15). The decision `claim.dischargeStep` `where-payer-requires` follows it.
- `communication_reply`: the shape of a Communication reply (A7. Communication Reply (in nhcx-communication), F12): `pmjay` on GOV, `generic` on PVT. `workflow_ids` `communication_preauth` / `communication_claim` give a reply's workflow id (GOV `19` / `161`; PVT none, so the request's own id is echoed).
- `custom_lines`: 1 shows "Add a custom line" on the Line items card (S8. Line Items (in nhcx-preauth)) and lets the desk add a line that is not on the payer's plan, with the hospital's own code, name and price ([D16. claim_line](D16-claim-line.md)), with or without a fetched plan; 0 hides the button and refuses the add ("This payer takes only lines from its insurance plan."). Lines already added stay. GOV starts at 0 (a scheme quotes its package master, and an unpriced need goes as its unspecified package), PVT at 1.
- `lama_dama_procedure`: the procedure a LAMA or DAMA discharge before or during surgery collapses the claim lines to ([D20. claim_submission](D20-claim-submission.md), A5. Claim Submit (in nhcx-claim), F8. Claim (in nhcx-preauth)); empty, the claim keeps its lines.
- `claim_search`: 1 sends "Ask where it stands" on a claim as the claim search ([A6. Task Submit (cancel, status, reprocess, release)](../apis/A6-task-submit.md) `search`) for a payer that answers no status Task; GOV starts at 1 (PMJAY refuses the status Task and answers the search), PVT at 0.
- `query_mode`, `task_case_input`, `status_enquiry`, `records_as_fhir`, `package_master`, `procedure_factors`, `preauth_document_stages`, `programme_code`, `payer_system`, `reprocess_reasons`, `reprocess_member_type`, `adjudication_desk`: the adapter properties of the same names in [PAYERS.md](../references/PAYERS.md), with the same effect.

**Written by** [S20. Payer Configuration](../screens/S20-payer-configuration.md) only (and the migration). Each save writes `updated_at` and `updated_by` and an audit line naming the row and the columns changed.

#### D33C. COLUMNS
| column | type | null/default | meaning (and allowed values) |
|---|---|---|---|
| id | INTEGER | primary key | 0 GOV default, 1 PVT default, 2 onward one payer each |
| payer_code | TEXT | null, unique | the payer's participant code normalised with `@hcx` ([G5. Protocol Headers](../gateway/G5-protocol-headers.md)); null on rows 0 and 1 |
| base | TEXT | NOT NULL | `gov` or `pvt`: the default row a payer row inherits from (row 0 or row 1); on rows 0 and 1 their own kind |
| active | INTEGER | NOT NULL, default 1 | 0 ignores a payer row; always 1 on rows 0 and 1 |
| note | TEXT | null | the desk's own note; never shown as the payer's name |
| payer_system | TEXT | null | the payer code system on identifiers |
| programme_code | TEXT | null | the programme code on every claim line; empty for none |
| programme_display | TEXT | null | its display |
| auth_requirements | TEXT | null | `auto`, `manual`, `off` |
| coverage_benefits | TEXT | null | `auto`, `manual`, `off` |
| check_poll_seconds | INTEGER | null | 0 to 300; 0 polls only on load |
| proof_of_presence | TEXT | null | `required`, `optional` |
| preauth_document_stages | TEXT | null | comma list of D11 stages wanted at pre-authorisation, `pre` |
| records_as_fhir | INTEGER | null | 1 sends records as FHIR DocumentReference, 0 as the PDF |
| package_master | INTEGER | null | 1 the payer publishes an insurance plan (A3, C4) |
| procedure_factors | TEXT | null | comma list of `Claim.item.factor` values by rank, empty for none |
| query_mode | TEXT | null | `resubmit` or `communication` |
| task_case_input | TEXT | null | the Task input type naming the case beside `claimNumber` |
| status_enquiry | INTEGER | null | 1 the payer answers a status Task |
| claim_search | INTEGER | null | 1 "Ask where it stands" sends the claim search (`v1/search/submit`, A6 `search`) when the payer answers no status Task |
| discharge_step | INTEGER | null | 1 the discharge goes before the final claim |
| lama_dama_procedure | TEXT | null | procedure code a LAMA / DAMA claim before or during surgery collapses to; empty for none |
| communication_reply | TEXT | null | `pmjay` (PMJAY's CommunicationOnRequestDocument, F12) or `generic` (the F12 reply bundle) |
| custom_lines | INTEGER | null | 1 the desk may add custom lines (not on the plan) and sees the button; 0 not |
| reprocess_reasons | TEXT | null | comma list of the reprocess reason codes offered |
| reprocess_member_type | TEXT | null | the member identifier type on a reprocess Task |
| adjudication_desk | TEXT | null | `nhcx-payer-service` or empty |
| workflow_ids | JSON | null | object of send kind to workflow id; on a payer row only the kinds it changes |
| updated_at | TIMESTAMP | null | last save |
| updated_by | TEXT | null | who saved it |

#### D33K. KEYS AND INDEXES
- Primary key `id`. Rows 0 and 1 are inserted by the migration with explicit ids; payer rows take ids from 2 (a sequence or auto-increment starting at 2).
- Unique index on `payer_code` (nulls allowed, so rows 0 and 1 coexist).
- No foreign keys: a payer row may name a code the participant master ([D32. participant](D32-participant.md)) has retired.

#### D33U. USED BY
- Screens: [S11. Claim Submission](../screens/S11-claim-submission.md), [S19. NHCX Settings](../screens/S19-nhcx-settings.md), [S20. Payer Configuration](../screens/S20-payer-configuration.md)
- APIs: [A6. Task Submit (cancel, status, reprocess, release)](../apis/A6-task-submit.md)
- Database: [D1. organization](D1-organization.md), [D8. terminology](D8-terminology.md), [D9. claim](D9-claim.md), [D16. claim_line](D16-claim-line.md), [D20. claim_submission](D20-claim-submission.md), [D29. claim_enquiry](D29-claim-enquiry.md)
