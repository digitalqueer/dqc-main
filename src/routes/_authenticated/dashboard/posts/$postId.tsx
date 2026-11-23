import {
  createFileRoute,
  notFound,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { PencilLineIcon } from "lucide-react";
import { useState } from "react";
import Button from "@/components/_ui/Button";
import Dialog from "@/components/_ui/Dialog";
import Main from "@/components/_ui/Main";
import { PostForm } from "@/components/forms/PostForm";
import { PostViewLink } from "@/components/PostSummaryItem";
import { PublishingEditor } from "@/components/rich-text/PublishingEditor";
import { isPostId, POST_KIND_LABELS, POST_KIND_PATHS } from "@/lib/posts";
import {
  getPostEditor,
  publishPost,
  savePostDraft,
  unpublishPost,
} from "@/server/functions/posts.functions";

export const Route = createFileRoute("/_authenticated/dashboard/posts/$postId")(
  {
    staticData: { breadcrumb: Breadcrumb },
    loader: ({ params }) => {
      if (!isPostId(params.postId)) throw notFound();
      return getPostEditor({ data: { id: params.postId } });
    },
    head: ({ loaderData }) => ({
      meta: [
        {
          title: `${loaderData?.post.title ?? "Post"} - Digital Queer Collective`,
        },
      ],
    }),
    component: RouteComponent,
  },
);

// Annotated: its type can't be inferred from Route, whose options include it.
function Breadcrumb(): string {
  return Route.useLoaderData().post.title;
}

function RouteComponent() {
  const data = Route.useLoaderData();
  // Keyed so moving between posts starts a fresh editor.
  return <PostEditor key={data.post.id} {...data} />;
}

type EditorData = Awaited<ReturnType<typeof getPostEditor>>;

function PostEditor({ post, content, status: loaded_status }: EditorData) {
  const router = useRouter();
  const navigate = useNavigate();
  const save_draft = useServerFn(savePostDraft);
  const publish = useServerFn(publishPost);
  const unpublish = useServerFn(unpublishPost);
  const [status, set_status] = useState(loaded_status);
  const [is_editing_details, set_is_editing_details] = useState(false);
  const noun = POST_KIND_LABELS[post.kind].toLowerCase();

  const close_details = () => set_is_editing_details(false);

  return (
    <Main>
      <PublishingEditor
        title={post.title}
        details={
          <p className="text-sm break-all text-neutral-300">
            {POST_KIND_LABELS[post.kind]} · {POST_KIND_PATHS[post.kind]}/
            {post.slug}
            {post.author && ` · By ${post.author}`}
          </p>
        }
        noun={noun}
        initial_content={content}
        status={status}
        on_status_change={set_status}
        save_draft={(content) => save_draft({ data: { id: post.id, content } })}
        publish={(content) => publish({ data: { id: post.id, content } })}
        unpublish={() => unpublish({ data: { id: post.id } })}
        unpublish_confirmation={{
          title: `Unpublish "${post.title}"?`,
          description:
            "It comes off the site, but your draft is kept. Publishing it again gives it a new date.",
        }}
        actions={
          <>
            <Button onClick={() => set_is_editing_details(true)}>
              <PencilLineIcon strokeWidth={1.5} size={16} aria-hidden />
              Details
            </Button>
            {status.isPublished && <PostViewLink item={post} />}
          </>
        }
        editor_label={`Content of ${post.title}`}
        placeholder="Start writing…"
      />
      <Dialog.Root
        open={is_editing_details}
        onOpenChange={(open) => !open && close_details()}
      >
        <Dialog.Content className="max-w-2xl gap-2">
          {is_editing_details && (
            <>
              <div className="-mx-2 border-b px-2 pb-2">
                <h2 className="text-2xl font-bold">Post Details</h2>
              </div>
              <PostForm
                item={{ ...post, isPublished: status.isPublished }}
                on_cancel={close_details}
                on_saved={async () => {
                  close_details();
                  // Reloads the title and slug; the editor keeps its content.
                  await router.invalidate();
                }}
                on_deleted={async () => {
                  close_details();
                  // The post is gone, so there's nothing left to save.
                  await navigate({
                    to: "/dashboard/posts",
                    ignoreBlocker: true,
                  });
                }}
              />
            </>
          )}
        </Dialog.Content>
      </Dialog.Root>
    </Main>
  );
}
