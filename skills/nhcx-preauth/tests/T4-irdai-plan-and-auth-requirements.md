# T4. IRDAI Insurance Plan and Authorisation Requirements

#### T4D. DESCRIPTION

Before a pre-authorisation the provider needs the payer's package master ([A3. Insurance Plan Request](../apis/A3-insurance-plan-request.md), answered by [C4. Insurance Plan Reply](../callbacks/C4-insuranceplan-on-request.md)) and may ask what the chosen packages require ([A2. Coverage Eligibility Check](../apis/A2-coverage-eligibility-check.md) with purpose `auth-requirements`, answered by [C3. Authorisation Requirements Ruling](../callbacks/C3-auth-requirements-on-check.md)). The plan is fetched without the desk asking once the validation leaves the case in force (`plan.trigger` automatic, the default). The IRDAI test payer is on the `generic` adapter ([PAYERS.md](../references/PAYERS.md)), which does not send the ruling unasked, so the desk asks for it on the Pre-authorisation tab.

#### T4S. SETUP

A claim with the IRDAI test payer's policy chosen, as T3. IRDAI Policy Search and Eligibility (in nhcx-coverage) leaves it.

#### T4G. GUI

1. [S6. Claim Detail](../screens/S6-claim-detail.md) Overview: wait until the Validation card reads "Insurance plan: fetched <time>" ([S7. Insurance Plan](../screens/S7-insurance-plan.md)) without pressing anything; press "Fetch insurance plan" only when `plan.trigger` was answered manual.
2. Pre-authorisation tab, [S8. Line Items](../screens/S8-line-items.md) Line items card: type 2 or more letters of a package code or name in the Code type-ahead, leaving Category and Type at "All"; pick the match; set the quantity.
3. [S8.2](../screens/S8-line-items.md), the Authorisation requirements card beside the Coverage benefits check: ask; wait for the ruling.

#### T4L. CLI

1. Do not call [A3. Insurance Plan Request](../apis/A3-insurance-plan-request.md): the plan was requested when C2. Coverage Eligibility Verdict (in nhcx-coverage) left the case in force (call it only when `plan.trigger` is manual); wait for [C4. Insurance Plan Reply](../callbacks/C4-insuranceplan-on-request.md).
2. Add a line item for one of the returned packages through the service [S8. Line Items](../screens/S8-line-items.md) uses.
3. Call [A2. Coverage Eligibility Check](../apis/A2-coverage-eligibility-check.md) with purpose `auth-requirements` for the claim's lines; wait for [C3. Authorisation Requirements Ruling](../callbacks/C3-auth-requirements-on-check.md).

#### T4X. EXPECT

- The plan request went out without a desk action, under workflow id `1` (never the case number), and the plan arrives `ready`, names the policy, and lists at least one package with its code and rate.
- Every line is quoted from the plan, on the Pre-authorisation tab: the Code type-ahead offers only the plan's packages and implants, the Category select lists only the categories that hold a quotable package (with their counts), and the only price the desk types is a rate the plan leaves open. A bare cover benefit of the plan (for example Blood or Ambulance, a SNOMED-coded limit with no package id of its own) is never offered as a line.
- The Coverage benefits check and the Authorisation requirements cards appear side by side only once a line is quoted.
- The ruling arrives on the auth-requirements correlation id (not the eligibility one, CORE confusions) and lists the documents and forms each chosen package needs.
- [S8.2](../screens/S8-line-items.md) shows the ruling against each line, and the claim is ready for pre-authorisation.
