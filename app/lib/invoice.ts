import "server-only";

import PDFDocument from "pdfkit";

export type InvoiceInput = {
  reference: string;
  guestName: string;
  guestEmail: string;
  villaSlug: string;
  villaName: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  bedrooms?: number | null;
  amount: number;
  receiptNumber?: string;
  invoiceDate?: Date;
};

const VAT_RATE = 0.16;
const COMPANY = {
  name: "Lobelia Pearl",
  tagline: "Curated Coastal Stays — Kenya",
  address: "Galu Beach, Diani, Kwale — Kenya",
  email: "info@lobeliapearl.com",
  website: "www.lobeliapearl.com",
  phone: "+254 700 000 000",
  pin: "P051234567X",
};

function nightsBetween(a: Date, b: Date): number {
  const d1 = new Date(a); d1.setHours(0,0,0,0);
  const d2 = new Date(b); d2.setHours(0,0,0,0);
  return Math.max(1, Math.round((d2.getTime() - d1.getTime()) / 86400000));
}

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function fmtKES(n: number): string {
  return `KES ${n.toLocaleString("en-KE")}`;
}

export function calculateVatInclusive(total: number): { taxable: number; vat: number } {
  const taxable = Math.round(total / (1 + VAT_RATE));
  return { taxable, vat: total - taxable };
}

export async function generateInvoicePdf(input: InvoiceInput): Promise<Buffer> {
  const nights = nightsBetween(input.checkIn, input.checkOut);
  const invDate = input.invoiceDate ?? new Date();
  const invNumber = `LP-${input.reference}`;
  const { taxable, vat } = calculateVatInclusive(input.amount);

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48 });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const teal = "#163a41";
    const terracotta = "#c0613a";
    const muted = "#6b7280";

    doc.rect(0, 0, 595, 8).fill(teal);
    doc.moveDown(1.2);
    doc.fillColor(teal).fontSize(22).font("Helvetica-Bold").text(COMPANY.name, 48, 28);
    doc.fontSize(8).font("Helvetica").fillColor(muted).text(COMPANY.tagline, 48, 52);
    const rx = 380, rw = 167;
    doc.fontSize(7.5).fillColor("#1a1a1a").font("Helvetica").text(COMPANY.address, rx, 28, { width: rw, align: "right" });
    doc.text(COMPANY.email, rx, 38, { width: rw, align: "right" });
    doc.text(COMPANY.website, rx, 48, { width: rw, align: "right" });
    doc.fillColor(muted).fontSize(7).text(`${COMPANY.phone}  •  PIN: ${COMPANY.pin}`, rx, 58, { width: rw, align: "right" });

    doc.moveTo(48, 70).lineTo(547, 70).strokeColor("#e5e7eb").lineWidth(1).stroke();

    doc.fillColor(teal).fontSize(18).font("Helvetica-Bold").text("INVOICE", 48, 84);
    doc.fillColor(terracotta).fontSize(10).font("Helvetica-Bold").text(invNumber, 380, 88, { align: "right" });
    doc.fillColor(muted).fontSize(9).font("Helvetica").text(`Date: ${fmtDate(invDate)}`, 380, 102, { align: "right" });
    if (input.receiptNumber) doc.text(`M-Pesa: ${input.receiptNumber}`, 380, 114, { align: "right" });
    doc.fillColor("#059669").fontSize(8).font("Helvetica-Bold").text("PAID — VAT INCLUSIVE", 48, 114);

    doc.fillColor("#1a1a1a").fontSize(9).font("Helvetica-Bold").text("Bill To:", 48, 136);
    doc.font("Helvetica").fontSize(10).text(input.guestName, 48, 148);
    doc.fontSize(9).fillColor(muted).text(input.guestEmail, 48, 161);

    doc.fillColor("#1a1a1a").fontSize(9).font("Helvetica-Bold").text("Stay Details:", 320, 136);
    doc.font("Helvetica").fontSize(9).fillColor("#1a1a1a")
      .text(`Villa: ${input.villaName}${input.bedrooms ? ` · ${input.bedrooms}BR` : ""}`, 320, 148)
      .text(`Ref: ${input.reference}`, 320, 160)
      .text(`Check-in: ${fmtDate(input.checkIn)}  •  Check-out: ${fmtDate(input.checkOut)}`, 320, 172)
      .text(`Nights: ${nights}  •  Guests: ${input.guests}${input.bedrooms ? `  •  ${input.bedrooms}BR` : ""}`, 320, 184);

    const top = 210;
    doc.rect(48, top, 499, 22).fill(teal);
    doc.fillColor("#ffffff").fontSize(8).font("Helvetica-Bold")
      .text("DESCRIPTION", 56, top + 8, { width: 260 })
      .text("QTY", 320, top + 8, { width: 40, align: "center" })
      .text("AMOUNT", 400, top + 8, { width: 139, align: "right" });

    let y = top + 28;
    doc.fillColor("#1a1a1a").font("Helvetica").fontSize(9)
      .text(`Accommodation — ${input.villaName}${input.bedrooms ? ` · ${input.bedrooms}BR` : ""} (${nights} night${nights > 1 ? "s" : ""})`, 56, y, { width: 260 })
      .text(`${nights}`, 320, y, { width: 40, align: "center" })
      .text(fmtKES(taxable), 400, y, { width: 139, align: "right" });
    y += 14;
    doc.fillColor(muted).fontSize(7).text("VAT inclusive 16% — accommodation & services", 56, y);
    y += 18;
    doc.moveTo(48, y).lineTo(547, y).strokeColor("#e5e7eb").lineWidth(0.5).stroke();
    y += 10;

    doc.fillColor("#1a1a1a").fontSize(9).font("Helvetica")
      .text("Taxable amount", 340, y, { width: 120, align: "right" })
      .text(fmtKES(taxable), 460, y, { width: 79, align: "right" });
    y += 14;
    doc.text("VAT 16% (inclusive)", 340, y, { width: 120, align: "right" })
      .text(fmtKES(vat), 460, y, { width: 79, align: "right" });
    y += 14;
    doc.moveTo(340, y).lineTo(539, y).strokeColor("#e5e7eb").lineWidth(0.5).stroke();
    y += 8;
    doc.rect(340, y - 2, 199, 20).fill("#f9fafb");
    doc.fillColor(teal).font("Helvetica-Bold").fontSize(11)
      .text("Total Paid", 348, y + 4, { width: 110 })
      .text(fmtKES(input.amount), 460, y + 4, { width: 79, align: "right" });
    y += 30;
    doc.fillColor(muted).font("Helvetica").fontSize(7).text("All amounts in KES. VAT inclusive as per Kenya 16% standard rate.", 340, y, { width: 199, align: "right" });

    y = 420;
    doc.fillColor("#1a1a1a").font("Helvetica-Bold").fontSize(8).text("Payment", 48, y);
    doc.font("Helvetica").fontSize(8).fillColor(muted)
      .text(`Method: M-Pesa Daraja  •  Status: Paid`, 48, y + 10)
      .text(input.receiptNumber ? `Receipt: ${input.receiptNumber}` : `Reference: ${input.reference}`, 48, y + 20);

    doc.fillColor(teal).fontSize(8).font("Helvetica-Bold").text("Thank you for choosing Lobelia Pearl.", 48, 500, { align: "center", width: 499 });
    doc.fillColor(muted).font("Helvetica").fontSize(7).text("Questions? Reply to info@lobeliapearl.com — we respond within hours. Free cancellation within 48h of booking where applicable.", 48, 514, { align: "center", width: 499 });
    doc.fontSize(6).text(`Invoice ${invNumber} • Generated ${invDate.toISOString()} • This is a system-generated invoice.`, 48, 540, { align: "center", width: 499 });

    doc.end();
  });
}
