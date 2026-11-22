import { GripIcon, NotebookPenIcon, PencilLineIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import type { listTeamMembers } from "@/server/functions/team.functions";
import Button from "./_ui/Button";
import Link from "./_ui/Link";
import { LocalTime } from "./_ui/LocalTime";
import type { SortableHandleProps } from "./_ui/SortableList";

export type TeamMemberAdminItem = Awaited<
  ReturnType<typeof listTeamMembers>
>[number];

interface TeamMemberItemProps extends ComponentProps<"div"> {
  item: TeamMemberAdminItem;
  on_edit_click: (item: TeamMemberAdminItem) => void;
  /** Wires the grip button up as this row's drag handle. */
  drag_handle: SortableHandleProps;
}

function BioStatus({ status }: { status: TeamMemberAdminItem["status"] }) {
  if (status.isPublished && status.publishedAt) {
    return (
      <>
        On the About page since <LocalTime date={status.publishedAt} />
        {status.hasUnpublishedChanges && " · Unpublished changes"}
      </>
    );
  }
  if (status.draftUpdatedAt) {
    return (
      <>
        Not on the About page · draft bio saved{" "}
        <LocalTime date={status.draftUpdatedAt} />
      </>
    );
  }
  return <>Not on the About page · no bio yet</>;
}

/** One person on the admin Team page. */
function TeamMemberItem({
  className,
  item,
  on_edit_click,
  drag_handle,
  ...props
}: TeamMemberItemProps) {
  return (
    <div
      className={cn("border border-neutral-700 flex items-start gap-4 p-2", className)}
      {...props}
    >
      <Button size="icon" {...drag_handle}>
        <GripIcon strokeWidth={1.5} size={16} aria-hidden />
      </Button>
      <div className="flex flex-col flex-1 min-w-0">
        <p className="text-sm text-neutral-300">
          <BioStatus status={item.status} />
        </p>
        <p className="font-medium">
          {item.name}
          {item.pronouns && (
            <span className="text-neutral-300 font-normal text-sm">
              {" "}
              {item.pronouns}
            </span>
          )}
        </p>
      </div>
      <Link
        size="icon"
        to="/dashboard/team/$memberId"
        params={{ memberId: item.id }}
        title="Write bio"
      >
        <NotebookPenIcon strokeWidth={1.5} size={16} aria-hidden />
        <span className="sr-only">Write the bio for {item.name}</span>
      </Link>
      <Button
        size="icon"
        aria-label={`Edit ${item.name}`}
        title="Edit details"
        onClick={() => on_edit_click(item)}
      >
        <PencilLineIcon strokeWidth={1.5} size={16} aria-hidden />
      </Button>
    </div>
  );
}

export { TeamMemberItem };
