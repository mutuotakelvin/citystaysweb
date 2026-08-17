import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Reveal from "../../components/Reveal";
import Gallery from "../../components/villa/Gallery";
import BookingCard from "../../components/villa/BookingCard";
import AvailabilityCalendar from "../../components/villa/AvailabilityCalendar";
import {
  VILLAS,
  getVilla,
  getDestination,
  villaGallery,
  villaDescription,
  VILLA_HOSTS,
  VILLA_HIGHLIGHTS,
  VILLA_AMENITIES,
  TOTAL_AMENITIES,
  RATING_BARS,
  VILLA_REVIEWS,
  DEFAULT_NIGHTS,
} from "../../lib/data";
import {
  Star,
  ShieldCheck,
  MapPin,
  Share,
  Heart,
  Waves,
  Snowflake,
  ChefHat,
  Bath,
  Leaf,
  Car,
  Sparkles,
  Wifi,
  HomeIcon,
  Clock,
} from "../../components/icons";

export function generateStaticParams() {
  return VILLAS.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const v = getVilla(slug);
  if (!v) return { title: "Villa — Lobelia Pearl" };
  return {
    title: `${v.name}, ${v.location} — Lobelia Pearl`,
    description: `${v.beds} bd · ${v.baths} ba · up to ${v.guests} guests in ${v.location}. From $${v.price}/night.`,
  };
}

const amenityIcon: Record<string, typeof Wifi> = {
  "Fast Wi-Fi": Wifi,
  "Private infinity pool": Waves,
  "Air conditioning": Snowflake,
  "Full chef's kitchen": ChefHat,
  "En-suite bathrooms": Bath,
  "Tropical garden": Leaf,
  "Secure parking": Car,
  "Daily housekeeping": Sparkles,
};

const highlightIcon: Record<string, typeof Wifi> = {
  pool: Waves,
  cottage: HomeIcon,
  clock: Clock,
};

export default async function VillaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const villa = getVilla(slug);
  if (!villa) notFound();

  const dest = getDestination(villa.destination);
  const host = VILLA_HOSTS[villa.slug] ?? "Lobelia Pearl";
  const gallery = villaGallery(villa);
  const description = villaDescription(villa);

  return (
    <>
      <Header variant="solid" />
      <main className="bg-sand pb-24 pt-[88px]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {/* Breadcrumb */}
          <nav className="flex flex-wrap items-center gap-2 pt-6 text-sm text-ink-soft">
            <Link href="/" className="hover:text-terracotta">
              Home
            </Link>
            <span>/</span>
            <Link
              href={`/destinations/${villa.destination}`}
              className="hover:text-terracotta"
            >
              {villa.location}
            </Link>
            <span>/</span>
            <span className="text-ink-deep">{villa.name}</span>
          </nav>

          {/* Title + meta */}
          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-[clamp(2.2rem,5vw,3.6rem)] font-medium leading-[1.05] text-ink-deep">
                {villa.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <span className="flex items-center gap-1.5 font-semibold text-ink-deep">
                  <Star className="h-4 w-4 text-gold" />
                  {villa.rating} · {villa.reviews} reviews
                </span>
                <span className="flex items-center gap-1.5 font-medium text-teal-soft">
                  <ShieldCheck className="h-4 w-4" />
                  Superhost
                </span>
                <span className="flex items-center gap-1.5 text-ink-soft">
                  <MapPin className="h-4 w-4 text-terracotta" />
                  {villa.location}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ActionButton icon={<Share className="h-4 w-4" />} label="Share" />
              <ActionButton icon={<Heart className="h-4 w-4" />} label="Save" />
            </div>
          </div>

          {/* Gallery */}
          <div className="mt-6">
            <Gallery images={gallery} alt={villa.name} />
          </div>

          {/* Two-column body */}
          <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_minmax(340px,400px)] lg:gap-16">
            {/* LEFT */}
            <div>
              {/* Host */}
              <Reveal as="div" className="flex items-start justify-between gap-4">
                <div className="reveal">
                  <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-medium text-ink-deep">
                    Entire villa hosted by {host}
                  </h2>
                  <p className="mt-1.5 text-ink-soft">
                    {villa.beds} bd · {villa.baths} ba · up to {villa.guests} guests
                  </p>
                </div>
                <span className="reveal grid h-14 w-14 shrink-0 place-items-center rounded-full bg-teal font-display text-xl font-semibold text-sand-light">
                  {host[0]}
                </span>
              </Reveal>

              {/* Highlights */}
              <Reveal as="ul" className="mt-8 space-y-6 border-t border-sand-line pt-8">
                {VILLA_HIGHLIGHTS.map((h) => {
                  const Icon = highlightIcon[h.icon] ?? HomeIcon;
                  return (
                    <li key={h.title} className="reveal flex gap-4">
                      <Icon className="mt-0.5 h-6 w-6 shrink-0 text-teal-soft" />
                      <div>
                        <p className="font-semibold text-ink-deep">{h.title}</p>
                        <p className="text-sm text-ink-soft">{h.body}</p>
                      </div>
                    </li>
                  );
                })}
              </Reveal>

              {/* Description */}
              <Reveal as="div" className="mt-8 space-y-4 border-t border-sand-line pt-8">
                {description.map((p, i) => (
                  <p key={i} className="reveal leading-relaxed text-ink/90">
                    {p}
                  </p>
                ))}
              </Reveal>

              {/* Amenities */}
              <Reveal as="div" className="mt-8 border-t border-sand-line pt-8">
                <h2 className="reveal font-display text-[clamp(1.5rem,3vw,2rem)] font-medium text-ink-deep">
                  What this place offers
                </h2>
                <div className="reveal mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  {VILLA_AMENITIES.map((a) => {
                    const Icon = amenityIcon[a] ?? Sparkles;
                    return (
                      <div key={a} className="flex items-center gap-3.5 text-ink">
                        <Icon className="h-5 w-5 shrink-0 text-ink-deep" />
                        {a}
                      </div>
                    );
                  })}
                </div>
                <button
                  type="button"
                  className="reveal mt-8 rounded-full border border-ink/20 px-6 py-3 text-sm font-semibold text-ink-deep transition-colors hover:border-terracotta hover:text-terracotta cursor-pointer"
                >
                  Show all {TOTAL_AMENITIES} amenities
                </button>
              </Reveal>

              {/* Availability */}
              <Reveal as="div" className="mt-10 border-t border-sand-line pt-8">
                <h2 className="reveal font-display text-[clamp(1.5rem,3vw,2rem)] font-medium text-ink-deep">
                  Availability
                </h2>
                <p className="reveal mt-1 text-ink-soft">
                  {DEFAULT_NIGHTS} nights · Jul 12 – Jul 17
                </p>
                <div className="reveal mt-6">
                  <AvailabilityCalendar />
                </div>
              </Reveal>

              {/* Map */}
              <Reveal as="div" className="mt-10 border-t border-sand-line pt-8">
                <h2 className="reveal font-display text-[clamp(1.5rem,3vw,2rem)] font-medium text-ink-deep">
                  Where you&apos;ll be
                </h2>
                <p className="reveal mt-1 text-ink-soft">{villa.location}</p>
                <div className="reveal relative mt-6 h-[320px] overflow-hidden rounded-3xl bg-teal-mist">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(22,58,65,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(22,58,65,0.10)_1px,transparent_1px)] bg-[size:38px_38px]" />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-terracotta/25">
                      <span className="h-5 w-5 rounded-full border-2 border-white bg-terracotta" />
                    </span>
                  </div>
                  <span className="absolute bottom-5 left-5 font-display text-xl italic text-teal">
                    {dest?.name === villa.location ? villa.location : `${dest?.name ?? ""} Beach`}
                  </span>
                </div>
              </Reveal>

              {/* Reviews */}
              <Reveal as="div" className="mt-10 border-t border-sand-line pt-8">
                <h2 className="reveal flex items-center gap-2 font-display text-[clamp(1.5rem,3vw,2rem)] font-medium text-ink-deep">
                  <Star className="h-5 w-5 text-gold" />
                  {villa.rating} · {villa.reviews} reviews
                </h2>

                <div className="reveal mt-6 grid gap-x-12 gap-y-4 sm:grid-cols-2">
                  {RATING_BARS.map((r) => (
                    <div key={r.label} className="flex items-center gap-3 text-sm">
                      <span className="w-20 shrink-0 text-ink">{r.label}</span>
                      <span className="h-1 flex-1 rounded-full bg-sand-deep">
                        <span
                          className="block h-full rounded-full bg-ink-deep"
                          style={{ width: `${(r.score / 5) * 100}%` }}
                        />
                      </span>
                      <span className="w-8 shrink-0 text-right font-semibold text-ink-deep">
                        {r.score.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-10 grid gap-x-12 gap-y-9 sm:grid-cols-2">
                  {VILLA_REVIEWS.map((rev) => (
                    <figure key={rev.name} className="reveal">
                      <figcaption className="flex items-center gap-3">
                        <span
                          className="grid h-10 w-10 place-items-center rounded-full text-sm font-semibold text-white"
                          style={{ backgroundColor: rev.accent }}
                          aria-hidden
                        >
                          {rev.initial}
                        </span>
                        <span className="text-sm">
                          <span className="block font-bold text-ink-deep">
                            {rev.name}
                          </span>
                          <span className="block text-ink-soft">{rev.date}</span>
                        </span>
                      </figcaption>
                      <blockquote className="mt-3 leading-relaxed text-ink/90">
                        {rev.quote}
                      </blockquote>
                    </figure>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* RIGHT — sticky booking card */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <BookingCard villa={villa} />
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function ActionButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-ink-deep underline-offset-4 transition-colors hover:bg-sand-deep hover:underline cursor-pointer"
    >
      {icon}
      {label}
    </button>
  );
}
