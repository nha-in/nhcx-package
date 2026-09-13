# Policies and plans

Before a payer can answer a single claim question, two things have to be true on the network: the beneficiary has to be findable, and the policy has to be readable as data. The first is linking. The second is the insurance plan.

## Linking beneficiaries

### What the user does

A policy-admin screen. When a policy is written or renewed, the operator records the holder's ABHA number, mobile and member ID against the products on the policy, and names who will process claims for it. In most payers this should be automatic from the policy system, with the screen kept for corrections.

The processor is the decision that matters. An insurer that adjudicates its own claims names itself. One that uses a TPA names the TPA's participant code. Get it wrong and every provider will send the case to the wrong place.

### What the system calls

```
POST /participant/link/abha/policy
POST /participant/delink/abha/policy
```

Bodies and rules are in Getting Started. Two operational points. Only the participants named as payer or processor on the link can change it, and the exchange checks the caller's token against them. So the linking job must run under the same credentials that created the participant. And a change of TPA is a batch: de-link every affected policy with the old processor, link again with the new; there is no edit.

## Publishing the plan

### What the scheme team does

A plan-configuration screen that maintains, per policy and per empanelled hospital:

- The specialties, and the packages under each with their rate.
- The add-ons allowed, meaning implants, bed-category stratification, high-end medicines and investigations, with their maximums.
- The flags that govern each package.
- The mandatory documents at policy and package level, and the questionnaires. Every change bumps a version.

The flags are the scheme's rules made machine-readable, and the provider's screen is built from them. The set the handbook lists is government-reserved, auto-approval, enhancement allowed, scheduled TAT approval, quantity allowed and day care. Then implant applicable and maximum implants, stratification allowed and maximum, standalone, parent procedure, unspecified, and cyclic with maximum cycles. Then LAMA/DAMA procedure and its stages, procedure type (surgical, medical, conservative), length of stay, and GST.

### What the system hosts

```
/v1/insuranceplan/request      answer on /v1/insuranceplan/on_request
```

The request is a `Task` with code `poll` and inputs `policyNumber` and `providerId`. The answer is scoped to that provider: only the specialties and packages its empanelment allows. That scoping is a validation as much as a filter. The payer's own error codes reject a policy not allowed for the hospital, a renewal code that does not match, a policy with no specialty configured, and an HFR ID it has no enrolment for.

Answer with a collection bundle: one `InsurancePlan`, the `Organization`s, and one `Questionnaire` per requirement. The reference sample carries 2,215 questionnaires and is 21 MB; that is what a real PMJAY plan looks like. Build the bundle from the plan master, never by hand.

### The two shapes

The Insurance Plan guide gives two ways to structure benefits, and a payer picks one per plan.

**Package-based**, the PMJAY shape: `plan → specificCost → category → benefit → cost → qualifiers`. Specialty is the category, package is the benefit, the rate is the cost, and add-ons are qualifiers on the cost. Claim conditions, exclusions and document requirements hang off the plan as extensions.

**Coverage-based**, the private-insurer shape: `coverage → benefit → limit`. Coverage types such as in-patient, benefits such as ICU charges and room rent, and a limit per benefit with its own conditions and required documents.

Element tables for both are in the FHIR Reference.

### Keeping it honest

- Refresh is the provider's job, but a `policychange` communication from the payer is what tells providers to do it early. Send one whenever a rate or package changes.
- Concurrency: a second plan request while the first is still being answered is refused by the reference payer with a wait-and-retry error. Design the request handler to be idempotent per correlation ID.
