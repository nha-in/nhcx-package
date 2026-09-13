# Governance and audit

What a participant owes the network beyond making the calls work: how messages
are secured in transit and at the API layer, what must be logged and for how
long, how grievances are handled, how a participant joins and how one is
removed. None of it is a claim exchange and all of it is binding on anyone
operating in production.

## The security layers

Three, and they do different jobs. A system that has one is not secure.

| Layer | Mechanism | What it protects |
| :---- | :---- | :---- |
| Transport | HTTPS with TLS, mandatory in production | The channel |
| Message | JWE with the recipient's public key | The payload, from everyone including the exchange |
| API | JWT bearer tokens with a mandatory expiry | Access to the endpoints |

Transport security is stated without qualification: all communication between
the exchange and participating entities uses TLS, and all APIs work only over
HTTPS in production.

## The two JWTs, and they are not the same

This is the part most often built wrong, because the same word covers two
tokens signed by different parties with different algorithms.

**Your token, calling the gateway.** Signed `HS256`, with the participant's
`client_secret` as the key. Claims `jti`, `iss` (the exchange instance), `sub`
(your client ID), `iat` and `exp`. You obtain it from the sessions endpoint
with your client ID and secret, and you present it on the `Authorization`
header. Session Token in Getting Started covers obtaining it; note that NHCX's
own endpoints read it from `bearer_auth` in practice, which is why the safe
course is to send both header names.

**The exchange's token, calling you.** Signed `RS256`, with the exchange's own
private key. Claims `jti`, `iss`, `sub` set to the same value as `iss`, `iat`
and `exp`. Participant systems are expected to validate it against the
exchange's public key.

**The public key is still not published.** Neither is the header it arrives on.
Receiving a Callback in Getting Started sets out what that means: every
integration built from these documents has shipped with signature checking
disabled, because rejecting everything makes the endpoint useless. Ask for the
key during onboarding, at the same time you register your endpoint, hold the
gap open deliberately rather than silently, and defend the endpoint with an
address allow-list and whatever else your edge offers until you have it.

**Revocation.** The exchange revokes a participant's API access by generating a
new `client_secret` and updating the registry. Your tokens stop working and you
mint new ones with the new secret. There is no separate revocation call to
watch for, so a sudden authentication failure across every call is a state to
recognise.

## Key rotation

- Rotate the encryption key pair **once a year**. The specification recommends
  it; the certificate a self-signed X.509 generates by default expires in a
  year anyway.
- Mechanisms must exist for providers, payers and the exchange to **tell the
  ecosystem about a suspected key compromise**. Decide in advance who at your
  organisation makes that call and how.
- A certificate-only change in production skips the passcode steps. Creating
  and Updating a Participant has the call.
- The practical failure is asymmetric and worth naming: if the certificate on
  your record does not match the private key you hold, everybody else can seal
  messages you cannot open, and nothing tells you until traffic fails.

## What must be logged

The event-audit guidelines are the strictest obligation in this chapter and the
least implemented.

- **Every event in the claims flow must be digitally signed and logged**, in
  both directions, between provider systems, beneficiary apps and payer
  systems. Claim created, claim forwarded, data requested, authorisation,
  payment.
- **Logs must be append-only.** They must not be editable. The stated purpose is
  immutability, non-tamperability and non-repudiability.
- **Retention is set by the law of the land**, configurable, and the material
  deliberately does not name a period.
- **The audit trail must be transparently available to the customer.**

The exchange keeps its own audit log of every API call it receives: the domain
headers, the signature and encryption details, sender and recipient, and
whether validation passed. It never logs the payload, because it cannot read
it.

Two requirements on that log are worth knowing because they are things you can
use rather than things you must build.

- **The audit log is queryable through an API**, so a participant can retrieve
  the trail of its own transactions.
- **The exchange publishes reports against it** for payers, providers,
  beneficiaries, regulators and observers, and each instance publishes the list
  of reports it supports and the level of detail in each.

Each instance also defines an archival policy covering retention, deletion and
how to reach logs after archival. Ask for your instance's policy and its report
list during onboarding; neither is in the published material.

## Grievance redressal

The claims desk meets grievances as a communication reason code. The governance
layer underneath it is a published policy that every operator must produce and
every participant signs.

What the guidelines require of that policy:

- Digital initiation, routing and tracking of a grievance raised by any
  participant against any other.
- A published list of grievances covered, and a mechanism for those that are
  not.
- **Every participant must run a nodal governance body**, contactable at the
  digital and physical addresses given at onboarding, and those contact details
  are readable by every other participant through the registry. The exchange
  publishes its own governance body the same way.
- Published types, priorities and **service levels per grievance type**.
- A due-diligence cycle before responding, the right to **reopen**, and
  escalation to the exchange operator on accelerated timelines when the
  requester is not satisfied.
- Versioning, signature by new members at onboarding, and proactive notice of
  any change.

Two consequences for a build. Your registry entry is a published contact point
for disputes, so the mobile number and email on it are operational rather than
administrative. And a grievance has a service level attached, so the
communication inbox that receives one is not a mailbox somebody reads when they
can.

The guidelines are aligned with IRDAI's own grievance-redressal guidelines and
are explicitly a draft for consultation. The model policy has not been
published.

## Beneficiary authentication, generally

PMJAY biometrics are one case of a wider expectation. Provider systems are
expected to support Aadhaar eKYC for beneficiary verification, and Aadhaar
authentication by mobile OTP or biometric to initiate a claim transaction. The
guidelines note that provider systems enrolled with ABDM already hold biometric
devices, because health ID creation needs them. Payer systems and the exchange
integrate Aadhaar authentication for verifying the beneficiary at claim
validation.

Biometric Authentication in Building a Provider covers the scheme's own
implementation of this.

## Joining, and being removed

Onboarding is two stages, and the first certifies the second.

**Sandbox.** Apply, be verified as eligible, receive credentials, integrate,
then pass the functional and security tests that apply to your role. The
operator may require additional security review such as STQC or CERT-In. You
submit your test results, including how your application uses and interacts
with the exchange APIs, and on approval receive a completion certificate
**valid for a configured period**. Nobody states that period; ask.

**Production.** Register, using Health Facility Registry authentication where
you have it and documentary verification from IRDAI or an equivalent agency
where you do not. Your sandbox certificate is reviewed. Production credentials
are issued. Then go live, with the advice to plan change management, train
staff and pilot with a small set of clients first.

**Deboarding** happens three ways, and the second is the one to design against.

| Kind | Initiated by | Examples |
| :---- | :---- | :---- |
| Involuntary, by a regulator | IRDAI or a legal authority | A provider suspended for fraud; a TPA or payer deactivated |
| Involuntary, by the exchange | The operator | Serious or repeated policy violation, including grave service-level breaches; attempted unauthorised access; behaviour that destabilises the exchange, such as **frequent bursts of requests beyond authorised rate limits** |
| Voluntary | The participant | Moving to another exchange, shutting down, merging |

Involuntary removal comes with an elaborate warning mechanism and a right of
appeal through the grievance process.

That rate-limit clause is the only acknowledgement in the corpus that rate
limits exist. No number is published anywhere. Build a client that backs off
rather than one that retries hard, and ask for your instance's limits at
onboarding.

## What to ask for at onboarding

Everything the published material leaves blank, in this chapter and across the
documentation, collected so it is asked once.

- The exchange's **public key** for validating inbound JWTs, and the header the
  token arrives on.
- The instance's **audit report list** and the address of the audit query API.
- The instance's **archival policy**: retention, deletion, post-archival access.
- The **grievance policy**, its version, its covered types and their service
  levels, and the nodal contact you are expected to publish.
- The **rate limits** your participant code is subject to.
- The **validity period** of your sandbox certificate.
- Whether **STQC or CERT-In** review applies to you.
- The **turnaround-time windows** for preauthorisation and claim. The plan's
  `ScheduledTATApproval` flag says the period "varies with policy" and the FAQ
  says there is no fixed TAT as of now; no values are published.
- The **forward instruction** on coverage eligibility: its fields and its flow.
  The specification gives it one sentence.
- The **`/v1/error` body schema**. The sources say to implement the endpoint
  and receive the reject details, but its field names are not published.
- The **currency rule** for money fields. The claim sample carries no
  `currency` on `Claim.total`, the payment notice sample carries it on the paid
  amount, and no source states a rule.
- The **coverage-based insurance plan**. Only the package-based plan is
  sampled, in either direction.
- **Payment notices 31 and 33**. Only the initiation is sampled, so the notice
  that carries a real bank reference has never been observed.
- The **timestamp form**, format and zone. The handbook says Indian time
  (`+05:30`) and that UTC fails validation, the FAQ says UTC with a trailing
  `Z`, and the samples use `+05:30`.
