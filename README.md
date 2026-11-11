# Developer Card API

GraphQL-бэкенд визитки разработчика: профиль, ссылки, навыки, опыт работы и проекты.

## Быстрый старт

```bash
docker compose up --build
```

Контейнер приложения при старте сам применяет миграции, выполняет идемпотентный seed и запускает сервер.

| Адрес                         | Назначение                   |
| ----------------------------- | ---------------------------- |
| http://localhost:3000/graphql | GraphQL API и Apollo Sandbox |
| http://localhost:3000/health  | Проверка приложения и БД     |

```graphql
query {
  profile {
    name
    description
    links {
      label
      url
    }
    skills {
      name
    }
    experience {
      company
      position
      period
      achievements
    }
    projects {
      name
      url
    }
  }
}
```

Если порты 3000 или 5432 заняты, задайте `APP_PORT` и `POSTGRES_PORT` в `.env` (шаблон — `.env.example`).

## Стек

TypeScript 6 (strict), Node.js 24, NestJS 12, Prisma 7 с драйвер-адаптером `pg`, PostgreSQL 17, GraphQL code-first на Apollo Server 5, DataLoader, Docker, ESLint и Prettier, `node:test` для e2e.

## Структура

```
prisma/
  schema.prisma          модель данных
  migrations/            SQL-миграции
  seed.ts                идемпотентный seed
  seed-data.ts           типизированные данные визитки
src/
  common/
    config/              валидация env (@nestjs/config + class-validator)
    dataloader/          GroupedLoader: батчинг один-ко-многим на запрос
    graphql/             конфигурация Apollo, контекст запроса, коды ошибок
  prisma/                PrismaService, логирование SQL
  health/                GET /health
  profile/               профиль и ссылки
  skills/                навыки
  experience/            опыт работы
  projects/              проекты
test/                    e2e-тесты
render.yaml              blueprint для Render
```

Каждый доменный модуль устроен одинаково: `*.resolver.ts`, `*.loader.ts`, `*.service.ts`, `*.repository.ts`, доменный тип (`skill.ts`) и GraphQL-тип в `models/`.

## Поток запроса

```
POST /graphql
  │
  ├─ Query.profile ─────────► ProfileResolver ─► ProfileService ─► ProfileRepository ─► SELECT profiles
  │
  └─ Profile.skills ────────► SkillsResolver (@ResolveField)
     Profile.links                │
     Profile.experience           ▼
     Profile.projects         SkillsLoader ── один DataLoader на GraphQL-контекст запроса
                                  │           собирает все profileId текущего тика
                                  ▼
                              SkillsService ─► SkillsRepository ─► SELECT skills WHERE profile_id IN (...)
```

- Resolver только описывает GraphQL и делегирует вызов. Он не знает о Prisma.
- Service содержит бизнес-логику (например, формирует `period` опыта и бросает `NotFoundException`) и не знает о GraphQL.
- Repository работает с Prisma и выбирает через `select` ровно поля доменного типа.

Результат проверяется тестами. Полный запрос выполняет 5 SELECT, запрос только скалярных полей профиля — 1. Если в одном запросе запрошены два профиля (через алиасы), каждая связь всё равно загружается одним `IN`-запросом с обоими `profile_id`.

## Решения

**Code-first.** Схема GraphQL выводится из TypeScript-классов, поэтому типы и схема не расходятся. `schema.gql` генерируется в dev-режиме и лежит в репозитории для ревью контракта.

**DataLoader вместо `include`.** С `include` связи грузятся всегда, даже если клиент их не запросил, а резолвер профиля начинает зависеть от формы запроса. Каждый `@ResolveField` с DataLoader загружает только запрошенную связь, батчит её по всем родителям в один запрос, а модули остаются независимыми. Loader создаётся на GraphQL-контекст и хранится в `WeakMap`, поэтому его кэш живёт ровно один запрос и не делится между пользователями. Провайдеры остаются singleton: request scope не нужен.

**Ссылки — отдельная сущность.** У каждой ссылки есть свой порядок и уникальность `label` в рамках профиля. Целостность обеспечивает БД, а не JSON без схемы.

**Достижения — `text[]`.** Это значения без собственной идентичности, которые всегда читаются вместе с записью опыта. Отдельная таблица дала бы лишний запрос без пользы.

**`@@unique([profileId, sortOrder])`.** Один индекс покрывает и внешний ключ, и сортировку `WHERE profile_id IN (...) ORDER BY profile_id, sort_order`. Кроме того, он запрещает две записи на одной позиции, поэтому порядок вывода всегда детерминирован.

**CHECK-ограничения.** `end_date >= start_date` и `sort_order >= 0` добавлены в миграцию вручную, так как Prisma не умеет выражать их в схеме. Инварианты держит БД, а не только код.

**Seed.** Профиль обновляется через upsert по `slug` (стабильный ключ, который не нужен клиентам), а вложенные сущности заменяются через delete + create в одной транзакции. Повторный запуск не создаёт дублей и удаляет то, что убрано из `seed-data.ts`.

**Миграции и seed в entrypoint.** `docker-entrypoint.sh` выполняет `prisma migrate deploy`, затем seed, затем `exec node`. Это даёт запуск одной командой и деплой одного сервиса на Render без отдельного job. Цена — образ около 800 МБ: в рантайм попадает Prisma CLI с зависимостями (Studio, pglite, React), хотя приложению он не нужен. Вынос миграций в отдельный одноразовый сервис уменьшил бы образ примерно на 200 МБ. Схема рассчитана на один экземпляр: `migrate deploy` защищён advisory lock, а одновременный seed из нескольких реплик не предусмотрен.

**Apollo Server 5.** `@nestjs/apollo` 14 для NestJS 12 требует `@apollo/server` 5. Версия 4 больше не поддерживается.

**ESM.** Пакеты NestJS 12 публикуются как ESM. В CommonJS-проекте типы `@apollo/server` резолвятся из двух копий и конфликтуют, поэтому проект собран как ESM (`"type": "module"`, импорты с `.js`).

**Ошибки.** `formatError` приводит исключения Nest к кодам GraphQL: `NotFoundException` → `NOT_FOUND`, ошибки `ValidationPipe` → `BAD_USER_INPUT`. В production стек-трейсы не отдаются, а сообщения внутренних ошибок маскируются.

**Apollo Sandbox в production** включён намеренно, чтобы API можно было изучать на деплое.

## Локальная разработка

```bash
cp .env.example .env
docker compose up -d postgres
npm ci
npm run db:migrate
npm run db:seed
npm run start:dev
```

| Скрипт               | Что делает                                                         |
| -------------------- | ------------------------------------------------------------------ |
| `npm run start:dev`  | Генерирует Prisma Client и запускает watch-режим                   |
| `npm run build`      | Генерирует Prisma Client и собирает проект в `dist/`               |
| `npm run start:prod` | Запускает собранное приложение                                     |
| `npm run db:migrate` | Создаёт и применяет миграции (`prisma migrate dev`)                |
| `npm run db:seed`    | Заполняет БД данными из `prisma/seed-data.ts`                      |
| `npm run lint`       | ESLint с проверкой типов                                           |
| `npm run format`     | Prettier (`format:check` — проверка без изменений)                 |
| `npm run test:e2e`   | E2E-тесты на БД из `DATABASE_URL` с применёнными миграциями и seed |

| Переменная           | По умолчанию  | Назначение                             |
| -------------------- | ------------- | -------------------------------------- |
| `DATABASE_URL`       | —             | Строка подключения PostgreSQL          |
| `PORT`               | `3000`        | Порт HTTP-сервера                      |
| `NODE_ENV`           | `development` | `development`, `production` или `test` |
| `PRISMA_LOG_QUERIES` | `false`       | Логировать каждый SQL-запрос Prisma    |

Переменные валидируются при старте, и с некорректным env приложение не запустится. Увидеть SQL в Docker: `PRISMA_LOG_QUERIES=true docker compose up --build`.

## Деплой на Render

`render.yaml` описывает web service на Dockerfile и managed PostgreSQL. `DATABASE_URL` берётся из БД (внутренний connection string), `PORT` выставляет сам Render.

1. Запушьте репозиторий на GitHub.
2. В Render Dashboard выберите **New → Blueprint** и укажите репозиторий. Render прочитает `render.yaml` и предложит создать `developer-card-db` (PostgreSQL 17) и `developer-card-api` (Docker).
3. Нажмите **Apply**. Render соберёт образ по `Dockerfile`.
4. При старте контейнера в логах сервиса должны появиться `All migrations have been successfully applied`, `Profile "developer" seeded` и `Nest application successfully started`.
5. Render проверяет `/health` перед переключением трафика. Ответ `{"status":"ok","database":"up"}` означает, что приложение подключилось к БД.
6. Откройте `https://<имя-сервиса>.onrender.com/graphql`: там откроется Apollo Sandbox.

Ограничения бесплатного плана: web service засыпает при простое, поэтому первый запрос после паузы идёт медленно, а бесплатная БД ограничена по сроку жизни (актуальные условия смотрите в документации Render). Сервис и БД должны быть в одном регионе, иначе внутренний адрес БД недоступен.

## Что дальше

1. Вынести миграции и seed в pre-deploy шаг или отдельный job и собрать рантайм-образ без Prisma CLI.
2. Ограничить глубину и сложность GraphQL-запросов и добавить rate limiting: API публичный.
3. Добавить CI (GitHub Actions): lint, `format:check`, сборку образа и e2e с PostgreSQL в service container.
4. Кэшировать ответ: данные визитки меняются только при деплое, поэтому подойдут `Cache-Control` или кэш ответов Apollo с инвалидацией при seed.
