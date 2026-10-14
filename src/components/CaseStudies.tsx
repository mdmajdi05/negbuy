import { PLANT, SECTOR, SERVICE } from "@/lib/media";

const CASES = [
  {
    no: "01",
    tag: "Combined cycle · 240 MW",
    title: "HOT-SECTION OVERHAUL, 4× GT",
    copy:
      "Emergency supply of combustor liners and transition pieces to bring four units back online ahead of peak demand.",
    img: PLANT.egypt,
    metrics: [
      { k: "18 days", v: "Site turnaround" },
      { k: "240 MW", v: "Capacity restored" },
      { k: "0", v: "Unplanned trips" },
    ],
  },
  {
    no: "02",
    tag: "Refinery · continuous duty",
    title: "REFINERY GT SPARES PROGRAMME",
    copy:
      "Multi-year consumables and capital spares stockholding for a downstream refinery running two frame gas turbines.",
    img: SECTOR.refinery,
    metrics: [
      { k: "1,400+", v: "Line items held" },
      { k: "24 h", v: "Emergency dispatch" },
      { k: "99.2%", v: "Line availability" },
    ],
  },
  {
    no: "03",
    tag: "Marine · offshore fleet",
    title: "FLEET ENGINE OVERHAUL",
    copy:
      "Planned overhauls and genuine OEM spares for a marine propulsion fleet, delivered to three ports in tandem.",
    img: SERVICE.marineOverhaul,
    metrics: [
      { k: "11 units", v: "Overhauled" },
      { k: "3 ports", v: "Simultaneous" },
      { k: "12 mth", v: "Warranty" },
    ],
  },
];

export default function CaseStudies() {
  return (
    <section className="nbCases light" id="cases" aria-label="Case studies">
      <div className="nbCasesInner">
        <div className="nbCasesHead rv">
          <div className="kicker">03 / Work in the field</div>
          <h2>
            PROOF,
            <br />
            <span>NOT PROMISES.</span>
          </h2>
          <p>
            A snapshot of recent supply, overhaul and spares programmes across
            power, oil &amp; gas and marine.
          </p>
        </div>

        <div className="nbCaseGrid">
          {CASES.map((c, i) => (
            <article className="nbCase rv" data-rv-delay={i * 120} key={c.no}>
              <div className="nbCaseShot">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.img} alt={c.title} loading="lazy" decoding="async" />
                <span className="nbCaseNo">{c.no}</span>
                <span className="nbCaseTag">{c.tag}</span>
              </div>
              <div className="nbCaseBody">
                <h3>{c.title}</h3>
                <p>{c.copy}</p>
                <ul className="nbCaseMetrics">
                  {c.metrics.map((m) => (
                    <li key={m.v}>
                      <b>{m.k}</b>
                      <span>{m.v}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
