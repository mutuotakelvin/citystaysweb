import { BOOKING_EXPIRY_MS, isBookingExpired } from "../../../lib/booking";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ reference: string }> };

function messageForStatus(status: string): string {
  if (status === "PAID") return "Payment received";
  if (status === "EXPIRED") return "Booking expired";
  if (status === "PAYMENT_FAILED") return "Payment failed";
  return "Awaiting M-Pesa payment";
}

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  const { reference } = await context.params;
  const booking = await prisma.booking.findUnique({
    where: { reference },
    select: { id: true, reference: true, status: true, amount: true, currency: true, createdAt: true },
  });
  if (!booking) return Response.json({ message: "Booking not found" }, { status: 404 });

  let status = booking.status;
  if (status === "PENDING_PAYMENT" && isBookingExpired(booking.createdAt, new Date())) {
    const expired = await prisma.booking.updateMany({
      where: { id: booking.id, status: "PENDING_PAYMENT", createdAt: { lte: new Date(Date.now() - BOOKING_EXPIRY_MS) } },
      data: { status: "EXPIRED" },
    });
    if (expired.count > 0) status = "EXPIRED";
  }

  return Response.json({
    reference: booking.reference,
    status,
    amount: booking.amount,
    currency: booking.currency,
    message: messageForStatus(status),
  });
}
