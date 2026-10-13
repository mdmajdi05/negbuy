import Link from "next/link";
import PageHero from "./PageHero";
import CtaForm from "./CtaForm";
import Reveal from "./Reveal";
import { SERVICE, SECTOR, PLANT, MACHINE, OEM } from "@/lib/media";

const SERVICES = [
  {
    id: "turbine",
    no: "01",
    kicker: "Turbine solutions",
    title: ["INSTALL, OVERHAUL,", "OPTIMISE."],
    copy:
      "Full lifecycle support for gas and steam turbines — installation, planned maintenance, hot-section repair, upgrades and performance optimisation.",
    bullets: [
      "Hot-section inspection & repair",
      "Rotor balance & alignment",
      "Combustor, blade & seal replacement",
      "Performance & emissions optimisation",
    ],
    img: OEM.sgt5_8000h,
    alt: "Gas turbine cutaway",
    side: SERVICE.turbineIntro,
  },
  {
    id: "oilgas",
    no: "02",
    kicker: "Oil & gas services",
    title: ["UPSTREAM TO", "DOWNSTREAM."],
    copy:
      "Dependable equipment and spares for drilling, refining and distribution — engineered to hold up in demanding, hazardous environments.",
    bullets: [
      "Rotating equipment spares",
      "Refinery GT & compressor support",
      "Pumps, valves & instrumentation",
      "Compliance & safety documentation",
    ],
    img: SECTOR.refinery,
    alt: "Refinery at dusk",
    side: SERVICE.oilgas1,
  },
  {
    id: "electrical",
    no: "03",
    kicker: "Electrical & automation",
    title: ["POWER, CONTROL,", "AUTOMATE."],
    copy:
      "From switchgear and power distribution to PLC/SCADA control systems — reducing downtime and lifting plant output.",
    bullets: [
      "Switchgear & power distribution",
      "PLC, SCADA & drive systems",
      "Control panel build & retrofit",
      "Installation, testing & commissioning",
    ],
    img: SERVICE.elecControls,
    alt: "Electrical control and automation",
    side: SERVICE.elecConstruction,
  },
  {
    id: "marine",
    no: "04",
    kicker: "Marine & offshore",
    title: ["FLEETS KEPT", "RUNNING."],
    copy:
      "Marine automation, propulsion support, engine overhauls and genuine OEM spares for vessels and offshore installations.",
    bullets: [
      "Main engine overhauls",
      "Marine automation & navigation",
      "Genuine OEM marine spares",
      "Offshore maintenance contracts",
    ],
    img: SERVICE.marineOverhaul,
    alt: "Marine engine overhaul",
    side: SECTOR.marine,
  },
  {
    id: "epc",
    no: "05",
    kicker: "EPC services",
    title: ["ENGINEER,", "PROCURE, CONSTRUCT."],
    copy:
      "Turnkey delivery for energy and industrial projects — engineering, procurement and construction under one accountable partner.",
    bullets: [
      "Feasibility & basic engineering",
      "Global procurement & logistics",
      "Construction & site management",
      "Commissioning & handover",
    ],
    img: SECTOR.epcHero,
    alt: "EPC project delivery",
    side: SERVICE.epcExpert,
  },
];

const CAPS = [
  { k: "24/7", v: "Breakdown support" },
  { k: "40+", v: "Countries served" },
  { k: "1,400+", v: "Line items held" },
  { k: "12 mth", v: "Parts warranty" },
];

export default function ServicesPage() {
  return (
    <div className="nbPage">
      <Reveal />
      <PageHero
        index="02"
        kicker="Solutions"
        title={["BUILT FOR", "THE CRITICAL."]}
        lead="Five integrated service lines spanning turbines, oil & gas, electrical, marine and EPC — one accountable partner from enquiry to commissioning."
        image={PLANT.egypt}
        imageAlt="Real combined-cycle power plant"
        stats={[
          { k: "5", v: "Service lines" },
          { k: "24/7", v: "Support" },
          { k: "40+", v: "Countries" },
        ]}
      />

      <section className="nbSvcCaps" aria-label="Capabilities">
        <div className="nbSvcCapsInner">
          {CAPS.map((c) => (
            <div className="nbSvcCap" key={c.v}>
              <b>{c.k}</b>
              <span>{c.v}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="nbSvcList" aria-label="Service lines">
        {SERVICES.map((s, i) => (
          <article
            className={`nbSvc${i % 2 === 1 ? " nbSvc--flip" : ""}`}
            id={s.id}
            key={s.id}
          >
            <div className="nbSvcMedia">
              <figure className="nbSvcMain">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.img} alt={s.alt} loading="lazy" decoding="async" />
              </figure>
              <figure className="nbSvcSide">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.side} alt="" loading="lazy" decoding="async" />
              </figure>
              <span className="nbSvcNo">{s.no}</span>
            </div>

            <div className="nbSvcCopy">
              <div className="kicker">{s.kicker}</div>
              <h2>
                {s.title.map((line, j) => (
                  <span key={line}>
                    {line}
                    {j < s.title.length - 1 && <br />}
                  </span>
                ))}
              </h2>
              <p>{s.copy}</p>
              <ul className="nbSvcBullets">
                {s.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <Link className="nbBtn" href="/contact">
                Discuss this service <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="nbSvcBand" aria-label="Field capability">
        <div className="nbSvcBandInner">
          <div className="nbSvcBandCopy rv">
            <div className="kicker">In the field</div>
            <h2>
              CREWS THAT
              <br />
              <span>SHOW UP.</span>
            </h2>
            <p>
              Certified engineers and technicians on site, at your port or in
              our workshop — with the tooling, spares and paperwork to finish
              the job.
            </p>
          </div>
          <div className="nbSvcBandGrid">
            <figure className="rv">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={MACHINE.testCell} alt="Engine test cell" loading="lazy" decoding="async" />
              <figcaption>Test &amp; run-up</figcaption>
            </figure>
            <figure className="rv" data-rv-delay="90">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={MACHINE.rotorLp} alt="Steam turbine rotor" loading="lazy" decoding="async" />
              <figcaption>Rotor overhaul</figcaption>
            </figure>
            <figure className="rv" data-rv-delay="180">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={MACHINE.nacelleCrane} alt="Wind turbine nacelle lift" loading="lazy" decoding="async" />
              <figcaption>Field installation</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <CtaForm />
    </div>
  );
}
