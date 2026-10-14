// Journal content.
//
// Written by the NEGBUY technical desk: field notes, inspection intervals and
// procurement guidance from the gas & steam turbine aftermarket. Kept as plain
// data so both the index page and the home-page teaser share one source.

import { MACHINE, PLANT, SECTOR, SHOP } from "./media";

export type PostBlock =
  | { t: "p"; v: string }
  | { t: "h"; v: string }
  | { t: "ul"; v: string[] }
  | { t: "quote"; v: string; by: string }
  | { t: "table"; head: string[]; rows: string[][] };

export interface Post {
  /** URL segment: /blog/<slug> */
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  /** ISO yyyy-mm-dd. Formatted with a fixed month table to stay hydration-safe. */
  date: string;
  read: number;
  cover: string;
  coverAlt: string;
  author: string;
  role: string;
  tags: string[];
  body: PostBlock[];
}

export const POSTS: Post[] = [
  {
    slug: "compressor-fouling-heat-rate",
    category: "Maintenance",
    title: "Compressor fouling: what your heat rate is quietly telling you",
    excerpt:
      "A 2% heat-rate drift on a 200 MW frame is roughly 1.4 million dollars of fuel a year. Most of it starts as a thin film on the first three compressor stages.",
    date: "2026-09-28",
    read: 7,
    cover: MACHINE.bladesVanes,
    coverAlt: "Compressor blades and vanes laid out on a workshop bench",
    author: "NEGBUY Technical Desk",
    role: "Turbine engineering",
    tags: ["Compressor", "Heat rate", "Washing"],
    body: [
      {
        t: "p",
        v: "Fouling almost never announces itself. It arrives as a slow, boring shift in numbers the control room stopped looking at months ago: a slightly higher exhaust temperature, a slightly lower pressure ratio, a fuel flow that creeps up at the same ambient. By the time it is visible on the trend screen as a step change, it has usually been building for 4,000 to 8,000 operating hours.",
      },
      {
        t: "p",
        v: "On a compressor, airborne dirt collects where the air first turns. Stage 1 and 2 rotor blades and the inlet guide vanes take the bulk of it, then the film spreads rearward. The blade profiles are designed around a specific surface condition; when that surface is no longer smooth, the boundary layer thickens early and the whole characteristic changes.",
      },
      { t: "h", v: "Three signatures worth trending weekly" },
      {
        t: "ul",
        v: [
          "Corrected heat rate, normalised to a fixed ambient and fuel composition. A 1% drift is a real cost, not noise.",
          "Compressor pressure ratio (discharge over inlet) versus corrected speed. Fouling shows up here before it shows up in power output.",
          "Exhaust temperature spread. A widening spread is the late signal — it means some cans are being pushed to hold firing temperature.",
        ],
      },
      {
        t: "p",
        v: "If you only have time for one number, trend the pressure ratio. It is cheap to compute from existing instrumentation, it responds to fouling rather than to ambient, and it degrades in a way that is close to linear with deposit mass.",
      },
      { t: "h", v: "A typical drift pattern" },
      {
        t: "table",
        head: ["Parameter", "Clean reference", "After 6,000 h", "Act at"],
        rows: [
          ["Corrected heat rate", "baseline", "+1.0 to 2.5%", "+1.5%"],
          ["Compressor pressure ratio", "baseline", "−1.5 to 3.0%", "−2.0%"],
          ["Compressor efficiency", "baseline", "−0.8 to 1.8 pts", "−1.5 pts"],
          ["Exhaust temperature spread", "baseline", "+8 to 20 °C", "+25 °C"],
        ],
      },
      {
        t: "p",
        v: "These are typical industrial-frame ranges, not a specification. Your unit's own first-year trend is the only useful reference, which is the argument for capturing a clean baseline in the first 500 hours after an overhaul.",
      },
      { t: "h", v: "Online wash or offline wash?" },
      {
        t: "ul",
        v: [
          "Online (wet compression) wash runs at load with demineralised water injected at the inlet. It removes the soft, water-soluble fraction and can be done weekly. It does not touch baked-on deposits.",
          "Offline wash requires a crank soak, a heated detergent cycle and a rinse, so it costs you the unit for 6 to 14 hours. It restores the majority of the lost performance.",
          "The usual cadence is weekly online washes between offlines, and an offline wash tied to your combustion inspection turnaround.",
        ],
      },
      {
        t: "quote",
        v: "Fouling that has been left for two intervals no longer washes off. That deposit has to be grit-blasted by hand, and that is an overhaul, not a wash.",
        by: "Commissioning engineer, 250 MW combined cycle",
      },
      { t: "h", v: "When washing stops helping" },
      {
        t: "p",
        v: "If an offline wash recovers less than half the measured drift, you are no longer dealing with fouling. Erosion at the inlet stages, corrosion from salt-laden coastal air, or a mis-set inlet filter house is the more likely cause, and blade replacement or repair is a parts question rather than a cleaning question.",
      },
      {
        t: "p",
        v: "That is the point to bring in a borescope inspection and a stage-by-stage condition report before anything is ordered. Compressor blades and IGVs are stocked items for most industrial and heavy-duty frames; the lead time is usually weeks, not months, provided the part number is confirmed from the rotor assembly drawing rather than from a photograph.",
      },
    ],
  },
  {
    slug: "hot-gas-path-inspection-12-week-plan",
    category: "Overhauls",
    title: "Hot gas path inspection: the 12-week parts plan",
    excerpt:
      "The HGP itself is a two-week job. The other ten weeks are drawings, serial numbers, inspection findings and shipping — and that is where outages actually overrun.",
    date: "2026-09-09",
    read: 9,
    cover: MACHINE.gtEngine,
    coverAlt: "Gas turbine engine on a maintenance stand",
    author: "NEGBUY Outage Support",
    role: "Outage planning",
    tags: ["HGP", "Outage", "Combustion"],
    body: [
      {
        t: "p",
        v: "A hot gas path inspection is defined by the twelve-week window that surrounds it. The physical work — removing combustors, inspecting transition pieces, pulling stage 1 and 2 buckets, checking shrouds and seals — is well understood by any competent crew. What decides whether the unit returns on the contracted date is how the parts pipeline was organised before the first bolt moved.",
      },
      { t: "h", v: "Weeks −12 to −9: lock the configuration" },
      {
        t: "p",
        v: "Start with documentation, not with a shopping list. The rotor assembly drawing, the combustor can serial numbers and the last set of inspection reports together define what is actually installed. Frames get retrofit over a forty-year life; two otherwise identical units in the same plant often carry different bucket generations.",
      },
      {
        t: "ul",
        v: [
          "Collect frame model, unit serial, and every bill of material for hot-section components",
          "Confirm each installed part number against the assembly drawing, not against a previous purchase order",
          "Ask for the repair-versus-replace limits in writing before you scope the parts",
        ],
      },
      { t: "h", v: "Weeks −9 to −6: scope and quote" },
      {
        t: "p",
        v: "This is the longest single phase because it is where engineering and procurement disagree. Repair limits decide how much of the bucket set can be re-used, refurbished, or replaced. Ask for a written disposition matrix: for each component, the limit, the inspected condition, and the resulting action.",
      },
      {
        t: "quote",
        v: "The outage that goes wrong is the one where the crew opened the machine before anyone had confirmed what the spares list assumed.",
        by: "Plant maintenance manager, refinery cogeneration",
      },
      { t: "h", v: "Weeks −6 to −2: order and expedite" },
      {
        t: "table",
        head: ["Item", "Typical lead time", "Order by"],
        rows: [
          ["Stage 1 buckets, new", "16–28 weeks", "previous outage"],
          ["Stage 1 buckets, refurbished exchange", "6–10 weeks", "−8 weeks"],
          ["Transition pieces", "10–18 weeks", "−10 weeks"],
          ["Combustor liners and caps", "8–14 weeks", "−9 weeks"],
          ["Seals, gaskets, fasteners", "2–5 weeks", "−4 weeks"],
        ],
      },
      {
        t: "p",
        v: "Anything in the 16-week-and-over band cannot be recovered by expediting. If stage 1 buckets are on the list and the inspection is eight weeks away, the honest answer is that this outage runs on refurbished exchange hardware and the new set lands for the next one.",
      },
      { t: "h", v: "Weeks −2 to 0: stage the site" },
      {
        t: "ul",
        v: [
          "Kit the parts by machine location, not by supplier — one crate per combustor position",
          "Attach the disposition matrix to the crate lid so the crew is not re-deciding anything",
          "Confirm lifting gear, cradle positions and rotor stand clearances against the actual bay",
          "Brief the NDE subcontractor for the final blade-root and wheel-space inspections",
        ],
      },
      { t: "h", v: "The return-to-service week" },
      {
        t: "p",
        v: "Budget three days after the machine closes: alignment checks, boroscope verification of clearance, and the first start's vibration and exhaust spread data. That last dataset becomes the clean baseline for the next interval's heat-rate trending, so capture it properly rather than photographing the screen.",
      },
    ],
  },
  {
    slug: "borescope-or-teardown",
    category: "Inspection",
    title: "Borescope or teardown: choosing the cheaper answer",
    excerpt:
      "An unplanned teardown costs weeks of production. A borescope costs a shift. The decision is about what you expect to find, not about how the machine is running.",
    date: "2026-08-19",
    read: 6,
    cover: MACHINE.testCell,
    coverAlt: "Turbine in a test cell during inspection",
    author: "NEGBUY Technical Desk",
    role: "Condition assessment",
    tags: ["Borescope", "NDE", "Turnaround"],
    body: [
      {
        t: "p",
        v: "Every flexible borescope inspection is a wager: a shift of lost production against the possibility of avoiding four weeks of it. The wager is worth taking when the inspection has a specific question to answer, and it is not worth taking when it is a general look around.",
      },
      { t: "h", v: "Questions a borescope can settle" },
      {
        t: "ul",
        v: [
          "Is there a discrete foreign-object damage mark on a stage 1 or 2 bucket, and is it within the repair limit?",
          "Are the combustor liner cooling holes clear, or is there cracking between them?",
          "Is the tip clearance pattern symmetrical, or has a shroud segment moved?",
          "Is a rising vibration signature coming from the compressor or the turbine section?",
        ],
      },
      {
        t: "p",
        v: "If none of those questions is on the table, the scope will produce a set of ambiguous photographs and a recommendation to tear down anyway — in which case you should have simply torn down.",
      },
      { t: "h", v: "What each route actually costs" },
      {
        t: "table",
        head: ["Route", "Duration", "Production impact", "Information gained"],
        rows: [
          ["Borescope, hot section, no rotor turn", "6–12 h", "one shift", "combustors, transitions, stage 1 nozzle"],
          ["Borescope with rotor turn, inlet + hot section", "1–3 days", "1–3 days", "all stages, both vane rows, tips"],
          ["Top-half / partial teardown", "1–2 weeks", "1–2 weeks", "buckets removable, root inspection possible"],
          ["Full teardown", "3–6 weeks", "3–6 weeks", "complete rotor, bearings, alignment"],
        ],
      },
      { t: "h", v: "The evidence problem" },
      {
        t: "p",
        v: "A borescope result is only as good as its record. Ask for a numbered still frame for every location, with the inspection map marked so that position 14 on the map is a specific vane on a specific can. Without that, a later claim about crack growth has no reference photograph to grow from, and both the insurer and the OEM will push back.",
      },
      {
        t: "quote",
        v: "Two inspections six months apart are worth ten times one inspection. It is the delta that tells you whether a crack is stable.",
        by: "NDE lead, utility steam plant",
      },
      {
        t: "p",
        v: "The practical version of this is a fixed inspection map kept with the unit's permanent record. Inspect the same twenty points every time, on the same scope model, and the third interval starts to predict the fifth.",
      },
    ],
  },
  {
    slug: "lube-oil-five-numbers",
    category: "Reliability",
    title: "Lube oil analysis: five numbers that predict a bearing failure",
    excerpt:
      "Oil sampling is the cheapest condition-monitoring instrument on the plant. Five numbers, read together, will tell you a bearing is going before vibration does.",
    date: "2026-07-28",
    read: 8,
    cover: SHOP.controlRoom,
    coverAlt: "Plant control room with operators monitoring equipment data",
    author: "NEGBUY Reliability Desk",
    role: "Condition monitoring",
    tags: ["Lube oil", "Bearings", "Vibration"],
    body: [
      {
        t: "p",
        v: "A routine oil sample is a few hundred dollars and a week of turnaround. A journal bearing failure on a gas turbine rotor is an unplanned outage measured in months. The gap between those two numbers is why the sample programme deserves more attention than it usually gets — provided someone reads the results as a set rather than as five separate pass/fail flags.",
      },
      { t: "h", v: "1. Wear metals, and specifically the ratio" },
      {
        t: "p",
        v: "Iron alone is uninteresting: it is everywhere in a steel system. Iron rising faster than copper points at a journal surface or a gear mesh; copper rising faster than iron points at a babbit-lined bearing. The ratio carries more information than either element on its own.",
      },
      { t: "h", v: "2. Particle counts against ISO 4406" },
      {
        t: "p",
        v: "A clean turbine oil sits around 16/14/11 or better. A jump of more than one code in a single interval usually means a filter bypass, a breather failure, or a new source of debris such as a degrading seal.",
      },
      { t: "h", v: "3. Water content" },
      {
        t: "table",
        head: ["Measurement", "Normal", "Investigate", "Act"],
        rows: [
          ["Water (Karl Fischer)", "< 100 ppm", "100–250 ppm", "> 250 ppm"],
          ["Iron trend", "stable", "+25% per interval", "doubling in one interval"],
          ["Copper trend", "stable", "+25% per interval", "doubling in one interval"],
          ["ISO 4406 cleanliness", "16/14/11", "17/15/12", "19/17/14"],
          ["Viscosity @ 40 °C", "±5% of fill", "±10%", "> ±10%"],
        ],
      },
      { t: "h", v: "4. Viscosity drift" },
      {
        t: "p",
        v: "Viscosity moving up means oxidation or coolant ingress; moving down means fuel dilution or shear of a multi-grade. Both change the film thickness in the bearing, and neither is visible from the gauge on the reservoir.",
      },
      { t: "h", v: "5. Acid number against the new-oil value" },
      {
        t: "p",
        v: "Track the rise, not the absolute figure. An oil at 0.35 mg KOH/g when the fill was 0.05 is oxidising faster than an oil at 0.40 that started at 0.30. When the rise accelerates alongside a water finding, the right answer is usually a reservoir flush rather than an additive top-up.",
      },
      {
        t: "quote",
        v: "We caught a bad seal on a lube-oil cooler from a single potassium reading. That is a $2,000 repair against a $400,000 bearing.",
        by: "Reliability engineer, combined-cycle plant",
      },
      {
        t: "p",
        v: "Keep every sample record with the unit's history and never discard an interval from the trend because the unit was shut down. Partial intervals through a start-up are exactly where contamination enters the system, and removing them flattens the very signature you are looking for.",
      },
    ],
  },
  {
    slug: "genuine-or-equivalent-spares",
    category: "Procurement",
    title: "Genuine or equivalent spares: where the warranty actually sits",
    excerpt:
      "The price difference between OEM and aftermarket turbine parts is real, and so is the paperwork difference. Here is what each route actually buys you.",
    date: "2026-07-06",
    read: 6,
    cover: SECTOR.spareParts,
    coverAlt: "Turbine spare parts arranged on a workshop floor",
    author: "NEGBUY Supply Desk",
    role: "Parts sourcing",
    tags: ["Spares", "Warranty", "Traceability"],
    body: [
      {
        t: "p",
        v: "The argument over equivalent parts is usually framed as quality. In practice it is framed by two documents: the material certificate and the warranty clause. Get those right and a qualified aftermarket part is a defensible engineering decision. Get them wrong and the saving is a liability with a part number.",
      },
      { t: "h", v: "What a genuine part carries" },
      {
        t: "ul",
        v: [
          "OEM part number traceable to the frame serial and the assembly drawing revision",
          "Material and heat-treat certificates from the OEM supply chain",
          "A warranty that is usually conditional on OEM-supervised installation and OEM consumables",
          "A documented design provenance, which matters if there is ever an insurance or litigation question",
        ],
      },
      { t: "h", v: "What a qualified equivalent carries" },
      {
        t: "ul",
        v: [
          "A dimensional report against the OEM drawing, measured and signed",
          "Raw material certification to the same specification, from a named mill",
          "Coating and heat-treatment records if the part is a hot-section item",
          "A warranty on the part itself, and — this is the part to negotiate — on consequential damage",
        ],
      },
      { t: "h", v: "The decision in practice" },
      {
        t: "table",
        head: ["Component class", "Aftermarket risk", "Usual recommendation"],
        rows: [
          ["Consumables, filters, gaskets, fasteners", "low", "aftermarket, standard traceability"],
          ["Static casings, brackets, piping", "low", "aftermarket with dimensional report"],
          ["Combustion liners, transitions", "medium", "aftermarket from a qualified shop"],
          ["Buckets, nozzles, rotor forgings", "high", "OEM or fully traceable exchange"],
          ["Control system hardware and software", "high", "OEM, for serviceability reasons"],
        ],
      },
      {
        t: "quote",
        v: "We buy aftermarket for everything that cannot destroy the rotor. Above that line it is OEM or it does not go in.",
        by: "Procurement director, independent power producer",
      },
      { t: "h", v: "Questions to ask before you accept a quote" },
      {
        t: "ul",
        v: [
          "Which drawing revision was the part measured against, and can I see the report?",
          "Who is the mill, and can I see the certificate rather than a summary of it?",
          "What does the warranty exclude, in plain language?",
          "If the part fails and damages the machine, what is covered?",
          "Will you provide an exchange unit on the same lead time for the next outage?",
        ],
      },
      {
        t: "p",
        v: "A supplier who cannot answer these without a round of internal email is not a supplier for a hot-section component. The answers are either in the file or they do not exist.",
      },
    ],
  },
  {
    slug: "long-lead-turbine-spares",
    category: "Supply chain",
    title: "Planning around 26-week long-lead turbine spares",
    excerpt:
      "If a part takes half a year to arrive, then the ordering decision belongs in the previous outage — not in the one where it is needed.",
    date: "2026-06-11",
    read: 7,
    cover: PLANT.aerial,
    coverAlt: "Aerial view of a power plant site",
    author: "NEGBUY Supply Desk",
    role: "Global sourcing",
    tags: ["Lead time", "Inventory", "Planning"],
    body: [
      {
        t: "p",
        v: "Long-lead planning is not a purchasing problem, it is an information problem. The parts that hurt are not the ones with famous lead times; they are the ones nobody checked, because everyone assumed the warehouse had one.",
      },
      { t: "h", v: "Classify by consequence, not by price" },
      {
        t: "ul",
        v: [
          "Critical, single-source, over 16 weeks: hold a spare on site or place a standing order with a date already reserved on the supplier's line",
          "Critical, dual-source, 6–16 weeks: keep the supplier relationship warm and pre-agree the exchange price",
          "Non-critical: buy on failure and accept the downtime, which is usually measured in hours",
        ],
      },
      {
        t: "p",
        v: "A part's price is a poor proxy for its urgency. A turbine-side seal ring costing a few thousand dollars can hold a 200 MW unit offline for a fortnight, while a multi-million-dollar rotor forging is normally planned years ahead.",
      },
      { t: "h", v: "The reservation trick" },
      {
        t: "p",
        v: "For hot-section hardware, ask a qualified supplier to reserve production capacity rather than stock. A named slot on a machining schedule, tied to a future outage date and releaseable on 30 days' notice, costs a fraction of carrying the finished part — and it survives the schedule shifts that every outage programme experiences.",
      },
      { t: "h", v: "Build the horizon into the outage calendar" },
      {
        t: "table",
        head: ["Horizon", "Action"],
        rows: [
          ["Next 3 months", "consume reserved slots, confirm shipping documents"],
          ["3–12 months", "reserve capacity, freeze drawing revisions"],
          ["1–3 years", "frame-level spares strategy, budget for hot-section set"],
          ["3+ years", "life-extension decisions, rotor and casing replacement planning"],
        ],
      },
      {
        t: "quote",
        v: "We stopped asking how long a part takes and started asking when the supplier's line is next free. The answer changed our calendar, not our budget.",
        by: "Head of maintenance, 1,200 MW portfolio",
      },
      {
        t: "p",
        v: "The output of all this is a single sheet: every critical part, its actual measured lead time from the last three purchases, and the latest date it can be ordered to land before the next planned outage. Once that sheet exists, the rest of the outage programme becomes scheduling rather than improvisation.",
      },
    ],
  },
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Fixed formatting table — avoids server/client locale drift in rendered dates. */
export function formatPostDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${String(d).padStart(2, "0")} ${MONTHS[m - 1]} ${y}`;
}

/** Newest first. */
export const POSTS_SORTED: Post[] = [...POSTS].sort((a, b) =>
  a.date < b.date ? 1 : -1
);

export const POST_CATEGORIES = Array.from(
  new Set(POSTS.map((p) => p.category))
);

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}
