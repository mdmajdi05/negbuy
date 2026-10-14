/**
 * XML sitemap — generated from the same data the pages render, so a new journal
 * post or route is never forgotten.
 */
import type { MetadataRoute } from "next";
import { SITE, absoluteUrl } from "@/lib/site";
import { POSTS_SORTED } from "@/lib/posts";

type Entry = MetadataRoute.Sitemap[number];

const STATIC_ROUTES: {
  path: string;
  priority: number;
  changeFrequency: Entry["changeFrequency"];
}[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/products", priority: 0.9, changeFrequency: "weekly" },
  { path: "/services", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: Entry[] = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const posts: Entry[] = POSTS_SORTED.map((post) => ({
    url: `${SITE.url}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...posts];
}
