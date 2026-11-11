# Developer Card API

GraphQL-бэкенд визитки разработчика: профиль, ссылки, навыки, опыт и проекты.

Стек: TypeScript, Node.js 24, NestJS 12, Prisma 7, PostgreSQL 17, GraphQL (Apollo Server 5, code-first), Docker.

## Запуск одной командой

```bash
docker compose up --build
```

При старте контейнер приложения сам применяет миграции, выполняет идемпотентный seed и запускает сервер.

| Адрес                         | Назначение                   |
| ----------------------------- | ---------------------------- |
| http://localhost:3000/graphql | GraphQL API и Apollo Sandbox |
| http://localhost:3000/health  | Проверка приложения и БД     |

Пример запроса:

```graphql
query {
  profile {
    name
    description
  }
}
```

Если порты 3000 или 5432 заняты, переопределите `APP_PORT` и `POSTGRES_PORT` в `.env` (см. `.env.example`).

## Локальная разработка

```bash
cp .env.example .env
docker compose up -d postgres
npm ci
npm run db:migrate
npm run db:seed
npm run start:dev
```

| Скрипт               | Что делает                                           |
| -------------------- | ---------------------------------------------------- |
| `npm run start:dev`  | Генерирует Prisma Client и запускает watch-режим     |
| `npm run build`      | Генерирует Prisma Client и собирает проект в `dist/` |
| `npm run start:prod` | Запускает собранное приложение                       |
| `npm run db:migrate` | Создаёт и применяет миграции (`prisma migrate dev`)  |
| `npm run db:seed`    | Заполняет БД данными из `prisma/seed-data.ts`        |
| `npm run lint`       | ESLint с проверкой типов                             |
| `npm run format`     | Prettier                                             |

## Структура

```
prisma/
  schema.prisma        модель данных
  migrations/          SQL-миграции
  seed.ts              идемпотентный seed
  seed-data.ts         типизированные данные визитки
src/
  config/              валидация env через @nestjs/config и class-validator
  prisma/              PrismaService с драйвер-адаптером pg
  graphql/             конфигурация Apollo
  health/              GET /health
  profile/             resolver → service → repository
```

Каждый доменный модуль разделён на слои: resolver отвечает только за GraphQL и делегирует вызов, service содержит бизнес-логику, repository работает с Prisma.

## Модель данных

- `Profile` — единственный профиль. Поле `slug` не публикуется в API и служит стабильным ключом для upsert в seed.
- `ProfileLink`, `Skill`, `Experience`, `Project` связаны с профилем через `profile_id` с `ON DELETE CASCADE`.
- Порядок вывода задаётся полем `sort_order`. Уникальный индекс `(profile_id, sort_order)` одновременно индексирует внешний ключ и сортировку и исключает одинаковые позиции, поэтому порядок всегда детерминирован.
- Ссылки вынесены в отдельную таблицу: у каждой есть собственный порядок и уникальность в рамках профиля, а целостность обеспечивает БД, а не JSON без схемы.
- Достижения опыта хранятся массивом `text[]`: это значения без собственной идентичности, которые всегда читаются вместе с записью опыта.
- CHECK-ограничения в миграции: `end_date >= start_date` и `sort_order >= 0`.

Seed выполняет upsert профиля по `slug`, а вложенные сущности заменяет через delete + create в одной транзакции. Повторный запуск не создаёт дублей и удаляет записи, убранные из `seed-data.ts`. Идентификатор профиля при этом стабилен, а у вложенных записей идентификаторы пересоздаются.

## Решения и компромиссы

**Миграции и seed в entrypoint.** Контейнер приложения сам выполняет `prisma migrate deploy` и seed перед запуском. Это даёт запуск одной командой и простой деплой одного сервиса (например, на Render) без отдельного job для миграций. Цена — размер образа около 800 МБ: в рантайм попадает Prisma CLI со всеми зависимостями (Studio, pglite и т. д.), хотя приложению он не нужен. Альтернатива — отдельный одноразовый сервис `migrate`, после успешного завершения которого стартует приложение. Тогда образ приложения уменьшится примерно на 200 МБ, но деплой усложнится. Схема рассчитана на один экземпляр приложения: `migrate deploy` защищён advisory lock, а одновременный seed из нескольких реплик не предусмотрен.

**Apollo Server 5.** `@nestjs/apollo` 14 для NestJS 12 требует `@apollo/server` 5. Версия 4 больше не поддерживается.

**ESM.** Все пакеты NestJS 12 публикуются как ESM, а в CommonJS-проекте типы `@apollo/server` резолвятся из двух копий и конфликтуют. Поэтому проект собран как ESM (`"type": "module"`), а относительные импорты указаны с расширением `.js`.

**Apollo Sandbox в production.** Sandbox и интроспекция включены намеренно, чтобы API можно было изучать прямо на деплое.

**Install-скрипты npm.** npm 11 по умолчанию блокирует install-скрипты, поэтому в `allowScripts` явно разрешены только `prisma` и `@prisma/engines`: им нужно скачать бинарник schema engine.
