# Scenario Site

Next.js SSG-сайт с данными из Firebase (Firestore).

## Установка

```bash
npm install
```

Скопируйте `.env.example` в `.env.local` и заполните переменные Firebase (клиент и при необходимости Admin для сборки).

## Плагины и инструменты для разработки

| Пакет | Назначение |
|-------|------------|
| **TypeScript** | Типизация, автодополнение, меньше ошибок в рантайме |
| **ESLint** (`eslint`, `eslint-config-next`) | Линтинг кода и правил Next.js |
| **Prettier** + `eslint-config-prettier`, `eslint-plugin-prettier` | Единый стиль кода, автоформатирование без конфликтов с ESLint |
| **firebase** | Клиентский SDK (если понадобится авторизация или realtime) |
| **firebase-admin** | Доступ к Firestore на этапе сборки (SSG) |

## Скрипты

- `npm run dev` — режим разработки с hot reload
- `npm run build` — сборка статики (читает данные из Firebase)
- `npm run start` — просмотр собранного сайта
- `npm run lint` / `npm run lint:fix` — проверка и автоисправление по ESLint
- `npm run format` / `npm run format:check` — форматирование по Prettier

## Структура

- `src/app/` — App Router (layout, страницы)
- `src/lib/firebase-admin.ts` — инициализация Firebase Admin для SSG (build time)
- Коллекция Firestore `scenarios` используется для маршрутов `/scenarios` и `/scenarios/[id]`

## Опционально (можно добавить позже)

- **husky** + **lint-staged** — запуск lint/format перед коммитом
- **VS Code**: расширения ESLint, Prettier, Firebase Explorer
