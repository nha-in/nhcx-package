# T7. IRDAI Query Answered

#### T7D. DESCRIPTION

The IRDAI test payer's adapter asks in `communication` mode ([PAYERS.md](../references/PAYERS.md)): a query arrives as a CommunicationRequest on a thread of its own ([C9. Payer Communication](../callbacks/C9-communication-request.md)) and is answered with a Communication ([A7. Communication Reply](../apis/A7-communication-on-request.md)). The pre-authorisation waits until the payer decides.

#### T7S. SETUP

A claim ready for pre-authorisation, as T4. IRDAI Insurance Plan and Authorisation Requirements (in nhcx-preauth) leaves it, and a small PDF to attach.

#### T7G. GUI

1. S9. Pre-authorisation (in nhcx-preauth): send the pre-authorisation.
2. Payer side, through the payer driver: query with the remark "Please attach the discharge summary".
3. [S10. Communication](../screens/S10-communication.md): wait for the question; read it; reply with text and the PDF.
4. Payer side: approve; wait on S9. Pre-authorisation (in nhcx-preauth).

#### T7L. CLI

1. A4. Pre-auth Submit (in nhcx-preauth); A14. Adjudicator User Role (in nhcx-preauth); A15. Adjudicator Process Case (in nhcx-preauth) `query` with the remark; wait for [C9. Payer Communication](../callbacks/C9-communication-request.md).
2. Call [A7. Communication Reply](../apis/A7-communication-on-request.md) with the reply text and the PDF.
3. A14. Adjudicator User Role (in nhcx-preauth); A15. Adjudicator Process Case (in nhcx-preauth) `approve`; wait for C5. Pre-auth Reply (in nhcx-preauth).

#### T7X. EXPECT

- The question arrives as [C9. Payer Communication](../callbacks/C9-communication-request.md) with the payer's text, matched to the claim, and shown on [S10. Communication](../screens/S10-communication.md); the Communication tab carries a dot while the question is open.
- The reply goes out (NHCX 202) on the question's thread, with the document attached; the payer desk shows the reply against the case.
- After approval the leg is `approved`; the question and the answer stay on [S10. Communication](../screens/S10-communication.md).
