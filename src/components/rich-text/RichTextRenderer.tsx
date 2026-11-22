// Renders a stored rich-text document (Lexical's serialized JSON) as plain
// React elements, on the server and client alike, without loading Lexical.
// Stored JSON is treated as untrusted: only known node types and fields are
// rendered, links must pass `isSafeUrl`, and images come only from the
// server-resolved `media` map (the document holds just their ids).
import { type CSSProperties, createContext, type ReactNode, useContext } from "react";
import {
  effectiveCaption,
  imageMediaId,
  isSafeUrl,
  type RichTextDocument,
  type RichTextMediaMap,
  type SerializedRichTextNode,
  toRichTextHeadingTag,
} from "@/lib/rich-text";
import { RICH_TEXT_CLASSES } from "./richTextClasses";
import { RichTextFigure } from "./RichTextFigure";

// Lexical's text format bit flags.
const IS_BOLD = 1;
const IS_ITALIC = 1 << 1;
const IS_STRIKETHROUGH = 1 << 2;
const IS_UNDERLINE = 1 << 3;
const IS_CODE = 1 << 4;
const IS_SUBSCRIPT = 1 << 5;
const IS_SUPERSCRIPT = 1 << 6;
const IS_HIGHLIGHT = 1 << 7;

/** Lexical documents nest a few levels deep; anything past this is dropped. */
const MAX_DEPTH = 32;

const TEXT_ALIGNMENTS = new Set(["left", "center", "right", "justify", "start", "end"]);

/** How many levels to push headings down, e.g. 1 under an h3 (h3 → h4). */
const HeadingShiftContext = createContext(0);

const NO_MEDIA: RichTextMediaMap = {};
const MediaContext = createContext(NO_MEDIA);

function children_of(node: SerializedRichTextNode, depth: number) {
  if (!Array.isArray(node.children) || depth >= MAX_DEPTH) return null;
  return node.children.map((child, index) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: stored nodes have no ids, and a rendered document never reorders
    <RichTextNode key={index} node={child} depth={depth + 1} />
  ));
}

/** Alignment and indent, which Lexical stores on block nodes. */
function block_style(node: SerializedRichTextNode): CSSProperties | undefined {
  const style: CSSProperties = {};
  if (typeof node.format === "string" && TEXT_ALIGNMENTS.has(node.format)) {
    style.textAlign = node.format as CSSProperties["textAlign"];
  }
  if (typeof node.indent === "number" && node.indent > 0) {
    style.paddingInlineStart = `${Math.min(node.indent, 10) * 40}px`;
  }
  return Object.keys(style).length ? style : undefined;
}

function TextLeaf({ node }: { node: SerializedRichTextNode }) {
  if (typeof node.text !== "string") return null;
  const format = typeof node.format === "number" ? node.format : 0;
  const underline = format & IS_UNDERLINE;
  const strikethrough = format & IS_STRIKETHROUGH;

  let content: ReactNode = node.text;
  if (underline || strikethrough) {
    content = (
      <span
        className={
          underline && strikethrough
            ? RICH_TEXT_CLASSES.underlineStrikethrough
            : underline
              ? RICH_TEXT_CLASSES.underline
              : RICH_TEXT_CLASSES.strikethrough
        }
      >
        {content}
      </span>
    );
  }
  if (format & IS_ITALIC) content = <em>{content}</em>;
  if (format & IS_BOLD) content = <strong>{content}</strong>;
  if (format & IS_SUBSCRIPT) content = <sub>{content}</sub>;
  if (format & IS_SUPERSCRIPT) content = <sup>{content}</sup>;
  if (format & IS_HIGHLIGHT) {
    content = <mark className={RICH_TEXT_CLASSES.highlight}>{content}</mark>;
  }
  if (format & IS_CODE) {
    content = <code className={RICH_TEXT_CLASSES.code}>{content}</code>;
  }
  return <>{content}</>;
}

function RichTextNode({
  node,
  depth,
}: {
  node: SerializedRichTextNode;
  depth: number;
}): ReactNode {
  if (!node || typeof node !== "object") return null;

  switch (node.type) {
    case "text":
    case "code-highlight":
      return <TextLeaf node={node} />;
    case "tab":
      return "\t";
    case "linebreak":
      return <br />;

    case "paragraph": {
      // Empty paragraphs are spacing left in the editor; prose margins cover it.
      if (!Array.isArray(node.children) || node.children.length === 0) {
        return null;
      }
      return <p style={block_style(node)}>{children_of(node, depth)}</p>;
    }
    case "heading":
      return <Heading node={node} depth={depth} />;
    case "quote":
      return (
        <blockquote style={block_style(node)}>
          {children_of(node, depth)}
        </blockquote>
      );
    case "list": {
      if (node.listType === "number") {
        const start = typeof node.start === "number" ? node.start : undefined;
        return <ol start={start}>{children_of(node, depth)}</ol>;
      }
      return <ul>{children_of(node, depth)}</ul>;
    }
    case "listitem": {
      const children = Array.isArray(node.children) ? node.children : [];
      const is_wrapper =
        children.length > 0 && children.every((child) => child?.type === "list");
      return (
        <li
          value={typeof node.value === "number" ? node.value : undefined}
          className={is_wrapper ? RICH_TEXT_CLASSES.nested_list_item : undefined}
        >
          {children_of(node, depth)}
        </li>
      );
    }
    case "code":
      return (
        <pre
          className={RICH_TEXT_CLASSES.code_block}
          data-language={typeof node.language === "string" ? node.language : undefined}
        >
          <code>{children_of(node, depth)}</code>
        </pre>
      );
    case "link":
    case "autolink": {
      const url = typeof node.url === "string" ? node.url : "";
      // An unsafe or missing URL still shows its text, just not as a link.
      if (!isSafeUrl(url)) return <>{children_of(node, depth)}</>;
      const is_external = /^https?:/i.test(url);
      return (
        <a
          href={url}
          title={typeof node.title === "string" ? node.title : undefined}
          {...(is_external && { target: "_blank", rel: "noreferrer" })}
        >
          {children_of(node, depth)}
          {is_external && <span className="sr-only"> (opens in a new tab)</span>}
        </a>
      );
    }

    case "image":
      // Top level only (depth 1): a <figure> inside a <p> or <li> would be
      // invalid HTML. The editor keeps images there.
      return depth === 1 ? <Image node={node} /> : null;

    default:
      // Unknown block or inline: keep its text rather than drop it.
      return <>{children_of(node, depth)}</>;
  }
}

function Image({ node }: { node: SerializedRichTextNode }) {
  const media = useContext(MediaContext);
  const id = imageMediaId(node);
  const item = id ? media[id] : undefined;
  // Deleted from the library, or imgproxy isn't set up: leave it out.
  return item ? (
    <RichTextFigure
      media={item}
      caption={effectiveCaption(node.caption, item.caption)}
    />
  ) : null;
}

/** h3 or h4 (see toRichTextHeadingTag), pushed down by the heading shift. */
function Heading({
  node,
  depth,
}: {
  node: SerializedRichTextNode;
  depth: number;
}) {
  const shift = useContext(HeadingShiftContext);
  const level = Math.min(Number(toRichTextHeadingTag(node.tag)[1]) + shift, 6);
  const Tag = `h${level}` as "h3" | "h4" | "h5" | "h6";
  return <Tag style={block_style(node)}>{children_of(node, depth)}</Tag>;
}

interface RichTextRendererProps {
  document: RichTextDocument;
  /**
   * Pushes headings down this many levels, for a document shown under a
   * heading of its own level (e.g. a bio under its h3 name). Defaults to 0:
   * headings render as h3 and h4, under the page's h2 title.
   */
  heading_shift?: number;
  /** The document's images by media id, from the server (resolveRichTextMedia). */
  media?: RichTextMediaMap;
  className?: string;
}

export function RichTextRenderer({
  document,
  heading_shift = 0,
  media = NO_MEDIA,
  className,
}: RichTextRendererProps) {
  return (
    <HeadingShiftContext.Provider value={heading_shift}>
      <MediaContext.Provider value={media}>
        <div className={className}>{children_of(document.root, 0)}</div>
      </MediaContext.Provider>
    </HeadingShiftContext.Provider>
  );
}
