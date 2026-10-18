# A18. Biometric Authentication

#### A18E. ENDPOINT
Not an NHCX exchange: these are ABDM calls made by the application directly, as plain JSON, with no JWE, no protocol headers, no callback and no ledger row. Two hosts, and getting the host right is the first thing:

| Method | Calls | Sandbox base | Production |
|---|---|---|---|
| Fingerprint, iris, token refresh | `POST /auth/init`, `POST /auth/verify`, `GET /auth/refresh/token` | `https://apisbx.abdm.gov.in/hcx/abha/biometric` | not published; take it from the onboarding letter |
| Face | `POST /faceauth/init`, `POST /capture/pid`, `POST /v2/auth/verify` | `https://apisbx.abdm.gov.in/pmjay/sbxhcx/abdmproxy/abha/biometric` | not published |
| The patient's phone | the ABHA app opens `https://phrsbx.abdm.gov.in/face-auth?txnId=<txnId>` from a QR code | | not published |

Headers, every call: `Authorization: Bearer <ABDM session token>` from [G3. Session Token](../gateway/G3-session-token.md) (not `bearer_auth`, which the exchange reads; the wrong header draws a 401 that looks like an expired token). The fingerprint, iris and face-verify calls add `process` (`Preauth` at admission and before a pre-authorisation, `Discharge` at discharge and at every visit of a cyclic case) and `payerid` (the participant code of the payer the authentication is performed for, sent **as is**, for example `<payer code>` with its `@hcx` suffix; the knowledge source's `nhcx.endpoint.abha-biometric-*` atoms and `nhcx.concept.biometric-authentication` say "sending the payer's participant code in payerid") [PAYER](../references/PAYERS.md#markers). The face calls add `REQUEST-ID` (a fresh UUID) and `TIMESTAMP` (UTC, ISO 8601).

The source of the calls is the knowledge source: the NHCX package's `apis/14-biometric/` (six Bruno requests) and `docs/03-Building a Provider/03-Biometric Authentication.md`; on the MCP, `search_docs "biometric authentication"` and the endpoint atoms `nhcx.endpoint.abha-biometric-*`. NHA's own list calls this nha:D2.

#### A18D. DESCRIPTION
Proof that the patient was really at the hospital: the beneficiary authenticated against their ABHA, biometrically, and the **user token** that results carried on the exchange. It is done on the proof of presence card of the case ([S18. Beneficiary Verification](../screens/S18-beneficiary-verification.md)), shown at the top of the Pre-authorisation tab and of the Claim tab, **optional for any payer and required on a case whose payer's adapter requires proof of presence (`gov`) or whose insurance plan asks for the Aadhaar proof of identity (a plan-level requirement coded `ADN`, category POI)**: a token the desk has taken rides on the sends to any payer, and only such a case is refused without it ([PAYERS.md](../references/PAYERS.md)). The card shows no protocol words: the user-token header is never named on the screen.

**The stage is the screen's.** The card on the Pre-authorisation tab authenticates at stage `Preauth` (the scheme's process type `Preauth`): its token rides on the eligibility check and the pre-authorisation. The card on the Claim tab authenticates at stage `Discharge`, always, as the live PMJAY provider does (`verify?flow=Discharge`) [PAYER](../references/PAYERS.md#markers): its token rides on the claim. A call that names no stage takes the stay's: `Discharge` once the linked admission is discharged, else `Preauth`. The desk never picks the stage from a list. The methods need not match across a case: fingerprint at admission and face at discharge is fine.

**Before admission.** The pre-authorisation may be sent before the patient is admitted, so an authentication may be taken before any HMIS patient is linked to the case. Such a row belongs to the case alone ([D31. biometric_auth](../database/D31-biometric-auth.md) `claim_id`, patient empty), and its ABHA number is the case's. When the admission is linked (on the Claim tab, [D9. claim](../database/D9-claim.md)), every row of the case with no patient is moved to the linked patient.

All three methods are built, because any one of them may be the only one that works for a given patient [PAYER](../references/PAYERS.md#markers):

| Method | `authMode` | `scope` on init | How the capture reaches the application |
|---|---|---|---|
| Fingerprint | `FINGERPRINT` | `["abha-login", "aadhaar-bio-verify"]` | the device's PID block from the RD service on the desk machine, sent in `authData.bio.fingerPrintAuthPid` with `authMethods ["bio"]` |
| Iris | `IRIS` | `["abha-login", "aadhaar-iris-verify"]` | the PID block in `authData.iris.irisAuthPid` with `authMethods ["iris"]` |
| Face | `FACE_AUTH` | `["abha-enrol", "face-auth"]` on `faceauth/init` | the patient scans a QR code with the ABHA app and completes the scan on their phone; the application polls `capture/pid` until `COMPLETE`, then verifies with the Aadhaar number, RSA encrypted |

Fingerprint and iris are an init-then-verify pair on one host. `auth/init` names the ABHA number **with hyphens** (`91-4455-7788-2211`, the opposite of the envelope convention) as `loginId`, `loginHint` `abha-number`, `otpSystem` `aadhaar`, and answers a `txnId`. `auth/verify` sends that `txnId` and the PID block and answers the tokens. Face is four steps on the other host: `faceauth/init` answers a `txnId`; the application shows `https://phrsbx.abdm.gov.in/face-auth?txnId=<txnId>` as a QR code; `capture/pid` with the `txnId` answers `{"status": "PENDING"}` until the patient has finished and `{"status": "COMPLETE"}` after (poll it, there is no callback); `v2/auth/verify` sends `authData.face {txnId, aadhaar, mobile}` with `authMethods ["face_auth"]` and `authMode FACE_AUTH`, where `aadhaar` is the 12 digits sealed under the ABHA service's own certificate, the same key the M1 enrolment calls seal an Aadhaar with ([A19. ABHA Create and Verify (ABDM M1)](A19-abha-m1.md): `GET /abha/api/v3/profile/public/certificate`, `RSA/ECB/OAEPWithSHA-1AndMGF1Padding`, base64, fetched once an hour). There is no separate face-auth key to configure. The Aadhaar number is never logged, never stored and never checked as a 12-digit number after sealing.

A successful fingerprint or iris verify answers `authResult success`, a `token` (the user token, `expiresIn` 1800 seconds, thirty minutes), a `refreshToken` (`refreshExpiresIn` 1296000 seconds, fifteen days) and the ABHA `accounts` matched. The face verify (`v2/auth/verify`) answers a different shape (knowledge source `nhcx.endpoint.abha-biometric-v2-auth-verify`): no `authResult`; the tokens under `tokens` (`tokens.token`, `tokens.expiresIn`, `tokens.refreshToken`, `tokens.refreshExpiresIn`, the expiries as **strings**); and the account under `ABHAProfile` (`ABHANumber`). Read both shapes: a token is present when either `token` or `tokens.token` is, and the absence of `authResult` is not a failure. Both tokens are kept against the case ([D31. biometric_auth](../database/D31-biometric-auth.md)) and never shown on a screen or returned by an API. The refresh call (`GET auth/refresh/token` with `R-token: Bearer <refresh token>` beside `Authorization`, `process` and `payerid`) returns a new user token and a **new refresh token whose fifteen days run from that moment**; the old refresh token is discarded. Refresh automatically for the duration of a transaction cycle and at least once in every ten days; a token that has lapsed and cannot be refreshed means a fresh authentication.

**Where the token goes.** The sending APIs, for any payer, read the newest verified authentication for the case's patient (or, while the case has no patient, for the case), the payer (numeric part of the code compared) and the stage ([D31. biometric_auth](../database/D31-biometric-auth.md), `current`): one whose user token is live, else one whose refresh token is, refreshed first when the user token has lapsed and the refresh token has not, then put the user token in the request's JWE headers under the user-token header, with `x-hcx-ben-abha-id` carrying the beneficiary's ABHA number beside it. NHA has not published the user-token header's name [SANDBOX](../references/PAYERS.md#markers); it is a module setting (`biometric_token_header`, default `x-hcx-user-token`) to be corrected from the onboarding letter. [A2. Coverage Eligibility Check](A2-coverage-eligibility-check.md) (every purpose, stage Preauth, only once a patient is linked), A4. Pre-auth Submit (in nhcx-preauth) (stage Preauth, enhancements and query answers too) and A5. Claim Submit (in nhcx-claim) (stage Discharge) all do this; when no token is held, the headers go out as they always did.

**When a capture is impossible** under PMJAY (trauma, amputations, unreadable biometrics): the hospital obtains an Aadhaar exemption consent signed by the patient and a hospital representative, stores it against the beneficiary ([D28. claim_document](../database/D28-claim-document.md), category `INF`, code `ODN`), and the desk answers the scheme's consent questionnaire on the leg's forms card instead of sending a token: the **Authentication Consent** form (PMJAY questionnaire `100024`: item `100093` "Medical Superintendent Declaration Form (During Admission)", an `attachment`, and `100095` "Remarks", a `string`) at pre-authorisation on S9. Pre-authorisation (in nhcx-preauth); the **Discharge Consent** form (questionnaire `100466`: item `135477` "Medical Superintendent Declaration Form (During Discharge)", an `attachment`) at the claim on S11. Claim Submission (in nhcx-claim) ([F7. QuestionnaireResponse](../fhir/F7-questionnaireresponse.md), A4. Pre-auth Submit (in nhcx-preauth), A5. Claim Submit (in nhcx-claim)). The attachment, the signed declaration, is the desk's upload; every other question is answered by the application when the desk left it empty: the payer's initial answer, else the first option, else `yes` for a yes / no question, because the payer refuses a consent with an unanswered question (PAYR-1271) [PAYER](../references/PAYERS.md#markers). When proof of presence is required on the case and no token is held for the stage, the application adds the leg's consent form (found by title in the package master) to the leg's forms whether or not the ruling or the plan lists it (PMJAY's ruling names `100024` at pre-authorisation; nothing names `100466` at the claim), and it leaves the form out when it holds a token: a token and a consent are not both sent. Without either the pre-authorisation is refused PAYR-1256 and the claim PAYR-1363. A cyclic procedure has no fallback: the payer pays only for cycles with a live capture, every visit needs a real capture with `process` `Discharge`, and a refresh token is accepted only at the final claim [PAYER](../references/PAYERS.md#markers).

**Whose ABHA is not linked to their PMJAY card** cannot be authenticated this way at all; the scheme's other KYC procedures apply, and the consent route is not the answer for them.

Which payers: every payer takes the token when the desk has one; it is required (or the consent) on a case whose adapter is `gov` or whose plan asks for the `ADN` proof of identity, and the next action then reads "Authenticate the beneficiary" until a stage-`Preauth` token is held ([PAYERS.md](../references/PAYERS.md)). The consent fallback applies to those cases alone: for any other case with no token, the sends go out as they always did. The card ([S18. Beneficiary Verification](../screens/S18-beneficiary-verification.md)) says "Required by this payer" or "Optional for this payer".

Refused before any call:
- no linked patient and no case: "Choose a patient." / no payer: "Choose the payer the authentication is for."
- a stage other than the two: "Choose the stage of the stay: Preauth or Discharge."; a method other than the three: "Choose fingerprint, iris or face."
- fingerprint or iris without a 14-digit ABHA number: "A fingerprint or iris authentication names the ABHA number, 14 digits."
- verify of an attempt that is not `initiated` or `captured`: "That authentication attempt cannot be verified any more; start a new one."; verify without a capture: "Capture the fingerprint on the device and send its PID block." (likewise iris); face with no sealed Aadhaar: "An Aadhaar number has 12 digits.", with a number in clear: "Seal the Aadhaar number in the page before sending it; a number in clear is not accepted.", before the capture is complete: "The face capture is not complete yet; wait for the patient to finish the scan on their phone."
- a capture of an attempt that is not a face attempt: "Choose fingerprint, iris or face."
- a refresh of an attempt that is not verified: "Only a verified authentication has a token to refresh."
- a refresh whose refresh token has lapsed: "The refresh token has lapsed; authenticate the beneficiary again."

Errors from the service are shown in its words; a verify or refresh the service answers without a user token is refused "The biometric service answered without a user token." (a verify then leaves the attempt `failed`). **K-547** on a fingerprint or iris verify means the device capture was asked with `lr` as `N` in the wrapped Aadhaar data hash: the WADH is `Base64(SHA-256("2.5" + "F" + "Y" + "Y" + "N" + "N"))` for fingerprint, with `lr` **Y**. On the exchange, a request with neither a valid token nor the matching consent is refused by name: `PAYR-1256` at pre-authorisation, `PAYR-1363` at the claim; a lapsed or wrong token `PAYR-1272` and `PAYR-1366`; a cycle without a capture `PAYR-1367`, two captures on one date `PAYR-1369`.

#### A18Q. REQUEST

The application's own endpoints, all behind the session and all on one case: the patient is the case's linked patient (none before admission, the row then belongs to the case) and the payer is the case's payer id. The attempt an id names is looked up among the linked patient's attempts, or, while no patient is linked, among the case's own, so an authentication started before admission can still be captured, verified and refreshed; any other id is not found.

| Endpoint | Body | Posts to ABDM |
|---|---|---|
| `GET claims/:caseid/biometric?stage` | | nothing; lists `required` (proof of presence is required on the case), `stage` (the one asked, else the stay's), every attempt newest first, and the `current` attempt per stage |
| `POST claims/:caseid/biometric/init` | `stage` (`Preauth` from the Pre-authorisation tab, `Discharge` from the Claim tab; else the stay's), `method` (`FINGERPRINT`, `IRIS`, `FACE_AUTH`) | `auth/init` with `{scope, loginHint: "abha-number", loginId: <ABHA with hyphens>, otpSystem: "aadhaar", authMode}`; for face `faceauth/init` with `{scope: ["abha-enrol", "face-auth"]}` |
| `POST claims/:caseid/biometric/:id/capture` | | face only: `capture/pid` with `{txnId}` |
| `POST claims/:caseid/biometric/:id/verify` | `pid` (fingerprint, iris), or `aadhaar_encrypted` and `mobile` (face: the Aadhaar number sealed **in the page** under the ABHA service's certificate, [A19. ABHA Create and Verify (ABDM M1)](A19-abha-m1.md)'s `seal` with the certificate from `GET abha/certificate`; a number in clear is refused) | `auth/verify` with `{scope, authData: {authMethods: [bio or iris], bio or iris: {txnId, <pid key>: pid}}, authMode}`; for face `v2/auth/verify` with `{authData: {authMethods: ["face_auth"], face: {txnId, aadhaar: <sealed>, mobile}}, authMode: "FACE_AUTH"}` |
| `POST claims/:caseid/biometric/:id/refresh` | | `GET auth/refresh/token` with `R-token` |

The capture itself: the RD service of the registered device answers on `http://127.0.0.1:11100` to `11120`, method `CAPTURE`, with a `PidOptions` XML naming `fCount 1`, `fType 2`, `format 0`, `pidVer 2.0`, `env P` and the `wadh` above; the desk screen tries each port and sends the `PidData` XML it gets back as `pid`. A desk whose device is elsewhere pastes the PID block.

#### A18S. RESPONSE
`init` answers the attempt ([D31. biometric_auth](../database/D31-biometric-auth.md), status `initiated`, with the service's `txnId` and message) and, for face, the `qr_url` to show. `capture` answers the attempt and the service's `status` (`PENDING` or `COMPLETE`); `COMPLETE` moves the attempt to `captured`. `verify` answers the attempt as `verified` (flash "Beneficiary verified by <fingerprint, iris or face>"), with `token_valid` true, `token_expires_at`, `refresh_expires_at` and the ABHA matched; a refusal leaves it `failed` with the service's message. `refresh` answers the attempt with the new expiries. The listing answers `required` (whether the case is refused without a token or consent: the adapter requires proof of presence, or the plan asks for `ADN`), the `stage`, every attempt newest first (never a token: `token_valid` and `refreshable` instead), and `preauth` and `discharge`: the attempt whose token a send would carry now at each stage, or none.

Data: [D31. biometric_auth](../database/D31-biometric-auth.md), [D3. patient](../database/D3-patient.md), [D9. claim](../database/D9-claim.md)

#### A18P. PSEUDOCODE

```
function abdm_headers(payer_code, stage, with_process):
    h = {Authorization: "Bearer " + session_token()}        // G3, the ABDM session
    if with_process: h.process = stage; h.payerid = payer_code        // the participant code as is, not its numeric part
    return h

function face_headers(h): h["REQUEST-ID"] = uuid(); h.TIMESTAMP = now_utc_iso(); return h

function stage_for(case, asked):                         // the screen's stage, else the stay's
    if asked in {Preauth, Discharge}: return asked
    return Discharge if case's linked admission is discharged else Preauth

function init(case, asked_stage, method):
    patient_id = case.patient_id                         // none before admission: the row is the case's
    payer_code = case.payer_id
    if payer_code empty: refuse "Choose the payer the authentication is for."
    stage = stage_for(case, asked_stage)
    if method not in {FINGERPRINT, IRIS, FACE_AUTH}: refuse "Choose fingerprint, iris or face."
    abha = digits(case.abha_number or patient.abha_number when a patient is linked)
    if method != FACE_AUTH and len(abha) != 14: refuse "A fingerprint or iris authentication names the ABHA number, 14 digits."
    row = INSERT biometric_auth (patient_id or null, claim_id: case.id, payer_code, stage, method,
                                 status initiated, abha, requested_by)
    if method == FACE_AUTH:
        answer = POST face_base + "/faceauth/init" {scope: ["abha-enrol", "face-auth"]} with face_headers(abdm_headers(payer_code, stage, false))
    else:
        answer = POST bio_base + "/auth/init" {scope: scope(method), loginHint: "abha-number",
                     loginId: hyphenate(abha), otpSystem: "aadhaar", authMode: method} with abdm_headers(payer_code, stage, true)
    if answer failed or no txnId: row.status = failed; row.message = reason; raise
    row.txn_id = answer.txnId; row.message = answer.message
    return row, qr_url = face_qr_base + "?txnId=" + row.txn_id when FACE_AUTH

function find_attempt(case, id):                         // capture, verify and refresh name an attempt by id
    owned = biometric_auth WHERE patient_id = case.patient_id when a patient is linked,
            else WHERE claim_id = case.id                // before admission the attempt is the case's
    return owned[id] or not found

function capture(row):                                   // face only, polled by the screen
    if row.method != FACE_AUTH: refuse "Choose fingerprint, iris or face."
    answer = POST face_base + "/capture/pid" {txnId: row.txn_id} with face_headers(abdm_headers(row.payer_code, row.stage, false))
    if answer.status == "COMPLETE" and row.status == initiated: row.status = captured
    return row, answer.status

function verify(row, pid, aadhaar_encrypted, mobile):
    if row.status not in {initiated, captured} or no row.txn_id:
        refuse "That authentication attempt cannot be verified any more; start a new one."
    if row.method == FACE_AUTH:
        sealed = trim(aadhaar_encrypted)               // sealed in the page with A19's seal; the server never sees the number
        if sealed empty: refuse "An Aadhaar number has 12 digits."
        if sealed is all digits: refuse "Seal the Aadhaar number in the page before sending it; a number in clear is not accepted."
        if row.status != captured: refuse "The face capture is not complete yet; wait for the patient to finish the scan on their phone."
        answer = POST face_base + "/v2/auth/verify" {authData: {authMethods: ["face_auth"],
                     face: {txnId: row.txn_id, aadhaar: sealed, mobile}}, authMode: "FACE_AUTH"}
                 with face_headers(abdm_headers(row.payer_code, row.stage, true))
    else:
        if pid empty: refuse "Capture the <fingerprint or iris> on the device and send its PID block."
        key = "bio" if FINGERPRINT else "iris"; pidkey = "fingerPrintAuthPid" if FINGERPRINT else "irisAuthPid"
        answer = POST bio_base + "/auth/verify" {scope: scope(row.method), authData: {authMethods: [key],
                     key: {txnId: row.txn_id, pidkey: pid}}, authMode: row.method} with abdm_headers(row.payer_code, row.stage, true)
    t = answer.tokens or answer                      // face: tokens {...}, no authResult; bio/iris: top level with authResult
    if answer failed or (answer.authResult present and answer.authResult != "success") or no t.token:
        row.status = failed; row.message = reason; raise
    row.status = verified; row.user_token = t.token; row.token_expires_at = now + int(t.expiresIn)   // face sends the expiries as strings
    row.refresh_token = t.refreshToken; row.refresh_expires_at = now + int(t.refreshExpiresIn)
    row.abha = digits(answer.accounts[0].ABHANumber or answer.ABHAProfile.ABHANumber or row.abha); row.verified_at = now

function refresh(row):
    if row.status != verified or no row.refresh_token: refuse "Only a verified authentication has a token to refresh."
    if row.refresh_expires_at <= now: refuse "The refresh token has lapsed; authenticate the beneficiary again."
    h = abdm_headers(row.payer_code, row.stage, true); h["R-token"] = "Bearer " + row.refresh_token
    answer = GET bio_base + "/auth/refresh/token" with h
    row.user_token = answer.token; row.token_expires_at = now + answer.expiresIn
    if answer.refreshToken: row.refresh_token = answer.refreshToken; row.refresh_expires_at = now + answer.refreshExpiresIn

// linking the admission (Claim tab) hands the case's rows to the patient
function on_admission_linked(case, patient_id):
    UPDATE biometric_auth SET patient_id = patient_id WHERE claim_id = case.id AND patient_id is null

// what every send calls (A2, A4, A5), for any payer
function biometric_headers(case, payer_code, stage):
    owned = biometric_auth WHERE patient_id = case.patient_id when a patient is linked,
            else WHERE claim_id = case.id
    rows  = owned WHERE stage, status verified, numeric part of payer_code matches, newest verified first
    row   = first of rows whose user token is live, else first whose refresh token is
    if none: return {}
    if row.token_expires_at <= now: refresh(row)         // on failure: return {}; PMJAY's consent stands in, another payer gets no token
    return {settings.biometric_token_header: row.user_token, "x-hcx-ben-abha-id": row.abha}
```

#### A18U. USED BY
- Screens: [S14. Patient Registration Form](../screens/S14-patient-registration-form.md), [S18. Beneficiary Verification](../screens/S18-beneficiary-verification.md)
- APIs: [A2. Coverage Eligibility Check](A2-coverage-eligibility-check.md), [A19. ABHA Create and Verify (ABDM M1)](A19-abha-m1.md)
- FHIR: [F7. QuestionnaireResponse](../fhir/F7-questionnaireresponse.md)
- Database: [D12. claim_plan_form](../database/D12-claim-plan-form.md), [D31. biometric_auth](../database/D31-biometric-auth.md)
- Tests: [T13. PMJAY Eligibility, Package Master and Ruling](../tests/T13-pmjay-eligibility-and-package-master.md), [T19. PMJAY Beneficiary Verification and ABHA](../tests/T19-pmjay-biometric-and-abha.md)
