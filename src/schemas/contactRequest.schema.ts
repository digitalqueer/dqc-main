import z from "zod";

export const CONTACT_TURNSTILE_ACTION = "contact-request";

export const NewContactRequestSchema = z.object({
  firstName: z
    .string()
    .trim()
    .nonempty({ error: "First Name field cannot be empty" }),
  lastName: z
    .string()
    .trim()
    .nonempty({ error: "Last Name field cannot be empty" }),
  email: z.email().nonempty({ error: "Email field cannot be empty" }).trim(),
  comment: z
    .string()
    .trim()
    .nonempty({ error: "Comment field cannot be empty" }),
  communicationsConsent: z.boolean(),
  turnstileToken: z
    .string()
    .trim()
    .nonempty({ error: "Please confirm your humanity" }),
});

export type NewContactRequest = z.output<typeof NewContactRequestSchema>;
export type ContactRequest = NewContactRequest & { id: string };
