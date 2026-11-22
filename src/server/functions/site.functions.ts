import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { resolveSiteOrigin } from "@/server/http.server";

// The site's public origin, for the absolute URLs link previews need
// (SITE_URL, or else the request's).
export const getSiteOrigin = createServerFn({ method: "GET" }).handler(() =>
  resolveSiteOrigin(getRequest().url),
);
