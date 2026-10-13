"use client";

import { useMemo, useState } from "react";
import Parts3D from "./Parts3D";

type PartId =
  | "intake"
  | "gearbox"
  | "compressor"
  | "stator"
  | "combustor"
  | "rotor"
  | "turbine"
  | "bearing"
  | "casing"
  | "exhaust";

type Part = {
  id: PartId;
  no: string;
  name: string;
  role: string;
  desc: string;
  specs: { k: string; v: string }[];
  chips: string[];
  oem: string;
  category: string;
  cond: "New" | "Refurb" | "OH";
  stock: string;
  lead: string;
  x: number;
  y: number;
};

const PARTS: Part[] = [
  {
    id: "intake",
    no: "P-01",
    name: "Air Intake",
    role: "Where the cycle begins",
    desc: "The bell-mouth inlet and filter house smooth and clean the airflow before it reaches the compressor, holding a uniform pressure across the full 360° face.",
    specs: [
      { k: "Function", v: "Filter + guide inlet air" },
      { k: "Material", v: "Stainless / alloy steel" },
      { k: "Air flow", v: "Up to 800 kg/s" },
    ],
    chips: ["Bell mouth", "Filtration", "Anti-ice"],
    oem: "GE / Siemens",
    category: "Air intake",
    cond: "New",
    stock: "In stock",
    lead: "2–4 wks",
    x: 10.2,
    y: 50,
  },
  {
    id: "gearbox",
    no: "P-02",
    name: "Accessory Gearbox",
    role: "Drives the machine's systems",
    desc: "Takes drive off the rotor to run the lube-oil pumps, starter and controls. Single point for the auxiliaries that keep the turbine alive.",
    specs: [
      { k: "Function", v: "Auxiliary power take-off" },
      { k: "Rating", v: "Up to 2,500 kW" },
      { k: "Mounting", v: "Flange / pedestal" },
    ],
    chips: ["PTO", "Oil pumps", "Starter"],
    oem: "Solar / MAN",
    category: "Accessory",
    cond: "Refurb",
    stock: "On order",
    lead: "6–8 wks",
    x: 18.7,
    y: 82.6,
  },
  {
    id: "compressor",
    no: "P-03",
    name: "Compressor",
    role: "Squeezes the air",
    desc: "Rows of rotor blades and guide vanes raise the pressure stage by stage. Handling 800 kg of air per second, it is the heart of the machine's efficiency.",
    specs: [
      { k: "Type", v: "Axial, multi-stage" },
      { k: "Material", v: "Ti / Ni alloy" },
      { k: "Pressure", v: "Up to 18:1 ratio" },
    ],
    chips: ["Axial", "Variable vanes", "Ti alloy"],
    oem: "GE / Rolls-Royce",
    category: "Compressor",
    cond: "Refurb",
    stock: "In stock",
    lead: "3–5 wks",
    x: 27.8,
    y: 42.6,
  },
  {
    id: "stator",
    no: "P-04",
    name: "Stator / Guide Vanes",
    role: "Steers the flow",
    desc: "Stationary vane rows redirect the air between each rotor stage and to the combustor. Removable as segments so a hot-section rebuild is a planned stop, not a surprise.",
    specs: [
      { k: "Function", v: "Flow guidance" },
      { k: "Mounting", v: "Segmented cassettes" },
      { k: "Service", v: "Field replaceable" },
    ],
    chips: ["Segmented", "Flow control", "Replaceable"],
    oem: "Siemens",
    category: "Compressor",
    cond: "New",
    stock: "In stock",
    lead: "2–3 wks",
    x: 33.3,
    y: 36.8,
  },
  {
    id: "combustor",
    no: "P-05",
    name: "Combustion Chamber",
    role: "The controlled fire",
    desc: "Fuel meets compressed air and burns at around 1,400 °C inside a liner while the casing stays cool. A liner swap is the single biggest life-extension job on any turbine.",
    specs: [
      { k: "Type", v: "Annular / can-annular" },
      { k: "Liner", v: "Thermal barrier coated" },
      { k: "Flame temp", v: "~1,400 °C" },
    ],
    chips: ["TBC liner", "Low NOx", "Dual fuel"],
    oem: "GE / Solar",
    category: "Hot section",
    cond: "OH",
    stock: "In stock",
    lead: "4–6 wks",
    x: 56.7,
    y: 38,
  },
  {
    id: "rotor",
    no: "P-06",
    name: "Rotor & Shaft",
    role: "The spinning heart",
    desc: "Discs, spacers and shaft assembled into one balanced mass turning up to 12,400 rpm. Every rotor we supply is dynamically balanced and run-out verified.",
    specs: [
      { k: "Speed", v: "Up to 12,400 rpm" },
      { k: "Balance", v: "≤ 0.5 g·mm" },
      { k: "Build", v: "Disc stack, stacked fit" },
    ],
    chips: ["Balanced", "12,400 rpm", "Run-out checked"],
    oem: "MAN / GE",
    category: "Rotor",
    cond: "Refurb",
    stock: "Made to order",
    lead: "8–10 wks",
    x: 50.2,
    y: 50.5,
  },
  {
    id: "turbine",
    no: "P-07",
    name: "Turbine Blades",
    role: "Hot gas path",
    desc: "The most highly engineered parts in the machine: cooled aerofoils that turn hot gas into shaft power. We supply OEM-matched hot-gas-path sets with full traceability.",
    specs: [
      { k: "Service", v: "Hottest rotating duty" },
      { k: "Coating", v: "TBC / aluminide" },
      { k: "Inlet temp", v: "Up to 1,500 °C" },
    ],
    chips: ["Single crystal", "TBC coated", "Traceable"],
    oem: "GE / Siemens",
    category: "Hot section",
    cond: "New",
    stock: "In stock",
    lead: "2–4 wks",
    x: 72.2,
    y: 38.5,
  },
  {
    id: "bearing",
    no: "P-08",
    name: "Bearings + Lube Skid",
    role: "Keeps it spinning",
    desc: "Journal and thrust bearings carry the rotor on a film of ISO VG-46 oil. The skid supplies 8 bar of cooled, filtered oil — lose it and the machine stops.",
    specs: [
      { k: "Type", v: "Journal + thrust" },
      { k: "Oil pressure", v: "8.2 bar" },
      { k: "Protection", v: "Triple redundant" },
    ],
    chips: ["8.2 bar", "Cooled + filtered", "Redundant"],
    oem: "All OEMs",
    category: "Auxiliary",
    cond: "New",
    stock: "In stock",
    lead: "1–2 wks",
    x: 21.8,
    y: 62.2,
  },
  {
    id: "casing",
    no: "P-09",
    name: "Casing / Housing",
    role: "Structure + containment",
    desc: "The split casing holds the whole machine together, contains the hot gas path and gives the engine its stiffness. Supplied in horizontal split for fast servicing.",
    specs: [
      { k: "Type", v: "Horizontal split" },
      { k: "Material", v: "Cast / fabricated steel" },
      { k: "Joint", v: "Torqued flange" },
    ],
    chips: ["Split line", "Torqued flange", "Stiff frame"],
    oem: "Fabricated",
    category: "Structure",
    cond: "New",
    stock: "Made to order",
    lead: "6–9 wks",
    x: 44.4,
    y: 32.6,
  },
  {
    id: "exhaust",
    no: "P-10",
    name: "Exhaust / Diffuser",
    role: "Power out",
    desc: "Expanding gas leaves through the diffuser and downstream ducting. Recover the energy here and you recover megawatts at the grid.",
    specs: [
      { k: "Function", v: "Pressure recovery" },
      { k: "Output", v: "Up to 42 MW class" },
      { k: "Options", v: "HRSG / bypass stack" },
    ],
    chips: ["Diffuser", "42 MW", "HRSG ready"],
    oem: "GE / MAN",
    category: "Hot section",
    cond: "Refurb",
    stock: "On order",
    lead: "5–7 wks",
    x: 88.9,
    y: 50,
  },
];

/* ---------- engineering cutaway ---------- */

function CompressorBlades() {
  return (
    <>
      {[168, 204, 240, 276, 312, 348].map((x) => (
        <g key={x} fill="url(#tpSteel)" stroke="#7a8798" strokeWidth="0.7">
          <path d={`M${x - 5} 230 L${x + 5} 230 L${x + 2} 172 L${x - 2} 172 Z`} />
          <path d={`M${x - 5} 230 L${x + 5} 230 L${x + 2} 288 L${x - 2} 288 Z`} />
        </g>
      ))}
    </>
  );
}

function StatorRows() {
  return (
    <>
      {[186, 222, 258, 294, 330].map((x) => (
        <g key={x} fill="#c6cedb" stroke="#8b95a3" strokeWidth="0.7">
          <path d={`M${x - 4} 154 L${x + 4} 154 L${x + 1} 208 L${x - 1} 208 Z`} />
          <path d={`M${x - 4} 306 L${x + 4} 306 L${x + 1} 252 L${x - 1} 252 Z`} />
        </g>
      ))}
    </>
  );
}

function TurbineBlades() {
  return (
    <>
      {[598, 634, 670, 706].map((x) => (
        <g key={x} fill="url(#tpHot)" stroke="#c9300f" strokeWidth="0.6">
          <path d={`M${x - 6} 230 L${x + 6} 230 L${x + 3} 166 L${x - 3} 166 Z`} />
          <path d={`M${x - 6} 230 L${x + 6} 230 L${x + 3} 294 L${x - 3} 294 Z`} />
        </g>
      ))}
    </>
  );
}

function TurbineVanes() {
  return (
    <>
      {[616, 652, 688].map((x) => (
        <g key={x} fill="#d9bfae" stroke="#a9714f" strokeWidth="0.7">
          <path d={`M${x - 4} 152 L${x + 4} 152 L${x + 1} 200 L${x - 1} 200 Z`} />
          <path d={`M${x - 4} 308 L${x + 4} 308 L${x + 1} 260 L${x - 1} 260 Z`} />
        </g>
      ))}
    </>
  );
}

function TurbineDiagram({ active }: { active: PartId }) {
  const on = (id: PartId) => (active === id ? " on" : "");
  return (
    <svg viewBox="0 0 900 460" className="tpSvg" aria-hidden="true">
      <defs>
        <linearGradient id="tpSteel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbfcfd" />
          <stop offset="55%" stopColor="#d7dee7" />
          <stop offset="100%" stopColor="#b3bdc9" />
        </linearGradient>
        <linearGradient id="tpHot" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffd9a8" />
          <stop offset="55%" stopColor="#ff8a3c" />
          <stop offset="100%" stopColor="#ed1c24" />
        </linearGradient>
        <linearGradient id="tpCase" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f2f5f8" />
          <stop offset="100%" stopColor="#d3dae2" />
        </linearGradient>
        <radialGradient id="tpFlame" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fff2c4" />
          <stop offset="45%" stopColor="#ff9d3c" />
          <stop offset="100%" stopColor="#ed1c24" stopOpacity="0" />
        </radialGradient>
      </defs>

      <line x1="40" y1="230" x2="880" y2="230" stroke="#c3cbd6" strokeDasharray="6 8" />
      <rect x="118" y="146" width="624" height="168" rx="74" fill="rgba(205,215,228,0.28)" />

      {/* exhaust */}
      <g className={`tpPart tp-exhaust${on("exhaust")}`}>
        <path d="M734 186 L862 148 V312 L734 274 Z" fill="url(#tpCase)" stroke="#5a6675" strokeWidth="1.6" />
        <path d="M734 230 H862" stroke="#aab4c1" strokeWidth="1.2" />
        <path d="M812 162 L812 298" stroke="#c3cbd6" strokeWidth="5" />
      </g>

      {/* intake */}
      <g className={`tpPart tp-intake${on("intake")}`}>
        <path d="M62 190 L126 160 V300 L62 270 Z" fill="url(#tpCase)" stroke="#5a6675" strokeWidth="1.6" />
        <rect x="52" y="188" width="12" height="64" rx="5" fill="#dfe4ea" stroke="#5a6675" />
        <path d="M70 202 L126 180 M70 258 L126 280" stroke="#aab4c1" strokeWidth="1.2" />
      </g>

      {/* rotor: shaft + discs */}
      <g className={`tpPart tp-rotor${on("rotor")}`}>
        <rect x="140" y="224" width="612" height="12" fill="url(#tpSteel)" stroke="#7a8798" />
        {[168, 204, 240, 276, 312, 348, 598, 634, 670, 706].map((x) => (
          <rect key={x} x={x - 5} y="196" width="10" height="68" rx="3" fill="url(#tpSteel)" stroke="#7a8798" strokeWidth="0.7" />
        ))}
      </g>

      {/* compressor blades */}
      <g className={`tpPart tp-compressor${on("compressor")}`}>
        <CompressorBlades />
      </g>

      {/* stator vanes */}
      <g className={`tpPart tp-stator${on("stator")}`}>
        <StatorRows />
        <TurbineVanes />
      </g>

      {/* turbine blades */}
      <g className={`tpPart tp-turbine${on("turbine")}`}>
        <TurbineBlades />
      </g>

      {/* combustor */}
      <g className={`tpPart tp-combustor${on("combustor")}`}>
        <path d="M338 168 L404 156 V304 L338 292 Z" fill="#e5e9ef" stroke="#5a6675" strokeWidth="1.2" />
        <rect x="396" y="150" width="172" height="54" rx="27" fill="#eef1f5" stroke="#5a6675" strokeWidth="1.6" />
        <rect x="396" y="256" width="172" height="54" rx="27" fill="#eef1f5" stroke="#5a6675" strokeWidth="1.6" />
        <ellipse cx="482" cy="177" rx="54" ry="13" fill="url(#tpFlame)" />
        <ellipse cx="482" cy="283" rx="54" ry="13" fill="url(#tpFlame)" />
        <path d="M560 168 L584 192 V268 L560 292 Z" fill="#e5e9ef" stroke="#5a6675" strokeWidth="1.2" />
      </g>

      {/* bearings */}
      <g className={`tpPart tp-bearing${on("bearing")}`}>
        {[196, 712].map((x) => (
          <g key={x}>
            <path d={`M${x - 12} 250 L${x + 12} 250 L${x + 7} 314 L${x - 7} 314 Z`} fill="#dfe4ea" stroke="#7a8798" />
            <circle cx={x} cy="230" r="20" fill="#fbfcfd" stroke="#5a6675" strokeWidth="1.6" />
            <circle cx={x} cy="230" r="9" fill="url(#tpSteel)" />
          </g>
        ))}
      </g>

      {/* gearbox */}
      <g className={`tpPart tp-gearbox${on("gearbox")}`}>
        <path d="M167 330 V236 L180 230" stroke="#7a8798" strokeWidth="6" fill="none" />
        <rect x="92" y="330" width="150" height="72" rx="8" fill="url(#tpCase)" stroke="#5a6675" strokeWidth="1.6" />
        <circle cx="134" cy="366" r="16" fill="#fbfcfd" stroke="#8b95a3" strokeWidth="1.4" />
        <circle cx="196" cy="366" r="12" fill="#fbfcfd" stroke="#8b95a3" strokeWidth="1.4" />
        <path d="M144 366 L186 366" stroke="#8b95a3" strokeWidth="1.2" />
      </g>

      {/* casing */}
      <g className={`tpPart tp-casing${on("casing")}`}>
        <rect x="118" y="146" width="624" height="168" rx="74" fill="none" stroke="#3a4657" strokeWidth="3.5" />
        <rect x="118" y="146" width="624" height="168" rx="74" fill="none" stroke="rgba(237,28,36,0.25)" strokeWidth="1" />
        <path d="M150 164 H700" stroke="#c3cbd6" strokeWidth="1" />
        <path d="M150 296 H700" stroke="#c3cbd6" strokeWidth="1" />
      </g>
    </svg>
  );
}

/* ---------- section ---------- */

export default function TurbineParts() {
  const [active, setActive] = useState<PartId>("compressor");
  const [picked, setPicked] = useState<PartId[]>([]);
  const [view, setView] = useState<"3d" | "cut">("3d");

  const part = useMemo(
    () => PARTS.find((p) => p.id === active) ?? PARTS[0],
    [active]
  );

  const togglePick = (id: PartId) =>
    setPicked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const quoteHref = useMemo(() => {
    const list = (picked.length ? picked : [active]).map((id) => {
      const p = PARTS.find((x) => x.id === id);
      return p ? `${p.no} · ${p.name} (${p.oem})` : id;
    });
    const subject = "RFQ — Turbine parts";
    const body = [
      "Hello NEGBUY,",
      "",
      "Please quote the following turbine parts:",
      ...list.map((l) => `• ${l}`),
      "",
      "Quantity:",
      "Machine / OEM:",
      "Delivery location:",
      "Required lead time:",
      "",
      "Thank you.",
    ].join("\n");
    return `mailto:contact@negbuy.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  }, [picked, active]);

  const condClass = (c: Part["cond"]) =>
    c === "New" ? "tpCondNew" : c === "Refurb" ? "tpCondRefurb" : "tpCondOh";

  return (
    <section
      className="partsSection"
      id="parts"
      aria-label="Turbine spare parts — catalogue, cutaway and RFQ"
    >
      <div className="tpInner">
        <div className="tpHead">
          <div>
            <div className="kicker">01.4 / Spare parts catalogue</div>
            <h2>
              EVERY PART.
              <br />
              <span>EXPLAINED.</span>
            </h2>
          </div>
          <div className="tpHeadRight">
            <p>
              An engineering cutaway of the machine we build and service — ten
              sub-assemblies, OEM-matched and fully traceable. Select a part to
              see its duty, material and availability, then build a live RFQ.
            </p>
            <div className="tpHeadMeta">
              <span>OEM-matched</span>
              <span>Full traceability</span>
              <span>Global shipping</span>
            </div>
          </div>
        </div>

        <div className="tpBody">
          {/* figure */}
          <figure className="tpFig">
            <figcaption className="tpFigTag">
              {view === "3d"
                ? "3D VIEW · GAS TURBINE · LIVE MODEL"
                : "CUTAWAY · GAS TURBINE · DWG NB-4500"}
            </figcaption>
            <div className="tpViewSwitch" role="tablist" aria-label="Figure view mode">
              <button
                type="button"
                role="tab"
                aria-selected={view === "3d"}
                className={view === "3d" ? "on" : ""}
                onClick={() => setView("3d")}
              >
                3D
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={view === "cut"}
                className={view === "cut" ? "on" : ""}
                onClick={() => setView("cut")}
              >
                Cutaway
              </button>
            </div>

            {view === "3d" ? (
              <Parts3D active={active} onPick={(id) => setActive(id as PartId)} />
            ) : (
              <div className="tpFigCanvas">
                <TurbineDiagram active={active} />
                <div className="tpPins">
                  {PARTS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`tpPin${active === p.id ? " on" : ""}`}
                      style={{ left: `${p.x}%`, top: `${p.y}%` }}
                      title={p.name}
                      aria-label={`Show ${p.name}`}
                      aria-pressed={active === p.id}
                      onClick={() => setActive(p.id)}
                    >
                      {p.no.slice(-2)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </figure>

          {/* detail */}
          <aside className="tpDetail" aria-live="polite">
            <div className="tpDetailTop">
              <span className="tpDetailNo">{part.no}</span>
              <span className={`tpBadge ${condClass(part.cond)}`}>
                {part.cond}
              </span>
            </div>
            <h3>{part.name}</h3>
            <div className="tpDetailRole">{part.role}</div>
            <p className="tpDetailDesc">{part.desc}</p>

            <dl className="tpSpecs">
              {part.specs.map((s) => (
                <div key={s.k}>
                  <dt>{s.k}</dt>
                  <dd>{s.v}</dd>
                </div>
              ))}
            </dl>

            <div className="tpAvail">
              <div>
                <span>OEM</span>
                <b>{part.oem}</b>
              </div>
              <div>
                <span>Stock</span>
                <b>{part.stock}</b>
              </div>
              <div>
                <span>Lead time</span>
                <b>{part.lead}</b>
              </div>
            </div>

            <div className="tpChips">
              {part.chips.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>

            <button
              type="button"
              className={`tpPick${picked.includes(part.id) ? " on" : ""}`}
              aria-pressed={picked.includes(part.id)}
              onClick={() => togglePick(part.id)}
            >
              {picked.includes(part.id)
                ? "✓ Added to RFQ"
                : `+ Add ${part.name} to RFQ`}
            </button>
          </aside>

          {/* catalogue table */}
          <div className="tpTableWrap">
            <table className="tpTable">
              <thead>
                <tr>
                  <th>Part no.</th>
                  <th>Description</th>
                  <th>OEM</th>
                  <th>Category</th>
                  <th>Cond.</th>
                  <th>Stock</th>
                  <th>Lead</th>
                  <th aria-label="Add to RFQ" />
                </tr>
              </thead>
              <tbody>
                {PARTS.map((p) => {
                  const isPicked = picked.includes(p.id);
                  return (
                    <tr
                      key={p.id}
                      className={active === p.id ? "active" : ""}
                      onClick={() => setActive(p.id)}
                    >
                      <td className="tpTableNo">{p.no}</td>
                      <td className="tpTableName">{p.name}</td>
                      <td>{p.oem}</td>
                      <td>{p.category}</td>
                      <td>
                        <span className={`tpBadge ${condClass(p.cond)}`}>
                          {p.cond}
                        </span>
                      </td>
                      <td>{p.stock}</td>
                      <td>{p.lead}</td>
                      <td>
                        <button
                          type="button"
                          className={`tpTableAdd${isPicked ? " on" : ""}`}
                          aria-pressed={isPicked}
                          aria-label={`Add ${p.name} to RFQ`}
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePick(p.id);
                          }}
                        >
                          {isPicked ? "✓" : "+"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* shop-floor film */}
        <div className="tpFilm">
          <figure className="tpFilmVideo">
            <div className="tpFilmFrame">
              <iframe
                src="https://www.youtube-nocookie.com/embed/ZGW9OA4_72g?autoplay=1&mute=1&loop=1&playlist=ZGW9OA4_72g&rel=0&modestbranding=1&playsinline=1"
                title="Inside a gas turbine — build and run"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
              <span className="tpFilmLive" aria-hidden="true">
                <i /> LIVE · AUTOPLAY
              </span>
            </div>
            <figcaption>
              <b>Gas turbine — build &amp; run</b>
              <span>Autoplaying film · GE Vernova</span>
            </figcaption>
          </figure>

          <div className="tpFilmSide">
            <div className="tpFilmHead">
              <span className="kicker">01.5 / Shop floor film</span>
              <h3>
                INSIDE THE
                <br />
                <span>MACHINE.</span>
              </h3>
              <p>
                Every unit is built, balanced and run before it ships. Watch how
                the hot section comes together — then tell us which parts you
                need and we&apos;ll quote them against your build sheet.
              </p>
            </div>

            <div className="tpFilmStills">
              <figure>
                <img
                  src="/oem/se-sgt5-8000h.jpg"
                  alt="Real Siemens Energy SGT5-8000H gas turbine cutaway"
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>Hot section</figcaption>
              </figure>
              <figure>
                <img
                  src="/oem/wm-rotor-sotavento.jpg"
                  alt="Real steam turbine rotor on the overhaul floor"
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>Rotor overhaul</figcaption>
              </figure>
              <figure>
                <img
                  src="/oem/wm-blades-vanes.jpg"
                  alt="Real axial compressor blades and vanes"
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>Blades &amp; vanes</figcaption>
              </figure>
              <figure>
                <img
                  src="/oem/wm-factory-mapna-12.jpg"
                  alt="Real turbine factory assembly floor"
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>Assembly floor</figcaption>
              </figure>
            </div>
          </div>
        </div>

        {/* RFQ bar */}
        <div className="tpQuote">
          <div className="tpQuoteInfo">
            <div className="tpQuoteCount">
              <b>{picked.length}</b>
              <span>{picked.length === 1 ? "part selected" : "parts selected"}</span>
            </div>
            <div className="tpQuoteList">
              {picked.length === 0 ? (
                <em>
                  No parts added yet — add one, or we&apos;ll quote the part you
                  are viewing ({part.name}).
                </em>
              ) : (
                picked.map((id) => {
                  const p = PARTS.find((x) => x.id === id);
                  return (
                    <button
                      type="button"
                      key={id}
                      className="tpQuoteChip"
                      title="Remove"
                      onClick={() => togglePick(id)}
                    >
                      {p?.no} {p?.name} <i aria-hidden="true">×</i>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <a className="tpCta" href={quoteHref}>
            <span className="tpCtaText">
              Request quote
              {picked.length > 0 ? ` · ${picked.length}` : ""}
            </span>
            <svg className="tpCtaArrow" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M2 7h9M7.5 3l4 4-4 4" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
