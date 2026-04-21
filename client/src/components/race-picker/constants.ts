import { RACE_DATA } from "@shared/schema";

export const SOURCE_LABELS: Record<string, string> = {
  // Базовые
  PHB:      "Книга игрока",
  VGM:      "Руководство Воло по монстрам",
  OGA:      "One Grung Above",
  MTF:      "Том о врагах Морденкайнена",
  TCE:      "Котёл всего Таши",
  FTD:      "Сокровищница драконов Физбана",
  MPMM:     "Монстры мультивселенной",
  // Приключения
  EV:       "Vecna: Eve of Ruin",
  TOA:      "Гробница аннигиляции",
  AI:       "Acquisitions Incorporated",
  LR:       "Locathah Rising",
  WBtW:     "За пределами Витчлайта",
  DSotDQ:   "Dragonlance: В тени Королевы Драконов",
  // Сеттинги
  SCAG:     "Руководство искателя приключений по Берегу Мечей",
  PSA:      "Plane Shift: Амонкет",
  ttP:      "Пакет тортла",
  GGR:      "Руководство гильдмастеров по Равнике",
  ERLW:     "Эберрон: Восстание последней войны",
  MOT:      "Мифические одиссеи Тероса",
  SCC:      "Стрикхейвен: Учебный план хаоса",
  VRGtR:    "Руководство Ван Рихтена по Равенлофту",
  AAG:      "Руководство звёздного путешественника (Spelljammer)",
  // Unearthed Arcana
  UA22WotM: "UA 2022: Чудеса мультивселенной",
  // Третьи лица
  MHH:      "Midgard Heroes Handbook",
  ODL:      "One D&D (плейтест)",
  EGtW:     "Руководство исследователя по Вилдемаунту",
  // Homebrew
  CoN:      "Candlekeep of Nightmares",
  DMGi:     "DMG (iconic)",
  MPRGM:    "MPMM Revised Game Master",
  PG:       "Player's Guide",
  LPZAE:    "LPZAE",
  CUSTOM:   "Пользовательские",
};

export const RACE_DAMAGE_LABELS: Record<string, string> = {
  fire: "Огонь", cold: "Холод", lightning: "Молния",
  acid: "Кислота", poison: "Яд", psychic: "Психика",
  radiant: "Сияние", necrotic: "Некротика", thunder: "Гром",
  force: "Силовой", piercing: "Колющий",
  slashing: "Рубящий", bludgeoning: "Дробящий",
};

// All known sources that appear in RACE_DATA (ordered for display)
export const ALL_SOURCES = [
  // Базовые
  "PHB", "VGM", "OGA", "MTF", "TCE", "FTD", "MPMM",
  // Приключения
  "EV", "TOA", "AI", "LR", "WBtW", "DSotDQ",
  // Сеттинги
  "SCAG", "PSA", "ttP", "GGR", "ERLW", "MOT", "SCC", "VRGtR", "AAG",
  // Unearthed Arcana
  "UA22WotM",
  // Третьи лица
  "MHH", "ODL", "EGtW",
  // Homebrew
  "CoN", "DMGi", "MPRGM", "PG", "LPZAE", "CUSTOM",
] as const;

// Per-source race counts (static, computed once)
export const SOURCE_COUNTS: Record<string, number> = Object.fromEntries(
  ALL_SOURCES.map((src) => [src, Object.values(RACE_DATA).filter((r) => r.source === src).length]),
);
