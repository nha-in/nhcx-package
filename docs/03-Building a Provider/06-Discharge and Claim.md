# Discharge and claim

On the general network the claim is two submissions. A provisional one goes before the patient leaves, so the payer can object while corrections are still cheap. The final one goes after discharge, with the finalised bill, and is the one adjudicated for settlement. Both are the same `Claim` resource with `use = claim`, told apart by workflow code.

## What the user does

**Discharge.** The user records the discharge type, from the NRCeS set: to home, to mortuary, left against medical advice, discharged against medical advice. Discharge date, and surgery date where there was one. The documents available at this point are attached and the provisional submission goes.

**Final claim.** After the payer's answer to the provisional submission, the finance section: hospital bill number and date, the bill itself, the amount claimed. Post-operative evidence and anything the payer flagged on the provisional review are attached. The claim amount may not exceed the preauthorisation's approved amount; enforce it before submit.

## What the system calls

```
POST /v1/claim/submit      workflow 15, the final claim
callback /v1/claim/on_submit
```

The provisional discharge submission carries workflow 14 and the same `Claim` bundle. The workflow sheet defines the code and the handbook describes the stage, but neither names the endpoint it travels on; `/v1/claim/submit` is the natural home, and the sample bundles do not include one. Confirm with the payer before building the provisional step.

Same recipient, same reference as the preauthorisation, a new correlation ID each time. The handbook's advice is to build the claim from the preauthorisation bundle. Same diagnosis and procedures unless treatment deviated, estimated amounts replaced with the bill, the full document set added, and the `preAuthRef` from the approval carried in.

## What goes in the bundle

The same `Claim` as the preauthorisation with `use = claim`. That single field is the difference the payer keys on. What changes in practice:

- Supporting-info dates grow from two to four, plus the discharge status:

| Field | Category | Code |
| :---- | :---- | :---- |
| Registration date | `OTH` | `EDT` |
| Admission date | `ADMD`, or `ONS` | `ADDD` |
| Surgery date | `SURD`, or `ONS` | `ADDD`, or `PSP` |
| Discharge date | `DSCHD`, or `ONS` | `ADDD`, or `DSDE` |
| Discharge status | `DIS` | `DTH`, `DTM`, `LAMA` or `DAMA` |
| Death date, if `DTM` | `ONS` | `DTM` |

**Two forms exist for those three dates and they are not interchangeable.** The payer's own error codes describe the `ONS` form with distinct codes per date. Every one of the twenty-two published sample bundles uses the other: category `ADMD`, `SURD` or `DSCHD`, all three carrying the code `ADDD`, so the category is what tells them apart and the code is noise. Send what the samples send, keep the `ONS` form behind a switch, and settle it with your payer before certification. The Codes and Value Sets chapter sets out both.

- The discharge summary as a document under category `HDS`.
- The bill under category `MB`, and the remaining mandatory documents the plan lists for claim rather than preauthorisation.

## Reading the answers

The provisional submission is answered with 261 approved, 262 rejected or 263 queried. A rejection here means fix and resend before the final claim; nothing is closed.

The final claim uses the same decision table as preauthorisation, with two additions. The payer may send several interim answers on the same correlation ID before a final one: `28` in process, `29` forwarded, each with `response.partial`. Keep listening until `response.complete`. And a rejection, `291` with reason `cancelled`, closes the claim permanently; nothing further can be submitted against that claim number except a Task.

The claim is only closed once payment code 33 arrives with a UTR. Adjudication closes the decision; settlement closes the money.

## What the payer checks on a claim

On top of the preauthorisation checks, a claim is refused for these.

| Check | Why it exists |
| :---- | :---- |
| An approved preauthorisation exists for the case number | `ERR-PYR-CLM-007` under PMJAY, where the claim goes out under the pre-authorisation's number rather than a number of its own |
| No claim already raised against it | One case, one claim |
| Every item was on the preauthorisation, was not rejected there, and is not claimed at a higher quantity | The claim cannot grow past what was approved |
| The discharge status and the discharge date are present | They are what tell the payer the episode ended, and when. The gateway checks for them before the payer sees the bundle |
| The amount is within the approved amount and the wallet | Enforce it before enabling submit |
| Under PMJAY, the discharge biometric token or the discharge consent questionnaire | `PAYR-1363` names the missing form |

## After a decision

| Situation | What the user does | What the system sends |
| :---- | :---- | :---- |
| Query | Attaches what was asked, replies from the inbox | Communication response, or claim bundle with workflow 151 where the payer takes it there |
| Rejected or reduced | Appeals, with a document | Task, code `reprocess`, workflow 36 |

The Task names the case by claim number and carries a reason: `claimrejected` for a rejection, `partialpayment` for a shortfall, and the value set also allows `erroneousclaim`. The payer's answer comes on `/v1/task/on_submit` as a Task wrapping a `ClaimResponse`, read with the same parser as any other: 252 approved, 253 rejected, 254 queried. Map the payer's denial reasons, `ClaimError-1` onward, into the appeal screen so the user sees why before deciding whether to appeal.
