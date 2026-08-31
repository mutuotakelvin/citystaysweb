# Lipa na M-Pesa Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a sandbox Safaricom Daraja STK Push checkout flow backed by Neon PostgreSQL for villa reservations.

**Architecture:** Next.js Route Handlers will own booking creation, server-side amount calculation, Daraja requests, and callback reconciliation. Prisma will persist bookings and payment attempts in Neon; the client will only initiate checkout and poll a safe public status endpoint.

**Tech Stack:** Next.js 16.2.9 App Router, React 19, TypeScript, Neon PostgreSQL, Prisma, `@neondatabase/serverless`, Zod, Vitest, Safaricom Daraja sandbox.

**Spec:** `docs/superpowers/specs/2026-08-21-lipa-na-mpesa-design.md`

## Global Constraints

- Use Daraja sandbox only; never expose credentials to the browser.
- Use Neon project `lobeliapearl` and the database variables pulled into `.env.local`.
- Accept Kenyan phone numbers and normalize them to `2547XXXXXXXX` or `2541XXXXXXXX`.
- Calculate amounts as integer KES values on the server and ignore client-provided totals.
- Treat `CheckoutRequestID` as the callback idempotency key.
- A pending booking older than 30 minutes becomes `EXPIRED` when its status is read.
- Do not add authentication, production credentials, refunds, email delivery, or inventory locking.
- Read the relevant Next.js guidance in `node_modules/next/dist/docs/` before adding Route Handlers.
- Do not commit secrets, `.env.local`, or generated build output.

## File Map

- Create: `prisma/schema.prisma` for booking and payment persistence.
- Create: `prisma/migrations/<timestamp>_init_booking_payments/migration.sql` through Prisma migration tooling.
- Create: `app/lib/prisma.ts` for the singleton Prisma client.
- Create: `app/lib/booking.ts` for trusted villa resolution, fee calculation, validation, and booking status rules.
- Create: `app/lib/mpesa.ts` for Daraja OAuth, STK Push, phone normalization, and callback parsing.
- Create: `app/api/bookings/route.ts` for booking creation and STK initiation.
- Create: `app/api/bookings/[reference]/route.ts` for safe status polling and expiration.
- Create: `app/api/mpesa/callback/route.ts` for idempotent Daraja callbacks.
- Modify: `app/components/villa/BookingCard.tsx` to collect guest details and show payment states.
- Modify: `package.json` and `package-lock.json` for Prisma, validation, and test tooling.
- Modify: `.env.example` to document required variables without values.
- Modify: `README.md` with local sandbox callback and migration instructions.
- Create: `app/lib/booking.test.ts` for deterministic booking and fee rules.
- Create: `app/lib/mpesa.test.ts` for Daraja helpers and callback mapping.
- Create: `app/api/bookings/route.test.ts` for request validation and initiation behavior.
- Create: `app/api/mpesa/callback/route.test.ts` for callback success, failure, duplicates, and amount mismatch.

### Task 1: Add Prisma and Test Foundations

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `prisma/schema.prisma`
- Create: `app/lib/prisma.ts`
- Create: `vitest.config.ts`

**Interfaces:**
- Produces Prisma models `Booking` and `PaymentAttempt` and a reusable `prisma` client for later route tasks.
- Produces a `test` script that runs Vitest in non-watch mode.

- [ ] **Step 1: Read the Next.js Route Handler and runtime guidance**

Run:

```bash
ls node_modules/next/dist/docs
```

Read the matching App Router and Route Handler documentation before choosing route runtime exports. Keep database and Daraja routes on the Node.js runtime unless the current Next.js guide requires another configuration.

- [ ] **Step 2: Install dependencies**

Run:

```bash
npm install @prisma/client @prisma/adapter-neon zod
npm install -D prisma vitest @vitest/coverage-v8
```

Add this script to `package.json`:

```json
"test": "vitest run"
```

- [ ] **Step 3: Define the Prisma schema**

Use PostgreSQL with the pooled runtime URL and unpooled migration URL, followed by these enums and fields:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DATABASE_URL_UNPOOLED")
}

enum BookingStatus {
  PENDING_PAYMENT
  PAID
  PAYMENT_FAILED
  EXPIRED
}

enum PaymentProvider {
  MPESA_DARAJA
}

enum PaymentStatus {
  INITIATED
  PENDING
  SUCCEEDED
  FAILED
}

model Booking {
  id            String        @id @default(uuid())
  reference     String        @unique
  villaSlug     String
  guestName     String
  guestEmail    String
  guestPhone    String
  checkIn       DateTime
  checkOut      DateTime
  guests        Int
  currency      String        @default("KES")
  amount        Int
  status        BookingStatus @default(PENDING_PAYMENT)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  payments      PaymentAttempt[]
}

model PaymentAttempt {
  id                String          @id @default(uuid())
  bookingId         String
  provider          PaymentProvider
  phone             String
  amount            Int
  merchantRequestId String?
  checkoutRequestId String?         @unique
  status            PaymentStatus   @default(INITIATED)
  resultCode        Int?
  resultMessage     String?
  callbackPayload   Json?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  booking           Booking         @relation(fields: [bookingId], references: [id], onDelete: Cascade)

  @@index([bookingId])
}
```

- [ ] **Step 4: Create the Prisma singleton**

Configure `PrismaNeonHTTP` with `DATABASE_URL` for serverless queries. Throw a clear startup error when `DATABASE_URL` is missing. Reuse one client in development through `globalThis` to prevent hot-reload connection multiplication.

- [ ] **Step 5: Add Vitest configuration**

Configure TypeScript test discovery for `app/**/*.test.ts`, use the Node environment, and exclude `.next` and `node_modules`.

- [ ] **Step 6: Create and apply the initial migration**

Run:

```bash
npx prisma migrate dev --name init_booking_payments
npx prisma generate
```

Expected: the two tables and three enums are created in the Neon development branch and Prisma Client is generated.

- [ ] **Step 7: Verify the foundation**

Run:

```bash
npm run test -- --passWithNoTests
npm run lint
```

Expected: both commands exit successfully.

### Task 2: Implement and Test Booking Domain Rules

**Files:**
- Create: `app/lib/booking.ts`
- Create: `app/lib/booking.test.ts`

**Interfaces:**
- `BOOKING_EXPIRY_MS: number` equals `30 * 60 * 1000`.
- `normalizeBookingInput(input: unknown): BookingInput` validates name, email, ISO dates, guests, villa slug, and phone.
- `normalizeKenyanPhone(input: string): string` returns `2547XXXXXXXX` or `2541XXXXXXXX`.
- `calculateBookingTotal(villa: Villa, nights: number, guests: number): BookingTotal` returns integer `subtotal`, `guestFee`, `cleaningFee`, `serviceFee`, and `total` in KES.
- `getVillaForBooking(slug: string): Villa` returns trusted static data or throws a not-found error.
- `isBookingExpired(createdAt: Date, now?: Date): boolean` implements the 30-minute rule.

- [ ] **Step 1: Write failing tests for phone normalization**

Cover `0712345678`, `+254712345678`, `254712345678`, whitespace, invalid country codes, and invalid length. Assert that valid results are exactly 12 digits beginning with `2547` or `2541`.

- [ ] **Step 2: Run the focused test**

Run:

```bash
npx vitest run app/lib/booking.test.ts
```

Expected: FAIL because the domain helpers do not exist.

- [ ] **Step 3: Implement input parsing and phone normalization**

Use Zod for structural validation, normalize phone formatting before validation, require `checkOut > checkIn`, require dates not earlier than the current day, and enforce `1 <= guests <= villa.guests` after villa resolution.

- [ ] **Step 4: Write failing tests for fee calculation and expiration**

Use a fixture villa and assert the same formulas currently shown by `BookingCard`: nightly price times nights, extra guest fee after two guests, fixed cleaning fee, rounded service rate, and integer total. Assert bookings expire at 30 minutes and not before.

- [ ] **Step 5: Implement trusted villa lookup and fee calculation**

Reuse `Villa`, `CLEANING_FEE`, `SERVICE_RATE`, `EXTRA_GUEST_FEE`, and the existing data source. Do not accept price or fee fields from the request.

- [ ] **Step 6: Run the focused tests**

Run:

```bash
npx vitest run app/lib/booking.test.ts
```

Expected: all booking domain tests pass.

### Task 3: Implement and Test the Daraja Client

**Files:**
- Create: `app/lib/mpesa.ts`
- Create: `app/lib/mpesa.test.ts`
- Modify: `.env.example`

**Interfaces:**
- `normalizeKenyanPhone(input: string): string` is re-exported from the booking/domain module or imported from it; there must be one implementation.
- `getMpesaAccessToken(fetcher?: typeof fetch): Promise<string>`.
- `initiateStkPush(input: StkPushInput, fetcher?: typeof fetch): Promise<StkPushResponse>`.
- `parseDarajaCallback(payload: unknown): ParsedCallback`.
- `mapDarajaResult(resultCode: number): "SUCCEEDED" | "FAILED"`.

- [ ] **Step 1: Write failing tests for Daraja password and URL selection**

Assert that the STK password is Base64 of `shortcode + passkey + timestamp`, sandbox uses `https://sandbox.safaricom.co.ke`, and production is rejected unless explicitly configured. Tests must inject a fake clock and fetcher rather than call Safaricom.

- [ ] **Step 2: Write failing tests for request construction**

Assert OAuth sends Basic auth to `/oauth/v1/generate?grant_type=client_credentials`, STK sends JSON to `/mpesa/stkpush/v1/processrequest`, amount is an integer, `PhoneNumber` is normalized, and the callback URL comes from `MPESA_CALLBACK_URL`.

- [ ] **Step 3: Implement configuration and Daraja requests**

Read `MPESA_ENVIRONMENT`, `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`, and `MPESA_CALLBACK_URL` only inside server-side code. Set `TransactionType` to `CustomerPayBillOnline`, use the configured shortcode as both `BusinessShortCode` and `PartyA`, and use the booking reference as `AccountReference`.

- [ ] **Step 4: Write failing tests for callback parsing**

Cover successful callbacks with `MpesaReceiptNumber` and `Amount`, cancelled callbacks with result code `1032`, generic failures, malformed callback payloads, and missing checkout request IDs.

- [ ] **Step 5: Implement callback parsing and result mapping**

Return typed parsed values with `checkoutRequestId`, result code/message, receipt number, and callback amount when present. Preserve unknown fields in the raw payload at the route layer.

- [ ] **Step 6: Run focused Daraja tests**

Run:

```bash
npx vitest run app/lib/mpesa.test.ts
```

Expected: all helper and request-construction tests pass without network calls.

### Task 4: Add Booking Creation and Status APIs

**Files:**
- Create: `app/api/bookings/route.ts`
- Create: `app/api/bookings/[reference]/route.ts`
- Create: `app/api/bookings/route.test.ts`

**Interfaces:**
- `POST /api/bookings` accepts `{ villaSlug, checkIn, checkOut, guests, guestName, guestEmail, guestPhone }` and returns `{ reference, status, amount, currency, message }`.
- `GET /api/bookings/[reference]` returns `{ reference, status, amount, currency, message }` only.

- [ ] **Step 1: Write failing route tests for invalid input**

Mock the Prisma client, trusted villa lookup, and STK function. Assert malformed JSON, unknown villa, invalid date range, invalid phone, invalid email, and excessive guests return `400` or `404` without creating a booking.

- [ ] **Step 2: Write failing route tests for successful initiation and provider failure**

Assert a valid request creates one pending booking and one initiated payment, calls Daraja with the server-calculated amount, stores returned request IDs, and returns `202`. Assert provider errors mark the booking/payment failed and return a safe `502` response.

- [ ] **Step 3: Implement `POST /api/bookings`**

Parse the body with the booking domain module, calculate the total from trusted villa data, generate a cryptographically random public reference, create the booking and payment attempt, initiate STK Push, update the attempt to `PENDING`, and return `202`. Keep the route on the Node.js runtime.

- [ ] **Step 4: Write failing status route tests**

Assert a missing reference returns `404`, a pending booking returns safe status data, a paid booking returns success data, and a pending booking older than 30 minutes is updated to `EXPIRED` and returned as expired.

- [ ] **Step 5: Implement `GET /api/bookings/[reference]`**

Look up by public reference, transition stale pending records to `EXPIRED` in a conditional update, and return only guest-facing fields. Never return phone, email, callback payload, request IDs, or provider messages.

- [ ] **Step 6: Run booking route tests**

Run:

```bash
npx vitest run app/api/bookings/route.test.ts
```

Expected: all validation, initiation, failure, and status tests pass.

### Task 5: Add Idempotent Daraja Callback Reconciliation

**Files:**
- Create: `app/api/mpesa/callback/route.ts`
- Create: `app/api/mpesa/callback/route.test.ts`

**Interfaces:**
- `POST /api/mpesa/callback` accepts Daraja `stkCallback` JSON and returns `{ ResultCode: 0, ResultDesc: "Accepted" }` for recognized, duplicate, and safely ignored callbacks.

- [ ] **Step 1: Write failing callback route tests**

Mock Prisma transactions and assert successful result code updates the payment to `SUCCEEDED` and booking to `PAID`; failure result codes update payment to `FAILED` and booking to `PAYMENT_FAILED`; duplicate callbacks do not downgrade a paid booking; and callback amount mismatch fails the payment without marking the booking paid.

- [ ] **Step 2: Implement callback parsing and lookup**

Parse the request JSON, extract `CheckoutRequestID`, find the payment attempt, and store the raw callback payload. Unknown IDs should be acknowledged without leaking whether a record exists.

- [ ] **Step 3: Implement transactional state transitions**

Use a Prisma transaction. If the booking is already `PAID` or the payment is already terminal, preserve the terminal state. On a success result, require a matching amount before setting `PaymentAttempt.SUCCEEDED` and `Booking.PAID`. On any failure result, set `PaymentAttempt.FAILED` and `Booking.PAYMENT_FAILED` unless the booking is already paid.

- [ ] **Step 4: Run callback tests**

Run:

```bash
npx vitest run app/api/mpesa/callback/route.test.ts
```

Expected: success, failure, duplicate, unknown-ID, malformed, and amount-mismatch cases pass.

### Task 6: Integrate the Booking Card UI

**Files:**
- Modify: `app/components/villa/BookingCard.tsx`

**Interfaces:**
- The existing `BookingCard({ villa }: { villa: Villa })` public component signature remains unchanged.
- The component calls the two booking API endpoints and renders pending, success, failure, and expired states without client-side payment confirmation.

- [ ] **Step 1: Add failing component-level behavior checks**

If the repository has no component test harness, add a small pure polling/status helper test instead of introducing a browser test framework. Cover that polling stops on `PAID`, `PAYMENT_FAILED`, and `EXPIRED`, and stops after a bounded retry window.

- [ ] **Step 2: Add guest detail fields**

Add controlled fields for name, email, and phone near the reservation action. Use labels, input types, required attributes, and accessible error text. Keep the existing date and guest controls.

- [ ] **Step 3: Submit the booking request**

On `Reserve`, send the villa slug, dates as ISO date strings, guests, and guest details. Disable the button while submitting and display a safe error if the request fails. Do not send `total` as an authoritative field.

- [ ] **Step 4: Add bounded status polling**

After a `202` response, show the STK instruction and poll the reference endpoint at a short fixed interval for a bounded number of attempts. Stop on a terminal state or timeout, and offer a retry action that creates a new payment attempt through the booking endpoint.

- [ ] **Step 5: Preserve the existing visual language**

Use the current terracotta, sand, ink, rounded-card, and typography classes. Keep the amount breakdown visible, but label it as the server-confirmed reservation total once the API responds.

- [ ] **Step 6: Run lint after UI integration**

Run:

```bash
npm run lint
```

Expected: no ESLint errors.

### Task 7: Configuration, Documentation, and End-to-End Verification

**Files:**
- Modify: `.env.example`
- Modify: `README.md`
- Modify: `package.json` only if verification scripts need adjustment

**Interfaces:**
- Developers can configure Daraja sandbox and Neon without guessing variable names.
- The documented commands work for local Prisma migration and callback testing.

- [ ] **Step 1: Document environment variables**

Add only variable names and safe placeholders to `.env.example`:

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

- [ ] **Step 2: Document Neon and Daraja setup**

Explain that `.env.local` is populated by Neon, migrations use the unpooled connection where required, Daraja callback URLs must be public HTTPS, and local testing needs ngrok or Cloudflare Tunnel. State that this implementation is sandbox-only.

- [ ] **Step 3: Run the full test suite**

Run:

```bash
npm run test
```

Expected: all unit and route tests pass.

- [ ] **Step 4: Run lint and production build**

Run:

```bash
npm run lint
npm run build
```

Expected: both commands pass with no TypeScript, route, or build errors.

- [ ] **Step 5: Verify database connectivity and migration state**

Run:

```bash
npx prisma migrate status
node --env-file=.env.local -e "const { neon } = require('@neondatabase/serverless'); const sql = neon(process.env.DATABASE_URL); sql\`SELECT 1 AS ok\`.then(console.log).catch((error) => { console.error(error); process.exit(1); });"
```

Expected: migrations are up to date and the query returns `{ ok: 1 }`.

- [ ] **Step 6: Perform sandbox smoke test**

Start the app, expose the callback route through a public HTTPS tunnel, set `MPESA_CALLBACK_URL` to the tunnel URL, submit a reservation with Daraja sandbox credentials, complete or cancel the STK prompt, and verify the status changes only after the callback.
