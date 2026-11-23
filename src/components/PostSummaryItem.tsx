import {
  ArrowUpRightIcon,
  NotebookPenIcon,
  PencilLineIcon,
} from "lucide-react";
import { type ComponentProps, useId } from "react";
import { POST_KIND_LABELS, POST_KIND_PATHS } from "@/lib/posts";
import { cn } from "@/lib/utils";
import type { listAllPosts } from "@/server/functions/posts.functions";
import Button from "./_ui/Button";
import Link from "./_ui/Link";
import { LocalTime } from "./_ui/LocalTime";

export type PostAdminSummary = Awaited<ReturnType<typeof listAllPosts>>[number];

interface PostSummaryItemProps extends ComponentProps<"li"> {
  item: PostAdminSummary;
  /** Shows an "Edit details" button when provided. */
  on_edit_click?: (item: PostAdminSummary) => void;
}

function PostStatus({ item }: { item: PostAdminSummary }) {
  if (item.isPublished && item.publishedAt) {
    return (
      <>
        Published <LocalTime date={item.publishedAt} />
        {item.hasUnpublishedChanges && " · Unpublished changes"}
      </>
    );
  }
  if (item.draftUpdatedAt) {
    return (
      <>
        Draft · saved <LocalTime date={item.draftUpdatedAt} />
      </>
    );
  }
  return (
    <>
      Draft · created <LocalTime date={item.createdAt} />, nothing written yet
    </>
  );
}

/** The public link to a published post, e.g. /thoughts/2026. */
export function PostViewLink({
  item,
  describedby,
}: {
  item: Pick<PostAdminSummary, "kind" | "slug">;
  describedby?: string;
}) {
  const label = `View ${POST_KIND_LABELS[item.kind].toLowerCase()}`;
  const props = {
    size: "icon" as const,
    target: "_blank",
    title: label,
    "aria-describedby": describedby,
    children: (
      <>
        <ArrowUpRightIcon strokeWidth={1.5} size={16} aria-hidden />
        <span className="sr-only">{label} (opens in a new tab)</span>
      </>
    ),
  };
  return item.kind === "thought" ? (
    <Link {...props} to="/thoughts/$slug" params={{ slug: item.slug }} />
  ) : (
    <Link {...props} to="/statements/$slug" params={{ slug: item.slug }} />
  );
}

/** One post in an admin list (dashboard, Posts page); render inside a <ul>. */
export function PostSummaryItem({
  item,
  on_edit_click,
  className,
  ...props
}: PostSummaryItemProps) {
  const title_id = useId();
  return (
    <li
      {...props}
      className={cn(
        "flex items-start gap-4 border border-neutral-700 p-2",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="text-sm text-neutral-300">
          {POST_KIND_LABELS[item.kind]} · <PostStatus item={item} />
        </p>
        <p id={title_id} className="font-medium">
          {item.title}
          <span className="text-sm font-normal break-all text-neutral-300">
            {" "}
            {POST_KIND_PATHS[item.kind]}/{item.slug}
          </span>
        </p>
        {item.author && (
          <p className="text-sm text-neutral-300">By {item.author}</p>
        )}
      </div>
      <Link
        size="icon"
        to="/dashboard/posts/$postId"
        params={{ postId: item.id }}
        aria-describedby={title_id}
        title="Write"
      >
        <NotebookPenIcon strokeWidth={1.5} size={16} aria-hidden />
        <span className="sr-only">Write</span>
      </Link>
      {on_edit_click && (
        <Button
          size="icon"
          aria-label="Edit details"
          aria-describedby={title_id}
          title="Edit details"
          onClick={() => on_edit_click(item)}
        >
          <PencilLineIcon strokeWidth={1.5} size={16} aria-hidden />
        </Button>
      )}
      {item.isPublished && <PostViewLink item={item} describedby={title_id} />}
    </li>
  );
}
