import { createMiddleware } from "@tanstack/react-start";
import {
  getRequestHeaders,
  setResponseStatus,
} from "@tanstack/react-start/server";
import { auth } from "../auth.server";

/** Adds `session` and `user` to the context when signed in; for functions that work either way. */
export const auth_fn_middleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    return next({
      context: { ...session },
    });
  },
);

/** Responds 401 without a session. Goes first on every admin function. */
export const ensure_auth_middleware = createMiddleware({
  type: "function",
}).server(async ({ next }) => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) {
    setResponseStatus(401);
    throw new Error("Unauthorized");
  }
  return next({
    context: { ...session },
  });
});
