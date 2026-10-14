"use client";

import { useState, type FormEvent } from "react";
import { whatsappUrl } from "@/lib/site";

export default function CtaForm() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    part: "",
  });

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = [
      "New RFQ from the NEGBUY website",
      "",
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Company: ${form.company || "—"}`,
      "",
      "Requirement:",
      form.part,
    ].join("\n");

    window.open(whatsappUrl(text), "_blank", "noopener,noreferrer");
    setSent(true);
  };

  return (
    <section className="nbCta" id="quote" aria-label="Request a quote">
      <div className="nbCtaGlow" aria-hidden="true" />
      <div className="nbCtaInner">
        <div className="nbCtaCopy rv">
          <div className="kicker" style={{ color: "#111" }}>
            07 / Start a conversation
          </div>
          <h2>
            SEND THE
            <br />
            PART NUMBER.
          </h2>
          <p>
            Tell us what&apos;s down, what&apos;s worn or what&apos;s due — we&apos;ll
            come back with a scoped fixed quote and a real dispatch date.
          </p>
          <ul className="nbCtaPoints">
            <li>
              <b>24 h</b> quote turnaround
            </li>
            <li>
              <b>48 h</b> emergency dispatch
            </li>
            <li>
              <b>12 mth</b> parts warranty
            </li>
          </ul>
          <a className="nbCtaMail" href="mailto:contact@negbuy.com">
            contact@negbuy.com <span aria-hidden="true">↗</span>
          </a>
        </div>

        <form className="nbForm rv" onSubmit={onSubmit} data-rv-delay="120">
          {sent ? (
            <div className="nbFormDone" role="status">
              <span aria-hidden="true">✓</span>
              <h3>Enquiry ready to send.</h3>
              <p>
                WhatsApp has opened with your details filled in — just hit send.
                If nothing happened, email us directly at{" "}
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
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={set("name")}
                    placeholder="Your name"
                  />
                </label>
                <label className="nbField">
                  <span>Email</span>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={set("email")}
                    placeholder="you@plant.com"
                  />
                </label>
              </div>
              <label className="nbField">
                <span>Company</span>
                <input
                  type="text"
                  value={form.company}
                  onChange={set("company")}
                  placeholder="Plant / fleet / company"
                />
              </label>
              <label className="nbField">
                <span>Requirement</span>
                <textarea
                  rows={4}
                  required
                  value={form.part}
                  onChange={set("part")}
                  placeholder="Part numbers, turbine model, fault description, quantity, delivery port…"
                />
              </label>
              <button className="nbSubmit" type="submit">
                Request a quote <span aria-hidden="true">↗</span>
              </button>
              <p className="nbFormNote">
                Typical reply within one business day. No obligation.
              </p>
            </>
          )}
        </form>
      </div>
    </section>
  );
}
