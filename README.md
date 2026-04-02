# AI Use Case Hub

Веб-приложение: каталог AI-кейсов с админкой и ролевой моделью (NestJS, Prisma + SQLite, Next.js).

## Требования

- **Node.js** 18.x или 20.x (LTS)
- **npm** 9+
- Доступ в интернет для `npm install` и загрузки движков **Prisma** (см. раздел «Проблемы»).

## Клонирование

```bash
git clone <url-репозитория>
cd AIUseCaseHub
```

## Backend (`backend/`)

### 1. Переменные окружения

Скопируйте пример и при необходимости отредактируйте секреты:

```bash
cd backend
copy .env.example .env
```

В Unix/macOS: `cp .env.example .env`.

Поля в `.env`:

| Переменная | Описание |
|------------|----------|
| `DATABASE_URL` | SQLite, по умолчанию `file:./dev.db` (файл создаётся рядом со схемой в `prisma/`) |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Секреты подписи JWT — **замените в продакшене** |
| `PORT` | Порт API, по умолчанию `4000` |

### 2. Зависимости и Prisma

```bash
npm install
```

После установки в `postinstall` выполняется `prisma generate`. Нужен доступ к `binaries.prisma.sh`.

Примените миграции к локальной БД:

```bash
npx prisma migrate deploy
```

Для разработки с созданием новых миграций используйте: `npm run prisma:migrate`.

### 3. Начальные данные (роли и админ)

```bash
npm run prisma:seed
```

Создаются роли `ADMIN`, `EDITOR`, `USER` и пользователь:

- **Email:** `admin@example.com`
- **Пароль:** `Admin123!`

### 4. Запуск API

```bash
npm run start:dev
```

Сервер: `http://localhost:4000` (если не меняли `PORT`).

Сборка продакшена:

```bash
npm run build
npm run start
```

> Скрипт `start:prod` в `package.json` ориентирован на Unix (`NODE_ENV=production`). На Windows для продакшена задайте `NODE_ENV=production` вручную или используйте `npm run start` после сборки при необходимости с внешним способом выставления переменных.

## Frontend (`frontend/`)

### 1. Переменные окружения

```bash
cd ../frontend
copy .env.local.example .env.local
```

В `.env.local` укажите URL API:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

**Важно:** в браузере открывайте сайт с **тем же хостом**, что и в этом URL (не смешивайте `localhost` и IP вроде `192.168.x.x`) — иначе httpOnly-cookies авторизации не попадут в запросы к Next.js.

### 2. Зависимости и запуск

```bash
npm install
npm run dev
```

Приложение: `http://localhost:3000`.

## Полный порядок «с нуля»

```text
cd backend  && copy .env.example .env
cd backend  && npm install && npx prisma migrate deploy && npm run prisma:seed
cd backend  && npm run start:dev

cd frontend && copy .env.local.example .env.local
cd frontend && npm install && npm run dev
```

Во втором терминале держите фронт, в первом — бэкенд.

## Возможные проблемы

### Prisma: «did not initialize» / ошибка скачивания с `binaries.prisma.sh`

Нужно успешно выполнить `npx prisma generate` (или повторный `npm install` в `backend`). При блокировке CDN — VPN, прокси или перенос сгенерированных файлов с машины, где установка прошла (см. обсуждения в issues Prisma про офлайн/зеркала).

### Авторизация: после входа снова страница логина

Проверьте совпадение хоста: URL в `NEXT_PUBLIC_API_URL` и адресная строка браузера (`localhost` vs IP).

### Порт занят

Измените `PORT` в `backend/.env` и обновите `NEXT_PUBLIC_API_URL` на фронте.

## Структура репозитория

```text
backend/   — NestJS API, Prisma, JWT + cookies
frontend/  — Next.js 14, Ant Design
```

## Лицензия

Уточните у владельца репозитория.
