import Link from "next/link";
import PageHero from "./PageHero";
import CtaForm from "./CtaForm";
import Reveal from "./Reveal";
import CompanyFilm from "./CompanyFilm";
import GroupCompanies from "./GroupCompanies";
import { PLANT, MACHINE, SECTOR, SERVICE, SHOP } from "@/lib/media";

const VALUES = [
  { no: "01", title: "Uptime first", copy: "Every decision is measured against one question: does this keep the machine running?" },
  { no: "02", title: "Traceable quality", copy: "Material certs, inspection records and full documentation on every part we ship." },
  { no: "03", title: "One accountable partner", copy: "Spares, service and projects under a single point of responsibility." },
  { no: "04", title: "Built to last", copy: "We specify for service life, not for the cheapest quote on the day." },
];

const MILESTONES = [
  { year: "2013", title: "Founded", copy: "NEGBUY begins supplying industrial and rotating-equipment spares to regional plants." },
  { year: "2017", title: "Turbine focus", copy: "Dedicated gas turbine spares desk launches with global feedstock sourcing." },
  { year: "2021", title: "Service division", copy: "Field service, overhauls and commissioning teams stood up across power and marine." },
  { year: "2024", title: "Multi-sector", copy: "Oil & gas, electrical, automation, EV and solar added to the portfolio." },
  { year: "2026", title: "Global", copy: "Serving 40+ countries with spares, overhauls and EPC delivery." },
];

export default function AboutPage() {
  return (
    <div className="nbPage">
      <Reveal />
      <PageHero
        index="03"
        kicker="Our company"
        title={["MOVING", "INDUSTRY", "FORWARD."]}
        lead="NEGBUY is an energy, turbine, marine and electrical solutions company — supplying critical equipment and keeping demanding plants, refineries and fleets running."
        image={PLANT.aerial}
        imageAlt="Real industrial plant aerial view"
        stats={[
          { k: "2013", v: "Established" },
          { k: "40+", v: "Countries" },
          { k: "8", v: "Sectors" },
        ]}
      />

      {/* Story + autoplay company film */}
      <section className="nbAboutStory" id="story" aria-label="Our story">
        <div className="nbAboutInner">
          <div className="nbAboutCopy rv">
            <div className="kicker">Who we are</div>
            <h2>
              THE COMPANY
              <br />
              <span>BEHIND THE MACHINES.</span>
            </h2>
            <p>
              For over a decade NEGBUY has connected industrial operators with
              the parts, engineering and field support they need to keep
              producing. We work across turbines, energy, oil &amp; gas, marine,
              electrical, automation, EV and solar — always with the same
              promise: genuine, traceable, on time.
            </p>
            <p>
              Our engineers read a nameplate, a part number or a photograph and
              know the unit behind it. That knowledge, plus a global feedstock
              of spares and a service crew that shows up, is why operators keep
              our number close.
            </p>
            <div className="nbAboutTags">
              <span>Spares</span>
              <span>Overhaul</span>
              <span>Field service</span>
              <span>EPC</span>
              <span>Global feedstock</span>
            </div>
            <span className="nbBtn">
              Work with us <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <CompanyFilm />
        </div>
      </section>

      {/* Values */}
      <section className="nbValues" aria-label="What we stand for">
        <div className="nbValuesInner">
          <div className="nbValuesHead rv">
            <div className="kicker">What we stand for</div>
            <h2>
              FOUR RULES.
              <br />
              <span>NO EXCEPTIONS.</span>
            </h2>
          </div>
          <div className="nbValuesGrid">
            {VALUES.map((v, i) => (
              <article className="nbValue rv" data-rv-delay={i * 90} key={v.no}>
                <span className="nbValueNo">{v.no}</span>
                <h3>{v.title}</h3>
                <p>{v.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="nbTimeline" aria-label="Company milestones">
        <div className="nbTimelineInner">
          <div className="nbTimelineHead rv">
            <div className="kicker">The road so far</div>
            <h2>
              A DECADE
              <br />
              <span>IN THE FIELD.</span>
            </h2>
          </div>
          <ol className="nbLine">
            {MILESTONES.map((m, i) => (
              <li className="nbLineItem rv" data-rv-delay={i * 80} key={m.year}>
                <span className="nbLineYear">{m.year}</span>
                <div className="nbLineBody">
                  <h3>{m.title}</h3>
                  <p>{m.copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Global feedstock */}
      <section className="nbGlobal" aria-label="Global feedstock">
        <div className="nbGlobalInner">
          <figure className="nbGlobalShot rv">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SECTOR.global} alt="Global feedstock warehouse" loading="lazy" decoding="async" />
          </figure>
          <div className="nbGlobalCopy rv" data-rv-delay="120">
            <div className="kicker">Global feedstock</div>
            <h2>
              STOCK
              <br />
              WITHOUT BORDERS.
            </h2>
            <p>
              A distributed feedstock of fast-moving spares plus verified
              sourcing for long-lead items means the part you need is never far
              away — and it moves the moment you commit.
            </p>
            <ul className="nbGlobalStats">
              <li>
                <b>45,000+</b>
                <span>Part numbers</span>
              </li>
              <li>
                <b>48 h</b>
                <span>Emergency dispatch</span>
              </li>
              <li>
                <b>40+</b>
                <span>Countries served</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Group of companies */}
      <GroupCompanies />

      {/* Facility strip */}
      <section className="nbFacility" aria-label="Our facilities">
        <div className="nbFacilityInner">
          <figure className="rv">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SHOP.mapna1} alt="Workshop" loading="lazy" decoding="async" />
          </figure>
          <figure className="rv" data-rv-delay="80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SERVICE.tManufacturing} alt="Manufacturing" loading="lazy" decoding="async" />
          </figure>
          <figure className="rv" data-rv-delay="160">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={MACHINE.nacelle} alt="Wind turbine" loading="lazy" decoding="async" />
          </figure>
        </div>
      </section>

      <CtaForm />
    </div>
  );
}
