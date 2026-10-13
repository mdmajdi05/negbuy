"use client";

import { Fragment, useEffect, useRef } from "react";

type Kind = "fab" | "compressor" | "combustor" | "turbine" | "balance" | "test";

type Station = {
  no: string;
  tag: string;
  title: string;
  desc: string;
  specs: { k: string; v: string }[];
  metric: string;
  unit: string;
  dwg: string;
  kind: Kind;
  img: string;
  imgAlt: string;
};

const STATIONS: Station[] = [
  {
    no: "01",
    tag: "Machining cell",
    title: "Casing & Rotor Machining",
    desc: "Casing halves go on 5-axis centres and the rotor discs are finish-turned to drawing. Every bore, face and rabbet is measured against the build sheet before the part leaves the cell.",
    specs: [
      { k: "Machines", v: "5-axis CNC" },
      { k: "Tolerance", v: "±0.01 mm" },
      { k: "Traceability", v: "Full, per part" },
    ],
    metric: "±0.01",
    unit: "mm tolerance",
    dwg: "NB-4180 · REV C · 1:20",
    kind: "fab",
    img: "/oem/wm-factory-mapna-12.jpg",
    imgAlt: "Real gas turbine casing on the factory assembly floor",
  },
  {
    no: "02",
    tag: "Compressor build",
    title: "Compressor Module",
    desc: "Rotor blade rows and variable stator vanes are stacked and set to axial clearance. This is where up to 800 kg/s of air begins its rise toward an 18:1 pressure ratio.",
    specs: [
      { k: "Stages", v: "16 axial" },
      { k: "Blade alloy", v: "Ti / Ni" },
      { k: "Clearance", v: "0.4–0.7 mm" },
    ],
    metric: "18:1",
    unit: "pressure ratio",
    dwg: "NB-4230 · REV B · 1:25",
    kind: "compressor",
    img: "/oem/wm-blades-vanes.jpg",
    imgAlt: "Real axial compressor blades and vanes",
  },
  {
    no: "03",
    tag: "Combustion build",
    title: "Combustion Module",
    desc: "Fuel nozzles and the thermal-barrier-coated liner are fitted into the casing. The flame sits near 1,400 °C while the casing wall is held inside its design limit.",
    specs: [
      { k: "Type", v: "Annular liner" },
      { k: "Coating", v: "TBC" },
      { k: "Fuel", v: "Gas / dual" },
    ],
    metric: "1,400",
    unit: "°C flame temp",
    dwg: "NB-4290 · REV D · 1:20",
    kind: "combustor",
    img: "/oem/se-sgt5-8000h.jpg",
    imgAlt: "Real Siemens Energy SGT5-8000H gas turbine cutaway",
  },
  {
    no: "04",
    tag: "Hot-gas-path fit",
    title: "Turbine Module",
    desc: "Nozzle guide vanes and the hot-gas-path blade set go in with matched, traceable serials. These cooled aerofoils turn the hot gas into useful shaft power.",
    specs: [
      { k: "Coating", v: "TBC / aluminide" },
      { k: "Inlet temp", v: "up to 1,500 °C" },
      { k: "Blade set", v: "Matched, traceable" },
    ],
    metric: "1,500",
    unit: "°C inlet temp",
    dwg: "NB-4360 · REV C · 1:25",
    kind: "turbine",
    img: "/oem/wm-stator-blade.jpg",
    imgAlt: "Real hot-gas-path turbine blade on a test rig",
  },
  {
    no: "05",
    tag: "Balance bay",
    title: "Rotor Balancing",
    desc: "The stacked rotor spools up on the balancing bed. Probes read the shake in two planes and correction weight is trimmed until residual unbalance is inside spec.",
    specs: [
      { k: "Speed", v: "up to 12,400 rpm" },
      { k: "Residual", v: "≤ 0.5 g·mm" },
      { k: "Standard", v: "ISO 1940" },
    ],
    metric: "0.5",
    unit: "g·mm residual",
    dwg: "NB-4415 · REV A · 1:15",
    kind: "balance",
    img: "/oem/wm-rotor-sotavento.jpg",
    imgAlt: "Real turbine rotor on the overhaul floor",
  },
  {
    no: "06",
    tag: "Test & dispatch",
    title: "Full-Speed Test",
    desc: "A full-speed no-load run with every gauge logged against the build sheet. On sign-off the unit is preserved, crated and released with its as-built certificate pack.",
    specs: [
      { k: "Test", v: "Full-speed, no-load" },
      { k: "Records", v: "As-built pack" },
      { k: "Release", v: "Certificate of conformance" },
    ],
    metric: "12,400",
    unit: "rpm proven",
    dwg: "NB-4480 · REV E · 1:30",
    kind: "test",
    img: "/oem/wm-test-cell.jpg",
    imgAlt: "Real engine test cell structure",
  },
];

/* ---------- shared drawing parts ---------- */

function Grid() {
  return <rect x="0" y="0" width="420" height="250" fill="url(#asmGridP)" />;
}

function BladeRow({
  xs,
  hot = false,
}: {
  xs: number[];
  hot?: boolean;
}) {
  return (
    <>
      {xs.map((x) => (
        <g
          key={x}
          fill={hot ? "url(#asmHotL)" : "url(#asmBladeL)"}
          stroke={hot ? "#c9300f" : "#7a8798"}
          strokeWidth="0.7"
        >
          <path d={`M${x - 5} 125 L${x + 5} 125 L${x + 2} 105 L${x - 2} 105 Z`} />
          <path d={`M${x - 5} 125 L${x + 5} 125 L${x + 2} 145 L${x - 2} 145 Z`} />
        </g>
      ))}
    </>
  );
}

function VaneRow({ xs }: { xs: number[] }) {
  return (
    <>
      {xs.map((x) => (
        <g key={x} fill="#cdd5df" stroke="#8b95a3" strokeWidth="0.7">
          <path d={`M${x - 4} 102 L${x + 4} 102 L${x + 1} 118 L${x - 1} 118 Z`} />
          <path d={`M${x - 4} 148 L${x + 4} 148 L${x + 1} 132 L${x - 1} 132 Z`} />
        </g>
      ))}
    </>
  );
}

function Drawing({ kind }: { kind: Kind }) {
  switch (kind) {
    case "fab":
      return (
        <svg viewBox="0 0 420 250" className="asmSvg" aria-hidden="true">
          <Grid />
          <rect x="52" y="196" width="316" height="20" rx="4" fill="url(#asmCaseL)" stroke="#9aa6b6" />
          <line x1="52" y1="203" x2="368" y2="203" stroke="#c3cbd6" />
          <rect x="60" y="64" width="14" height="132" fill="url(#asmCaseL)" stroke="#9aa6b6" />
          <rect x="346" y="64" width="14" height="132" fill="url(#asmCaseL)" stroke="#9aa6b6" />
          <rect x="60" y="52" width="300" height="16" rx="3" fill="url(#asmCaseL)" stroke="#9aa6b6" />
          <rect x="182" y="68" width="56" height="42" rx="5" fill="url(#asmCaseL)" stroke="#7a8798" />
          <line x1="210" y1="110" x2="210" y2="128" stroke="#7a8798" strokeWidth="4" />
          <path d="M204 128 h12 l-3 10 h-6 z" fill="#b9c2cd" stroke="#7a8798" />
          <path d="M120 196 V150 A90 56 0 0 1 300 150 V196 Z" fill="url(#asmSteelL)" stroke="#7a8798" strokeWidth="1.4" />
          <path d="M146 196 V156 A64 38 0 0 1 274 156 V196 Z" fill="#fff" stroke="#9aa6b6" />
          <path d="M158 196 V160 A52 28 0 0 1 262 160 V196 Z" fill="url(#asmHatchP)" stroke="#9aa6b6" />
          <line x1="120" y1="228" x2="300" y2="228" stroke="#66707e" />
          <path d="M120 228 l7 -3 v6 z M300 228 l-7 -3 v6 z" fill="#66707e" />
          <text x="210" y="222" textAnchor="middle" className="asmDdim">
            Ø 1,240
          </text>
          <text x="210" y="26" textAnchor="middle" className="asmDcap">
            5-AXIS CNC · CASING HALF
          </text>
        </svg>
      );

    case "compressor":
      return (
        <svg viewBox="0 0 420 250" className="asmSvg" aria-hidden="true">
          <Grid />
          <rect x="40" y="88" width="340" height="74" rx="37" fill="none" stroke="#7a8798" strokeWidth="2" />
          <rect x="52" y="100" width="316" height="50" rx="25" fill="url(#asmCaseL)" stroke="#9aa6b6" />
          <rect x="34" y="118" width="352" height="14" fill="url(#asmSteelL)" stroke="#7a8798" />
          <BladeRow xs={[92, 124, 156, 188, 220, 252, 284]} />
          <VaneRow xs={[108, 140, 172, 204, 236, 268]} />
          <g stroke="#4a678f" strokeWidth="1.4" fill="none">
            <path d="M12 112 h20 M26 107 l6 5 -6 5" />
            <path d="M12 138 h20 M26 133 l6 5 -6 5" />
          </g>
          <line x1="40" y1="125" x2="340" y2="125" stroke="#c3cbd6" strokeDasharray="7 6" />
          <text x="210" y="26" textAnchor="middle" className="asmDcap">
            AXIAL COMPRESSOR · 16 STAGE
          </text>
        </svg>
      );

    case "combustor":
      return (
        <svg viewBox="0 0 420 250" className="asmSvg" aria-hidden="true">
          <Grid />
          <rect x="70" y="92" width="280" height="66" rx="33" fill="none" stroke="#7a8798" strokeWidth="2" />
          <rect x="150" y="86" width="180" height="78" rx="39" fill="url(#asmCaseL)" stroke="#8b95a3" />
          <rect x="166" y="98" width="148" height="54" rx="27" fill="url(#asmHatchP)" stroke="#9aa6b6" />
          <ellipse cx="240" cy="125" rx="60" ry="16" fill="url(#asmHotL)" />
          <ellipse cx="240" cy="125" rx="33" ry="9" fill="#fff2c4" />
          <rect x="188" y="56" width="18" height="30" rx="4" fill="url(#asmSteelL)" stroke="#7a8798" />
          <line x1="197" y1="86" x2="197" y2="104" stroke="#7a8798" strokeWidth="3" />
          <text x="197" y="48" textAnchor="middle" className="asmDcap">
            FUEL
          </text>
          <g stroke="#4a678f" strokeWidth="1.4" fill="none">
            <path d="M96 110 h28 M118 106 l6 4 -6 4" />
            <path d="M96 140 h28 M118 136 l6 4 -6 4" />
          </g>
          <text x="210" y="196" textAnchor="middle" className="asmDcap">
            ANNULAR COMBUSTOR · TBC LINER
          </text>
        </svg>
      );

    case "turbine":
      return (
        <svg viewBox="0 0 420 250" className="asmSvg" aria-hidden="true">
          <Grid />
          <rect x="40" y="88" width="340" height="74" rx="37" fill="none" stroke="#7a8798" strokeWidth="2" />
          <rect x="52" y="100" width="316" height="50" rx="25" fill="url(#asmCaseL)" stroke="#9aa6b6" />
          <rect x="34" y="118" width="352" height="14" fill="url(#asmSteelL)" stroke="#7a8798" />
          <VaneRow xs={[150, 180, 210]} />
          <BladeRow xs={[166, 196, 226, 256]} hot />
          <g stroke="#ed1c24" strokeWidth="2" fill="none">
            <path d="M64 112 h52 M108 107 l8 5 -8 5" />
            <path d="M64 138 h52 M108 133 l8 5 -8 5" />
          </g>
          <g stroke="#e08a2e" strokeWidth="1.6" fill="none">
            <path d="M300 112 h54 M346 107 l8 5 -8 5" />
            <path d="M300 138 h54 M346 133 l8 5 -8 5" />
          </g>
          <text x="210" y="26" textAnchor="middle" className="asmDcap">
            HOT GAS PATH · 1,500 °C
          </text>
        </svg>
      );

    case "balance":
      return (
        <svg viewBox="0 0 420 250" className="asmSvg" aria-hidden="true">
          <Grid />
          <rect x="40" y="196" width="340" height="16" rx="3" fill="url(#asmCaseL)" stroke="#9aa6b6" />
          <path d="M96 196 l10 -62 h16 l-6 62 z" fill="url(#asmCaseL)" stroke="#8b95a3" />
          <path d="M314 196 l-10 -62 h-16 l6 62 z" fill="url(#asmCaseL)" stroke="#8b95a3" />
          <circle cx="110" cy="134" r="14" fill="#f7f9fb" stroke="#7a8798" />
          <circle cx="298" cy="134" r="14" fill="#f7f9fb" stroke="#7a8798" />
          <rect x="60" y="127" width="290" height="14" fill="url(#asmSteelL)" stroke="#7a8798" />
          {[150, 204, 258].map((x) => (
            <g key={x} transform={`translate(${x} 134)`}>
              <g className="asmSpin">
                <circle r="25" fill="url(#asmSteelL)" stroke="#7a8798" />
                {Array.from({ length: 10 }).map((_, i) => (
                  <g key={i} transform={`rotate(${i * 36})`}>
                    <path d="M0 -21 L4 -33 Q0 -37 -4 -33 Z" fill="url(#asmBladeL)" stroke="#8b95a3" strokeWidth="0.6" />
                  </g>
                ))}
              </g>
            </g>
          ))}
          <path d="M258 106 l-8 -18" stroke="#8b95a3" strokeWidth="1.4" fill="none" />
          <g transform="translate(362 66)">
            <circle r="24" fill="#fff" stroke="#7a8798" strokeWidth="1.6" />
            <path d="M-24 0 a24 24 0 0 1 48 0" fill="none" stroke="#c3cbd6" />
            <line className="asmNeedle" x1="0" y1="0" x2="13" y2="-9" stroke="#ed1c24" strokeWidth="2" />
            <circle r="2.5" fill="#3a4657" />
          </g>
          <text x="362" y="106" textAnchor="middle" className="asmDdim">
            0.5 g·mm
          </text>
          <text x="196" y="26" textAnchor="middle" className="asmDcap">
            DYNAMIC BALANCE · ISO 1940
          </text>
        </svg>
      );

    case "test":
    default:
      return (
        <svg viewBox="0 0 420 250" className="asmSvg" aria-hidden="true">
          <Grid />
          <rect x="20" y="46" width="380" height="164" rx="6" fill="none" stroke="#c3cbd6" strokeDasharray="6 6" />
          <g transform="translate(232 138)">
            <path d="M-92 -40 L-140 -20 V20 L-92 40 Z" fill="url(#asmSteelL)" stroke="#7a8798" />
            <rect x="-92" y="-40" width="170" height="80" rx="10" fill="url(#asmCaseL)" stroke="#7a8798" strokeWidth="1.4" />
            <path d="M78 -34 H128 L146 -48 V48 L128 34 H78 Z" fill="url(#asmCaseL)" stroke="#7a8798" />
            <rect x="-58" y="-26" width="120" height="52" rx="8" fill="#fff" stroke="#9aa6b6" />
            <ellipse cx="0" cy="0" rx="58" ry="22" fill="url(#asmHotL)" opacity="0.75" />
            <line x1="-52" y1="0" x2="56" y2="0" stroke="#7a8798" strokeWidth="6" />
            <line x1="146" y1="0" x2="176" y2="0" stroke="#7a8798" strokeWidth="8" />
          </g>
          <g stroke="#c3cbd6" strokeWidth="2" fill="none" strokeLinecap="round">
            <path d="M356 138 h20" />
            <path d="M360 120 h13" />
            <path d="M360 156 h13" />
          </g>
          <g transform="translate(60 86)">
            <rect x="-30" y="-34" width="60" height="94" rx="5" fill="url(#asmCaseL)" stroke="#8b95a3" />
            <rect x="-21" y="-22" width="42" height="6" rx="1" fill="#22c55e" />
            <rect x="-21" y="-10" width="30" height="6" rx="1" fill="#f59e0b" />
            <rect x="-21" y="2" width="35" height="6" rx="1" fill="#ed1c24" />
            <rect x="-21" y="20" width="42" height="24" rx="3" fill="#111827" />
            <text x="0" y="36" textAnchor="middle" className="asmDreadout">
              12 400
            </text>
          </g>
          <line x1="20" y1="212" x2="400" y2="212" stroke="#c3cbd6" />
          <text x="210" y="26" textAnchor="middle" className="asmDcap">
            FULL-SPEED TEST CELL · 12,400 RPM
          </text>
        </svg>
      );
  }
}

export default function TurbineAssembly() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const cellRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const N = STATIONS.length;
    let frame = 0;
    let current = 0;

    const render = () => {
      const sec = sectionRef.current;
      const track = trackRef.current;
      if (sec && track) {
        const rect = sec.getBoundingClientRect();
        const max = sec.offsetHeight - window.innerHeight;
        const raw = max > 0 ? -rect.top / max : 0;
        const target = Math.max(0, Math.min(1, raw));
        current += (target - current) * (reduced ? 1 : 0.085);

        const travel = Math.max(
          0,
          track.scrollWidth - window.innerWidth + window.innerWidth * 0.06
        );
        track.style.transform = `translate3d(${-current * travel}px,0,0)`;

        const idx = Math.min(N - 1, Math.floor(current * N));
        cellRefs.current.forEach((el, i) => {
          if (!el) return;
          el.classList.toggle("active", i === idx);
          el.classList.toggle("done", current * N >= i + 0.55);
        });

        if (progressRef.current) {
          progressRef.current.style.transform = `scaleX(${current})`;
        }
        if (titleRef.current) titleRef.current.textContent = STATIONS[idx].title;
        if (tagRef.current) tagRef.current.textContent = STATIONS[idx].tag;
        if (pctRef.current) {
          pctRef.current.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(N).padStart(2, "0")}`;
        }
      }
      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section
      className="asmScroll"
      ref={sectionRef}
      aria-label="Turbine manufacturing — from steel to spin"
    >
      <div className="asmPin">
        <div className="asmGridBg" aria-hidden="true" />

        <div className="asmHead">
          <div className="asmHeadLeft">
            <div className="kicker">01.2 / Manufacturing</div>
            <h2>
              FROM STEEL
              <br />
              <span>TO SPIN.</span>
            </h2>
          </div>
          <div className="asmHeadRight">
            <p>
              A single, continuous build line. Scroll to walk the shop floor:
              casings are machined, modules are stacked to drawing, the rotor is
              balanced, and every unit is proven at full speed before it ships.
            </p>
            <div className="asmHeadMeta">
              <span>ISO 9001</span>
              <span>API</span>
              <span>ASME</span>
              <span>Est. 2016</span>
            </div>
          </div>
        </div>

        <div className="asmStage">
          <div className="asmTrack" ref={trackRef}>
            {STATIONS.map((s, i) => (
              <Fragment key={s.no}>
                <article
                  className={`asmCell${i === 0 ? " active" : ""}`}
                  ref={(el) => {
                    cellRefs.current[i] = el;
                  }}
                >
                  <div className="asmCellTop">
                    <span className="asmCellNo">{s.no}</span>
                    <span className="asmCellTag">{s.tag}</span>
                    <span className="asmCellTick" aria-hidden="true">
                      ✓
                    </span>
                  </div>

                  <h3 className="asmCellTitle">{s.title}</h3>

                  <div className="asmCellScene">
                    <div className="asmCellShot">
                      <img
                        src={s.img}
                        alt={s.imgAlt}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="asmCellDraw">
                      <Drawing kind={s.kind} />
                    </div>
                    <span className="asmCellDwg">{s.dwg}</span>
                  </div>

                  <p className="asmCellDesc">{s.desc}</p>

                  <dl className="asmCellSpecs">
                    {s.specs.map((sp) => (
                      <div key={sp.k}>
                        <dt>{sp.k}</dt>
                        <dd>{sp.v}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="asmCellFoot">
                    <b>{s.metric}</b>
                    <small>{s.unit}</small>
                  </div>
                </article>

                {i < STATIONS.length - 1 && (
                  <div className="asmLink" aria-hidden="true">
                    <i className="asmLinkLine" />
                    <span className="asmLinkNode" />
                    <b className="asmLinkChev">›</b>
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </div>

        <div className="asmNow" aria-live="polite">
          <span className="asmNowDot" aria-hidden="true" />
          <span className="asmNowTag" ref={tagRef}>
            Machining cell
          </span>
          <b ref={titleRef}>Casing &amp; Rotor Machining</b>
        </div>

        <div className="asmProgress">
          <div className="asmProgressTrack">
            <div className="asmProgressFill" ref={progressRef} />
          </div>
          <span className="asmProgressPct" ref={pctRef}>
            01 / 06
          </span>
        </div>
      </div>

      <svg width="0" height="0" className="asmDefs" aria-hidden="true">
        <defs>
          <pattern id="asmGridP" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="rgba(30,60,110,0.09)" strokeWidth="1" />
          </pattern>
          <pattern id="asmHatchP" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="7" stroke="#c3cbd6" strokeWidth="1" />
          </pattern>
          <linearGradient id="asmSteelL" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbfcfd" />
            <stop offset="55%" stopColor="#d7dee7" />
            <stop offset="100%" stopColor="#b3bdc9" />
          </linearGradient>
          <linearGradient id="asmCaseL" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f2f5f8" />
            <stop offset="100%" stopColor="#d3dae2" />
          </linearGradient>
          <linearGradient id="asmBladeL" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#eef1f5" />
            <stop offset="100%" stopColor="#aab4c1" />
          </linearGradient>
          <linearGradient id="asmHotL" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffd9a8" />
            <stop offset="55%" stopColor="#ff8a3c" />
            <stop offset="100%" stopColor="#ed1c24" />
          </linearGradient>
        </defs>
      </svg>
    </section>
  );
}
