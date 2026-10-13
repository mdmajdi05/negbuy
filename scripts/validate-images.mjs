import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const roots = [
  join(process.cwd(), "public", "oem"),
  join(process.cwd(), "public", "real"),
];

const magic = (buf) => {
  if (buf[0] === 0xff && buf[1] === 0xd8) return "jpg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e) return "png";
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[8] === 0x57) return "webp";
  if (buf[0] === 0x47 && buf[1] === 0x49) return "gif";
  if (buf.slice(0, 4).toString("ascii").toLowerCase() === "<!do") return "HTML";
  if (buf.slice(0, 5).toString("ascii").toLowerCase() === "<?xml") return "XML";
  return "?? " + [...buf.slice(0, 8)].map((x) => x.toString(16).padStart(2, "0")).join(" ");
};

const bad = [];
let total = 0;
for (const root of roots) {
  const files = await readdir(root);
  for (const f of files) {
    if (/\.(mp4|webm)$/i.test(f)) continue;
    total++;
    const buf = await readFile(join(root, f));
    const k = magic(buf);
    const ext = f.split(".").pop().toLowerCase();
    const expect =
      ext === "jpg" || ext === "jpeg" ? "jpg" : ext === "png" ? "png" : ext === "webp" ? "webp" : ext;
    const ok = k === expect;
    if (!ok) bad.push({ file: root.split(/[\\/]/).pop() + "/" + f, bytes: buf.length, got: k, expect });
  }
}
console.log("TOTAL", total, "BAD", bad.length);
console.log(JSON.stringify(bad, null, 1));
