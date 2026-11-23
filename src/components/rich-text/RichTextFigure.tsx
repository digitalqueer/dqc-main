// An image in a rich-text document, as published and as shown in the editor.
// No Lexical imports: the public renderer uses this too.
import type { ReactNode } from "react";
import type { RichTextMedia } from "@/lib/rich-text";
import { MediaImage } from "../media/MediaImage";
import { RICH_TEXT_CLASSES, RICH_TEXT_IMAGE_SIZES } from "./richTextClasses";

interface RichTextFigureProps {
  media: RichTextMedia;
  /** What to show under it (see effectiveCaption); null for nothing. */
  caption: string | null;
  className?: string;
  /** Off in the editor, where dragging the picture would paste a copy. */
  draggable?: boolean;
  /** Extra content inside the figure, e.g. the editor's controls. */
  children?: ReactNode;
}

export function RichTextFigure({
  media,
  caption,
  className,
  draggable,
  children,
}: RichTextFigureProps) {
  return (
    <figure className={className}>
      <MediaImage
        image={media.image}
        // Without alt text the image is skipped by screen readers rather than
        // read out as a URL; the editor flags it so it gets written.
        alt={media.alt ?? ""}
        sizes={RICH_TEXT_IMAGE_SIZES}
        loading="lazy"
        draggable={draggable}
        className={RICH_TEXT_CLASSES.image}
        // With srcset widths, the browser sizes the image to `sizes`, so a
        // small one (a logo, say) would be stretched and blurry. Cap it at
        // its own width.
        style={
          media.image.width
            ? { maxWidth: `min(100%, ${media.image.width}px)` }
            : undefined
        }
      />
      {caption && (
        <figcaption className={RICH_TEXT_CLASSES.figcaption}>
          {caption}
        </figcaption>
      )}
      {children}
    </figure>
  );
}
