# D32. participant

#### D32T. TABLE
One row is one NHCX participant as the registry lists it: its participant code, registered name, role, whether it is a government scheme or a private participant, and when it was last seen on the list. Primary key `code` (normalised, with `@hcx`). No parent table.

#### D32D. DESCRIPTION
NHCX has no name search for participants: the registry's participant list ([G4. Registry and Certificates](../gateway/G4-registry.md) `fetch_participants`, nha:A1 `POST /fetch/participants/list`) answers one role at a time for a registration window, and narrows to government schemes with `entitytype` `Gov` or to private participants with `Pvt`. Sent without an entity type it answers the private list only [SANDBOX](../references/PAYERS.md#markers). So the application pulls the list itself, two calls per role (government, then private) for the two roles a hospital sends to, **PAYER and TPA** (never PROVIDER: a hospital never sends to another provider), over a window of **the last year by default** (`participant.windowYears`, a setting), and saves every row here with the flag. The payer picker ([S17. Beneficiary Discovery](../screens/S17-beneficiary-discovery.md), and "None of these" on [S2. Select Policy](../screens/S2-select-policy.md)) and every payer name on the screens then read from this table; the registry is asked for one code ([G4. Registry and Certificates](../gateway/G4-registry.md) `fetch_participant`) only when a code is not on the list.

Why a window at all: the list is a filter on registration date, and the desk wants the payers that are live today, which a year covers in production. **In the sandbox the window has to be ten years** [SANDBOX](../references/PAYERS.md#markers): the test payers were registered in 2021 to 2023, and a one-year window lists 11 government and 115 private payers and misses both the PMJAY test payer (`SHA HP`) and the dummy payer, while ten years lists 49 and 201. The setting is therefore 10 in a sandbox deployment and 1 in production, never a constant. A row that falls out of the window is retired (`active` 0), not deleted. Why payers and TPAs only: a provider needs the payers, and the TPAs that process for them, to address a claim and to name who answered; providers are not pulled into this table.

**Created and updated.** By a refresh: on a schedule, daily ([SCAFFOLDING.md](../references/SCAFFOLDING.md), section 7); from the Settings screen's "Refresh now" ([S19. NHCX Settings](../screens/S19-nhcx-settings.md)); and by the payer picker itself when the table is empty or the last refresh is older than a day, so a fresh install has a payer list on its first search. A refresh upserts on `code`: a listed code gets `name`, `role`, `entity_type`, `address`, `state`, `raw` and `fetched_at` = now and `active` = 1; a stored code the list no longer carries gets `active` = 0 and is kept, because cases still name it. One registry failure fails the whole refresh and changes nothing (a half list would retire the missing kind). A code the registry lists under two roles is stored once, under the first role in the order PAYER, TPA. Rows of any other role left from an earlier build (PROVIDER) are deleted by the refresh. Flash: "Participant list refreshed: <n> payers, <n> TPAs."

**In network.** `plan_fetched_at` is a one-time fact, not registry data: C4. Insurance Plan Reply (in nhcx-preauth) sets it when a plan settles `ready` for a case of this payer (matched on the code's part before `@`), only when it is still null; a migration fills it for plans already fetched (the earliest `ready` plan's `fetched_at` per payer); the payers check (`GET claims/payers/check?code=`, [S17. Beneficiary Discovery](../screens/S17-beneficiary-discovery.md)) reads it, and for a payer not on the master or a flag not set yet looks the fetched plans up once and sets it from them. A refresh never touches it.

**Read.**
- The payer picker: rows with `role = 'PAYER'` and `active = 1`, government and private in one list, each row showing its kind, narrowed by a fragment of the name or the code; a filter on the kind is optional. Without a kind filter the picker also offers the configured default payer, the payers of the configuration rows ([D8. terminology](D8-terminology.md) `payer_adapter`) and the payers of the facility's own cases, one row per payer (codes compared on their numeric part, a bare code given `@hcx`), each named by its registered name only.
- Payer names ([PAYERS.md](../references/PAYERS.md)): `name` by the numeric part of the code, before any registry lookup.
- The adapter choice ([PAYERS.md](../references/PAYERS.md)): the entity type decides, `gov` gives the `gov` adapter and any other the `generic` one. Only a payer this table does not hold falls back to a configuration row, then to a name starting `SHA` (`gov`), else `generic`. The adapter's name is never shown on a screen.
- The Settings screen ([S19. NHCX Settings](../screens/S19-nhcx-settings.md)): counts by role and kind, the last refresh, and the rows for a chosen role.

**Deleted.** Never by the application. It is a master table and survives the "clear transactional data" reset.

#### D32C. COLUMNS
| column | type | null/default | meaning (and allowed values) |
|---|---|---|---|
| code | TEXT | primary key | participant code, normalised with `@hcx` ([G5. Protocol Headers](../gateway/G5-protocol-headers.md)) |
| name | TEXT | NOT NULL, default `''` | the registered name as listed (`participantname`) |
| role | TEXT | NOT NULL | `PAYER` or `TPA`: the role the list was asked for |
| entity_type | TEXT | NOT NULL | `gov` (listed under `entitytype` Gov) or `pvt` (listed under Pvt) |
| address | TEXT | NOT NULL, default `''` | as listed; the sandbox fills it with a coordinate or "None" for many rows [SANDBOX](../references/PAYERS.md#markers) |
| state | TEXT | NOT NULL, default `''` | state name as listed, in the registry's own casing |
| raw | JSON | null | the listed row, untouched |
| first_seen_at | TIMESTAMP | NOT NULL | the refresh that first stored the code |
| fetched_at | TIMESTAMP | NOT NULL | the refresh that last listed the code |
| active | INTEGER | NOT NULL, default 1 | 0 once a refresh no longer lists the code |
| plan_fetched_at | TIMESTAMP | null | when this hospital first fetched an insurance plan from this payer for any patient (a [D10. claim_plan](D10-claim-plan.md) plan settled `ready`): the payer is "In network" from then on ([S17. Beneficiary Discovery](../screens/S17-beneficiary-discovery.md)). Null until then; set once, never cleared or moved by a refresh |

The list carries only these four fields per participant (code, name, address, state): status, endpoint and certificate are read per code from [G4. Registry and Certificates](../gateway/G4-registry.md) `fetch_participant` and `certificate` when needed.

#### D32K. KEYS AND INDEXES
- Primary key `code` (or a surrogate integer id with `code` unique; the reference implementation does the latter). `code` is compared case-insensitively on refresh.
- Index on (`role`, `entity_type`) for the counts and the kind filter; index on (`role`, `name`) for the picker's ordering.
- No foreign keys. [D9. claim](D9-claim.md) `payer_id` is not a foreign key to this table: a case may name a code the list has retired.

#### D32U. USED BY
- Screens: [S2. Select Policy](../screens/S2-select-policy.md), [S17. Beneficiary Discovery](../screens/S17-beneficiary-discovery.md), [S19. NHCX Settings](../screens/S19-nhcx-settings.md)
- APIs: [A1. Policy Search](../apis/A1-policy-search.md)
- Database: [D1. organization](D1-organization.md), [D8. terminology](D8-terminology.md)
- Gateway: [G4. Registry and Certificates](../gateway/G4-registry.md)
