import Link from "@/components/_ui/Link";
import Main from "@/components/_ui/Main";
import Prose from "@/components/_ui/Prose";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronRightIcon, ConstructionIcon } from "lucide-react";

export const Route = createFileRoute("/projects/tfp")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Main>
      <div className="-ml-2 flex items-center gap-2">
        <Link size="sm" to="/projects">
          <span>Projects</span>
        </Link>
        <ChevronRightIcon strokeWidth={1.5} size={16} />
        <Link size="sm" to="/projects" disabled>
          <span>TFP</span>
        </Link>
      </div>
      <Prose>
        <h3>Archiving the Trans Formations Project</h3>
        <h4>Preserving Movement Infrastructure</h4>
        <p>
          The Trans Formations Project (TFP) was a trans-led, grassroots,
          volunteer-driven 501(c)(4) organization that emerged in response to
          the escalating anti-trans legislative crisis in the United States.
          From its founding in 2021, Trans Formations built critical digital
          infrastructure to track, document, and resist coordinated legislative
          attacks on transgender communities nationwide.
        </p>
        <p>
          While engaging in their legislative tracking work, the Trans
          Formations Project built and maintained a comprehensive database of
          anti-trans and trans-affirming legislation introduced at the state and
          federal levels across all 50 states, alongside a parallel dataset
          containing contact information for elected officials and their voting
          records on trans-related bills in committee and on the floor. This
          work transformed fragmented legislative information into a usable,
          action-oriented resource for organizers, advocates, and constituents.
        </p>
        <p>
          DQC was conceived by our cofounders shortly after their volunteer
          tenure with the TFP abruptly came to an end with the closing of the
          organization due to increasingly hostile political environment in
          September 2025. As such, DQC’s archival project exists to preserve,
          steward, and extend this infrastructure of resistance by archiving the
          Trans Formations’ Project’s work. We are safeguarding a uniquely
          valuable record of trans-targeted policy activity and the community
          labor that made it legible.
        </p>
        <p>
          We understand archiving not as passive preservation, but as an active
          political practice. Maintaining this dataset ensures that trans
          communities and allied organizations retain access to the tools needed
          to hold power accountable, respond rapidly to legislative threats, and
          build informed strategies for collective liberation. In doing so, we
          honor Trans Formations’ legacy while reinforcing the digital
          infrastructure necessary for ongoing queer resistance and
          self-determination.
        </p>
        <h3>Data</h3>
        <div className="border px-4">
          <p className="font-mono">
            <ConstructionIcon
              strokeWidth={1.5}
              size={16}
              className="inline-block mr-2"
            />
            <span>Under Construction</span>
          </p>
        </div>
        <h3>Newsletters</h3>
        <div className="border px-4">
          <p className="font-mono">
            <ConstructionIcon
              strokeWidth={1.5}
              size={16}
              className="inline-block mr-2"
            />
            <span>Under Construction</span>
          </p>
        </div>
      </Prose>
    </Main>
  );
}
