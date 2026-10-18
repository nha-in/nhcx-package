# S10. Communication Screen

#### S10R. ROUTE
claims/view/:caseid/communication

This is the Communication tab of the Claim Detail shell S6. Its route is `claims/view/:caseid/communication`.

| Endpoint | Purpose |
|---|---|
| `POST claims/:caseid/queries/:qid/reply` | Answer one payer query (multipart) |
| `POST claims/:caseid/queries/:qid/acknowledge` | Send a notification's acknowledgement again |

Breadcrumb: Claims (claims/list, S5) > `<claim number>`

#### S10D. DESCRIPTION
Everything the payer has said on this case outside a verdict, on both legs, and the way to answer it. The messages are its questions (queries), its notifications, and its notes. The tab shows one card per leg, the pre-authorisation's first, then the claim's. Both are titled "Payer queries", with "(pre-authorisation)" or "(claim)" beside the title in muted text. A card appears only when its leg has at least one message. Inside a card the messages are newest first (received time, then arrival order).

**Two ways a payer asks for more.**

| How the question arrives | Where it is answered |
|---|---|
| Inside the payer's verdict on the leg's own thread: the leg stands `queried`, with the queried items on the reply (a line-item query) | The leg is submitted again with the reply, from the Pre-authorisation tab (S9. Pre-authorisation (in nhcx-preauth)) or the Claim tab (S11. Claim Submission (in nhcx-claim)). It never shows here as a query |
| A separate payer message on a thread of its own, kind `query` | A reply, from this tab |

The adapter's query mode ([PAYERS.md](../references/PAYERS.md)) says which a payer uses. A payer in `resubmit` mode [PAYER](../references/PAYERS.md#markers) is always answered by resubmitting; what it sends as a separate message is a notification. A payer in `communication` mode asks by a separate message. Whichever mode, a leg that is `queried` with no open separate query on it is answered by resubmitting.

**Empty state.** When the payer has sent nothing yet, one card shows an icon (a speech-bubble icon, about 2rem, muted) above one centred line: "No messages from the payer yet. Its questions and notices for this case will appear here." No protocol word (no message type, no thread, no mode) appears on it.

**Message statuses.**

| Status | Chip | Tone |
|---|---|---|
| `open` | Awaiting our reply | warning |
| `answered` | Answered | success |
| `acknowledged` | Acknowledged | success |
| `noted` | Noted | info |
| `error` | Reply failed | danger |

Reason codes are shown in words: `tatquery` Turnaround time query, `grievance` Grievance, `walletupdate` Wallet or benefit update, `policychange` Policy change, `additionalinfo` Additional information request, `claimarbitration` Claim arbitration intimation (the misspelling `claimArbitartion` is accepted), `questionnaire` Questionnaire, `query` Query [PAYER](../references/PAYERS.md#markers). An unknown code is shown as the payer spelled it.

Each message is one accordion item. Several can be open at once, and every open query (status `open` or `error`) starts unfolded.

**1. Open query** (kind `query`, status `open` or `error`). Title: "Query raised <date> - awaiting our reply".
- A four-column detail list: Received (date and time), From (the sender's participant code), About (the payer's claim number), Status chip.
- "What the payer asked": a bullet list, one line per question, else the payer's remarks. When it asked nothing specific: "The payer asked for more without saying what."
- When a reply failed, a line in the danger colour with the error followed by "Nothing reached the payer, send it again."
- The reply form, multipart:
  - "Reply": a 4-row text area named `text`, prefilled with the last reply attempted.
  - "Send documents already on the claim": one checkbox per document on the claim (`document_ids`). Each shows the label or filename, then its code (or `-`) and stage, muted. Help: "Each ticked file rides on the reply as a contentAttachment under its own code." Shown only when the claim holds documents.
  - "Documents the payer named": shown when the leg has named documents (S9. Pre-authorisation (in nhcx-preauth), S11. Claim Submission (in nhcx-claim)). A table of Code, Document (with the package code as a muted sub-line) and Choose a PDF (a file input `req_<code>`). Help: "Each file is filed and sent under the payer's own code, so the reply quotes it back."
  - "Attach anything else": "Add files (PDF or image)" (a multiple file input), "Filed as" (a select of the NHCX document codes of S9. Pre-authorisation (in nhcx-preauth), each as `<code> - <label>`, default `CD`; never a plan's own codes) and "Label". Help: "Any number of files. They are kept on the claim as well as sent, choose the payer's code where it named one."
  - "From records": the health-record picker of S9. Pre-authorisation (in nhcx-preauth), when the HMIS has an ABDM module, with the muted help "A record picked here is filed on the claim at this leg's stage and can be ticked above to ride on the reply." The record is filed at the queried leg's stage (D28 `source = record`) and rides on the reply as a `DocumentReference` entry (F19), as a file does by attachment.
  - The primary button "Send reply to payer" (send icon), right-aligned.

**2. Answered query.** Title: "Query answered <date>" (the answer's date). The same detail list, then "What the payer asked", "Our reply" (a code block, or `-`), "Attached" (a bullet list of links to each file that went, shown when any did), and Sent at.

**3. Notification** (kind `notification`). Title: "<reason in words> <date>, acknowledged" or "<reason in words> <date>, not yet acknowledged".
- A five-column detail list: Received, From, About, Reason, and Status. The Status chip reads "Acknowledged" (success), "Acknowledgement failed" (danger) or "Awaiting acknowledgement" (warning).
- "What the payer says": the lines, or "The payer sent no text with it.".
- A muted line: "A notification is kept on the case and acknowledged to the payer; the case's status is not changed by it and nothing here is answered."
- Once acknowledged: Acknowledged at.
- Otherwise: the error, if any, followed by "The payer has not heard that it was seen; send it again." in the danger colour, and the primary button "Send the acknowledgement" (check icon), right-aligned.

**4. Note** (a plain message from the payer). Title: "Note from the payer <date>". The four-column detail list with Status chip "Noted" (info). Then "What the payer says" and the muted line "A note from the payer is kept on the case and read; nothing goes back and nothing is held up by it." A note has no action.

No correlation id, transaction id or thread id is shown on this tab. They are on the Logs tab ([S6. Claim Detail](S6-claim-detail.md)).

**Answering a query.** The server checks, in order, each refusal returned verbatim as an error flash:
- "Query not found."
- "That query is not on this claim."
- "That message is not a question: a notification is acknowledged and a note is read, neither takes an answer."
- New files are filed on the claim first, at the queried leg's stage. Files chosen against a named code carry that code. General files share the chosen code and label. The upload errors of S9. Pre-authorisation (in nhcx-preauth) apply ("Choose a PDF or image to attach.", "Only JPEG image, PDF, PNG image, WebP image files can be attached.", "That file is empty.", "A document may be at most 10 MB."). One bad file refuses the whole reply before anything is sent.
- "Set the facility's HFR ID and NHCX participant code under Settings before answering a query."
- "Write a reply or attach a document, an empty answer tells the payer nothing."
- "One of the chosen documents is not on this claim."

API: [A7. Communication Reply](../apis/A7-communication-on-request.md) (reply)

On success the query becomes `answered` and shows the reply and the documents sent. The flash reads "Reply sent to the payer." and adds " Sent with N document(s) from the claim and M new document(s)." when files went. On failure the query becomes `error` with the message, the text is kept for the next try, and the error flashes. After a reply the case's stage is recomputed, so it is no longer `queried`. The leg itself waits for the payer's next verdict on its own thread (S9. Pre-authorisation (in nhcx-preauth) or S11. Claim Submission (in nhcx-claim)).

**Acknowledging a notification.** A notification is acknowledged automatically the moment it lands. The button on this tab only re-sends after a failure. Refusals: "Query not found.", "That message is not on this claim.", "Only a notification is acknowledged; a query is answered from the communication tab." and "Set the facility's HFR ID and NHCX participant code under Settings first." Success: "Acknowledgement sent to the payer." The reply and the acknowledgement are `on_` sends, so they travel as `response.complete` ([A7. Communication Reply](../apis/A7-communication-on-request.md)).

API: [A7. Communication Reply](../apis/A7-communication-on-request.md) (acknowledgement)

**Query note on the leg cards** (shown on S9. Pre-authorisation (in nhcx-preauth) and S11. Claim Submission (in nhcx-claim), not on this tab). On a queried leg, the leg's card shows "What the payer says" as a code block. It holds the verdict's disposition, which is where some payers write their query [PAYER](../references/PAYERS.md#markers), followed by the item-level query trail when that differs.

**Communication pointer on the leg cards** (S9. Pre-authorisation (in nhcx-preauth) and S11. Claim Submission (in nhcx-claim)). The pointer shows on a leg's card only when that leg has an open separate query (kind `query`, status `open` or `error`) and the payer is not in `resubmit` mode. Otherwise a queried leg shows its resubmit reply form instead.
- With open queries: "The payer has asked N question(s) on this leg by CommunicationRequest. The answer goes back as a Communication on the request's own thread, with the documents it asked for, from the Communication tab."
- Queried, the question on its own thread: "<payer name> asks for more by CommunicationRequest and takes the answer as a Communication on that thread. A question from it arrives on the Communication tab; this leg is not submitted again to answer it."
- Button: "Open the Communication tab" (message icon).

**Header signals in S6.** Open queries (kind `query`, status `open` or `error`) show in S6's header as a warning chip, "1 query awaiting reply" or "N queries awaiting reply". They also put "Answer the payer (N)" first in the Next buttons. The Communication tab carries a dot while a query is open, or when a message arrived since the tab was last open ([S6. Claim Detail](S6-claim-detail.md)). An open query on a leg that is with the payer puts the case's stage into `queried`. A notification or a note never does.

---

Callback: [C9. Payer Communication](../callbacks/C9-communication-request.md)

Data: [D9. claim](../database/D9-claim.md)

Data: [D15. claim_auth_requirement](../database/D15-claim-auth-requirement.md)

Data: [D23. claim_query](../database/D23-claim-query.md)

Data: [D28. claim_document](../database/D28-claim-document.md)

#### S10L. LAYOUT
The arrangement below is the reference implementation's [REF](../references/PAYERS.md#markers): follow the target HMIS's own screen conventions. What is required is in DESCRIPTION and ACTIONS: the fields, options, columns, statuses, messages and actions. Build it from the host's own card, accordion, chip, checkbox, select, file input, table and flash (the component kit, [SCREENS.md](../references/SCREENS.md)).


```
|------------------------------------------------------------------|
| Claims > NM-000123                                               |
| <Beneficiary name>  [NM-000123] [Claim: Queried]                 |
|                     [1 query awaiting reply]                     |
| Next: [Answer the payer (1)]                                     |
|------------------------------------------------------------------|
| Overview | Pre-authorisation | Claim | *Communication* | Payments | Logs |
|------------------------------------------------------------------|
| [Card] Payer queries  (pre-authorisation)                        |
|  v Query answered 2026-09-12                                     |
|     Received  From  About  Status [Answered]                     |
|     What the payer asked: * ...                                  |
|     Our reply: [code block]   Attached: * file.pdf               |
|     Sent at                                                      |
|  > Turnaround time query 2026-09-10, acknowledged                |
|------------------------------------------------------------------|
| [Card] Payer queries  (claim)                                    |
|  v Query raised 2026-09-18 - awaiting our reply                  |
|     Received  From  About  Status [Awaiting our reply]           |
|     What the payer asked: * Discharge summary is illegible       |
|     Reply [______________________________________]               |
|     Send documents already on the claim                          |
|       [ ] Case sheet  CD · preauth                               |
|     Documents the payer named                                    |
|       Code | Document | Choose a PDF                             |
|     Attach anything else                                         |
|       [Files...] [Filed as v] [Label____]                        |
|                                      [(>) Send reply to payer]   |
|  > Note from the payer 2026-09-19                                |
|------------------------------------------------------------------|
```

- The pre-authorisation leg's card comes first, then the claim leg's. Both are titled "Payer queries", and a card is left out when its leg has no messages.
- Inside a card, each message is an accordion item. Several can be open at once, and the newest is first.
- Detail lists use four columns for queries and notes, and five for notifications.
- The reply form is full width. The send button is right-aligned and primary with a send icon.
- The upload row in "Attach anything else" wraps on narrow screens.

#### S10A. ACTIONS
1. Send reply to payer: file any new files, send the reply on the request's thread, and reload S10. The query shows as answered, or as "Reply failed" with the error.
2. Send the acknowledgement: re-send a notification's acknowledgement and reload S10.
3. Attached file links: open the document inline in a new browser tab.
4. Open the Communication tab (on the S9 or S11 cards): come here.
5. Answer the payer (N) (S6 header Next button): come here.
6. Refresh (S6 header, while anything is awaited, when `responses.check` is manual): reload S6 on this tab. New payer messages arrive pushed through the callback door, so a reload shows them.
7. Breadcrumb "Claims": go to the Claim Master S5.
