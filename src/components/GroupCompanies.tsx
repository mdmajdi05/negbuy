/* ------------------------------------------------------------------ *
 * Group of Companies — the real NEGBUY entities and where they sit.
 * Addresses are the registered operating locations of the group.
 * ------------------------------------------------------------------ */

const OFFICES = [
  {
    country: "India",
    role: "Head office & workshop",
    lines: [
      "A-24/5, 3rd Floor, NH-19",
      "Mohan Cooperative Industrial Estate",
      "New Delhi, Delhi 110044, India",
    ],
  },
  {
    country: "United Arab Emirates",
    role: "Amala — company acquisition",
    lines: [
      "Business Centre",
      "Sharjah Publishing City Free Zone",
      "Sharjah, United Arab Emirates",
    ],
  },
  {
    country: "Oman",
    role: "Regional office",
    lines: ["P.O. Box 385, PC 103", "Muscat, Oman"],
  },
  {
    country: "Hong Kong",
    role: "Warehouse & logistics",
    lines: [
      "612, Complex Building No. 3",
      "Xixiang Street, Shenzhen",
      "China / Hong Kong",
    ],
  },
];

const CONTACT = {
  emails: ["contact@negbuygroup.com", "contact@negbuy.com"],
  phone: "+91 70111 23269",
  phoneHref: "tel:+917011123269",
};

export default function GroupCompanies() {
  return (
    <section className="nbOffices nbGroup" aria-label="Group of companies">
      <div className="nbOfficesInner">
        <div className="nbOfficesHead rv">
          <div className="kicker">Group of companies</div>
          <h2>
            ONE GROUP.
            <br />
            <span>FOUR TIME ZONES.</span>
          </h2>
        </div>

        <div className="nbOfficeGrid">
          {OFFICES.map((office, i) => (
            <article
              className="nbOffice rv"
              data-rv-delay={i * 80}
              key={office.country}
            >
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

        <div className="nbGroupContact rv">
          <span className="nbGroupContactLabel">Group desk</span>
          {CONTACT.emails.map((email) => (
            <a href={`mailto:${email}`} key={email}>
              {email}
            </a>
          ))}
          <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
        </div>
      </div>
    </section>
  );
}
