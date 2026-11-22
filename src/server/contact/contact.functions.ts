import { NewContactRequestSchema } from "@/schemas/contactRequest.schema";
import { getServerEnv } from "@/server/env.server";
import { createServerFn } from "@tanstack/react-start";
import { createContactRequest } from "./contact.server";

/**
 * The Turnstile site key for the contact form, or null while it isn't set.
 * Read when the server runs (not built into the client), so the image can be
 * built without any of the site's settings.
 */
export const getContactFormServerFn = createServerFn({ method: "GET" }).handler(
  () => ({ turnstileSiteKey: getServerEnv().turnstile.siteKey || null }),
);

export const createContactRequestServerFn = createServerFn({
  method: "POST",
})
  .inputValidator(NewContactRequestSchema)
  .handler(async ({ data }) => {
    return createContactRequest(data);
  });
