import { isNotFound } from "@tanstack/react-router";
import { useToast } from "@/components/_ui/Toast";

export interface RecordFormProps<T> {
  /** The record being edited; omit to create a new one. */
  item?: T;
  on_cancel: () => void;
}

type MutationAction = "create" | "update" | "delete";

const PAST_TENSE: Record<MutationAction, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
};

/**
 * Runs a create/update/delete mutation and reports the outcome with a toast.
 * Resolves to the mutation's result on success (so callers can close the
 * dialog or navigate), or null when it failed.
 */
export function useMutationFeedback(noun: string) {
  const toast = useToast();

  return async function run<T extends { name: string }>(
    action: MutationAction,
    mutation: () => Promise<T>,
  ): Promise<T | null> {
    try {
      const result = await mutation();
      toast.success({ title: `${PAST_TENSE[action]} ${result.name}` });
      return result;
    } catch (error) {
      toast.danger({
        title: `Couldn't ${action} ${noun}`,
        description: isNotFound(error)
          ? "It no longer exists. Refresh the page and try again."
          : error instanceof Error
            ? error.message
            : undefined,
      });
      return null;
    }
  };
}
