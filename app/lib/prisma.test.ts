import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { PrismaNeon, PrismaClient } = vi.hoisted(() => ({
  PrismaNeon: vi.fn(function PrismaNeon(this: { config?: unknown }, config: unknown) {
    Object.assign(this, { config });
  }),
  PrismaClient: vi.fn(function PrismaClient(this: { config?: unknown }, config: unknown) {
    Object.assign(this, { config });
  }),
}));

vi.mock("@prisma/adapter-neon", () => ({ PrismaNeon }));
vi.mock("@prisma/client", () => ({ PrismaClient }));

describe("Prisma Neon adapter", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete (globalThis as { adapter?: unknown }).adapter;
    delete (globalThis as { prisma?: unknown }).prisma;
    process.env.DATABASE_URL = "postgresql://example.test/citystays";
  });

  test("uses the transaction-capable adapter with DATABASE_URL", async () => {
    await import("./prisma");

    expect(PrismaNeon).toHaveBeenCalledWith({
      connectionString: "postgresql://example.test/citystays",
    });
    expect(PrismaClient).toHaveBeenCalledWith({ adapter: expect.any(Object) });
  });

  test("reuses the adapter and Prisma client in development", async () => {
    const first = await import("./prisma");
    vi.resetModules();
    const second = await import("./prisma");

    expect(second.prisma).toBe(first.prisma);
    expect(PrismaNeon).toHaveBeenCalledOnce();
    expect(PrismaClient).toHaveBeenCalledOnce();
  });
});
