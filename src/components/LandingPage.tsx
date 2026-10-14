"use client";

import { useMemo, useRef } from "react";
import TurbineAssembly from "./TurbineAssembly";
import TurbineParts from "./TurbineParts";
import OnTheFloor from "./OnTheFloor";
import TurbineWorks from "./TurbineWorks";
import FactoryFloor from "./FactoryFloor";
import StatsBand from "./StatsBand";
import TrustBand from "./TrustBand";
import ProcessLine from "./ProcessLine";
import CaseStudies from "./CaseStudies";
import ShowReel from "./ShowReel";
import BlogTeaser from "./BlogTeaser";
import Testimonials from "./Testimonials";
import FaqSection from "./FaqSection";
import CtaForm from "./CtaForm";
import { useReveal } from "@/hooks/useReveal";
import { SECTOR, SERVICE } from "@/lib/media";
import {
  useLandingAnimation,
  useRevealObserver,
  type LandingRefs,
} from "@/hooks/useLandingAnimation";

const ORBIT_LABELS = [
  {
    className: "orbitLabel ol1",
    title: "Energy Systems",
    description: "Power generation and clean energy solutions.",
  },
  {
    className: "orbitLabel ol2",
    title: "Turbine Solutions",
    description: "Gas turbine parts, engines and industrial equipment.",
  },
  {
    className: "orbitLabel ol3",
    title: "Automation",
    description: "Electrical control and industrial automation.",
  },
];

const SERVICES = [
  {
    no: "01 / ENERGY",
    title: ["Energy", "Systems"],
    description:
      "Power generation, distribution and clean-energy infrastructure.",
    img: SECTOR.energy,
    alt: "Power generation and clean energy infrastructure",
  },
  {
    no: "02 / TURBINES",
    title: ["Turbine", "Solutions"],
    description: "Gas turbine parts, engines, maintenance and optimization.",
    img: SECTOR.turbine,
    alt: "Gas turbine parts and engines for maintenance and optimization",
  },
  {
    no: "03 / MARINE",
    title: ["Marine &", "Offshore"],
    description: "Marine automation, navigation and power solutions.",
    img: SECTOR.marine,
    alt: "Marine automation, navigation and power solutions",
  },
  {
    no: "04 / AUTOMATION",
    title: ["Industrial", "Automation"],
    description:
      "Control systems, electrical engineering and process optimization.",
    img: SERVICE.elecControls,
    alt: "Industrial automation and control systems",
  },
];

const INDUSTRIES = [
  {
    no: "01",
    name: "Oil & Gas",
    description: "Equipment and solutions for demanding operations.",
  },
  {
    no: "02",
    name: "Power Generation",
    description: "Turbines, generators and power infrastructure.",
  },
  {
    no: "03",
    name: "Marine",
    description: "Marine technology and offshore systems.",
  },
  {
    no: "04",
    name: "Electrical",
    description: "Reliable electrical and industrial solutions.",
  },
  {
    no: "05",
    name: "EV & Solar",
    description: "Technology supporting the energy transition.",
  },
];

export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  const hero = useRef<HTMLElement>(null);
  const core = useRef<HTMLDivElement>(null);
  const rotor = useRef<HTMLDivElement>(null);
  const heroCopy = useRef<HTMLDivElement>(null);
  const heroProgress = useRef<HTMLElement>(null);
  const floatWord = useRef<HTMLDivElement>(null);
  const statement = useRef<HTMLDivElement>(null);
  const about = useRef<HTMLElement>(null);
  const service = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  const rings = useRef<(HTMLElement | null)[]>([]);
  const labels = useRef<(HTMLElement | null)[]>([]);

  const refs = useMemo<LandingRefs>(
    () => ({
      hero,
      core,
      rotor,
      rings,
      heroCopy,
      labels,
      heroProgress,
      floatWord,
      statement,
      about,
      service,
      track,
    }),
    []
  );

  useLandingAnimation(refs);
  useRevealObserver(rootRef);
  useReveal();

  return (
    <div ref={rootRef}>
      <main id="main">
        <section className="heroScroll" ref={hero} aria-label="NEGBUY introduction">
          <div className="pin">
            <div className="grid" aria-hidden="true" />
            <div className="redGlow" aria-hidden="true" />

            <div className="heroCopy" id="heroCopy" ref={heroCopy}>
              <p className="eyebrow" data-hero-eyebrow>
                Energy · Turbine · Marine · Electrical
              </p>
              <h1 data-hero-title>
                <span data-hero-line>POWER</span>
                <br />
                <span className="outline" data-hero-line>
                  IN
                </span>
                <br />
                <span data-hero-line>MOTION.</span>
              </h1>
            </div>

            <p className="heroDescription" data-hero-desc>
              A cinematic industrial platform for NEGBUY — connecting critical
              equipment, energy systems and technology across demanding
              industries.
            </p>

            <div className="scrollHint">
              Scroll / Explore
              <div className="scrollLine" aria-hidden="true">
                <i id="heroProgress" ref={heroProgress} />
              </div>
            </div>

            <div className="core" id="core" ref={core} aria-hidden="true">
              <div
                className="ring"
                ref={(el) => {
                  rings.current[0] = el;
                }}
              />
              <div
                className="ring"
                ref={(el) => {
                  rings.current[1] = el;
                }}
              />
              <div
                className="ring"
                ref={(el) => {
                  rings.current[2] = el;
                }}
              />
              <div className="rotor" id="rotor" ref={rotor}>
                <div className="blade b1" />
                <div className="blade b2" />
                <div className="blade b3" />
                <div className="blade b4" />
                <div className="blade b5" />
                <div className="blade b6" />
              </div>
              <div className="hub" />
            </div>

            {ORBIT_LABELS.map((label, index) => (
              <div
                className={label.className}
                key={label.title}
                ref={(el) => {
                  labels.current[index] = el;
                }}
              >
                <b>
                  <i aria-hidden="true" />
                  {label.title}
                </b>
                <small>{label.description}</small>
              </div>
            ))}
          </div>
        </section>

        <TurbineAssembly />

        <TurbineParts />

        <OnTheFloor />

        <TurbineWorks />

        <FactoryFloor />

        <StatsBand />

        <TrustBand />

        <ProcessLine />

        <CaseStudies />

        <ShowReel />

        <section className="section light" id="about" ref={about}>
          <div className="floatingWord" id="floatWord" ref={floatWord} aria-hidden="true">
            MOVE
          </div>
          <div className="sectionInner reveal" id="statement" ref={statement}>
            <div className="kicker">01 / The NEGBUY network</div>
            <h2 className="bigStatement">
              WE DON&apos;T JUST
              <br />
              <span>SUPPLY</span> EQUIPMENT.
              <br />
              WE MOVE INDUSTRY.
            </h2>
          </div>
        </section>

        <section className="serviceSection" id="services" ref={service}>
          <div className="serviceHeader reveal">
            <div className="kicker">02 / Solutions</div>
            <h2>
              BUILT FOR
              <br />
              THE CRITICAL.
            </h2>
          </div>
          <div className="serviceStage">
            <div className="serviceTrack" id="serviceTrack" ref={track}>
              {SERVICES.map((serviceItem) => (
                <article className="serviceCard" key={serviceItem.no}>
                  <div className="visual" aria-hidden="true">
                    <img
                      src={serviceItem.img}
                      alt=""
                      loading="lazy"
                      aria-hidden="true"
                    />
                    <span className="visualShade" aria-hidden="true" />
                  </div>
                  <div className="cardArrow" aria-hidden="true">
                    ↗
                  </div>
                  <div className="cardText">
                    <div className="cardNo">{serviceItem.no}</div>
                    <h3>
                      {serviceItem.title.map((line, index) => (
                        <span key={line}>
                          {line}
                          {index < serviceItem.title.length - 1 && <br />}
                        </span>
                      ))}
                    </h3>
                    <p>{serviceItem.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="industries" id="industries">
          <div className="industryTop reveal">
            <div>
              <div className="kicker">04 / Industries</div>
              <h2>
                ONE NETWORK.
                <br />
                MANY WORLDS.
              </h2>
            </div>
            <p>
              NEGBUY serves energy, turbine, oil &amp; gas, marine, electrical,
              automation, EV and solar requirements.
            </p>
          </div>
          <div className="industryList">
            {INDUSTRIES.map((industry) => (
              <a
                className="industry reveal"
                href="/contact"
                key={industry.no}
                aria-label={`${industry.name} — ${industry.description}`}
              >
                <span className="industryNo">{industry.no}</span>
                <span className="industryName">{industry.name}</span>
                <span className="industryDesc">{industry.description}</span>
              </a>
            ))}
          </div>
        </section>

        <Testimonials />

        <BlogTeaser />

        <FaqSection />

        <CtaForm />
      </main>
    </div>
  );
}
