"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Villa } from "../lib/data";
import { formatKES } from "../lib/data";
import { Heart, Star, MapPin } from "./icons";

export default function VillaCard({
  villa,
  sizes = "(min-width:1024px) 30vw, (min-width:640px) 45vw, 90vw",
}: {
  villa: Villa;
  sizes?: string;
}) {
  const [liked, setLiked] = useState(false);

  return (
    <article className="reveal group relative flex flex-col">
      <Link
        href={`/villas/${villa.slug}`}
        className="relative block aspect-[4/3] overflow-hidden rounded-2xl"
      >
        <Image
          src={villa.image}
          alt={villa.name}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-ink-deep/15 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-ink-deep shadow-sm backdrop-blur">
          {villa.badge}
        </span>
      </Link>

      <button
        type="button"
        aria-label={liked ? "Remove from saved" : "Save villa"}
        aria-pressed={liked}
        onClick={() => setLiked((v) => !v)}
        className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur transition-transform hover:scale-110 cursor-pointer"
      >
        <Heart
          className={`h-4.5 w-4.5 transition-colors ${
            liked ? "fill-terracotta text-terracotta" : "text-ink"
          }`}
        />
      </button>

      <div className="mt-4 flex flex-col">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-sm text-ink-soft">
            <MapPin className="h-4 w-4 text-terracotta" />
            {villa.location}
          </span>
          <span className="flex items-center gap-1 text-sm font-semibold text-ink-deep">
            <Star className="h-3.5 w-3.5 text-gold" />
            {villa.rating}
          </span>
        </div>

        <h3 className="mt-2 font-display text-2xl font-medium leading-tight text-ink-deep">
          {villa.name}
        </h3>

        <p className="mt-1.5 text-sm text-ink-soft">
          {villa.beds} bd · {villa.baths} ba · up to {villa.guests} guests
        </p>

        <div className="mt-4 flex items-end justify-between border-t border-sand-line pt-4">
          <p className="text-ink-deep">
            <span className="text-xl font-bold">{formatKES(villa.price)}</span>
            <span className="text-sm text-ink-soft"> / night</span>
          </p>
          <span className="text-sm font-medium text-terracotta">
            {villa.reviews} reviews
          </span>
        </div>
      </div>
    </article>
  );
}
