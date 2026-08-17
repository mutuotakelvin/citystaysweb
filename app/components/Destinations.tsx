import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";
import { DESTINATIONS, villasFor } from "../lib/data";

export default function Destinations() {
  return (
    <Reveal
      as="section"
      id="destinations"
      className="bg-sand px-5 py-20 sm:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="reveal eyebrow text-terracotta">Popular destinations</p>
          <h2 className="reveal mx-auto mt-3 max-w-[18ch] font-display text-[clamp(2.1rem,4.5vw,3.4rem)] font-medium leading-[1.05] text-ink-deep">
            Find your corner of Kenya
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {DESTINATIONS.map((d) => (
            <Link
              key={d.slug}
              href={`/destinations/${d.slug}`}
              className="reveal group relative block aspect-[3/4] overflow-hidden rounded-2xl"
            >
              <Image
                src={d.card}
                alt={d.name}
                fill
                sizes="(min-width:1024px) 23vw, (min-width:768px) 31vw, 45vw"
                className="object-cover transition-transform duration-[1.3s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-ink-deep/80 via-ink-deep/20 to-transparent" />
              <span className="absolute right-3 top-3 rounded-full bg-white/15 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-wider text-white backdrop-blur-sm ring-1 ring-white/25">
                {d.region}
              </span>
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <h3 className="font-display text-2xl font-medium leading-none text-white sm:text-3xl">
                  {d.name}
                </h3>
                <p className="mt-1.5 text-sm text-white/80">
                  {villasFor(d.slug).length
                    ? `${villasFor(d.slug).length} villas`
                    : "Coming soon"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
