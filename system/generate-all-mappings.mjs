import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MAPPINGS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "mappings");
mkdirSync(MAPPINGS_DIR, { recursive: true });

// Universal field definitions helper
const common = {
  patient: [
    { key: "patientName", label: "Patient Full Name", group: "Beneficiary", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Patient", fhir_path: "Patient.name[0].text", example_value: "Ramesh Chandra Sharma" },
    { key: "memberId", label: "Scheme / Insurer Member ID", group: "Beneficiary", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Patient", fhir_path: "Patient.identifier[type=PMJAY].value", also_at: ["Coverage.subscriberId"], example_value: "PMJAY-HP-2024-998811" },
    { key: "abhaNumber", label: "ABHA Number", group: "Beneficiary", data_type: "string", cardinality: "0..1", required: false, fhir_resource: "Patient", fhir_path: "Patient.identifier[type=ABHA].value", example_value: "91234567890123" },
    { key: "gender", label: "Gender", group: "Beneficiary", data_type: "code", cardinality: "1..1", required: true, fhir_resource: "Patient", fhir_path: "Patient.gender", code_system: "http://hl7.org/fhir/administrative-gender", example_value: "male" },
    { key: "birthDate", label: "Date of Birth", group: "Beneficiary", data_type: "date", cardinality: "1..1", required: true, fhir_resource: "Patient", fhir_path: "Patient.birthDate", example_value: "1982-06-15" },
    { key: "patientPhone", label: "Mobile Phone", group: "Beneficiary", data_type: "string", cardinality: "0..1", required: false, fhir_resource: "Patient", fhir_path: "Patient.telecom[system=phone].value", example_value: "9876543210" }
  ],
  parties: [
    { key: "facilityId", label: "Hospital Facility ID (HFR/NPI)", group: "Provider", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Organization", fhir_path: "Organization[type=prov].identifier[system=https://facility.abdm.gov.in].value", example_value: "IN1910000151" },
    { key: "providerName", label: "Hospital Name", group: "Provider", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Organization", fhir_path: "Organization[type=prov].name", example_value: "Apex Multispeciality Hospital" },
    { key: "payerId", label: "Payer Identifier (NIIP)", group: "Payer", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Organization", fhir_path: "Organization[type=pay].identifier[system=https://irdai.gov.in].value", example_value: "1000003538" },
    { key: "payerName", label: "Payer Name", group: "Payer", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Organization", fhir_path: "Organization[type=pay].name", example_value: "National Health Authority - PMJAY" },
    { key: "practitionerId", label: "Practitioner ID (HPID/HPIN)", group: "Practitioner", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Practitioner", fhir_path: "Practitioner.identifier[system=https://hpr.abdm.gov.in].value", example_value: "21-8899-4455-6677" },
    { key: "practitionerName", label: "Doctor Name", group: "Practitioner", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Practitioner", fhir_path: "Practitioner.name[0].text", example_value: "Dr. Arvind Kumar" }
  ],
  coverage: [
    { key: "policyNumber", label: "Policy Number", group: "Coverage", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Coverage", fhir_path: "Coverage.identifier[0].value", example_value: "PMJAY/HP/S/G" }
  ],
  stay: [
    { key: "admissionDate", label: "Admission Date", group: "Stay", data_type: "dateTime", cardinality: "1..1", required: true, fhir_resource: "Claim", fhir_path: "Claim.billablePeriod.start", example_value: "2026-02-26T10:00:00+05:30" },
    { key: "dischargeDate", label: "Discharge Date", group: "Stay", data_type: "dateTime", cardinality: "1..1", required: true, fhir_resource: "Claim", fhir_path: "Claim.billablePeriod.end", example_value: "2026-03-02T14:30:00+05:30" },
    { key: "careSetting", label: "Care Setting", group: "Stay", data_type: "code", cardinality: "1..1", required: true, fhir_resource: "Claim", fhir_path: "Claim.type.coding[0].code", code_system: "http://terminology.hl7.org/CodeSystem/claim-type", example_value: "institutional" }
  ],
  clinical: [
    { key: "primaryDiagnosisCode", label: "Primary Diagnosis (ICD-10)", group: "Clinical", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Claim.diagnosis", fhir_path: "Claim.diagnosis[0].diagnosisCodeableConcept.coding[0].code", code_system: "http://hl7.org/fhir/sid/icd-10", example_value: "A97.0" },
    { key: "procedureCode", label: "Package / Procedure Code", group: "Clinical", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Claim.procedure", fhir_path: "Claim.procedure[0].procedureCodeableConcept.coding[0].code", example_value: "MG004A" }
  ]
};

// Data for all 40 use cases
const useCaseDefinitions = [
  // --- A SERIES (SHARED) ---
  {
    code: "A1",
    title: "Get participant list",
    side: "shared",
    api: "/fetch/participants/list",
    callback: null,
    workflow: "none",
    carries_jwe: false,
    focal_resource: "Participant Registry List (JSON)",
    description: "Retrieve list of active participants (payers, providers, TPAs) registered on the network filtered by role.",
    fields: [
      { key: "roles", label: "Requested Role Filter", group: "Request", data_type: "array[string]", cardinality: "1..*", required: true, fhir_resource: "N/A (REST Param)", fhir_path: "Request.roles", example_value: "[\"payor\"]" },
      { key: "participantCode", label: "Participant ID (@hcx)", group: "Response", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Organization", fhir_path: "Organization.identifier[system=https://nhcx.gov.in].value", also_at: ["Header.x-hcx-recipient_code"], example_value: "1000003538@hcx" },
      { key: "participantName", label: "Entity Name", group: "Response", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Organization", fhir_path: "Organization.name", example_value: "State Health Agency Himachal" },
      { key: "endpointUrl", label: "Gateway Callback URL", group: "Response", data_type: "url", cardinality: "1..1", required: true, fhir_resource: "Endpoint", fhir_path: "Endpoint.address", example_value: "https://payer.example.org/nhcx/v1" },
      { key: "encryptionCertPath", label: "Encryption Certificate Path", group: "Response", data_type: "url", cardinality: "1..1", required: true, fhir_resource: "N/A (Crypto)", fhir_path: "Response.encryption_cert_path", example_value: "https://apisbx.abdm.gov.in/certs/1000003538.pem" }
    ]
  },
  {
    code: "A2",
    title: "Get policy",
    side: "shared",
    api: "/participant/get/policies",
    callback: null,
    workflow: "none",
    carries_jwe: false,
    focal_resource: "Policy Registry (JSON)",
    description: "Get the active policy roster for a beneficiary by mobile or ABHA number, identifying insurer and claim processor.",
    fields: [
      { key: "mobile", label: "Beneficiary Mobile", group: "Request", data_type: "string", cardinality: "0..1", required: false, fhir_resource: "Patient", fhir_path: "Patient.telecom[system=phone].value", example_value: "9876543210" },
      { key: "abhaNumber", label: "ABHA Number", group: "Request", data_type: "string", cardinality: "0..1", required: false, fhir_resource: "Patient", fhir_path: "Patient.identifier[type=ABHA].value", example_value: "91234567890123" },
      { key: "policyNumber", label: "Discovered Policy Number", group: "Response", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Coverage", fhir_path: "Coverage.identifier[0].value", example_value: "POL-HOSP-2026-0045" },
      { key: "insurerId", label: "Insurer Participant Code", group: "Response", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Organization", fhir_path: "Organization[type=pay].identifier[system=https://nhcx.gov.in].value", example_value: "1000003538@hcx" },
      { key: "processorId", label: "Claim Processor Participant Code", group: "Response", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Organization", fhir_path: "Organization[type=tpa].identifier[system=https://nhcx.gov.in].value", example_value: "1000004520@hcx" }
    ]
  },
  {
    code: "A3",
    title: "Get public key",
    side: "shared",
    api: "/fetch/certs",
    callback: null,
    workflow: "none",
    carries_jwe: false,
    focal_resource: "X.509 Certificate (JSON/PEM)",
    description: "Retrieve receiver public key certificate used to encrypt payloads with JWE RSA-OAEP/A256GCM.",
    fields: [
      { key: "participantCode", label: "Target Participant Code", group: "Request", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "N/A (Query Param)", fhir_path: "Request.participant_code", example_value: "1000003538@hcx" },
      { key: "certData", label: "Public Key PEM Certificate", group: "Response", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "N/A (Crypto)", fhir_path: "Response.certs[0]", example_value: "-----BEGIN CERTIFICATE-----\nMIIBIjANBgkqhkiG9w0BAQEFAAO..." }
    ]
  },
  {
    code: "A4",
    title: "Get auth token",
    side: "shared",
    api: "/get/session",
    callback: null,
    workflow: "none",
    carries_jwe: false,
    focal_resource: "OAuth 2.0 Token (JSON)",
    description: "Generate ABDM bearer authentication token using Milestone 1 client ID and secret.",
    fields: [
      { key: "clientId", label: "Client ID", group: "Request", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "N/A (Auth)", fhir_path: "Request.clientId", example_value: "SBX_001205" },
      { key: "clientSecret", label: "Client Secret", group: "Request", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "N/A (Auth)", fhir_path: "Request.clientSecret", example_value: "secret_xyz" },
      { key: "accessToken", label: "Bearer Access Token", group: "Response", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "N/A (Auth Header)", fhir_path: "Header.Authorization", also_at: ["Header.bearer_auth"], example_value: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..." },
      { key: "expiresIn", label: "Token Validity Seconds", group: "Response", data_type: "integer", cardinality: "1..1", required: true, fhir_resource: "N/A (Auth)", fhir_path: "Response.expiresIn", example_value: "3600" }
    ]
  },
  {
    code: "A5",
    title: "Get status",
    side: "shared",
    api: "/v1/status",
    callback: "/v1/on_status",
    workflow: "none",
    carries_jwe: true,
    focal_resource: "Task / Empty Payload with Protected Headers",
    description: "Query gateway or recipient regarding dispatch status of any previously submitted transaction by correlation ID.",
    fields: [
      { key: "correlationId", label: "Original Correlation ID", group: "Header", data_type: "uuid", cardinality: "1..1", required: true, fhir_resource: "Header", fhir_path: "Header.x-hcx-correlation_id", example_value: "4f9d2b80-13b4-4e2a-9e12-8f9024a56789" },
      { key: "status", label: "Dispatch Status", group: "Callback Header", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Header", fhir_path: "Header.x-hcx-status", example_value: "request.dispatched" }
    ]
  },
  {
    code: "A6",
    title: "Receive errors",
    side: "shared",
    api: "(hosted only)",
    callback: "/v1/error",
    workflow: "none",
    carries_jwe: false,
    focal_resource: "Error Payload (JSON)",
    description: "Webhook hosted by participants where exchange delivers terminal undeliverable error notifications after retry exhaustion.",
    fields: [
      { key: "correlationId", label: "Failed Transaction ID", group: "Error", data_type: "uuid", cardinality: "1..1", required: true, fhir_resource: "Header", fhir_path: "Header.x-hcx-correlation_id", example_value: "4f9d2b80-13b4-4e2a-9e12-8f9024a56789" },
      { key: "errorCode", label: "Error Code", group: "Error", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Error", fhir_path: "Error.code", example_value: "ERR_RECIPIENT_UNREACHABLE" },
      { key: "errorMessage", label: "Error Description", group: "Error", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Error", fhir_path: "Error.message", example_value: "Recipient gateway timed out after 5 attempts" }
    ]
  },

  // --- B SERIES (PROVIDER GENERIC) ---
  {
    code: "B1",
    title: "Check coverage eligibility",
    side: "provider",
    api: "/v1/coverageeligibility/check",
    callback: "/v1/coverageeligibility/on_check",
    workflow: "none (sits beside 10, 11)",
    carries_jwe: true,
    focal_resource: "CoverageEligibilityRequest",
    description: "Inquire whether beneficiary policy is in force, wallet balance, sub-limits, or mandatory preauth document rules.",
    fields: [
      { key: "purpose", label: "Eligibility Purpose", group: "Case", data_type: "code", cardinality: "1..1", required: true, fhir_resource: "CoverageEligibilityRequest", fhir_path: "CoverageEligibilityRequest.purpose[0]", code_system: "http://hl7.org/fhir/eligibilityrequest-purpose", example_value: "auth-requirements" },
      { key: "caseNumber", label: "Provider Reference", group: "Case", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "CoverageEligibilityRequest", fhir_path: "CoverageEligibilityRequest.identifier[0].value", also_at: ["Bundle.id"], example_value: "PA0000000001" },
      { key: "servicedDate", label: "Date of Service", group: "Case", data_type: "date", cardinality: "1..1", required: true, fhir_resource: "CoverageEligibilityRequest", fhir_path: "CoverageEligibilityRequest.servicedDate", example_value: "2026-02-26" },
      ...common.patient,
      ...common.coverage,
      ...common.parties.slice(0, 4),
      { key: "productOrService", label: "Package Code", group: "Item", data_type: "string", cardinality: "0..*", required: false, fhir_resource: "CoverageEligibilityRequest.item", fhir_path: "CoverageEligibilityRequest.item[].productOrService.coding[0].code", example_value: "MG004A" }
    ]
  },
  {
    code: "B2",
    title: "Request insurance plan",
    side: "provider",
    api: "/v1/insuranceplan/request",
    callback: "/v1/insuranceplan/on_request",
    workflow: "none",
    carries_jwe: true,
    focal_resource: "Task",
    description: "Poll insurance plan package master, base tariff rates, and mandatory questionnaires keyed by policy number.",
    fields: [
      { key: "taskCode", label: "Task Code", group: "Task", data_type: "code", cardinality: "1..1", required: true, fhir_resource: "Task", fhir_path: "Task.code.coding[0].code", example_value: "poll" },
      { key: "policyNumber", label: "Policy Number", group: "Task Input", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Task", fhir_path: "Task.input[type=PolicyNumber].valueString", example_value: "PMJAY/HP/S/G" },
      { key: "facilityId", label: "Provider HFR ID", group: "Task Input", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Task", fhir_path: "Task.input[type=ProviderId].valueString", example_value: "IN1910000151" }
    ]
  },
  {
    code: "B3",
    title: "Submit pre-authorisation",
    side: "provider",
    api: "/v1/preauth/submit",
    callback: "/v1/preauth/on_submit",
    workflow: "12 (New), 13 (Enhancement), 121 (Resubmission), 19 (Query reply)",
    carries_jwe: true,
    focal_resource: "Claim",
    description: "Submit request for cashless treatment sanction prior to or during hospitalization.",
    fields: [
      { key: "claimNumber", label: "Pre-auth Case Number", group: "Case", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Claim", fhir_path: "Claim.identifier[0].value", also_at: ["Bundle.id"], example_value: "PA20260226001" },
      { key: "use", label: "Claim Use", group: "Case", data_type: "code", cardinality: "1..1", required: true, fhir_resource: "Claim", fhir_path: "Claim.use", example_value: "preauthorization" },
      { key: "preAuthRef", label: "Approval Reference (if enhancement)", group: "Case", data_type: "string", cardinality: "0..1", required: false, fhir_resource: "Claim", fhir_path: "Claim.insurance[0].preAuthRef[0]", example_value: "APPR-2026-HP-00891" },
      ...common.patient,
      ...common.coverage,
      ...common.parties,
      ...common.stay,
      ...common.clinical,
      { key: "estimatedTotal", label: "Estimated Package Amount", group: "Billing", data_type: "decimal", cardinality: "1..1", required: true, fhir_resource: "Claim", fhir_path: "Claim.total.value", example_value: "15500.00" }
    ]
  },
  {
    code: "B4",
    title: "Respond to a communication",
    side: "provider",
    api: "/v1/communication/on_request",
    callback: "/v1/communication/request",
    workflow: "24 (Preauth query answer), 27 (Claim query answer)",
    carries_jwe: true,
    focal_resource: "Communication / Task",
    description: "Answer payer query by attaching requested clinical notes, diagnostic investigations, or clarifications.",
    fields: [
      { key: "communicationId", label: "Communication Identifier", group: "Case", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Communication", fhir_path: "Communication.identifier[0].value", example_value: "COMM-RESP-001" },
      { key: "queryRequestId", label: "Original Query Reference", group: "Case", data_type: "reference", cardinality: "1..1", required: true, fhir_resource: "Communication", fhir_path: "Communication.basedOn[0].reference", example_value: "Task/task-comm-req-1" },
      { key: "replyText", label: "Clarification Text", group: "Payload", data_type: "string", cardinality: "0..1", required: false, fhir_resource: "Communication", fhir_path: "Communication.payload[0].contentString", example_value: "Platelet count attached as requested." },
      { key: "attachmentData", label: "Attached Document Base64", group: "Payload", data_type: "base64Binary", cardinality: "0..*", required: false, fhir_resource: "Communication", fhir_path: "Communication.payload[0].contentAttachment.data", example_value: "JVBERi0xLjQK..." }
    ]
  },
  {
    code: "B5",
    title: "Submit claim",
    side: "provider",
    api: "/v1/claim/submit",
    callback: "/v1/claim/on_submit",
    workflow: "15 (Claim), 151 (Query answer), 14 (Provisional discharge)",
    carries_jwe: true,
    focal_resource: "Claim",
    description: "Submit final itemized discharge bills, discharge summary, and pharmacy charges for claims adjudication.",
    fields: [
      { key: "claimNumber", label: "Final Claim Number", group: "Case", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Claim", fhir_path: "Claim.identifier[0].value", also_at: ["Bundle.id"], example_value: "CL0000000001" },
      { key: "use", label: "Claim Use", group: "Case", data_type: "code", cardinality: "1..1", required: true, fhir_resource: "Claim", fhir_path: "Claim.use", example_value: "claim" },
      { key: "preAuthRef", label: "Approved Pre-auth Reference", group: "Case", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Claim", fhir_path: "Claim.insurance[0].preAuthRef[0]", example_value: "APPR-2026-HP-00891" },
      ...common.patient,
      ...common.coverage,
      ...common.parties,
      ...common.stay,
      ...common.clinical,
      { key: "finalBilledAmount", label: "Total Claim Amount", group: "Billing", data_type: "decimal", cardinality: "1..1", required: true, fhir_resource: "Claim", fhir_path: "Claim.total.value", example_value: "15500.00" }
    ]
  },
  {
    code: "B6",
    title: "Search claims",
    side: "provider",
    api: "/v1/search/submit",
    callback: "/v1/search/on_submit",
    workflow: "none",
    carries_jwe: true,
    focal_resource: "Task",
    description: "Query payer for claim status and adjudication bundles matching case or policy search criteria.",
    fields: [
      { key: "taskCode", label: "Task Code", group: "Task", data_type: "code", cardinality: "1..1", required: true, fhir_resource: "Task", fhir_path: "Task.code.coding[0].code", example_value: "search" },
      { key: "claimNumber", label: "Search Claim Number", group: "Task Input", data_type: "string", cardinality: "0..1", required: false, fhir_resource: "Task", fhir_path: "Task.input[type=ClaimNumber].valueString", example_value: "CL0000000001" },
      { key: "policyNumber", label: "Search Policy Number", group: "Task Input", data_type: "string", cardinality: "0..1", required: false, fhir_resource: "Task", fhir_path: "Task.input[type=PolicyNumber].valueString", example_value: "PMJAY/HP/S/G" }
    ]
  },
  {
    code: "B7",
    title: "Acknowledge payment notice",
    side: "provider",
    api: "/v1/paymentnotice/on_request",
    callback: "/v1/paymentnotice/request",
    workflow: "17 (or echoes payer notice wf30)",
    carries_jwe: true,
    focal_resource: "PaymentReconciliation / Task",
    description: "Acknowledge receipt of settlement advice and bank remittance notification.",
    fields: [
      { key: "settlementNumber", label: "Payment Reference", group: "Settlement", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "PaymentReconciliation", fhir_path: "PaymentReconciliation.identifier[0].value", example_value: "SETTLE-2026-001" },
      { key: "status", label: "Acknowledgment Status", group: "Settlement", data_type: "code", cardinality: "1..1", required: true, fhir_resource: "PaymentReconciliation", fhir_path: "PaymentReconciliation.status", example_value: "active" }
    ]
  },
  {
    code: "B8",
    title: "Reprocess or cancel",
    side: "provider",
    api: "/v1/task/submit",
    callback: "/v1/task/on_submit",
    workflow: "PC01 (Cancel), 36 (Reprocess / Dispute)",
    carries_jwe: true,
    focal_resource: "Task",
    description: "Submit request to cancel an approved pre-authorisation or appeal a rejected claim.",
    fields: [
      { key: "taskCode", label: "Action Code", group: "Task", data_type: "code", cardinality: "1..1", required: true, fhir_resource: "Task", fhir_path: "Task.code.coding[0].code", example_value: "reprocess" },
      { key: "taskReason", label: "Appeal Reason Code", group: "Task", data_type: "code", cardinality: "1..1", required: true, fhir_resource: "Task", fhir_path: "Task.reasonCode.coding[0].code", example_value: "claimrejected" },
      { key: "originalCaseNumber", label: "Original Case Number", group: "Task Input", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Task", fhir_path: "Task.input[0].valueString", example_value: "CL0000000001" },
      { key: "appealDocument", label: "Dispute Justification Document", group: "Task Input", data_type: "base64Binary", cardinality: "1..1", required: true, fhir_resource: "Task", fhir_path: "Task.input[category=document].valueAttachment.data", example_value: "JVBERi0xLjQK..." }
    ]
  },
  {
    code: "B9",
    title: "Submit predetermination",
    side: "provider",
    api: "/v1/predetermination/submit",
    callback: "/v1/predetermination/on_submit",
    workflow: "none",
    carries_jwe: true,
    focal_resource: "Claim",
    description: "Request advance estimate of approved coverage amounts without reserving policy benefits.",
    fields: [
      { key: "claimNumber", label: "Predetermination Reference", group: "Case", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Claim", fhir_path: "Claim.identifier[0].value", example_value: "PD0000000001" },
      { key: "use", label: "Claim Use", group: "Case", data_type: "code", cardinality: "1..1", required: true, fhir_resource: "Claim", fhir_path: "Claim.use", example_value: "predetermination" },
      ...common.patient,
      ...common.coverage,
      ...common.clinical
    ]
  },

  // --- C SERIES (PAYER DECISIONS & CALLBACKS) ---
  {
    code: "C1",
    title: "Link ABHA with policy",
    side: "payer",
    api: "/participant/link/abha/policy",
    callback: null,
    workflow: "none",
    carries_jwe: false,
    focal_resource: "Policy Link Record (JSON)",
    description: "Bind beneficiary ABHA number and mobile to policy records in the registry upon policy issuance.",
    fields: [
      { key: "abhaNumber", label: "ABHA Number", group: "Link", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Patient", fhir_path: "Patient.identifier[type=ABHA].value", example_value: "91234567890123" },
      { key: "policyNumber", label: "Policy Number", group: "Link", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Coverage", fhir_path: "Coverage.identifier[0].value", example_value: "POL-HOSP-2026-0045" },
      { key: "payerId", label: "Insurer Participant Code", group: "Link", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Organization", fhir_path: "Organization.identifier.value", example_value: "1000003538@hcx" }
    ]
  },
  {
    code: "C2",
    title: "De-link ABHA from policy",
    side: "payer",
    api: "/participant/delink/abha/policy",
    callback: null,
    workflow: "none",
    carries_jwe: false,
    focal_resource: "Policy Delink Record (JSON)",
    description: "Remove linkage between ABHA ID and policy upon policy cancellation or transfer.",
    fields: [
      { key: "abhaNumber", label: "ABHA Number", group: "Delink", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Patient", fhir_path: "Patient.identifier[type=ABHA].value", example_value: "91234567890123" },
      { key: "policyNumber", label: "Policy Number", group: "Delink", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Coverage", fhir_path: "Coverage.identifier[0].value", example_value: "POL-HOSP-2026-0045" }
    ]
  },
  {
    code: "C3",
    title: "Respond to coverage eligibility",
    side: "payer",
    api: "/v1/coverageeligibility/on_check",
    callback: "/v1/coverageeligibility/check",
    workflow: "none (or 5 under PMJAY)",
    carries_jwe: true,
    focal_resource: "CoverageEligibilityResponse",
    description: "Callback returning policy active status, remaining wallet balance, and preauth documentary prerequisites.",
    fields: [
      { key: "outcome", label: "Verdict Outcome", group: "Verdict", data_type: "code", cardinality: "1..1", required: true, fhir_resource: "CoverageEligibilityResponse", fhir_path: "CoverageEligibilityResponse.outcome", example_value: "complete" },
      { key: "inforce", label: "Policy In Force", group: "Coverage", data_type: "boolean", cardinality: "1..1", required: true, fhir_resource: "CoverageEligibilityResponse", fhir_path: "CoverageEligibilityResponse.insurance[0].inforce", example_value: true },
      { key: "allowedMoney", label: "Remaining Balance Amount", group: "Benefit", data_type: "decimal", cardinality: "0..1", required: false, fhir_resource: "CoverageEligibilityResponse", fhir_path: "CoverageEligibilityResponse.insurance[0].item[].benefit[type=benefit].allowedMoney.value", example_value: "485000.00" }
    ]
  },
  {
    code: "C4",
    title: "Respond to insurance plan request",
    side: "payer",
    api: "/v1/insuranceplan/on_request",
    callback: "/v1/insuranceplan/request",
    workflow: "none (or 5 under PMJAY)",
    carries_jwe: true,
    focal_resource: "InsurancePlan",
    description: "Deliver digital policy package master containing empanelled specialties, fixed tariffs, and STG questionnaires.",
    fields: [
      { key: "planName", label: "Insurance Plan Name", group: "Plan", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "InsurancePlan", fhir_path: "InsurancePlan.name", example_value: "PMJAY Ayushman Bharat" },
      { key: "packageCode", label: "Benefit Package Code", group: "Plan Cost", data_type: "string", cardinality: "1..*", required: true, fhir_resource: "InsurancePlan", fhir_path: "InsurancePlan.plan[].specificCost[].benefit[].type.coding[0].code", example_value: "MG004A" },
      { key: "packageRate", label: "Agreed Tariff Rate", group: "Plan Cost", data_type: "decimal", cardinality: "1..*", required: true, fhir_resource: "InsurancePlan", fhir_path: "InsurancePlan.plan[].specificCost[].benefit[].cost[0].value.value", example_value: "15500.00" }
    ]
  },
  {
    code: "C5",
    title: "Respond to pre-authorisation",
    side: "payer",
    api: "/v1/preauth/on_submit",
    callback: "/v1/preauth/submit",
    workflow: "20 (Received), 21 (Approved), 22 (Enhancement approved), 23 (Rejected), 24 (Queried)",
    carries_jwe: true,
    focal_resource: "ClaimResponse",
    description: "Deliver pre-authorisation auto-adjudication and manual medical desk verdicts.",
    fields: [
      { key: "outcome", label: "Verdict Outcome", group: "Verdict", data_type: "code", cardinality: "1..1", required: true, fhir_resource: "ClaimResponse", fhir_path: "ClaimResponse.outcome", example_value: "complete" },
      { key: "preAuthRef", label: "Payer Case Tracking ID", group: "Verdict", data_type: "string", cardinality: "0..1", required: false, fhir_resource: "ClaimResponse", fhir_path: "ClaimResponse.preAuthRef", example_value: "APPR-2026-HP-00891" },
      { key: "approvedAmount", label: "Approved Pre-auth Sanction", group: "Financials", data_type: "decimal", cardinality: "0..1", required: false, fhir_resource: "ClaimResponse", fhir_path: "ClaimResponse.total[category=benefit].amount.value", example_value: "15500.00" },
      { key: "disposition", label: "Adjudicator Remarks", group: "Verdict", data_type: "string", cardinality: "0..1", required: false, fhir_resource: "ClaimResponse", fhir_path: "ClaimResponse.disposition", example_value: "Approved by PPD-Trust committee" }
    ]
  },
  {
    code: "C6",
    title: "Raise a communication",
    side: "payer",
    api: "/v1/communication/request",
    callback: "/v1/communication/on_request",
    workflow: "24 (Preauth queried), 27 (Claim queried), N02 (Notification)",
    carries_jwe: true,
    focal_resource: "CommunicationRequest / Task",
    description: "Request additional clinical investigations, ask queries, or notify turnaround time alerts.",
    fields: [
      { key: "taskReason", label: "Query Reason", group: "Query", data_type: "code", cardinality: "1..1", required: true, fhir_resource: "Task", fhir_path: "Task.reasonCode.coding[0].code", example_value: "additionalinfo" },
      { key: "queryText", label: "Query Questions", group: "Query", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "CommunicationRequest", fhir_path: "CommunicationRequest.payload[0].contentString", example_value: "Please attach pre-operative ultrasound scan." }
    ]
  },
  {
    code: "C7",
    title: "Respond to claim",
    side: "payer",
    api: "/v1/claim/on_submit",
    callback: "/v1/claim/submit",
    workflow: "25 (Received), 26 (Approved), 27 (Queried), 28 (In process), 291 (Rejected)",
    carries_jwe: true,
    focal_resource: "ClaimResponse",
    description: "Deliver final claim settlement adjudication decision with approved amount and deduction breakdown.",
    fields: [
      { key: "outcome", label: "Claim Outcome", group: "Adjudication", data_type: "code", cardinality: "1..1", required: true, fhir_resource: "ClaimResponse", fhir_path: "ClaimResponse.outcome", example_value: "complete" },
      { key: "approvedBenefit", label: "Approved Claim Amount", group: "Financials", data_type: "decimal", cardinality: "1..1", required: true, fhir_resource: "ClaimResponse", fhir_path: "ClaimResponse.total[category=benefit].amount.value", example_value: "15500.00" },
      { key: "copayAmount", label: "Beneficiary Co-payment", group: "Financials", data_type: "decimal", cardinality: "0..1", required: false, fhir_resource: "ClaimResponse", fhir_path: "ClaimResponse.total[category=copay].amount.value", example_value: "0.00" },
      { key: "deductionReason", label: "Deduction Justification", group: "Adjudication", data_type: "string", cardinality: "0..1", required: false, fhir_resource: "ClaimResponse", fhir_path: "ClaimResponse.item[].adjudication[category=deduction].reason.coding[0].display", example_value: "Non-medical consumables deducted" }
    ]
  },
  {
    code: "C8",
    title: "Respond to search",
    side: "payer",
    api: "/v1/search/on_submit",
    callback: "/v1/search/submit",
    workflow: "none",
    carries_jwe: true,
    focal_resource: "Task",
    description: "Return matching ClaimResponse resources fulfilling audit or historical search criteria.",
    fields: [
      { key: "taskStatus", label: "Search Task Status", group: "Task", data_type: "code", cardinality: "1..1", required: true, fhir_resource: "Task", fhir_path: "Task.status", example_value: "completed" },
      { key: "claimResponseRef", label: "Matching ClaimResponse", group: "Task Output", data_type: "reference", cardinality: "0..*", required: false, fhir_resource: "Task", fhir_path: "Task.output[].valueReference.reference", example_value: "ClaimResponse/cr-approved-1" }
    ]
  },
  {
    code: "C9",
    title: "Send payment notice",
    side: "payer",
    api: "/v1/paymentnotice/request",
    callback: "/v1/paymentnotice/on_request",
    workflow: "30 (Initiated), 31 (Processed), 33 (Settled)",
    carries_jwe: true,
    focal_resource: "PaymentReconciliation",
    description: "Transmit bank remittance advice, TDS deductions, penalty adjustments, and bank UTR numbers.",
    fields: [
      { key: "utrNumber", label: "Bank UTR Number", group: "Payment", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "PaymentReconciliation", fhir_path: "PaymentReconciliation.paymentIdentifier.value", example_value: "CMS2602260081728" },
      { key: "paymentDate", label: "Remittance Date", group: "Payment", data_type: "date", cardinality: "1..1", required: true, fhir_resource: "PaymentReconciliation", fhir_path: "PaymentReconciliation.paymentDate", example_value: "2026-03-05" },
      { key: "settledAmount", label: "Net Bank Remittance Amount", group: "Payment", data_type: "decimal", cardinality: "1..1", required: true, fhir_resource: "PaymentReconciliation", fhir_path: "PaymentReconciliation.paymentAmount.value", example_value: "14850.00" },
      { key: "tdsDeduction", label: "Tax Deducted at Source (TDS)", group: "Payment Detail", data_type: "decimal", cardinality: "0..1", required: false, fhir_resource: "PaymentReconciliation", fhir_path: "PaymentReconciliation.detail[type=tds].amount.value", example_value: "650.00" }
    ]
  },
  {
    code: "C10",
    title: "Respond to a Task",
    side: "payer",
    api: "/v1/task/on_submit",
    callback: "/v1/task/submit",
    workflow: "PC02 (Cancellation done), 37 (Arbitration ack), 252 (Reprocess approved)",
    carries_jwe: true,
    focal_resource: "Task",
    description: "Callback answering cancellation, claim arbitration, reprocess appeals, or status requests.",
    fields: [
      { key: "taskStatus", label: "Task Status", group: "Task", data_type: "code", cardinality: "1..1", required: true, fhir_resource: "Task", fhir_path: "Task.status", example_value: "completed" },
      { key: "outputDecision", label: "Decision Reference", group: "Task Output", data_type: "reference", cardinality: "0..1", required: false, fhir_resource: "Task", fhir_path: "Task.output[0].valueReference.reference", example_value: "ClaimResponse/cr-reprocess-approved" }
    ]
  },
  {
    code: "C11",
    title: "Respond to predetermination",
    side: "payer",
    api: "/v1/predetermination/on_submit",
    callback: "/v1/predetermination/submit",
    workflow: "none",
    carries_jwe: true,
    focal_resource: "ClaimResponse",
    description: "Callback returning hypothetical adjudication estimate for planned treatment.",
    fields: [
      { key: "use", label: "Claim Use", group: "Verdict", data_type: "code", cardinality: "1..1", required: true, fhir_resource: "ClaimResponse", fhir_path: "ClaimResponse.use", example_value: "predetermination" },
      { key: "estimatedApproval", label: "Estimated Approved Benefit", group: "Verdict", data_type: "decimal", cardinality: "1..1", required: true, fhir_resource: "ClaimResponse", fhir_path: "ClaimResponse.total[category=benefit].amount.value", example_value: "15500.00" }
    ]
  },

  // --- D SERIES (PMJAY SCHEME SPECIALIZED) ---
  {
    code: "D1",
    title: "Fetch the insurance plan",
    side: "provider",
    api: "/v1/insuranceplan/request",
    callback: "/v1/insuranceplan/on_request",
    workflow: "none",
    carries_jwe: true,
    focal_resource: "Task",
    description: "Poll PMJAY SHA package master with specialty tiers, implants, and STG clinical questionnaire definitions.",
    fields: [
      { key: "taskCode", label: "Task Code", group: "Task", data_type: "code", cardinality: "1..1", required: true, fhir_resource: "Task", fhir_path: "Task.code.coding[0].code", example_value: "poll" },
      { key: "schemeId", label: "Scheme Policy Identifier", group: "Task Input", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Task", fhir_path: "Task.input[type=PolicyNumber].valueString", example_value: "PMJAY/HP/S/G" }
    ]
  },
  {
    code: "D2",
    title: "Authenticate the beneficiary",
    side: "provider",
    api: "ABHA biometric auth init and verify (not NHCX)",
    callback: null,
    workflow: "none",
    carries_jwe: false,
    focal_resource: "ABHA Auth Token",
    description: "Biometric or OTP authentication of beneficiary against ABDM registry prior to PMJAY admission.",
    fields: [
      { key: "abhaNumber", label: "ABHA Number", group: "Auth", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Patient", fhir_path: "Patient.identifier[type=ABHA].value", example_value: "91234567890123" },
      { key: "authMode", label: "Authentication Mode", group: "Auth", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "N/A (Auth)", fhir_path: "Request.authMode", example_value: "DEMOGRAPHICS" },
      { key: "authToken", label: "Biometric Consent Token", group: "Auth", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "N/A (Auth)", fhir_path: "Response.token", example_value: "bio-token-778899" }
    ]
  },
  {
    code: "D3",
    title: "Check coverage eligibility",
    side: "provider",
    api: "/v1/coverageeligibility/check",
    callback: "/v1/coverageeligibility/on_check",
    workflow: "none (or 5 under PMJAY)",
    carries_jwe: true,
    focal_resource: "CoverageEligibilityRequest",
    description: "Check PMJAY beneficiary family wallet balance and verify golden record BIS status.",
    fields: [
      { key: "memberId", label: "PMJAY Family ID", group: "Beneficiary", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Patient", fhir_path: "Patient.identifier[type=PMJAY].value", example_value: "PMJAY-HP-2024-998811" },
      { key: "purpose", label: "Purpose", group: "Case", data_type: "code", cardinality: "1..1", required: true, fhir_resource: "CoverageEligibilityRequest", fhir_path: "CoverageEligibilityRequest.purpose[0]", example_value: "validation" }
    ]
  },
  {
    code: "D4",
    title: "Submit pre-authorisation",
    side: "provider",
    api: "/v1/preauth/submit",
    callback: "/v1/preauth/on_submit",
    workflow: "12 (Preauth requested)",
    carries_jwe: true,
    focal_resource: "Claim",
    description: "Submit PMJAY pre-authorisation with mandatory photo of patient, clinical questionnaire, and package selection.",
    fields: [
      { key: "claimNumber", label: "PMJAY Case Number", group: "Case", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Claim", fhir_path: "Claim.identifier[0].value", example_value: "VB26AA2600001" },
      ...common.patient,
      ...common.parties,
      ...common.clinical,
      { key: "patientPhoto", label: "Patient Photo on Bed (POI)", group: "Documents", data_type: "base64Binary", cardinality: "1..1", required: true, fhir_resource: "Claim.supportingInfo[category=POI]", fhir_path: "Claim.supportingInfo[category=POI].valueAttachment.data", example_value: "JVBERi0xLjQK..." }
    ]
  },
  {
    code: "D5",
    title: "Resubmit pre-authorisation",
    side: "provider",
    api: "/v1/preauth/submit",
    callback: "/v1/preauth/on_submit",
    workflow: "121 (Resubmission)",
    carries_jwe: true,
    focal_resource: "Claim",
    description: "Resubmit pre-authorisation request with modified clinical package or STG justifications following rejection.",
    fields: [
      { key: "claimNumber", label: "Existing Case Number", group: "Case", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Claim", fhir_path: "Claim.identifier[0].value", example_value: "VB26AA2600001" },
      { key: "workflowId", label: "Workflow Code", group: "Header", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Header", fhir_path: "Header.x-hcx-workflow_id", example_value: "121" }
    ]
  },
  {
    code: "D6",
    title: "Raise an enhancement",
    side: "provider",
    api: "/v1/preauth/submit",
    callback: "/v1/preauth/on_submit",
    workflow: "13 (Enhancement requested), 131 (Enhancement query answered)",
    carries_jwe: true,
    focal_resource: "Claim",
    description: "Request additional funds or package additions during prolonged intensive care or surgery.",
    fields: [
      { key: "claimNumber", label: "Case Number", group: "Case", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Claim", fhir_path: "Claim.identifier[0].value", example_value: "VB26AA2600001" },
      { key: "preAuthRef", label: "Initial Approval Reference", group: "Case", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Claim", fhir_path: "Claim.insurance[0].preAuthRef[0]", example_value: "APPR-2026-HP-00891" },
      { key: "workflowId", label: "Workflow Code", group: "Header", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Header", fhir_path: "Header.x-hcx-workflow_id", example_value: "13" }
    ]
  },
  {
    code: "D7",
    title: "Answer a pre-authorisation query",
    side: "provider",
    api: "/v1/preauth/submit",
    callback: "/v1/preauth/on_submit",
    workflow: "19 (Query answered under PMJAY)",
    carries_jwe: true,
    focal_resource: "Claim",
    description: "Answer PMJAY medical desk query directly on preauth endpoint carrying CQD clinical note responses.",
    fields: [
      { key: "claimNumber", label: "Case Number", group: "Case", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Claim", fhir_path: "Claim.identifier[0].value", example_value: "VB26AA2600001" },
      { key: "workflowId", label: "Workflow Code", group: "Header", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Header", fhir_path: "Header.x-hcx-workflow_id", example_value: "19" },
      { key: "nmiDocument", label: "Need More Info (NMI) Document", group: "Documents", data_type: "base64Binary", cardinality: "1..1", required: true, fhir_resource: "Claim.supportingInfo[category=NMI]", fhir_path: "Claim.supportingInfo[category=NMI].valueAttachment.data", example_value: "JVBERi0xLjQK..." }
    ]
  },
  {
    code: "D8",
    title: "Cancel pre-authorisation",
    side: "provider",
    api: "/v1/task/submit",
    callback: "/v1/task/on_submit",
    workflow: "PC01 (Cancellation requested)",
    carries_jwe: true,
    focal_resource: "Task",
    description: "Cancel active pre-authorisation before discharge or when patient leaves without treatment.",
    fields: [
      { key: "taskCode", label: "Action Code", group: "Task", data_type: "code", cardinality: "1..1", required: true, fhir_resource: "Task", fhir_path: "Task.code.coding[0].code", example_value: "cancel" },
      { key: "caseNumber", label: "Pre-auth Case Number", group: "Task Input", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Task", fhir_path: "Task.input[0].valueString", example_value: "VB26AA2600001" }
    ]
  },
  {
    code: "D9",
    title: "Submit claim",
    side: "provider",
    api: "/v1/claim/submit",
    callback: "/v1/claim/on_submit",
    workflow: "15 (Claim submitted)",
    carries_jwe: true,
    focal_resource: "Claim",
    description: "Submit PMJAY final discharge claim with discharge summary, final billing package, and patient exit photos.",
    fields: [
      { key: "claimNumber", label: "PMJAY Claim Number", group: "Case", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Claim", fhir_path: "Claim.identifier[0].value", example_value: "CL26AA2600001" },
      { key: "dischargeSummary", label: "Hospital Discharge Summary (HDS)", group: "Documents", data_type: "base64Binary", cardinality: "1..1", required: true, fhir_resource: "Claim.supportingInfo[category=HDS]", fhir_path: "Claim.supportingInfo[category=HDS].valueAttachment.data", example_value: "JVBERi0xLjQK..." },
      ...common.patient,
      ...common.parties
    ]
  },
  {
    code: "D10",
    title: "Answer a claim query",
    side: "provider",
    api: "/v1/claim/submit",
    callback: "/v1/claim/on_submit",
    workflow: "161 (Claim document query answered)",
    carries_jwe: true,
    focal_resource: "Claim",
    description: "Submit additional bills or clinical records queried by PMJAY Claim Processing Desk (CPD).",
    fields: [
      { key: "claimNumber", label: "Claim Number", group: "Case", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Claim", fhir_path: "Claim.identifier[0].value", example_value: "CL26AA2600001" },
      { key: "workflowId", label: "Workflow Code", group: "Header", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Header", fhir_path: "Header.x-hcx-workflow_id", example_value: "161" }
    ]
  },
  {
    code: "D11",
    title: "Reprocess a rejected claim",
    side: "provider",
    api: "/v1/task/submit",
    callback: "/v1/task/on_submit",
    workflow: "36 (Claim arbitration requested)",
    carries_jwe: true,
    focal_resource: "Task",
    description: "Submit grievance / arbitration appeal to State Health Agency for an improperly rejected claim.",
    fields: [
      { key: "taskCode", label: "Task Code", group: "Task", data_type: "code", cardinality: "1..1", required: true, fhir_resource: "Task", fhir_path: "Task.code.coding[0].code", example_value: "reprocess" },
      { key: "taskReason", label: "Dispute Reason", group: "Task", data_type: "code", cardinality: "1..1", required: true, fhir_resource: "Task", fhir_path: "Task.reasonCode.coding[0].code", example_value: "claimrejected" },
      { key: "claimNumber", label: "Rejected Claim ID", group: "Task Input", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Task", fhir_path: "Task.input[0].valueString", example_value: "CL26AA2600001" }
    ]
  },
  {
    code: "D12",
    title: "Claim a shortfall",
    side: "provider",
    api: "/v1/task/submit",
    callback: "/v1/task/on_submit",
    workflow: "36 (Shortfall arbitration)",
    carries_jwe: true,
    focal_resource: "Task",
    description: "Claim payment balance when claim was partially approved or unjustified deductions were made.",
    fields: [
      { key: "taskCode", label: "Task Code", group: "Task", data_type: "code", cardinality: "1..1", required: true, fhir_resource: "Task", fhir_path: "Task.code.coding[0].code", example_value: "reprocess" },
      { key: "taskReason", label: "Reason Code", group: "Task", data_type: "code", cardinality: "1..1", required: true, fhir_resource: "Task", fhir_path: "Task.reasonCode.coding[0].code", example_value: "partialpayment" },
      { key: "claimNumber", label: "Partially Paid Claim ID", group: "Task Input", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Task", fhir_path: "Task.input[0].valueString", example_value: "CL26AA2600001" }
    ]
  },
  {
    code: "D13",
    title: "Acknowledge the payment notice",
    side: "provider",
    api: "/v1/paymentnotice/on_request",
    callback: "/v1/paymentnotice/request",
    workflow: "17 (Payment notice acknowledged)",
    carries_jwe: true,
    focal_resource: "PaymentReconciliation / Task",
    description: "Acknowledge PMJAY SHA bank settlement remittance advice.",
    fields: [
      { key: "settlementNumber", label: "Settlement Advice Number", group: "Payment", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "PaymentReconciliation", fhir_path: "PaymentReconciliation.identifier[0].value", example_value: "SETTLE-PMJAY-001" },
      { key: "workflowId", label: "Workflow Code", group: "Header", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Header", fhir_path: "Header.x-hcx-workflow_id", example_value: "17" }
    ]
  },

  // --- E SERIES (PATIENT APPLICATION) ---
  {
    code: "E1",
    title: "Subscribe to notifications",
    side: "patient",
    api: "/v1/notification/subscribe",
    callback: "/v1/notification/on_subscribe",
    workflow: "N01, N02, N03, N04",
    carries_jwe: false,
    focal_resource: "Subscription (JSON)",
    description: "Personal health record app subscribes to receive push notifications on claim events for an ABHA ID.",
    fields: [
      { key: "abhaNumber", label: "Beneficiary ABHA", group: "Subscription", data_type: "string", cardinality: "1..1", required: true, fhir_resource: "Patient", fhir_path: "Patient.identifier[type=ABHA].value", example_value: "91234567890123" },
      { key: "topic", label: "Subscription Topic", group: "Subscription", data_type: "string", cardinality: "1..*", required: true, fhir_resource: "Subscription", fhir_path: "Subscription.criteria", example_value: "workflow_events" },
      { key: "endpointUrl", label: "Push Notification URL", group: "Subscription", data_type: "url", cardinality: "1..1", required: true, fhir_resource: "Subscription", fhir_path: "Subscription.channel.endpoint", example_value: "https://phrapp.example.org/webhook/claims" }
    ]
  }
];

// The NRCeS profile of every resource type a mapping can name. Each mapping file
// lists the profiles of the resources it maps, so a field can be read against
// its published definition at https://nrces.in/ndhm/fhir/r4/StructureDefinition-<Type>.html
const NRCES_SD = "https://nrces.in/ndhm/fhir/r4/StructureDefinition/";
const NRCES_TYPES = [
  "Claim", "ClaimResponse", "Communication", "CommunicationRequest", "Coverage",
  "CoverageEligibilityRequest", "CoverageEligibilityResponse", "InsurancePlan",
  "Organization", "Patient", "PaymentNotice", "PaymentReconciliation", "Practitioner",
  "PractitionerRole", "Procedure", "Task"
];
const baseType = (s) => String(s || "").match(/^[A-Z][A-Za-z]+/)?.[0];
function withProfiles(uc) {
  const focalTypes = String(uc.focal_resource || "").split(" / ").map(baseType).filter((x) => NRCES_TYPES.includes(x));
  const types = [...new Set([...focalTypes, ...(uc.fields || []).map((fl) => baseType(fl.fhir_resource))])].filter((x) => NRCES_TYPES.includes(x));
  const profiles = Object.fromEntries(types.map((x) => [x, `${NRCES_SD}${x}`]));
  const { description, fields, ...head } = uc;
  return {
    focalProfile: focalTypes[0] ? `${NRCES_SD}${focalTypes[0]}` : null,
    obj: {
      ...head,
      ...(focalTypes[0] ? { nrces_profile: `${NRCES_SD}${focalTypes[0]}` } : {}),
      ...(types.length ? { profiles } : {}),
      description,
      fields,
    },
  };
}

function emitYaml(obj, indent = 0) {
  const pad = " ".repeat(indent);
  if (Array.isArray(obj)) {
    if (obj.length === 0) return " []";
    return "\n" + obj.map(item => {
      if (typeof item === "object" && item !== null) {
        const lines = emitYaml(item, indent + 2).trimStart();
        return `${pad}- ${lines}`;
      }
      return `${pad}- ${JSON.stringify(item)}`;
    }).join("\n");
  }
  if (typeof obj === "object" && obj !== null) {
    const lines = [];
    for (const [k, v] of Object.entries(obj)) {
      if (v === undefined) continue;
      if (v === null) {
        lines.push(`${pad}${k}: null`);
      } else if (typeof v === "object") {
        const sub = emitYaml(v, indent + 2);
        lines.push(`${pad}${k}:${sub}`);
      } else {
        lines.push(`${pad}${k}: ${JSON.stringify(v)}`);
      }
    }
    return indent === 0 ? lines.join("\n") + "\n" : "\n" + lines.join("\n");
  }
  return ` ${JSON.stringify(obj)}`;
}

let count = 0;
for (const uc of useCaseDefinitions) {
  const filePath = join(MAPPINGS_DIR, `${uc.code}.yaml`);
  const { focalProfile, obj } = withProfiles(uc);
  const yamlContent = `# ==============================================================================
# Use Case ${uc.code}: ${uc.title} - Data Element Definition & FHIR Mapping
# Side / Role: ${uc.side.toUpperCase()}
# Primary API: ${uc.api}
# Callback API: ${uc.callback || "None"}
# Carries JWE: ${uc.carries_jwe}
# Focal Resource: ${uc.focal_resource}
# NRCeS Profile: ${focalProfile || "none, not a FHIR resource"}
# ==============================================================================

${emitYaml(obj).trim()}
`;
  writeFileSync(filePath, yamlContent, "utf8");
  count++;
}

console.log(`[generate-all-mappings] Generated ${count} mapping files in ${MAPPINGS_DIR}/`);

// Update package/mappings/index.yaml
const indexObj = {
  total_use_cases: useCaseDefinitions.length,
  families: {
    A_shared: useCaseDefinitions.filter(u => u.code.startsWith("A")).map(u => ({ code: u.code, title: u.title, file: `${u.code}.yaml` })),
    B_provider: useCaseDefinitions.filter(u => u.code.startsWith("B")).map(u => ({ code: u.code, title: u.title, file: `${u.code}.yaml` })),
    C_payer: useCaseDefinitions.filter(u => u.code.startsWith("C")).map(u => ({ code: u.code, title: u.title, file: `${u.code}.yaml` })),
    D_pmjay: useCaseDefinitions.filter(u => u.code.startsWith("D")).map(u => ({ code: u.code, title: u.title, file: `${u.code}.yaml` })),
    E_patient: useCaseDefinitions.filter(u => u.code.startsWith("E")).map(u => ({ code: u.code, title: u.title, file: `${u.code}.yaml` }))
  }
};

writeFileSync(join(MAPPINGS_DIR, "index.yaml"), `# Index of all use case mapping specifications\n${emitYaml(indexObj).trim()}\n`, "utf8");
console.log(`[generate-all-mappings] Wrote ${join(MAPPINGS_DIR, "index.yaml")}`);
