# Pocket Charlist — техническая документация

## 1. Обзор проекта

Pocket Charlist — full-stack SPA для ведения листов персонажей D&D 5e. Приложение ориентировано на русскоязычный интерфейс, мобильное использование, быстрые игровые действия и минимизацию ручных расчётов.

Ключевые сценарии:
- создание и ведение нескольких персонажей
- быстрый переход между edit/play режимами
- автокалькуляции характеристик, КД, HP, spell save DC и attack bonus
- броски кубов прямо из интерфейса
- экспорт, импорт и публичный шаринг персонажей
- единый аккаунт с входом через `email/password` и через Google

Для UI/UX-дизайнера есть отдельный простой onboarding-документ: [DESIGNER_PROJECT_GUIDE.md](./DESIGNER_PROJECT_GUIDE.md).

## 2. Быстрый вход

```mermaid
flowchart LR
  UI["React UI<br/>/ /character/:id /shared/:token"] --> State["TanStack Query<br/>use-auth / CharacterContext"]
  State --> API["Express routes"]
  API --> Auth["Auth layer<br/>session + Google/email"]
  API --> Storage["IStorage<br/>DatabaseStorage / MemStorage"]
  Storage --> DB["PostgreSQL<br/>characters.data JSONB"]
  State --> Offline["IndexedDB + pending queue + service worker"]
  Offline -. replay .-> API
```

Короткая mental map системы:
- UI живёт в `client/` и держит пользовательское состояние через TanStack Query, `use-auth.ts` и `CharacterContext.tsx`.
- Все защищённые действия идут в Express routes из `server/routes.ts`.
- Аутентификация — cookie-based session auth. В production используется mixed auth через Google и `email/password`, в локальной разработке можно переключиться на bypass через `LOCAL_DEV`.
- Основная сущность персонажа хранится в таблице `characters`, но почти весь payload персонажа лежит внутри `characters.data` как JSONB.
- Частичная оффлайн-поддержка строится вокруг service worker, IndexedDB-кэша и очереди отложенных изменений.

Если нужно понять write path за 30 секунд, смотрите так:
1. UI вызывает `handleChange` или `saveChanges` в `CharacterContext`.
2. Клиент делает `PATCH /api/characters/:id` через `apiRequest`.
3. Сервер в `storage.updateCharacter()` читает текущего персонажа, делает `deepMerge`, затем пишет весь обновлённый JSONB обратно.
4. При оффлайне не-GET запрос может попасть в pending queue и быть отправлен позже.

## 3. Текущее состояние и ограничения

### Реализовано
- Смешанная авторизация: `email/password` + Google OAuth.
- Один аккаунт на один email.
- Account dialog для добавления или смены пароля.
- Публичный read-only шаринг персонажа.
- Библиотека заклинаний из `spells_library.json` с фильтрами по уровню, школе и классу.
- `ConnectionStatus` смонтирован в `App.tsx`: отображает статус сети, счётчик pending changes и кнопку ручной синхронизации.
- Мобильное бургер-меню в шапке листа персонажа: экспорт PDF/JSON, шаринг, профиль и переключатель темы скрыты в `<Menu>` на маленьких экранах, на десктопе остаются открытыми кнопками.
- Частичная оффлайн-поддержка через service worker, IndexedDB-кэш и очередь отложенных изменений.
- **Авторасчёт максимума ОЗ на 1-м уровне**: `calculateMaxHp(class, 1, conMod)` из `shared/types/character-types.ts`; поле `customMaxHpBonus` позволяет добавить ручной бонус. Со 2-го уровня — ручной ввод (игрок вносит результат броска кубика).
- **Авторасчёт КД по типу доспеха**: `calculateAC(dexMod, armor, shield, bonus)` с корректной обработкой тяжёлого доспеха (DEX игнорируется полностью, включая штраф).
- **Автосинхронизация ячеек заклинаний**: таблицы в `shared/data/spell-slots.ts`; `getSpellcastingProgression` собирает обычные spell slots, мультикласс и отдельный warlock pact magic по правилам D&D 5e. При изменении состава классов или уровней `SpellsSection` сразу применяет расчётные значения, а кнопка `По классу` остаётся ручным ресинком.
- **Кнопка повышения уровня по XP**: `getLevelFromXP` в `CharacterHeader`; кнопка появляется при накоплении XP, поддерживает прыжок сразу на несколько уровней.
- **`NumericInput`** (`client/src/components/ui/numeric-input.tsx`): управляемый числовой инпут с локальным state, позволяет очистить поле до нуля без немедленного сброса.
- **Rich text для длинных текстов**: `notes`, `appearance`, `allies`, `factions`, `feature.description` и `spell.description` хранятся как raw strings, но в UI рендерятся как Markdown + безопасный HTML; в edit-flow используется `Текст / Предпросмотр`.

### Ограничения
- Нет email verification.
- Нет reset пароля по email.
- Оффлайн-поддержка best-effort: это не полностью завершённый offline-first режим.
- Versioning персонажей и server-side conflict detection отсутствуют.

## 4. Технологический стек

### Frontend
- React 18
- TypeScript
- Wouter
- TanStack Query v5
- Tailwind CSS
- Shadcn UI / Radix UI
- dnd-kit
- Framer Motion

### Backend
- Express 5
- TypeScript
- Drizzle ORM
- Zod
- Passport
- express-session
- connect-pg-simple

### Data / Infra
- PostgreSQL для production storage и sessions
- JSONB для хранения данных персонажа
- IndexedDB для локального кэша и очереди pending changes
- Service worker для кэширования части статических и GET-ресурсов

## 5. Архитектура и ключевые модули

### Основные страницы
- `/` — список персонажей для авторизованного пользователя или стартовый auth screen для гостя.
- `/character/:id` — основной экран персонажа.
- `/shared/:token` — публичная read-only версия персонажа.

### Основные клиентские точки
- `client/src/pages/CharactersList.tsx` — стартовая страница, список персонажей, import/create/delete, account dialog.
- `client/src/pages/CharacterSheet.tsx` — лист персонажа, шаринг, экспорт, edit/play flow, sticky-навигация по секциям `Общее -> Характеристики -> Оружие -> Инвентарь -> Заклинания -> Заметки` и rich-text notes-блок с preview в edit-mode.
- `client/src/context/CharacterContext.tsx` — загрузка персонажа, optimistic update, autosave, pending changes и share state.
- `client/src/hooks/use-auth.ts` — текущий пользователь, login/register/password/logout.
- `client/src/components/AuthScreen.tsx` — unified start screen для входа и регистрации.
- `client/src/components/AccountDialog.tsx` — установка первого пароля или смена существующего.
- `client/src/components/AbilityWithSkills.tsx` — карточка характеристики: модификатор, спасбросок (включая toggle профиценции и бросок), связанные навыки.
- `client/src/components/FeaturesList.tsx` — список способностей персонажа, раскрытие описаний и rich-text preview в диалоге создания.
- `client/src/components/SpellsSection.tsx` — spellcasting UI, реактивная синхронизация spell slots, библиотека заклинаний и rich-text preview/edit для описаний заклинаний.

### Основные серверные точки
- `server/routes.ts` — character/share endpoints и rate limits.
- `server/google-auth.ts` — production auth с mixed auth логикой.
- `server/local-auth.ts` — локальный auth bypass для разработки.
- `server/password.ts` — `scrypt`-хеширование, verify и normalizing email.
- `server/storage.ts` — `DatabaseStorage` и `MemStorage`.
- `server/deep-merge.ts` — merge логика для server-side PATCH.

### Shared-слой
- `shared/schema.ts` — таблица `characters` и реэкспорт shared types.
- `shared/models/auth.ts` — таблица `users`, auth user types.
- `shared/types/character-types.ts` — основная доменная модель персонажа, Zod-схемы, default character и расчётные функции.
- `shared/data/spells-library.ts` — нормализованная библиотека заклинаний из `spells_library.json`.

## 6. Mental Model Character

Персонаж в этом проекте — не просто “JSONB blob”, а одна сущность с пятью зонами ответственности.

### 6.1 Пять зон модели

#### 1. Relational envelope
Это поля вокруг JSONB-записи в таблице `characters`:
- `id`
- `userId`
- `name`
- `shareToken`
- `isShared`
- `createdAt`
- `updatedAt`

Это отвечает за владение, шаринг, первичную идентификацию и метаданные хранения.

#### 2. Core build
Это “паспорт” и сборка персонажа внутри `characters.data`:
- `class`, `subclass`, `classes`
- `race`, `subrace`
- `level`, `experience`
- `background`, `alignment`
- `abilityScores`, `customAbilityBonuses`
- `savingThrows`
- `skills`
- `proficiencies`

Именно здесь лежат ключевые игровые зависимости и большинство расчётов.

#### 3. Combat state
Это поля, которые чаще всего меняются во время игры:
- `armorClass`, `customACBonus`
- `initiative`, `customInitiativeBonus`
- `maxHp`, `currentHp`, `tempHp`
- `hitDice`, `hitDiceRemaining`
- `deathSaves`
- `spellcasting.spellSlots`

Это самый “горячий” слой данных с точки зрения autosave, оффлайна и конфликтов.

#### 4. Collections
Это массивы и списки, где выше всего риск ошибок при merge и импорте:
- `weapons`
- `equipment`
- `features`
- `spellcasting.spells`
- `classes`

Массивы особенно важны, потому что в PATCH они не merge-ятся поэлементно, а заменяются целиком.

#### 5. Private / freeform fields
Это поля со свободным пользовательским текстом и UI-lock состоянием:
- `notes`
- `appearance`
- `allies`
- `factions`
- `equipmentLocked`
- `weaponsLocked`
- `featuresLocked`

Текстовые поля этого блока хранятся как обычные строки, но readonly/shared UI рендерит их как Markdown + безопасный HTML в стилистике приложения.
Здесь меньше расчётной логики, но больше риска утечки в public-view и потери данных при неаккуратных изменениях allowlist-модели.

### 6.2 Что меняется чаще всего

Во время реальной игры чаще всего меняются:
- `currentHp`
- `tempHp`
- `deathSaves`
- `spellcasting.spellSlots`
- подготовка заклинаний и состав `spellcasting.spells`
- быстрые toggles вроде lock-полей и share state

Именно эти поля первыми попадают под autosave, optimistic update и оффлайн-очередь.

### 6.3 Какие поля критичны и связаны между собой

Наиболее связанные и чувствительные зоны:
- `class` и `classes`
- `level` и `classes`
- `abilityScores`, `customAbilityBonuses` и производные модификаторы
- `savingThrows` и класс-профиценции
- `maxHp`, `currentHp`, `hitDice`, `hitDiceRemaining`
- `spellcasting.ability`, `spellcasting.spells`, `spellcasting.spellSlots`
- `shareToken`, `isShared` и публичная проекция персонажа

Если менять такие поля в изоляции, легко получить валидный JSON с неконсистентным игровым смыслом.

### 6.4 Где чаще всего появляются баги

Самые частые bug-prone зоны:
- массивы объектов, потому что PATCH заменяет их целиком
- связанные поля сборки персонажа, когда меняется одно поле без вторичного пересчёта или синхронизации
- импорт внешнего JSON, где структура частично грязная, неполная или нестандартная
- расхождение private/public модели, если новые поля не учтены в `publicCharacterSchema`
- расхождение клиентского optimistic merge и итогового server merge

## 7. Модель данных

### Таблица `users`
Определена в `shared/models/auth.ts`.

Поля:
- `id`
- `email`
- `googleId`
- `passwordHash`
- `firstName`
- `lastName`
- `profileImageUrl`
- `createdAt`
- `updatedAt`

Важно:
- `id` — внутренний app user id.
- Для новых пользователей Google `profile.id` не используется как primary key.
- При старте production auth выполняется runtime-backfill старых Google-only пользователей: `googleId = id`, если у записи нет `passwordHash`.

### Таблица `characters`
Определена в `shared/schema.ts`.

Поля:
- `id`
- `userId`
- `name`
- `data` (`jsonb`)
- `shareToken`
- `isShared`
- `createdAt`
- `updatedAt`

Практический смысл:
- relational envelope лежит в колонках таблицы
- полная игровая модель лежит в `data`
- `updatedAt` обновляется в БД, но не используется как concurrency token и не участвует в optimistic locking

### Публичная модель персонажа
`publicCharacterSchema` определена в `shared/types/character-types.ts`.

Из публичного ответа исключаются:
- `userId`

`notes` теперь входит в shared/read-only payload наравне с `appearance`, `allies` и `factions`.
`GET /api/shared/:token` использует allowlist-подход: наружу возвращается только разрешённый набор полей. Если в модель персонажа добавляется новое приватное поле, его нужно явно учесть в публичной схеме.

### Ответ `GET /api/auth/user`
Сервер отдаёт безопасную форму пользователя:
- `id`
- `email`
- `firstName`
- `lastName`
- `profileImageUrl`
- `createdAt`
- `updatedAt`
- `hasPassword`
- `hasGoogle`

## 8. Аутентификация и аккаунты

### Общий подход
Проект использует cookie-based session auth. В production доступны два способа входа:
- Google OAuth
- `email/password`

Оба способа работают поверх одной пользовательской записи.

### Auth behavior
- Один email = один аккаунт.
- Если локальный пользователь уже существует по email и входит через Google, `googleId` привязывается к этой же записи.
- Если аккаунт создан через Google и не имеет `passwordHash`, пароль можно поставить только из уже авторизованного состояния.
- Регистрация не должна анонимно “перехватывать” существующий Google-only аккаунт.

### UI-поведение
- Гость попадает на `AuthScreen` на `/`.
- На стартовом экране есть табы “Вход” и “Регистрация”.
- Кнопка Google остаётся альтернативным способом входа.
- Управление паролем происходит через `AccountDialog`.
- При `401` клиент возвращает пользователя на `/`, а не форсит новый Google-flow.

### LOCAL_DEV
`LOCAL_DEV` переключает только auth-режим:
- production auth отключается
- сервер использует `local-auth.ts`
- `/api/auth/user` возвращает фиктивного локального пользователя

Storage при этом выбирается отдельно:
- если есть `DATABASE_URL`, используется PostgreSQL
- если `DATABASE_URL` нет, используется `MemStorage`

### Безопасность
- Auth endpoints имеют отдельный IP-based rate limit: 10 попыток за 15 минут.
- Пароли хранятся как salted hash через встроенный `crypto.scrypt`.
- Email нормализуется как `trim().toLowerCase()`.

Критичные mixed auth edge cases описаны отдельно в разделе 14.

## 9. API reference

### Общие правила
- Все character endpoints и приватные auth endpoints работают с cookie-based session auth.
- Публичным без логина является только `GET /api/shared/:token`, а также редиректные Google endpoints.
- Character endpoints ограничены rate limit-ом `120 req/min` на пользователя.
- Public shared endpoint ограничен rate limit-ом `30 req/min` по IP.
- Auth endpoints ограничены rate limit-ом `10 попыток / 15 минут` по IP.
- `PATCH /api/characters/:id` возвращает полный `Character`, а не diff.
- `DELETE /api/characters/:id` возвращает `204 No Content`.

### 9.1 Персонажи

#### `GET /api/characters`
- Auth: да
- Возвращает: массив полных `Character`
- Основные статусы: `200`, `401`, `429`

Пример ответа:
```json
[
  {
    "id": "2fcd6a8e-0d24-45f0-90f9-f3c72f0f4fb1",
    "userId": "user_123",
    "name": "Новый персонаж",
    "class": "Воин",
    "race": "Человек",
    "level": 1,
    "currentHp": 10,
    "maxHp": 10
  }
]
```

#### `GET /api/characters/:id`
- Auth: да
- Возвращает: полный `Character` текущего пользователя
- Основные статусы: `200`, `401`, `404`, `429`

Пример ответа:
```json
{
  "id": "2fcd6a8e-0d24-45f0-90f9-f3c72f0f4fb1",
  "userId": "user_123",
  "name": "Новый персонаж",
  "class": "Воин",
  "classes": [
    { "name": "Воин", "level": 1 }
  ],
  "race": "Человек",
  "level": 1,
  "abilityScores": {
    "STR": 10,
    "DEX": 10,
    "CON": 10,
    "INT": 10,
    "WIS": 10,
    "CHA": 10
  },
  "currentHp": 10,
  "maxHp": 10,
  "deathSaves": {
    "successes": 0,
    "failures": 0
  },
  "weapons": [],
  "equipment": []
}
```

#### `POST /api/characters`
- Auth: да
- Request body: объект, проходящий `insertCharacterSchema`
- Возвращает: созданный полный `Character`
- Основные статусы: `201`, `400`, `401`, `429`

Практическое правило:
- Для интеграций безопаснее стартовать с payload, эквивалентным `createDefaultCharacter()`, а не пытаться собирать “пустой” персонаж вручную.

Пример рабочего payload:
```json
{
  "name": "Новый персонаж",
  "class": "Воин",
  "race": "Человек",
  "level": 1,
  "classes": [
    { "name": "Воин", "level": 1 }
  ],
  "background": "",
  "alignment": "Истинно нейтральный",
  "experience": 0,
  "abilityScores": {
    "STR": 10,
    "DEX": 10,
    "CON": 10,
    "INT": 10,
    "WIS": 10,
    "CHA": 10
  },
  "customAbilityBonuses": {
    "STR": 0,
    "DEX": 0,
    "CON": 0,
    "INT": 0,
    "WIS": 0,
    "CHA": 0
  },
  "savingThrows": {
    "STR": true,
    "DEX": false,
    "CON": true,
    "INT": false,
    "WIS": false,
    "CHA": false
  },
  "skills": {
    "Акробатика": { "proficient": false, "expertise": false },
    "Анализ": { "proficient": false, "expertise": false },
    "Атлетика": { "proficient": false, "expertise": false },
    "Восприятие": { "proficient": false, "expertise": false },
    "Выживание": { "proficient": false, "expertise": false },
    "Выступление": { "proficient": false, "expertise": false },
    "Запугивание": { "proficient": false, "expertise": false },
    "История": { "proficient": false, "expertise": false },
    "Ловкость рук": { "proficient": false, "expertise": false },
    "Магия": { "proficient": false, "expertise": false },
    "Медицина": { "proficient": false, "expertise": false },
    "Обман": { "proficient": false, "expertise": false },
    "Природа": { "proficient": false, "expertise": false },
    "Проницательность": { "proficient": false, "expertise": false },
    "Религия": { "proficient": false, "expertise": false },
    "Скрытность": { "proficient": false, "expertise": false },
    "Убеждение": { "proficient": false, "expertise": false },
    "Уход за животными": { "proficient": false, "expertise": false }
  },
  "armorClass": 10,
  "customACBonus": 0,
  "initiative": 0,
  "customInitiativeBonus": 0,
  "speed": 30,
  "maxHp": 10,
  "currentHp": 10,
  "tempHp": 0,
  "hitDice": "1d10",
  "hitDiceRemaining": 1,
  "deathSaves": {
    "successes": 0,
    "failures": 0
  },
  "weapons": [],
  "features": [],
  "equipment": [],
  "money": {
    "cp": 0,
    "sp": 0,
    "ep": 0,
    "gp": 0,
    "pp": 0
  },
  "proficiencies": {
    "languages": ["Общий"],
    "weapons": [],
    "armor": [],
    "tools": []
  },
  "proficiencyBonus": 2,
  "notes": "",
  "appearance": "",
  "allies": "",
  "factions": "",
  "equipmentLocked": false,
  "weaponsLocked": false,
  "featuresLocked": false
}
```

Пример ответа:
```json
{
  "id": "2fcd6a8e-0d24-45f0-90f9-f3c72f0f4fb1",
  "userId": "user_123",
  "name": "Новый персонаж",
  "class": "Воин",
  "race": "Человек",
  "level": 1,
  "currentHp": 10,
  "maxHp": 10
}
```

#### `PATCH /api/characters/:id`
- Auth: да
- Request body: частичный `Character`
- Возвращает: полный `Character`
- Основные статусы: `200`, `401`, `404`, `429`

Пример 1. Простое scalar-обновление:
```http
PATCH /api/characters/2fcd6a8e-0d24-45f0-90f9-f3c72f0f4fb1
Content-Type: application/json
```

```json
{
  "currentHp": 12
}
```

Пример 2. Вложенное object-обновление:
```json
{
  "deathSaves": {
    "failures": 1
  }
}
```

Пример 3. Обновление массива:
```json
{
  "weapons": [
    {
      "id": "weapon-longsword",
      "name": "Длинный меч",
      "attackBonus": 5,
      "damage": "1d8",
      "damageType": "рубящий",
      "abilityMod": "str",
      "properties": "универсальное (1d10)"
    }
  ]
}
```

Важно:
- массивы заменяются целиком, а не merge-ятся по элементам
- если нужно изменить один объект в массиве, клиент должен отправить весь новый массив

Фрагмент успешного ответа:
```json
{
  "id": "2fcd6a8e-0d24-45f0-90f9-f3c72f0f4fb1",
  "userId": "user_123",
  "currentHp": 12,
  "deathSaves": {
    "successes": 0,
    "failures": 1
  },
  "weapons": [
    {
      "id": "weapon-longsword",
      "name": "Длинный меч",
      "attackBonus": 5,
      "damage": "1d8",
      "damageType": "рубящий",
      "abilityMod": "str",
      "properties": "универсальное (1d10)"
    }
  ]
}
```

#### `DELETE /api/characters/:id`
- Auth: да
- Возвращает: пустое тело
- Основные статусы: `204`, `401`, `404`, `429`

Пример:
```http
DELETE /api/characters/2fcd6a8e-0d24-45f0-90f9-f3c72f0f4fb1
```

Успешный ответ:
- `204 No Content`

### 9.2 Шаринг

#### `GET /api/characters/:id/share`
- Auth: да
- Возвращает: текущий share state персонажа
- Основные статусы: `200`, `401`, `404`, `429`

Пример ответа:
```json
{
  "shareToken": "78e8b635-3d93-4a7a-813d-6dc3970ce4a8",
  "isShared": true
}
```

#### `POST /api/characters/:id/share`
- Auth: да
- Возвращает: новый или существующий `shareToken`
- Основные статусы: `200`, `401`, `404`, `429`

Пример ответа:
```json
{
  "shareToken": "78e8b635-3d93-4a7a-813d-6dc3970ce4a8"
}
```

#### `DELETE /api/characters/:id/share`
- Auth: да
- Возвращает: отключённый share state
- Основные статусы: `200`, `401`, `404`, `429`

Пример ответа:
```json
{
  "isShared": false,
  "shareToken": null
}
```

#### `GET /api/shared/:token`
- Auth: нет
- Возвращает: публичную read-only проекцию персонажа
- Основные статусы: `200`, `404`, `429`

Важно:
- ответ режется через `publicCharacterSchema`
- `userId` наружу не отдаётся, а `notes` теперь доступны в shared read-only ответе

Фрагмент ответа:
```json
{
  "id": "2fcd6a8e-0d24-45f0-90f9-f3c72f0f4fb1",
  "name": "Новый персонаж",
  "class": "Воин",
  "race": "Человек",
  "level": 1,
  "currentHp": 10,
  "maxHp": 10,
  "appearance": "",
  "allies": "",
  "factions": ""
}
```

### 9.3 Аутентификация

#### `GET /api/auth/user`
- Auth: да
- Возвращает: безопасную форму текущего пользователя
- Основные статусы: `200`, `401`

Пример ответа:
```json
{
  "id": "user_123",
  "email": "player@example.com",
  "firstName": "Илья",
  "lastName": "Игроков",
  "profileImageUrl": "https://lh3.googleusercontent.com/example",
  "createdAt": "2026-03-31T12:00:00.000Z",
  "updatedAt": "2026-03-31T12:00:00.000Z",
  "hasPassword": true,
  "hasGoogle": true
}
```

#### `POST /api/auth/register`
- Auth: нет
- Request body: `email`, `password`, опционально `confirmPassword`
- Возвращает: безопасную форму пользователя и сразу открывает сессию
- Основные статусы: `201`, `400`, `409`, `429`

Пример запроса:
```json
{
  "email": "player@example.com",
  "password": "strong-password-123",
  "confirmPassword": "strong-password-123"
}
```

Пример ответа:
```json
{
  "id": "user_123",
  "email": "player@example.com",
  "firstName": null,
  "lastName": null,
  "profileImageUrl": null,
  "createdAt": "2026-03-31T12:00:00.000Z",
  "updatedAt": "2026-03-31T12:00:00.000Z",
  "hasPassword": true,
  "hasGoogle": false
}
```

Типовой `409`:
- email уже существует
- email уже принадлежит Google-only аккаунту, куда пароль нельзя добавить анонимно

#### `POST /api/auth/login`
- Auth: нет
- Request body: `email`, `password`
- Возвращает: безопасную форму пользователя и открывает сессию
- Основные статусы: `200`, `400`, `401`, `429`

Пример запроса:
```json
{
  "email": "player@example.com",
  "password": "strong-password-123"
}
```

Пример ответа:
```json
{
  "id": "user_123",
  "email": "player@example.com",
  "firstName": "Илья",
  "lastName": "Игроков",
  "profileImageUrl": null,
  "createdAt": "2026-03-31T12:00:00.000Z",
  "updatedAt": "2026-03-31T12:00:00.000Z",
  "hasPassword": true,
  "hasGoogle": false
}
```

Типовой `401`:
- неверный email или пароль
- аккаунт существует только через Google и не имеет локального пароля

#### `POST /api/auth/password`
- Auth: да
- Request body:
  - для Google-only аккаунта без пароля: только `newPassword`
  - для пользователя с существующим паролем: `currentPassword` + `newPassword`
- Возвращает: обновлённую безопасную форму пользователя
- Основные статусы: `200`, `400`, `401`, `404`, `429`

Пример 1. Установить первый пароль:
```json
{
  "newPassword": "strong-password-123"
}
```

Пример 2. Сменить существующий пароль:
```json
{
  "currentPassword": "old-password-123",
  "newPassword": "new-password-456"
}
```

Пример ответа:
```json
{
  "id": "user_123",
  "email": "player@example.com",
  "firstName": "Илья",
  "lastName": "Игроков",
  "profileImageUrl": "https://lh3.googleusercontent.com/example",
  "createdAt": "2026-03-31T12:00:00.000Z",
  "updatedAt": "2026-03-31T12:05:00.000Z",
  "hasPassword": true,
  "hasGoogle": true
}
```

#### `GET /api/login`
- Auth: нет
- Поведение: запускает Google OAuth flow

#### `GET /api/callback`
- Auth: нет
- Поведение: завершает Google OAuth и редиректит на `/`

#### `GET /api/logout`
- Auth: да
- Поведение: завершает сессию и редиректит на `/`

### 9.4 Поведение неавторизованных запросов
- Защищённые endpoints отвечают `401`.
- Клиент больше не форсит пользователя сразу в Google-flow.
- При `401` пользовательский flow возвращает на стартовый экран `/`.

## 10. Conflict Resolution and Consistency Model

Это критичный operational-раздел: в проекте нет отдельной conflict subsystem, поэтому поведение нужно понимать ровно так, как оно реализовано сейчас.

### 10.1 Что есть сейчас
- Versioning персонажей отсутствует.
- Optimistic locking отсутствует.
- ETag / `If-Match` отсутствуют.
- Сервер не хранит и не сравнивает revision number персонажа.
- `updatedAt` в таблице обновляется, но не участвует в принятии решений о конфликте.

### 10.2 Как реально работает `PATCH`

Server path:
1. `storage.updateCharacter()` загружает текущего персонажа по `id + userId`.
2. Из payload удаляются `id` и `userId`.
3. Выполняется `deepMerge(existing, updateData)`.
4. В БД записывается весь обновлённый JSONB, а не patch/diff.

### 10.3 Правила merge
- Plain objects merge-ятся рекурсивно.
- Массивы не merge-ятся поэлементно и не diff-ятся.
- Если в payload пришёл массив, он заменяет весь старый массив.
- `undefined` на сервере игнорируется.
- `null` на сервере перезаписывает существующее значение.

Практическое следствие:
- `PATCH { "deathSaves": { "failures": 1 } }` сохранит `deathSaves.successes`, если оно уже было.
- `PATCH { "weapons": [...] }` заменит весь список оружия, даже если менялся только один элемент.

### 10.4 Кто побеждает при конфликте

Текущее правило конфликта:
- побеждает последний успешно сохранённый запрос

Это означает:
- если два клиента редактируют одни и те же scalar-поля, победит тот PATCH, который сервер применил последним
- если один клиент отправляет старый массив, он может затереть более свежие изменения другого клиента
- сервер не пытается определить “чей state новее” и не делает semantic merge

### 10.5 Оффлайн-реплей и конфликты

Pending queue не делает reconcile/rebase:
- queued change повторно отправляется как обычный HTTP-запрос
- он не знает, что серверное состояние могло уже измениться после момента постановки в очередь
- если queued PATCH содержит затрагиваемые поля, он может переехать поверх более поздних серверных изменений

Точное поведение replay в `offline-sync.ts`:
- изменения отправляются последовательно
- успешные ответы и `404` удаляются из очереди
- `4xx/5xx` остаются в очереди как failed
- network exception прерывает текущий проход синка

### 10.6 Важный caveat: клиентский merge не идентичен серверному

В `CharacterContext.tsx` клиентский optimistic `deepMerge` отличается от server-side версии:
- клиент не пропускает `undefined`
- сервер пропускает `undefined`

Редкий, но важный operational эффект:
- UI может временно показать optimistic state, который потом не совпадёт с фактически сохранённым серверным результатом

Если нужно расследовать “на экране было одно, после перезагрузки стало другое”, это одна из первых точек для проверки.

## 11. Заклинания

### Источник библиотеки
Библиотека заклинаний собрана в `spells_library.json` и подключена через `shared/data/spells-library.ts`.

Нормализованные поля записи библиотеки:
- `id`
- `name`
- `level`
- `school`
- `classes`
- `range`
- `ritual`
- `components`
- `castingTime`
- `description`
- `concentration`
- `duration`

### UI-поведение
В `SpellsSection.tsx` доступны:
- spellcasting ability
- spell save DC
- spell attack bonus
- слоты 1–9 уровня
- реактивная синхронизация расчётных слотов при смене классов и уровней
- ручной ресинк через кнопку `По классу` и точечные `/{расч.}` подсказки
- список заклинаний персонажа
- ручное создание и редактирование заклинаний
- rich-text preview для описаний заклинаний в create/edit диалогах
- rich rendering описаний в раскрытых spell cards
- библиотека заклинаний

### Поиск в библиотеке
Поддерживается фильтрация:
- по названию
- по уровню
- по школе
- по классу (выпадающий список, использует поле `classes` из SpellEntry)

## 12. Оффлайн-поддержка

### Что реально есть
- `client/public/sw.js` регистрируется в production через `client/src/main.tsx`.
- Service worker кэширует:
  - `/`
  - `/index.html`
  - статические ресурсы
  - успешные GET API responses
- `client/src/lib/offline-db.ts` использует IndexedDB для:
  - кэша персонажей
  - очереди pending changes
- `client/src/lib/queryClient.ts`:
  - кэширует список и отдельные карточки персонажей
  - при оффлайне читает данные из IndexedDB
  - для не-GET запросов может класть изменения в очередь
- `client/src/lib/offline-sync.ts` умеет повторно отправлять queued changes

### Чего сейчас нет в основном UI
- Нет полного conflict-aware UX для queued changes.
- Нет полноценного diff/review шага перед replay отложенных PATCH-запросов.

Итоговая формулировка:
- проект имеет частичную оффлайн-поддержку
- проект не является полностью завершённым offline-first приложением
- детали merge и конфликтов нужно читать вместе с разделом 10

Критичные риски очереди и replay описаны отдельно в разделе 14.

## 13. Импорт, экспорт и шаринг

### Импорт
- Поддерживается импорт JSON-персонажей.
- Основной импортёр находится в `client/src/lib/lss-import.ts`.
- Импортёр распознаёт несколько форматов через эвристики, включая pocket-charlist и Long Story Short JSON.
- При импорте возможны lossy mappings: внешние поля не всегда один в один совпадают с внутренней моделью.

Критичные import edge cases описаны отдельно в разделе 14.

### Экспорт
- JSON export — `client/src/lib/json-export.ts`
- PDF export — `client/src/lib/pdf-export.ts`

### Шаринг
- В `CharacterSheet` пользователь может включить шаринг.
- Появляется публичная ссылка на `/shared/:token`.
- Публичная страница read-only и не требует авторизации.
- Ответ режется allowlist-моделью `publicCharacterSchema`.

## 14. Known Risk Areas

### Deep merge + concurrent edits
- Почему это риск:
  - система не использует versioning и не определяет конкурентные конфликты
  - массивы заменяются целиком
  - связанные поля персонажа могут обновляться из разных UI-path одновременно
- Как это выглядит в симптомах:
  - “одно поле сохранилось, а соседнее откатилось”
  - “после второй вкладки пропал элемент из массива”
  - “в UI всё выглядело правильно, после перезагрузки стало иначе”
- Текущее реальное поведение:
  - last successful write wins
  - server `PATCH` делает recursive merge только для plain objects
  - arrays replace whole arrays
  - `undefined` игнорируется на сервере
- Где искать код:
  - `server/deep-merge.ts`
  - `server/storage.ts`
  - `client/src/context/CharacterContext.tsx`
- Что нельзя сломать:
  - запрет на перезапись `id/userId` через PATCH
  - понимание, что `PATCH` возвращает полный `Character`
  - distinction между server merge и client optimistic merge

### Offline queue sync conflicts
- Почему это риск:
  - queued changes могут быть построены на устаревшем локальном состоянии
  - replay не делает rebase на текущее серверное состояние
  - пользователь не видит conflict review step в основном UI
- Как это выглядит в симптомах:
  - после восстановления сети часть изменений “вернулась”, а часть затёрла более свежие данные
  - один неудачный replay оставляет элементы в очереди и даёт повторяющиеся проблемы
  - расследование требует понимания, что именно было в pending queue
- Текущее реальное поведение:
  - изменения уходят последовательно
  - `2xx` и `404` удаляются из очереди
  - `4xx/5xx` остаются в очереди
  - network exception прерывает текущий проход
- Где искать код:
  - `client/src/lib/queryClient.ts`
  - `client/src/lib/offline-db.ts`
  - `client/src/lib/offline-sync.ts`
  - `client/public/sw.js`
- Что нельзя сломать:
  - кэш GET-ответов отдельно от очереди write-запросов
  - semantics удаления очереди только после успешного replay или `404`
  - связь с разделом 10 про отсутствие conflict resolution

### Import mapping edge cases
- Почему это риск:
  - импорт использует эвристики распознавания формата
  - внешние JSON-структуры могут быть неполными, грязными или неожиданно закодированными
  - часть полей маппится с потерями или через fallback
- Как это выглядит в симптомах:
  - некорректные skill names
  - неполный инвентарь или feature list после импорта
  - странные символы или missing data в текстовых полях
- Текущее реальное поведение:
  - поддерживается pocket-charlist JSON и LSS-подобный JSON
  - формат определяется эвристически
  - при неизвестном формате импортёр кидает ошибку
  - для части полей используются запасные значения по умолчанию
- Где искать код:
  - `client/src/lib/lss-import.ts`
  - `shared/types/character-types.ts`
- Что нельзя сломать:
  - поддержка текущих форматов импорта
  - fallback values для критичных полей персонажа
  - явная ошибка на действительно неизвестном формате

### Mixed auth edge cases
- Почему это риск:
  - один email должен обслуживаться как один аккаунт через два способа входа
  - есть legacy Google users и runtime-backfill
  - у Google-only аккаунтов особые правила установки пароля
- Как это выглядит в симптомах:
  - пользователь “видит другой аккаунт” после входа через Google
  - регистрация по email конфликтует с существующим Google-only аккаунтом
  - локальная разработка ведёт себя не так, как production auth
- Текущее реальное поведение:
  - email нормализуется через `trim().toLowerCase()`
  - linking идёт по email или `googleId`
  - legacy Google-only users получают `googleId = id` при старте production auth
  - пароль нельзя анонимно добавить к Google-only аккаунту через регистрацию
- Где искать код:
  - `server/google-auth.ts`
  - `server/local-auth.ts`
  - `server/password.ts`
  - `shared/models/auth.ts`
- Что нельзя сломать:
  - один email = один аккаунт
  - `GET /api/logout` должен редиректить на `/`
  - `LOCAL_DEV` — это bypass auth, а не эмуляция всего production поведения

## 15. Тесты и качество

### Текущее покрытие тестами
Vitest используется для unit tests:
- `tests/deep-merge.test.ts`
- `tests/calculations.test.ts`
- `tests/password-utils.test.ts`
- `tests/spell-slots.test.ts`
- `tests/public-character-schema.test.ts`
- `tests/rich-text.test.ts`

### Что именно покрыто
- deep merge логика
- расчётные функции D&D 5e
- email normalization и password hash/verify
- spell slot progression, включая pact magic / multiclass поведение
- shared allowlist для `publicCharacterSchema`
- sanitization и базовый render Markdown + safe HTML

### Проверочные команды
```bash
npm run check
npm test
npm run build
```

## 16. Документация для разработчика

### Где искать бизнес-логику
- `shared/types/character-types.ts` — основная доменная модель персонажа, Zod-схемы, default character, расчёты и utility-функции.
- `shared/data/*.ts` — справочные D&D данные.

### Где искать auth
- `server/google-auth.ts` — production auth flow
- `server/local-auth.ts` — локальный bypass
- `server/password.ts` — hash/verify и normalizeEmail
- `shared/models/auth.ts` — таблица пользователей и auth user types

### Где искать spell library
- `spells_library.json` — сырой источник библиотеки
- `shared/data/spells-library.ts` — нормализованный экспорт для клиента
- `client/src/components/SpellsSection.tsx` — UI и поиск

### Где искать rich text
- `client/src/components/RichTextContent.tsx` — общий renderer Markdown + safe HTML
- `client/src/components/RichTextField.tsx` — общий `Текст / Предпросмотр` wrapper
- `client/src/index.css` — слой `.rich-content` с визуальными правилами для rich text

### Где искать клиентскую state-логику
- `client/src/hooks/use-auth.ts`
- `client/src/context/CharacterContext.tsx`
- `client/src/lib/queryClient.ts`
- `client/src/lib/offline-sync.ts`

### Где искать тесты
- `tests/`

## 17. Команды и окружение

### Скрипты
```bash
npm run dev
npm run dev:local
npm run build
npm start
npm run check
npm test
npm run db:push
```

### Переменные окружения
| Переменная | Назначение |
|---|---|
| `DATABASE_URL` | Подключение к PostgreSQL. |
| `SESSION_SECRET` | Секрет session cookies. |
| `GOOGLE_CLIENT_ID` | Google OAuth client id. |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret. |
| `LOCAL_DEV` | Переключает auth на local bypass. |
| `PORT` | Порт сервера, по умолчанию `5000`. |

### Практическая настройка
- Для production auth нужны `SESSION_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- Для PostgreSQL storage нужен `DATABASE_URL`.
- Для локальной разработки без реального auth можно использовать `LOCAL_DEV=true`.

## 18. Итог

Pocket Charlist сейчас — рабочее full-stack приложение с:
- устойчивой моделью персонажа
- mixed auth
- публичным шарингом
- библиотекой заклинаний с фильтрами по уровню, школе и классу
- мобильным бургер-меню с доступом к экспорту, шарингу и профилю
- частичной оффлайн-поддержкой

Ключевой operational вывод:
- документацию нужно читать вместе с реальным conflict model
- массивы в PATCH заменяются целиком
- versioning и server-side conflict detection пока отсутствуют
- оффлайн-очередь и mixed auth требуют аккуратных изменений и внимательного сопровождения
