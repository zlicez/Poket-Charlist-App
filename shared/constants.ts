/**
 * Централизованные строковые константы, используемые на обеих сторонах (или
 * на клиенте, но с претензией на обмен со сервером). Любое новое имя route'а,
 * query key'я, события синхронизации или localStorage-ключа должно жить здесь,
 * а не в виде литерала в компоненте.
 *
 * Правила:
 * - `*_PATH` — Express-шаблоны (с `:id`), удобные для server-side `app.get(...)`.
 * - `*Url(...)` — чистые клиентские билдеры URL, возвращающие конкретную строку.
 * - `queryKeys.*` — фабрики ключей для TanStack Query. Плоские массивы, чтобы
 *   клиентский `queryFn` в `queryClient.ts` мог их join'ить в URL.
 */

// ─── Character API ──────────────────────────────────────────────────────────

export const CHARACTERS_LIST_URL = "/api/characters";

export const characterUrl = (id: string): string =>
  `${CHARACTERS_LIST_URL}/${id}`;

export const characterShareUrl = (id: string): string =>
  `${characterUrl(id)}/share`;

export const characterOpsUrl = (id: string): string =>
  `${characterUrl(id)}/ops`;

export const sharedCharacterUrl = (token: string): string =>
  `/api/shared/${token}`;

// Express-шаблоны для server/routes.ts.
export const CHARACTERS_LIST_PATH = CHARACTERS_LIST_URL;
export const CHARACTER_PATH = `${CHARACTERS_LIST_URL}/:id`;
export const CHARACTER_SHARE_PATH = `${CHARACTER_PATH}/share`;
export const CHARACTER_OPS_PATH = `${CHARACTER_PATH}/ops`;
export const SHARED_CHARACTER_PATH = `/api/shared/:token`;

// ─── Auth API ───────────────────────────────────────────────────────────────

export const AUTH_PATHS = {
  user: "/api/auth/user",
  login: "/api/auth/login",
  register: "/api/auth/register",
  password: "/api/auth/password",
  logout: "/api/logout",
  oauthLogin: "/api/login",
  oauthCallback: "/api/callback",
} as const;

// ─── React Query keys ──────────────────────────────────────────────────────

export const queryKeys = {
  charactersList: () => [CHARACTERS_LIST_URL] as const,
  character: (id: string) => [CHARACTERS_LIST_URL, id] as const,
  characterShare: (id: string) => [CHARACTERS_LIST_URL, id, "share"] as const,
  sharedCharacter: (token: string) => ["/api/shared", token] as const,
  authUser: () => [AUTH_PATHS.user] as const,
};

// ─── Sync event names (window CustomEvent) ─────────────────────────────────

export const SYNC_EVENTS = {
  start: "sync:start",
  end: "sync:end",
  conflict: "sync:conflict",
} as const;
export type SyncEventName = (typeof SYNC_EVENTS)[keyof typeof SYNC_EVENTS];

// ─── localStorage keys ─────────────────────────────────────────────────────

export const LS_KEYS = {
  theme: "dnd-theme",
  characterUi: "dnd-character-ui",
} as const;

// ─── UI section ids (scroll-spy / tabs / anchors) ──────────────────────────
//
// Имена уже присутствуют в DOM, привязанные к существующему sidebar/tabs.
// Для новой 4-табной IA будут добавлены новые, старые пометим как deprecated
// в момент переключения фича-флага новой дизайн-системы.

export const SECTION_IDS = {
  identity: "section-identity",
  combat: "section-combat",
  abilities: "section-abilities",
  proficiencies: "section-proficiencies",
  features: "section-features",
  spells: "section-spells",
  weapons: "section-weapons",
  equipment: "section-equipment",
  notes: "section-notes",
  bag: "section-bag",
  sheet: "section-sheet",
} as const;
export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];
