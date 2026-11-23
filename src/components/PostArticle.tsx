import type { ReactNode } from "react";
import Prose from "@/components/_ui/Prose";
import { PublishedDate } from "@/components/_ui/PublishedDate";
import { RichTextRenderer } from "@/components/rich-text/RichTextRenderer";
import type { getPublishedPost } from "@/server/functions/posts.functions";

type PublishedPost = Awaited<ReturnType<typeof getPublishedPost>>;

/** Same calendar day as PublishedDate shows it (UTC). */
const isSameDay = (a: Date, b: Date) =>
  a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);

/** A published thought or statement: title, byline, content, and dates. */
export function PostArticle({
  post,
  content,
  breadcrumbs,
}: PublishedPost & { breadcrumbs: ReactNode }) {
  const revised_at =
    post.revisedAt && !isSameDay(post.revisedAt, post.publishedAt)
      ? post.revisedAt
      : null;

  return (
    <>
      {breadcrumbs}
      <Prose>
        {/* Wrapped, so prose's no-margin-on-the-first-child rule needs repeating. */}
        <article className="[&>:first-child]:mt-0">
          <h2 className="mb-2">{post.title}</h2>
          {post.author && <p className="text-sm">Written by {post.author}</p>}
          <RichTextRenderer document={content} className="rich-text" />
          <p className="text-neutral-400">
            Published <PublishedDate date={post.publishedAt} />
            {revised_at && (
              <>
                {" · Updated "}
                <PublishedDate date={revised_at} />
              </>
            )}
          </p>
        </article>
      </Prose>
    </>
  );
}

/** <title> and description for a published post's page. */
export function postHead(loaderData: PublishedPost | undefined) {
  if (!loaderData) return {};
  const { title, description, excerpt } = loaderData.post;
  const summary = description ?? excerpt;
  return {
    meta: [
      { title: `${title} - Digital Queer Collective` },
      ...(summary ? [{ name: "description", content: summary }] : []),
      { property: "og:type", content: "article" },
    ],
  };
}
