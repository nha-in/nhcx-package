# Access control and roles

Most of this documentation talks about two parties. The network recognises
nine, and each one has a fixed list of what it may send and what it may
receive. That list is an access-control policy, enforced by the exchange
against the roles on your participant record, and it decides what your
integration is allowed to do before any of your own code runs.

## The roles

The exchange extends the HL7 organisation-role value set and namespaces it for
claims.

| Role on the network | Code | Who it is |
| :---- | :---- | :---- |
| `provider` | 10001 | Health service provider. A hospital or clinic |
| `payer` | 10002 | Insurance service provider |
| `agency.tpa` | 10003 | Third-party administrator acting for a payer. In this version it behaves as a payer for data exchange |
| `agency.regulator` | 10004 | IRDAI, IIB and bodies like them |
| `research` | 10005 | Research groups |
| `member.isnp` | 10006 | Insurance self-network platforms. Marketplaces facilitating insurance adoption |
| `agency.sponsor` | 10007 | Scheme owners, for example NHA for Ayushman Bharat |
| `HIE/HIO.NHCX` | 10008 | Another exchange instance |
| End-user application | 10009 | A beneficiary's personal health record app |

The FAQ notes that only four role codes are live in practice on the sandbox and
in production: provider, payer, TPA and the end-user application. The rest are
specified rather than deployed.

## What each role may do

| Role | Eligibility | Preauthorisation | Claim | Payment | Search and status |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `provider` | Send request, receive response | Send request, receive response | Send request, receive response | Receive notice, send acknowledgement | Its own preauthorisations and claims |
| `payer`, `agency.tpa` | Receive request, send response | Receive request, send response | Receive request, send response | Send notice, receive acknowledgement | Its own payment notices |
| `agency.regulator` | | | Search claims | | Across every payer |
| `research` | Receive request, send response | | | | Aggregate or anonymised only |
| `member.isnp` | Receive request, send response | | | | Aggregate or anonymised, plus individual claims on beneficiary consent |
| `agency.sponsor` | Equivalent to payer throughout | | | | |
| `HIE/HIO.NHCX` | Relays as the use case needs, and can never read the payload | | | | |

Five things in that table change how a system is built.

**A provider can search, and only its own.** The policy is explicit: providers
may make search and status requests "for multiple requests that originated from
them". That is why the provider sandbox exit checklist includes claim search.
Which endpoint that search goes to is not settled by the sources, and the next
section sets out why.

**A regulator's search fans out.** The exchange forwards a regulator's search to
every payer, each of which returns claims data under the regulator's policies.
Nobody else on the network can cause one request to reach every payer.

**Research and marketplace access is aggregate by default.** Anything a
`research` participant receives is aggregated or anonymised. The key
aggregations are named as still to be defined, so treat this role as specified
rather than usable.

**A marketplace needs consent, carried on the envelope.** `member.isnp` may see
an individual beneficiary's preauthorisations and claims only with that
beneficiary's consent, obtained through existing consent-management
infrastructure, and "ISNPs are expected to submit the acquired consent as part
of the domain header". That is the one place in the corpus where a domain
header is load-bearing rather than informational. Envelope Fields has the
naming convention.

**Another exchange never sees the payload.** A relaying instance routes on the
envelope alone, which is the whole point of sealing the letter separately.

## Two kinds of search

The sources describe two search exchanges with different endpoints and
different callers.

| | Own-case search | Cross-payer search |
| :---- | :---- | :---- |
| Endpoints | `/preauth/search`, `/claim/search`, `/paymentnotice/search`, each with `on_search` | `/v1/search/submit` and `/v1/search/on_submit` |
| Who calls it | The participant that originated the messages | NHA, or a regulator such as IRDAI |
| Flow | provider to NHCX to payer, and back | NHA to NHCX to payer, and back |
| Scope | Requests that originated from the caller | Any claim, across every payer |
| Also serves | Status lookups on those resources | |

A provider's search over its own cases, the search the access-control policy
allows, is `/claim/search`, the endpoint the Open Protocol page gives for it. The Technical Specifications route
`/search/submit` from NHA through NHCX to the payer, and the requests-and-responses
workbook gives NHA or IRDAI searching by case number as its example. That is
the cross-payer search.

The provider sandbox exit checklist points the other way. Its item 10, "Claim
Search", names `/v1/search/submit`, for "the providers/regulatory bodies", and
the payer exit checklist expects that search to arrive from a provider. No
source confirms which of the two endpoints the sandbox accepts from a provider.
Treat it as open: confirm with NHA before the demo, and keep the endpoint
configurable.

The Open Protocol page lists `/claim/search` as reachable by
`provider | regulator | auditor`, which introduces an auditor role that appears
in no other source and in no role table. Treat it as an unmodelled participant
type rather than something to build for.

## Roles are set on the participant record

The role is not a claim you make per message. It is the `roles` field on your
participant record, set at creation, and the exchange checks every call against
it. Three practical consequences.

- **A participant may hold more than one role.** The field is an array.
- **The registry must match the role.** A provider is vouched for by the Health
  Facility Registry, a payer or TPA by the payer registry. The FAQ warns that
  incorrect role and registry mapping causes "API access issues, request
  rejection, or improper routing", and it is one of the harder faults to
  diagnose because the failure looks like a routing problem.
- **One entity, many participant IDs.** A hospital group holds one participant
  ID per Health Facility Registry ID, all created under the same credentials.

## What the registry holds about you

The participant registry is the source of truth for who may do what. Its
attributes, with their obligations:

| Attribute | Type | Obligation | Notes |
| :---- | :---- | :---- | :---- |
| `participant_code` | String | Mandatory | Generated by the exchange. Unique across installations, namespaced as `code@instance` |
| `registry_code` | String | Optional | The HFR or payer registry code, used to validate and link the participant against the role |
| `participant_name` | String | Mandatory | Unique within the instance |
| `roles` | String | Mandatory | Used for access control |
| `address` | JSON | Optional | Physical address including geolocation |
| `email` | String | Optional | Up to 3 |
| `phone` | String | Optional | Landline, up to 3 |
| `mobile` | String | Mandatory | At least 1, up to 3 |
| `status` | String | Mandatory | `Created` (not yet verified), `Active`, `Inactive`, `Blocked` |
| `signing_cert_path` | String | Optional | URI or path to the JWT signing certificate |
| `encryption_cert` | String | Mandatory | URI or path to the encryption certificate |
| `endpoint_url` | String | Mandatory | The default callback address |
| `payment_details` | JSON | Optional | A UPI ID, or an account number with an IFSC code |

`payment_details` is the only place on the network where a participant's bank
details sit, and it is what `PAYR-1020`, "unable to process payment as no valid
bank details found for the provider", refers to. It is optional at
registration and not optional if you expect to be paid.

Only `Active` may send or receive. The registry offers create, update, delete
and search, with modification controlled by the exchange operator as part of
onboarding rather than exposed to participants.
