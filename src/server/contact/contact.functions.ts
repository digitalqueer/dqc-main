import { NewContactRequestSchema } from "@/schemas/contactRequest.schema";
import { createServerFn } from "@tanstack/react-start";
import { createContactRequest } from "./contact.server";

export const createContactRequestServerFn = createServerFn({
  method: "POST",
})
  .inputValidator(NewContactRequestSchema)
  .handler(async ({ data }) => {
    return createContactRequest(data);
  });
