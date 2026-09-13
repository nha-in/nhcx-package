# PMJAY on NHCX

Ayushman Bharat Pradhan Mantri Jan Arogya Yojana, known as PMJAY, was launched on 23 September 2018. It is the largest health assurance scheme in the world, providing a health cover of Rs. 5 lakh per family per year for secondary and tertiary care hospitalisation to over 10.74 crore poor and vulnerable families, roughly 50 crore beneficiaries, forming the bottom 40 percent of the population. It is fully funded by government, with the cost of implementation shared between the Centre and the states.

Claim adjudication under PMJAY runs through three integrated systems: the Beneficiary Identification System (BIS), the Transaction Management System (TMS), and the Hospital Empanelment Module (HEM). The key decisions sit in TMS, taken at preauthorisation by the Preauthorisation Processing Doctor (PPD) and at settlement by the Claim Processing Doctor (CPD).

The previous chapters described how a claim moves between a Provider and a private insurer over NHCX. This chapter covers what changes when the Payer is PMJAY.

## The problem with a TMS-only workflow

PMJAY claims processing today depends on the TMS 2.0 Provider System, whether or not the hospital runs its own HMIS. That creates four difficulties.

- **Duplication of data entry.** The same case is keyed into the hospital HMIS and again into TMS, increasing administrative workload and the risk of errors.
- **Lack of interoperability.** Beneficiary, clinical and claims data cannot move cleanly between systems.
- **Single-system dependency.** Relying exclusively on one provider system limits scalability and operational flexibility.
- **Restricted innovation.** System constraints leave little room for hospitals and technology partners to build around the workflow.

## The change

A hospital running an ABDM-enabled HMIS integrated with NHCX can operate PMJAY workflows entirely within its own system, with no mandatory portal usage. Claims move directly from the hospital system to the payer system over the exchange.

- **No mandatory TMS dependency.** The PMJAY workflow lives inside the HMIS rather than beside it.
- **Single-source data capture.** PMJAY data is recorded once in the HMIS and reused for claims processing, removing the re-entry and reconciliation described above.
- **Choice of system.** Hospitals are no longer tied to one PMJAY processing system and can pick any ABDM-enabled HMIS.
- **Scale.** HMIS-based integration handles higher transaction volumes more reliably than a portal-based workflow.

## What this means for an empanelled hospital

**PMJAY becomes part of routine operations.** Cases are handled inside the hospital's normal workflow rather than as a separate portal-driven activity, and are no longer exposed to portal downtime, access constraints or concurrent user limits.

**Structured data enables automation.** Preauthorisation and claim processing can be automated, cutting cost and turnaround, reducing manual error and improving data quality, which is the basic requirement for any AI model and for fraud control.

**Audit and finance improve.** All PMJAY clinical and financial records sit within hospital systems, simplifying audits, internal reviews and compliance, and claims data flows natively into hospital billing and accounting.

**Training simplifies.** Staff learn one system instead of managing separate roles and workflows across HMIS and TMS.

## Where PMJAY differs from a private insurer integration

Once NHCX integration is complete, an integrator can send claims to any private insurer. PMJAY is a national assurance programme, so it carries scheme-specific requirements on top. The endpoints themselves do not change. Four things do.

**The InsurancePlan response carries the scheme configuration.** PMJAY uses the InsurancePlan FHIR bundle heavily. It is configured at hospital level and holds the available specialties, package costs, standard treatment guidelines, questionnaires and the mandatory documents required at preauthorisation and claim. This configuration drives most of what follows, so fetching and storing it correctly is a precondition rather than a convenience.

**Biometric authentication is mandatory.** The scheme requires biometric verification of the beneficiary at registration, during treatment and at discharge. This is an additional API, outside the NHCX set, that a PMJAY integrator must implement.

**Supporting information must be structured.** Sending scanned documents is not sufficient. Clinical information must travel in ABDM-defined structured Health Information Types.

**Document queries do not use the Communication API.** When the PMJAY payer wants more documents or clarification on a preauthorisation or claim, it queries the case itself. The provider answers on the same preauthorisation or claim endpoint with the same bundle, distinguished only by the workflow code. The Communication API is still used, but for other things. Telling a hospital a case has breached its turnaround time, passing on a grievance, or announcing a change to the beneficiary's wallet or to a package rate. Also asking for extra information outside a formal query, and acknowledging an arbitration request. A hospital system must still be able to receive it.

Set against the flows in the NHCX Use Cases chapter, the picture is:

- **Get Insurance Plan, Get Policy, Coverage Eligibility Check, Claim Submission, Payment Notice and Status Check** behave the same as on any NHCX integration.
- **Preauthorisation** behaves the same, except that mandatory biometric authentication of the beneficiary must be completed before it is submitted.
- **Communication Request** is not used for document queries, which travel on the preauthorisation and claim endpoints instead. It is used for turnaround-time alerts, grievances, wallet and policy updates, and arbitration acknowledgements. A private insurer does the opposite: its query is the Communication Request itself. Payer flexibility, later in this section, sets the two query modes side by side.

## The integrator journey

The route to a PMJAY integration runs in five stages.

1. **Get compliant for ABDM Milestone 1.** Request access to the sandbox APIs, integrate against them, complete functional testing and the security audit (WASA), give the HTC demo, and go live for ABDM M1.
2. **Register on the NHCX sandbox.** Register using the ABDM Client ID, generate a participant ID, create the public and private key pair, and work through the NHCX documentation until the API flows are properly understood.
3. **Build the integration.** Test the flows against the NHCX dummy payer, implement every use case API including biometric authentication and structured data exchange, and test all cases internally rather than only the happy path.
4. **Exit the sandbox.** Run the internal demo covering interoperability and FHIR bundle validation, give the PMJAY team demo, complete WASA and the HTC demo, and submit the NHCX sandbox exit form.

5. **Go live by mapping.** After the participant is created and configured in production, the hospital raises a ticket. It carries the existing PMJAY hospital ID, the HEM ID used in TMS, and the new NHCX participant ID. NHA's operations team maps the two by hand. That mapping is the switch: preauthorisations and claims raised before it finish their life in TMS, and everything raised after it goes through the HMIS. For a while a hospital is running both, so this step is planned rather than flipped.

Two practical notes. To begin the integration, the integrator shares the Participant ID, Client ID and Registry ID with the NHCX team for onboarding onto the PMJAY staging environment. The Registry ID is then used as the Provider ID on sandbox. On successful completion, the integrator receives production keys for NHCX, which also serve for processing private insurer claims.

## About the source

This chapter and the next are drawn from four documents:

- The PMJAY Hospital Migration to HMIS via NHCX guide.
- The NHCX-PMJAY-HMIS Integration Overview.
- The Functional Requirement Document for NHCX-PMJAY-HMIS Integration, version 1.0, dated March 2026, prepared by the NHCX team at NHA.
- The NHCX Integration Handbook, version 1.0, which is the source for the workflow codes, the supporting info category and code combinations, and the gateway validation behaviour. Where the Handbook's gateway validation messages contradict the FRD, the next chapter follows the validation messages and says so. The FRD carries a disclaimer that it is work in progress and subject to revision, and the integrator journey above is marked tentative and not final. Nothing here has been verified against a running sandbox.
