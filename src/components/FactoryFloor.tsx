"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import FactorySpin from "./FactorySpin";

/**
 * The live WebGL bay is kept behind a flag as a fallback. It is dynamically
 * imported, so its three.js bundle only loads if the flag is flipped — the
 * baked 360° spin above never touches it. Flip to false to fall back to the
 * real-time engine without touching anything else.
 */
const USE_SPIN = true;
const Factory3D = dynamic(() => import("./Factory3D"), { ssr: false });

const FSTAGES = [
  {
    tag: "BAY 01 / ASSEMBLY",
    title: "HANDS ON THE ENGINE",
    desc: "Fitters seat the rotor, torque the case bolts and spin-check the shaft by hand — every value logged against the build sheet.",
    metric: "4",
    unit: "CREW ON THE BAY",
    bar: 30,
  },
  {
    tag: "BAY 02 / WELD + QC",
    title: "SPARKS FLY",
    desc: "The welder fires in pulses up the step ladder while the QC lead scans every seam against the drawing. Lamp stays green — pass, pass, pass.",
    metric: "99.4%",
    unit: "QC PASS RATE",
    bar: 58,
  },
  {
    tag: "BAY 03 / OIL + TEST",
    title: "OIL + TEST",
    desc: "Lube-oil rigs fill, pressurise and leak-test each turbine at 8.2 bar. The amber floor line breathes with the test cycle.",
    metric: "8.2",
    unit: "BAR TEST PRESSURE",
    bar: 80,
  },
  {
    tag: "BAY 04 / DISPATCH",
    title: "NEGBUY OUT",
    desc: "The hoist lifts each finished turbine off its cradle into crates — stencilled, barcoded, sealed for the next plant on the route.",
    metric: "12.4K",
    unit: "UNITS / SHIFT",
    bar: 100,
  },
];

/**
 * 01.8 — the working bay.
 *
 * Deliberately *not* pinned: the section scrolls with the page like any other
 * band. One state variable picks the station, the copy panel is an accordion
 * and the 3D bay eases its camera across the hall to the chosen station — so
 * the reader is never trapped waiting for a scroll animation to finish.
 */
export default function FactoryFloor() {
  const [bay, setBay] = useState(0);

  return (
    <section
      className="factoryScroll"
      aria-label="NEGBUY factory floor — turbine assembly bay"
    >
      <div className="factoryPin factoryPinReal">
        <div className="factoryHead">
          <div>
            <div className="kicker">01.8 / NEGBUY Factory — assembly bay</div>
            <h2>
              PRODUCTION
              <br />
              <span>NEVER STOPS.</span>
            </h2>
          </div>
        </div>
        <p className="factorySub">
          One engine on the cradle, four trades around it, the hoist overhead.
          Drag the bay to spin it through a full turn, or pick a station and the
          shot cuts down the line with you.
        </p>

        <div className="factoryBody show3d">
          {USE_SPIN ? (
            <FactorySpin bay={bay} onPick={setBay} />
          ) : (
            <Factory3D bay={bay} onPick={setBay} />
          )}

          {/* STATIONS — accordion copy, one bay per row */}
          <div className="fstages">
            {FSTAGES.map((s, i) => (
              <div
                key={s.tag}
                role="button"
                tabIndex={0}
                aria-pressed={i === bay}
                aria-label={`${s.tag} — ${s.title}`}
                className={`fstage${i === bay ? " active" : ""}`}
                onClick={() => setBay(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setBay(i);
                  }
                }}
              >
                <div className="fstageTag">{s.tag}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <div className="fmetric">
                  <b>{s.metric}</b>
                  <small>{s.unit}</small>
                </div>
                <div className="fbar">
                  <i style={{ width: `${s.bar}%` }} />
                </div>
              </div>
            ))}
            <div className="factoryHint">
              Drag the bay to spin · pick a station to move the shot
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
