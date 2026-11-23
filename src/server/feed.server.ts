// Server-only: the RSS 2.0 feed of published thoughts, served at /rss.xml.
import {
  POST_KIND_PATHS,
  THOUGHTS_FEED_LIMIT,
  THOUGHTS_FEED_PATH,
  THOUGHTS_FEED_TITLE,
} from "../lib/posts";
import { SITE_NAME } from "../lib/share";
import { db } from "./database/index.server";
import { etagFor } from "./http.server";
import { resolveRichTextMedia } from "./media/rich-text-media.server";
import { MediaRepository } from "./repositories/media.repository.server";
import { PostsRepository } from "./repositories/posts.repository.server";
import { escapeHtml, richTextToHtml } from "./rich-text-html.server";

// XML 1.0 forbids most control characters, even escaped or inside CDATA.
const INVALID_XML_CHARS =
  // biome-ignore lint/suspicious/noControlCharactersInRegex: matching them is the point
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g;

/** Text for an XML element or attribute. */
function xmlText(value: string) {
  return escapeHtml(value.replace(INVALID_XML_CHARS, ""));
}

/** Markup carried verbatim, e.g. HTML in <content:encoded>. */
function cdata(value: string) {
  const safe = value
    .replace(INVALID_XML_CHARS, "")
    // "]]>" would end the section early; split it across two sections.
    .replaceAll("]]>", "]]]]><![CDATA[>");
  return `<![CDATA[${safe}]]>`;
}

/**
 * The newest published thoughts, each with its full content (HTML in
 * <content:encoded>) and its summary (<description>). Items are identified by
 * post id, so changing a slug doesn't make readers show a thought as new.
 */
export async function buildThoughtsFeed(origin: string) {
  const posts = await new PostsRepository(db).listFeedPosts(
    "thought",
    THOUGHTS_FEED_LIMIT,
  );
  // One lookup for every image in the feed.
  const media = await resolveRichTextMedia(
    new MediaRepository(db),
    posts.map((post) => post.content),
  );
  const thoughts_url = origin + POST_KIND_PATHS.thought;
  // A revision to an older thought can be the most recent change.
  const last_change = posts.reduce<Date | null>((latest, post) => {
    const changed = post.revisedAt ?? post.publishedAt;
    return changed && (!latest || changed > latest) ? changed : latest;
  }, null);

  const items = posts.map((post) => {
    const link = `${thoughts_url}/${encodeURIComponent(post.slug)}`;
    const summary = post.description ?? post.excerpt;
    return [
      "    <item>",
      `      <title>${xmlText(post.title)}</title>`,
      `      <link>${xmlText(link)}</link>`,
      `      <guid isPermaLink="false">urn:uuid:${post.id}</guid>`,
      post.publishedAt &&
        `      <pubDate>${post.publishedAt.toUTCString()}</pubDate>`,
      // RSS's own <author> must be an email address; Dublin Core's takes a name.
      post.author && `      <dc:creator>${xmlText(post.author)}</dc:creator>`,
      summary && `      <description>${xmlText(summary)}</description>`,
      post.content &&
        `      <content:encoded>${cdata(richTextToHtml(post.content, { base_url: link, media }))}</content:encoded>`,
      "    </item>",
    ]
      .filter(Boolean)
      .join("\n");
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    "  <channel>",
    `    <title>${xmlText(THOUGHTS_FEED_TITLE)}</title>`,
    `    <link>${xmlText(thoughts_url)}</link>`,
    `    <description>${xmlText(`Thoughts from the ${SITE_NAME}`)}</description>`,
    "    <language>en-us</language>",
    `    <atom:link href="${xmlText(origin + THOUGHTS_FEED_PATH)}" rel="self" type="application/rss+xml"/>`,
    last_change &&
      `    <lastBuildDate>${last_change.toUTCString()}</lastBuildDate>`,
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ]
    .filter(Boolean)
    .join("\n");

  return { xml, etag: await etagFor(xml) };
}
