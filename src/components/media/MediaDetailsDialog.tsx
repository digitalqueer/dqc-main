import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Form } from "@/components/_ui/Form";
import { useAppForm } from "@/forms/context.form";
import {
  formatBytes,
  type MediaDetailsInput,
  mediaDetailsSchema,
} from "@/lib/media";
import { POST_KIND_LABELS } from "@/lib/posts";
import {
  deleteMedia,
  getMediaUsage,
  updateMediaDetails,
} from "@/server/functions/media.functions";
import { useConfirm } from "../_ui/AlertDialog";
import Dialog from "../_ui/Dialog";
import { LocalTime } from "../_ui/LocalTime";
import { useMutationFeedback } from "../forms/useMutationFeedback";
import { MediaImage } from "./MediaImage";
import type { MediaItem } from "./MediaLibraryItem";

type MediaUse = Awaited<ReturnType<typeof getMediaUsage>>[number];

/** What a use is called, e.g. `Thought "2026"` or `Devin Sharpe's bio`. */
function labelOf(use: MediaUse) {
  if (use.kind === "post") {
    return `${POST_KIND_LABELS[use.post_kind]} “${use.title}”`;
  }
  if (use.kind === "project") return `Project page “${use.title}”`;
  return `${use.title}’s bio`;
}

/** e.g. `Thought "2026" (draft only)`, for the delete confirmation. */
function describeUse(use: MediaUse) {
  const name = labelOf(use);
  return use.is_live ? name : `${name} (draft only)`;
}

/** A link to the editor for the page that uses the image. */
function UseLink({ use }: { use: MediaUse }) {
  const className = "underline underline-offset-2 hover:opacity-80";
  if (use.kind === "post") {
    return (
      <Link
        to="/dashboard/posts/$postId"
        params={{ postId: use.id }}
        className={className}
      >
        {labelOf(use)}
      </Link>
    );
  }
  if (use.kind === "project") {
    return (
      <Link
        to="/dashboard/projects/$projectId"
        params={{ projectId: use.id }}
        className={className}
      >
        {labelOf(use)}
      </Link>
    );
  }
  return (
    <Link
      to="/dashboard/team/$memberId"
      params={{ memberId: use.id }}
      className={className}
    >
      {labelOf(use)}
    </Link>
  );
}

/** Where the image is used: null while checking, "error" if that failed. */
function MediaUsage({ uses }: { uses: MediaUse[] | null | "error" }) {
  if (uses === null) {
    return <p className="text-sm opacity-80">Checking where it's used…</p>;
  }
  if (uses === "error") {
    return <p className="text-sm opacity-80">Couldn't check where it's used.</p>;
  }
  if (uses.length === 0) {
    return <p className="text-sm opacity-80">Not used on any page.</p>;
  }
  return (
    <div className="text-sm">
      <p className="font-medium">Used on</p>
      <ul className="list-disc pl-5">
        {uses.map((use) => (
          <li key={`${use.kind}:${use.id}`}>
            <UseLink use={use} />
            {!use.is_live && <span className="opacity-80"> (draft only)</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface MediaDetailsProps {
  item: MediaItem;
  on_close: () => void;
  /** Reloads the library after a save or delete. */
  on_changed: () => Promise<void>;
}

function MediaDetails({ item, on_close, on_changed }: MediaDetailsProps) {
  const update = useServerFn(updateMediaDetails);
  const remove = useServerFn(deleteMedia);
  const fetch_usage = useServerFn(getMediaUsage);
  const run = useMutationFeedback("image");
  const confirm = useConfirm();
  const [uses, set_uses] = useState<MediaUse[] | null | "error">(null);
  // Deleting waits for the check, so the confirmation can name the pages.
  const usage = useRef<Promise<MediaUse[] | null> | null>(null);

  useEffect(() => {
    let is_current = true;
    const check = fetch_usage({ data: { id: item.id } }).then(
      (found) => {
        if (is_current) set_uses(found);
        return found;
      },
      () => {
        if (is_current) set_uses("error");
        return null;
      },
    );
    usage.current = check;
    return () => {
      is_current = false;
    };
  }, [fetch_usage, item.id]);

  const form = useAppForm({
    defaultValues: {
      altText: item.altText ?? "",
      caption: item.caption ?? "",
      tags: item.tags.join(", "),
    } as MediaDetailsInput,
    validators: { onChange: mediaDetailsSchema },
    onSubmit: async ({ value }) => {
      const saved = await run("update", async () => {
        await update({ data: { ...value, id: item.id } });
        return { name: item.originalName };
      });
      if (saved) {
        on_close();
        await on_changed();
      }
    },
  });

  const handle_delete = async () => {
    const found = await usage.current;
    const confirmed = await confirm({
      title: `Delete "${item.originalName}"?`,
      description: (
        <>
          {found == null ? (
            <p>Couldn't check which pages use it; any that do will lose it.</p>
          ) : found.length === 0 ? (
            <p>No pages use it.</p>
          ) : (
            <>
              <p>
                It's used on{" "}
                {found.length === 1 ? "1 page" : `${found.length} pages`}, which
                will lose it:
              </p>
              <ul className="list-disc pl-5">
                {found.map((use) => (
                  <li key={`${use.kind}:${use.id}`}>{describeUse(use)}</li>
                ))}
              </ul>
            </>
          )}
          <p>The file is removed from storage. This can't be undone.</p>
        </>
      ),
      confirm_label: "Delete image",
      is_destructive: true,
    });
    if (!confirmed) return;
    const deleted = await run("delete", () => remove({ data: { id: item.id } }));
    if (deleted) {
      on_close();
      await on_changed();
    }
  };

  const facts = [
    item.width && item.height ? `${item.width} × ${item.height}` : null,
    formatBytes(item.byteSize),
    item.contentType.replace("image/", "").toUpperCase(),
  ].filter(Boolean);

  return (
    <>
      <div className="-mx-2 px-2 pb-2 pr-12 border-b">
        <h2 className="text-2xl font-bold break-all">{item.originalName}</h2>
        <p className="text-sm opacity-80">
          {facts.join(" · ")} · uploaded <LocalTime date={item.createdAt} />
        </p>
      </div>
      <div className="px-2">
        {item.image ? (
          <MediaImage
            image={item.image}
            alt={item.altText ?? ""}
            sizes="(min-width: 48rem) 46rem, 100vw"
            className="mx-auto max-h-[50vh] w-auto object-contain"
          />
        ) : (
          <p className="italic opacity-80">
            Previews appear once imgproxy is configured.
          </p>
        )}
      </div>
      <div className="px-2">
        <MediaUsage uses={uses} />
      </div>
      <form.AppForm>
        <Form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="grid grid-cols-1 gap-2 pb-4 px-2">
            <form.AppField name="altText">
              {(field) => (
                <field.TextAreaField
                  label="Alt text"
                  placeholder="Describe the image for people who can't see it…"
                  rows={2}
                />
              )}
            </form.AppField>
            <form.AppField name="caption">
              {(field) => (
                <field.TextAreaField
                  label="Caption (optional)"
                  placeholder="Shown under the image where it's published"
                  rows={2}
                />
              )}
            </form.AppField>
            <form.AppField name="tags">
              {(field) => (
                <field.TextField
                  label="Tags (comma-separated)"
                  placeholder="events, team"
                />
              )}
            </form.AppField>
          </div>
          <form.FormActions
            submit_label="Save Changes"
            on_cancel={on_close}
            on_delete={handle_delete}
          />
        </Form>
      </form.AppForm>
    </>
  );
}

interface MediaDetailsDialogProps extends Omit<MediaDetailsProps, "item"> {
  /** The item to show; null keeps the dialog closed. */
  item: MediaItem | null;
}

/** Preview, alt text and caption, and delete, for one library item. */
export function MediaDetailsDialog({ item, ...props }: MediaDetailsDialogProps) {
  return (
    <Dialog.Root
      open={item !== null}
      onOpenChange={(open) => !open && props.on_close()}
    >
      <Dialog.Content className="max-w-3xl gap-2">
        {/* Keyed so each item starts from a fresh form. */}
        {item && <MediaDetails key={item.id} item={item} {...props} />}
      </Dialog.Content>
    </Dialog.Root>
  );
}
