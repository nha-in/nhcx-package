# L4. Code Planning

#### L4G. GOAL
Decide how the code is written before writing it: the module layout in the target, every file to create or change, the spec items each implements, the order to write them in, and (only for files whose layout the specs do not already fix) the functions in them.

#### L4I. INPUTS
- `nhcx-plan/plan.json`.
- `nhcx-plan/discovery.json` technology and conventions.

### L4.1 Adopt the target's conventions
Read three or four existing modules of the same kind (a screen, a route handler, a model, a migration, a test) and record the conventions to copy: naming, folder layout, error handling, logging, how forms validate, how money and dates are stored, how tests are named. New code reads like the surrounding code. Record also, from `technology.components` and mapping.json `components`, the host component for each kind and how it is imported and fed (props, slots, template tags or partials, whatever the target uses); nothing in a spec names a framework, so this is where each spec meets the target's own idiom.

### L4.2 Lay out the modules
Start from [references/SCAFFOLDING.md](../references/SCAFFOLDING.md) (module layout, file list, dependency rules, configuration) and map each part onto the target's structure:
- gateway (G1 to G11), in-process, with its configuration file and key material outside the repository
- FHIR builders and parsers (F), one per resource or bundle
- claim services (the A pseudocode) and the callback dispatcher and handlers (C1 to C10)
- models and migrations (D)
- screens (S) and the navigation entry, each built from the host's components; a new component file is planned only for a kind discovery recorded `none`

### L4.3 List every file
For each file: path, create or modify, the plan step (P ids) it belongs to, the spec ids it implements, the files it depends on, and for a screen the host components it uses.

Do **not** pre-list the functions of a file whose decomposition the spec already dictates (a FHIR builder/parser (F), a claim service (A pseudocode), a callback handler (C), a model or migration (D), or a screen): L5 writes those straight from the pseudocode and field tables, so a speculative `functions[]` here is re-derived and thrown away. List `functions[{name, purpose}]` **only** for a file whose layout the specs do not fix: the gateway plumbing (G1 to G11), the F1 bundle envelope, the C1 dispatcher, and any shared helper several files depend on. For every other file, name at most its primary export (or leave `functions` empty); the per-symbol record is written in L5's `code.json` once the code exists.

### L4.4 Order the work
Order files so each compiles and can be tested when written: migrations and models, then gateway, then FHIR mappers, then services and callbacks, then screens. Group them into batches either by plan phase or **by layer** (gateway, models, FHIR, services, API, screens); batches by layer let several files be written in parallel without waiting for a whole phase, and the phase's `done_when` is then checked in L7 and L8 rather than at the end of the batch. Say which grouping the plan uses in `code-plan.json`.

### L4.5 Plan the tests alongside
For each file, name the `test_file` that will cover it in L7. Do not pre-list which spec rules the tests must pin: L7 reads `code.json` and the spec and derives the rules (validation messages, status transitions, verdict mapping) when it writes the tests, so enumerating them here is re-derived and unused.

#### L4O. OUTPUT
`nhcx-plan/code-plan.json`:

```json
{
  "conventions": [{"topic": "error handling", "rule": "", "example": {"file": "", "lines": ""}}],
  "modules": [{"name": "gateway", "dir": "", "specs": ["G1", "G11"]}],
  "files": [
    {
      "order": 12,
      "path": "",
      "action": "create | modify",
      "plan_step": "P5.2",
      "implements": {"screens": [], "apis": ["A4"], "callbacks": [], "fhir": ["F8"], "database": ["D18"], "gateway": []},
      "functions": [{"name": "", "purpose": ""}],
      "host_components": [{"kind": "type-ahead", "component": "", "file": ""}],
      "depends_on": [""],
      "test_file": ""
    }
  ],
  "_note": "functions[] is filled ONLY for files whose layout the specs do not fix (gateway G1-G11, F1 envelope, C1 dispatcher, shared helpers). For a file that implements one spec's pseudocode, leave functions empty or name just the primary export; L5 writes it from the pseudocode and records per-symbol detail in code.json. test_file is the path only; the rules it must pin are derived in L7.",
  "batches": [{"id": "B3", "phase": "P3", "files": [12, 13, 14]}],
  "corrections": []
}
```

#### L4L. LOG
Record in `nhcx-plan/progress.json` and regenerate `nhcx-plan/progress.md`, as [LOG.md](LOG.md) describes. One entry per sub-step. L4.3 logs one entry per file it plans (the path as `item`), and every write to `nhcx-plan/code-plan.json`.

#### L4X. EXIT
- Every step in plan.json is covered by at least one file.
- Every spec id delivered by the plan appears under some file's `implements`.
- The order respects `depends_on`, and every file has a test file.
- Every screen file lists its `host_components`, and no file creates a component for a kind the host already provides.
- Every sub-step of L4 has its `started` and closing entries in progress.json, and every file changed is named in one.
