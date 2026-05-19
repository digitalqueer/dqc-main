import Definition from "@/components/_ui/Definition";
import Main from "@/components/_ui/Main";
import Prose from "@/components/_ui/Prose";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: RouteComponent,
});

function RouteComponent() {
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
          a look at DQC3’s fellowship page{" "}
          <a href="https://dqc3.org/impact-fellowship">here</a>.
        </p>
        <h4>Digital Resistance &amp; Civic Imagination</h4>
        <p>
          We use digital tools as instruments of resistance—supporting civic
          engagement, grassroots organizing, and policy advocacy that challenge
          structural oppression. Through our platforms and programs, we help
          queer communities imagine and build alternative futures rooted in
          care, accessibility, and collective liberation.
        </p>

        <h2>Our Team</h2>
        <h3>
          Devin Sharpe <span className="text-xs">he/him</span>
        </h3>
        <p>
          Devin Sharpe is the co-founder of DQC, where he leads the development
          and advancement of the collective’s projects and initiatives. Devin’s
          formative years were spent in Detroit and the surrounding areas, while
          his adolescence was nurtured in the South, namely the Atlanta metro
          area. His life experience has been defined by his position at the
          intersections of different identities. Growing up as a mixed-race,
          bisexual man in a semi-nomadic, heavily spiritual household gave him
          an optimistic belief that one’s true self will take root despite
          societal and/or personal pressures to repress it.
        </p>
        <p>
          Professionally, Devin works as a frontend-focused software engineer,
          and has assisted teams in creating products or experiences that
          delight everyday users and consumers while refusing to neglect those
          who rely on accessibility assists. His current post at{" "}
          <a href="https://gostrata.com">Strata Company</a>, based in
          Pennsylvania, has him leading the frontend development of a new
          product that connects digitally-minded marketing professionals with a
          revitalized mail outreach channel. Prior to Strata, Devin has served
          at a number of other companies, such as the Washington Post, where he
          assisted with experimental products and initiatives.
        </p>
        <p>
          Prior to starting DQC, Devin volunteered with queer advocacy
          organizations in his free time, mostly with the{" "}
          <a href="https://transformationsproject.org">
            Trans Formations Project
          </a>
          . At TFP, he served on the Widget Development team and helped use US
          legislative bill data collected by the organization to create
          compelling web applications to assist queer people looking to track
          dangerous, anti-trans legislation or how their representatives were
          voting on their behalf.
        </p>
        <p>
          By starting DQC and working with its members, Devin hopes to continue
          to uplift the 2SLGBTQIA+ community by creating digital spaces where
          queer safety is prioritized, identities are accepted, and queer
          advocacy can happen.
        </p>

        <h3>
          Laith Stevenson <span className="text-xs">she/they</span>
        </h3>
        <p>
          Laith Stevenson is the co-founder of{" "}
          <a href="https://dqc3.org">DQC(3)</a>, where she works at the
          intersection of queer justice, technology, and civic infrastructure.
          As an out and proud black trans woman from the rural South, Laith’s
          work is shaped by lived experience navigating systems of surveillance,
          exclusion, and legislative violence—experiences that ground DQC3’s
          commitment to building community-controlled digital tools for
          advancing liberation movements.
        </p>
        <p>
          Currently, Laith is a graduate student at the{" "}
          <a href="https://sp2.upenn.edu/">
            University of Pennsylvania’s School of Social Policy &#38; Practice
            &#40;SP2&#41;
          </a>
          , where she studies social policy with a focus on data ethics,
          technology governance, and the political economy of automation. She is
          pursuing a Certificate in Applied Data Ethics, Law, and the Social
          Good and conducts research on the artificial intelligence, digital
          equity, and the the socio-technical governance implications of
          emerging technologies.{" "}
        </p>
        <p>
          Laith is also a Policy Advocacy Intern with{" "}
          <a href="https://publicknowledge.org/">Public Knowledge</a>,
          supporting federal advocacy on open internet policy, communications
          competition, and balanced intellectual property frameworks Her
          professional background spans litigation support, social science
          research, nonprofit development, and digital
          communications—experiences that inform her interdisciplinary approach
          to policy analysis and technical capacity building.{" "}
        </p>
        <p>
          She has been deeply involved in trans-led legislative resistance
          efforts, including volunteering with the{" "}
          <a href="https://transformationsproject.org">
            Trans Formations Project
          </a>
          , where she contributed bill summaries to a comprehensive database
          tracking anti-trans and trans-affirming legislation nationwide
          through. She also serves on the board of the{" "}
          <a href="https://carpeatlanta.com/">
            Center for Abolition Research, Policy, and Education (CARPE)
          </a>
          , supporting, research, governance and strategy for Black trans
          advocacy.
        </p>
        <p>
          Through DQC3, Laith advances a model of queer tech work rooted in
          intersectionality, accessibility, and collective power. She
          understands digital infrastructure as a site of political struggle and
          believes that building ethical, justice-driven technology is essential
          to sustaining social movements, protecting marginalized communities,
          and imagining liberated futures.
        </p>
      </Prose>
    </Main>
  );
}
