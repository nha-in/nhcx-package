# Screens

Every screen of the claim, patient and practitioner flows, in one list. Each row links to its full spec in [../screens/](../screens/INDEX.md). Routes are the application's own; "tab" means a tab of the claim page S6. A spec whose screen was folded into another (S4, S7, S8, S18) keeps its id and says where its parts now live.

## Claims

| # | Screen | Route | What it does | APIs | Callbacks |
|---|---|---|---|---|---|
| [S1](../screens/S1-search-policy.md) | Search Policy | `claims/search` | Steps 1 and 2 of the Claim Management stepper: who the claim is for (a registered patient picked in the host's type-ahead, or Skip to start on the identifiers alone), then one identifier (ABHA number, mobile number, member id) validated and searched on the beneficiary registry. | [A1](../apis/A1-policy-search.md) | none |
| [S2](../screens/S2-select-policy.md) | Select Policy | `claims/search/results` | Step 3 of the Claim Management stepper: lists the policies found, always offers "None of these" to discover with a payer, and sends the picked policy through the validation gate; the case opens on S6 only once the payer says the policy is in force. | [A1](../apis/A1-policy-search.md), [A2](../apis/A2-coverage-eligibility-check.md) | [C2](../callbacks/C2-coverage-eligibility-on-check.md) |
| [S3](../screens/S3-policy-discovery.md) | Policy Discovery | `claims/view/:caseid/eligibility` | The Overview tab: the beneficiary, the policy, and the validation with the wallet, whether the policy is in force and the insurance plan's refetch. The validation is sent when the case is created; this tab only resends it. | [A2](../apis/A2-coverage-eligibility-check.md), [A10](../apis/A10-txn-related.md), [A11](../apis/A11-txn-dispatch.md), [A12](../apis/A12-txn-fhir.md), [A13](../apis/A13-txn-list.md) | [C2](../callbacks/C2-coverage-eligibility-on-check.md) |
| [S5](../screens/S5-claim-master.md) | Claim Master | `claims`, `claims/list` | One module, two screens: the Claim dashboard (counts by stage, leg and payment for a period and a payer) and Claim management (the claim list with quick tabs, a debounced search and payer filter, the entry to the stepper S1, to discovery S17 and to S6). | none | none |
| [S6](../screens/S6-claim-detail.md) | Claim Detail | `claims/view/:caseid` | The case shell: header chips, next-action buttons, the six tabs in episode order with a dot where the payer has something new, and the Logs tab. Polls every waiting leg on load. | [A17](../apis/A17-claim-state.md) | [C1](../callbacks/C1-callback-door.md) |
| [S17](../screens/S17-beneficiary-discovery.md) | Beneficiary Discovery | `claims/discovery` | A page of its own for a discovery check: an optional patient, the payer picked from the participant master (government and private, shown by name) with what this hospital already holds of it, the policy named by its number, its member id or both, and the Aadhaar, mobile and ABHA numbers as additional information. A cover chosen goes through the validation gate. | [A2](../apis/A2-coverage-eligibility-check.md) | [C2](../callbacks/C2-coverage-eligibility-on-check.md) |
| [S18](../screens/S18-beneficiary-verification.md) | Beneficiary Verification | card on `claims/view/:caseid/preauth` and `claims/view/:caseid/claim` | Proof of presence: the beneficiary authenticated against their ABHA by fingerprint, iris or face. A card at the top of the Pre-authorisation tab (stage Preauth) and the Claim tab (stage Discharge), shown only when the payer or its plan requires it. | [A18](../apis/A18-biometric-authentication.md), [A19](../apis/A19-abha-m1.md) | none |

## Patient

| # | Screen | Route | What it does | APIs | Callbacks |
|---|---|---|---|---|---|
| [S13](../screens/S13-patient-list.md) | Patient List | `patients/list` | Finds a registered patient by name, MRN, mobile or ABHA, and opens the chart or registers a new patient. | [A19](../apis/A19-abha-m1.md) | none |
| [S14](../screens/S14-patient-registration-form.md) | Patient Registration Form | `patients/new`, `patients/edit/:id` | Registers or edits a patient, including the ABHA number and address that link a claim to an admission. | [A18](../apis/A18-biometric-authentication.md), [A19](../apis/A19-abha-m1.md) | none |
| [S15](../screens/S15-patient-detail.md) | Patient Detail | `patients/view/:id` | The chart: overview, encounters, problems and allergies, vitals, laboratory and billing. | [A19](../apis/A19-abha-m1.md) | none |

## Facility

| # | Screen | Route | What it does | APIs | Callbacks |
|---|---|---|---|---|---|
| [S19](../screens/S19-nhcx-settings.md) | NHCX Settings | `settings/nhcx` | The facility's NHCX setup, kept by the desk's administrator under the HMIS's facility settings: the facility profile (HFR id, from the ABDM module when it has one; participant code, the gateway's default when blank; how a claim starts), the participant registry record with the endpoint and certificate verdicts and an Update the registry action, key rotation (stage, register certificate, activate, retire), the participant master with its counts and Refresh now, and a link to the doctors and staff master. | none | none |

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
