# Adjudicating claims

The claim is where money is decided. The payer receives the finalised bill and the full document set, and checks them against the approved preauthorisation and the discharge evidence. It then issues a decision that, once final, cannot be reopened except through the appeal Task.

## What the adjudicator sees

The claim queue, opened against the approved preauthorisation, side by side: what was approved, what is now claimed, and the difference highlighted. The discharge type and stage, the dates, the discharge summary as a record, the bill, the post-operative evidence. The four evaluation dimensions the handbook names, as a checklist: within cover and limits, clinically appropriate, documents complete and consistent, amounts within package rates and financial rules.

Actions: approve, approve at a reduced amount with a note per item, query, reject with a denial code. And two interim states that are not decisions: in process, and forwarded to another entity.

## What the system hosts

```
/v1/claim/submit      answer on /v1/claim/on_submit
```

Workflow 15 is the claim; 151 is an answer to your query. Under PMJAY there is no separate discharge submission; the claim asserts the discharge and carries its details. On the general network a provisional discharge submission (14) may arrive first, answered with 261, 262 or 263.

Acknowledge receipt with 25 and `response.partial`. A claim may receive several interim answers before the final one; each is `response.partial` on the same correlation ID, and only the final carries `response.complete`.

## Validate before queueing

- An approved preauthorisation exists for the case number; no claim already raised against it.
- Every item, implant and investigation on the claim was on the preauthorisation, was not rejected there, and is not claimed at a higher quantity.
- Registration, admission, surgery and discharge dates present and well-formed; a discharge stage present, from the allowed set.
- Amount within the preauthorisation's approved amount and the wallet.
- Under PMJAY, the discharge biometric token. For a LAMA or DAMA before surgery, only `LM100`, with a quantity equal to the stay. For a death, a death date. For a newborn, the parent's card and the child's documents.

## What goes in the answer

The same `ClaimResponse` as for preauthorisation with `use = claim`.

| Decision | `outcome` | `adjudication.reason` | Workflow |
| :---- | :---- | :---- | :---- |
| Approved | `complete` | `approved` | 26 |
| Approved, reduced | `partial` | `approved` | 26, with `processNote` |
| Queried | `partial` | `queried` | 27 |
| In process | `partial` | | 28 |
| Forwarded | `partial` | | 29 |
| Rejected | `complete` | `cancelled` | 291 |

A rejection closes the claim number. Nothing further arrives against it except a Task. Use the scheme's denial codes so the provider's appeal screen can show a reason. Less than 24 hours of hospitalisation, package reserved for public hospitals, incomplete documents after multiple queries, bed category misrepresented. Then outside scope of cover, fraudulent, package does not match diagnosis, hospital not empanelled for the specialty, and the rest of the `ClaimError` list.

Each final approval carries the totals accounts will pay from: submitted, eligible, benefit, tax deducted, incentive, patient-liable. Those figures reappear on the payment notice; keep them consistent.

## The arithmetic on every final approval

Accounts pays from these figures and the provider reconciles against them, so they have to agree with the payment notice that follows.

| Category | What it is |
| :---- | :---- |
| `submitted` | What the hospital asked for, per item and in total |
| `eligible` | What is within cover before deductions |
| `copay` | The patient's share. Zero under PMJAY, which is fully cashless |
| `benefit` | What you will pay. This is the number the provider shows as approved |

Then at claim level, the tax deducted, any incentive, and the patient-liable amount where the scheme has them. The payment notice's `TDS` and `Payment` lines should sum to the approved amount here; a provider that finds they do not will raise a query or a shortfall.

## Appeals

Rejections and shortfalls come back as a `Task` on `/v1/task/submit`, workflow 36, code `reprocess`, reason `claimrejected` or `partialpayment`, with a document attached and, for a shortfall, the amount. Route both to the Claim Review Committee.

Acknowledge with 37, then answer on `/v1/task/on_submit` with a `Task` whose `status` is `completed` and whose output references a `ClaimResponse` inside the same bundle. The `ClaimResponse` is read by the provider's ordinary parser, so build it with the same outcome and reason fields: 252 approved, 253 rejected, 254 queried.

Under PMJAY the payer enforces four rules. One appeal per claim. A shortfall claim only after payment 33 has been sent and acknowledged. The amount never above the difference. The Committee's decision final, with no shortfall claim allowed after it. A cancellation Task, code `cancel`, is answered with PC02 and refused once payment has begun.

## Search

Regulators, and the scheme sponsor, can search claims across payers with a `Task` of code `search` on `/v1/search/submit`. Answer on `/v1/search/on_submit` with the matching `ClaimResponse`s. A provider may only search its own cases; a regulator may search any.
