"use client";

import { useEffect, useRef, useState } from "react";
import Factory3D from "./Factory3D";

const BG_IMG =
  "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=1800&auto=format&fit=crop";

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
    tag: "BAY 03 / OIL FILL",
    title: "OIL + TEST",
    desc: "Lube-oil rigs fill, pressurise and leak-test each turbine at 8.2 bar. The amber floor line breathes with the test cycle.",
    metric: "8.2",
    unit: "BAR TEST PRESSURE",
    bar: 80,
  },
  {
    tag: "BAY 04 / DISPATCH",
    title: "NEGBUY OUT",
    desc: "The hoist lifts each finished turbine off its cradle into crates — stencilled, barcoded, sealed — and the counter climbs as you scroll.",
    metric: "12.4K",
    unit: "UNITS / SHIFT",
    bar: 100,
  },
];

const CRATES = Array.from({ length: 8 });

export default function FactoryFloor() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const beltTrackRef = useRef<HTMLDivElement>(null);
  const armA1Ref = useRef<HTMLDivElement>(null);
  const armB1Ref = useRef<HTMLDivElement>(null);
  const claw1Ref = useRef<HTMLDivElement>(null);
  const armA2Ref = useRef<HTMLDivElement>(null);
  const armB2Ref = useRef<HTMLDivElement>(null);
  const claw2Ref = useRef<HTMLDivElement>(null);
  const craneRef = useRef<HTMLDivElement>(null);
  const sparksRef = useRef<HTMLDivElement>(null);
  const signRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const unitsRef = useRef<HTMLElement>(null);
  const oeeNumRef = useRef<HTMLElement>(null);
  const oeeRingRef = useRef<SVGCircleElement>(null);
  const tempRef = useRef<HTMLElement>(null);
  const clockRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const beaconRef = useRef<HTMLDivElement>(null);
  const stageEls = useRef<(HTMLDivElement | null)[]>([]);
  const dotEls = useRef<(HTMLSpanElement | null)[]>([]);
  /** scroll progress (0→1) and active line stage, shared with the 3D viewer */
  const scrollProgRef = useRef(0);
  const activeStageRef = useRef(0);
  const [view, setView] = useState<"3d" | "scene">("3d");

  useEffect(() => {
    const t = window.setInterval(() => {
      if (clockRef.current) {
        clockRef.current.textContent = new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      }
    }, 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    let frame = 0;
    let current = 0;
    const RING_C = 2 * Math.PI * 26;

    const render = () => {
      const sec = sectionRef.current;
      if (!sec) {
        frame = requestAnimationFrame(render);
        return;
      }
      const rect = sec.getBoundingClientRect();
      const max = sec.offsetHeight - window.innerHeight;
      const raw = max > 0 ? -rect.top / max : 0;
      const target = Math.max(0, Math.min(1, raw));
      current += (target - current) * (reduced ? 1 : 0.09);
      scrollProgRef.current = current;

      // Cinematic camera push-in
      if (bgRef.current) {
        bgRef.current.style.transform = `scale(${1.08 + current * 0.14}) translateX(${-current * 2.5}%)`;
      }
      // Scan bar sweeps while line runs
      if (scanRef.current) {
        scanRef.current.style.top = `${8 + current * 80}%`;
        scanRef.current.style.opacity = String(0.35 + current * 0.5);
      }

      // Conveyor
      if (beltTrackRef.current) {
        const track = beltTrackRef.current;
        const parent = track.parentElement;
        const travel = parent
          ? Math.max(0, track.scrollWidth - parent.clientWidth + 40)
          : 0;
        track.style.transform = `translateX(${-current * travel}px)`;
        track.style.setProperty(
          "--belt-speed",
          `${Math.max(0.25, 1.4 - current * 1.15)}s`
        );
      }

      // Robot arms — pick and place
      const t = current * Math.PI * 3;
      const a1 = -28 + Math.sin(t) * 34;
      const b1 = 42 + Math.cos(t * 1.2) * 38;
      const a2 = -20 + Math.sin(t + Math.PI) * 34;
      const b2 = 48 + Math.cos(t * 1.2 + Math.PI) * 38;
      if (armA1Ref.current)
        armA1Ref.current.style.transform = `rotate(${a1}deg)`;
      if (armB1Ref.current)
        armB1Ref.current.style.transform = `rotate(${b1}deg)`;
      if (armA2Ref.current)
        armA2Ref.current.style.transform = `rotate(${a2}deg)`;
      if (armB2Ref.current)
        armB2Ref.current.style.transform = `rotate(${b2}deg)`;
      const pinch = 0.55 + Math.abs(Math.sin(t)) * 0.45;
      if (claw1Ref.current)
        claw1Ref.current.style.transform = `translateX(-50%) scaleX(${pinch})`;
      if (claw2Ref.current)
        claw2Ref.current.style.transform = `translateX(-50%) scaleX(${1.15 - pinch * 0.4})`;

      if (craneRef.current) {
        craneRef.current.style.transform = `translateX(${-130 + current * 260}px)`;
      }

      if (sparksRef.current) {
        const flare = Math.max(0, 1 - Math.abs(current - 0.42) / 0.3);
        sparksRef.current.style.opacity = String(0.25 + flare * 0.75);
        sparksRef.current.style.transform = `scale(${0.7 + flare * 0.6})`;
      }

      if (signRef.current) {
        signRef.current.style.setProperty(
          "--glow",
          String(0.45 + current * 0.55)
        );
      }

      const idx = Math.min(3, Math.floor(current * 4));
      activeStageRef.current = idx;
      if (beaconRef.current) beaconRef.current.dataset.stage = String(idx);

      if (unitsRef.current) {
        unitsRef.current.textContent = Math.floor(820 + current * 11660).toLocaleString("en-US");
      }
      if (oeeNumRef.current) {
        oeeNumRef.current.textContent = `${(61 + current * 33.2).toFixed(1)}%`;
      }
      if (oeeRingRef.current) {
        const frac = 0.35 + current * 0.6;
        oeeRingRef.current.style.strokeDashoffset = String(RING_C * (1 - Math.min(0.97, frac)));
      }
      if (tempRef.current) {
        tempRef.current.textContent = `${Math.floor(62 + current * 26)}°C`;
      }

      stageEls.current.forEach((el, i) => {
        if (!el) return;
        const active = i === idx;
        el.classList.toggle("active", active);
        el.setAttribute("aria-hidden", active ? "false" : "true");
      });
      dotEls.current.forEach((el, i) => {
        if (!el) return;
        el.classList.toggle("on", i <= idx);
      });
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${current})`;
      }

      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, []);

  /**
   * Picking a station in the 3D floor drives the same scroll-linked stage
   * state as the scroll itself, so there is only ever one source of truth
   * for which line section is "live".
   */
  const pickStation = (i: number) => {
    const sec = sectionRef.current;
    if (!sec) return;
    const top = window.scrollY + sec.getBoundingClientRect().top;
    const travel = Math.max(0, sec.offsetHeight - window.innerHeight);
    window.scrollTo({ top: top + ((i + 0.5) / 4) * travel, behavior: "smooth" });
  };

  return (
    <section
      className="factoryScroll"
      ref={sectionRef}
      aria-label="NEGBUY factory floor — live production line"
    >
      <div className="factoryPin factoryPinReal">
        <div className="factoryHead">
          <div>
            <div className="kicker">01.8 / NEGBUY Factory — live floor</div>
            <h2>
              PRODUCTION
              <br />
              <span>NEVER STOPS.</span>
            </h2>
          </div>
          <div className="factoryHud">
            <div className="hudBox hudUnits">
              <small>UNITS TODAY · <span ref={clockRef}>--:--:--</span></small>
              <b ref={unitsRef}>820</b>
            </div>
            <div className="hudBox hudOee">
              <small>OEE LIVE</small>
              <div className="oeeWrap">
                <svg viewBox="0 0 64 64" aria-hidden="true">
                  <circle cx="32" cy="32" r="26" className="oeeBg" />
                  <circle cx="32" cy="32" r="26" className="oeeFg" ref={oeeRingRef} />
                </svg>
                <b ref={oeeNumRef}>61.0%</b>
              </div>
            </div>
            <div className="hudBox hudTemp">
              <small>CELL TEMP</small>
              <b ref={tempRef}>62°C</b>
              <span className="hudLive">
                <i aria-hidden="true" /> RUNNING
              </span>
            </div>
            <div className="hudBeacon" ref={beaconRef} data-stage="0" aria-hidden="true">
              <span className="bl g" />
              <span className="bl y" />
              <span className="bl r" />
            </div>
          </div>
        </div>
        <p className="factorySub">
          Scroll to run the line — the camera pushes in, the crew torques up the
          engine on its cradle, the hoist tracks overhead and the QC lamp stays
          green. This is the floor behind every NEGBUY crate.
        </p>

        <div className="factoryViews tpViewSwitch" role="group" aria-label="Factory floor view mode">
          <button
            type="button"
            className={view === "3d" ? "on" : ""}
            aria-pressed={view === "3d"}
            onClick={() => setView("3d")}
          >
            3D floor
          </button>
          <button
            type="button"
            className={view === "scene" ? "on" : ""}
            aria-pressed={view === "scene"}
            onClick={() => setView("scene")}
          >
            Live scene
          </button>
        </div>

        <div className={`factoryBody ${view === "3d" ? "show3d" : "showScene"}`}>
          <Factory3D
            active={activeStageRef}
            onPick={pickStation}
            progress={scrollProgRef}
          />

          {/* REALISTIC SCENE */}
          <div className="rscene">
            <div className="rbg" ref={bgRef} aria-hidden="true">
              <img src={BG_IMG} alt="" loading="lazy" />
            </div>
            <div className="rgrade" aria-hidden="true" />
            <div className="rbeams" aria-hidden="true">
              <i className="beam b1" />
              <i className="beam b2" />
            </div>
            <div className="rscan" ref={scanRef} aria-hidden="true" />

            <div className="rshed" aria-hidden="true">
              <div className="rsign" ref={signRef}>
                <span className="rsignMain">
                  NEG<b>BUY</b>
                </span>
                <span className="rsignSub">FACTORY · LINE 1 · EST. 2016</span>
                <i className="rivet tl" />
                <i className="rivet tr" />
                <i className="rivet bl" />
                <i className="rivet br" />
              </div>
            </div>

            <div className="rcraneRail" aria-hidden="true" />
            <div className="rcrane" ref={craneRef} aria-hidden="true">
              <div className="rcraneCab" />
              <div className="rcraneHook" />
            </div>

            <div className="rrobot rr1" aria-hidden="true">
              <div className="rrbase" />
              <div className="rrArmA" ref={armA1Ref}>
                <span className="joint shoulder" />
                <span className="piston" />
                <div className="rrArmB" ref={armB1Ref}>
                  <span className="joint elbow" />
                  <div className="rrClaw" ref={claw1Ref}>
                    <i />
                    <i />
                  </div>
                </div>
              </div>
              <span className="rrlabel">ASM-01 · ASSEMBLY CELL</span>
            </div>

            <div className="rrobot rr2" aria-hidden="true">
              <div className="rrbase" />
              <div className="rrArmA" ref={armA2Ref}>
                <span className="joint shoulder" />
                <span className="piston" />
                <div className="rrArmB" ref={armB2Ref}>
                  <span className="joint elbow" />
                  <div className="rrClaw" ref={claw2Ref}>
                    <i />
                    <i />
                  </div>
                </div>
              </div>
              <span className="rrlabel">ASM-02 · ASSEMBLY CELL</span>
            </div>

            <div className="rwelder" aria-hidden="true">
              <div className="rweldCore" />
              <div className="rweldSparks" ref={sparksRef}>
                {Array.from({ length: 14 }).map((_, i) => (
                  <span key={i} className={`rspark k${(i % 12) + 1}`} />
                ))}
              </div>
              <span className="rrlabel">WELD CELL · TIG-4</span>
            </div>

            <div className="rbelt" aria-hidden="true">
              <div className="rbeltTrack" ref={beltTrackRef}>
                {CRATES.map((_, i) => (
                  <div key={i} className="rcrate">
                    <span className="rtape" />
                    <span className="rcrateBrand">
                      NEG<b>BUY</b>
                    </span>
                    <span className="rbarcode" />
                    <span className="rcrateNo">#{1024 + i * 7} · DXB</span>
                  </div>
                ))}
              </div>
              <div className="rbeltBase" />
            </div>
            <div className="rreflect" aria-hidden="true" />
            <div className="rvignette" aria-hidden="true" />
            <div className="rgrain" aria-hidden="true" />
          </div>

          {/* STAGES */}
          <div className="fstages">
            {FSTAGES.map((s, i) => (
              <div
                key={s.tag}
                ref={(el) => {
                  stageEls.current[i] = el;
                }}
                className={`fstage${i === 0 ? " active" : ""}`}
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
            <div className="ftimeline" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  ref={(el) => {
                    dotEls.current[i] = el;
                  }}
                  className={i === 0 ? "on" : ""}
                />
              ))}
            </div>
            <div className="factoryProgress">
              <div className="factoryProgressTrack">
                <div className="factoryProgressFill" ref={progressRef} />
              </div>
              <span>SCROLL TO RUN THE LINE</span>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
