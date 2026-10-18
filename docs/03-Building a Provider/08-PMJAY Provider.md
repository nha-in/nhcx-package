# PMJAY provider

The chapters before this one describe the flow NHCX defines for any payer. When the payer is PMJAY the endpoints do not change, but the rules around every screen do. This chapter collects them, in the same order as the generic chapters, so that a hospital building for the scheme reads the generic chapter for the shape and this one for the differences.

The Overview's PMJAY chapters explain why these rules exist. This chapter is about what to build.

## What changes, in one table

| Generic flow | Under PMJAY |
| :---- | :---- |
| Patient found by ABHA, member ID or mobile | Also by Ayushman ID; a member card is shown; the patient is biometrically verified on the pre-authorisation and again on the claim |
| Plan is coverage-based or package-based | Always package-based, with flags on every package that drive the screen |
| Documents are attached as scans | Clinical documents must be structured ABDM health-information types |
| Payer queries arrive as a communication request | Payer queries arrive inside the queried `ClaimResponse`; the answer goes on the preauthorisation or claim endpoint |
| Provisional discharge submission, then final claim | No discharge submission; the claim asserts the discharge and carries its details |
| Appeal once the decision arrives | Reprocess after rejection at once; shortfall only after payment 33 is acknowledged; each once; the Committee is final |
| Communication channel carries document requests | Communication channel carries TAT alerts, grievances, wallet and policy changes, arbitration acknowledgements; never document queries |
| Go live when production credentials arrive | Go live when NHA maps the hospital's HEM ID to its participant ID; in-flight TMS cases finish in TMS |

## Registration

**Search** by Ayushman ID, mobile or ABHA. Show the member card once found.

**Verify the patient biometrically.** The scheme asks for proof of presence at admission; the system captures it on the pre-authorisation step, stage `Preauth`, which may come before admission, and again on the claim. Build all three methods, fingerprint, iris and face; any may be the one that works for a given patient, and the scheme requires all three to be available. Fingerprint and iris are an init-then-verify pair. Face is a separate flow: initiate, show a QR code the patient scans in the ABHA app, poll until capture completes, verify with the Aadhaar number encrypted under the key the portal supplies.

On success the system holds a **user token**, valid 30 minutes, with a refresh token. It goes in the header of the eligibility check and the preauthorisation. Refresh it automatically through the transaction; if it lapses, authenticate again. A fresh authentication is required at discharge, and that token rides on the claim. It need not use the same method as the preauthorisation; a case authenticated by fingerprint at admission can be authenticated by face at discharge. And where biometrics fail at discharge, the discharge authentication-consent questionnaire from the plan stands in, exactly as at registration.

**Where biometrics are not possible**, capture the Aadhaar exemption consent, signed by patient and hospital representative, as a document on the record, and answer the authentication-consent questionnaire. There are two of them and they come from different places: the one for a preauthorisation arrives in the coverage eligibility response with purpose auth-requirements, the one for discharge is in the insurance plan. The payer refuses a request that has neither a valid biometric token nor the matching consent response, and names which is missing. The FRD adds that the exemption undertaking is submitted to the payer at claim time. The consent has a prescribed format that the payer's fraud engine checks. The one case with no fallback is a cyclic procedure, where live biometrics are required at every step.

**Applicability.** Biometric verification applies to beneficiaries whose ABHA is linked to their PMJAY card; others follow the scheme's existing KYC.

**Cover.** Eligibility with purpose validation returns the wallet: one benefit entry per wallet, allowed and used. The whole family shares one annual limit; show what remains, and refuse registration when it is exhausted.

**Capture** communication address, care plan and attendant details, and upload the authentication consent.

## Insurance plan

Package-based, and large: the reference response is 21 MB with over two thousand questionnaires. Store it as data, versioned.

**The flags drive the screen.** Every package carries claim-condition flags, and the treatment screen must obey them:

| Flag | What the screen does |
| :---- | :---- |
| `GovtReserved` | Hide from private hospitals |
| `ApprovalNotRequired` | Tell the user the case will auto-approve if it is the first preauthorisation and every package has it |
| `ScheduledTATApproval` | Tell the user the payer's silence within the window means approval |
| `EnhancementAllowed` | Only these packages may be added during an enhancement |
| `QuantityAllowed` | Cap the quantity field |
| `ImplantApplicable` | Show the implant picker |
| `MaximumImplantsAllowed` | Cap the number of implants |
| `MultipleImplantsAllowed` | Allow more than one implant on the package |
| `StratificationAllowed` | Show the bed-category picker |
| `MaximumStratificationAllowed` | Cap the number of bed categories |
| `MultipleStratificationAllowed` | Allow more than one bed category on the package |
| `Standalone` | Refuse any other package alongside it |
| `ParentProcedure` | Require one of the listed parents |
| `Unspecified` | Quoted from the plan like any package; the amount is an open rate the desk types, validated on the server against the wallet |
| `CyclicProcedure` | Ask the number of cycles |
| `MaximumCyclesAllowed` | Cap the number of cycles |
| `LamaDamaProcedure` | Offer only on a LAMA or DAMA discharge |
| `DischargeStagesLamaDamaProcedure` | Offer only at the discharge stages it lists |
| `IsDayCare` | Day-care handling |
| `ProcedureType` | Medical and surgical packages cannot be combined, and one medical package per episode |
| `LengthOfStay` | Maximum length of stay for the package; bounds the days claimed, including the `LM100` day count |
| `GstApplicable` | Whether tax applies to the package |
| `GstPercentage` | The tax rate when it does |
| `IncentiveApplicable` | Whether a hospital incentive applies |
| `IpOpFlag` | In-patient or out-patient |
| `RulesApplicable` | Whether further rules attach to the package |

That table is the specification. The one published plan payload carries sixteen of these flags and not the rest: `Standalone`, `Unspecified`, `LamaDamaProcedure`, `LengthOfStay`, the tax pair, `IncentiveApplicable`, `IpOpFlag` and `RulesApplicable` appear nowhere in it. Do not read that as proof they are unused, because the sample is one scheme's plan at one moment. Read it as a warning to code defensively:
- **`GstApplicable` and `GstPercentage`**: The handbook describes the first as whether GST is applicable for the benefit and the second as the "GST % applicable for the given benefit". No published source gives a rate or says which packages carry tax. In the handbook's worked claim response the tax is a claim-level total, `ClaimResponse.total` with category `tax`: 100 on a claim of 13,700.
- **`IncentiveApplicable`**: Described only as whether an incentive to the hospital is applicable for the benefit. No published source gives the criteria or the rate. The same worked response carries a claim-level total with category `incentive` of 137 on 13,700, and the handbook's approved reprocess example repeats both figures.
- **`LengthOfStay` (Maximum Length of Stay)**: Specifies the ceiling on inpatient days for the procedure. Stays extending beyond `LengthOfStay` require clinical justification or an approved enhancement request (workflow 13); for LAMA/DAMA discharges, procedure `LM100` daily quantity cannot exceed `LengthOfStay`.

There is a second trap in the same payload, and it will cost a day if you meet it unprepared. The flags and the money live in two different places. The claim-condition flags, the document requirements and the rate limits hang off the plan's coverage benefits, while the costs hang off the plan's own cost list. Both structures carry the same package codes, and neither is complete on its own, so building the treatment screen means joining them on the package code. The Insurance Plan Response chapter in the FHIR Reference sets out both shapes.

**Refresh** weekly per the FRD, or every fifteen days per the scenario sheet, and immediately on renewal, amendment or a `policychange` communication. An outdated tariff version causes a rate mismatch and automatic rejection on suspicion of tampering; keep the version on every submission.

**Add-ons** come from the package's cost qualifiers: implant, stratification, high-end medicine, investigation, each with its own code from the plan master, each a separate item on the bundle.

## Preauthorisation

The five sections of the generic form, with these additions:

- Medical information comes from the HMIS record as structured documents: general findings, personal and family history.
- The questionnaire the plan points at for each package (the scheme's treatment-guideline, STG, form) is rendered from the plan and answered here; a missing response for a package that demands one is refused by name.
- Documents and questionnaires required for preauthorisation are those the eligibility call with purpose auth-requirements returns. The rest are mandatory at claim.
- Amounts are the plan's rates and are not editable, except on an unspecified package.
- A preauthorisation cannot be raised more than one day before admission.
- The biometric user token, or the consent questionnaire, must be present.
- `LM100` is never valid here.

**Documents and size limits.**

- Clinical documents (`DIA`, `HDS`, `CD`, `INF`) go as a reference: a `DocumentReference` whose `attachment.data` is a base64 FHIR bundle, content type `application/json` or `application/fhir+json`.
- Scans (`POI`, `POA`, `DOB`, `DEF`, `FIR`, `ATT`) go as attachments.
- One document per item, 2 MB at most.
- A preauthorisation or claim message is capped at 20 MB.
- The scheme's `InsurancePlan` response is bigger, 21 MB to 25 MB, because it embeds over 2,200 questionnaires. HTTP clients and reverse proxies must accept 25 MB for plan fetches.


**Auto-approval** applies when this is the first preauthorisation for the case and every package carries `ApprovalNotRequired`, or when the policy allows turnaround-time approval and the payer has not acted in its window. Show the user which rule applied.

**Queries arrive inside the response.** A queried `ClaimResponse`, workflow 24, carries the query text in `item.adjudication.reason.coding.display` as a pipe-delimited audit trail, `USER~datetime~type~comment~actor`, where `actor` is whoever wrote the entry: `PPD-Trust` on a preauthorisation, `CPD-Trust` on a claim, or the hospital's name. Treat it as display text: split it on `|` and `~` to show each entry and its comment, but never parse a timestamp from it, because the date formats vary. The answer is the same preauthorisation bundle, new correlation ID, original reference, workflow 19, on `/v1/preauth/submit`. Not a communication response, and not a resubmission.

**Enhancement** (13): only against an approved case, only after the previous request has closed, only for packages flagged enhanceable, unlimited until discharge within the wallet. **Resubmission** (121): revises an approved or rejected case for a different amount or package, and voids everything before it. **Cancel** (PC01): allowed while the claim, if raised, is still with the payer, being decided or queried, and refused once the payer has decided the claim, as in the generic flow. Once the claim is submitted the preauthorisation is read only: no enhancement and no resubmission.

**Server-side checks** the payer will make and the screen should make first:

- Amount above zero and within the wallet.
- Specialty and package codes and displays exactly as the plan has them.
- Quantity at least one.
- Registration and admission dates present.
- One active preauthorisation per beneficiary across all hospitals.
- Investigations, mandatory for private hospitals.
- Newborn cases with date of birth, gender and documents, within six years.

## Discharge and claim

**There is no discharge submission.** Raising the claim asserts the discharge, so workflow 14 is not used and the discharge details ride on the claim.

**Discharge type** is one of the four, and each has a questionnaire in the plan found by title (Death, Life, LAMA, DAMA). Authenticate the patient again here. Download the feedback form, hand it over, and upload it back. Under `DIS` the value is the stage. The gateway's own rejection message lists three, Before Surgery, During Surgery and After Surgery; the FAQ lists two, Before and After, and says the transmitted value must stay within the NRCeS set. Send what the payer's validation accepts and confirm before building. The value is sent for medical cases as well as surgical ones. A death also sends the death date under `ONS` / `DTM`.

**LAMA or DAMA before or during surgery** voids every approved item. The claim carries the single line `LM100`, at the rate the package master gives it, with no ward tier on it; a claim that still carries the package is refused with `PAYR-1362`. After surgery the surgery items stand and `LM100` is not used.

**The claim** is built from the preauthorisation with `use = claim`, four dates plus discharge status, the discharge summary as a structured document, the bill, the discharge questionnaire response, and the discharge-stage biometric token in the header. Amount within the preauthorisation's approved amount. The documents mandatory at claim are the plan's list less those already sent at preauthorisation.

**Queries** on a claim arrive and are answered the same way as on a preauthorisation, with workflow 161 on `/v1/claim/submit`. The payer refuses 151, 19 and 16 with `PAYR-1321`.

**After the decision**, two Tasks, both on `/v1/task/submit` with workflow 36:

| | Reprocess | Shortfall |
| :---- | :---- | :---- |
| When | Claim rejected outright, and only then | Claim paid, but short |
| Code | `reprocess`, a document attached | `release` |
| Reason | `claimrejected`, or `rejectiondisputed` | `partialpayment` |
| Amount | None | The difference, never more |
| Gate | None; raise on rejection | Payment notice 33 received, verified, and acknowledged with 17 |
| Times | Once | Once |
| Decided by | Claim Review Committee, final | Claim Review Committee, final |

They do not chain; a shortfall cannot follow a Committee decision. The claim number in the Task is the preauthorisation number the hospital generated. The scheme's use case sheet words the shortfall as the reprocess Task with reason `partialpayment`; a part-paid claim is not rejected, so the reference hospital build sends it as the `release` Task and never sends `partialpayment` as a reprocess reason. Confirm with the scheme which it adjudicates. A claim is never sent again once decided: the query answer on 161 is the only second claim bundle.

## Scheme cases that change the bundle

Five situations the treatment screen has to recognise before it builds anything. The Overview's PMJAY Scheme Rules chapter explains each; this is what the provider system does.

- **Unspecified procedure.** Offer the specialty's unspecified package only within the treating specialty, quoted from the plan like any other line, with its amount as an open rate the desk types, and validate the amount on the server. It is never a custom line. It is a single line item with nothing else beside it. Auth-requirements is still required. Take the code from the plan rather than building it: the FAQ says the specialty prefix plus `215` and a bare `U100`, while the plan carries the specialty prefix plus `U100`, such as `SGU100`.
- **Cyclic procedure.** Ask the cycles, capped by the plan. Take live biometrics at preauthorisation, at every visit with process type Discharge, and at claim. Enforce the 24-hour rolling gap between visits, and record each visit as a numbered structured document with start and end time. One claim goes after the last cycle, and payment comes only for captured cycles. A change of hospital means discharge and a new preauthorisation.
- **Medical package.** One per episode; never alongside a surgical package.
- **Newborn.** Used while the baby has no member ID of its own. Parent's card and wallet, with the parent as primary `Patient` and the child as a linked `Patient` with `link.type = refer`. Date of birth, gender and proof of birth under `DOB` as `BCF` or `DCB` are all mandatory. Twins are two preauthorisations. Bill as "Baby of" the parent with an attachment. A child older than that and under six draws on the parent's wallet as an ordinary case, without the linked-child construct.
- **Implants and stratification.** Separate items with the plan's codes, within the package's maximums; only where the flags allow.

## Payment and communication

The payment flow is the generic one. Two scheme points: the acknowledgement of 33 is the gate on a shortfall claim, and the `TDS` and `Payment` lines on the reconciliation should sum to the approved amount.

The communication channel never carries a document query under PMJAY. It carries `tatquery`, which the handbook reports as the most common reason in live PMJAY traffic, `grievance`, `walletupdate`, `policychange`, and `claimArbitration` when an appeal has been received. Host it regardless.

## Verified in the sandbox

PMJAY Sandbox Run records what the SHA HP sandbox actually did with these rules on 5 and 6 September 2026, from eligibility through to an approved claim. Its findings change what is written above in six places:

- The item needs a FHIR element id, and every supporting-info entry a sequence.
- The practitioner needs an `HPIN` identifier.
- The item's category is the master's specialty code.
- The consent questionnaires that stand in for biometrics are the **plan's**, found by title in the master.
- The claim goes out under the pre-authorisation's number and bills the package alone.
- Documents must be PDF, JPEG, PNG or FHIR JSON. The adjudication APIs, the case id they insist on, and the roles a claim actually walked are in PMJAY Adjudication APIs.

## Going live

The sandbox journey adds a PMJAY team demo to the internal and HTC demos, and the exit form. In production, after the participant is created and configured, the hospital raises a ticket with its HEM ID from TMS and its NHCX participant ID. NHA maps them by hand, and that mapping is the switch. Preauthorisations and claims raised before it finish in TMS; everything after goes through the HMIS. Plan for both running at once, and brief the desk.
