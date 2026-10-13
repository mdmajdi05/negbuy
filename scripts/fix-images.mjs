import { rename, unlink } from "node:fs/promises";
import { join } from "node:path";

const OEM = join(process.cwd(), "public", "oem");

// Delete genuinely broken downloads (HTML error pages saved as .jpg).
for (const f of ["se-plant-egypt.jpg", "se-plant-3.jpg"]) {
  try {
    await unlink(join(OEM, f));
    console.log("deleted", f);
  } catch (e) {
    console.log("skip", f, e.code);
  }
}

// Fix extension mismatches: file content is the real format.
const renames = [
  ["ge-turbine-hero.jpg", "ge-turbine-hero.webp"],
  ["ge-services.jpg", "ge-services.webp"],
  ["ge-steam.jpg", "ge-steam.webp"],
  ["ge-generators.jpg", "ge-generators.webp"],
  ["se-sst3000.png", "se-sst3000.jpg"],
];
for (const [from, to] of renames) {
  try {
    await rename(join(OEM, from), join(OEM, to));
    console.log("renamed", from, "->", to);
  } catch (e) {
    console.log("skip", from, e.code);
  }
}
