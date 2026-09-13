# Insurance plan response, package-based

The shape government schemes send, and PMJAY sends throughout. A package is a named procedure at a fixed, all-inclusive rate. The plan carries every package the hospital may bill and the rules that govern each one. Everything in this chapter is what PMJAY specifies.

## The bundle

| # | Resource | Profile |
| :-- | :-- | :-- |
| 1 | `InsurancePlan` | none declared; NRCeS [InsurancePlan](https://nrces.in/ndhm/fhir/r4/StructureDefinition-InsurancePlan.html) |
| 2 | `Organization (pay)` | none declared; NRCeS [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 3 | `Questionnaire` | none |
| 4 | `Questionnaire` | none |
| 5 | `Questionnaire` | none |
| 6 | `Questionnaire` | none |
| 7 | `Questionnaire` | none |

## Elements

NRCeS profile: [InsurancePlan](https://nrces.in/ndhm/fhir/r4/StructureDefinition-InsurancePlan.html).

| Element | Example |
| :-- | :-- |
| `coverage[].type.coding[]` | `MG` General Medicine in `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-benefitcategory` |
|  | `SG` General Surgery in `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-benefitcategory` |
|  | `MO` Medical Oncology in `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-benefitcategory` |
| | and 4 more |
| `coverage[].benefit[]` | id `MG004A` |
|  | id `MG005A` |
|  | id `MG072C` |
| | and 16 more |
| `coverage[].benefit[].type.coding[]` | `MG004A` Dengue fever (Dengue fever) in `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-productorservice` |
|  | `MG005A` Chikungunya fever (Chikungunya fever) in `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-productorservice` |
|  | `MG072C` Acute Haemodialysis (Acute Haemodialysis) in `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-productorservice` |
| | and 16 more |
| `coverage[].benefit[].limit[]` | id `MGMG004A` |
|  | id `MGMG004ASTRAT006a` |
|  | id `MGMG004ASTRAT006b` |
| | and 77 more |
| `coverage[].benefit[].limit[].value` | value `0`, unit `INR` |
|  | value `1800`, unit `INR` |
|  | value `2700`, unit `INR` |
| | and 14 more |
| `coverage[].benefit[].limit[].code.coding[]` | `MG004A` Dengue fever (Dengue fever) |
|  | `STRAT006a` Routine Ward |
|  | `STRAT006b` HDU |
| | and 23 more |
| `plan[].type.coding[]` | `03` Group in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-plan-type` |
| `plan[].generalCost[].cost` | value `500000`, currency `INR` |
| `plan[].specificCost[]` | id `MG` |
|  | id `SG` |
|  | id `MO` |
| | and 2 more |
| `plan[].specificCost[].category.coding[]` | `MG` General Medicine in `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-benefitcategory` |
|  | `SG` General Surgery in `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-benefitcategory` |
|  | `MO` Medical Oncology in `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-benefitcategory` |
| | and 2 more |
| `plan[].specificCost[].benefit[]` | id `PlanBenefit/MG004A` |
|  | id `PlanBenefit/MG005A` |
|  | id `PlanBenefit/MG072C` |
| | and 12 more |
| `plan[].specificCost[].benefit[].type.coding[]` | `MG004A` Dengue fever (Dengue fever) in `http://hl7.org/fhir/ValueSet/procedure-category` |
|  | `MG005A` Chikungunya fever (Chikungunya fever) in `http://hl7.org/fhir/ValueSet/procedure-category` |
|  | `MG072C` Acute Haemodialysis (Acute Haemodialysis) in `http://hl7.org/fhir/ValueSet/procedure-category` |
| | and 12 more |
| `plan[].specificCost[].benefit[].cost[].type.coding[]` | `Procedure` Selected treatment or service or proudct is a type of procedure or package in `https://www.nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-plan-type` |
|  | `Stratification` Selected treatment or service or proudct is a type of stratification in `https://www.nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-plan-type` |
| `plan[].specificCost[].benefit[].cost[].value` | value `0`, unit `INR` |
|  | value `1800`, unit `INR` |
|  | value `2700`, unit `INR` |
| | and 11 more |
| `plan[].specificCost[].benefit[].cost[].qualifiers[].coding[]` | `STRAT006a` Routine Ward in `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-productorservice` |
|  | `STRAT006b` HDU in `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-productorservice` |
|  | `STRAT006c` ICU - Without Ventilator in `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-productorservice` |
| | and 3 more |

## Claim-Condition flags

| Flag | Values in the plan | What it governs |
| :-- | :-- | :-- |
| `ProcedureType` | `Conservative`, `Medical`, `Surgical` | Surgical, Medical or Conservative. Decides the clinical pathway, the document set, and the one-conservative-package-per-case rule |
| `GovtReserved` | `N` | `Y` means only a government hospital may bill it. Hide it in a private facility |
| `ApprovalNotRequired` | `Y`, `N` | `Y` means treatment need not wait for a decision. The case auto-approves if it is the first preauthorisation and every package has it |
| `EnhancementAllowed` | `Y`, `N` | `Y` means the package may be added on an enhancement |
| `ScheduledTATApproval` | `Y`, `N` | `Y` means the payer's silence within the turnaround window is approval |
| `QuantityAllowed` | `1`, `6` | Maximum quantity per approval |
| `IsDayCare` | `Y`, `N` | Day-care procedure, no overnight stay |
| `ImplantApplicable` | `N`, `Y` | Whether an implant line may be added |
| `StratificationAllowed` | `Y`, `N` | Whether a ward tier may ride as `item.modifier` |
| `MultipleImplantsAllowed` | `N` | Whether more than one implant may be added |
| `MultipleStratificationAllowed` | `Y`, `N` | Whether more than one ward tier may be added |
| `MaximumImplantsAllowed` | `1`, `0` | Cap on the number of implants |
| `MaximumStratificationAllowed` | `1`, `0` | Cap on the number of ward tiers |
| `CyclicProcedure` | `N`, `Y` | Repeatable under one approval, one supporting-info entry per cycle |
| `MaximumCyclesAllowed` | `0`, `6` | Cap on the number of cycles |
| `Standalone` | `N` | Refuse any other package alongside it |
| `ParentProcedure` | `NA`, `IN015A,SB003C,SB015C,SB072A,SB088MLA,SB103MLC,SB106MLA,SL038MLA,SM001MLA,SM003B…`, `IN058A,IN071A,MC023MLA,SB095MLB,SB100MLB,SB108MLA,SE012MLA,SM007B,SM027MLA,SN05…` | On an implant, the package it may accompany |
| `Unspecified` | `N`, `Y` | Free-text name and free-entry amount, validated against the wallet |
| `LamaDamaProcedure` | `Y` | Offer only on a LAMA or DAMA discharge |
| `DischargeStagesLamaDamaProcedure` | `Before Surgery, During Surgery` | The discharge stages at which a LAMA or DAMA package may be billed, before or during surgery |
| `los` | not carried | Maximum length of stay; bounds the days claimed, the `LM100` count included |

## Supporting-information requirements

| Code | Display | Stage | System |
| :-- | :-- | :-- | :-- |
| `POI` | Proof of identity | any | `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
| `ADN` | Aadhaar Number | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `INF` | Additional info related to claim ( conveying additional situation and condition… | any | `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
| `ODN` | Other document | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `DIA` | Diagnostic report | any | `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
| `MAND0409` | any investigations done | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0064` | All investigations reports | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0006` | Detailed discharge summary | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0062` | Detailed ICPs | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0063` | Treatment details | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `CD` |  | any | `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
| `MAND0408` | Clinical notes detailing history and Admission notes showing vitals and examina… | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `STG` | Standard Treatment Guidelines | any | `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
| `MAND0952` | MLC/ FIR +/- Nerve conduction velocity (NCV) + /- MRI + /- MRA + /- EMG (Electr… | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0300` | Detailed operatives notes | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0309` | Intra operative still photograph | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0946` | Clinical notes detailing the injury and need of surgery | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `HDS` |  | any | `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
| `MAND0368` | Procedure / Operative Notes, Detailed Discharge Summary | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND1045` | Clinical notes with planned line of treatment (including indication for need of… | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0384` | MLC/ FIR if traumatic | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0592` | X Ray of affected limb | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0008` | Detailed Procedure / Operative Notes | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0112` | Post Procedure clinical photgraph | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0582` | clinical photograph of affected part | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0604` | clinical notes justifying the indication | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0067` | CBC | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0459` | CECT Thorax, abdomen and Pelvis | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0564` | histopathology (non small cell - adenocarcinoma or adenosquamous carcinoma) | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0074` | LFT | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0457` | RBS | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0447` | RFT | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0099` | BAR CODE OF THE DRUGS | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0102` | CHARTS OF CHEMOTHERAPY REGIMEN | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0101` | DISCHARGE SUMMARY OF INPATIENT DEPARTMENT / DISCHARGE SUMMARY OF DAY CARE DEPAR… | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0100` | REPORTS OF THE TESTS (PATHOLOGY, RADIOLOGY, MICROBIOLOGY, HEMATOLOGY, BIOCHEMIS… | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0103` | TRANFUSION SLIPS | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0189` | Histopathology report | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0226` | Post Procedure Photograph of affected part | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0030` | Procedure / Operative Notes | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0822` | Clinical notes with planned line of treatment justifying indication | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0647` | FIR/MLC in case of accident | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0161` | operative notes | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0159` | Still image of the the procedure with pt. ID and date | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0003` | Clinical notes | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0588` | clinical photograph | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0649` | doctors notes | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0648` | Patient details | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0650` | photo | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0162` | Discharge notes | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0163` | microbiology report | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0164` | Still image of the patient undergoing the procedure with date stamp | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0622` | CECT | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0621` | FNAC/ BIOPSY | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0152` | HPE report | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0151` | Post Procedure Photographs of surgical site | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0339` | Clinical notes with planned line of treatment | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0831` | Audiogram report justfying surgery | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0832` | CT- TEMPORAL BONE of affected side /X-RAY BOTH MASTOIDS | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0730` | USG/CT Abdomen | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0327` | Detailed discharge summary; | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |
| `MAND0326` | Reports of all investigations done and consultation paper of treating doctor me… | any | `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code` |

5 of the requirements link a questionnaire through `documentationUrl`.

## Questionnaires

| Title | Items | Item types | Question in |
| :-- | :-- | :-- | :-- |
| Discharge Information | 7 | `attachment`, `choice`, `dateTime` | `text` |
| General Findings | 9 | `string`, `choice` | `text` |
| Personal History | 6 | `choice` | `text` |
| Family History | 7 | `choice` | `text` |
| Admission Details | 4 | `dateTime`, `choice` | `text` |

## Rules

### 1. Two parallel structures

`coverage[]` carries the rules: flags, document requirements, questionnaire links and `limit[]` rates. `plan[].specificCost[]` carries the money: `cost[]` lines by type. Both hold the same package codes. Index both by package code and join; neither is complete alone.

### 2. Categories

`coverage[].type` and `specificCost[].category` bind to `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-benefitcategory`. Codes beginning `S` are surgical, `M` medical.

### 3. Flags are strings

Every flag except `ParentProcedure` is a `valueString`. `"N"` is truthy in most languages; compare against the literal `"Y"`.

### 4. Cost lines

`Procedure` is the base package rate. `Stratification` is the rate for a ward tier, named in `cost.qualifiers[]`. `Implant` is added over the package rate.

### 5. A zero base rate

A base limit of 0 means the payable amount is set entirely by the ward tier chosen. It is not missing data. Never submit a zero-value item.

### 6. Document requirements come in two shapes

Nested, one sub-extension per document, and flat, with `category`, `code` and `documentationUrl` directly under the extension. Recurse, or one shape is silently dropped.

### 7. Where the question is

Policy-level questionnaires put the question in `item.text`, STG questionnaires in `item.prefix`. Read `text` and fall back to `prefix`.

### 8. Implant codes repeat

Once per parent procedure they may accompany. Key on the package code with its parent, or on the element `id`.

### 9. Extension urls change form

The absolute `https://nrces.in/ndhm/fhir/r4/StructureDefinition/Claim-Condition` and the relative `claim-condition` both occur. Match on the last segment.

## PMJAY

This is the PMJAY shape; the rules above are PMJAY's.
