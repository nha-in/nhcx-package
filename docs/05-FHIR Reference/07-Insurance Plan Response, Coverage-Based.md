# Insurance plan response, coverage-based

The shape a private insurer or its TPA sends, and the generic shape on the exchange. An indemnity policy lists benefits with money limits, and the hospital bills against those limits rather than against a package price.

## The bundle

| # | Resource | Profile |
| :-- | :-- | :-- |
| 1 | `InsurancePlan` | [InsurancePlan](https://nrces.in/ndhm/fhir/r4/StructureDefinition-InsurancePlan.html) |
| 2 | `Organization (ins)` | [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html) |
| 3 | `Questionnaire` | none |
| 4 | `Questionnaire` | none |
| 5 | `Questionnaire` | none |
| 6 | `Questionnaire` | none |
| 7 | `Questionnaire` | none |

## Elements

NRCeS profile: [InsurancePlan](https://nrces.in/ndhm/fhir/r4/StructureDefinition-InsurancePlan.html).

| Element | Example |
| :-- | :-- |
| `coverage[].type.coding[]` | `737481003` Inpatient care management (procedure) in `http://snomed.info/sct` |
|  | `710967003` Management of health status after discharge from hospital (procedure) in `http://snomed.info/sct` |
|  | `409972000` Pre-hospital care in `http://snomed.info/sct` |
| | and 6 more |
| `coverage[].benefit[].type.coding[]` | `309904001` Intensive care unit (environment) in `http://snomed.info/sct` |
|  | `87612001` Blood in `http://snomed.info/sct` |
|  | `24099007` Oxygen (substance) in `http://snomed.info/sct` |
| | and 20 more |
| `coverage[].benefit[].limit[].value` | value `90`, comparator `<=`, unit `day` |
|  | value `60`, comparator `<=`, unit `day` |
| `coverage[].benefit[]` | id `PROC-PED-05` |
|  | id `PROC-CARD-04` |
|  | id `PROC-CAT-03` |
| | and 2 more |
| `coverage[].benefit[].type` | text `Paediatric Pneumonia, PICU Management` |
|  | text `Percutaneous Transluminal Coronary Angioplasty (PTCA)` |
|  | text `Cataract Surgery with Foldable IOL` |
| | and 2 more |
| `plan[].identifier[]` | use `official`, value `Sandbox Default Policy` |
| `plan[].type.coding[]` | `01` Individual in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-plan-type` |
| `plan[].generalCost[].cost` | value `500000`, currency `INR` |
| `plan[].specificCost[].category.coding[]` | `49122002` Ambulance, device (physical object) in `http://snomed.info/sct` |
|  | `224663004` Single room (environment) in `http://snomed.info/sct` |
|  | `309904001` Intensive care unit (environment) in `http://snomed.info/sct` |
| | and 4 more |
| `plan[].specificCost[].benefit[].type.coding[]` | `49122002` Ambulance, device (physical object) in `http://snomed.info/sct` |
|  | `224663004` Single room (environment) in `http://snomed.info/sct` |
|  | `309904001` Intensive care unit (environment) in `http://snomed.info/sct` |
| | and 16 more |
| `plan[].specificCost[].benefit[].cost[].type.coding[]` | `fullcoverage` |
|  | `Procedure` Selected treatment or service or product is a type of procedure or package in `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-plan-type` |
| `plan[].specificCost[].benefit[].cost[].value` | value `5000`, unit `INR` |
|  | value `10000`, unit `INR` |
|  | value `20000`, unit `INR` |
| | and 6 more |
| `plan[].specificCost[].benefit[]` | id `PROC-PED-05` |
|  | id `PROC-CARD-04` |
|  | id `PROC-CAT-03` |
| | and 2 more |
| `plan[].specificCost[].benefit[].type` | text `Paediatric Pneumonia, PICU Management` |
|  | text `Percutaneous Transluminal Coronary Angioplasty (PTCA)` |
|  | text `Cataract Surgery with Foldable IOL` |
| | and 2 more |

## Claim-Condition flags

| Flag | Values in the plan | What it governs |
| :-- | :-- | :-- |
| `ProcedureType` | `Critical Care`, `Day Care`, `Surgical` | The kind of care the benefit covers, such as surgical, day care or critical care |
| `IsDayCare` | `N`, `Y` | Day-care treatment, no overnight stay |
| `ImplantApplicable` | `N`, `Y` | Whether an implant may be billed under the benefit |

## Supporting-information requirements

| Code | Display | Stage | System |
| :-- | :-- | :-- | :-- |
| `POI` | Proof of identity | preauth | `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
| `DIA` | Diagnostic report | preauth | `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
| `RAD` | Radiology / X-Ray / CT / MRI Scan Reports | preauth | `<participant-defined>` |
| `HDS` | Hospital discharge summary | discharge | `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
| `CD` | Clinical document | discharge | `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
| `ICU` | ICU Flow Chart & Vital Monitoring Log | discharge | `<participant-defined>` |
| `HDS` | Hospital discharge summary | claim | `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
| `MB` | Medical bill | claim | `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
| `FCF` | Filled claim form | claim | `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
| `INF` | Additional info related to claim | any | `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
| `STG` | Standard Treatment Guidelines | any | `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
| `ANG` | Coronary Angiography Film & CD Report | preauth | `<participant-defined>` |
| `ECG` | 12-Lead Electrocardiogram (ECG) Strip | preauth | `<participant-defined>` |
| `MB` | Medical bill | preauth | `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
| `EST` | Detailed Pre-Auth Cost Estimate | preauth | `<participant-defined>` |
| `IMP` | Document Type - Implant | discharge | `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
| `IMP` | Document Type - Implant | claim | `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
| `CER` | Medical Certficate | preauth | `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
| `MB` | Medical bill | discharge | `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
| `DIA` | Diagnostic report | claim | `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
| `HIS_PATH` | Histopathology / Biopsy Report | claim | `<participant-defined>` |
| `CD` | Clinical document | claim | `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` |
| `OTR` | Operation Theatre Notes & Surgical Summary | claim | `<participant-defined>` |

10 of the requirements link a questionnaire through `documentationUrl`.

## Exclusions

| category | statement | item |
| :-- | :-- | :-- |
| Excl01 | Expenses related to the treatment of a pre-existing Disease (PED) and its direc… |  |
| Excl02 | Expenses related to the treatment of the listed conditions, surgeries and treat… | 86077009 |
| Excl03 | Expenses related to the treatment of any illness within 30 days from the first … |  |
| Excl08 | Expenses for cosmetic or plastic surgery are excluded unless required as part o… |  |

## Questionnaires

| Title | Items | Item types | Question in |
| :-- | :-- | :-- | :-- |
| Paediatric Pneumonia, PICU Management, Standard Treatment Guidelines | 4 | `string` | `text` |
| Percutaneous Transluminal Coronary Angioplasty (PTCA), Standard Treatment Guide… | 5 | `string` | `text` |
| Cataract Surgery with Foldable IOL, Standard Treatment Guidelines | 4 | `string` | `text` |
| Acute Appendectomy (Laparoscopic), Standard Treatment Guidelines | 4 | `string` | `text` |
| Total Knee Replacement (Unilateral), Standard Treatment Guidelines | 5 | `string` | `text` |

## Rules

### 1. One structure per benefit

Everything about a benefit, its conditions and required documents, hangs off `coverage[].benefit[]`, with its money cap in `limit[]`. `plan[].specificCost[]` carries the cost per benefit category.

### 2. Conditions are prose

The `Claim-Condition` extension on a benefit carries a sentence, such as a window after discharge, with the number in `limit[]` as a value, a comparator and a unit.

### 3. Benefit types are the insurer's vocabulary

No closed value set is published for indemnity benefit types. Ask the insurer for its list before building a picker.

### 4. Requirements by stage

Supporting-info requirements name the stage they apply to, preauthorisation, discharge or claim, in the extension url.

### 5. Exclusions

Waiting periods, pre-existing-condition rules and excluded procedures are `Claim-Exclusion` extensions on the plan, each with a category and a statement.

### 6. What the screen caps

The amount, against the benefit's limit. Submission is blocked by an amount over the limit or a missing mandatory document.

## PMJAY

PMJAY does not send this shape. Its plan is package-based; see the previous chapter.
