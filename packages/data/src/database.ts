import { DrizzleConfig } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, PoolConfig } from "pg";

export function createDatabase(
  connection: DrizzleConfig<Record<string, never>> &
    ({ connection: string | PoolConfig } | { client: Pool }),
) {
  return drizzle(connection);
}
