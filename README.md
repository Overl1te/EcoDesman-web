# ЭкоВыхухоль Web

Next.js frontend для `ЭкоВыхухоль`.

## Архитектура

- frontend: Next.js App Router
- backend: Django API
- production split:
  - `http://example.com` -> Next.js
  - `http://api.example.com` -> Django API

Production намеренно работает только по `HTTP`.
Привязка домена сама по себе не включает SSL: в стеке нет certbot, ACME automation, Caddy, Traefik или listener на `443`.

## Переменные

Для локального dev создайте `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Для production frontend использует runtime env из backend runtime stack:

```bash
NEXT_PUBLIC_API_BASE_URL=/api/v1
NEXT_PUBLIC_SITE_URL=http://example.com
```

## Локальный запуск

1. Поднимите backend:

```bash
cd ../EcoDesman-server
docker compose up --build -d
```

2. Запустите web:

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Production

Production frontend живет как pinned GHCR image.

Frontend CI/CD:

- проверяет код и собирает Next.js image
- пушит image в GHCR
- обновляет только `FRONTEND_IMAGE` в runtime `.env` на VPS
- делает `docker compose pull frontend`
- перезапускает только `frontend`
- не тянет и не перекатывает backend сервисы во время frontend rollout

## Проверка

```bash
npm run lint
npm run build
docker build .
```
