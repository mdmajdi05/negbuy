/**
 * Frequently asked questions — one source of truth.
 *
 * Consumed by both the visible FAQ accordion (`FaqSection`) and the home-page
 * `FAQPage` JSON-LD so the structured data can never drift from the on-page
 * copy (a Google requirement).
 */
export interface Faq {
  q: string;
  a: string;
}

export const FAQS: Faq[] = [
  {
    q: "Do you supply genuine OEM parts or aftermarket equivalents?",
    a: "Both. We supply genuine OEM parts with full traceability, and where lead times or budgets demand it, form-fit-function equivalents built to the same specification. Every option is quoted with its documentation and warranty stated up front.",
  },
  {
    q: "How fast can you quote and dispatch an emergency breakdown part?",
    a: "Send a part number, a nameplate photo or just the fault description. Our desk identifies the unit and returns a scoped, fixed quote — typically within 24 hours. Emergency stock dispatches from our global feedstock, often inside 48 hours.",
  },
  {
    q: "Which turbines and OEMs do you cover?",
    a: "Frame and aeroderivative gas turbines, steam turbines and generators across GE Vernova, Siemens Energy, Mitsubishi Power, Solar Turbines, Ansaldo, MAN and others — plus custom parts sourced and machined to your build sheet.",
  },
  {
    q: "Do you provide on-site overhaul and field service?",
    a: "Yes. Beyond spares we run planned overhauls, hot-section repairs, balance work and commissioning support with certified crews, either at our workshop or on your site.",
  },
  {
    q: "What certification and warranty comes with parts?",
    a: "Parts ship with material certificates, dimensional inspection records and a standard 12-month warranty, backed by ISO 9001 quality processes and full traceability from feedstock to dispatch.",
  },
  {
    q: "Can you hold stock for a long-term spares programme?",
    a: "We do. We build dedicated consumable and capital-spares inventories for plants and fleets, so critical items are reserved against your name and released on call. You only pay for what you draw.",
  },
];
