"use client";

import { useCallback, useRef, useState } from "react";
import { SHOP, MACHINE } from "@/lib/media";
import {
  easeTo,
  prefersReducedMotion,
  sectionProgress,
  useRafLoop,
} from "@/hooks/useRafLoop";

const FRAMES = [
  {
    img: SHOP.nacelleUnload,
    kicker: "Assembly hall",
    title: "HEAVY ASSEMBLY",
    copy: "Rotors, casings and skids married up under overhead cranes — torque logged fastener by fastener.",
    stat: "48t",
    statLabel: "crane capacity",
  },
  {
    img: SHOP.cutMetal,
    kicker: "Fabrication",
    title: "PRECISION WELD",
    copy: "WPS-qualified welders, certified procedures and dye-penetrant checks on every critical seam.",
    stat: "100%",
    statLabel: "NDT coverage",
  },
  {
    img: MACHINE.rotorLp,
    kicker: "Rotor shop",
    title: "BALANCE & FIT",
    copy: "Blade sets fitted, clearances measured, then the rotor spun for dynamic balance.",
    stat: "±5µm",
    statLabel: "balance tolerance",
  },
  {
    img: SHOP.controlRoom,
    kicker: "Control room",
    title: "RUN-UP CONTROL",
    copy: "Speed, vibration and exhaust temperature watched live through first-fire and full-load.",
    stat: "24/7",
    statLabel: "monitoring",
  },
  {
    img: SHOP.weldSparks,
    kicker: "Overhaul bay",
    title: "HOT-SECTION REPAIR",
    copy: "Coating, re-blading and liner refurbishment bring worn hot-gas-path parts back to spec.",
    stat: "6 wks",
    statLabel: "typical turnaround",
  },
];

export default function OnTheFloor() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);

  const currentRef = useRef(0);

  const draw = useCallback(() => {
    const sec = sectionRef.current;
    const track = trackRef.current;
    if (!sec || !track) return true;

    const target = sectionProgress(sec);
    const next = easeTo(
      currentRef.current,
      target,
      prefersReducedMotion() ? 1 : 0.09
    );
    currentRef.current = next;

    const travel = Math.max(0, track.scrollWidth - window.innerWidth + 64);
    track.style.transform = `translate3d(${(-next * travel).toFixed(1)}px,0,0)`;
    if (barRef.current) {
      barRef.current.style.transform = `scaleX(${next.toFixed(3)})`;
    }
    const idx = Math.min(
      FRAMES.length - 1,
      Math.round(next * (FRAMES.length - 1))
    );
    setActive((prev) => (prev === idx ? prev : idx));

    return next === target;
  }, []);

  useRafLoop(sectionRef, draw);

  return (
    <section
      className="nbFloor"
      ref={sectionRef}
      aria-label="Inside the NEGBUY workshop"
      style={{ height: `${FRAMES.length * 78}vh` }}
    >
      <div className="nbFloorPin">
        <div className="nbFloorHead">
          <div>
            <div className="kicker">On the floor</div>
            <h2>
              WHERE IT
              <br />
              <span>GETS BUILT.</span>
            </h2>
          </div>
          <p>
            Real workshop, real hands. Scroll to move through the NEGBUY
            build-and-overhaul line — from heavy assembly to first fire.
          </p>
        </div>

        <div className="nbFloorViewport">
          <div className="nbFloorTrack" ref={trackRef}>
            {FRAMES.map((f, i) => (
              <article
                className={`nbFrame${i === active ? " is-active" : ""}`}
                key={f.title}
              >
                <div className="nbFrameShot">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.img} alt={f.kicker} loading="lazy" decoding="async" />
                  <span className="nbFrameNo">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="nbFrameBody">
                  <span className="nbFrameKicker">{f.kicker}</span>
                  <h3>{f.title}</h3>
                  <p>{f.copy}</p>
                  <div className="nbFrameStat">
                    <b>{f.stat}</b>
                    <small>{f.statLabel}</small>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="nbFloorFoot">
          <span className="nbFloorCount">
            {String(active + 1).padStart(2, "0")} / {String(FRAMES.length).padStart(2, "0")}
          </span>
          <span className="nbFloorBar" aria-hidden="true">
            <i ref={barRef} />
          </span>
          <span className="nbFloorHint">Scroll to advance the line</span>
        </div>
      </div>
    </section>
  );
}
