import { createMiddleware } from "@tanstack/react-start";
import { db } from "../database/index.server";
import { ProjectsRepository } from "../repositories/projects.repository.server";

export const projects_middleware = createMiddleware().server(({ next }) => {
  return next({
    context: {
      projects: new ProjectsRepository(db),
    },
  });
});
