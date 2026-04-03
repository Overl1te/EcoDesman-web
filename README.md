# ЭкоВыхухоль Web

Next.js web-клиент для `ЭкоВыхухоль`.

## Архитектура

- frontend: Next.js App Router
- backend: Django API
- production split:
  - `https://example.com` -> Next.js
  - `https://api.example.com` -> Django API

## Переменные

Для локального dev создайте `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Для production через общий Docker-стек переменная приходит из backend `compose.yaml` как build arg и runtime env:

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.example.com/api/v1
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

Production фронт собирается не из этого репозитория отдельно, а из общего compose в backend-репо:

```bash
cd ../EcoDesman-server
docker compose up --build -d
```

Он использует:

- [Dockerfile](C:/Users/maksi/Documents/GitHub/eco-desman-web/Dockerfile)
- [`.dockerignore`](C:/Users/maksi/Documents/GitHub/eco-desman-web/.dockerignore)

## Проверка

```bash
npm run lint
npm run build
```
