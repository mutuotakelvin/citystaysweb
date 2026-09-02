import { registerC2bUrls } from "../../../lib/mpesa";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.MPESA_REGISTER_SECRET;
  if (secret) {
    const provided = request.headers.get("x-register-secret") ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (provided !== secret) return Response.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await registerC2bUrls();
    const ok = result.ResponseCode === "0" || result.ResponseDescription === "success";
    return Response.json({ success: ok, data: result, env: process.env.MPESA_ENVIRONMENT, shortcode: process.env.MPESA_SHORTCODE, callbackUrl: process.env.MPESA_CALLBACK_URL }, { status: ok ? 200 : 422 });
  } catch (error) {
    console.error("C2B register failed", error);
    return Response.json({ success: false, message: (error as Error).message, env: process.env.MPESA_ENVIRONMENT, shortcode: process.env.MPESA_SHORTCODE, callbackUrl: process.env.MPESA_CALLBACK_URL }, { status: 500 });
  }
}
