import { describe, expect, test } from "vitest";
import { CLEANING_FEE, EXTRA_GUEST_FEE, SERVICE_RATE, VILLAS } from "./data";
import {
  BOOKING_EXPIRY_MS,
  calculateBookingTotal,
  getVillaForBooking,
  isBookingExpired,
  normalizeBookingInput,
  normalizeKenyanPhone,
} from "./booking";

const villa = VILLAS[0];

describe("normalizeKenyanPhone", () => {
  test.each([
    ["0712345678", "254712345678"],
    ["+254712345678", "254712345678"],
    ["254712345678", "254712345678"],
    [" 0712 345 678 ", "254712345678"],
    ["0112345678", "254112345678"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeKenyanPhone(input)).toBe(expected);
    expect(expected).toMatch(/^254[17]\d{8}$/);
  });

  test.each(["+255712345678", "0855123456", "071234567", "07123456789", "254812345678"])(
    "rejects invalid phone %s",
    (input) => {
      expect(() => normalizeKenyanPhone(input)).toThrow();
    },
  );
});

describe("booking domain rules", () => {
  test("calculates integer booking fees from trusted villa pricing", () => {
    const nights = 3;
    const guests = 4;
    const subtotal = villa.price * nights;
    const guestFee = (guests - 2) * EXTRA_GUEST_FEE * nights;
    const serviceFee = Math.round((subtotal + guestFee) * SERVICE_RATE);

    expect(calculateBookingTotal(villa, nights, guests)).toEqual({
      subtotal,
      guestFee,
      cleaningFee: CLEANING_FEE,
      serviceFee,
      total: subtotal + guestFee + CLEANING_FEE + serviceFee,
    });
  });

  test("normalizes and validates a booking input", () => {
    const today = new Date();
    const checkIn = new Date(today);
    checkIn.setDate(checkIn.getDate() + 1);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 2);

    const result = normalizeBookingInput({
      name: " Amina Otieno ",
      email: "amina@example.com",
      checkIn: checkIn.toISOString().slice(0, 10),
      checkOut: checkOut.toISOString().slice(0, 10),
      guests: "2",
      villaSlug: villa.slug,
      phone: "0712 345 678",
    });

    expect(result).toMatchObject({
      name: "Amina Otieno",
      email: "amina@example.com",
      guests: 2,
      villaSlug: villa.slug,
      phone: "254712345678",
    });
    expect(result.checkIn).toBeInstanceOf(Date);
    expect(result.checkOut).toBeInstanceOf(Date);
  });

  test("rejects dates before today, reversed dates, and over-capacity bookings", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    expect(() =>
      normalizeBookingInput({
        name: "Amina Otieno",
        email: "amina@example.com",
        checkIn: yesterday.toISOString().slice(0, 10),
        checkOut: yesterday.toISOString().slice(0, 10),
        guests: villa.guests + 1,
        villaSlug: villa.slug,
        phone: "0712345678",
      }),
    ).toThrow();
  });

  test("looks up only trusted static villas", () => {
    expect(getVillaForBooking(villa.slug)).toBe(villa);
    expect(() => getVillaForBooking("not-a-villa")).toThrow();
  });

  test("expires at 30 minutes and not before", () => {
    const createdAt = new Date("2026-08-21T10:00:00.000Z");

    expect(BOOKING_EXPIRY_MS).toBe(30 * 60 * 1000);
    expect(isBookingExpired(createdAt, new Date(createdAt.getTime() + BOOKING_EXPIRY_MS - 1))).toBe(false);
    expect(isBookingExpired(createdAt, new Date(createdAt.getTime() + BOOKING_EXPIRY_MS))).toBe(true);
  });
});
