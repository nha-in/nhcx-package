# Base URLs

Every NHCX call is a base URL followed by a path. Each base URL is fixed: one value in the sandbox and one in production. It does not change from call to call or from participant to participant. The paths are the same in both environments. Each service has its own base, so keep the bases in configuration and set them once per environment.

## In short

- Each service has its own base. The exchange, the participant service and the ABDM gateway are three different bases, not one.
- A path in this documentation, such as `/v1/preauth/submit`, goes after the base of the service that serves it.
- Each base is a fixed value for its environment. A production base the table below does not list is given to you at onboarding. Going Live has the order of the switch.

## Every base, in both environments

<!-- build-docs:baseurls -->
| Service | Sandbox | Production |
| :---- | :---- | :---- |
| ABDM session token | `https://dev.abdm.gov.in` | `https://apis.abdm.gov.in`. ABDM's published production gateway. Confirm it in your onboarding letter. |
| NHCX exchange | `https://apisbx.abdm.gov.in/hcx` | `https://apisprod.nha.gov.in/hcx`. NHA's published use-case base. Production access starts once the provider role is assigned after sandbox exit. |
| Participant service | `https://apisbx.abdm.gov.in/pmjay/sbxhcx/participanthcxservice` | `https://apisprod.nha.gov.in/pmjay/hcx/participanthcxservice` |
| ABDM proxy | `https://apisbx.abdm.gov.in/pmjay/sbxhcx/abdmproxy` | Not published. Confirm at onboarding. |
| PMJAY payer service, role lookup | `https://apisbx.abdm.gov.in` | Not published. Confirm at onboarding. |
| PMJAY payer service, act on a case | `https://apisbeta.nha.gov.in` | Not published. Confirm at onboarding. |
| Dummy payer | `https://apisbx.abdm.gov.in/pmjay/sbxhcx/dummyhcxpayer` | A sandbox test hook only. |
| NHCX portal | `https://hcxsbx.abdm.gov.in` | `https://nhcx.abdm.gov.in`. NHA's published production portal. |
| Face authentication page | `https://phrsbx.abdm.gov.in/face-auth` | Not published. |

What each one serves:

- **ABDM session token**: The session token every other call carries, at /api/hiecm/gateway/v3/sessions.
- **NHCX exchange**: Every use-case call under /v1, fingerprint and iris authentication under /abha.
- **Participant service**: Creating and updating a participant, the registry search, certificates and policies.
- **ABDM proxy**: Face authentication for PMJAY biometrics.
- **PMJAY payer service, role lookup**: The roles a PMJAY adjudicator user holds, at /pmjay/sbxhcx/nhcxpayerservice/v1/get/user-role.
- **PMJAY payer service, act on a case**: Acting on a PMJAY case, at /pmjay/hcx/nhcxpayerservice/wrapper/process/case.
- **Dummy payer**: The sandbox test hooks that make the dummy payer answer.
- **NHCX portal**: The portal, the sandbox Swagger specifications it publishes, and notification subscribe.
- **Face authentication page**: The QR page a patient opens to complete face authentication, with ?txnId=<txnId>.

The ABDM gateway also reads `X-CM-ID` on the session call: `sbx` in the sandbox, `abdm` in production.
<!-- build-docs:end -->

On the sandbox, a preauthorisation is therefore posted to `https://apisbx.abdm.gov.in/hcx/v1/preauth/submit`, and a participant is created at `https://apisbx.abdm.gov.in/pmjay/sbxhcx/participanthcxservice/v2/participant/create`.

## Three things that are easy to get wrong

**The use-case path is `/hcx/v1`, the participant path is `/pmjay/sbxhcx/participanthcxservice`.** They are different services on the same host and neither prefix works for the other.

**Biometrics span two bases.** Fingerprint and iris sit under the exchange's `/abha/`; face authentication sits under the ABDM proxy's `/abha/`. A client that assumes one base path for all three will fail on face authentication alone.

**The payer service spans two hosts.** The role lookup is on `apisbx.abdm.gov.in` and the action endpoint on `apisbeta.nha.gov.in`.

## Production

The production bases are fixed values. The participant service's is `https://apisprod.nha.gov.in/pmjay/hcx/participanthcxservice`, and the ABDM gateway's is `https://apis.abdm.gov.in`. NHA's environments page also lists the production exchange as `https://apisprod.nha.gov.in/hcx` and the production portal as `https://nhcx.abdm.gov.in`; confirm both against your onboarding letter before switching. A production base the table does not list is given to you at onboarding, and it too is one fixed value. When you go live, set each base to its production value once.

## Next steps

- Session Token: the first call, made against the ABDM gateway's base
- Environments and Addresses, in the Reference: every full address, the headers each service reads, and the firewall
- Going Live: when and how each base changes to production
