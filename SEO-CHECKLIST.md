# SEO Checklist & Conventions — NEGBUY

This project follows the same centralised, data-driven SEO pattern used in the
`servchip` reference: **pages never hand-write metadata or raw JSON-LD** — they
call a factory and a schema builder.

## Where things live

| Concern | File |
|---------|------|
| Brand, domain, contact, default title/description, OG image | `src/lib/site.ts` |
| Metadata factory (title, canonical, robots, OG, Twitter) | `src/lib/seo/metadata.ts` |
| JSON-LD builders (Organization, WebSite, Breadcrumb, Article, FAQ, ItemList, Service, ContactPage) | `src/lib/seo/schemas.ts` |
| Import surface | `src/lib/seo/index.ts` |
| FAQ single-source data (visible accordion + FAQ schema) | `src/lib/faqs.ts` |
| Global Organization + WebSite JSON-LD, title template | `src/app/layout.tsx` |
| XML sitemap | `src/app/sitemap.ts` |
| robots.txt | `src/app/robots.ts` |
| Security / cache headers, image formats | `next.config.ts` |

## Rules

1. **Every indexable page exports `metadata` built with `createMetadata(...)`.**
   ```ts
   export const metadata: Metadata = createMetadata({
     title: "Our Company",          // no brand — the layout template appends "| NEGBUY"
     description: "…",
     path: "/about",                 // drives canonical + og:url
   });
   ```
   The homepage passes `absolute: true` because its title already carries the brand.

2. **Every indexable page adds a `BreadcrumbList`** via `breadcrumbSchema([...])`,
   and the visual breadcrumb (where present) must match it exactly.

3. **Add the right JSON-LD for the page type:**
   | Page | Schema |
   |------|--------|
   | All pages | `Organization` + `WebSite` (from layout) |
   | Home | `BreadcrumbList`, `FAQPage` |
   | About | `BreadcrumbList` |
   | Products | `BreadcrumbList`, `ItemList` |
   | Services | `BreadcrumbList`, `ItemList` of `Service` |
   | Contact | `BreadcrumbList`, `ContactPage` |
   | Blog index | `BreadcrumbList`, `ItemList` of posts |
   | Blog post | `Article`, `BreadcrumbList` (auto via `generateMetadata`) |

4. **JSON-LD is injected as a `<script>`** in the server page:
   ```tsx
   <script type="application/ld+json" dangerouslySetInnerHTML={breadcrumbSchema([
     { name: "Home", url: "/" }, { name: "About", url: "/about" },
   ])} />
   ```

5. **Titles:** never include the brand in a page title (except the homepage).
   The root layout sets `title.template = "%s | NEGBUY"`.

6. **Canonical + OG + Twitter are automatic.** Never set them by hand — the
   factory derives canonical/og:url from `path` and uses the site OG image
   (`src/lib/site.ts` → `ogImage`) unless an `image` is passed.

7. **No phone number or postal address is published** in the codebase, so the
   Organization schema intentionally omits `telephone`/`address`. Add them to
   `src/lib/site.ts` **and** the schema together if that changes.

## Adding a new page

1. Create `src/app/<route>/page.tsx` (server component).
2. `export const metadata = createMetadata({ title, description, path: "/<route>" })`.
3. Inject a `breadcrumbSchema` script.
4. Add the route to `STATIC_ROUTES` in `src/app/sitemap.ts`.
5. Use `next/link` for internal links.

## Adding a journal post

1. Append to `POSTS` in `src/lib/posts.ts` (slug, category, title, excerpt,
   ISO `date`, `read`, cover, author, role, tags, body blocks).
2. Nothing else — `generateStaticParams`, `generateMetadata` (Article + OG
   article), the sitemap and the blog index all read from `POSTS`.
3. The reading page automatically renders a reading-progress bar, an "On this
   page" table of contents with anchor links, share actions, tags and related
   posts. Each `h` block becomes an anchored `<h2>`.

## Local check before shipping

```bash
npm run build          # must be 0 errors; /robots.txt and /sitemap.xml generated
npx eslint <changed files>
```

Then confirm in the built HTML (`.next/server/app/<route>.html`):
`<link rel="canonical">`, `og:type/url/image`, `twitter:card`, and one
`application/ld+json` script per expected schema type.
