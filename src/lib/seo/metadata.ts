/**
 * Metadata factory.
 *
 * One place that composes canonical URLs, robots directives, OpenGraph and
 * Twitter cards. Every page calls `createMetadata(...)` instead of hand-writing
 * a `Metadata` object, so nothing is ever left without a canonical or a social
 * card.
 *
 * Page titles are plain (the brand is appended by the root layout's
 * `title.template`). Pass `absolute: true` to opt out of the suffix — used by
 * the homepage, whose title already carries the brand.
 */
import type { Metadata } from "next";
import { SITE, absoluteUrl } from "@/lib/site";

export interface SeoInput {
  /** Page title without the brand suffix (unless `absolute`). */
  title: string;
  description: string;
  /** Site-relative path, e.g. "/about" or "/blog/some-slug". */
  path: string;
  keywords?: readonly string[];
  /** Skip the layout's "| NEGBUY" suffix (use for the homepage). */
  absolute?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  authors?: string[];
  tags?: string[];
  /** Social share image, site-relative (defaults to the site OG image). */
  image?: string;
  imageAlt?: string;
  noindex?: boolean;
}

export function createMetadata(input: SeoInput): Metadata {
  const url = absoluteUrl(input.path);
  const image = input.image ?? SITE.ogImage;
  const imageAlt = input.imageAlt ?? SITE.defaultTitle;

  return {
    title: input.absolute ? { absolute: input.title } : input.title,
    description: input.description,
    ...(input.keywords?.length ? { keywords: [...input.keywords] } : {}),
    alternates: { canonical: url },
    robots: input.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: input.type ?? "website",
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      title: input.title,
      description: input.description,
      images: [{ url: image, alt: imageAlt }],
      ...(input.type === "article" && input.publishedTime
        ? { publishedTime: input.publishedTime }
        : {}),
      ...(input.authors?.length ? { authors: input.authors } : {}),
      ...(input.tags?.length ? { tags: input.tags } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
}
