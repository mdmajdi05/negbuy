"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CtaForm from "./CtaForm";
import { SITE } from "@/lib/site";
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

export default function BlogPostPage({ slug }: { slug: string }) {
  useReveal();

  const post = getPost(slug);

  /** Reading-progress fraction (0–1), driven by scroll position. */
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

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

  return (
    <div className="nbPage">
      <div className="nbPostProgress" aria-hidden="true">
        <i style={{ width: `${progress * 100}%` }} />
      </div>

      <article className="nbPost">
        <header className="nbPostHead">
          <div className="nbPostHeadBg" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.cover} alt="" />
            <span />
          </div>

          <div className="nbPostHeadInner">
            <nav className="nbCrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <i aria-hidden="true">/</i>
              <Link href="/blog">Journal</Link>
              <i aria-hidden="true">/</i>
              <span>{post.category}</span>
            </nav>

            <div className="nbPostHeadGrid">
              <div className="nbPostHeadCopy">
                <div className="kicker">
                  {post.category} / Field note
                </div>
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

              <figure className="nbPostHeadFig">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.cover} alt={post.coverAlt} />
                <figcaption>{post.coverAlt}</figcaption>
              </figure>
            </div>
          </div>
        </header>

        <div className="nbPostBody rv">
          <p className="nbPostLead">{post.excerpt}</p>

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

          <div className="nbPostShare">
            <span className="nbPostShareLabel">Share</span>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                shareUrl,
              )}&text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                shareUrl,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <button type="button" onClick={copyLink}>
              {copied ? "Link copied" : "Copy link"}
            </button>
          </div>

          <ul className="nbTagRow">
            {post.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>

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

      <CtaForm />
    </div>
  );
}
