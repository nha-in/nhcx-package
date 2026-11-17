# S20. Payer Configuration Screen

#### S20R. ROUTE
settings/nhcx/payers

A page under the HMIS's facility settings, reached from the "Payer configuration" card of [S19. NHCX Settings](S19-nhcx-settings.md) and from the settings navigation under "NHCX". Built in every integration. Only a user who may change facility settings edits; everyone else sees the list and the editor read-only.

Routes: `GET settings/nhcx/payers` (the list), `GET settings/nhcx/payers/:id` (one row, with the resolved values beside it), `POST settings/nhcx/payers` (add a payer row), `PUT settings/nhcx/payers/:id` (save), `DELETE settings/nhcx/payers/:id` (a payer row only).

#### S20D. DESCRIPTION
Title "Payer configuration". Description: "How the application behaves towards each payer. Every government scheme follows the GOV default and every other payer the PVT default, unless it has a row of its own here; a row of its own changes only what it sets." Data: [D33. payer_config](../database/D33-payer-config.md), payer names from the participant master ([D32. participant](../database/D32-participant.md)).

**The list.** A table, the two defaults first, then the payer rows by payer name:

| Column | Content |
|---|---|
| Payer | rows 0 and 1: "GOV default" and "PVT default" with the muted line "Every government scheme without a row of its own" / "Every other payer without a row of its own"; a payer row: the payer's registered name ([D32. participant](../database/D32-participant.md), else its code) and the code under it |
| Based on | chip `GOV` (info) or `PVT` (neutral); on the defaults, the row's own kind |
| Changes | on a payer row, the number of columns it sets (non-null), "<n> change(s)", else "Same as <GOV / PVT> default"; on the defaults "-" |
| Auth requirements | the resolved value: `Automatic`, `On request`, `Not supported` |
| Coverage benefits | the same three words |
| Status | a payer row: `Active` (success) or `Ignored` (neutral, `active` 0) |
| Updated | `updated_at` and `updated_by`, or "-" |

Header actions: "Add payer" (plus icon, primary). A row click opens the editor. Empty payer rows: under the defaults, "No payer has a configuration of its own; each follows its default."

**Add payer.** A dialog: "Payer" (a search over the participant master's active payers and TPAs, name and code, the same picker as [S17. Beneficiary Discovery](S17-beneficiary-discovery.md); a code typed that the master does not hold is accepted as typed), "Based on" (`GOV` / `PVT`, preset from the master's `entity_type`, else `PVT`). Refused: no payer chosen ("Choose the payer."), a code that already has a row ("This payer already has a configuration."). On save the row is created with every behaviour empty, so the payer behaves exactly as its default until something is changed, and the editor opens on it. Flash: "Configuration added for <payer name>."

**The editor.** Heading: the payer's name (or "GOV default" / "PVT default"), the code, and the "Based on" select (payer rows only). On a payer row every field shows, under it in muted text, "Default: <value of the base row>", and a field left empty reads as that default; a "Use default" link beside a field that is set empties it. On the default rows every field is required (no empty value), and a note reads "Changes here apply to every payer based on this default that does not set the field itself."

Sections, in order:

1. **Checks on the procedure set.**
   - Authorisation requirements: radio `Automatic` ("The payer rules on procedure sets. The check is sent by itself whenever the line items change and before each pre-authorisation and enhancement."), `On request` ("The desk may ask from the Authorisation requirements card; nothing is sent unasked."), `Not supported` ("The card is hidden and the check is never sent."). Column `auth_requirements` (`auto`, `manual`, `off`).
   - Coverage benefits: the same three choices for the benefits check on the quoted set (`coverage_benefits`).
   - Custom line items: switch (`custom_lines`), help "Show Add a custom line on the line items, so the desk can quote an item or procedure that is not on the payer's plan with the hospital's own code, name and price."
   - Poll an open check every: number, seconds, 0 to 300 ("0 checks only when the case is opened."). `check_poll_seconds`.
2. **Coverage and identity.** Payer code system (`payer_system`, URL); Programme code and its display (`programme_code`, `programme_display`; both empty for none); Proof of presence: `Required` / `Optional` (`proof_of_presence`).
3. **Pre-authorisation.** Publishes a package master: switch (`package_master`); Document stages wanted at pre-authorisation (`preauth_document_stages`, multi-select of the D11 stages, at least one); Multiple-procedure factors (`procedure_factors`, a comma list of decimals between 0 and 1, empty for none, for example `1,0.5,0.25`); Health records as FHIR: switch (`records_as_fhir`).
4. **Queries and tasks.** How the payer asks for more: `By resubmission` / `By Communication` (`query_mode`); Communication reply shape: `PMJAY` / `Generic` (`communication_reply`); Task input naming the case (`task_case_input`, text); Answers a status enquiry: switch (`status_enquiry`); Claim search for "Ask where it stands": switch (`claim_search`), help "Ask the payer for the claim's history on the search API when it answers no status Task."; Reprocess reason codes (`reprocess_reasons`, a comma list, at least one); Reprocess member type (`reprocess_member_type`, text).
5. **Claim.** Discharge before the final claim: switch (`discharge_step`), help "The first claim send is the discharge (workflow 14); the final claim (15) goes once the payer approves it."; LAMA / DAMA procedure (`lama_dama_procedure`, a package code, empty for none), help "A LAMA or DAMA discharge before or during surgery claims this one procedure instead of the pre-authorised lines. Leave empty to claim the lines."; Adjudication desk for sandbox testing (`adjudication_desk`: `NHCX Payer Service` / none).
6. **Workflow ids.** A table of every send kind of [PAYERS.md](../references/PAYERS.md) (pre-authorisation, its resubmission and query answer, enhancement and its query answer, cancel, claim and its query answer, discharge and its query answer, payment acknowledgement, reprocess, release), one text input each; on a payer row an empty input reads as the default's id, shown muted. A muted line under the table names any per-environment override in force ("This environment overrides: <kind> <id>, ...").
7. **Note** (`note`, multi-line, optional) and, on a payer row, "Use this configuration" (switch, `active`), help "Off: the payer follows its default and this row is kept."

**Saving.** "Save" checks, on the server, each a red flash naming the field: a poll interval outside 0 to 300 ("Poll every 0 to 300 seconds."); a factor list that is not decimals between 0 and 1 ("Write the factors as decimals between 0 and 1, separated by commas."); a workflow id that is not 1 to 8 letters and digits ("A workflow id is letters and digits."); on a default row, any field empty ("The default needs a value for every field."); a URL that is not one ("Enter the payer code system as a URL."). It writes the row, `updated_at`, `updated_by`, and an audit line naming the columns changed. Flash: "Payer configuration saved." The change applies to the next send and the next screen load; nothing already sent is resent.

**Delete** (payer rows only, after a confirm "Remove the configuration for <payer>? It will follow the <GOV / PVT> default."): deletes the row. Flash: "Configuration removed; <payer> follows the <GOV / PVT> default." The defaults have no Delete.

#### S20L. LAYOUT
The arrangement below is the reference implementation's [REF](../references/PAYERS.md#markers) shape for a settings page: follow the target HMIS's own screen conventions. What is required is in DESCRIPTION and ACTIONS.

```
|------------------------------------------------------------------|
| Settings > NHCX > Payer configuration              [+ Add payer] |
| How the application behaves towards each payer. ...              |
|------------------------------------------------------------------|
| Payer              Based on  Changes      Auth req.   Benefits   |
| GOV default        [GOV]     -            Automatic   On request |
| PVT default        [PVT]     -            On request  On request |
| SHA HP  <code>     [GOV]     2 changes    Automatic   Automatic  |
|------------------------------------------------------------------|
| SHA HP  <code>                        Based on [GOV v]           |
| 1 Checks on the procedure set                                    |
|   Authorisation requirements (o) Automatic ( ) On request ( ) Off|
|   Coverage benefits          ( ) Automatic (o) On request ( ) Off|
|                              Default: On request                 |
|   Poll an open check every   [15] seconds   Default: 15           |
| 2 Coverage and identity ...                                      |
| 5 Claim  Discharge before the final claim [on]  LAMA/DAMA [LM100]|
| 6 Workflow ids   preauth [  ] Default 12 ...                     |
|                                   [Delete]            [Save]     |
|------------------------------------------------------------------|
```

- Every control is the host's own component of that kind; the page sits among the host's own facility settings.

#### S20A. ACTIONS
1. Add payer: open the dialog; on save create the row (every behaviour empty) and open its editor.
2. Row click: open the editor for that row.
3. Use default: empty that field on a payer row.
4. Save: run the checks, write the row, flash, re-read the list.
5. Delete (payer rows): after the confirm, delete the row, flash, back to the list.
6. Breadcrumb "NHCX": back to [S19. NHCX Settings](S19-nhcx-settings.md).
