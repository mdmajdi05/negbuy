/**
 * Asset pipeline: recompress oversized images in `public/`.
 *
 * The source library arrived as 2000-7500 px camera exports — several over
 * 9 MB — which made every page far heavier than it needed to be. This walks
 * the folder, caps the long edge at 1800 px (plenty for the largest on-screen
 * slot even at 2x DPR) and re-encodes:
 *
 *   .jpg/.jpeg -> JPEG (mozjpeg, q78)
 *   .webp      -> WebP   (q80)
 *   .png referenced from `src/lib/media.ts` -> WebP (q86, alpha kept)
 *   .png (anything else)                    -> PNG (lossless, recompressed)
 *
 * Files already handled are recorded in `.image-manifest.json` so re-running
 * never double-compresses. Safe to re-run; every file is independent.
 *
 * Usage:  node scripts/optimize-images.mjs [--dry] [--cap 1600] [--force]
 */
import { readdir, stat, writeFile, unlink, readFile, rename } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve("public");
const MANIFEST = path.resolve(".image-manifest.json");
const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const FORCE = args.includes("--force");
const capArg = args.indexOf("--cap");
const CAP = capArg >= 0 ? Number(args[capArg + 1]) : 1800;
const MIN_BYTES = 140 * 1024;

/** PNGs referenced from media.ts — rewritten as WebP (refs updated there). */
const PNG_TO_WEBP = new Set([
  "oem/ge-home-hero.png",
  "oem/se-sgt5-4000f.png",
  "oem/se-sgt5-9000hl.png",
  "oem/se-sgt750.png",
  "oem/se-sst700-900.png",
  "oem/se-sst200.png",
  "oem/se-sgen100a-cut.png",
  "oem/se-sgen3000w.png",
  "oem/se-gen-sphere.png",
  "oem/se-gen-grafik.png",
  "real/wind-turbine.png",
]);

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (/\.(jpe?g|png|webp)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

let done = new Set();
try {
  done = new Set(JSON.parse(await readFile(MANIFEST, "utf8")).files ?? []);
} catch {
  /* first run */
}

const kb = (n) => (n / 1024).toFixed(0).padStart(6) + " KB";
const files = await walk(ROOT);
const rows = [];
const failures = [];
let beforeTotal = 0;
let afterTotal = 0;

for (const file of files) {
  const rel = path.relative(ROOT, file).split(path.sep).join("/");
  let size = 0;
  try {
    size = (await stat(file)).size;
  } catch {
    continue;
  }
  beforeTotal += size;

  if (size < MIN_BYTES || (done.has(rel) && !FORCE)) {
    afterTotal += size;
    continue;
  }

  try {
    // Read into memory first: sharp keeps a file handle open otherwise, and on
    // Windows that blocks writing the result back to the same path.
    const input = await readFile(file);
    const ext = path.extname(file).toLowerCase();
    const meta = await sharp(input, { failOn: "none" }).metadata();
    const asWebp = ext === ".webp" || (ext === ".png" && PNG_TO_WEBP.has(rel));

    let pipe = sharp(input, { failOn: "none" })
      .rotate()
      .resize({ width: CAP, height: CAP, fit: "inside", withoutEnlargement: true });

    if (asWebp)
      pipe = pipe.webp({ quality: ext === ".png" ? 86 : 80, effort: 5, alphaQuality: 92 });
    else if (ext === ".jpg" || ext === ".jpeg") pipe = pipe.jpeg({ quality: 78, mozjpeg: true });
    else pipe = pipe.png({ compressionLevel: 9 });

    const buf = await pipe.toBuffer();
    const out = ext === ".png" && asWebp ? file.replace(/\.png$/i, ".webp") : file;
    if (buf.length >= size) {
      afterTotal += size;
      done.add(rel);
      continue;
    }

    rows.push({
      gain: size - buf.length,
      text: `${kb(size)} -> ${kb(buf.length)}   ${meta.width}x${meta.height}   ${rel}${
        out !== file ? "  (-> .webp)" : ""
      }`,
    });
    afterTotal += buf.length;

    if (!DRY) {
      const tmp = `${file}.opt`;
      await writeFile(tmp, buf);
      await rename(tmp, out);
      if (out !== file) await unlink(file);
      done.add(rel);
    }
  } catch (err) {
    failures.push(`${rel}: ${err.message}`);
    afterTotal += size;
  }
}

rows.sort((a, b) => b.gain - a.gain);
for (const row of rows) console.log(row.text);

console.log(
  `\n${rows.length} images rewritten  ·  ${(beforeTotal / 1024 / 1024).toFixed(1)} MB -> ${(
    afterTotal /
    1024 /
    1024
  ).toFixed(1)} MB  (cap ${CAP}px)${DRY ? "  [dry run]" : ""}`
);
if (failures.length) console.log(`\n${failures.length} failed:\n  ${failures.join("\n  ")}`);

if (!DRY) {
  await writeFile(
    MANIFEST,
    JSON.stringify({ cap: CAP, files: [...done].sort() }, null, 2) + "\n"
  );
}
