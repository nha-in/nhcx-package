# Progress Log

Every step and sub-step leaves a record of what it did and which files it changed. The record is `nhcx-plan/progress.json`; `nhcx-plan/progress.md` is the same record for people to read, regenerated from the JSON after every entry and never edited by hand. `nhcx-plan/report.html` is the one page a person opens to see where the work stands: progress, test results and errors, rebuilt at the end of every prompt.

#### LOGW. WHEN TO WRITE
- When a sub-step starts (`started`) and when it ends (`done`, `blocked` or `skipped`).
- Every time a file is created, modified or deleted, in the target source or under `nhcx-plan/`, as part of that sub-step.
- When an earlier step's plan file is corrected (`corrected`), naming the file and what was wrong.
- When a step finishes and its exit condition is checked.

Entries are appended, never rewritten. A mistake in an entry is fixed by a new `corrected` entry that points at the old one.

#### LOGJ. progress.json

```json
{
  "target": {"repo": "", "started_at": "<ISO time>", "skill": "", "skill_version": "", "mode": "milestone"},
  "status": {
    "bootstrap": {
      "state": "not_started | in_progress | done | blocked",
      "substeps": {"L1.0": "done", "L1.1": "done", "L1.2": "done", "L1.3": "in_progress"}
    },
    "milestones": {
      "N3": {
        "state": "not_started | in_progress | done | blocked",
        "done_when": "not_run | pass | fail",
        "depends_on": ["N0", "N2"],
        "steps": {
          "L5": {
            "state": "not_started | in_progress | done | blocked",
            "exit_checked": false,
            "substeps": {"L5.1": "done", "L5.2": "in_progress"}
          }
        }
      }
    },
    "e2e": "not_run | pass | fail"
  },
  "entries": [
    {
      "id": "LOG-0042",
      "time": "<ISO time>",
      "milestone": "N3",
      "step": "L5",
      "substep": "L5.2",
      "action": "started | done | blocked | skipped | corrected | exit_checked",
      "item": "the file, spec id or exchange the sub-step is working on",
      "summary": "what was done, in one or two sentences",
      "files": [
        {"path": "", "change": "created | modified | deleted", "lines": "", "why": ""}
      ],
      "plan_files": ["nhcx-plan/N3/code.json"],
      "specs": ["A4", "F8", "D18"],
      "commit": "",
      "corrects": "",
      "blocked_reason": ""
    }
  ]
}
```

- `id` counts up from `LOG-0001` and is never reused.
- `milestone` is the slice the entry belongs to (`N0` to `N6`), or `bootstrap` for the one-time global bootstrap (L1.0 to L1.3); every entry carries one.
- `files` lists target source files; `plan_files` lists the `nhcx-plan/` files touched, under the milestone's own folder (`nhcx-plan/N3/...`), except the bootstrap's `knowledge.json` and the technology part of `discovery.json`, which sit at the plan root.
- `lines` is the changed range after the change.
- `commit` is filled when the change is committed (L5.5 commits per batch).
- `status` is recomputed from `entries` after each append: `bootstrap`, then one entry per milestone with its own per-step state. Each milestone runs L1 to L7 only; `done_when` is the milestone's **dry-run** done-when, and its `state` is `done` only when `done_when` is `pass`. The final L8 end-to-end is not a milestone step; it is tracked once at the root (`status.e2e`: `not_run | pass | fail`), run after every milestone is `done`.
- Ids in the JSON stay bare (`"milestone": "N3"`, `"step": "L5"`); the name is added wherever a person reads them (LOGN).

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
| Step | State | Sub-steps done | Exit checked |
|---|---|---|---|
| L1 Discovery | done | 6 / 6 | yes |
| L5 Write Code | in progress | 3 / 5 | no |

- [x] L5.1 Take the next file
- [ ] L5.2 Write it (in progress: `src/claims/preauth.py`)

## Changes
| Id | Time | Milestone | Sub-step | Action | Summary | Files |
|---|---|---|---|---|---|---|
| LOG-0042 | 2026-09-22 10:14 | N3 | L5.2 Write it | done | Pre-auth send service (A4) | `src/claims/preauth.py` created 1-188; `nhcx-plan/N3/code.json` |
```

First a milestone table (state, steps done out of 7, dry-run done-when), with the one-line bootstrap state and the final end-to-end state beneath it; then one section per milestone that has been started, in dependency order, each holding its own step table (L1 to L7) and the sub-step checklist of its active step; then the changes table, every entry newest last, with a Milestone column.

#### LOGN. EVERY ID WITH ITS NAME
A person reading the log, the report or a message must not have to look an id up. Every step, sub-step, test and spec id shown to a person is written with its name beside it, taken from the skill's own indexes and spec titles, never made up:
- a step: `L3 Integration Planning`, never `L3` alone;
- a sub-step: `L5.2 Write it`;
- a test: `T3 IRDAI Policy Search and Eligibility`, never `T3` alone; a result is the id, the name, the runner and the result: `T3 IRDAI Policy Search and Eligibility (CLI): pass`;
- a spec: `A4 Pre-auth Submit`; an NHA use case: `nha:B3 Pre-authorisation`.

This holds in `progress.md`, in every table of `report.html` (an id column shows the name in the same cell, or has a Name column beside it), and in every message to the user that reports progress, a step, a test run or an error ("L8 End-to-end Tests: T14 PMJAY Pre-authorisation Through the Payer Service (GUI) failed", not "L8: T14 failed"). Pass and fail stay one word; the name is what is added.

The names come from `nhcx-plan/names.json`, written in the bootstrap with the report builder from the skill's indexes (`steps/INDEX.md`, `milestones/INDEX.md`, `tests/INDEX.md` and each spec's `title`): `{"N3": "Pre-authorisation and Biometric", "L3": "Integration Planning", "L5.2": "Write it", "T3": "...", "A4": "..."}`, every milestone and every id in SCOPE. The report builder and the agent both read it, so the page and the messages use the same words. An id missing from it is shown as `<id> (unnamed)` and logged as an error to fix, never left bare. A milestone is written with its id and name too: `N3 Pre-authorisation and Biometric`, never `N3` alone.

#### LOGH. report.html

Rebuilt as the last action of every prompt, however the prompt ended: after a step, part of a step, a fix, a test run, or a question answered without any change. It is written from the plan files only, never from memory of the conversation, so it says what the records say. It is never edited by hand.

**Built by a script, not by hand.** The page is produced by a report builder the skill writes into the target at L1, in the target's own language and kept beside the plan files: `nhcx-plan/report.py` for a Python target, `nhcx-plan/report.mjs` for Node, `nhcx-plan/report.php` for PHP, `nhcx-plan/Report.java` (or a Gradle/Maven task) for Java, and so on, with no dependency beyond the language's standard library. It reads `nhcx-plan/*.json` and writes `nhcx-plan/report.html`. Rebuilding the report means running that script; the agent runs it at the end of every prompt, and a person can run it at any time.

**Wrapper scripts, one per platform.** Beside it, `nhcx-plan/make-report.sh` (POSIX shell, executable) and `nhcx-plan/make-report.bat` (Windows), both doing the same thing: run the report builder, wait 10 seconds, run it again, and keep doing so until stopped (Ctrl-C). One line of output per rebuild, with the time. So a person opens `report.html` once, leaves `make-report.sh` running, and the page is at most 10 seconds behind the plan files; its refresh button (below) shows the latest build. Both scripts resolve the builder relative to their own location, so they work from any working directory, and they exit with the builder's status when a single run is asked for (`make-report.sh once`).

**Reads:** every file under `nhcx-plan/`. At the root: `names.json` (the name beside every milestone and id, LOGN), `progress.json`, `progress.md`, `knowledge.json` (with `mode` and the bootstrap), the technology part of `discovery.json`, and `e2e.json` (the one final end-to-end run across the whole lifecycle). Then, per milestone, the files under `nhcx-plan/<Nx>/`: `discovery.json`, `mapping.json`, `plan.json`, `code-plan.json`, `code.json`, `validation.json`, `dry-run.json` (L1 to L7 only; there is no per-milestone `e2e.json`). The builder discovers the milestone folders present (`N0` to `N6`) rather than assuming all exist. A file that does not exist yet is shown as "not yet written", never as a pass. A file that does not parse is shown with its parse error, and the rest of the page still builds.

**One page, tabs: Overview, then one tab per milestone, then End-to-end.** The page is organised by milestone, not by source file. The tab bar is: Overview, Bootstrap, then one tab per milestone present (N0 to N6), then End-to-end, then Log.

| Tab | Shows |
|---|---|
| Overview | The target repository, the skill and its version, the mode (`milestone`), when the page was built, and one line of overall state: milestones done out of total, tests passing out of run, open errors. Then the **milestone strip** (below) and **Errors**: everything open across all milestones and the final end-to-end run, newest first, each tagged with its source: `blocked` entries and their reasons, failed validation items, failed dry-run tests, failed or blocked end-to-end legs with their detail, correlation ids and ledger ids, and failed setup checks. An error a later entry resolves is left out. "No open errors" when there are none. |
| Bootstrap | The one-time global bootstrap: the knowledge source (`knowledge.json`, with `mode`) and the target's technology and component kit (the technology part of `discovery.json`): languages, framework, database, migrations, tests, the host components and the ABDM module. Shared by every milestone. |
| N0 to N6 (one each) | That milestone's own work: a header line of its state, its dry-run done-when and the milestones it depends on; its **seven steps** (L1 to L7) with sub-steps done out of total and exit checked, and the active step's sub-step checklist; then its records from `nhcx-plan/<Nx>/` as folding sections in step order: Discovery (the ids it delivers, found/partial/missing), Mapping, Plan (its phase), Code plan, Code, Validation (failures first), Dry-run (its done-when, per runner). A milestone not yet started shows "not started" and its dependencies. |
| End-to-end | The single final run across the whole lifecycle N1 to N6, from the root `e2e.json`: its overall state (not run until every milestone is done), then the T tests of [references/TESTS.md](../references/TESTS.md) per runner (GUI and CLI), failures first, each with its steps, detail, correlation and ledger ids. Not shown per milestone. |
| Log | Every `progress.json` entry across all milestones, newest first: time, milestone, sub-step, action, item, summary, files. |

Within a milestone tab, each step's records render as tables, with the fields that file's spec names as columns, and every milestone, step, sub-step, test and spec id written with its name (LOGN). Any structure the builder does not know is still shown, written out as text (below), so nothing in a plan file is invisible; JSON itself never appears on the page. Long text is not cut short.

**Clean, self-contained, and written for a person: never a dump of the JSON.** One file that opens from disk in any browser and needs nothing else: no external stylesheets, fonts, images or scripts, no framework, the CSS and script below inline. It follows the viewer's light or dark theme. No secrets: configuration values are shown as `set` or `missing`, as [T1. Test Configuration](../tests/T1-test-configuration.md) does.

- **Header:** the title "NHCX integration report", a **Refresh** button (`location.reload()`, showing whatever the last rebuild wrote), and one line: target, skill and version, mode, when it was built, milestones done out of total, tests passing out of run, open errors.
- **Tab bar** under it, sticky as the page scrolls, one pill per tab (Overview, Bootstrap, N0 to N6, End-to-end, Log); a milestone pill carries a red count of its open errors, and a tick, `!` or a dim style for done, blocked or not-started; the End-to-end pill carries its own error count and state. The current tab is kept in the URL hash, so a reload stays on it; each section's `id` is `tab-<name>` (`tab-overview`, `tab-bootstrap`, `tab-N3`, `tab-e2e`, `tab-log`), so the hash never scrolls the header away.
- **Overview:** three tiles (Milestones `n / total`; Dry-run tests as `passed / run` across all milestones and End-to-end tests as `passed / run` from the final run, each with a bar and the failed and blocked counts; Open errors, red when above zero); then the **milestone strip**: the milestones side by side in dependency order, each a card with its id and name, a tick when done, `!` when blocked, the active one outlined, a dim style when not started, its `done / 7 steps`, its dry-run done-when as a pill (pass, fail, not run), and the milestones it depends on; then **Open errors** as cards, newest first: a status pill, the source tagged with its origin ("N3 · Dry-run · CLI · cause: ours", or "End-to-end · N3 leg · CLI · cause: sandbox" for the final run), the id with its name as the title, the detail, and the correlation and ledger ids only when there are any. "No open errors" in a green banner when there are none. Clicking a milestone card opens its tab.
- **Each milestone tab:** a header line (state pill, dry-run done-when pill, "depends on N0, N2"); then the milestone's seven steps (L1 to L7) side by side, each with its id and name, a tick when done, `!` when blocked, the active one outlined, `done / total sub-steps` and "exit ✓"; then its records as folding sections in step order (Discovery, Mapping, Plan, Code plan, Code, Validation, Dry-run), each reading from `nhcx-plan/<Nx>/`.
- **End-to-end tab:** the one final run from the root `e2e.json`: a header line with its state (not run until every milestone is done), then the T tests per runner (GUI, CLI) as folding groups, failures first, each test written out with its steps, detail and ids (LOGN). It reads nothing per milestone.
- **Every id reads with its name**, milestones and field references too: `N3` as "N3 Pre-authorisation and Biometric", `D1.name` as "D1 Organization · name", `F17:provider.name` as "F17 Organization · provider.name", a table name like `claim_diagnosis` as "Claim diagnosis" (LOGN).
- **Mapping** is grouped by table: one folding group per D spec titled with its id and name, its status counts as pills (mapped, new, missing) and what the plan does with the table, and inside it one row per field: field, where the HMIS keeps it (`table.column`), what it is sent as (the F spec element, named), status, how (the transform or resolution), the screens that show it, and the source file and line. Code systems follow as their own table.
- **Every other tab:** a filter box that hides rows not containing the text typed; a record (a run, a configuration, a target) as a two-column field list, side by side when there are two; lists as tables with a sticky header, alternate row shading and a row count, failures first where the tab says so, ids in natural order (T3 before T13); result, status, state, action and cause words as coloured pills (green pass, done, ok; red fail, error, missing; amber blocked, partial, in progress; grey skipped, not started); paths, files, commands and ids monospaced; long text wrapped at word boundaries, never cut. A column empty in every row is left out. Plan phases are folding groups with a `done / total` pill.
- **No JSON on the page.** Nested data is written out as text: a small record as `key value · key value`, a list of records as a list whose lines lead with the record's name in bold, then its result pill, then the rest in grey (a test's steps read "provider sends the validation check `fail` got AttributeError ..."); past six lines the rest folds behind "n more". progress.md's checklist sits in a folding block on the Progress tab.
- Without script the page still reads top to bottom with every section shown; printed, every tab prints in turn.

The page's CSS and script, used as they are (the class names are the contract the builder writes against):

```css
:root{--bg:#f6f7f9;--card:#fff;--fg:#1d2330;--muted:#667085;--line:#e3e6eb;--head:#f0f2f5;--accent:#2457c5;
--good:#127a3a;--good-bg:#e5f5ea;--bad:#b42318;--bad-bg:#fdecea;--warn:#a15c07;--warn-bg:#fdf3e1;--quiet:#596173;--quiet-bg:#eef0f3}
@media (prefers-color-scheme:dark){:root{--bg:#0f1218;--card:#171b23;--fg:#e6e8ee;--muted:#98a1b3;--line:#2a303c;--head:#1e232d;--accent:#7aa2ff;
--good:#5fd38a;--good-bg:#173323;--bad:#ff8a80;--bad-bg:#3a1a1a;--warn:#f3b55a;--warn-bg:#3a2a12;--quiet:#a9b0bf;--quiet-bg:#242a35}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
header.top{background:var(--card);border-bottom:1px solid var(--line);padding:18px 28px}
header.top h1{margin:0;font-size:20px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
header.top .meta{color:var(--muted);margin-top:4px}
button{font:inherit;cursor:pointer;border:1px solid var(--line);background:var(--card);color:var(--fg);border-radius:6px;padding:4px 12px}
button:hover{border-color:var(--accent);color:var(--accent)}
main{padding:12px 28px 60px;max-width:1500px}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}
.tile{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px 16px}
.tile .label{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.04em}
.tile .value{font-size:26px;font-weight:600;font-variant-numeric:tabular-nums;margin:2px 0 6px}
.tile .value small{font-size:15px;color:var(--muted);font-weight:500}
.tile .sub{color:var(--muted);font-size:12px}
.tile.bad .value{color:var(--bad)}
.meter{height:6px;background:var(--quiet-bg);border-radius:3px;overflow:hidden;margin-bottom:6px}
.meter span{display:block;height:100%;background:var(--accent)}.meter.good span{background:var(--good)}
.steps{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px}
.steps li{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 12px;display:grid;grid-template-columns:auto 1fr;column-gap:10px}
.steps .dot{grid-row:span 2;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-weight:700;font-size:12px;background:var(--quiet-bg);color:var(--quiet)}
.steps .done .dot{background:var(--good-bg);color:var(--good)}.steps .active .dot{background:var(--accent);color:#fff}.steps .active{border-color:var(--accent)}
.steps .blocked .dot{background:var(--warn-bg);color:var(--warn)}
.steps .sname{font-weight:600;font-size:13px}.steps .ssub{color:var(--muted);font-size:12px}
nav.tabs{position:sticky;top:0;z-index:2;background:var(--bg);padding:10px 0;margin-bottom:8px;display:flex;gap:6px;flex-wrap:wrap;border-bottom:1px solid var(--line)}
nav.tabs button{border-radius:999px}nav.tabs button.on{background:var(--accent);border-color:var(--accent);color:#fff}
nav.tabs .badge{margin-left:6px;font-size:11px;background:var(--bad);color:#fff;border-radius:999px;padding:0 6px}
section{display:none}section.on{display:block}
section>h2{font-size:17px;margin:6px 0 10px}
h3{font-size:14px;margin:22px 0 8px}
.filter{width:min(420px,100%);padding:6px 10px;border:1px solid var(--line);border-radius:6px;background:var(--card);color:var(--fg);margin-bottom:4px}
.tablewrap{overflow:auto;max-height:75vh;background:var(--card);border:1px solid var(--line);border-radius:10px}
table{border-collapse:collapse;width:100%}
th{position:sticky;top:0;background:var(--head);text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.03em;color:var(--muted);font-weight:600;white-space:nowrap}
td,th{padding:7px 10px;border-bottom:1px solid var(--line);vertical-align:top}
tbody tr:nth-child(even){background:color-mix(in srgb,var(--head) 45%,transparent)}
tbody tr:hover{background:color-mix(in srgb,var(--accent) 8%,transparent)}
td{max-width:520px;overflow-wrap:break-word;word-break:normal}
td.mono{word-break:break-all}
td:first-child{min-width:120px}
td ul.plain{min-width:260px}
.mono,code,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px}
pre{white-space:pre-wrap;margin:6px 0 0;background:var(--head);padding:8px;border-radius:6px;max-height:420px;overflow:auto}
details>summary{cursor:pointer;color:var(--accent)}
details.group{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 14px;margin:10px 0}
details.group>summary{color:var(--fg);display:flex;gap:10px;align-items:center}
.pill{display:inline-block;padding:1px 9px;border-radius:999px;font-size:12px;font-weight:600;white-space:nowrap;background:var(--quiet-bg);color:var(--quiet)}
.pill.good{background:var(--good-bg);color:var(--good)}.pill.bad{background:var(--bad-bg);color:var(--bad)}.pill.warn{background:var(--warn-bg);color:var(--warn)}
.count,.note,.empty{color:var(--muted);font-size:12px;margin:6px 2px}.empty{font-style:italic}
dl.kv{display:grid;grid-template-columns:minmax(140px,max-content) 1fr;background:var(--card);border:1px solid var(--line);border-radius:10px;margin:0;overflow:hidden}
dl.kv>div{display:contents}dl.kv dt,dl.kv dd{margin:0;padding:6px 12px;border-bottom:1px solid var(--line)}
dl.kv dt{color:var(--muted);text-transform:capitalize}dl.kv dd{overflow-wrap:anywhere;min-width:0}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:14px}
.errors{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:10px}
.err{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--quiet);border-radius:10px;padding:10px 14px;min-width:0}
.err.bad{border-left-color:var(--bad)}.err.warn{border-left-color:var(--warn)}
.err header{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.err .src{color:var(--muted);font-size:12px}
.err h4{margin:6px 0 4px;font-size:14px}
ul.plain{margin:0;padding-left:16px}ul.plain li{margin:2px 0}.muted{color:var(--muted)}
details.group>summary .pill{margin-left:2px}.err p{margin:4px 0;overflow-wrap:anywhere}.err .ids{color:var(--muted)}
.ok-banner{background:var(--good-bg);color:var(--good);border-radius:10px;padding:12px 16px;font-weight:600}
@media (max-width:700px){header.top,main{padding-left:14px;padding-right:14px}.errors{grid-template-columns:1fr}}
@media print{nav.tabs,.filter,button{display:none}section{display:block}.tablewrap{max-height:none}}
```

```html
<script>
const show=id=>{if(!document.getElementById('tab-'+id))id='overview';
document.querySelectorAll('section').forEach(s=>s.classList.toggle('on',s.dataset.tab===id));
document.querySelectorAll('nav.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab===id));history.replaceState(null,'','#'+id)};
document.querySelectorAll('nav.tabs button').forEach(b=>b.onclick=()=>show(b.dataset.tab));
document.querySelectorAll('section').forEach(s=>{if(s.dataset.tab==='overview'||!s.querySelector('tbody'))return;
 const f=document.createElement('input');f.className='filter';f.placeholder='Filter the rows in this tab';
 f.oninput=()=>{const q=f.value.toLowerCase();s.querySelectorAll('tbody tr').forEach(r=>r.hidden=!!q&&!r.textContent.toLowerCase().includes(q))};
 s.querySelector('h2').after(f)});
show(location.hash.slice(1)||'overview');
</script>
```

The shape the builder writes, abbreviated:

```html
<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>NHCX integration report: acme-hmis</title><style>/* the CSS above */</style>
<header class="top"><h1>NHCX integration report <button onclick="location.reload()">Refresh</button></h1>
<div class="meta">acme-hmis &middot; nhcx-full 1.10.0 &middot; milestone mode &middot; built 20 Oct 2026, 10:14:05 &middot; 3 of 7 milestones done &middot; end-to-end not run &middot; 2 open errors</div></header>
<main><nav class="tabs"><button data-tab="overview">Overview<span class="badge">2</span></button><button data-tab="bootstrap">Bootstrap</button>
 <button data-tab="N0">N0 Foundation</button><button data-tab="N3">N3 Pre-authorisation and Biometric<span class="badge">2</span></button>...<button data-tab="e2e">End-to-end</button><button data-tab="log">Log</button></nav>
<section id="tab-overview" data-tab="overview"><h2>Overview</h2>
 <div class="tiles"><div class="tile"><div class="label">Milestones</div><div class="value">3 <small>/ 7</small></div>
  <div class="meter good"><span style="width:43%"></span></div><div class="sub">N0 Foundation to N6 Payment</div></div>...</div>
 <h3>Milestones</h3><ol class="steps"><li class="done"><span class="dot">&#10003;</span><span class="sname">N0 Foundation</span><span class="ssub">7 / 7 steps &middot; <span class="pill good">pass</span></span></li>
  <li class="active"><span class="dot">3</span><span class="sname">N3 Pre-authorisation and Biometric</span><span class="ssub">4 / 7 steps &middot; <span class="pill">not run</span> &middot; depends on N0, N2</span></li>...</ol>
 <h3>Open errors</h3><div class="errors"><article class="err bad"><header><span class="pill bad">fail</span><span class="src">N3 &middot; Dry-run &middot; CLI &middot; cause: ours</span></header>
  <h4>T14 PMJAY Pre-authorisation Through the Payer Service</h4><p>built claim bundle rejected by the F8 validator</p><p class="mono ids">correlation 5b1f0c1e</p></article></div></section>
<section id="tab-N3" data-tab="N3"><h2>N3 Pre-authorisation and Biometric</h2>
 <p class="meta"><span class="pill warn">in progress</span> <span class="pill">dry-run done-when: not run</span> &middot; depends on N0, N2</p>
 <ol class="steps"><li class="done"><span class="dot">&#10003;</span><span class="sname">L1 Discovery</span><span class="ssub">6 / 6 sub-steps &middot; exit &#10003;</span></li>
  <li class="active"><span class="dot">5</span><span class="sname">L5 Write Code</span><span class="ssub">3 / 5 sub-steps</span></li>...</ol>
 <details class="group"><summary><b>Mapping</b><span class="pill good">22 mapped</span><span class="pill bad">3 missing</span></summary>
 <div class="tablewrap"><table><thead><tr><th>field</th><th>stored in the HMIS</th><th>sent as (FHIR)</th><th>status</th><th>how</th>...</tr></thead>
 <tbody><tr><td>diagnosis</td><td>claim_diagnosis.icd10</td><td>F8 Claim &middot; diagnosis[].coding</td><td><span class="pill good">mapped</span></td>...</tr></tbody></table></div></details>
 <details class="group"><summary><b>Dry-run</b><span class="pill good">8 pass</span></summary>...</details></section>
<section id="tab-e2e" data-tab="e2e"><h2>End-to-end</h2>
 <p class="meta"><span class="pill">not run</span> &middot; the final sandbox run across N1 to N6, after every milestone is done</p>
 <details class="group"><summary><b>CLI</b><span class="pill bad">1 fail</span></summary>...<tbody><tr><td>T14 PMJAY Pre-authorisation Through the Payer Service</td><td>CLI</td><td><span class="pill bad">fail</span></td>...
 <td><ul class="plain"><li><b>provider sends the validation check</b> <span class="pill bad">fail</span> <span class="muted">got AttributeError ...</span></li></ul></td></tr></tbody>...</details></section>
</main><script>/* the script above */</script></html>
```

```sh
#!/bin/sh
# nhcx-plan/make-report.sh: rebuild report.html every 10 seconds until stopped.
# "make-report.sh once" rebuilds it one time and exits with the builder's status.
cd "$(dirname "$0")" || exit 1
build() { python3 report.py; }          # the target's builder: node report.mjs, php report.php, ...
if [ "$1" = once ]; then build; exit $?; fi
while :; do
  build && echo "$(date '+%H:%M:%S') report.html rebuilt" || echo "$(date '+%H:%M:%S') report build failed"
  sleep 10
done
```

```bat
@echo off
rem nhcx-plan\make-report.bat: rebuild report.html every 10 seconds until stopped (Ctrl-C).
rem "make-report.bat once" rebuilds it one time.
cd /d "%~dp0"
if "%1"=="once" ( python report.py & exit /b %errorlevel% )
:loop
python report.py && echo %time% report.html rebuilt || echo %time% report build failed
timeout /t 10 /nobreak >nul
goto loop
```

The builder and the two wrapper scripts are written in L1 (before any other plan file, so every later step can rebuild the page) and logged like any other file. The build of the page is itself logged: one entry, action `done`, item `nhcx-plan/report.html`, in the sub-step that was running (or the last one, when the prompt ran none).

#### LOGX. EXIT
- Every entry carries a `milestone` (`N0` to `N6`, or `bootstrap`).
- Every sub-step of a finished step of a milestone has a `started` and a closing entry under that milestone.
- Every file named in a milestone's `code.json`, and every file changed in the target, appears in at least one entry's `files`.
- progress.md matches progress.json: the milestone table, the per-milestone step tables and the changes table.
- No milestone, step, sub-step, test or spec id appears in progress.md, report.html or a progress message without its name; `names.json` holds every milestone and every id in SCOPE.
- report.html was rebuilt at the end of the last prompt by the report builder, is organised by milestone (Overview, Bootstrap, one tab per milestone present, End-to-end, Log), and its counts match the plan files.
- A milestone shows `done` only when its dry-run done-when is `pass`; a milestone runs L1 to L7 only; a milestone is never started before every milestone it depends on is `done`.
- The final L8 end-to-end is not run until every milestone is `done`; it writes one `nhcx-plan/e2e.json` at the root and `status.e2e`, never a per-milestone `e2e.json`.
- `nhcx-plan/make-report.sh once` and `make-report.bat once` rebuild it and exit 0.
