import type { Metadata } from "next";

import { APP_NAME, SITE_URL } from "@/lib/config";

export const SITE_DESCRIPTION =
  "ЭкоВыхухоль — экологическая карта, события и сообщество Нижнего Новгорода: экоточки, пункты переработки, городские инициативы, публикации и полезные места рядом с вами.";

export const SITE_KEYWORDS = [
  "ЭкоВыхухоль",
  "эковыхухоль",
  "экологическая карта",
  "карта экоточек",
  "экоточки",
  "пункты переработки",
  "раздельный сбор",
  "экологические мероприятия",
  "экологические события",
  "экосообщество",
  "городские инициативы",
  "Нижний Новгород",
];

export const OPEN_GRAPH_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "ЭкоВыхухоль — экологическая карта и городское сообщество",
} as const;

export const INDEXABLE_ROBOTS = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-video-preview": -1,
    "max-snippet": -1,
  },
} as const;

export const NO_INDEX_ROBOTS = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
} as const;

type PageMetadataOptions = {
  title: string;
  description: string;
  path?: string;
  index?: boolean;
  keywords?: string[];
};

export type SeoFaqItem = {
  question: string;
  answer: string;
};

type StructuredDataThing = {
  "@type": string;
  name: string;
};

type StructuredPageOptions = {
  path: string;
  name: string;
  description: string;
  about?: string[];
};

export function normalizePath(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized === "" ? "/" : normalized;
}

export function absoluteUrl(path = "/"): string {
  const normalized = normalizePath(path);
  return `${SITE_URL}${normalized === "/" ? "" : normalized}`;
}

export function buildPageMetadata({
  title,
  description,
  path = "/",
  index = true,
  keywords = SITE_KEYWORDS,
}: PageMetadataOptions): Metadata {
  const canonical = normalizePath(path);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
      languages: {
        "ru-RU": canonical,
      },
    },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      url: canonical,
      siteName: APP_NAME,
      title,
      description,
      images: [OPEN_GRAPH_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OPEN_GRAPH_IMAGE.url],
    },
    robots: index ? INDEXABLE_ROBOTS : NO_INDEX_ROBOTS,
  };
}

export function buildNoIndexMetadata(
  title: string,
  description?: string,
): Metadata {
  return {
    title,
    ...(description ? { description } : {}),
    robots: NO_INDEX_ROBOTS,
  };
}

function buildAboutThings(about: string[] = []): StructuredDataThing[] {
  return about.map((item) => ({
    "@type": "Thing",
    name: item,
  }));
}

export function buildCollectionPageStructuredData({
  path,
  name,
  description,
  about = [],
}: StructuredPageOptions) {
  const url = absoluteUrl(path);

  return {
    "@type": "CollectionPage",
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: "ru-RU",
    isPartOf: {
      "@id": `${absoluteUrl()}#website`,
    },
    publisher: {
      "@id": `${absoluteUrl()}#organization`,
    },
    ...(about.length ? { about: buildAboutThings(about) } : {}),
  };
}

export function buildWebPageStructuredData({
  path,
  name,
  description,
  about = [],
}: StructuredPageOptions) {
  const url = absoluteUrl(path);

  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: "ru-RU",
    isPartOf: {
      "@id": `${absoluteUrl()}#website`,
    },
    publisher: {
      "@id": `${absoluteUrl()}#organization`,
    },
    ...(about.length ? { about: buildAboutThings(about) } : {}),
  };
}

export function buildFaqStructuredData(path: string, faqs: SeoFaqItem[]) {
  const url = absoluteUrl(path);

  return {
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    url,
    inLanguage: "ru-RU",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildMobileApplicationStructuredData({
  path,
  name,
  description,
  downloadUrls,
}: {
  path: string;
  name: string;
  description: string;
  downloadUrls: string[];
}) {
  const url = absoluteUrl(path);

  return {
    "@type": "MobileApplication",
    "@id": `${url}#application`,
    name,
    url,
    description,
    inLanguage: "ru-RU",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Android, iOS",
    image: absoluteUrl(OPEN_GRAPH_IMAGE.url),
    ...(downloadUrls.length ? { downloadUrl: downloadUrls } : {}),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "RUB",
    },
  };
}

export function searchEngineVerification(): Metadata["verification"] {
  return {
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.NEXT_PUBLIC_YANDEX_VERIFICATION
      ? { yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION }
      : {}),
  };
}
