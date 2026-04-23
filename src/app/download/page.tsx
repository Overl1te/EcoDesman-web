import type { Metadata } from "next";

import { AppDownloadLinks } from "@/components/layout/app-download-links";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Download App",
  description:
    "Install EcoDesman mobile app for a better map and notification experience.",
};

export default function DownloadPage() {
  return (
    <AppShell title="Скачать приложение">
      <section className="support-layout">
        <section className="panel info-panel">
          <p className="eyebrow">Мобильная версия</p>
          <h2 className="info-title">Установите EcoDesman на телефон</h2>
          <p className="info-description">
            На мобильных устройствах веб-версия стала ближе к приложению, но нативная
            сборка всё равно удобнее для карты, уведомлений, публикаций и стабильной
            авторизации.
          </p>
        </section>

        <section className="panel info-panel">
          <AppDownloadLinks
            title="Доступные платформы"
            description="Если откроете эту страницу с компьютера, ссылки всё равно приведут к актуальным сборкам."
          />
        </section>
      </section>
    </AppShell>
  );
}
