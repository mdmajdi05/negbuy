/**
 * SEO barrel — the single import surface for the rest of the app.
 *
 *   import { createMetadata, breadcrumbSchema, articleSchema } from "@/lib/seo";
 */
export { createMetadata } from "./metadata";
export type { SeoInput } from "./metadata";

export {
  ORG_ID,
  WEBSITE_ID,
  jsonLd,
  organizationSchema,
  websiteSchema,
  breadcrumbSchema,
  articleSchema,
  faqSchema,
  itemListSchema,
  serviceSchema,
  contactPageSchema,
} from "./schemas";
export type { JsonLdProps } from "./schemas";
