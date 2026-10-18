# Bundles and conventions

Everything that crosses the exchange is one FHIR R4 Bundle of type `collection`, built to the NRCeS profiles for NHCX. The bundles in this reference are generic: any payer on the exchange takes them, private insurers and TPAs regulated by IRDAI as well as government schemes. Each chapter shows the generic bundle for one exchange in one direction, then what PMJAY changes and what PMJAY requires on top. The package's sample collection is read the same way: a provider's bundles are either examples written to this specification or captures from the sandbox run against the PMJAY payer, and a payer's are either the generic payer's or PMJAY's own. This chapter holds the rules every bundle obeys before any exchange is considered.

## Rules

### 1. Bundle type

`collection`, not `document` and not `transaction`. Entries are resources placed directly, with no request or response elements. The open-protocol page describes claim objects as `document` bundles with a root `Composition`; the exchange accepts `collection`, and a `Composition` appears only at the head of an embedded clinical record.

### 2. Profiles

Declare the NRCeS profile in `meta.profile` on every resource you send, for example `https://nrces.in/ndhm/fhir/r4/StructureDefinition/Claim`. Declare only profiles NRCeS publishes: there is no NRCeS `QuestionnaireResponse` profile, so a `QuestionnaireResponse` takes the base FHIR definition. Do not require a profile on what you receive: payer-generated resources often carry none.

### 3. References

Resources in one bundle reference each other by `urn:uuid:`, with the same UUID as the entry's `fullUrl`. Absolute URLs are also accepted. Parse both.

### 4. Timestamps

ISO 8601 with the Indian offset, `+05:30`. UTC fails validation. Read `Bundle.timestamp` for the send time; `meta.lastUpdated` can be stale.

### 5. Identifier types come from two systems

`PMJAY`, `ABHA`, `CLN`, `UTR`, `HPID` and `HPIN` from NRCeS at `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code`. `NPI` for a hospital's HFR ID, `NIIP` for a payer's registry ID, `NH` for a plan, `MB` for a member number, and `JHN`, `MD` and `MR` from HL7 at `http://terminology.hl7.org/CodeSystem/v2-0203`. Take the system from the exchange you are building, not from the code.

### 6. The HFR ID inside the bundle

Must equal the registry ID on the sender's participant record, whichever element carries it.

### 7. Sequences link things

A `Claim.item` points at its diagnosis, procedure, care team and supporting information by sequence number, not by reference. Resolve through the `sequence` field, never by array position.

### 8. Documents arrive two ways

A supporting-info entry carries the file inline in `valueAttachment`, or points with `valueReference` at a resource in the same bundle: a `DocumentReference`, or the `Composition` heading an embedded ABDM record. One document per entry, 2 MB each, 20 MB per claim or preauthorisation bundle. Plan responses run past 20 MB; size clients and proxies for 25 MB.

### 9. Category decides structured or not

Supporting-info categories `DIA`, `HDS`, `CD` and `INF` take a reference to a structured record. `POI`, `POA`, `DOB`, `DEF`, `FIR`, `ATT` and `MB` take an attachment.

### 10. Encode attachments once

Base64 the file once, as FHIR defines `Attachment.data`, unless the payer asks otherwise; PMJAY does, as below. On receipt, check the decoded bytes for a file signature before trusting them, because double-encoded attachments are in circulation and render as a blank page.

### 11. One Claim, three uses

`Claim.use` is `preauthorization`, `claim` or `predetermination`, and nothing else changes. `pre-auth` and `pre-det` are not codes.

### 12. Codes and displays match the plan

Character for character, including the plan's own misspellings. A payer rejects a package whose display differs from the plan's.

### 13. Match on the code, not the system

The same package code appears under different systems in different exchanges. Match incoming codes on the code, and emit the system the exchange you are building expects.

## Resources by exchange

Each resource the bundles carry, its NRCeS profile, and the exchanges that use it.

### Claim

NRCeS profile: [Claim](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Claim.html).

- [Preauthorisation request](08-Preauthorisation%20Request.md)
- [Preauthorisation enhancement](10-Preauthorisation%20Enhancement.md)
- [Preauthorisation query and answer](11-Preauthorisation%20Query%20and%20Answer.md)
- [Claim request](12-Claim%20Request.md)
- [Claim query and answer](14-Claim%20Query%20and%20Answer.md)
- [Communication](17-Communication.md)

### ClaimResponse

NRCeS profile: [ClaimResponse](https://nrces.in/ndhm/fhir/r4/StructureDefinition-ClaimResponse.html).

- [Preauthorisation response](09-Preauthorisation%20Response.md)
- [Preauthorisation query and answer](11-Preauthorisation%20Query%20and%20Answer.md)
- [Claim response](13-Claim%20Response.md)
- [Claim query and answer](14-Claim%20Query%20and%20Answer.md)
- [Cancel, reprocess and shortfall](15-Cancel,%20Reprocess%20and%20Shortfall.md)
- [Status and search](18-Status%20and%20Search.md)

### Communication

NRCeS profile: [Communication](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Communication.html).

- [Preauthorisation query and answer](11-Preauthorisation%20Query%20and%20Answer.md)
- [Claim query and answer](14-Claim%20Query%20and%20Answer.md)
- [Communication](17-Communication.md)

### CommunicationRequest

NRCeS profile: [CommunicationRequest](https://nrces.in/ndhm/fhir/r4/StructureDefinition-CommunicationRequest.html).

- [Preauthorisation query and answer](11-Preauthorisation%20Query%20and%20Answer.md)
- [Claim query and answer](14-Claim%20Query%20and%20Answer.md)
- [Communication](17-Communication.md)

### Coverage

NRCeS profile: [Coverage](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Coverage.html).

- [Coverage eligibility request](02-Coverage%20Eligibility%20Request.md)
- [Coverage eligibility response](03-Coverage%20Eligibility%20Response.md)
- [Preauthorisation request](08-Preauthorisation%20Request.md)
- [Preauthorisation response](09-Preauthorisation%20Response.md)
- [Preauthorisation enhancement](10-Preauthorisation%20Enhancement.md)
- [Preauthorisation query and answer](11-Preauthorisation%20Query%20and%20Answer.md)
- [Claim request](12-Claim%20Request.md)
- [Claim response](13-Claim%20Response.md)
- [Claim query and answer](14-Claim%20Query%20and%20Answer.md)
- [Cancel, reprocess and shortfall](15-Cancel,%20Reprocess%20and%20Shortfall.md)
- [Communication](17-Communication.md)

### CoverageEligibilityRequest

NRCeS profile: [CoverageEligibilityRequest](https://nrces.in/ndhm/fhir/r4/StructureDefinition-CoverageEligibilityRequest.html).

- [Coverage eligibility request](02-Coverage%20Eligibility%20Request.md)
- [Coverage eligibility response](03-Coverage%20Eligibility%20Response.md)

### CoverageEligibilityResponse

NRCeS profile: [CoverageEligibilityResponse](https://nrces.in/ndhm/fhir/r4/StructureDefinition-CoverageEligibilityResponse.html).

- [Coverage eligibility response](03-Coverage%20Eligibility%20Response.md)

### InsurancePlan

NRCeS profile: [InsurancePlan](https://nrces.in/ndhm/fhir/r4/StructureDefinition-InsurancePlan.html).

- [Insurance plan response](05-Insurance%20Plan%20Response%20Overview.md)
- [Insurance plan response, package-based](06-Insurance%20Plan%20Response,%20Package-Based.md)
- [Insurance plan response, coverage-based](07-Insurance%20Plan%20Response,%20Coverage-Based.md)

### Location

NRCeS profile: [Location](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Location.html).

- [Coverage eligibility request](02-Coverage%20Eligibility%20Request.md)
- [Coverage eligibility response](03-Coverage%20Eligibility%20Response.md)

### Organization

NRCeS profile: [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html).

- [Coverage eligibility request](02-Coverage%20Eligibility%20Request.md)
- [Coverage eligibility response](03-Coverage%20Eligibility%20Response.md)
- [Insurance plan response](05-Insurance%20Plan%20Response%20Overview.md)
- [Insurance plan response, package-based](06-Insurance%20Plan%20Response,%20Package-Based.md)
- [Insurance plan response, coverage-based](07-Insurance%20Plan%20Response,%20Coverage-Based.md)
- [Preauthorisation request](08-Preauthorisation%20Request.md)
- [Preauthorisation response](09-Preauthorisation%20Response.md)
- [Preauthorisation enhancement](10-Preauthorisation%20Enhancement.md)
- [Preauthorisation query and answer](11-Preauthorisation%20Query%20and%20Answer.md)
- [Claim request](12-Claim%20Request.md)
- [Claim response](13-Claim%20Response.md)
- [Claim query and answer](14-Claim%20Query%20and%20Answer.md)
- [Cancel, reprocess and shortfall](15-Cancel,%20Reprocess%20and%20Shortfall.md)
- [Payment notice and acknowledgement](16-Payment%20Notice%20and%20Acknowledgement.md)
- [Communication](17-Communication.md)
- [Status and search](18-Status%20and%20Search.md)

### Patient

NRCeS profile: [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html).

- [Coverage eligibility request](02-Coverage%20Eligibility%20Request.md)
- [Coverage eligibility response](03-Coverage%20Eligibility%20Response.md)
- [Preauthorisation request](08-Preauthorisation%20Request.md)
- [Preauthorisation response](09-Preauthorisation%20Response.md)
- [Preauthorisation enhancement](10-Preauthorisation%20Enhancement.md)
- [Preauthorisation query and answer](11-Preauthorisation%20Query%20and%20Answer.md)
- [Claim request](12-Claim%20Request.md)
- [Claim response](13-Claim%20Response.md)
- [Claim query and answer](14-Claim%20Query%20and%20Answer.md)
- [Cancel, reprocess and shortfall](15-Cancel,%20Reprocess%20and%20Shortfall.md)
- [Communication](17-Communication.md)
- [Status and search](18-Status%20and%20Search.md)

### PaymentNotice

NRCeS profile: [PaymentNotice](https://nrces.in/ndhm/fhir/r4/StructureDefinition-PaymentNotice.html).

- [Payment notice and acknowledgement](16-Payment%20Notice%20and%20Acknowledgement.md)

### PaymentReconciliation

NRCeS profile: [PaymentReconciliation](https://nrces.in/ndhm/fhir/r4/StructureDefinition-PaymentReconciliation.html).

- [Payment notice and acknowledgement](16-Payment%20Notice%20and%20Acknowledgement.md)

### Practitioner

NRCeS profile: [Practitioner](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Practitioner.html).

- [Preauthorisation request](08-Preauthorisation%20Request.md)
- [Preauthorisation enhancement](10-Preauthorisation%20Enhancement.md)
- [Preauthorisation query and answer](11-Preauthorisation%20Query%20and%20Answer.md)
- [Claim request](12-Claim%20Request.md)
- [Claim query and answer](14-Claim%20Query%20and%20Answer.md)
- [Communication](17-Communication.md)

### PractitionerRole

NRCeS profile: [PractitionerRole](https://nrces.in/ndhm/fhir/r4/StructureDefinition-PractitionerRole.html).

- [Coverage eligibility request](02-Coverage%20Eligibility%20Request.md)
- [Coverage eligibility response](03-Coverage%20Eligibility%20Response.md)

### Procedure

NRCeS profile: [Procedure](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Procedure.html).

- [Preauthorisation request](08-Preauthorisation%20Request.md)
- [Preauthorisation enhancement](10-Preauthorisation%20Enhancement.md)
- [Preauthorisation query and answer](11-Preauthorisation%20Query%20and%20Answer.md)
- [Claim request](12-Claim%20Request.md)
- [Claim query and answer](14-Claim%20Query%20and%20Answer.md)

### Questionnaire

- [Insurance plan response](05-Insurance%20Plan%20Response%20Overview.md)
- [Insurance plan response, package-based](06-Insurance%20Plan%20Response,%20Package-Based.md)
- [Insurance plan response, coverage-based](07-Insurance%20Plan%20Response,%20Coverage-Based.md)

### QuestionnaireResponse

- [Preauthorisation request](08-Preauthorisation%20Request.md)
- [Preauthorisation enhancement](10-Preauthorisation%20Enhancement.md)
- [Preauthorisation query and answer](11-Preauthorisation%20Query%20and%20Answer.md)
- [Claim request](12-Claim%20Request.md)
- [Claim query and answer](14-Claim%20Query%20and%20Answer.md)

### Task

NRCeS profile: [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html).

- [Insurance plan request](04-Insurance%20Plan%20Request.md)
- [Preauthorisation query and answer](11-Preauthorisation%20Query%20and%20Answer.md)
- [Claim query and answer](14-Claim%20Query%20and%20Answer.md)
- [Cancel, reprocess and shortfall](15-Cancel,%20Reprocess%20and%20Shortfall.md)
- [Payment notice and acknowledgement](16-Payment%20Notice%20and%20Acknowledgement.md)
- [Communication](17-Communication.md)
- [Status and search](18-Status%20and%20Search.md)

## Profiles in use

The profiles the bundles declare in `meta.profile`, each linked to its published definition.

- [`http://hl7.org/fhir/StructureDefinition/CoverageEligibilityResponse`](https://hl7.org/fhir/R4/coverageeligibilityresponse.html)
- [`https://nrces.in/ndhm/fhir/r4/StructureDefinition/Claim`](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Claim.html)
- [`https://nrces.in/ndhm/fhir/r4/StructureDefinition/ClaimResponse`](https://nrces.in/ndhm/fhir/r4/StructureDefinition-ClaimResponse.html)
- [`https://nrces.in/ndhm/fhir/r4/StructureDefinition/Communication`](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Communication.html)
- [`https://nrces.in/ndhm/fhir/r4/StructureDefinition/CommunicationRequest`](https://nrces.in/ndhm/fhir/r4/StructureDefinition-CommunicationRequest.html)
- [`https://nrces.in/ndhm/fhir/r4/StructureDefinition/Coverage`](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Coverage.html)
- [`https://nrces.in/ndhm/fhir/r4/StructureDefinition/CoverageEligibilityRequest`](https://nrces.in/ndhm/fhir/r4/StructureDefinition-CoverageEligibilityRequest.html)
- [`https://nrces.in/ndhm/fhir/r4/StructureDefinition/CoverageEligibilityResponse`](https://nrces.in/ndhm/fhir/r4/StructureDefinition-CoverageEligibilityResponse.html)
- [`https://nrces.in/ndhm/fhir/r4/StructureDefinition/InsurancePlan`](https://nrces.in/ndhm/fhir/r4/StructureDefinition-InsurancePlan.html)
- [`https://nrces.in/ndhm/fhir/r4/StructureDefinition/Location`](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Location.html)
- [`https://nrces.in/ndhm/fhir/r4/StructureDefinition/Organization`](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html)
- [`https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient`](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html)
- [`https://nrces.in/ndhm/fhir/r4/StructureDefinition/Practitioner`](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Practitioner.html)
- [`https://nrces.in/ndhm/fhir/r4/StructureDefinition/PractitionerRole`](https://nrces.in/ndhm/fhir/r4/StructureDefinition-PractitionerRole.html)
- [`https://nrces.in/ndhm/fhir/r4/StructureDefinition/Procedure`](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Procedure.html)
- `https://nrces.in/ndhm/fhir/r4/StructureDefinition/QuestionnaireResponse`, which NRCeS does not publish; base FHIR [QuestionnaireResponse](https://hl7.org/fhir/R4/questionnaireresponse.html)
- [`https://nrces.in/ndhm/fhir/r4/StructureDefinition/Task`](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html)

## PMJAY

The generic bundle above is what every payer takes, IRDAI-regulated insurers and TPAs included. PMJAY takes it with the changes and requirements below.

### What PMJAY specifies

- Payer-generated bundles carry the case number as `Bundle.identifier`, under the payer's own host. The host arrives spelled both `payer.pmjay.nha.gov.in` and `payer.pmajy.nha.gov.in`; echo the spelling that arrived.
- Payer-generated bundles tag every resource `SUBSETTED` from `http://terminology.hl7.org/CodeSystem/v3-ObservationValue`, "Resource encoded in summary mode". It marks a projection of the payer's record, not an error.
- Identifier systems on the payer's side are NHA hosts such as `https://hcx.pmjay.gov.in/v1/preauthorization` and `https://payer.nha.gov.in`.
- The live PMJAY provider's bundles are small: 7 to 11 entries on a preauthorisation, a claim or a query answer (the `Claim`, `Patient`, both `Organization` entries, `Coverage`, `Practitioner`, `Procedure` and one `QuestionnaireResponse` per form answered). Documents ride as attachments; no clinical record is embedded.
- NHA's PMJAY integration guide asks for documents Base64-encoded twice, and the live PMJAY provider sends every attachment that way; the payer's beneficiary photo arrives encoded twice too. Check the decoded bytes for a file signature and decode again when the first pass yields Base64 text.

### What PMJAY requires

- Element ids on every Claim bundle: the `Claim` its claim number, each `item` `Item/n` (refused with `PAYR-1027` otherwise), each `procedure` `Procedure/n`, each document `supportingInfo` `SupportingInformation/n`; `1` for `Patient`, `Coverage` and the provider `Organization`, `2` for the payer `Organization`. The live PMJAY provider gives date and form entries no id.
- The `Practitioner` carries the HPR id typed `HPIN` under `https://hpr.abdm.gov.in`, beside `HPID`. Refused with `PAYR-1083` otherwise.
- Items coded from the package master: `item.category` is the master's specialty code, and the ward tier rides as `item.modifier` with the master's stratification code.
- Every `supportingInfo` carries a `sequence`, unique in the `Claim`. Refused with `PAYR-1019` otherwise. Gaps are taken: the live PMJAY provider numbers a claim's entries 1 and then 22 onward, and numbers a query answer's entries on from the first submission.
- Attachments as `application/pdf`, `application/jpg`, `application/jpeg`, `application/png` or `application/fhir+json`, as the error list publishes them. Anything else is refused with `PAYR-1008`. The live PMJAY provider sends `image/jpeg` and the payer takes it.
