# Pocket Charlist

Pocket Charlist — full-stack веб-приложение для ведения листов персонажей D&D 5e с русскоязычным интерфейсом. Проект ориентирован на быстрые игровые действия за столом, мобильный формат и минимизацию ручных расчётов, но нормально работает и на десктопе.

## Что умеет сейчас
- Вести несколько персонажей в одном аккаунте.
- Работать с полным листом персонажа: характеристики, навыки, спасброски, КД, HP, инвентарь, оружие, заметки.
- Поддерживать мультикласс, автокалькуляции, броски кубов и play/edit режимы.
- Работать с заклинаниями: слоты, список известных заклинаний, подготовка и библиотека заклинаний.
- Искать заклинания в библиотеке по названию, уровню, школе и классу.
- Импортировать персонажей из JSON и экспортировать в JSON и PDF.
- Давать публичную read-only ссылку на персонажа через `/shared/:token`.
- Поддерживать смешанную авторизацию: `email/password` и Google OAuth в рамках одного аккаунта на один email.
- Частично поддерживать оффлайн: service worker, кэш GET-запросов, IndexedDB-кэш персонажей и очередь отложенных изменений.

## Актуальный auth flow
- Неавторизованный пользователь попадает на стартовый экран `/`.
- На стартовом экране доступны:
  - вход по `email/password`
  - регистрация по `email/password`
  - вход через Google
- Один email соответствует одной учётной записи.
- Если аккаунт сначала создан через Google, пароль можно добавить позже из dialog аккаунта после входа.
- `GET /api/logout` возвращает пользователя на `/`, а не запускает новый Google-flow.

## Быстрый старт
### 1. Установка
```bash
npm install
```

### 2. Запуск
```bash
# dev-сервер
npm run dev

# dev-сервер с локальным auth bypass
npm run dev:local
```

По умолчанию приложение работает на порту `5000`.

### 3. Полезные команды
```bash
npm run check
npm test
npm run build
npm start
npm run db:push
```

## Что важно знать
- `LOCAL_DEV` переключает только режим аутентификации.
- Хранилище выбирается отдельно:
  - если задан `DATABASE_URL`, используется PostgreSQL
  - если `DATABASE_URL` нет, используется in-memory storage
- Email verification и reset пароля через почту пока отсутствуют.

## Маршруты приложения
- `/` — стартовый экран авторизации или список персонажей
- `/character/:id` — основной лист персонажа
- `/shared/:token` — публичная read-only страница персонажа

## Основные API endpoints
### Персонажи
- `GET /api/characters`
- `GET /api/characters/:id`
- `POST /api/characters`
- `PATCH /api/characters/:id`
- `DELETE /api/characters/:id`

### Шаринг
- `GET /api/characters/:id/share`
- `POST /api/characters/:id/share`
- `DELETE /api/characters/:id/share`
- `GET /api/shared/:token`

### Аутентификация
- `GET /api/auth/user`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/password`
- `GET /api/login`
- `GET /api/callback`
- `GET /api/logout`

`GET /api/auth/user` возвращает безопасную форму пользователя с флагами:
- `hasPassword`
- `hasGoogle`

Подробные примеры запросов и ответов, правила merge и конфликтов, раздел `Known Risk Areas` и backend-поведение описаны в [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md).
Для UI/UX-погружения есть отдельный простой документ: [DESIGNER_PROJECT_GUIDE.md](./DESIGNER_PROJECT_GUIDE.md).

## Переменные окружения
| Переменная | Назначение |
|---|---|
| `DATABASE_URL` | Подключение к PostgreSQL. Если отсутствует, storage работает в памяти. |
| `SESSION_SECRET` | Секрет для cookie-based сессий в production auth. |
| `GOOGLE_CLIENT_ID` | Google OAuth client id. |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret. |
| `LOCAL_DEV` | Включает локальный auth bypass вместо production auth. |
| `PORT` | HTTP-порт приложения, по умолчанию `5000`. |

## Краткая структура проекта
```text
client/src/
  components/
    AuthScreen.tsx
    AccountDialog.tsx
    SpellsSection.tsx
  context/
    CharacterContext.tsx
  hooks/
    use-auth.ts
  pages/
    CharactersList.tsx
    CharacterSheet.tsx
    SharedCharacterSheet.tsx

server/
  routes.ts
  storage.ts
  google-auth.ts
  local-auth.ts
  password.ts

shared/
  schema.ts
  models/auth.ts
  data/
    spells-library.ts
  types/
    character-types.ts

tests/
  deep-merge.test.ts
  calculations.test.ts
  password-utils.test.ts
```

## Где смотреть дальше
- Полная техническая и operational-документация: [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)
- Дизайнерский onboarding и guide для редизайна: [DESIGNER_PROJECT_GUIDE.md](./DESIGNER_PROJECT_GUIDE.md)
- Общая доменная логика и расчёты: `shared/types/character-types.ts`
- Auth: `server/google-auth.ts`, `server/local-auth.ts`, `server/password.ts`
- Библиотека заклинаний: `shared/data/spells-library.ts` и `spells_library.json`
