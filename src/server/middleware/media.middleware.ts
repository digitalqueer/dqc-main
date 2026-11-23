import { createMiddleware } from "@tanstack/react-start";
import { db } from "../database/index.server";
import { MediaRepository } from "../repositories/media.repository.server";

export const media_middleware = createMiddleware().server(({ next }) => {
  return next({
    context: {
      media: new MediaRepository(db),
    },
  });
});
