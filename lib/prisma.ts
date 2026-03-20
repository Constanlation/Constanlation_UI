import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

declare global {
  // allow global `var` in development to persist client across HMR
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const datasourceUrl = process.env.DATABASE_URL?.trim();

  if (!datasourceUrl) {
    throw new Error("DATABASE_URL is not set. Configure it in your environment to enable database-backed APIs.");
  }

  const pool = new Pool({ connectionString: datasourceUrl });
  const adapter = new PrismaPg(pool as unknown as ConstructorParameters<typeof PrismaPg>[0]);

  return new PrismaClient({
    adapter,
  });
}

function getPrismaClient(): PrismaClient {
  if (global.__prisma) {
    return global.__prisma;
  }

  const client = createPrismaClient();

  if (process.env.NODE_ENV !== "production") {
    global.__prisma = client;
  }

  return client;
}

const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export default prisma;
