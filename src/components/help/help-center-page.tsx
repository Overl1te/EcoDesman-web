"use client";

import Link from "next/link";
import {
  BookOpenText,
  Building2,
  Download,
  FileText,
  LifeBuoy,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { LoadingBlock } from "@/components/ui/loading-block";
import { getHelpCenterContent } from "@/lib/api";
import type { HelpCenterResponse } from "@/lib/types";

function ParagraphList({ paragraphs }: { paragraphs: string[] }) {
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={`${paragraph}-${index}`}>{paragraph}</p>
      ))}
    </>
  );
}

function BulletList({ bullets }: { bullets?: string[] }) {
  if (!bullets?.length) {
    return null;
  }

  return (
    <ul>
      {bullets.map((bullet, index) => (
        <li key={`${bullet}-${index}`}>{bullet}</li>
      ))}
    </ul>
  );
}

export function HelpCenterPage() {
  const [content, setContent] = useState<HelpCenterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void getHelpCenterContent()
      .then((nextContent) => {
        if (!cancelled) {
          setContent(nextContent);
        }
      })
      .catch((nextError) => {
        if (!cancelled) {
          setError(
            nextError instanceof Error
              ? nextError.message
              : "Не удалось загрузить справку",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!content && !error) {
    return (
      <AppShell title="Справка">
        <LoadingBlock />
      </AppShell>
    );
  }

  if (!content) {
    return (
      <AppShell title="Справка">
        <section className="panel">
          <h2>Не удалось загрузить справку</h2>
          <p>{error ?? "Попробуйте обновить страницу позже."}</p>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell title="Справка">
      <section className="help-page">
        <div className="help-hero">
          <div className="help-hero-copy">
            <p className="eyebrow">Информация о сервисе</p>
            <h2>{content.overview.title}</h2>
            <p>{content.overview.description}</p>
          </div>

          <div className="help-hero-side">
            <div className="help-hero-actions">
              <Link href="/support" className="button button-primary">
                <LifeBuoy className="button-icon" />
                <span>Открыть помощь</span>
              </Link>
              <a href="#terms" className="button button-muted">
                <ShieldCheck className="button-icon" />
                <span>Юридические документы</span>
              </a>
            </div>

            <dl className="help-hero-facts">
              <div>
                <dt>Документов</dt>
                <dd>{content.documents.length}</dd>
              </div>
              <div>
                <dt>Разделов</dt>
                <dd>{content.service_blocks.length + content.overview.cards.length}</dd>
              </div>
              <div>
                <dt>Формат</dt>
                <dd>PDF + web</dd>
              </div>
            </dl>
          </div>
        </div>

        <section className="help-overview-section">
          <div className="help-section-head">
            <BookOpenText className="help-section-icon" />
            <div>
              <p className="eyebrow">Быстрая ориентация</p>
              <h3>Как устроена справка</h3>
            </div>
          </div>

          <div className="help-overview-grid">
            {content.overview.cards.map((card, index) => (
              <article key={card.title} className="help-overview-card">
                <span className="help-overview-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="help-company" id="about">
          <div className="help-section-head">
            <Building2 className="help-section-icon" />
            <div>
              <p className="eyebrow">О сервисе и платформах</p>
              <h3>Что входит в справку</h3>
            </div>
          </div>

          <div className="help-company-grid">
            {content.service_blocks.map((block) => (
              <article key={block.title} className="help-company-item">
                <strong>{block.title}</strong>
                <p>{block.body}</p>
              </article>
            ))}
            <article className="help-company-item is-accent">
              <strong>Операторская реакция отдельно</strong>
              <p>
                Если нужен разбор инцидента, ручная проверка жалобы или история
                переписки, используйте раздел <Link href="/support">«Помощь»</Link>.
                Справка фиксирует правила, но не заменяет поддержку.
              </p>
            </article>
          </div>
        </section>

        <section className="help-documents" id="terms">
          <div className="help-documents-intro">
            <div className="help-section-head">
              <FileText className="help-section-icon" />
              <div>
                <p className="eyebrow">Юридический контур</p>
                <h3>Документы и согласия</h3>
              </div>
            </div>

            <p className="help-documents-copy">
              Здесь собраны правила, согласия и актуальные PDF-версии. Слева
              быстрые якоря, справа полный текст каждого документа.
            </p>
          </div>

          <div className="help-documents-layout">
            <nav
              className="help-documents-nav"
              aria-label="Навигация по документам"
            >
              {content.documents.map((document) => (
                <a key={document.id} href={`#${document.id}`} className="help-doc-chip">
                  <span>{document.label}</span>
                  <small>{document.approval.revision}</small>
                </a>
              ))}
            </nav>

            <div className="help-documents-list">
              {content.documents.map((document) => (
                <article key={document.id} id={document.id} className="help-document">
                  <div className="help-document-head">
                    <div>
                      <p className="eyebrow">Документ</p>
                      <h4>{document.label}</h4>
                    </div>

                    <div className="help-document-actions">
                      <a
                        href={document.pdf_download_url}
                        className="button button-primary"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Download className="button-icon" />
                        <span>Скачать PDF</span>
                      </a>
                      <BookOpenText className="help-section-icon" />
                    </div>
                  </div>

                  <div className="help-document-meta">
                    <span className="chip">{document.approval.revision}</span>
                    <span className="chip">
                      Вступает в силу: {document.approval.effective_date}
                    </span>
                    <span className="chip">Файл: {document.pdf_file_name}</span>
                  </div>

                  <p className="help-document-summary">{document.summary}</p>

                  <section className="help-document-approval">
                    <strong>{document.approval.status}</strong>
                    <p>
                      Утверждающее лицо: {document.approval.approved_by},{" "}
                      {document.approval.approved_role}.
                    </p>
                    <p>Основание: {document.approval.approval_basis}.</p>
                    <p>
                      Контакты для юридических запросов:{" "}
                      {document.approval.contact}.
                    </p>
                    <p>{document.approval.note}</p>
                  </section>

                  <div className="help-document-sections">
                    {document.sections.map((section) => (
                      <section key={section.title} className="help-document-section">
                        <h5>{section.title}</h5>
                        <ParagraphList paragraphs={section.paragraphs} />
                        <BulletList bullets={section.bullets} />
                      </section>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </section>
    </AppShell>
  );
}
