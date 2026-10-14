"use client";

import Link from "next/link";
import CtaForm from "./CtaForm";
import {
  POSTS_SORTED,
  formatPostDate,
  getPost,
  type PostBlock,
} from "@/lib/posts";
import { useReveal } from "@/hooks/useReveal";

function Block({ block }: { block: PostBlock }) {
  switch (block.t) {
    case "h":
      return <h2 className="nbPostH">{block.v}</h2>;
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

  if (!post) {
    return (
      <section className="nbBlog">
        <div className="nbBlogInner">
          <p className="nbBlogEmpty">
            That article has moved. <Link href="/blog">Back to the journal</Link>
          </p>
        </div>
      </section>
    );
  }

  const more = POSTS_SORTED.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
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
          {post.body.map((block, i) => (
            <Block key={`${block.t}-${i}`} block={block} />
          ))}

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
    </>
  );
}
