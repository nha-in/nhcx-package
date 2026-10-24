# N2. Coverage and Insurance

#### GOAL
Check that the policy is in force and fetch the payer's insurance plan: the coverage eligibility check with its validation and benefits, the result on the case overview, the package master fetched from the payer, and the line items quoted from it. After N2 the case knows the cover and the priced procedures a pre-authorisation will draw on.

#### DEPENDS ON
N0 (gateway, case shell, parties) and N1 (the policy the case was opened with, the ABHA patient key).

#### DELIVERS
- Eligibility: [S3. Policy Discovery](../screens/S3-policy-discovery.md) (the overview with the coverage result and the itemised benefits), [A2. Coverage Eligibility Check](../apis/A2-coverage-eligibility-check.md) (coverage eligibility check, validation and benefits), [C2. Coverage Eligibility Verdict](../callbacks/C2-coverage-eligibility-on-check.md) (on_check), [F2. CoverageEligibilityRequest](../fhir/F2-coverage-eligibility-request.md) (CoverageEligibilityRequest), [F3. CoverageEligibilityResponse](../fhir/F3-coverage-eligibility-response.md) (CoverageEligibilityResponse read whole), [D31. biometric_auth](../database/D31-biometric-auth.md).
- Insurance plan: [S7. Insurance Plan](../screens/S7-insurance-plan.md) (the payer's plan, fetched automatically once the case is created when `plan.trigger` is automatic), [S8. Line Items](../screens/S8-line-items.md) (line items quoted from the plan, with the benefits and authorisation-requirement cards), [A3. Insurance Plan Request](../apis/A3-insurance-plan-request.md) (insurance plan request), [C3. Authorisation Requirements Ruling](../callbacks/C3-auth-requirements-on-check.md) and [C4. Insurance Plan Reply](../callbacks/C4-insuranceplan-on-request.md) (plan callbacks), [F4. Task (InsurancePlan discovery)](../fhir/F4-task-insuranceplan.md) to [F6. Questionnaire](../fhir/F6-questionnaire.md) (the plan request, the plan read, and what feeds the line items).

#### REUSES
From N0: [F1. Bundle](../fhir/F1-bundle.md), [F15. Patient](../fhir/F15-patient.md) to [F18. Coverage](../fhir/F18-coverage.md) (the request bundle's parties), [S6. Claim Detail](../screens/S6-claim-detail.md), the gateway and [C1. Callback Door](../callbacks/C1-callback-door.md). From N1: the policy and beneficiary on the case.

#### STEPS
Run the ordinary steps scoped to the ids above, writing `nhcx-plan/N2/`: discovery, mapping, plan (the Policy-and-eligibility and Plan-and-line-items phases), code plan, code, validation and dry-run. A milestone stops at dry-run; the live sandbox exchange (L8) runs once at the end across the whole lifecycle.

#### DONE WHEN
In dry-run (gateway mocked, callbacks stubbed): a coverage eligibility check from the case settles `eligible` (or a clear verdict) on [S3. Policy Discovery](../screens/S3-policy-discovery.md) with the benefits shown from a stubbed [C2. Coverage Eligibility Verdict](../callbacks/C2-coverage-eligibility-on-check.md), and an insurance plan fetch settles `ready` through a stubbed [C4. Insurance Plan Reply](../callbacks/C4-insuranceplan-on-request.md) so [S7. Insurance Plan](../screens/S7-insurance-plan.md) shows the plan and a line can be quoted from it on [S8. Line Items](../screens/S8-line-items.md). The live sandbox proof is deferred to the final end-to-end step.
