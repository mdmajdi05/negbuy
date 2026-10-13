// One-off: pull NEGBUY's real site media into /public/real.
import { mkdir, writeFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";

const BASE = "https://negbuy.com/";
const OUT = join(process.cwd(), "public", "real");

const MAP = {
  // hero / company
  "hero-banner.webp": "images/negbuy.webp",
  "about-hero.webp": "images/About-New.webp",
  "about-5.webp": "images/about-img5.webp",
  "about-6.webp": "images/about-img6.webp",
  "about-vision.png": "images/vision-img.png",
  "global.jpg": "images/global.jpg",

  // product overview
  "p-energy.webp": "images/home-energy.webp",
  "p-marine.webp": "images/home-marine.webp",
  "p-electrical.webp": "images/home-electrical.webp",
  "p-solar.webp": "images/home-solar.webp",
  "p-oilgas.webp": "images/home-oil&gas.webp",
  "p-turbine.webp": "images/home-turbine.webp",

  // turbine
  "turbine-hero.webp": "images/gas-turbine-hero.webp",
  "turbine-banner.webp": "images/gas-turbine-banner.webp",
  "turbine-overview.jpg": "images/turbine-overview.jpg",
  "turbine-cut.png": "images/turbine.png",
  "siemens-banner.webp": "images/Siemens-spare-parts-banner.webp",
  "spare-parts-about.webp": "images/spare-parts-about.webp",
  "ic-inventory.png": "images/Global-Inventory.png",
  "ic-oem.png": "images/OEM-Grade%20Quality.png",
  "ic-dispatch.png": "images/Dispatch.png",
  "ic-expertise.png": "images/Technical%20Expertise.png",
  "ic-stock.png": "images/Large%20Stock%20Holding.png",
  "ic-pricing.png": "images/Competitive%20Pricing.png",

  // turbine service
  "svc-turbine-intro.jpg": "images/service-intro.jpg",
  "t-powerplant.webp": "images/Power-plant.webp",
  "t-oilgas.webp": "images/turbine-%20Oil%20%26%20Gas.webp",
  "t-marine.webp": "images/turbine-Marine.webp",
  "t-manufacturing.webp": "images/turbine-Manufacturing.webp",
  "t-wind.webp": "images/turbine-Wind%20Energy.webp",
  "t-petrochem.webp": "images/turbine-Petrochemical%20Plants.webp",

  // services slider
  "svc-1.jpg": "images/service-1.jpg",
  "svc-2.jpg": "images/service-2.jpg",
  "svc-3.jpg": "images/service-3.jpg",
  "svc-4.jpg": "images/service-4.jpg",
  "svc-5.jpg": "images/service-5.jpg",
  "svc-6.jpg": "images/service-6.jpg",
  "svc-7.jpg": "images/service-7.jpg",
  "svc-8.jpg": "images/service-8.jpg",
  "svc-9.jpg": "images/service-9.jpg",
  "svc-banner.jpg": "images/services.jpg",

  // oil & gas
  "og-intro.webp": "images/Oil%20and%20Gas%20Service.webp",
  "og-1.webp": "images/oil-gas-service-1.webp",
  "og-2.webp": "images/oil-gas-service-2.webp",
  "og-3.webp": "images/oil-gas-service-3.webp",
  "og-4.webp": "images/oil-gas-service-4.webp",
  "og-5.webp": "images/oil-gas-service-5.webp",
  "og-6.webp": "images/oil-gas-service-6.webp",
  "og-hero.jpg": "images/oil%20and%20gas.jpg",

  // electrical
  "el-intro.webp": "images/Electrical-Service.webp",
  "el-construction.webp": "images/Electrical%20Construction.webp",
  "el-install.webp": "images/Electrical%20Installations.webp",
  "el-service.webp": "images/Service%20%26%20Maintenance.webp",
  "el-design.webp": "images/Engineering%20%26%20Design.webp",
  "el-controls.webp": "images/Controls%20%26%20Automation.webp",

  // marine
  "mr-intro.webp": "images/Marine%20service.webp",
  "mr-1.webp": "images/marine-service.webp",
  "mr-oem.webp": "images/OEM%20Spare.webp",
  "mr-overhaul.webp": "images/Engine%20Overhauls.webp",
  "mr-consult.webp": "images/Technical%20Consulting.webp",
  "mr-complete.webp": "images/Complete%20Marine.webp",
  "mr-offshore.webp": "images/Offshore%20Maintenance.webp",
  "mr-bg.jpg": "images/marine-bg.jpg",
  "mr-solution.jpg": "images/marine-solution.jpg",

  // epc
  "epc-hero.jpg": "images/EPC-SERVICE.jpg",
  "epc-1.jpg": "images/epc-service-1.jpg",
  "epc-expert.jpg": "images/epc-expert.jpg",

  // energy / industries
  "ind-solar.png": "images/solar-indsturies.png",
  "ind-solar1.jpg": "images/solar-1.jpg",
  "wind-turbine.png": "images/wind-turbine.png",
  "wind-project-1.jpg": "images/wind-project-1.jpg",
  "wind-project-2.jpg": "images/wind-project-2.jpg",
  "wind-project-3.jpg": "images/wind-project-3.jpg",
  "wind-project-4.jpg": "images/wind-project-4.jpg",
  "wind-project-5.jpg": "images/wind-project-5.jpg",
  "wind-project-6.jpg": "images/wind-project-6.jpg",
  "wind-featured-1.jpg": "images/featured-img-1.jpg",
  "wind-featured-2.jpg": "images/featured-img-2.jpg",
  "elec-1.jpg": "images/electrcity-1.jpg",
  "elec-3.jpg": "images/electrcity-3.jpg",

  // real engineers / workers
  "eng-bg.jpg": "images/engineer-bg-2.jpg",
  "eng-1.jpg": "images/engineer-1.jpg",
  "eng-2.jpg": "images/engineer-2.jpg",
  "eng-3.jpg": "images/engineer-3.jpg",
  "eng-4.jpg": "images/engineer-4.jpg",
  "eng-5.jpg": "images/engineer-5.jpg",
  "eng-6.jpg": "images/engineer-6.jpg",
  "eng-about.jpeg": "images/engineer-about-img.jpeg",

  // team
  "team-sayeem.webp": "images/sayeem.webp",
  "team-shahid.webp": "images/shahid%20khan.webp",
  "team-maaz.webp": "images/maaz.webp",
  "team-ravi.webp": "images/ravi.webp",
  "team-sunny.webp": "images/sunny-panday.webp",
  "team-sanjay.webp": "images/sanjay%20pal.webp",
  "team-osama.webp": "images/osama.webp",
};

const VIDEOS = {
  "hero-video.mp4": "video/banner-video-5.mp4",
  "about-video.mp4": "video/about-us-video.mp4",
};

const report = { ok: [], fail: [] };

async function grab(local, remote) {
  const url = /^https?:/.test(remote) ? remote : BASE + remote;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0", Referer: BASE },
    });
    if (!res.ok) {
      report.fail.push([local, res.status, url]);
      return;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const dest = join(OUT, local);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, buf);
    const size = (await stat(dest)).size;
    report.ok.push([local, size]);
  } catch (e) {
    report.fail.push([local, "ERR " + e.message, url]);
  }
}

for (const [local, remote] of Object.entries({ ...MAP, ...VIDEOS })) {
  await grab(local, remote);
}

console.log("OK:", report.ok.length, "FAIL:", report.fail.length);
if (report.fail.length) console.log("FAILURES:", JSON.stringify(report.fail, null, 1));
