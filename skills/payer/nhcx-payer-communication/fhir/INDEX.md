# FHIR

The FHIR resources this payer reads from a hospital's bundles and builds for its answers. APIs (A) and callbacks (C) refer to these by F number. Each file has RESOURCE (R), DESCRIPTION (D), FIELDS (F) and USED BY (U) sections. Direction is from this payer's side: `received` is read out of a hospital's bundle, `sent` is built by this payer, `both` is read and built.

Received resources are parsed as plain maps and never fail on a shape they merely do not know: a reference that resolves to nothing leaves its field blank, a resource with nothing usable is dropped, and the whole bundle is kept on the exchange log so it can be read again later. Sent resources follow the scheme's wire shape [PAYER](../references/PAYERS.md#markers): a collection bundle identified by the hospital's claim number, every resource tagged `SUBSETTED`, resolvable `https` fullUrls under this payer's base, and the Patient, both Organizations and the Coverage beside the focal resource.

## Envelope

| # | Resource | Direction | File |
|---|---|---|---|
| [F1](F1-bundle.md) | Bundle | both | [F1-bundle.md](F1-bundle.md) |

## Pre-authorisation and claim

| # | Resource | Direction | File |
|---|---|---|---|
| [F9](F9-claimresponse.md) | ClaimResponse | sent | [F9-claimresponse.md](F9-claimresponse.md) |

## Queries and payment

| # | Resource | Direction | File |
|---|---|---|---|
| [F11](F11-communicationrequest.md) | CommunicationRequest | sent | [F11-communicationrequest.md](F11-communicationrequest.md) |
| [F12](F12-communication.md) | Communication | received | [F12-communication.md](F12-communication.md) |

## Parties and supporting resources

| # | Resource | Direction | File |
|---|---|---|---|
| [F15](F15-patient.md) | Patient | both | [F15-patient.md](F15-patient.md) |
| [F16](F16-practitioner.md) | Practitioner | received | [F16-practitioner.md](F16-practitioner.md) |
| [F17](F17-organization.md) | Organization | both | [F17-organization.md](F17-organization.md) |
| [F18](F18-coverage.md) | Coverage | both | [F18-coverage.md](F18-coverage.md) |
