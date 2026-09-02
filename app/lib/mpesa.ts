import "server-only";

import { normalizeKenyanPhone } from "./booking";

export { normalizeKenyanPhone } from "./booking";

export type StkPushInput = {
  amount: number;
  phone: string;
  bookingReference: string;
};

export type StkPushResponse = {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage?: string;
};

export type ParsedCallback = {
  checkoutRequestId: string;
  resultCode: number;
  resultMessage: string;
  receiptNumber?: string;
  amount?: number;
};

type MpesaConfig = {
  environment: "sandbox" | "production";
  consumerKey: string;
  consumerSecret: string;
  shortcode: string;
  passkey: string;
  callbackUrl: string;
  transactionType: "CustomerPayBillOnline" | "CustomerBuyGoodsOnline";
};

type Clock = () => Date;

function getConfig(): MpesaConfig {
  const environment = process.env.MPESA_ENVIRONMENT || "sandbox";
  if (environment !== "sandbox" && environment !== "production") throw new Error("MPESA_ENVIRONMENT must be sandbox or production");

  const values = {
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    shortcode: process.env.MPESA_SHORTCODE,
    passkey: process.env.MPESA_PASSKEY,
    callbackUrl: process.env.MPESA_CALLBACK_URL,
  };
  for (const [name, value] of Object.entries(values)) {
    if (!value) throw new Error(`Missing ${name.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase()}`);
  }
  const rawType = process.env.MPESA_TRANSACTION_TYPE || "CustomerPayBillOnline";
  if (rawType !== "CustomerPayBillOnline" && rawType !== "CustomerBuyGoodsOnline") throw new Error("MPESA_TRANSACTION_TYPE must be CustomerPayBillOnline or CustomerBuyGoodsOnline");

  return { environment, ...values, transactionType: rawType } as MpesaConfig;
}

function getBaseUrl(): string {
  const env = process.env.MPESA_ENVIRONMENT || "sandbox";
  return env === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";
}

function formatTimestamp(date: Date): string {
  const parts = [
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  ];
  return parts.map((part, index) => String(part).padStart(index === 0 ? 4 : 2, "0")).join("");
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  let body: Record<string, unknown>;
  try {
    body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    throw new Error(`M-Pesa request failed ${response.status}: ${text.slice(0, 500)}`);
  }
  if (!response.ok) {
    const detail =
      (body.error_description as string) ||
      (body.errorMessage as string) ||
      (body.ResponseDescription as string) ||
      (body.error as string) ||
      JSON.stringify(body).slice(0, 500) ||
      text.slice(0, 500);
    throw new Error(`M-Pesa request failed ${response.status}: ${detail}`);
  }
  return body;
}

export async function getMpesaAccessToken(fetcher: typeof fetch = fetch): Promise<string> {
  const config = getConfig();
  const credentials = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString("base64");
  const response = await fetcher(
    `${getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${credentials}` } },
  );
  const body = await readJson(response);
  if (typeof body.access_token !== "string" || !body.access_token) throw new Error("M-Pesa access token missing");
  return body.access_token;
}

export async function initiateStkPush(
  input: StkPushInput,
  fetcher: typeof fetch = fetch,
  clock: Clock = () => new Date(),
): Promise<StkPushResponse> {
  const config = getConfig();
  const timestamp = formatTimestamp(clock());
  if (!Number.isInteger(input.amount) || input.amount < 1) throw new Error("M-Pesa amount must be a positive integer");
  if (!/^[A-Za-z0-9]{1,12}$/.test(input.bookingReference)) {
    throw new Error("Booking reference must be 1-12 alphanumeric characters");
  }
  const amount = input.amount;
  const phone = normalizeKenyanPhone(input.phone);
  const token = await getMpesaAccessToken(fetcher);
  const response = await fetcher(`${getBaseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      BusinessShortCode: config.shortcode,
      Password: Buffer.from(`${config.shortcode}${config.passkey}${timestamp}`).toString("base64"),
      Timestamp: timestamp,
      TransactionType: config.transactionType,
      Amount: amount,
      PartyA: phone,
      PartyB: config.shortcode,
      PhoneNumber: phone,
      CallBackURL: config.callbackUrl,
      AccountReference: input.bookingReference,
      TransactionDesc: input.bookingReference,
    }),
  });
  const body = await readJson(response);
  if (typeof body.MerchantRequestID !== "string" || typeof body.CheckoutRequestID !== "string" || typeof body.ResponseCode !== "string") {
    throw new Error("Invalid M-Pesa STK response");
  }
  return body as unknown as StkPushResponse;
}

export async function registerC2bUrls(fetcher: typeof fetch = fetch): Promise<Record<string, unknown>> {
  const config = getConfig();
  const token = await getMpesaAccessToken(fetcher);
  const response = await fetcher(`${getBaseUrl()}/mpesa/c2b/v1/registerurl`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      ShortCode: config.shortcode,
      ResponseType: "Completed",
      ConfirmationURL: config.callbackUrl,
      ValidationURL: config.callbackUrl,
    }),
  });
  return readJson(response);
}

export function mapDarajaResult(resultCode: number): "SUCCEEDED" | "FAILED" {
  return resultCode === 0 ? "SUCCEEDED" : "FAILED";
}

export function parseDarajaCallback(payload: unknown): ParsedCallback {
  const callback = (payload as { Body?: { stkCallback?: Record<string, unknown> } } | null)?.Body?.stkCallback;
  if (
    !callback ||
    typeof callback.CheckoutRequestID !== "string" ||
    callback.CheckoutRequestID.trim() === "" ||
    typeof callback.ResultCode !== "number" ||
    typeof callback.ResultDesc !== "string" ||
    callback.ResultDesc.trim() === ""
  ) {
    throw new Error("Malformed M-Pesa callback");
  }

  const result: ParsedCallback = {
    checkoutRequestId: callback.CheckoutRequestID,
    resultCode: callback.ResultCode,
    resultMessage: callback.ResultDesc,
  };
  const items = (callback.CallbackMetadata as { Item?: unknown } | undefined)?.Item;
  if (Array.isArray(items)) {
    for (const item of items) {
      if (!item || typeof item !== "object") continue;
      const entry = item as { Name?: unknown; Value?: unknown };
      if (entry.Name === "MpesaReceiptNumber" && typeof entry.Value === "string") result.receiptNumber = entry.Value;
      if (entry.Name === "Amount" && typeof entry.Value === "number") result.amount = entry.Value;
    }
  }
  return result;
}
