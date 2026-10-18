# L7. Dry-run Tests

#### L7G. GOAL
Prove the code behaves as specified without touching NHCX or the ABDM registry. Everything outside the process is replaced: NHCX answers from a fake, the registry from fixtures, and inbound messages are fed straight to G8 and C1.

#### L7I. INPUTS
- `nhcx-plan/code.json`, `nhcx-plan/validation.json` (only validated files are tested).
- The test framework and command from discovery.json.

### L7.1 Set up the fakes
- A fake NHCX endpoint for G7 that records each request and answers 202, a non-2xx with an error body, or a transport failure, as the test asks.
- Registry fixtures for G4 (a participant record and certificate) and G10 (a policy search reply, and the "No policies found" error).
- A test key pair, so G6 encrypts and decrypts for real.
- A test database with the migrations applied.
- **The test process never opens the real gateway configuration or the participant's private key**, and never starts the gateway's loops (G1). A target that reads its environment file at start-up does this by accident: in the target's test settings pin the NHCX settings off, point the gateway at a throwaway configuration with a key pair generated for the run, add a loopback-only network guard (any connection to a host other than the fakes fails the test), use a temporary archive and ledger directory, and keep the tests off any shared cache or queue, so a developer's or CI's run can never send to NHCX or read another process's state.
- Received bundles taken from the knowledge source: `get_fhir_example` (MCP) or `nhcx-plan/knowledge/nhcx-package/fhir/` (package), copied into `tests/nhcx/fixtures/bundles/` with their source noted.

### L7.2 Test the FHIR mappers (F)
For each builder, build from fixture rows and check every FnF element and the F1 bundle order. Compare it element by element with the knowledge source's example bundle for the same exchange (`get_fhir_example`, or the package's `fhir/<use case>/` bundle); `validate_fhir` is not used on NHCX bundles ([KNOWLEDGE.md](../references/KNOWLEDGE.md)). For each parser, feed a bundle written from the FnF description and check the D columns it fills.

### L7.3 Test the APIs (A)
For each A, drive its pseudocode: every pre-send refusal (message verbatim), the successful send (the request G7 made, the D rows and statuses written), a send failure that names ids, and one that names none.

### L7.4 Test the callbacks (C)
For each C, hand an envelope to G8 (encrypted with the test key) or straight to C1, and check the result (`settled`, `unmatched`, `ignored`, `rejected`, `error`), the D changes, and the answer G8 gives. Include a redelivery and a `ProtocolResponse` for each.

### L7.5 Test the gateway (G)
Headers (G5), encryption round trip (G6), send result and error codes (G7), inbound refusal codes such as `WRONG_RECIPIENT` and `DECRYPT_FAILED` (G8), ledger queries and their order (G9). **One large-message test**: a generated InsurancePlan bundle of at least 50 MB, encrypted to the test key, posted to `/in/v1/insuranceplan/on_request` chunked (no `Content-Length`) through the application's real request path, must come back 202 and settle the master `ready` with every package, within 60 seconds and without the process memory growing past three times the body size ([G8. Receive](../gateway/G8-receive.md), [G6. Encryption](../gateway/G6-encryption.md)). A fixture of a few kilobytes does not prove this path.

### L7.6 Test the screens (S)
Render each screen with fixture data and check fields, options, columns, chips, empty states and validation messages; post each action and check where it leads.

### L7.7 Run the whole flow dry
One test walks a claim from S1 to S12 against the fakes: policy search, eligibility, the plan (fetched without the desk asking once the validation leaves the case in force, when `plan.trigger` is automatic), line items quoted from it on the Pre-authorisation tab, pre-auth, a query and its reply (sent as `request.initiated`), the admission linked on the Claim tab by ABHA, claim, payment, its acknowledgement and its posting to billing. The eligibility fake answers with **three family members**, and the test proves the case waits for the desk's choice (`beneficiary_pending`), refuses the link, the plan fetch and the send until then, and carries the chosen member's details and id afterwards (S3. Policy Discovery (in nhcx-coverage), C2. Coverage Eligibility Verdict (in nhcx-coverage)). A second claim under the same policy reuses the first claim's `ready` master with no second plan request ([A3. Insurance Plan Request](../apis/A3-insurance-plan-request.md)), and every plan request and status enquiry the flow sends carries workflow id `1`. Once the claim is sent, the flow proves the core rule: adding a line, saving the pre-authorisation details, attaching a pre-authorisation document and sending an enhancement are each refused with "The claim has gone to the payer, so the pre-authorisation is read only: no enhancement or change can be made. It can only be cancelled while the payer is deciding the claim."; a cancel while the claim is `submitting` is accepted for sending; after the claim verdict a cancel is refused with "The payer has decided the claim; the pre-authorisation can no longer be cancelled."; and a claim refused at the door (a send failure, never at the payer) leaves the pre-authorisation open. The flow also proves that a decided claim is not sent again ("The payer has decided this claim; it goes back for another look as a reprocess request, not as a claim sent again.") and that a reprocess is refused on any claim but a `rejected` one ("Only a claim the payer has rejected can be sent back for reprocessing.").

#### L7O. OUTPUT
Test files in the target's test layout, and `nhcx-plan/dry-run.json`:

```json
{
  "command": "",
  "run_at": "<ISO time>",
  "tests": [
    {"file": "", "name": "", "covers": ["C5", "D18.status"], "result": "pass | fail | skip", "failure": ""}
  ],
  "coverage": {"S": [], "A": [], "C": [], "F": [], "D": [], "G": []},
  "summary": {"pass": 0, "fail": 0, "skip": 0},
  "corrections": []
}
```

#### L7L. LOG
Record in `nhcx-plan/progress.json` and regenerate `nhcx-plan/progress.md`, as [LOG.md](LOG.md) describes. One entry per sub-step, and one per test file created or modified, with the spec ids it covers. Each test run is logged with its pass, fail and skip counts, and every write to `nhcx-plan/dry-run.json`.

#### L7X. EXIT
- Every spec id in code.json `coverage` is covered by at least one passing test.
- The full dry flow (L7.7) passes.
- No test calls a real network address.
- Every sub-step of L7 has its `started` and closing entries in progress.json, and every file changed is named in one.
