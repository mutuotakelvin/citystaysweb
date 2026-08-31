import { afterEach, describe, expect, test, vi } from "vitest";
vi.mock("server-only", () => ({}));
import {
  initiateStkPush,
  mapDarajaResult,
  parseDarajaCallback,
} from "./mpesa";

const originalEnv = { ...process.env };
const fixedNow = new Date("2026-08-21T12:34:56.000Z");

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

function configureSandbox() {
  process.env.MPESA_ENVIRONMENT = "sandbox";
  process.env.MPESA_CONSUMER_KEY = "consumer-key";
  process.env.MPESA_CONSUMER_SECRET = "consumer-secret";
  process.env.MPESA_SHORTCODE = "174379";
  process.env.MPESA_PASSKEY = "pass-key";
  process.env.MPESA_CALLBACK_URL = "https://example.com/api/mpesa/callback";
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("Daraja STK Push", () => {
  test("uses sandbox by default and builds the Daraja password from the injected clock", async () => {
    configureSandbox();
    delete process.env.MPESA_ENVIRONMENT;
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ access_token: "token" }))
      .mockResolvedValueOnce(jsonResponse({
        MerchantRequestID: "merchant-1",
        CheckoutRequestID: "checkout-1",
        ResponseCode: "0",
        ResponseDescription: "Success",
        CustomerMessage: "Success",
      }));

    await initiateStkPush(
      { amount: 12500, phone: "0712 345 678", bookingReference: "BOOK1" },
      fetcher,
      () => fixedNow,
    );

    expect(fetcher.mock.calls[0]?.[0]).toBe(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    );
    const body = JSON.parse(String(fetcher.mock.calls[1]?.[1]?.body));
    expect(body.Password).toBe(
      Buffer.from("174379pass-key20260821123456").toString("base64"),
    );
    expect(body.Timestamp).toBe("20260821123456");
  });

  test("uses production base URL when MPESA_ENVIRONMENT=production", async () => {
    configureSandbox();
    process.env.MPESA_ENVIRONMENT = "production";
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ access_token: "token" }))
      .mockResolvedValueOnce(jsonResponse({
        MerchantRequestID: "merchant-1",
        CheckoutRequestID: "checkout-1",
        ResponseCode: "0",
        ResponseDescription: "Success",
      }));

    await initiateStkPush({ amount: 100, phone: "0712345678", bookingReference: "BOOK1" }, fetcher, () => fixedNow);

    expect(fetcher.mock.calls[0]?.[0]).toBe("https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials");
    expect(fetcher.mock.calls[1]?.[0]).toBe("https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest");
  });

  test("rejects unknown environments", async () => {
    configureSandbox();
    process.env.MPESA_ENVIRONMENT = "staging";
    const fetcher = vi.fn<typeof fetch>();

    await expect(
      initiateStkPush({ amount: 100, phone: "0712345678", bookingReference: "BOOK1" }, fetcher),
    ).rejects.toThrow(/sandbox or production/i);
    expect(fetcher).not.toHaveBeenCalled();
  });

  test("rejects fractional amounts without making a provider request", async () => {
    configureSandbox();
    const fetcher = vi.fn<typeof fetch>();

    await expect(
      initiateStkPush({ amount: 100.5, phone: "0712345678", bookingReference: "BOOK1" }, fetcher),
    ).rejects.toThrow(/integer/i);
    expect(fetcher).not.toHaveBeenCalled();
  });

  test("constructs OAuth and STK requests with integer amount and normalized phone", async () => {
    configureSandbox();
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ access_token: "token" }))
      .mockResolvedValueOnce(jsonResponse({
        MerchantRequestID: "merchant-1",
        CheckoutRequestID: "checkout-1",
        ResponseCode: "0",
        ResponseDescription: "Success",
        CustomerMessage: "Success",
      }));

    await initiateStkPush(
      { amount: 12500, phone: "0712 345 678", bookingReference: "BOOK1" },
      fetcher,
      () => fixedNow,
    );

    const oauthInit = fetcher.mock.calls[0]?.[1];
    expect(oauthInit?.headers).toEqual({
      Authorization: `Basic ${Buffer.from("consumer-key:consumer-secret").toString("base64")}`,
    });
    expect(fetcher.mock.calls[1]?.[0]).toBe(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    );
    const stkInit = fetcher.mock.calls[1]?.[1];
    expect(stkInit?.headers).toEqual({ "Content-Type": "application/json", Authorization: "Bearer token" });
    expect(JSON.parse(String(stkInit?.body))).toMatchObject({
      BusinessShortCode: "174379",
      PartyA: "254712345678",
      PartyB: "174379",
      TransactionType: "CustomerPayBillOnline",
      Amount: 12500,
      PhoneNumber: "254712345678",
      AccountReference: "BOOK1",
      TransactionDesc: "BOOK1",
      CallBackURL: "https://example.com/api/mpesa/callback",
    });
  });

  test.each(["", "BOOK-1", "BOOK 1", "1234567890123"])(
    "rejects invalid booking reference %j before making a provider request",
    async (bookingReference) => {
      configureSandbox();
      const fetcher = vi.fn<typeof fetch>();

      await expect(
        initiateStkPush({ amount: 100, phone: "0712345678", bookingReference }, fetcher),
      ).rejects.toThrow(/booking reference/i);
      expect(fetcher).not.toHaveBeenCalled();
    },
  );
});

describe("Daraja callbacks", () => {
  test("parses a successful callback with receipt and amount", () => {
    expect(parseDarajaCallback({
      Body: {
        stkCallback: {
          CheckoutRequestID: "ws_CO_1",
          ResultCode: 0,
          ResultDesc: "The service request is processed successfully.",
          CallbackMetadata: {
            Item: [
              { Name: "Amount", Value: 12500 },
              { Name: "MpesaReceiptNumber", Value: "ABC123" },
            ],
          },
        },
      },
    })).toEqual({
      checkoutRequestId: "ws_CO_1",
      resultCode: 0,
      resultMessage: "The service request is processed successfully.",
      receiptNumber: "ABC123",
      amount: 12500,
    });
  });

  test("parses cancelled and generic failed callbacks without metadata", () => {
    expect(parseDarajaCallback({
      Body: { stkCallback: { CheckoutRequestID: "cancelled", ResultCode: 1032, ResultDesc: "Request cancelled" } },
    })).toMatchObject({ checkoutRequestId: "cancelled", resultCode: 1032, resultMessage: "Request cancelled" });
    expect(mapDarajaResult(0)).toBe("SUCCEEDED");
    expect(mapDarajaResult(1032)).toBe("FAILED");
    expect(mapDarajaResult(999999)).toBe("FAILED");
  });

  test.each([
    undefined,
    {},
    { Body: { stkCallback: { CheckoutRequestID: "", ResultCode: 0, ResultDesc: "success" } } },
    { Body: { stkCallback: { CheckoutRequestID: "id", ResultCode: 0, ResultDesc: "" } } },
    { Body: { stkCallback: { ResultCode: 0, ResultDesc: "missing id" } } },
    { Body: { stkCallback: { CheckoutRequestID: "id", ResultDesc: "missing code" } } },
  ])("rejects malformed callback payload %#", (payload) => {
    expect(() => parseDarajaCallback(payload)).toThrow();
  });
});
