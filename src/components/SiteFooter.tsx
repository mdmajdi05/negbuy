import Image from "next/image";
import Link from "next/link";

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
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="nbFootContact">
            <h4>Talk to us</h4>
            <a className="nbFootMail" href="mailto:contact@negbuy.com">
              contact@negbuy.com
            </a>
            <a className="nbFootMailsub" href="mailto:contact@negbuygroup.com">
              contact@negbuygroup.com
            </a>
            <a className="nbFootPhone" href="tel:+917011123269">
              +91 70111 23269
            </a>
            <p>Global feedstock · 24/7 emergency breakdown support</p>
            <Link className="nbFootCta" href="/contact">
              Request a quote <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>

        <div className="nbFootBottom">
          <span>© 2026 NEGBUY. All rights reserved.</span>
          <span>Energy · Turbine · Marine · Electrical</span>
        </div>
      </div>
    </footer>
  );
}
