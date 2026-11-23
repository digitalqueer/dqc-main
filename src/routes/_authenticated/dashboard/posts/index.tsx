import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { FilePlusIcon } from "lucide-react";
import { useMemo, useState } from "react";
import Button from "@/components/_ui/Button";
import Dialog from "@/components/_ui/Dialog";
import Divider from "@/components/_ui/Divider";
import Main from "@/components/_ui/Main";
import { PostForm, type SavedPost } from "@/components/forms/PostForm";
import {
  type PostAdminSummary,
  PostSummaryItem,
} from "@/components/PostSummaryItem";
import { listAllPosts } from "@/server/functions/posts.functions";

export const Route = createFileRoute("/_authenticated/dashboard/posts/")({
  loader: async () => ({ posts: await listAllPosts() }),
  head: () => ({
    meta: [{ title: "Thoughts & Statements - Digital Queer Collective" }],
  }),
  component: RouteComponent,
});

/** `item` is the post being edited; no item means a new post. */
interface DialogState {
  item?: PostAdminSummary;
}

function RouteComponent() {
  const { posts } = Route.useLoaderData();
  const { user } = Route.useRouteContext();
  const router = useRouter();
  const navigate = useNavigate();
  const [dialog, set_dialog] = useState<DialogState | null>(null);

  const { drafts, published } = useMemo(
    () => ({
      drafts: posts.filter(({ isPublished }) => !isPublished),
      published: posts.filter(({ isPublished }) => isPublished),
    }),
    [posts],
  );

  const close_dialog = () => set_dialog(null);
  const handle_saved = async (post: SavedPost) => {
    const is_new = !dialog?.item;
    close_dialog();
    // A new post has nothing in it yet, so go straight to writing it.
    if (is_new) {
      await navigate({
        to: "/dashboard/posts/$postId",
        params: { postId: post.id },
      });
    } else {
      await router.invalidate();
    }
  };
  const handle_deleted = async () => {
    close_dialog();
    await router.invalidate();
  };

  const render_list = (items: PostAdminSummary[], empty: string) =>
    items.length > 0 ? (
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <PostSummaryItem
            key={item.id}
            item={item}
            on_edit_click={(item) => set_dialog({ item })}
          />
        ))}
      </ul>
    ) : (
      <p className="text-neutral-300 italic">{empty}</p>
    );

  return (
    <Main>
      <section className="flex flex-col gap-4">
        <div className="flex gap-8">
          <h2 className="text-2xl font-semibold">Drafts</h2>
          <Button
            size="icon"
            aria-label="New post"
            title="New post"
            onClick={() => set_dialog({})}
          >
            <FilePlusIcon strokeWidth={1.5} size={16} aria-hidden />
          </Button>
        </div>
        {render_list(drafts, "No drafts. Start a new post with the + button.")}
      </section>
      <Divider />
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Published</h2>
        {render_list(published, "Nothing published yet")}
      </section>
      <Dialog.Root
        open={dialog !== null}
        onOpenChange={(open) => !open && close_dialog()}
      >
        <Dialog.Content className="max-w-2xl gap-2">
          {dialog && (
            <>
              <div className="-mx-2 border-b px-2 pb-2">
                <h2 className="text-2xl font-bold">
                  {dialog.item ? "Post Details" : "New Post"}
                </h2>
                {!dialog.item && (
                  <p className="text-sm text-neutral-300">
                    It starts as a private draft; you'll write it next.
                  </p>
                )}
              </div>
              {/* Keyed so each open starts from a fresh form state. */}
              <PostForm
                key={dialog.item?.id ?? "new"}
                item={dialog.item}
                defaults={{ author: user.name }}
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
