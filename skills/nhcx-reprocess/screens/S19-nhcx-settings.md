# S19. NHCX Settings Screen

#### S19R. ROUTE
settings/nhcx

A page of its own under the HMIS's facility settings, beside its other facility screens, with its own entry ("NHCX") in the settings navigation. It is built in every integration, whatever L1 finds: without it a facility cannot be onboarded, its participant code set, its endpoint registered or its key rotated without a developer at the console. Only a user who may change facility settings in the HMIS sees the fields editable and the action buttons; everyone else sees them read-only.

| Endpoint | Purpose |
|---|---|
| `GET settings/nhcx` | The facility profile ([D1. organization](../database/D1-organization.md)) with the effective HFR id and participant code |
| `POST settings/nhcx` | Save the D1 fields (only the keys sent change) |
| `GET settings/nhcx/registry` | What the participant registry holds for the effective participant code, with the endpoint and certificate verdicts ([G4. Registry and Certificates](../gateway/G4-registry.md) `fetch_participant`, `certificate`) |
| `POST settings/nhcx/endpoint` | Register the callback endpoint (`endpoint_url`, the gateway's public URL when blank) ([G4. Registry and Certificates](../gateway/G4-registry.md) `update_participant`) |
| `GET settings/nhcx/keys` | The three key slots ([G2. Configuration and Participants](../gateway/G2-configuration.md) `slots`) with the registry's fingerprint beside them |
| `POST settings/nhcx/keys` | One rotation step, `{action: stage \| register \| activate \| retire, private_key, certificate}` ([G2. Configuration and Participants](../gateway/G2-configuration.md) `rotate_key`) |
| `GET settings/nhcx/participants?role=&kind=&search=` | The participant master ([D32. participant](../database/D32-participant.md)): counts by role and kind, the last refresh, up to 200 rows |
| `POST settings/nhcx/participants/refresh` | Pull the registry's payer and TPA lists now |

Breadcrumb: Settings > NHCX

#### S19D. DESCRIPTION
Everything an administrator changes about the facility's NHCX participation after onboarding, without a developer: the ids every send carries, the address NHCX delivers to, the encryption key payers encrypt with, and the list of payers the desk picks from. Before this screen existed these values were set through the API or a test harness only.

Under the title, the line: "The facility's identity on NHCX claims. Every claim send names this facility by its HFR ID and its participant code."

The screen is five cards, in this order.

**Card 1: Facility NHCX profile.** The D1 fields:

| Field | Control | Rule |
|---|---|---|
| HFR ID | text; help "The facility's ID in the Health Facility Registry, sent as the providerId." **When the HMIS's ABDM module holds the facility's HFR id** ([D1. organization](../database/D1-organization.md), [SCAFFOLDING 4a](../references/SCAFFOLDING.md)) the help reads "Taken from the ABDM module's registry link (<id>); the typed value is not used." and the module's value is the one every send uses | D1 `identifier_value`; sent as `providerId` on every exchange |
| Identifier type | select `NHRR`, `ROHINI`, `PMJAY`, `OIN`, `PRN`, default `NHRR` | D1 `identifier_type_code`; an unknown value is refused "Choose the facility identifier type." |
| NHCX participant code | text, `<digits>@hcx`; help "The facility's address on NHCX (…@hcx), the sender of every claim message." When the gateway has a default participant ([G2. Configuration and Participants](../gateway/G2-configuration.md)) the help reads "The facility's address on NHCX (…@hcx). Left blank, the gateway's default <code> is used." | D1 `participant_code`; `x-hcx-sender_code` on every send. Blank stores none, and the gateway's default is used |

Then a block **"How a claim starts"** with two switches, both on by default ([D1. organization](../database/D1-organization.md) `registration_required`, `capture_member_id`; read by S1. Search Policy (in nhcx-coverage)):

| Switch | Help text |
|---|---|
| A claim needs a registered patient | "On, the desk picks a patient from the register before searching a policy. Off, it may also start a claim for a walk-in on the identifiers alone." The desk may always press Skip on S1. Search Policy (in nhcx-coverage)'s Patient card, because the admission is linked later, before the claim. |
| Ask for the member id at the start | "On, the member id is offered as an identifier beside the ABHA number and the mobile number. Off, the search starts from the ABHA number or the mobile number only." |

Under the switches, read-only: "Claims are sent from participant code <effective code>" (the stored code, else the gateway's default). Save writes only the keys sent and flashes "NHCX settings saved." The sends refuse while the facility has neither an HFR id nor a participant code, each in its own words beginning "Set the facility's HFR ID and NHCX participant code under Settings" (A4. Pre-auth Submit (in nhcx-preauth), A8. Payment Notice Acknowledgement (in nhcx-payment), [D13. claim_auth](../database/D13-claim-auth.md)), so the desk's refusal points at this screen.

**Card 2: Participant registry.** Description: "What NHCX holds for this participant: where it delivers callbacks and which certificate payers encrypt with." Fetched on load for the effective participant code (a registry failure shows its message in red in the card and is never raised; before the first fetch: "The registry has not been asked yet."):

| Row | Value | Verdict |
|---|---|---|
| NHCX participant code | the code asked about | |
| Status | the registry's `status` | warning chip unless `Active` |
| Roles | the registry's roles | warning when `provider` is missing |
| Registered endpoint | the registry's `endpoint_url` | green "Callbacks reach this gateway" when it equals the public URL, bare or with `/in` (slashes trimmed, case ignored); red "Callbacks go elsewhere" otherwise; grey "No public URL configured to compare against" when [G2. Configuration and Participants](../gateway/G2-configuration.md) has no `publicUrl` |
| This gateway answers at | [G2. Configuration and Participants](../gateway/G2-configuration.md) `publicUrl` | |
| Registry holds | the registry certificate's SHA-256 fingerprint | green "Registry certificate matches the active key", red "Registry certificate does not match the active key" |

Below the table, an **"Endpoint to register"** text field (help "Leave blank to register the URL this gateway answers at.") and two buttons: **"Update the registry"** posts to `settings/nhcx/endpoint`, which sends [G4. Registry and Certificates](../gateway/G4-registry.md) `update_participant({endpoint_url})` and flashes "The registry now delivers to <url>." with the card re-read; and **"Re-check"** (shield-check icon), which re-reads the registry and runs [G11. Startup Checks and Health](../gateway/G11-startup-checks.md)'s checks 1 to 5, each outcome a row under the card. Refusals, each a red flash: "The endpoint must be an https URL.", "The gateway has no public URL; give the endpoint to register.", and the registry's own refusal ([G4. Registry and Certificates](../gateway/G4-registry.md) `PARTICIPANT_UPDATE_HTTP_<status>`). Re-check only reports; only the two buttons of this card and the Register step of card 3 write to the registry, and nothing else in the integration does ([G11. Startup Checks and Health](../gateway/G11-startup-checks.md) never writes).

**Card 3: Encryption keys.** Description: "Rotate the encryption key without a restart: stage the new key, register its certificate so payers encrypt with it, activate it, and retire the previous key once nothing arrives under it." The gateway holds up to three keys ([G2. Configuration and Participants](../gateway/G2-configuration.md) key slots: active, staged, previous) in the key store outside the repository that the configuration points at, never in the database. For each slot the card shows its certificate's fingerprint (pairs of hex with colons, a click copies), "certificate valid until <date>" and "since <when>", or "empty"; and beside them "Registry holds: <fingerprint>" with "matches the active key", "matches the staged key" or "matches neither". The private key itself is never displayed, returned, downloaded or logged.

Below the slots, two text areas, **"New private key (PEM)"** (help "Sent to the gateway's key store only; not stored in <HMIS>, not logged.") and **"Its certificate (PEM)"**, and four buttons, one per step, in this order:

1. **Stage**: writes the key and its certificate to the staged slot ([G2. Configuration and Participants](../gateway/G2-configuration.md) `rotate_key('stage')`). The staged key opens nothing and signs nothing. An empty key is refused "Paste the new private key (PEM)." Flash: "Key staged. Register its certificate, then activate it."
2. **Register certificate**: publishes the staged certificate to the registry ([G4. Registry and Certificates](../gateway/G4-registry.md) `update_participant({encryption_cert})`, base64), so payers start encrypting with it. Flash: "Certificate registered. Payers now encrypt with it; activate the key."
3. **Activate**: the staged key becomes active, the old one moves to previous, and every profile that shared it switches in memory; inbound messages then open with the active key first and the previous one second ([G8. Receive](../gateway/G8-receive.md) `decrypt_for`). Outbound sends are unaffected: they encrypt to the recipient's certificate. Flash: "Key activated. The previous key still opens messages until it is retired."
4. **Retire previous**: empties the previous slot, after the confirm "Drop the previous key? A message still encrypted to it could no longer be opened. NHCX redelivers for a few minutes only, so retire a day after activating." Flash: "Previous key retired."

When the configuration holds the active key inline rather than as a file reference, the card shows "The gateway configuration holds the private key inline, so a staged key cannot be activated from here. Move it to an @file reference first." and Activate stays disabled. Every [G2. Configuration and Participants](../gateway/G2-configuration.md) `KEY_ROTATION` refusal is shown in red as G2 words it (for example "no key is staged", "that is the active key already").

**Card 4: Participants on the exchange.** The participant master ([D32. participant](../database/D32-participant.md)). Description: "Every payer and TPA registered on NHCX in the last <windowYears> years, government and private, pulled from the participant registry and refreshed every 24 hours. The payer picker reads from this list." (the window is [D32. participant](../database/D32-participant.md)'s setting: 1 in production, 10 in the sandbox). The master holds payers and TPAs only: providers are never pulled, and rows of any other role left from an earlier pull are dropped on refresh. Two tiles (Payers, TPAs), each with the active count and "<n> government · <n> private" under it; the line "Last refreshed <when>." with an amber chip "Older than a day" when stale, or "Not pulled yet. The list fills on the first payer search, or on Refresh now."; then a **Role** select (Payers, TPAs; an unknown role is refused "Choose a participant role: PAYER or TPA.") and a **Find** box (debounced) over a scrollable table (Name, Participant code, Kind as a chip Government or Private, State) of up to 200 rows, "No participant matches." when empty. Header action **"Refresh now"** posts to `settings/nhcx/participants/refresh`, pulls the payer and TPA roles for both kinds ([G4. Registry and Certificates](../gateway/G4-registry.md) `fetch_participants`), upserts the master and flashes "Participant list refreshed: <n> payers, <n> TPAs."; a registry failure flashes red and changes nothing. The schedule ([SCAFFOLDING.md](../references/SCAFFOLDING.md), section 7) does the same daily.

**Card 5: Doctors and staff.** The practitioner master's title and description (S16. Practitioner Master (in nhcx-preauth)) and one button, "Open Doctors & staff", to S16 (`settings/nhcx/practitioners` when the HMIS has no practitioner screen of its own that carries the HPR id).

When [G2. Configuration and Participants](../gateway/G2-configuration.md) lists extra hosted `participants`, a read-only list of them follows card 2: code, name, whether it shares the default key, and [G11. Startup Checks and Health](../gateway/G11-startup-checks.md) check 4's outcome. Hosted participants are configuration; the screen shows them and does not edit them.

API: A16. Gateway Token (in nhcx-preauth) (the token the registry calls and checks mint)

Data: [D1. organization](../database/D1-organization.md), [D32. participant](../database/D32-participant.md)

#### S19L. LAYOUT
The arrangement below is the reference implementation's [REF](../references/PAYERS.md#markers): follow the target HMIS's own screen conventions. What is required is in DESCRIPTION and ACTIONS: the fields, options, columns, statuses, messages and actions.

```
|------------------------------------------------------------------|
| Settings > NHCX                                                  |
| The facility's identity on NHCX claims. ...                      |
|------------------------------------------------------------------|
| [Card] Facility NHCX profile                                     |
|  HFR ID                 Identifier type   NHCX participant code  |
|  [IN0000000000]         [NHRR v]          [<facility code>]      |
|  Taken from the ABDM module's registry link (...)                |
|  How a claim starts                                              |
|   A claim needs a registered patient                     [on ]   |
|   Ask for the member id at the start                     [on ]   |
|  Claims are sent from participant code <code>          [Save]    |
|------------------------------------------------------------------|
| [Card] Participant registry                                      |
|  NHCX PARTICIPANT CODE  <code>     STATUS [Active]  ROLES provider
|  REGISTERED ENDPOINT  https://.../in  [Callbacks reach this gateway]
|  THIS GATEWAY ANSWERS AT  https://...                            |
|  REGISTRY HOLDS  ab:cd:...  [Registry certificate matches ...]   |
|  Endpoint to register [                     ]                    |
|  [Update the registry]  [(shield) Re-check]                      |
|------------------------------------------------------------------|
| [Card] Encryption keys                                           |
|  Active    ab:cd:...  certificate valid until 2028-03-01 · since |
|  Staged    empty                                                 |
|  Previous  empty                                                 |
|  Registry holds: ab:cd:... matches the active key                |
|  New private key (PEM) [..........]  Its certificate (PEM) [....]|
|  [Stage] [Register certificate] [Activate] [Retire previous]     |
|------------------------------------------------------------------|
| [Card] Participants on the exchange           [(refresh) Refresh now]
|  PAYERS                     TPAS                                 |
|  250                        29                                   |
|  49 government · 201 private  0 government · 29 private          |
|  Last refreshed 16 Oct 2026 13:32.                               |
|  Role [Payers v]  Find [sha        ]                             |
|  SHA HP          <payer code> [Government]   Himachal Pradesh    |
|------------------------------------------------------------------|
| [Card] Doctors and staff                 [Open Doctors & staff]  |
|------------------------------------------------------------------|
```

- Every control is the host's own component of that kind (card, switch, select, text area, table, chip, dialog, flash), as L1 records it; the page sits among the host's own facility settings and uses its settings layout.
- Users without the facility-settings permission see every field read-only and no buttons except Re-check.

#### S19A. ACTIONS
1. Save: write the D1 fields sent (identity and the two claim-start switches), flash "NHCX settings saved.", stay on the screen.
2. Update the registry: register the endpoint typed, else the gateway's public URL, then re-read card 2.
3. Re-check: re-read the registry and run G11's checks and the endpoint probe, show the outcomes under card 2.
4. Stage: write the pasted key and certificate to the staged slot.
5. Register certificate: publish the staged certificate to the registry.
6. Activate: rotate the slots and switch the gateway's profiles, without a restart.
7. Retire previous: after the confirm, empty the previous slot.
8. Refresh now: pull the payer and TPA lists for both kinds, upsert the master, drop rows of other roles, flash the counts.
9. Open Doctors & staff: to S16.
10. Breadcrumb "Settings": back to the HMIS's settings page.
