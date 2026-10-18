# C2. Coverage Eligibility Verdict

#### C2E. ENDPOINT
Delivered in-process by [G8. Receive](../gateway/G8-receive.md) for NHCX route `v1/coverageeligibility/on_check`, passed to `C1.receive` with `delivery.type` `coverage`. Answers A2 sent with purpose `validation`, `benefits` or `discovery`. The auth-requirements ruling arrives on the same route and type and is C3.

#### C2D. DESCRIPTION
The payer's verdict on an eligibility check, seconds after A2 went out. Matched by `x-hcx-correlation_id` against the case itself (D9 `correlation_id`, newest row). When no case waits on that id, the same message is tried as a ruling (C3), because two coverage exchanges run per case.

**The validation gate.** A case opened from a search or a discovery is provisional (hidden from the claim lists) until a validation answers in force. On that answer the case becomes a case, unless the cover returned several members: then the desk always chooses the patient first on [S3. Policy Discovery](../screens/S3-policy-discovery.md) (even when a member id matches), and choosing creates the case. A discovery's answer names covers and never makes a case. Once a validation leaves an open case in force with no insurance plan row, the plan is fetched without the desk asking (A3 `plan_on_case_created`), after the verdict is written and beside the callback's answer, so it never delays or fails the reply.

Only a case still `checking` takes the verdict. A case that has settled answers `ignored`, which is what makes a redelivery harmless. A case on record as a failed send (C1 `failed_send`: status `error`) is reopened and the verdict applied, so a verdict that follows a `ProtocolResponse` still lands.

#### C2Q. REQUEST
`fhir` is an F1 Bundle that repeats the request's resources (F2 CoverageEligibilityRequest, F15 Patient, F17 Organizations, F19 Location, F18 Coverage, F16 PractitionerRole) and appends the payer's F3 CoverageEligibilityResponse with its own F15 Patient, F18 Coverage and F17 Organizations. Some payers send the CoverageEligibilityResponse alone or with only Patient and Coverage.

**A family policy answers with several people.** PMJAY (and any family floater) returns one Patient and one Coverage per member on the card, three or more on a family card, each Patient carrying the member's own id [PAYER](../references/PAYERS.md#markers). The request's own Patient is told apart from the payer's by the request's `patient` reference. Every payer Patient is read, never only the first or the last: the reader builds the list of beneficiaries (F3), and the desk chooses which one is the patient on [S3. Policy Discovery](../screens/S3-policy-discovery.md) when the list holds more than one and none carries the member id the case was opened with. Taking one of them silently would attach a child's admission to the parent's record, or the reverse.

A refusal arrives as a `ProtocolResponse` (for example PAYR-1008 when the bundle's HFR ID does not match the id NHCX holds for the sender [PAYER](../references/PAYERS.md#markers)).

#### C2P. PSEUDOCODE

```
C2(envelope, corr):
    row = newest D9 where correlation_id == corr            # found by C1, else C3 runs instead
    if row.status != "checking" and not failed_send(row):
        return "ignored"
    body = payload(envelope)
    if body.type == "ProtocolResponse":
        write D9: status = "error", error_message = rejection(body)   # stage not restamped
        return "settled"
    verdict = last CoverageEligibilityResponse in body.entry      # read and validate before any write
    if none: raise Rejected("The payer reply carries no CoverageEligibilityResponse.")
    revive(D9, row, "checking")              # a rejected reply leaves the case exactly as it was
    ins = verdict.insurance[0]
    auth_required = last item.authorizationRequired that is present (1/0)
    wallet = the benefit typed "benefit", else typed "30", else a benefit on the admission
             item (305056002) or on an item naming no product          # [PAYER](../references/PAYERS.md#markers)
             # a benefit on a procedure line is that package's rate, never the cover
    if wallet:
        allowed_amount = wallet.allowed + (wallet.used or 0)   # allowed is what is left [PAYER](../references/PAYERS.md#markers)
        used_amount    = wallet.used or 0
    # no wallet row: both left as they were (a package rate is never read as the sum insured)
    people = read_beneficiaries(body)                          # F3: one per payer Coverage whose beneficiary is
                                                               # a payer Patient (the request's own Patient and
                                                               # Coverage left out); none: the Patient the
                                                               # response points at
    items  = every insurance[].item with its benefits (F3 "Itemised benefits"), the wallet row flagged
    values = {inforce, outcome, disposition, auth_required, allowed_amount, used_amount,
              plan_name, plan_period_start, plan_period_end}  # the policy, not a person
             without empty values                              # empty never overwrites
    values.beneficiaries_json = people
    if items hold a non-wallet item or the stored benefit_items_json holds none:
        values.benefit_items_json = items                      # a validation's lone wallet row never
                                                               # wipes a benefits answer's packages
    choose_first = row.provisional and len(people) > 1         # the gate: the desk always chooses
    chosen = the one person when len(people) == 1
             else none when choose_first
             else the person whose member_id is row.member_id or row.beneficiary_member_id
             else none
    if chosen:
        values += {beneficiary_member_id, beneficiary_name, patient_gender, patient_dob,
                   patient_address, abha_number, patient_photo, relationship} of chosen
    else if people:
        values.beneficiary_member_id = null                    # the desk chooses on S3; no person's
                                                               # details are shown as the patient's
    status = "error" if outcome == "error"
             else "eligible" if inforce
             else "not-eligible"
    if status == "eligible" and not choose_first and (row.purpose or "validation") == "validation":
        values.provisional = false                             # the validation gate: now a case
                                                               # (a discovery's answer never makes one)
    write D9: values, status, response_json = body
    restamp the case stage
    if row is now eligible, not provisional and its purpose is validation:
        after the write is committed, beside this answer:      # never delays or fails the callback
            A3 plan_on_case_created(row)                       # reuse a ready plan of the same policy,
                                                               # HFR ID and payer, else request it;
                                                               # nothing when a plan row exists; never raises
    return "settled"
```

Column sources, per person: `member_id` from the Patient identifier typed `MB`, else the first identifier not typed `ABHA`, `JHN`, `MO` or `ADN` (nor under a health-id or mobile system), else the Coverage's `subscriberId` (no scheme-specific type is relied on); `beneficiary_name` from `name[0].text`, else the given names, else `family`; `patient_address` joins `line`, `district`, `state`, `postalCode`; `abha_number` from the identifier typed `ABHA`; `patient_photo` from `photo[0].data` or `url`; `relationship` from the person's own `Coverage.relationship` display, else code; per person also `policy_code` (the Coverage's `class[0].value`, else its first identifier, else `subscriberId`) and `plan_name` (`class[0].name`). Policy-wide: `plan_name` from the last Coverage's `class[0].name`; `plan_period_*` from its `period`.

#### C2S. RESPONSE
`settled`, `ignored` for a case no longer `checking`, or `rejected` when the bundle carries no CoverageEligibilityResponse (the case is left exactly as it was: the verdict is read and validated before the failed-send revive, so a rejected reply never reopens a case; C1 may also run the handler in a savepoint, which rolls a revive back on `rejected` anyway).

State changes, D9 claim:

| Reply | `status` | Other columns |
|---|---|---|
| verdict, `outcome` `error` | `error` | the verdict columns above, `response_json` |
| verdict, `inforce` true | `eligible` | as above; `stage` / `sub_stage` restamped; `beneficiaries_json` holds every person returned; the person columns are filled only when one person is chosen, else `beneficiary_member_id` is null and S3 asks; a validation on a provisional case with no choice left turns it into a case (`provisional` false) and its insurance plan is fetched without asking (A3) |
| verdict, otherwise | `not-eligible` | as above |
| `ProtocolResponse` | `error` | `error_message` = `<code>: <message>` |

#### C2U. USED BY
- Screens: [S2. Select Policy](../screens/S2-select-policy.md), [S3. Policy Discovery](../screens/S3-policy-discovery.md), [S17. Beneficiary Discovery](../screens/S17-beneficiary-discovery.md)
- APIs: [A2. Coverage Eligibility Check](../apis/A2-coverage-eligibility-check.md), [A3. Insurance Plan Request](../apis/A3-insurance-plan-request.md), [A10. Transaction Related](../apis/A10-txn-related.md), [A11. Transaction Dispatch](../apis/A11-txn-dispatch.md), [A12. Transaction FHIR](../apis/A12-txn-fhir.md), [A17. Claim State](../apis/A17-claim-state.md)
- Callbacks: [C1. Callback Door](C1-callback-door.md), [C3. Authorisation Requirements Ruling](C3-auth-requirements-on-check.md)
- FHIR: [F3. CoverageEligibilityResponse](../fhir/F3-coverage-eligibility-response.md), [F15. Patient](../fhir/F15-patient.md)
- Database: [D9. claim](../database/D9-claim.md)
- Gateway: [G7. Send](../gateway/G7-send.md)
- Tests: [T3. IRDAI Policy Search and Eligibility](../tests/T3-irdai-policy-and-eligibility.md), [T4. IRDAI Insurance Plan and Authorisation Requirements](../tests/T4-irdai-plan-and-auth-requirements.md), [T13. PMJAY Eligibility, Package Master and Ruling](../tests/T13-pmjay-eligibility-and-package-master.md)
