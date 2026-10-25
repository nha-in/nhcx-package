# T20. Functional Test Report

#### T20D. DESCRIPTION

The end-to-end run leaves `e2e.json` ([T2. Test Runners](T2-test-runners.md)) and a folder of screenshots per test. Neither is something a hospital, a payer or an auditor reads. The FT report is: a PDF that walks the whole process in screenshots, in the shape functional-testing audit reports take (a cover block, document control, contents, the requirement tables, the scope and method, the tools, then one numbered proof section per test step with its screenshot and a one-line statement of what the screen shows), and an Excel workbook with one row per test case and step that a reviewer can filter and sign off.

The report is built, not written: `nhcx-e2e report` reads `e2e.json` and the artifacts folder and renders both files. Nothing in it is typed by hand, nothing names a testing company or a person the configuration did not give, and no credential is ever printed (a credential cell says `set`). A run that had no browser (every GUI entry `blocked`) still produces both files, from the CLI entries, with the step log in place of screenshots and the cover block saying so; it is then a results report, not a proof of the screens, and the first page says which.

#### T20S. SETUP

- The GUI runner of [T2. Test Runners](T2-test-runners.md) ran with a real browser: the whole process is screenshotted, not only the end of each step. The runner captures, into `tests/nhcx/e2e/artifacts/<test>/<runner>/`, a full-page PNG at: the sign-in screen filled in, every screen a step opens (before the action), every screen after the action (the result read off it), every refusal, and the final state of each tab the test touched ([S6. Claim Detail](../screens/S6-claim-detail.md)). Files are numbered in order with the step's slug (`03-s9-send-preauth-after.png`), and every `steps[]` entry of `e2e.json` names its screenshots (`"screenshots": ["..."]`, [T2. Test Runners](T2-test-runners.md)).
- Where the payer's side has a web desk the runner can open (A14. Adjudicator User Role (in nhcx-preauth), `NHCX_TEST_PAYER_DESK_URL` set, [T1. Test Configuration](T1-test-configuration.md)), the runner also screenshots the case on the desk after each decision it takes, so the payer's view of the same claim sits beside the provider's. Without it, the decision's trail (`decisions[]`) is printed instead.
- The builder lives in `tests/nhcx/e2e/report/` and uses what the target already has: the PDF is rendered from HTML by the GUI runner's own browser (`page.pdf()` in Playwright, or the target's equivalent), so a GUI-capable target needs nothing more; the workbook uses the spreadsheet library the target already has, else the lightest for its language (`openpyxl`, `exceljs`, Apache POI, `ClosedXML`). Both choices are recorded in `code-plan.json` like any other dependency.
- Configuration ([T1. Test Configuration](T1-test-configuration.md)): `NHCX_TEST_FT_DIR` (default `nhcx-plan/ft-report/`), `NHCX_TEST_FT_ENTITY` (the hospital or entity under test, default the facility's name, [D1. organization](../database/D1-organization.md)), `NHCX_TEST_FT_PRODUCT` (the HMIS, default the target's name from `discovery.json`), `NHCX_TEST_FT_PREPARED_BY` (default `nhcx-e2e runner, <skill> <version>`), `NHCX_TEST_FT_DOC_VERSION` (default `V1`), `NHCX_TEST_FT_REPORT_TYPE` (default `First Functional Test Report`), `NHCX_TEST_PAYER_DESK_URL` (optional).

#### T20G. GUI

The report has no screen of its own. Its only GUI part is the capture rule above, which every GUI scenario follows through the runner (a scenario never calls the screenshot function itself; the runner does it around each step, so no step can be left out).

#### T20L. CLI

```
nhcx-e2e report [--report <path>] [--out <dir>] [--title <text>]
```

Reads `NHCX_TEST_REPORT` (else `--report`) and the artifacts folder, writes `FT-report-<yyyy-mm-dd>.pdf` and `FT-report-<yyyy-mm-dd>.xlsx` into `NHCX_TEST_FT_DIR` (else `--out`), and prints their paths and page and row counts. It runs on its own after both runners ([L8](../steps/L8-e2e-tests.md) L8.5), and may be run again at any time on the same `e2e.json`. Exit 0 when both files were written, 2 when `e2e.json` is missing or holds no entries.

**The PDF**, in this order, each section numbered, with a running header (the report title) and footer (`Page | n` and `Confidential`) on every page after the cover:

1. **Cover.** A block of three rows: Type of test (`Functional testing of <product> on NHCX: <the scope's exchanges, for example policy search to payment>`), Type of report (`NHCX_TEST_FT_REPORT_TYPE`), Report release date (the day the report was built). No logo, no company name.
2. **Document control.** Document preparation (Document title `Functional testing: <product>, <entity>`; Document id `FT-NHCX-<yyyymmdd>`; Document version; Prepared by; Reviewed by and Approved by left as blank lines for a person; Release date), Document change history (one row: the version, the date, `Generated from e2e.json run at <run_at>`), and Document distribution (empty rows for the integrator to fill).
3. **Contents.** Every numbered section and proof subsection with its page number.
4. **Test summary table.** Sr no, Requirement, Details: Entity name; Product name (and its version or commit when the target's build names one); Workflow (`NHCX provider integration, claim lifecycle`); Skill and version; Knowledge source and version ([KNOWLEDGE.md](../references/KNOWLEDGE.md)); Test execution dates (first and last `at` in `e2e.json`) and Number of days; Test executed by (`NHCX_TEST_FT_PREPARED_BY`); Sandbox (`NHCX sandbox`); Participant code (the facility's, from the setup checks); Runners (`CLI and GUI`, `CLI only`); Browser (from the GUI entries, or `none`).
5. **Per-payer flow tables**, one for the IRDAI test payer and one for PMJAY, each: Sr no, Requirement, Details: Payer (name and participant code); Member id (masked to its last four characters); Tests in scope and their results (`T3 pass, T4 pass, ...` per runner); Claims created (the claim numbers); Exchanges exercised (the A and C ids the tests cover); URL (`NHCX_TEST_APP_URL`); Credentials (`set` or `missing`, never the value); Recordings available (`screenshots: <n>`); Package master (`payer's own` or `seed`, T13. PMJAY Eligibility, Package Master and Ruling (in nhcx-coverage)).
6. **Introduction.** A. Background: the product and entity in two sentences from `discovery.json` (what the HMIS is, its stack). B. Objectives, assumptions and limitations: the objective (prove the NHCX exchanges in SCOPE work end to end against the NHCX sandbox, through the screens and the services); the limitation, verbatim in substance: findings are limited to the application as tested, at the code base and configuration of the run (name the commit), against the sandbox payers and test beneficiaries of that day; later changes may invalidate them; a sandbox payer's auto-decisions stand in for a human adjudicator.
7. **Scope.** The tests in SCOPE listed by id and title ([TESTS.md](../references/TESTS.md)), the platforms tested (the URL), and the exchanges, screens, APIs and callbacks they cover.
8. **Test execution details.** Replaces an auditing team table: one row per runner (CLI, GUI) with the browser and version, the operating system, the skill version, the command run and when; and the setup checks of [G11. Startup Checks and Health](../gateway/G11-startup-checks.md) with their results.
9. **Approach and methodology.** How the run proceeds (setup checks, both runners, each test opening its own claim, the payer's side driven through A14. Adjudicator User Role (in nhcx-preauth) and A15. Adjudicator Process Case (in nhcx-preauth), waiting by callback then polling); how results are classed, verbatim in substance: `pass` means the step behaved as the test expects and the screen showed it; `fail` that it did not; `blocked` that a sandbox, setup or configuration condition stopped the test before it could say, with the cause; `skipped` that the payer adapter does not offer the step.
10. **Tools and software used.** S no, Name, Version, Open source or licensed: the browser, the browser driver, the HMIS (its build or commit), the runtime, the skill, the spreadsheet library.
11. **Test cases: proof of functional testing.** One subsection per test and runner, numbered `11.<n>` and titled `<Test id>: <test title> (<runner>)`, with its claim number, result and attempts on the first line. Under it one proof block per step, in order: the step's title, then one sentence in the report's own voice, `The screenshot below shows that the system <what the step proves>.` (from the step's `what` and the T spec's expectation), then the step's screenshots, each captioned with its file name and time, at most two to a page, full width, never cropped; a failed step prints its `got` under the screenshot in a red line; a step with no screenshot prints the step line from the CLI run in a boxed monospace block. Payer-side decisions appear where they were taken, as a block `Payer side: <role> <action> on <case>` with the desk screenshot when there is one, else the decision's trail.
12. **Summary of results.** The counts (pass, fail, blocked, skipped per runner) and one line per failed or blocked test with its cause, as the triage of [T2. Test Runners](T2-test-runners.md) recorded it.

**The workbook**, five sheets, the header row frozen and filterable, the status cells coloured (green pass, red fail, amber blocked, grey skipped):

| Sheet | Columns | One row per |
|---|---|---|
| Summary | the test summary table of section 4 as key and value rows, then the counts | run |
| Test cases | Sr no, Test id, Test title, Payer, Runner, Claim no, Step no, Step, Expected result (the T spec's expectation the step proves), Actual result (`got`), Status, Screenshot (the file, as a hyperlink), Correlation id, Ledger ids, Time, Attempt, Cause (for a fail or block) | test step and runner |
| Setup checks | Check, Runner, Result, Detail | setup check |
| Payer decisions | Test id, Runner, Case, Stage, Role, Action, Result, Trail, Time | decision |
| Tools | the tools table of section 10 | tool |

#### T20X. EXPECT

- Both files exist in `NHCX_TEST_FT_DIR` after `nhcx-e2e report`, and the paths are logged ([L8](../steps/L8-e2e-tests.md)) and shown on the report page's End-to-end tab ([LOG.md](../steps/LOG.md)).
- Every GUI entry marked `pass` in `e2e.json` has at least one screenshot per step in the PDF and a file name in the workbook's Screenshot column; a `pass` with no screenshot for a step is a build failure of the report, not a missing picture.
- No credential, secret, token or private key appears in either file; a credential cell reads `set` or `missing`. No company, auditor or person is named unless `NHCX_TEST_FT_PREPARED_BY` or the distribution rows name them.
- The PDF opens with the cover block and ends with the summary; every proof section's sentence states what the screen shows, in the present tense, and is true of the screenshot under it (a failed step says what was expected and prints what was got).
- The workbook's Test cases sheet has exactly one row per `steps[]` entry of `e2e.json`, in run order, and its Status column agrees with the PDF and with `e2e.json`.
- A run without a browser still produces both files, the cover block saying `CLI runner only; screens not driven`, and every proof block carrying the step line instead of a screenshot.
