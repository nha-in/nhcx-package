# Screens

Each file has ROUTE (R), DESCRIPTION (D), LAYOUT (L) and ACTIONS (A) sections. DESCRIPTION and ACTIONS are required behaviour; LAYOUT is the reference implementation's arrangement [REF](../references/PAYERS.md#markers) and follows the target's own conventions. Every control is named by its kind (type-ahead, select, table, chip, card, accordion, dialog, date picker, file input, flash), and the host's own component of that kind builds it ([SCREENS.md](../references/SCREENS.md), Component kit). S13 to S16 are screens most HMIS already have: only their NHCX additions are built, and the ABHA additions are left out when the HMIS's ABDM module already has them ([SCAFFOLDING 4a](../references/SCAFFOLDING.md)). S19 is the facility's NHCX settings, the one screen an administrator needs to onboard the facility and rotate its key without a developer.

## Claims

| # | Screen | Route | File |
|---|---|---|---|
| [S5](S5-claim-master.md) | Claim Master | `claims`, `claims/list` | [S5-claim-master.md](S5-claim-master.md) |
| [S6](S6-claim-detail.md) | Claim Detail | `claims/view/:caseid` | [S6-claim-detail.md](S6-claim-detail.md) |
| [S11](S11-claim-submission.md) | Claim Submission | `claims/view/:caseid/claim` | [S11-claim-submission.md](S11-claim-submission.md) |
| [S18](S18-beneficiary-verification.md) | Beneficiary Verification | card on `claims/view/:caseid/preauth` and `claims/view/:caseid/claim` | [S18-beneficiary-verification.md](S18-beneficiary-verification.md) |

## Facility

| # | Screen | Route | File |
|---|---|---|---|
| [S19](S19-nhcx-settings.md) | NHCX Settings | `settings/nhcx` | [S19-nhcx-settings.md](S19-nhcx-settings.md) |

## Flow

The Claims module has two entries, the Claim dashboard (S5) and Claim management, a stepper of S1 Search Policy (steps Patient and Search policy, shaped by the two S19 settings), S2 Select Policy (with "None of these" to S17), the validation gate and then S6 Claim Detail. The tabs of S6 run in episode order: Overview (S3, with the insurance plan's refetch of S7), Pre-authorisation (proof of presence S18 at stage Preauth when the payer needs it, the line items and both checks of S8, the details of S4, the forms, documents and send of S9), Claim (S18 at stage Discharge when needed, the IPD admission link of S4, the discharge, documents, forms and claim of S11), Communication (S10), Payments (S12) and Logs (S6). Claim and Payments appear once a pre-authorisation has been raised. There is no Line items, Insurance plan, Validate, Verification or Predetermination tab. The questions the integration must settle before building, and where each answer lands, are L1.A in [L1 Discovery](../steps/L1-discovery.md). The admission is found by ABHA through the patients of S13 and S15, and the treating doctors are picked from S16. Screens this skill does not hold are specified in the skill named beside them.
