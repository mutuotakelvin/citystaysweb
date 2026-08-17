import type { Metadata } from "next";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Reveal from "../components/Reveal";
import { ARTICLES } from "../lib/data";
import { ArrowRight } from "../components/icons";

export const metadata: Metadata = {
  title: "Journal — Lobelia Pearl",
  description:
    "Guides, stories and tips for travelling the Kenyan coast and highlands — from the Lobelia Pearl team.",
};

export default function JournalPage() {
  const [featured, ...rest] = ARTICLES;

  return (
    <>
      <Header variant="solid" />
      <main className="bg-sand pb-24 pt-[88px]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal as="div" className="max-w-3xl pt-10 sm:pt-14">
            <p className="reveal eyebrow text-terracotta">The Journal</p>
            <h1 className="reveal mt-3 font-display text-[clamp(2.4rem,6vw,4.2rem)] font-medium leading-[1.02] text-ink-deep">
              Stories from the coast &amp; beyond
            </h1>
            <p className="reveal mt-5 text-lg leading-relaxed text-ink-soft">
              Guides, local secrets and slow-travel inspiration from the team
              who visits every home we list.
            </p>
          </Reveal>

          {/* Featured */}
          <Reveal
            as="article"
            className="group mt-12 grid items-center gap-8 overflow-hidden rounded-[28px] bg-sand-light p-3 ring-1 ring-ink/5 lg:grid-cols-2 lg:p-4"
          >
            <div className="reveal relative aspect-[16/11] overflow-hidden rounded-2xl">
              <Image
                src={featured.image}
                alt={featured.title}
                fill
                priority
                sizes="(min-width:1024px) 50vw, 90vw"
                className="object-cover transition-transform duration-[1.3s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
              />
            </div>
            <div className="reveal px-4 pb-6 lg:px-8">
              <p className="eyebrow text-terracotta">{featured.category}</p>
              <h2 className="mt-3 font-display text-[clamp(1.8rem,3.4vw,2.8rem)] font-medium leading-[1.08] text-ink-deep">
                {featured.title}
              </h2>
              <p className="mt-4 max-w-prose leading-relaxed text-ink-soft">
                {featured.excerpt}
              </p>
              <div className="mt-6 flex items-center gap-4 text-sm text-ink-soft">
                <span>{featured.date}</span>
                <span className="h-1 w-1 rounded-full bg-ink-soft/50" />
                <span>{featured.read}</span>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-terracotta">
                Read story
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Reveal>

          {/* Grid */}
          <Reveal
            as="div"
            className="mt-12 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
            stagger={0.08}
          >
            {rest.map((a) => (
              <article key={a.slug} className="reveal group flex flex-col">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                  <Image
                    src={a.image}
                    alt={a.title}
                    fill
                    sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 90vw"
                    className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                </div>
                <p className="mt-4 eyebrow text-terracotta">{a.category}</p>
                <h3 className="mt-2 font-display text-2xl font-medium leading-tight text-ink-deep">
                  {a.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                  {a.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-3 text-sm text-ink-soft">
                  <span>{a.date}</span>
                  <span className="h-1 w-1 rounded-full bg-ink-soft/50" />
                  <span>{a.read}</span>
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
