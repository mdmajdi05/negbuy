"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import PageHero from "./PageHero";
import CtaForm from "./CtaForm";
import { OEM, SECTOR, PLANT, MACHINE } from "@/lib/media";
import { useReveal } from "@/hooks/useReveal";

type Category = "All" | "Gas turbines" | "Steam turbines" | "Generators" | "Spares";

interface Product {
  no: string;
  name: string;
  model: string;
  category: Exclude<Category, "All">;
  img: string;
  output: string;
  notes: string;
  tags: string[];
}

const CATEGORIES: Category[] = [
  "All",
  "Gas turbines",
  "Steam turbines",
  "Generators",
  "Spares",
];

const PRODUCTS: Product[] = [
  { no: "01", name: "SGT5-8000H", model: "Heavy-duty gas turbine", category: "Gas turbines", img: OEM.sgt5_8000h, output: "450 MW class", notes: "High-efficiency single-shaft frame for combined-cycle power.", tags: ["Heavy duty", "50 Hz"] },
  { no: "02", name: "SGT6-8000H", model: "Heavy-duty gas turbine", category: "Gas turbines", img: OEM.sgt6_8000h, output: "310 MW class", notes: "60 Hz frame with proven hot-gas-path architecture.", tags: ["Heavy duty", "60 Hz"] },
  { no: "03", name: "SGT6-5000F", model: "Frame gas turbine", category: "Gas turbines", img: OEM.sgt6_5000f, output: "230 MW class", notes: "Robust F-class workhorse for baseload and cycling.", tags: ["F-class", "Baseload"] },
  { no: "04", name: "SGT-800", model: "Industrial gas turbine", category: "Gas turbines", img: OEM.sgt800c1, output: "50 MW class", notes: "Industry benchmark for refinery and industrial CHP duty.", tags: ["Industrial", "CHP"] },
  { no: "05", name: "SGT-750", model: "Industrial gas turbine", category: "Gas turbines", img: OEM.sgt750, output: "40 MW class", notes: "Compact twin-shaft unit with high part-load efficiency.", tags: ["Twin shaft"] },
  { no: "06", name: "SGT-700", model: "Industrial gas turbine", category: "Gas turbines", img: OEM.sgt700, output: "33 MW class", notes: "Mechanical-drive and generator-drive configurations.", tags: ["Mechanical drive"] },
  { no: "07", name: "SST-6000", model: "Steam turbine", category: "Steam turbines", img: OEM.sst6000, output: "up to 1,900 MW", notes: "Large single-shaft tandem-compound steam turbine.", tags: ["Utility", "Tandem"] },
  { no: "08", name: "SST-700/900", model: "Steam turbine", category: "Steam turbines", img: OEM.sst700_900, output: "100–250 MW", notes: "Modular reheat steam turbine for combined-cycle plants.", tags: ["Reheat", "Modular"] },
  { no: "09", name: "SST-600", model: "Steam turbine", category: "Steam turbines", img: OEM.sst600, output: "up to 200 MW", notes: "Two-casing reheat unit for high steam parameters.", tags: ["Two-casing"] },
  { no: "10", name: "SST-3000", model: "Steam turbine", category: "Steam turbines", img: OEM.sst3000, output: "up to 1,200 MW", notes: "Axial single-flow design for large power stations.", tags: ["Utility"] },
  { no: "11", name: "SGen-100A", model: "Air-cooled generator", category: "Generators", img: OEM.sgen100a, output: "20–370 MVA", notes: "Air-cooled, cylindrical-rotor turbo generator.", tags: ["Air-cooled"] },
  { no: "12", name: "SGen-3000W", model: "Hydrogen-cooled generator", category: "Generators", img: OEM.sgen3000w, output: "up to 1,400 MVA", notes: "High-output generator for large combined-cycle plants.", tags: ["H₂-cooled"] },
  { no: "13", name: "Combustor liner set", model: "Hot-gas-path spares", category: "Spares", img: OEM.phoenix, output: "OEM-matched", notes: "Liners, transition pieces and seals to build-sheet spec.", tags: ["Hot section"] },
  { no: "14", name: "Compressor blade set", model: "Compressor spares", category: "Spares", img: MACHINE.bladesVanes, output: "Form-fit-function", notes: "Blades and vanes machined and matched to your rotor.", tags: ["Blades", "Vanes"] },
  { no: "15", name: "Turbine rotor assembly", model: "Rotor spares", category: "Spares", img: MACHINE.rotor1970, output: "Balanced", notes: "Bladed rotors balanced to micron tolerance.", tags: ["Rotor", "Balanced"] },
  { no: "16", name: "Ignition & flame detection", model: "Auxiliary spares", category: "Spares", img: MACHINE.turboshaft, output: "Genuine / equiv.", notes: "Igniters, flame detectors, speed probes and harnesses.", tags: ["Controls"] },
];

const SPARES = [
  { title: "Global feedstock", copy: "Local stockholding of fast-movers plus sourced long-lead items from verified global feedstock.", img: SECTOR.global, icon: "/oem/wm-factory-mapna-05.jpg" },
  { title: "OEM-grade quality", copy: "Dimensionally inspected and material-certified against the original build sheet.", img: MACHINE.statorBlade, icon: "/oem/wm-blades-vanes.jpg" },
  { title: "Rapid dispatch", copy: "Emergency breakdown parts picked, crated and sealed for onward shipment.", img: PLANT.aerial, icon: "/oem/wm-test-cell.jpg" },
  { title: "Technical expertise", copy: "Engineers read part numbers, photos and nameplates to identify the right unit first time.", img: MACHINE.gtEngine, icon: "/oem/wm-control-room.jpg" },
];

export default function ProductsPage() {
  const [cat, setCat] = useState<Category>("All");
  const [query, setQuery] = useState("");
  useReveal([cat, query]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      const inCat = cat === "All" || p.category === cat;
      const inQ =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        p.tags.join(" ").toLowerCase().includes(q);
      return inCat && inQ;
    });
  }, [cat, query]);

  return (
    <div className="nbPage">
      <PageHero
        index="01"
        kicker="Products"
        title={["TURBINE", "PARTS & SYSTEMS."]}
        lead="Genuine and OEM-grade gas and steam turbines, generators and hot-section spares — supplied, matched and dispatched against your build sheet."
        image={OEM.gtHero}
        imageAlt="Real gas turbine compressor blades"
        stats={[
          { k: "45,000+", v: "Part numbers" },
          { k: "48 h", v: "Emergency dispatch" },
          { k: "100%", v: "Traceable" },
        ]}
      />

      {/* Catalogue */}
      <section className="nbCatalogue" id="catalogue" aria-label="Product catalogue">
        <div className="nbCatalogueInner">
          <div className="nbCatalogueHead rv">
            <div className="kicker">The range</div>
            <h2>
              SELECT
              <br />
              <span>YOUR UNIT.</span>
            </h2>
            <div className="nbFilterBar">
              <div className="nbChips" role="tablist" aria-label="Filter by category">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="tab"
                    aria-selected={cat === c}
                    className={cat === c ? "on" : ""}
                    onClick={() => setCat(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <label className="nbSearch">
                <span aria-hidden="true">⌕</span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search model, e.g. SGT-800"
                  aria-label="Search products"
                />
              </label>
            </div>
          </div>

          <div className="nbProdGrid">
            {list.map((p, i) => (
              <article className="nbProd rv" data-rv-delay={(i % 4) * 70} key={p.no}>
                <div className="nbProdShot">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.img} alt={p.name} loading="lazy" decoding="async" />
                  <span className="nbProdNo">{p.no}</span>
                  <span className="nbProdCat">{p.category}</span>
                </div>
                <div className="nbProdBody">
                  <span className="nbProdModel">{p.model}</span>
                  <h3>{p.name}</h3>
                  <p>{p.notes}</p>
                  <div className="nbProdFoot">
                    <span className="nbProdOut">{p.output}</span>
                    <span className="nbProdTags">
                      {p.tags.map((t) => (
                        <em key={t}>{t}</em>
                      ))}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {list.length === 0 && (
            <p className="nbEmpty">
              No units match that filter. <button onClick={() => { setCat("All"); setQuery(""); }}>Reset</button>
            </p>
          )}
        </div>
      </section>

      {/* Spares promise */}
      <section className="nbSpares" id="spares" aria-label="Spares supply">
        <div className="nbSparesInner">
          <div className="nbSparesHead rv">
            <div className="kicker">02 / Spares supply</div>
            <h2>
              WHEN IT&apos;S DOWN,
              <br />
              <span>WE MOVE FAST.</span>
            </h2>
            <p>
              A global feedstock of turbine spares, held and matched so an
              unplanned outage becomes a planned repair.
            </p>
          </div>
          <div className="nbSparesGrid">
            {SPARES.map((s, i) => (
              <article className="nbSpare rv" data-rv-delay={i * 90} key={s.title}>
                <div className="nbSpareShot">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.img} alt={s.title} loading="lazy" decoding="async" />
                </div>
                <h3>{s.title}</h3>
                <p>{s.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Siemens SGT band */}
      <section className="nbSiemens" id="siemens" aria-label="Siemens SGT spares">
        <div className="nbSiemensInner">
          <figure className="nbSiemensShot rv">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SECTOR.siemens} alt="Siemens SGT spare parts" loading="lazy" decoding="async" />
          </figure>
          <div className="nbSiemensCopy rv" data-rv-delay="120">
            <div className="kicker">03 / Specialist line</div>
            <h2>
              SIEMENS
              <br />
              SGT SPARES.
            </h2>
            <p>
              Dedicated stock and sourcing for the Siemens SGT family —
              combustors, blades, seals, auxiliaries and controls, matched to
              your frame and dispatch-ready.
            </p>
            <ul className="nbSiemensList">
              <li>SGT-100 · SGT-200 · SGT-300</li>
              <li>SGT-400 · SGT-500 · SGT-600</li>
              <li>SGT-700 · SGT-750 · SGT-800</li>
            </ul>
            <Link className="nbBtn" href="/contact">
              Request availability <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      <CtaForm />
    </div>
  );
}
