import Link from "next/link";

import type { SeoFaqItem } from "@/lib/seo";

type TopicItem = {
  title: string;
  description: string;
};

type RouteLinkItem = {
  href: string;
  label: string;
  description: string;
};

export function RouteTopicGrid({
  eyebrow,
  topics,
}: {
  eyebrow: string;
  topics: TopicItem[];
}) {
  return (
    <section className="route-topic-grid" aria-label={eyebrow}>
      <p className="eyebrow">{eyebrow}</p>
      <div className="route-topic-grid-items">
        {topics.map((topic) => (
          <article key={topic.title} className="route-topic-card">
            <h2>{topic.title}</h2>
            <p>{topic.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function RouteFaq({
  eyebrow = "Частые вопросы",
  items,
}: {
  eyebrow?: string;
  items: SeoFaqItem[];
}) {
  return (
    <section className="route-faq" aria-label={eyebrow}>
      <div className="route-section-head">
        <p className="eyebrow">{eyebrow}</p>
        <h2>Ответы на частые вопросы</h2>
      </div>
      <div className="route-faq-list">
        {items.map((item) => (
          <article key={item.question} className="route-faq-item">
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function RouteLinkGrid({
  eyebrow,
  links,
}: {
  eyebrow: string;
  links: RouteLinkItem[];
}) {
  return (
    <nav className="route-link-grid" aria-label={eyebrow}>
      <div className="route-section-head">
        <p className="eyebrow">{eyebrow}</p>
        <h2>Полезные разделы</h2>
      </div>
      <div className="route-link-grid-items">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="route-link-card">
            <strong>{link.label}</strong>
            <p>{link.description}</p>
          </Link>
        ))}
      </div>
    </nav>
  );
}
