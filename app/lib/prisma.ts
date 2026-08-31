import "server-only";

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to initialize Prisma");
}

const globalForPrisma = globalThis as unknown as {
  adapter?: PrismaNeon;
  prisma?: PrismaClient;
};

const adapter =
  globalForPrisma.adapter ?? new PrismaNeon({ connectionString: databaseUrl });

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.adapter = adapter;
  globalForPrisma.prisma = prisma;
}
