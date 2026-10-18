# D33. participant

#### D33T. TABLE
One row is one NHCX participant as the registry lists it: participant code, registered name, role, whether it is a government body or a private participant, and when it was last seen on the list. Primary key `code` (normalised, with `@hcx`). No parent table.

#### D33D. DESCRIPTION
The registry has no name search: its participant list ([G4. Registry and Certificates](../gateway/G4-registry.md) `fetch_participants`, nha:A1 `POST /fetch/participants/list`) answers one role at a time for a registration window, narrowed to government with `entitytype` `Gov` or to private with `Pvt`; sent without an entity type it answers the private list only [SANDBOX](../references/PAYERS.md#markers). The payer pulls the list itself, two calls per role for the three roles (`PROVIDER`, `PAYER`, `TPA`) over a window of `participant.windowYears` back from today (one year by default), and saves every row here with the flag. The desk then names the hospital on a case ([S2. Cases](../screens/S2-cases.md), [S3. Case Desk](../screens/S3-case-desk.md)) and a code in the participants dialog ([S12. Organisation](../screens/S12-organisation.md)) from this table first; the registry is asked for one code ([A17. Participant Lookup](../apis/A17-participant-lookup.md), [G4. Registry and Certificates](../gateway/G4-registry.md) `fetch_participant`) only when the code is not on the list, and that lookup fills in status and roles, which the list does not carry.

Why a window at all: the list filters on registration date, and the desk wants the participants that are live today, which a year covers in production. **In the sandbox the window has to be ten years** [SANDBOX](../references/PAYERS.md#markers): the test participants were registered in 2021 to 2023, and a one-year window misses the PMJAY test payer and the dummy payer. The setting is 10 in a sandbox deployment and 1 in production, never a constant. A provider system keeps the same table for the payers (the provider skill's participant spec); the two are the same design on either side.

**Created and updated.** By a refresh: daily on a schedule, from "Refresh now" on [S12. Organisation](../screens/S12-organisation.md), and on demand when the table is empty or older than a day. A refresh upserts on `code` (`name`, `role`, `entity_type`, `address`, `state`, `raw`, `fetched_at` = now, `active` = 1) and marks a stored code the list no longer carries `active` = 0, never deleting it: cases still name it. One registry failure fails the whole refresh and changes nothing. A code listed under two roles is stored once, under the first role in the order PROVIDER, PAYER, TPA.

**Read.** Provider names on the case list and the case desk (`name` by the numeric part of the code, before any lookup); the participants dialog on [S12. Organisation](../screens/S12-organisation.md) (counts by role and kind, the last refresh, the rows for a role, a government or private chip on each); the hospital flag on a case: a provider listed under `gov` is a government hospital, which some schemes price differently [PAYER](../references/PAYERS.md#markers).

**Deleted.** Never by the application; a master table that survives the transactional reset.

#### D33C. COLUMNS
| column | type | null/default | meaning (and allowed values) |
|---|---|---|---|
| code | TEXT | primary key | participant code, normalised with `@hcx` ([G5. Protocol Headers](../gateway/G5-protocol-headers.md)) |
| name | TEXT | NOT NULL, default `''` | the registered name as listed (`participantname`) |
| role | TEXT | NOT NULL | `PROVIDER`, `PAYER`, `TPA`: the role the list was asked for |
| entity_type | TEXT | NOT NULL | `gov` or `pvt`: which entity type listed the code |
| address | TEXT | NOT NULL, default `''` | as listed (the sandbox fills many with a coordinate or "None" [SANDBOX](../references/PAYERS.md#markers)) |
| state | TEXT | NOT NULL, default `''` | state name as listed |
| raw | JSON | null | the listed row, untouched |
| first_seen_at | TIMESTAMP | NOT NULL | the refresh that first stored the code |
| fetched_at | TIMESTAMP | NOT NULL | the refresh that last listed the code |
| active | INTEGER | NOT NULL, default 1 | 0 once a refresh no longer lists the code |

#### D33K. KEYS AND INDEXES
- Primary key `code`.
- Index on (`role`, `entity_type`); index on (`role`, `name`).
- No foreign keys. [D19. case](D19-case.md) `provider_code` is not a foreign key to this table: a case may name a code the list has retired.

#### D33U. USED BY
- Screens: [S12. Organisation](../screens/S12-organisation.md)
- Gateway: [G4. Registry and Certificates](../gateway/G4-registry.md)
