import { describe, expect, test, vi } from "vitest";
import { pollBookingStatus } from "./booking-status";

describe("pollBookingStatus", () => {
  test.each(["PAID", "PAYMENT_FAILED", "EXPIRED"])("stops when status is %s", async (status) => {
    const getStatus = vi.fn().mockResolvedValueOnce({ status }).mockResolvedValueOnce({ status: "PAID" });

    const result = await pollBookingStatus(getStatus, { intervalMs: 0, maxAttempts: 5 });

    expect(result).toEqual({ status });
    expect(getStatus).toHaveBeenCalledOnce();
  });

  test("stops after the bounded retry window", async () => {
    const getStatus = vi.fn().mockResolvedValue({ status: "PENDING_PAYMENT" });

    const result = await pollBookingStatus(getStatus, { intervalMs: 0, maxAttempts: 3 });

    expect(result).toBeNull();
    expect(getStatus).toHaveBeenCalledTimes(3);
  });

  test("rejects when polling is aborted", async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      pollBookingStatus(vi.fn().mockResolvedValue({ status: "PENDING_PAYMENT" }), { signal: controller.signal }),
    ).rejects.toMatchObject({ name: "AbortError" });
  });
});
