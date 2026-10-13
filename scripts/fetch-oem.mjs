// Pull real OEM turbine imagery (GE Vernova, Siemens Energy) into /public/oem.
import { mkdir, writeFile, stat } from "node:fs/promises";
import { join } from "node:path";

const OUT = join(process.cwd(), "public", "oem");
await mkdir(OUT, { recursive: true });

const S = "https://assets.siemens-energy.com/dam/";
const G = "https://www.gevernova.com/content/dam/gepower-new/global/en_US/images/gas-new-site/";

// Each entry: local file -> list of candidate remote URLs (first 200 wins).
const MAP = {
  // ---------- GE Vernova ----------
  "ge-turbine-hero.jpg": [G + "products/gas-turbines/hero-ge-gas-turbine-power-compressor-blades-blue.jpg"],
  "ge-home-hero.png": [G + "homepage/gas-power-home-hero-8-26-static.png"],
  "ge-services.jpg": [G + "services/hero-gas-services.jpg"],
  "ge-steam.jpg": [G + "products/steam-turbines/hero-steam-turbine-products-gas.jpg"],
  "ge-generators.jpg": [G + "products/generators/hero-products-generators2.jpg"],

  // ---------- Siemens Energy — gas turbines ----------
  "se-sgt5-8000h.jpg": [
    S + "18997143-4c8b-40c5-833d-b00d006bfcb1/SGT5-8000H-sidecut-on-white-jpg_Original%20file.jpg",
  ],
  "se-sgt5-4000f.png": [
    S + "9b13833a-8d46-4404-96d7-b41800dc29bd/SGT5-4000F-side-1VGV-png_Rendition960.png",
    S + "9b13833a-8d46-4404-96d7-b41800dc29bd/SGT5-4000F-side-1VGV-png_Rendition480.png",
  ],
  "se-sgt5-2000e.jpg": [
    S + "a9b7436d-00ef-4e6d-9b76-b00d006b6ade/SGT5-2000e-003-B-white-jpg_Original%20file.jpg",
  ],
  "se-sgt5-9000hl.png": [
    S + "fd8db5e1-8605-4347-a826-b08300916b09/SGT5-9000HL-SideView-trans-png_Rendition1920.PNG",
    S + "fd8db5e1-8605-4347-a826-b08300916b09/SGT5-9000HL-SideView-trans-png_Rendition960.PNG",
    S + "fd8db5e1-8605-4347-a826-b08300916b09/SGT5-9000HL-SideView-trans-png_Rendition170.PNG",
  ],
  "se-sgt6-8000h.jpg": [
    S + "f3721547-d5c5-4e78-95f1-b00d00697f99/SGT6-8000H-IMG04B-SideView-Closed-onwhite-jpg_Original%20file.jpg",
  ],
  "se-sgt6-5000f.jpg": [
    S + "5026ae08-8d52-4144-9025-b00d006a6653/SGT6-5000F-sidecut-on-white-jpg_Original%20file.jpg",
  ],
  "se-sgt800c1.jpg": [
    S + "58bebba8-915e-4e31-8005-b00d006ace61/SGT-800C1-sidecut-on-white-jpg_Original%20file.jpg",
  ],
  "se-sgt750.png": [
    S + "ab14ee7e-dbf5-402a-8960-b21800aa781d/sgt-750-png_Rendition960.PNG",
  ],
  "se-sgt700.jpg": [
    S + "0cc83c2f-c58c-4924-a7eb-b00d006b27da/SGT-700-sidecut-on-white-jpg_Original%20file.jpg",
  ],
  "se-phoenix.jpg": [
    S + "e095976b-4aa8-4f33-a851-b00d006996cb/Siemens-Phoenix-Seitenansicht-geschlossen-COLOR-jpg_Original%20file.jpg",
  ],

  // ---------- Siemens Energy — steam turbines ----------
  "se-sst700-900.png": [
    S + "8c982ad9-d623-4140-add6-b08300209a4f/sst-700-900-SE-png_Rendition960.PNG",
    S + "8c982ad9-d623-4140-add6-b08300209a4f/sst-700-900-SE-png_Rendition480.PNG",
  ],
  "se-steam-darrow.jpg": [
    S + "83423e92-e82a-40df-9019-b289009c266f/steamturbine_darrow_blue_040-jpg_Rendition960.JPG",
    S + "83423e92-e82a-40df-9019-b289009c266f/steamturbine_darrow_blue_040-jpg_Rendition480.JPG",
  ],
  "se-sst6000.jpg": [
    S + "14192830-90f0-4c4b-8b35-b00d0068a6e4/sst-6000-transparent-SE-jpg_Original%20file.jpg",
  ],
  "se-sst600.jpg": [
    S + "b85979f8-a1b4-428d-a3e9-b00d006c273b/sst-600-transparent-SE-jpg_Original%20file.jpg",
  ],
  "se-sst3000.png": [
    S + "08028097-a6cd-4a7d-a8b3-b00d006ab616/sst-3000-png_Rendition960.jpg",
    S + "08028097-a6cd-4a7d-a8b3-b00d006ab616/sst-3000-png_Rendition170.jpg",
  ],
  "se-sst200.png": [
    S + "4f1e5923-f16b-4ca2-bf29-b085001312cd/SST-200-png_Rendition960.PNG",
    S + "4f1e5923-f16b-4ca2-bf29-b085001312cd/SST-200-png_Rendition170.PNG",
  ],

  // ---------- Siemens Energy — generators ----------
  "se-sgen100a.jpg": [
    S + "abc245a0-7f2c-4501-b9f8-b08200e95790/sgen100a-05c-keyvisual-purebright-jpg_Rendition960.JPG",
    S + "abc245a0-7f2c-4501-b9f8-b08200e95790/sgen100a-05c-keyvisual-purebright-jpg_Rendition480.JPG",
  ],
  "se-gen-sphere.png": [
    S + "d16cfd07-7a13-43c0-945e-b0b900928d32/generator-mit-dot-sphere-png_Original%20file.png",
  ],
  "se-sgen100a-cut.png": [
    S + "5d4c32bb-d397-47f1-ba1a-b08300cd1148/sgen-100a-2p-cutopen-ontransparent-highres-png_Rendition960.PNG",
    S + "5d4c32bb-d397-47f1-ba1a-b08300cd1148/sgen-100a-2p-cutopen-ontransparent-highres-png_Rendition480.PNG",
  ],
  "se-sgen3000w.png": [
    S + "b65a7d03-79e5-4966-8ac8-b0c900d87773/SGen-3000W-png_Rendition960.PNG",
    S + "b65a7d03-79e5-4966-8ac8-b0c900d87773/SGen-3000W-png_Rendition170.PNG",
  ],
  "se-gen-grafik.png": [
    S + "14b4eafa-b5aa-4684-b101-b00d006916c7/Grafik-Generatoren-png_Original%20file.png",
  ],
  "se-sgen5.jpg": [
    S + "38e64104-7e4d-4f94-9e00-b00d006aa00f/sgen5-2000p-01-color-jpg_Original%20file.jpg",
  ],

  // ---------- Siemens Energy — real plants / sites ----------
  "se-energy-landscape.jpg": [
    S + "a6dfd819-7ce9-4e23-a9e5-b08900a4b78d/Header_Products_EnergyLandscape-jpg_Rendition1920.JPG",
  ],
  "se-plant-egypt.jpg": [
    S + "9778af72-6a76-4d04-add5-b00d006c5cc3/megaproject-egypt-2-jpg_Rendition1920.jpg",
    S + "9778af72-6a76-4d04-add5-b00d006c5cc3/megaproject-egypt-2-jpg_Rendition960.jpg",
  ],
  "se-plant-elering.jpg": [
    S + "e007d2e2-855e-4fcb-8751-b3320078b849/Industrial_SynconElering_190525_MI_5823_hires-%2838%29-jpg_Rendition1920.jpg",
    S + "e007d2e2-855e-4fcb-8751-b3320078b849/Industrial_SynconElering_190525_MI_5823_hires-%2838%29-jpg_Rendition960.jpg",
  ],
  "se-plant-1.jpg": [
    S + "f557bfba-e36b-4a2d-96cc-b0590094555f/si_01132754-tif_Social%20media%20%28square%29.jpg",
  ],
  "se-plant-2.jpg": [
    S + "1116ff10-1d45-478d-a965-b00d0066ffcb/im2017040536pg_300dpi-jpg_Rendition960.jpg",
    S + "1116ff10-1d45-478d-a965-b00d0066ffcb/im2017040536pg_300dpi-jpg_Rendition480.jpg",
  ],
  "se-plant-3.jpg": [
    S + "fdd5ca49-0ce2-437a-acb5-b00d00686dd1/im2016010344pg_300dpi-jpg_Rendition1920.jpg",
    S + "fdd5ca49-0ce2-437a-acb5-b00d00686dd1/im2016010344pg_300dpi-jpg_Rendition960.jpg",
  ],
  "se-plant-aerial.jpg": [
    S + "bf3e1d9e-9625-4211-a2e9-b0bd00a1be60/DJI_0771_Header-jpg_Social%20media%20%28square%29.jpg",
  ],
  "se-plant-basf.jpg": [
    S + "658deb23-8adc-49df-a8a7-b00d00676e33/BASF-Schwarzheide-jpg_Social%20media%20%28square%29.jpg",
  ],
  "se-offshore-wind.jpg": [
    S + "e4af6170-c71d-44c5-b15e-b28d015fbfab/Offshore-wind-generic-3-jpg_Rendition1920.JPG",
  ],
};

const ok = [], fail = [];
for (const [local, urls] of Object.entries(MAP)) {
  let done = false;
  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0", Referer: new URL(url).origin } });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 4000) continue;
      await writeFile(join(OUT, local), buf);
      ok.push([local, (buf.length / 1024).toFixed(0) + "kb"]);
      done = true;
      break;
    } catch {}
  }
  if (!done) fail.push(local);
}
console.log("OK", ok.length, "FAIL", fail.length);
console.log(JSON.stringify(ok));
if (fail.length) console.log("FAILURES", JSON.stringify(fail));
