"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Close, Grid } from "../icons";

export default function Gallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [hero, ...rest] = images;
  const small = rest.slice(0, 4);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") setActiveIndex((index) => (index - 1 + images.length) % images.length);
      if (event.key === "ArrowRight") setActiveIndex((index) => (index + 1) % images.length);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [images.length, lightboxOpen]);

  function openAt(index: number) {
    setActiveIndex(index);
    setLightboxOpen(true);
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:grid-rows-2 sm:gap-3 sm:h-[460px] lg:h-[560px]">
      {/* Hero */}
      <div
        className="relative h-72 cursor-pointer overflow-hidden rounded-2xl sm:col-span-2 sm:row-span-2 sm:h-auto"
        onClick={() => openAt(0)}
        onKeyDown={(event) => event.key === "Enter" && openAt(0)}
        role="button"
        tabIndex={0}
        aria-label={`Open ${alt} photo gallery`}
      >
        <Image
          src={hero}
          alt={alt}
          fill
          priority
          sizes="(min-width:640px) 50vw, 100vw"
          className="object-cover"
        />
        {/* Mobile-only view-all */}
        <ViewAll className="sm:hidden" onClick={(event) => { event.stopPropagation(); openAt(0); }} />
      </div>

      {/* Four supporting shots (desktop) */}
      {small.map((src, i) => (
        <div
          key={`${src}-${i}`}
          className="relative hidden cursor-pointer overflow-hidden rounded-2xl sm:block"
          onClick={() => openAt(i + 1)}
          onKeyDown={(event) => event.key === "Enter" && openAt(i + 1)}
          role="button"
          tabIndex={0}
          aria-label={`Open ${alt} photo ${i + 2}`}
        >
          <Image
            src={src}
            alt={`${alt} — view ${i + 2}`}
            fill
            sizes="25vw"
            className="object-cover"
          />
          {i === small.length - 1 && <ViewAll onClick={(event) => { event.stopPropagation(); openAt(0); }} />}
        </div>
      ))}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-ink-deep/95 p-4 backdrop-blur-md sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} photo gallery`}
          onClick={() => setLightboxOpen(false)}
        >
          <div className="flex items-center justify-between text-white">
            <p className="font-display text-xl">{alt}</p>
            <button type="button" onClick={() => setLightboxOpen(false)} aria-label="Close photo gallery" className="grid h-11 w-11 place-items-center rounded-full border border-white/25 transition-colors hover:bg-white/10 cursor-pointer">
              <Close className="h-5 w-5" />
            </button>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center py-5"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={images[activeIndex]}
              alt={`${alt} — view ${activeIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
            <button type="button" onClick={() => setActiveIndex((index) => (index - 1 + images.length) % images.length)} aria-label="Previous photo" className="absolute left-0 grid h-12 w-12 place-items-center rounded-full bg-white/95 text-ink-deep shadow-lg transition-transform hover:scale-105 cursor-pointer sm:left-4">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => setActiveIndex((index) => (index + 1) % images.length)} aria-label="Next photo" className="absolute right-0 grid h-12 w-12 place-items-center rounded-full bg-white/95 text-ink-deep shadow-lg transition-transform hover:scale-105 cursor-pointer sm:right-4">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 text-sm text-white/75" onClick={(event) => event.stopPropagation()}>
            <span>{activeIndex + 1} / {images.length}</span>
            <div className="flex max-w-[80vw] gap-2 overflow-x-auto pb-1">
              {images.map((src, index) => (
                <button key={`${src}-${index}`} type="button" onClick={() => setActiveIndex(index)} aria-label={`View photo ${index + 1}`} className={`relative h-14 w-16 shrink-0 overflow-hidden rounded-lg transition-opacity cursor-pointer ${index === activeIndex ? "opacity-100 ring-2 ring-terracotta" : "opacity-55 hover:opacity-100"}`}>
                  <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ViewAll({ className = "", onClick }: { className?: string; onClick?: React.MouseEventHandler<HTMLButtonElement> }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-ink-deep shadow-md backdrop-blur transition-colors hover:bg-white cursor-pointer ${className}`}
    >
      <Grid className="h-4 w-4" />
      View all photos
    </button>
  );
}
