import "server-only";

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  adapter?: PrismaNeon;
  prisma?: PrismaClient;
};

function createPrisma(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return new Proxy({} as PrismaClient, {
      get() {
        throw new Error("DATABASE_URL is required to initialize Prisma");
      },
    });
  }
  const adapter = globalForPrisma.adapter ?? new PrismaNeon({ connectionString: databaseUrl });
  if (process.env.NODE_ENV !== "production") globalForPrisma.adapter = adapter;
  const client = globalForPrisma.prisma ?? new PrismaClient({ adapter });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}

export const prisma: PrismaClient = createPrisma();
