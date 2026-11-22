import {
  ArrowUpRightIcon,
  ChevronDownIcon,
  CodeIcon,
  GripIcon,
  LinkIcon,
  NotebookPenIcon,
  PencilLineIcon,
} from "lucide-react";
import { type ComponentProps, useId, useState } from "react";
import { projectDates } from "@/lib/projects";
import { cn } from "@/lib/utils";
import type { listProjects } from "@/server/functions/projects.functions";
import Button from "./_ui/Button";
import Link from "./_ui/Link";
import type { SortableHandleProps } from "./_ui/SortableList";

export type ProjectAdminItem = Awaited<ReturnType<typeof listProjects>>[number];

interface ProjectFormItemProps extends ComponentProps<"div"> {
  item: ProjectAdminItem;
  on_edit_click: (item: ProjectAdminItem) => void;
  /** Wires the grip button up as this row's drag handle. */
  drag_handle: SortableHandleProps;
}

function ProjectFormItem({
  className,
  item,
  on_edit_click,
  drag_handle,
  ...props
}: ProjectFormItemProps) {
  const details_id = useId();
  const [is_open, set_is_open] = useState(false);
  const has_links = !!item.websiteLink || !!item.sourceLink;
  const has_details = !!item.description || has_links;

  return (
    <div
      className={cn("flex flex-col border border-neutral-700 p-2", className)}
      {...props}
    >
      <div className="flex items-start gap-4">
        <Button size="icon" {...drag_handle}>
          <GripIcon strokeWidth={1.5} size={16} aria-hidden />
        </Button>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="text-sm text-neutral-300">
            {projectDates(item)} ·{" "}
            {item.hasPublishedPage ? "Page published" : "No page yet"}
          </p>
          <p className="font-medium">
            {item.name}
            <span className="text-sm font-normal break-all text-neutral-300">
              {" "}
              /projects/{item.id}
            </span>
          </p>
        </div>
        {has_details && (
          <Button
            size="icon"
            aria-label={`Details for ${item.name}`}
            aria-expanded={is_open}
            aria-controls={details_id}
            onClick={() => set_is_open((open) => !open)}
          >
            <ChevronDownIcon
              strokeWidth={1.5}
              size={16}
              aria-hidden
              className={cn("transition-transform", is_open && "rotate-180")}
            />
          </Button>
        )}
        <Link
          size="icon"
          to="/dashboard/projects/$projectId"
          params={{ projectId: item.id }}
          title="Write page"
        >
          <NotebookPenIcon strokeWidth={1.5} size={16} aria-hidden />
          <span className="sr-only">Write the page for {item.name}</span>
        </Link>
        <Button
          size="icon"
          aria-label={`Edit ${item.name}`}
          title="Edit details"
          onClick={() => on_edit_click(item)}
        >
          <PencilLineIcon strokeWidth={1.5} size={16} aria-hidden />
        </Button>
        {item.hasPublishedPage && (
          <Link
            size="icon"
            to="/projects/$slug"
            params={{ slug: item.id }}
            target="_blank"
            title="View page"
          >
            <ArrowUpRightIcon strokeWidth={1.5} size={16} aria-hidden />
            <span className="sr-only">
              View the page for {item.name} (opens in a new tab)
            </span>
          </Link>
        )}
      </div>
      {has_details && (
        // Indented to line up with the name (grip button + gap). Tailwind's
        // preflight hides [hidden] with !important, so `flex` can't override it.
        <div
          id={details_id}
          hidden={!is_open}
          className="flex flex-col gap-2 pt-2 pl-12 text-sm"
        >
          {item.description && <p>{item.description}</p>}
          {has_links && (
            <ul className="flex flex-col gap-1">
              {item.websiteLink && (
                <li className="flex items-center gap-2">
                  <LinkIcon strokeWidth={1.5} size={14} aria-label="Website" />
                  <a
                    href={item.websiteLink}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all underline"
                  >
                    {item.websiteLink}
                  </a>
                </li>
              )}
              {item.sourceLink && (
                <li className="flex items-center gap-2">
                  <CodeIcon
                    strokeWidth={1.5}
                    size={14}
                    aria-label="Source code"
                  />
                  <a
                    href={item.sourceLink}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all underline"
                  >
                    {item.sourceLink}
                  </a>
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export { ProjectFormItem };
