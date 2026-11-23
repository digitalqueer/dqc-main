// Server-only: adds people who opt in on the contact form to DQC's contacts
// in Resend, for newsletters and future communications.
import { Resend } from "resend";
import { getServerEnv } from "./env.server";

export type MailingContactResult =
  | { ok: true; id: string }
  /** Not added: Resend isn't configured, refused it, or couldn't be reached. */
  | { ok: false; detail: string };

/**
 * Creates a Resend contact. Never throws: a failure here mustn't cost the
 * person their message, so the caller saves it either way, and a request with
 * consent but no contact id shows it's still to do.
 */
export async function createMailingContact(contact: {
  email: string;
  firstName: string;
  lastName: string;
}): Promise<MailingContactResult> {
  const { secretKey } = getServerEnv().resend;
  if (!secretKey) return { ok: false, detail: "RESEND_SECRET_KEY isn't set" };
  try {
    const { data, error } = await new Resend(secretKey).contacts.create(
      contact,
    );
    if (data) return { ok: true, id: data.id };
    return { ok: false, detail: error?.message ?? "no contact returned" };
  } catch (error) {
    return {
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}
