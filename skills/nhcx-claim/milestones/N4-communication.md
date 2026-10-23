# N4. Communication

#### GOAL
Answer the payer's queries, notifications and notes on a pre-authorisation or claim: receive a standalone communication request, reply with text and documents, and acknowledge notifications. A line-item query and every query of a `resubmit` payer are answered by resubmitting from the pre-authorisation or claim tab (N3, N5); N4 is the standalone communication of a `communication` payer.

#### DEPENDS ON
N0 (gateway, case shell) and N3 (the pre-authorisation the communication is about).

#### DELIVERS
- S10. Communication (in nhcx-communication) (the Communication tab).
- A7. Communication Reply (in nhcx-communication) (communication reply).
- C9. Payer Communication (in nhcx-communication) (the inbound communication request).
- F11. CommunicationRequest (in nhcx-communication) and F12. Communication (in nhcx-communication) (the communication read and the reply built, with documents inline).

#### REUSES
From N0: [F1. Bundle](../fhir/F1-bundle.md), [F15. Patient](../fhir/F15-patient.md) to [F18. Coverage](../fhir/F18-coverage.md), [S6. Claim Detail](../screens/S6-claim-detail.md), the gateway and [C1. Callback Door](../callbacks/C1-callback-door.md). From N3: the pre-authorisation thread a communication is matched to.

#### STEPS
Run the ordinary steps scoped to the ids above, writing `nhcx-plan/N4/`: discovery, mapping, plan (the Payer-communication phase), code plan, code, validation, dry-run, end-to-end.

#### DONE WHEN
On the sandbox: a payer communication request is received on S10. Communication (in nhcx-communication) through C9. Payer Communication (in nhcx-communication), and the desk answers it with A7. Communication Reply (in nhcx-communication) carrying text and a document; a notification is acknowledged. Proven through the screens and from the command line. N4 and N5 both sit on N3 and may be built in either order.
