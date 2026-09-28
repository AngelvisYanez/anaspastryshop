import { Prisma, PrismaClient } from "@prisma/client";

const RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 300;

const RETRYABLE_ALWAYS = new Set(["P1001", "P1002", "P1008", "P1011"]);
const RETRYABLE_READ_ONLY = new Set(["P1017"]);

const READ_ONLY_OPERATIONS = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
]);

const PRISMA_ERROR_CODE = /^P\d{4}$/;

function errorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const candidate = error as { code?: unknown; errorCode?: unknown };
  // PrismaClientKnownRequestError exposes `code`; PrismaClientInitializationError
  // exposes `errorCode`. For an unreachable host that field is sometimes the literal
  // string "undefined" rather than a JS undefined, hence the shape check.
  for (const value of [candidate.code, candidate.errorCode]) {
    if (typeof value === "string" && PRISMA_ERROR_CODE.test(value)) return value;
  }
  return undefined;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isRetryable(error: unknown, operation: string): boolean {
  const isRead = READ_ONLY_OPERATIONS.has(operation);
  const code = errorCode(error);

  if (code && RETRYABLE_ALWAYS.has(code)) return true;
  if (code && RETRYABLE_READ_ONLY.has(code)) return isRead;
  // A recognised Prisma code we did not whitelist (P1000 auth, P1003 missing
  // database, P2002 unique, P2025 not found, ...) is a real application-level
  // failure: retrying it only wastes the request.
  if (code) return false;

  // The engine could not initialise at all: unreachable host, refused port, DNS
  // or TLS. It carries no usable code, so the class is the only signal.
  if (error instanceof Prisma.PrismaClientInitializationError) return true;
  if (error instanceof Prisma.PrismaClientRustPanicError) return isRead;

  if (isRead && /ECONNRESET|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN|EPIPE/.test(errorMessage(error))) {
    return true;
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runWithRetry<T>(operation: string, query: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      return await query();
    } catch (error) {
      if (attempt === RETRY_ATTEMPTS || !isRetryable(error, operation)) throw error;
      lastError = error;
      await sleep(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1));
    }
  }

  throw lastError;
}

function withConnectionParams(url: string | undefined): string | undefined {
  if (!url) return undefined;

  try {
    const parsed = new URL(url);
    parsed.searchParams.set("connection_limit", "4");
    parsed.searchParams.set("connect_timeout", "10");
    parsed.searchParams.set("pool_timeout", "20");
    return parsed.toString();
  } catch {
    return url;
  }
}

function createClient() {
  const datasourceUrl = withConnectionParams(process.env.DATABASE_URL);

  return new PrismaClient({
    datasourceUrl,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  }).$extends({
    query: {
      $allModels: {
        async $allOperations({ args, operation, query }) {
          return runWithRetry(operation, () => query(args));
        },
      },
    },
  });
}

const globalForPrisma = global as unknown as {
  prisma?: ReturnType<typeof createClient>;
};

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
