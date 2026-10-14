/* ------------------------------------------------------------------ *
 * Group of Companies — the real NEGBUY entities and where they sit.
 * Addresses are the registered operating locations of the group.
 * ------------------------------------------------------------------ */

import { OFFICES, SITE } from "@/lib/site";

export default function GroupCompanies() {
  return (
    <section className="nbOffices nbGroup" aria-label="Group of companies">
      <div className="nbOfficesInner">
        <div className="nbOfficesHead rv">
          <div className="kicker">Group of companies</div>
          <h2>
            ONE GROUP.
            <br />
            <span>FOUR TIME ZONES.</span>
          </h2>
        </div>

        <div className="nbOfficeGrid">
          {OFFICES.map((office, i) => (
            <article
              className="nbOffice rv"
              data-rv-delay={i * 80}
              key={office.country}
            >
              <h3>{office.country}</h3>
              <b>{office.role}</b>
              <address>
                {office.lines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </address>
            </article>
          ))}
        </div>

        <div className="nbGroupContact rv">
          <span className="nbGroupContactLabel">Group desk</span>
          {[SITE.emails.group, SITE.emails.general].map((email) => (
            <a href={`mailto:${email}`} key={email}>
              {email}
            </a>
          ))}
          <a href={SITE.phoneHref}>{SITE.phone}</a>
        </div>
      </div>
    </section>
  );
}
