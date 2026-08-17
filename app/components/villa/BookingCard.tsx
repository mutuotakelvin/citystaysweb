"use client";

import { useState } from "react";
import type { Villa } from "../../lib/data";
import {
  CLEANING_FEE,
  SERVICE_RATE,
  EXTRA_GUEST_FEE,
  DEFAULT_NIGHTS,
  formatKES,
} from "../../lib/data";
import { Star, Minus, Plus, Lock } from "../icons";
import AvailabilityCalendar from "./AvailabilityCalendar";

export default function BookingCard({ villa }: { villa: Villa }) {
  const [guests, setGuests] = useState(Math.min(6, villa.guests));
  const [nights, setNights] = useState(DEFAULT_NIGHTS);
  const [checkIn, setCheckIn] = useState(new Date(2026, 6, 12));
  const [checkOut, setCheckOut] = useState(new Date(2026, 6, 17));
  const extraGuests = Math.max(0, guests - 2);
  const guestFee = extraGuests * EXTRA_GUEST_FEE * nights;
  const subtotal = villa.price * nights;
  const service = Math.round((subtotal + guestFee) * SERVICE_RATE);
  const total = subtotal + guestFee + CLEANING_FEE + service;
  const dateLabel = (date: Date) => date.toLocaleDateString("en-KE", { month: "short", day: "numeric" });

  return (
    <div>
      <div className="rounded-3xl bg-white p-6 shadow-[0_30px_70px_-35px_rgba(38,37,33,0.45)] ring-1 ring-ink/5 sm:p-7">
        {/* Price + rating */}
        <div className="flex items-baseline justify-between">
          <p className="text-ink-deep">
            <span className="text-[1.7rem] font-bold">{formatKES(villa.price)}</span>
            <span className="text-ink-soft"> / night</span>
          </p>
          <span className="flex items-center gap-1 text-sm font-semibold text-ink-deep">
            <Star className="h-4 w-4 text-gold" />
            {villa.rating}
          </span>
        </div>

        {/* Dates + guests */}
        <div className="mt-5 rounded-2xl border border-sand-line">
          <div className="grid grid-cols-2">
            <div className="border-r border-sand-line px-4 py-3">
              <p className="eyebrow text-[0.6rem] text-ink-soft">Check-in</p>
              <p className="mt-1 text-[15px] font-semibold text-ink-deep">
                {dateLabel(checkIn)}
              </p>
            </div>
            <div className="px-4 py-3">
              <p className="eyebrow text-[0.6rem] text-ink-soft">Check-out</p>
              <p className="mt-1 text-[15px] font-semibold text-ink-deep">
                {dateLabel(checkOut)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-sand-line px-4 py-3">
            <div>
              <p className="eyebrow text-[0.6rem] text-ink-soft">Guests</p>
              <p className="mt-1 text-[15px] font-semibold text-ink-deep">
                {guests} {guests === 1 ? "guest" : "guests"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Stepper
                label="Remove guest"
                disabled={guests <= 1}
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
              >
                <Minus className="h-4 w-4" />
              </Stepper>
              <Stepper
                label="Add guest"
                disabled={guests >= villa.guests}
                onClick={() => setGuests((g) => Math.min(villa.guests, g + 1))}
              >
                <Plus className="h-4 w-4" />
              </Stepper>
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-sand-line pt-5">
          <div className="mb-4 flex items-baseline justify-between">
            <h3 className="font-display text-xl font-semibold text-ink-deep">Choose your dates</h3>
            <span className="text-sm text-ink-soft">{nights} nights</span>
          </div>
          <AvailabilityCalendar
            onRangeChange={({ start, end, nights: selectedNights }) => {
              setCheckIn(start);
              setCheckOut(end);
              setNights(selectedNights);
            }}
          />
        </div>

        <button
          type="button"
          className="mt-4 w-full rounded-full bg-terracotta py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-terracotta/25 transition-colors hover:bg-terracotta-dark cursor-pointer"
        >
          Reserve
        </button>
        <p className="mt-3 text-center text-sm text-ink-soft">
          You won&apos;t be charged yet
        </p>

        {/* Breakdown */}
        <dl className="mt-5 space-y-3 text-[15px] text-ink">
          <Row
            label={`${formatKES(villa.price)} × ${nights} nights`}
            value={formatKES(subtotal)}
          />
          {extraGuests > 0 && (
            <Row
              label={`${extraGuests} extra guest${extraGuests === 1 ? "" : "s"}`}
              value={formatKES(guestFee)}
            />
          )}
          <Row label="Cleaning fee" value={formatKES(CLEANING_FEE)} />
          <Row label="Service fee" value={formatKES(service)} />
        </dl>
        <div className="mt-5 flex items-center justify-between border-t border-sand-line pt-5 text-ink-deep">
          <span className="text-lg font-bold">Total</span>
          <span className="text-lg font-bold">{formatKES(total)}</span>
        </div>
      </div>

      <p className="mt-4 flex items-center justify-center gap-2 text-sm text-ink-soft">
        <Lock className="h-4 w-4 text-teal-soft" />
        Secure payment · free cancellation for 48h
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="underline decoration-sand-line underline-offset-4">
        {label}
      </dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function Stepper({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full border border-ink/20 text-ink transition-colors hover:border-ink/40 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
    >
      {children}
    </button>
  );
}
