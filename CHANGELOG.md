# Changelog

All notable changes to Pocket Charlist are documented here.

---

## 2026-04-10 — Security & quality pass (code review)

### Security

#### Backend input validation (PATCH)
- `server/routes.ts`: тело запроса `PATCH /api/characters/:id` теперь прогоняется через `characterSchema.partial().parse(req.body)` перед передачей в storage. Неизвестные поля отсекаются, типы валидируются. При ошибке — `400 { error }`. Ранее произвольные поля попадали в deepMerge без фильтрации.
- `server/storage.ts`: после `deepMerge` результат дополнительно валидируется через `characterSchema.safeParse()`. Если merge-результат не прошёл валидацию — предупреждение логируется, запись всё равно продолжается (безопасный fallback, чтобы не потерять данные).

#### Session cookie
- `server/google-auth.ts`: добавлен `sameSite: "lax"` к session cookie. Ранее `sameSite` не был задан явно (браузер применял default, который может блокировать cookie при cross-site Google OAuth callback-редиректе).

#### Logout CSRF protection
- `GET /api/logout` → `POST /api/logout` в обоих auth-файлах (`google-auth.ts`, `local-auth.ts`). GET-логаут позволял любой ссылке или redirect принудительно разлогинить пользователя (CSRF). Ответ изменён с `redirect "/"` на `{ ok: true }`.
- `client/src/hooks/use-auth.ts`: logout стал async, отправляет `POST /api/logout`, затем последовательно очищает TanStack Query cache (`queryClient.clear()`), IndexedDB-кэш персонажей (`clearAllCachedCharacters()`), pending queue (`clearPendingChanges()`), после чего делает `window.location.href = "/"`.

#### CORS
- `server/index.ts`: добавлен ручной CORS middleware (без зависимости `cors`). Контролируется через `ALLOWED_ORIGIN` env var. Без переменной — same-origin only (безопасно для типичного single-server deploy).

#### Service worker privacy
- `client/public/sw.js`: `/api/auth/*` и `/api/characters*` исключены из SW-кэша. Ранее service worker кэшировал ВСЕ успешные GET-ответы включая user-specific данные персонажей и auth/user — при смене пользователя в одном браузере следующий мог видеть кэшированные данные предыдущего. Эти эндпойнты уже обслуживаются IndexedDB с правильной изоляцией. CACHE_NAME поднят до `pocket-charlist-v2` для принудительного сброса устаревшего v1-кэша на клиентах.

### Bug fixes (frontend)

#### CharacterContext: dual-sync bug
- `client/src/context/CharacterContext.tsx`: удалён cleanup useEffect, который при переходе `isEditing → false` отправлял второй PATCH с накопленными `pendingChangesRef`. Это приводило к двум последовательным PATCH-запросам за одно сохранение. `saveChanges()` уже самостоятельно обрабатывает это.

#### CharacterContext: навигация без перезагрузки
- `window.location.href = "/"` при `401` заменён на `setLocation("/")` из Wouter. Старый вариант полностью перезагружал страницу.

#### CharacterSheet: утечка интервала при PDF-экспорте
- `client/src/pages/CharacterSheet.tsx`: `setInterval` для rotating toast-сообщений перенесён в `useRef`. Ранее при навигации во время экспорта интервал продолжал вызывать `setPdfToast` на размонтированном компоненте.

#### EquipmentSystem: stale closure в swipe-эффекте
- `client/src/components/EquipmentSystem.tsx`: `swipeX` добавлен в массив зависимостей `useEffect` свайп-логики. Без этого эффект читал устаревший `swipeX === 0` при каждом изменении `isSwipeOpen`.

#### ConnectionStatus: отсутствующая зависимость
- `client/src/components/ConnectionStatus.tsx`: `handleSync` добавлен в deps `useEffect`. Без этого effect не пересоздавался при изменении `handleSync`, что могло привести к вызову stale-версии при первом срабатывании.

#### offline-db: txPromise без onerror
- `client/src/lib/offline-db.ts`: в `txPromise` добавлен `request.onerror = () => reject(request.error)`. Ранее промис никогда не реджектился при ошибке IDB-запроса.

#### index.css: мёртвые стили
- `client/src/index.css`: удалён блок `[contenteditable][data-placeholder]:empty::before` (нет `contenteditable` в кодовой базе) и дублирующий selector `.border.hover-elevate:not(.no-hover-interaction-elevate)::after` в блоке `inset: -1px`.

### Cache consistency

#### Server response → TanStack cache
- `client/src/context/CharacterContext.tsx`: `updateMutation` получил `onSuccess`, который парсит ответ сервера и вызывает `queryClient.setQueryData(["/api/characters", id], updated)`. Ранее optimistic update из `onMutate` оставался в кэше навсегда — вычисленные сервером поля (например, `updatedAt`) не попадали в клиентский кэш до следующего refetch.

#### Инвалидация списка после мутаций
- `updateMutation.onSettled`, `enableShareMutation.onSuccess`, `disableShareMutation.onSuccess` теперь вызывают `queryClient.invalidateQueries({ queryKey: ["/api/characters"] })`. Это необходимо, так как `staleTime: Infinity` блокирует автоматическое обновление списка. Без инвалидации список отображал устаревшие имена и статусы до полной перезагрузки страницы.

### Database

#### Индексы на таблице characters
- `shared/schema.ts`: добавлены Drizzle-индексы:
  - `characters_user_id_idx` на `userId` — покрывает все `getCharacters` / `getCharacter` запросы
  - `characters_share_token_idx` на `shareToken` — покрывает `getSharedCharacter` lookup
- Применены к Neon через прямой SQL (не через `db:push`, т.к. drizzle-kit спрашивал TTY-confirm из-за constraint от удалённой `ensureUserAuthColumns`).

### Refactoring / tech debt

#### Удалена runtime ALTER TABLE
- `server/google-auth.ts`: удалена функция `ensureUserAuthColumns()` (выполняла `ALTER TABLE users ADD COLUMN IF NOT EXISTS` при каждом старте). Колонки уже присутствуют в Drizzle-схеме. `backfillLegacyGoogleUsers()` оставлена.

#### offline-db: clearAllCachedCharacters
- `client/src/lib/offline-db.ts`: экспортирована новая функция `clearAllCachedCharacters()` — очищает весь characters store в IndexedDB. Используется при logout для предотвращения утечки данных.

### Structure / project files

- `spells_library.json` (1.7 MB) перемещён из корня в `shared/data/spells_library.json`. Импорт обновлён в `shared/data/spells-library.ts`.
- `charlist_blank.pdf` (322 KB) перемещён из корня в `assets/charlist_blank.pdf`. Путь обновлён в `tests/pdf-export.test.ts`. Файл в `client/public/charlist_blank.pdf` остаётся — он используется рантаймом в браузере.
- `script/build.ts` перемещён в `scripts/build.ts`. Директория `script/` удалена.
- `ecosystem.config.example.cjs` перемещён в `scripts/`.
- `package.json`: `"name"` исправлен с `"rest-express"` на `"pocket-charlist"`.
- `.env.example` создан: документирует все переменные окружения (`DATABASE_URL`, `SESSION_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `COOKIE_SECURE`, `ALLOWED_ORIGIN`, `LOCAL_DEV`, `PORT`).
- `DESIGNER_PROJECT_GUIDE.md` восстановлен из git HEAD (был случайно удалён из рабочей директории).

---

## [Unreleased] — Equipment UX, Loading Screen

### Added

#### Equipment — scroll fix
- `client/src/index.css`: added `max-height: inherit` and `overflow-y: auto` to `.equipment-scroll-viewport` so the Radix ScrollArea viewport respects the `min(60vh, 42rem)` constraint and scrolls internally instead of expanding the card.

#### Equipment — iOS-style swipe actions (mobile)
- `client/src/components/EquipmentSystem.tsx`: `SortableEquipmentItem` now supports swipe-to-reveal on touch screens.
  - Swipe left → reveals **Edit** (accent) and **Delete** (red) action buttons.
  - Phase 2 (drag past ~65% row width): Edit button collapses, delete zone expands with red fill animation, trash icon scales up — matching native iOS feel.
  - Full swipe commits delete after a 200ms fly-out animation.
  - Only one item can be open at a time; tapping another item or empty space closes the current one.
  - Direction detection prevents conflict with vertical scroll and `@dnd-kit` drag reorder.

#### Equipment — hover-reveal actions (desktop)
- On `sm:` and above, Edit (pencil) and Delete (trash) buttons appear on row hover via `group-hover:opacity-100`. No swipe needed.

#### Equipment — Edit item dialog
- `AddCustomItemDialog` extended with `isEdit`, `initialItem`, `onUpdate` props.
- Opens pre-filled with the selected item's data; saves via `updateEquipmentItem` instead of `addEquipment`.

#### Equipment — Delete confirmation
- All delete actions (swipe, hover button, direct) route through `requestDelete(id)` → `AlertDialog` → `confirmDelete()`. Shows the item name in the dialog body.

#### Equipment — tab order
- Category tab bar moved **above** the "Экипировано" badge strip for better visual hierarchy.

#### Loading screen — HTML pre-loader
- `client/index.html`: inline `<style>` block with shared `.pkt-loader` / `.ld-*` CSS classes + SVG d20 + orbiting dots + rotating messages.
- Inline `<script>` reads `localStorage('dnd-theme')` and sets `.dark`/`.light` class on `<html>` **before** first paint — no background flash.
- Renders immediately with the first byte of HTML, before any JS is downloaded.

#### Loading screen — React component
- `client/src/components/CharacterLoadingScreen.tsx`: renders the identical `.pkt-loader` markup reusing the same CSS from `index.html <head>`.
- `HtmlLoaderRemover` in `App.tsx`: `useEffect` fades out and removes `#app-loader` after React first commit (450ms `opacity` transition).

### Fixed

- `client/src/hooks/use-media-query.ts`: initialised state synchronously via `() => window.matchMedia(query).matches` — eliminates the Drawer→Dialog flicker on desktop when `ResponsiveDialog` first renders.
- `client/src/context/CharacterContext.tsx`: `isLoading` now includes `isAuthLoading` — prevents the "Персонаж не найден" flash while the auth check is still in-flight on hard reload.

---

## 2026-04-09 — Upstream merge (zlicez/Poket-Charlist@dev)

Merged 4 upstream commits:

- `feat: unified tooltip system, header play mode info, PDF progress toast` — `HelpTooltip`, `TooltipBody`, `tooltip-content.ts`; play mode info in `CharacterHeader`; PDF export progress toast with rotating funny messages.
- `chore: finalize template pdf export and clean up docs` — `charlist_blank.pdf` template, `NotoSans-Regular.ttf` font for PDF.
- `feat: refine character sheet flow and rich text support` — `RichTextContent`, `RichTextField` components; rich text for notes, features, spell descriptions.
- `fix: make prod cookie security configurable` — `google-auth.ts` reads `COOKIE_SECURE` env var.

New shared data: `shared/data/spell-slots.ts` — full spell slot tables for all classes + multiclass + warlock pact magic.

New tests: `tests/pdf-export.test.ts`, `tests/public-character-schema.test.ts`, `tests/rich-text.test.ts`, `tests/spell-slots.test.ts`.
