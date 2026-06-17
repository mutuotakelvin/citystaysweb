import { ChevronLeft, ChevronRight } from "../icons";

// July 2026 — July 1 falls on a Wednesday. Presentational only.
const LEADING_BLANKS = 3; // Sun, Mon, Tue before the 1st
const DAYS = 31;
const BOOKED = new Set([2, 3, 8, 9, 21, 22, 28]);
const RANGE_START = 12;
const RANGE_END = 17;

export default function AvailabilityCalendar() {
  const cells: (number | null)[] = [
    ...Array.from({ length: LEADING_BLANKS }, () => null),
    ...Array.from({ length: DAYS }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-ink-deep">
          July 2026
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous month"
            className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 text-ink transition-colors hover:bg-sand-deep cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 text-ink transition-colors hover:bg-sand-deep cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-y-3 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="text-xs font-semibold text-ink-soft">
            {d}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={`b${i}`} />;
          const isEnd = day === RANGE_START || day === RANGE_END;
          const inRange = day > RANGE_START && day < RANGE_END;
          const booked = BOOKED.has(day);
          return (
            <div key={day} className="flex justify-center">
              <span
                className={`grid h-10 w-10 place-items-center rounded-full text-sm ${
                  isEnd
                    ? "bg-terracotta font-semibold text-white"
                    : inRange
                      ? "bg-terracotta-soft text-ink-deep"
                      : booked
                        ? "text-ink-soft/40 line-through"
                        : "text-ink-deep"
                }`}
              >
                {day}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-6 text-sm text-ink-soft">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-terracotta" />
          Selected
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-sand-deep" />
          Booked
        </span>
      </div>
    </div>
  );
}
