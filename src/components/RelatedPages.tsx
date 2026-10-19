import Link from "next/link";

interface RelatedLink {
  key: string;
  href: string;
  index: string;
  kicker: string;
  title: string;
  copy: string;
}

/**
 * Cross-links the main site pages together (internal linking / SEO).
 * Pass the current page key via `exclude` so it never links to itself.
 */
const PAGES: RelatedLink[] = [
  {
    key: "products",
    href: "/products",
    index: "01",
    kicker: "The range",
    title: "Turbine parts & systems",
    copy: "Gas and steam turbines, generators and hot-section spares, matched to your build sheet.",
  },
  {
    key: "services",
    href: "/services",
    index: "02",
    kicker: "Solutions",
    title: "Service & overhaul",
    copy: "Installation, hot-section repair, electrical & automation, marine and EPC under one partner.",
  },
  {
    key: "about",
    href: "/about",
    index: "03",
    kicker: "Our company",
    title: "About NEGBUY",
    copy: "A decade of keeping turbines, refineries and fleets running worldwide.",
  },
  {
    key: "blog",
    href: "/blog",
    index: "04",
    kicker: "Journal",
    title: "Guides & insights",
    copy: "Field notes and technical guides on turbine maintenance and uptime.",
  },
  {
    key: "contact",
    href: "/contact",
    index: "05",
    kicker: "Talk to us",
    title: "Request a quote",
    copy: "Send a part number, photo or fault note — the desk replies with a scoped, fixed quote.",
  },
];

export default function RelatedPages({ exclude }: { exclude?: string }) {
  const links = PAGES.filter((p) => p.key !== exclude);

  return (
    <section className="nbRelated" aria-label="Related pages">
      <div className="nbRelatedInner">
        <div className="nbRelatedHead rv">
          <div className="kicker">Keep exploring</div>
          <h2>
            RELATED
            <br />
            <span>PAGES.</span>
          </h2>
        </div>
        <div className="nbRelatedGrid">
          {links.map((l, i) => (
            <Link
              className="nbRelatedCard rv"
              data-rv-delay={(i % 3) * 80}
              href={l.href}
              key={l.href}
            >
              <span className="nbRelatedNo">{l.index}</span>
              <span className="nbRelatedKicker">{l.kicker}</span>
              <h3>{l.title}</h3>
              <p>{l.copy}</p>
              <span className="nbRelatedArrow" aria-hidden="true">
                ↗
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
