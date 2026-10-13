const QUOTES = [
  {
    text:
      "NEGBUY identified a discontinued hot-section part from a photo alone and had a matched replacement on site within a week. The unit never missed its dispatch window.",
    name: "Operations Manager",
    org: "Combined-cycle power plant, GCC",
    tag: "Emergency spares",
  },
  {
    text:
      "The spares programme removed a huge amount of risk from our maintenance planning. Genuine parts, correct paperwork, and dispatch we can actually rely on.",
    name: "Reliability Lead",
    org: "Downstream refinery, India",
    tag: "Stockholding",
  },
  {
    text:
      "Planned overhauls across three ports, delivered on schedule with full OEM documentation. That kind of coordination is rare in marine supply.",
    name: "Technical Superintendent",
    org: "Offshore fleet operator",
    tag: "Marine overhaul",
  },
];

export default function Testimonials() {
  return (
    <section className="nbQuotes" aria-label="Client feedback">
      <div className="nbQuotesInner">
        <div className="nbQuotesHead rv">
          <div className="kicker">05 / Client feedback</div>
          <h2>
            WHAT THE
            <br />
            <span>PLANT FLOOR SAYS.</span>
          </h2>
        </div>

        <div className="nbQuoteGrid">
          {QUOTES.map((q, i) => (
            <blockquote className="nbQuote rv" data-rv-delay={i * 110} key={q.tag}>
              <span className="nbQuoteMark" aria-hidden="true">
                &ldquo;
              </span>
              <p>{q.text}</p>
              <footer>
                <b>{q.name}</b>
                <span>{q.org}</span>
                <em>{q.tag}</em>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
