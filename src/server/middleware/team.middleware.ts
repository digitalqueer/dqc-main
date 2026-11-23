import { createMiddleware } from "@tanstack/react-start";
import { db } from "../database/index.server";
import { TeamRepository } from "../repositories/team.repository.server";

export const team_middleware = createMiddleware().server(({ next }) => {
  return next({
    context: {
      team: new TeamRepository(db),
    },
  });
});
