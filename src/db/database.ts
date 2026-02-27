import { serverEnv } from "@/env";
import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(serverEnv.DATABASE_URL);
