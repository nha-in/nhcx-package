# Troubleshooting

A symptom-first chapter. Everything else in this documentation is organised by
what you are building; this one is organised by what has gone wrong, because
that is the only thing you know at the moment you need it.

## Isolate the layer first

A message crosses five layers on its way to a decision, and each one refuses in
a different way. Work out which layer stopped it before you look anything up,
because the same symptom means different things at different layers.

| Layer | What refuses | How you hear | Code family |
| :---- | :---- | :---- | :---- |
| 1. Transport | Your HTTP call to the gateway | Synchronously, in the response to your own call | HTTP `4xx`, `5xx` |
| 2. Gateway | The exchange, reading the envelope | Synchronously, or later on `/v1/error` | `NHCX-1xxx` |
| 3. Encryption | The recipient, opening the letter | On your callback, as a protocol response | `PAYR-1001`, `PAYR-1002`, `PAYR-1097` |
| 4. Bundle | The recipient, validating FHIR | On your callback, inside the sealed response | `PAYR-10xx` |
| 5. Adjudication | The payer's rules | On your callback, inside the sealed response | `PAYR-11xx` to `PAYR-14xx` |

The layers are strictly ordered. Reaching a layer means every layer before it
passed, which is why a scheme-rule refusal is good news about your bundle.

## The symptom table

| What you see | Layer | Most likely cause | What to do |
| :---- | :---- | :---- | :---- |
| `401` on the sessions call | 1 | Wrong client ID or secret, or Milestone 1 incomplete | Check the credentials against onboarding |
| `401` naming a header on the sessions call | 1 | `REQUEST-ID` reused or absent, `TIMESTAMP` stale or malformed, `X-CM-ID` missing | Generate a fresh UUID per call; take the time from the system clock |
| `401 Sender is not authorized to execute the operation` | 1 | Token expired | Fetch a new token and retry once. Never retry with the same token |
| `401` immediately after a fresh token | 1 | `Bearer ` prefix missing, or the token sent on the wrong header name | Send `bearer_auth: Bearer <token>`, and `Authorization` alongside it |
| `401` on policy link or de-link only | 1 | The client ID calling is not the one that created the participant | Run the linking job under the credentials that created the record |
| `400` on a use-case call | 2 | Envelope failed validation | Check every `x-hcx-` field against Envelope Fields |
| `NHCX-1005` invalid request header | 2 | A header missing, malformed or of the wrong type | As above |
| `NHCX-1006` duplicate request | 2 | A correlation ID reused, usually on a retry after a failure | Mint a fresh correlation ID. A failed correlation is retired |
| `NHCX-1011` invalid status | 2 | The status word does not match the leg of the message | Requests send `request.initiated`; responses send `response.partial`, `complete` or `error` |
| `NHCX-1018` invalid ABHA number | 2 | ABHA sent in the wrong shape | The gateway wants `XX-XXXX-XXXX-XXXX` on this field, though the bundle carries it without hyphens |
| `NHCX-1010` no data with given correlation id | 2 | You answered a request whose correlation the exchange had already retired | Acknowledge every submission immediately, then send the decision on the same thread |
| `NHCX-1002` or `NHCX-1003` not registered | 2 | Sender or recipient is not active on the exchange | Check the participant record's status. Only `Active` can send or receive |
| Nothing at all arrives on your callback | 2 | Address, firewall, routing, or no receipt sent | See the callback checklist below |
| `PAYR-1001` decryption failed | 3 | You encrypted with a certificate that is not the one on the recipient's record | Re-fetch the recipient's certificate and resend. Clear your cache |
| `PAYR-1002` encryption failed | 3 | The payer cannot encrypt for you: your registered certificate is stale or absent | Update your `encryption_cert` on your participant record |
| `PAYR-1097` no payload | 3 | The ciphertext part of the JWE is empty | Check you are serialising all five parts, compact |
| `PAYR-1005` time limit exceeded | 3 | `x-hcx-timestamp` is more than 24 hours behind the current time | Send the current time. This is the only numeric tolerance the sources state |
| `PAYR-1004` or `PAYR-1008` malformed or invalid bundle | 4 | The bundle does not parse or fails profile validation | Run it through the NRCeS validator before anything else |
| `PAYR-1009` to `PAYR-1016` no identifier or type found | 4 | A resource is missing its `identifier`, or an identifier is missing its `type` | Every resource that names a party needs both |
| `PAYR-1019` invalid sequence in supporting info | 4 | A `supportingInfo` entry has no `sequence` | Number the whole list once it is assembled, from 1, with no gaps |
| `PAYR-1027` invalid item id | 4 | `Claim.item` has no FHIR element `id`. Nothing to do with the package code | Give each item `Item/n`, each procedure `Procedure/n`, each supporting-info entry `SupportingInformation/n` |
| `PAYR-1028`, `PAYR-1029` | 4 | The same fault on the item sequence and the bundle id | As above |
| `PAYR-1083` no HPR details | 4 | The `Practitioner` carries no identifier typed `HPIN` | Send the HPR id as `HPIN` as well as `HPID` |
| `PAYR-1093`, `PAYR-1094` composition faults | 4 | An embedded clinical document does not follow the NRCeS profile | Check the `Encounter` structure definition |
| `PAYR-1095` invalid discharge information | 4 | A claim with no discharge status | Send category `DIS` with a code among `DTH`, `DTM`, `LAMA`, `DAMA` |
| `PAYR-1096` invalid death date | 4 | Discharge type is death and no death date was sent | Send category `ONS`, code `DTM` |
| `PAYR-1008` invalid content type | 4 | A document outside PDF, JPG, JPEG, PNG and FHIR JSON | Convert it. `text/plain` is refused |
| `PAYR-1114`, `PAYR-1202` invalid speciality code | 5 | `item.category` is not the master's category code for that package | Read the specialty off the plan, not off your own list |
| `PAYR-1238` active preauthorisation exists | 5 | The scheme allows one live preauthorisation per beneficiary per hospital | Cancel the existing one, or raise its claim. The reference number names it |
| `PAYR-1245` one conservative procedure | 5 | A second package typed `Conservative` on one case | An enhancement must add a `Medical` package or an allowed add-on |
| `PAYR-1256`, `PAYR-1363` consent questionnaire missing | 5 | No biometric token and no authentication-consent response | Answer the plan's questionnaire, found by title in the master |
| `PAYR-1301` claim already raised | 5 | One case, one claim | Nothing to resubmit. Use a Task |
| `PAYR-1302` no approved preauthorisation | 5 | The claim went out under a number of its own | Send the claim under the pre-authorisation's number |
| `PAYR-1321` | 5 | A claim query answered under the wrong workflow id | Answer on 161, not 151, 19 or 16 |
| `PAYR-1322` active instance found | 5 | Another request is already open on that case | The scheme takes one at a time. Wait |
| `PAYR-1401` policy not allowed for the hospital | 5 | The plan was asked for under a policy the hospital is not empanelled under | Ask under the beneficiary's own policy from the eligibility answer |
| `PAYR-1406` existing request in progress | 5 | A second plan request before the first was answered | Wait 15 to 60 minutes. Past 60, raise it with support |
| `ERR-PYR-CLM-007` no prior record for case number | 5 | As `PAYR-1302` | As above |

## When nothing arrives on your callback

The commonest report, and it is almost always one of six things. The portal
lists the first five; the sixth is the one people miss.

1. **The address.** A domain name, not an IP address and not a port number.
2. **The location.** The server must be hosted in India.
3. **The firewall.** Allow the exchange's outbound addresses: `3.109.99.210`,
   `13.126.152.0`, `13.200.129.223`.
4. **The rules.** Check nothing else is dropping the inbound connection.
5. **Application routing.** The request reaches the server and is dispatched to
   the wrong handler by a mismatched route, a load balancer rule or a version
   prefix.
6. **The receipt.** You answered, but not with `202` and the receipt body
   within 30 seconds. A slow `200` is read as a failed delivery. After five
   attempts the exchange gives up and retires the correlation ID, and tells you
   on `/v1/error`, which you must also be hosting.

Test the whole path rather than the parts. Call your own registered public
address from outside your network and confirm that what answers is the service
you think it is.

## When a case has gone quiet

In order, and stop at the first that explains it.

1. **Did you get a receipt?** No receipt means the exchange never took the
   message. It is not a payer problem.
2. **Did anything arrive on `/v1/error`?** That is where an undeliverable
   request is reported. A system without the endpoint never learns.
3. **Ask the exchange.** The status exchange reports where a message got to.
   Status and Search in Getting Started has the shape.
4. **Under PMJAY, ask the payer service.** A case sits at
   `request.initiated` until someone acts on it in the scheme's own system. The
   role lookup says where it is. PMJAY Adjudication APIs has it.
5. **Only then treat it as slow.** The scheme decides on its own schedule. An
   enhancement approved in a minute on one run was still queued five minutes on
   in another, with the same bundle.

## Things that look like faults and are not

- **A queued acknowledgement.** Both live payers answer twice on one
  correlation: an interim response saying the request is with an adjudicator,
  then the decision. Treat the first as an acknowledgement, not as the answer.
- **`outcome: complete` on a rejection.** `complete` means the payer finished
  processing. The adjudication reason is what separates approval from
  rejection.
- **A reduced amount without `partial`.** The reference payer approves at a
  lower figure and still sends `complete` with no note. Reconcile amounts
  yourself.
- **Zero benefit on a query.** It means no benefit has been determined yet, not
  that the claim was refused.
- **A base rate of zero in the plan.** Some packages are priced entirely by the
  bed category chosen.
- **`PAYR-1238` on a preauthorisation.** It arrives only after the bundle has
  passed validation, so it is the first evidence the bundle is right.
- **A `SUBSETTED` meta tag.** Every payer-generated bundle carries it. It marks
  a projection of the payer's record, not an error.

## Before you raise it with support

Have these to hand. Every one of them is something the exchange or the payer
will ask for, and a report without them cannot be traced.

- The correlation ID, and the API call ID of the specific message.
- The timestamp, and which environment.
- Your participant code and the recipient's.
- The workflow code and the status word you sent.
- The raw sealed message as sent, and the raw response as received. Store both
  before you interpret either; this is the only reason that instruction is
  repeated throughout this documentation.
- The error code and the payer's message verbatim, not your rendering of it.

Integration questions go to `hcx.integration@nha.gov.in`. FHIR profile and
validation questions go to `nrc-help@cdac.in`.
