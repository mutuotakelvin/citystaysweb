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
    return Response.json({ success: ok, data: result }, { status: ok ? 200 : 422 });
  } catch (error) {
    return Response.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
