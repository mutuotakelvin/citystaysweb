# Lipa na M-Pesa Integration

This document explains how City Stays uses Safaricom Daraja M-Pesa Express (STK Push) with Neon PostgreSQL.

## 1. Architecture

The payment flow uses:

- Next.js Route Handlers for server-side booking and payment requests.
- Safaricom Daraja sandbox for M-Pesa Express/STK Push.
- Neon PostgreSQL for bookings and payment attempts.
- Prisma for database access and transactions.
- OutRay, ngrok, Cloudflare Tunnel, or a deployed HTTPS host for callbacks.

The browser never calls Daraja directly and never decides whether a payment succeeded.

## 2. Prerequisites

Create the following accounts and credentials:

1. A Neon project and PostgreSQL database.
2. A Safaricom Daraja account.
3. A Daraja sandbox app with:
   - Consumer key
   - Consumer secret
   - Sandbox shortcode
   - Sandbox passkey
4. A public HTTPS tunnel for local callback testing.

The Daraja simulator can be used to verify sandbox credentials and test data.

## 3. Install Dependencies

From the project root:

```bash
npm install
```

The payment implementation uses Prisma, Zod, the Neon serverless driver, and the Prisma Neon adapter.

## 4. Connect Neon

The repository is linked to Neon through `.neon`. Pull the current branch environment variables:

```bash
neon env pull
```

This writes Neon variables to `.env.local`. The file is ignored by Git and must never be committed.

Verify the database connection without printing credentials:

```bash
node --env-file=.env.local -e "const { neon } = require('@neondatabase/serverless'); neon(process.env.DATABASE_URL)\`SELECT 1 AS ok\`.then(console.log).catch((error) => { console.error(error); process.exit(1); });"
```

Expected output:

```text
[ { ok: 1 } ]
```

## 5. Configure Environment Variables

Copy the safe variable names from `.env.example` into `.env.local` if needed:

```dotenv
DATABASE_URL=
DATABASE_URL_UNPOOLED=
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_CALLBACK_URL=
```

Use the pooled Neon URL for runtime queries and the unpooled URL for Prisma migrations. `neon env pull` supplies the first two values automatically.

Never commit `.env.local`, consumer secrets, passkeys, database passwords, or access tokens.

## 6. Run Database Migrations

Prisma must load `.env.local` explicitly in this project:

```bash
node --env-file=.env.local -e "const { spawnSync } = require('node:child_process'); const result = spawnSync('npx', ['prisma', 'migrate', 'deploy'], { stdio: 'inherit', env: process.env }); process.exit(result.status ?? 1);"
```

Check migration status:

```bash
node --env-file=.env.local -e "const { spawnSync } = require('node:child_process'); const result = spawnSync('npx', ['prisma', 'migrate', 'status'], { stdio: 'inherit', env: process.env }); process.exit(result.status ?? 1);"
```

The schema creates:

- `Booking`: guest details, dates, amount, public reference, idempotency key, and status.
- `PaymentAttempt`: Daraja request IDs, payment status, result details, and callback payload.

## 7. Start a Public Callback Tunnel

Daraja cannot call `localhost`. Start the app first:

```bash
npm run dev
```

Expose port `3000` with OutRay:

```bash
outray 3000
```

For another tunnel provider, use its equivalent command. Copy the HTTPS URL it gives you and set:

```dotenv
MPESA_CALLBACK_URL=https://your-tunnel.example/api/mpesa/callback
```

Restart Next.js after changing `.env.local`. Keep the tunnel process running throughout the test.

The callback route is:

```text
POST /api/mpesa/callback
```

A browser `GET` to this route returns `405`; that is expected. Daraja must call it with `POST`.

## 8. Start the Application

For local development:

```bash
npm run dev
```

For tunnel testing, a production server avoids development HMR behavior through the tunnel:

```bash
npm run build
npm start
```

If the tunnel hostname changes, update `MPESA_CALLBACK_URL` and restart the server.

## 9. Make a Test Booking

1. Open a villa page, for example `/villas/galu-beachfront-villa`.
2. Select a future check-in and check-out date.
3. Enter the guest name, email, and Kenyan phone number.
4. Click **Reserve**.
5. The server calculates the amount from trusted villa data and creates a pending booking.
6. Daraja sends an STK prompt to the phone number.
7. Enter the M-Pesa PIN in the sandbox prompt.
8. Wait for the Daraja callback.
9. The UI polls the booking status and changes to **Reservation confirmed** after a successful callback.

For the current sandbox test configuration, the Galu Beachfront Villa price is `KES 1` per night and cleaning/service fees are `KES 0`. Revert these values before production use.

## 10. Test Failure Paths

Test each of these separately:

- Cancel the STK prompt. The booking should become `PAYMENT_FAILED`.
- Use an invalid booking form value. The API should reject it before Daraja.
- Submit the same idempotency key twice. The server should not create a second STK request.
- Send a duplicate callback. It should not downgrade a paid booking.
- Send a callback with a mismatched amount. The booking must not become paid.
- Allow a pending payment to expire. It should become `EXPIRED` when its status is read.

## 11. API Routes

### Create Booking

```text
POST /api/bookings
```

Required header:

```text
Idempotency-Key: a-unique-request-id
```

Request body:

```json
{
  "villaSlug": "galu-beachfront-villa",
  "checkIn": "2026-08-30",
  "checkOut": "2026-08-31",
  "guests": 1,
  "guestName": "Guest Name",
  "guestEmail": "guest@example.com",
  "guestPhone": "254712345678"
}
```

Successful initiation returns HTTP `202` with a pending booking reference. HTTP `202` means the STK request was accepted for processing, not that money was received.

### Poll Booking Status

```text
GET /api/bookings/{reference}
```

The safe response exposes the reference, status, amount, currency, and guest-facing message. Provider IDs and callback payloads are never returned.

### Daraja Callback

```text
POST /api/mpesa/callback
```

Successful callback result code `0` marks the payment and booking as paid only when the callback amount matches the booking amount. Failure result codes mark the payment and booking as failed unless the booking is already paid.

## 12. Troubleshooting

### No STK prompt

Check the server terminal for `M-Pesa initiation failed`. Confirm:

- Daraja credentials belong to the sandbox app.
- The shortcode and passkey match the sandbox app.
- The phone is a valid Kenyan M-Pesa number.
- `MPESA_ENVIRONMENT=sandbox`.
- The request reached `POST /api/bookings` with HTTP `202`.

### `400` from `/api/bookings`

The request failed validation before Daraja. Check the response body and confirm:

- `Idempotency-Key` is present.
- Check-in is in the future.
- Check-out is after check-in.
- Email is valid.
- Phone uses a Kenyan format such as `0712345678` or `254712345678`.
- Guest count does not exceed the villa capacity.

### Callback is not received

Confirm:

- The tunnel is still running.
- `MPESA_CALLBACK_URL` uses the current tunnel hostname.
- The callback URL ends with `/api/mpesa/callback`.
- The URL is HTTPS and publicly reachable.
- The app was restarted after changing `.env.local`.

### Neon authentication failure

Rotate the Neon role password if it was exposed. Then run:

```bash
neon env pull
```

Restart the app after refreshing `.env.local`.

### Prisma transaction error

Do not replace `PrismaNeon` with `PrismaNeonHTTP`. HTTP mode does not support the transactions required by booking creation and callback reconciliation.

## 13. Verification Commands

Run before sharing a test build:

```bash
npm run test
npm run lint
npx tsc --noEmit
npm run build
```

The Daraja sandbox smoke test still requires real sandbox credentials, a supported test phone, and a running public HTTPS callback tunnel.

## 14. Production Checklist

Before going live:

- Restore real villa prices and production fee settings.
- Use production Daraja credentials only through deployment secret storage.
- Use a permanent HTTPS callback domain instead of a temporary tunnel.
- Complete Safaricom Daraja Go Live requirements for the Paybill/Till.
- Verify callback monitoring and reconciliation procedures.
- Test cancellation, duplicate callbacks, amount mismatches, and provider outages.
- Never log consumer secrets, passkeys, database URLs, access tokens, or full guest payment data.
