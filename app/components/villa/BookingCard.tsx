"use client";

import { type FormEvent, useEffect, useId, useRef, useState } from "react";
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
import { pollBookingStatus, type BookingStatus } from "../../lib/booking-status";

type CheckoutState = "idle" | "submitting" | "pending" | "success" | "failure" | "expired";
type BookingResponse = { reference?: string; status: BookingStatus; amount?: number; message?: string };

function defaultBookingDates(): { checkIn: Date; checkOut: Date } {
  const checkIn = new Date();
  checkIn.setHours(0, 0, 0, 0);
  checkIn.setDate(checkIn.getDate() + 1);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + DEFAULT_NIGHTS);
  return { checkIn, checkOut };
}

export function guardBookingSubmit(
  event: Pick<FormEvent<HTMLFormElement>, "preventDefault">,
  checkoutState: CheckoutState,
) {
  event.preventDefault();
  return checkoutState === "success";
}

export default function BookingCard({ villa }: { villa: Villa }) {
  const [guests, setGuests] = useState(1);
  const [nights, setNights] = useState(DEFAULT_NIGHTS);
  const [{ checkIn, checkOut }, setDates] = useState(defaultBookingDates);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [checkoutState, setCheckoutState] = useState<CheckoutState>("idle");
  const [confirmedTotal, setConfirmedTotal] = useState<number | null>(null);
  const [error, setError] = useState("");
  const inputId = useId();
  const abortControllerRef = useRef<AbortController | null>(null);
  const extraGuests = Math.max(0, guests - 2);
  const guestFee = extraGuests * EXTRA_GUEST_FEE * nights;
  const subtotal = villa.price * nights;
  const service = Math.round((subtotal + guestFee) * SERVICE_RATE);
  const total = subtotal + guestFee + CLEANING_FEE + service;
  const displayedTotal = confirmedTotal ?? total;
  const dateLabel = (date: Date) => date.toLocaleDateString("en-KE", { month: "short", day: "numeric" });
  const isoDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => () => abortControllerRef.current?.abort(), []);

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    if (guardBookingSubmit(event, checkoutState)) return;
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setCheckoutState("submitting");
    setError("");
    setConfirmedTotal(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json", "Idempotency-Key": crypto.randomUUID() },
        signal: controller.signal,
        body: JSON.stringify({
          villaSlug: villa.slug,
          checkIn: isoDate(checkIn),
          checkOut: isoDate(checkOut),
          guests,
          guestName: name,
          guestEmail: email,
          guestPhone: phone,
        }),
      });
      const booking = (await response.json()) as BookingResponse;
      if (controller.signal.aborted) return;
      if (!response.ok) throw new Error(booking.message || "Unable to start payment");

      if (booking.amount !== undefined) setConfirmedTotal(booking.amount);
      if (booking.status === "PAID") {
        setCheckoutState("success");
        return;
      }
      if (booking.status === "PAYMENT_FAILED") {
        setCheckoutState("failure");
        setError("We couldn't start the payment. Please try again.");
        return;
      }
      if (booking.status === "EXPIRED") {
        setCheckoutState("expired");
        return;
      }
      if (!booking.reference) throw new Error("Unable to track payment");

      setCheckoutState("pending");
      const result = await pollBookingStatus(async () => {
        const statusResponse = await fetch(`/api/bookings/${encodeURIComponent(booking.reference!)}`, { signal: controller.signal });
        if (!statusResponse.ok) throw new Error("Unable to check payment");
        return (await statusResponse.json()) as BookingResponse;
      }, { signal: controller.signal });
      if (controller.signal.aborted) return;
      if (!result) {
        setCheckoutState("failure");
        setError("We couldn't confirm the payment yet. Please try again.");
      } else if (result.status === "PAID") {
        setCheckoutState("success");
      } else if (result.status === "EXPIRED") {
        setCheckoutState("expired");
      } else {
        setCheckoutState("failure");
        setError("The payment was not completed. Please try again.");
      }
    } catch {
      if (controller.signal.aborted) return;
      setCheckoutState("failure");
      setError("We couldn't start the payment. Please check your details and try again.");
    } finally {
      if (abortControllerRef.current === controller) abortControllerRef.current = null;
    }
  }

  return (
    <form noValidate onSubmit={submitBooking}>
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
               setDates({ checkIn: start, checkOut: end });
              setNights(selectedNights);
            }}
          />
        </div>

        <div className="mt-5 space-y-3">
          <div>
            <label htmlFor={`${inputId}-guest-name`} className="mb-1 block text-sm font-semibold text-ink-deep">Name</label>
            <input id={`${inputId}-guest-name`} value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" className="w-full rounded-xl border border-sand-line px-4 py-3 text-ink-deep outline-none focus:border-terracotta" />
          </div>
          <div>
            <label htmlFor={`${inputId}-guest-email`} className="mb-1 block text-sm font-semibold text-ink-deep">Email</label>
            <input id={`${inputId}-guest-email`} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" className="w-full rounded-xl border border-sand-line px-4 py-3 text-ink-deep outline-none focus:border-terracotta" />
          </div>
          <div>
            <label htmlFor={`${inputId}-guest-phone`} className="mb-1 block text-sm font-semibold text-ink-deep">Phone</label>
            <input id={`${inputId}-guest-phone`} type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} required autoComplete="tel" aria-describedby={`${inputId}-phone-help`} className="w-full rounded-xl border border-sand-line px-4 py-3 text-ink-deep outline-none focus:border-terracotta" />
            <p id={`${inputId}-phone-help`} className="mt-1 text-xs text-ink-soft">Use a Kenyan mobile number.</p>
          </div>
        </div>

        <button
          type={checkoutState === "success" ? "button" : "submit"}
          disabled={checkoutState === "submitting" || checkoutState === "pending" || checkoutState === "success"}
          className="mt-4 w-full rounded-full bg-terracotta py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-terracotta/25 transition-colors hover:bg-terracotta-dark cursor-pointer"
        >
          {checkoutState === "submitting" ? "Starting payment..." : checkoutState === "pending" ? "Waiting for payment..." : checkoutState === "success" ? "Reservation confirmed" : checkoutState === "failure" || checkoutState === "expired" ? "Try payment again" : "Reserve"}
        </button>
        <p className="mt-3 text-center text-sm text-ink-soft" aria-live="polite">
          {checkoutState === "pending" ? "Check your phone to approve the payment request." : checkoutState === "success" ? "Payment received. Your reservation is confirmed." : checkoutState === "expired" ? "This payment window expired. Start a new attempt." : "You won&apos;t be charged yet"}
        </p>
        {error && <p role="alert" className="mt-3 text-center text-sm font-medium text-terracotta-dark">{error}</p>}

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
          <span className="text-lg font-bold">{confirmedTotal === null ? "Total" : "Server-confirmed reservation total"}</span>
          <span className="text-lg font-bold">{formatKES(displayedTotal)}</span>
        </div>
      </div>

      <p className="mt-4 flex items-center justify-center gap-2 text-sm text-ink-soft">
        <Lock className="h-4 w-4 text-teal-soft" />
        Secure payment · free cancellation for 48h
      </p>
    </form>
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
