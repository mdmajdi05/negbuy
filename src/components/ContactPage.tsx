"use client";

import { useState, type FormEvent } from "react";
import PageHero from "./PageHero";
import { PLANT, SECTOR, SHOP } from "@/lib/media";
import { useReveal } from "@/hooks/useReveal";

const CHANNELS = [
  {
    tag: "Sales & RFQ",
    value: "contact@negbuy.com",
    href: "mailto:contact@negbuy.com",
    note: "Quotes, availability and stockholding enquiries.",
  },
  {
    tag: "Emergency breakdown",
    value: "24/7 support desk",
    href: "mailto:contact@negbuy.com?subject=EMERGENCY%20breakdown",
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
];

const OFFICES = [
  { city: "India", role: "Head office & workshop", note: "Spares desk, engineering, dispatch" },
  { city: "GCC", role: "Regional hub", note: "Power & oilfield spares, field service" },
  { city: "SE Asia", role: "Marine support", note: "Fleet overhauls & port logistics" },
  { city: "Global", role: "Feedstock network", note: "Verified sourcing, 40+ countries" },
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
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nCompany: ${form.company}\nCountry: ${form.country}\nSubject: ${form.subject}\n\n${form.message}`
    );
    window.location.href = `mailto:contact@negbuy.com?subject=${encodeURIComponent(
      form.subject
    )}&body=${body}`;
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
                  We&apos;ve opened your mail client with the details. If nothing
                  happened, email <a href="mailto:contact@negbuy.com">contact@negbuy.com</a>.
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
            <div className="kicker">Where we operate</div>
            <h2>
              LOCAL CREWS.
              <br />
              <span>GLOBAL STOCK.</span>
            </h2>
          </div>
          <div className="nbOfficeGrid">
            {OFFICES.map((o, i) => (
              <article className="nbOffice rv" data-rv-delay={i * 80} key={o.city}>
                <h3>{o.city}</h3>
                <b>{o.role}</b>
                <p>{o.note}</p>
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
    </div>
  );
}
