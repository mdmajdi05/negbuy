/**
 * JSON-LD schema builders.
 *
 * Each builder returns `{ __html }`, ready to spread into a
 * `<script type="application/ld+json" dangerouslySetInnerHTML={...} />` tag.
 * Pages never hand-write raw JSON-LD — always import a builder from here so the
 * `@id` graph stays consistent (Organization → WebSite → Article/Service …).
 */
import { OFFICES, SITE, absoluteUrl } from "@/lib/site";

export const ORG_ID = `${SITE.url}/#organization`;
export const WEBSITE_ID = `${SITE.url}/#website`;

export interface JsonLdProps {
  __html: string;
}

/** Wrap any schema object with the Schema.org context and serialise it. */
export function jsonLd(schema: Record<string, unknown>): JsonLdProps {
  return { __html: JSON.stringify({ "@context": "https://schema.org", ...schema }) };
}

export function organizationSchema(): JsonLdProps {
  return jsonLd({
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE.companyName,
    legalName: SITE.legalName,
    url: SITE.url,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/header-logo.png"),
      width: 659,
      height: 302,
    },
    description: SITE.defaultDescription,
    email: SITE.email,
    telephone: SITE.phone,
    address: OFFICES.map((office) => ({
      "@type": "PostalAddress",
      streetAddress: office.address.street,
      addressLocality: office.address.locality,
      addressRegion: office.address.region,
      ...(office.address.postalCode
        ? { postalCode: office.address.postalCode }
        : {}),
      addressCountry: office.address.country,
    })),
  });
}

export function websiteSchema(): JsonLdProps {
  return jsonLd({
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE.url,
    name: SITE.name,
    description: SITE.defaultDescription,
    publisher: { "@id": ORG_ID },
  });
}

export function breadcrumbSchema(
  items: { name: string; url: string }[],
): JsonLdProps {
  return jsonLd({
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  });
}

export function articleSchema(post: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  author: string;
  image?: string;
  category?: string;
}): JsonLdProps {
  return jsonLd({
    "@type": "Article",
    "@id": `${SITE.url}/blog/${post.slug}#article`,
    headline: post.title,
    description: post.description,
    url: `${SITE.url}/blog/${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      "@id": ORG_ID,
      name: SITE.companyName,
      url: SITE.url,
    },
    ...(post.image
      ? { image: { "@type": "ImageObject", url: absoluteUrl(post.image) } }
      : {}),
    ...(post.category ? { articleSection: post.category } : {}),
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE.url}/blog/${post.slug}` },
  });
}

export function faqSchema(
  items: { question: string; answer: string }[],
): JsonLdProps {
  return jsonLd({
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  });
}

export function itemListSchema(
  items: { name: string; url: string; description?: string; image?: string }[],
): JsonLdProps {
  return jsonLd({
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.url),
      ...(item.description ? { description: item.description } : {}),
      ...(item.image ? { image: absoluteUrl(item.image) } : {}),
    })),
  });
}

export function serviceSchema(
  services: { name: string; description: string; url: string }[],
): JsonLdProps {
  return jsonLd({
    "@type": "ItemList",
    itemListElement: services.map((service, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: service.name,
        description: service.description,
        url: absoluteUrl(service.url),
        provider: { "@id": ORG_ID },
      },
    })),
  });
}

export function contactPageSchema(): JsonLdProps {
  return jsonLd({
    "@type": "ContactPage",
    "@id": `${SITE.url}/contact#contactpage`,
    url: `${SITE.url}/contact`,
    name: `Contact ${SITE.name}`,
    mainEntity: {
      "@type": "Organization",
      "@id": ORG_ID,
      name: SITE.companyName,
      email: SITE.email,
      telephone: SITE.phone,
      url: SITE.url,
    },
  });
}
