import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { Pool } from "pg";

declare global {
  var prisma: PrismaClient | undefined;
  var pgPool: Pool | undefined;
}

function getPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  globalThis.pgPool ??= new Pool({ connectionString: url });
  return globalThis.pgPool;
}

function createPrisma(): PrismaClient {
  const pool = getPool();
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

function getClient(): PrismaClient {
  if (!globalThis.prisma) {
    globalThis.prisma = createPrisma();
  }
  return globalThis.prisma;
}

/**
 * Lazy proxy so importing this module does not instantiate Postgres at load time.
 * DATABASE_URL errors surface on first DB access (still required at runtime/build when routes run).
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient();
    return Reflect.get(client, prop, client);
  },
});
