import { createFileRoute, Link as TanstackLink } from "@tanstack/react-router";
import {
  ChartLineIcon,
  FilesIcon,
  FoldersIcon,
  HammerIcon,
  HomeIcon,
  InboxIcon,
  MailIcon,
  RssIcon,
  UsersIcon,
} from "lucide-react";
import Divider from "@/components/_ui/Divider";
import Link from "@/components/_ui/Link";
import Main from "@/components/_ui/Main";
import {
  ContactRequestItem,
  useContactRequestActions,
} from "@/components/ContactRequestItem";
import { PostSummaryItem } from "@/components/PostSummaryItem";
import { projectDates } from "@/lib/projects";
import { getContactRequestOverview } from "@/server/functions/contact.functions";
import { listRecentlyEditedPosts } from "@/server/functions/posts.functions";
import { listActiveProjects } from "@/server/functions/projects.functions";
import { listTeamMembers } from "@/server/functions/team.functions";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  loader: async () => {
    const [requests, recent_posts, active_projects, team] = await Promise.all([
      // The newest messages from the contact form not yet marked read.
      getContactRequestOverview({ data: { limit: 3 } }),
      // Drafts and published posts alike, most recently changed first.
      listRecentlyEditedPosts({ data: { limit: 3 } }),
      // The first three, in the order set on the Projects page.
      listActiveProjects({ data: { limit: 3 } }),
      listTeamMembers(),
    ]);
    return { requests, recent_posts, active_projects, team };
  },
  head: () => ({
    meta: [{ title: "Dashboard - Digital Queer Collective" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useRouteContext();
  const { requests, recent_posts, active_projects, team } =
    Route.useLoaderData();
  const request_actions = useContactRequestActions();

  return (
    <Main>
      <nav aria-label="Admin" className="flex flex-wrap items-center gap-2 w-full">
        <h2 className="text-2xl font-semibold mr-auto">Dashboard</h2>
        <Link
          href="https://analytics.dqc.dev/dqc.dev"
          target="_blank"
          rel="noreferrer"
          size="icon"
          title="View analytics"
        >
          <ChartLineIcon strokeWidth={1.5} size={16} aria-hidden />
          <span className="sr-only">View analytics (opens in a new tab)</span>
        </Link>
        <Link to="/" size="icon" title="Return to the site">
          <HomeIcon strokeWidth={1.5} size={16} aria-hidden />
          <span className="sr-only">Return to the site</span>
        </Link>
      </nav>
      <p className="-mt-4 text-sm text-neutral-300">Signed in as {user.name}</p>
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-neutral-300 hover:underline">
          <TanstackLink to="/dashboard/requests">
            <MailIcon strokeWidth={1.5} size={20} aria-hidden className="inline mr-2 -mt-1" />
            Contact Requests
          </TanstackLink>
        </h2>
        <h3 className="text-lg font-semibold">
          New Requests
          {requests.unread_count > 0 && ` (${requests.unread_count})`}
        </h3>
        {requests.recent.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {requests.recent.map((item) => (
              <ContactRequestItem
                key={item.id}
                item={item}
                is_compact
                is_busy={request_actions.busy_id === item.id}
                on_toggle_read={request_actions.toggle_read}
                on_delete={request_actions.remove}
              />
            ))}
          </ul>
        ) : (
          <p className="italic text-neutral-300">No new requests</p>
        )}
        <Link to="/dashboard/requests">
          <InboxIcon strokeWidth={1.5} size={16} aria-hidden />
          <span>View All Requests</span>
        </Link>
      </section>
      <Divider />
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-neutral-300 hover:underline">
          <TanstackLink to="/dashboard/posts">
            <RssIcon strokeWidth={1.5} size={20} aria-hidden className="inline mr-2 -mt-1" />
            Thoughts &amp; Statements
          </TanstackLink>
        </h2>
        <h3 className="text-lg font-semibold">Recently Edited</h3>
        {recent_posts.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {recent_posts.map((post) => (
              <PostSummaryItem key={post.id} item={post} />
            ))}
          </ul>
        ) : (
          <p className="italic text-neutral-300">No posts yet</p>
        )}
        <Link to="/dashboard/posts">
          <FilesIcon strokeWidth={1.5} size={16} aria-hidden />
          <span>View All Posts</span>
        </Link>
      </section>
      <Divider />
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-neutral-300 hover:underline">
          <TanstackLink to="/dashboard/projects">
            <HammerIcon strokeWidth={1.5} size={20} aria-hidden className="inline mr-2 -mt-1" />
            Projects
          </TanstackLink>
        </h2>
        <h3 className="text-lg font-semibold">Active Projects</h3>
        {active_projects.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {active_projects.map((project) => (
              <li
                key={project.id}
                className="border border-neutral-700 flex items-start gap-4 p-2"
              >
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="text-sm text-neutral-300">
                    {projectDates(project)} ·{" "}
                    {project.hasPublishedPage ? "Page published" : "No page yet"}
                  </p>
                  <p className="font-medium">
                    <TanstackLink
                      to="/dashboard/projects/$projectId"
                      params={{ projectId: project.id }}
                      className="hover:underline"
                    >
                      {project.name}
                    </TanstackLink>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="italic text-neutral-300">No active projects to show</p>
        )}
        <Link to="/dashboard/projects">
          <FoldersIcon strokeWidth={1.5} size={16} aria-hidden />
          <span>View All Projects</span>
        </Link>
      </section>
      <Divider />
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-neutral-300 hover:underline">
          <TanstackLink to="/dashboard/team">
            <UsersIcon strokeWidth={1.5} size={20} aria-hidden className="inline mr-2 -mt-1" />
            Team
          </TanstackLink>
        </h2>
        {team.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {team.map((member) => (
              <li
                key={member.id}
                className="border border-neutral-700 flex items-start gap-4 p-2"
              >
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="text-sm text-neutral-300">
                    {member.status.isPublished
                      ? member.status.hasUnpublishedChanges
                        ? "On the About page · Unpublished changes"
                        : "On the About page"
                      : "Not on the About page"}
                  </p>
                  <p className="font-medium">
                    <TanstackLink
                      to="/dashboard/team/$memberId"
                      params={{ memberId: member.id }}
                      className="hover:underline"
                    >
                      {member.name}
                    </TanstackLink>
                    {member.pronouns && (
                      <span className="text-neutral-300 font-normal text-sm">
                        {" "}
                        {member.pronouns}
                      </span>
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="italic text-neutral-300">No one on the team yet</p>
        )}
        <Link to="/dashboard/team">
          <UsersIcon strokeWidth={1.5} size={16} aria-hidden />
          <span>Manage the Team</span>
        </Link>
      </section>
    </Main>
  );
}
