# S6. Claim Detail Screen

#### S6R. ROUTE
claims/view/:caseid (opens the Overview tab)
claims/view/:caseid/<tab key> (opens that tab; `?tab=<tab key>` is accepted as an alias)

`:caseid` is the case's stable public id (D9 `external_id`, else the row id), **never the claim number**: an accepted cancellation replaces the claim number (C7), and a route keyed on it breaks at that moment.

Page title: Claim <case number>

Breadcrumb: Claims (claims/list, S5) > <case number>

Companion endpoints: claims/view/:caseid/state (GET, JSON), and the case's message log for the Logs tab (GET, JSON).

#### S6D. DESCRIPTION
The shell for one claim case. A header says whose case it is and where it stands, a row of next-action buttons says what the case is waiting for, and a tab bar walks the episode in the order it happens. Switching tabs happens without a reload, and a tab once opened keeps what was typed in it while another tab is shown. An unknown case id shows a "Claim" card reading "Claim not found." A case still provisional (its validation not yet answered in force) is hidden from the lists of [S5. Claim Master](S5-claim-master.md); the desk waits for it on the validation gate of S2. Select Policy (in nhcx-coverage), which opens this screen once the cover is in force.

**Ids are shown on the Logs tab only.** Correlation ids and transaction ids appear nowhere on the case except the Logs tab, where the correlation id is shown bare (no label), in full, and copied on a click. No other card, chip, detail list or table of any tab shows either id. The adapter's name is never shown to the desk.

**Polling on load.** NHCX answers every leg asynchronously. The payer's reply normally arrives by callback ([G8. Receive](../gateway/G8-receive.md) hands it to C1), and each load of this screen is the fallback: before anything is drawn, it reads [G9. Ledger](../gateway/G9-ledger.md) once for every leg that is still out with the payer.

| Leg (where it shows) | Polled while | Poll failure shows |
|---|---|---|
| Eligibility check (Overview, S3. Policy Discovery (in nhcx-coverage)) | case status `checking` | muted note "Could not poll the gateway: <error>" on the Validation card |
| Insurance plan fetch (Pre-authorisation, S7. Insurance Plan (in nhcx-preauth)) | plan status `fetching` | muted note "Could not poll the gateway: <error>" on the Insurance plan card |
| Auth-requirements ruling (Pre-authorisation, S8. Line Items (in nhcx-preauth)) | ruling status `checking` | nothing; the card keeps saying it is awaiting |
| Pre-authorisation (S9. Pre-authorisation (in nhcx-preauth)) | status `submitting` (polls the reply) or `cancelling` (polls the cancellation) | nothing |
| Claim submission ([S11. Claim Submission](S11-claim-submission.md)) | submission status `submitting` | nothing |
| Status, reprocess and release enquiries (S9. Pre-authorisation (in nhcx-preauth), [S11. Claim Submission](S11-claim-submission.md)) | any enquiry status `asking` | nothing |

How the desk learns of an answer is the integrator's decision `responses.check` ([L1.A](../steps/L1-discovery.md)). With `manual` (the default) the page never reloads itself, because that would throw away whatever is being typed on another tab: the operator presses Refresh. With a fixed interval, the case is re-read at that interval only while something is out with the payer (the conditions of the poll table), the Refresh button is not shown, and every form keeps what is typed across the re-read (each form is keyed on its saved values, never rebuilt by a re-read).

**Header.** One line that wraps on a narrow screen. On the left, the beneficiary name as the heading (the member ID when there is no name yet). On the right, a wrapping row of chips:

1. The case number, info tone.
2. The stage chip "<Stage>: <Sub-stage>" (values and tones in [S5. Claim Master](S5-claim-master.md)). The stage is recomputed on each load.
3. When the payer has queries on the case that are open or whose reply failed: "1 query awaiting reply" or "<n> queries awaiting reply", warning tone.
4. When money has settled: "Paid ₹<total>", success tone (thousands separators, no decimals).
5. When any leg is still out with the payer (the poll table) and `responses.check` is `manual`: a "Refresh" button with a refresh icon, spinning while the case is re-read. It reloads this screen on the current tab, which runs the polls again, and clears any flash.

**Next actions.** Below the header, when the case is waiting on the desk, a muted "Next:" label and small buttons. The first button is primary, the rest secondary. Each one opens this screen on the tab where that action lives. They are worked out on the server from the stage and sub-stage, so only a legal action is offered:

| When | Button label | Opens tab |
|---|---|---|
| Any payer query open or whose reply failed (always first) | Answer the payer (<n>) | Communication (S10. Communication (in nhcx-communication)) |
| Proof of presence required ([S18. Beneficiary Verification](S18-beneficiary-verification.md)) and not held, while stage `eligibility`, or stage `preauth`/`enhancement` at `draft` or `refused` | Authenticate the beneficiary | Pre-authorisation |
| Stage `eligibility`, status `draft`, `error` or `not-eligible` | Send the validation | Overview (S3. Policy Discovery (in nhcx-coverage)) |
| Stage `eligibility`, eligible, no ready plan | Fetch the package master | Pre-authorisation (S7. Insurance Plan (in nhcx-preauth) fetch card) |
| Stage `eligibility`, plan ready, no line items | Quote the treatment | Pre-authorisation (S8. Line Items (in nhcx-preauth)) |
| Stage `eligibility`, line items present | Send the pre-authorisation | Pre-authorisation (S9. Pre-authorisation (in nhcx-preauth)) |
| Stage `preauth`/`enhancement`, `queried`, and the payer takes answers by resubmission or no standalone query is open | Answer the query | Pre-authorisation (S9. Pre-authorisation (in nhcx-preauth)) |
| Stage `preauth`/`enhancement`, `draft` or `refused` | Send the pre-authorisation | Pre-authorisation |
| Stage `preauth`/`enhancement`, `rejected` | Send a fresh pre-authorisation | Pre-authorisation |
| Stage `preauth`/`enhancement`, `approved`/`partial`, lines added since | Send the enhancement (<n> added) | Pre-authorisation |
| Same, nothing added, no IPD admission linked | Link the IPD admission | Claim (S4. Pre-authorisation Details and Admission Link (in nhcx-preauth) link card) |
| Same, admission linked, no discharge recorded | Record the discharge | Claim ([S11. Claim Submission](S11-claim-submission.md)) |
| Same, discharge recorded | File the claim | Claim |
| Stage `preauth`/`enhancement`, `requested`/`answered`/`resubmitted` | With the payer; ask where it stands | Pre-authorisation |
| Stage `claim`, `queried`, and the payer takes answers by resubmission or no standalone query is open | Answer the claim query | Claim |
| Stage `claim`, `rejected` | Ask for a reprocess | Claim |
| Stage `claim`, `requested`/`answered`/`resubmitted` | With the payer; ask where it stands | Claim |
| Stage `claim`, `refused` (refused at the door, it never reached the payer), another send allowed | Send the claim again | Claim |
| Stage `claim`, any other sub-stage (approved) | Await the payment notice | Payments (S12. Payments (in nhcx-payment)) |
| Stage `payment`, a notice not yet acknowledged (or its acknowledgement failed) | Acknowledge the payment notice | Payments |
| Stage `payment`, all acknowledged | Settled | Payments |

A queried leg whose question came as a standalone query is answered on Communication, through the first button "Answer the payer (<n>)". "Ask for a reprocess" appears only on a rejected claim; a claim refused at the door offers only "Send the claim again", and nothing when no send is left.

Under the next actions sits the flash of the last action: green with the action's message, red with the refusal's text verbatim. Opening another tab clears it.

**Tabs**, in this order. The tab key is the path segment (or the `tab` query value):

| # | Key | Label | What it holds |
|---|---|---|---|
| 1 | `eligibility` | Overview | S3. Policy Discovery (in nhcx-coverage): beneficiary, policy, the validation with the wallet, and the insurance plan's refetch (S7. Insurance Plan (in nhcx-preauth)) |
| 2 | `preauth` | Pre-authorisation | [S18. Beneficiary Verification](S18-beneficiary-verification.md) at stage Preauth when the payer needs it, then S8. Line Items (in nhcx-preauth) (line items, coverage benefits check, authorisation requirements), S4. Pre-authorisation Details and Admission Link (in nhcx-preauth) (pre-authorisation details) and S9. Pre-authorisation (in nhcx-preauth) (forms, documents, the send and the verdict) |
| 3 | `claim` | Claim | [S18. Beneficiary Verification](S18-beneficiary-verification.md) at stage Discharge when the payer needs it, then S4. Pre-authorisation Details and Admission Link (in nhcx-preauth) (link the IPD admission) and [S11. Claim Submission](S11-claim-submission.md) (discharge, documents, forms, the claim) |
| 4 | `communication` | Communication | S10. Communication (in nhcx-communication) |
| 5 | `payments` | Payments | S12. Payments (in nhcx-payment) |
| 6 | `audit` | Logs | every message of the case, below |

Tab rules:
- No tab, or an unknown key, opens Overview.
- Retired keys still land: `plan`, `procedure`, `lines`, `validate` and `verification` open Pre-authorisation [REF](../references/PAYERS.md#markers). There is no Line items, Insurance plan, Validate, Verification or Predetermination tab.
- **Claim and Payments appear only once a pre-authorisation has been raised** (a pre-authorisation row exists, whatever its status). Before that the bar shows Overview, Pre-authorisation, Communication and Logs, and a link to `claim` or `payments` opens Pre-authorisation.
- The Pre-authorisation tab is always shown. The benefits check and the authorisation-requirements ruling on it are optional and never gate the send; a ruling that arrives later narrows the documents and forms it asks for.
- **The Pre-authorisation tab turns read only once the claim is with the payer** (the claim sent, queried or decided; a claim still a draft, or refused at the door, leaves it open). Nothing on it can change and nothing is sent from it; only Cancel stays, until the payer decides the claim (S9. Pre-authorisation (in nhcx-preauth)).
- The active tab is underlined.

**A dot beside a tab** when the payer has something to look at there, and the tab is not the one open:
- Communication: a query is open (or its reply failed), or any message arrived since the tab was last open.
- Pre-authorisation: the pre-authorisation is `queried`, or the payer's answer on it arrived since the tab was last open.
- Claim: the claim is `queried`, or the payer's answer on it arrived since the tab was last open.
- Payments: a payment notice arrived since the tab was last open.

"Last open" is kept per case in the browser. The first open of a case counts as having seen everything so far, so only what arrives later (and every open query) gets a dot. The dot carries the accessible name "Something new from the payer". Where the browser cannot keep it (a private window), the dots fall back to the open queries and queried legs alone.

**Logs tab.** One card, "Logs: every message on this case". It lists every NHCX message the case sent or received, on every thread the case has used, **newest first**. The case's threads are every correlation id it has sent on (each send records its id on the case, so the history builds up), the ids on its own legs (eligibility, plan, ruling, pre-authorisation and its cancel, claim, queries and their replies, enquiries, payments and their acknowledgements), and every message on any of those threads. Columns:

| Column | Content |
|---|---|
| When | date and time |
| Direction | "Sent" (an outward arrow) or "Received" (an inward arrow) |
| Message | the NHCX path, for example `/preauth/submit`, in monospace |
| Workflow | the `x-hcx-workflow_id`, or `-` |
| Status | a chip of the gateway's status: accepted or delivered success, rejected or failed danger, delivery failed warning, anything else info |
| Correlation ID | the bare correlation id, copied on a click |
| Disposition / message | what the message said: the payer's disposition, a query's or notice's text, or the gateway's refusal |

No transaction id is shown and there are no summary tiles. When any message was refused or not delivered, a red line above the table reads "<n> message(s) refused or not delivered." Empty: "No NHCX message has been sent or received on this case yet." A failed read shows the error text in red.

API: [A17. Claim State](../apis/A17-claim-state.md)

Data: [D9. claim](../database/D9-claim.md)

Data: D10. claim_plan (in nhcx-coverage)

Data: [D13. claim_auth](../database/D13-claim-auth.md)

Data: [D18. claim_preauth](../database/D18-claim-preauth.md)

Data: D19. claim_predetermination (in nhcx-preauth)

Data: [D20. claim_submission](../database/D20-claim-submission.md)

Data: [D21. claim_payment](../database/D21-claim-payment.md)

Data: [D23. claim_query](../database/D23-claim-query.md)

Data: [D29. claim_enquiry](../database/D29-claim-enquiry.md)

#### S6L. LAYOUT
The arrangement below is the reference implementation's [REF](../references/PAYERS.md#markers): follow the target HMIS's own screen conventions. What is required is in DESCRIPTION and ACTIONS: the fields, options, columns, statuses, messages and actions.


```
|------------------------------------------------------------------------------|
| Claims > NM-26-0SE000001                                                     |
|------------------------------------------------------------------------------|
| Asha Devi        [NM-26-0SE000001] [Preauth: Submitted] [1 query awaiting    |
|                  reply] [Paid ₹45,000] [(refresh) Refresh]                   |
| Next: [Answer the payer (1)] [With the payer; ask where it stands]           |
| [flash: Pre-authorisation submitted to the payer.]                           |
|------------------------------------------------------------------------------|
| Overview | *Pre-authorisation* | Claim | Communication (o) | Payments | Logs |
|------------------------------------------------------------------------------|
|                                                                              |
|  <active tab content>                                                        |
|                                                                              |
|------------------------------------------------------------------------------|

Logs tab:
| [Card] Logs: every message on this case                                      |
|  2 message(s) refused or not delivered.                                      |
|  When | Direction | Message | Workflow | Status | Correlation ID | Disposition / message |
|  18 Oct 2026, 9:02 | <- Received | /preauth/on_submit | 2 | [delivered] | 6f1c...| Approved |
|  18 Oct 2026, 8:41 | -> Sent     | /preauth/submit    | 2 | [accepted]  | 6f1c...| -     |
```

- The heading and the chip row sit on one line and wrap on narrow screens; chips wrap among themselves.
- The Refresh button sits among the chips and appears only while something is awaiting the payer.
- The "Next:" row appears only when there is at least one action. Its buttons are small; the first is primary.
- The tab bar scrolls sideways on a narrow screen; the dot is a small red circle after the label.
- Panes below are stacks of cards with a consistent vertical gap.

#### S6A. ACTIONS
1. Tab "Overview": show S3.
2. Tab "Pre-authorisation": show S18 (stage Preauth, only when the payer needs it), then S8, S4's details card and S9, in the order S9 gives.
3. Tab "Claim" (once a pre-authorisation exists): show S18 (stage Discharge, only when the payer needs it), then S4's link card and S11, in the order S11 gives.
4. Tab "Communication": show S10.
5. Tab "Payments" (once a pre-authorisation exists): show S12.
6. Tab "Logs": read the case's messages and show them newest first.
7. Next-action button: open the tab the action names and re-read the case.
8. Refresh: re-read the case on the current tab, polling every leg that is out with the payer.
9. Correlation ID (Logs): copy it.
10. Breadcrumb "Claims": go to the Claim Master screen S5.
