import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

// Global type definition
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error"],
  });

// Avoid multiple instances of Prisma Client in development
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Helper function to escape SQL for any legacy code that still needs it
export function sqlEscape(value: string | number | boolean | null): string {
  if (value === null) {
    return "NULL";
  }
  
  if (typeof value === "boolean") {
    return value ? "TRUE" : "FALSE";
  }
  
  if (typeof value === "number") {
    return value.toString();
  }
  
  // For strings, escape single quotes
  return `'${String(value).replace(/'/g, "''")}'`;
}