import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Reveal from "../../components/Reveal";
import VillaCard from "../../components/VillaCard";
import { ArrowRight, MapPin, Star, ShieldCheck } from "../../components/icons";
import {
  DESTINATIONS,
  VILLAS,
  getDestination,
  villasFor,
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
  if (!dest) return { title: "Destination — City Stays" };
  return {
    title: `${dest.name} villas & homes — City Stays`,
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

  const own = villasFor(slug);
  const villas = own.length ? own : VILLAS.slice(0, 3);
  const villaHeading = own.length
    ? `Homes in ${dest.name}`
    : "Stays you might love";

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative isolate flex min-h-[78svh] flex-col justify-end overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <Image
              src={dest.hero}
              alt={`${dest.name}, Kenya`}
              fill
              priority
              sizes="100vw"
              className="slow-zoom object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/80 via-ink-deep/30 to-ink-deep/40" />
          </div>

          <div className="mx-auto w-full max-w-7xl px-5 pb-14 pt-28 sm:px-8">
            <Link
              href="/#destinations"
              className="inline-flex items-center gap-2 text-sm font-medium text-sand-light/85 transition-colors hover:text-white"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              All destinations
            </Link>
            <p className="eyebrow mt-6 flex items-center gap-3 text-sand-light/90">
              <span className="h-px w-10 bg-sand-light/60" />
              {dest.region} · Kenya
            </p>
            <h1 className="mt-4 font-display text-[clamp(3rem,8vw,5.5rem)] font-light leading-[0.98] text-white">
              {dest.name}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-sand-light/85">
              {dest.tagline}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-sand-light/90">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-terracotta" />
                {dest.villas} homes available
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-soft" />
                Verified hosts
              </span>
            </div>
          </div>
        </section>

        {/* Intro */}
        <Reveal as="section" className="bg-sand px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <h2 className="reveal font-display text-[clamp(1.8rem,3.6vw,2.8rem)] font-medium leading-[1.1] text-ink-deep">
              The City Stays guide to {dest.name}
            </h2>
            <p className="reveal max-w-xl self-center text-[1.05rem] leading-relaxed text-ink-soft">
              {dest.blurb} Our team has stayed in every home we list here, so the
              photos match the reality and the welcome is genuine. Tell us how you
              like to travel and we&apos;ll shortlist the right fit.
            </p>
          </div>
        </Reveal>

        {/* Villas */}
        <Reveal as="section" className="bg-sand px-5 pb-20 sm:px-8 lg:pb-28">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between gap-6">
              <h2 className="reveal font-display text-[clamp(1.8rem,3.6vw,2.6rem)] font-medium leading-tight text-ink-deep">
                {villaHeading}
              </h2>
              <span className="reveal hidden items-center gap-1 text-sm font-semibold text-ink-deep sm:flex">
                <Star className="h-4 w-4 text-gold" /> Top rated
              </span>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {villas.map((v) => (
                <VillaCard key={v.slug} villa={v} />
              ))}
            </div>
          </div>
        </Reveal>

        {/* Gallery */}
        <Reveal as="section" className="bg-sand px-5 pb-20 sm:px-8 lg:pb-28">
          <div className="mx-auto max-w-7xl">
            <p className="reveal eyebrow text-terracotta">A closer look</p>
            <h2 className="reveal mt-3 font-display text-[clamp(1.8rem,3.6vw,2.6rem)] font-medium leading-tight text-ink-deep">
              Inside {dest.name}
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
              {dest.gallery.map((src, i) => (
                <div
                  key={src}
                  className="reveal relative aspect-[4/5] overflow-hidden rounded-2xl"
                >
                  <Image
                    src={src}
                    alt={`${dest.name} interior ${i + 1}`}
                    fill
                    sizes="(min-width:768px) 33vw, 50vw"
                    className="object-cover transition-transform duration-[1.3s] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal as="section" className="bg-sand px-5 pb-24 sm:px-8 lg:pb-32">
          <div className="reveal mx-auto flex max-w-7xl flex-col items-start gap-6 rounded-[28px] bg-teal p-8 text-sand-light sm:p-14 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-display text-[clamp(1.9rem,4vw,3rem)] font-medium leading-tight text-white">
                Ready to stay in {dest.name}?
              </h2>
              <p className="mt-3 max-w-lg text-sand-light/85">
                Share your dates and our concierge will curate a shortlist within
                a day.
              </p>
            </div>
            <Link
              href="/#villas"
              className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-terracotta px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark cursor-pointer"
            >
              Start your search
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
