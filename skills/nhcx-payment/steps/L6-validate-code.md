# L6. Validate Code

#### L6G. GOAL
Check every written file against the specs it claims to implement, one file at a time, at a bounded **level** (L6.0), and record the result. Validation is one check per claimed spec part, not one per element: a file carries a handful of checks, not hundreds. Validation reads code against spec; it does not run the system (L7 and L8 do), and deep element-by-element FHIR conformance for an ordinary file is proven once at run time by the dry-run's bundle comparison (L7), not re-derived here.

#### L6I. INPUTS
- `nhcx-plan/code.json`.
- The spec files named under each file's `implements` and `symbols`.

### L6.0 The level of validation
Validation is bounded by a **level**, so a file is never picked over element by element. The number of checks on a file is the number of spec parts it claims, a handful, not one per FHIR element, column or line. There are three levels:

- **mechanical** (every file, always): the file builds, lints and type-checks; no secret in code; no ABHA create, link or verify code, ABHA column or second session-token cache where discovery found an M1 (`abdm.m1`); no component that duplicates a host one; errors surface as the spec says (a failed send keeps its ids); no dead code left from generation. This is L6.3, about six checks on the whole file.
- **standard** (the default for every file): mechanical, plus **one check per claimed spec part** (`symbols[].implements`), not one per element inside it. This is L6.2.
- **deep** (only F FHIR builders and G gateway files, and any file a standard check flagged): standard, plus the element-by-element pass of L6.2D. A single wrong FHIR element or gateway header breaks the whole exchange, so these files earn the extra cost; nothing else does.

L6.1 sets each file's level from its kind. Deep FHIR conformance for every other file is proven **once, at run time**, by the dry-run's bundle comparison (L7) against the knowledge source's example bundle, not re-derived statically here per element.

### L6.1 Take one file and set its level
Take the next file in code.json that has no validation entry, or whose content changed since its last one; validate only that file in this pass. Set its level (L6.0): `deep` for an F (FHIR builder) or G (gateway) file, `standard` for every other file. A file whose kind is unclear is `standard`.

### L6.2 Standard: one check per claimed spec part
For every `symbols[].implements` entry, record **one** pass or fail comparing the code with that spec part as a whole, not a check per element within it:
- pseudocode (A, C, G): the step sequence, branches and failure paths are present and in the spec's order, and status values are written as specified: one check per symbol.
- messages: the file's refusal and validation messages are verbatim: one check per file (list the first mismatch, do not enumerate every string).
- FHIR (F) at standard: the builder fills FnF from the mapped source and sets the F1 profiles and bundle order: one check per bundle. The element-by-element comparison is the `deep` pass (L6.2D), or the dry-run's bundle comparison for a non-deep file.
- database (D): the table's columns, keys and indexes match DnC and DnK: one check per table (name the first column that differs, do not score each column).
- screens (S): the screen's fields, options, columns, chips, empty states and actions match SnD, SnL and SnA, and it reuses the host components code-plan.json `host_components` names (a component that duplicates a host one is an `error`, fixed by switching to the host's): one check per screen.

### L6.2D Deep: element by element (F and G only)
Only for a file at level `deep`: every element in FnF filled from the mapped source with the right system and code; profiles and bundle order as in F1; a bundle the file builds matches the knowledge source's example bundle for that exchange element by element (`get_fhir_example` on the MCP, or the package's `fhir/<use case>/` bundle), or passes the HL7 validator with the NRCeS package. The MCP's `validate_fhir` is not used here: it knows only ABDM's DocumentBundle family and reports false findings against a ClaimBundle, TaskBundle or CoverageEligibilityRequestBundle ([KNOWLEDGE.md](../references/KNOWLEDGE.md)). For a G file: every `x-hcx` header, the JWE steps and the ledger write.

### L6.3 Mechanical: check the file as code
The mechanical level (L6.0), run on every file: build, lint and type-check pass; no secret in code; no ABHA create, link or verify code, ABHA column or second session-token cache where discovery found an M1 (`abdm.m1`); errors surface as the spec says (for example a failed send keeps its ids); no dead code left from generation. Three more, learnt from runs that passed every other check:
- **Layout.** The file sits where [SCAFFOLDING.md](../references/SCAFFOLDING.md) section 2 puts its spec (`gateway/`, `fhir/`, `services/`, `callbacks/`, dry-run tests under `tests/nhcx/dry_run/`), and no single file carries more than one spec group: one file holding F1 to F19, or every screen, is a `warning` naming the split, because it defeats the spec-to-file trace the next skill version is applied through.
- **Stage vocabulary.** Every write of a stage to D11 `supporting_info`, D12 or D15 writes `pre` or `post` and nothing else, through the D11 rule; a literal `preauth`, `claim`, `both` or a blank written there is an `error`.
- **Fixtures go through the door.** A test seed or fixture that stands in for a payer's answer (the T13 plan seed for C4, a notice for C10) is applied through the same handler the callback uses, never written straight into the tables; a writer that bypasses the handler is an `error`, because it skips the classification, the marks and the replacement rules the handler owns.

### L6.4 Record and fix
Record each finding with the spec part, the lines and a severity. Fix `error` findings in the same pass, re-validate the file, and update code.json line ranges. At most 3 rounds per file; after that mark it `failed` with the open findings.

#### L6O. OUTPUT
`nhcx-plan/validation.json`:

```json
{
  "files": [
    {
      "path": "",
      "validated_at": "<ISO time>",
      "content_hash": "",
      "level": "standard | deep",
      "status": "passed | fixed | failed",
      "checks": [
        {"spec": "A4P", "result": "pass | fail", "lines": "", "finding": "", "severity": "error | warning", "fixed": true}
      ],
      "rounds": 1
    }
  ],
  "summary": {"passed": 0, "fixed": 0, "failed": 0},
  "corrections": []
}
```

#### L6L. LOG
Record in `nhcx-plan/progress.json` and regenerate `nhcx-plan/progress.md`, as [LOG.md](LOG.md) describes. One entry per file validated (the path as `item`), with the checks failed and each fix made in the same round as its own entry, naming the lines changed. Every write to `nhcx-plan/validation.json` and every line-range update to `nhcx-plan/code.json` is logged.

#### L6X. EXIT
- Every file in code.json has an entry whose `content_hash` matches the current file, with its `level` (`standard`, or `deep` for F and G files).
- A file's checks number its claimed spec parts (standard) or its elements (deep, F and G only), never an exhaustive score of every element on an ordinary file.
- No file is `failed` without the user having seen its open findings.
- Every sub-step of L6 has its `started` and closing entries in progress.json, and every file changed is named in one.
