import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { villa, prisma, initiateStkPush } = vi.hoisted(() => ({
  villa: { slug: "galu-beachfront-villa", guests: 10, price: 15000 },
  prisma: {
    $transaction: vi.fn(),
    booking: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    paymentAttempt: { create: vi.fn(), update: vi.fn() },
  },
  initiateStkPush: vi.fn(),
}));

vi.mock("../../lib/prisma", () => ({ prisma }));
vi.mock("../../lib/booking", async () => {
  const actual = await vi.importActual<typeof import("../../lib/booking")>("../../lib/booking");
  return {
    ...actual,
    getVillaForBooking: vi.fn(() => villa),
  };
});
vi.mock("../../lib/mpesa", () => ({ initiateStkPush }));

import { POST } from "./route";
import { GET as StatusGET } from "./[reference]/route";
import { getVillaForBooking } from "../../lib/booking";

const validBody = {
  villaSlug: villa.slug,
  checkIn: "2099-01-10",
  checkOut: "2099-01-12",
  guests: 2,
  guestName: "Amina Otieno",
  guestEmail: "amina@example.com",
  guestPhone: "0712345678",
};

function request(body: unknown, idempotencyKey = "request-1"): Request {
  return new Request("http://localhost/api/bookings", {
    method: "POST",
    headers: { "content-type": "application/json", "idempotency-key": idempotencyKey },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/bookings validation", () => {
  test("requires an Idempotency-Key header", async () => {
    const response = await POST(request(validBody, ""));

    expect(response.status).toBe(400);
    expect(prisma.booking.create).not.toHaveBeenCalled();
  });

  test.each([
    ["malformed JSON", "{"],
    ["invalid date range", { ...validBody, checkOut: "2099-01-10" }],
    ["invalid phone", { ...validBody, guestPhone: "071234567" }],
    ["invalid email", { ...validBody, guestEmail: "not-an-email" }],
    ["excessive guests", { ...validBody, guests: 11 }],
  ])("rejects %s without creating a booking", async (_name, body) => {
    const response = await POST(request(body));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "Invalid booking details" });
    expect(prisma.booking.create).not.toHaveBeenCalled();
  });

  test("returns 404 for an unknown villa without creating a booking", async () => {
    vi.mocked(getVillaForBooking).mockImplementationOnce(() => {
      throw new Error("Villa not found");
    });

    const response = await POST(request(validBody));

    expect(response.status).toBe(404);
    expect(prisma.booking.create).not.toHaveBeenCalled();
  });
});

describe("POST /api/bookings initiation", () => {
  test("creates a pending booking and payment, then initiates Daraja with the server total", async () => {
    prisma.$transaction.mockImplementation(async (callback) => callback({ booking: prisma.booking, paymentAttempt: prisma.paymentAttempt }));
    prisma.booking.findUnique.mockResolvedValue(null);
    prisma.booking.create.mockResolvedValue({ id: "booking-1" });
    prisma.paymentAttempt.create.mockResolvedValue({ id: "payment-1" });
    prisma.paymentAttempt.update.mockResolvedValue({});
    initiateStkPush.mockResolvedValue({
      MerchantRequestID: "merchant-1",
      CheckoutRequestID: "checkout-1",
      ResponseCode: "0",
    });

    const response = await POST(request(validBody));
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body).toMatchObject({ status: "PENDING_PAYMENT", currency: "KES" });
    expect(body.reference).toMatch(/^[A-Z0-9]{1,12}$/);
    expect(prisma.booking.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ amount: body.amount }),
    }));
    expect(prisma.paymentAttempt.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ amount: body.amount, status: "INITIATED", provider: "MPESA_DARAJA" }),
    }));
    expect(initiateStkPush).toHaveBeenCalledWith(expect.objectContaining({ amount: body.amount, bookingReference: body.reference }));
    expect(prisma.paymentAttempt.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: "PENDING", merchantRequestId: "merchant-1", checkoutRequestId: "checkout-1" }),
    }));
    expect(prisma.$transaction).toHaveBeenCalledOnce();
  });

  test("marks records failed and returns a safe 502 when Daraja fails", async () => {
    prisma.$transaction.mockImplementation(async (callback) => callback({ booking: prisma.booking, paymentAttempt: prisma.paymentAttempt }));
    prisma.booking.findUnique.mockResolvedValue(null);
    prisma.booking.create.mockResolvedValue({ id: "booking-1" });
    prisma.paymentAttempt.create.mockResolvedValue({ id: "payment-1" });
    prisma.paymentAttempt.update.mockResolvedValue({});
    initiateStkPush.mockRejectedValue(new Error("provider secret details"));

    const response = await POST(request(validBody));
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body).toEqual({ status: "PAYMENT_FAILED", message: "Unable to initiate payment" });
    expect(prisma.paymentAttempt.update).toHaveBeenCalledWith(expect.objectContaining({ data: { status: "FAILED" } }));
    expect(prisma.booking.update).toHaveBeenCalledWith(expect.objectContaining({ data: { status: "PAYMENT_FAILED" } }));
  });

  test("keeps the booking pending when provider failure compensation fails", async () => {
    prisma.$transaction
      .mockImplementationOnce(async (callback) => callback({ booking: prisma.booking, paymentAttempt: prisma.paymentAttempt }))
      .mockRejectedValueOnce(new Error("compensation unavailable"));
    prisma.booking.findUnique.mockResolvedValue(null);
    prisma.booking.create.mockResolvedValue({ id: "booking-1" });
    prisma.paymentAttempt.create.mockResolvedValue({ id: "payment-1" });
    initiateStkPush.mockRejectedValue(new Error("provider unavailable"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await POST(request(validBody, "compensation-failure"));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "PENDING_PAYMENT", message: "Unable to confirm payment initiation" });
    expect(errorSpy).toHaveBeenCalled();
  });

  test("does not leave an orphan booking when payment creation fails", async () => {
    prisma.booking.findUnique.mockResolvedValue(null);
    prisma.booking.create.mockResolvedValue({ id: "booking-1" });
    prisma.paymentAttempt.create.mockRejectedValue(new Error("payment insert failed"));
    prisma.$transaction.mockImplementation(async (callback) => callback({ booking: prisma.booking, paymentAttempt: prisma.paymentAttempt }));

    const response = await POST(request(validBody, "transaction-failure"));

    expect(response.status).toBe(500);
    expect(prisma.$transaction).toHaveBeenCalledOnce();
    expect(initiateStkPush).not.toHaveBeenCalled();
  });

  test("preserves pending state when accepted provider response cannot be persisted", async () => {
    prisma.booking.findUnique.mockResolvedValue(null);
    prisma.$transaction.mockImplementation(async (callback) => callback({ booking: prisma.booking, paymentAttempt: prisma.paymentAttempt }));
    prisma.booking.create.mockResolvedValue({ id: "booking-1" });
    prisma.paymentAttempt.create.mockResolvedValue({ id: "payment-1" });
    initiateStkPush.mockResolvedValue({ MerchantRequestID: "merchant-1", CheckoutRequestID: "checkout-1", ResponseCode: "0" });
    prisma.paymentAttempt.update.mockRejectedValue(new Error("database unavailable"));

    const response = await POST(request(validBody, "accepted-but-unpersisted"));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toEqual({ status: "PENDING_PAYMENT", message: "Unable to confirm payment initiation" });
    expect(prisma.paymentAttempt.update).toHaveBeenCalledTimes(3);
    expect(prisma.booking.update).not.toHaveBeenCalled();
  });

  test("returns the existing safe response for an idempotent repeat", async () => {
    prisma.booking.findUnique.mockResolvedValue({ reference: "ABC123", status: "PENDING_PAYMENT", amount: 100, currency: "KES" });

    const response = await POST(request(validBody, "already-used"));
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body).toEqual({ reference: "ABC123", status: "PENDING_PAYMENT", amount: 100, currency: "KES", message: "Payment request initiated" });
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(initiateStkPush).not.toHaveBeenCalled();
  });

  test("retries a public reference collision", async () => {
    prisma.booking.findUnique.mockResolvedValue(null);
    prisma.$transaction
      .mockRejectedValueOnce({ code: "P2002", meta: { target: ["reference"] } })
      .mockImplementationOnce(async (callback) => callback({ booking: prisma.booking, paymentAttempt: prisma.paymentAttempt }));
    prisma.booking.create.mockResolvedValue({ id: "booking-1" });
    prisma.paymentAttempt.create.mockResolvedValue({ id: "payment-1" });
    prisma.paymentAttempt.update.mockResolvedValue({});
    initiateStkPush.mockResolvedValue({ MerchantRequestID: "merchant-1", CheckoutRequestID: "checkout-1", ResponseCode: "0" });

    const response = await POST(request(validBody, "reference-retry"));

    expect(response.status).toBe(202);
    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
    expect(initiateStkPush).toHaveBeenCalledOnce();
  });
});

describe("GET /api/bookings/[reference]", () => {
  test("returns 404 for a missing booking", async () => {
    prisma.booking.findUnique.mockResolvedValue(null);

    const response = await StatusGET(new Request("http://localhost"), { params: Promise.resolve({ reference: "MISSING" }) });

    expect(response.status).toBe(404);
  });

  test.each([
    ["PENDING_PAYMENT", "Awaiting M-Pesa payment"],
    ["PAID", "Payment received"],
  ])("returns safe data for %s bookings", async (status, message) => {
    prisma.booking.findUnique.mockResolvedValue({ reference: "ABC123", status, amount: 100, currency: "KES", createdAt: new Date() });

    const response = await StatusGET(new Request("http://localhost"), { params: Promise.resolve({ reference: "ABC123" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ reference: "ABC123", status, amount: 100, currency: "KES", message });
  });

  test("expires a pending booking older than 30 minutes", async () => {
    prisma.booking.findUnique.mockResolvedValue({ reference: "ABC123", status: "PENDING_PAYMENT", amount: 100, currency: "KES", createdAt: new Date(Date.now() - 31 * 60 * 1000) });
    prisma.booking.updateMany.mockResolvedValue({ count: 1 });

    const response = await StatusGET(new Request("http://localhost"), { params: Promise.resolve({ reference: "ABC123" }) });
    const body = await response.json();

    expect(body).toMatchObject({ status: "EXPIRED", message: "Booking expired" });
    expect(prisma.booking.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ status: "PENDING_PAYMENT" }) }));
  });
});
