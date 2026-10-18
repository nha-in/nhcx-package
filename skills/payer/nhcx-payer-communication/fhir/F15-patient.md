# F15. Patient

#### F15R. RESOURCE
`Patient`. **Received** in every hospital bundle that names a person: the eligibility request (F2. CoverageEligibilityRequest (in nhcx-payer-coverage)), the Claim bundles (F8. Claim (in nhcx-payer-preauth)), and read the same way in both. **Sent** in every answer this payer gives about a person: the eligibility answer (F3. CoverageEligibilityResponse (in nhcx-payer-coverage)), the verdicts ([F9. ClaimResponse](F9-claimresponse.md)), the Task answers (F10. Task (claim actions and answers) (in nhcx-payer-coverage)), the query ([F11. CommunicationRequest](F11-communicationrequest.md)), the payment notice and reconciliation (F13. PaymentNotice (in nhcx-payer-payment), F14. PaymentReconciliation (in nhcx-payer-payment)). No profile is checked on the way in; on the way out every Patient is tagged `SUBSETTED` and carries no profile, as the scheme's does [PAYER](../references/PAYERS.md#markers).

#### F15D. DESCRIPTION
**Received.** The hospital's Patient is read for handles, never for facts. Identifiers are classified by their type coding first, then by their system when the type says nothing, because both conventions are in live use: `ABHA` or `JHN` (or an untyped identifier on a `healthid.` system) is the ABHA number, kept only when its digits make a whole 14-digit number, anything shorter being somebody's local id wearing the wrong type code; `MO` (or a `/mobile` system) is the mobile, digits only, at least 10; `MB` or `PI` is the member id, and when neither is present the first identifier whose type is none of `ABHA`, `JHN`, `MO` or `ADN` is the member id, whatever scheme-specific type it carries or none; no scheme's identifier type is named in the reader. The name (text, else given and family joined) is kept for the no-cover answer and as a fallback on the case; the first phone `telecom` is the mobile when no identifier gave one. On a Claim, `gender` (title-cased) and `birthDate` are read too. Nothing else is: not `address`, not `photo`, not `deceased`.

The person on a case is this payer's member (D5. member (in nhcx-payer-coverage)) found by those handles, not the name the hospital typed: the case's `patient_name` and `patient_gender` come from the member and fall back to the Claim's Patient, and the age is the member's age on the admission date.

**Sent, eligibility answer.** The member as this payer knows them, at `<base>/v1/coverageeligibility/on_check/patient/<member id>`: identified by the member id typed `MB` on this payer's member system, and by the ABHA typed `ABHA` when they have one; named, dated, gendered, reachable by phone, `deceasedBoolean` false, and with a **photo**. A payer on the exchange returns the beneficiary's photograph here and a hospital shows it when the desk chooses the patient; this payer holds no photographs, so each member gets one of a fixed set of N images (the reference ships nine 160px JPEG faces [REF](../references/PAYERS.md#markers)), chosen by a hash of the member id (upper-cased and trimmed; the reference uses FNV-1a 32-bit modulo N [REF](../references/PAYERS.md#markers)), so one member always gets the same face on every answer and every deployment. `photo[0]` is `contentType` `image/jpeg`, `title` "Beneficiary photograph", and `data` the image bytes **base64-encoded once**, as `Attachment.data` is defined; never twice, as the PMJAY gateway sends it [PAYER](../references/PAYERS.md#markers). An empty member id gets no photo. On a no-cover answer the Patient echoes the hospital's own name and handles back, because there is no member to describe.

**Sent, on a case.** The Patient beside a verdict carries the name, gender and date of birth; the one beside a Task answer carries the identifier alone, as the scheme's does. Its `id` and anchor are the member id (else the enrolment's member, else the case id), under the message's own base (`<base>/v1/preauth/on_submit/patient/<member id>` and so on). The name is the member's, else the case's snapshot; the date of birth is the member's and is left out when the member could not be read.

#### F15F. FIELDS

Received:

| Element read | Stored in | Notes |
|---|---|---|
| `identifier[]` typed `ABHA`, `JHN`, or on a `healthid.` system | handle `abha_no` (14 digits) | |
| `identifier[]` typed `MO`, or on a `/mobile` system | handle `mobile` | |
| `identifier[]` typed `MB` or `PI`, else the first not typed `ABHA`, `JHN`, `MO` or `ADN` | handle `member_id` | |
| `name[0].text`, else `given[]` joined with `family` | `patient_name`; [D19. case](../database/D19-case.md) `patient_name` fallback; echoed on a no-cover F3. CoverageEligibilityResponse (in nhcx-payer-coverage) | |
| `telecom[]` system `phone` (or none) `.value` | handle `mobile` | when no identifier gave one |
| `gender` | [D19. case](../database/D19-case.md) `patient_gender` fallback | title-cased |
| `birthDate` | nothing on the case: the age comes from D5. member (in nhcx-payer-coverage) `dob` | |

Sent:

| Element written | From | Notes |
|---|---|---|
| `id` | the member id (D5. member (in nhcx-payer-coverage) `id`), else the enrolment's member (D6. subscription (in nhcx-payer-coverage) `member_id`), else the case id | same as the anchor's last segment |
| `meta.versionId`, `meta.lastUpdated`, `meta.tag` | `1`, now, `SUBSETTED` | |
| `identifier[0]` | type `MB` "Member Number" on `http://terminology.hl7.org/CodeSystem/v2-0203`, system this payer's member system (`<base>/member`), value the member id | always |
| `identifier[1]` | type `ABHA` "Ayushman Bharat Health Account (ABHA) ID" on `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-identifier-type-code`, system `https://healthid.abdm.gov.in`, value D5. member (in nhcx-payer-coverage) `abha_no` formatted | eligibility answer only, when the member has one |
| `name[0]` | D5. member (in nhcx-payer-coverage) `name` (given and family split on the first space), else [D19. case](../database/D19-case.md) `patient_name` | verdicts and the eligibility answer; left off a Task answer |
| `gender` | D5. member (in nhcx-payer-coverage) `gender` lower-cased, else [D19. case](../database/D19-case.md) `patient_gender` | as above |
| `birthDate` | D5. member (in nhcx-payer-coverage) `dob` | left out when unknown |
| `telecom[0]` | phone, D5. member (in nhcx-payer-coverage) `mobile` | eligibility answer only |
| `deceasedBoolean` | `false` | eligibility answer only |
| `photo[0]` | one of N fixed images picked by a hash of the member id; `contentType` `image/jpeg`, `data` base64 once, `title` "Beneficiary photograph" | eligibility answer only; none for an empty member id |
| no-cover answer: `name`, `identifier[]` | the hospital's own name, member id, ABHA and mobile echoed | nothing invented |

#### F15U. USED BY
- APIs: [A5. Query Request](../apis/A5-query-request.md)
- FHIR: [F1. Bundle](F1-bundle.md), [F9. ClaimResponse](F9-claimresponse.md), [F11. CommunicationRequest](F11-communicationrequest.md), [F18. Coverage](F18-coverage.md)
