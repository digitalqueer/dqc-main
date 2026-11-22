import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import * as z from "zod";
import {
  POST_KIND_LABELS,
  POST_KINDS,
  type PostKind,
  postContentSchema,
  postIdSchema,
  postInputSchema,
  postListLimitSchema,
  postSlugSchema,
  postUpdateSchema,
} from "@/lib/posts";
import { hasRichTextContent } from "@/lib/rich-text";
import { ensure_auth_middleware } from "@/server/middleware/auth.middleware";
import { posts_middleware } from "@/server/middleware/posts.middleware";

// <-- Public: published posts only -->

/** /thoughts: every published thought, newest first. */
export const listPublishedThoughts = createServerFn({ method: "GET" })
  .middleware([posts_middleware])
  .handler(({ context }) => context.posts.listPublishedPosts("thought"));

/**
 * /thoughts/{slug} and /statements/{slug}: the post and its published
 * content. Drafts are never sent.
 */
export const getPublishedPost = createServerFn({ method: "GET" })
  .middleware([posts_middleware])
  .validator(postSlugSchema.extend({ kind: z.enum(POST_KINDS) }))
  .handler(async ({ context, data }) => {
    const row = await context.posts.getPublishedPost(data.kind, data.slug);
    if (!row) throw notFound();
    const { content, publishedAt, ...post } = row;
    if (!content || !publishedAt) throw notFound();
    return { post: { ...post, publishedAt }, content };
  });

// <-- Admin -->

export const listAllPosts = createServerFn({ method: "GET" })
  .middleware([ensure_auth_middleware, posts_middleware])
  .handler(({ context }) => context.posts.listAllPosts());

export const listRecentlyEditedPosts = createServerFn({ method: "GET" })
  .middleware([ensure_auth_middleware, posts_middleware])
  .validator(postListLimitSchema)
  .handler(({ context, data }) =>
    context.posts.listRecentlyEditedPosts(data.limit),
  );

/** Editor: the post's details, its saved draft, and publish status. */
export const getPostEditor = createServerFn({ method: "GET" })
  .middleware([ensure_auth_middleware, posts_middleware])
  .validator(postIdSchema)
  .handler(async ({ context, data }) => {
    const row = await context.posts.getPostForEditor(data.id);
    if (!row) throw notFound();
    const { draftContent, ...post } = row;
    return {
      post,
      content: draftContent,
      status: {
        draftUpdatedAt: post.draftUpdatedAt,
        publishedAt: post.publishedAt,
        isPublished: post.isPublished,
        hasUnpublishedChanges: post.hasUnpublishedChanges,
      },
    };
  });

function slugTaken(kind: PostKind, slug: string): never {
  setResponseStatus(409);
  throw new Error(
    `Another ${POST_KIND_LABELS[kind].toLowerCase()} already uses the slug "${slug}". Pick a different one.`,
  );
}

export const createPost = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, posts_middleware])
  .validator(postInputSchema)
  .handler(async ({ context, data }) => {
    if (await context.posts.findPostIdBySlug(data.kind, data.slug)) {
      slugTaken(data.kind, data.slug);
    }
    return await context.posts.createPost(data);
  });

export const updatePost = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, posts_middleware])
  .validator(postUpdateSchema)
  .handler(async ({ context, data: { id, ...details } }) => {
    const slug_owner = await context.posts.findPostIdBySlug(
      details.kind,
      details.slug,
    );
    if (slug_owner && slug_owner !== id) slugTaken(details.kind, details.slug);
    const post = await context.posts.updatePost(id, details);
    if (!post) throw notFound();
    return post;
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, posts_middleware])
  .validator(postIdSchema)
  .handler(async ({ context, data }) => {
    const post = await context.posts.deletePost(data.id);
    if (!post) throw notFound();
    return post;
  });

export const savePostDraft = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, posts_middleware])
  .validator(postContentSchema)
  .handler(async ({ context, data }) => {
    const status = await context.posts.savePostDraft(data.id, data.content);
    if (!status) throw notFound();
    return status;
  });

export const publishPost = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, posts_middleware])
  .validator(postContentSchema)
  .handler(async ({ context, data }) => {
    if (!hasRichTextContent(data.content)) {
      setResponseStatus(400);
      throw new Error("Write something before publishing.");
    }
    const status = await context.posts.publishPost(data.id, data.content);
    if (!status) throw notFound();
    return status;
  });

export const unpublishPost = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, posts_middleware])
  .validator(postIdSchema)
  .handler(async ({ context, data }) => {
    const status = await context.posts.unpublishPost(data.id);
    if (!status) throw notFound();
    return status;
  });
