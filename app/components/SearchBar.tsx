"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { DESTINATIONS } from "../lib/data";
import { Search, MapPin, Calendar, Users } from "./icons";

export default function SearchBar({ className = "" }: { className?: string }) {
  const id = useId();
  const router = useRouter();
  const [where, setWhere] = useState("Diani, Kenya");
  const [checkIn, setCheckIn] = useState("2026-07-12");
  const [checkOut, setCheckOut] = useState("2026-07-17");
  const [guests, setGuests] = useState("2");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const destination = DESTINATIONS.find(
      (item) => `${item.name}, Kenya`.toLowerCase() === where.trim().toLowerCase(),
    ) ?? DESTINATIONS.find((item) => item.name.toLowerCase() === where.trim().toLowerCase());
    const slug = destination?.slug ?? "diani";
    const params = new URLSearchParams({ checkIn, checkOut, guests });
    router.push(`/destinations/${slug}?${params.toString()}`);
  }

  return (
    <form
      onSubmit={submit}
      className={`w-full rounded-[26px] bg-white/95 p-2 shadow-[0_24px_60px_-24px_rgba(38,37,33,0.45)] ring-1 ring-ink/5 backdrop-blur ${className}`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_0.9fr_auto] lg:items-stretch">
        {/* Where */}
        <Field
          icon={<MapPin className="h-4 w-4" />}
          label="Where"
          htmlFor={`${id}-where`}
        >
          <input
            id={`${id}-where`}
            list={`${id}-dests`}
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            placeholder="Search destinations"
            className="w-full bg-transparent text-[15px] font-semibold text-ink-deep outline-none placeholder:font-normal placeholder:text-ink-soft"
          />
          <datalist id={`${id}-dests`}>
            {DESTINATIONS.map((d) => (
              <option key={d.slug} value={`${d.name}, Kenya`} />
            ))}
          </datalist>
        </Field>

        {/* Check in */}
        <Field
          icon={<Calendar className="h-4 w-4" />}
          label="Check in"
          htmlFor={`${id}-in`}
        >
          <input
            id={`${id}-in`}
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full bg-transparent text-[15px] font-semibold text-ink-deep outline-none"
          />
        </Field>

        {/* Check out */}
        <Field
          icon={<Calendar className="h-4 w-4" />}
          label="Check out"
          htmlFor={`${id}-out`}
        >
          <input
            id={`${id}-out`}
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full bg-transparent text-[15px] font-semibold text-ink-deep outline-none"
          />
        </Field>

        {/* Guests */}
        <Field
          icon={<Users className="h-4 w-4" />}
          label="Guests"
          htmlFor={`${id}-guests`}
          last
        >
          <select
            id={`${id}-guests`}
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full cursor-pointer appearance-none bg-transparent text-[15px] font-semibold text-ink-deep outline-none"
          >
            {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </Field>

        {/* Submit */}
        <div className="flex items-stretch p-2 sm:col-span-2 lg:col-span-1 lg:p-1.5">
          <button
            type="submit"
            className="group flex w-full items-center justify-center gap-2 rounded-[20px] bg-terracotta px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-terracotta/25 transition-colors hover:bg-terracotta-dark cursor-pointer lg:px-6"
          >
            <Search className="h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110" />
            Search
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({
  icon,
  label,
  htmlFor,
  children,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-5 py-3.5 sm:py-4 ${
        last ? "" : "lg:border-r lg:border-sand-line"
      } border-b border-sand-line/70 sm:border-b-0`}
    >
      <span className="text-terracotta">{icon}</span>
      <label htmlFor={htmlFor} className="block w-full">
        <span className="eyebrow block text-[0.62rem] text-ink-soft">
          {label}
        </span>
        <span className="mt-0.5 block">{children}</span>
      </label>
    </div>
  );
}
