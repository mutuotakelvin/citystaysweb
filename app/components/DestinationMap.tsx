import type { Villa } from "../lib/data";
export default function DestinationMap({ villas, location = "Diani" }: { villas: Villa[]; location?: string }) {
  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-3xl bg-teal-mist">
      <iframe
        title={`${location} property map`}
        src="https://www.openstreetmap.org/export/embed.html?bbox=39.12%2C-4.35%2C39.32%2C-4.22&layer=mapnik&marker=-4.28%2C39.25"
        className="absolute inset-0 h-full w-full border-0"
        loading="lazy"
      />
      <div className="absolute left-4 top-4 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-ink-deep shadow-md backdrop-blur">
        {villas.length} homes in {location}
      </div>
      <div className="absolute bottom-4 left-4 rounded-2xl bg-ink-deep/90 px-4 py-3 text-sm text-white shadow-lg backdrop-blur">
        Drag the map to explore the area
      </div>
    </div>
  );
}
