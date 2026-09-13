# Participants and policies

Nothing in the previous chapter can happen until two questions are answered: who am I sending this to, and which policy is it about. Neither is a claim exchange. Both are preconditions, and a system that skips them fails later with errors that look like claim problems but are not.

This chapter covers how a participant joins the network, how it makes itself reachable, how participants find and address each other, and how a policy is located and linked to a beneficiary.

## Becoming a participant

Every entity on the exchange is a registered participant with three identifiers that do different jobs.

- **Participant ID.** The address on the exchange, written as `1518@hcx`. The part after the `@` names the exchange. This is what goes on the envelope as sender and recipient.
- **Client ID and secret.** The login used to get an access token. These are the same credentials a hospital already holds from its ABDM Milestone 1 integration. There is no separate NHCX login.
- **Registry ID.** Proof of who you are, issued by a registry the exchange trusts. For a hospital it is the Health Facility Registry (HFR) ID. For an insurer or TPA it is the IRDAI registry ID, sent without leading zeros, so 0123 becomes 123. For a patient app it is the app's own client ID.

When a participant is created, its role and its registry are given as numbered codes.

| Role | Code | | Registry | Code |
| :---- | :---- | :---- | :---- | :---- |
| Provider | 10001 | | HFR | 10001 |
| Payer | 10002 | | NIN | 10002 |
| TPA | 10003 | | ROHINI | 10003 |
| Regulator | 10004 | | Payer registry | 10004 |
| Research | 10005 | | | |
| Insurance marketplace | 10006 | | | |
| Scheme sponsor | 10007 | | | |
| Another exchange | 10008 | | | |
| Patient app | 10009 | | | |

A hospital group with several facilities holds one participant ID per HFR ID, all created with the same credentials.

Each role comes with a fixed list of what it may send and receive, and the exchange checks every call against it. Access Control and Roles in the Reference section has that list.

**The registry ID must match at both layers.** The HFR ID sent inside a FHIR bundle has to be the same as the registry ID recorded against that sender on the exchange. A mismatch is rejected by the gateway, and it is a common failure for integrators who take the registry entry and the bundle content from different places.

## Registering

Registration is a short sequence of calls to the participant service. Each is confirmed by a one-time passcode sent to the mobile number the registry holds, so nobody can register a hospital they do not control.

1. **Create.** Send the registry type, registry ID, role, mobile number and email. The mobile number must be the one on the HFR record, or for a payer the one NHA holds. The exchange returns a participant ID and a transaction number, and sends a passcode to that phone. The participant now exists but is pending.
2. **Confirm.** Send the transaction number and passcode. The participant becomes active.
3. **Configure.** Send the participant's public certificate and the address the exchange should call back on, which the portal calls the bridge URL. A second passcode arrives.
4. **Confirm again.** The address and certificate go live. The exchange can now reach you.

A participant record also carries a status the exchange maintains: created but not yet verified, active, inactive, or blocked. Only an active participant can send or receive.

Passcodes and transaction numbers last 24 hours. Lose one and you repeat that step. A certificate can be replaced later without a passcode, through a dedicated certificate-update call. The sandbox offers a simpler create, update and delete without the passcode steps.

## Your own key

How Claims Move on NHCX said the letter is sealed with the receiver's key. That means every participant needs a key of its own and has to publish the public half.

Make a 2048-bit RSA key, sign your own X.509 certificate with it (the portal gives the three openssl commands), encode the certificate in base64, and register it in the configure step above. The private half stays with you; it is what opens every letter addressed to you. NHA recommends replacing the key once a year and expects a participant to report a key that may have leaked.

## Where the exchange calls you

The callback address registered during configuration is where every answer arrives, so it comes with rules.

- A domain name, not an IP address or a port number.
- HTTPS, with TLS 1.2 or newer.
- Hosted in India.
- Reachable from the exchange's outbound addresses, which must be allowed through your firewall: `3.109.99.210`, `13.126.152.0` and `13.200.129.223`.
- Answering within 30 seconds with an acceptance receipt, otherwise the exchange assumes delivery failed and tries again.

The portal lists one further cause that is not about the address at all: application routing. The request reaches the server but is dispatched to the wrong handler by a mismatched route, a load balancer rule or an endpoint version.

## Finding a participant

A Provider does not hard-code the payers it deals with. It asks the registry.

The participant list call takes a role, so a Provider asks for everyone registered as a Payer, and can narrow by date range and by whether the entity is government or private. The calling system then filters by name if the user is looking for a specific insurer.

What matters downstream is the chosen payer's participant code, because it is one half of the address on every subsequent envelope. The other half, which is not always the same code, comes from the policy lookup below.

## Authenticating

Every call carries a bearer token. The token comes from the ABDM gateway's sessions endpoint, not from NHCX itself, using the Milestone 1 client ID and secret.

Tokens are short-lived. The portal's documents disagree on exactly how short, with five minutes, twenty minutes and a hundred minutes all appearing. Build for the strictest: refresh automatically, and treat a `401` as "get a new token and retry" rather than as a failure.

Sandbox addresses:

- Sessions: `https://dev.abdm.gov.in/api/hiecm/gateway/v3/sessions`
- Participant service: `https://apisbx.abdm.gov.in/pmjay/sbxhcx/participanthcxservice`
- Use cases: `https://apisbx.abdm.gov.in/hcx/v1`

The production participant service is at `https://apisprod.nha.gov.in/pmjay/hcx/participanthcxservice`. The production use-case address is shared after sandbox exit.

## Certificates and encryption

Before sending anything to a participant, the sender needs that participant's public key.

The certificate fetch takes a participant ID and returns its key material, as a PEM-encoded X.509 certificate or, for shorter keys, an SPKI public key. Try the X.509 import first and fall back to SPKI.

**Cache certificates.** Fetching a payer's key before every request is a round trip that buys nothing, since keys change rarely. A 24-hour cache is the practical default.

## Finding a policy

Once the payer is known, the beneficiary has to be matched to a policy with that payer. The lookup accepts three identifiers, and a system that does not know which will work should try them in order of reliability.

- **ABHA number.** The strongest, and the one to try first.
- **Member ID.** The policy or member number captured at admission.
- **Mobile number.** The weakest, since a number may be shared or out of date.

What comes back, for each policy, is the insurer, who processes claims for it, the member ID, and the product. Two of those are participant codes and they are not always the same.

**Send claims to the processor, not the insurer.** An insurer may handle its own claims, in which case its `payerid` and `processingid` are the same code. Or it may use a TPA, in which case `processingid` is the TPA's participant code and that is where every request must go. The policy lookup tells you which. Put `processingid` on the envelope as the recipient. Pointing at `payerid` instead is the portal's seventh most common mistake, and the request goes nowhere useful.

A lookup that succeeds is worth keeping. The policy set for a patient does not change between one department and the next, so cache against the patient and provide a way to force a refresh. If the lookup returns no processor code, stop; no claim-side call can be addressed.

## Linking a policy to ABHA

The reason an ABHA number works as a policy identifier at all is that someone linked it earlier.

Linking is a Payer-side action, performed when the policy is created. The insurer links the beneficiary's ABHA number, mobile and member ID to the policy's products, naming itself as the payer and its TPA, or itself, as the processor. Only the party named as payer or processor can de-link it later; the exchange checks the caller's credentials against the link. If an insurer changes TPA, every affected policy is de-linked and re-linked with the new processor.

The effect is felt at the point of care. A beneficiary who walks in with only an ABHA number can be resolved to a policy without a card or a member ID, which is the whole point of linking it in the first place.

## From sandbox to production

Joining the network is a certification, not a form. The path for a hospital runs:

1. **Register the facility** in the Health Facility Registry.
2. **Apply on the ABDM sandbox**, choosing Providers and Payers with Milestone 1 as the intent. This yields the client ID and secret.
3. **Complete Milestone 1**, which is ABHA creation and verification, then functional testing, the WASA security audit and the HTC demo. NHCX requires M1 to be in place first.
4. **Register on the NHCX sandbox** with the same credentials and create a participant for each facility.
5. **Integrate and test** against the sandbox, using the dummy payer described in NHCX Use Cases.
6. **Get certified.** Email sample FHIR bundles to `hcx.integration@nha.gov.in` for NRCeS validation, give an internal demo to the NHA team, then the HTC demo before NRCeS, IRDAI, TCS and NHA.
7. **Go to production.** NHA confirms, adds the provider role to the production client ID, and the participant is created there through the registration steps above.
8. **Pilot, train, go live.** NHA recommends a small pilot and staff training before switching fully.

Payers follow the same shape but enrol through the NHA or IRDAI portal, which registers them after scrutiny and asks the ABDM gateway team to issue credentials with the payer or TPA role.

A participant can also leave. Voluntarily, when a business shuts, merges or moves exchange. Involuntarily, when a regulator suspends it, when it repeatedly breaches service levels, or when it misuses the network. Involuntary removal comes with warnings and a right of appeal through the grievance process.

## Why this comes first

A patient is not cashless simply because they hold insurance. Two things have to be true: the admission record must carry the scheme, payer, identifier and policy number, and the system must have resolved a valid processor code, product code and member ID. A patient can look correctly admitted as insured on screen while every NHCX call still fails, because the second condition was never met.

The order is fixed. Discover the payer, then discover the policy. Take the processor code, member ID and product from what came back, fetch the plan and its benefits, check eligibility, and only then submit a preauthorisation.

JWE, Status and Errors opens the envelope every one of those calls travels in. NHCX Use Cases lists the calls themselves.
