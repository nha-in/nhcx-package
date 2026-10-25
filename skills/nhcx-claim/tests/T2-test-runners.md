# T2. Test Runners

#### T2D. DESCRIPTION

Every test in this folder is written twice, once per runner, and both are required. The GUI runner proves an operator can do it through the screens; the CLI runner proves the services do it without the screens, and is what a pipeline runs. They share one scenario per test: the same setup, the same payer decisions, the same expectations. A test is `pass` only when every runner it was asked to run passes.

The CLI runner calls the application's services (A) as functions inside the application's process (a management command, a console task, a script run with the application's context), never the gateway over HTTP (CORE instruction 1). Everything a test changes goes through the same services and callbacks the screens use, so both runners exercise the same code.

#### T2S. SETUP

Where the files go, in the target's own test layout:

| Path | Holds |
|---|---|
| `tests/nhcx/e2e/config.example.env` | Every [T1. Test Configuration](T1-test-configuration.md) variable, no secrets. |
| `tests/nhcx/e2e/scenarios/` | One scenario per test (`t05_irdai_preauth_approved`), written once and run by both runners. |
| `tests/nhcx/e2e/gui/` | The GUI runner: the target's browser automation (the one the target already uses, else Playwright). |
| `tests/nhcx/e2e/cli/` | The CLI runner and its command (`nhcx-e2e`), registered the target's way (npm script, management command, Gradle task, Make target). |
| `tests/nhcx/e2e/payer/` | The payer-side drivers: the IRDAI desk transport and the Payer Service role walk, both through [A14. Adjudicator User Role](../apis/A14-adjudicator-user-role.md) and [A15. Adjudicator Process Case](../apis/A15-adjudicator-process-case.md). |

Before the first test, both runners run the setup checks of [G11. Startup Checks and Health](../gateway/G11-startup-checks.md) (session token, participant record, certificate match, endpoint probe) and stop with `blocked`, cause `setup`, if any fails. Installing the browser driver and its browser (`pip install playwright && playwright install chromium`, or the target's equivalent) is part of `nhcx-e2e check` and of L8.1, done without asking: it is a test dependency of the target like any other, and the only questions a run asks are ASK FIRST and the PMJAY member id ([T1. Test Configuration](T1-test-configuration.md)). A run that cannot install it records every GUI entry `blocked`, cause `setup`, naming the command to run.

#### T2G. GUI

- Drive a real browser: the target's own automation, else Playwright with Chromium. A run that fetches pages in-process or over plain HTTP without a browser, or that re-runs the CLI scenario and saves the page's HTML, is not a GUI run: the report records it `blocked`, cause `setup`, never `pass` (one run reported 17 such passes [SANDBOX](../references/PAYERS.md#markers)). Each GUI entry names the browser and version it drove.
- Sign in through the HMIS login screen, then drive the screens a test names, by their visible labels, the way an operator would: [S5. Claim Master](../screens/S5-claim-master.md) to open a claim, [S6. Claim Detail](../screens/S6-claim-detail.md) and its tabs for everything after.
- Open the runner's own claim: a GUI run never reads or reuses the claim the CLI run made (T2X, fresh claims).
- Screenshot the whole process, not only the end of each step: the runner (never the scenario) takes a full-page PNG at the sign-in screen filled in, before and after every step's action, on every refusal, and of each tab the test touched at the end, into `tests/nhcx/e2e/artifacts/<test>/<runner>/<nn>-<step slug>-<before|after|refusal>.png`, and names them on the step's `screenshots` in the report ([T20. Functional Test Report](T20-functional-test-report.md)). Where `NHCX_TEST_PAYER_DESK_URL` is set, the case on the payer's desk is screenshotted after each decision too. A saved HTML page is never a screenshot.
- Read results off the screen (status chips, amounts, messages) as the S spec describes them, never off the database.
- Run headless by default; `--headed` shows the browser, for a person watching the run, slowed by `NHCX_TEST_SLOWMO_MS` between actions.
- When the test's patient is already on the patient master, start from it: "Search insurance policy" on the chart (S15. Patient Detail (in nhcx-coverage)) or the patient-list row (S13. Patient List (in nhcx-coverage)) opens S1. Search Policy (in nhcx-coverage) prefilled, so the case is linked to the patient when it opens.
- Save the pre-authorisation draft (S4. Pre-authorisation Details and Admission Link (in nhcx-preauth)) before the first send; S9. Pre-authorisation (in nhcx-preauth) disables the send until it is saved.
- Read a refusal off the red line under the tabs, and ignore toasts the step did not cause.
- The payer's side is not a provider screen: no S spec drives [A14. Adjudicator User Role](../apis/A14-adjudicator-user-role.md) or [A15. Adjudicator Process Case](../apis/A15-adjudicator-process-case.md). The GUI runner takes the payer's decisions through the same payer driver as the CLI (`tests/nhcx/e2e/payer/`), between the screen steps, and reads their outcome back on the screens.

#### T2L. CLI

The command, in the target's form:

```
nhcx-e2e list
nhcx-e2e check
nhcx-e2e run [T3 T5 ... | irdai | pmjay] [--mode cli|gui|both] [--headed] [--report <path>]
nhcx-e2e report [--report <path>] [--out <dir>]
```

`report` compiles the functional test report, a PDF and an Excel workbook, from the run's `e2e.json` and screenshots ([T20. Functional Test Report](T20-functional-test-report.md)); `run` calls it itself once both runners have finished.

`run` prints each step as it happens, one line each, so a person can watch it:

```
06:37:52 T5 cli PASS provider sends the pre-authorisation   -> 202, correlation 5b1f0c1e
06:37:55 T5 cli PASS payer desk opens the case              -> CASE-1017, preauth, pending
06:37:59 T5 cli PASS provider receives the approval         -> approved, 48500
```

It exits 0 when every test asked for passed, 1 when any failed, 2 when any was blocked by configuration or setup.

#### T2X. EXPECT

**Waiting for the payer.** Every step that waits on the payer waits for the callback first. After `NHCX_TEST_POLL_AFTER_SECONDS` it also polls the ledger ([A10. Transaction Related](../apis/A10-txn-related.md) to [A13. Transaction List](../apis/A13-txn-list.md)), and a reply found there is applied by the same callback handler (CORE instruction 4). After `NHCX_TEST_WAIT_SECONDS` the step fails with the leg's correlation id and ledger ids, so it can be traced in [G9. Ledger](../gateway/G9-ledger.md).

**Deciding the payer's side.** A decision is always read then taken: the role or case first ([A14. Adjudicator User Role](../apis/A14-adjudicator-user-role.md)), then the action ([A15. Adjudicator Process Case](../apis/A15-adjudicator-process-case.md)). IRDAI decisions go to the IRDAI payer desk; PMJAY decisions walk the Payer Service roles as A15 describes. The decision taken, its trail and the `cycle_id` are recorded with the test.

**Fresh claims.** Every test opens its own claim for the test beneficiary, so tests run in any order and a failure leaves nothing another test depends on.

**One open pre-authorisation per PMJAY beneficiary.** PMJAY keeps one active pre-authorisation per beneficiary and hospital and refuses a second with PAYR-1238 "Beneficiary is having an active preauthorization request at this hospital ... cancel ... or raise a claim" [PAYER](../references/PAYERS.md#markers). A claim the payer refused does not release it, and earlier runs from other desks on the same participant leave their own open (one from an earlier month had to be closed by hand). So before a PMJAY test opens a fresh claim the runner itself frees the beneficiary: it finds every case of the beneficiary whose pre-authorisation is `submitting`, `approved`, `partial` or `queried` with no claim filed and cancels it ([A6. Task Submit (cancel, status, reprocess, release)](../apis/A6-task-submit.md) cancel, reason `administrativeerror`), waiting for C7. Cancel Reply (in nhcx-preauth); a case it cannot see (another desk's) is reported as the cause when PAYR-1238 still comes back. Tests are ordered so a pending claim never blocks the next test's pre-authorisation.

**The GUI runner, in particular.** It starts from the patient master when the claim's patient already exists in the HMIS ("Search insurance policy" on the chart or the patient list, S13. Patient List (in nhcx-coverage), S15. Patient Detail (in nhcx-coverage)), so the case opens linked to the patient; it saves the S4 draft before the first send (S9 refuses the send until the draft is saved); it reads results off the page, where a red line under the tabs is the refusal to read and unrelated toasts are ignored; and it offers a headed, slowed mode (`--headed`, `NHCX_TEST_SLOWMO_MS`, `NHCX_TEST_BROWSER_CHANNEL`, [T1. Test Configuration](T1-test-configuration.md)) for a person to watch. Checks on codes compare the code alone (for example a line's `programCode` code with the adapter's programme code), never a `(code, display)` tuple.

**The report.** Both runners write into `NHCX_TEST_REPORT`, one entry per test and runner:

```json
{
  "run_at": "<ISO time>",
  "config": {"irdai_payer": "", "irdai_member": "", "pmjay_payer": "", "pmjay_member": "set | missing"},
  "setup_checks": [{"check": "session token", "result": "pass | fail", "detail": ""}],
  "tests": [
    {
      "id": "T5", "runner": "gui | cli", "browser": "chromium 131 | none", "plan_source": "seed | payer | n/a",
      "claim": "", "correlation_ids": [], "ledger_ids": [], "decisions": [],
      "started_at": "", "ended_at": "",
      "steps": [{"at": "", "what": "", "expected": "", "result": "pass | fail", "got": "", "screenshots": ["tests/nhcx/e2e/artifacts/T5/gui/03-s9-send-preauth-after.png"]}],
      "result": "pass | fail | blocked | skipped",
      "cause": "ours | sandbox | setup", "detail": "", "attempts": 1
    }
  ],
  "summary": {"pass": 0, "fail": 0, "blocked": 0, "skipped": 0}
}
```

**Triage.** A failure is ours (fix, then re-run the test), the sandbox's (retry, then report), or setup (back to the setup checks). At most 3 attempts per test and runner.

**The functional test report.** `e2e.json` is the record; the document a hospital, a payer or an auditor reads is built from it by `nhcx-e2e report` ([T20. Functional Test Report](T20-functional-test-report.md)): a PDF walking the whole process in screenshots, one numbered proof section per test step, and an Excel workbook with one row per step. It names no company and prints no credential.
