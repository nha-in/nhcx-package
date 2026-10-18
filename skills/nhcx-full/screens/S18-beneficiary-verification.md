# S18. Beneficiary Verification Screen

#### S18R. ROUTE
No route of its own. It is a card at the top of two tabs of the Claim Detail shell S6:
- claims/view/:caseid/preauth: stage `Preauth`, card "Beneficiary verification".
- claims/view/:caseid/claim: stage `Discharge`, card "Discharge verification".

There is no Verification tab. The old tab key `verification` opens the Pre-authorisation tab ([S6. Claim Detail](S6-claim-detail.md)). The card's actions post to the application's biometric endpoints ([A18. Biometric Authentication](../apis/A18-biometric-authentication.md)) and the card re-reads itself; nothing on it goes to NHCX.

Breadcrumb: Claims (claims/list, S5) > <case number> (S6)

#### S18D. DESCRIPTION
The card proves the beneficiary is at the hospital by authenticating them against their ABHA ([A18. Biometric Authentication](../apis/A18-biometric-authentication.md)). It keeps the user token that results where the sends read it ([D31. biometric_auth](../database/D31-biometric-auth.md)).

**When the card shows.** Only when proof of presence is required on the case: the payer's adapter requires it ([PAYERS.md](../references/PAYERS.md)), or the case's insurance plan lists the Aadhaar proof of identity among its policy documents (document code `ADN`, [S7. Insurance Plan](S7-insurance-plan.md)). Otherwise neither tab shows it, and the sends carry no token. A chip at the top of the card reads "Required by this payer" ("Optional for this payer" when the listing says the payer does not require it).

**The stage is the screen's.** The card on the Pre-authorisation tab authenticates at stage `Preauth`: its token rides on the pre-authorisation ([A4. Pre-auth Submit](../apis/A4-preauth-submit.md)), enhancements and query answers included. The card on the Claim tab authenticates at stage `Discharge`: a fresh capture whose token rides on the claim ([A5. Claim Submit](../apis/A5-claim-submit.md)). A pre-authorisation token never serves the claim, whatever its life. A host that shows the card elsewhere, with no stage named, uses the stay's stage: `Discharge` once the linked admission is discharged, else `Preauth`. On a cyclic case every visit is a Discharge-stage capture [PAYER](../references/PAYERS.md#markers).

**Works before admission.** A pre-authorisation can go before the patient is admitted ([S9. Pre-authorisation](S9-preauthorisation.md)), so the card does too. With no patient linked to the case, an attempt belongs to the case alone (patient empty). When the admission is linked ([S4. Pre-authorisation Details and Admission Link](S4-claim-creation-form.md)) every such attempt moves to that patient.

**Next action.** While proof is required and no `Preauth` token is held, and the case is still before its pre-authorisation (stage `eligibility`, or `preauth` / `enhancement` at `draft` or `refused`), S6 offers "Authenticate the beneficiary", opening the Pre-authorisation tab.

**What the card says.** The current authentication for the case's patient (or the case), the payer and the stage ([D31. biometric_auth](../database/D31-biometric-auth.md), `current`):

| State | Chip (tone) | Beside it |
|---|---|---|
| Token live or refreshable | "Verified, token live" (success) | "by <method> at <time>, token until <time>", and a "Refresh token" button while the refresh token holds |
| Verified before, token gone and not refreshable | "Verified, token lapsed" (warning) | nothing |
| Never verified, payer requires it | "Not verified: the consent questionnaire stands in on the send" (warning) | nothing |
| Never verified, payer does not require it | "Not verified: the sends carry no token" (warning) | nothing |

The method word is lower case: fingerprint, iris, face. The card never shows a token, a transaction id, a correlation id or the header the token travels under. It reads only whether the token is valid and whether it can be refreshed.

**When the listing is refused**, its refusal shows in the danger colour in place of the method row, for example "Choose a patient.". A failed read of the card shows the refusal text alone in the card.

**Authenticating.** A small button group of three methods, Fingerprint, Iris and Face; the chosen one is primary. Beside it a primary "Authenticate the beneficiary" ("Authenticate again" once an attempt was verified at this stage). It starts an attempt at the card's stage with the ABHA on the policy, else the patient's.
- Fingerprint and iris open a capture panel: "<Method>: place the finger on the device" (iris: "<Method>: hold the eye to the device"), a "Capture from the device" button that asks the RD service on this machine (ports 11100 to 11120, method `CAPTURE`, the `PidOptions` and the WADH of A18), a multi-line text box "PID block from the RD service (pasted, when the device is not on this machine)", "Verify" (enabled once a PID block is present) and "Cancel". No RD service answering shows the error flash "No RD service answered on this machine (ports 11100 to 11120); paste the PID block from the device instead."
- Face shows the QR code of the service's face-auth page for the attempt, "Scan the code with the ABHA app", and polls for the capture every 4 seconds ("Awaiting the capture..."). Once captured it asks "Aadhaar number" (help "sealed in this page under the ABHA service's certificate, never sent or stored in clear"; the page seals it with [A19. ABHA Create and Verify (ABDM M1)](../apis/A19-abha-m1.md)'s client and sends only the ciphertext) and "Aadhaar-linked mobile", then "Verify" and "Cancel". An Aadhaar number that is not 12 digits is refused in the page before any call: "An Aadhaar number has 12 digits."
- Success: the service's message as a success flash, the panel closes and the card re-reads. Failure: the refusal as an error flash, and the attempt is listed as failed.

**Every attempt.** A collapsible "Every attempt (<n>)", closed by default, folds out a table newest first: Stage, Method, Status (chip: Verified success, Failed danger, Initiated or Captured info), Time (verified time, else created time), Reason (the service's words for a failed attempt, else "-").

**Refusals** are A18's, shown verbatim as an error flash:
- "Choose a patient."
- "Choose the payer the authentication is for."
- "A fingerprint or iris authentication names the ABHA number, 14 digits."
- "Capture the <fingerprint or iris> on the device and send its PID block."
- "An Aadhaar number has 12 digits."
- "Seal the Aadhaar number in the page before sending it; a number in clear is not accepted."
- "The face capture is not complete yet; wait for the patient to finish the scan on their phone."
- "That authentication attempt cannot be verified any more; start a new one."
- "Only a verified authentication has a token to refresh."
- "The refresh token has lapsed; authenticate the beneficiary again."
- "Choose the stage of the stay: Preauth or Discharge."
- "Choose fingerprint, iris or face."
- "The biometric service answered without a user token."

Data: [D31. biometric_auth](../database/D31-biometric-auth.md)

Data: [D3. patient](../database/D3-patient.md)

API: [A18. Biometric Authentication](../apis/A18-biometric-authentication.md)

#### S18L. LAYOUT
The arrangement below is the reference implementation's [REF](../references/PAYERS.md#markers): follow the target HMIS's own screen conventions. What is required is in DESCRIPTION and ACTIONS. Build it from the host's own card, chip, button group, text box, collapsible and table (the component kit, [SCREENS.md](../references/SCREENS.md)).

```
|------------------------------------------------------------------|
| [Card] Beneficiary verification                                  |
|  [Required by this payer] [Verified, token live] by fingerprint  |
|  at 10:32, token until 11:02            [(refresh) Refresh token]|
|  [Fingerprint] [Iris] [Face]        [Authenticate again]         |
|  ----------------------------------------------------------------|
|  Fingerprint: place the finger on the device                     |
|  [(fingerprint) Capture from the device]                         |
|  PID block from the RD service (pasted, when the device is       |
|  not on this machine)                                            |
|  [________________________________________________]              |
|  [(check) Verify]  [Cancel]                                      |
|  > Every attempt (3)                                             |
|------------------------------------------------------------------|
```

- The card sits first on its tab, above everything else.
- The face panel replaces the capture panel: the QR code on the left (about 9rem square, on white), the instruction and the waiting line beside it, then the Aadhaar and mobile boxes once captured.

#### S18A. ACTIONS
1. Fingerprint / Iris / Face: choose the method.
2. Authenticate the beneficiary (or again): A18 init at the card's stage; open the capture or face panel.
3. Capture from the device: read the RD service and fill the PID block.
4. Verify: A18 verify with the PID block, or the sealed Aadhaar number and mobile for face; re-read the card.
5. Refresh token: A18 refresh on the current authentication.
6. Cancel: close the panel; the attempt stays listed as initiated.
7. Every attempt: fold the history out or away.
