"use client";

import type { VillaReview } from "../lib/data";

type Review = VillaReview;

export default function ReviewMarquee({ reviews }: { reviews: readonly Review[] }) {
  const columns = [
    reviews.filter((_, index) => index % 3 === 0),
    reviews.filter((_, index) => index % 3 === 1),
    reviews.filter((_, index) => index % 3 === 2),
  ];

  return (
    <div className="relative mt-10 h-[32rem] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]">
      <div className="grid h-full grid-cols-1 gap-6 sm:grid-cols-3">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="review-column overflow-hidden">
            <div
              className="review-column-track space-y-6"
              style={{
                animationDuration: `${22 + columnIndex * 7}s`,
                animationDelay: `${columnIndex * -4}s`,
              }}
            >
              {[...column, ...column, ...column].map((review, index) => (
                <ReviewCard key={`${columnIndex}-${review.name}-${index}`} review={review} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-sand-light/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft shadow-sm backdrop-blur">
        More guest stories
      </p>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="rounded-3xl bg-sand-light p-6 shadow-[0_20px_50px_-35px_rgba(38,37,33,0.4)] sm:p-7">
      <div className="flex gap-1 text-gold" aria-label="5 out of 5 stars">
        {Array.from({ length: 5 }).map((_, index) => <span key={index} aria-hidden>★</span>)}
      </div>
      <blockquote className="mt-4 font-display text-[1.25rem] leading-snug text-ink-deep">
        &ldquo;{review.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 text-sm">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full font-semibold text-white" style={{ backgroundColor: review.accent }} aria-hidden>
          {review.initial}
        </span>
        <span>
          <span className="block font-bold text-ink-deep">{review.name}</span>
          <span className="block text-ink-soft">{review.date}</span>
        </span>
      </figcaption>
    </figure>
  );
}
