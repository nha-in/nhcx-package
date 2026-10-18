# S19. NHCX Settings Screen

#### S19R. ROUTE
settings/nhcx

Under the HMIS's facility settings, beside its other facility screens. Only a user who may change facility settings in the HMIS sees the fields editable; everyone else sees them read-only.

| Endpoint | Purpose |
|---|---|
| `GET settings/nhcx` | The screen |
| `POST settings/nhcx` | Save the D1 fields |
| `POST settings/nhcx/check` | Run the setup checks ([G11. Startup Checks and Health](../gateway/G11-startup-checks.md)) now and show the outcomes |
| `POST settings/nhcx/key/stage` | Stage a new private key (upload or generate), without using it yet |
| `POST settings/nhcx/key/activate` | Make the staged key the one that signs and opens messages; the old key stays as the previous key |
| `POST settings/nhcx/key/retire` | Drop the previous key once nothing encrypted to it can still arrive |
| `GET settings/nhcx/participants?role=&kind=&search=` | The participant master ([D32. participant](../database/D32-participant.md)): counts by role and kind, the last refresh, the rows |
| `POST settings/nhcx/participants/refresh` | Pull the registry's participant list now |

Breadcrumb: Settings > NHCX

#### S19D. DESCRIPTION
Everything an administrator changes about the facility's NHCX participation after onboarding, without a developer: the ids, the address NHCX delivers to, and the encryption key. Before this screen existed these values were set through the API or a test harness only, so onboarding a facility and rotating a key both needed a developer at the console.

The screen is five cards.

**Card 1: Identity.** The D1 fields:

| Field | Control | Rule |
|---|---|---|
| Facility name | text, required | D1 `name` |
| HFR id | text, required; **read-only with the note "From the ABDM module: `<model.field>`" when the HMIS's ABDM module holds the facility's HFR id** ([D1. organization](../database/D1-organization.md), [SCAFFOLDING 4a](../references/SCAFFOLDING.md)) | D1 `identifier_value`; sent as `providerId` on every exchange |
| Identifier type | select `NHRR`, `ROHINI`, `PMJAY`, `OIN`, `PRN`, default `NHRR` | D1 `identifier_type_code` |
| NHCX participant code | text, required, `<digits>@hcx` (the suffix is added when missing) | D1 `participant_code`; `x-hcx-sender_code` on every send |
| Environment | read-only: `sandbox` or `production` from [G2. Configuration and Participants](../gateway/G2-configuration.md) `env`, with the NHCX base URL | not editable here: the environment and its URLs are configuration, changed by a deploy, never by a screen |
| Email, phone, GSTIN, address | text | D1 |

Then a block **"How a claim starts"** with two switches, both on by default ([D1. organization](../database/D1-organization.md) `registration_required`, `capture_member_id`; read by [S1. Search Policy](S1-search-policy.md)):

| Switch | Help text |
|---|---|
| A claim needs a registered patient | "On, the desk picks a patient from the register before searching a policy. Off, it may also start a claim for a walk-in on the identifiers alone." The switch sets the wording of [S1. Search Policy](S1-search-policy.md)'s Patient card; the desk may always press Skip there, because the admission is linked later, before the claim. |
| Ask for the member id at the start | "On, the member id is offered as an identifier beside the ABHA number and the mobile number. Off, the search starts from the ABHA number or the mobile number only." |

Save rules, each a red flash: "Enter the facility name.", "Enter the facility's HFR id." (only when editable here), "Enter the NHCX participant code.", "A participant code is digits followed by @hcx." Success: "NHCX settings saved."

**Card 2: Registry record.** What the NHCX participant registry holds for the participant code, fetched on load through [G4. Registry and Certificates](../gateway/G4-registry.md) `fetch_participant` (cached a minute; a fetch failure shows the error in red and leaves the card):

| Row | Value | Check |
|---|---|---|
| Registered name | the registry's `name` | |
| Status | the registry's `status` | warning chip unless `Active` |
| Registered endpoint | the registry's `endpoint_url` | green "reaches this application" when it equals [G2. Configuration and Participants](../gateway/G2-configuration.md) `publicUrl` (slashes trimmed) and the probe of [G11. Startup Checks and Health](../gateway/G11-startup-checks.md) step 5 passed; red "does not match this application's public URL `<publicUrl>`" otherwise |
| Roles | the registry's roles | warning when `provider` is missing |
| Registered certificate | the registry certificate's fingerprint (SHA-256) and validity dates | green "matches the active key", amber "matches the staged key", red "matches neither key: messages addressed to this facility cannot be opened" |

Below the table, the note: "The registry is changed on the NHCX portal (or with NHA's onboarding tool), not from here: upload the certificate shown under Encryption key and set the endpoint to the public URL above, then press Re-check." [REF](../references/PAYERS.md#markers) The gateway never writes to the registry ([OPERATIONS.md](../references/OPERATIONS.md)).

Header action: "Re-check" (shield-check icon) posts to `settings/nhcx/check`, runs G11's checks 1 to 5 and shows each outcome as a row under the card (pass green, fail red with G11's message). Flash: "Checks run." The checks only report; nothing is changed by them.

**Card 3: Encryption key.** Rotation without a developer and without an outage. The gateway holds up to three keys for the participant ([G2. Configuration and Participants](../gateway/G2-configuration.md) `participant.privateKey`, `participant.stagedPrivateKey`, `participant.previousPrivateKey`), all in the key store outside the repository that the configuration points at, never in the database and never shown on the screen. The screen shows, for each of the three slots, the public certificate's fingerprint, its `notAfter`, and when it entered the slot; the private key itself is never displayed, downloaded or logged.

| Slot | Shown | Actions |
|---|---|---|
| Active | fingerprint, validity, "opens inbound messages, registered on <date>" | none |
| Staged | fingerprint and validity, or "none" | "Stage a new key": either upload a PEM private key (PKCS#8 or PKCS#1) with its certificate, or "Generate" a 2048-bit RSA key pair and a self-signed certificate valid for the number of years entered (default 2) [REF](../references/PAYERS.md#markers). The certificate PEM is then offered for download so it can be uploaded to the registry. Then "Activate", enabled only when the registry certificate matches the staged key (card 2) |
| Previous | fingerprint and validity, or "none" | "Retire", with the confirm "Drop the previous key? A message still encrypted to it could no longer be opened. NHCX redelivers for a few minutes only, so retire a day after activating." |

How rotation runs, in order:
1. Stage: the new key is written to the key store under the staged slot and the gateway reloads its profiles ([G2. Configuration and Participants](../gateway/G2-configuration.md) `reload`); the staged key opens nothing yet and signs nothing. The certificate is downloaded and uploaded to the registry by the administrator.
2. The administrator presses Re-check. Card 2 turns "matches the staged key" and "Activate" becomes enabled. Activate is refused while the registry still names the active key: "Upload the new certificate to the registry first; the registry still carries the active key's certificate." Activating before that would make every inbound message undecryptable.
3. Activate: active becomes previous, staged becomes active, the gateway reloads. From now on inbound messages are tried against the active key first and the previous key second ([G8. Receive](../gateway/G8-receive.md) `decrypt_for`), so a payer that encrypted to the old certificate a moment before the registry changed still gets through. Outbound sends are unaffected: they encrypt to the recipient's certificate, not ours.
4. Retire, the next day: the previous slot is emptied.

Messages, each a red flash: "That is not an RSA private key.", "The certificate does not belong to that private key.", "A key is already staged; retire or replace it first.", and the Activate refusal above. Success flashes: "New key staged. Download its certificate and upload it to the registry.", "Key activated. The previous key still opens messages until it is retired.", "Previous key retired."

**Card 4: Participants on the exchange.** The participant master ([D32. participant](../database/D32-participant.md)): "Every payer and TPA registered on NHCX in the last <windowYears> years, government and private, pulled from the participant registry and refreshed every 24 hours. The payer picker reads from this list." (the window is [D32. participant](../database/D32-participant.md)'s setting: 1 in production, 10 in the sandbox). The master holds payers and TPAs only: providers are never pulled, and rows of any other role left from an earlier pull are dropped on refresh. Two tiles (Payers, TPAs), each with the active count and "<n> government · <n> private" under it; the line "Last refreshed <when>." with an amber chip "Older than a day" when stale, or "Not pulled yet. The list fills on the first payer search, or on Refresh now."; then a Role select and a Find box over a scrollable table (Name, Participant code, Kind as a chip, State) of up to 200 rows. Header action "Refresh now" posts to `settings/nhcx/participants/refresh`, pulls the payer and TPA roles for both kinds ([G4. Registry and Certificates](../gateway/G4-registry.md) `fetch_participants`) and flashes "Participant list refreshed: <n> payers, <n> TPAs."; a registry failure flashes red and changes nothing. The schedule ([SCAFFOLDING.md](../references/SCAFFOLDING.md), section 7) does the same daily.

**Card 5: Hosted participants**, only when [G2. Configuration and Participants](../gateway/G2-configuration.md) lists `participants`: one read-only row per extra hosted code (code, name, whether it shares the default key), with G11 check 4's outcome. Hosted participants are configuration; the screen shows them and does not edit them.

API: A16. Gateway Token (in nhcx-preauth) (the token the checks mint)

Data: [D1. organization](../database/D1-organization.md)

#### S19L. LAYOUT
The arrangement below is the reference implementation's [REF](../references/PAYERS.md#markers): follow the target HMIS's own screen conventions. What is required is in DESCRIPTION and ACTIONS: the fields, options, columns, statuses, messages and actions.

```
|------------------------------------------------------------------|
| Settings > NHCX                                                  |
|------------------------------------------------------------------|
| [Card] Identity                                      [Save]      |
|  Facility name *        HFR id *                                 |
|  [City Hospital]        [IN0000000000] From the ABDM module:     |
|                                        HealthFacility.hf_id      |
|  Identifier type        NHCX participant code *   Environment    |
|  [NHRR v]               [<facility code>]         sandbox        |
|  Email  Phone  GSTIN  Address                                    |
|  How a claim starts                                              |
|   A claim needs a registered patient                     [on ]   |
|   Ask for the member id at the start                     [on ]   |
|------------------------------------------------------------------|
| [Card] Registry record                          [(shield) Re-check]
|  REGISTERED NAME   STATUS [Active]   ROLES provider              |
|  REGISTERED ENDPOINT  https://.../in   [reaches this application]|
|  REGISTERED CERTIFICATE  SHA-256 ab:cd:...  valid to 2028-03-01  |
|                          [matches the active key]                |
|  Checks: token ok · record ok · certificate match · endpoint ok  |
|------------------------------------------------------------------|
| [Card] Participants on the exchange             [(refresh) Refresh now]
|  PAYERS                     TPAS                                 |
|  250                        29                                   |
|  49 government · 201 private  0 government · 29 private          |
|  Last refreshed 16 Oct 2026 13:32.                               |
|  Role [Payers v]  Find [sha        ]                             |
|  SHA HP          <payer code> [Government]   Himachal Pradesh    |
|------------------------------------------------------------------|
| [Card] Encryption key                                            |
|  Active    SHA-256 ab:cd:...  valid to 2028-03-01  since ...     |
|  Staged    none                       [Stage a new key]          |
|  Previous  none                                                  |
|------------------------------------------------------------------|
```

- Every control is the host's own component of that kind (card, switch, select, table, chip, dialog, flash), as L1 records it; the screen sits among the host's own facility settings.
- Fingerprints are shown in pairs of hex with colons; a click copies them.
- Users without the facility-settings permission see every field read-only and no buttons except Re-check.

#### S19A. ACTIONS
1. Save: validate and write D1 (the identity fields and the two claim-start switches), flash "NHCX settings saved.", stay on the screen.
2. Re-check: run G11's checks and the endpoint probe, show the outcomes under the Registry card.
3. Stage a new key: upload or generate, write the staged slot, reload the gateway, offer the certificate for download.
4. Download certificate (staged or active): the certificate PEM only.
5. Activate: after the registry check passes, rotate the slots and reload the gateway.
6. Retire: after the confirm, empty the previous slot.
7. Refresh now: pull the payer and TPA lists for both kinds, upsert the master, drop rows of other roles, flash the counts.
8. Breadcrumb "Settings": back to the HMIS's settings page.
