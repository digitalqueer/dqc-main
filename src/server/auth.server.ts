import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "@/server/database/index.server";
import * as schema from "@/server/database/schema.server";

// Signing in goes through DQC's own OIDC service: one generic OAuth provider,
// "dqc", whose endpoints come from the DQC_* variables. Who may sign in is
// decided by that application's settings in the provider, not here; anyone
// who can sign in is an admin.
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  plugins: [
    tanstackStartCookies(),
    genericOAuth({
      config: [
        {
          providerId: "dqc",
          clientId: process.env.DQC_CLIENT_ID ?? "",
          clientSecret: process.env.DQC_CLIENT_SECRET ?? "",
          authorizationUrl: process.env.DQC_AUTHORIZE_URL ?? "",
          endSessionEndpoint: process.env.DQC_END_SESSION_URL ?? "",
          tokenUrl: process.env.DQC_TOKEN_URL ?? "",
          userInfoUrl: process.env.DQC_USER_INFO_URL ?? "",
        },
      ],
    }),
  ],
});
