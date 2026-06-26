import {
  CONTACT_TURNSTILE_ACTION,
  NewContactRequest,
} from "@/schemas/contactRequest.schema";
import { validateTurnstileToken } from "../turnstile/turnstile.server";
import { Prettify } from "@/lib/utils";
import { db } from "@/db/database";
import {
  contactRequestTable,
  SelectableContactRequest,
} from "@dqc/data/schema";
import { Resend } from "resend";
import { serverEnv } from "@/env";

type ContactRequestErrorCode =
  | "invalid-token"
  | "mail-contact-error"
  | "sql_error";

export type ValidContactRequestResponse = {
  success: true;
  contactRequest: SelectableContactRequest;
};

export type InvalidContactRequestReponse = {
  success: false;
  errors: ContactRequestErrorCode[];
};

export type CreateContactRequestResponse = Prettify<
  ValidContactRequestResponse | InvalidContactRequestReponse
>;

export async function createContactRequest(
  contactRequest: NewContactRequest,
): Promise<CreateContactRequestResponse> {
  const turnstileValidation = await validateTurnstileToken(
    contactRequest.turnstileToken,
    CONTACT_TURNSTILE_ACTION,
  );
  if (!turnstileValidation.success) {
    return {
      success: false,
      errors: ["invalid-token"],
    };
  }
  let communicationsId: string = "";
  if (contactRequest.communicationsConsent) {
    const resend = new Resend(serverEnv.RESEND_SECRET_KEY);
    const resendContactResponse = await resend.contacts.create({
      email: contactRequest.email,
      firstName: contactRequest.firstName,
      lastName: contactRequest.lastName,
    });
    if (!resendContactResponse.data) {
      return {
        success: false,
        errors: ["mail-contact-error"],
      };
    }
    communicationsId = resendContactResponse.data.id;
  }
  try {
    const insertedContactRequest = await db
      .insert(contactRequestTable)
      .values({
        firstName: contactRequest.firstName,
        lastName: contactRequest.lastName,
        email: contactRequest.email,
        comment: contactRequest.comment,
        communicationsConsent: contactRequest.communicationsConsent,
        communicationsId,
      })
      .returning();
    return {
      success: true,
      contactRequest: insertedContactRequest[0],
    };
  } catch (err) {
    console.error(err);
    console.error("Create contact request - sql_error");
    return {
      success: false,
      errors: ["sql_error"],
    };
  }
}
