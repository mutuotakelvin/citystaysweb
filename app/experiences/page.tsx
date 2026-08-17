import type { Metadata } from "next";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Reveal from "../components/Reveal";
import { EXPERIENCES, formatKES } from "../lib/data";
import { MapPin, Clock } from "../components/icons";

export const metadata: Metadata = {
  title: "Experiences — Lobelia Pearl",
  description:
    "Dhow cruises, private chefs, marine parks and highland rides — experiences our concierge arranges around your stay.",
};

export default function ExperiencesPage() {
  return (
    <>
      <Header variant="solid" />
      <main className="bg-sand pb-24 pt-[88px]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal as="div" className="max-w-3xl pt-10 sm:pt-14">
            <p className="reveal eyebrow text-terracotta">Curated experiences</p>
            <h1 className="reveal mt-3 font-display text-[clamp(2.4rem,6vw,4.2rem)] font-medium leading-[1.02] text-ink-deep">
              Designed around your stay
            </h1>
            <p className="reveal mt-5 text-lg leading-relaxed text-ink-soft">
              From sunset dhows to private chefs, our concierge curates each
              moment and books it before you arrive — so your only job is to
              show up.
            </p>
          </Reveal>

          <Reveal
            as="div"
            className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3"
            stagger={0.08}
          >
            {EXPERIENCES.map((x) => (
              <article
                key={x.title}
                className="reveal group flex flex-col overflow-hidden rounded-3xl bg-sand-light ring-1 ring-ink/5 transition-shadow duration-300 hover:shadow-[0_24px_50px_-30px_rgba(38,37,33,0.4)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={x.image}
                    alt={x.title}
                    fill
                    sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 90vw"
                    className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-ink-deep shadow-sm backdrop-blur">
                    <MapPin className="h-3.5 w-3.5 text-terracotta" />
                    {x.place}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-2xl font-medium leading-tight text-ink-deep">
                    {x.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                    {x.blurb}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-sand-line pt-4 text-sm">
                    <span className="flex items-center gap-1.5 text-ink-soft">
                      <Clock className="h-4 w-4" />
                      {x.duration}
                    </span>
                    <span className="font-semibold text-ink-deep">
                      From {formatKES(x.from)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </Reveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
