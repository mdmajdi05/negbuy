// Central media manifest.
//
// All imagery is REAL photography / OEM product media downloaded into /public:
//  - /public/oem  -> GE Vernova & Siemens Energy product media + Wikimedia Commons
//                    photography of real power plants, turbine halls, rotors and workshops.
//  - /public/real -> NEGBUY's own site photography and company videos.

export const VIDEO = {
  /** Real company reel (autoplay, muted, looped). */
  hero: "/real/hero-video.mp4",
  about: "/real/about-video.mp4",
  /** YouTube fallbacks / long form. */
  ytTurbine: "ZGW9OA4_72g",
  ytPlant: "byVifZiEc7A",
} as const;

/** OEM product media (real turbine hardware). */
export const OEM = {
  gtHero: "/oem/ge-turbine-hero.webp",
  gtHome: "/oem/ge-home-hero.webp",
  gtServices: "/oem/ge-services.webp",
  steam: "/oem/ge-steam.webp",
  generators: "/oem/ge-generators.webp",

  sgt5_8000h: "/oem/se-sgt5-8000h.jpg",
  sgt5_4000f: "/oem/se-sgt5-4000f.webp",
  sgt5_2000e: "/oem/se-sgt5-2000e.jpg",
  sgt5_9000hl: "/oem/se-sgt5-9000hl.webp",
  sgt6_8000h: "/oem/se-sgt6-8000h.jpg",
  sgt6_5000f: "/oem/se-sgt6-5000f.jpg",
  sgt800c1: "/oem/se-sgt800c1.jpg",
  sgt750: "/oem/se-sgt750.webp",
  sgt700: "/oem/se-sgt700.jpg",
  phoenix: "/oem/se-phoenix.jpg",

  sst700_900: "/oem/se-sst700-900.webp",
  sst6000: "/oem/se-sst6000.jpg",
  sst600: "/oem/se-sst600.jpg",
  sst3000: "/oem/se-sst3000.jpg",
  sst200: "/oem/se-sst200.webp",

  sgen100a: "/oem/se-sgen100a.jpg",
  sgen100aCut: "/oem/se-sgen100a-cut.webp",
  sgen3000w: "/oem/se-sgen3000w.webp",
  sgen5: "/oem/se-sgen5.jpg",
  genSphere: "/oem/se-gen-sphere.webp",
  genGraphic: "/oem/se-gen-grafik.webp",
} as const;

/** Real plant / site photography. */
export const PLANT = {
  landscape: "/oem/se-energy-landscape.jpg",
  egypt: "/oem/wm-plant-hybrid.jpg",
  elering: "/oem/se-plant-elering.jpg",
  site1: "/oem/se-plant-1.jpg",
  site2: "/oem/se-plant-2.jpg",
  site3: "/oem/se-plant-basf.jpg",
  aerial: "/oem/se-plant-aerial.jpg",
  basf: "/oem/se-plant-basf.jpg",
  offshoreWind: "/oem/se-offshore-wind.jpg",
  hybrid: "/oem/wm-plant-hybrid.jpg",
  generator: "/oem/wm-turbine-generator.jpg",
  hallBankside: "/oem/wm-hall-bankside.jpg",
  hallFerrybridge: "/oem/wm-hall-ferrybridge.jpg",
  hallBattersea: "/oem/wm-hall-battersea.jpg",
} as const;

/** Real machinery close-ups. */
export const MACHINE = {
  gtEngine: "/oem/wm-gt-engine.jpg",
  gtSmall: "/oem/wm-gt-4.jpg",
  rotorLp: "/oem/wm-rotor-lp.jpg",
  rotorSotavento: "/oem/wm-rotor-sotavento.jpg",
  rotor1970: "/oem/wm-rotor-1970.jpg",
  bladesVanes: "/oem/wm-blades-vanes.jpg",
  statorBlade: "/oem/wm-stator-blade.jpg",
  turboshaft: "/oem/wm-ge-turboshaft.jpg",
  testCell: "/oem/wm-test-cell.jpg",
  nacelle: "/oem/wm-nacelle-01.jpg",
  nacelleCrane: "/oem/wm-nacelle-crane.jpg",
} as const;

/** Real people at work — workshops, factories, control rooms. */
export const SHOP = {
  mapna1: "/oem/wm-factory-mapna-05.jpg",
  mapna2: "/oem/wm-factory-mapna-12.jpg",
  weldShop: "/oem/wm-weld-shop.jpg",
  weldSparks: "/oem/wm-weld-sparks.jpg",
  cutMetal: "/oem/wm-cut-metal.jpg",
  controlAltbach: "/oem/wm-control-altbach.jpg",
  controlRoom: "/oem/wm-control-room.jpg",
  controlNuclear: "/oem/wm-control-nuclear.jpg",
  engSite: "/real/eng-bg.jpg",
  eng1: "/real/eng-1.jpg",
  eng2: "/real/eng-2.jpg",
  eng3: "/real/eng-3.jpg",
  eng4: "/real/eng-4.jpg",
  eng5: "/real/eng-5.jpg",
  eng6: "/real/eng-6.jpg",
  engAbout: "/real/eng-about.jpeg",
  nacelleUnload: "/oem/wm-nacelle-unload.jpg",
} as const;

/** Sector photography (NEGBUY's own real images). */
export const SECTOR = {
  energy: "/real/p-energy.webp",
  marine: "/real/p-marine.webp",
  electrical: "/real/p-electrical.webp",
  solar: "/real/p-solar.webp",
  oilgas: "/real/p-oilgas.webp",
  turbine: "/real/p-turbine.webp",
  wind: "/real/wind-turbine.webp",
  windProject: "/real/wind-project-1.jpg",
  solarField: "/real/ind-solar1.jpg",
  elec1: "/real/elec-1.jpg",
  epcHero: "/real/epc-hero.jpg",
  epc1: "/real/epc-1.jpg",
  global: "/real/global.jpg",
  offshore: "/real/mr-offshore.webp",
  refinery: "/real/og-hero.jpg",
  marineBg: "/real/mr-bg.jpg",
  turbineOverview: "/real/turbine-overview.jpg",
  turbineBanner: "/real/turbine-banner.webp",
  siemens: "/real/siemens-banner.webp",
  spareParts: "/real/spare-parts-about.webp",
} as const;

/** Service / project photography (NEGBUY's own real images). */
export const SERVICE = {
  turbineIntro: "/real/svc-turbine-intro.jpg",
  turbineBanner: "/real/svc-banner.jpg",
  powerPlant: "/real/t-powerplant.webp",
  tOilgas: "/real/t-oilgas.webp",
  tMarine: "/real/t-marine.webp",
  tManufacturing: "/real/t-manufacturing.webp",
  tWind: "/real/t-wind.webp",
  tPetrochem: "/real/t-petrochem.webp",
  oilgasIntro: "/real/og-intro.webp",
  oilgas1: "/real/og-1.webp",
  oilgas2: "/real/og-2.webp",
  elecIntro: "/real/el-intro.webp",
  elecConstruction: "/real/el-construction.webp",
  elecInstall: "/real/el-install.webp",
  elecService: "/real/el-service.webp",
  elecControls: "/real/el-controls.webp",
  marineIntro: "/real/mr-intro.webp",
  marine1: "/real/mr-1.webp",
  marineOem: "/real/mr-oem.webp",
  marineOverhaul: "/real/mr-overhaul.webp",
  marineComplete: "/real/mr-complete.webp",
  svc1: "/real/svc-1.jpg",
  svc2: "/real/svc-2.jpg",
  svc3: "/real/svc-3.jpg",
  svc4: "/real/svc-4.jpg",
  svc5: "/real/svc-5.jpg",
  svc6: "/real/svc-6.jpg",
  svc7: "/real/svc-7.jpg",
  svc8: "/real/svc-8.jpg",
  svc9: "/real/svc-9.jpg",
  epcExpert: "/real/epc-expert.jpg",
  aboutVideo: "/real/about-hero.webp",
  about5: "/real/about-5.webp",
  about6: "/real/about-6.webp",
  hero: "/real/hero-banner.webp",
} as const;

/** Real team members. */
export const TEAM = [
  { name: "Sayeem Salmani", role: "Supply Chain Manager", img: "/real/team-sayeem.webp", email: "sam@negbuygroup.com" },
  { name: "Syed Maaz Raza", role: "Sales Team Leader", img: "/real/team-maaz.webp", email: "maaz.raza@negbuygroup.com" },
  { name: "Shahid Khan", role: "Sales Executive", img: "/real/team-shahid.webp", email: "sajid.ahmed@negbuygroup.com" },
  { name: "Ravi Kumar", role: "Sales Executive", img: "/real/team-ravi.webp", email: "ravi@negbuygroup.com" },
  { name: "Sunny Pandey", role: "Team Leader", img: "/real/team-sunny.webp", email: "sunny@negbuy.com" },
  { name: "Sanjay Pal", role: "Web Developer", img: "/real/team-sanjay.webp", email: "san.negbuy@gmail.com" },
  { name: "Osama Sheikh", role: "SEO Executive", img: "/real/team-osama.webp", email: "osama@negbuy.com" },
] as const;

/** OEM brand marks we service (real manufacturer names). */
export const BRANDS = [
  "GE Vernova",
  "Siemens Energy",
  "Mitsubishi Power",
  "Solar Turbines",
  "Ansaldo Energia",
  "MAN Energy",
  "Kawasaki",
  "Rolls-Royce",
  "Wärtsilä",
  "Honeywell",
] as const;
