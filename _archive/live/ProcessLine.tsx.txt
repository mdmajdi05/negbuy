"use client";

import { useEffect, useRef, useState } from "react";

const PSTAGES = [
  {
    no: "01",
    short: "PICKUP",
    tag: "STEP 01 / ENQUIRY",
    title: "ORDER LOGGED",
    desc: "You send a part number, a photo or just a symptom. Our desk identifies the unit and comes back with a scoped, fixed quote.",
    metric: "24h",
    unit: "QUOTE TURNAROUND",
    chips: ["Enquiry logged", "Part identified", "Fixed quote"],
    status: "Order logged",
  },
  {
    no: "02",
    short: "QC",
    tag: "STEP 02 / ENGINEERING",
    title: "BUILT + CERTIFIED",
    desc: "Spares are sized, OEM-matched and vision-inspected at the NEGBUY workshop before anything is cleared for packing.",
    metric: "99.4%",
    unit: "QC PASS RATE",
    chips: ["CAD sizing", "OEM matching", "QA sign-off"],
    status: "In QC",
  },
  {
    no: "03",
    short: "PACK",
    tag: "STEP 03 / PACKING",
    title: "PICKED + CRATED",
    desc: "Parts are pulled from the rack, barcoded and foam-packed into sealed NEGBUY crates with a full manifest.",
    metric: "12,480",
    unit: "UNITS / SHIFT",
    chips: ["Barcoded", "Foam-packed", "Sealed manifest"],
    status: "Packing",
  },
  {
    no: "04",
    short: "LOAD",
    tag: "STEP 04 / LOADING",
    title: "LOADED ON TRUCK",
    desc: "The crates are forklifted onto the truck, strapped down, then the shipment is sealed and signed for dispatch.",
    metric: "48h",
    unit: "TO DISPATCH",
    chips: ["Forklift load", "Strapped down", "Sealed + signed"],
    status: "Loading",
  },
  {
    no: "05",
    short: "DROP",
    tag: "STEP 05 / DELIVERY",
    title: "DROPPED + RUNNING",
    desc: "Delivered to site, unloaded, installed and load-tested — then we stay on call 24/7 for the life of the machine.",
    metric: "24/7",
    unit: "AFTER-SALES SUPPORT",
    chips: ["On-site drop", "Install", "Load test", "24/7 support"],
    status: "Delivered",
  },
];

/* ---- Winding (zig-zag) road: computed once, shared by SVG + measurement ---- */
const VW = 1000;
const VH = 430;
const ROAD_SAMPLES = 240;

const ROAD = (() => {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= ROAD_SAMPLES; i++) {
    const t = i / ROAD_SAMPLES;
    pts.push({
      x: 70 + t * (VW - 140),
      y: 290 - t * 150 + Math.sin(t * Math.PI * 5) * 62,
    });
  }
  return pts;
})();

const ROAD_D =
  "M " + ROAD.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ");

const STATION_T = [0, 0.25, 0.5, 0.75, 1];
const STATIONS = STATION_T.map((t, i) => {
  const p = ROAD[Math.round(t * (ROAD.length - 1))];
  return { i, x: p.x, y: p.y };
});

const START = STATIONS[0];
const END = STATIONS[STATIONS.length - 1];
const DOCK = { x: STATIONS[3].x - 10, y: STATIONS[3].y + 60 };

const TREES = [
  { x: 175, y: 388 },
  { x: 300, y: 396 },
  { x: 455, y: 384 },
  { x: 620, y: 392 },
  { x: 775, y: 386 },
  { x: 905, y: 380 },
];

/* ---- Official NEGBUY logo mark, cropped from /header-logo.png ---- */
function NegbuyLogoMark({
  x,
  y,
  width,
  height,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  return (
    <svg
      x={x}
      y={y}
      width={width}
      height={height}
      viewBox="106 0 655 298"
      preserveAspectRatio="xMidYMid meet"
    >
      <image href="/header-logo.png" x="0" y="0" width="827" height="302" />
    </svg>
  );
}

/* ---- Realistic truck wheel: rubber tyre + steel rim with vent holes ---- */
function TruckWheel({ cx, cy }: { cx: number; cy: number }) {
  const holes = [0, 60, 120, 180, 240, 300];
  return (
    <>
      {/* tyre carcass */}
      <circle cx={cx} cy={cy} r="9.6" fill="#08080a" />
      {/* sidewall */}
      <circle cx={cx} cy={cy} r="8.2" fill="#15151a" />
      {/* sidewall inner shadow toward the rim */}
      <circle cx={cx} cy={cy} r="6.5" fill="#0e0e12" />
      {/* soft top-left sheen on the rubber */}
      <circle
        cx={cx}
        cy={cy - 0.7}
        r="9"
        fill="none"
        stroke="#26262f"
        strokeWidth="1.4"
        opacity="0.55"
      />
      {/* steel rim */}
      <circle cx={cx} cy={cy} r="5.5" fill="url(#plRim)" stroke="#4c5058" strokeWidth="0.7" />
      {/* vent holes */}
      {holes.map((a) => {
        const rad = ((a - 15) * Math.PI) / 180;
        return (
          <circle
            key={a}
            cx={cx + Math.cos(rad) * 3.4}
            cy={cy + Math.sin(rad) * 3.4}
            r="1.05"
            fill="#0c0c10"
          />
        );
      })}
      {/* hub + centre nut */}
      <circle cx={cx} cy={cy} r="1.9" fill="#c6cad2" stroke="#4c5058" strokeWidth="0.6" />
      <circle cx={cx} cy={cy} r="0.7" fill="#74787f" />
    </>
  );
}

/* ===================== REAL-WORLD (SIM) SCENE — DATA ===================== */
const R = (t: number) => ROAD[Math.round(t * (ROAD.length - 1))];

const BUSHES = [
  { x: 118, y: 408, s: 1 },
  { x: 250, y: 418, s: 0.8 },
  { x: 390, y: 410, s: 1.1 },
  { x: 540, y: 420, s: 0.9 },
  { x: 690, y: 412, s: 1 },
  { x: 840, y: 418, s: 0.85 },
  { x: 952, y: 406, s: 1 },
];

const STARS = [
  { x: 80, y: 26, r: 1.3, o: 0.9 },
  { x: 190, y: 48, r: 1, o: 0.7 },
  { x: 300, y: 22, r: 1.1, o: 0.8 },
  { x: 420, y: 40, r: 0.9, o: 0.6 },
  { x: 540, y: 18, r: 1.2, o: 0.85 },
  { x: 650, y: 46, r: 1, o: 0.7 },
  { x: 900, y: 30, r: 1.1, o: 0.8 },
  { x: 962, y: 58, r: 0.9, o: 0.6 },
  { x: 130, y: 66, r: 0.8, o: 0.5 },
  { x: 740, y: 40, r: 0.9, o: 0.55 },
];

const CLOUDS = [
  { x: 150, y: 74, s: 1.1 },
  { x: 430, y: 52, s: 0.85 },
  { x: 700, y: 64, s: 1.0 },
  { x: 900, y: 88, s: 0.7 },
  { x: 275, y: 96, s: 0.7 },
  { x: 560, y: 82, s: 0.8 },
];

const SKYLINE = (() => {
  const hs = [
    28, 16, 40, 22, 34, 18, 46, 24, 30, 20, 38, 26, 32, 16, 42, 22, 28, 18,
    36, 24, 32, 20, 44, 26, 28, 16, 38, 22,
  ];
  return hs.map((h, i) => ({ x: i * 36 + 8, w: 28, h }));
})();

const HORIZON_TREES = (() => {
  const a: { x: number; y: number; s: number }[] = [];
  for (let i = 0; i < 40; i++) {
    a.push({ x: i * 26 + 8, y: 120, s: 0.55 + ((i * 7) % 5) / 16 });
  }
  return a;
})();

/* streetlights sit on the far side of the road, between the checkpoint buildings */
const LIGHTS = [0.125, 0.375, 0.625, 0.875].map((t, i) => {
  const p = R(t);
  return { x: p.x, y: p.y - 4, flip: i % 2 === 0 };
});

/* village homes scattered behind the road and on the foreground fields */
const VILLAGE = [
  { x: 118, y: 158, s: 0.8, roof: "#6b3b2b", wall: "#94866b" },
  { x: 170, y: 149, s: 0.85, roof: "#5d4a33", wall: "#a0886c" },
  { x: 232, y: 165, s: 0.9, roof: "#7a4230", wall: "#8d7f66" },
  { x: 356, y: 226, s: 1.05, roof: "#5d4430", wall: "#b09a80" },
  { x: 472, y: 348, s: 1.1, roof: "#6b3b2b", wall: "#9c8b72" },
  { x: 706, y: 356, s: 1.08, roof: "#5d4a33", wall: "#a8937a" },
  { x: 862, y: 304, s: 1, roof: "#7a4230", wall: "#94866b" },
];

/* parked cars on dirt pads along the fields */
const CARS = [
  { x: 178, y: 320, color: "#c0392b", flip: true },
  { x: 636, y: 342, color: "#c9ccd6", flip: false },
];

/* power poles (foreground side) that the sagging wires hang between */
const POLES = [
  { x: 148, y: 346 },
  { x: 352, y: 302 },
  { x: 902, y: 238 },
];

/* small birds drifting near the sunset */
const BIRDS = [
  { x: 430, y: 40, s: 1 },
  { x: 470, y: 48, s: 0.8 },
  { x: 700, y: 34, s: 0.9 },
];

/* grass tufts scattered across the ground (road is painted over them later) */
const GRASS = (() => {
  const g: { x: number; y: number; s: number }[] = [];
  for (let i = 0; i < 34; i++) {
    g.push({ x: 34 + ((i * 137) % 920), y: 250 + ((i * 61) % 168), s: 0.5 + (i % 4) * 0.16 });
  }
  return g;
})();

/* ploughed field rows (furrows) for farmland realism */
const FIELD_ROWS = [226, 258, 290, 322, 356, 390].map((y, i) => ({
  d: `M 0 ${y} Q ${VW * 0.27} ${y + (i % 2 ? 11 : -8)} ${VW * 0.55} ${y} T ${VW} ${y}`,
  o: i % 2 ? 0.42 : 0.56,
}));

/* ---- real-world scene actors ---- */
function LitWin({
  x,
  y,
  w = 8,
  h = 10,
  o = 0.8,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  o?: number;
}) {
  return (
    <>
      <rect x={x} y={y} width={w} height={h} fill="#ffd98a" opacity={o} />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill="none"
        stroke="#20242e"
        strokeWidth="0.8"
      />
      <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#20242e" strokeWidth="0.7" />
      <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke="#20242e" strokeWidth="0.7" />
    </>
  );
}

function Pine({
  x,
  y,
  s = 1,
  tone = "#1f3a2a",
}: {
  x: number;
  y: number;
  s?: number;
  tone?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-2" y="-7" width="4" height="10" fill="#3a2c1e" />
      <path d="M 0 -32 L 11 -7 L -11 -7 Z" fill={tone} />
      <path d="M 0 -22 L 8 -7 L -8 -7 Z" fill="#274a35" />
    </g>
  );
}

function Bush({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="-5" rx="11" ry="6" fill="#1b3524" />
      <ellipse cx="-6" cy="-3" rx="7" ry="5" fill="#234732" />
      <ellipse cx="6" cy="-3" rx="7" ry="5" fill="#234732" />
    </g>
  );
}

function Worker({
  x,
  y,
  s = 1,
  vest = "#f0b429",
  hat = "#f0b429",
  flip = false,
}: {
  x: number;
  y: number;
  s?: number;
  vest?: string;
  hat?: string;
  flip?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx="0" cy="0.6" rx="6" ry="1.8" fill="rgba(0,0,0,0.35)" />
      <rect x="-3.1" y="-9" width="2.5" height="9" rx="1.1" fill="#2b3040" />
      <rect x="0.6" y="-9" width="2.5" height="9" rx="1.1" fill="#2b3040" />
      <rect x="-4.2" y="-21" width="8.4" height="13" rx="2" fill={vest} />
      <rect x="-4.2" y="-14" width="8.4" height="1.3" fill="#d9dde3" opacity="0.7" />
      <rect x="-4.2" y="-11" width="8.4" height="1.3" fill="#d9dde3" opacity="0.5" />
      <rect x="-6.2" y="-20.6" width="2.4" height="10.5" rx="1.2" fill={vest} />
      <rect className="tArm" x="3.8" y="-20.6" width="2.4" height="10.5" rx="1.2" fill={vest} />
      <circle cx="0" cy="-26.4" r="3.5" fill="#e7b48a" />
      <path d="M -3.8 -27.2 Q 0 -31.8 3.8 -27.2 Z" fill={hat} />
    </g>
  );
}

function Streetlight({ x, y, flip = false }: { x: number; y: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})${flip ? " scale(-1 1)" : ""}`}>
      <rect x="-1.2" y="-40" width="2.4" height="40" rx="1" fill="#3b4150" />
      <path d="M 0 -40 Q 1 -47 10 -47 L 16 -47" fill="none" stroke="#3b4150" strokeWidth="2.4" />
      <rect x="12" y="-49" width="9" height="3.4" rx="1.6" fill="#2f3441" />
      <ellipse cx="16.5" cy="-45.4" rx="3.6" ry="1.8" fill="#ffe6a8" />
      <circle cx="16.5" cy="-45" r="9" fill="url(#plLampGlow)" />
    </g>
  );
}

function RoadSign({
  x,
  y,
  label,
  color = "#e21b23",
}: {
  x: number;
  y: number;
  label: string;
  color?: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-1" y="-26" width="2" height="26" rx="1" fill="#3b4150" />
      <rect x="-18" y="-40" width="36" height="15" rx="2" fill={color} />
      <rect
        x="-18"
        y="-40"
        width="36"
        height="15"
        rx="2"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.3"
      />
      <text
        x="0"
        y="-29.5"
        textAnchor="middle"
        fontSize="7.5"
        fontWeight="800"
        fill="#fff"
        letterSpacing="0.4"
      >
        {label}
      </text>
    </g>
  );
}

/* realistic village house: tiled roof, chimney, lit windows, porch lamp */
function House({
  x,
  y,
  s = 1,
  roof = "#6b3b2b",
  wall = "#94866b",
}: {
  x: number;
  y: number;
  s?: number;
  roof?: string;
  wall?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="1.5" rx="26" ry="4" fill="rgba(0,0,0,0.38)" />
      <rect x="-17" y="-22" width="34" height="22" fill={wall} stroke="#3a332a" strokeWidth="1" />
      <rect x="-17" y="-22" width="34" height="3" fill="rgba(0,0,0,0.18)" />
      <rect x="-17" y="-3" width="34" height="3" fill="rgba(0,0,0,0.22)" />
      <path d="M -20 -22 L 0 -38 L 20 -22 Z" fill={roof} stroke="#2c1d15" strokeWidth="1" />
      <path
        d="M -15.5 -27 L 15.5 -27 M -12 -32 L 12 -32"
        stroke="#2c1d15"
        strokeWidth="0.7"
        opacity="0.55"
      />
      <path d="M -20.5 -22 L -20.5 -19.3 L 20.5 -19.3 L 20.5 -22 L -20.5 -22 Z" fill="#4a3225" />
      <rect x="8" y="-40" width="5" height="9" fill="#6e5b49" />
      <rect x="8" y="-41" width="5" height="2" fill="#4a3a2d" />
      <rect x="-12.5" y="-16" width="7" height="8" fill="#ffd98a" opacity="0.9" />
      <rect x="-12.5" y="-16" width="7" height="8" fill="none" stroke="#2f2a20" strokeWidth="0.9" />
      <line x1="-9" y1="-16" x2="-9" y2="-8" stroke="#2f2a20" strokeWidth="0.7" />
      <rect x="5.5" y="-16" width="7" height="8" fill="#ffd98a" opacity="0.65" />
      <rect x="5.5" y="-16" width="7" height="8" fill="none" stroke="#2f2a20" strokeWidth="0.9" />
      <line x1="9" y1="-16" x2="9" y2="-8" stroke="#2f2a20" strokeWidth="0.7" />
      <rect x="-3.5" y="-11" width="7" height="11" rx="1" fill="#4a3323" stroke="#2c2218" strokeWidth="0.8" />
      <circle cx="1.6" cy="-5.5" r="0.7" fill="#ffd98a" />
      <circle cx="-14" cy="-10" r="1.4" fill="#ffe9b0" />
      <circle cx="-14" cy="-10" r="4" fill="#ffe9b0" opacity="0.25" />
    </g>
  );
}

/* realistic little car with windows, lights and wheels */
function Car({
  x = 0,
  y = 0,
  color = "#c0392b",
  flip = false,
}: {
  x?: number;
  y?: number;
  color?: string;
  flip?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})${flip ? " scale(-1 1)" : ""}`}>
      <ellipse cx="0" cy="1" rx="17" ry="3.2" fill="rgba(0,0,0,0.4)" />
      <path
        d="M -16 -5 L 16 -5 Q 19.5 -5 19.5 -9 L 17 -14 Q 16 -16 11 -16 L -8 -16 Q -12 -16 -14 -13 L -17 -9 Q -18 -7 -18 -5 Z"
        fill={color}
        stroke="#1c1210"
        strokeWidth="0.8"
      />
      <path
        d="M -5 -15 L 6 -15 Q 10 -15 12 -12 L 12 -8 L -9 -8 L -9 -12 Q -8 -15 -5 -15 Z"
        fill="#a8c8e8"
        opacity="0.92"
      />
      <rect x="-8" y="-15" width="1.6" height="7" fill="#14181f" />
      <rect x="7" y="-13" width="1.6" height="5" fill="#14181f" />
      <rect x="-18.2" y="-8" width="2.2" height="2.6" rx="0.8" fill="#fff3cf" />
      <rect x="16.6" y="-9" width="2.2" height="2.6" rx="0.8" fill="#ffb0a0" />
      <circle cx="-9" cy="-4" r="3.2" fill="#0c0c0e" />
      <circle cx="-9" cy="-4" r="1.4" fill="#8f959e" />
      <circle cx="9.5" cy="-4" r="3.2" fill="#0c0c0e" />
      <circle cx="9.5" cy="-4" r="1.4" fill="#8f959e" />
    </g>
  );
}

/* countryside power pole with crossarm + insulators */
function PowerPole({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="3" cy="1.5" rx="9" ry="2" fill="rgba(0,0,0,0.35)" />
      <path d="M -1.6 0 L -2.3 -54 L 2.3 -54 L 1.6 0 Z" fill="#33352f" />
      <rect x="-14" y="-54" width="28" height="2.4" rx="1" fill="#33352f" />
      <circle cx="-12" cy="-56" r="1.6" fill="#5a6070" />
      <circle cx="12" cy="-56" r="1.6" fill="#5a6070" />
      <circle cx="0" cy="-56" r="1.3" fill="#5a6070" />
      <path d="M -6 -54 L 0 -44" stroke="#33352f" strokeWidth="1.4" />
    </g>
  );
}

export default function ProcessLine() {
  const sectionRef = useRef<HTMLElement>(null);
  const truckRef = useRef<SVGGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const wheelARef = useRef<SVGGElement>(null);
  const wheelBRef = useRef<SVGGElement>(null);
  const crateRef = useRef<SVGGElement>(null);
  const dropRef = useRef<SVGGElement>(null);
  const badgeRef = useRef<SVGGElement>(null);
  const depotRef = useRef<SVGGElement>(null);
  const flagRef = useRef<SVGGElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const nodeEls = useRef<(SVGGElement | null)[]>([]);
  const stageEls = useRef<(HTMLDivElement | null)[]>([]);

  /* self-serve view switch: REAL WORLD (sim) <-> CLASSIC (flat map) */
  const [mode, setMode] = useState<"normal" | "sim">("normal");

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const N = PSTAGES.length;
    let frame = 0;
    let current = 0;
    let spin = 0;

    const render = () => {
      const sec = sectionRef.current;
      const path = pathRef.current;
      const truck = truckRef.current;

      if (sec && path && truck) {
        const rect = sec.getBoundingClientRect();
        const max = sec.offsetHeight - window.innerHeight;
        const raw = max > 0 ? -rect.top / max : 0;
        const target = Math.max(0, Math.min(1, raw));
        current += (target - current) * (reduced ? 1 : 0.085);

        const idx = Math.min(N - 1, Math.floor(current * N));

        // ---- drive the truck along the winding road ----
        const len = path.getTotalLength();
        const at = current * len;
        const pt = path.getPointAtLength(at);
        const ahead = path.getPointAtLength(Math.min(len, at + 3));
        const ang = (Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180) / Math.PI;
        truck.setAttribute(
          "transform",
          `translate(${pt.x.toFixed(2)} ${pt.y.toFixed(2)}) rotate(${ang.toFixed(2)})`
        );

        if (!reduced) spin = (spin + 7) % 36000;
        wheelBRef.current?.setAttribute("transform", `rotate(${spin} -34 6.4)`);
        wheelARef.current?.setAttribute("transform", `rotate(${spin} 32 6.4)`);

        // ---- cargo loaded at the loading bay, dropped at the destination ----
        crateRef.current?.classList.toggle(
          "on",
          current > 0.76 && current < 0.97
        );
        dropRef.current?.classList.toggle("on", current > 0.94);
        badgeRef.current?.classList.toggle("on", current > 0.94);

        // ---- markers + checkpoint pins ----
        depotRef.current?.classList.toggle("now", idx === 0);
        depotRef.current?.classList.toggle("done", current > 0.03);
        flagRef.current?.classList.toggle("now", idx === N - 1);
        flagRef.current?.classList.toggle("done", current > 0.96);
        nodeEls.current.forEach((el, i) => {
          if (!el) return;
          el.classList.toggle("done", current * N >= i + 0.5);
          el.classList.toggle("now", i === idx);
        });

        // ---- left-hand copy + hud ----
        if (ghostRef.current) ghostRef.current.textContent = PSTAGES[idx].no;
        if (statusRef.current)
          statusRef.current.textContent = PSTAGES[idx].status;
        stageEls.current.forEach((el, i) => {
          if (!el) return;
          const active = i === idx;
          el.classList.toggle("active", active);
          el.setAttribute("aria-hidden", active ? "false" : "true");
        });
        if (progressRef.current) {
          progressRef.current.style.transform = `scaleX(${current})`;
        }
        if (pctRef.current) {
          pctRef.current.textContent = `${Math.round(current * 100)}%`;
        }
      }

      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section
      className="processScroll"
      ref={sectionRef}
      aria-label="How NEGBUY delivers — from enquiry to commissioning"
    >
      <div className="processPin">
        <div className="processGrid" aria-hidden="true" />
        <div className="ghostNo" ref={ghostRef} aria-hidden="true">
          01
        </div>

        {/* self-serve view switch */}
        <div className="plSwitch" role="group" aria-label="Delivery map view">
          <button
            type="button"
            className={mode === "sim" ? "on" : ""}
            aria-pressed={mode === "sim"}
            onClick={() => setMode("sim")}
            title="Real-world delivery simulation — dusk town, factory & village"
          >
            <svg className="plSwitchSvg" viewBox="0 0 14 14" aria-hidden="true">
              <circle cx="9.4" cy="4.2" r="2.3" className="sIcon" />
              <path d="M1.5 11.5 L5 6.2 L7.6 9 L9.2 6.8 L12.5 11.5 Z" className="sIcon" />
            </svg>
            REAL WORLD
          </button>
          <button
            type="button"
            className={mode === "normal" ? "on" : ""}
            aria-pressed={mode === "normal"}
            onClick={() => setMode("normal")}
            title="Classic clean map without simulation"
          >
            <svg className="plSwitchSvg" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M2 11.5 Q4.5 2.5 7 5.5 T12 2.5" className="sIcon" />
              <rect x="2" y="1.2" width="1.8" height="1.8" className="sIcon" />
              <rect x="10.4" y="10.8" width="1.8" height="1.8" className="sIcon" />
            </svg>
            CLASSIC
          </button>
        </div>

        <div className="processHead">
          <div>
            <div className="kicker">03 / How we deliver</div>
            <h2>
              ENQUIRY TO
              <br />
              <span>COMMISSIONING.</span>
            </h2>
          </div>
          <p>
            Scroll — the NEGBUY shipment rolls from pickup to drop, clearing
            every checkpoint on the way.
          </p>
        </div>

        <div className="processBody">
          <div className="pstageWrap">
            {PSTAGES.map((s, i) => (
              <div
                key={s.no}
                ref={(el) => {
                  stageEls.current[i] = el;
                }}
                className={`pstage${i === 0 ? " active" : ""}`}
              >
                <div className="pstageTag">{s.tag}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <div className="pchips">
                  {s.chips.map((c) => (
                    <span key={c}>{c}</span>
                  ))}
                </div>
                <div className="pmetric">
                  <b>{s.metric}</b>
                  <small>{s.unit}</small>
                </div>
              </div>
            ))}
          </div>

          <div className="processMapWrap">
            <div className="shipHud" aria-hidden="true">
              <span className="shipDot" />
              <b>NB-2026-0426</b>
              <span className="shipStatus" ref={statusRef}>
                Order logged
              </span>
            </div>

            <svg
              className="truckMap"
              viewBox={`0 0 ${VW} ${VH}`}
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              <defs>
                <radialGradient id="plHeadGlow">
                  <stop offset="0%" stopColor="#fffdf2" stopOpacity="0.95" />
                  <stop offset="40%" stopColor="#ffe680" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#ffd36b" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="plBeam" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#fff4c2" stopOpacity="0.6" />
                  <stop offset="40%" stopColor="#ffe27a" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#ffd36b" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="plBody" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbfcfe" />
                  <stop offset="55%" stopColor="#eceef3" />
                  <stop offset="100%" stopColor="#d2d7df" />
                </linearGradient>
                <linearGradient id="plCab" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2c2c36" />
                  <stop offset="55%" stopColor="#1b1b22" />
                  <stop offset="100%" stopColor="#101015" />
                </linearGradient>
                <radialGradient id="plRim" cx="0.38" cy="0.32" r="0.8">
                  <stop offset="0%" stopColor="#f4f6f9" />
                  <stop offset="45%" stopColor="#c4c8d1" />
                  <stop offset="100%" stopColor="#787d86" />
                </radialGradient>

                {mode === "sim" && (
                  <>
                    <linearGradient id="plSky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0a1020" />
                      <stop offset="45%" stopColor="#1a1f3d" />
                      <stop offset="72%" stopColor="#51304a" />
                      <stop offset="90%" stopColor="#8a4a33" />
                      <stop offset="100%" stopColor="#b06a38" />
                    </linearGradient>
                    <radialGradient id="plSun" cx="0.5" cy="0.5" r="0.5">
                      <stop offset="0%" stopColor="#ffe9b0" />
                      <stop offset="35%" stopColor="#ffb457" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#ff7a2f" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="plGround" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1d3a24" />
                      <stop offset="40%" stopColor="#142c1c" />
                      <stop offset="100%" stopColor="#0b1a11" />
                    </linearGradient>
                    <linearGradient id="plHillFar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#28305a" />
                      <stop offset="100%" stopColor="#151a34" />
                    </linearGradient>
                    <linearGradient id="plHillNear" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1c3f2b" />
                      <stop offset="100%" stopColor="#102518" />
                    </linearGradient>
                    <linearGradient id="plWall" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4d515c" />
                      <stop offset="55%" stopColor="#3a3d46" />
                      <stop offset="100%" stopColor="#2b2e36" />
                    </linearGradient>
                    <linearGradient id="plSmoke" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="#d2d6dd" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#d2d6dd" stopOpacity="0" />
                    </linearGradient>
                    <radialGradient id="plLampGlow" cx="0.5" cy="0.5" r="0.5">
                      <stop offset="0%" stopColor="#ffe6a8" stopOpacity="0.55" />
                      <stop offset="100%" stopColor="#ffe6a8" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="plLampPool" cx="0.5" cy="0.5" r="0.5">
                      <stop offset="0%" stopColor="#ffe6a8" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#ffe6a8" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="plHaze" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8fa0d8" stopOpacity="0" />
                      <stop offset="55%" stopColor="#8fa0d8" stopOpacity="0.14" />
                      <stop offset="100%" stopColor="#8fa0d8" stopOpacity="0" />
                    </linearGradient>
                  </>
                )}
              </defs>

              {/* ============ REAL-WORLD SKY + TERRAIN (sim only) ============ */}
              {mode === "sim" && (
                <g className="tWorld">
                  <rect x="0" y="0" width={VW} height={VH} fill="url(#plSky)" />
                  {STARS.map((s, i) => (
                    <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#dbe6ff" opacity={s.o} />
                  ))}
                  {BIRDS.map((b, i) => (
                    <g key={i} transform={`translate(${b.x} ${b.y}) scale(${b.s})`}>
                      <path
                        d="M 0 0 Q 4 -4 8 0 Q 12 -4 16 0"
                        fill="none"
                        stroke="#1c2233"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </g>
                  ))}
                  {/* sunset */}
                  <circle cx="772" cy="92" r="84" fill="url(#plSun)" opacity="0.85" />
                  <circle cx="772" cy="92" r="22" fill="#ffd98a" />
                  <circle cx="772" cy="92" r="13" fill="#fff3cf" />
                  <ellipse cx="772" cy="118" rx="70" ry="7" fill="#ffb457" opacity="0.14" />
                  {CLOUDS.map((c, i) => (
                    <g key={i} transform={`translate(${c.x} ${c.y}) scale(${c.s})`}>
                      <g className="tCloud">
                        <ellipse cx="0" cy="0" rx="30" ry="9" fill="#3a416b" opacity="0.5" />
                        <ellipse cx="-16" cy="3" rx="18" ry="7" fill="#30365a" opacity="0.5" />
                        <ellipse cx="16" cy="3" rx="20" ry="7" fill="#30365a" opacity="0.5" />
                      </g>
                    </g>
                  ))}
                  {/* far mountains */}
                  <path
                    d="M -10 118 L 60 66 L 140 118 L 220 54 L 300 118 L 380 74 L 470 118 L 560 44 L 660 118 L 740 70 L 830 118 L 900 58 L 1010 118 Z"
                    fill="url(#plHillFar)"
                    opacity="0.9"
                  />
                  {/* near hills */}
                  <path
                    d="M -10 122 L 90 86 L 190 122 L 300 92 L 420 122 L 520 88 L 640 122 L 760 94 L 880 122 L 1010 100 L 1010 122 Z"
                    fill="url(#plHillNear)"
                  />
                  {/* ground */}
                  <rect x="0" y="118" width={VW} height={VH - 118} fill="url(#plGround)" />
                  {/* horizon warm glow */}
                  <rect x="0" y="112" width={VW} height="16" fill="#ff9d4d" opacity="0.1" />
                  {/* field mottling */}
                  <ellipse cx="180" cy="300" rx="150" ry="60" fill="#1d4026" opacity="0.14" />
                  <ellipse cx="560" cy="330" rx="190" ry="70" fill="#0c1c12" opacity="0.16" />
                  <ellipse cx="840" cy="270" rx="150" ry="60" fill="#214629" opacity="0.12" />
                  {/* field bands */}
                  <path
                    d="M 0 212 Q 260 190 520 214 T 1000 206 L 1000 430 L 0 430 Z"
                    fill="#0e2418"
                    opacity="0.5"
                  />
                  <path
                    d="M 0 300 Q 300 282 560 306 T 1000 296 L 1000 430 L 0 430 Z"
                    fill="#0b1e14"
                    opacity="0.55"
                  />
                  {/* ploughed furrows */}
                  {FIELD_ROWS.map((r, i) => (
                    <path
                      key={i}
                      d={r.d}
                      fill="none"
                      stroke="#122a19"
                      strokeWidth="1.6"
                      strokeDasharray="7 10"
                      opacity={r.o}
                    />
                  ))}
                  {/* distant town skyline */}
                  {SKYLINE.map((b, i) => (
                    <g key={i}>
                      <rect x={b.x} y={118 - b.h} width={b.w} height={b.h} fill="#10142a" />
                      <rect x={b.x + 5} y={118 - b.h + 6} width="4" height="4" fill="#ffd98a" opacity="0.5" />
                      <rect x={b.x + b.w - 9} y={118 - b.h + 12} width="4" height="4" fill="#ffd98a" opacity="0.35" />
                    </g>
                  ))}
                  <line x1="296" y1="78" x2="296" y2="60" stroke="#10142a" strokeWidth="1.6" />
                  <rect x="294" y="58" width="4" height="4" fill="#e21b23" opacity="0.8" />
                  {/* grass tufts */}
                  {GRASS.map((g, i) => (
                    <g key={i} transform={`translate(${g.x} ${g.y}) scale(${g.s})`}>
                      <path
                        d="M 0 0 Q -1.4 -6 -3 -8 M 0 0 Q 0.8 -7 2 -9 M 0 0 Q 3 -5 4.5 -7"
                        fill="none"
                        stroke="#214a30"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                      />
                    </g>
                  ))}
                </g>
              )}

              {/* scenery */}
              {mode === "normal" ? (
                <g className="tScenery">
                  {TREES.map((t) => (
                    <g key={`${t.x}-${t.y}`} transform={`translate(${t.x} ${t.y})`}>
                      <rect x="-2" y="-7" width="4" height="10" fill="#3a2c1e" />
                      <path d="M 0 -32 L 11 -7 L -11 -7 Z" fill="#1f3a2a" />
                      <path d="M 0 -22 L 8 -7 L -8 -7 Z" fill="#274a35" />
                    </g>
                  ))}
                </g>
              ) : (
                <g className="tScenery">
                  {HORIZON_TREES.map((t, i) => (
                    <Pine key={i} x={t.x} y={t.y} s={t.s} tone="#132a1e" />
                  ))}
                  {TREES.map((t) => (
                    <Pine key={`${t.x}-${t.y}`} x={t.x} y={t.y} />
                  ))}
                  {BUSHES.map((b, i) => (
                    <Bush key={i} x={b.x} y={b.y} s={b.s} />
                  ))}
                  {LIGHTS.map((l, i) => (
                    <g key={i}>
                      <ellipse cx={l.x} cy={l.y + 42} rx="17" ry="4.5" fill="url(#plLampPool)" />
                      <Streetlight x={l.x} y={l.y} flip={l.flip} />
                    </g>
                  ))}
                  {VILLAGE.map((h, i) => (
                    <House key={i} x={h.x} y={h.y} s={h.s} roof={h.roof} wall={h.wall} />
                  ))}
                  <RoadSign x={START.x - 36} y={START.y + 20} label="NEGBUY" color="#e21b23" />
                  <RoadSign x={END.x + 52} y={END.y + 26} label="DELIVERY" color="#1f9d55" />
                </g>
              )}

              {/* atmospheric haze over the distance */}
              {mode === "sim" && (
                <rect x="0" y="96" width={VW} height="96" fill="url(#plHaze)" aria-hidden="true" />
              )}

              {/* ============ REAL-WORLD INDUSTRIAL ENV (sim only) ============ */}
              {mode === "sim" && (
                <g className="tEnv">
                  {/* QC + company warehouse (station 02) */}
                  <g transform={`translate(${STATIONS[1].x} ${STATIONS[1].y - 10})`}>
                    <ellipse cx="0" cy="0" rx="86" ry="7" fill="rgba(0,0,0,0.42)" />
                    <rect x="-62" y="-74" width="124" height="74" fill="url(#plWall)" stroke="#3c4049" strokeWidth="1.4" />
                    <g stroke="#343842" strokeWidth="1" opacity="0.7">
                      <line x1="-62" y1="-56" x2="62" y2="-56" />
                      <line x1="-62" y1="-38" x2="62" y2="-38" />
                    </g>
                    <g fill="#2b2f38">
                      <rect x="-66" y="-74" width="4" height="74" />
                      <rect x="62" y="-74" width="4" height="74" />
                    </g>
                    <rect x="-66" y="-78" width="132" height="5" fill="#23262e" />
                    <rect x="-44" y="-87" width="15" height="9" rx="1" fill="#2f333c" />
                    <circle cx="-36.5" cy="-83" r="2.6" fill="#23262e" />
                    <rect x="18" y="-88" width="18" height="10" rx="1" fill="#2f333c" />
                    <rect x="24" y="-92" width="3.6" height="4" fill="#3a3e46" />
                    <LitWin x={-56} y={-68} w={9} h={11} o={0.85} />
                    <LitWin x={-43} y={-68} w={9} h={11} o={0.55} />
                    <LitWin x={-30} y={-68} w={9} h={11} o={0.85} />
                    <LitWin x={-17} y={-68} w={9} h={11} o={0.5} />
                    <LitWin x={-4} y={-68} w={9} h={11} o={0.85} />
                    <LitWin x={9} y={-68} w={9} h={11} o={0.5} />
                    <LitWin x={22} y={-68} w={9} h={11} o={0.85} />
                    <LitWin x={35} y={-68} w={9} h={11} o={0.6} />
                    <LitWin x={48} y={-68} w={9} h={11} o={0.85} />
                    <rect x="-42" y="-54" width="84" height="15" rx="2" fill="#f4f4f1" stroke="#c9ccd3" strokeWidth="1" />
                    <rect x="-42" y="-54" width="84" height="3" fill="#e21b23" />
                    <NegbuyLogoMark x={-37} y={-51.5} width={74} height={10} />
                    <rect x="-52" y="-34" width="30" height="26" fill="#10141d" stroke="#3c4049" strokeWidth="1.2" />
                    <g stroke="#23262e" strokeWidth="1">
                      <line x1="-52" y1="-27" x2="-22" y2="-27" />
                      <line x1="-52" y1="-20" x2="-22" y2="-20" />
                    </g>
                    <rect x="22" y="-34" width="30" height="26" fill="#10141d" stroke="#3c4049" strokeWidth="1.2" />
                    <g stroke="#23262e" strokeWidth="1">
                      <line x1="22" y1="-27" x2="52" y2="-27" />
                      <line x1="22" y1="-20" x2="52" y2="-20" />
                    </g>
                    <rect x="-50" y="-9" width="26" height="5" rx="2" fill="#1a1d23" />
                    <rect x="24" y="-9" width="26" height="5" rx="2" fill="#1a1d23" />
                    <rect x="-48" y="-17" width="13" height="9" rx="1" fill="#b98b4a" stroke="#7a5a2e" strokeWidth="1" />
                    <rect x="-35" y="-20" width="13" height="12" rx="1" fill="#c99a56" stroke="#7a5a2e" strokeWidth="1" />
                    <ellipse cx="0" cy="2" rx="52" ry="6" fill="#ffd98a" opacity="0.07" />
                    <Worker x={-64} y={0} s={1} vest="#2f6fed" hat="#f0b429" />
                    <Worker x={10} y={-2} s={1} vest="#f0b429" />
                    <Worker x={30} y={0} s={1} vest="#2f6fed" hat="#d9dde3" flip />
                  </g>

                  {/* packing plant (station 03) */}
                  <g transform={`translate(${STATIONS[2].x} ${STATIONS[2].y - 10})`}>
                    <ellipse cx="0" cy="0" rx="72" ry="6" fill="rgba(0,0,0,0.4)" />
                    <rect x="-52" y="-50" width="104" height="50" fill="url(#plWall)" stroke="#3c4049" strokeWidth="1.3" />
                    <g stroke="#343842" strokeWidth="1" opacity="0.7">
                      <line x1="-52" y1="-34" x2="52" y2="-34" />
                    </g>
                    <path
                      d="M -52 -50 L -40 -64 L -26 -50 L -14 -64 L 0 -50 L 12 -64 L 26 -50 L 38 -64 L 52 -50 Z"
                      fill="#252932"
                      stroke="#3c4049"
                      strokeWidth="1.1"
                    />
                    <g fill="#ffd98a" opacity="0.85">
                      <rect x="-33" y="-58" width="4" height="8" />
                      <rect x="-7" y="-58" width="4" height="8" />
                      <rect x="19" y="-58" width="4" height="8" />
                      <rect x="45" y="-58" width="4" height="8" />
                    </g>
                    <LitWin x={-44} y={-42} w={9} h={10} o={0.8} />
                    <LitWin x={-28} y={-42} w={9} h={10} o={0.5} />
                    <rect x="-40" y="-24" width="80" height="14" rx="2" fill="#f4f4f1" stroke="#c9ccd3" strokeWidth="1" />
                    <rect x="-40" y="-24" width="80" height="2.8" fill="#e21b23" />
                    <text
                      x="0"
                      y="-14.5"
                      textAnchor="middle"
                      fontSize="7"
                      fontWeight="800"
                      letterSpacing="1.6"
                      fill="#141416"
                    >
                      NEGBUY PACKING
                    </text>
                    <rect x="10" y="-26" width="34" height="26" fill="#10141d" stroke="#3c4049" strokeWidth="1.1" />
                    <g stroke="#23262e" strokeWidth="1">
                      <line x1="10" y1="-19" x2="44" y2="-19" />
                      <line x1="10" y1="-12" x2="44" y2="-12" />
                    </g>
                    <rect x="-48" y="-20" width="15" height="11" rx="1" fill="#a87c40" stroke="#7a5a2e" strokeWidth="1.1" />
                    <rect x="-32" y="-24" width="15" height="15" rx="1" fill="#b98b4a" stroke="#7a5a2e" strokeWidth="1.1" />
                    <rect x="-32" y="-36" width="15" height="12" rx="1" fill="#c99a56" stroke="#7a5a2e" strokeWidth="1.1" />
                    <Worker x={-56} y={-2} s={1} vest="#f0b429" />
                    <Worker x={-20} y={0} s={1} vest="#2f6fed" hat="#f0b429" />
                    <Worker x={26} y={0} s={1} vest="#f0b429" hat="#d9dde3" flip />
                    <Worker x={46} y={0} s={0.95} vest="#2f6fed" hat="#f0b429" flip />
                  </g>

                  {/* dispatch warehouse (station 04) */}
                  <g transform={`translate(${STATIONS[3].x} ${STATIONS[3].y - 10})`}>
                    <ellipse cx="0" cy="0" rx="84" ry="6.5" fill="rgba(0,0,0,0.42)" />
                    <rect x="-58" y="-66" width="116" height="66" fill="url(#plWall)" stroke="#3c4049" strokeWidth="1.4" />
                    <g stroke="#343842" strokeWidth="1" opacity="0.7">
                      <line x1="-58" y1="-48" x2="58" y2="-48" />
                      <line x1="-58" y1="-30" x2="58" y2="-30" />
                    </g>
                    <g fill="#2b2f38">
                      <rect x="-61" y="-66" width="3.5" height="66" />
                      <rect x="57.5" y="-66" width="3.5" height="66" />
                    </g>
                    <rect x="-61" y="-69" width="122" height="4.5" fill="#23262e" />
                    <rect x="-34" y="-77" width="13" height="8" rx="1" fill="#2f333c" />
                    <rect x="22" y="-78" width="16" height="9" rx="1" fill="#2f333c" />
                    <LitWin x={-52} y={-60} w={8} h={10} o={0.7} />
                    <LitWin x={-37} y={-60} w={8} h={10} o={0.9} />
                    <LitWin x={-22} y={-60} w={8} h={10} o={0.55} />
                    <LitWin x={30} y={-60} w={8} h={10} o={0.8} />
                    <LitWin x={45} y={-60} w={8} h={10} o={0.55} />
                    <rect x="-40" y="-46" width="80" height="15" rx="2" fill="#f4f4f1" stroke="#c9ccd3" strokeWidth="1" />
                    <rect x="-40" y="-46" width="80" height="3" fill="#e21b23" />
                    <NegbuyLogoMark x={-36} y={-43.7} width={72} height={10} />
                    <rect x="-18" y="-26" width="36" height="26" fill="#10141d" stroke="#3c4049" strokeWidth="1.2" />
                    <g stroke="#23262e" strokeWidth="1">
                      <line x1="-18" y1="-19" x2="18" y2="-19" />
                      <line x1="-18" y1="-12" x2="18" y2="-12" />
                    </g>
                    <rect x="-52" y="-15" width="14" height="10" rx="1" fill="#b98b4a" stroke="#7a5a2e" strokeWidth="1" />
                    <rect x="-36" y="-18" width="14" height="13" rx="1" fill="#c99a56" stroke="#7a5a2e" strokeWidth="1" />
                    <rect x="26" y="-18" width="14" height="13" rx="1" fill="#a87c40" stroke="#7a5a2e" strokeWidth="1" />
                    <Worker x={-60} y={-2} s={1} vest="#f0b429" hat="#d9dde3" />
                    <Worker x={-40} y={0} s={0.95} vest="#2f6fed" hat="#f0b429" flip />
                  </g>
                </g>
              )}

              {/* road */}
              {mode === "sim" ? (
                <g>
                  <path className="tsShoulder" d={ROAD_D} />
                  <path className="tsAsphalt" ref={pathRef} d={ROAD_D} />
                  <path className="tsAsphaltHi" d={ROAD_D} />
                  <path className="tsDash" d={ROAD_D} />
                </g>
              ) : (
                <g>
                  <path className="tRoadBase" d={ROAD_D} />
                  <path className="tRoad" ref={pathRef} d={ROAD_D} />
                  <path className="tRoadDash" d={ROAD_D} />
                </g>
              )}

              {/* real-world foreground props: power wires, poles, parked cars */}
              {mode === "sim" && (
                <g className="tsProps">
                  <path
                    d={`M ${POLES[0].x} ${POLES[0].y - 56} Q ${(POLES[0].x + POLES[1].x) / 2} ${
                      POLES[0].y - 44
                    } ${POLES[1].x} ${POLES[1].y - 56} M ${POLES[1].x} ${POLES[1].y - 56} Q ${
                      (POLES[1].x + POLES[2].x) / 2
                    } ${POLES[1].y - 38} ${POLES[2].x} ${POLES[2].y - 56}`}
                    fill="none"
                    stroke="#26272d"
                    strokeWidth="1.3"
                    opacity="0.9"
                  />
                  {POLES.map((p, i) => (
                    <PowerPole key={i} x={p.x} y={p.y} />
                  ))}
                  {CARS.map((c, i) => (
                    <g key={i} transform={`translate(${c.x} ${c.y})`}>
                      <rect x="-20" y="-7" width="40" height="12" rx="6" fill="#3d3023" opacity="0.75" />
                      <Car flip={c.flip} color={c.color} />
                    </g>
                  ))}
                </g>
              )}

              {/* loading bay (station 04) */}
              <g className="tDock" transform={`translate(${DOCK.x} ${DOCK.y})`}>
                <rect x="-36" y="-4" width="70" height="6" rx="2" fill="#242429" stroke="#3a3a40" strokeWidth="1" />
                <rect x="-30" y="-24" width="20" height="20" rx="2" fill="#b98b4a" stroke="#7a5a2e" strokeWidth="1.4" />
                <rect x="-9" y="-20" width="18" height="16" rx="2" fill="#c99a56" stroke="#7a5a2e" strokeWidth="1.4" />
                <rect x="-28" y="-40" width="16" height="16" rx="2" fill="#a87c40" stroke="#7a5a2e" strokeWidth="1.4" />
                {/* forklift */}
                <g transform="translate(24 0)">
                  <rect x="0" y="-13" width="15" height="11" rx="2" fill="#f0b429" stroke="#a97e12" strokeWidth="1" />
                  <rect x="2" y="-17" width="8" height="5" rx="1" fill="#2a2a30" />
                  <rect x="15" y="-24" width="2.6" height="24" fill="#3a3a40" />
                  <rect x="17.6" y="-4" width="10" height="2.6" fill="#3a3a40" />
                  <circle cx="3.5" cy="0" r="3.4" fill="#0c0c0e" stroke="#2c2c33" />
                  <circle cx="11.5" cy="0" r="3.4" fill="#0c0c0e" stroke="#2c2c33" />
                </g>
                {/* dock crew (real world only) */}
                {mode === "sim" && (
                  <>
                    <Worker x={-46} y={-3} s={0.95} vest="#f0b429" />
                    <Worker x={16} y={-3} s={0.95} vest="#2f6fed" hat="#f0b429" flip />
                  </>
                )}
              </g>

              {/* start depot */}
              <circle
                className="tStartPulse"
                cx={START.x}
                cy={START.y}
                r="20"
              />
              {mode === "sim" ? (
                <g
                  className="tDepot now"
                  ref={depotRef}
                  transform={`translate(${START.x} ${START.y})`}
                >
                  {/* chimney + drifting smoke */}
                  <rect x="30" y="-104" width="11" height="50" fill="#33363f" stroke="#3c4049" strokeWidth="1" />
                  <rect x="29" y="-104" width="13" height="4.5" rx="1" fill="#e21b23" />
                  <rect x="29" y="-93" width="13" height="3" rx="1" fill="#e21b23" opacity="0.8" />
                  <ellipse className="tSmoke d1" cx="35" cy="-110" rx="6.5" ry="4.8" fill="url(#plSmoke)" />
                  <ellipse className="tSmoke d2" cx="39" cy="-118" rx="8.5" ry="5.8" fill="url(#plSmoke)" />
                  <ellipse className="tSmoke d3" cx="33" cy="-126" rx="11" ry="7" fill="url(#plSmoke)" />
                  <ellipse cx="0" cy="0" rx="92" ry="7.5" fill="rgba(0,0,0,0.45)" />
                  {/* main hall */}
                  <rect x="-58" y="-62" width="110" height="62" fill="url(#plWall)" stroke="#3c4049" strokeWidth="1.5" />
                  <g stroke="#343842" strokeWidth="1" opacity="0.75">
                    <line x1="-58" y1="-46" x2="52" y2="-46" />
                  </g>
                  <g fill="#2b2f38">
                    <rect x="-62" y="-62" width="4" height="62" />
                    <rect x="56" y="-62" width="4" height="62" />
                  </g>
                  <rect x="-62" y="-65" width="120" height="4.5" fill="#23262e" />
                  {/* sawtooth roof */}
                  <path
                    d="M -58 -62 L -47 -74 L -34 -62 L -23 -74 L -10 -62 L 1 -74 L 14 -62 L 25 -74 L 38 -62 L 49 -74 L 58 -64 Z"
                    fill="#23262e"
                    stroke="#3c4049"
                    strokeWidth="1.1"
                  />
                  <g fill="#ffd98a" opacity="0.85">
                    <rect x="-40" y="-62" width="4" height="9" />
                    <rect x="-16" y="-62" width="4" height="9" />
                    <rect x="8" y="-62" width="4" height="9" />
                    <rect x="32" y="-62" width="4" height="9" />
                  </g>
                  <LitWin x={-50} y={-58} w={10} h={12} o={0.9} />
                  <LitWin x={-36} y={-58} w={10} h={12} o={0.55} />
                  <LitWin x={-22} y={-58} w={10} h={12} o={0.9} />
                  <LitWin x={-8} y={-58} w={10} h={12} o={0.7} />
                  <rect x="-56" y="-40" width="60" height="14" rx="2" fill="#f4f4f1" stroke="#c9ccd3" strokeWidth="1" />
                  <rect x="-56" y="-40" width="60" height="2.8" fill="#e21b23" />
                  <NegbuyLogoMark x={-52} y={-37.8} width={52} height={10} />
                  <rect x="12" y="-38" width="30" height="38" fill="#10141d" stroke="#3c4049" strokeWidth="1.2" />
                  <g stroke="#23262e" strokeWidth="1">
                    <line x1="12" y1="-30" x2="42" y2="-30" />
                    <line x1="12" y1="-22" x2="42" y2="-22" />
                    <line x1="12" y1="-14" x2="42" y2="-14" />
                  </g>
                  <rect x="14" y="0" width="26" height="4" rx="1" fill="#1a1d23" />
                  <rect x="-54" y="-12" width="16" height="12" rx="1" fill="#a87c40" stroke="#7a5a2e" strokeWidth="1.1" />
                  <rect x="-52" y="-24" width="16" height="12" rx="1" fill="#b98b4a" stroke="#7a5a2e" strokeWidth="1.1" />
                  <Worker x={-38} y={0} s={1} vest="#f0b429" />
                  <Worker x={-18} y={0} s={1} vest="#e21b23" hat="#d9dde3" flip />
                  <Worker x={4} y={0} s={1} vest="#2f6fed" hat="#f0b429" />
                </g>
              ) : (
                <g
                  className="tDepot now"
                  ref={depotRef}
                  transform={`translate(${START.x} ${START.y})`}
                >
                  {/* building */}
                  <rect
                    x="-40"
                    y="-56"
                    width="80"
                    height="56"
                    fill="#262734"
                    stroke="#4a4b58"
                    strokeWidth="1.6"
                  />
                  <rect
                    x="-44"
                    y="-60"
                    width="88"
                    height="6"
                    rx="1"
                    fill="#1b1c24"
                    stroke="#4a4b58"
                    strokeWidth="1.2"
                  />
                  {/* rooftop NEGBUY sign */}
                  <rect x="-30" y="-64" width="3" height="8" fill="#4a4b58" />
                  <rect x="27" y="-64" width="3" height="8" fill="#4a4b58" />
                  <rect
                    x="-37"
                    y="-86"
                    width="74"
                    height="24"
                    rx="2"
                    fill="#f4f4f1"
                    stroke="#c4c4cc"
                    strokeWidth="1.2"
                  />
                  <rect x="-37" y="-86" width="74" height="4" rx="1" fill="#e21b23" />
                  <rect x="-37" y="-66" width="74" height="4" rx="1" fill="#e21b23" opacity="0.85" />
                  <NegbuyLogoMark x={-31} y={-82} width={62} height={16} />
                  {/* windows */}
                  <rect x="-33" y="-50" width="13" height="11" fill="#8fd0ff" opacity="0.8" />
                  <rect x="-6.5" y="-50" width="13" height="11" fill="#8fd0ff" opacity="0.8" />
                  <rect x="20" y="-50" width="13" height="11" fill="#8fd0ff" opacity="0.8" />
                  <rect x="-34" y="-33" width="14" height="11" fill="#8fd0ff" opacity="0.55" />
                  <rect x="20" y="-33" width="14" height="11" fill="#8fd0ff" opacity="0.55" />
                  {/* door + canopy */}
                  <rect
                    x="-11"
                    y="-20"
                    width="22"
                    height="20"
                    fill="#0d0d10"
                    stroke="#4a4b58"
                  />
                  <rect x="-15" y="-23" width="30" height="4" rx="1" fill="#e21b23" />
                </g>
              )}

              {/* checkpoint pins (middle stations) */}
              {STATIONS.map((s, i) =>
                i === 0 || i === STATIONS.length - 1 ? null : (
                  <g
                    key={s.i}
                    ref={(el) => {
                      nodeEls.current[i] = el;
                    }}
                    className="tNode"
                    transform={`translate(${s.x} ${s.y - 30})`}
                  >
                    <path
                      d="M 0 20 L -7 8 L 7 8 Z"
                      fill="#141416"
                      stroke="#3a3a40"
                      strokeWidth="1.5"
                    />
                    <circle className="tPin" cx="0" cy="0" r="11" />
                    <text className="tNo" x="0" y="3.5" textAnchor="middle">
                      {PSTAGES[i].no}
                    </text>
                    <text className="tLbl" x="0" y="-22" textAnchor="middle">
                      {PSTAGES[i].short}
                    </text>
                    <g className="tCheck">
                      <circle cx="9" cy="-9" r="6.5" fill="#1f9d55" />
                      <path
                        d="M 6 -9 l2.2 2.4 4 -4.4"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  </g>
                )
              )}

              {/* client site (delivery destination) */}
              <g
                className="tClient"
                ref={flagRef}
                transform={`translate(${END.x} ${END.y})`}
              >
                <rect
                  x="-42"
                  y="-58"
                  width="84"
                  height="58"
                  fill="#232a2e"
                  stroke="#3f4a50"
                  strokeWidth="1.6"
                />
                <rect
                  x="-46"
                  y="-62"
                  width="92"
                  height="6"
                  rx="1"
                  fill="#1a1f22"
                  stroke="#3f4a50"
                  strokeWidth="1.2"
                />
                {/* rooftop sign — client */}
                <rect x="-32" y="-64" width="3" height="6" fill="#3f4a50" />
                <rect x="29" y="-64" width="3" height="6" fill="#3f4a50" />
                <rect
                  x="-41"
                  y="-87"
                  width="82"
                  height="24"
                  rx="2"
                  fill="#eef1f4"
                  stroke="#c7ccd2"
                  strokeWidth="1.2"
                />
                <rect x="-41" y="-87" width="82" height="4" rx="1" fill="#1f9d55" />
                <text
                  x="0"
                  y="-70.5"
                  textAnchor="middle"
                  fontSize="11.5"
                  fontWeight="900"
                  letterSpacing="0.8"
                  fill="#141416"
                >
                  YOUR PLACE
                </text>
                <text
                  x="0"
                  y="-94"
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="800"
                  letterSpacing="1.6"
                  fill="#7fd6a2"
                >
                  CLIENT SITE
                </text>
                {/* windows */}
                <rect x="-34" y="-52" width="13" height="11" fill="#8fd0ff" opacity="0.7" />
                <rect x="-6.5" y="-52" width="13" height="11" fill="#8fd0ff" opacity="0.7" />
                <rect x="21" y="-52" width="13" height="11" fill="#8fd0ff" opacity="0.7" />
                <rect x="-35" y="-34" width="14" height="11" fill="#8fd0ff" opacity="0.5" />
                <rect x="21" y="-34" width="14" height="11" fill="#8fd0ff" opacity="0.5" />
                {/* door + awning */}
                <rect
                  x="-11"
                  y="-20"
                  width="22"
                  height="20"
                  fill="#0d0d10"
                  stroke="#3f4a50"
                />
                <rect x="-15" y="-23" width="30" height="4" rx="1" fill="#1f9d55" />
              </g>

              {/* delivered stamp */}
              <g className="tDeliveredBadge" ref={badgeRef}>
                <circle cx={END.x - 82} cy={END.y - 48} r="11" fill="#1f9d55" />
                <path
                  d={`M ${END.x - 88} ${END.y - 48} l4 4 8 -8`}
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>

              {/* delivered crates */}
              <g transform={`translate(${END.x - 92} ${END.y - 2})`}>
                <g className="tDrop" ref={dropRef}>
                  <rect
                    x="0"
                    y="-18"
                    width="22"
                    height="18"
                    rx="2"
                    fill="#b98b4a"
                    stroke="#7a5a2e"
                    strokeWidth="1.4"
                  />
                  <rect
                    x="23"
                    y="-14"
                    width="18"
                    height="14"
                    rx="2"
                    fill="#c99a56"
                    stroke="#7a5a2e"
                    strokeWidth="1.4"
                  />
                  <rect
                    x="4"
                    y="-33"
                    width="18"
                    height="15"
                    rx="2"
                    fill="#a87c40"
                    stroke="#7a5a2e"
                    strokeWidth="1.4"
                  />
                </g>
              </g>

              {/* NEGBUY truck */}
              <g
                className="tTruck"
                ref={truckRef}
                transform={`translate(${START.x} ${START.y})`}
              >
                <g transform="translate(0 -16)">
                  <ellipse cx="0" cy="20" rx="66" ry="7" fill="rgba(0,0,0,0.45)" />

                  {/* ===== chassis (container sits on this, wheels hang below) ===== */}
                  <rect x="-60" y="-4" width="122" height="7" rx="2" fill="#17171c" />
                  {/* rear bumper + tail light + number plate */}
                  <rect x="-63" y="-2" width="6" height="9" rx="1.5" fill="#0c0c10" />
                  <rect x="-60" y="-9" width="3" height="7" rx="1" fill="#e21b23" />
                  <rect x="-61" y="8" width="6" height="4" rx="1" fill="#c9cdd4" opacity="0.85" />
                  {/* under-frame: fuel tank + battery box (visible between the wheels) */}
                  <rect x="-24" y="2" width="26" height="9" rx="3" fill="#24242e" stroke="#32323e" strokeWidth="0.8" />
                  <rect x="-20" y="1.4" width="2" height="10.4" fill="#141419" />
                  <rect x="6" y="2" width="14" height="8" rx="2" fill="#1e1e28" stroke="#2c2c38" strokeWidth="0.7" />

                  {/* ===== cargo container (mounted on the chassis) ===== */}
                  <rect
                    x="-58"
                    y="-34"
                    width="72"
                    height="30"
                    rx="2.5"
                    fill="url(#plBody)"
                    stroke="#c3c8d0"
                    strokeWidth="1.1"
                  />
                  <rect x="-58" y="-34" width="72" height="3" rx="1.5" fill="#e21b23" />
                  <rect x="-58" y="-7" width="72" height="3" fill="#c3c8d0" opacity="0.7" />
                  <NegbuyLogoMark x={-54} y={-29.5} width={64} height={20} />
                  {/* stake posts */}
                  <rect x="-58" y="-38" width="3" height="5" fill="#9aa0aa" />
                  <rect x="-30" y="-38" width="3" height="5" fill="#9aa0aa" />
                  <rect x="-2" y="-38" width="3" height="5" fill="#9aa0aa" />

                  {/* headboard behind the cab */}
                  <rect
                    x="9"
                    y="-56"
                    width="6"
                    height="52"
                    rx="1.5"
                    fill="url(#plBody)"
                    stroke="#c3c8d0"
                    strokeWidth="1"
                  />
                  <rect x="9" y="-56" width="6" height="3" fill="#e21b23" />

                  {/* ===== cab (bottom aligned with the container floor) ===== */}
                  <path
                    d="M 14 -4 L 14 -50 Q 14 -55 20 -55 L 36 -55 Q 43 -55 46 -50 L 53 -36 Q 56 -31 56 -25 L 56 -4 Z"
                    fill="url(#plCab)"
                    stroke="#3d3d49"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M 20 -55 L 36 -55 Q 43 -55 46 -50 L 47 -48 L 19 -48 Z"
                    fill="#34343f"
                    opacity="0.8"
                  />
                  <rect x="34" y="-55" width="17" height="3.4" rx="1.2" fill="#0f0f14" />
                  <path d="M 39 -51 L 46 -49 L 52 -35 L 38 -35 Z" fill="#8fd0ff" opacity="0.9" />
                  <rect x="19" y="-51" width="15" height="13" rx="1.2" fill="#8fd0ff" opacity="0.9" />
                  <path d="M 20 -50 L 25 -50 L 21 -39 L 20 -39 Z" fill="#ffffff" opacity="0.22" />
                  <rect x="14.6" y="-37" width="41" height="3.6" rx="1.2" fill="#e21b23" />
                  <path d="M 18 -49 L 18 -4" stroke="#3d3d49" strokeWidth="1" />
                  <rect x="28" y="-35.4" width="7" height="2" rx="1" fill="#d7dbe1" />
                  {/* side mirror */}
                  <rect x="52" y="-52" width="1.8" height="13" rx="0.9" fill="#0f0f14" />
                  <rect x="49" y="-54" width="7" height="5" rx="1.4" fill="#0f0f14" stroke="#3d3d49" strokeWidth="0.8" />
                  {/* side step */}
                  <rect x="15" y="-4" width="12" height="7" rx="2" fill="#20202a" stroke="#2f2f3a" strokeWidth="0.8" />
                  {/* grille */}
                  <rect x="52" y="-26" width="4.4" height="10" rx="1.2" fill="#0c0c10" />
                  <line x1="52.7" y1="-24" x2="55.7" y2="-24" stroke="#3a3a46" strokeWidth="0.7" />
                  <line x1="52.7" y1="-22" x2="55.7" y2="-22" stroke="#3a3a46" strokeWidth="0.7" />
                  <line x1="52.7" y1="-20" x2="55.7" y2="-20" stroke="#3a3a46" strokeWidth="0.7" />
                  <line x1="52.7" y1="-18" x2="55.7" y2="-18" stroke="#3a3a46" strokeWidth="0.7" />
                  {/* front bumper */}
                  <rect x="47" y="-6" width="13" height="6" rx="1.6" fill="#0c0c10" />
                  <rect x="48" y="-5" width="11" height="1.6" rx="0.8" fill="#3a3a46" />
                  {/* headlight: lit lamp + forward beam */}
                  <polygon points="56 -14.5 56 -8.5 92 -22 92 -2" fill="url(#plBeam)" />
                  <circle cx="56.5" cy="-11.5" r="6.5" fill="url(#plHeadGlow)" />
                  <rect x="51.6" y="-14.5" width="4.8" height="6" rx="1.6" fill="#fff6d0" />
                  <rect x="52.4" y="-13.8" width="2.8" height="2.6" rx="1" fill="#fffdf4" />

                  {/* load crates (appear after loading) */}
                  <g ref={crateRef} className="tLoad">
                    <rect
                      x="-52"
                      y="-56"
                      width="22"
                      height="22"
                      rx="2"
                      fill="#b98b4a"
                      stroke="#7a5a2e"
                      strokeWidth="1.4"
                    />
                    <path
                      d="M -52 -45 L -30 -45 M -41 -56 L -41 -34"
                      stroke="#7a5a2e"
                      strokeWidth="1.1"
                    />
                    <rect
                      x="-28"
                      y="-50"
                      width="20"
                      height="16"
                      rx="2"
                      fill="#c99a56"
                      stroke="#7a5a2e"
                      strokeWidth="1.4"
                    />
                    <path
                      d="M -28 -42 L -8 -42 M -18 -50 L -18 -34"
                      stroke="#7a5a2e"
                      strokeWidth="1.1"
                    />
                    <rect
                      x="-50"
                      y="-72"
                      width="18"
                      height="16"
                      rx="2"
                      fill="#a87c40"
                      stroke="#7a5a2e"
                      strokeWidth="1.4"
                    />
                    <path
                      d="M -50 -64 L -32 -64 M -41 -72 L -41 -56"
                      stroke="#7a5a2e"
                      strokeWidth="1.1"
                    />
                  </g>

                  {/* mud flaps */}
                  <rect x="-48" y="12" width="13" height="4" rx="1" fill="#141419" />
                  <rect x="19" y="12" width="13" height="4" rx="1" fill="#141419" />

                  {/* wheels (below the container, on the chassis) */}
                  <g ref={wheelBRef}>
                    <TruckWheel cx={-34} cy={6.4} />
                  </g>
                  <g ref={wheelARef}>
                    <TruckWheel cx={32} cy={6.4} />
                  </g>
                </g>
              </g>
            </svg>
          </div>
        </div>

        <div className="processProgress">
          <span>SCROLL TO SHIP IT</span>
          <div className="processProgressTrack">
            <div className="processProgressFill" ref={progressRef} />
          </div>
          <span className="processProgressPct" ref={pctRef}>
            0%
          </span>
        </div>
      </div>
    </section>
  );
}