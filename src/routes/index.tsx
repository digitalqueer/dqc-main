import Definition from "@/components/_ui/Definition";
import Dialog from "@/components/_ui/Dialog";
import Link from "@/components/_ui/Link";
import Main from "@/components/_ui/Main";
import Prose from "@/components/_ui/Prose";
import SupportRibbon from "@/components/blocks/SupportRibbon";
import ContactDialog from "@/components/dialogs/ContactDialog";
import { getContactForm } from "@/server/functions/contact.functions";
import { createFileRoute, Link as TanstackLink } from "@tanstack/react-router";
import { ArrowRightIcon, SendIcon } from "lucide-react";

export const Route = createFileRoute("/")({
  component: App,
  loader: () => getContactForm(),
});

function App() {
  const { turnstile_site_key } = Route.useLoaderData();

  return (
    <Main>
      <Prose>
        <h2 className="normal-case! font-normal!">
          The Digital Queer Collective [DQC] is a community of 2SLGBTQIA+
          technologists and policy strategists dedicated to creating innovative
          software that celebrates inclusivity, creativity, and user diversity.
        </h2>

        <Definition
          word="Queer"
          pronunciation="kwir"
          partOfSpeech="adjective"
          definition="beyond or deviating from the usual or expected"
          link={{ label: "Read More", to: "/about" }}
        />

        <SupportRibbon className="my-5" />

        <h3 className="mt-0">Building an Infrastructure for Change</h3>
        <p>
          <b className="text-white">Software Development (Web Focus)</b> — the
          creation and optimization of digital platforms and services that
          enhance accessibility, visibility, and support the advancement of
          marginalized individuals, organizations, communities, and initiatives.
        </p>
        <p>
          <b className="text-white">Strategic Partnership</b> — forging
          collaborative relationships between tech professionals, universities,
          businesses, nonprofits, and mission-driven collectives or
          organizations to strengthen digital infrastructure, amplify impact,
          and advance equity for marginalized communities.
        </p>
        <p>
          <b className="text-white">Resistance</b> — the active practice of
          challenging systems of oppression, inequity, and exclusion through our
          deployment of digital services, policy advocacy, and collective
          action. Grounded in intersectionality, resistance guides our work
          toward dismantling structural barriers and reimagining power in ways
          that center liberation, accessibility, and care.
        </p>

        <div className="flex flex-wrap gap-2">
          <ContactDialog turnstileSiteKey={turnstile_site_key}>
            <Dialog.Action command="show-modal" className="text-white">
              <SendIcon strokeWidth={1.5} size={16} />
              <span>Looking to Connect?</span>
            </Dialog.Action>
          </ContactDialog>

          <Link to="/about" className="no-underline">
            See More About the Collective
          </Link>
        </div>

        <h3>
          <TanstackLink to="/projects" className="no-underline">
            Public Works &amp; Projects
          </TanstackLink>
        </h3>

        <div className="flex justify-between gap-2 items-center mt-6 mb-2">
          <h4 className="font-bold inline-block m-0!">
            <TanstackLink
              to="/projects/tfp"
              className="no-underline rounded-none"
            >
              Trans Formations Data Archive
            </TanstackLink>
          </h4>

          <Link to="/projects/tfp" className="m-0!">
            <span>View Project</span>
            <ArrowRightIcon strokeWidth={1.5} className="size-4" />
          </Link>
        </div>
      </Prose>
    </Main>
  );
}
