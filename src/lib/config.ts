export const APP_NAME = "\u042d\u043a\u043e\u0412\u044b\u0445\u0443\u0445\u043e\u043b\u044c";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1";

export const MOBILE_APP_LINKS = {
  ios:
    process.env.NEXT_PUBLIC_IOS_APP_URL ??
    "https://github.com/Overl1te/EcoDesman-mobile",
  android:
    process.env.NEXT_PUBLIC_ANDROID_APP_URL ??
    "https://github.com/Overl1te/EcoDesman-mobile/releases",
  repository:
    process.env.NEXT_PUBLIC_MOBILE_APP_REPOSITORY_URL ??
    "https://github.com/Overl1te/EcoDesman-mobile",
} as const;
