# Adjudicating preauthorisation

The preauthorisation queue is where a payer's clinical judgement meets the exchange. The system's job is to get a case in front of the right doctor with everything they need, and to turn their decision into a `ClaimResponse`. It also enforces the sequencing rules that keep one case from becoming several.

## What the adjudicator sees

A queue, ordered by turnaround-time remaining, because a scheme with TAT-based auto-approval pays for every case the doctor does not reach in time. Opening a case shows:

- The beneficiary, the policy, the wallet balance now and after this request.
- Diagnosis, packages with rates and add-ons, care team, dates.
- Every document, structured ones rendered as records rather than opened as files, and the STG questionnaire answers beside the package they belong to.
- The plan's flags for each package: auto-approvable, enhanceable, reserved, standalone.
- History on the case: earlier preauthorisations, enhancements, queries and answers.

Four actions: approve, approve at a reduced amount with a note, query, reject with a reason from the scheme's denial list. Item by item, then a total.

## What the system hosts

```
/v1/preauth/submit      answer on /v1/preauth/on_submit
```

The workflow code says which kind of request it is: 12 new, 121 resubmission, 13 enhancement, 19 an answer to your query. Acknowledge receipt at once with code 20 and `response.partial`, so the provider knows it is in the queue.

## Validate before queueing

The reference payer's preauthorisation errors are the checklist. Run them on arrival and refuse with a protocol response rather than wasting a doctor's time:

- Amount above zero and within the wallet balance.
- Specialty code and display, package code and display, exactly as the plan has them; quantity at least one; net above zero.
- Registration and admission dates present and well-formed.
- Sequencing. No case already in progress for this number. An enhancement or resubmission only where an approved record exists. A new preauthorisation refused where an approved one exists. No preauthorisation once a claim is raised, and nothing at all on a cancelled case.
- One active preauthorisation per beneficiary across all hospitals; tell the provider which hospital holds it.
- Every STG questionnaire the plan demands answered; a biometric token or the consent questionnaire present.
- Under PMJAY, `LM100` never on a preauthorisation; investigations mandatory for private hospitals; newborn cases with date of birth, gender and documents, and within six years.

## Deciding automatically

Two rules let a case skip the queue, and both come from the plan:

- **Auto-approve** when this is the first preauthorisation for the case and every package carries `ApprovalNotRequired`.
- **TAT approve** when the policy allows it and no doctor has acted within the configured window.

Log which rule fired. The provider sees an approval; the audit sees why.

## What goes in the answer

A collection bundle with the `ClaimResponse`, the `Patient`, the `Coverage` and the `Organization`s. `use = preauthorization`. The provider reads `outcome` and the adjudication reason together, so set both deliberately.

| Decision | `outcome` | `adjudication.reason` | Workflow | Also set |
| :---- | :---- | :---- | :---- | :---- |
| Approved | `complete` | `approved` | 21 | `preAuthRef`, every item's four amounts equal |
| Approved, reduced | `partial` | `approved` | 21 | `processNote` explaining the reduction, linked from the item by `noteNumber` |
| Queried | `partial` | `queried` | 24 | Query text; totals zero; `eligpercent` zero |
| Rejected | `complete` | `cancelled` | 23 | `disposition` and the denial code |
| Enhancement approved or denied | as above | | 22 or 231 | |

Per item, four adjudication lines: `submitted`, `eligible`, `copay` (zero under PMJAY), `benefit`. Totals at the claim level with the same categories, plus tax, incentive and patient-liable amounts where the scheme has them.

The `preAuthRef` you issue is what the provider will quote on the claim. Make it unique and durable.

## What the provider reads from your answer

Three fields on the response decide what the hospital's screen shows, and getting them wrong misstates the decision rather than failing loudly.

| What you set | What the provider does with it |
| :---- | :---- |
| `outcome` plus the adjudication reason | Reads them as a pair. `complete` alone means approved or rejected, so the reason is the difference |
| The `benefit` adjudication, per item and at claim level | Shows it as the approved amount. The `submitted` category alongside is what was asked for, and showing that as the decision is the classic provider-side error |
| `processNote`, linked from the item by `noteNumber` | Shows it verbatim as the reduction reason |
| `preAuthRef` | Quotes it on the claim. Make it unique and durable |

Note what the published PMJAY responses do **not** carry: no `ClaimResponse.request` pointing back at the `Claim`, no `ClaimResponse.type`, and no `preAuthRef` at all. The case number in `identifier[0].value` is what actually travels forward. If your system issues a real `preAuthRef`, you are ahead of the samples, and you should say so to integrators rather than assume they read it.

## Writing a query

Under PMJAY the query travels in `item.adjudication.reason.coding.display` as a pipe-delimited audit trail, `USER~datetime~type~comment~trust`, with multiple entries separated by `|`. The provider shows the comment. Keep it specific: name the document or the clarification, and the package it concerns. A vague query costs a full round trip and a day of TAT.

Under PMJAY the provider answers on the same endpoint with code 19. On the general network a payer may instead raise a Communication with reason `additionalinfo`; the provider answers on the communication endpoint. Do not use both for the same question.

## Approval letters

The value set includes form codes for letters: `preauthapproval`, `preauthdenial`, and later `claimapproval`, `claimdenial`, `dischargeapproval`. Where the scheme issues them, attach the letter as a `DocumentReference` referenced from the response.
