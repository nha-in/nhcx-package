# Error codes

Every error code NHCX and the reference payer can send, in one place. The
workflow codes are in the Overview's Workflow Codes chapter and the FHIR value
sets in Codes and Value Sets; this chapter is only about failure.

Three hundred and nine distinct codes exist across the seven sheets of the
Standard Error Codes workbook, last updated 11 August 2026. They are not one
list. They are three, and the first thing to get right is which one you are
reading.

## The code spaces

<!-- build-docs:errors spaces -->
| Space | Prefix | Count | Who sends it | Where it arrives |
| :---- | :---- | :---- | :---- | :---- |
| Gateway | `NHCX-` | 19 | The exchange | Synchronously on your own call, or on `/v1/error` |
| Standard payer | `PAYR-1001 to PAYR-1020` | 20 | A payer implementing the published standard | Inside the sealed response |
| Reference payer | `PAYR-1001 to PAYR-1520` | 290 | The PMJAY reference implementation | Inside the sealed response |
| Observed live | `ERR-PYR-` | 1 | The PMJAY reference implementation, on none of its published sheets | Inside the sealed response |
<!-- build-docs:end -->

The fourth row is not a sheet. It is the one code the reference payer sent on
the sandbox run that none of the seven sheets lists; What the live payer sent
that the sheets do not say, below, covers it.

**The two `PAYR-` spaces collide.** All twenty codes in the `PAYR-1001` to
`PAYR-1020` range are on both the standard sheet and the reference payer's
Bridge Error sheet, and eighteen of them carry a different meaning on each. The
two that agree are `PAYR-1001` and `PAYR-1002`, a decryption and an encryption
failure on both sheets in different words. The reference payer's own sheet
marks three of its readings, `PAYR-1003`, `PAYR-1006` and `PAYR-1007`, as
deprecated.

<!-- build-docs:errors collisions -->
| Code | Standard sheet says | Reference payer says |
| :---- | :---- | :---- |
| `PAYR-1003` | Error while connecting to NHCX; the system will resend later | Invalid workflow requested (marked deprecated on the Bridge Error sheet) |
| `PAYR-1004` | Provider is not registered with the payer for the requested policy | Received FHIR bundle is malformed |
| `PAYR-1005` | Beneficiary is not a covered member for the requested policy | Maximum time limit exceeded in receiving the request |
| `PAYR-1006` | Policy does not exist | Invalid name in request (marked deprecated on the Bridge Error sheet) |
| `PAYR-1007` | Requested policy is expired | Invalid gender in request (marked deprecated on the Bridge Error sheet) |
| `PAYR-1008` | Eligible coverage amount is insufficient | Invalid FHIR bundle received |
| `PAYR-1009` | Requested items are not valid or not covered | No identifier found for patient component |
| `PAYR-1010` | Preauthorisation is required but was not obtained | No type found for patient component identifier |
| `PAYR-1011` | The prior approved package does not support enhancement | No identifier found for claim component |
| `PAYR-1012` | Claim amount is more than the preauthorisation approved amount | No type found for claim component identifier |
| `PAYR-1013` | No prior approval for the requested procedures or packages | No identifier found for organization component for provider |
| `PAYR-1014` | Date of birth is after the date of service | No type found for organization component identifier for provider |
| `PAYR-1015` | Date of service is after the date of death | No identifier found for organization component for payer |
| `PAYR-1016` | Duplicate claim submitted based on service codes and dates | No type found for organization component identifier for payer |
| `PAYR-1017` | Amount calculations are not correct | No task code received |
| `PAYR-1018` | Time limit for submission expired | No task reason code received |
| `PAYR-1019` | Requested additional information was not received in time | Invalid sequence received in supporting info element |
| `PAYR-1020` | No valid bank details found for the provider | Invalid category received in supporting info element |
<!-- build-docs:end -->

A system that maps its error handling from the standard sheet and then meets
the reference payer will mis-read eighteen codes in that band, and for most of
them the two readings point at opposite remedies: a business refusal the desk
must act on, against a structural fault only an engineer can fix. The live
sandbox run recorded in PMJAY Sandbox Run met the reference payer's readings
throughout.

Decide which payer you are talking to before you look a code up. If you
support both, key your table on the pair of payer and code, never on the code
alone.

## Reading a code by its band

The reference payer's codes are banded by the stage that rejected the message,
and the band is more useful than the code when you are triaging.

<!-- build-docs:errors bands -->
| Band | Codes | What rejected it | What it means for you |
| :---- | :---- | :---- | :---- |
| `NHCX-1xxx` | 19 | The exchange, on the envelope | The message never reached the payer |
| `PAYR-10xx` | 98 | Transport and bundle structure | An element, id, sequence or type is missing. Not a value problem |
| `PAYR-11xx` | 23 | Coverage eligibility | The policy, the beneficiary or the hospital configuration |
| `PAYR-12xx` | 73 | Preauthorisation | Codes, amounts, dates, sequencing and scheme rules |
| `PAYR-13xx` | 70 | Claim | The same, against the approved preauthorisation |
| `PAYR-14xx` | 26 | Insurance plan, and the scheme's outer rules | Empanelment, policy association, plan configuration |
<!-- build-docs:end -->

Two consequences follow, both confirmed live.

**The bands are applied in order.** The bundle is validated before the scheme's
rules are applied, so a `PAYR-12xx` or `PAYR-13xx` refusal is the first sign
that the bundle itself is structurally sound. Reaching `PAYR-1238` is progress.

**The `PAYR-10xx` band is structural, not semantic.** When you meet one, check
ids, sequences and types before you go looking at values. `PAYR-1027`, "invalid
item id", is not about the package code at all; it means the `Claim.item` has
no FHIR element `id`.

## Gateway codes
<!-- build-docs:errors gateway -->
| Code | Message |
| :---- | :---- |
| `NHCX-401` | User Unauthorized |
| `NHCX-1001` | Receiver system is not reachable. |
| `NHCX-1002` | Sender not registered in NHCX. Please register in NHCX portal and try again. |
| `NHCX-1003` | Receiver not registered in NHCX. Please try again with valid receiver details. |
| `NHCX-1004` | No receiver registered in NHCX for the requested scheme. Please try again with valid receiver details for the scheme. |
| `NHCX-1005` | Invalid request header. Please try again with valid headers. |
| `NHCX-1006` | Duplicate request. Request with same correlation id already exist in the system. |
| `NHCX-1007` | Something went wrong while processing the request. Please check the request structure and values and try again. |
| `NHCX-1008` | Something went wrong while processing the request. Please try again after sometime. |
| `NHCX-1009` | Something went wrong while processing the request. Please check log for more details. |
| `NHCX-1010` | No Data with given Correlation id for call back request, please check status for more details |
| `NHCX-1011` | Invalid Status, please check x-hcx-status value from the protected header |
| `NHCX-1012` | No records found with the requested api caller id. Please try again with a valid api caller id. |
| `NHCX-1013` | Invalid or blank request found. |
| `NHCX-1014` | Unable to send protocol response to sender. |
| `NHCX-1015` | Invalid response received from receiver. |
| `NHCX-1016` | Invalid Api Action, please check the request action for this correlationId before trying again |
| `NHCX-1017` | Invalid response received from receiver |
| `NHCX-1018` | Invalid ABHA number received. ABHA number should be sent in the format XX-XXXX-XXXX-XXXX |
<!-- build-docs:end -->

`NHCX-1010` is the one to understand before you build a payer. The exchange
redelivers a submission you have not answered, drops it after a few attempts
and retires the correlation ID, so a verdict decided minutes later has nowhere
to land. Acknowledge every submission at once with an interim response and send
the decision later on the same thread.

`NHCX-1006`, duplicate correlation ID, is what a retry earns if you reuse a
correlation ID after a failure. Mint a fresh one.

## Standard payer codes

The twenty codes a payer implementing the published standard sends. These are
business refusals and belong on the claims desk, shown in the payer's own
words.
<!-- build-docs:errors standard -->
| Code | Message |
| :---- | :---- |
| `PAYR-1001` | Error while decrypting request. Please reprocess the request encrypting with valid certificate of the payer. |
| `PAYR-1002` | Error while encrypting request. Please update encryption certificate in NHCX. |
| `PAYR-1003` | Error while connecting to NHCX. System will try to resend the message to NHCX after some time. |
| `PAYR-1004` | Provider is not registered with the payer for requested policy. |
| `PAYR-1005` | Beneficiary is not a covered member for requested policy. Please enroll beneficiary for the policy and try again. |
| `PAYR-1006` | Policy does not exist. Please try with a valid policy. |
| `PAYR-1007` | Requested policy is expired. Please try with a valid policy. |
| `PAYR-1008` | Eligible coverage amount of the beneficiary for the requested policy is insufficient to process the request. |
| `PAYR-1009` | Requested items are not valid or not covered. Please try again with valid or covered items. |
| `PAYR-1010` | Preauthorization is required to process the request but was not obtained. |
| `PAYR-1011` | Enhancement request can not be processed as the prior approved package/procedure does not support enhancement. |
| `PAYR-1012` | Claim amount requested is more than the preauthorization approved amount. |
| `PAYR-1013` | No prior approval for the requested procedures/packages obtained. |
| `PAYR-1014` | Date of birth of the beneficiary can not be after date of service. |
| `PAYR-1015` | Date of service cannot be after date of death. |
| `PAYR-1016` | Duplicate claim submitted based on service codes and dates. |
| `PAYR-1017` | Amount calculations are not correct. Please verify calculated amount. |
| `PAYR-1018` | Time limit for submission expired. |
| `PAYR-1019` | Requested additional information was not received or was not received within time limit |
| `PAYR-1020` | Unable to process payment as no valid bank details found for the provider. |
<!-- build-docs:end -->

## Reference payer: structure and transport, `PAYR-10xx`

Ninety-eight codes. Almost all of them say that an element the payer addresses
by id, sequence or type is missing its handle. None of them is a code lookup.
<!-- build-docs:errors reference:10 -->
| Code | Message |
| :---- | :---- |
| `PAYR-1001` | Error occurred while decrypting payload for receiver code <receiver_code> with correlation id <sender_correlation_id>. |
| `PAYR-1002` | Error occurred while encrypting payload for receiver code <receiver_code> with correlation id <sender_correlation_id>. |
| `PAYR-1003` | Invalid workflow requested. Hence request will not be processed further. |
| `PAYR-1004` | Received FHIR bundle is malformed. Please correct the bundle and try again. <Error details> |
| `PAYR-1005` | Maximum time limit exceeded in receiving the request. Please try again. |
| `PAYR-1006` | Invalid name in request. Hence request will not be processed further. |
| `PAYR-1007` | Invalid gender in request. Hence request will not be processed further. |
| `PAYR-1008` | Invalid FHIR bundle received. Hence request will not be processed further. |
| `PAYR-1009` | No identifier found for patient component. Hence request will not be processed further. https://www.nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html |
| `PAYR-1010` | No type found for patient component identifier. Hence request will not be processed further. https://www.nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html |
| `PAYR-1011` | No identifier found for claim component. Hence request will not be processed further. |
| `PAYR-1012` | No type found for claim component identifier. Hence request will not be processed further. |
| `PAYR-1013` | No identifier found for organization component for provider. Hence request will not be processed further. |
| `PAYR-1014` | No type found for organization component identifier for provider. Hence request will not be processed further. |
| `PAYR-1015` | No identifier found for organization component for payer. Hence request will not be processed further. |
| `PAYR-1016` | No type found for organization component identifier for payer. Hence request will not be processed further. |
| `PAYR-1017` | No task code received. Hence request will not be processed further. |
| `PAYR-1018` | No task reason code received. Hence request will not be processed further. |
| `PAYR-1019` | Invalid sequence received in supporting info element. Hence request will not be processed further. |
| `PAYR-1020` | Invalid category received in supporting info element for sequence %s. Hence request will not be processed further. |
| `PAYR-1021` | Invalid code received in supporting info element for sequence %s. Hence request will not be processed further. |
| `PAYR-1023` | Invalid procedure category received for procedure component. Hence request will not be processed further. |
| `PAYR-1024` | Invalid procedure status received for procedure component. Hence request will not be processed further. |
| `PAYR-1025` | Invalid procedure sequence received for procedure component. Hence request will not be processed further. |
| `PAYR-1026` | No procedure component found for reference in claim component. Hence request will not be processed further. |
| `PAYR-1027` | Invalid item id found for item in claim component. Hence request will not be processed further. |
| `PAYR-1028` | Invalid item sequence received for item in claim component. Hence request will not be processed further. |
| `PAYR-1029` | Invalid bundle id received for FHIR bundle. Hence request will not be processed further. |
| `PAYR-1030` | Invalid questionnaire id received in FHIR bundle for questionnaire component. Hence request will not be processed further. |
| `PAYR-1031` | Invalid url received for bundle entry in FHIR bundle. Hence request will not be processed further. Please reach out to technical team. |
| `PAYR-1032` | Invalid purpose received for coverage eligibility request. Hence request will not be processed further. Please try again with valid purpose details. |
| `PAYR-1033` | No items received for coverage eligibility purpose. Since items are mandatory for the requested purpose, hence request will not be processed further. Please try again with valid item details. |
| `PAYR-1034` | Invalid procedure code received. Please try again with valid procedure details. |
| `PAYR-1035` | Invalid policy code received. Please try again with valid policy details. |
| `PAYR-1036` | Invalid attachment received in supporting info with sequence number %s. Please try again with valid attachment details as attachment value is expected. If issue is not resolved, please reach out to technical team. |
| `PAYR-1037` | No identifier found for communication component. Hence request will not be processed further. |
| `PAYR-1038` | No type found for communication component identifier. Hence request will not be processed further. |
| `PAYR-1039` | No payload found for communication component. Hence request will not be processed further. |
| `PAYR-1040` | No component found for given reference. Hence request will not be processed further. |
| `PAYR-1041` | No identifier found for procedure component. Hence request will not be processed further. |
| `PAYR-1042` | No type found for procedure component identifier. Hence request will not be processed further. |
| `PAYR-1043` | Date received in the request does not adhere to the NRCES date datatype format. Hence request will not be processed further. Please refere to the date format in NRCES portal. |
| `PAYR-1044` | Date and time received in the request does not adhere to the NRCES date datatype format. Hence request will not be processed further. Please refere to the date time format in NRCES portal. |
| `PAYR-1045` | Invalid quantity received for item. Hence request will not be processed further. |
| `PAYR-1046` | No value or timing details received for supporting info for sequence %s. Hence request will not be processed further. Please reach out to technical team. |
| `PAYR-1047` | Invalid reference received in supporting info with sequence number %s. Please try again with valid resource as reference value. |
| `PAYR-1048` | No reference resource received for supporting info with sequence number %s. Please try again with valid resource for reference value. |
| `PAYR-1049` | Invalid FHIR bundle received. Hence request will not be processed further. please reach out to technical team. |
| `PAYR-1050` | No type found for practitioner component identifier. Hence request will not be processed further. |
| `PAYR-1051` | No section found for composition component. Hence request will not be processed further. |
| `PAYR-1052` | No references found in composition section. Hence request will not be processed further. |
| `PAYR-1053` | Invalid reference found in child sections of composition section. Hence request will not be processed further. |
| `PAYR-1054` | No section content found for composition component. Hence request will not be processed further. |
| `PAYR-1055` | Invalid subject type found for composition component. This should be of type Patient. Hence request will not be processed further. Please try again with valid subject type for the composition. |
| `PAYR-1056` | Invalid contact organization found for subject in composition component. This should be of type Organization. Hence request will not be processed further. Please try again with valid data. |
| `PAYR-1057` | Invalid general practioner type found for subject in composition component. This should be of type Organization/Practitioner/PractitionerRole. Hence request will not be processed further. Please refer to https://www.nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html |
| `PAYR-1058` | Invalid managing organization type found for subject in composition component. This should be of type Organization. Hence request will not be processed further. Please refer to https://www.nrces.in/ndhm/fhir/r4/StructureDefinition-Patient.html |
| `PAYR-1059` | Invalid encounter type found for composition/observation component. This should be of type Encounter. Hence request will not be processed further. Please refer to https://www.nrces.in/ndhm/fhir/r4/StructureDefinition-DiagnosticReportRecord.html |
| `PAYR-1060` | No subject found for encounter in composition component. Hence request will not be processed further. Please refer to https://www.nrces.in/ndhm/fhir/r4/StructureDefinition-Encounter.html |
| `PAYR-1061` | Invalid subject type found for encounter in composition/observation component. Hence request will not be processed further. Please refer to https://www.nrces.in/ndhm/fhir/r4/StructureDefinition-Encounter.html |
| `PAYR-1062` | No episode of care found for encounter in composition/observation component. Hence request will not be processed further. Please refer to https://www.nrces.in/ndhm/fhir/r4/StructureDefinition-Encounter.html |
| `PAYR-1063` | Invalid episode of care type found for encounter in composition/observation component. Hence request will not be processed further. Please refer to https://www.nrces.in/ndhm/fhir/r4/StructureDefinition-Encounter.html |
| `PAYR-1064` | No based on found for encounter in composition/observation component. Hence request will not be processed further. Please refer to https://www.nrces.in/ndhm/fhir/r4/StructureDefinition-Encounter.html |
| `PAYR-1065` | Invalid based on type found for encounter in composition/observation component. Hence request will not be processed further. Please refer to https://www.nrces.in/ndhm/fhir/r4/StructureDefinition-Encounter.html |
| `PAYR-1066` | No appointment found for encounter in composition/observation component. Hence request will not be processed further. Please refer to https://www.nrces.in/ndhm/fhir/r4/StructureDefinition-Encounter.html |
| `PAYR-1067` | Invalid appointment type found for encounter in composition/observation component. Hence request will not be processed further. Please refer to https://www.nrces.in/ndhm/fhir/r4/StructureDefinition-Encounter.html |
| `PAYR-1068` | No reason reference found for encounter in composition/observation component. Hence request will not be processed further. Please refer to https://www.nrces.in/ndhm/fhir/r4/StructureDefinition-Encounter.html |
| `PAYR-1069` | Invalid reason reference type found for encounter in composition/observation component. Hence request will not be processed further. Please refer to https://www.nrces.in/ndhm/fhir/r4/StructureDefinition-Encounter.html |
| `PAYR-1070` | No author found for composition component. Hence request will not be processed further. |
| `PAYR-1071` | Invalid author type found for composition component. This should be of type Practitioner / PractitionerRole / Organization / Patient / Device / RelatedPerson. Hence request will not be processed further. Please try again with valid author type for the composition. |
| `PAYR-1072` | No procedure reference received for procedure element in claim resource. Hence request will not be processed further. |
| `PAYR-1073` | No based on found for observation component. Hence request will not be processed further. Please refer to https://www.nrces.in/ndhm/fhir/r4/StructureDefinition-Observation.html |
| `PAYR-1074` | Invalid based on type found for observation component. Hence request will not be processed further. Please refer to https://www.nrces.in/ndhm/fhir/r4/StructureDefinition-Observation.html |
| `PAYR-1075` | No part of found for observation component. Hence request will not be processed further. Please refer to https://www.nrces.in/ndhm/fhir/r4/StructureDefinition-Observation.html |
| `PAYR-1076` | Invalid part of type found for observation component. Hence request will not be processed further. Please refer to https://www.nrces.in/ndhm/fhir/r4/StructureDefinition-Observation.html |
| `PAYR-1077` | No subject found for observation component. Hence request will not be processed further. |
| `PAYR-1078` | Invalid subject type found for observation component. This should be of type Patient. Hence request will not be processed further. Please try again with valid subject type for the observation. |
| `PAYR-1079` | No care team details received. Hence request will not be processed further. Please add the care team details and try again. |
| `PAYR-1080` | Invalid HPR details received for practioner resource with url %s. Hence request will not be processed further. Please try again with valid HPR id. |
| `PAYR-1081` | Invalid service date received for item with sequence %s in claim resource. Hence request will not be processed further. Please try again with valid item service date. |
| `PAYR-1082` | Invalid title received for composition for supporting info with sequence %s in claim resource. Hence request will not be processed further. Please try again with valid composition title. |
| `PAYR-1083` | No HPR details found for the practitioner for resource %s. Hence request will not be processed further. Please send the details in the identifier for Practitioner resource with category code as HPIN. |
| `PAYR-1084` | No questionnaire response resource found for url %s. Hence request will not be processed further. Please add the resources for all the references given in the FHIR bundle and try again. |
| `PAYR-1085` | Invalid questionnaire response resource type found in the FHIR bundle for url %s. Hence request will not be processed further. |
| `PAYR-1086` | No procedure resource found for url %s. Hence request will not be processed further. Please add the resources for all the references given in the FHIR bundle and try again. |
| `PAYR-1087` | Invalid procedure resource type found in the FHIR bundle for url %s. Hence request will not be processed further. Procedure resource type is expected. |
| `PAYR-1088` | Invalid composition details. |
| `PAYR-1089` | No billing items found. Hence request will not be processed further. Please try again with valid billing items. |
| `PAYR-1090` | No identifier found for coverage component. Hence request will not be processed further. |
| `PAYR-1091` | No type found for coverage component identifier. Hence request will not be processed further. |
| `PAYR-1092` | Something went wrong while processing request, kindly intiate new request |
| `PAYR-1093` | No subject found for encounter in composition component. Hence request will not be processed further. Please refer to https://www.nrces.in/ndhm/fhir/r4/StructureDefinition-Encounter.html |
| `PAYR-1094` | Invalid subject type found for encounter in composition/observation component. Hence request will not be processed further. Please refer to https://www.nrces.in/ndhm/fhir/r4/StructureDefinition-Encounter.html |
| `PAYR-1095` | Invalid discharge information received for claim request. Hence request will not be processed further. Please send the discharge information in supporting info in claim resource, with category as DIS (refer - https://www.nrces.in/ndhm/fhir/r4/ValueSet-ndhm-supportinginfo-category.html), and codes in LAMA/DAMA/DTH/DTM (refer - https://www.nrces.in/ndhm/fhir/r4/ValueSet-ndhm-supportinginfo-code.html). |
| `PAYR-1096` | Invalid death date received for claim request. Hence request will not be processed further. Please send the death date information in supporting info in claim resource, with category as ONS (refer - https://www.nrces.in/ndhm/fhir/r4/ValueSet-ndhm-supportinginfo-category.html), and code as DTM (refer - https://www.nrces.in/ndhm/fhir/r4/ValueSet-ndhm-supportinginfo-code.html). |
| `PAYR-1097` | No payload found in the request. Please ensure that the request that is being sent, contains encrypted payload within the mandatory payload properties. |
| `PAYR-1098` | Value type received as %s for category - OTH and code - EDT for item with sequence %s in supporting info in claim resource. In supporting info list, item with category - OTH and code - EDT combination is used to get the registration date. So the registration date should be sent as timing (date or period) or as a string value, adhering to the NRCES standards, with the category - OTH and code - EDT. |
| `PAYR-1099` | Value type received as %s for category - ONS and code - DSDE for item with sequence %s in supporting info in claim resource. In supporting info list, item with category - ONS and code - DSDE combination is used to get the discharge date. So the discharge date should be sent as timing (date or period) or as a string value, adhering to the NRCES standards, with the category - ONS and code - DSDE. |
<!-- build-docs:end -->

## Reference payer: coverage eligibility, `PAYR-11xx`
<!-- build-docs:errors reference:11 -->
| Code | Message |
| :---- | :---- |
| `PAYR-1101` | Invalid purpose received as (%s) for beneficiary id (%s) from hospital id (%s). Hence no result will be returned. Please try again with a valid purpose. |
| `PAYR-1102` | Invalid search parameter requested. Please try again with a valid id. |
| `PAYR-1103` | Invalid careplan id received. Please try again with valid careplan id. |
| `PAYR-1104` | Multiple records found for the beneficiary. Hence request will not be processed further. |
| `PAYR-1105` | Hospital configuration not found. Please contact support team. |
| `PAYR-1106` | No details found for the requested procedures in the system. |
| `PAYR-1107` | No billable item received. Please try again with valid item data. |
| `PAYR-1108` | No details found for the requested stratification in the system. |
| `PAYR-1109` | No details found for the requested investigations in the system. |
| `PAYR-1110` | No details found for the requested implants in the system. |
| `PAYR-1111` | Rule failure. |
| `PAYR-1112` | Invalid payer id received. Please try again ith valid payer details |
| `PAYR-1113` | Invalid item code received as %s. Please try again with valid data |
| `PAYR-1114` | Invalid speciality code received as %s for item %s. Please try again with valid data. Speciality code is available as the code of the category for specific cost of plan in isurance plan |
| `PAYR-1115` | Invalid procedure quantity received as %s for item %s. Please try again with valid data. Item quantity should be greater than 1 |
| `PAYR-1116` | Hospital is not authorized to raise any case under policy %s. Hence request will not be processed further. Please connect with the support team to get the required authorization |
| `PAYR-1117` | No policy details found for %s. Hence request will not be processed further |
| `PAYR-1118` | No details found for requested items. Hence request will not be processed further |
| `PAYR-1119` | No payer details received for payer id %s from HCX. Please try again with valid payer details. |
| `PAYR-1120` | Duplicate reference id found as %s. Please try again with valid reference details. |
| `PAYR-1121` | No policy details found for %s for beneficiary %s. Hence request will not be processed further. |
| `PAYR-1122` | No policy details found for beneficiary %s. Hence request will not be processed further. |
| `PAYR-1123` | Beneficiary is not a covered member for requested payer. Please enroll beneficiary for applicable policy of requested payer and try again. |
<!-- build-docs:end -->

`PAYR-1114` is the one PMJAY Sandbox Run cites without defining: the
specialty on `item.category` must be the code of the category the package
master files the package under, not a generic value.

## Reference payer: preauthorisation, `PAYR-12xx`
<!-- build-docs:errors reference:12 -->
| Code | Message |
| :---- | :---- |
| `PAYR-1201` | Invalid claimed amount received for case number %s. Please try again with a valid claim amount. Claimed amount should be greater than INR 0 and less than equals to balance wallet amount of the beneficiary. |
| `PAYR-1202` | Invalid speciality code received as %s for item %s for case number %s. Please try again with valid data. Speciality code is available as the code of the category for specific cost of plan in isurance plan. |
| `PAYR-1203` | Invalid speciality description received as %s for procedure %s for case number %s. Please try again with valid data. Speciality description is available as the display of the category for specific cost of plan in isurance plan. |
| `PAYR-1204` | Invalid procedure code received as %s for case number %s. Please try again with valid data. Procedure code is available as the code of the type for benefit component, of specific cost, of plan in isurance plan. |
| `PAYR-1205` | Invalid procedure description received as %s for procedure %s for case number %s. Please try again with valid data. Procedure description is available as the display of the type for benefit component, of specific cost, of plan in isurance plan. |
| `PAYR-1206` | Invalid procedure type received as %s for procedure %s for case number %s. Please try again with valid data. |
| `PAYR-1207` | Invalid procedure factor received as %s for procedure %s for case number %s. Please try again with valid data. |
| `PAYR-1208` | Invalid procedure quantity received as %s for item %s for case number %s. Please try again with valid data. Item quantity should be greater than 1. |
| `PAYR-1209` | Invalid net amount received as INR %s for item %s for case number %s. Please try again with valid data. Item net amount should be greater than INR 0. |
| `PAYR-1210` | Invalid procedure status received as %s for procedure %s for case number %s. Please try again with valid data. |
| `PAYR-1211` | Requested beneficary details and careplan details does not match any criteria for processing the case at this hospital. Please try again with valid data. |
| `PAYR-1212` | No previous preauthorization approved record found for the enhancement request for case number %s. Hence request will not be processed further. Please initiate a new preauthorization. |
| `PAYR-1213` | Existing case in progress found for case number %s. Hence enhancement request will not be accepted. Please try after the adjudication is completed for the current case. |
| `PAYR-1214` | No previous preauthorization approved record found for the resubmission request for case number %s. Hence request will not be processed further. Please initiate a new preauthorization. |
| `PAYR-1215` | Existing case in progress found for case number %s. Hence resubmission request will not be accepted. Please try after the adjudication is completed for the current case. |
| `PAYR-1216` | Existing case in progress found for case number %s. Hence new preauthorization request will not be accepted. |
| `PAYR-1217` | Previous preauthorization approved record found for the new preauthorization request for case number %s. Hence request will not be processed further. Please initiate enhancement/resubmission. |
| `PAYR-1218` | No queried preauthorization record found for the query update request for case number %s. Hence request will not be processed further. |
| `PAYR-1219` | Case number %s is not queried. Hence query updation request will not be processed further. |
| `PAYR-1220` | Invalid investigation description received as %s for investigation code %s for case number %s. Please try again with valid data. |
| `PAYR-1221` | Invalid investigation code received as %s for case number %s. Please try again with valid data. |
| `PAYR-1222` | Invalid investigation status received as %s for investigation %s for case number %s. Please try again with valid data. |
| `PAYR-1223` | Invalid investigation attachment received for investigation %s for case number %s. Please try again with valid data. |
| `PAYR-1224` | Invalid implant description received as %s for implant code %s for case number %s. Please try again with valid data. |
| `PAYR-1225` | Invalid implant code received as %s for case number %s. Please try again with valid data. |
| `PAYR-1226` | Invalid implant status received as %s for investigation %s for case number %s. Please try again with valid data. |
| `PAYR-1227` | Invalid implant attachment received for investigation %s for case number %s. Please try again with valid data. |
| `PAYR-1228` | Invalid implant quantity received as %s for implant %s for case number %s. Please try again with valid data. |
| `PAYR-1229` | Invalid implant net amount received as INR %s for implant %s for case number %s. Please try again with valid data. |
| `PAYR-1230` | Invalid implant unit price received as INR %s for implant %s for case number %s. Please try again with valid data. |
| `PAYR-1231` | Claim has already been raised for case number %s. Hence preauthorization request will not be accepted. |
| `PAYR-1232` | No investigation found for case number %s. Investigation details are mandatory for private hospitals. |
| `PAYR-1233` | Patient liability is not aplicable for the hospital and beneficiary do not have enough wallet balance with deficit amount INR %s for the requested preauthorization for case number %s. |
| `PAYR-1234` | No preauthorization record found for case number %s. Hence the request will not be processed. |
| `PAYR-1235` | Insufficient wallet balance. Hence the request will not be processed. |
| `PAYR-1236` | Invalid claim type (in-patient/out-patient) received. Hence the request will not be processed. |
| `PAYR-1237` | Beneficiary is having an active preauthorization request at %s. Hence the request will not be processed. Kindly inform %s to cancel the active preauthorization request or raise a claim to proceed with current preauthorization. |
| `PAYR-1238` | Beneficiary is having an active preauthorization request at this hospital with reference number %s. Hence the request will not be processed. Kindly cancel the active preauthorization request or raise a claim to proceed with current preauthorization. |
| `PAYR-1239` | Hospital configuration not found. Please contact support team. |
| `PAYR-1240` | No details found for the requested procedures in the system. |
| `PAYR-1241` | Invalid registration date received for case number %s. Hence the request will not be processed. |
| `PAYR-1242` | Invalid registration date format received for case number %s. Hence the request will not be processed. |
| `PAYR-1243` | Invalid admission date received for case number %s. Hence the request will not be processed. |
| `PAYR-1244` | Invalid admission date format received for case number %s. Hence the request will not be processed. |
| `PAYR-1245` | Rule failure. |
| `PAYR-1246` | Invalid payer id received as %s. Please try again with valid payer id. |
| `PAYR-1247` | Payer details for payer id %s is not received from HCX for the request. Hence the request will not be processed. |
| `PAYR-1248` | Invalid item code received as %s for item sequence %s case number %s. Please try again with valid data. |
| `PAYR-1249` | Invalid item sequence received as %s for case number %s. Please try again with valid data. |
| `PAYR-1250` | Requested policy %s is not listed. Please try again with valid policy code. |
| `PAYR-1251` | No billable treatment plan received for case number %s. Please try again with valid treatment plan data. |
| `PAYR-1252` | Case number %s is not in active preauthorization state with the current status of the case with the payer system is %s. Hence the preauthorization can not be cancelled. Only the cases with current status as preauthorization submitted or preauthorization approved can be cancelled. |
| `PAYR-1253` | Case number %s is already cancelled. Hence the preauthorization can not be cancelled again. Only the cases with current status as preauthorization submitted or preauthorization approved can be cancelled. |
| `PAYR-1254` | Response for STG Questionnaire id %s is mandatory for procedure code %s. Hence the preauthorization request will not be processed as the questionnaire response is not received for procedure code. |
| `PAYR-1255` | Case number %s is already cancelled. Hence no preauthorization request will be accepted for this case number. New preauthorization request needs to be raised with new case/reference number to proceed further. |
| `PAYR-1256` | Response for Authentication Consent Questionnaire is missing for case number %s. This must be sent if the biometric authentication for patient is not available. For new preauthorization request, either biometric authentication for patient or response for Authentication Consent questionnaire must be sent. Please check/update the insurance plan for the policy for the details of the questionnaire. Please adhere to the response of the coverage eligibility for auth-requirements purpose to check the mandatory documents to be attached with the request |
| `PAYR-1257` | Payment is initiated for case number %s. Hence the preauthorization can not be cancelled again. Only the cases with current status as preauthorization submitted or preauthorization approved can be cancelled |
| `PAYR-1258` | Payment is accomplished/cleared for case number %s. Hence the preauthorization can not be cancelled again. Only the cases with current status as preauthorization submitted or preauthorization approved can be cancelled |
| `PAYR-1259` | DOB is missing for new born for the case number (%s) with correlation id as (%s) at (%s) |
| `PAYR-1260` | DOB cannot be a future date for the case number (%s) with correlation id as (%s) at (%s) |
| `PAYR-1261` | Invalid new born details for the case number (%s) with correlation id as (%s) at (%s) |
| `PAYR-1262` | Gender is mandatory for the new born beneficiary |
| `PAYR-1263` | Documents are mandatory for the new born beneficiary |
| `PAYR-1264` | Documents are mandatory for the new born beneficiary |
| `PAYR-1265` | Documents are mandatory for the new born beneficiary |
| `PAYR-1266` | Documents are mandatory for the new born beneficiary |
| `PAYR-1267` | Beneficiary is having an active preauthorization request for new born case at this hospital with reference number %s. Hence the request will not be processed. Kindly cancel the active preauthorization request or raise a claim to proceed with current preauthorization |
| `PAYR-1268` | Beneficiary is having an active preauthorization request for new born case at %s. Hence the request will not be processed. Kindly inform %s to cancel the active preauthorization request or raise a claim to proceed with current preauthorization |
| `PAYR-1269` | Date of birth received for new born beneficiary exceeds 6 years before the current date. New born cases can be raised only for the beneficiary whose date of birth is within 6 years of current date |
| `PAYR-1270` | Item LM100 is not applicable for preauthorization request. This item is expected/mandated only during claim submission if the patient is discharged after/during surgery under LAMA/DAMA category for PMJAY cases. |
| `PAYR-1271` | No value received for link id %s for Authentication Consent Questionnaire for preauthorization request. This must be sent if the biometric authentication for patient is not available. For new preauthorization request, either biometric authentication for patient or response for Authentication Consent questionnaire must be sent. Please check/update the insurance plan for the policy for the details of the questionnaire. Please adhere to the response of the coverage eligibility for auth-requirements purpose to check the mandatory documents to be attached with the request. |
| `PAYR-1272` | Invalid biometric user token received. Please try again with valid valid biometric details of the beneficiary. For any issues with biometric, please try with Authentication Consent Questionnaire, details for which has been received in response for coverage eligibliity auth-requirements. |
| `PAYR-1273` | No questionnaire found for the received selection. Please validate the questionnaire url from insurance plan/coverage auth-requirements response. |
<!-- build-docs:end -->

## Reference payer: claim, `PAYR-13xx`
<!-- build-docs:errors reference:13 -->
| Code | Message |
| :---- | :---- |
| `PAYR-1301` | Claim has already been raised for case number %s. Hence new claim request will not be accepted. |
| `PAYR-1302` | No preauthorization approved record found for case number %s. Hence new claim request will not be accepted. |
| `PAYR-1303` | No active claim record found for case number %s. Hence query updation request will not be accepted. |
| `PAYR-1304` | No claim queried record found for case number %s. Hence query updation request will not be accepted. |
| `PAYR-1305` | Invalid usecase requested for case number %s. Please try again with valid usecase. |
| `PAYR-1306` | No item found in preauthorization request for procedure %s with item sequence %s for case number %s. Please try again with valid items. |
| `PAYR-1307` | Invalid quantity requested for procedure %s with item sequence %s for case number %s. Please try again with valid quantity. |
| `PAYR-1308` | No item found in active claim request for procedure %s with item sequence %s for case number %s. Please try again with valid items. |
| `PAYR-1309` | No item found in preauthorization request for implant %s with item sequence %s for case number %s. Please try again with valid items. |
| `PAYR-1310` | Invalid quantity requested for implant %s with item sequence %s for case number %s. Please try again with valid quantity. |
| `PAYR-1311` | No item found in active claim request for implant %s with item sequence %s for case number %s. Please try again with valid items. |
| `PAYR-1312` | No item found in preauthorization request for investigation %s with item sequence %s for case number %s. Please try again with valid items. |
| `PAYR-1313` | Invalid quantity requested for investigation %s with item sequence %s for case number %s. Please try again with valid quantity. |
| `PAYR-1314` | No item found in active claim request for investigation %s with item sequence %s for case number %s. Please try again with valid items. |
| `PAYR-1315` | Rejected item found for preauthorization for procedure %s with item sequence %s for case number %s. Please try again with valid items. |
| `PAYR-1316` | Rejected item found for preauthorization for investigation %s with item sequence %s for case number %s. Please try again with valid items. |
| `PAYR-1317` | Rejected item found for preauthorization for implant %s with item sequence %s for case number %s. Please try again with valid items. |
| `PAYR-1318` | No requested treatment plan found for case number %s. Please try again with valid items. |
| `PAYR-1319` | No requested investigation plan found for case number %s. Please try again with valid items. |
| `PAYR-1320` | No details found for the requested investigations in the system. Hence request will not be processed. |
| `PAYR-1321` | Error occurred while processing the request due to invalid workflow id as (%s) |
| `PAYR-1322` | No active case found for the given case number. |
| `PAYR-1323` | Insufficient wallet balance. Hence the request will not be processed. |
| `PAYR-1324` | Invalid discharge stage received for case number %s. Hence the request will not be processed. |
| `PAYR-1325` | Invalid admission date received for case number %s. Hence the request will not be processed. |
| `PAYR-1326` | Invalid discharge date received for case number %s. Hence the request will not be processed. |
| `PAYR-1327` | Invalid admission date format received for case number %s. Hence the request will not be processed. |
| `PAYR-1328` | Invalid discharge date format received for case number %s. Hence the request will not be processed. |
| `PAYR-1329` | Invalid registration date received for case number %s. Hence the request will not be processed. |
| `PAYR-1330` | Invalid registration date format received for case number %s. Hence the request will not be processed. |
| `PAYR-1331` | Receiver not registered in NHCX. Please try again with valid receiver details. |
| `PAYR-1332` | Invalid CRC request. |
| `PAYR-1333` | Invalid claim type (in-patient/out-patient) received. Hence the request will not be processed. |
| `PAYR-1334` | Hospital configuration not found. Please contact support team. |
| `PAYR-1335` | Invalid implant quantity received as %s for implant %s for case number %s. Please try again with valid data. |
| `PAYR-1336` | Invalid implant unit price received as INR %s for implant %s for case number %s. Please try again with valid data. |
| `PAYR-1337` | Invalid implant net amount received as INR %s for implant %s for case number %s. Please try again with valid data. |
| `PAYR-1338` | Invalid implant attachment received for investigation %s for case number %s. Please try again with valid data. |
| `PAYR-1339` | Invalid implant status received as %s for investigation %s for case number %s. Please try again with valid data. |
| `PAYR-1340` | Invalid investigation status received as %s for investigation %s for case number %s. Please try again with valid data. |
| `PAYR-1341` | Invalid investigation attachment received for investigation %s for case number %s. Please try again with valid data. |
| `PAYR-1342` | Existing case in progress found for case number %s. Hence new reimbursement request will not be accepted. |
| `PAYR-1343` | Previous reimbursement approved record found for the new reimbursement request for case number %s. Hence request will not be processed further. |
| `PAYR-1344` | No details found for the requested procedures in the system. |
| `PAYR-1345` | Invalid procedure status received as %s for procedure %s for case number %s. Please try again with valid data. |
| `PAYR-1346` | Invalid procedure description received as %s for procedure %s for case number %s. Please try again with valid data. |
| `PAYR-1347` | Invalid procedure type received as %s for procedure %s for case number %s. Please try again with valid data. |
| `PAYR-1348` | Invalid procedure factor received as %s for procedure %s for case number %s. Please try again with valid data. |
| `PAYR-1349` | Invalid procedure quantity received as %s for procedure %s for case number %s. Please try again with valid data. |
| `PAYR-1350` | Invalid procedure net amount received as INR %s for procedure %s for case number %s. Please try again with valid data. |
| `PAYR-1351` | Invalid speciality code received as %s for procedure %s for case number %s. Please try again with valid data. |
| `PAYR-1352` | Requested beneficary details and careplan details does not match any criteria for processing the case at this hospital. Please try again with valid data. |
| `PAYR-1353` | Invalid careplan id received. Please try again with valid careplan id. |
| `PAYR-1354` | Rule failure. |
| `PAYR-1355` | No details found for the requested implants in the system. Hence request will not be processed. |
| `PAYR-1356` | Patient liability is not aplicable for the hospital and beneficiary do not have enough wallet balance with deficit amount INR %s for the requested preauthorization for case number %s. |
| `PAYR-1357` | Admission date cannot be after the discharge date. Hence request will not be processed. Please correct the data and try again. |
| `PAYR-1358` | Registration of the patient is allowed maximum upto %s days after admission. Hence request will not be processed. Please correct the data and try again. |
| `PAYR-1359` | No billable treatment plan received for case number %s. Please try again with valid treatment plan data. |
| `PAYR-1360` | Invalid item code received as %s for item sequence %s case number %s. Please try again with valid data. |
| `PAYR-1361` | Invalid item sequence received as %s for case number %s. Please try again with valid data. |
| `PAYR-1362` | No procedure with code LM100 received with 'Requested' status for case number %s. Please try again with valid data. For PMJAY claims, if case comes under LAMA/DAMA scenario with beneficiary being discharged before surgery or during surgery, procedure with code LM100 is mandatory. Only this procedure code will be accepted for LAMA/DAMA case, and all other previous preauthorization approved items will get disqualified for the claim submission |
| `PAYR-1363` | Response for Authentication Consent Questionnaire is missing for case number %s. This must be sent if the biometric authentication for patient is not available during discharge. For new claim request, either biometric authentication for patient during discharge, or response for Authentication Consent questionnaire must be sent. Please check/update the insurance plan for the policy for the details of the questionnaire. |
| `PAYR-1364` | No value received for link id %s for Authentication Consent Questionnaire for claim request. This must be sent if the biometric authentication for patient is not available during discharge. For new claim request, either biometric authentication for patient during discharge, or response for Authentication Consent questionnaire must be sent. Please check/update the insurance plan for the policy for the details of the questionnaire. |
| `PAYR-1365` | Response for STG Questionnaire id %s is mandatory for procedure code %s. Hence the preauthorization request will not be processed as the questionnaire response is not received for procedure code. |
| `PAYR-1366` | Invalid biometric user token received. Please try again with valid biometric details of the beneficiary. For any issues with biometric, please try with Authentication Consent Questionnaire for discharge, details for which has been received in insurance plan. |
| `PAYR-1367` | No biometric records found for the beneficiary for %s. Please ensure correctness of biometric authentication date for the day for cyclic procedure %s. |
| `PAYR-1368` | %s units of cycle information received for procedure code %s with item sequence %s. Cycle information should be sent for all the requested/processed cycles. |
| `PAYR-1369` | Biometric authentication cannot be performed more than once on the same date. Multiple biometric authentication information has been provided for same date for cyclic procedure %s. Hence case will not be processed. Please check and update biometric authentication execution dates and try again. |
| `PAYR-1370` | Received invalid start date as %s for supporting details with item sequence %s. Please try again with valid start date. |
<!-- build-docs:end -->

## Reference payer: plan and scheme rules, `PAYR-14xx` and above
<!-- build-docs:errors reference:14+ -->
| Code | Message |
| :---- | :---- |
| `PAYR-1401` | <policy_code> policy not allowed for the hospital. Please reach out to technical support team. |
| `PAYR-1402` | Requested policy <policy_code> found not be associated with any payer for insurance plan request. Hence request will not be processed. |
| `PAYR-1403` | Requested renewal <renewal_code> found not be associated with requested policy <policy_code> for insurance plan request. Hence request will not be processed. |
| `PAYR-1404` | No treatment provided for policy <policy_code> under any speciality. Please reach out to technical support team. |
| `PAYR-1405` | No enrolled hospital found for HFR id <hfr_id> or sender id <sender_code>. Please reach out to technical support team. |
| `PAYR-1406` | Existing request with correlation id %s is in progress with the payer. Hence this request will not be accepted until the execution for previous request is complete. Please wait for 15 - 60 minutes to allow the execution of previous requests. For further assistance, please reach out to technical support team. |
| `PAYR-1501` | Value type received as %s for category - ONS and code - PSP for item with sequence %s in supporting info in claim resource. In supporting info list, item with category - ONS and code - PSP combination is used to get the surgery date. So the surgery date should be sent as timing (date or period) or as a string value, adhering to the NRCES standards, with the category - ONS and code - PSP. |
| `PAYR-1502` | Value type received as %s for category - ONS and code - ADDD for item with sequence %s in supporting info in claim resource. In supporting info list, item with category - ONS and code - ADDD combination is used to get the admission date. So the admission date should be sent as timing (date or period) or as a string value, adhering to the NRCES standards, with the category - ONS and code - ADDD. |
| `PAYR-1503` | Value type received as %s for category - ONS and code - DTM for item with sequence %s in supporting info in claim resource. In supporting info list, item with category - ONS and code - DTM combination is used to get the death date. So the death date should be sent as timing (date or period) or as a string value, adhering to the NRCES standards, with the category - ONS and code - DTM. |
| `PAYR-1504` | Value type received as %s for category - NMI and code - CQD for item with sequence %s in supporting info in claim resource. In supporting info list, item with category - NMI and code - CQD combination is used to get the overall case remarks for query response. So the case remarks for query response should be sent as a string value, adhering to the NRCES standards, with the category - NMI and code - CQD. |
| `PAYR-1505` | Category received as %s and code received as %s for item with sequence %s in supporting info in claim resource, where the reference value redirects to Questionnaire Response resource in the FHIR bundle. To include a policy/case level Questionnaire Response, in supporting info list there should be an entry with category - INF and code - ODN , and the value as reference. This reference value should refer to a resource of Questionnaire Response in the FHIR bundle. To include response for any STG questionnaire, in supporting info list there should be an entry with category - STG, and the value as reference |
| `PAYR-1506` | Invalid gender received for new born patient. Please try agian with valid gender data as it is mandatory for PMJAY in new born case. Please refer to the valid gender values at https://hl7.org/fhir/R4/valueset-administrative-gender.html |
| `PAYR-1507` | Invalid date of birth received for new born patient. Please try agian with valid date of birth as it is mandatory for PMJAY in new born case. |
| `PAYR-1508` | Invalid resource received for new born patient for url %s. Please try agian with valid Patient resource for the link reference as linked Patient resource is mandatory for PMJAY in new born case |
| `PAYR-1509` | Invalid attachment received for new born patient. Please try agian with valid attachment as attachment is mandatory for PMJAY in new born case |
| `PAYR-1510` | Invalid parameter code received. Please check and try again with a valid parameter code |
| `PAYR-1511` | Invalid parameter value received. Please check and try again with a valid parameter value |
| `PAYR-1512` | Invalid resource received for patient for url %s. Please try agian with valid Patient resource for the reference |
| `PAYR-1513` | Invalid diagnosis received in DiagnosisComponent. In DiagnosisComponent, diagnosis should be sent as CodeableConcept. Please try agian with valid data |
| `PAYR-1514` | Value type received as %s for category - DIS for item with sequence %s in supporting info in claim resource. In supporting info list, item with category - DIS is used to get the discharge related information. So the discharge information should be sent as string value, with value representing discharge stage (After Surgery / Before Surgery / During Surgery), with the category - DIS and code - DTH/LAMA/DAMA/DTM |
| `PAYR-1515` | Invalid name received for organization resource with url %s. Name is mandatory for organization resource. Please refer to https://www.nrces.in/ndhm/fhir/r4/StructureDefinition-Organization.html |
| `PAYR-1516` | No event found for api-caller-id %s and correlation id %s for sender code %s. Hence error response willnot be accepted. |
| `PAYR-1517` | Invalid error structure received for NHCX error. Protocol response structure is expected, but received JWEPayloadResponse. |
| `PAYR-1518` | No input parameters received for task resource. Input parameters are expected for task resource, but not received. Please try again with valid data. |
| `PAYR-1519` | No type found for task input parameters. Hence request will not be processed further. Please refer to https://www.nrces.in/ndhm/fhir/r4/StructureDefinition-Task.html |
| `PAYR-1520` | Invalid resource received for communication for url %s. Please try agian with valid Communication resource for the reference. |
<!-- build-docs:end -->

## What the live payer sent that the sheets do not say

The SHA HP sandbox run recorded in PMJAY Sandbox Run met three codes whose
live message is not the one in the tables above. The tables keep the sheet's
message; the live one is here.

| Code | The sheet says | The sandbox sent | What it meant |
| :---- | :---- | :---- | :---- |
| `PAYR-1245` | Rule failure. | Only one conservative procedure can be booked for a case | An enhancement added a second `Conservative` package |
| `PAYR-1322` | No active case found for the given case number. | Active instance found for case number | A second request on a case while the first was still queued |
| `ERR-PYR-CLM-007` | On no sheet | No prior preauthorization or claim record found for case number | The claim went out under a number of its own, not the preauthorisation's |

`PAYR-1322` is the one to watch: the sheet and the live message point opposite
ways. Act on the live reading and wait for the open request to be decided.
`PAYR-1245` is one of three codes the sheet gives only as "Rule failure", with
`PAYR-1111` and `PAYR-1354`, and the live message names the rule. None of the
live messages is published; confirm them with the payer before you key logic
on them.

## Denial codes are a separate thing again

A refusal stops a message. A denial decides a case. The denial families,
`ClaimError-1` to `ClaimError-28` and `PreauthError-1` to `PreauthError-15`
with no 14 defined, arrive inside an adjudicated `ClaimResponse` and are the
adjudicator's reason, not a fault in what you sent. They belong on the appeal
screen. Codes and Value Sets in the FHIR Reference lists them.

## Which desk gets which

| Family | Who acts |
| :---- | :---- |
| `NHCX-` | The integration team. The message did not arrive |
| `PAYR-10xx` | The integration team. Structural |
| `ERR-PYR-CLM-007` | The integration team. The claim was sent under the wrong case number |
| `PAYR-11xx` to `PAYR-14xx` | Read the message. Some name a field, some name a policy fact. The band alone does not decide |
| Standard `PAYR-1001` to `PAYR-1020` | The claims desk, in the payer's own words |
| `ClaimError-`, `PreauthError-` | The claims desk, on the appeal screen |

Show the payer's sentence verbatim in every case. The reference payer's
messages already name the field, the code or the case number, and a system that
rewrites them into a generic failure throws away the only diagnosis available.
