import Link from "next/link";
import Reveal from "./Reveal";
import VillaCard from "./VillaCard";
import { VILLAS } from "../lib/data";
import { ArrowRight } from "./icons";

export default function FeaturedVillas() {
  return (
    <Reveal
      as="section"
      id="villas"
      className="bg-sand px-5 pb-20 pt-28 sm:px-8 lg:pb-28 lg:pt-36"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="reveal eyebrow text-terracotta">Featured villas</p>
            <h2 className="reveal mt-3 max-w-[14ch] font-display text-[clamp(2.1rem,4.5vw,3.4rem)] font-medium leading-[1.05] text-ink-deep">
              Stays worth crossing oceans for
            </h2>
          </div>
          <Link
            href="/destinations/diani"
            className="reveal group inline-flex w-fit items-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink-deep transition-colors hover:border-terracotta hover:text-terracotta cursor-pointer"
          >
            View all villas
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {VILLAS.map((v) => (
            <VillaCard key={v.slug} villa={v} />
          ))}
        </div>
      </div>
    </Reveal>
  );
}
