# Changelog

All notable changes to Pocket Charlist are documented here.

---

## [Unreleased] — Class engine, versatile weapons, race/HP fixes

### Added

#### Class engine — canonical class definitions
- `shared/data/class-types.ts` — новые канонические типы классовой системы: `ClassDefinition`, `SubclassDefinition`, `ClassFeatureDefinition`, `ClassResourceDefinition`, `ClassProficiencyBlock`, `ClassChoiceDefinition`, `ClassEffect`. Типы источников: `ClassSourceCode`, `ClassEntityType`, `ClassSpellcastingProgressionKind`, `ClassSpellcastingMode`.
- `shared/data/class-progressions.ts` — полная таблица прогрессии ячеек заклинаний по уровням для всех типов каст-прогрессий (`full`, `half`, `third`, `artificer`, `pact`); функции `getSpellSlotsForProgression`, `getMulticlassCasterLevel`, `getPactMagicForLevel`, `resolveSpellcastingProgression`.
- `shared/data/d5e-classes.ts` — полный рерайт: все 12 классов PHB переведены в `ClassDefinition` shape с полями `id`, `source`, `contentVersion`, `hitDice`, `savingThrows`, `proficiencies` (включая `choices`), `spellcasting`, `features` (по уровням), `subclasses` (с фичами). Экспортированы `CLASS_DEFINITIONS`, `CLASS_DEFINITIONS_BY_NAME`, `getClassDefinitionById`, `getClassDefinitionByName`, `getFallbackClassDefinition`. Обратная совместимость: `CLASS_DATA` и `CLASSES` по-прежнему доступны.
- `shared/lib/class-engine.ts` — движок классов: `resolveClassState(character)` вычисляет полное состояние класса персонажа — владения, заклинательные ячейки, ресурсы, предупреждения о незавершённых выборах. Возвращает `ResolvedClassState` с полями `proficiencies`, `spellcasting`, `resources`, `choiceDiagnostics`.
- `shared/lib/class-compat.ts` — backward-compat слой: `buildClassSelectionsFromLegacy` конвертирует старые `{ class, level, subclass, classes[] }` в новые `ClassSelection[]`; `projectLegacyClassState` делает обратное преобразование для рендера.
- `shared/schema.ts` — реэкспортирует `class-types`, `class-progressions`, `class-compat`, `class-engine`.

#### Новые поля персонажа — class selections
- `shared/types/character-types.ts`:
  - `classSelectionSchema` / `ClassSelection` — структурированная запись о выборе класса: `classId`, `className`, `source`, `level`, `subclassId`, `subclassName`, `choices`, `optionalFeatureIds`, `resourceState`.
  - `classHitDicePoolSchema` / `ClassHitDicePool` — пул костей хитов по отдельному классу.
  - `classSelections?: ClassSelection[]` и `classHitDicePools?: ClassHitDicePool[]` добавлены в `characterSchema` (опциональные, backward compat).
  - `classSelectionSchemaVersion?: number` — версия схемы выборов.
  - `getOrBuildClassSelections(character)` — ленивый builder: возвращает `classSelections` если есть, иначе строит из legacy `class`/`level`/`subclass`/`classes`.

#### Versatile weapons — хват оружия
- `shared/types/character-types.ts`: `WeaponGripMode = "oneHand" | "twoHand"` (константа `WEAPON_GRIP_MODES`); поле `gripMode` добавлено в `weaponSchema` и `equipmentSchema`.
- `shared/data/d5e-equipment.ts`: поле `gripMode?` добавлено в `BaseEquipmentItem`.
- `client/src/lib/weapons.ts`: `WeaponFormValues` содержит `versatileDamage: string` и `gripMode: WeaponGripMode`; `WEAPON_GRIP_LABELS`; функции `hasVersatileDamage`, `normalizeWeaponGripMode`, `getActiveWeaponDamage`, `getWeaponPropertiesDisplay`, `parseWeaponProperties`, `weaponToFormValues`, `equipmentWeaponToWeapon`.
- `client/src/components/WeaponGripToggle.tsx` — новый компонент: pill-переключатель «1 рука / 2 руки» (стиль segmented control). Поддерживает `size: "sm" | "xs"`.
- `client/src/components/WeaponFormFields.tsx`: поле `versatileDamage` (показывается только если выбрано свойство «Универсальное»); переключатель `WeaponGripToggle` в форме добавления/редактирования.
- `client/src/components/WeaponsList.tsx`: отображение урона с учётом `gripMode` через `getActiveWeaponDamage`; `WeaponGripToggle` в строке оружия (десктоп) и в развёрнутом аккордеоне (мобайл); props `onWeaponGripChange`, `onInventoryWeaponGripChange`, `allowGripToggle`.
- `client/src/pages/CharacterSheet.tsx`: обработчики `handleWeaponGripChange` и `handleInventoryWeaponGripChange` применяют изменение `gripMode` к соответствующему weapon/equipment по `id`; `getActiveWeaponDamage` используется при броске урона.

#### Иммунитеты во Владениях
- `shared/types/character-types.ts`: поле `immunities: DamageType[]` добавлено в `CombinedProficiencies`; `getRaceAndClassProficiencies` собирает иммунитеты из расы и подрасы.
- `client/src/components/ProficienciesSection.tsx`: блок иммунитетов к урону (синяя иконка щита) отображается рядом с сопротивлениями; компонент рефакторирован — принимает `character` целиком вместо отдельных `race`, `className`, `subrace`, `raceSelections`.

#### Импорт рас — исправления pipeline
- `scripts/lib/race-fetcher.ts`: fallback GET→POST (API требует POST, отвечает 405 на GET); поддержка обоих форматов имени — `name.rus` и `name.ru`.
- `scripts/lib/race-normalizer.ts`: `ABILITY_KEY_MAP` для полных ключей (`DEXTERITY` → `DEX`); поддержка нового формата `abilities[]` наряду со старым `ability[]`; `typeof raw.type === "string"` guard; 35 кодов источников в `TARGET_SOURCES` и `SOURCE_MAP`; транслитерация «Грибнит».
- `shared/data/d5e-races-supplements.ts`: добавлена раса **Грибнит** (`id: "mushroom-pg"`, источник PG, DEX+2/CON+1, скорость 30, тёмное зрение 60, тип «Растение», 4 трейта, иммунитет яд).
- `shared/data/race-types.ts`: `RaceSourceCode` расширен до 35 кодов (все категории: базовые, приключения, сеттинги, UA, сторонние, homebrew).

### Fixed

#### Подраса не сбрасывалась при смене расы
- `client/src/components/CharacterHeader.tsx`: `handleRaceChange` теперь отправляет `subrace: ""` вместо `subrace: undefined` — `JSON.stringify` не включает `undefined` в тело запроса, из-за чего сервер не получал сигнал для сброса поля. Аналогичное исправление в обоих `<Select>` для выбора подрасы.

#### HP — быстрые клики теряли обновления
- `client/src/components/CombatStats.tsx` (`HpTracker`): добавлен локальный `displayHp` state и `displayHpRef`. Ранее при быстром нажатии +/− функция `adjustHp` читала устаревший `current` из props-замыкания, и несколько кликов до следующего рендера давали один и тот же результат. Теперь ref обновляется синхронно при каждом клике — интерфейс реагирует мгновенно.

#### TypeScript
- `shared/data/d5e-equipment.ts`: `gripMode?: "oneHand" | "twoHand"` добавлено в `BaseEquipmentItem` — устранена ошибка `Property 'gripMode' does not exist` в `EquipmentSystem.tsx`.

### Added (tests)
- `tests/weapons.test.ts` — unit-тесты для `@/lib/weapons`: `parseWeaponProperties`, `getActiveWeaponDamage` (универсальное, хват, legacy формат), `normalizeWeaponGripMode`, `weaponToFormValues`, `createWeaponFromForm`.
- `tests/class-engine.test.ts` — unit-тесты движка классов: `resolveClassState` для одиночного и мультикласса, прогрессия ячеек заклинаний, ресурсы, диагностика незавершённых выборов.

---

## [Unreleased] — Race system, navigation refactor

### Added

#### Race system — canonical types and supplemental data
- `shared/data/race-types.ts` — новый файл с каноническими типами расовой системы: `RaceDefinition`, `RaceEntityType` (`race` | `subrace` | `lineage` | `variant`), `RaceSourceCode` (PHB, VGM, MTF, TCE, MPMM, OGA, FTD, VRGtR, CUSTOM), `DamageType`, `RaceAbilityBonusSelection` + `RaceAbilityBonusPattern` (гибкие бонусы для Тифлинга MPMM и линиджей), `RaceTrait` + `RaceTraitEffect`, `RaceSpellGrant`, `RaceSkillChoice`, `SubraceDefinition`.
- `shared/data/d5e-races-supplements.ts` — расы из дополнительных источников (VGM, MTF, TCE, MPMM): Аазимар, Варфорж, Гобблин, Гоблин, Хобгоблин, Бугбир, Коболд, Ораг, Тифлинг (MPMM), Гитьянки, Гитцерай, Кентавр, Фавн, Хенгейокай, и линиджи Таши — Дампир, Рейс, Обертос.
- `shared/data/d5e-races.ts` — расы переведены на полный `RaceDefinition` shape: добавлены поля `id`, `source`, `entityType`, `creatureType`, `description`, `traits: RaceTrait[]`, `darkvision`, `resistances`, `spellGrants`, `skillProficiencies`, `skillChoices`, `abilityBonusSelection`. Новые helper-функции: `getRaceSpeed`, `getRaceCreatureType`, `getRaceResistances`.

#### Race system — новые поля персонажа
- `shared/types/character-types.ts`: новые опциональные поля в схеме персонажа (backward compatible):
  - `selectedRacialAbilityBonuses` — зафиксированное распределение гибких расовых бонусов
  - `raceRef` — стабильный slug расы для корректного lookup при переименовании (напр. `"tiefling-mpmm"`)
  - `raceSource` — источник расы (`"PHB"` | `"VGM"` | …)
  - `raceSelections` — словарь выборов игрока внутри расовых способностей: выбор языков, навыков, ancestral ancestry и т.д.
- `createEmptyAbilityBonuses()` — фабрика нулевого `AbilityBonuses` объекта
- `getValidatedSelectedRacialBonuses(race, selectedRacialAbilityBonuses)` — валидирует гибкое распределение бонусов: сумма значений и паттерн должны соответствовать `abilityBonusSelection.patterns` расы
- `getRacialBonuses` обновлён: принимает третий аргумент `selectedRacialAbilityBonuses`, применяет выбранные бонусы поверх фиксированных

#### Race Picker — UI в CharacterHeader
- Полноэкранный диалог выбора расы с двумя панелями (список + детали).
- Поиск по названию.
- Мульти-фильтры: источник (источников может быть несколько), размер (Маленький / Средний), тёмное зрение, тип линидж; счётчик активных фильтров + кнопка «Сбросить».
- `RaceListRow` — строка списка: иконка активной расы, метка типа ЛИН, скорость, размер S/M, иконка тёмного зрения.
- `RaceStatPill` — таблетка-тег для отображения отдельного параметра расы.
- `RaceDetailPanel` — правая панель: название, тип, источник, описание, блок бонусов характеристик + `AbilityBonusSelector` для гибких паттернов, скорость, размер, тёмное зрение, сопротивления, язык, трейты, заклинания, подрасы.
- `AbilityBonusSelector` — выбор паттерна распределения гибких бонусов (напр. `+2 / +1` или `+1 / +1 / +1`); индивидуальные Select-ы для каждого бонуса из паттерна с валидацией дублей.
- Language choices — выбор языков для рас с placeholder «Один на выбор»; выбранные языки сохраняются в `raceSelections["language-choices"]`.
- `SOURCE_LABELS` — русские названия источников для UI (`"PHB" → "Книга игрока"` и т.д.).

#### CharacterSheet — навигация
- `client/src/components/character-sheet/CharacterSheetDesktopNav.tsx` — выделенный компонент sticky-навбара для десктопного layout (scroll-spy).
- `client/src/components/character-sheet/CharacterSheetMobileTabs.tsx` — выделенный компонент нижней таб-панели для мобильного layout с анимацией `fade-in + slide-in-from-bottom`.
- `client/src/hooks/useDesktopSectionNavigation.ts` — хук scroll-spy навигации:
  - ResizeObserver для header, nav и всех секций; обновление позиций через rAF
  - Scroll lock при программной прокрутке: фиксирует активную секцию до достижения целевого положения с timeout 1200ms
  - Поддержка `prefers-reduced-motion`: при включённой настройке использует `behavior: "auto"` вместо `"smooth"`
  - `registerSection(sectionId, element)` — регистрация DOM-узлов секций
  - `setNavElement(element)` — регистрация DOM-узла навбара
  - `scrollToSection(sectionId)` — программная прокрутка с учётом sticky offset
- `renderSection` в `CharacterSheet` принимает `layout: "mobile" | "desktop"` — мобильные табы не устанавливают `id` атрибуты на секциях (scroll-spy работает только на десктопе).

#### ProficienciesSection — расовые данные
- Отображение сопротивлений к урону из расовых данных: иконка `ShieldCheck` + список типов урона.
- Разрешение «Один на выбор» плейсхолдеров в авто-языках: значения из `raceSelections["language-choices"]` подставляются вместо плейсхолдеров по порядку.
- `raceSelections` добавлен в props интерфейса.

#### CharacterHeader — onFinishEditing
- `CharacterHeader` получил prop `onFinishEditing?: () => void` — вызывается после подтверждения изменений расы/подрасы, что сразу триггерит `saveChanges` без дополнительного клика.

### Changed

#### CharacterSheet — sections key
- `sectionNavItems` перемещён выше в компоненте (до условного рендера), чтобы `useEffect` мог зависеть от списка секций до ошибки персонажа.

### Added (dev tools)

#### Скрипты импорта рас
- `scripts/import-races.ts` — CLI-pipeline для импорта рас D&D 5e из ttg.club API: fetch → snapshot → normalize → validate → diagnostics → output (dry-run или запись в файл).
- `scripts/lib/race-fetcher.ts` — загрузка и кэширование снэпшотов с ttg.club.
- `scripts/lib/race-normalizer.ts` — преобразование raw API-ответа в `RaceDefinition`.
- `scripts/lib/race-validator.ts` — Zod-валидация каноничной модели.
- `scripts/lib/import-logger.ts` — цветной структурированный вывод для диагностики.

### Added (tests)
- `tests/race-system.test.ts` — unit-тесты расовой системы: `getRacialBonuses` с `selectedRacialAbilityBonuses`, `getValidatedSelectedRacialBonuses`, паттерны гибких бонусов.

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
- `DESIGNER_PROJECT_GUIDE.md` удалён — содержимое устарело, onboarding для дизайнеров не поддерживался.

---

## [Unreleased] — Weapons, Rest System, Avatar, Notes UX

### Added

#### Weapon category system
- `shared/data/d5e-constants.ts`: добавлен массив `WEAPON_PROPERTIES` (10 свойств: Двуручное, Лёгкое, Метательное, Тяжёлое, Универсальное, Фехтовальное, Боеприпасы, Перезарядка, Досягаемость, Специальное) и тип `WeaponProperty`.
- `shared/data/d5e-equipment.ts`: все 35 оружий `BASE_WEAPONS` получили `weaponCategory: "simple" | "martial"` по правилам D&D 5e (14 простых, 21 воинское).
- `shared/types/character-types.ts`: `weaponCategory` добавлено в `weaponSchema` и `equipmentSchema`; `isWeaponProficient` принимает третий аргумент `weaponCategory?` для точной проверки по категории ("Простое оружие" / "Воинское оружие") с fallback на поиск по имени для legacy-оружий.
- `client/src/lib/weapons.ts`: тип `WeaponCategory`, `WeaponFormValues.properties: string[]` (массив вместо строки); `weaponPropsToArray` / `propsToString` для конвертации; `isFinesseFromProps` выводит finesse из свойств.
- `client/src/components/WeaponFormFields.tsx`: полный рерайт — выбор категории (Select), chip-кнопки для 10 свойств (toggle, accent-стиль при активации), авто-переключение `abilityMod` на DEX при выборе «Фехтовальное»; удалён free-text инпут свойств и чекбокс `isFinesse`.
- `client/src/components/WeaponsList.tsx`: отображение категории рядом с названием оружия (`прост.` / `воин.` / `экзот.`); `isWeaponProficient` теперь принимает `weapon.weaponCategory`.

#### Short Rest & Long Rest
- `client/src/components/CharacterHeader.tsx`: два новых компонента `ShortRestDialog` и `LongRestDialog`, открываемые кнопками (Coffee / Moon) в строке вдохновения в play-режиме.
  - **Короткий отдых**: выбор количества костей хитов (d{X} + CON mod, минимум 1), анимация броска (500ms с cycling-числами), пошаговый просмотр каждого броска, итоговый прирост HP. «Отмена» — без изменений, «Завершить отдых» — применяет `currentHp` и `hitDiceRemaining`.
  - **Долгий отдых**: восстановление всех HP, восстановление половины максимума костей хитов (минимум 1; `totalDice = getTotalLevel(getCharacterClasses(...))` — авторитетный источник, не строка `hitDice`), обнуление использованных spell slots и pact magic. Preview-карточки с индикатором `CheckCircle2` если ресурс уже полный.

#### Avatar
- `react-easy-crop` добавлен в зависимости.
- `client/src/components/AvatarPickerModal.tsx`: два новых компонента.
  - `AvatarPickerModal` — модалка загрузки аватарки: drag-and-drop или file picker (JPG/PNG/WebP/GIF, до 10 МБ), круговой кроппер, ползунок зума, клиентское сжатие через Canvas (256×256 JPEG q0.82, ~10-20KB); кнопка «Удалить фото» если аватарка уже есть.
  - `AvatarViewModal` — fullscreen-просмотр аватарки в play-режиме.
- `client/src/components/CharacterHeader.tsx`: в edit-режиме — карандаш-оверлей поверх аватарки открывает `AvatarPickerModal`; в play-режиме — клик на аватарку открывает `AvatarViewModal`. Аватарка хранится как base64 data URL в `character.avatar` (поле уже было в схеме). Удаление сохраняет `avatar: ""`.

#### Fullscreen-редактор заметок
- `client/src/components/RichTextField.tsx`: кнопка `Maximize2` в правом нижнем углу поля (overlay поверх textarea, `position: absolute`, `z-index: 10`) открывает `ResponsiveDialog` с полноэкранным редактором — те же вкладки «Текст / Предпросмотр», textarea на всю высоту (`h-full`), заголовок берётся из нового prop `label`.
- `client/src/pages/CharacterSheet.tsx`: все вызовы `RichTextField` получили `label` — «Заметки», «Черты характера», «Идеалы», «Привязанности», «Слабости», «Союзники», «Описание / особые приметы».

#### «Экипировано» перемещено
- `client/src/components/EquipmentSystem.tsx`: блок «Экипировано» перемещён из внутренней области `<Tabs>` под `</Tabs>`, над строкой с деньгами. Скрывается если нет экипированных предметов.

### Fixed

#### Weapon accordion и lock
- `client/src/components/WeaponsList.tsx`: `toggleExpanded` ранее проверял `!isEditing && !isLocked` — аккордеоны открывались только при открытом замке. Исправлено: аккордеоны всегда доступны в play-режиме (`!isEditing`), замок управляет только кнопкой «Добавить».

#### Weapon proficiency — auto-proficiencies из расы/класса
- `client/src/pages/CharacterSheet.tsx`: `WeaponsList` получал только `character.proficiencies` (ручные), пропуская владения от расы и класса. Исправлено: `effectiveProficiencies` объединяет `character.proficiencies` с результатом `getRaceAndClassProficiencies(race, class, subrace)`.

#### EquipmentSystem — инициализация weaponForm при редактировании
- `client/src/components/EquipmentSystem.tsx`: при открытии диалога редактирования оружия не восстанавливались `properties` (string[]) и `weaponCategory`. Исправлено через `weaponPropsToArray(initialItem.weaponProperties)`.

#### RichTextField — активный элемент вылезал за границы
- `client/src/components/RichTextField.tsx`: `h-8` на `TabsList` оставлял 24px под триггеры, которым нужно ~28px → active indicator переполнял контейнер. Исправлено: убран явный `h-8`, добавлен `overflow-hidden`.

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
