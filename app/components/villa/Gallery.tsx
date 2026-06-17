import Image from "next/image";
import { Grid } from "../icons";

export default function Gallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [hero, ...rest] = images;
  const small = rest.slice(0, 4);

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:grid-rows-2 sm:gap-3 sm:h-[460px] lg:h-[560px]">
      {/* Hero */}
      <div className="relative h-72 overflow-hidden rounded-2xl sm:col-span-2 sm:row-span-2 sm:h-auto">
        <Image
          src={hero}
          alt={alt}
          fill
          priority
          sizes="(min-width:640px) 50vw, 100vw"
          className="object-cover"
        />
        {/* Mobile-only view-all */}
        <ViewAll className="sm:hidden" />
      </div>

      {/* Four supporting shots (desktop) */}
      {small.map((src, i) => (
        <div
          key={src}
          className="relative hidden overflow-hidden rounded-2xl sm:block"
        >
          <Image
            src={src}
            alt={`${alt} — view ${i + 2}`}
            fill
            sizes="25vw"
            className="object-cover"
          />
          {i === small.length - 1 && <ViewAll />}
        </div>
      ))}
    </div>
  );
}

function ViewAll({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      className={`absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-ink-deep shadow-md backdrop-blur transition-colors hover:bg-white cursor-pointer ${className}`}
    >
      <Grid className="h-4 w-4" />
      View all photos
    </button>
  );
}
