/**
 * src/lib/db.ts
 *
 * Prisma Client singleton for SQLite (via better-sqlite3).
 *
 * In development, Next.js hot-reloads modules frequently, which would create a
 * new PrismaClient instance on every reload. We attach the client to the global
 * object to reuse it across hot-reloads. In production, a fresh instance is
 * created once per process.
 *
 * The database is a single local file (prisma/dev.db). No environment
 * variables, no external database service, no Docker required.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "prisma", "dev.db");

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

if (!globalForPrisma.prisma) {
  const adapter = new PrismaBetterSqlite3({ url: `file:${DB_PATH}` });
  globalForPrisma.prisma = new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma;
