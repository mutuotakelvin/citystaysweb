import Reveal from "./Reveal";
import { TESTIMONIALS } from "../lib/data";
import { Star } from "./icons";

export default function Testimonials() {
  return (
    <Reveal as="section" id="stories" className="bg-sand px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="reveal eyebrow text-terracotta">Loved by travellers</p>
          <h2 className="reveal mx-auto mt-3 font-display text-[clamp(2.1rem,4.5vw,3.4rem)] font-medium leading-[1.05] text-ink-deep">
            Stories from our guests
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="reveal flex flex-col rounded-3xl bg-sand-light p-7 shadow-[0_20px_50px_-35px_rgba(38,37,33,0.4)] sm:p-8"
            >
              <div className="flex gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4" />
                ))}
              </div>
              <blockquote className="mt-5 flex-1 font-display text-[1.4rem] leading-snug text-ink-deep">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3.5">
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: t.accent }}
                  aria-hidden
                >
                  {t.initial}
                </span>
                <span className="text-sm">
                  <span className="block font-bold text-ink-deep">{t.name}</span>
                  <span className="block text-ink-soft">
                    {t.stay} · {t.date}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
