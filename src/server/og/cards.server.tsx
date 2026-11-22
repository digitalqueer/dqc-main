// Server-only: share cards for link previews, as image responses (see
// routes/og/$.ts).
//
// A card's text comes from the page's path, never from the request, so the
// endpoint can't be used to put arbitrary words on the site's cards. It's the
// page's breadcrumbs (PAGE_CRUMBS), with the crumbs that depend on the page
// (a post's title, ...) looked up from published content only.
import type { getRouter } from "@/router";
import { SITE_NAME } from "../../lib/share";
import { db } from "../database/index.server";
import { etagFor, matchesEtag, resolveSiteOrigin } from "../http.server";
import { PostsRepository } from "../repositories/posts.repository.server";
import { ProjectsRepository } from "../repositories/projects.repository.server";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  ShareCard,
  type ShareCardContent,
} from "./designs.server";

/**
 * The renderer, loaded when the first card is drawn rather than with the
 * routes: with its WebAssembly, it's a few MB.
 */
const renderer = () => import("./render.server");

/** Bump when the design changes, so caches and crawlers fetch new cards. */
const DESIGN_VERSION = 1;

/** Crawlers fetch a card once per share; let them and the CDN reuse it a day. */
const CARD_CACHE_CONTROL = "public, max-age=86400";

/** The home page's card (and any page's without crumbs): its first heading. */
const HOME_TITLE = "Building an Infrastructure for Change";

/** Routes that never get a card: the admin pages, the APIs, and the cards. */
const NO_CARD_ROUTE_PREFIXES = ["/_authenticated", "/api", "/og"];

/** The last crumb, if found: e.g. a post's title, or nothing if it's a draft. */
const withPage = (section: string[], page: string | null | undefined) =>
  page ? [...section, page] : section;

/**
 * Each page's crumbs after Home, the last being the card's title, by route
 * id. Keep in step with the pages' breadcrumbs. A page that's missing gets
 * the home page's card. A crumb that isn't found (e.g. an unpublished post)
 * is left out, so the card shows the section instead.
 */
const PAGE_CRUMBS: Record<
  string,
  (params: Record<string, string>) => Promise<string[]>
> = {
  "/about": async () => ["About"],
  "/login": async () => ["Sign In"],
  "/projects/": async () => ["Projects"],
  "/projects/$slug": async ({ slug }) => {
    const projects = new ProjectsRepository(db);
    const [project, page] = await Promise.all([
      projects.getProject(slug),
      projects.getProjectPage(slug),
    ]);
    // Same rule as the page: only a published page is there to share.
    return withPage(["Projects"], page?.publishedAt ? project?.name : null);
  },
  "/thoughts/": async () => ["Thoughts"],
  "/thoughts/$slug": async ({ slug }) =>
    withPage(
      ["Thoughts"],
      (await new PostsRepository(db).getPublishedPost("thought", slug))?.title,
    ),
  // Statements sit under About (see routes/statements/$slug.tsx).
  "/statements/$slug": async ({ slug }) =>
    withPage(
      ["About"],
      (await new PostsRepository(db).getPublishedPost("statement", slug))
        ?.title,
    ),
};

type Router = ReturnType<typeof getRouter>;
let router: Promise<Router> | null = null;

/**
 * The app's routes that `path` matches, root first. The router is imported
 * lazily, since it imports every route (this module's own route included).
 */
async function matchRoutes(path: string) {
  router ??= import("@/router").then((module) => module.getRouter());
  return (await router).getMatchedRoutes(path);
}

/** The page's crumbs after Home, or null when the path has no card. */
async function crumbsFor(path: string) {
  const [routes, params, found] = await matchRoutes(path);
  // No page there, or a server route (an API, a feed, this one). The match
  // is fuzzy: for /thoughts/x/extra it's /thoughts/$slug, with the rest of
  // the path in "**". The router shows its not-found page for those.
  if (!found || params["**"] || found.options.server) return null;
  const is_excluded = routes.some((route) =>
    NO_CARD_ROUTE_PREFIXES.some((prefix) => route.id.startsWith(prefix)),
  );
  if (is_excluded) return null;
  return (await PAGE_CRUMBS[found.id]?.(params)) ?? [];
}

/** What the card for `path` says, or null when it has none. */
export async function shareCardContent(
  path: string,
  request_url: string,
): Promise<ShareCardContent | null> {
  const crumbs = await crumbsFor(path);
  if (!crumbs) return null;
  const brand = SITE_NAME;
  const host = new URL(resolveSiteOrigin(request_url)).host;
  const title = crumbs.at(-1);
  if (title === undefined) {
    return { brand, host, section: [], title: HOME_TITLE };
  }
  return { brand, host, section: crumbs.slice(0, -1), title };
}

/** Recently drawn cards by ETag, so repeat requests skip the drawing. */
const drawn = new Map<string, Uint8Array>();
const DRAWN_LIMIT = 100;

/** The share card for the page at `path`: a 1200×630 PNG, or a 404. */
export async function shareCardResponse(request: Request, path: string) {
  const content = await shareCardContent(path, request.url);
  if (!content) return new Response("Not found", { status: 404 });
  // The ETag covers the content and the design version.
  const etag = await etagFor(JSON.stringify([DESIGN_VERSION, content]));
  const headers = { "Cache-Control": CARD_CACHE_CONTROL, ETag: etag };
  if (matchesEtag(request.headers.get("if-none-match"), etag)) {
    return new Response(null, { status: 304, headers });
  }
  let body = drawn.get(etag);
  if (body === undefined) {
    body = await (await renderer()).renderPng(
      <ShareCard {...content} />,
      CARD_WIDTH,
      CARD_HEIGHT,
    );
    // A Map keeps insertion order, so the first key is the oldest.
    const oldest = drawn.keys().next().value;
    if (drawn.size >= DRAWN_LIMIT && oldest !== undefined) drawn.delete(oldest);
    drawn.set(etag, body);
  }
  return new Response(body as BodyInit, {
    headers: { ...headers, "Content-Type": "image/png" },
  });
}
