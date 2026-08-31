import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { prisma } = vi.hoisted(() => ({
  prisma: {
    $transaction: vi.fn(),
    paymentAttempt: { findUnique: vi.fn(), update: vi.fn() },
    booking: { update: vi.fn(), updateMany: vi.fn() },
  },
}));

vi.mock("../../../lib/prisma", () => ({ prisma }));

import { POST } from "./route";

const payment = {
  id: "payment-1",
  bookingId: "booking-1",
  amount: 1500,
  status: "PENDING",
  booking: { id: "booking-1", amount: 1500, status: "PENDING_PAYMENT" },
};

function callback(resultCode = 0, amount = 1500): Request {
  return new Request("http://localhost/api/mpesa/callback", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      Body: {
        stkCallback: {
          CheckoutRequestID: "checkout-1",
          ResultCode: resultCode,
          ResultDesc: resultCode === 0 ? "Success" : "Cancelled by user",
          CallbackMetadata: { Item: [{ Name: "Amount", Value: amount }, { Name: "MpesaReceiptNumber", Value: "RCP-1" }] },
        },
      },
    }),
  });
}

afterEach(() => vi.clearAllMocks());

function useTransaction() {
  prisma.$transaction.mockImplementation(async (transaction) => transaction({
    paymentAttempt: prisma.paymentAttempt,
    booking: prisma.booking,
  }));
}

describe("POST /api/mpesa/callback", () => {
  test("marks a matching successful payment and booking paid", async () => {
    useTransaction();
    prisma.paymentAttempt.findUnique.mockResolvedValue(payment);

    const response = await POST(callback());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ResultCode: 0, ResultDesc: "Accepted" });
    expect(prisma.paymentAttempt.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "payment-1" },
      data: expect.objectContaining({ status: "SUCCEEDED", resultCode: 0, resultMessage: "Success", callbackPayload: expect.any(Object) }),
    }));
    expect(prisma.booking.updateMany).toHaveBeenCalledWith({ where: { id: "booking-1", status: "PENDING_PAYMENT" }, data: { status: "PAID" } });
  });

  test("marks a provider failure and booking payment failed", async () => {
    useTransaction();
    prisma.paymentAttempt.findUnique.mockResolvedValue(payment);

    await POST(callback(1032));

    expect(prisma.paymentAttempt.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: "FAILED", resultCode: 1032 }) }));
    expect(prisma.booking.updateMany).toHaveBeenCalledWith({ where: { id: "booking-1", status: "PENDING_PAYMENT" }, data: { status: "PAYMENT_FAILED" } });
  });

  test("does not downgrade a paid booking on a duplicate callback", async () => {
    useTransaction();
    prisma.paymentAttempt.findUnique.mockResolvedValue({ ...payment, status: "SUCCEEDED", booking: { ...payment.booking, status: "PAID" } });

    const response = await POST(callback(1032));

    expect(response.status).toBe(200);
    const update = prisma.paymentAttempt.update.mock.calls[0][0];
    expect(update.data).not.toHaveProperty("status");
    expect(prisma.booking.updateMany).not.toHaveBeenCalled();
  });

  test("uses serializable transactions and preserves an expired booking", async () => {
    useTransaction();
    prisma.paymentAttempt.findUnique.mockResolvedValue({ ...payment, booking: { ...payment.booking, status: "EXPIRED" } });

    const response = await POST(callback());

    expect(response.status).toBe(200);
    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), { isolationLevel: "Serializable" });
    expect(prisma.paymentAttempt.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: "SUCCEEDED" }) }));
    expect(prisma.booking.updateMany).not.toHaveBeenCalled();
  });

  test("retries a serialization conflict before acknowledging the callback", async () => {
    prisma.$transaction
      .mockRejectedValueOnce({ code: "P2034" })
      .mockImplementationOnce(async (transaction) => transaction({ paymentAttempt: prisma.paymentAttempt, booking: prisma.booking }));
    prisma.paymentAttempt.findUnique.mockResolvedValue(payment);

    const response = await POST(callback());

    expect(response.status).toBe(200);
    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
  });

  test("reconciles a pending booking when the payment is already failed", async () => {
    useTransaction();
    prisma.paymentAttempt.findUnique.mockResolvedValue({ ...payment, status: "FAILED" });

    await POST(callback(1032));

    expect(prisma.booking.updateMany).toHaveBeenCalledWith({ where: { id: "booking-1", status: "PENDING_PAYMENT" }, data: { status: "PAYMENT_FAILED" } });
    expect(prisma.paymentAttempt.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.not.objectContaining({ status: expect.anything() }) }));
  });

  test("acknowledges an unknown checkout request without revealing it", async () => {
    useTransaction();
    prisma.paymentAttempt.findUnique.mockResolvedValue(null);

    const response = await POST(callback());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ResultCode: 0, ResultDesc: "Accepted" });
    expect(prisma.paymentAttempt.update).not.toHaveBeenCalled();
  });

  test("acknowledges malformed JSON and payload safely", async () => {
    const malformedJson = new Request("http://localhost/api/mpesa/callback", { method: "POST", body: "{" });
    const malformedPayload = new Request("http://localhost/api/mpesa/callback", { method: "POST", body: JSON.stringify({}) });

    expect(await (await POST(malformedJson)).json()).toEqual({ ResultCode: 0, ResultDesc: "Accepted" });
    expect(await (await POST(malformedPayload)).json()).toEqual({ ResultCode: 0, ResultDesc: "Accepted" });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  test("fails an amount mismatch without marking the booking paid", async () => {
    useTransaction();
    prisma.paymentAttempt.findUnique.mockResolvedValue(payment);

    await POST(callback(0, 1499));

    expect(prisma.paymentAttempt.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: "FAILED", resultCode: 0 }) }));
    expect(prisma.booking.updateMany).toHaveBeenCalledWith({ where: { id: "booking-1", status: "PENDING_PAYMENT" }, data: { status: "PAYMENT_FAILED" } });
    expect(prisma.booking.updateMany).not.toHaveBeenCalledWith(expect.objectContaining({ data: { status: "PAID" } }));
  });

  test("returns a retryable server error when callback persistence fails", async () => {
    useTransaction();
    prisma.$transaction.mockRejectedValue(new Error("database unavailable"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await POST(callback());

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ ResultCode: 1, ResultDesc: "Unable to process callback" });
    expect(errorSpy).toHaveBeenCalledWith("M-Pesa callback processing failed");
  });
});
