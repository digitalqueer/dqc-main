import { createFileRoute, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRightIcon } from "lucide-react";
import { useState } from "react";
import { BreadcrumbItem, BreadcrumbNav } from "@/components/_ui/BreadcrumbNav";
import Link from "@/components/_ui/Link";
import Main from "@/components/_ui/Main";
import { PublishingEditor } from "@/components/rich-text/PublishingEditor";
import { isTeamMemberId } from "@/lib/team";
import {
  getBioEditor,
  publishBio,
  saveBioDraft,
  unpublishBio,
} from "@/server/functions/team.functions";

export const Route = createFileRoute(
  "/_authenticated/dashboard/team/$memberId",
)({
  loader: ({ params }) => {
    if (!isTeamMemberId(params.memberId)) throw notFound();
    return getBioEditor({ data: { id: params.memberId } });
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData?.member.name ?? "Bio"} - Digital Queer Collective`,
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const data = Route.useLoaderData();
  // Keyed so moving between people starts a fresh editor.
  return <BioEditor key={data.member.id} {...data} />;
}

type EditorData = Awaited<ReturnType<typeof getBioEditor>>;

function BioEditor({ member, content, status: loaded_status }: EditorData) {
  const save_draft = useServerFn(saveBioDraft);
  const publish = useServerFn(publishBio);
  const unpublish = useServerFn(unpublishBio);
  const [status, set_status] = useState(loaded_status);

  return (
    <Main>
      <BreadcrumbNav current_page_label={member.name}>
        <BreadcrumbItem to="/dashboard">Dashboard</BreadcrumbItem>
        <BreadcrumbItem to="/dashboard/team">Team</BreadcrumbItem>
      </BreadcrumbNav>
      <PublishingEditor
        title={member.name}
        details={
          member.pronouns && (
            <p className="text-sm text-neutral-300">{member.pronouns}</p>
          )
        }
        noun="bio"
        initial_content={content}
        status={status}
        on_status_change={set_status}
        save_draft={(content) =>
          save_draft({ data: { id: member.id, content } })
        }
        publish={(content) => publish({ data: { id: member.id, content } })}
        unpublish={() => unpublish({ data: { id: member.id } })}
        unpublish_confirmation={{
          title: `Take ${member.name} off the About page?`,
          description:
            "Their bio comes off the site, but the draft is kept, so you can publish it again later.",
        }}
        actions={
          status.isPublished && (
            <Link to="/about" hash="our-team" target="_blank">
              View on About
              <ArrowUpRightIcon strokeWidth={1.5} size={16} aria-hidden />
              <span className="sr-only"> (opens in a new tab)</span>
            </Link>
          )
        }
        editor_label={`Bio for ${member.name}`}
        placeholder={`Who ${member.name} is and what they do at DQC…`}
        // The bio sits under their name, an h3, on the About page.
        heading_shift={1}
      />
    </Main>
  );
}
