
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

          <span className="nbBtn nbBlogAll">
            All articles
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="M1 6h9M7 3l3 3-3 3" />
            </svg>
          </span>
        </div>

        <div className="nbBlogGrid">
          {posts.map((p, i) => (
            <article
              className="nbBlogCard rv"
              data-rv-delay={(i % 3) * 80}
              key={p.slug}
            >
              <span className="nbBlogCardLink">
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
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
