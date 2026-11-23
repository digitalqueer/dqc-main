// The Lexical node types and Markdown shortcuts a rich-text document may use.
// Shared by the editor and by scripts that build documents headlessly (e.g.
// the content migration's generator), so both produce JSON the editor can
// load. No React imports here.
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import {
  type ElementTransformer,
  HEADING,
  TRANSFORMERS,
} from "@lexical/markdown";
import { $isHeadingNode, HeadingNode, QuoteNode } from "@lexical/rich-text";

export const RICH_TEXT_NODES = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  AutoLinkNode,
  CodeNode,
  CodeHighlightNode,
];

/**
 * Markdown headings, one level below the page title (an h2): "## " makes a
 * heading (h3) and "### " or deeper a subheading (h4). "# " is a heading too.
 */
const RICH_TEXT_HEADING: ElementTransformer = {
  ...HEADING,
  export: (node, exportChildren) =>
    $isHeadingNode(node)
      ? `${node.getTag() === "h3" ? "##" : "###"} ${exportChildren(node)}`
      : null,
  replace: (parent, children, match, is_import) => {
    // HEADING makes an h{n} from n #s (match[1]); hand it the level we want.
    const level = match[1].length <= 2 ? 3 : 4;
    const shifted = Object.assign([...match], { 1: "#".repeat(level) });
    return HEADING.replace(
      parent,
      children,
      shifted as unknown as RegExpMatchArray,
      is_import,
    );
  },
};

/** Lexical's Markdown shortcuts, with headings mapped as above. */
export const RICH_TEXT_TRANSFORMERS = TRANSFORMERS.map((transformer) =>
  transformer === HEADING ? RICH_TEXT_HEADING : transformer,
);
