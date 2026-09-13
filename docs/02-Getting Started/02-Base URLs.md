# Base URLs

Every NHCX call is a base URL followed by a path. The paths are the same in the sandbox and in production. The bases are not, and they differ from one service to the next, so keep each one in configuration rather than in code.

## In short

- Each service has its own base. The exchange, the participant service and the ABDM gateway are three different bases, not one.
- A path in this documentation, such as `/v1/preauth/submit`, goes after the base of the service that serves it.
- Only some production bases are published. The rest arrive with your onboarding; Going Live has the order of the switch.

## Every base, in both environments

<!-- build-docs:baseurls -->
| Service | Sandbox | Production |
| :---- | :---- | :---- |
| ABDM session token | `https://dev.abdm.gov.in` | `https://apis.abdm.gov.in`. ABDM's published production gateway. Confirm it in your onboarding letter. |
| NHCX exchange | `https://apisbx.abdm.gov.in/hcx` | Shared by NHA after sandbox exit. |
| Participant service | `https://apisbx.abdm.gov.in/pmjay/sbxhcx/participanthcxservice` | `https://apisprod.nha.gov.in/pmjay/hcx/participanthcxservice` |
| ABDM proxy | `https://apisbx.abdm.gov.in/pmjay/sbxhcx/abdmproxy` | Not published. Confirm at onboarding. |
| PMJAY payer service, role lookup | `https://apisbx.abdm.gov.in` | Not published. Confirm at onboarding. |
| PMJAY payer service, act on a case | `https://apisbeta.nha.gov.in` | Not published. Confirm at onboarding. |
| Dummy payer | `https://apisbx.abdm.gov.in/pmjay/sbxhcx/dummyhcxpayer` | A sandbox test hook only. |
| NHCX portal | `https://hcxsbx.abdm.gov.in` | Not published. |
| Face authentication page | `https://phrsbx.abdm.gov.in/face-auth` | Not published. |

What each one serves:

- **ABDM session token**: The session token every other call carries, at /api/hiecm/gateway/v3/sessions.
- **NHCX exchange**: Every use-case call under /v1, fingerprint and iris authentication under /abha.
- **Participant service**: Creating and updating a participant, the registry search, certificates and policies.
- **ABDM proxy**: Face authentication for PMJAY biometrics.
- **PMJAY payer service, role lookup**: The roles a PMJAY adjudicator user holds, at /pmjay/sbxhcx/nhcxpayerservice/v1/get/user-role.
- **PMJAY payer service, act on a case**: Acting on a PMJAY case, at /pmjay/hcx/nhcxpayerservice/wrapper/process/case.
- **Dummy payer**: The sandbox test hooks that make the dummy payer answer.
- **NHCX portal**: The portal, the live Swagger specifications it publishes, and notification subscribe.
- **Face authentication page**: The QR page a patient opens to complete face authentication, with ?txnId=<txnId>.

The ABDM gateway also reads `X-CM-ID` on the session call: `sbx` in the sandbox, `abdm` in production.
<!-- build-docs:end -->

On the sandbox, a preauthorisation is therefore posted to `https://apisbx.abdm.gov.in/hcx/v1/preauth/submit`, and a participant is created at `https://apisbx.abdm.gov.in/pmjay/sbxhcx/participanthcxservice/v2/participant/create`.

## Three things that are easy to get wrong

**The use-case path is `/hcx/v1`, the participant path is `/pmjay/sbxhcx/participanthcxservice`.** They are different services on the same host and neither prefix works for the other.

**Biometrics span two bases.** Fingerprint and iris sit under the exchange's `/abha/`; face authentication sits under the ABDM proxy's `/abha/`. A client that assumes one base path for all three will fail on face authentication alone.

**The payer service spans two hosts.** The role lookup is on `apisbx.abdm.gov.in` and the action endpoint on `apisbeta.nha.gov.in`.

## Production

The participant service's production address is published, and so is ABDM's production gateway. NHA shares the exchange's production base after sandbox exit. The NHCX Adapter assumes the pattern of swapping the sandbox hostname for the others, but that is an inference. Check every production base against your onboarding letter before you switch.

## Next steps

- Session Token: the first call, made against the ABDM gateway's base
- Environments and Addresses, in the Reference: every full address, the headers each service reads, and the firewall
- Going Live: when and how each base changes to production
