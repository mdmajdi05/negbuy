"use client";

import { useEffect, useRef, useState } from "react";
import type {
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import type { OrbitControls as OrbitControlsImpl } from "three/examples/jsm/controls/OrbitControls.js";

/* ------------------------------------------------------------------ *
 * Real 3D working area.
 *
 * Nine CC0 (public-domain) models from Poly Haven are assembled into a
 * NEGBUY service bay: roller-shutter doors, a steel shelving unit, two
 * tool carts, an industrial storage cart, a portable generator, drums,
 * crates and a wet-floor sign — all light (512 px WebP + meshopt) and
 * lazy-loaded only when the section approaches the viewport.
 * ------------------------------------------------------------------ */

const BASE = "/models/factory";

interface Place {
  file: string;
  /** target height in metres — set only when the source model needs rescaling */
  height?: number;
  pos: [number, number, number];
  ry?: number;
  /** child nodes to drop from the model (e.g. a stray graffiti panel) */
  drop?: string[];
  copies?: { pos: [number, number, number]; ry?: number }[];
}

const PLAN: Place[] = [
  // --- back wall: two roller-shutter bays -------------------------------
  { file: "shutter_door.glb", pos: [-4.0, 0, -4.9], ry: 0, drop: ["rollershutter_door_graffiti"] },
  { file: "shutter_door.glb", pos: [-2.55, 0, -4.9], ry: 0, drop: ["rollershutter_door_graffiti"] },
  // --- left bay: shelving ----------------------------------------------
  { file: "steel_shelves.glb", pos: [-6.1, 0, -3.85], ry: 0.26 },
  // --- centre: the bench the work happens on ---------------------------
  { file: "tool_cart.glb", pos: [-1.45, 0, -2.15], ry: 0.52 },
  // --- right: storage + power ------------------------------------------
  { file: "storage_cart.glb", pos: [2.7, 0, -3.85], ry: -0.34 },
  { file: "generator.glb", pos: [5.7, 0, -3.8], ry: -0.52 },
  // --- drums ------------------------------------------------------------
  {
    file: "barrel.glb",
    pos: [-0.25, 0, -4.3],
    ry: 0.4,
    copies: [
      { pos: [0.42, 0, -4.6], ry: 1.15 },
      { pos: [3.7, 0, -2.45], ry: -0.3 },
    ],
  },
  // --- crates (one stacked) --------------------------------------------
  {
    file: "crate.glb",
    pos: [1.05, 0, -2.6],
    ry: -0.22,
    copies: [
      { pos: [1.12, 0.254, -2.66], ry: 0.34 },
      { pos: [4.5, 0, -3.15], ry: 0.92 },
    ],
  },
  // --- detail -----------------------------------------------------------
  { file: "wet_floor_sign.glb", pos: [1.35, 0, -0.55], ry: 0.16 },
];

interface Station {
  label: string;
  pos: [number, number, number];
}

const STATIONS: Station[] = [
  { label: "01 · Assembly", pos: [-1.45, 1.45, -2.15] },
  { label: "02 · Weld + QC", pos: [-6.1, 2.6, -3.85] },
  { label: "03 · Oil + test", pos: [5.7, 1.05, -3.8] },
  { label: "04 · Dispatch", pos: [2.7, 1.8, -3.85] },
];

const HOME_POS: [number, number, number] = [8.4, 5.4, 6.4];
const LOOK_AT: [number, number, number] = [0.1, 1.0, -3.0];

export default function Factory3D({
  active,
  onPick,
  progress,
}: {
  active: { current: number };
  onPick: (i: number) => void;
  progress?: { current: number };
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const labelRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const apiRef = useRef<{ zoom: (k: number) => void; reset: () => void } | null>(null);
  const autoRef = useRef(true);
  const activeRef = useRef(active);
  const progressRef = useRef(progress);

  const [near, setNear] = useState(false);
  const [auto, setAuto] = useState(true);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState(0);

  useEffect(() => {
    activeRef.current = active;
    progressRef.current = progress;
  }, [active, progress]);

  useEffect(() => {
    autoRef.current = auto;
  }, [auto]);

  /* ---- start loading only when the section gets close ------------------ */
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

  /* ---- build the scene ------------------------------------------------- */
  useEffect(() => {
    if (!near) return;
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let raf = 0;
    let renderer: WebGLRenderer | null = null;
    let scene: Scene | null = null;
    let camera: PerspectiveCamera | null = null;
    let controls: OrbitControlsImpl | null = null;
    let observer: ResizeObserver | null = null;
    let teardown: (() => void) | null = null;
    /** user zoom multiplier applied on top of the scroll-driven camera dolly */
    let zoom = 1;

    (async () => {
      try {
        const THREE = await import("three");
        const [{ GLTFLoader }, { OrbitControls }, { MeshoptDecoder }, { RGBELoader }] =
          await Promise.all([
            import("three/examples/jsm/loaders/GLTFLoader.js"),
            import("three/examples/jsm/controls/OrbitControls.js"),
            import("three/examples/jsm/libs/meshopt_decoder.module.js"),
            import("three/examples/jsm/loaders/RGBELoader.js"),
          ]);
        if (disposed) return;

        /* ---------- renderer ---------- */
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(mount.clientWidth || 1, mount.clientHeight || 1, false);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.06;
        const canvas = renderer.domElement;
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";
        canvas.style.touchAction = "pan-y";
        mount.appendChild(canvas);

        /* ---------- scene / camera ---------- */
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(
          38,
          (mount.clientWidth || 1) / (mount.clientHeight || 1),
          0.1,
          160
        );
        camera.position.set(...HOME_POS);

        controls = new OrbitControls(camera, canvas);
        controls.target.set(...LOOK_AT);
        controls.enableDamping = true;
        controls.dampingFactor = 0.075;
        controls.enablePan = false;
        controls.enableZoom = false; // page scroll stays free over the canvas
        controls.rotateSpeed = 0.7;
        controls.autoRotateSpeed = 0.42;
        controls.minDistance = 6;
        controls.maxDistance = 24;
        controls.minPolarAngle = 0.42;
        controls.maxPolarAngle = 1.36;
        controls.update();
        canvas.style.touchAction = "pan-y";

        /* ---------- studio environment ---------- */
        const pmrem = new THREE.PMREMGenerator(renderer);
        try {
          const hdr = await new RGBELoader().loadAsync("/models/env-studio.hdr");
          if (disposed) return;
          const env = pmrem.fromEquirectangular(hdr);
          scene.environment = env.texture;
          scene.environmentIntensity = 0.55;
          hdr.dispose();
        } catch {
          /* keep the default lighting if the HDR is unavailable */
        }
        pmrem.dispose();

        /* ---------- lights ---------- */
        const key = new THREE.DirectionalLight(0xffffff, 2.1);
        key.position.set(7.5, 11, 5);
        key.castShadow = true;
        key.shadow.mapSize.set(2048, 2048);
        key.shadow.camera.left = -13;
        key.shadow.camera.right = 13;
        key.shadow.camera.top = 13;
        key.shadow.camera.bottom = -13;
        key.shadow.camera.near = 1;
        key.shadow.camera.far = 42;
        key.shadow.bias = -0.0009;
        key.shadow.normalBias = 0.022;
        key.target.position.set(0, 0, -3);
        scene.add(key, key.target);

        const fill = new THREE.DirectionalLight(0xa9bfd8, 0.4);
        fill.position.set(-9, 6, 8);
        scene.add(fill);

        /* ---------- floor + wall ---------- */
        const floor = new THREE.Mesh(
          new THREE.PlaneGeometry(28, 22),
          new THREE.MeshStandardMaterial({ color: 0x14171c, roughness: 0.6, metalness: 0.3 })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(0, 0, -3);
        floor.receiveShadow = true;
        scene.add(floor);

        const grid = new THREE.GridHelper(28, 56, 0x303840, 0x232a33);
        grid.position.set(0, 0.006, -3);
        grid.material.transparent = true;
        grid.material.opacity = 0.55;
        scene.add(grid);

        const wall = new THREE.Mesh(
          new THREE.PlaneGeometry(32, 6.5),
          new THREE.MeshStandardMaterial({ color: 0x0f1216, roughness: 0.95, metalness: 0.04 })
        );
        wall.position.set(0, 3.25, -5.45);
        wall.receiveShadow = true;
        scene.add(wall);

        /* ---------- load the props ---------- */
        const loader = new GLTFLoader();
        loader.setMeshoptDecoder(MeshoptDecoder);

        const ground = (root: Object3D, height?: number) => {
          const box = new THREE.Box3().setFromObject(root);
          if (height) {
            const h = Math.max(1e-6, box.max.y - box.min.y);
            root.scale.multiplyScalar(height / h);
            box.setFromObject(root);
          }
          root.position.x -= (box.min.x + box.max.x) / 2;
          root.position.z -= (box.min.z + box.max.z) / 2;
          root.position.y -= box.min.y;
          const holder = new THREE.Group();
          holder.add(root);
          return holder;
        };

        const cache = new Map<string, Group>();
        let n = 0;

        for (const item of PLAN) {
          let proto = cache.get(item.file);
          if (!proto) {
            const gltf = await loader.loadAsync(`${BASE}/${item.file}`);
            if (disposed) return;
            const root = gltf.scene;
            for (const name of item.drop ?? []) {
              const node = root.getObjectByName(name);
              if (node) node.removeFromParent();
            }
            root.traverse((o) => {
              const m = o as Mesh;
              if (!m.isMesh) return;
              m.castShadow = true;
              m.receiveShadow = true;
              const mat = m.material as MeshStandardMaterial;
              if (mat && "envMapIntensity" in mat) mat.envMapIntensity = 1;
            });
            proto = ground(root, item.height);
            cache.set(item.file, proto);
          }

          const inst = proto.clone(true);
          inst.position.set(...item.pos);
          inst.rotation.y = item.ry ?? 0;
          scene.add(inst);

          for (const c of item.copies ?? []) {
            const cc = proto.clone(true);
            cc.position.set(...c.pos);
            cc.rotation.y = c.ry ?? 0;
            scene.add(cc);
          }

          n += 1;
          if (!disposed) setDone(n);
        }

        if (disposed) return;

        /* ---------- controls exposed to the toolbar ---------- */
        apiRef.current = {
          zoom: (k) => {
            zoom = Math.min(1.9, Math.max(0.55, zoom * k));
          },
          reset: () => {
            if (!camera || !controls) return;
            zoom = 1;
            camera.position.set(...HOME_POS);
            controls.target.set(...LOOK_AT);
            controls.update();
          },
        };

        /* ---------- resize ---------- */
        const resize = () => {
          if (!renderer || !camera) return;
          const w = mount.clientWidth || 1;
          const h = mount.clientHeight || 1;
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        };
        if (typeof ResizeObserver !== "undefined") {
          observer = new ResizeObserver(resize);
          observer.observe(mount);
        }
        window.addEventListener("resize", resize);

        setReady(true);

        /* ---------- loop ---------- */
        const clock = new THREE.Clock();
        const tmp = new THREE.Vector3();
        const dir = new THREE.Vector3();

        const tick = () => {
          raf = requestAnimationFrame(tick);
          if (!renderer || !scene || !camera || !controls) return;
          const dt = Math.min(0.05, clock.getDelta());

          controls.autoRotate = autoRef.current;

          // scroll-linked dolly: the bay pulls closer as the line runs
          const pr = Math.min(1, Math.max(0, progressRef.current?.current ?? 0));
          const want = (13.8 - pr * 2.6) * zoom;
          dir.copy(camera.position).sub(controls.target);
          const cur = dir.length();
          dir.setLength(cur + (want - cur) * Math.min(1, dt * 3));
          camera.position.copy(controls.target).add(dir);

          controls.update();
          renderer.render(scene, camera);

          const w = mount.clientWidth;
          const h = mount.clientHeight;
          const act = activeRef.current?.current ?? 0;
          for (let i = 0; i < STATIONS.length; i++) {
            const el = labelRefs.current[i];
            if (!el) continue;
            const s = STATIONS[i];
            tmp.set(s.pos[0], s.pos[1], s.pos[2]).project(camera);
            const live = tmp.z < 1;
            el.style.opacity = live ? "1" : "0";
            el.style.pointerEvents = live ? "auto" : "none";
            if (live) {
              el.style.transform = `translate(-50%, -50%) translate(${(tmp.x * 0.5 + 0.5) * w}px, ${
                (-tmp.y * 0.5 + 0.5) * h
              }px)`;
            }
            el.classList.toggle("on", i === act);
          }
        };
        tick();

        teardown = () => {
          window.removeEventListener("resize", resize);
          observer?.disconnect();
        };
      } catch {
        if (!disposed) setFailed(true);
      }
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      teardown?.();
      controls?.dispose();
      if (scene) {
        scene.traverse((o) => {
          const m = o as Mesh;
          if (m.isMesh) {
            m.geometry?.dispose();
            const mat = m.material as MeshStandardMaterial | MeshStandardMaterial[];
            if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
            else mat?.dispose();
          }
        });
      }
      if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
      }
    };
  }, [near]);

  return (
    <div className="f3d" ref={hostRef}>
      <div className="f3dStage" ref={mountRef} aria-label="Interactive 3D view of the NEGBUY factory floor" />

      {!ready && !failed && (
        <div className="f3dLoad">
          <span className="f3dSpin" aria-hidden="true" />
          <b>Building the 3D floor</b>
          <span>{done > 0 ? `${done} / ${PLAN.length} stations placed` : "loading models…"}</span>
        </div>
      )}
      {failed && (
        <div className="f3dLoad">
          <b>3D view unavailable</b>
          <span>Switch to the live scene view.</span>
        </div>
      )}

      <span className="f3dLive" aria-hidden="true">
        <i />
        Live 3D floor
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
        <span className="f3dHint">Drag to orbit</span>
        <div className="f3dCtrls">
          <button
            type="button"
            className={`f3dBtn${auto ? " on" : ""}`}
            aria-pressed={auto}
            onClick={() => setAuto((v) => !v)}
          >
            Auto-spin
          </button>
          <span className="f3dZoom">
            <button type="button" aria-label="Zoom out" onClick={() => apiRef.current?.zoom(1.16)}>
              −
            </button>
            <button type="button" aria-label="Zoom in" onClick={() => apiRef.current?.zoom(0.86)}>
              +
            </button>
          </span>
          <button type="button" className="f3dBtn" onClick={() => apiRef.current?.reset()}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}