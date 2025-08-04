import { PrismaClient } from "@prisma/client";

import { env } from "@/env";

if (!env.DATABASE_URL) {
  console.error("[Prisma] DATABASE_URL is not set. Current value:", env.DATABASE_URL);
  throw new Error("Please add your Mongo URI to .env.local");
}

if (!/^mongodb\+srv:\/\//.test(env.DATABASE_URL)) {
  console.warn("[Prisma] DATABASE_URL does not look like a valid MongoDB Atlas URI:", env.DATABASE_URL);
}

const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
