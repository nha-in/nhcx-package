# NHCX Use Case Field Mappings (A, B, C, D, E Series)

This directory contains complete data element definitions and HL7 FHIR R4 element mappings for all **40 NHCX Use Cases** across five distinct series:

---

## Use Case Mapping Summary

### A-Series: Shared Protocol & Registry Use Cases
| Use Case | Title | Primary API | Callback API | JWE | Mapping File |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **A1** | Get participant list | `/fetch/participants/list` | - | No | [`A1.yaml`](A1.yaml) |
| **A2** | Get policy | `/participant/get/policies` | - | No | [`A2.yaml`](A2.yaml) |
| **A3** | Get public key | `/fetch/certs` | - | No | [`A3.yaml`](A3.yaml) |
| **A4** | Get auth token | `/get/session` | - | No | [`A4.yaml`](A4.yaml) |
| **A5** | Get status | `/v1/status` | `/v1/on_status` | Yes | [`A5.yaml`](A5.yaml) |
| **A6** | Receive errors | (hosted callback) | `/v1/error` | No | [`A6.yaml`](A6.yaml) |

### B-Series: Healthcare Provider Use Cases (Generic Network)
| Use Case | Title | Primary API | Callback API | Workflows | Mapping File |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **B1** | Check coverage eligibility | `/v1/coverageeligibility/check` | `/v1/coverageeligibility/on_check` | - | [`B1.yaml`](B1.yaml) |
| **B2** | Request insurance plan | `/v1/insuranceplan/request` | `/v1/insuranceplan/on_request` | - | [`B2.yaml`](B2.yaml) |
| **B3** | Submit pre-authorisation | `/v1/preauth/submit` | `/v1/preauth/on_submit` | 12, 13, 121, 19 | [`B3.yaml`](B3.yaml) |
| **B4** | Respond to a communication | `/v1/communication/on_request` | `/v1/communication/request` | 24, 27 | [`B4.yaml`](B4.yaml) |
| **B5** | Submit claim | `/v1/claim/submit` | `/v1/claim/on_submit` | 15, 151, 14 | [`B5.yaml`](B5.yaml) |
| **B6** | Search claims | `/v1/search/submit` | `/v1/search/on_submit` | - | [`B6.yaml`](B6.yaml) |
| **B7** | Acknowledge payment notice | `/v1/paymentnotice/on_request` | `/v1/paymentnotice/request` | 17 | [`B7.yaml`](B7.yaml) |
| **B8** | Reprocess or cancel | `/v1/task/submit` | `/v1/task/on_submit` | PC01, 36 | [`B8.yaml`](B8.yaml) |
| **B9** | Submit predetermination | `/v1/predetermination/submit` | `/v1/predetermination/on_submit` | - | [`B9.yaml`](B9.yaml) |

### C-Series: Insurer / Payer Use Cases (Adjudication & Decisions)
| Use Case | Title | Primary API | Callback API | Workflows | Mapping File |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **C1** | Link ABHA with policy | `/participant/link/abha/policy` | - | - | [`C1.yaml`](C1.yaml) |
| **C2** | De-link ABHA from policy | `/participant/delink/abha/policy` | - | - | [`C2.yaml`](C2.yaml) |
| **C3** | Respond to coverage eligibility | `/v1/coverageeligibility/on_check` | `/v1/coverageeligibility/check` | - | [`C3.yaml`](C3.yaml) |
| **C4** | Respond to insurance plan request | `/v1/insuranceplan/on_request` | `/v1/insuranceplan/request` | - | [`C4.yaml`](C4.yaml) |
| **C5** | Respond to pre-authorisation | `/v1/preauth/on_submit` | `/v1/preauth/submit` | 20, 21, 22, 23, 24 | [`C5.yaml`](C5.yaml) |
| **C6** | Raise a communication | `/v1/communication/request` | `/v1/communication/on_request` | 24, 27, N02 | [`C6.yaml`](C6.yaml) |
| **C7** | Respond to claim | `/v1/claim/on_submit` | `/v1/claim/submit` | 25, 26, 27, 28, 291 | [`C7.yaml`](C7.yaml) |
| **C8** | Respond to search | `/v1/search/on_submit` | `/v1/search/submit` | - | [`C8.yaml`](C8.yaml) |
| **C9** | Send payment notice | `/v1/paymentnotice/request` | `/v1/paymentnotice/on_request` | 30, 31, 33 | [`C9.yaml`](C9.yaml) |
| **C10**| Respond to a Task | `/v1/task/on_submit` | `/v1/task/submit` | PC02, 37, 252 | [`C10.yaml`](C10.yaml) |
| **C11**| Respond to predetermination | `/v1/predetermination/on_submit` | `/v1/predetermination/submit` | - | [`C11.yaml`](C11.yaml) |

### D-Series: PMJAY Scheme Provider Use Cases (State Health Agency)
| Use Case | Title | Primary API | Callback API | Workflows | Mapping File |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **D1** | Fetch the insurance plan | `/v1/insuranceplan/request` | `/v1/insuranceplan/on_request` | - | [`D1.yaml`](D1.yaml) |
| **D2** | Authenticate the beneficiary | ABHA Biometric / OTP | - | - | [`D2.yaml`](D2.yaml) |
| **D3** | Check coverage eligibility | `/v1/coverageeligibility/check` | `/v1/coverageeligibility/on_check` | 5 | [`D3.yaml`](D3.yaml) |
| **D4** | Submit pre-authorisation | `/v1/preauth/submit` | `/v1/preauth/on_submit` | 12 | [`D4.yaml`](D4.yaml) |
| **D5** | Resubmit pre-authorisation | `/v1/preauth/submit` | `/v1/preauth/on_submit` | 121 | [`D5.yaml`](D5.yaml) |
| **D6** | Raise an enhancement | `/v1/preauth/submit` | `/v1/preauth/on_submit` | 13, 131 | [`D6.yaml`](D6.yaml) |
| **D7** | Answer pre-auth query | `/v1/preauth/submit` | `/v1/preauth/on_submit` | 19 | [`D7.yaml`](D7.yaml) |
| **D8** | Cancel pre-authorisation | `/v1/task/submit` | `/v1/task/on_submit` | PC01 | [`D8.yaml`](D8.yaml) |
| **D9** | Submit claim | `/v1/claim/submit` | `/v1/claim/on_submit` | 15 | [`D9.yaml`](D9.yaml) |
| **D10**| Answer a claim query | `/v1/claim/submit` | `/v1/claim/on_submit` | 161 | [`D10.yaml`](D10.yaml) |
| **D11**| Reprocess a rejected claim | `/v1/task/submit` | `/v1/task/on_submit` | 36 | [`D11.yaml`](D11.yaml) |
| **D12**| Claim a shortfall | `/v1/task/submit` | `/v1/task/on_submit` | 36 | [`D12.yaml`](D12.yaml) |
| **D13**| Acknowledge payment notice | `/v1/paymentnotice/on_request` | `/v1/paymentnotice/request` | 17 | [`D13.yaml`](D13.yaml) |

### E-Series: Patient PHR Application
| Use Case | Title | Primary API | Callback API | Topics | Mapping File |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **E1** | Subscribe to notifications | `/v1/notification/subscribe` | `/v1/notification/on_subscribe` | workflow_events, network_events | [`E1.yaml`](E1.yaml) |

---

## Schema Structure of Each Mapping File

At the top, every mapping file names:
- `focal_resource`: The resource the use case is built around
- `nrces_profile`: The NRCeS profile of the focal resource, where it is a FHIR resource
- `profiles`: The NRCeS profile of every resource the fields map

Every field specifies:
- `key`: Internal programmatic data element identifier
- `label`: Business field title
- `group`: Logical category (e.g. Beneficiary, Stay, Billing, Clinical, Provider, Payer)
- `data_type`: String, Date, DateTime, Decimal, Code, Boolean, Attachment
- `cardinality`: Cardinality rule (`1..1`, `0..1`, `1..*`, `0..*`)
- `required`: Boolean requirement flag
- `fhir_resource`: Target HL7 FHIR R4 Resource type
- `fhir_path`: Dot-notation path to the exact JSON field
- `also_at`: Alternative or mirror paths
- `code_system`: Standard vocabulary URI (SNOMED CT, ICD-10, NRCeS, HL7)
- `validation_rules`: Gateway and profile constraints
- `example_value`: Concrete accepted wire value

## NRCeS profiles

The profiles the mapping files refer to, each linked to its published definition. A field is read against the profile of its `fhir_resource`.

- [Claim](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Claim.html)
- [ClaimResponse](https://nrces.in/ndhm/fhir/r4/StructureDefinition-ClaimResponse.html)
- [Communication](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Communication.html)
- [CommunicationRequest](https://nrces.in/ndhm/fhir/r4/StructureDefinition-CommunicationRequest.html)
- [Coverage](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Coverage.html)
- [CoverageEligibilityRequest](https://nrces.in/ndhm/fhir/r4/StructureDefinition-CoverageEligibilityRequest.html)
- [CoverageEligibilityResponse](https://nrces.in/ndhm/fhir/r4/StructureDefinition-CoverageEligibilityResponse.html)
- [InsurancePlan](https://nrces.in/ndhm/fhir/r4/StructureDefinition-InsurancePlan.html)
- [Organization](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html)
- [Patient](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html)
- [PaymentReconciliation](https://nrces.in/ndhm/fhir/r4/StructureDefinition-PaymentReconciliation.html)
- [Practitioner](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Practitioner.html)
- [Task](https://nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html)
