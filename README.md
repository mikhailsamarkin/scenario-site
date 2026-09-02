# Scenario Site

Next.js SSG-сайт с данными из Firebase (Firestore).

## Установка

```bash
npm install
```

Скопируйте `.env.example` в `.env.local` и заполните переменные Firebase для клиента.

## Плагины и инструменты для разработки

| Пакет | Назначение |
|-------|------------|
| **TypeScript** | Типизация, автодополнение, меньше ошибок в рантайме |
| **ESLint** (`eslint`, `eslint-config-next`) | Линтинг кода и правил Next.js |
| **Prettier** + `eslint-config-prettier`, `eslint-plugin-prettier` | Единый стиль кода, автоформатирование без конфликтов с ESLint |
| **firebase** | Клиентский SDK (авторизация, Firestore, realtime) |

## Скрипты

- `npm run dev` — режим разработки с hot reload
- `npm run build` — сборка статики
- `npm run start` — раздача статики из `out` (после `npm run build`)
- `npm run lint` / `npm run lint:fix` — проверка и автоисправление по ESLint
- `npm run format` / `npm run format:check` — форматирование по Prettier

## Структура

- `src/app/` — App Router (layout, страницы)
- Данные из Firestore можно подгружать на клиенте через Firebase SDK (NEXT_PUBLIC_* в `.env.local`)

## Опционально (можно добавить позже)

- **husky** + **lint-staged** — запуск lint/format перед коммитом
- **VS Code**: расширения ESLint, Prettier, Firebase Explorer
