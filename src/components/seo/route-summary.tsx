import Link from "next/link";

type RouteSummaryLink = {
  href: string;
  label: string;
  description?: string;
};

export function RouteSummary({
  eyebrow,
  title,
  description,
  highlights,
  links,
  headingLevel = 2,
  paragraphs = [],
}: {
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  links: RouteSummaryLink[];
  headingLevel?: 1 | 2;
  paragraphs?: string[];
}) {
  const HeadingTag = headingLevel === 1 ? "h1" : "h2";

  return (
    <section className="route-summary" aria-label={title}>
      <div className="route-summary-copy">
        <p className="eyebrow">{eyebrow}</p>
        <HeadingTag>{title}</HeadingTag>
        <div className="route-summary-copy-body">
          <p>{description}</p>
          {paragraphs.map((paragraph, index) => (
            <p key={`${paragraph}-${index}`}>{paragraph}</p>
          ))}
        </div>
      </div>

      <ul className="route-summary-highlights">
        {highlights.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <nav className="route-summary-links" aria-label="Основные разделы">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="route-summary-link">
            <span>{link.label}</span>
            {link.description ? <small>{link.description}</small> : null}
          </Link>
        ))}
      </nav>
    </section>
  );
}
