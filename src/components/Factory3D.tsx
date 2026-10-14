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
 * Real 3D working area — the turbine assembly bay.
 *
 * Centre stage: a full gas-turbine engine (CC0, meshopt-compressed)
 * sitting on a steel assembly cradle while a four-person crew works
 * around it. The crew and the hall props are CC0 models too — MakeHuman
 * based workers in real working poses, plus roller-shutter doors,
 * shelving, carts, drums and crates. Everything is light (512 px WebP +
 * meshopt) and lazy-loaded only when the section approaches the
 * viewport.
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
          const want = (12.9 - pr * 2.9) * zoom;
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
              // keep the tag inside the frame — it is wider than the dot and
              // would otherwise be clipped by the viewer's overflow:hidden
              const px = Math.min(w - 74, Math.max(74, (tmp.x * 0.5 + 0.5) * w));
              const py = Math.min(h - 26, Math.max(26, (-tmp.y * 0.5 + 0.5) * h));
              el.style.transform = `translate(-50%, -50%) translate(${px}px, ${py}px)`;
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
          <span>{done > 0 ? `${done} / ${PLAN.length} pieces placed` : "loading models…"}</span>
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
