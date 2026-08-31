import { z } from "zod";
import {
  CLEANING_FEE,
  EXTRA_GUEST_FEE,
  getVilla,
  SERVICE_RATE,
  type Villa,
} from "./data";

export const BOOKING_EXPIRY_MS = 30 * 60 * 1000;

export type BookingInput = {
  name: string;
  email: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  villaSlug: string;
  phone: string;
};

export type BookingTotal = {
  subtotal: number;
  guestFee: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
};

function parseIsoDate(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Dates must use YYYY-MM-DD format");
  }

  const date = new Date(`${value}T00:00:00`);
  const localValue = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, index) => (index === 0 ? String(part).padStart(4, "0") : String(part).padStart(2, "0")))
    .join("-");
  if (Number.isNaN(date.getTime()) || localValue !== value) {
    throw new Error("Invalid date");
  }
  return date;
}

export function normalizeKenyanPhone(input: string): string {
  const value = input.replace(/\s/g, "");

  if (/^0[17]\d{8}$/.test(value)) {
    return `254${value.slice(1)}`;
  }
  if (/^\+254[17]\d{8}$/.test(value)) {
    return value.slice(1);
  }
  if (/^254[17]\d{8}$/.test(value)) {
    return value;
  }

  throw new Error("Invalid Kenyan phone number");
}

const bookingInputSchema = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
  checkIn: z.string().transform(parseIsoDate),
  checkOut: z.string().transform(parseIsoDate),
  guests: z.coerce.number().int().min(1),
  villaSlug: z.string().trim().min(1),
  phone: z.string().transform(normalizeKenyanPhone),
});

export function normalizeBookingInput(input: unknown): BookingInput {
  const booking = bookingInputSchema.parse(input);
  const villa = getVillaForBooking(booking.villaSlug);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (booking.checkIn < today || booking.checkOut <= booking.checkIn) {
    throw new Error("Booking dates are invalid");
  }
  if (booking.guests > villa.guests) {
    throw new Error("Guest count exceeds villa capacity");
  }

  return booking;
}

export function calculateBookingTotal(villa: Villa, nights: number, guests: number): BookingTotal {
  if (!Number.isInteger(nights) || nights < 1 || !Number.isInteger(guests) || guests < 1 || guests > villa.guests) {
    throw new Error("Invalid booking totals");
  }

  const subtotal = villa.price * nights;
  const guestFee = Math.max(0, guests - 2) * EXTRA_GUEST_FEE * nights;
  const serviceFee = Math.round((subtotal + guestFee) * SERVICE_RATE);

  return {
    subtotal,
    guestFee,
    cleaningFee: CLEANING_FEE,
    serviceFee,
    total: subtotal + guestFee + CLEANING_FEE + serviceFee,
  };
}

export function getVillaForBooking(slug: string): Villa {
  const villa = getVilla(slug);
  if (!villa) {
    throw new Error("Villa not found");
  }
  return villa;
}

export function isBookingExpired(createdAt: Date, now = new Date()): boolean {
  return now.getTime() - createdAt.getTime() >= BOOKING_EXPIRY_MS;
}
