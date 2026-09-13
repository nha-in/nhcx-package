# Going live

Going live is a certification followed by a switch. The sandbox proves the integration against the exchange and its dummy payer. NHA then certifies it, production credentials are issued, and the participant is registered again in production before the first real case travels. This chapter puts the steps in order and names the chapter that covers each one.

## In short

- Finish the sandbox exit list for your side, get your FHIR bundles validated, and give the demos.
- Production credentials come from NHA for a hospital, and through the NHA or IRDAI portal for a payer or TPA.
- Register the participant again in production, through the passcode flow, with your production certificate and callback address.
- Point every base URL at production. Only some production addresses are published; the rest come with your onboarding.
- Pilot on a few real cases before switching the whole organisation.

## 1. Leave the sandbox

Run every test case on the exit list for your side: the Provider Checklist for a hospital, the Payer Checklist for an insurer, scheme or TPA. Cancel and reprocess, status and search are on both lists. A payer is also checked on the four validations every response must pass, on every use case.

Then:

- Email sample FHIR bundles to `hcx.integration@nha.gov.in` for NRCeS validation.
- Give the internal demo to the NHA team, then the HTC demo before NRCeS, IRDAI, TCS and NHA.
- Under PMJAY, add the PMJAY team demo, complete the WASA security audit, and submit the NHCX sandbox exit form.

## 2. Get production credentials

For a hospital, NHA confirms the certification and adds the provider role to the production client ID.

A payer or TPA enrols through the NHA or IRDAI portal. The portal registers it after scrutiny and asks the ABDM gateway team to issue credentials with the payer or TPA role.

Under PMJAY, the integrator receives production keys for NHCX on successful completion, and the same keys serve for private insurer claims.

## 3. Register in production

The production participant service is `https://apisprod.nha.gov.in/pmjay/hcx/participanthcxservice`. Registration there takes four steps, and each confirmation needs a passcode sent to the registered mobile number:

1. **Create** the participant, with the mobile number exactly as your HFR record holds it, or for a payer as NHA holds it.
2. **Confirm** with the transaction ID and passcode. The participant becomes active.
3. **Update** it with your production certificate and callback address. A second transaction ID and passcode arrive.
4. **Confirm again.** The certificate and address go live.

Passcodes and transaction IDs are valid for 24 hours; if one is lost, repeat that step. In production the registry ID is the HFR ID for a hospital and the IRDAI ID without leading zeros for a payer, and sending the wrong one is a common production failure. Creating and Updating a Participant has every call.

Fetch your own certificate back from the production registry, and check that it matches your private key, before anything is sent.

## 4. Switch the addresses

Every base URL changes. Base URLs, in Getting Started, lists them for both environments. The participant service's production address is published; the exchange's production base is shared after sandbox exit. Keep every base in configuration, and check each one against your onboarding letter.

If you run the NHCX Adapter, set `env` to `production`, confirm `auth.mode` with your onboarding contact, and expect the API key to be required. Its production addresses follow the pattern of swapping the sandbox hostnames, which is an inference, so override any that differ from your letter.

## 5. Open the network path

The exchange calls your callback from three addresses. Allow all three inbound:

```
3.109.99.210
13.126.152.0
13.200.129.223
```

The callback address must be a domain name over HTTPS, with TLS 1.2 or newer, hosted in India. It must not be an IP address, and it must not carry a port number.

## 6. Under PMJAY, plan the cutover

After the participant is created and configured in production, the hospital raises a ticket carrying its existing PMJAY hospital ID, the HEM ID used in TMS, and the new NHCX participant ID. NHA's operations team maps the two by hand, and that mapping is the switch. Preauthorisations and claims raised before it finish their life in TMS; everything raised after it goes through the HMIS. For a while both run at once, so brief the desk and plan the day.

## 7. Pilot, then switch

NHA recommends a small pilot on a few real cases, and staff training, before switching fully.

## Before you switch

- Sandbox exit list complete, bundles validated by NRCeS, and the demos given.
- Production credentials issued with the right role.
- Production participant active, with the certificate and callback address registered and confirmed, and your own certificate fetched back and checked.
- Every base URL pointed at production and held in configuration.
- The three exchange addresses allowed inbound, and the callback on HTTPS with TLS 1.2 or newer, hosted in India.
- For a payer, every policy linked with the correct processor, and the plan master versioned and published for every empanelled hospital.
- Under PMJAY, the mapping ticket raised, and the desk briefed that in-flight TMS cases finish in TMS.
- A pilot planned.

## Next steps

- Provider Checklist and Payer Checklist: the sandbox exit lists
- Creating and Updating a Participant: the production registration calls
- Base URLs: every address in both environments
- PMJAY on NHCX: the scheme's integrator journey from Milestone 1 to the mapping ticket
