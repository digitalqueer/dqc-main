import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { UserPlusIcon } from "lucide-react";
import { useState } from "react";
import { BreadcrumbItem, BreadcrumbNav } from "@/components/_ui/BreadcrumbNav";
import Button from "@/components/_ui/Button";
import Dialog from "@/components/_ui/Dialog";
import Main from "@/components/_ui/Main";
import { SortableList } from "@/components/_ui/SortableList";
import { useToast } from "@/components/_ui/Toast";
import { TeamMemberForm } from "@/components/forms/TeamMemberForm";
import {
  type TeamMemberAdminItem,
  TeamMemberItem,
} from "@/components/TeamMemberItem";
import {
  listTeamMembers,
  reorderTeamMembers,
} from "@/server/functions/team.functions";

export const Route = createFileRoute("/_authenticated/dashboard/team/")({
  loader: async () => ({ members: await listTeamMembers() }),
  head: () => ({
    meta: [{ title: "Team - Digital Queer Collective" }],
  }),
  component: RouteComponent,
});

/** `item` is the person being edited; no item means adding someone. */
interface DialogState {
  item?: TeamMemberAdminItem;
}

function RouteComponent() {
  const { members } = Route.useLoaderData();
  const router = useRouter();
  const navigate = useNavigate();
  const reorder = useServerFn(reorderTeamMembers);
  const toast = useToast();
  const [dialog, set_dialog] = useState<DialogState | null>(null);

  const close_dialog = () => set_dialog(null);
  const handle_saved = async (member: { id: string }) => {
    const is_new = !dialog?.item;
    close_dialog();
    // Someone new has no bio yet, so go straight to writing it.
    if (is_new) {
      await navigate({
        to: "/dashboard/team/$memberId",
        params: { memberId: member.id },
      });
    } else {
      await router.invalidate();
    }
  };
  const handle_deleted = async () => {
    close_dialog();
    await router.invalidate();
  };

  const persist_order = async (items: Array<{ id: string }>) => {
    try {
      await reorder({ data: { ids: items.map((item) => item.id) } });
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

  return (
    <Main>
      <BreadcrumbNav current_page_label="Team">
        <BreadcrumbItem to="/dashboard">Dashboard</BreadcrumbItem>
      </BreadcrumbNav>
      <section className="flex flex-col gap-4">
        <div className="flex gap-8">
          <h2 className="text-2xl font-semibold">Our Team</h2>
          <Button
            size="icon"
            aria-label="Add someone"
            title="Add someone"
            onClick={() => set_dialog({})}
          >
            <UserPlusIcon strokeWidth={1.5} size={16} aria-hidden />
          </Button>
        </div>
        <p className="-mt-2 text-sm text-neutral-300">
          The About page lists everyone with a published bio, in this order.
          Drag someone by their handle, or focus it and use the arrow keys, to
          move them.
        </p>
        <SortableList
          items={members}
          item_label={(item) => item.name}
          on_reorder={persist_order}
          render_item={(item, drag_handle) => (
            <TeamMemberItem
              item={item}
              drag_handle={drag_handle}
              on_edit_click={(item) => set_dialog({ item })}
            />
          )}
        />
        {members.length === 0 && (
          <p className="italic text-neutral-300">
            No one yet. Add someone with the + button.
          </p>
        )}
      </section>
      <Dialog.Root
        open={dialog !== null}
        onOpenChange={(open) => !open && close_dialog()}
      >
        <Dialog.Content className="max-w-2xl gap-2">
          {dialog && (
            <>
              <div className="-mx-2 px-2 pb-2 border-b">
                <h2 className="text-2xl font-bold">
                  {dialog.item ? "Edit Team Member" : "Add to the Team"}
                </h2>
                {!dialog.item && (
                  <p className="text-sm text-neutral-300">
                    They join the About page once their bio is published;
                    you'll write it next.
                  </p>
                )}
              </div>
              {/* Keyed so each open starts from a fresh form state. */}
              <TeamMemberForm
                key={dialog.item?.id ?? "new"}
                item={
                  dialog.item && {
                    ...dialog.item,
                    isPublished: dialog.item.status.isPublished,
                  }
                }
                on_cancel={close_dialog}
                on_saved={handle_saved}
                on_deleted={handle_deleted}
              />
            </>
          )}
        </Dialog.Content>
      </Dialog.Root>
    </Main>
  );
}
