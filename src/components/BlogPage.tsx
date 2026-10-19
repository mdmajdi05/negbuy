"use client";

import { useState } from "react";
import Link from "next/link";
import PageHero from "./PageHero";
import CtaForm from "./CtaForm";
import RelatedPages from "./RelatedPages";
import { MACHINE } from "@/lib/media";
import {
  POSTS_SORTED,
  POST_CATEGORIES,
  formatPostDate,
} from "@/lib/posts";
import { useReveal } from "@/hooks/useReveal";

const FILTERS = ["All", ...POST_CATEGORIES];

export default function BlogPage() {
  const [cat, setCat] = useState<string>("All");
  useReveal([cat]);

  const list =
    cat === "All" ? POSTS_SORTED : POSTS_SORTED.filter((p) => p.category === cat);
  const [lead, ...rest] = list;

  return (
    <div className="nbPage">
      <PageHero
        index="05"
        kicker="Journal"
        title={["Turbine", "Field Notes"]}
        lead="Inspection intervals, outage planning and spares sourcing, written from the floor of real turbine halls. No product brochures — just the numbers and the paperwork that decide whether a unit returns on date."
        image={MACHINE.bladesVanes}
        imageAlt="Compressor blades and vanes on a workshop bench"
        stats={[
          { k: String(POSTS_SORTED.length), v: "Field articles" },
          { k: "45,000+", v: "Part numbers" },
          { k: "24/7", v: "Breakdown desk" },
        ]}
      />

      <section
        className="nbBlog nbBlogIndex"
        id="journal-list"
        aria-label="Journal articles"
      >
        <div className="nbBlogInner">
          <div className="nbBlogBar rv">
            <div className="nbChips" role="tablist" aria-label="Filter by topic">
              {FILTERS.map((c) => (
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
            <span className="nbBlogCount">
              {list.length} {list.length === 1 ? "article" : "articles"}
            </span>
          </div>

          {lead && (
            <article className="nbFeat rv">
              <Link className="nbFeatLink" href={`/blog/${lead.slug}`}>
                <figure className="nbFeatShot">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={lead.cover}
                    alt={lead.coverAlt}
                    decoding="async"
                  />
                  <span className="nbFeatTag">Latest</span>
                  <span className="nbFeatCat">{lead.category}</span>
                </figure>

                <div className="nbFeatBody">
                  <div className="nbBlogMeta">
                    <time dateTime={lead.date}>{formatPostDate(lead.date)}</time>
                    <i aria-hidden="true" />
                    <span>{lead.read} min read</span>
                    <i aria-hidden="true" />
                    <span>{lead.author}</span>
                  </div>
                  <h2>{lead.title}</h2>
                  <p>{lead.excerpt}</p>
                  <ul className="nbTagRow">
                    {lead.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                  <span className="nbBtn">
                    Read the article
                    <svg viewBox="0 0 12 12" aria-hidden="true">
                      <path d="M1 6h9M7 3l3 3-3 3" />
                    </svg>
                  </span>
                </div>
              </Link>
            </article>
          )}

          <div className="nbBlogGrid">
            {rest.map((p, i) => (
              <article
                className="nbBlogCard rv"
                data-rv-delay={(i % 3) * 80}
                key={p.slug}
              >
                <Link className="nbBlogCardLink" href={`/blog/${p.slug}`}>
                  <div className="nbBlogShot">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.cover} alt={p.coverAlt} loading="lazy" decoding="async" />
                    <span className="nbBlogCat">{p.category}</span>
                  </div>
                  <div className="nbBlogBody">
                    <div className="nbBlogMeta">
                      <time dateTime={p.date}>{formatPostDate(p.date)}</time>
                      <i aria-hidden="true" />
                      <span>{p.read} min read</span>
                    </div>
                    <h3>{p.title}</h3>
                    <p>{p.excerpt}</p>
                    <span className="nbBlogMore">
                      Read article
                      <svg viewBox="0 0 12 12" aria-hidden="true">
                        <path d="M1 6h9M7 3l3 3-3 3" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {list.length === 0 && (
            <p className="nbBlogEmpty">
              Nothing filed under {cat} yet — browse the full journal instead.
            </p>
          )}
        </div>
      </section>

      <RelatedPages exclude="blog" />

      <CtaForm />
    </div>
  );
}
