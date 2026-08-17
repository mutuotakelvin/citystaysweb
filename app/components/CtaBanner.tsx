"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { staticMode } from "../lib/motion";
import { ArrowRight } from "./icons";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function CtaBanner() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Reduced motion / static: leave server-rendered content in place.
      if (staticMode()) return;

      gsap.from(".cta-reveal", {
        scrollTrigger: { trigger: root.current, start: "top 80%", once: true },
        y: 28,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.1,
      });

      gsap.fromTo(
        ".cta-img",
        { yPercent: -12 },
        {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} id="cta" className="bg-sand px-5 pb-24 sm:px-8 lg:pb-32">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/photos/p21.jpg"
            alt="A Lobelia Pearl villa courtyard"
            fill
            sizes="100vw"
            className="cta-img scale-125 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-deep/85 via-ink-deep/60 to-ink-deep/25" />
        </div>

        <div className="relative z-10 max-w-2xl px-7 py-16 sm:px-14 sm:py-24 lg:py-28">
          <p className="cta-reveal eyebrow text-sand-light/90">Your next escape</p>
          <h2 className="cta-reveal mt-4 font-display text-[clamp(2.2rem,5vw,3.8rem)] font-medium leading-[1.05] text-white">
            The sea is closer than you think
          </h2>
          <p className="cta-reveal mt-5 max-w-md text-[1.05rem] leading-relaxed text-sand-light/85">
            Tell us your dates and let our concierge curate a shortlist of homes
            made for the way you travel.
          </p>
          <div className="cta-reveal mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/#villas"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-terracotta px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-terracotta/25 transition-colors hover:bg-terracotta-dark cursor-pointer"
            >
              Start your search
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/#cta"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10 cursor-pointer"
            >
              List your villa
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
