import { createFileRoute } from "@tanstack/react-router";
import { Fragment } from "react";
import Definition from "@/components/_ui/Definition";
import Main from "@/components/_ui/Main";
import Prose from "@/components/_ui/Prose";
import { RichTextRenderer } from "@/components/rich-text/RichTextRenderer";
import { pageMeta } from "@/lib/share";
import { getPublishedTeam } from "@/server/functions/team.functions";

export const Route = createFileRoute("/about")({
  // Everyone with a published bio, in the order set on the admin Team page.
  loader: () => getPublishedTeam(),
  head: () => ({
    meta: pageMeta({ title: "About" }),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { members: team, media } = Route.useLoaderData();

  return (
    <Main>
      <Prose>
        <h2 className="sr-only">About DQC</h2>
        <Definition
          word="Queer"
          pronunciation="kwir"
          partOfSpeech="adj./n."
          definition="more than an identity, queerness is a mode of resistance — a refusal to conform to the power structures, hierarchies, and binaries which seek to define and contain us. It embraces diversity, lateral distributions of power and self-determination, affirming that liberation is collective and rooted in our otherness. Queerness is intersectional at its core, grounded in the understanding that gender, sexuality, race, class, ability, and other socially constructed identities shape how we experience both oppression and freedom. Informed by feminism, critical race studies and disability justice, queerness challenges the systems that uphold heteronormativity, cisnormativity, whiteness and ableism, and instead imagines new worlds built on accessibility, equity, and care for one another."
        />

        <h3>Our Values</h3>
        <h4>Technology as Infrastructure</h4>
        <p>
          We treat technology as political infrastructure. Our approach to
          software development and web consulting centers 2SLGBTQIA+ and BIPOC
          communities as agents of change shaping the ecosystems that govern
          visibility, access, and power. We build digital systems that resist
          surveillance, extraction, and exclusion while expanding autonomy and
          civic participation.
        </p>
        <h4>Capacity Building</h4>
        <p>
          We prioritize skill transfer, knowledge-sharing, and long-term
          organizational capacity over one-off services. Through our web
          development fellowship and technical partnerships, we equip
          organizations serving the 2SLGBTQIA+ and BIPOC communities with the
          digital infrastructure and expertise needed to sustain their work,
          grow their reach, and self-determine their futures.
        </p>
        <h4>Ethically-aligned Design &amp; Technical Practice</h4>
        <p>
          Our technical work is grounded in intersectionality, data ethics,
          critical race studies, and disability justice. We design websites,
          platforms, and digital strategies with an understanding that race,
          gender, disability, class, and geography shape how technology is
          accessed and experienced—and these technologies must be inclusive by
          design, not retrofit. For more on our ethics, see our Ethics Statement
          here.
        </p>
        <h4>Power Through Collaboration</h4>
        <p>
          We believe technologies are sociotechnical systems strengthened
          through collaboration and participatory design. We value strategic
          partnerships with technologists, universities, nonprofits, and
          movement organizations that share a commitment to equity. Our
          partnerships are structured to redistribute resources, elevate
          community expertise, and strengthen collective digital power across
          the queer justice ecosystem. To learn more about our collaborative web
          development fellowship program with our sister organization DQC3, take
          a look at{" "}
          <a href="https://dqc3.org/impact-fellowship">
            DQC3’s fellowship page
          </a>
          .
        </p>
        <h4>Digital Resistance &amp; Civic Imagination</h4>
        <p>
          We use digital tools as instruments of resistance—supporting civic
          engagement, grassroots organizing, and policy advocacy that challenge
          structural oppression. Through our platforms and programs, we help
          queer communities imagine and build alternative futures rooted in
          care, accessibility, and collective liberation.
        </p>

        {team.length > 0 && (
          <>
            <h2 id="our-team">Our Team</h2>
            {team.map((member) => (
              <Fragment key={member.id}>
                <h3>
                  {member.name}
                  {member.pronouns && (
                    <>
                      {" "}
                      <span className="text-xs">{member.pronouns}</span>
                    </>
                  )}
                </h3>
                {/* Under the h3 name, so a bio's headings start at h4. The
                    first paragraph sits right under the name, as `h3 + p` does. */}
                <RichTextRenderer
                  document={member.bio}
                  media={media}
                  heading_shift={1}
                  className="rich-text [&>:first-child]:mt-0"
                />
              </Fragment>
            ))}
          </>
        )}
      </Prose>
    </Main>
  );
}
