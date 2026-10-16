import Link from "next/link";
import { POSTS_SORTED, formatPostDate } from "@/lib/posts";

/** Home-page journal strip: the three newest field notes. */
export default function BlogTeaser() {
  const posts = POSTS_SORTED.slice(0, 3);

  return (
    <section className="nbBlog nbBlogHome" id="journal" aria-label="Journal">
      <div className="nbBlogInner">
        <div className="nbBlogHead rv">
          <div className="nbBlogHeadCopy">
            <div className="kicker">Journal</div>
            <h2>
              FIELD
              <br />
              <span>NOTES.</span>
            </h2>
            <p>
              What we see on real units: fouling trends, outage sequencing,
              oil-sample verdicts and the paperwork that decides whether a
              machine returns on date.
            </p>
          </div>

          <Link className="nbBtn nbBlogAll nbBlogAllTop" href="/blog">
            All articles
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="M1 6h9M7 3l3 3-3 3" />
            </svg>
          </Link>
        </div>

        <div className="nbBlogGrid">
          {posts.map((p, i) => (
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
      </div>
    </section>
  );
}
