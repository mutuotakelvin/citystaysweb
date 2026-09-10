import "server-only";

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { Resend } from "resend";
import { getVilla } from "./data";
import { generateInvoicePdf } from "./invoice";

let transporter: Transporter | null = null;
let resend: Resend | null = null;

function getTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST || process.env.ZOHO_SMTP_HOST;
  const user = process.env.SMTP_USER || process.env.ZOHO_SMTP_USER;
  const pass = process.env.SMTP_PASS || process.env.ZOHO_SMTP_PASS;
  if (!host || !user || !pass) return null;
  if (transporter) return transporter;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;
  transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  return transporter;
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!resend) resend = new Resend(key);
  return resend;
}

function fromAddress(): string {
  return process.env.EMAIL_FROM || "info@lobeliapearl.com";
}

function adminAddress(): string | null {
  return process.env.EMAIL_ADMIN || null;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-KE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function fmtKES(n: number): string {
  return `KES ${n.toLocaleString("en-KE")}`;
}

function vatBreakdown(total: number): { taxable: number; vat: number } {
  const taxable = Math.round(total / 1.16);
  return { taxable, vat: total - taxable };
}

function nightsBetween(a: Date, b: Date): number {
  const d1 = new Date(a); d1.setHours(0, 0, 0, 0);
  const d2 = new Date(b); d2.setHours(0, 0, 0, 0);
  return Math.max(1, Math.round((d2.getTime() - d1.getTime()) / 86400000));
}

function bookingHtml(input: { guestName: string; villaName: string; reference: string; checkIn: Date; checkOut: Date; guests: number; bedrooms?: number | null; amount: number; receiptNumber?: string }): string {
  const nights = nightsBetween(input.checkIn, input.checkOut);
  const { taxable, vat } = vatBreakdown(input.amount);
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f8f7f5">
<div style="display:none;max-height:0;overflow:hidden">Reservation ${input.reference} confirmed — ${input.villaName}</div>
<div style="max-width:640px;margin:0 auto;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a">
  <div style="background:#163a41;padding:28px 32px;text-align:center">
    <div style="color:#fff;font-size:20px;letter-spacing:0.18em;font-weight:700">LOBELIA PEARL</div>
    <div style="color:#c8d8db;font-size:11px;letter-spacing:0.12em;margin-top:4px">CURATED COASTAL STAYS — KENYA</div>
  </div>
  <div style="background:#fff;padding:32px;border-left:1px solid #e8e2d9;border-right:1px solid #e8e2d9">
    <h1 style="margin:0;font-size:22px;color:#163a41">Payment received, ${input.guestName}!</h1>
    <p style="color:#4b5563;line-height:1.6;margin:12px 0 20px">Your reservation <strong style="color:#163a41">${input.reference}</strong> for <strong>${input.villaName}${input.bedrooms ? ` · ${input.bedrooms}BR` : ""}</strong> is confirmed. Invoice attached (VAT inclusive 16%).</p>

    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:20px">
      <div style="background:#163a41;color:#fff;padding:10px 16px;font-size:12px;font-weight:700;letter-spacing:0.08em">BOOKING DETAILS</div>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:10px 16px;color:#6b7280;border-top:1px solid #f3f4f6">Villa</td><td style="padding:10px 16px;text-align:right;font-weight:600">${input.villaName}${input.bedrooms ? ` · ${input.bedrooms}BR` : ""}</td></tr>
        <tr><td style="padding:10px 16px;color:#6b7280;border-top:1px solid #f3f4f6">Reference</td><td style="padding:10px 16px;text-align:right;font-family:monospace">${input.reference}</td></tr>
        <tr><td style="padding:10px 16px;color:#6b7280;border-top:1px solid #f3f4f6">Check-in</td><td style="padding:10px 16px;text-align:right">${fmtDate(input.checkIn)}</td></tr>
        <tr><td style="padding:10px 16px;color:#6b7280;border-top:1px solid #f3f4f6">Check-out</td><td style="padding:10px 16px;text-align:right">${fmtDate(input.checkOut)}</td></tr>
        <tr><td style="padding:10px 16px;color:#6b7280;border-top:1px solid #f3f4f6">Nights</td><td style="padding:10px 16px;text-align:right">${nights}</td></tr>
        <tr><td style="padding:10px 16px;color:#6b7280;border-top:1px solid #f3f4f6">Guests</td><td style="padding:10px 16px;text-align:right">${input.guests}</td></tr>
        ${input.receiptNumber ? `<tr><td style="padding:10px 16px;color:#6b7280;border-top:1px solid #f3f4f6">M-Pesa receipt</td><td style="padding:10px 16px;text-align:right;font-family:monospace">${input.receiptNumber}</td></tr>` : ``}
      </table>
    </div>

    <div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:20px">
      <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;color:#163a41;margin-bottom:10px">PAYMENT — VAT INCLUSIVE 16%</div>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:6px 0;color:#6b7280">Taxable amount</td><td style="padding:6px 0;text-align:right">${fmtKES(taxable)}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280">VAT 16% (inclusive)</td><td style="padding:6px 0;text-align:right">${fmtKES(vat)}</td></tr>
        <tr><td style="padding:10px 0 0;border-top:1px solid #e5e7eb;font-weight:700;color:#163a41">Total paid</td><td style="padding:10px 0 0;border-top:1px solid #e5e7eb;text-align:right;font-weight:800;color:#163a41">${fmtKES(input.amount)}</td></tr>
      </table>
      <div style="font-size:11px;color:#9ca3af;margin-top:6px">All amounts in KES. VAT inclusive at Kenya standard rate.</div>
    </div>

    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:14px 16px;font-size:13px;line-height:1.5;color:#7c2d12;margin-bottom:20px">
      <strong>What next?</strong> Check-in details and directions will be shared 24h before arrival. For requests (chef, transfers, early check-in) reply to this email — <a href="mailto:info@lobeliapearl.com" style="color:#c0613a;text-decoration:none">info@lobeliapearl.com</a>.
    </div>

    <p style="font-size:13px;color:#6b7280;line-height:1.6;margin:0">Free cancellation within 48 hours. Need help? Reply to this email or call the number on your invoice.</p>
  </div>
  <div style="background:#f8f7f5;border:1px solid #e8e2d9;border-top:none;padding:18px;text-align:center;font-size:12px;color:#9ca3af">
    Lobelia Pearl • Galu Beach, Diani • <a href="https://www.lobeliapearl.com" style="color:#163a41;text-decoration:none">lobeliapearl.com</a> • info@lobeliapearl.com<br/>Invoice LP-${input.reference} attached as PDF
  </div>
</div>
</body></html>`;
}

async function sendMail(opts: { to: string; subject: string; html: string; bcc?: string[]; attachments?: { filename: string; content: Buffer; contentType: string }[] }): Promise<void> {
  const smtp = getTransporter();
  if (smtp) {
    await smtp.sendMail({ from: fromAddress(), to: opts.to, subject: opts.subject, html: opts.html, bcc: opts.bcc, attachments: opts.attachments });
    return;
  }
  const client = getResend();
  if (client) {
    const payload: any = { from: fromAddress(), to: opts.to, subject: opts.subject, html: opts.html, bcc: opts.bcc };
    if (opts.attachments?.length) payload.attachments = opts.attachments.map((a) => ({ filename: a.filename, content: a.content.toString("base64") }));
    await client.emails.send(payload);
    return;
  }
  console.warn("No email transport configured, skipping email to", opts.to);
}

export async function sendBookingConfirmation(input: {
  to: string;
  guestName: string;
  villaSlug: string;
  reference: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  bedrooms?: number | null;
  amount: number;
  receiptNumber?: string;
}): Promise<void> {
  const villa = getVilla(input.villaSlug);
  const villaName = villa?.name ?? input.villaSlug;
  const subject = `Reservation confirmed — ${input.reference} • ${villaName}`;
  const html = bookingHtml({ guestName: input.guestName, villaName, reference: input.reference, checkIn: input.checkIn, checkOut: input.checkOut, guests: input.guests, bedrooms: input.bedrooms, amount: input.amount, receiptNumber: input.receiptNumber });
  let pdf: Buffer | null = null;
  try {
    pdf = await generateInvoicePdf({ reference: input.reference, guestName: input.guestName, guestEmail: input.to, villaSlug: input.villaSlug, villaName, checkIn: input.checkIn, checkOut: input.checkOut, guests: input.guests, bedrooms: input.bedrooms, amount: input.amount, receiptNumber: input.receiptNumber });
  } catch (e) {
    console.error("Invoice generation failed", e);
  }
  try {
    const admin = adminAddress();
    await sendMail({
      to: input.to,
      subject,
      html,
      bcc: admin ? [admin] : undefined,
      attachments: pdf ? [{ filename: `Invoice-LP-${input.reference}.pdf`, content: pdf, contentType: "application/pdf" }] : undefined,
    });
  } catch (error) {
    console.error("Failed to send confirmation email", error);
  }
}

export async function sendPaymentFailed(input: {
  to: string;
  guestName: string;
  villaSlug: string;
  reference: string;
  reason?: string;
}): Promise<void> {
  const villa = getVilla(input.villaSlug);
  const villaName = villa?.name ?? input.villaSlug;
  const subject = `Payment not completed — ${input.reference}`;
  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f8f7f5"><div style="max-width:640px;margin:0 auto;font-family:system-ui,sans-serif">
    <div style="background:#163a41;padding:24px;text-align:center;color:#fff;font-weight:700;letter-spacing:0.12em">LOBELIA PEARL</div>
    <div style="background:#fff;padding:28px;border:1px solid #e8e2d9">
      <h2 style="color:#163a41;margin:0 0 8px">Payment not completed, ${input.guestName}</h2>
      <p style="color:#4b5563">Your reservation <strong>${input.reference}</strong> for ${villaName} could not be completed${input.reason ? `: ${input.reason}` : "."}</p>
      <p style="color:#4b5563">Please try again or contact <a href="mailto:info@lobeliapearl.com" style="color:#c0613a">info@lobeliapearl.com</a>.</p>
    </div></div></body></html>`;
  try {
    await sendMail({ to: input.to, subject, html });
  } catch (error) {
    console.error("Failed to send failure email", error);
  }
}

export async function verifyEmailConnection(): Promise<{ ok: boolean; message: string }> {
  const smtp = getTransporter();
  if (!smtp) return { ok: false, message: "SMTP not configured" };
  try {
    await smtp.verify();
    return { ok: true, message: "Zoho SMTP connected" };
  } catch (e: any) {
    return { ok: false, message: e?.message || String(e) };
  }
}
