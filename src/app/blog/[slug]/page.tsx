import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogPostPage from "@/components/BlogPostPage";
import { POSTS, getPost } from "@/lib/posts";
import {
  articleSchema,
  breadcrumbSchema,
  createMetadata,
} from "@/lib/seo";

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    return createMetadata({
      title: "Journal",
      description: "Field notes from the gas and steam turbine aftermarket.",
      path: `/blog/${slug}`,
      noindex: true,
    });
  }

  return createMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    type: "article",
    publishedTime: post.date,
    authors: [post.author],
    tags: post.tags,
    image: post.cover,
    imageAlt: post.coverAlt,
    keywords: post.tags,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={articleSchema({
          title: post.title,
          description: post.excerpt,
          slug: post.slug,
          publishedAt: post.date,
          author: post.author,
          image: post.cover,
          category: post.category,
        })}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Journal", url: "/blog" },
          { name: post.title, url: `/blog/${post.slug}` },
        ])}
      />
      <BlogPostPage slug={slug} />
    </>
  );
}
