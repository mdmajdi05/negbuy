# NEGBUY ProcessLine — mode archive

The "03 / How we deliver" section now ships BOTH views in one file and has a
**self-serve switch** at the top-right of the section — no file swapping needed:

- **REAL WORLD** → dusk "simulation world": sun/mountains/distant town, fields &
  grass, village houses, power poles + sagging wires, parked cars, birds,
  streetlights, NEGBUY factory (smoking chimney + production crew), QC
  warehouse, packing plant, dispatch dock with crew, asphalt road with
  shoulder + yellow centre line.
- **CLASSIC** → the plain truck journey: winding road, 5 checkpoints, NEGBUY
  office at pickup, "YOUR PLACE" client office at drop, realistic truck.

The toggle buttons render inside the pinned section (top-right) and reactively
swap the SVG scene. Default on load is **CLASSIC**.

## Live files (current source of truth)

| File | Contains |
| --- | --- |
| `src/components/ProcessLine.tsx` | Shared scaffold + both scene trees + `.plSwitch` toggle + all sim helpers (`House`, `Car`, `PowerPole`, `LitWin`, `Pine`, `Bush`, `Worker`, `Streetlight`, `RoadSign`). |
| `src/app/globals.css` | Toggle styles (`.plSwitch*`), real-world road (`.tsShoulder/.tsAsphalt/.tsAsphaltHi/.tsDash`), world animations (`.tCloud/.tSmoke/.tArm` + keyframes), reduced-motion guards. |

## Snapshots

| Folder | Contents |
| --- | --- |
| `_archive/live/` | Byte snapshot of today's unified file + CSS (`.txt` so Next/TS ignore them). Restore by copying back over the live paths. |
| `_archive/normal/` | Historical: the pre-toggle "normal only" ProcessLine + CSS. |
| `_archive/simulation/` | Historical: the pre-toggle "simulation only" ProcessLine + CSS (dusk world layout the current REAL WORLD view was built on). |

### Restore the unified live file (if ever reverted)
```powershell
Copy-Item "_archive\live\ProcessLine.tsx.txt" "src\components\ProcessLine.tsx" -Force
Copy-Item "_archive\live\globals.css.txt"        "src\app\globals.css"           -Force
```
Then hard-refresh (Ctrl+Shift+R).

> Dev server notes: negbuy-n runs on **port 3001** (the zaidi-next project
> currently holds port 3000). Turbopack dev serves HTML/CSS; if CSS looks
> stale after editing `globals.css`, touch the file or restart `npm run dev`.