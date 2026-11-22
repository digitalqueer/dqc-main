import { useServerFn } from "@tanstack/react-start";
import { UserPlusIcon } from "lucide-react";
import { useConfirm } from "@/components/_ui/AlertDialog";
import { Form } from "@/components/_ui/Form";
import { useAppForm } from "@/forms/context.form";
import { type TeamMemberInput, teamMemberInputSchema } from "@/lib/team";
import {
  createTeamMember,
  deleteTeamMember,
  updateTeamMember,
} from "@/server/functions/team.functions";
import {
  type RecordFormProps,
  useMutationFeedback,
} from "./useMutationFeedback";

/** The editable details of a team member. */
export interface TeamMemberDetails {
  id: string;
  name: string;
  pronouns: string | null;
  isPublished: boolean;
}

interface TeamMemberFormProps extends RecordFormProps<TeamMemberDetails> {
  /** Called with the saved member's id after a create or update. */
  on_saved: (member: { id: string; name: string }) => void | Promise<void>;
  /** Required when editing: called after they're removed. */
  on_deleted?: () => void | Promise<void>;
}

/** A team member's name and pronouns. Their bio is written in the editor. */
function TeamMemberForm({
  item,
  on_cancel,
  on_saved,
  on_deleted,
}: TeamMemberFormProps) {
  const create = useServerFn(createTeamMember);
  const update = useServerFn(updateTeamMember);
  const remove = useServerFn(deleteTeamMember);
  const run = useMutationFeedback("team member");
  const confirm = useConfirm();
  const is_editing = !!item;

  const form = useAppForm({
    defaultValues: {
      name: item?.name ?? "",
      pronouns: item?.pronouns ?? "",
    } as TeamMemberInput,
    validators: { onChange: teamMemberInputSchema },
    onSubmit: async ({ value }) => {
      const saved = await run(is_editing ? "update" : "create", () =>
        item
          ? update({ data: { ...value, id: item.id } })
          : create({ data: value }),
      );
      if (saved) await on_saved(saved);
    },
  });

  const handle_delete = async () => {
    if (!item) return;
    const confirmed = await confirm({
      title: `Remove ${item.name} from the team?`,
      description:
        (item.isPublished ? "They'll disappear from the About page. " : "") +
        "Their bio is deleted too. This can't be undone.",
      confirm_label: "Remove",
      is_destructive: true,
    });
    if (!confirmed) return;
    const deleted = await run("delete", () =>
      remove({ data: { id: item.id } }),
    );
    if (deleted) await on_deleted?.();
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
        <div className="grid grid-cols-1 gap-2 px-2 pb-4 sm:grid-cols-2">
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Name"
                placeholder="Jane Doe"
                autoComplete="off"
              />
            )}
          </form.AppField>
          <form.AppField name="pronouns">
            {(field) => (
              <field.TextField
                label="Pronouns (optional)"
                placeholder="she/they"
                autoComplete="off"
              />
            )}
          </form.AppField>
        </div>
        <form.FormActions
          submit_label={is_editing ? "Save Changes" : "Add to Team"}
          submit_icon={
            is_editing ? undefined : (
              <UserPlusIcon strokeWidth={1.5} size={16} aria-hidden />
            )
          }
          on_cancel={on_cancel}
          on_delete={is_editing ? handle_delete : undefined}
        />
      </Form>
    </form.AppForm>
  );
}

export { TeamMemberForm };
