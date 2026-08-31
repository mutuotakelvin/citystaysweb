export type BookingStatus = "PENDING_PAYMENT" | "PAID" | "PAYMENT_FAILED" | "EXPIRED";

type StatusResponse = { status: string };

const TERMINAL_STATUSES = new Set<BookingStatus>(["PAID", "PAYMENT_FAILED", "EXPIRED"]);

export async function pollBookingStatus<T extends StatusResponse>(
  getStatus: () => Promise<T>,
  { intervalMs = 2000, maxAttempts = 15, signal }: { intervalMs?: number; maxAttempts?: number; signal?: AbortSignal } = {},
): Promise<T | null> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (signal?.aborted) throw new DOMException("Polling aborted", "AbortError");
    const result = await getStatus();
    if (signal?.aborted) throw new DOMException("Polling aborted", "AbortError");
    if (TERMINAL_STATUSES.has(result.status as BookingStatus)) return result;
    if (attempt < maxAttempts - 1 && intervalMs > 0) {
      await new Promise<void>((resolve, reject) => {
        const finish = () => {
          signal?.removeEventListener("abort", abort);
          resolve();
        };
        const timeout = setTimeout(finish, intervalMs);
        const abort = () => {
          clearTimeout(timeout);
          signal?.removeEventListener("abort", abort);
          reject(new DOMException("Polling aborted", "AbortError"));
        };
        signal?.addEventListener("abort", abort, { once: true });
      });
    }
  }

  return null;
}
