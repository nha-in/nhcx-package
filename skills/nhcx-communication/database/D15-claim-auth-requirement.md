# D15. claim_auth_requirement

#### D15T. TABLE
One row is one document or form the payer's ruling says the procedure set must be accompanied by; primary key `id`; parent table D13. claim_auth (in nhcx-coverage).

#### D15D. DESCRIPTION
Read from each `authorizationSupporting` entry of every item in the payer's `auth-requirements` reply. The payer packs the deciding facts into the entry's free-text `text`, and the payer adapter reads them [PAYER](../references/PAYERS.md#markers):
- `fullUrl: <url>` present: `kind = 'form'`, and `form_url` is the url.
- Otherwise `kind = 'document'`.
- `Type: <word>` gives `stage`, lower-cased. With no Type, the stage is read from the entry's wording by D11's stage rule (`pre`, else `post`; never both); a document or form that still has none gets `pre`.
- `Procedure Code: <code>` gives `for_code`. Otherwise it is the code of the item the entry sits under.
- `code` / `display` come from the entry's first coding.
- `at_preauth` is `1` when `stage` is one of the adapter's pre-auth stages (`pre` for every adapter); `0` when it is `post` (or another claim-side word such as `discharge`). A form is no longer `1` by default: a claim-stage STQ the ruling names rides on the claim, not on the pre-authorisation.

Entries are de-duplicated on (`kind`, `code`, `form_url`) across the whole reply.

How it is used, when the ruling is `ready`:
- Pre-authorisation (S9): the documents with `at_preauth = 1` are required, and every form the ruling names (whatever its `at_preauth`) is looked up in D12 (in nhcx-coverage) by `form_url` (D12. claim_plan_form (in nhcx-coverage)'s rule).
- Claim (S11): the documents with `at_preauth = 0` are required; the forms are every form of the master not named by the ruling. A ruling-named document is not listed again on the claim.
- Requirements are listed ordered by `kind, seq`.

Lifecycle:
- Inserted when a ruling is applied, numbered `seq` 1, 2, ..., after the ruling's earlier requirements are deleted in the same transaction.
- Deleted when a new check is requested for the claim, and with the ruling (`ON DELETE CASCADE`).
- Never updated in place.

#### D15C. COLUMNS
| column | type | null/default | meaning (and allowed values) |
|---|---|---|---|
| id | INTEGER | primary key | row id |
| auth_id | INTEGER | NOT NULL | the ruling (D13 (in nhcx-coverage)) |
| seq | INTEGER | NOT NULL, default `1` | order in the reply after de-duplication |
| kind | TEXT | NOT NULL | `document` or `form` |
| code | TEXT | null | document type code from the entry's coding |
| display | TEXT | null | its display |
| form_url | TEXT | null | Questionnaire url when `kind = 'form'`; null for a document |
| stage | TEXT | null | the payer's own word for when it is wanted (lower case, for example `pre`), else the word D11's stage rule derived (`pre` or `post`) |
| for_code | TEXT | null | the line code it was asked for |
| at_preauth | INTEGER | NOT NULL, default `1` | `1` due with the pre-authorisation, `0` due with the claim |

#### D15K. KEYS AND INDEXES
- Primary key `id` (integer).
- `auth_id` references D13. claim_auth (in nhcx-coverage) `id`, `ON DELETE CASCADE`.
- No unique constraint (de-duplication is done by the parser).
- Index: `ix_claim_auth_req (auth_id, seq)`.
- `form_url` names a D12. claim_plan_form (in nhcx-coverage) `url`, and `for_code` a D16. claim_line (in nhcx-preauth) `code` (no foreign keys). Uploaded files are matched to a document requirement by `code` in [D28. claim_document](D28-claim-document.md).

#### D15U. USED BY
- Screens: [S10. Communication](../screens/S10-communication.md)
- APIs: [A17. Claim State](../apis/A17-claim-state.md)
- FHIR: [F3. CoverageEligibilityResponse](../fhir/F3-coverage-eligibility-response.md)
- Database: [D28. claim_document](D28-claim-document.md)
