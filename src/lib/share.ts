// Link previews: the meta tags that sites like Slack, iMessage and Bluesky
// read (Open Graph), and X's `twitter:` versions of the main ones. The root
// route sets the defaults for every page, including a generated card as the
// image (see server/og/cards.server.tsx); a page's own tags win over them,
// tag by tag.

export const SITE_NAME = "Digital Queer Collective";

/** The home page's title, and every page's until it sets its own. */
export const SITE_TITLE = `${SITE_NAME} - Social Enterprise`;

/** Every page's description until it sets its own (the home page's lede). */
export const SITE_DESCRIPTION =
  "The Digital Queer Collective [DQC] is a community of 2SLGBTQIA+ technologists and policy strategists dedicated to creating innovative software that celebrates inclusivity, creativity, and user diversity.";

/** The size of the generated cards. */
export const SHARE_IMAGE_WIDTH = 1200;
export const SHARE_IMAGE_HEIGHT = 630;

/** A path without its trailing slash (except the root's). */
export function withoutTrailingSlash(path: string) {
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

/** Where the generated share card for the page at `path` is: /og/... */
export function shareCardPath(path: string) {
  const page = withoutTrailingSlash(path);
  return page === "/" ? "/og" : `/og${page}`;
}

/**
 * A link-preview tag as both `og:<key>` and `twitter:<key>`. X falls back to
 * the og: tag, but other readers and SEO checkers look for both.
 */
export function previewMeta(
  key: "title" | "description" | "url",
  content: string,
) {
  return [
    { property: `og:${key}`, content },
    { name: `twitter:${key}`, content },
  ];
}

/**
 * The share image: og:image and its size, in that order (the size tags
 * describe the image before them), then twitter:image.
 */
export function shareImageMeta(url: string) {
  return [
    { property: "og:image", content: url },
    { property: "og:image:width", content: `${SHARE_IMAGE_WIDTH}` },
    { property: "og:image:height", content: `${SHARE_IMAGE_HEIGHT}` },
    { name: "twitter:image", content: url },
  ];
}

/**
 * A page's title and description, as both the browser's tags and the
 * link-preview ones. The browser's title gets the site's name after it; the
 * previews' doesn't, since they show og:site_name too.
 */
export function pageMeta({
  title,
  description,
}: {
  title?: string | null;
  description?: string | null;
}) {
  return [
    ...(title
      ? [{ title: `${title} - ${SITE_NAME}` }, ...previewMeta("title", title)]
      : []),
    ...(description
      ? [
          { name: "description", content: description },
          ...previewMeta("description", description),
        ]
      : []),
  ];
}
