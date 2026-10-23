"use client";

import { useCallback, useRef, useState } from "react";
import {
  easeTo,
  prefersReducedMotion,
  sectionProgress,
  useRafLoop,
} from "@/hooks/useRafLoop";

const STAGES = [
  {
    no: "01",
    tag: "STAGE 01 / INTAKE",
    title: "AIR INTAKE",
    desc: "Giant inlet guides pull 800kg of air per second into the compressor. Rotor spools up, inlet vanes adjust angle live.",
    metric: "12,400",
    unit: "RPM ROTOR",
    bar: 22,
  },
  {
    no: "02",
    tag: "STAGE 02 / COMPRESSION + OIL",
    title: "OIL PRESSURE",
    desc: "Lube-oil skids push ISO VG-46 oil at 8 bar through bearings. Watch the amber oil line pulse — cooling + lubrication in one loop.",
    metric: "8.2",
    unit: "BAR OIL LINE",
    bar: 55,
  },
  {
    no: "03",
    tag: "STAGE 03 / COMBUSTION",
    title: "IGNITION CORE",
    desc: "Compressed air meets fuel. 1,400°C flame held inside the liner while the casing stays cool — the hottest controlled fire in industry.",
    metric: "1,400°",
    unit: "C COMBUSTOR",
    bar: 82,
  },
  {
    no: "04",
    tag: "STAGE 04 / POWER OUT",
    title: "POWER OUTPUT",
    desc: "Exhaust expands through power turbine stages. Shaft torque becomes megawatts feeding the grid, ships and plants.",
    metric: "42.6",
    unit: "MW OUTPUT",
    bar: 100,
  },
];

const NOTES = [
  { cls: "n1", label: "INLET", value: "800 kg/s" },
  { cls: "n2", label: "OIL LOOP", value: "8 bar" },
  { cls: "n3", label: "COMBUSTOR", value: "1,400°C" },
  { cls: "n4", label: "EXHAUST", value: "42.6 MW" },
];

const CARDS = [
  {
    img: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=800&auto=format&fit=crop",
    alt: "Engineer inspecting gas turbine",
    no: "TW — 01",
    title: "Gas Turbine Overhaul",
    desc: "Hot-gas-path inspection, blade replacement and balancing under ISO clean-room discipline.",
    stat: "98.2% availability",
    place: "Plant deck",
  },
  {
    img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
    alt: "Industrial oil and piping systems",
    no: "TW — 02",
    title: "Lube Oil Supply Skids",
    desc: "Pumps, coolers, filters and accumulators — complete oil circulation packages for turbines.",
    stat: "8 bar continuous",
    place: "Oil room",
  },
  {
    img: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?q=80&w=800&auto=format&fit=crop",
    alt: "Container ship for marine propulsion",
    no: "TW — 03",
    title: "Marine Propulsion",
    desc: "Propulsion turbines, gearboxes and control retrofits for vessels and offshore platforms.",
    stat: "40+ vessels served",
    place: "Engine room",
  },
  {
    img: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=800&auto=format&fit=crop",
    alt: "Wind turbines at power plant",
    no: "TW — 04",
    title: "Power Plant Support",
    desc: "Spares, commissioning and lifetime extension for generation and solar-hybrid sites.",
    stat: "240 MW supported",
    place: "Grid site",
  },
];

export default function TurbineWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fanRef = useRef<HTMLImageElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const oilRef = useRef<HTMLDivElement>(null);
  const stageEls = useRef<(HTMLLIElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);

  const currentRef = useRef(0);
  const [activeJob, setActiveJob] = useState(0);

  const draw = useCallback(() => {
    const sec = sectionRef.current;
    if (!sec) return true;

    const target = sectionProgress(trackRef.current ?? sec);
    const next = easeTo(
      currentRef.current,
      target,
      prefersReducedMotion() ? 1 : 0.1
    );
    currentRef.current = next;

    // one scroll value drives the whole instrument: dial arc, rotor, heat, oil
    sec.style.setProperty("--iw-p", next.toFixed(4));

    if (fanRef.current) {
      const spins = next * 1080;
      fanRef.current.style.transform = `rotate(${spins}deg) scale(${
        1 + next * 0.03
      })`;
    }
    if (orbitRef.current) {
      orbitRef.current.style.transform = `rotate(${next * -55}deg)`;
    }
    if (glowRef.current) {
      const heat = next;
      glowRef.current.style.opacity = String(0.24 + heat * 0.66);
      glowRef.current.style.transform = `translate(-50%,-50%) scale(${
        0.72 + heat * 0.44
      })`;
    }
    if (oilRef.current) {
      oilRef.current.style.setProperty("--iw-spin", `${0.9 + next * 3}s`);
      oilRef.current.style.opacity = String(0.5 + next * 0.5);
    }

    // stage list: highlight the active row
    const idx = Math.min(STAGES.length - 1, Math.floor(next * STAGES.length));
    stageEls.current.forEach((el, i) => {
      if (!el) return;
      el.classList.toggle("active", i === idx);
    });
    if (readoutRef.current) {
      readoutRef.current.textContent = String(idx + 1).padStart(2, "0");
    }
    if (progressRef.current) {
      progressRef.current.style.transform = `scaleX(${next})`;
    }

    return next === target;
  }, []);

  useRafLoop(sectionRef, draw);

  return (
    <section
      className="iwScroll"
      id="inside-machine"
      ref={sectionRef}
      aria-label="How turbines work — oil supply and power stages"
    >
      {/* PINNED STAGE — scroll distance lives on .iwTrack */}
      <div className="iwTrack" ref={trackRef}>
        <div className="iwPin">
          <div className="iwGrid" aria-hidden="true" />
          <span className="iwGhost" aria-hidden="true">
            01.5
          </span>

          <div className="iwInner">
            <header className="iwHead">
              <div className="iwHeadCopy">
                <div className="iwKicker">
                  <i className="iwKickerDot" aria-hidden="true" />
                  01.5 / Inside the machine
                </div>
                <h2>
                  WATCH A TURBINE
                  <br />
                  <span>BREATHE + BURN.</span>
                </h2>
              </div>
              <div className="iwHeadSide">
                <p className="iwLead">
                  Scroll — the rotor spools up, oil starts flowing and the core
                  heats to full power. A live look at the machines NEGBUY
                  supplies and services.
                </p>
                <div className="iwHeadMeta">
                  <span>4 stages</span>
                  <span>Live scroll link</span>
                </div>
              </div>
            </header>

            <div className="iwBody">
              {/* REAL TURBINE — transparent GE90 fan cut-out in a test-cell dial */}
              <figure className="iwVisual">
                <div className="iwGlow" ref={glowRef} aria-hidden="true" />

                <div className="iwDial" aria-hidden="true">
                  <i className="iwDialTicks" />
                  <i className="iwDialArc" />
                  <i className="iwDialArcSoft" />
                </div>

                <div className="iwOrbit" ref={orbitRef} aria-hidden="true" />
                <span className="iwAxis x" aria-hidden="true" />
                <span className="iwAxis y" aria-hidden="true" />

                <div className="iwFan" aria-hidden="true">
                  <div className="iwFanSpin">
                    <img
                      className="iwFanImg"
                      ref={fanRef}
                      src="/real/ge90-fan.webp"
                      alt=""
                      draggable={false}
                      loading="lazy"
                    />
                  </div>
                  <span className="iwHub">
                    <i />
                  </span>
                </div>

                <span className="iwArc" ref={oilRef} aria-hidden="true" />

                <span className="iwBracket tl" aria-hidden="true" />
                <span className="iwBracket tr" aria-hidden="true" />
                <span className="iwBracket bl" aria-hidden="true" />
                <span className="iwBracket br" aria-hidden="true" />

                {NOTES.map((n) => (
                  <span className={`iwNote ${n.cls}`} key={n.cls}>
                    <b>
                      <i /> {n.label}
                    </b>
                    <small>{n.value}</small>
                  </span>
                ))}

                <span className="iwFigCap" aria-hidden="true">
                  GE90 fan · cutaway
                </span>
              </figure>

              {/* STAGE TELEMETRY */}
              <div className="iwPanel">
                <div className="iwPanelHead">
                  <span>Stage telemetry</span>
                  <span className="iwPanelHint">Scroll to cycle</span>
                </div>
                <ol className="iwStages">
                  {STAGES.map((s, i) => (
                    <li
                      key={s.tag}
                      ref={(el) => {
                        stageEls.current[i] = el;
                      }}
                      className={`iwStage${i === 0 ? " active" : ""}`}
                    >
                      <span className="iwStageNo">{s.no}</span>
                      <div className="iwStageBody">
                        <span className="iwStageTag">{s.tag}</span>
                        <h3>{s.title}</h3>
                        <p>{s.desc}</p>
                        <div className="iwBar">
                          <i style={{ width: `${s.bar}%` }} />
                        </div>
                      </div>
                      <div className="iwStageMetric">
                        <b>{s.metric}</b>
                        <small>{s.unit}</small>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="iwProgress">
              <span className="iwProgressNo">
                <b ref={readoutRef}>01</b> / 04
              </span>
              <div className="iwProgressTrack">
                <div className="iwProgressFill" ref={progressRef} />
              </div>
              <em>Scroll to spool up</em>
            </div>

            <p className="iwCredit">
              Turbine photo — GE90 fan, Wikimedia Commons / CC BY-SA 2.0
            </p>
          </div>
        </div>
      </div>

      {/* FIELD WORK — dossier index with a live preview panel */}
      <div className="iwCards">
        <div className="iwCardsHead reveal">
          <div className="iwKicker">
            <i className="iwKickerDot" aria-hidden="true" />
            Field work / Oil + Turbines
          </div>
          <h2>
            REAL MACHINES.
            <br />
            <span>REAL SITES.</span>
          </h2>
          <p className="iwCardsLead">
            Every stage above exists somewhere in the field — on a plant deck, a
            ship engine room or a service bay. Here is where NEGBUY does the
            work.
          </p>
        </div>

        <div className="iwField reveal">
          <div className="iwFieldBar">
            <span>Selected field jobs</span>
            <span>04 records · 2019 — 2026</span>
          </div>

          <div className="iwFieldGrid">
            <ol className="iwFieldList">
              {CARDS.map((c, i) => (
                <li key={c.no}>
                  <button
                    type="button"
                    className={`iwFieldRow${i === activeJob ? " is-active" : ""}`}
                    onMouseEnter={() => setActiveJob(i)}
                    onFocus={() => setActiveJob(i)}
                    onClick={() => setActiveJob(i)}
                    aria-pressed={i === activeJob}
                  >
                    <span className="iwFieldNo">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="iwFieldBody">
                      <span className="iwFieldTag">
                        {c.no} · {c.place}
                      </span>
                      <span className="iwFieldTitle">{c.title}</span>
                      <span className="iwFieldDesc">{c.desc}</span>
                    </span>
                    <span className="iwFieldMeta">
                      <span className="iwFieldStat">
                        <i aria-hidden="true" />
                        {c.stat}
                      </span>
                      <span className="iwFieldArrow" aria-hidden="true">
                        →
                      </span>
                    </span>
                    <span className="iwFieldThumb" aria-hidden="true">
                      <img src={c.img} alt="" loading="lazy" />
                    </span>
                  </button>
                </li>
              ))}
            </ol>

            <div className="iwFieldPreview" aria-hidden="true">
              {CARDS.map((c, i) => (
                <figure
                  key={c.no}
                  className={`iwFieldPic${i === activeJob ? " is-on" : ""}`}
                >
                  <img src={c.img} alt="" loading="lazy" />
                </figure>
              ))}
              <div className="iwFieldFrame" />
              <span className="iwFieldCount">
                {String(activeJob + 1).padStart(2, "0")} / 04
              </span>
              <div className="iwFieldCaption">
                <span>{CARDS[activeJob].place}</span>
                <b>{CARDS[activeJob].title}</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
