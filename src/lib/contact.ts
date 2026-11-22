// Client-safe module: the public contact form and the admin inbox, shared by
// the forms and the contact server functions. Keep imports relative: drizzle-kit
// may load lib modules through the database schema.
import * as z from "zod";

/** The name columns are varchar(255). */
export const CONTACT_NAME_MAX_LENGTH = 255;
// The longest address SMTP allows (the column is varchar(255)).
export const CONTACT_EMAIL_MAX_LENGTH = 254;
export const CONTACT_COMMENT_MAX_LENGTH = 5000;

/** The Turnstile widget's action; the server checks tokens were made for it. */
export const CONTACT_TURNSTILE_ACTION = "contact-request";

/** Requests per page in the admin's "Read" list. */
export const CONTACT_REQUESTS_PAGE_SIZE = 20;

const nameField = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Enter your ${label}`)
    .max(
      CONTACT_NAME_MAX_LENGTH,
      `Keep it under ${CONTACT_NAME_MAX_LENGTH} characters`,
    );

/** What a visitor fills in. Also validates the form as they type. */
export const contactRequestInputSchema = z.object({
  firstName: nameField("first name"),
  lastName: nameField("last name"),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address so we can reply")
    .max(CONTACT_EMAIL_MAX_LENGTH, "That email address is too long")
    .pipe(z.email("Enter an email address, e.g. jane.doe@email.com")),
  comment: z
    .string()
    .trim()
    .min(1, "Write a question or comment")
    .max(
      CONTACT_COMMENT_MAX_LENGTH,
      `Keep it under ${CONTACT_COMMENT_MAX_LENGTH.toLocaleString("en-US")} characters`,
    ),
  /** Join DQC's newsletters and future communications. */
  communicationsConsent: z.boolean(),
});
export type ContactRequestInput = z.input<typeof contactRequestInputSchema>;

/** What the form sends: the fields plus the Turnstile token. */
export const contactSubmissionSchema = contactRequestInputSchema.extend({
  // Turnstile tokens are at most 2048 characters.
  turnstileToken: z
    .string()
    .min(1, "Complete the check that you're human")
    .max(2048),
});

export const contactRequestIdSchema = z.object({ id: z.uuid() });

export const contactRequestReadSchema = contactRequestIdSchema.extend({
  read: z.boolean(),
});

/** /dashboard/requests?page= (the "Read" list). A bad value falls back to 1. */
export const contactRequestsSearchSchema = z.object({
  page: z.number().int().min(1).max(10_000).default(1).catch(1),
});

/** How a request is named in the admin, e.g. in "Deleted Jane Doe". */
export function contactName(request: { firstName: string; lastName: string }) {
  return `${request.firstName} ${request.lastName}`.trim();
}

/** mailto: for replying. The address passed the email check above. */
export function replyHref(email: string) {
  const address = encodeURIComponent(email).replace(/%40/g, "@");
  return `mailto:${address}?subject=${encodeURIComponent("Re: Your message to DQC")}`;
}
