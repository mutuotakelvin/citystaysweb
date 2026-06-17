"use client";

import Link from "next/link";
import { DESTINATIONS } from "../lib/data";
import { Facebook, Instagram, XSocial, ArrowRight } from "./icons";
import Logo from "./Logo";

const COMPANY = [
  { label: "About us", href: "/#why" },
  { label: "Experiences", href: "/experiences" },
  { label: "Concierge", href: "/experiences" },
  { label: "Careers", href: "/#why" },
  { label: "Journal", href: "/journal" },
];

export default function Footer() {
  return (
    <footer className="bg-teal px-5 pb-10 pt-16 text-sand-light/80 sm:px-8 sm:pt-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          {/* Brand */}
          <div>
            <Logo tone="light" size={40} className="text-[17px]" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed">
              Extraordinary homes across Kenya, effortlessly booked. Verified
              hosts, secure payments, and a concierge in your pocket.
            </p>
            <div className="mt-6 flex gap-3">
              {[Facebook, Instagram, XSocial].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="City Stays social profile"
                  className="grid h-10 w-10 place-items-center rounded-full border border-sand-light/20 text-sand-light/90 transition-colors hover:border-terracotta hover:bg-terracotta hover:text-white cursor-pointer"
                >
                  <Icon className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <nav>
            <h3 className="eyebrow text-sand-light">Explore</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {DESTINATIONS.map((d) => (
                <li key={d.slug}>
                  <Link
                    href={`/destinations/${d.slug}`}
                    className="transition-colors hover:text-terracotta"
                  >
                    {d.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav>
            <h3 className="eyebrow text-sand-light">Company</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {COMPANY.map((c) => (
                <li key={c.label}>
                  <Link
                    href={c.href}
                    className="transition-colors hover:text-terracotta"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Newsletter */}
          <div>
            <h3 className="eyebrow text-sand-light">Stay in touch</h3>
            <p className="mt-5 max-w-xs text-sm leading-relaxed">
              New villas and quiet-season offers, monthly.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-5 flex items-center gap-2 rounded-full border border-sand-light/20 bg-teal/40 p-1.5 pl-5"
            >
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                placeholder="Email address"
                className="w-full bg-transparent text-sm text-sand-light outline-none placeholder:text-sand-light/50"
              />
              <button
                type="submit"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark cursor-pointer"
              >
                Join
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-sand-light/15 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 City Stays. Galu, Diani, Kenya.</p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Sitemap"].map((l) => (
              <a key={l} href="#" className="transition-colors hover:text-terracotta">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
