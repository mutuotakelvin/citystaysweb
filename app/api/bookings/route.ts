import { randomBytes } from "node:crypto";

import { calculateBookingTotal, getVillaForBooking, normalizeBookingInput } from "../../lib/booking";
import { initiateStkPush } from "../../lib/mpesa";
import { prisma } from "../../lib/prisma";

export const runtime = "nodejs";

function publicReference(): string {
  return randomBytes(6).toString("hex").toUpperCase();
}

function nightsBetween(checkIn: Date, checkOut: Date): number {
  const start = Date.UTC(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
  const end = Date.UTC(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
  return Math.round((end - start) / (24 * 60 * 60 * 1000));
}

function isReferenceCollision(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("code" in error) || error.code !== "P2002") return false;
  const target = (error as { meta?: { target?: unknown } }).meta?.target;
  return target === undefined || target === "reference" || (Array.isArray(target) && target.includes("reference"));
}

function responseForBooking(booking: { reference: string; status: string; amount: number; currency: string }): Response {
  const message = booking.status === "PAID" ? "Payment received" :
    booking.status === "EXPIRED" ? "Booking expired" :
      booking.status === "PAYMENT_FAILED" ? "Payment failed" : "Payment request initiated";
  return Response.json({ reference: booking.reference, status: booking.status, amount: booking.amount, currency: booking.currency, message }, { status: 202 });
}

async function persistProviderResponse(paymentId: string, providerResponse: { MerchantRequestID: string; CheckoutRequestID: string }): Promise<boolean> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await prisma.paymentAttempt.update({
        where: { id: paymentId },
        data: { status: "PENDING", merchantRequestId: providerResponse.MerchantRequestID, checkoutRequestId: providerResponse.CheckoutRequestID },
      });
      return true;
    } catch {
      // A successful provider request must remain pending if persistence is unavailable.
    }
  }
  return false;
}

export async function POST(request: Request): Promise<Response> {
  const idempotencyKey = request.headers.get("Idempotency-Key")?.trim();
  if (!idempotencyKey) return Response.json({ message: "Idempotency-Key header is required" }, { status: 400 });

  const existing = await prisma.booking.findUnique({
    where: { idempotencyKey },
    select: { reference: true, status: true, amount: true, currency: true },
  });
  if (existing) return responseForBooking(existing);

  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    console.error("Booking validation failed", error);
    return Response.json({ message: "Invalid booking details" }, { status: 400 });
  }

  let bookingInput;
  try {
    if (!body || typeof body !== "object") throw new Error("Invalid booking request");
    const input = body as Record<string, unknown>;
    bookingInput = normalizeBookingInput({
      name: input.guestName,
      email: input.guestEmail,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      guests: input.guests,
      villaSlug: input.villaSlug,
      phone: input.guestPhone,
    });
  } catch {
    return Response.json({ message: "Invalid booking details" }, { status: 400 });
  }

  let villa;
  try {
    villa = getVillaForBooking(bookingInput.villaSlug);
  } catch {
    return Response.json({ message: "Invalid booking details" }, { status: 404 });
  }
  const amount = calculateBookingTotal(villa, nightsBetween(bookingInput.checkIn, bookingInput.checkOut), bookingInput.guests).total;
  let reference = "";
  let booking: { id: string } | undefined;
  let payment: { id: string } | undefined;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    reference = publicReference();
    try {
      ({ booking, payment } = await prisma.$transaction(async (tx) => {
        const createdBooking = await tx.booking.create({
          data: {
            reference,
            idempotencyKey,
            villaSlug: bookingInput.villaSlug,
            guestName: bookingInput.name,
            guestEmail: bookingInput.email,
            guestPhone: bookingInput.phone,
            checkIn: bookingInput.checkIn,
            checkOut: bookingInput.checkOut,
            guests: bookingInput.guests,
            amount,
            currency: "KES",
            status: "PENDING_PAYMENT",
          },
        });
        const createdPayment = await tx.paymentAttempt.create({
          data: { bookingId: createdBooking.id, provider: "MPESA_DARAJA", phone: bookingInput.phone, amount, status: "INITIATED" },
        });
        return { booking: createdBooking, payment: createdPayment };
      }));
      break;
    } catch (error) {
      if (!isReferenceCollision(error) || attempt === 2) {
        const concurrent = await prisma.booking.findUnique({ where: { idempotencyKey }, select: { reference: true, status: true, amount: true, currency: true } });
        if (concurrent) return responseForBooking(concurrent);
        return Response.json({ message: "Unable to create booking" }, { status: 500 });
      }
    }
  }
  if (!booking || !payment) return Response.json({ message: "Unable to create booking" }, { status: 500 });

  try {
    const providerResponse = await initiateStkPush({ amount, phone: bookingInput.phone, bookingReference: reference });
    if (providerResponse.ResponseCode !== "0") throw new Error("M-Pesa request failed");
    const persisted = await persistProviderResponse(payment.id, providerResponse);
    if (!persisted) {
      console.error("Accepted payment request could not be persisted", { bookingId: booking.id, paymentId: payment.id });
      return Response.json({ status: "PENDING_PAYMENT", message: "Unable to confirm payment initiation" }, { status: 503 });
    }
  } catch (error) {
    console.error("M-Pesa initiation failed", error);
    try {
      await prisma.$transaction(async (tx) => {
        await tx.paymentAttempt.update({ where: { id: payment.id }, data: { status: "FAILED" } });
        await tx.booking.update({ where: { id: booking.id }, data: { status: "PAYMENT_FAILED" } });
      });
    } catch (compensationError) {
      console.error("Payment initiation compensation failed", { bookingId: booking.id, paymentId: payment.id, error: compensationError });
      return Response.json({ status: "PENDING_PAYMENT", message: "Unable to confirm payment initiation" }, { status: 503 });
    }
    return Response.json({ status: "PAYMENT_FAILED", message: "Unable to initiate payment" }, { status: 502 });
  }

  return Response.json(
    { reference, status: "PENDING_PAYMENT", amount, currency: "KES", message: "Payment request initiated" },
    { status: 202 },
  );
}
