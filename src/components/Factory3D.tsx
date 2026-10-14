"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  WebGLRenderer,
} from "three";
import type { OrbitControls as OrbitControlsImpl } from "three/examples/jsm/controls/OrbitControls.js";
import { useRafLoop } from "@/hooks/useRafLoop";

/* ------------------------------------------------------------------ *
 * Real 3D working area — the turbine assembly bay.
 *
 * Centre stage: a full gas-turbine engine (CC0, meshopt-compressed)
 * sitting on a steel assembly cradle while a four-person crew works
 * around it. The crew and the hall props are CC0 models too — MakeHuman
 * based workers in real working poses, plus roller-shutter doors,
 * shelving, carts, drums and crates. Everything is light (512 px WebP +
 * meshopt), lazy-loaded only when the section approaches the viewport and
 * landed in phases — engine and crew first, hall dressing behind them.
 *
 * Rendering is strictly on demand: the loop parks the moment the camera stops
 * moving, so a still bay (the default) costs zero frames and the section never
 * competes with the page for the main thread.
 * ------------------------------------------------------------------ */

const BASE = "/models/factory";

/** centre of the assembly bay on the floor */
const BAY_Z = -2.4;
/** how far the turbine underside floats above the floor on its cradle */
const LIFT = 0.27;

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
  /* --- the turbine under assembly, lifted on the cradle --------------- */
  { file: "turbine.glb", pos: [0, LIFT, BAY_Z], ry: Math.PI / 2 },

  /* --- the crew ------------------------------------------------------- */
  // lead fitter, hard hat + hi-vis, working the front of the engine
  { file: "worker-hivis.glb", pos: [0.75, 0, -1.0], ry: Math.PI },
  // sparky up the step ladder, working the far side from above
  { file: "worker-ladder.glb", pos: [-0.75, 0, -4.0], ry: 0 },
  // store man walking a crate in from the loading side
  { file: "worker-crate.glb", pos: [3.05, 0, -1.35], ry: -2.02 },
  // QC lead with the build sheet
  { file: "worker-qc.glb", pos: [-2.75, 0, -1.2], ry: 2.03 },

  /* --- the hall ------------------------------------------------------- */
  { file: "shutter_door.glb", pos: [-4.3, 0, -4.9], drop: ["rollershutter_door_graffiti"] },
  { file: "shutter_door.glb", pos: [-2.85, 0, -4.9], drop: ["rollershutter_door_graffiti"] },
  { file: "steel_shelves.glb", pos: [-6.3, 0, -3.6], ry: 0.26 },
  { file: "tool_cart.glb", pos: [-3.9, 0, -1.6], ry: 0.52 },
  { file: "storage_cart.glb", pos: [3.5, 0, -4.2], ry: -0.34 },
  { file: "generator.glb", pos: [6.1, 0, -3.4], ry: -0.52 },
  {
    file: "barrel.glb",
    pos: [0.9, 0, -4.7],
    ry: 0.4,
    copies: [
      { pos: [1.55, 0, -4.95], ry: 1.15 },
      { pos: [4.85, 0, -2.5], ry: -0.3 },
    ],
  },
  {
    file: "crate.glb",
    pos: [2.0, 0, -0.7],
    ry: -0.22,
    copies: [
      { pos: [2.06, 0.254, -0.76], ry: 0.34 },
      { pos: [5.1, 0, -3.6], ry: 0.92 },
    ],
  },
  { file: "wet_floor_sign.glb", pos: [-1.9, 0, -1.0], ry: 0.16 },
];

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

const HOME_POS: [number, number, number] = [7.8, 6.6, 6.4];
const LOOK_AT: [number, number, number] = [0.1, 1.15, BAY_Z];

/** every distinct model in the plan (13 in all — deduped, loaded once each) */
const FILES = Array.from(new Set(PLAN.map((p) => p.file)));

/**
 * Load order: the engine lands first (0.4 MB — the bay is alive in a blink),
 * then its crew, then the hall dressing streams in behind them. Nothing waits
 * for the last crate before the first frame is drawn.
 */
const PHASES: string[][] = (() => {
  const engine: string[] = FILES.filter((f) => f === "turbine.glb");
  const crew: string[] = FILES.filter((f) => f.startsWith("worker-"));
  const rest = FILES.filter((f) => !engine.includes(f) && !crew.includes(f));
  return [engine, crew, rest];
})();

/** every instance the plan places, copies included — drives the load counter */
const TOTAL_PIECES = PLAN.reduce((n, p) => n + 1 + (p.copies?.length ?? 0), 0);

/** where the camera looks for each station, and how wide that shot sits */
const BAY_FOCUS: [number, number, number][] = [
  [0.05, 1.2, BAY_Z],
  [-2.5, 1.05, -1.45],
  [5.1, 0.95, -3.3],
  [3.3, 1.05, -4.1],
];
const BAY_DIST = [12.9, 11.2, 10.8, 10.4];

export default function Factory3D({
  bay,
  onPick,
}: {
  /** active station, owned by the section — the camera eases across to it */
  bay: number;
  onPick: (i: number) => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const labelRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const apiRef = useRef<{ zoom: (k: number) => void; reset: () => void } | null>(null);
  /** auto-spin is opt-in — the bay renders on demand and parks when it is still */
  const autoRef = useRef(false);
  const bayRef = useRef(bay);
  /** installed by the scene builder; driven by useRafLoop while on screen */
  const tickRef = useRef<(() => boolean) | null>(null);

  const [near, setNear] = useState(false);
  const [auto, setAuto] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState(0);
  const [loaded, setLoaded] = useState(0);

  // The loop parks the moment the bay stops moving: 0 frames while the viewer
  // is still, 0 frames off screen. Only a station pick, a drag, a toggle, a
  // resize or scrolling back into view wakes it up again.
  const frame = useCallback(() => tickRef.current?.() ?? true, []);
  const kick = useRafLoop(mountRef, frame);

  useEffect(() => {
    bayRef.current = bay;
    kick();
  }, [bay, kick]);

  useEffect(() => {
    autoRef.current = auto;
    kick();
  }, [auto, kick]);

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
    let renderer: WebGLRenderer | null = null;
    let scene: Scene | null = null;
    let camera: PerspectiveCamera | null = null;
    let controls: OrbitControlsImpl | null = null;
    let observer: ResizeObserver | null = null;
    let teardown: (() => void) | null = null;
    let pmrem: PMREMGenerator | null = null;
    /** user zoom multiplier applied on top of the station dolly */
    let zoom = 1;

    (async () => {
      try {
        const THREE = await import("three");
        const [{ GLTFLoader }, { OrbitControls }, { MeshoptDecoder }, { RoomEnvironment }] =
          await Promise.all([
            import("three/examples/jsm/loaders/GLTFLoader.js"),
            import("three/examples/jsm/controls/OrbitControls.js"),
            import("three/examples/jsm/libs/meshopt_decoder.module.js"),
            import("three/examples/jsm/environments/RoomEnvironment.js"),
          ]);
        if (disposed) return;

        /* ---------- renderer ---------- */
        // "lite" = phones / small screens: the bay is fill-rate bound, so drop
        // antialiasing, cap the pixel ratio and skip shadows entirely there.
        // The bay only renders while it is moving, so the cap is about how
        // heavy a single frame is, not how often one is drawn.
        const lite = window.innerWidth < 820;
        renderer = new THREE.WebGLRenderer({ antialias: !lite, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lite ? 1 : 1.25));
        renderer.setSize(mount.clientWidth || 1, mount.clientHeight || 1, false);
        renderer.shadowMap.enabled = !lite;
        renderer.shadowMap.type = THREE.PCFShadowMap;
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

        /* ---------- studio environment (procedural — zero network cost) --- */
        pmrem = new THREE.PMREMGenerator(renderer);
        scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environmentIntensity = 0.5;

        /* ---------- lights ---------- */
        const key = new THREE.DirectionalLight(0xffffff, 2.1);
        key.position.set(7.5, 11, 5);
        key.castShadow = !lite;
        key.shadow.mapSize.set(1024, 1024);
        key.shadow.camera.left = -13;
        key.shadow.camera.right = 13;
        key.shadow.camera.top = 13;
        key.shadow.camera.bottom = -13;
        key.shadow.camera.near = 1;
        key.shadow.camera.far = 42;
        key.shadow.bias = -0.0009;
        key.shadow.normalBias = 0.022;
        key.target.position.set(0, 0.8, BAY_Z);
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

        /* ---------- assembly cradle, gantry + bay markings ---------- */
        const steel = new THREE.MeshStandardMaterial({
          color: 0x333a45,
          roughness: 0.42,
          metalness: 0.72,
        });
        const paint = new THREE.MeshStandardMaterial({
          color: 0xa8242b,
          roughness: 0.5,
          metalness: 0.35,
        });
        const hazard = new THREE.MeshStandardMaterial({
          color: 0xc9922a,
          roughness: 0.62,
          metalness: 0.2,
          emissive: 0x2a1c00,
          emissiveIntensity: 1,
        });

        const addBox = (
          parent: Object3D,
          w: number,
          h: number,
          d: number,
          x: number,
          y: number,
          z: number,
          mat: MeshStandardMaterial
        ) => {
          const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
          m.position.set(x, y, z);
          m.castShadow = true;
          m.receiveShadow = true;
          parent.add(m);
          return m;
        };

        // steel cradle holding the engine: base rails, uprights, red top rails
        const cradle = new THREE.Group();
        for (const dz of [-0.95, 0.95]) {
          addBox(cradle, 3.5, 0.1, 0.16, 0, 0.1, BAY_Z + dz, steel);
          addBox(cradle, 3.1, 0.12, 0.15, 0, 1.2, BAY_Z + dz, paint);
        }
        for (const dx of [-1.35, 1.35]) {
          addBox(cradle, 0.12, 0.1, 2.06, dx, 0.1, BAY_Z, steel);
          for (const dz of [-0.95, 0.95]) {
            addBox(cradle, 0.11, 1.08, 0.11, dx, 0.69, BAY_Z + dz, steel);
          }
        }
        for (const dx of [-1.15, 1.15]) {
          addBox(cradle, 0.5, 0.14, 1.15, dx, 0.2, BAY_Z, paint);
        }
        scene.add(cradle);

        // gantry rail over the bay with a hoist parked above the engine
        const gantry = new THREE.Group();
        for (const dx of [-3.3, 3.3]) addBox(gantry, 0.16, 3.6, 0.16, dx, 1.8, BAY_Z, steel);
        addBox(gantry, 6.92, 0.2, 0.24, 0, 3.7, BAY_Z, steel);
        addBox(gantry, 0.52, 0.24, 0.42, 0.35, 3.52, BAY_Z, paint);
        const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.0, 8), steel);
        chain.position.set(0.35, 2.9, BAY_Z);
        chain.castShadow = true;
        const hook = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.026, 8, 16), paint);
        hook.position.set(0.35, 2.36, BAY_Z);
        hook.castShadow = true;
        gantry.add(chain, hook);
        scene.add(gantry);

        // painted bay outline on the floor
        const mark = new THREE.Group();
        addBox(mark, 4.6, 0.02, 0.07, 0, 0.012, BAY_Z - 1.2, hazard);
        addBox(mark, 4.6, 0.02, 0.07, 0, 0.012, BAY_Z + 1.2, hazard);
        addBox(mark, 0.07, 0.02, 2.4, -2.3, 0.012, BAY_Z, hazard);
        addBox(mark, 0.07, 0.02, 2.4, 2.3, 0.012, BAY_Z, hazard);
        scene.add(mark);

        /* ---------- load the models ---------- */
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

        // De-duplicate the plan by file, then load it in two phases: the engine
        // and its crew first, the hall dressing behind them. The first frame is
        // drawn as soon as the crew lands instead of waiting for the last prop.
        const drops = new Map<string, Set<string>>();
        const heights = new Map<string, number | undefined>();
        for (const item of PLAN) {
          const set = drops.get(item.file) ?? new Set<string>();
          for (const name of item.drop ?? []) set.add(name);
          drops.set(item.file, set);
          if (!heights.has(item.file)) heights.set(item.file, item.height);
        }

        const cache = new Map<string, Group>();
        /** which files are already standing on the floor */
        const standing = new Set<string>();
        const pieceCount = () =>
          PLAN.reduce((n, p) => n + (standing.has(p.file) ? 1 + (p.copies?.length ?? 0) : 0), 0);

        const loadFile = async (file: string) => {
          try {
            const gltf = await loader.loadAsync(`${BASE}/${file}`);
            if (disposed) return;
            const root = gltf.scene;
            for (const name of drops.get(file) ?? []) {
              const node = root.getObjectByName(name);
              if (node) node.removeFromParent();
            }
            root.traverse((o) => {
              const m = o as Mesh;
              if (!m.isMesh) return;
              m.castShadow = !lite;
              m.receiveShadow = !lite;
              const mat = m.material as MeshStandardMaterial;
              if (mat && "envMapIntensity" in mat) mat.envMapIntensity = 1;
            });
            cache.set(file, ground(root, heights.get(file)));
          } catch {
            // One missing prop must never take the whole bay down.
          }
        };

        const place = (list: string[]) => {
          const world = scene;
          if (!world) return;
          for (const item of PLAN) {
            if (!list.includes(item.file)) continue;
            const proto = cache.get(item.file);
            if (!proto) continue;

            const inst = proto.clone(true);
            inst.position.set(...item.pos);
            inst.rotation.y = item.ry ?? 0;
            world.add(inst);

            for (const c of item.copies ?? []) {
              const cc = proto.clone(true);
              cc.position.set(...c.pos);
              cc.rotation.y = c.ry ?? 0;
              world.add(cc);
            }
            standing.add(item.file);
          }
        };

        /* ---------- controls exposed to the toolbar ---------- */
        apiRef.current = {
          zoom: (k) => {
            zoom = Math.min(1.9, Math.max(0.55, zoom * k));
            kick();
          },
          reset: () => {
            if (!camera || !controls) return;
            zoom = 1;
            camera.position.set(...HOME_POS);
            controls.target.set(...LOOK_AT);
            controls.update();
            kick();
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
          // the buffer just changed shape — draw it again and re-seat the tags
          kick();
        };
        if (typeof ResizeObserver !== "undefined") {
          observer = new ResizeObserver(resize);
          observer.observe(mount);
        }
        window.addEventListener("resize", resize);

        /* ---------- wake the loop on interaction -------------------------- */
        // The bay is static by default, so nothing renders unless the reader
        // touches it: a drag (or the wheel) wakes the loop until it settles again.
        let dragging = false;
        const onDown = () => {
          dragging = true;
          kick();
        };
        const onMove = () => {
          if (dragging) kick();
        };
        const onUp = () => {
          dragging = false;
          kick();
        };
        canvas.addEventListener("pointerdown", onDown);
        canvas.addEventListener("pointermove", onMove);
        canvas.addEventListener("wheel", kick, { passive: true });
        window.addEventListener("pointerup", onUp);

        /* ---------- loop (wakes on demand, parks the moment it settles) --- */
        const clock = new THREE.Clock();
        const tmp = new THREE.Vector3();
        const dir = new THREE.Vector3();
        const focus = new THREE.Vector3();
        /** true until the first tick after a park, so timing gaps are ignored */
        let fresh = true;

        // Nothing that casts a shadow ever moves, so the map is re-baked only
        // when a phase lands on the floor — never per frame.
        renderer.shadowMap.autoUpdate = false;
        renderer.shadowMap.needsUpdate = true;

        tickRef.current = () => {
          if (!renderer || !scene || !camera || !controls) return true;
          // `fresh` marks the first tick after the loop parked: the gap since the
          // last frame can be minutes, so it starts a normal frame instead of
          // teleporting the camera. Mid-animation the delta is capped at 0.25 s,
          // which keeps the glide the same length in *time* on a slow device
          // instead of dragging it out for hundreds of frames.
          const raw = clock.getDelta();
          const dt = fresh ? 1 / 60 : Math.min(0.25, raw);
          fresh = false;

          // pick a station and the camera eases across the hall to it; the orbit
          // direction is kept, so the shot can never end up inside a wall
          const b = Math.max(0, Math.min(BAY_FOCUS.length - 1, Math.round(bayRef.current || 0)));
          focus.set(...BAY_FOCUS[b]);
          controls.target.lerp(focus, Math.min(1, dt * 2.8));
          // 10 cm of slop is invisible at this distance and lets the ease end
          // promptly instead of creeping for another hundred frames
          if (controls.target.distanceToSquared(focus) < 1e-2) controls.target.copy(focus);

          const want = BAY_DIST[b] * zoom;
          dir.copy(camera.position).sub(controls.target);
          const cur = dir.length();
          const next = cur + (want - cur) * Math.min(1, dt * 3.8);
          dir.setLength(Math.abs(next - want) < 0.01 ? want : next);
          camera.position.copy(controls.target).add(dir);

          controls.autoRotate = autoRef.current;
          const moved = controls.update(dt);
          renderer.render(scene, camera);

          const w = mount.clientWidth;
          const h = mount.clientHeight;
          for (let i = 0; i < STATIONS.length; i++) {
            const el = labelRefs.current[i];
            if (!el) continue;
            const s = STATIONS[i];
            tmp.set(s.pos[0], s.pos[1], s.pos[2]).project(camera);
            const live = tmp.z < 1;
            el.style.opacity = live ? "1" : "0";
            el.style.pointerEvents = live ? "auto" : "none";
            if (live) {
              // keep the tag inside the frame — it is wider than the dot and
              // would otherwise be clipped by the viewer's overflow:hidden
              const px = Math.min(w - 74, Math.max(74, (tmp.x * 0.5 + 0.5) * w));
              const py = Math.min(h - 26, Math.max(26, (-tmp.y * 0.5 + 0.5) * h));
              el.style.transform = `translate(-50%, -50%) translate(${px}px, ${py}px)`;
            }
            el.classList.toggle("on", i === b);
          }

          // settled → hand the thread straight back to the page
          if (moved || autoRef.current) return false;
          fresh = true;
          return true;
        };

        /* ---------- land the bay in phases: engine, crew, dressing -------- */
        // The engine lands first so the bay is alive in a blink, then its crew,
        // then the hall dressing streams in behind them. Nothing waits for the
        // last crate before the first frame is drawn.
        for (const phase of PHASES) {
          if (!phase.length) continue;
          await Promise.all(
            phase.map(async (file) => {
              await loadFile(file);
              if (!disposed) setLoaded((n) => n + 1);
            })
          );
          if (disposed) return;
          place(phase);
          if (!disposed) {
            setDone(pieceCount());
            setReady(true);
          }
          // re-bake the (static) shadow map once for the new geometry
          renderer.shadowMap.needsUpdate = true;
          kick();
        }

        if (!disposed) setDone(TOTAL_PIECES);

        teardown = () => {
          window.removeEventListener("resize", resize);
          window.removeEventListener("pointerup", onUp);
          canvas.removeEventListener("pointerdown", onDown);
          canvas.removeEventListener("pointermove", onMove);
          canvas.removeEventListener("wheel", kick);
          observer?.disconnect();
        };
      } catch {
        if (!disposed) setFailed(true);
      }
    })();

    return () => {
      disposed = true;
      tickRef.current = null;
      teardown?.();
      controls?.dispose();
      pmrem?.dispose();
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
  }, [near, kick]);

  return (
    <div className="f3d" ref={hostRef}>
      <div className="f3dStage" ref={mountRef} aria-label="Interactive 3D view of the NEGBUY factory floor" />

      {!ready && !failed && (
        <div className="f3dLoad">
          <span className="f3dSpin" aria-hidden="true" />
          <b>Building the 3D floor</b>
          <span>{done > 0 ? `${done} / ${TOTAL_PIECES} pieces placed` : "loading models…"}</span>
        </div>
      )}
      {ready && !failed && done < TOTAL_PIECES && (
        <span className="f3dStamp" aria-hidden="true">
          Assembling {loaded}/{FILES.length}
        </span>
      )}
      {failed && (
        <div className="f3dLoad">
          <b>3D view unavailable</b>
          <span>Reload the page or open it in a browser with WebGL enabled.</span>
        </div>
      )}

      <span className="f3dLive" aria-hidden="true">
        <i />
        3D floor
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
