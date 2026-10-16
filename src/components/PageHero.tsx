import Link from "next/link";

interface PageHeroProps {
  index: string;
  kicker: string;
  title: string[];
  lead: string;
  image: string;
  imageAlt: string;
  backHref?: string;
  backLabel?: string;
  stats?: { k: string; v: string }[];
}

export default function PageHero({
  index,
  kicker,
  title,
  lead,
  image,
  imageAlt,
  backHref = "/",
  backLabel = "Home",
  stats,
}: PageHeroProps) {
  return (
    <section className="nbPageHero" aria-label={kicker}>
      <div className="nbPageHeroBg" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" />
        <span />
      </div>

      <div className="nbPageHeroInner">
        <nav className="nbCrumb" aria-label="Breadcrumb">
          <span>{backLabel}</span>
          <i aria-hidden="true">/</i>
          <span>{kicker}</span>
        </nav>

        <div className="nbPageHeroGrid">
          <div className="nbPageHeroCopy">
            <div className="kicker">
              {index} / {kicker}
            </div>
            <h1>
              {title.map((line, i) => (
                <span key={line}>
                  {line}
                  {i < title.length - 1 && <br />}
                </span>
              ))}
            </h1>
            <p>{lead}</p>
            {stats && (
              <ul className="nbPageHeroStats">
                {stats.map((s) => (
                  <li key={s.v}>
                    <b>{s.k}</b>
                    <span>{s.v}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <figure className="nbPageHeroFig">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={imageAlt} />
          </figure>
        </div>
      </div>
    </section>
  );
}
