import { APP_NAME } from "@/lib/config";
import { absoluteUrl, SITE_DESCRIPTION } from "@/lib/seo";

export function SiteStructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${absoluteUrl()}#organization`,
        name: APP_NAME,
        url: absoluteUrl(),
        logo: absoluteUrl("/icon-512x512.png"),
        sameAs: [
          "https://github.com/Overl1te/EcoDesman-web",
          "https://github.com/Overl1te/EcoDesman-server",
          "https://github.com/Overl1te/EcoDesman-mobile",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${absoluteUrl()}#website`,
        name: APP_NAME,
        url: absoluteUrl(),
        inLanguage: "ru-RU",
        description: SITE_DESCRIPTION,
        publisher: {
          "@id": `${absoluteUrl()}#organization`,
        },
      },
      {
        "@type": "WebApplication",
        "@id": `${absoluteUrl()}#webapp`,
        name: APP_NAME,
        url: absoluteUrl(),
        inLanguage: "ru-RU",
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Web, Android",
        description: SITE_DESCRIPTION,
        image: absoluteUrl("/og-image.png"),
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "RUB",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
