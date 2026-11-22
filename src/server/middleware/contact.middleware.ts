import { createMiddleware } from "@tanstack/react-start";
import { db } from "../database/index.server";
import { ContactRequestRepository } from "../repositories/contact-request.repository.server";

export const contact_middleware = createMiddleware().server(({ next }) => {
  return next({
    context: {
      contactRequests: new ContactRequestRepository(db),
    },
  });
});
