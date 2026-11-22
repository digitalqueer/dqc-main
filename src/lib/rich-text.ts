// Client-safe module: the stored shape of rich-text documents (Lexical's
// serialized editor state), plus the checks shared by the editor, the server
// functions, and the public renderer. Nothing here may import Lexical, so the
// public renderer stays out of the editor's bundle. Keep imports relative:
// drizzle-kit loads this file through the database schema.
import * as z from "zod";
import { isMediaId } from "./media";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * A node in Lexical's serialized JSON. Only `type` is guaranteed. Other fields
 * are typed as JSON (not `unknown`) so server functions can return documents.
 */
export interface SerializedRichTextNode {
  type: string;
  version?: number;
  children?: SerializedRichTextNode[];
  [key: string]: JsonValue | SerializedRichTextNode[] | undefined;
}

/** What `editorState.toJSON()` produces and what we store. */
export interface RichTextDocument {
  root: SerializedRichTextNode & {
    type: "root";
    children: SerializedRichTextNode[];
  };
}

/** Upper bound on a stored document, measured as UTF-8 JSON. */
export const RICH_TEXT_MAX_BYTES = 512 * 1024;

/** True when serialized document JSON fits the storage limit. */
export function isWithinRichTextLimit(json: string) {
  return new TextEncoder().encode(json).length <= RICH_TEXT_MAX_BYTES;
}

export const richTextDocumentSchema = z
  .object({
    root: z.looseObject({
      type: z.literal("root"),
      children: z.array(z.looseObject({ type: z.string() })),
    }),
  })
  .refine(
    (document) => isWithinRichTextLimit(JSON.stringify(document)),
    "This is too large to save",
  )
  .transform((document) => document as RichTextDocument);

/**
 * Links may only point at http(s), mailto, same-site paths, or in-page
 * anchors. Used by the editor's link plugin and again by the renderer, since
 * stored JSON isn't trusted to have come from the editor.
 */
export function isSafeUrl(url: string) {
  if (url.startsWith("#")) return true;
  // Browsers read "/\host" like "//host" (another site), so neither counts as a path.
  if (url.startsWith("/")) return !/^\/[/\\]/.test(url);
  try {
    const { protocol } = new URL(url);
    return (
      protocol === "http:" || protocol === "https:" || protocol === "mailto:"
    );
  } catch {
    return false;
  }
}

/**
 * The node type for an image from the media library. The document stores
 * `{ type: "image", mediaId }`, plus `caption` when this use of the image has
 * its own: alt text, the library caption, and URLs (which are signed and
 * depend on server config) are looked up when it's shown.
 */
export const RICH_TEXT_IMAGE_TYPE = "image";

/** Images after this many in one document aren't looked up (or shown). */
export const RICH_TEXT_MAX_IMAGES = 200;

/** An image as a document shows it, resolved from the media library. */
export interface RichTextMedia {
  alt: string | null;
  caption: string | null;
  image: {
    src: string;
    srcSet: string;
    /** The original's size, for the aspect ratio; null if it wasn't known. */
    width: number | null;
    height: number | null;
  };
}

/** A document's images by media id. An image missing from it isn't shown. */
export type RichTextMediaMap = Record<string, RichTextMedia>;

/**
 * The media id of an image node, or null for any other node. Only images at
 * the top level of a document are shown, so only pass top-level nodes.
 */
export function imageMediaId(node: SerializedRichTextNode | null | undefined) {
  return node?.type === RICH_TEXT_IMAGE_TYPE && isMediaId(node.mediaId)
    ? node.mediaId
    : null;
}

/**
 * The caption an image shows: its own `caption` for this document when it
 * has one ("" means none), otherwise the library's.
 */
export function effectiveCaption(own: unknown, library_caption: string | null) {
  return typeof own === "string" ? own.trim() || null : library_caption;
}

/** The media ids of the images in these documents, without duplicates. */
export function collectMediaIds(
  documents: ReadonlyArray<RichTextDocument | null | undefined>,
) {
  const ids = new Set<string>();
  for (const document of documents) {
    const nodes = document?.root?.children;
    if (!Array.isArray(nodes)) continue;
    let count = 0;
    for (const node of nodes) {
      const id = imageMediaId(node);
      if (!id) continue;
      ids.add(id);
      if (++count >= RICH_TEXT_MAX_IMAGES) break;
    }
  }
  return [...ids];
}

/** True when the document has any visible text, or an image. */
export function hasRichTextContent(
  document: RichTextDocument | null | undefined,
) {
  if (!document) return false;
  if (document.root.children.some((node) => imageMediaId(node) !== null)) {
    return true;
  }
  const visit = (node: SerializedRichTextNode): boolean =>
    (typeof node.text === "string" && node.text.trim() !== "") ||
    (Array.isArray(node.children) && node.children.some(visit));
  return visit(document.root);
}

const INLINE_ELEMENT_TYPES = new Set(["link", "autolink"]);

/**
 * The document's text on one line, e.g. for excerpts. Blocks are joined with
 * spaces; with `max_length`, it's cut at a word boundary and ends in "…".
 */
export function toPlainText(
  document: RichTextDocument,
  max_length = Number.POSITIVE_INFINITY,
) {
  const parts: string[] = [];
  const visit = (node: SerializedRichTextNode, depth: number) => {
    if (!node || typeof node !== "object" || depth > 32) return;
    if (typeof node.text === "string") parts.push(node.text);
    else if (node.type === "linebreak") parts.push(" ");
    if (Array.isArray(node.children)) {
      for (const child of node.children) visit(child, depth + 1);
      if (!INLINE_ELEMENT_TYPES.has(node.type)) parts.push(" ");
    }
  };
  visit(document.root, 0);

  const text = parts.join("").replace(/\s+/g, " ").trim();
  if (text.length <= max_length) return text;
  const cut = text.slice(0, max_length);
  const last_space = cut.lastIndexOf(" ");
  return `${(last_space > max_length * 0.6 ? cut.slice(0, last_space) : cut).trimEnd()}…`;
}

/** Draft/publish state of a document written in the publishing editor. */
export interface PublishStatus {
  /** When the draft was last saved. */
  draftUpdatedAt: Date | null;
  /** When it went live; null while unpublished. */
  publishedAt: Date | null;
  isPublished: boolean;
  /** The saved draft differs from what's published (or was never published). */
  hasUnpublishedChanges: boolean;
}

/**
 * Works out a PublishStatus from a row's draft and published columns. jsonb
 * comes back with its keys in a normalized order, so equal documents always
 * stringify identically.
 */
export function toPublishStatus(
  row: {
    draftContent: RichTextDocument | null;
    draftUpdatedAt: Date | null;
    publishedContent: RichTextDocument | null;
    publishedAt: Date | null;
  } | null,
): PublishStatus {
  return {
    draftUpdatedAt: row?.draftUpdatedAt ?? null,
    publishedAt: row?.publishedAt ?? null,
    isPublished: row?.publishedContent != null,
    hasUnpublishedChanges:
      row?.draftContent != null &&
      JSON.stringify(row.draftContent) !==
        JSON.stringify(row.publishedContent),
  };
}

/**
 * Heading levels a document may use. dqc page titles are h2 (the site name in
 * the header is the h1), so a document's headings start at h3.
 */
export const RICH_TEXT_HEADING_TAGS = ["h3", "h4"] as const;
export type RichTextHeadingTag = (typeof RICH_TEXT_HEADING_TAGS)[number];

/** Folds any heading tag into the allowed range: h1–h3 → h3, h4–h6 → h4. */
export function toRichTextHeadingTag(tag: unknown): RichTextHeadingTag {
  return tag === "h1" || tag === "h2" || tag === "h3" ? "h3" : "h4";
}
