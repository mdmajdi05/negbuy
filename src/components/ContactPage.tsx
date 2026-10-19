"use client";

import { useState, type FormEvent } from "react";
import PageHero from "./PageHero";
import RelatedPages from "./RelatedPages";
import { PLANT, SECTOR, SHOP } from "@/lib/media";
import { OFFICES, SITE, whatsappUrl } from "@/lib/site";
import { useReveal } from "@/hooks/useReveal";

const CHANNELS = [
  {
    tag: "WhatsApp",
    value: SITE.phone,
    href: whatsappUrl(
      "Hi NEGBUY, I have an enquiry about turbine parts and service.",
    ),
    note: "Fastest channel — send part numbers, photos or a fault note.",
  },
  {
    tag: "Sales & RFQ",
    value: SITE.emails.general,
    href: `mailto:${SITE.emails.general}`,
    note: "Quotes, availability and stockholding enquiries.",
  },
  {
    tag: "Emergency breakdown",
    value: "24/7 support desk",
    href: `mailto:${SITE.emails.general}?subject=EMERGENCY%20breakdown`,
    note: "Plants and fleets down — marked urgent, fast-tracked.",
  },
  {
    tag: "Service & field",
    value: "service@negbuy.com",
    href: "mailto:service@negbuy.com",
    note: "Overhauls, installation, commissioning and site crews.",
  },
  {
    tag: "Partnerships",
    value: "partners@negbuy.com",
    href: "mailto:partners@negbuy.com",
    note: "OEM, EPC and distribution partnerships.",
  },
  {
    tag: "Group desk",
    value: SITE.emails.group,
    href: `mailto:${SITE.emails.group}`,
    note: "Group enquiries, acquisitions and holding.",
  },
  {
    tag: "Direct line",
    value: SITE.phone,
    href: SITE.phoneHref,
    note: "Sales desk, Mon–Sat during IST business hours.",
  },
];

const SUBJECTS = [
  "Turbine spares / parts",
  "Turbine service & overhaul",
  "Oil & gas equipment",
  "Electrical & automation",
  "Marine & offshore",
  "EPC / project delivery",
  "Other",
];

export default function ContactPage() {
  useReveal();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    country: "",
    subject: SUBJECTS[0],
    message: "",
  });

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = [
      "New enquiry from the NEGBUY website",
      "",
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Company: ${form.company || "—"}`,
      `Country: ${form.country || "—"}`,
      `Subject: ${form.subject}`,
      "",
      "Requirement:",
      form.message,
    ].join("\n");

    window.open(whatsappUrl(text), "_blank", "noopener,noreferrer");
    setSent(true);
  };

  return (
    <div className="nbPage">
      <PageHero
        index="04"
        kicker="Contact"
        title={["GET A", "FIXED QUOTE."]}
        lead="Send a part number, a nameplate photo or a fault description. Our desk identifies the unit and comes back with a scoped quote and a real dispatch date."
        image={SHOP.controlRoom}
        imageAlt="Real power plant control room"
        stats={[
          { k: "24 h", v: "Quote turnaround" },
          { k: "48 h", v: "Emergency dispatch" },
          { k: "24/7", v: "Support desk" },
        ]}
      />

      <section className="nbContact" id="form" aria-label="Contact form">
        <div className="nbContactInner">
          <div className="nbContactAside rv">
            <div className="kicker">Direct channels</div>
            <h2>
              TALK TO
              <br />
              <span>A HUMAN.</span>
            </h2>
            <p>
              Pick the channel that fits — or use the form and we&apos;ll route
              it to the right desk.
            </p>
            <div className="nbChannels">
              {CHANNELS.map((c) => (
                <a className="nbChannel" href={c.href} key={c.tag}>
                  <span className="nbChannelTag">{c.tag}</span>
                  <b>{c.value}</b>
                  <small>{c.note}</small>
                </a>
              ))}
            </div>
          </div>

          <form className="nbForm nbForm--wide rv" data-rv-delay="120" onSubmit={onSubmit}>
            {sent ? (
              <div className="nbFormDone" role="status">
                <span aria-hidden="true">✓</span>
                <h3>Enquiry ready to send.</h3>
                <p>
                  WhatsApp has opened with your details filled in — just hit
                  send. If nothing happened, message us on{" "}
                  <a
                    href={whatsappUrl(
                      `Hi NEGBUY, I have an enquiry about ${form.subject}.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp
                  </a>{" "}
                  or email{" "}
                  <a href="mailto:contact@negbuy.com">contact@negbuy.com</a>.
                </p>
                <button type="button" onClick={() => setSent(false)}>
                  Send another
                </button>
              </div>
            ) : (
              <>
                <div className="nbFieldRow">
                  <label className="nbField">
                    <span>Name</span>
                    <input type="text" required value={form.name} onChange={set("name")} placeholder="Your name" />
                  </label>
                  <label className="nbField">
                    <span>Email</span>
                    <input type="email" required value={form.email} onChange={set("email")} placeholder="you@plant.com" />
                  </label>
                </div>
                <div className="nbFieldRow">
                  <label className="nbField">
                    <span>Company</span>
                    <input type="text" value={form.company} onChange={set("company")} placeholder="Plant / fleet / company" />
                  </label>
                  <label className="nbField">
                    <span>Country</span>
                    <input type="text" value={form.country} onChange={set("country")} placeholder="Where are you based?" />
                  </label>
                </div>
                <label className="nbField">
                  <span>Subject</span>
                  <select value={form.subject} onChange={set("subject")}>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="nbField">
                  <span>Requirement</span>
                  <textarea
                    rows={5}
                    required
                    value={form.message}
                    onChange={set("message")}
                    placeholder="Part numbers, turbine model, fault description, quantity, delivery port…"
                  />
                </label>
                <button className="nbSubmit" type="submit">
                  Send enquiry <span aria-hidden="true">↗</span>
                </button>
                <p className="nbFormNote">Typical reply within one business day. No obligation.</p>
              </>
            )}
          </form>
        </div>
      </section>

      <section className="nbOffices" aria-label="Where we operate">
        <div className="nbOfficesInner">
          <div className="nbOfficesHead rv">
            <div className="kicker">Group of companies</div>
            <h2>
              LOCAL CREWS.
              <br />
              <span>GLOBAL STOCK.</span>
            </h2>
          </div>
          <div className="nbOfficeGrid">
            {OFFICES.map((office, i) => (
              <article className="nbOffice rv" data-rv-delay={i * 80} key={office.country}>
                <h3>{office.country}</h3>
                <b>{office.role}</b>
                <address>
                  {office.lines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </address>
              </article>
            ))}
          </div>
          <figure className="nbOfficesShot rv">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PLANT.elering} alt="NEGBUY operating site" loading="lazy" decoding="async" />
            <figcaption>{SECTOR.global ? "Global feedstock · 40+ countries" : ""}</figcaption>
          </figure>
        </div>
      </section>

      <RelatedPages exclude="contact" />
    </div>
  );
}
