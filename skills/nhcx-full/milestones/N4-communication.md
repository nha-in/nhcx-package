# N4. Communication

#### GOAL
Answer the payer's queries, notifications and notes on a pre-authorisation or claim: receive a standalone communication request, reply with text and documents, and acknowledge notifications. A line-item query and every query of a `resubmit` payer are answered by resubmitting from the pre-authorisation or claim tab (N3, N5); N4 is the standalone communication of a `communication` payer.

#### DEPENDS ON
N0 (gateway, case shell) and N3 (the pre-authorisation the communication is about).

#### DELIVERS
- [S10. Communication](../screens/S10-communication.md) (the Communication tab).
- [A7. Communication Reply](../apis/A7-communication-on-request.md) (communication reply).
- [C9. Payer Communication](../callbacks/C9-communication-request.md) (the inbound communication request).
- [F11. CommunicationRequest](../fhir/F11-communicationrequest.md) and [F12. Communication](../fhir/F12-communication.md) (the communication read and the reply built, with documents inline).

#### REUSES
From N0: [F1. Bundle](../fhir/F1-bundle.md), [F15. Patient](../fhir/F15-patient.md) to [F18. Coverage](../fhir/F18-coverage.md), [S6. Claim Detail](../screens/S6-claim-detail.md), the gateway and [C1. Callback Door](../callbacks/C1-callback-door.md). From N3: the pre-authorisation thread a communication is matched to.

#### STEPS
Run the ordinary steps scoped to the ids above, writing `nhcx-plan/N4/`: discovery, mapping, plan (the Payer-communication phase), code plan, code, validation and dry-run. A milestone stops at dry-run; the live sandbox exchange (L8) runs once at the end across the whole lifecycle.

#### DONE WHEN
In dry-run (gateway mocked, callbacks stubbed): a payer communication request replayed through a stubbed [C9. Payer Communication](../callbacks/C9-communication-request.md) is received on [S10. Communication](../screens/S10-communication.md), and the desk answers it with [A7. Communication Reply](../apis/A7-communication-on-request.md) carrying text and a document; a notification is acknowledged. The live sandbox proof is deferred to the final end-to-end step. N4 and N5 both sit on N3 and may be built in either order.
