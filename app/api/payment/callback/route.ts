import { Prisma, type Prisma as PrismaTypes } from "@prisma/client";

import { sendBookingConfirmation, sendPaymentFailed } from "../../../lib/email";
import { mapDarajaResult, parseDarajaCallback } from "../../../lib/mpesa";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

const accepted = { ResultCode: 0, ResultDesc: "Accepted" };

function isSerializationConflict(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2034";
}

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;
  let callback;
  try {
    payload = await request.json();
    callback = parseDarajaCallback(payload);
  } catch {
    return Response.json(accepted);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let emailTarget: any = null;
  try {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        await prisma.$transaction(async (tx) => {
      const payment = await tx.paymentAttempt.findUnique({
        where: { checkoutRequestId: callback.checkoutRequestId },
        include: { booking: true },
      });
      if (!payment) return;

      const nextStatus = mapDarajaResult(callback.resultCode);
      const isTerminalPayment = payment.status === "SUCCEEDED" || payment.status === "FAILED";
      const isPaidBooking = payment.booking.status === "PAID";
      const isExpiredBooking = payment.booking.status === "EXPIRED";
      const amountMatches = callback.amount === payment.amount;
      const shouldSucceed = nextStatus === "SUCCEEDED" && amountMatches;
      const status = shouldSucceed ? "SUCCEEDED" : "FAILED";
      const preserveTerminalState = payment.status === "SUCCEEDED" || isPaidBooking;

      await tx.paymentAttempt.update({
        where: { id: payment.id },
        data: {
          callbackPayload: payload as PrismaTypes.InputJsonValue,
          resultCode: callback.resultCode,
          resultMessage: callback.resultMessage,
          ...(!preserveTerminalState && !isTerminalPayment ? { status } : {}),
        },
      });

      const willTransition = !isPaidBooking && !isExpiredBooking && (!isTerminalPayment && shouldSucceed || nextStatus === "FAILED" || !amountMatches);
      if (willTransition) {
        const updated = await tx.booking.updateMany({
          where: { id: payment.booking.id, status: "PENDING_PAYMENT" },
          data: { status: shouldSucceed ? "PAID" : "PAYMENT_FAILED" },
        });
        if (!updated || (updated.count ?? 0) > 0) {
          emailTarget = {
            booking: {
              guestEmail: payment.booking.guestEmail,
              guestName: payment.booking.guestName,
              villaSlug: payment.booking.villaSlug,
              reference: payment.booking.reference,
              checkIn: payment.booking.checkIn,
              checkOut: payment.booking.checkOut,
              guests: payment.booking.guests,
              bedrooms: (payment.booking as any).bedrooms ?? null,
              amount: payment.booking.amount,
            },
            shouldSucceed,
            receiptNumber: callback.receiptNumber,
            resultMessage: callback.resultMessage,
          };
        }
      }
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
        break;
      } catch (error) {
        if (!isSerializationConflict(error) || attempt === 2) throw error;
      }
    }
  } catch {
    console.error("M-Pesa callback processing failed");
    return Response.json({ ResultCode: 1, ResultDesc: "Unable to process callback" }, { status: 500 });
  }

  if (emailTarget) {
    if (emailTarget.shouldSucceed) {
      void sendBookingConfirmation({
        to: emailTarget.booking.guestEmail,
        guestName: emailTarget.booking.guestName,
        villaSlug: emailTarget.booking.villaSlug,
        reference: emailTarget.booking.reference,
        checkIn: emailTarget.booking.checkIn,
        checkOut: emailTarget.booking.checkOut,
        guests: emailTarget.booking.guests,
        bedrooms: emailTarget.booking.bedrooms,
        amount: emailTarget.booking.amount,
        receiptNumber: emailTarget.receiptNumber,
      });
    } else {
      void sendPaymentFailed({
        to: emailTarget.booking.guestEmail,
        guestName: emailTarget.booking.guestName,
        villaSlug: emailTarget.booking.villaSlug,
        reference: emailTarget.booking.reference,
        reason: emailTarget.resultMessage,
      });
    }
  }

  return Response.json(accepted);
}
