import Image from "next/image";

import { OFFICES, SITE } from "@/lib/site";

const COLUMNS = [
  {
    title: "Products",
    links: [
      { href: "/products", label: "Gas Turbines" },
      { href: "/products#spares", label: "GT Spare Parts" },
      { href: "/products#steam", label: "Steam Turbines" },
      { href: "/products#generators", label: "Generators" },
      { href: "/products#siemens", label: "Siemens SGT Spares" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { href: "/services#turbine", label: "Turbine Solutions" },
      { href: "/services#oilgas", label: "Oil & Gas" },
      { href: "/services#electrical", label: "Electrical & Automation" },
      { href: "/services#marine", label: "Marine & Offshore" },
      { href: "/services#epc", label: "EPC Services" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "Our Company" },
      { href: "/about#story", label: "Our Story" },
      { href: "/#industries", label: "Industries" },
      { href: "/#cases", label: "Case Studies" },
      { href: "/blog", label: "Journal" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="nbFooter">
      <div className="nbFootMark" aria-hidden="true">
        NEGBUY
      </div>
      <div className="nbFootInner">
        <div className="nbFootGrid">
          <div className="nbFootBrand">
            <Image
              className="footerLogo"
              src="/header-logo.png"
              alt="NEGBUY logo"
              width={659}
              height={302}
              sizes="110px"
            />
            <p>
              NEGBUY supplies genuine gas &amp; steam turbine parts, generators and
              overhaul services for power plants, refineries and marine fleets
              worldwide — with OEM-grade quality and global feedstock.
            </p>
            <div className="nbFootCerts">
              <span>ISO 9001</span>
              <span>API</span>
              <span>ASME</span>
              <span>OEM-Grade</span>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <nav className="nbFootCol" key={col.title} aria-label={col.title}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <span>{link.label}</span>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="nbFootContact">
            <h4>Talk to us</h4>
            <a className="nbFootMail" href={`mailto:${SITE.emails.general}`}>
              {SITE.emails.general}
            </a>
            <a className="nbFootMailsub" href={`mailto:${SITE.emails.group}`}>
              {SITE.emails.group}
            </a>
            <a className="nbFootPhone" href={SITE.phoneHref}>
              {SITE.phone}
            </a>
            <p>Global feedstock · 24/7 emergency breakdown support</p>
            <span className="nbFootCta">
              Request a quote <span aria-hidden="true">↗</span>
            </span>
          </div>
        </div>

        <section className="nbFootOffices" aria-label="Our locations">
          <h4>Our locations</h4>
          <div className="nbFootOfficeGrid">
            {OFFICES.map((office) => (
              <address className="nbFootOffice" key={office.country}>
                <strong>{office.country}</strong>
                <span>{office.role}</span>
                {office.lines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </address>
            ))}
          </div>
        </section>

        <div className="nbFootBottom">
          <span>© 2026 NEGBUY. All rights reserved.</span>
          <span>Energy · Turbine · Marine · Electrical</span>
        </div>
      </div>
    </footer>
  );
}
