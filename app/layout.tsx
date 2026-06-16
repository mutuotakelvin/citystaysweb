import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope, Kaushan_Script } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const kaushan = Kaushan_Script({
  variable: "--font-kaushan",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "City Stays — Extraordinary homes across Kenya",
  description:
    "Handpicked villas and homes along the Kenyan coast and beyond — verified hosts, effortless booking, and the kind of quiet luxury you remember for years.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${manrope.variable} ${kaushan.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-sand text-ink">{children}</body>
    </html>
  );
}
