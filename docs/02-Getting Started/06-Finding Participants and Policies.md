# Finding participants and policies

Before a message can be sealed, two questions have to be answered: who is it going to, and which policy is it about. The participant service answers both. A provider asks them at every admission. A payer answers the second one in advance, by linking each policy to its holder when the policy is written.

```mermaid
flowchart LR
  A[List participants by role] --> B[Choose the insurer]
  B --> C[Look up the patient's policies]
  C --> D{processingid}
  D --> E[Fetch that participant's certificate]
  E --> F[Seal and send]
```

## Listing participants

The registry can be asked for everyone holding a role. This is how a hospital system builds its list of payers, and how a payer finds hospitals.

<!-- build-docs:api 10-registry/fetch-participants-list.bru -->
```bash
curl --location --request POST 'https://apisbx.abdm.gov.in/pmjay/sbxhcx/participanthcxservice/fetch/participants/list' \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --header 'bearer_auth: Bearer <access token>' \
  --data-raw '{
    "role": "PAYER",
    "fromdate": "01/04/2021",
    "todate": "20/03/2026",
    "entitytype": "Gov"
  }'
```
<!-- build-docs:end -->

- `role` is `PAYER`, `PROVIDER` or `TPA`.
- `fromdate` and `todate` bound the registration date, in `dd/MM/yyyy` only.
- `entitytype` is optional. `Gov` narrows to government schemes; leave it out for everyone.

The response is a list of participant records, each with the participant code, name, roles and entity type. The list is not searchable by name on the server side. Fetch it, filter by name in your own code when a user is looking for a specific insurer, and classify government against private from the entity type. Cache it for the day; it changes rarely.

There is no separate call to fetch one participant's details by code. The list is the lookup. Fetching a participant's certificate, covered in the next chapter, is the one per-participant call.

## Looking up a patient's policies

Given something that identifies the patient, the registry returns every policy linked to them.

<!-- build-docs:api 10-registry/participant-get-policies.bru -->
```bash
curl --location --request POST 'https://apisbx.abdm.gov.in/pmjay/sbxhcx/participanthcxservice/participant/get/policies' \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --header 'bearer_auth: Bearer <access token>' \
  --data-raw '{
    "identifiertype": "AbhaNumber",
    "identifiervalue": "12345678910111"
  }'
```
<!-- build-docs:end -->

`identifiertype` is one of three, and they are not equal. Try them in this order and stop at the first that returns a policy:

1. `AbhaNumber`, the ABHA number without hyphens. The strongest identifier.
2. `MemberId`, the member or policy number captured at admission.
3. `MobileNo`, the patient's registered mobile. The weakest, since a number can be shared or stale.

Each policy in the answer carries the fields that every later message depends on. The shape, not a verbatim sample:

```json
{
  "policies": [
    {
      "payerid": "1518@hcx",
      "processingid": "1000000109@hcx",
      "memberid": "MD5SLS4X5",
      "productid": "PMJAY/HP/S/G",
      "productname": "PMJAY Himachal Pradesh"
    }
  ]
}
```

| Field | What it is for |
| :---- | :---- |
| `payerid` | The insurer's participant code. Goes inside the bundle as the insurer. |
| `processingid` | Who processes claims for this policy. **This is the recipient on the envelope and the certificate to fetch.** |
| `memberid` | Identifies the beneficiary in eligibility and claim bundles. |
| `productid` | The product or plan code, used to fetch the insurance plan and coverage detail. |
| `productname` | Human-readable; some systems use it as the effective policy code when a formal number is missing. |

**Send to the processor.** When an insurer handles its own claims, `payerid` and `processingid` are the same code. When a TPA processes for it, `processingid` is the TPA and every request goes there. Pointing at `payerid` is the portal's seventh most common mistake; the request goes nowhere useful. If no `processingid` comes back, stop; nothing can be addressed.

Cache the result against the patient. Their policies do not change between one screen and the next, and re-fetching on every step is wasted traffic. Provide a way to force a refresh when something has genuinely changed.

## Linking a policy to a beneficiary

This is the payer's half, and it is why the lookup above works at all. When a policy is written, the insurer links it to the holder's ABHA number, mobile and member ID, and names who will process claims for it.

<!-- build-docs:api 10-registry/participant-link-abha-policy.bru -->
```bash
curl --location --request POST 'https://apisbx.abdm.gov.in/pmjay/sbxhcx/participanthcxservice/participant/link/abha/policy' \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --header 'bearer_auth: Bearer <access token>' \
  --data-raw '{
    "requestid": "7f3f2a4e-0c6b-4b7a-9e2d-2c1f8a5b6d90",
    "abhanumber": "12345678910111",
    "mobilenumber": "9876543210",
    "memberid": "MEM-2026-000123",
    "payerid": "100234@sbx",
    "policies": [
      {
        "productid": "PRD-FLOATER-01",
        "productname": "Family Floater Gold"
      }
    ],
    "processingid": "100235@sbx"
  }'
```
<!-- build-docs:end -->

- `requestid` is a fresh UUID.
- `payerid` is the insurer's own participant code. Every insurer has one, even when it works through a TPA.
- `processingid` is the TPA's participant code, or the insurer's own if it processes its own claims.
- `policies` lists each product the holder has, by product ID and name.

Only the two participants named on the link, the `payerid` and the `processingid`, may change it later. The exchange takes the client ID from the caller's token and checks it against them. That also means the token used to link must come from the same credentials that created that participant; a mismatch is refused and has to be sorted out with NHA by email.

## Removing a link

<!-- build-docs:api 10-registry/participant-delink-abha-policy.bru -->
```bash
curl --location --request POST 'https://apisbx.abdm.gov.in/pmjay/sbxhcx/participanthcxservice/participant/delink/abha/policy' \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --header 'bearer_auth: Bearer <access token>' \
  --data-raw '{
    "requestid": "9a7c5e3d-1b2f-4c8a-b6d4-0e9f8a7b6c55",
    "payerid": "100234@sbx",
    "memberid": "MEM-2026-000123",
    "policies": [
      {
        "productid": "PRD-FLOATER-01",
        "productname": "Family Floater Gold"
      }
    ],
    "processingid": "100235@sbx"
  }'
```
<!-- build-docs:end -->

Only products already on the link can be removed; naming one that is not there returns "There is no policies with requested details".

The commonest reason to de-link is a change of TPA. There is no edit call: every affected policy is de-linked with the old `processingid` and linked again with the new one. Plan that as a batch job, not a manual task.

## What a provider needs before sending anything

From the two lookups above, four values, in this order:

1. The insurer, chosen from the participant list.
2. The patient's policy with that insurer, from the policy lookup.
3. From it, the `processingid`, `memberid` and `productid`.
4. That participant's certificate, fetched in the next chapter against the `processingid`.

Only then can a message be sealed and addressed. A patient can look correctly admitted as insured on screen while every NHCX call fails, because step 3 was never reached.
