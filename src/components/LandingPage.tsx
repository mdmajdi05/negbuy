"use client";

import { useMemo, useRef } from "react";
import Image from "next/image";
import Header from "./Header";
import TurbineCursor from "./TurbineCursor";
import TurbineWorks from "./TurbineWorks";
import FactoryFloor from "./FactoryFloor";
import StatsBand from "./StatsBand";
import ProcessLine from "./ProcessLine";
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
    img: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=800&auto=format&fit=crop",
    alt: "Wind turbines generating clean energy",
  },
  {
    no: "02 / TURBINES",
    title: ["Turbine", "Solutions"],
    description: "Gas turbine parts, engines, maintenance and optimization.",
    img: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=800&auto=format&fit=crop",
    alt: "Engineer servicing turbine equipment",
  },
  {
    no: "03 / MARINE",
    title: ["Marine &", "Offshore"],
    description: "Marine automation, navigation and power solutions.",
    img: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?q=80&w=800&auto=format&fit=crop",
    alt: "Cargo ship at sea for marine solutions",
  },
  {
    no: "04 / AUTOMATION",
    title: ["Industrial", "Automation"],
    description:
      "Control systems, electrical engineering and process optimization.",
    img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
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

  return (
    <div ref={rootRef}>
      <TurbineCursor />
      <a className="skipLink" href="#main-content">
        Skip to main content
      </a>

      <Header />

      <main id="main-content">
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

        <TurbineWorks />

        <FactoryFloor />

        <StatsBand />

        <ProcessLine />

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
                href="#contact"
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

        <section className="redSection" id="contact">
          <div className="redContent reveal">
            <div className="kicker" style={{ color: "#111" }}>
              05 / Start a conversation
            </div>
            <h2>
              MOVE
              <br />
              FORWARD.
            </h2>
            <a className="cta" href="mailto:contact@negbuy.com">
              Talk to NEGBUY{" "}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
      </main>

      <footer>
        <div className="footerGrid">
          <a href="https://negbuy.com/" aria-label="NEGBUY home">
            <Image
              className="footerLogo"
              src="/header-logo.png"
              alt="NEGBUY logo"
              width={155}
              height={62}
            />
          </a>
          <p className="footerText">
            NEGBUY provides solutions across turbines, energy, oil &amp; gas,
            marine, electrical, automation, EV and solar industries.
          </p>
        </div>
        <div className="footerBottom">
          <span>© 2026 NEGBUY. All rights reserved.</span>
          <span>Energy · Industry · Technology</span>
        </div>
      </footer>
    </div>
  );
}
