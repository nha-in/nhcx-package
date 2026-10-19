# Screens

Every screen of the claim, patient and practitioner flows, in one list. Each row links to its full spec in [../screens/](../screens/INDEX.md). Routes are the application's own; "tab" means a tab of the claim page S6. A spec whose screen was folded into another (S4, S7, S8, S18) keeps its id and says where its parts now live.

## Claims

| # | Screen | Route | What it does | APIs | Callbacks |
|---|---|---|---|---|---|
| [S4](../screens/S4-claim-creation-form.md) | Pre-authorisation Details and Admission Link | `claims/view/:caseid/preauth` and `claims/view/:caseid/claim` (cards) | Two cards: the Pre-authorisation details on the Pre-authorisation tab (planned admission and discharge dates, ICD-10 diagnoses with SNOMED CT mapped, treating doctors), which belong to the pre-authorisation alone; and Link the IPD admission on the Claim tab, the stay found by ABHA that the claim bills. | none | none |
| [S5](../screens/S5-claim-master.md) | Claim Master | `claims`, `claims/list` | One module, two screens: the Claim dashboard (counts by stage, leg and payment for a period and a payer) and Claim management (the claim list with quick tabs, a debounced search and payer filter, the entry to the stepper S1, to discovery S17 and to S6). | none | none |
| [S6](../screens/S6-claim-detail.md) | Claim Detail | `claims/view/:caseid` | The case shell: header chips, next-action buttons, the six tabs in episode order with a dot where the payer has something new, and the Logs tab. Polls every waiting leg on load. | [A17](../apis/A17-claim-state.md) | [C1](../callbacks/C1-callback-door.md), [C7](../callbacks/C7-cancel-on-submit.md) |
| [S7](../screens/S7-insurance-plan.md) | Insurance Plan | `claims/view/:caseid/preauth` and `claims/view/:caseid/eligibility` (cards) | The payer's package master for the case: fetched by itself once the case is in force, fetched by the desk on the Pre-authorisation tab while not ready, refetched from the Overview's Validation card. No tab of its own; the package (S7.1), forms (S7.2) and form (S7.3) reads feed the line items and the forms. | [A3](../apis/A3-insurance-plan-request.md), [A10](../apis/A10-txn-related.md), [A11](../apis/A11-txn-dispatch.md), [A17](../apis/A17-claim-state.md) | [C4](../callbacks/C4-insuranceplan-on-request.md) |
| [S8](../screens/S8-line-items.md) | Line Items | `claims/view/:caseid/preauth` (cards) | The Line items card on the Pre-authorisation tab: a type-ahead over the insurance plan adds procedures and implants, one table edits and removes them, the plan's implants and ward tiers are suggested under it; beside it, once a line is quoted, the Benefits check card and the Authorisation requirements card (S8.2). Neither check holds the pre-authorisation. | [A2](../apis/A2-coverage-eligibility-check.md), [A10](../apis/A10-txn-related.md), [A11](../apis/A11-txn-dispatch.md) | [C3](../callbacks/C3-auth-requirements-on-check.md) |
| [S9](../screens/S9-preauthorisation.md) | Pre-authorisation | `claims/view/:caseid/preauth` | The Pre-authorisation tab: proof of presence when the payer needs it, the line items and both checks (S8), the details (S4), the payer's forms, the documents, and the card that sends the pre-auth (or an enhancement, or a query answer), shows the verdict, cancels and asks where it stands. | [A2](../apis/A2-coverage-eligibility-check.md), [A4](../apis/A4-preauth-submit.md), [A6](../apis/A6-task-submit.md), [A10](../apis/A10-txn-related.md), [A11](../apis/A11-txn-dispatch.md) | [C5](../callbacks/C5-preauth-on-submit.md), [C7](../callbacks/C7-cancel-on-submit.md), [C8](../callbacks/C8-enquiry-on-submit.md) |
| [S18](../screens/S18-beneficiary-verification.md) | Beneficiary Verification | card on `claims/view/:caseid/preauth` and `claims/view/:caseid/claim` | Proof of presence: the beneficiary authenticated against their ABHA by fingerprint, iris or face. A card at the top of the Pre-authorisation tab (stage Preauth) and the Claim tab (stage Discharge), shown only when the payer or its plan requires it. | [A4](../apis/A4-preauth-submit.md), [A18](../apis/A18-biometric-authentication.md), [A19](../apis/A19-abha-m1.md) | none |

## Patient

| # | Screen | Route | What it does | APIs | Callbacks |
|---|---|---|---|---|---|
| [S13](../screens/S13-patient-list.md) | Patient List | `patients/list` | Finds a registered patient by name, MRN, mobile or ABHA, and opens the chart or registers a new patient. | [A19](../apis/A19-abha-m1.md) | none |
| [S14](../screens/S14-patient-registration-form.md) | Patient Registration Form | `patients/new`, `patients/edit/:id` | Registers or edits a patient, including the ABHA number and address that link a claim to an admission. | [A4](../apis/A4-preauth-submit.md), [A18](../apis/A18-biometric-authentication.md), [A19](../apis/A19-abha-m1.md) | none |
| [S15](../screens/S15-patient-detail.md) | Patient Detail | `patients/view/:id` | The chart: overview, encounters, problems and allergies, vitals, laboratory and billing. | [A4](../apis/A4-preauth-submit.md), [A19](../apis/A19-abha-m1.md) | none |

## Practitioner

| # | Screen | Route | What it does | APIs | Callbacks |
|---|---|---|---|---|---|
| [S16](../screens/S16-practitioner-master.md) | Practitioner Master | `practitioners/list` | Adds, edits and retires doctors, with the HPR id, registration and qualification the claim's care team sends; active doctors fill every picker. | [A4](../apis/A4-preauth-submit.md) | none |

## Facility

| # | Screen | Route | What it does | APIs | Callbacks |
|---|---|---|---|---|---|
| [S19](../screens/S19-nhcx-settings.md) | NHCX Settings | `settings/nhcx` | The facility's NHCX setup, kept by the desk's administrator under the HMIS's facility settings: the facility profile (HFR id, from the ABDM module when it has one; participant code, the gateway's default when blank; how a claim starts), the participant registry record with the endpoint and certificate verdicts and an Update the registry action, key rotation (stage, register certificate, activate, retire), the participant master with its counts and Refresh now, and a link to the doctors and staff master. | [A4](../apis/A4-preauth-submit.md), [A16](../apis/A16-gateway-token.md) | none |

## Component kit

The specs describe each screen by what it shows and does, never by a framework, router or component library. Where a spec needs a control it names the **kind** of component and its behaviour:

| Kind | What the specs use it for |
|---|---|
| type-ahead (autocomplete) | a search-as-you-type field that lists matches under it and picks one: the patient on S1, a package code on the Pre-authorisation tab |
| select | a closed list of options, with a blank or "All" first where the spec says so |
| table | rows and columns, scrolling sideways inside its card on a narrow screen |
| chip (badge) | a short status word in a tone: info, success, warning, danger or neutral |
| card | a titled block of the page, with actions in its header and a footer for its main button |
| accordion | sections that open and close, several open at once unless the spec says otherwise |
| dialog | a confirm ("Remove this document from the claim?") or a picker over the page (the records picker) |
| date picker | a date, or a date and time where the spec says so |
| file input | one file or several, with the types the spec allows |
| flash (toast) | the green or red message an action leaves, shown verbatim |
| tabs with a dot | the claim's tab bar, a dot beside a tab with something new from the payer |

Who provides each kind:

1. L1 records, for every kind above, the component the host HMIS already uses for it, with its file and one screen that uses it ([L1 Discovery](../steps/L1-discovery.md), the host's component kit). It is read from the host's own screens, not from a library's catalogue: the type-ahead a patient search already uses is the one the claims screens use.
2. L5 builds every screen from those components. It never writes a second component for a kind the host has. Two different HMIS therefore end with the same screens (the same fields, order, states, texts and actions) built from their own parts.
3. Only when the host has no component of a kind does L5 write a minimal one, styled with the host's tokens (colours, spacing, type), and record it in code.json.

The LAYOUT section of each spec is the reference arrangement [REF](PAYERS.md#markers); it follows the host's conventions. What is required is in DESCRIPTION and ACTIONS: the fields and their order, the options, the columns, the states, the empty states, the messages (verbatim) and the actions.
