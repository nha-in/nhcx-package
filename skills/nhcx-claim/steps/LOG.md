# Progress Log

Every step and sub-step leaves a record of what it did and which files it changed. The record is `nhcx-plan/progress.json`; `nhcx-plan/progress.md` is the same record for people to read, regenerated from the JSON after every entry and never edited by hand. `nhcx-plan/report.html` is the one page a person opens to see where the work stands: progress, test results and errors, rebuilt at the end of every prompt.

#### LOGW. WHEN TO WRITE
- When a sub-step starts (`started`) and when it ends (`done`, `blocked` or `skipped`).
- Every time a file is created, modified or deleted, in the target source or under `nhcx-plan/`, as part of that sub-step.
- When an earlier step's plan file is corrected (`corrected`), naming the file and what was wrong.
- When a step finishes and its exit condition is checked (`exit_checked`).

Entries are appended, never rewritten. A mistake in an entry is fixed by a new `corrected` entry that points at the old one.

#### LOGJ. progress.json

```json
{
  "target": "acme-hmis",
  "skill_version": "1.10.0",
  "started_at": "<ISO time>",
  "updated_at": "<ISO time>",
  "current": {"milestone": "N3", "step": "L5", "sub_step": "L5.2"},
  "status": {
    "overall": "not_started | in_progress | done | blocked",
    "bootstrap": {
      "state": "not_started | in_progress | done | blocked",
      "sub_steps": {"L1.0": "done", "L1.1": "done", "L1.2": "done", "L1.3": "in_progress"}
    },
    "milestones": {
      "N3": {
        "state": "not_started | in_progress | done | blocked",
        "steps_done": 4,
        "steps_total": 7,
        "done_when": "not_started | not_run | pass | fail",
        "depends_on": ["N0", "N2"],
        "steps": {
          "L5": {
            "state": "not_started | in_progress | done | blocked",
            "sub_steps_done": 3,
            "sub_steps_total": 5,
            "output_written": false
          }
        }
      }
    },
    "e2e": {"state": "not_started | in_progress | done | fail", "runs": []}
  },
  "entries": [
    {
      "id": "LOG-0042",
      "at": "<ISO time>",
      "milestone": "N3",
      "step": "L5",
      "sub_step": "L5.2",
      "event": "started | done | blocked | skipped | corrected | exit_checked",
      "title": "what the sub-step is working on, in a few words",
      "detail": "what was done, in one or two sentences",
      "files": ["src/claims/preauth.py", "nhcx-plan/N3/code.json"],
      "commit": "",
      "corrects": ""
    }
  ]
}
```

- `id` counts up from `LOG-0001` and is never reused.
- `milestone` is the slice the entry belongs to (`N0` to `N6`), or `bootstrap` for the one-time global bootstrap (L0 skill-update and L1.0 to L1.3); every entry carries one.
- `files` is a flat list of paths touched (target source and `nhcx-plan/`), the plan files under the milestone's own folder (`nhcx-plan/N3/...`), except the bootstrap's `knowledge.json` and the root `discovery.json`, `plan.json`, which sit at the plan root.
- `commit` is filled when the change is committed (L5.5 commits per batch). After an amend, rebase or squash every `commit` an entry names is checked to be an ancestor of `HEAD` (`git merge-base --is-ancestor`) and corrected through a `corrected` entry; the report builder flags one that is not on the branch.
- An entry is appended when its sub-step runs, never back-filled: consecutive sub-steps carry their own timestamps, and a block of entries sharing one second (one run logged all of a milestone's L1 to L4 at `09:32:41Z`) is a log written after the fact, which the report builder flags.
- `status` is recomputed from `entries` after each append: `overall`, then `bootstrap`, then one block per milestone, then `e2e`. Each milestone runs L1 to L7 only; `steps_done` counts its steps in state `done` out of `steps_total` (7); `done_when` is the milestone's **dry-run** done-when; the milestone's `state` is `done` only when `done_when` is `pass`. The root `e2e` block is the single final end-to-end run across the whole lifecycle, run after every milestone is `done`.
- Ids in the JSON stay bare (`"milestone": "N3"`, `"step": "L5"`); the name is added wherever a person reads them (LOGN).

A small `log_helper.py` (or the target language's equivalent) may be written beside the plan files to append an entry, recompute `status` from `entries` and rewrite `progress.md`, so every log write is one call and the derived state is never hand-maintained. It is written in the bootstrap and logged like any other file.

#### LOGM. progress.md

Regenerated from progress.json:

```markdown
# NHCX integration progress

## Milestones
| Milestone | State | Steps done | Dry-run done-when |
|---|---|---|---|
| N0 Foundation | done | 7 / 7 | pass |
| N1 Search Policy | done | 7 / 7 | pass |
| N2 Coverage and Insurance | done | 7 / 7 | pass |
| N3 Pre-authorisation and Biometric | in progress | 4 / 7 | not run |

(Bootstrap: knowledge source and technology, done. End-to-end: the final sandbox run across N1 to N6, not run until every milestone is done.)

## N3 Pre-authorisation and Biometric
| Step | State | Sub-steps done | Output written |
|---|---|---|---|
| L1 Discovery | done | 6 / 6 | yes |
| L5 Write Code | in progress | 3 / 5 | no |

- [x] L5.1 Take the next file
- [ ] L5.2 Write it (in progress: `src/claims/preauth.py`)

## Changes
| Id | Timestamp | Milestone | Sub-step | Event | Title | Files |
|---|---|---|---|---|---|---|
| LOG-0042 | 2026-09-22 10:14 | N3 | L5.2 Write it | done | Pre-auth send service (A4) | `src/claims/preauth.py`, `nhcx-plan/N3/code.json` |
```

First a milestone table (state, steps done out of 7, dry-run done-when), with the one-line bootstrap state and the final end-to-end state beneath it; then one section per milestone that has been started, in dependency order, each holding its own step table (L1 to L7) and the sub-step checklist of its active step; then the changes table, every entry newest last, with a Milestone column.

#### LOGN. EVERY ID WITH ITS NAME
A person reading the log, the report or a message must not have to look an id up. Every milestone, step, sub-step, test and spec id shown to a person is written with its name beside it, taken from the skill's own indexes and spec titles, never made up:
- a milestone: `N3 Pre-authorisation and Biometric`, never `N3` alone;
- a step: `L3 Integration Planning`, never `L3` alone;
- a sub-step: `L5.2 Write it`;
- a test: `T3 IRDAI Policy Search and Eligibility`, never `T3` alone; a result is the id, the name, the runner and the result: `T3 IRDAI Policy Search and Eligibility (CLI): pass`;
- a spec: `A4 Pre-auth Submit`; a field reference: `D1 Organization . name`; an NHA use case: `nha:B3 Pre-authorisation`.

This holds in `progress.md`, in every table of `report.html`, and in every message to the user that reports progress, a step, a test run or an error ("L8 End-to-end Tests: T14 PMJAY Pre-authorisation Through the Payer Service (GUI) failed", not "L8: T14 failed"). Pass and fail stay one word; the name is what is added.

The names come from `nhcx-plan/names.json`, written in the bootstrap with the report builder from the skill's indexes (`milestones/INDEX.md`, `steps/INDEX.md`, `tests/INDEX.md` and each spec's `title`), grouped so one lookup serves the whole page:

```json
{
  "milestones": {"N0": "Foundation", "N3": "Pre-authorisation and Biometric"},
  "steps": {"L1": "Discovery", "L5": "Write Code", "L8": "End-to-end Tests", "L0": "Skill Update Check"},
  "sub_steps": {"L1.A": "Ask the integrator first", "L5.2": "Write it"},
  "tests": {"T3": "IRDAI Policy Search and Eligibility"},
  "specs": {"A4": "Pre-auth Submit", "D1": "Organization"}
}
```

Every milestone and every id in SCOPE is present. The report builder and the agent both read it, so the page and the messages use the same words. An id missing from it is shown as its bare code (and logged as an error to fix), never guessed.

#### LOGH. report.html

Rebuilt as the last action of every prompt, however the prompt ended: after a step, part of a step, a fix, a test run, or a question answered without any change. It is written from the plan files only, never from memory of the conversation, so it says what the records say. It is never edited by hand.

**Built by a script, not by hand.** The page is produced by a report builder the skill writes into the target at L1, in the target's own language and kept beside the plan files: `nhcx-plan/report.py` for a Python target, `nhcx-plan/report.mjs` for Node, `nhcx-plan/report.php` for PHP, `nhcx-plan/Report.java` (or a Gradle/Maven task) for Java, and so on, with no dependency beyond the language's standard library. It reads the plan JSON and writes `nhcx-plan/report.html`. Rebuilding the report means running that script; the agent runs it at the end of every prompt, and a person can run it at any time.

**Wrapper scripts, one per platform.** Beside it, `nhcx-plan/make-report.sh` (POSIX shell, executable) and `nhcx-plan/make-report.bat` (Windows). `make-report.sh once` (the default) rebuilds the page one time and exits with the builder's status; `make-report.sh watch [seconds]` rebuilds it every few seconds (default 2) until stopped (Ctrl-C), by running the builder in its own watch mode. Both resolve the builder relative to their own location, so they work from any working directory, and both find `python3` or `python`.

**Reads:** every file under `nhcx-plan/`. At the root: `names.json` (the grouped names, LOGN), `progress.json`, `knowledge.json` (with `mode`, the package and the skill-update check), `discovery.json` (the bootstrap's technology, component kit, domain entities, ABDM and billing), `plan.json` (the L1.A integrator decisions) and `e2e.json` (the one final end-to-end run). Then, per milestone, the files under `nhcx-plan/<Nx>/`: `discovery.json`, `mapping.json`, `plan.json`, `code-plan.json`, `code.json`, `validation.json`, `dry-run.json` (L1 to L7 only; there is no per-milestone `e2e.json`). The builder discovers the milestone folders present (`N0` to `N6`) rather than assuming all exist; every read tolerates a missing file (shown as "Not yet run") and a missing key (rendered empty), and a file that does not parse is skipped without failing the rest of the page.

**One page, tabs: Overview, Bootstrap, N0 to N6, End-to-end, Log.** The page is organised by milestone, not by source file. Each state word renders as a coloured pill through one `pill_tone` map: green for done, pass, matched, found, reused, valid, current; amber-gold for in progress, started, partial, new, pending; orange for blocked, skipped, gap; red for failed, conflict; grey for anything else.

| Tab | Shows |
|---|---|
| Overview | A KPI row (Milestones done out of 7, Files written, Files validated, Dry-run checks passed out of run, End-to-end tests passed out of run); the **Milestone Stepper**: N0 to N6 and a final L8 card side by side, each with its id, name, `done / 7 steps` (L8 shows passed / run), dry-run done-when and a progress bar, each clicking through to its tab; the **Milestones by Steps** matrix: one row per milestone with a pill per step L1 to L7 and a dry-run done-when pill; and **Recent Log Entries** (the last 20, newest first). |
| Bootstrap | The one-time global bootstrap: L0 skill-update and L1.0 knowledge source (mode, source, package path and version, installed vs remote version); the L1.A integrator decisions as a key and chosen-value table; L1.2 technology and the host component kit (language, runtime, framework, database, migration tool, HTTP client, crypto, test runner, then one row per component kind with its host component, file and status); and L1.3 domain entities, ABDM module and billing module. Shared by every milestone. |
| N0 to N6 (one each) | A header card (the milestone with its name, what it depends on, its state and dry-run done-when), a filter box, its **seven steps** (L1 to L7) as a stepper, then one section per step in order reading `nhcx-plan/<Nx>/`: L1 Discovery (the ids it delivers, grouped screens/apis/callbacks/fhir/database/gateway, each found/partial/missing with existing files and notes), L2 Mapping (a spec-table-to-target-table table and a spec-field-to-target table), L3 Plan (its phases, specs, steps and done-when), L4 Code plan (order, path, action, specs, test file), L5 and L6 together (one row per file: path, action, specs, build, validation status and SHA-256), L7 Dry-run (the runner command and dry-run done-when, then one row per check), and the milestone's own log. A section whose file is absent shows "Not yet run". |
| End-to-end | The single final run from the root `e2e.json`: one row per test (test, runner, case id, status, notes), each expanding to its steps with their screenshots, and above the table links to the functional test report files in `nhcx-plan/ft-report/` (the PDF and the workbook, T20) when they exist. Before it runs, an empty state saying L8 runs once across N1 to N6 after every milestone's dry-run done-when passes. Not shown per milestone. |
| Log | The full append-only log, newest first: id, timestamp, milestone, step, event, title, detail with its files, and commit. |

Every tab but Overview has a filter box that hides rows not containing the text typed. Every id reads with its name (LOGN). Paths, ids, commands and hashes are monospaced. The current tab is kept in the URL hash, so a reload stays on it.

**Clean, self-contained, and written for a person: never a dump of the JSON.** One file that opens from disk in any browser and needs nothing else: the CSS and script below inline, and the only external reference is the Google Fonts link (the page still reads with its fallback fonts offline). No secrets: configuration values are shown as `set` or `missing`, as [T1. Test Configuration](../tests/T1-test-configuration.md) does.

The page's CSS, used as it is (the class names are the contract the builder writes against):

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Space+Grotesk:wght@600;700&display=swap');
:root {
  --bg:        #f6f4ef;
  --paper:     #ffffff;
  --subtle:    #efece4;
  --ink:       #14181f;
  --muted:     #5b616e;
  --faint:     #8a909e;
  --rule:      #dedad0;
  --accent:    #0f4c5c;
  --ok-fg:     #0f5338; --ok-bg:   #dff3ea; --ok-bd:   #9dd4bc;
  --run-fg:    #7a4b00; --run-bg:  #fff1cf; --run-bd:  #f0c96b;
  --warn-fg:   #7a2e0e; --warn-bg: #ffe4d6; --warn-bd: #f3ae8b;
  --bad-fg:    #8a1c1c; --bad-bg:  #fde2e2; --bad-bd:  #eda3a3;
  --idle-fg:   #4b5260; --idle-bg: #eceae3; --idle-bd: #cfcac0;
  --sans: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --head: 'Space Grotesk', var(--sans);
  --mono: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
}
* { box-sizing: border-box; }
html, body { margin: 0; background: var(--bg); color: var(--ink); font: 14px/1.55 var(--sans); }
.wrap { max-width: 1280px; margin: 0 auto; padding: 28px 32px 72px; }
header.top {
  display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end;
  gap: 16px; padding-bottom: 18px; border-bottom: 2px solid var(--ink);
}
header.top h1 { font: 700 24px/1.15 var(--head); letter-spacing: -0.02em; margin: 0; }
header.top .sub { color: var(--muted); font: 12px/1.4 var(--mono); margin-top: 4px; }
nav.tabs {
  position: sticky; top: 0; z-index: 10; background: var(--bg);
  display: flex; flex-wrap: wrap; gap: 4px; padding: 12px 0; border-bottom: 1px solid var(--rule);
}
nav.tabs button {
  font: 500 13px/1 var(--sans); color: var(--muted); background: transparent;
  border: 1px solid transparent; border-radius: 6px; padding: 8px 12px; cursor: pointer;
  display: inline-flex; align-items: center; gap: 6px;
}
nav.tabs button:hover { color: var(--ink); background: var(--subtle); }
nav.tabs button.on { color: #fff; background: var(--accent); border-color: var(--accent); }
nav.tabs button .cnt { font: 500 11px/1 var(--mono); opacity: .75; }
section.pane { display: none; padding-top: 22px; }
section.pane.on { display: block; }
h2 { font: 600 16px/1.25 var(--head); margin: 26px 0 10px; letter-spacing: -0.01em; }
h2:first-child { margin-top: 0; }
h3 { font: 600 13px/1.3 var(--sans); text-transform: uppercase; letter-spacing: .06em; color: var(--muted); margin: 20px 0 8px; }
.kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; }
.kpi { background: var(--paper); border: 1px solid var(--rule); border-radius: 8px; padding: 14px 16px; }
.kpi .num { font: 700 26px/1.1 var(--head); }
.kpi .lbl { color: var(--muted); font-size: 12px; margin-top: 2px; }
.stepper { display: grid; grid-template-columns: repeat(8, minmax(120px, 1fr)); gap: 8px; margin-top: 12px; overflow-x: auto; }
.step {
  background: var(--paper); border: 1px solid var(--rule); border-top: 3px solid var(--idle-bd);
  border-radius: 6px; padding: 10px 12px;
}
.step.done        { border-top-color: var(--ok-fg); }
.step.in_progress { border-top-color: var(--run-fg); background: #fffdf6; }
.step.blocked     { border-top-color: var(--warn-fg); }
.step.failed      { border-top-color: var(--bad-fg); }
.step .id   { font: 600 11px/1 var(--mono); color: var(--muted); }
.step .name { font: 600 13px/1.25 var(--sans); margin: 4px 0 6px; }
.step .meta { font: 11px/1.3 var(--mono); color: var(--muted); }
.bar { height: 5px; background: var(--subtle); border-radius: 3px; overflow: hidden; margin-top: 6px; }
.bar > i { display: block; height: 100%; background: var(--accent); }
.step.done .bar > i { background: var(--ok-fg); }
.card { background: var(--paper); border: 1px solid var(--rule); border-radius: 8px; overflow: hidden; margin-bottom: 14px; }
table.t { width: 100%; border-collapse: collapse; font-size: 13px; }
table.t th, table.t td { text-align: left; vertical-align: top; padding: 9px 12px; border-bottom: 1px solid var(--rule); }
table.t th { font: 600 11px/1.2 var(--mono); text-transform: uppercase; letter-spacing: .05em; color: var(--muted); background: var(--subtle); }
table.t tr:last-child td { border-bottom: 0; }
table.t tbody tr:hover td { background: #faf8f3; }
.pill {
  display: inline-block; font: 500 11px/1 var(--mono); padding: 4px 7px; border-radius: 4px;
  border: 1px solid var(--idle-bd); color: var(--idle-fg); background: var(--idle-bg); white-space: nowrap;
}
.pill.ok   { color: var(--ok-fg);   background: var(--ok-bg);   border-color: var(--ok-bd); }
.pill.run  { color: var(--run-fg);  background: var(--run-bg);  border-color: var(--run-bd); }
.pill.warn { color: var(--warn-fg); background: var(--warn-bg); border-color: var(--warn-bd); }
.pill.bad  { color: var(--bad-fg);  background: var(--bad-bg);  border-color: var(--bad-bd); }
code, .mono { font: 12px/1.45 var(--mono); }
code { background: var(--subtle); padding: 1px 5px; border-radius: 3px; }
.muted { color: var(--muted); }
.empty {
  background: var(--paper); border: 1px dashed var(--rule); border-radius: 8px;
  padding: 28px; text-align: center; color: var(--muted);
}
.filter { margin-bottom: 10px; display: flex; gap: 8px; align-items: center; }
.filter input {
  font: 13px/1.4 var(--sans); padding: 7px 11px; border: 1px solid var(--rule);
  border-radius: 6px; background: var(--paper); min-width: 260px;
}
details.row { background: var(--paper); border: 1px solid var(--rule); border-radius: 8px; margin-bottom: 8px; }
details.row > summary { padding: 10px 14px; cursor: pointer; font-weight: 500; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
details.row > .body { padding: 4px 14px 14px; border-top: 1px solid var(--rule); }
dl.kv { display: grid; grid-template-columns: 200px 1fr; gap: 6px 14px; margin: 8px 0; font-size: 13px; }
dl.kv dt { color: var(--muted); font-family: var(--mono); font-size: 12px; }
dl.kv dd { margin: 0; }
```

The page's script, used as it is:

```js
function switchTab(id) {
  document.querySelectorAll('nav.tabs button').forEach(b => {
    b.classList.toggle('on', b.getAttribute('data-tab') === id);
  });
  document.querySelectorAll('section.pane').forEach(p => {
    p.classList.toggle('on', p.id === 'pane-' + id);
  });
  if (history.replaceState) { history.replaceState(null, '', '#' + id); }
}
function filterPane(input, paneId) {
  const q = (input.value || '').toLowerCase();
  const pane = document.getElementById(paneId);
  if (!pane) return;
  pane.querySelectorAll('table.t tbody tr').forEach(tr => {
    tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}
window.addEventListener('DOMContentLoaded', () => {
  const h = (location.hash || '').replace('#', '');
  if (h && document.getElementById('pane-' + h)) { switchTab(h); }
});
```

The shape the builder writes, abbreviated:

```html
<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>NHCX Integration Report &mdash; acme-hmis</title><style>/* the CSS above */</style></head>
<body><div class="wrap">
 <header class="top"><div><h1>NHCX Integration Report &mdash; acme-hmis</h1>
  <div class="sub">Skill: nhcx-full v1.10.0 &middot; Knowledge: package v1.0.0 &middot; Mode: milestone &middot; Updated: 2026-10-24 11:38:36</div></div>
  <div><span class="pill run">in_progress</span></div></header>
 <nav class="tabs"><button class="on" data-tab="overview" onclick="switchTab('overview')">Overview <span class="cnt">(3/7)</span></button>
  <button data-tab="bootstrap" onclick="switchTab('bootstrap')">Bootstrap <span class="cnt">(done)</span></button>
  <button data-tab="n0" onclick="switchTab('n0')">N0 Foundation <span class="cnt">(done)</span></button>
  ... <button data-tab="e2e" onclick="switchTab('e2e')">End-to-end <span class="cnt">(not_started)</span></button>
  <button data-tab="log" onclick="switchTab('log')">Log <span class="cnt">(142)</span></button></nav>
 <section class="pane on" id="pane-overview"><div class="kpis"><div class="kpi"><div class="num">3 / 7</div><div class="lbl">Milestones Done</div></div>...</div>
  <h2>Milestone Stepper</h2><div class="stepper"><div class="step done" onclick="switchTab('n0')"><div class="id">N0</div>
   <div class="name">Foundation</div><div class="meta">7 / 7 steps &middot; dry-run: pass</div><div class="bar"><i style="width:100%"></i></div></div>...</div>
  <h2>Milestones &times; Steps (L1 Discovery &ndash; L7 Dry-run Tests)</h2><div class="card"><table class="t">...</table></div>
  <h2>Recent Log Entries (Last 20)</h2><div class="card"><table class="t">...</table></div></section>
 <section class="pane" id="pane-bootstrap">...</section>
 <section class="pane" id="pane-n0">...</section>
 ...
 <section class="pane" id="pane-e2e">...</section>
 <section class="pane" id="pane-log">...</section>
</div><script>/* the script above */</script></body></html>
```

```sh
#!/bin/sh
# nhcx-plan/make-report.sh: rebuild report.html once, or watch and rebuild every few seconds.
set -eu
DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PY=$(command -v python3 || command -v python)   # the target's runtime: node, php, java ...
case "${1:-once}" in
  once)  exec "$PY" "$DIR/report.py" ;;
  watch) exec "$PY" "$DIR/report.py" --watch "${2:-2}" ;;
  *)     echo "usage: $0 [once|watch [seconds]]" >&2; exit 2 ;;
esac
```

```bat
@echo off
rem nhcx-plan\make-report.bat: rebuild report.html once, or watch (Ctrl-C to stop).
setlocal
set "DIR=%~dp0"
where python3 >nul 2>nul && (set "PY=python3") || (set "PY=python")
if /I "%~1"=="watch" (
  if "%~2"=="" ( "%PY%" "%DIR%report.py" --watch 2 ) else ( "%PY%" "%DIR%report.py" --watch %~2 )
  exit /b %ERRORLEVEL%
)
if "%~1"=="" ( "%PY%" "%DIR%report.py" & exit /b %ERRORLEVEL% )
if /I "%~1"=="once" ( "%PY%" "%DIR%report.py" & exit /b %ERRORLEVEL% )
echo usage: %~nx0 [once^|watch [seconds]] 1>&2
exit /b 2
```

The builder (and the optional log helper) and the two wrapper scripts are written in L1 (before any other plan file, so every later step can rebuild the page) and logged like any other file. The build of the page is itself logged: one entry, event `done`, title `report.html`, in the sub-step that was running (or the last one, when the prompt ran none).

#### LOGX. EXIT
- Every entry carries a `milestone` (`N0` to `N6`, or `bootstrap`).
- Every sub-step of a finished step of a milestone has a `started` and a closing entry under that milestone.
- Every file named in a milestone's `code.json`, and every file changed in the target, appears in at least one entry's `files`.
- progress.md matches progress.json: the milestone table (steps done out of 7), the per-milestone step tables and the changes table.
- No milestone, step, sub-step, test or spec id appears in progress.md, report.html or a progress message without its name; `names.json` holds every milestone and every id in SCOPE, grouped.
- report.html was rebuilt at the end of the last prompt by the report builder, is organised by milestone (Overview, Bootstrap, one tab per milestone present, End-to-end, Log), and its counts match the plan files.
- A milestone shows `done` only when its dry-run done-when is `pass`; a milestone runs L1 to L7 only; a milestone is never started before every milestone it depends on is `done`.
- The final L8 end-to-end is not run until every milestone is `done`; it writes one `nhcx-plan/e2e.json` at the root and the root `status.e2e`, never a per-milestone `e2e.json`.
- `nhcx-plan/make-report.sh once` and `make-report.bat once` rebuild it and exit 0.
