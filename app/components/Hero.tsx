"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { HERO_SLIDES } from "../lib/data";
import { staticMode } from "../lib/motion";
import SearchBar from "./SearchBar";

gsap.registerPlugin(useGSAP);

const HOLD = 4.4; // seconds a slide rests
const FADE = 1.5; // crossfade duration

export default function Hero() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  useGSAP(
    () => {
      const layers = gsap.utils.toArray<HTMLElement>(".hero-slide", root.current);
      gsap.set(layers, { autoAlpha: 0 });
      gsap.set(layers[0], { autoAlpha: 1 });

      // Reduced motion: leave the (server-rendered) content visible, show the
      // first slide, and skip every animation.
      if (staticMode()) return;

      const kenBurns = (layer: HTMLElement) => {
        const img = layer.querySelector(".hero-img");
        if (img) gsap.fromTo(img, { scale: 1.04 }, { scale: 1.18, duration: HOLD + FADE, ease: "none" });
      };
      kenBurns(layers[0]);

      // Entrance for the foreground content.
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .from(".hero-eyebrow", { y: 20, autoAlpha: 0, duration: 0.7 })
        .from(".hero-line-inner", { yPercent: 115, duration: 1, stagger: 0.12 }, "-=0.3")
        .from(".hero-sub", { y: 20, autoAlpha: 0, duration: 0.8 }, "-=0.5")
        .from(".hero-search", { y: 36, autoAlpha: 0, duration: 0.9 }, "-=0.45");
      // Note: the slide indicator (label + dots) is intentionally NOT part of
      // the entrance animation — it must stay visible at all times.

      if (layers.length < 2) return;

      const go = (to: number) => {
        const incoming = layers[to];
        // Keep every slide below the gradient scrim: reset all to 0 and lift
        // only the incoming slide to 1 so it crossfades above the current one.
        layers.forEach((l) => (l.style.zIndex = "0"));
        incoming.style.zIndex = "1";
        kenBurns(incoming);
        gsap.fromTo(
          incoming,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: FADE, ease: "power2.inOut" },
        );
        activeRef.current = to;
        setActive(to);
      };

      const master = gsap.timeline({ repeat: -1 });
      HERO_SLIDES.forEach((_, i) => {
        const next = (i + 1) % HERO_SLIDES.length;
        master.to({}, { duration: HOLD });
        master.call(() => go(next));
        master.to({}, { duration: FADE });
      });

      return () => master.kill();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative z-20 flex min-h-[90svh] flex-col"
    >
      {/* Background slides (clipped here so the search bar below can overflow) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {HERO_SLIDES.map((s, i) => (
          <div
            key={s.place}
            className="hero-slide absolute inset-0"
            style={{ opacity: i === 0 ? 1 : 0 }}
          >
            <Image
              src={s.image}
              alt={`A Lobelia Pearl home in ${s.place}`}
              fill
              priority={i === 0}
              sizes="100vw"
              className="hero-img h-full w-full object-cover"
            />
          </div>
        ))}
        {/* Legibility wash — sits above every slide (z-[3] > slide z 0/1) */}
        <div className="absolute inset-0 z-[3] bg-gradient-to-r from-ink-deep/90 via-ink-deep/55 via-55% to-transparent" />
        <div className="absolute inset-0 z-[3] bg-gradient-to-t from-ink-deep/75 via-ink-deep/15 to-ink-deep/25" />
      </div>

      {/* Foreground */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pb-6 pt-28 sm:px-8 sm:pt-32">
        <div className="flex flex-1 flex-col justify-center pt-10 [text-shadow:0_2px_28px_rgba(20,18,15,0.65)]">
          <p className="hero-eyebrow eyebrow flex items-center gap-3 text-sand-light/90">
            <span className="h-px w-10 bg-sand-light/60" />
            Handpicked stays across Kenya
          </p>

          <h1 className="mt-5 max-w-[16ch] font-display text-[clamp(3rem,8vw,6.2rem)] font-light leading-[0.98] text-white">
            <span className="block overflow-hidden pb-[0.08em]">
              <span className="hero-line-inner block">Where Kenya</span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <span className="hero-line-inner block italic">feels like home</span>
            </span>
          </h1>

          <p className="hero-sub mt-7 max-w-xl text-[1.05rem] leading-relaxed text-sand-light/95">
            Extraordinary homes along the coast and in the highlands — verified
            hosts, effortless booking, and the kind of quiet luxury you remember
            for years.
          </p>

          {/* Live destination label */}
          <div className="mt-9 flex items-center gap-4">
            <div key={active} className="rise-in">
              <p className="font-display text-2xl leading-none text-white">
                {HERO_SLIDES[active].place}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-sand-light/85">
                {HERO_SLIDES[active].caption}
              </p>
            </div>
            <div className="flex gap-2">
              {HERO_SLIDES.map((s, i) => (
                <span
                  key={s.place}
                  className={`hero-dot h-1.5 rounded-full transition-all duration-500 ${
                    i === active ? "w-7 bg-terracotta" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Floating search — overlaps the next section */}
        <div className="hero-search relative z-20 mx-auto -mb-16 mt-12 w-full max-w-6xl lg:-mb-20">
          <SearchBar />
        </div>
      </div>
    </section>
  );
}
