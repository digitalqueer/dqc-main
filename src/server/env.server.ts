// Server-only (the `.server.ts` suffix makes the build reject client imports).
//
// Env is read on every call, never at module scope, so a module-level read can
// never be inlined into a client bundle or evaluated before the process env is set.

// Loads .env (if there is one) into process.env, without overriding what's
// already set. The database module does the same; this makes sure it has
// happened however this module is reached first.
import "dotenv/config";

export function getServerEnv() {
  return {
    // Cloudflare Turnstile, in front of the contact form. The site key is
    // public: the server hands it to the page at request time (it's never
    // built into the client bundle, despite the VITE_ prefix), so both keys
    // are set wherever the server runs.
    turnstile: {
      siteKey: process.env.VITE_CLOUDFLARE_SITEKEY ?? "",
      secretKey: process.env.CLOUDFLARE_SECRET_KEY ?? "",
    },
    // Adds people who opt in on the contact form to DQC's mailing contacts.
    resend: {
      secretKey: process.env.RESEND_SECRET_KEY ?? "",
    },
  };
}
