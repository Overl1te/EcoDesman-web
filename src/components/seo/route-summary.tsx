import Link from "next/link";

type RouteSummaryLink = {
  href: string;
  label: string;
};

export function RouteSummary({
  eyebrow,
  title,
  description,
  highlights,
  links,
}: {
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  links: RouteSummaryLink[];
}) {
  return (
    <section className="route-summary" aria-label={title}>
      <div className="route-summary-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <ul className="route-summary-highlights">
        {highlights.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <nav className="route-summary-links" aria-label="Основные разделы">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="route-summary-link">
            {link.label}
          </Link>
        ))}
      </nav>
    </section>
  );
}
