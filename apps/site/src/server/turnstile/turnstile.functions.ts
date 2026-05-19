import { CONTACT_TURNSTILE_ACTION } from "@/schemas/contactRequest.schema";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { validateTurnstileToken } from "./turnstile.server";

export const validateServerFn = createServerFn({
  method: "POST",
})
  .inputValidator(
    z.object({ token: z.string(), action: z.enum([CONTACT_TURNSTILE_ACTION]) }),
  )
  .handler(async ({ data }) => validateTurnstileToken(data.token, data.action));
