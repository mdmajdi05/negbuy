"use client";

import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ *
 * 01.8 — the working bay, rebuilt as a baked 360° spin.
 *
 * The live bay used to ray-march 13 GLBs through three.js: ~2.9 MB of
 * models, ~1.5 MB of library and a PMREM/shadow warm-up before the first
 * pixel. This viewer throws all of that away and paints pre-rendered WebP
 * frames baked from that exact scene — same hall, same lights, same camera.
 * A frame shows the moment one image lands and a drag only swaps frames:
 * no WebGL, no library, no per-frame work on the main thread.
 *
 * Frames live in /models/factory-spin/{d|m}/s{bay}/{index}.webp, where `d`
 * is the desktop set (36 steps) and `m` the phone set (24 steps). Pick a
 * station and the shot cuts to that bay's orbit — the camera walk, kept.
 *
 * The station tags are still true 3D: the same camera maths that baked the
 * frames is replayed here, so a dot sits exactly over its spot in the hall
 * and slides across as the reader spins.
 * ------------------------------------------------------------------ */

const BASE = "/models/factory-spin";
const FOV = 38;
const BAY_Z = -2.4;

interface Station {
  label: string;
  pos: [number, number, number];
}

const STATIONS: Station[] = [
  { label: "01 · Rotor assembly", pos: [0.15, 2.25, BAY_Z] },
  { label: "02 · Weld + QC", pos: [-2.75, 2.0, -1.2] },
  { label: "03 · Oil + test", pos: [6.1, 1.5, -3.4] },
  { label: "04 · Dispatch", pos: [3.5, 2.35, -4.2] },
];

/** where the shot looks from, per station — mirrors the old camera dolly */
const BAY_FOCUS: [number, number, number][] = [
  [0.05, 1.2, BAY_Z],
  [-2.5, 1.05, -1.45],
  [5.1, 0.95, -3.3],
  [3.3, 1.05, -4.1],
];
const BAY_DIST = [12.9, 11.2, 10.8, 10.4];

/* The old bay's opening shot: the angle the live camera sat at, so the first
   baked frame drops the reader into the same seat. Polar angle is fixed for
   the whole spin — only the azimuth moves, exactly as the capture swept it. */
const HOME_POS = [7.8, 6.6, 6.4] as const;
const LOOK_AT = [0.1, 1.15, BAY_Z] as const;
const HDX = HOME_POS[0] - LOOK_AT[0];
const HDY = HOME_POS[1] - LOOK_AT[1];
const HDZ = HOME_POS[2] - LOOK_AT[2];
const HLEN = Math.hypot(HDX, HDY, HDZ);
const SIN_PHI = Math.hypot(HDX, HDZ) / HLEN;
const COS_PHI = HDY / HLEN;
const HOME_ANGLE = (((Math.atan2(HDX, HDZ) / (Math.PI * 2)) % 1) + 1) % 1;

const SETS = {
  d: { dir: "d", count: 36 },
  m: { dir: "m", count: 24 },
} as const;
type SetKey = keyof typeof SETS;

/** one turn per this many seconds under Auto-spin */
const AUTO_SPEED = 1 / 14;

/** where the camera sits for a station at a normalised spin angle (0..1) */
const camAt = (b: number, angle: number): [number, number, number] => {
  const t = BAY_FOCUS[b];
  const r = BAY_DIST[b];
  const th = angle * Math.PI * 2;
  return [
    t[0] + r * SIN_PHI * Math.sin(th),
    t[1] + r * COS_PHI,
    t[2] + r * SIN_PHI * Math.cos(th),
  ];
};

/** pinhole projection — the capture's own maths, so tags land where they should */
const project = (
  p: readonly [number, number, number],
  cam: readonly [number, number, number],
  target: readonly [number, number, number],
  aspect: number,
  w: number,
  h: number
): { x: number; y: number } | null => {
  let fx = target[0] - cam[0];
  let fy = target[1] - cam[1];
  let fz = target[2] - cam[2];
  const fl = Math.hypot(fx, fy, fz) || 1;
  fx /= fl;
  fy /= fl;
  fz /= fl;

  const rl = Math.hypot(fz, fx) || 1; // right = normalise(cross(fwd, up))
  const rx = -fz / rl;
  const rz = fx / rl;

  const ux = -rz * fy; // up' = cross(right, fwd)
  const uy = rz * fx - rx * fz;
  const uz = rx * fy;

  const dx = p[0] - cam[0];
  const dy = p[1] - cam[1];
  const dz = p[2] - cam[2];

  const cz = dx * fx + dy * fy + dz * fz;
  if (cz <= 0.08) return null;

  const cx = dx * rx + dz * rz;
  const cy = dx * ux + dy * uy + dz * uz;

  const f = 1 / Math.tan((FOV * Math.PI) / 360);
  const ndcX = (f / aspect) * (cx / cz);
  const ndcY = f * (cy / cz);
  return { x: (ndcX * 0.5 + 0.5) * w, y: (-ndcY * 0.5 + 0.5) * h };
};

const pad3 = (n: number) => String(n).padStart(3, "0");

export default function FactorySpin({
  bay,
  onPick,
}: {
  /** active station, owned by the section — the shot cuts to its orbit */
  bay: number;
  onPick: (i: number) => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const labelRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /** live viewer state the draw loop reads without re-rendering React */
  const stateRef = useRef({ angle: HOME_ANGLE, bay: 0, auto: false, ready: false });
  const modeRef = useRef<SetKey>("d");
  /** frame cache + per-set loaded counters, keyed `${mode}:${bay}` */
  const cacheRef = useRef(new Map<string, (HTMLImageElement | undefined)[]>());
  const loadedRef = useRef(new Map<string, Set<number>>());
  const apiRef = useRef<{ activate: () => void; resize: () => void; reset: () => void } | null>(null);

  const [near, setNear] = useState(false);
  const [mode, setMode] = useState<SetKey>("d");
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [auto, setAuto] = useState(false);
  const [loadedN, setLoadedN] = useState(0);

  /* ---- 1. which frame set fits this screen ----------------------------- */
  useEffect(() => {
    const pick = () => {
      const next: SetKey = window.innerWidth < 820 ? "m" : "d";
      if (next !== modeRef.current) modeRef.current = next;
      setMode(next);
    };
    pick();
    window.addEventListener("resize", pick);
    return () => window.removeEventListener("resize", pick);
  }, []);

  /* ---- 2. only wake the bay when the section gets close ---------------- */
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      const t = window.setTimeout(() => setNear(true), 0);
      return () => window.clearTimeout(t);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* ---- 3. station switch (and set change) re-points the viewer --------- */
  useEffect(() => {
    stateRef.current.bay = Math.max(0, Math.min(STATIONS.length - 1, bay));
    apiRef.current?.resize();
    apiRef.current?.activate();
  }, [bay, mode]);

  /* ---- 4. auto-spin follows the toggle --------------------------------- */
  useEffect(() => {
    stateRef.current.auto = auto;
    apiRef.current?.activate(); // schedule() lives inside activate's paint path
  }, [auto]);

  /* ---- 5. build the viewer: canvas, drag, progressive frame loader ----- */
  useEffect(() => {
    if (!near) return;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setFailed(true);
      return;
    }

    let disposed = false;
    let raf = 0;
    let last = 0;
    let dragging = false;
    let dragX = 0;

    const size = { w: 1, h: 1, dpr: 1 };

    /* --- draw one frame, cover-fit, then park the station tags --- */
    const draw = () => {
      const b = stateRef.current.bay;
      const set = SETS[modeRef.current];
      const idx = ((Math.round(stateRef.current.angle * set.count) % set.count) + set.count) % set.count;
      const img = cacheRef.current.get(`${modeRef.current}:${b}`)?.[idx];

      if (img && img.complete && img.naturalWidth) {
        const cw = canvas.width;
        const ch = canvas.height;
        const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      }

      const cam = camAt(b, stateRef.current.angle);
      const target = BAY_FOCUS[b];
      const aspect = size.w / size.h;
      for (let i = 0; i < STATIONS.length; i++) {
        const el = labelRefs.current[i];
        if (!el) continue;
        const s = project(STATIONS[i].pos, cam, target, aspect, size.w, size.h);
        if (!s) {
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
          continue;
        }
        const px = Math.min(size.w - 74, Math.max(74, s.x));
        const py = Math.min(size.h - 26, Math.max(26, s.y));
        el.style.opacity = "1";
        el.style.pointerEvents = "auto";
        el.style.transform = `translate(-50%, -50%) translate(${px}px, ${py}px)`;
        el.classList.toggle("on", i === b);
      }
    };

    const tick = () => {
      raf = 0;
      const now = performance.now();
      const dt = last ? Math.min(0.064, (now - last) / 1000) : 0;
      last = now;
      if (stateRef.current.auto && !dragging) {
        stateRef.current.angle = (stateRef.current.angle + dt * AUTO_SPEED) % 1;
      }
      draw();
      if (stateRef.current.auto && !dragging) schedule();
    };

    const schedule = () => {
      if (disposed || raf) return;
      raf = requestAnimationFrame(tick);
    };

    /* --- progressive loader: first frame out, the rest streaming behind --- */
    const loadSet = (key: string, b: number, setKey: SetKey) => {
      if (cacheRef.current.has(key)) return;
      const set = SETS[setKey];
      const arr: (HTMLImageElement | undefined)[] = new Array(set.count);
      cacheRef.current.set(key, arr);
      if (!loadedRef.current.has(key)) loadedRef.current.set(key, new Set());

      const home = ((Math.round(HOME_ANGLE * set.count) % set.count) + set.count) % set.count;
      const dist = (i: number) => {
        const d = Math.abs(i - home);
        return Math.min(d, set.count - d);
      };
      const order = Array.from({ length: set.count }, (_, i) => i).sort((p, q) => dist(p) - dist(q));

      const settled = (k: number, broken: boolean) => {
        if (disposed) return;
        loadedRef.current.get(key)?.add(k);
        const live = key === `${modeRef.current}:${stateRef.current.bay}`;
        if (live) {
          setLoadedN(loadedRef.current.get(key)?.size ?? 0);
          if (k === home) {
            if (broken) setFailed(true);
            else {
              stateRef.current.ready = true;
              setReady(true);
            }
          }
          const idx = ((Math.round(stateRef.current.angle * set.count) % set.count) + set.count) % set.count;
          if (k === idx) schedule();
        }
      };

      let i = 0;
      const CONC = 6;
      const pump = () => {
        if (disposed) return;
        const k = order[i++];
        if (k === undefined) return;
        const img = new Image();
        img.decoding = "async";
        arr[k] = img;
        img.onload = () => {
          settled(k, false);
          pump();
        };
        img.onerror = () => {
          settled(k, true);
          pump();
        };
        img.src = `${BASE}/${set.dir}/s${b}/${pad3(k)}.webp`;
      };
      for (let c = 0; c < CONC; c++) pump();
    };

    /* --- (re)point the viewer at the active station --- */
    const activate = () => {
      const b = stateRef.current.bay;
      const setKey = modeRef.current;
      const set = SETS[setKey];
      const key = `${setKey}:${b}`;

      const home = ((Math.round(HOME_ANGLE * set.count) % set.count) + set.count) % set.count;
      const frames = cacheRef.current.get(key);
      const homeReady = !!(frames?.[home]?.complete && frames[home]?.naturalWidth);
      stateRef.current.ready = homeReady;
      setReady(homeReady);
      setLoadedN(loadedRef.current.get(key)?.size ?? 0);

      loadSet(key, b, setKey);
      schedule();
    };

    const resize = () => {
      const w = stage.clientWidth || 1;
      const h = stage.clientHeight || 1;
      const dpr = Math.min(window.devicePixelRatio || 1, modeRef.current === "m" ? 1 : 1.25);
      size.w = w;
      size.h = h;
      size.dpr = dpr;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.imageSmoothingEnabled = true;
      schedule();
    };

    /* --- drag to spin --- */
    const onDown = (e: PointerEvent) => {
      dragging = true;
      last = 0;
      dragX = e.clientX;
      stage.classList.add("dragging");
      try {
        stage.setPointerCapture(e.pointerId);
      } catch {
        /* capture is a nicety, not a requirement */
      }
      schedule();
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - dragX;
      dragX = e.clientX;
      const w = size.w || 1;
      stateRef.current.angle = ((((stateRef.current.angle - dx / w) % 1) + 1) % 1);
      schedule();
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove("dragging");
      try {
        stage.releasePointerCapture(e.pointerId);
      } catch {
        /* already gone */
      }
      schedule();
    };

    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onUp);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(resize);
      observer.observe(stage);
    }
    window.addEventListener("resize", resize);

    apiRef.current = {
      activate,
      resize,
      reset: () => {
        stateRef.current.angle = HOME_ANGLE;
        schedule();
      },
    };

    resize();
    activate();

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
      apiRef.current = null;
      cacheRef.current.clear();
      loadedRef.current.clear();
    };
  }, [near]);

  const frameTotal = SETS[mode].count;

  return (
    <div className="f3d" ref={hostRef}>
      <div
        className="f3dStage"
        ref={stageRef}
        style={{ touchAction: "pan-y" }}
        aria-label="360 degree view of the NEGBUY factory floor"
      >
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
      </div>

      {!ready && !failed && (
        <div className="f3dLoad">
          <span className="f3dSpin" aria-hidden="true" />
          <b>Walking the factory floor</b>
          <span>{loadedN > 0 ? `${loadedN} / ${frameTotal} frames` : "loading frames…"}</span>
        </div>
      )}
      {ready && !failed && loadedN < frameTotal && (
        <span className="f3dStamp" aria-hidden="true">
          Frames {loadedN}/{frameTotal}
        </span>
      )}
      {failed && (
        <div className="f3dLoad">
          <b>360° view unavailable</b>
          <span>Reload the page to stream the factory frames again.</span>
        </div>
      )}

      <span className="f3dLive" aria-hidden="true">
        <i />
        360° view
      </span>

      {STATIONS.map((s, i) => (
        <button
          key={s.label}
          type="button"
          ref={(el) => {
            labelRefs.current[i] = el;
          }}
          className="f3dStation"
          style={{ opacity: 0 }}
          onClick={() => onPick(i)}
        >
          <span className="f3dDot" />
          <span className="f3dTag">{s.label}</span>
        </button>
      ))}

      <div className="f3dBar">
        <span className="f3dHint">Drag to spin</span>
        <div className="f3dCtrls">
          <button
            type="button"
            className={`f3dBtn${auto ? " on" : ""}`}
            aria-pressed={auto}
            onClick={() => setAuto((v) => !v)}
          >
            Auto-spin
          </button>
          <button type="button" className="f3dBtn" onClick={() => apiRef.current?.reset()}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
