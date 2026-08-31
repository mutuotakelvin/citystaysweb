# Lipa na M-Pesa Design

## Scope

Add a sandbox Safaricom Daraja STK Push payment flow to the existing villa booking experience. The app currently contains static villa data and a client-only booking card, so this feature adds server-side booking and payment records without attempting to build a complete inventory or account system.

The application will use Neon PostgreSQL through Prisma and Next.js Route Handlers deployed with the application on Vercel. Daraja credentials and callback configuration remain server-only environment variables.

## User Flow

1. The guest selects dates and guest count in the villa booking card.
2. The guest enters name, email, and Kenyan phone number.
3. The browser submits the villa slug, dates, guest count, and contact details to `POST /api/bookings`.
4. The server loads the villa from the trusted server-side data source, validates dates and guest count, and recalculates the KES total. Client-provided totals are ignored.
5. The server creates a booking with `PENDING_PAYMENT` status and a payment attempt with a unique booking reference.
6. The server requests a Daraja OAuth token and starts an STK Push using the configured shortcode, passkey, amount, phone number, and booking reference.
7. The browser receives a pending response and tells the guest to complete the prompt on their phone.
8. Daraja calls `POST /api/mpesa/callback`. The callback is matched by `CheckoutRequestID`, recorded, and applied idempotently.
9. Successful payments transition the booking to `PAID`; failed or cancelled payments transition it to `PAYMENT_FAILED`.
10. The browser polls `GET /api/bookings/[reference]` until the booking reaches a terminal state.

There is no inventory locking in this first version because availability is not persisted. A pending booking older than 30 minutes is marked `EXPIRED` when its status is read, avoiding a separate scheduler; date conflict prevention is deferred until a property availability model exists.

## Data Model

### Booking

- `id`: UUID primary key
- `reference`: unique public booking reference
- `villaSlug`: snapshot of the selected villa identifier
- `guestName`, `guestEmail`, `guestPhone`
- `checkIn`, `checkOut`
- `guests`
- `currency`: `KES`
- `amount`: integer amount in KES
- `status`: `PENDING_PAYMENT`, `PAID`, `PAYMENT_FAILED`, or `EXPIRED`
- `createdAt`, `updatedAt`

### PaymentAttempt

- `id`: UUID primary key
- `bookingId`: foreign key to `Booking`
- `provider`: `MPESA_DARAJA`
- `phone`, `amount`
- `merchantRequestId`, `checkoutRequestId`: nullable provider identifiers
- `status`: `INITIATED`, `PENDING`, `SUCCEEDED`, or `FAILED`
- `resultCode`, `resultMessage`
- `callbackPayload`: JSON for support and reconciliation
- `createdAt`, `updatedAt`

The checkout request ID will be indexed and treated as the callback idempotency key. A repeated callback must not create another payment or move a successful booking backward.

## Server Components

`app/lib/mpesa.ts` will contain Daraja-specific concerns: OAuth token acquisition, password generation, STK Push request construction, phone normalization, and response parsing. It will read configuration from environment variables and throw typed errors without exposing secrets.

`app/api/bookings/route.ts` will validate the request body, resolve the villa, calculate the same fee breakdown currently shown in `BookingCard`, create the database records, and start the STK request. Provider failures will leave the booking failed and return a safe error response.

`app/api/mpesa/callback/route.ts` will accept Daraja's callback shape, locate the attempt by checkout request ID, store the callback payload, and update the booking in a transaction. It will return Daraja's expected acknowledgement even when the event is a duplicate or cannot be matched, while logging actionable server-side errors.

`app/api/bookings/[reference]/route.ts` will expose only the public reference, status, amount, currency, and safe guest-facing message. It will not expose callback payloads, provider IDs, or secrets. When reading a pending booking, it will transition it to `EXPIRED` if it is more than 30 minutes old.

## Client Changes

`BookingCard` will add a compact guest-details form, submit the selected reservation to the booking route, disable repeated submissions, and display pending, success, and failure states. It will use the existing total breakdown for presentation, while the server remains authoritative.

The initial response after STK initiation will be explicitly pending. The UI will poll the status route with a bounded retry window and offer a retry path for failed or expired attempts. It will not claim payment success based on the STK Push initiation response.

## Configuration

The example environment file will document:

- `DATABASE_URL`
- `MPESA_ENVIRONMENT` (`sandbox` for this implementation)
- `MPESA_CONSUMER_KEY`
- `MPESA_CONSUMER_SECRET`
- `MPESA_SHORTCODE`
- `MPESA_PASSKEY`
- `MPESA_CALLBACK_URL`

The callback URL must be public HTTPS in deployed environments. Local testing requires a tunnel to the development server. Credentials will never be sent to the client or committed.

## Validation and Error Handling

- Accept Kenyan phone numbers in common local or international formats and normalize them to `2547XXXXXXXX` or `2541XXXXXXXX`.
- Require a future check-in date, a check-out date after check-in, a supported guest count, and a valid email address.
- Reject unsupported villas and malformed JSON.
- Calculate amounts as integer KES values and reject any provider callback amount that does not match the booking amount.
- Treat duplicate callbacks as no-ops after a terminal payment state.
- Return generic client errors; retain provider details only in server logs and payment records.

## Testing and Verification

Unit coverage will test phone normalization, fee calculation, Daraja password generation, and callback result mapping. Route coverage will test invalid input, successful initiation, provider failure, successful callback, failed callback, duplicate callback, and amount mismatch.

Verification will include `npm run lint` and `npm run build`. Sandbox payment testing requires Neon credentials, Daraja sandbox credentials, a reachable callback URL, and a supported test phone number.

## Out of Scope

- Production Daraja credentials or live payment processing
- Automated refunds or reversals
- Real availability locking and double-booking prevention
- User accounts and authentication
- Email or SMS confirmation delivery
- Admin booking management
