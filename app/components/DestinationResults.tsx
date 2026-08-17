"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Villa } from "../lib/data";
import { VILLA_INFO } from "../lib/data";
import ListingCard from "./ListingCard";
import DestinationMap from "./DestinationMap";
import Reveal from "./Reveal";
import { Filter } from "./icons";

const FILTERS = ["Price", "Bedrooms", "Beachfront", "Private pool", "Superhost"];

export default function DestinationResults({
  villas,
  guests,
  location,
}: {
  villas: Villa[];
  guests?: number;
  location: string;
}) {
  const [filter, setFilter] = useState("");
  const [view, setView] = useState<"list" | "map">("list");

  const results = useMemo(() => {
    let next = guests ? villas.filter((villa) => villa.guests >= guests) : villas;
    if (filter === "Bedrooms") next = next.filter((villa) => villa.beds >= 4);
    if (filter === "Beachfront") next = next.filter((villa) => villa.badge === "Beachfront");
    if (filter === "Private pool") {
      next = next.filter((villa) => VILLA_INFO[villa.slug]?.tags.includes("Private pool"));
    }
    if (filter === "Superhost") next = next.filter((villa) => villa.rating >= 4.9);
    if (filter === "Price") next = [...next].sort((a, b) => a.price - b.price);
    return next;
  }, [filter, guests, villas]);

  if (!villas.length) {
    return (
      <div className="mt-10 overflow-hidden rounded-[2rem] bg-teal px-7 py-12 text-sand-light sm:px-12 sm:py-16">
        <p className="eyebrow text-terracotta-soft">A new chapter is taking shape</p>
        <h2 className="mt-4 max-w-lg font-display text-[clamp(2rem,4vw,3.2rem)] font-medium leading-tight">
          We&apos;re curating beautiful homes in {location}.
        </h2>
        <p className="mt-5 max-w-xl leading-relaxed text-sand-light/75">
          There are no stays available here just yet, but our local team is working
          on it. In the meantime, discover one of our handpicked homes on the coast.
        </p>
        <Link
          href="/destinations/diani"
          className="mt-8 inline-flex rounded-full bg-terracotta px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark"
        >
          Explore Diani stays
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex max-w-full gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            className="flex shrink-0 items-center gap-2 rounded-full border border-ink/15 bg-sand-light px-4 py-2 text-sm font-semibold text-ink-deep cursor-pointer"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          {FILTERS.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setFilter((current) => (current === name ? "" : name))}
              aria-pressed={filter === name}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                filter === name
                  ? "border-ink-deep bg-ink-deep text-white"
                  : "border-ink/15 bg-sand-light text-ink-deep hover:border-terracotta hover:text-terracotta"
              }`}
            >
              {name === "Price" && filter === "Price" ? "Price: lowest" : name}
            </button>
          ))}
        </div>

        <div className="flex shrink-0 rounded-full border border-ink/12 bg-sand-light p-1">
          {(["list", "map"] as const).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setView(name)}
              aria-pressed={view === name}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors cursor-pointer ${
                view === name ? "bg-ink-deep text-sand-light" : "text-ink-soft"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className={`mt-8 grid gap-8 lg:gap-10 ${view === "map" ? "lg:grid-cols-1" : "lg:grid-cols-2"}`}>
        {view === "list" && (
          <Reveal as="div" className="flex flex-col gap-5" stagger={0.07}>
            {results.length ? (
              results.map((villa) => <ListingCard key={villa.slug} villa={villa} />)
            ) : (
              <p className="rounded-3xl bg-sand-light p-8 text-ink-soft">
                No homes match those filters. Try widening your search.
              </p>
            )}
          </Reveal>
        )}
        <aside className={view === "list" ? "hidden lg:block" : "block"}>
          <div className="sticky top-24 h-[calc(100vh-7.5rem)] min-h-[420px]">
            <DestinationMap villas={results} location={location} />
          </div>
        </aside>
      </div>
    </>
  );
}
