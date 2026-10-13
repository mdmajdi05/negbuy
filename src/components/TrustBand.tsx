import { BRANDS } from "@/lib/media";

const CERTS = [
  { code: "ISO 9001", label: "Quality management", note: "Certified processes" },
  { code: "API", label: "Petroleum equipment", note: "Spec-compliant parts" },
  { code: "ASME", label: "Pressure & power", note: "Code-grade hardware" },
  { code: "ATEX", label: "Hazardous areas", note: "Zone-rated supply" },
  { code: "IECEx", label: "Explosion safety", note: "Global compliance" },
  { code: "OEM-Grade", label: "Matched to spec", note: "Form · fit · function" },
];

export default function TrustBand() {
  const row = [...BRANDS, ...BRANDS];

  return (
    <section className="nbTrust" id="trust" aria-label="Certifications and OEMs">
      <div className="nbTrustInner">
        <div className="nbTrustHead rv">
          <div className="kicker">Trusted &amp; certified</div>
          <h2>
            OEM-GRADE.
            <br />
            <span>AUDITED. PROVEN.</span>
          </h2>
          <p>
            We supply and overhaul equipment from the world&apos;s leading turbine
            OEMs — backed by certified quality systems and full traceability from
            feedstock to dispatch.
          </p>
        </div>

        <div className="nbCertGrid">
          {CERTS.map((c, i) => (
            <div className="nbCert rv" data-rv-delay={i * 70} key={c.code}>
              <b>{c.code}</b>
              <span>{c.label}</span>
              <small>{c.note}</small>
            </div>
          ))}
        </div>

        <div className="nbBrandWrap rv">
          <span className="nbBrandLabel">OEMs we service</span>
          <div className="nbBrandMarquee" aria-hidden="true">
            <div className="nbBrandTrack">
              {[0, 1].map((half) => (
                <div className="nbBrandHalf" key={half}>
                  {row.map((b, i) => (
                    <span className="nbBrandItem" key={`${half}-${i}`}>
                      {b}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
