"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "../icons";

const BOOKED_BY_MONTH: Record<string, number[]> = {
  "2026-6": [2, 3, 8, 9, 21, 22, 28],
  "2026-7": [4, 5, 18, 19, 27],
};

export default function AvailabilityCalendar({
  onRangeChange,
}: {
  onRangeChange?: (range: { start: Date; end: Date; nights: number }) => void;
}) {
  const [month, setMonth] = useState(new Date(2026, 6, 1));
  const [start, setStart] = useState(12);
  const [end, setEnd] = useState(17);

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const days = new Date(year, monthIndex + 1, 0).getDate();
  const leadingBlanks = new Date(year, monthIndex, 1).getDay();
  const booked = new Set(BOOKED_BY_MONTH[`${year}-${monthIndex}`] ?? []);
  const cells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];

  function selectDay(day: number) {
    if (booked.has(day)) return;
    if (!start || end) {
      setStart(day);
      setEnd(0);
      return;
    }
    const nextEnd = day > start ? day : start;
    const nextStart = day > start ? start : day;
    setStart(nextStart);
    setEnd(nextEnd);
    const selectedStart = new Date(year, monthIndex, nextStart);
    const selectedEnd = new Date(year, monthIndex, nextEnd);
    onRangeChange?.({
      start: selectedStart,
      end: selectedEnd,
      nights: Math.max(1, Math.round((selectedEnd.getTime() - selectedStart.getTime()) / 86400000)),
    });
  }

  function changeMonth(offset: number) {
    setMonth(new Date(year, monthIndex + offset, 1));
    setStart(0);
    setEnd(0);
  }

  const monthName = month.toLocaleDateString("en-KE", { month: "long", year: "numeric" });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-display text-lg font-semibold text-ink-deep">{monthName}</h3>
        <div className="flex gap-2">
          <button type="button" aria-label="Previous month" onClick={() => changeMonth(-1)} className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 text-ink transition-colors hover:bg-sand-deep cursor-pointer">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Next month" onClick={() => changeMonth(1)} className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 text-ink transition-colors hover:bg-sand-deep cursor-pointer">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-y-2 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
          <span key={i} className="text-xs font-semibold text-ink-soft">{day}</span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={`blank-${i}`} />;
          const isStart = day === start;
          const isEnd = day === end;
          const inRange = start > 0 && end > 0 && day > start && day < end;
          const isBooked = booked.has(day);
          return (
            <div key={day} className="flex justify-center">
              <button
                type="button"
                disabled={isBooked}
                onClick={() => selectDay(day)}
                aria-label={`${monthName} ${day}${isBooked ? ", unavailable" : ""}`}
                className={`grid h-10 w-10 place-items-center rounded-full text-sm transition-colors ${
                  isStart || isEnd
                    ? "bg-terracotta font-semibold text-white"
                    : inRange
                      ? "bg-terracotta-soft text-ink-deep"
                      : isBooked
                        ? "text-ink-soft/40 line-through cursor-not-allowed"
                        : "text-ink-deep hover:bg-sand-deep cursor-pointer"
                }`}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-soft">
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-terracotta" />Selected</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-sand-deep" />Booked</span>
      </div>
    </div>
  );
}
