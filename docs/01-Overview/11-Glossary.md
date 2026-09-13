# Glossary

The terms this documentation uses, in the sense it uses them. Where NHA's documents use a term differently from ordinary English, the NHA sense is given.

## Organisations and programmes

- **ABDM.** Ayushman Bharat Digital Mission. The national digital health programme under which NHCX is built.
- **SNOMED CT, ICD, LOINC.** The clinical, diagnosis and laboratory terminologies FHIR bundles carry, alongside the NRCeS value sets for claim-specific codes.
- **NHA.** National Health Authority. Publishes the NHCX specifications, runs the exchange, and administers PMJAY.
- **NRCeS.** National Resource Centre for EHR Standards, at C-DAC Pune. Publishes the FHIR profiles and value sets NHCX bundles must follow.
- **IRDAI.** Insurance Regulatory and Development Authority of India. Consulted on the specifications; the registry insurers and TPAs are identified by.
- **PMJAY.** Pradhan Mantri Jan Arogya Yojana, the Ayushman Bharat health assurance scheme. On NHCX it is a payer with scheme-specific rules.
- **SHA.** State Health Agency. Administers PMJAY in a state; under the trust model, the payer for that state.
- **TPA.** Third-party administrator. Processes claims on an insurer's behalf; on the network it behaves as a payer and is the processor for the policies it handles.
- **ISNP.** Insurance self-network platform; an insurance marketplace, a participant role with aggregated or consented data access.
- **BSP, EUA.** Beneficiary service provider, end-user application. A patient's personal health record app registered as a participant to receive notifications.

## PMJAY systems and roles

- **TMS.** Transaction Management System. NHA's provider and payer applications for PMJAY claims; the system an HMIS integration replaces on the provider side.
- **BIS.** Beneficiary Identification System. PMJAY's beneficiary register.
- **HEM.** Hospital Empanelment Module. PMJAY's hospital register; the HEM ID is mapped to the NHCX participant ID at go-live.
- **PPD.** Preauthorisation Processing Doctor. The payer-side role that adjudicates preauthorisations.
- **CPD.** Claim Processing Doctor. The payer-side role that adjudicates claims.
- **CRC.** Claim Review Committee. Decides appeals; its decision is final.
- **HBP.** Health Benefit Package. PMJAY's package master, from which a hospital's insurance plan is drawn.
- **STG.** Standard Treatment Guideline. A clinical protocol attached to a package, delivered as a questionnaire the provider must answer.

## Identity and registration

- **ABHA.** Ayushman Bharat Health Account. The beneficiary's health ID; sent without hyphens.
- **HFR.** Health Facility Registry. A hospital's registry; its HFR ID is the hospital's registry ID on the exchange.
- **NIN, ROHINI.** Other registries a participant may be identified by.
- **Registry ID.** A participant's identity in the registry it belongs to: HFR ID for a hospital, IRDAI ID for an insurer or TPA, client ID for an app.
- **Participant ID, participant code.** A participant's address on the exchange, in the form `1518@hcx`. The part after the `@` names the exchange instance.
- **Client ID and secret.** The ABDM credentials used to obtain an access token; the same ones issued for Milestone 1.
- **Milestone 1, M1.** The ABDM integration level, ABHA creation and verification, that must be complete before NHCX.
- **Bridge URL, endpoint URL.** The base address of a participant's callback server, registered on its participant record.
- **Passcode.** The one-time code sent to a participant's registered mobile to confirm creation or configuration in production.
- **Processor, `processingid`.** The participant that processes claims for a policy: the insurer itself or its TPA. The recipient of every claim-side message.
- **Payer ID, `payerid`.** The insurer's own participant code, named inside the bundle as the insurer.
- **Member ID.** The beneficiary's identifier on the policy.
- **NPI, NIIP.** Identifier types for a provider's HFR ID and a payer's registry ID inside a bundle.
- **WASA.** The security audit completed before ABDM production access.
- **HTC demo.** The demonstration before NRCeS, IRDAI, TCS and NHA that closes sandbox certification.

## Messages

- **JWE.** JSON Web Encryption. The sealed-envelope format every message uses.
- **JWT.** JSON Web Token. The format of the access token and of the signature the exchange puts on calls to a participant.
- **Envelope, protected header.** The readable part of a message: the `x-hcx-` fields and the encryption settings.
- **Letter, payload.** The FHIR bundle inside the envelope, encrypted for the receiver.
- **Domain headers.** A few facts written on the envelope for the exchange's records, such as an amount.
- **Correlation ID.** The number that ties a request and its answers into one conversation.
- **API call ID, request ID.** Fresh identifiers for one call and one request.
- **Workflow code, workflow ID.** The number in the envelope that says which step of the claim a message is.
- **Status word.** The `x-hcx-status` value: `request.initiated`, `response.partial`, `response.complete`, `response.error`, and the exchange's own `request.queued`, `request.dispatched`, `request.stopped`.
- **Receipt.** The `202 Accepted` body returned on taking a message in. Not a decision.
- **Protocol response.** A refusal returned on the callback with `response.error` and error details, when a message could not be opened or failed validation.
- **Callback.** The endpoint a participant hosts to receive answers and payer-initiated messages.
- **Dummy payer.** The sandbox payer, participant `1000003538@hcx`, that answers the provider exchanges listed in the NHCX Use Cases chapter.

## Claims

- **Preauthorisation, preauth.** Approval to treat, sought before treatment. A `Claim` with `use = preauthorization`.
- **Enhancement.** Additional procedures or days sought against an approved preauthorisation.
- **Resubmission.** A revised preauthorisation that replaces an earlier one.
- **Query.** The payer asking for more before it decides. The case stays open.
- **Claim.** The request for payment after discharge. A `Claim` with `use = claim`.
- **Predetermination.** Asking what a payer would approve, without committing.
- **Adjudication.** The payer's decision on a preauthorisation or claim.
- **Reprocess.** An appeal against a rejection, raised as a Task.
- **Shortfall.** A request for the difference when a claim was paid short, raised as a Task after payment settles, under reason `partialpayment`.
- **Erroneous claim.** In the value set, a separate reason, `erroneousclaim`, for a reprocess caused by a mistaken submission by the provider. The FAQ uses the phrase for the shortfall case; the two senses coexist in the corpus.
- **Task.** The general-purpose request resource: plan fetch, cancel, reprocess, search, payment notice, acknowledgement, communication.
- **Communication.** A payer-initiated message outside the claim's own request-and-answer: a TAT alert, a grievance, a wallet or policy change, a request for information.
- **TAT.** Turnaround time. The window within which a payer is expected to act; under some policies, silence within it means approval.
- **Wallet.** The beneficiary's remaining cover under PMJAY, shared across the family.
- **Package.** A treatment with a fixed rate under a scheme; the unit a PMJAY claim is built from.
- **Stratification.** A higher bed category, such as ICU or HDU, allowed as an add-on over a package rate.
- **Implant.** A device allowed as an add-on over a package rate.
- **Unspecified procedure.** A treatment not in the package list, allowed under conditions with a free-text name and amount.
- **Cyclic procedure.** A treatment approved once and delivered over several visits, such as dialysis.
- **LAMA, DAMA.** Leave against medical advice, without informing the hospital; discharge against medical advice, with a signed undertaking. Two of the four discharge types, with `DTH` (home) and `DTM` (death).
- **LM100.** The single line item for a LAMA or DAMA stay before surgery, in place of the approved packages.
- **UTR.** Unique transaction reference. The bank's reference for a payment, carried on the payment reconciliation.
- **TDS.** Tax deducted at source, itemised on the payment reconciliation.
