import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FolderArchiveIcon, FolderPlusIcon } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { BreadcrumbItem, BreadcrumbNav } from "@/components/_ui/BreadcrumbNav";
import Button from "@/components/_ui/Button";
import Dialog from "@/components/_ui/Dialog";
import Divider from "@/components/_ui/Divider";
import Main from "@/components/_ui/Main";
import { SortableList } from "@/components/_ui/SortableList";
import { useToast } from "@/components/_ui/Toast";
import { ProjectForm } from "@/components/forms/ProjectForm";
import {
  type ProjectAdminItem,
  ProjectFormItem,
} from "@/components/ProjectFormItem";
import {
  PROJECT_STATUS_LABELS,
  type ProjectStatus,
  toProjectStatus,
} from "@/lib/projects";
import {
  listProjects,
  reorderProjects,
} from "@/server/functions/projects.functions";

export const Route = createFileRoute("/_authenticated/dashboard/projects/")({
  loader: async () => ({ projects: await listProjects() }),
  head: () => ({
    meta: [{ title: "Projects - Digital Queer Collective" }],
  }),
  component: RouteComponent,
});

interface DialogState {
  status: ProjectStatus;
  item?: ProjectAdminItem;
}

function RouteComponent() {
  const { projects } = Route.useLoaderData();
  const router = useRouter();
  const reorder = useServerFn(reorderProjects);
  const toast = useToast();
  const [dialog, set_dialog] = useState<DialogState | null>(null);

  const projects_by_status = useMemo(
    () => ({
      active: projects.filter(({ isActive }) => isActive),
      past: projects.filter(({ isActive }) => !isActive),
    }),
    [projects],
  );

  const close_dialog = () => set_dialog(null);
  const handle_saved = async () => {
    close_dialog();
    await router.invalidate();
  };

  const persist_order =
    (status: ProjectStatus) => async (items: Array<{ id: string }>) => {
      try {
        await reorder({ data: { status, ids: items.map((item) => item.id) } });
      } catch (error) {
        toast.danger({
          title: "Couldn't save the new order",
          description: error instanceof Error ? error.message : undefined,
        });
      } finally {
        // Re-sync with the database either way (reverts the list on failure).
        await router.invalidate();
      }
    };

  const render_section = (
    status: ProjectStatus,
    heading: string,
    add_icon: ReactNode,
  ) => (
    <section className="flex flex-col gap-4">
      <div className="flex gap-8">
        <h2 className="text-2xl font-semibold">{heading}</h2>
        <Button
          size="icon"
          aria-label={`New ${PROJECT_STATUS_LABELS[status].toLowerCase()} project`}
          title={`New ${PROJECT_STATUS_LABELS[status].toLowerCase()} project`}
          onClick={() => set_dialog({ status })}
        >
          {add_icon}
        </Button>
      </div>
      <SortableList
        items={projects_by_status[status]}
        item_label={(item) => item.name}
        on_reorder={persist_order(status)}
        render_item={(item, drag_handle) => (
          <ProjectFormItem
            item={item}
            drag_handle={drag_handle}
            on_edit_click={(item) =>
              set_dialog({ status: toProjectStatus(item.isActive), item })
            }
          />
        )}
      />
      {projects_by_status[status].length === 0 && (
        <p className="text-neutral-300 italic">
          No {PROJECT_STATUS_LABELS[status].toLowerCase()} projects to show
        </p>
      )}
    </section>
  );

  return (
    <Main>
      <BreadcrumbNav current_page_label="Projects">
        <BreadcrumbItem to="/dashboard">Dashboard</BreadcrumbItem>
      </BreadcrumbNav>
      <p className="-mt-4 text-sm text-neutral-300">
        Drag a project by its handle, or focus the handle and use the arrow
        keys, to change where it's listed. The first three active projects show
        on the home page.
      </p>
      {render_section(
        "active",
        "Active Projects",
        <FolderPlusIcon strokeWidth={1.5} size={16} aria-hidden />,
      )}
      <Divider />
      {render_section(
        "past",
        "Past Projects",
        <FolderArchiveIcon strokeWidth={1.5} size={16} aria-hidden />,
      )}
      <Dialog.Root
        open={dialog !== null}
        onOpenChange={(open) => !open && close_dialog()}
      >
        <Dialog.Content className="max-w-2xl gap-2">
          {dialog && (
            <>
              <div className="-mx-2 border-b px-2 pb-2">
                <h2 className="text-2xl font-bold">
                  {dialog.item ? "Edit Project" : "New Project"}
                </h2>
              </div>
              {/* Keyed so each open starts from a fresh form state. */}
              <ProjectForm
                key={`${dialog.status}:${dialog.item?.id ?? "new"}`}
                item={dialog.item}
                default_status={dialog.status}
                on_cancel={close_dialog}
                on_saved={handle_saved}
              />
            </>
          )}
        </Dialog.Content>
      </Dialog.Root>
    </Main>
  );
}
