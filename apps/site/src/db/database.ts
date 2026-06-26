import { createDatabase } from "@dqc/data/database";
import { serverEnv } from "@/env";

export const db = createDatabase({ connection: serverEnv.DATABASE_URL });
