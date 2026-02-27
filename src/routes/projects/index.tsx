import Link from "@/components/_ui/Link";
import Main from "@/components/_ui/Main";
import Prose from "@/components/_ui/Prose";
import { createFileRoute, Link as TanstackLink } from "@tanstack/react-router";
import { ArrowRightIcon, ExternalLinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/_ui/Button";

export const Route = createFileRoute("/projects/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Main>
      <Prose>
        <h2>Projects</h2>
        <h3>
          <TanstackLink className="no-underline font-bold" to="/projects/tfp">
            Trans Formations Data Archive
          </TanstackLink>
        </h3>
        <p>
          The collective's founders started their queer-advocacy work with
          another organization, the{" "}
          <a
            href="https://transformationsproject.org"
            target="_blank"
            rel="noreferrer"
          >
            Trans Formations Project (TFP)
          </a>
          . TFP focused its efforts on tracking anti-queer legislation efforts
          across the United States. 9 months into President Donald Trump's
          second administration, the organization ceased operations in response
          to growing hositily and concerns for the safety of its members. Upon
          TFP's disbandment, the founders of DQC assisted with archiving the
          data and records gathered by TFP. Much of TFP's data can be found here
          and is welcome to be used for any aligned endeavors.
        </p>
        <p className="text-sm">Spring 2026</p>
        <div className="flex items-center justify-between gap-2 -ml-3">
          <Link to="/projects/tfp">
            <span>View Project</span>
            <ArrowRightIcon strokeWidth={1.5} className="size-4" />
          </Link>
          <a
            href="https://transformationsproject.org"
            target="_blank"
            rel="noreferrer"
            className={cn(
              "flex items-center justify-between gap-2 text-sm",
              buttonVariants(),
            )}
          >
            <span>View Org Site</span>
            <ExternalLinkIcon strokeWidth={1.5} className="size-4" />
          </a>
        </div>
      </Prose>
    </Main>
  );
}
