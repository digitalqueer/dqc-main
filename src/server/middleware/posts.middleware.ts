import { createMiddleware } from "@tanstack/react-start";
import { db } from "../database/index.server";
import { PostsRepository } from "../repositories/posts.repository.server";

export const posts_middleware = createMiddleware().server(({ next }) => {
  return next({
    context: {
      posts: new PostsRepository(db),
    },
  });
});
