# F7. QuestionnaireResponse

#### F7R. RESOURCE
`QuestionnaireResponse`, profile `https://nrces.in/ndhm/fhir/r4/StructureDefinition/QuestionnaireResponse`. Direction: sent, as entries of the pre-authorisation and claim bundles (F8).

#### F7D. DESCRIPTION
One QuestionnaireResponse per payer form (F6) answered for the leg being sent. The Claim points at each from a `supportingInfo` element (F8), and that is how the payer finds the answers.

Rules:
- Sent on the pre-authorisation (request, enhancement, query answer) and claim (request, query answer) bundles. **Not** on a predetermination.
- Which forms: those the leg requires (the rule is in [D12. claim_plan_form](../database/D12-claim-plan-form.md): with a `ready` ruling, the forms it names on the pre-authorisation and every other package and policy form on the claim; without one, each form on the leg its stage names; conditional LAMA, DAMA and Death forms only when they apply), listed by title. Only answers saved for that leg are used (D17 `claim_form_answer.stage`, where a row with no stage counts as `preauth`).
- **The scheme's consent form** (found by title in the package master: "Authentication Consent" on the pre-authorisation, "Discharge Consent" on the claim) [PAYER](../references/PAYERS.md#markers). When a biometric token is held for the stage ([A18. Biometric Authentication](../apis/A18-biometric-authentication.md)) it is left out: a token and a consent are not both sent. When the payer requires proof of presence and no token is held, it is added to the leg's forms even when nothing lists it, and the application fills each question the desk left blank, in this order: the payer's `initial` answer (F6); the first option; `yes` for a `boolean`. An unanswered question the payer requires is refused PAYR-1271 [PAYER](../references/PAYERS.md#markers). An `attachment` question cannot be filled this way: under PMJAY the Authentication Consent is questionnaire `100024` with items `100093` "Medical Superintendent Declaration Form (During Admission)" (`attachment`) and `100095` "Remarks" (`string`), and the Discharge Consent is questionnaire `100466` with item `135477` "Medical Superintendent Declaration Form (During Discharge)" (`attachment`); the desk uploads the signed declaration on the leg's forms card (S9, S11). PMJAY's ruling lists `100024` at pre-authorisation and nothing lists `100466` at the claim; without it the claim is refused PAYR-1363. The knowledge package's `fhir/D4/D4-request.json` and `fhir/D9/D9-request.json` show the answered forms.
- Every other form is sent with the desk's saved answers only; nothing is filled in for it.
- A question with no answer is left out. A form with no answered question is left out entirely: a blank response is a different statement to the payer than no response.
- Entries are numbered from 1 in the order written: `fullUrl` `https://nhcx.abdm.gov.in/questionnaireresponse/<n>`, `id` `"<n>"`.
- `questionnaire` is the payer's own form url (F6 `url`). The Questionnaire itself is not sent.
- The answer's value type follows the question's `type` in the stored form:

| Question `type` | Answer sent | From the stored answer |
|---|---|---|
| `attachment` | `valueAttachment {contentType, title, data}` | the answer holds a D28 `claim_document.id`; its `content_type`, `label` (else `filename`) and base64 of `data`. If no such document, `valueString` of the stored text |
| `dateTime`, `date`, `instant` | `valueDateTime` | the stored value as an instant with `+05:30`, else as stored |
| `time` | `valueTime` | as stored |
| `boolean` | `valueBoolean` | true for `yes`, `true` or `1` (any case) |
| `integer` | `valueInteger` | a whole number, else `valueString` |
| `decimal`, `quantity` | `valueDecimal` | a number, else `valueString` |
| anything else (`choice`, `string`, `text`, ...) | `valueString` | as stored (for a choice, the option label) |

- A file given as the answer to an attachment question rides only inside the QuestionnaireResponse. It is not repeated as a document on the Claim's `supportingInfo`.

The Claim's pointer (F8 `supportingInfo`), one per QuestionnaireResponse, after all other supporting information:

| Form kind (F6) | `category` (`ndhm-supportinginfo-category`) | `code` (`ndhm-supportinginfo-code`) |
|---|---|---|
| `stgquestionnaire` | `STG` "Standard Treatment Guidelines" | `STG` "Standard Treatment Guidelines" |
| any other | `INF` "Information" | `ODN` "Other document" |

with `valueReference {reference: <the QuestionnaireResponse fullUrl>, display: <form title, else "Questionnaire">}`.

#### F7F. FIELDS

| Element | Value or source | Card / notes |
|---|---|---|
| `resourceType` | `QuestionnaireResponse` | |
| `id` | `"<n>"`, the entry's serial in the bundle | 1..1 |
| `meta.profile[0]` | `https://nrces.in/ndhm/fhir/r4/StructureDefinition/QuestionnaireResponse` | |
| `questionnaire` | D12 `claim_plan_form.url` | 1..1 |
| `status` | `completed` | |
| `subject.reference` | `https://nhcx.abdm.gov.in/patient` (F15) | |
| `authored` | the Claim's `created` (now, `+05:30`) | |
| `item[]` | one per answered question, in the form's question order (D12 `items`) | 1..* |
| `item[].linkId` | D17 `claim_form_answer.link_id` (= D12 `items[].linkId`) | |
| `item[].answer[0]` | value from D17 `claim_form_answer.answer`, typed as in the table above | exactly one answer |
| `item[].text` | D12 `items[].text` (the question, prefix first) | left out when empty |

Pointer on the Claim (F8):

| Element | Value | Notes |
|---|---|---|
| `supportingInfo[].category` | `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-category` `INF` "Information" or `STG` "Standard Treatment Guidelines" | |
| `supportingInfo[].code` | `https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-supportinginfo-code` `ODN` "Other document" or `STG` "Standard Treatment Guidelines" | |
| `supportingInfo[].valueReference.reference` | `https://nhcx.abdm.gov.in/questionnaireresponse/<n>` | |
| `supportingInfo[].valueReference.display` | D12 `claim_plan_form.title`, else `Questionnaire` | |

#### F7U. USED BY
- APIs: [A18. Biometric Authentication](../apis/A18-biometric-authentication.md)
- Database: [D12. claim_plan_form](../database/D12-claim-plan-form.md)
- Tests: [T19. PMJAY Beneficiary Verification and ABHA](../tests/T19-pmjay-biometric-and-abha.md)
