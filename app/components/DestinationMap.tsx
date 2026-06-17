import type { Villa } from "../lib/data";
import { Plus, Minus } from "./icons";

const POSITIONS = [
  { top: "18%", left: "60%" },
  { top: "37%", left: "16%" },
  { top: "50%", left: "74%" },
  { top: "63%", left: "40%" },
  { top: "75%", left: "84%" },
  { top: "85%", left: "24%" },
];

export default function DestinationMap({ villas }: { villas: Villa[] }) {
  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-3xl bg-teal-mist">
      {/* grid texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(22,58,65,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(22,58,65,0.08)_1px,transparent_1px)] bg-[size:46px_46px]" />

      {/* zoom controls */}
      <div className="absolute right-4 top-4 flex flex-col gap-2">
        {[Plus, Minus].map((Icon, i) => (
          <button
            key={i}
            type="button"
            aria-label={i === 0 ? "Zoom in" : "Zoom out"}
            className="grid h-9 w-9 place-items-center rounded-full bg-white text-ink shadow-md transition-colors hover:bg-sand-light cursor-pointer"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      {/* price pins */}
      {villas.map((v, i) => {
        const pos = POSITIONS[i % POSITIONS.length];
        const active = i === 0;
        return (
          <span
            key={v.slug}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-sm font-bold shadow-md ring-1 transition-transform hover:scale-110 ${
              active
                ? "z-10 bg-ink-deep text-white ring-ink-deep"
                : "bg-white text-ink-deep ring-ink/5"
            }`}
            style={{ top: pos.top, left: pos.left }}
          >
            ${v.price}
          </span>
        );
      })}
    </div>
  );
}
