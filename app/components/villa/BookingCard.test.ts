import { afterEach, describe, expect, it, vi } from "vitest";
import { guardBookingSubmit } from "./BookingCard";

describe("BookingCard submit guard", () => {
  afterEach(() => vi.restoreAllMocks());

  it("prevents navigation and booking side effects after checkout succeeds", () => {
    const preventDefault = vi.fn();
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    expect(guardBookingSubmit({ preventDefault }, "success")).toBe(true);
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
