import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Reveal from "../../components/Reveal";
import ListingCard from "../../components/ListingCard";
import DestinationMap from "../../components/DestinationMap";
import { Filter } from "../../components/icons";
import {
  DESTINATIONS,
  VILLAS,
  getDestination,
  LISTING_FILTERS,
} from "../../lib/data";

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dest = getDestination(slug);
  if (!dest) return { title: "Stays — City Stays" };
  return {
    title: `Villas in ${dest.name}, Kenya — City Stays`,
    description: dest.blurb,
  };
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dest = getDestination(slug);
  if (!dest) notFound();

  // The listing surfaces our full collection under the chosen destination.
  const stays = VILLAS;

  return (
    <>
      <Header variant="solid" />
      <main className="bg-sand pb-24 pt-[88px]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {/* Title */}
          <div className="flex flex-col gap-2 pt-6 sm:flex-row sm:items-baseline sm:gap-5">
            <h1 className="font-display text-[clamp(2rem,4.5vw,3.2rem)] font-medium leading-tight text-ink-deep">
              Villas in {dest.name}, Kenya
            </h1>
            <p className="text-ink-soft">
              {stays.length} stays · Jul 12 – 17 · 2 guests
            </p>
          </div>

          {/* Filters + view toggle */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                className="flex shrink-0 items-center gap-2 rounded-full border border-ink/15 bg-sand-light px-4 py-2 text-sm font-semibold text-ink-deep transition-colors hover:border-ink/30 cursor-pointer"
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
              {LISTING_FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  className="shrink-0 rounded-full border border-ink/15 bg-sand-light px-4 py-2 text-sm font-medium text-ink-deep transition-colors hover:border-terracotta hover:text-terracotta cursor-pointer"
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="hidden shrink-0 rounded-full border border-ink/12 bg-sand-light p-1 sm:flex">
              <span className="rounded-full bg-ink-deep px-4 py-1.5 text-sm font-semibold text-sand-light">
                List
              </span>
              <span className="px-4 py-1.5 text-sm font-medium text-ink-soft">
                Map
              </span>
            </div>
          </div>

          {/* Split: list + map */}
          <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-10">
            <Reveal as="div" className="flex flex-col gap-5" stagger={0.07}>
              {stays.map((v) => (
                <ListingCard key={v.slug} villa={v} />
              ))}
            </Reveal>

            <aside className="hidden lg:block">
              <div className="sticky top-24 h-[calc(100vh-7.5rem)]">
                <DestinationMap villas={stays} />
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
