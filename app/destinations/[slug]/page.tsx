import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import DestinationResults from "../../components/DestinationResults";
import {
  DESTINATIONS,
  villasFor,
  getDestination,
} from "../../lib/data";

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ guests?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dest = getDestination(slug);
  if (!dest) return { title: "Stays — Lobelia Pearl" };
  return {
    title: `Villas in ${dest.name}, Kenya — Lobelia Pearl`,
    description: dest.blurb,
  };
}

export default async function DestinationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ guests?: string }>;
}) {
  const { slug } = await params;
  const dest = getDestination(slug);
  if (!dest) notFound();
  const search = searchParams ? await searchParams : {};
  const guests = Number(search.guests) || undefined;
  const stays = villasFor(dest.slug);

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
              {stays.length} stays · Jul 12 – 17{guests ? ` · ${guests} guests` : " · 2 guests"}
            </p>
          </div>

          <DestinationResults villas={stays} guests={guests} location={dest.name} />
        </div>
      </main>
      <Footer />
    </>
  );
}
