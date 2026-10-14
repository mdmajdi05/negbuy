"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ModelViewerElement } from "@google/model-viewer";

/* ------------------------------------------------------------------ *
 * Real, licensed 3D model viewer.
 *
 * The two GLB files in /public/models are CC0 (public domain) models of a
 * real turbofan gas turbine, modelled to published NASA-based dimensions:
 *   1.60 x 1.60 x 3.07 m, seven compressor rotor rows, four turbine rows.
 * Every sub-assembly is a named node, so we place clickable 3D hotspots
 * that drive the spare-parts panel on the right.
 * ------------------------------------------------------------------ */

interface ModelDef {
  id: "ext" | "cut";
  label: string;
  sub: string;
  badge: string;
  src: string;
  spec: [string, string][];
}

/** Tab shown when the section first appears — cutaway by default. */
const DEFAULT_MODEL_ID: ModelDef["id"] = "cut";

const MODELS: ModelDef[] = [
  {
    id: "ext",
    label: "Exterior",
    sub: "Full assembly",
    badge: "Turbofan · 1.60 × 1.60 × 3.07 m",
    src: "/models/turbofan.glb",
    spec: [
      ["Type", "Turbofan"],
      ["Length", "3.07 m"],
      ["Stages", "7C · 4T"],
    ],
  },
  {
    id: "cut",
    label: "Cutaway",
    sub: "Internals exposed",
    badge: "Quarter cutaway · internals exposed",
    src: "/models/turbofan-cutaway.glb",
    spec: [
      ["View", "Quarter cut"],
      ["Compressor", "7 rows"],
      ["Turbine", "4 rows"],
    ],
  },
];

interface Hotspot {
  id: string;
  label: string;
  pos: string;
  normal?: string;
}

/* Positions come from the real node bounding boxes in the GLB. */
const HOTSPOTS: Hotspot[] = [
  { id: "intake", label: "Air Intake", pos: "0 1.15 1.26" },
  { id: "casing", label: "Casing", pos: "0 1.42 0.32" },
  { id: "compressor", label: "Compressor", pos: "0 1.16 0.72" },
  { id: "stator", label: "Stator", pos: "0 1.02 0.46" },
  { id: "combustor", label: "Combustor", pos: "0 1.16 -0.07" },
  { id: "rotor", label: "Rotor / shaft", pos: "0 1.00 0.06" },
  { id: "turbine", label: "Turbine", pos: "0 1.14 -0.70" },
  { id: "exhaust", label: "Exhaust", pos: "0 1.08 -1.30" },
];

/* Minimal JSX typing for the <model-viewer> custom element. */
interface ModelViewerAttributes {
  src?: string;
  alt?: string;
  poster?: string;
  loading?: "auto" | "lazy" | "eager";
  reveal?: "auto" | "manual";
  "camera-controls"?: boolean;
  "touch-action"?: string;
  "disable-zoom"?: boolean;
  "disable-pan"?: boolean;
  "disable-tap"?: boolean;
  "auto-rotate"?: boolean;
  "rotation-per-second"?: string;
  "camera-orbit"?: string;
  "field-of-view"?: string;
  "shadow-intensity"?: string;
  "shadow-softness"?: string;
  "environment-image"?: string;
  exposure?: string;
  "tone-mapping"?: string;
  "interaction-prompt"?: "auto" | "none";
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  ref?: React.Ref<ModelViewerElement>;
}

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerAttributes;
    }
  }
}

export default function Parts3D({
  active,
  onPick,
}: {
  active: string;
  onPick: (id: string) => void;
}) {
  const [model, setModel] = useState(() => {
    const i = MODELS.findIndex((m) => m.id === DEFAULT_MODEL_ID);
    return i < 0 ? 0 : i;
  });
  const [auto, setAuto] = useState(true);
  const [ready, setReady] = useState(false);
  const [near, setNear] = useState(false);
  const ref = useRef<ModelViewerElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);

  // Only pull in the ~1 MB viewer bundle once this section approaches the viewport.
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
      { rootMargin: "500px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Load model-viewer only in the browser, and only once the section is near.
  useEffect(() => {
    if (!near) return;
    let alive = true;
    import("@google/model-viewer").then(() => {
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [near]);

  const resetView = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.cameraOrbit = "90deg 76deg auto";
    el.fieldOfView = "34deg";
  }, []);

  const zoomBy = useCallback((k: number) => {
    const el = ref.current;
    if (!el) return;
    try {
      const o = el.getCameraOrbit();
      const r = Math.min(9, Math.max(1.5, o.radius * k));
      el.cameraOrbit = `${o.theta}rad ${o.phi}rad ${r}m`;
    } catch {
      /* ignore while the model is still loading */
    }
  }, []);

  const m = MODELS[model];

  return (
    <div className="p3d" ref={hostRef}>
      <div className="p3dTop">
        <div className="p3dTabs" role="tablist" aria-label="3D model">
          {MODELS.map((x, i) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={model === i}
              className={model === i ? "on" : ""}
              onClick={() => setModel(i)}
            >
              <b>{x.label}</b>
              <span>{x.sub}</span>
            </button>
          ))}
        </div>
        <span className="p3dBadge">{m.badge}</span>
      </div>

      <div className="p3dViewport">
        <div className="p3dGrid" aria-hidden="true" />
        <span className="p3dLive" aria-hidden="true">
          <i />
          Live 3D
        </span>

        {ready ? (
          <model-viewer
            ref={ref}
            src={m.src}
            alt={`Real 3D model of a gas turbine — ${m.label}`}
            className="p3dMV"
            camera-controls
            touch-action="pan-y"
            disable-zoom
            disable-pan
            auto-rotate={auto}
            rotation-per-second="18deg"
            camera-orbit="90deg 76deg auto"
            field-of-view="34deg"
            shadow-intensity="1.2"
            shadow-softness="0.9"
            environment-image="/models/env-studio.hdr"
            exposure="1"
            tone-mapping="aces"
            interaction-prompt="none"
            loading="eager"
            reveal="auto"
          >
            {HOTSPOTS.map((h) => (
              <button
                key={h.id}
                type="button"
                slot={`hotspot-${h.id}`}
                className={`p3dHot${active === h.id ? " on" : ""}`}
                data-position={h.pos}
                data-normal={h.normal ?? "0 1 0"}
                data-visibility-attribute="data-visible"
                aria-label={`Show ${h.label}`}
                onClick={() => onPick(h.id)}
              >
                <span className="p3dHotDot" />
                <span className="p3dHotLabel">{h.label}</span>
              </button>
            ))}
          </model-viewer>
        ) : (
          <div className="p3dLoad">
            <span className="p3dSpin" aria-hidden="true" />
            Loading 3D model…
          </div>
        )}

        <div className="p3dHint" aria-hidden="true">
          <span className="p3dHintIcon">
            <i />
          </span>
          Drag to rotate
        </div>
      </div>

      <div className="p3dBar">
        <div className="p3dSpec">
          {m.spec.map(([k, v]) => (
            <div key={k}>
              <span>{k}</span>
              <b>{v}</b>
            </div>
          ))}
        </div>

        <div className="p3dCtrls">
          <button
            type="button"
            className={`p3dBtn${auto ? " on" : ""}`}
            aria-pressed={auto}
            onClick={() => setAuto((v) => !v)}
          >
            Auto-spin
          </button>
          <span className="p3dZoom">
            <button type="button" aria-label="Zoom out" onClick={() => zoomBy(1.18)}>
              −
            </button>
            <button type="button" aria-label="Zoom in" onClick={() => zoomBy(0.85)}>
              +
            </button>
          </span>
          <button type="button" className="p3dBtn" onClick={resetView}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
