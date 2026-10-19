"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import CtaForm from "./CtaForm";
import RelatedPages from "./RelatedPages";
import { SITE, whatsappUrl } from "@/lib/site";
import {
  POSTS_SORTED,
  formatPostDate,
  getPost,
  type PostBlock,
} from "@/lib/posts";
import { useReveal } from "@/hooks/useReveal";

/** Turn a heading into a URL-safe, unique anchor id. */
function headingId(text: string) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

function Block({ block, id }: { block: PostBlock; id?: string }) {
  switch (block.t) {
    case "h":
      return (
        <h2 className="nbPostH" id={id}>
          {block.v}
        </h2>
      );
    case "p":
      return <p>{block.v}</p>;
    case "ul":
      return (
        <ul className="nbPostUl">
          {block.v.map((li) => (
            <li key={li}>{li}</li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote className="nbPostQuote">
          <p>{block.v}</p>
          <cite>{block.by}</cite>
        </blockquote>
      );
    case "table":
      return (
        <div className="nbPostTableWrap">
          <table className="nbPostTable">
            <thead>
              <tr>
                {block.head.map((h) => (
                  <th key={h} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.join("|")}>
                  {row.map((cell, i) =>
                    i === 0 ? (
                      <th key={cell} scope="row">
                        {cell}
                      </th>
                    ) : (
                      <td key={cell}>{cell}</td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

function ShareIcon({ name }: { name: string }) {
  if (name === "whatsapp") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    );
  }
  if (name === "x") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (name === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    );
  }
  if (name === "facebook") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }
  if (name === "check") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export default function BlogPostPage({ slug }: { slug: string }) {
  useReveal();

  const post = getPost(slug);

  const [copied, setCopied] = useState(false);

  /** Table of contents, built from the body's `h` blocks with unique ids. */
  const headings = useMemo(() => {
    const seen = new Map<string, number>();
    const out: { id: string; text: string; index: number }[] = [];
    (post?.body ?? []).forEach((block, index) => {
      if (block.t !== "h") return;
      const base = headingId(block.v);
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      out.push({ id: count ? `${base}-${count + 1}` : base, text: block.v, index });
    });
    return out;
  }, [post]);

  const headingIdByIndex = useMemo(
    () => new Map(headings.map((h) => [h.index, h.id])),
    [headings],
  );

  if (!post) {
    return (
      <div className="nbPage">
        <section className="nbBlog">
          <div className="nbBlogInner">
            <p className="nbBlogEmpty">
              That article has moved. <Link href="/blog">Back to the journal</Link>
            </p>
          </div>
        </section>
      </div>
    );
  }

  const more = POSTS_SORTED.filter((p) => p.slug !== post.slug).slice(0, 3);
  const issueNumber = String(
    POSTS_SORTED.findIndex((item) => item.slug === post.slug) + 1,
  ).padStart(2, "0");
  const shareUrl = `${SITE.url}/blog/${post.slug}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  const shareTargets = [
    {
      key: "whatsapp",
      label: "Share on WhatsApp",
      href: whatsappUrl(`${post.title} ${shareUrl}`),
    },
    {
      key: "x",
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        shareUrl,
      )}&text=${encodeURIComponent(post.title)}`,
    },
    {
      key: "linkedin",
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        shareUrl,
      )}`,
    },
    {
      key: "facebook",
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl,
      )}`,
    },
  ];

  return (
    <div className="nbPage">
      <article className="nbPost">
        <header className="nbPostHead">
          <div className="nbPostHeadInner">
            <nav className="nbCrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <i aria-hidden="true">/</i>
              <Link href="/blog">Journal</Link>
              <i aria-hidden="true">/</i>
              <span>{post.category}</span>
            </nav>

            <div className="nbPostTitleRow">
              <div className="nbPostHeadCopy">
                <div className="kicker">{post.category} / Field note</div>
                <h1>{post.title}</h1>
                <div className="nbBlogMeta">
                  <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                  <i aria-hidden="true" />
                  <span>{post.read} min read</span>
                  <i aria-hidden="true" />
                  <span>
                    {post.author} · {post.role}
                  </span>
                </div>
              </div>
              <aside className="nbPostEdition" aria-label="Journal issue">
                <span>NEGBUY / JOURNAL</span>
                <strong>{issueNumber}</strong>
                <span>FIELD NOTE</span>
              </aside>
            </div>
          </div>
        </header>

        <div className="nbPostShell">
          {/* Left rail — vertical share actions (desktop only) */}
          <aside className="nbPostRail">
            <div className="nbPostRailSticky">
              <span className="nbPostRailLabel">Share</span>
              {shareTargets.map((t) => (
                <a
                  key={t.key}
                  className={`nbShareIcon is-${t.key}`}
                  href={t.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t.label}
                  title={t.label}
                >
                  <ShareIcon name={t.key} />
                </a>
              ))}
              <button
                type="button"
                className={`nbShareIcon is-copy${copied ? " is-done" : ""}`}
                onClick={copyLink}
                aria-label="Copy link"
                title="Copy link"
              >
                <ShareIcon name={copied ? "check" : "copy"} />
              </button>
            </div>
          </aside>

          {/* Article column */}
          <div className="nbPostBody nbPostMain rv">
            <figure className="nbPostCover">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.cover} alt={post.coverAlt} fetchPriority="high" />
              <figcaption>{post.coverAlt}</figcaption>
            </figure>
            <p className="nbPostLead">{post.excerpt}</p>

            <div className="nbPostInlineShare" aria-label="Share this article">
              <span>Share</span>
              {shareTargets.map((target) => (
                <a
                  key={target.key}
                  className={`nbShareIcon is-${target.key}`}
                  href={target.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={target.label}
                  title={target.label}
                >
                  <ShareIcon name={target.key} />
                </a>
              ))}
              <button
                type="button"
                className={`nbShareIcon is-copy${copied ? " is-done" : ""}`}
                onClick={copyLink}
                aria-label="Copy link"
                title="Copy link"
              >
                <ShareIcon name={copied ? "check" : "copy"} />
              </button>
            </div>

            {headings.length > 1 && (
              <nav className="nbPostToc" aria-label="On this page">
                <p>On this page</p>
                <ol>
                  {headings.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`}>{h.text}</a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {post.body.map((block, i) => (
              <Block
                key={`${block.t}-${i}`}
                block={block}
                id={headingIdByIndex.get(i)}
              />
            ))}

            <ul className="nbTagRow">
              {post.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>

            <div className="nbPostShare">
              <span className="nbPostShareLabel">Share</span>
              {shareTargets.map((t) => (
                <a
                  key={t.key}
                  href={t.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.key === "x"
                    ? "X"
                    : t.key.charAt(0).toUpperCase() + t.key.slice(1)}
                </a>
              ))}
              <button type="button" onClick={copyLink}>
                {copied ? "Link copied" : "Copy link"}
              </button>
            </div>

            <div className="nbPostBy">
              <span className="nbPostByMark" aria-hidden="true">
                NB
              </span>
              <div>
                <b>{post.author}</b>
                <span>{post.role} — NEGBUY Group</span>
              </div>
              <Link className="nbBtn" href="/contact">
                Talk to the desk
                <svg viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M1 6h9M7 3l3 3-3 3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right sidebar (desktop only) */}
          <aside className="nbPostSide">
            <div className="nbPostSideSticky">
              <div className="nbSideCard is-quote">
                <p className="nbSideKicker">Talk to the desk</p>
                <h3>Need a part or a quote?</h3>
                <p>
                  Send a part number or a fault note — our engineers reply
                  within 24 hours.
                </p>
                <Link className="nbBtn" href="/contact">
                  Request a quote
                  <svg viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M1 6h9M7 3l3 3-3 3" />
                  </svg>
                </Link>
              </div>

              <div className="nbSideCard">
                <p className="nbSideKicker">Keep reading</p>
                <ul className="nbSideList">
                  {more.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/blog/${p.slug}`}>
                        <span>{p.category}</span>
                        <b>{p.title}</b>
                        <small>{p.read} min read</small>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="nbSideCard is-desk">
                <p className="nbSideKicker">24/7 breakdown desk</p>
                <a
                  href={whatsappUrl(
                    "Hi NEGBUY, I have a breakdown enquiry.",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp · {SITE.phone}
                </a>
                <a href={SITE.phoneHref}>Call {SITE.phone}</a>
              </div>
            </div>
          </aside>
        </div>
      </article>

      <section className="nbBlog" aria-label="More field notes">
        <div className="nbBlogInner">
          <div className="nbBlogHead rv">
            <div className="kicker">Keep reading</div>
            <h2>
              MORE FIELD
              <br />
              <span>NOTES</span>
            </h2>
          </div>

          <div className="nbBlogGrid">
            {more.map((p, i) => (
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

          <Link className="nbBtn nbBlogAll" href="/blog">
            All articles
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="M1 6h9M7 3l3 3-3 3" />
            </svg>
          </Link>
        </div>
      </section>

      <RelatedPages exclude="blog" />

      <CtaForm />
    </div>
  );
}
