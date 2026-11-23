import { useServerFn } from "@tanstack/react-start";
import { FilePlusIcon } from "lucide-react";
import { useRef } from "react";
import { useConfirm } from "@/components/_ui/AlertDialog";
import { Form } from "@/components/_ui/Form";
import { useAppForm } from "@/forms/context.form";
import {
  POST_KIND_LABELS,
  POST_KIND_PATHS,
  POST_KINDS,
  type PostInput,
  type PostKind,
  postInputSchema,
} from "@/lib/posts";
import { toIdentifier } from "@/lib/validation";
import {
  createPost,
  deletePost,
  updatePost,
} from "@/server/functions/posts.functions";
import { useMutationFeedback } from "./useMutationFeedback";

const KIND_OPTIONS = POST_KINDS.map((value) => ({
  value,
  label: POST_KIND_LABELS[value],
}));

/** The editable details of an existing post. */
export interface PostDetails {
  id: string;
  kind: PostKind;
  slug: string;
  title: string;
  author: string | null;
  description: string | null;
  isPublished: boolean;
}

/** What a save resolves with: enough to link to the post. */
export interface SavedPost {
  id: string;
  kind: PostKind;
  slug: string;
  title: string;
}

interface PostFormProps {
  /** The post being edited; omit to create a new (unpublished) one. */
  item?: PostDetails;
  /** For a new post: its kind and byline to start with. */
  defaults?: { kind?: PostKind; author?: string };
  on_cancel: () => void;
  on_saved: (post: SavedPost) => void | Promise<void>;
  /** Required when editing: called after the post is deleted. */
  on_deleted?: () => void | Promise<void>;
}

/** A post's kind, title, slug, byline and summary. Content is written in the editor. */
function PostForm({
  item,
  defaults,
  on_cancel,
  on_saved,
  on_deleted,
}: PostFormProps) {
  const create = useServerFn(createPost);
  const update = useServerFn(updatePost);
  const remove = useServerFn(deletePost);
  const run = useMutationFeedback("post");
  const confirm = useConfirm();
  const is_editing = !!item;

  // The slug follows the title until it's edited by hand (a saved slug that
  // doesn't match its title counts as hand-edited). A published post's slug is
  // its URL, so it never follows the title; it's only changed on purpose.
  const slug_edited = useRef(
    !!item && (item.isPublished || item.slug !== toIdentifier(item.title)),
  );
  const syncing_slug = useRef(false);

  const form = useAppForm({
    defaultValues: {
      kind: item?.kind ?? defaults?.kind ?? "thought",
      slug: item?.slug ?? "",
      title: item?.title ?? "",
      author: item ? (item.author ?? "") : (defaults?.author ?? ""),
      description: item?.description ?? "",
    } as PostInput,
    validators: { onChange: postInputSchema },
    onSubmit: async ({ value }) => {
      const saved = await run(is_editing ? "update" : "create", async () => {
        const post = item
          ? await update({ data: { ...value, id: item.id } })
          : await create({ data: value });
        return { ...post, name: post.title };
      });
      if (saved) await on_saved(saved);
    },
  });

  const handle_delete = async () => {
    if (!item) return;
    const confirmed = await confirm({
      title: `Delete "${item.title}"?`,
      description: item.isPublished
        ? "It's published, so it will disappear from the site. This can't be undone."
        : "This can't be undone.",
      confirm_label: "Delete post",
      is_destructive: true,
    });
    if (!confirmed) return;
    const deleted = await run("delete", async () => {
      const post = await remove({ data: { id: item.id } });
      return { ...post, name: post.title };
    });
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
          <form.AppField
            name="title"
            listeners={{
              onChange: ({ value }) => {
                if (slug_edited.current) return;
                syncing_slug.current = true;
                form.setFieldValue("slug", toIdentifier(value));
                syncing_slug.current = false;
              },
            }}
          >
            {(field) => (
              <field.TextField
                className="sm:col-span-2"
                label="Title"
                placeholder="DQC(3) in 2026"
              />
            )}
          </form.AppField>
          <form.AppField name="kind">
            {(field) => (
              <field.SelectField label="Kind" options={KIND_OPTIONS} />
            )}
          </form.AppField>
          <form.Subscribe selector={(state) => state.values.kind}>
            {(kind) => (
              <form.AppField
                name="slug"
                listeners={{
                  onChange: ({ value }) => {
                    // Clearing the slug hands it back to the title.
                    if (!syncing_slug.current) {
                      slug_edited.current = value !== "";
                    }
                  },
                }}
              >
                {(field) => (
                  <field.TextField
                    label={`Slug (${POST_KIND_PATHS[kind]}/…)`}
                    placeholder="2026"
                  />
                )}
              </form.AppField>
            )}
          </form.Subscribe>
          <form.AppField name="author">
            {(field) => (
              <field.TextField
                className="sm:col-span-2"
                label="Author (optional)"
                description='Shown as "Written by …". Leave blank for no byline.'
                placeholder="Devin Sharpe"
                autoComplete="name"
              />
            )}
          </form.AppField>
          {item?.isPublished && (
            <p className="text-sm opacity-80 sm:col-span-2">
              This post is live, so changing its kind or slug changes its URL
              and breaks existing links to it. Details save straight to the live
              post.
            </p>
          )}
          <form.AppField name="description">
            {(field) => (
              <field.TextAreaField
                className="sm:col-span-2"
                label="Summary (optional)"
                placeholder="A sentence or two for the Thoughts page and link previews. Leave blank to use the post's opening lines."
                rows={3}
              />
            )}
          </form.AppField>
        </div>
        <form.FormActions
          submit_label={is_editing ? "Save Changes" : "Create Draft"}
          submit_icon={
            is_editing ? undefined : (
              <FilePlusIcon strokeWidth={1.5} size={16} aria-hidden />
            )
          }
          on_cancel={on_cancel}
          on_delete={is_editing ? handle_delete : undefined}
        />
      </Form>
    </form.AppForm>
  );
}

export { PostForm };
