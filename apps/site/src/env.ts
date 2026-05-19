import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const clientEnv = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_CLOUDFLARE_SITEKEY: z.string(),
  },
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});

export const serverEnv = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "production", "preview"])
      .optional()
      .default("development"),
    CLOUDFLARE_SECRET_KEY: z.string(),
    DATABASE_URL: z.url(),
    RESEND_SECRET_KEY: z.string(),
    SERVER_URL: z.url().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
