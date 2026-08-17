"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NAV_LINKS } from "../lib/data";
import { Menu, Close, ArrowRight } from "./icons";
import Logo from "./Logo";

export default function Header({
  variant = "overlay",
}: {
  /** "overlay" sits transparent over a dark hero; "solid" is for light pages. */
  variant?: "overlay" | "solid";
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Light (white) text only when floating transparently over a dark hero.
  const light = variant === "overlay" && !scrolled;
  const showBg = variant === "solid" || scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        showBg
          ? "bg-sand-light/85 backdrop-blur-md shadow-[0_1px_0_0_rgba(64,60,52,0.08)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        {/* Logo */}
        <Link href="/" aria-label="Lobelia Pearl home">
          <Logo
            tone={light ? "light" : "dark"}
            size={34}
            className="text-[16px]"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className={`relative text-[15px] font-medium transition-colors hover:text-terracotta after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-terracotta after:transition-all after:duration-300 hover:after:w-full ${
                light
                  ? "text-white/90 [text-shadow:0_1px_10px_rgba(20,18,15,0.45)]"
                  : "text-ink/90"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <span
            className={`hidden text-sm font-medium md:inline ${
              light
                ? "text-white/80 [text-shadow:0_1px_10px_rgba(20,18,15,0.45)]"
                : "text-ink/70"
            }`}
          >
            Eng
          </span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2.5 rounded-full border border-ink/12 bg-sand-light/80 py-1.5 pl-3.5 pr-1.5 shadow-sm backdrop-blur transition-shadow hover:shadow-md cursor-pointer"
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu className="h-4 w-4 text-ink" />
            <span className="grid h-8 w-8 place-items-center rounded-full bg-teal text-sm font-semibold text-sand-light">
              A
            </span>
          </button>
        </div>
      </div>
    </header>

      {/* Mobile / overlay menu — rendered OUTSIDE <header> so the header's
          backdrop-blur (a backdrop-filter) doesn't become its containing block
          and clamp this fixed overlay to the header strip. */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-ink-deep/40 backdrop-blur-sm"
        />
        <div
          className={`absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-sand-light px-7 pb-10 pt-6 shadow-2xl transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-display text-2xl font-semibold text-ink-deep">
              Menu
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-full border border-ink/12 text-ink cursor-pointer hover:bg-sand-deep"
              aria-label="Close menu"
            >
              <Close className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-8 flex flex-col">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-sand-line py-4 font-display text-2xl text-ink-deep transition-colors hover:text-terracotta"
              >
                {l.label}
                <ArrowRight className="h-5 w-5 text-terracotta" />
              </Link>
            ))}
          </nav>

          <Link
            href="/#cta"
            onClick={() => setOpen(false)}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-terracotta px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark cursor-pointer"
          >
            Start your search
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
