# S17. Beneficiary Discovery Screen

#### S17R. ROUTE
claims/discovery

Optional query: `patient` (the patient the check is about) and `case` (the case to return the cover to).

Breadcrumb: Claims (claims/list, S5) > Discovery

Reached from "None of these" on the policy results [S2. Select Policy](S2-select-policy.md) (always offered, whatever the registry answered), and from "Discovery" in the Claim management header ([S5. Claim Master](S5-claim-master.md)). It is not an item of the navigation: the Claims module's two entries are Dashboard and Management. Optional query `id_type` and `id_value` carry the identifier from S2 into its own field.

#### S17D. DESCRIPTION
Discovery asks a payer directly who a person is to it: a coverage eligibility check with the purpose `discovery` ([A2. Coverage Eligibility Check](../apis/A2-coverage-eligibility-check.md)). It has a page of its own because the request names the policy by one handle and the desk usually knows more than one thing about the person. Whatever else it knows goes with the request as additional information, so the payer has more than one handle to match on.

The page is a stack of cards, in this order:
1. Patient (optional)
2. Discovery request
3. Cover returned (only once the payer has answered)
4. Discoveries sent (only when there are any)

**Patient card** (title "Patient (optional)"). A discovery needs no patient. Until one is chosen the card reads "Not needed for a discovery. Leave it empty to ask the payer on the policy number or member id alone, or pick an HMIS patient to link the case now." above the host's type-ahead over the facility's patients by name (2 letters or more; each option the name, age and gender, mobile; "no patients found" when none). Once chosen: the name, UHID, age and gender, mobile and ABHA number, with "Change patient" (hidden when the page was opened for a case).

**Discovery request card.**

| Field | Control | Default | Notes |
|---|---|---|---|
| Payer (required) | one type-ahead (placeholder "Type a name or a participant code", help "Every payer on the exchange, government and private; type a name or a participant code.") over every payer and TPA on the exchange from the participant master ([D32. participant](../database/D32-participant.md)), government and private in one list; the list has three columns, Name, Kind (a chip "Government" or "Private") and Participant code; the chosen payer is then shown **by name**, with its code and kind beside it, and "Change payer" | the only payer, when there is one; the case's payer when the page was opened for a case (then not changeable) | typing a name or a participant code narrows the list; there is no choice of payer kind first, though a target may offer a kind filter; a code typed in full that is not in the list is taken as typed. The master refreshes itself when older than a day, so a fresh install lists every payer on its first search |

**In network.** As soon as a payer is chosen the page asks the application whether this hospital holds a policy of it with valid cover (`GET claims/payers/check?code=`, read from its own cases, matched on the code's part before `@`): only a non-provisional case whose validation answered eligible counts (status `eligible`, or the eligibility answer's `inforce` true). The answer carries `on_network` (true when at least one such policy exists), the count of those policies, the payer's name and kind. When `on_network` is true the page shows ONE line with a green tick: "In network: this hospital holds <n> policy(s) of <name> with valid cover." Otherwise it shows nothing at all: no block, no crossed line, no "looking up" text and no error text (a lookup failure is silent). The line informs only and never blocks Discover. It is a convenience for the desk, never a protocol step: the send fetches the payer's certificate regardless ([G7. Send](../gateway/G7-send.md)).

**The policy.** A block titled "The policy" with the note "Name the policy by its number or by the member id on the card, whichever the person has.": two fields side by side, **Policy number** and **Member ID**, and the line "Enter the policy number, the member id, or both. At least one is required." The policy number, when given, names the policy: it goes out as the Coverage identifier ([F18. Coverage](../fhir/F18-coverage.md)), and a member id typed beside it rides as `subscriberId` and the Patient identifier typed `MB` ([F15. Patient](../fhir/F15-patient.md)). With the member id alone, it is the handle. Member ID is prefilled with the member id the desk already knows for the patient (the case's, else their latest case's); an identifier carried in the URL from [S2. Select Policy](S2-select-policy.md) lands in its own field (a policy number or member id here, an ABHA or mobile number below).

Then a block titled "Additional information", with the note "Sent with the discovery so the payer has more than one handle to match on. All optional.":

| Field | Control | Default | Rule |
|---|---|---|---|
| Aadhaar number | text, numeric | empty; never prefilled | 12 digits once spaces and hyphens are removed, else "An Aadhaar number has 12 digits" |
| Mobile number | text, numeric | the patient's mobile | 10 digits once spaces, hyphens and a leading +91 are removed, else "A mobile number has 10 digits" |
| ABHA number | text, numeric | the patient's ABHA number | 14 digits once spaces and hyphens are removed, else "An ABHA number has 14 digits" |

Validation before anything is sent, in this order, each as a red flash: "Choose the payer to ask", "Enter the policy number or the member id; at least one is required.", then the three digit rules above (each only when that field is filled).

API: [A2. Coverage Eligibility Check](../apis/A2-coverage-eligibility-check.md) (purpose `discovery`, with the additional information)

FHIR: [F2. CoverageEligibilityRequest](../fhir/F2-coverage-eligibility-request.md), [F15. Patient](../fhir/F15-patient.md), [F18. Coverage](../fhir/F18-coverage.md) (the policy number as the Coverage identifier, the member id as `subscriberId` and the identifier typed `MB`, the Aadhaar as an identifier typed `ADN`, the ABHA as one typed `ABHA`, the mobile as the phone)

**Waiting for the reply (async).** After a queued send the button gives way to "Waiting for <payer code> to answer" and "Stop waiting". The page reads the reply every few seconds until it is in [REF](../references/PAYERS.md#markers); it does not reset what is typed. A failed read shows "Could not poll the gateway: <error>" under the covers.

Callback: [C2. Coverage Eligibility Verdict](../callbacks/C2-coverage-eligibility-on-check.md)

**Cover returned card.** One tile per policy the payer returned, each a button: the person's photo from the reply (else an avatar of their initials), the name (else "Unnamed member"), gender, "born <dob>" and relationship, the member id and ABHA number, the address; then the product or payer name, the policy number (with "<n> members on this cover" when more than one), and three figures: Sum insured, Valid until, Status. No policy: "The payer answered with no cover for this person. Check the identifiers and ask again, or ask another payer." A refusal is shown in red and stops the wait.

Choosing a tile fills that cover's policy (policy code, member id, product and plan name, name) into the case the discovery ran on, marks it provisional and sends the validation, then goes to the validation gate ([S2. Select Policy](S2-select-policy.md), S2.1) with the flash "Validating the policy with the payer." (or "The validation was not sent: <reason>"). The case is a case only once that answer puts it in force.

**Discoveries sent card.** Shown with a patient chosen: every discovery sent for the patient, newest first: "Discovery" (a link to that case's Overview tab), the status chip (waiting, answered, failed), the payer code, the time, the error when it failed, and the additional information the request carried: Aadhaar (the last four digits only, as `XXXX XXXX 1234`), Mobile, Member ID. No correlation id, API call id or transaction id is shown here: they are on the case's Logs tab ([S6. Claim Detail](S6-claim-detail.md)) only.

Data: [D9. claim](../database/D9-claim.md)

#### S17L. LAYOUT
The arrangement below is the reference implementation's [REF](../references/PAYERS.md#markers): follow the target HMIS's own screen conventions. What is required is in DESCRIPTION and ACTIONS: the fields, options, columns, statuses, messages and actions.

```
|------------------------------------------------------------------|
| Discovery                                             [< Back]   |
|------------------------------------------------------------------|
| [Card] Patient (optional)                                        |
|  Asha Devi   <UHID> · 42y F · 98xxxxxx10 · ABHA 91-xxxx-xxxx-xx  |
|------------------------------------------------------------------|
| [Card] Discovery request                                         |
|  Payer *            [SHA HP  <payer code>  [Government]  Change payer]|
|   (type-ahead rows: NAME         KIND          PARTICIPANT CODE) |
|   ✓ In network: this hospital holds 4 policy(s) of SHA HP with ...|
|  The policy                                                      |
|   Policy number [____________]   Member ID [MD5SLS4X5_____]      |
|  Additional information                                          |
|  Aadhaar number     Mobile number     ABHA number                |
|  [1234 5678 9012]   [98xxxxxx10  ]    [91703412374240]           |
|                                                 [Discover]       |
|------------------------------------------------------------------|
| [Card] Cover returned                                            |
|  [PMJAY for Himachal · PMJAY/HP/S/G · MD5SLS4X5 · active]        |
|------------------------------------------------------------------|
| [Card] Discoveries sent                                          |
|  Discovery [answered] <payer code> 12:00:05                      |
|  Additional information  Aadhaar XXXX XXXX 9012  Mobile ...      |
|------------------------------------------------------------------|
```

#### S17A. ACTIONS
1. Discover: validate, open a **provisional** draft case for the payer (hidden from every list, count and payer filter of [S5. Claim Master](S5-claim-master.md), so a discovery that finds no policy never shows as a case) (and the patient, when one is chosen) when the page was not opened for a case (A2 `discover`: the facility guard is checked first, so a refusal creates no case), send the discovery (A2) on it with the policy handle and the additional information, and wait for the reply on this page.
1a. Change payer: drop the chosen payer and reopen the type-ahead (not offered when the page was opened for a case).
2. Stop waiting: stop polling; the check stays in the list and can still be opened.
3. Choose a policy tile: fill the policy in on the case the discovery ran on (the draft case `discover` opened, or the case the page was opened for), send the validation and go to the validation gate (S2.1), which opens its Overview tab S3 once in force.
4. Back: to the case's Overview tab when the page was opened for a case, else to the claim list S5.
