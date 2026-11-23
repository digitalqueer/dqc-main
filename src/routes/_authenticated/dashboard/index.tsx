import { createFileRoute, Link as TanstackLink } from "@tanstack/react-router";
import {
  ChartLineIcon,
  HammerIcon,
  HomeIcon,
  InboxIcon,
  MailIcon,
  RssIcon,
  UsersIcon,
} from "lucide-react";
import ComingSoon from "@/components/_ui/ComingSoon";
import Divider from "@/components/_ui/Divider";
import Link from "@/components/_ui/Link";
import Main from "@/components/_ui/Main";
import {
  ContactRequestItem,
  useContactRequestActions,
} from "@/components/ContactRequestItem";
import { getContactRequestOverview } from "@/server/functions/contact.functions";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  // The newest messages from the contact form not yet marked read.
  loader: () => getContactRequestOverview({ data: { limit: 3 } }),
  head: () => ({
    meta: [{ title: "Dashboard - Digital Queer Collective" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useRouteContext();
  const requests = Route.useLoaderData();
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
        <h2 className="text-2xl font-semibold text-neutral-300">
          <RssIcon strokeWidth={1.5} size={20} aria-hidden className="inline mr-2 -mt-1" />
          Thoughts
        </h2>
        <ComingSoon>
          Writing, editing and publishing thoughts, in place of the Markdown
          files in the repository.
        </ComingSoon>
      </section>
      <Divider />
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-neutral-300">
          <HammerIcon strokeWidth={1.5} size={20} aria-hidden className="inline mr-2 -mt-1" />
          Projects
        </h2>
        <ComingSoon>Adding, ordering and editing DQC's projects.</ComingSoon>
      </section>
      <Divider />
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-neutral-300">
          <UsersIcon strokeWidth={1.5} size={20} aria-hidden className="inline mr-2 -mt-1" />
          Team
        </h2>
        <ComingSoon>The people on the About page, and their bios.</ComingSoon>
      </section>
    </Main>
  );
}
