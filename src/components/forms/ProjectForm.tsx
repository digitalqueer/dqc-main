import { useServerFn } from "@tanstack/react-start";
import { FolderPlusIcon } from "lucide-react";
import { useRef } from "react";
import { useConfirm } from "@/components/_ui/AlertDialog";
import { Form } from "@/components/_ui/Form";
import { useAppForm } from "@/forms/context.form";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUSES,
  type ProjectInput,
  type ProjectStatus,
  projectInputSchema,
  toProjectStatus,
} from "@/lib/projects";
import { toIdentifier } from "@/lib/validation";
import type { Project } from "@/server/database/schema.server";
import {
  createProject,
  deleteProject,
  updateProject,
} from "@/server/functions/projects.functions";
import { type RecordFormProps, useMutationFeedback } from "./useMutationFeedback";

const STATUS_OPTIONS = PROJECT_STATUSES.map((value) => ({
  value,
  label: PROJECT_STATUS_LABELS[value],
}));

interface ProjectFormProps extends RecordFormProps<Project> {
  /** Which list a new project starts in; editing uses the item's own status. */
  default_status: ProjectStatus;
  /** Called after a successful create, update, or delete. */
  on_saved: () => void | Promise<void>;
}

function ProjectForm({
  item,
  default_status,
  on_cancel,
  on_saved,
}: ProjectFormProps) {
  const create = useServerFn(createProject);
  const update = useServerFn(updateProject);
  const remove = useServerFn(deleteProject);
  const run = useMutationFeedback("project");
  const confirm = useConfirm();
  const is_editing = !!item;

  // The slug follows the name until it's edited by hand (it's the public URL,
  // so it's worth choosing). Once created it's the primary key and is locked.
  const slug_edited = useRef(false);
  const syncing_slug = useRef(false);

  const form = useAppForm({
    defaultValues: {
      id: item?.id ?? "",
      name: item?.name ?? "",
      status: item ? toProjectStatus(item.isActive) : default_status,
      description: item?.description ?? "",
      websiteLink: item?.websiteLink ?? "",
      sourceLink: item?.sourceLink ?? "",
      startDate: item?.startDate ?? "",
      endDate: item?.endDate ?? "",
    } as ProjectInput,
    validators: { onChange: projectInputSchema },
    onSubmit: async ({ value }) => {
      const saved = await run(is_editing ? "update" : "create", () =>
        is_editing ? update({ data: value }) : create({ data: value }),
      );
      if (saved) await on_saved();
    },
  });

  const handle_delete = async () => {
    if (!item) return;
    const confirmed = await confirm({
      title: `Delete "${item.name}"?`,
      description:
        "Its page goes with it, and /projects/" +
        item.id +
        " stops working. This can't be undone.",
      confirm_label: "Delete project",
      is_destructive: true,
    });
    if (!confirmed) return;
    const deleted = await run("delete", () =>
      remove({ data: { id: item.id } }),
    );
    if (deleted) await on_saved();
  };

  return (
    <form.AppForm>
      <Form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-4 px-2">
          <form.AppField
            name="name"
            listeners={{
              onChange: ({ value }) => {
                if (is_editing || slug_edited.current) return;
                syncing_slug.current = true;
                form.setFieldValue("id", toIdentifier(value));
                syncing_slug.current = false;
              },
            }}
          >
            {(field) => (
              <field.TextField
                label="Name"
                placeholder="Trans Formations Data Archive"
              />
            )}
          </form.AppField>
          <form.AppField
            name="id"
            listeners={{
              onChange: ({ value }) => {
                // Clearing the slug hands it back to the name.
                if (!syncing_slug.current) slug_edited.current = value !== "";
              },
            }}
          >
            {(field) => (
              <field.TextField
                label="Slug (/projects/…)"
                placeholder="tfp"
                disabled={is_editing}
                description={
                  is_editing ? undefined : "Its URL. It can't be changed later."
                }
              />
            )}
          </form.AppField>
          <form.AppField name="status">
            {(field) => (
              <field.SelectField label="Status" options={STATUS_OPTIONS} />
            )}
          </form.AppField>
          <div className="grid grid-cols-2 gap-2">
            <form.AppField name="startDate">
              {(field) => (
                <field.TextField label="Start" placeholder="Spring 2026" />
              )}
            </form.AppField>
            <form.AppField name="endDate">
              {(field) => (
                <field.TextField label="End" placeholder="Blank if ongoing" />
              )}
            </form.AppField>
          </div>
          <form.AppField name="websiteLink">
            {(field) => (
              <field.TextField
                label="Website (optional)"
                type="url"
                placeholder="https://transformationsproject.org"
              />
            )}
          </form.AppField>
          <form.AppField name="sourceLink">
            {(field) => (
              <field.TextField
                label="Source code (optional)"
                type="url"
                placeholder="https://github.com/…"
              />
            )}
          </form.AppField>
          <form.AppField name="description">
            {(field) => (
              <field.TextAreaField
                className="sm:col-span-2"
                label="Description"
                placeholder="What it is and why it matters, for the Projects page…"
                rows={5}
              />
            )}
          </form.AppField>
        </div>
        <form.FormActions
          submit_label={is_editing ? "Save Changes" : "Create Project"}
          submit_icon={
            is_editing ? undefined : (
              <FolderPlusIcon strokeWidth={1.5} size={16} aria-hidden />
            )
          }
          on_cancel={on_cancel}
          on_delete={is_editing ? handle_delete : undefined}
        />
      </Form>
    </form.AppForm>
  );
}

export { ProjectForm };
