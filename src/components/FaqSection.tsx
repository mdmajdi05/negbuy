"use client";

import { useState } from "react";
import { FAQS } from "@/lib/faqs";

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      className="nbFaq light"
      id="faq"
      aria-label="Frequently asked questions"
    >
      <div className="nbFaqInner">
        <div className="nbFaqHead rv">
          <div className="kicker">06 / Questions</div>
          <h2>
            BEFORE YOU
            <br />
            <span>PICK UP THE PHONE.</span>
          </h2>
          <p>
            Still unsure about something? Our engineers answer in plain
            language — no obligation, no pressure.
          </p>
        </div>

        <div className="nbFaqList">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div className="rv" data-rv-delay={i * 50} key={f.q}>
                <div className={`nbFaqItem${isOpen ? " is-open" : ""}`}>
                  <button
                    type="button"
                    className="nbFaqQ"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span className="nbFaqNo">{String(i + 1).padStart(2, "0")}</span>
                    <span className="nbFaqText">{f.q}</span>
                    <span className="nbFaqPlus" aria-hidden="true">
                      <i />
                      <i />
                    </span>
                  </button>
                  <div className="nbFaqA" role="region">
                    <p>{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
