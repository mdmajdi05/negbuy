/**
 * Single source of truth for site-wide identity, contact details and SEO
 * defaults.
 *
 * Never hardcode the domain, brand name or contact email inside a page — import
 * from here so canonical URLs, JSON-LD schema and social cards all stay in sync
 * when something changes.
 */
export const SITE = {
  name: "NEGBUY",
  companyName: "NEGBUY",
  legalName: "NEGBUY Group",
  url: "https://negbuy.com",
  locale: "en_US",

  email: "contact@negbuy.com",
  emails: {
    general: "contact@negbuy.com",
    service: "service@negbuy.com",
    partners: "partners@negbuy.com",
  },

  phone: "+91 70111 23269",
  phoneHref: "tel:+917011123269",
  /** Digits only, international format — used to build wa.me links. */
  whatsapp: "917011123269",

  address: {
    street: "A-24/5, 3rd Floor, NH-19, Mohan Cooperative Industrial Estate",
    locality: "New Delhi",
    region: "Delhi",
    postalCode: "110044",
    country: "IN",
  },

  tagline: "Energy · Turbine · Marine · Electrical",
  defaultTitle: "NEGBUY — Energy, Turbine, Marine & Electrical Solutions",
  defaultDescription:
    "NEGBUY supplies genuine gas and steam turbine parts, generators, overhaul and field services for power plants, refineries and marine fleets worldwide.",
  defaultKeywords: [
    "NEGBUY",
    "gas turbine parts",
    "steam turbine spares",
    "turbine overhaul",
    "hot gas path inspection",
    "generators",
    "energy solutions",
    "oil and gas",
    "marine and offshore",
    "electrical and automation",
  ],

  /** Default social share image (relative to the site root). */
  ogImage: "/real/hero-banner.webp",
} as const;

/** Absolute URL helper: turns "/blog" into "https://negbuy.com/blog". */
export function absoluteUrl(path: string) {
  if (path.startsWith("http")) return path;
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Build a wa.me link pre-filled with a message. */
export function whatsappUrl(text: string) {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
}

/** Default greeting used by the floating contact widget. */
export const WHATSAPP_GREETING = `Hi ${SITE.name}, I have an enquiry about turbine parts and service.`;

