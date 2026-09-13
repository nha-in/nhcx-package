# Codes and value sets

Every code the bundles carry, grouped by the system it is bound to, then the value sets the specifications define beyond them. The workflow codes are in the Overview's Workflow Codes chapter and are not repeated here.

## Codes in the bundles

### `http://hl7.org/fhir/CodeSystem/task-code`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `approve` | Activate/approve the focal resource | `Task.code.coding` | both |

### `http://hl7.org/fhir/resource-types`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `ClaimResponse` |  | `Task.output.type.coding` | generic |

### `http://hl7.org/fhir/sid/icd-10`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `A97` | Dengue | `Claim.diagnosis.diagnosisCodeableConcept.coding` | generic |
| `E11.9` | Type 2 diabetes mellitus without complications | `Claim.diagnosis.diagnosisCodeableConcept.coding` | both |
| `I46.9` | Cardiac arrest, unspecified | `Claim.diagnosis.diagnosisCodeableConcept.coding` | generic |

### `http://hl7.org/fhir/ValueSet/payment-type`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `Payment` | Payment | `PaymentReconciliation.detail.type.coding` | both |
| `RF` | RF | `PaymentReconciliation.detail.type.coding` | PMJAY |
| `TDS` | TDS | `PaymentReconciliation.detail.type.coding` | both |

### `http://hl7.org/fhir/ValueSet/procedure-category`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `LM100` | LAMA DAMA Procedure (LAMA DAMA Procedure) | `InsurancePlan.plan.specificCost.benefit.type.coding` | PMJAY |
| `MG004A` | Dengue fever (Dengue fever) | `InsurancePlan.plan.specificCost.benefit.type.coding` | PMJAY |
| `MG005A` | Chikungunya fever (Chikungunya fever) | `InsurancePlan.plan.specificCost.benefit.type.coding` | PMJAY |
| `MG014A` | Liver abscess (Liver abscess) | `InsurancePlan.plan.specificCost.benefit.type.coding` | PMJAY |
| `MG072C` | Acute Haemodialysis (Acute Haemodialysis) | `InsurancePlan.plan.specificCost.benefit.type.coding` | PMJAY |
| `MO071R` | PemetrexedPemetrexed 500mg/m2 D1 every 21 days (CT for CA Lung) | `InsurancePlan.plan.specificCost.benefit.type.coding` | PMJAY |
| `SB043F` | Hand (Single Stage Amputation) | `InsurancePlan.plan.specificCost.benefit.type.coding` | PMJAY |
| `SBU100` | Unspecified Surgical Package (Unspecified Surgical Package) | `InsurancePlan.plan.specificCost.benefit.type.coding` | PMJAY |
| `SE004A` | Lid Tear Repair (Lid Tear Repair) | `InsurancePlan.plan.specificCost.benefit.type.coding` | PMJAY |
| `SE005A` | Lid Abscess Drainage (Lid Abscess Drainage) | `InsurancePlan.plan.specificCost.benefit.type.coding` | PMJAY |
| `SEU100` | Unspecified Surgical Package  (Unspecified Surgical Package ) | `InsurancePlan.plan.specificCost.benefit.type.coding` | PMJAY |
| `SGU100` | Unspecified Surgical Package  (Unspecified Surgical Package ) | `InsurancePlan.plan.specificCost.benefit.type.coding` | PMJAY |
| `SL026A` | Tracheostomy (Tracheostomy / Tracheotomy) | `InsurancePlan.plan.specificCost.benefit.type.coding` | PMJAY |
| `SL026B` | Tracheotomy (Tracheostomy / Tracheotomy) | `InsurancePlan.plan.specificCost.benefit.type.coding` | PMJAY |
| `ST009B` | Nerve and/or tendon injury. A. Wound exploration and closure. B. Nerve graft. C… | `InsurancePlan.plan.specificCost.benefit.type.coding` | PMJAY |

### `http://snomed.info/sct`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `105461009` | Organ donor | `InsurancePlan.coverage.type.coding`, `InsurancePlan.coverage.benefit.type.coding` | generic |
| `223366009` | Healthcare professional (occupation) | `Claim.careTeam.role.coding`, `PractitionerRole.code.coding` | generic |
| `224663004` | Single room (environment) | `InsurancePlan.plan.specificCost.category.coding`, `InsurancePlan.plan.specificCost.benefit.type.coding` | generic |
| `24099007` | Oxygen (substance) | `InsurancePlan.coverage.benefit.type.coding` | generic |
| `307988006` | Medical technician | `PractitionerRole.code.coding` | both |
| `309904001` | Intensive care unit | `Claim.item.productOrService.coding`, `InsurancePlan.coverage.benefit.type.coding` | generic |
| `394658006` | Clinical specialty (qualifier value) | `Claim.careTeam.qualification.coding` | generic |
| `394802001` | General medicine | `Claim.careTeam.qualification.coding` | both |
| `409972000` | Pre-hospital care | `InsurancePlan.coverage.type.coding`, `InsurancePlan.coverage.benefit.type.coding` | generic |
| `414005` | Percutaneous Transluminal Coronary Angioplasty (PTCA) | `InsurancePlan.coverage.benefit.type.coding`, `InsurancePlan.plan.specificCost.benefit.type.coding` | generic |
| `418285008` | Angioplasty of blood vessel | `Claim.procedure.procedureCodeableConcept.coding`, `Claim.item.productOrService.coding` | generic |
| `427189009` | Paediatric Pneumonia, PICU Management | `InsurancePlan.coverage.benefit.type.coding`, `InsurancePlan.plan.specificCost.benefit.type.coding` | generic |
| `49122002` | Ambulance, device (physical object) | `InsurancePlan.coverage.type.coding`, `InsurancePlan.coverage.benefit.type.coding` | generic |
| `60689008` | Home care of patient | `InsurancePlan.plan.specificCost.category.coding`, `InsurancePlan.plan.specificCost.benefit.type.coding` | generic |
| `710967003` | Management of health status after discharge from hospital (procedure) | `InsurancePlan.coverage.type.coding`, `InsurancePlan.coverage.benefit.type.coding` | generic |
| `71388002` | Procedure (procedure) | `Procedure.code.coding` | both |
| `737481003` | Inpatient care management (procedure) | `Claim.type.coding`, `CoverageEligibilityResponse.insurance.item.productOrService.coding` | both |
| `737850002` | Day care case management (procedure) | `InsurancePlan.coverage.type.coding`, `InsurancePlan.coverage.benefit.type.coding` | generic |
| `77343006` | Angiography | `Claim.procedure.procedureCodeableConcept.coding`, `Claim.item.productOrService.coding` | generic |
| `86077009` | Operation for glaucoma | `InsurancePlan.extension.extension.valueCodeableConcept.coding` | generic |
| `87612001` | Blood | `InsurancePlan.coverage.benefit.type.coding` | generic |
| `89100005` | Final diagnosis (discharge) (contextual qualifier) (qualifier value) | `Claim.diagnosis.type.coding` | generic |

### `http://snomed.info/sct0`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `305056002` | Admission procedure | `CoverageEligibilityResponse.insurance.item.productOrService.coding` | PMJAY |

### `http://terminology.hl7.org/CodeSystem/adjudication`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `benefit` | Benefit Amount | `ClaimResponse.item.adjudication.category.coding`, `ClaimResponse.total.category.coding` | generic |
| `copay` | CoPay | `ClaimResponse.item.adjudication.category.coding` | generic |
| `eligible` | Eligible Amount | `ClaimResponse.item.adjudication.category.coding`, `ClaimResponse.total.category.coding` | generic |
| `submitted` | Submitted Amount | `ClaimResponse.item.adjudication.category.coding`, `ClaimResponse.total.category.coding` | generic |

### `http://terminology.hl7.org/CodeSystem/benefit-type`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `benefit` | Benefit | `CoverageEligibilityResponse.insurance.item.benefit.type.coding` | both |

### `http://terminology.hl7.org/CodeSystem/claimcareteamrole`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `primary` | Primary provider | `Claim.careTeam.role.coding` | both |

### `http://terminology.hl7.org/CodeSystem/communication-category`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `alert` |  | `CommunicationRequest.category.coding` | generic |
| `information` | Information | `Task.reasonCode.coding` | PMJAY |
| `notification` | Notification | `Communication.category.coding`, `CommunicationRequest.category.coding` | both |

### `http://terminology.hl7.org/CodeSystem/coverage-class`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `plan` | Plan | `Coverage.class.type.coding` | generic |

### `http://terminology.hl7.org/CodeSystem/ex-benefitcategory`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `30` | Health Benefit Plan Coverage | `CoverageEligibilityResponse.insurance.item.benefit.type.coding` | PMJAY |

### `http://terminology.hl7.org/CodeSystem/ex-diagnosis-on-admission`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `yes` | Yes | `Claim.diagnosis.onAdmission.coding` | both |

### `http://terminology.hl7.org/CodeSystem/ex-diagnosistype`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `admitting` | Admitting Diagnosis | `Claim.diagnosis.type.coding` | both |

### `http://terminology.hl7.org/CodeSystem/financialtaskcode`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `cancel` |  | `Task.code.coding` | both |
| `poll` | Poll | `Task.code.coding` | both |
| `release` |  | `Task.code.coding` | generic |
| `reprocess` |  | `Task.code.coding` | both |
| `status` |  | `Task.code.coding` | both |

### `http://terminology.hl7.org/CodeSystem/financialtaskinputtype`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `include` | Include | `Task.input.type.coding`, `Task.output.type.coding` | both |
| `status` | Status code | `Task.input.type.coding` | both |

### `http://terminology.hl7.org/CodeSystem/organization-type`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `ins` | Insurance Company | `Organization.type.coding` | generic |
| `pay` | Payer | `Organization.type.coding` | both |
| `prov` | Healthcare Provider | `Organization.type.coding` | both |

### `http://terminology.hl7.org/CodeSystem/payeetype`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `provider` | Provider | `ClaimResponse.payeeType.coding` | both |

### `http://terminology.hl7.org/CodeSystem/paymentstatus`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `cleared` | Cleared | `PaymentNotice.paymentStatus.coding` | generic |
| `paid` | Paid | `PaymentNotice.paymentStatus.coding` | PMJAY |

### `http://terminology.hl7.org/CodeSystem/processpriority`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `normal` | Normal | `CoverageEligibilityRequest.priority.coding`, `Claim.priority.coding` | both |

### `http://terminology.hl7.org/CodeSystem/subscriber-relationship`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `self` | Self | `Coverage.relationship.coding` | both |

### `http://terminology.hl7.org/CodeSystem/v2-0203`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `JHN` | Jurisdictional health number | `Patient.identifier.type.coding` | PMJAY |
| `MB` | Member Number | `Patient.identifier.type.coding`, `Task.for.identifier.type.coding` | both |
| `MD` | Medical License number | `Practitioner.identifier.type.coding` | generic |
| `NH` | National Health Plan Identifier | `Coverage.identifier.type.coding`, `InsurancePlan.identifier.type.coding` | both |
| `NIIP` | National Insurance Payor Identifier (Payor) | `Organization.identifier.type.coding` | both |
| `NPI` | National provider identifier | `Organization.identifier.type.coding` | both |
| `PI` | Patient internal identifier | `Patient.identifier.type.coding` | PMJAY |
| `PRN` | Provider number | `Organization.identifier.type.coding` | generic |
| `XV` | Health Plan Identifier | `Coverage.class.type.coding`, `InsurancePlan.identifier.type.coding` | both |

### `http://terminology.hl7.org/CodeSystem/v2-0360`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `MD` | Doctor of Medicine | `Practitioner.qualification.code.coding` | both |

### `http://terminology.hl7.org/CodeSystem/v3-ActCode`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `HIP` | health insurance plan policy | `Coverage.type.coding` | both |

### `http://www.cms.gov/Medicare/Coding/ICD10`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `02703ZZ` | Percutaneous Transluminal Coronary Angioplasty (PTCA) | `InsurancePlan.coverage.benefit.type.coding`, `InsurancePlan.plan.specificCost.benefit.type.coding` | generic |
| `08RJ3JZ` | Cataract Surgery with Foldable IOL | `InsurancePlan.coverage.benefit.type.coding`, `InsurancePlan.plan.specificCost.benefit.type.coding` | generic |
| `0DTJ4ZZ` | Acute Appendectomy (Laparoscopic) | `InsurancePlan.coverage.benefit.type.coding`, `InsurancePlan.plan.specificCost.benefit.type.coding` | generic |
| `0SRC0JZ` | Total Knee Replacement (Unilateral) | `CoverageEligibilityResponse.insurance.item.productOrService.coding`, `InsurancePlan.coverage.benefit.type.coding` | generic |
| `5A09357` | Paediatric Pneumonia, PICU Management | `InsurancePlan.coverage.benefit.type.coding`, `InsurancePlan.plan.specificCost.benefit.type.coding` | generic |

### `https://hl7.org/fhir/R4/codesystem-benefit-type.html`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `Procedure` | Procedure | `CoverageEligibilityResponse.insurance.item.benefit.type.coding` | PMJAY |

### `https://hl7.org/fhir/R4/v2/0360/2.7/index.html`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `BSC NURSING` | BSC NURSING | `Practitioner.qualification.code.coding` | PMJAY |

### `https://hl7.org/fhir/R4/valueset-adjudication.html`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `benefit` | Benefit Amount | `ClaimResponse.total.category.coding` | both |
| `eligible` | Eligible Amount | `ClaimResponse.item.adjudication.category.coding` | both |
| `eligpercent` | Eligible % | `ClaimResponse.item.adjudication.category.coding` | PMJAY |
| `eligquant` | Eligible Quantity | `ClaimResponse.item.adjudication.category.coding` | PMJAY |
| `incentive` | Hospital Incentive | `ClaimResponse.total.category.coding` | PMJAY |
| `reason` | Reason for Adjudication | `ClaimResponse.item.adjudication.category.coding` | both |
| `status` | Item adjudication status | `ClaimResponse.item.adjudication.category.coding` | both |
| `submitted` | Submitted Amount | `ClaimResponse.total.category.coding`, `ClaimResponse.item.adjudication.category.coding` | both |
| `tax` | Tax | `ClaimResponse.total.category.coding` | PMJAY |

### `https://https://nrces.in/ndhm/fhir/r4/ValueSet-ndhm-identifier-type-code.html`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `PLAC` | Placer Identifier | `PaymentReconciliation.detail.identifier.type.coding` | both |

### `https://nhcx.abdm.gov.in/category-code`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `MG` | General Medicine | `CoverageEligibilityRequest.item.category.coding` | both |
| `Surgical` | Surgical | `CoverageEligibilityRequest.item.category.coding` | generic |

### `https://nhcx.abdm.gov.in/communication-reason`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `additionalinfo` | Additional information request | `Task.reasonCode.coding` | generic |
| `tatquery` | Turnaround time query | `Task.reasonCode.coding` | generic |

### `https://nhcx.abdm.gov.in/document-code`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `CER` | Medical Certificate / Doctor Referral | `Claim.supportingInfo.code.coding` | generic |
| `DOC001` | Clinical notes and admission notes | `Claim.supportingInfo.code.coding` | generic |
| `DOC002` | Diagnostic imaging report | `Claim.supportingInfo.code.coding` | generic |
| `DOC003` | Investigations performed | `Claim.supportingInfo.code.coding` | generic |
| `DOC004` | Planned line of management | `Claim.supportingInfo.code.coding` | generic |
| `DOC101` | Internal case papers | `Claim.supportingInfo.code.coding` | generic |
| `DOC102` | Treatment details | `Claim.supportingInfo.code.coding` | generic |
| `DOC103` | All investigation reports | `Claim.supportingInfo.code.coding` | generic |
| `DOC104` | Discharge summary | `Claim.supportingInfo.code.coding` | generic |
| `EST` | Detailed Pre-Auth Cost Estimate | `Claim.supportingInfo.code.coding` | generic |
| `FCF` | Filled NHCX Claim Form (Signed) | `Claim.supportingInfo.code.coding` | generic |
| `HDS` | Hospital Discharge Summary | `Claim.supportingInfo.code.coding` | both |
| `IMP` | Medical Implant Invoice & Barcode Sticker | `Claim.supportingInfo.code.coding` | generic |
| `MAND0006` | Detailed discharge summary | `Claim.supportingInfo.code.coding` | generic |
| `MAND0062` | Detailed ICPs | `Claim.supportingInfo.code.coding` | generic |
| `MAND0063` | Treatment details | `Claim.supportingInfo.code.coding` | generic |
| `MAND0064` | All investigations reports | `Claim.supportingInfo.code.coding` | generic |
| `MAND0408` | Clinical notes detailing history and Admission notes showing vitals and examina… | `Claim.supportingInfo.code.coding` | both |
| `MAND0409` | Any investigations done | `Claim.supportingInfo.code.coding` | both |
| `MAND0455` | CXR PA view or CECT chest abdomen and pelvis | `Claim.supportingInfo.code.coding` | both |
| `MAND0570` | Planned line of management | `Claim.supportingInfo.code.coding` | both |
| `MB` | Medical & Pharmacy Bills Itemized | `Claim.supportingInfo.code.coding` | generic |
| `ODN` | Death Certificate | `Claim.supportingInfo.code.coding` | PMJAY |
| `OTR` | Operation Theatre Notes & Surgical Summary | `Claim.supportingInfo.code.coding` | generic |
| `POI` | Proof of Identity (Aadhaar / Passport / Voter ID) | `Claim.supportingInfo.code.coding` | generic |
| `RAD` | Radiology / X-Ray / CT / MRI Scan Reports | `Claim.supportingInfo.code.coding` | generic |

### `https://nhcx.abdm.gov.in/procedure-type`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `conservative` | Conservative | `Claim.procedure.type.coding` | both |
| `medical` | Medical | `Claim.procedure.type.coding` | PMJAY |
| `STRAT001` | HDU | `CoverageEligibilityRequest.item.modifier.coding`, `Claim.item.modifier.coding` | generic |
| `surgical` | Surgical | `Claim.procedure.type.coding` | generic |

### `https://nhcx.abdm.gov.in/product-code`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `MG004C` | Dengue shock syndrome (Dengue fever) | `CoverageEligibilityRequest.item.productOrService.coding` | generic |
| `MG0111A` | Pleural Effusion (Pleural Effusion) | `CoverageEligibilityRequest.item.productOrService.coding` | PMJAY |
| `MG072C` | Acute Haemodialysis (Acute Haemodialysis) | `CoverageEligibilityRequest.item.productOrService.coding` | PMJAY |
| `PROC-KNEE-01` | Total Knee Replacement (Unilateral) | `CoverageEligibilityRequest.item.productOrService.coding` | generic |

### `https://nhcx.abdm.gov.in/task-input-type`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `amount` | Amount | `Task.input.type.coding` | generic |

### `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-benefit-category`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `MG` | General Medicine | `Claim.item.category.coding`, `CoverageEligibilityRequest.item.category.coding` | both |
| `Surgical` | Surgical | `Claim.item.category.coding` | generic |

### `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-claim-exclusion`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `Excl01` | Pre-Existing Diseases | `InsurancePlan.extension.extension.valueCodeableConcept.coding` | generic |
| `Excl02` | Specified disease/procedure waiting period | `InsurancePlan.extension.extension.valueCodeableConcept.coding` | generic |
| `Excl03` | 30-day waiting period | `InsurancePlan.extension.extension.valueCodeableConcept.coding` | generic |
| `Excl08` | Cosmetic or plastic Surgery | `InsurancePlan.extension.extension.valueCodeableConcept.coding` | generic |

### `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `ABHA` | Ayushman Bharat Health Account (ABHA) ID | `Patient.identifier.type.coding` | both |
| `ADN` | Adhaar number | `Patient.identifier.type.coding` | both |
| `ClaimNumber` | Claim Number | `Task.input.type.coding` | generic |
| `CLN` | Claim number | `Claim.identifier.type.coding`, `Task.basedOn.identifier.type.coding` | both |
| `HPID` | Healthcare Professional ID (HPID) | `Practitioner.identifier.type.coding` | both |
| `HPIN` | Health Practitioner ID issued by NDHM | `Practitioner.identifier.type.coding` | both |
| `PMJAY` | Pradhan Mantri Jan Aarogya Yojana (PMJAY) ID | `Patient.identifier.type.coding`, `Task.for.identifier.type.coding` | both |
| `ROHINI` | Registry of Hospitals in Network of Insurance (ROHINI) ID | `Organization.identifier.type.coding` | generic |
| `UTR` | Unique Transaction Reference | `PaymentReconciliation.paymentIdentifier.type.coding` | both |

### `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-insuranceplan-type`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `01` | Hospitalisation Indemnity Policy | `InsurancePlan.type.coding` | generic |
| `07` | Universal Health Policy | `InsurancePlan.type.coding` | PMJAY |

### `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-plan-type`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `01` | Individual | `InsurancePlan.plan.type.coding` | generic |
| `03` | Group | `InsurancePlan.plan.type.coding` | PMJAY |
| `Procedure` | Selected treatment or service or product is a type of procedure or package | `InsurancePlan.plan.specificCost.benefit.cost.type.coding` | generic |

### `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-procedure-code`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `MG001A` | Sample package | `CoverageEligibilityRequest.item.productOrService.coding`, `CoverageEligibilityResponse.insurance.item.productOrService.coding` | generic |
| `MG004B` | Dengue hemorrhagic fever | `Claim.item.productOrService.coding` | generic |
| `MG0111A` | Pleural Effusion | `Claim.item.productOrService.coding` | both |
| `MG072C` | Acute Haemodialysis (Acute Haemodialysis) | `Claim.item.productOrService.coding` | PMJAY |
| `PROC-APP-02` | Acute Appendectomy (Laparoscopic) | `Claim.item.productOrService.coding` | generic |
| `PROC-KNEE-01` | Total Knee Replacement (Unilateral) | `Claim.item.productOrService.coding` | generic |

### `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-program-code`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `AB-PMJAY` | Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY) | `Claim.item.programCode.coding` | both |

### `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-reason-code`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `additionalinfo` | Additional Information Request | `Task.reasonCode.coding`, `CommunicationRequest.reasonCode.coding` | generic |
| `administrativeerror` | Administrative error | `Task.reasonCode.coding` | PMJAY |
| `claimrejected` | Reprocess request due to claim rejected by payer | `Task.reasonCode.coding` | both |
| `partialpayment` | Reprocess request due to partial payment by payer | `Task.reasonCode.coding` | generic |
| `treatmentplanchanged` | Treatment plan changed during hospitalization. | `Task.reasonCode.coding` | generic |

### `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `CD` | Clinical document | `InsurancePlan.coverage.benefit.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.valueCodeableConcept.coding` | both |
| `CER` | Medical Certficate | `InsurancePlan.coverage.benefit.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.valueCodeableConcept.coding` | generic |
| `DIA` | Diagnostic report | `InsurancePlan.coverage.benefit.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.valueCodeableConcept.coding` | both |
| `DIS` | Discharge status and discharge to location detail | `Claim.supportingInfo.category.coding` | both |
| `FCF` | Filled claim form | `InsurancePlan.coverage.benefit.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.valueCodeableConcept.coding` | generic |
| `HDS` | Hospital discharge summary | `Claim.supportingInfo.category.coding`, `InsurancePlan.coverage.benefit.extension.extension.valueCodeableConcept.coding` | both |
| `IMP` | Document Type - Implant | `InsurancePlan.coverage.benefit.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.valueCodeableConcept.coding` | generic |
| `INF` | Information | `Claim.supportingInfo.category.coding`, `InsurancePlan.coverage.benefit.extension.extension.valueCodeableConcept.coding` | both |
| `INV` | Document Type - Investigation | `Claim.supportingInfo.category.coding` | both |
| `MB` | Medical bill | `InsurancePlan.coverage.benefit.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.valueCodeableConcept.coding` | generic |
| `NMI` | Claim query detail | `Claim.supportingInfo.category.coding` | both |
| `ONS` | Period, start or end dates of aspects of the Condition. (e.g. admission, discha… | `Claim.supportingInfo.category.coding` | both |
| `OTH` | Other | `Claim.supportingInfo.category.coding` | both |
| `POI` | Proof of identity | `InsurancePlan.coverage.benefit.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.valueCodeableConcept.coding` | both |
| `STG` | Total Knee Replacement (Unilateral), Standard Treatment Guidelines | `CoverageEligibilityResponse.insurance.item.authorizationSupporting.coding`, `InsurancePlan.coverage.benefit.extension.extension.valueCodeableConcept.coding` | both |

### `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-code`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `ADDD` | Admission date -Discharge date | `Claim.supportingInfo.code.coding` | both |
| `CQD` | Claim query detail | `Claim.supportingInfo.code.coding` | both |
| `DSDE` | Discharge start-discharge end time | `Claim.supportingInfo.code.coding` | both |
| `DTH` | DischargeToHome (Discharge disposition status) | `Claim.supportingInfo.code.coding` | both |
| `DTM` | DischargetoMortuary | `Claim.supportingInfo.code.coding` | PMJAY |
| `EDT` | EncounterDateTime | `Claim.supportingInfo.code.coding` | both |
| `ODN` | Other document | `Claim.supportingInfo.code.coding` | both |
| `PSP` | PatientSurgeryPerformed(startdatetime-enddatetime) | `Claim.supportingInfo.code.coding` | both |

### `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-task-codes`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `deliver` | deliver | `Task.code.coding` | both |
| `search` | Search | `Task.code.coding` | generic |

### `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-task-input-type-code`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `claimNumber` | ClaimNumber | `Task.input.type.coding`, `Task.output.type.coding` | both |
| `document` | Document | `Task.input.type.coding` | both |
| `intimationNumber` | Intimation Number | `Task.input.type.coding` | both |
| `policyNumber` |  | `Task.input.type.coding` | both |
| `providerId` |  | `Task.input.type.coding` | both |

### `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-task-output-type`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `status` | Status | `Task.output.type.coding` | both |

### `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-task-output-value`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `paymentack` | Payment is acknowledged | `Task.output.valueCodeableConcept.coding` | both |
| `taskak` | Requested task is acknowledged | `Task.output.valueCodeableConcept.coding` | generic |

### `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-benefitcategory`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `MG` | General Medicine | `InsurancePlan.coverage.type.coding`, `InsurancePlan.plan.specificCost.category.coding` | PMJAY |
| `MO` | Medical Oncology | `InsurancePlan.coverage.type.coding`, `InsurancePlan.plan.specificCost.category.coding` | PMJAY |
| `SB` | Orthopaedics | `InsurancePlan.coverage.type.coding`, `InsurancePlan.plan.specificCost.category.coding` | PMJAY |
| `SC` | Surgical Oncology | `InsurancePlan.coverage.type.coding` | PMJAY |
| `SE` | Opthalmology | `InsurancePlan.coverage.type.coding`, `InsurancePlan.plan.specificCost.category.coding` | PMJAY |
| `SG` | General Surgery | `InsurancePlan.coverage.type.coding`, `InsurancePlan.plan.specificCost.category.coding` | PMJAY |
| `SU` | Urology | `InsurancePlan.coverage.type.coding` | PMJAY |

### `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-claim-type`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `737481003` | Inpatient care management (procedure) | `ClaimResponse.type.coding` | both |
| `737492002` | Outpatient care management (procedure) | `ClaimResponse.type.coding` | PMJAY |

### `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-productorservice`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `LM100` | LAMA DAMA Procedure (LAMA DAMA Procedure) | `InsurancePlan.coverage.benefit.type.coding` | PMJAY |
| `MG004A` | Dengue fever (Dengue fever) | `InsurancePlan.coverage.benefit.type.coding` | PMJAY |
| `MG005A` | Chikungunya fever (Chikungunya fever) | `InsurancePlan.coverage.benefit.type.coding` | PMJAY |
| `MG014A` | Liver abscess (Liver abscess) | `InsurancePlan.coverage.benefit.type.coding` | PMJAY |
| `MG072C` | Acute Haemodialysis (Acute Haemodialysis) | `InsurancePlan.coverage.benefit.type.coding` | PMJAY |
| `MO071R` | PemetrexedPemetrexed 500mg/m2 D1 every 21 days (CT for CA Lung) | `InsurancePlan.coverage.benefit.type.coding` | PMJAY |
| `SB043F` | Hand (Single Stage Amputation) | `InsurancePlan.coverage.benefit.type.coding` | PMJAY |
| `SBU100` | Unspecified Surgical Package (Unspecified Surgical Package) | `InsurancePlan.coverage.benefit.type.coding` | PMJAY |
| `SC006A` | Open-Transthoracic esophagectomy: 2F / 3F (Transthoracic esophagectomy: 2F / 3F) | `InsurancePlan.coverage.benefit.type.coding` | PMJAY |
| `SCU100` | Unspecified Surgical Package (Unspecified Surgical Package) | `InsurancePlan.coverage.benefit.type.coding` | PMJAY |
| `SE004A` | Lid Tear Repair (Lid Tear Repair) | `InsurancePlan.coverage.benefit.type.coding` | PMJAY |
| `SE005A` | Lid Abscess Drainage (Lid Abscess Drainage) | `InsurancePlan.coverage.benefit.type.coding` | PMJAY |
| `SEU100` | Unspecified Surgical Package  (Unspecified Surgical Package ) | `InsurancePlan.coverage.benefit.type.coding` | PMJAY |
| `SGU100` | Unspecified Surgical Package  (Unspecified Surgical Package ) | `InsurancePlan.coverage.benefit.type.coding` | PMJAY |
| `SL026A` | Tracheostomy (Tracheostomy / Tracheotomy) | `InsurancePlan.coverage.benefit.type.coding` | PMJAY |
| `SL026B` | Tracheotomy (Tracheostomy / Tracheotomy) | `InsurancePlan.coverage.benefit.type.coding` | PMJAY |
| `SL032B` | Translabyrinthine approach (Advanced lateral skull base surgery) | `InsurancePlan.coverage.benefit.type.coding` | PMJAY |
| `ST009B` | Nerve and/or tendon injury. A. Wound exploration and closure. B. Nerve graft. C… | `InsurancePlan.coverage.benefit.type.coding` | PMJAY |
| `STRAT003a` | Local Anesthesia | `InsurancePlan.plan.specificCost.benefit.cost.qualifiers.coding` | PMJAY |
| `STRAT003b` | General Anesthesia | `InsurancePlan.plan.specificCost.benefit.cost.qualifiers.coding` | PMJAY |
| `STRAT006a` | Routine Ward | `InsurancePlan.plan.specificCost.benefit.cost.qualifiers.coding` | PMJAY |
| `STRAT006b` | HDU | `InsurancePlan.plan.specificCost.benefit.cost.qualifiers.coding` | PMJAY |
| `STRAT006c` | ICU - Without Ventilator | `InsurancePlan.plan.specificCost.benefit.cost.qualifiers.coding` | PMJAY |
| `STRAT006d` | ICU - With Ventilator | `InsurancePlan.plan.specificCost.benefit.cost.qualifiers.coding` | PMJAY |
| `SU037A` | Acute management of upper urinary tract trauma  conservative ( (1-5 days)plus … | `InsurancePlan.coverage.benefit.type.coding` | PMJAY |

### `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `ADN` | Aadhaar Number | `InsurancePlan.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0003` | Clinical notes | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0006` | Detailed discharge summary | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0008` | Detailed Procedure / Operative Notes | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0030` | Procedure / Operative Notes | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0062` | Detailed ICPs | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0063` | Treatment details | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0064` | All investigations reports | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0067` | CBC | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0074` | LFT | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0099` | BAR CODE OF THE DRUGS | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0100` | REPORTS OF THE TESTS (PATHOLOGY, RADIOLOGY, MICROBIOLOGY, HEMATOLOGY, BIOCHEMIS… | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0101` | DISCHARGE SUMMARY OF INPATIENT DEPARTMENT / DISCHARGE SUMMARY OF DAY CARE DEPAR… | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0102` | CHARTS OF CHEMOTHERAPY REGIMEN | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0103` | TRANFUSION SLIPS | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0112` | Post Procedure clinical photgraph | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0151` | Post Procedure Photographs of surgical site | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0152` | HPE report | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0159` | Still image of the the procedure with pt. ID and date | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0161` | operative notes | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0162` | Discharge notes | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0163` | microbiology report | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0164` | Still image of the patient undergoing the procedure with date stamp | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0189` | Histopathology report | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0226` | Post Procedure Photograph of affected part | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0300` | Detailed operatives notes | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0309` | Intra operative still photograph | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0326` | Reports of all investigations done and consultation paper of treating doctor me… | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0327` | Detailed discharge summary; | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0339` | Clinical notes with planned line of treatment | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0368` | Procedure / Operative Notes, Detailed Discharge Summary | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0384` | MLC/ FIR if traumatic | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0408` | Clinical notes detailing history and Admission notes showing vitals and examina… | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0409` | any investigations done | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0447` | RFT | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0457` | RBS | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0459` | CECT Thorax, abdomen and Pelvis | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0564` | histopathology (non small cell - adenocarcinoma or adenosquamous carcinoma) | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0582` | clinical photograph of affected part | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0588` | clinical photograph | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0592` | X Ray of affected limb | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0604` | clinical notes justifying the indication | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0621` | FNAC/ BIOPSY | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0622` | CECT | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0647` | FIR/MLC in case of accident | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0648` | Patient details | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0649` | doctors notes | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0650` | photo | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0730` | USG/CT Abdomen | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0822` | Clinical notes with planned line of treatment justifying indication | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0831` | Audiogram report justfying surgery | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0832` | CT- TEMPORAL BONE of affected side /X-RAY BOTH MASTOIDS | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0946` | Clinical notes detailing the injury and need of surgery | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND0952` | MLC/ FIR +/- Nerve conduction velocity (NCV) + /- MRI + /- MRA + /- EMG (Electr… | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `MAND1045` | Clinical notes with planned line of treatment (including indication for need of… | `InsurancePlan.coverage.benefit.extension.extension.extension.valueCodeableConcept.coding`, `InsurancePlan.plan.specificCost.benefit.extension.extension.extension.valueCodeableConcept.coding` | PMJAY |
| `ODN` | Other document | `InsurancePlan.extension.extension.valueCodeableConcept.coding` | PMJAY |

### `https://payer.pmjay.nha.gov.in`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `A97.0` | Dengue without warning signs | `CoverageEligibilityRequest.item.diagnosis.diagnosisCodeableConcept.coding` | PMJAY |
| `MG004A` | Dengue fever | `CoverageEligibilityRequest.item.productOrService.coding` | PMJAY |

### `https://terminology.hl7.org/6.5.0/CodeSystem-subscriber-relationship.html`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `child` | Child | `Coverage.relationship.coding` | PMJAY |

### `https://www.nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-plan-type`

| Code | Display | Where | Used by |
| :-- | :-- | :-- | :-- |
| `Procedure` | Selected treatment or service or proudct is a type of procedure or package | `InsurancePlan.plan.specificCost.benefit.cost.type.coding` | PMJAY |
| `Stratification` | Selected treatment or service or proudct is a type of stratification | `InsurancePlan.plan.specificCost.benefit.cost.type.coding` | PMJAY |

## Value sets

The codes the specifications define beyond those the bundles carry.

### Supporting-info categories

System `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category`.

| Code | Meaning | Notes |
| :-- | :-- | :-- |
| `ONS` | Period, start or end dates | date-time string |
| `OTH` | Other | date-time string |
| `INV` | Investigation | reference |
| `ATT` | Attachment | attachment |
| `HDS` | Hospital discharge summary | reference |
| `DGN` | Diagnosis | reference |
| `LAB` | Lab test | reference |
| `AOB` | Onset of current symptoms | value |
| `MB` | Medical bill | attachment |
| `DIA` | Diagnostic report | reference |
| `CD` | Clinical document | reference |
| `INF` | Information | reference |
| `DIS` | Discharge status | string |
| `NMI` | Query remarks | string |
| `POI` | Proof of identity | attachment |
| `POA` | Proof of address | attachment |
| `DOB` | Proof of birth | attachment |
| `DEF` | Declaration | attachment |
| `FIR` | First information report | attachment |
| `EMP` | Proof of employment | attachment |
| `STG` | Standard treatment guideline questionnaire | reference |
| `ADMD` | Admission date | date-time string |
| `SURD` | Surgery date | date-time string |
| `DSCHD` | Discharge date | date-time string |

### Supporting-info codes

System `https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-supportinginfo-code`.

| Code | Meaning | Notes |
| :-- | :-- | :-- |
| `EDT` | EncounterDateTime |  |
| `ADDD` | Admission date - Discharge date |  |
| `PSP` | PatientSurgeryPerformed |  |
| `DSDE` | Discharge Date |  |
| `DTH` | DischargeToHome |  |
| `DTM` | DischargetoMortuary | Also the death date under `ONS` |
| `LAMA` | Discharge with LAMA |  |
| `DAMA` | Discharge with DAMA |  |
| `DIS` | Discharge Summary |  |
| `AT` | Questionnaire answers | Under `INF` |
| `ODN` | Policy-level questionnaire | Under `INF` |
| `CQD` | Case remarks for a query answer | Under `NMI` |
| `BCF` | Birth certificate |  |
| `DCB` | Discharge card for birth of a child |  |
| `MAND…` | Mandatory documents | Defined by the plan; the auth-requirements answer returns the ones a package needs |

### Identifier types

| Code | Meaning | Notes |
| :-- | :-- | :-- |
| `PMJAY` | Scheme member id | NRCeS |
| `ABHA` | ABHA number, no hyphens | NRCeS |
| `CLN` | Claim number | NRCeS |
| `UTR` | Bank transaction reference | NRCeS |
| `HPID` | Healthcare professional id | NRCeS |
| `HPIN` | Health practitioner id | NRCeS |
| `NPI` | Provider's HFR ID | HL7 v2-0203 |
| `NIIP` | Payer's registry ID | HL7 v2-0203 |
| `NH` | Plan identifier | HL7 v2-0203 |
| `JHN` | Jurisdictional health number | HL7 v2-0203 |
| `MD` | Medical registration number | HL7 v2-0203 |
| `MR` | Medical record number | HL7 v2-0203 |

### Adjudication

| Code | Meaning | Notes |
| :-- | :-- | :-- |
| `submitted` | Amount asked | category |
| `eligible` | Amount allowed | category |
| `benefit` | Amount payable | category |
| `copay` | Co-payment | category |
| `eligpercent` | Percentage allowed | category |
| `eligquant` | Quantity allowed | category |
| `reason` | Free-text reason | category |
| `status` | Decision | category |
| `deductible` | Deduction with its reason | category |
| `tax` | Tax | total |
| `incentive` | Hospital incentive | total |
| `approved` | Approved | claim-level reason |
| `queried` | Queried | claim-level reason |
| `cancelled` | Cancelled or rejected | claim-level reason |
| `rejected` | Rejected | claim-level reason |

### Task codes

| Code | Meaning | Notes |
| :-- | :-- | :-- |
| `poll` | Poll | financialtaskcode |
| `cancel` | Cancel | financialtaskcode |
| `reprocess` | Reprocess | financialtaskcode |
| `release` | Release | financialtaskcode |
| `status` | Status | financialtaskcode |
| `nullify` | Close a claim the provider submitted | financialtaskcode |
| `suspend` | Suspend a preauthorisation or claim the provider submitted; no exchange carries it | financialtaskcode |
| `search` | Search | NHCX value set |
| `deliver` | Deliver | ndhm-task-codes |
| `approve` | Approve | task-code |

### Task reasons

| Code | Meaning | Notes |
| :-- | :-- | :-- |
| `treatmentplanchanged` | Treatment plan changed | cancel |
| `patientrequest` | Patient request | cancel |
| `financialconstraints` | Financial constraints | cancel |
| `alternativetreatment` | Alternative treatment | cancel |
| `duplicateclaim` | Duplicate claim | cancel |
| `administrativeerror` | Administrative error | cancel |
| `other` | Other | cancel |
| `claimrejected` | Claim rejected | reprocess |
| `partialpayment` | Partial payment | reprocess, release |
| `erroneousclaim` | Erroneous claim | reprocess |
| `referred` | Referred | reprocess |
| `erroneousregistration` | Erroneous registration | reprocess |
| `wrongdiagnosis` | Wrong diagnosis | reprocess |
| `tatquery` | Turnaround alert | communication |
| `grievance` | Grievance | communication |
| `walletupdate` | Wallet update | communication |
| `policychange` | Policy change | communication |
| `additionalinfo` | Additional information | communication |
| `claimArbitration` | Claim arbitration | communication |

### Task input types and output values

System `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-task-input-type-code`.

| Code | Meaning | Notes |
| :-- | :-- | :-- |
| `PayerId` | Payer | input |
| `ProviderId` | Provider | input |
| `PolicyNumber` | Policy | input |
| `ProductNumber` | Product | input |
| `ClaimNumber` | Case number | input |
| `IntimationNumber` | Intimation number | input |
| `FromDate` | Search window start | input |
| `ToDate` | Search window end | input |
| `FinanceYear` | Financial year | input |
| `ServiceCode` | Benefit or service | input |
| `paymentack` | Payment acknowledged | output |
| `claimcancelled` | Claim cancelled | output |
| `claimreinitiated` | Claim reinitiated | output |
| `claimsuspended` | Claim suspended | output |
| `taskak` | Task acknowledged | output |
| `taskdelivered` | Task delivered | output |

### Money types on a reconciliation

| Code | Meaning | Notes |
| :-- | :-- | :-- |
| `approvedamount` | Approved amount |  |
| `claimedamount` | Claimed amount |  |
| `tds` | Tax deducted at source |  |
| `servicetax` | Service tax |  |
| `advance` | Advance |  |
| `recovered` | Recovered |  |
| `penality` | Penalty, spelled so |  |
| `Payment` | The net line |  |

### Deduction reasons

| Code | Meaning | Notes |
| :-- | :-- | :-- |
| `Non-CoveredService` | Service not covered |  |
| `ExceededCoverageLimit` | Coverage limit exceeded |  |
| `DuplicateClaim` | Duplicate claim |  |
| `Coordination-of-Benefits` | Coordination of benefits |  |
| `IncompleteDocumentation` | Incomplete documentation |  |
| `PolicyDeductible` | Policy deductible |  |
| `Co-Payment` | Co-payment |  |
| `FraudulentClaim` | Fraudulent claim |  |
| `MedicalNecessity` | Medical necessity |  |
| `BenefitLimitReached` | Benefit limit reached |  |
| `MissedFilingDeadline` | Missed filing deadline |  |
| `PaymentAlreadyMade` | Payment already made |  |

### Claim error codes

Adjudication reasons a payer gives on a claim, from the value-set sheet of the requests-and-responses workbook. Meanings are as that sheet gives them, spelling included. `ClaimError-1` is a deduction and sits among the deduction reasons there. `ClaimError-16` to `ClaimError-27` repeat earlier texts, as noted.

| Code | Meaning | Notes |
| :-- | :-- | :-- |
| `ClaimError-1` | There is an error in the claim submission, leading to a deduction until the correct information is provided. |  |
| `ClaimError-2` | Claim has been rejected due to less than 24 hours of hospitalization |  |
| `ClaimError-3` | Claim has been rejected as the Package is Reserved to Public Hospital |  |
| `ClaimError-4` | Claim has been closed due to Incomplete submission of documents by hospital after multiple queries |  |
| `ClaimError-5` | Claim has been rejected as there was misrepresentation of bed category booked |  |
| `ClaimError-6` | Claim has been rejected due to Outside Scope of cover (Exclusions as per scheme) |  |
| `ClaimError-7` | Claim has been rejected as the claim was found be False/Fraudulent |  |
| `ClaimError-8` | Claim has been rejected due to Mismatch of package and disease/diagnosis/treatment |  |
| `ClaimError-9` | Claim has been rejected due to Hospital not empanelled for this speciality |  |
| `ClaimError-10` | Claim has been closed due to non submission of the documents |  |
| `ClaimError-11` | Claim rejected as the treatment provided does not support the blocked package, request you to book a fresh relevant package |  |
| `ClaimError-12` | Claim has been closed as the photo of the operative site is not available |  |
| `ClaimError-13` | Claim has been rejected due to apparent manipulation in medical record |  |
| `ClaimError-14` | Claim has been rejected as the hospital expenses have been paid by patient |  |
| `ClaimError-15` | Claim has been closed due Missing Pre-Auth patient photo/post operative photo/After discharge photo |  |
| `ClaimError-16` | Claim has been rejected due to less tha 24 hours of hospitalization | Same as `ClaimError-2` |
| `ClaimError-17` | Claim has been closed as Referral Letter Mandatory for Package Selected has not been provided |  |
| `ClaimError-18` | Claim has been rejected as the need for hospitalization was not justified based on the availabe documents |  |
| `ClaimError-19` | Claim has been rejected as the Package is Reserved to Public Hospital | Same as `ClaimError-3` |
| `ClaimError-20` | Claim has been closed due to Incomplete submission of documents by hospital after multiple queries | Same as `ClaimError-4` |
| `ClaimError-21` | Claim has been rejected as there was misrepresentation of bed category booked | Same as `ClaimError-5` |
| `ClaimError-22` | Claim has been rejected due to Outside Scope of cover (Exclusions as per scheme) | Same as `ClaimError-6` |
| `ClaimError-23` | Claim has been rejected as the claim was found be False/Fraudulent | Same as `ClaimError-7` |
| `ClaimError-24` | Claim has been rejected due to Mismatch of package and disease/diagnosis/treatment | Same as `ClaimError-8` |
| `ClaimError-25` | Claim has been rejected due to Hospital not empanelled for this speciality | Same as `ClaimError-9` |
| `ClaimError-26` | Claim has been closed due to non submission of the documents | Same as `ClaimError-10` |
| `ClaimError-27` | Claim rejected as the treatment provided does not support the blocked package, request you to book a fresh relevant package | Same as `ClaimError-11` |
| `ClaimError-28` | Others |  |

### Preauthorisation error codes

Adjudication reasons a payer gives on a preauthorisation, from the same sheet, meanings as it gives them. No `PreauthError-14` is defined: the list runs to 13, then 15.

| Code | Meaning | Notes |
| :-- | :-- | :-- |
| `PreauthError-1` | Pre-Auth has been rejected as the diagnosis is outside Scope of cover (Exclusions as per scheme) |  |
| `PreauthError-2` | Pre-auth has been rejected due to delay in raising enhancement requests |  |
| `PreauthError-3` | Pre-Auth has been rejected as it was found to be False/Fraudulent |  |
| `PreauthError-4` | Pre-Auth has been closed due to delay in preauth Intimation (as per state guidelines) |  |
| `PreauthError-5` | Pre-Auth has been rejected as the Hospital is not empanelled for this speciality |  |
| `PreauthError-6` | Pre- Auth has been rejected due to mismatch in dialysis records |  |
| `PreauthError-7` | Enhancement request rejected as the medical necessity of enhancement request not met |  |
| `PreauthError-8` | Pre-Auth rejected as the Medical necessity of ICU bed category not met |  |
| `PreauthError-9` | Pre-Auth has been rejected as the package selected is reserved for public hospital |  |
| `PreauthError-10` | Pre-Auth has been closed due to non submision of mandatory document as per STG |  |
| `PreauthError-11` | Pre-Auth has been rejected as the Surgery was Done Before Pre auth Approval |  |
| `PreauthError-12` | Pre-auth enhancement rejected due to missing patient photo to depict bed category |  |
| `PreauthError-13` | Pre-Auth has been rejected as the diagnosis is outside Scope of cover (Exclusions as per scheme) | Same as `PreauthError-1` |
| `PreauthError-15` | Others |  |

## Where the systems are wrong

The code is usually right. The system it is bound to often is not. Match on the code, and take the system from the exchange you are building.

| What | The problem |
| :-- | :-- |
| Package codes | The same code appears under a payer host, under SNOMED and under two ValueSet URLs, depending on the exchange. None is a SNOMED concept |
| Supporting-info category | Document entries bind `category` to the supporting-info code system rather than the category system; the plan does the reverse |
| Claim.type | Binds to a ValueSet URL where a CodeSystem URL belongs |
| Adjudication categories | Some senders bind them to an HTML documentation page, `https://hl7.org/fhir/R4/valueset-adjudication.html` |
| Plan cost types | Bind to the plan-type system under a `www.` host, with values that are not plan types |
| Missing systems | `deductible`, the claim-level status and some package codings carry no `system` at all |
