import Image from "next/image";
import Link from "next/link";
import type { Villa } from "../lib/data";
import { VILLA_INFO } from "../lib/data";
import { Star } from "./icons";

export default function ListingCard({ villa }: { villa: Villa }) {
  const info = VILLA_INFO[villa.slug];

  return (
    <Link
      href={`/villas/${villa.slug}`}
      className="reveal group grid grid-cols-1 gap-4 overflow-hidden rounded-3xl bg-sand-light p-3 ring-1 ring-ink/5 transition-shadow duration-300 hover:shadow-[0_24px_50px_-30px_rgba(38,37,33,0.4)] sm:grid-cols-[clamp(220px,32%,300px)_1fr] sm:gap-5"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
        <Image
          src={villa.image}
          alt={villa.name}
          fill
          sizes="(min-width:640px) 300px, 90vw"
          className="object-cover transition-transform duration-[1.1s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-ink-deep shadow-sm backdrop-blur">
          {villa.badge}
        </span>
      </div>

      <div className="flex flex-col py-1 pr-2 sm:py-2">
        <div className="flex items-start justify-between gap-3">
          <span className="text-sm text-ink-soft">{villa.location}</span>
          <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-ink-deep">
            <Star className="h-3.5 w-3.5 text-gold" />
            {villa.rating}{" "}
            <span className="font-normal text-ink-soft">({villa.reviews})</span>
          </span>
        </div>

        <h3 className="mt-1 font-display text-2xl font-medium leading-tight text-ink-deep">
          {villa.name}
        </h3>

        {info && (
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink-soft">
            {info.summary}
          </p>
        )}

        {info && (
          <div className="mt-3 flex flex-wrap gap-2">
            {info.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-terracotta-soft/60 px-2.5 py-1 text-xs font-medium text-terracotta-dark"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <span className="text-sm text-ink-soft">
            {villa.beds} bd · {villa.baths} ba · up to {villa.guests} guests
          </span>
          <span className="text-ink-deep">
            <span className="text-xl font-bold">${villa.price}</span>
            <span className="text-sm text-ink-soft"> / night</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
