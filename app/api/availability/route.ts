import { prisma } from "../../lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const villaSlug = searchParams.get("villaSlug")?.trim();
  if (!villaSlug) return Response.json({ message: "villaSlug is required" }, { status: 400 });

  const bookings = await prisma.booking.findMany({
    where: { villaSlug, status: "PAID" },
    select: { checkIn: true, checkOut: true },
  });

  const blocked: string[] = [];
  for (const b of bookings) {
    const cur = new Date(b.checkIn);
    cur.setHours(0, 0, 0, 0);
    const end = new Date(b.checkOut);
    end.setHours(0, 0, 0, 0);
    while (cur < end) {
      blocked.push(cur.toISOString().slice(0, 10));
      cur.setDate(cur.getDate() + 1);
    }
  }

  return Response.json({ villaSlug, blocked });
}
