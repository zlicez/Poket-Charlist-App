import { useState, useEffect, useRef, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import {
  User,
  Sparkles,
  Scroll,
  BookOpen,
  Info,
  Settings2,
  Plus,
  Trash2,
  TrendingUp,
  Zap,
  Coffee,
  Moon,
  Dice6,
  Heart,
  Wand2,
  CheckCircle2,
  Pencil,
  Search,
  Check,
  Eye,
  ChevronDown,
  Globe,
  ShieldCheck,
  Filter,
  Eraser,
} from "lucide-react";
import { AvatarPickerModal, AvatarViewModal } from "@/components/AvatarPickerModal";
import { useMediaQuery } from "@/hooks/use-media-query";
import { NumericInput } from "@/components/ui/numeric-input";
import { cn } from "@/lib/utils";
import {
  ABILITY_NAMES,
  CLASSES,
  RACES,
  ALIGNMENTS,
  RACE_DATA,
  CLASS_DATA,
  ABILITY_LABELS,
  LANGUAGES,
  createEmptyAbilityBonuses,
  buildClassStatePatch,
  getClassDefinitionByName,
  getProficiencyBonus,
  formatModifier,
  getXPProgress,
  getLevelFromXP,
  getCharacterClasses,
  getCharacterClassSelections,
  getTotalLevel,
  calculateModifier,
  getRacialBonuses,
  getValidatedSelectedRacialBonuses,
  getRaceSpeed,
  getRaceCreatureType,
  getRaceResistances,
} from "@shared/schema";
import type {
  Character,
  AbilityName,
  ClassSelection,
  RaceDefinition,
} from "@shared/schema";

// ─── Race Picker — shared constants ──────────────────────────────────────────

const SOURCE_LABELS: Record<string, string> = {
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

const RACE_DAMAGE_LABELS: Record<string, string> = {
  fire: "Огонь", cold: "Холод", lightning: "Молния",
  acid: "Кислота", poison: "Яд", psychic: "Психика",
  radiant: "Сияние", necrotic: "Некротика", thunder: "Гром",
  force: "Силовой", piercing: "Колющий",
  slashing: "Рубящий", bludgeoning: "Дробящий",
};

// ─── Race Picker — filter logic ───────────────────────────────────────────────

// ─── Race Picker — multi-filter state ────────────────────────────────────────

type ActiveFilters = {
  sources: string[];
  size: "" | "Small" | "Medium" | "Large";
  darkvision: boolean;
  lineage: boolean;
};

const DEFAULT_FILTERS: ActiveFilters = {
  sources: [],
  size: "",
  darkvision: false,
  lineage: false,
};

function countActiveFilters(f: ActiveFilters): number {
  return (f.sources.length > 0 ? 1 : 0) +
    (f.size ? 1 : 0) +
    (f.darkvision ? 1 : 0) +
    (f.lineage ? 1 : 0);
}

// All known sources that appear in RACE_DATA (ordered for display)
const ALL_SOURCES = [
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
const SOURCE_COUNTS: Record<string, number> = Object.fromEntries(
  ALL_SOURCES.map((src) => [src, Object.values(RACE_DATA).filter((r) => r.source === src).length]),
);

function applyFilters(
  raceData: Record<string, RaceDefinition>,
  filters: ActiveFilters,
  search: string,
): RaceDefinition[] {
  let result = Object.values(raceData);
  if (search) {
    const s = search.toLowerCase();
    result = result.filter((r) => r.name.toLowerCase().includes(s));
  }
  if (filters.sources.length > 0) {
    result = result.filter((r) => filters.sources.includes(r.source));
  }
  if (filters.size) {
    result = result.filter((r) => r.size === filters.size);
  }
  if (filters.darkvision) {
    result = result.filter((r) => (r.darkvision ?? 0) > 0);
  }
  if (filters.lineage) {
    result = result.filter((r) => r.entityType === "lineage");
  }
  return result;
}

// ─── Race Picker — list row ───────────────────────────────────────────────────

function RaceListRow({
  race,
  isSelected,
  isActive,
  onClick,
}: {
  race: RaceDefinition;
  isSelected: boolean;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-2 py-2.5 rounded-md text-sm transition-colors text-left",
        isActive
          ? "bg-accent/15 text-foreground"
          : "hover:bg-muted/60 text-foreground",
      )}
      data-testid={`race-option-${race.id}`}
    >
      <div className="w-4 shrink-0">
        {isSelected && <Check className="w-4 h-4 text-accent" />}
      </div>
      <span className="flex-1 font-medium">{race.name}</span>
      <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
        {race.entityType === "lineage" && (
          <span className="text-[9px] font-semibold text-purple-500 uppercase tracking-wide">ЛИН</span>
        )}
        {(race.darkvision ?? 0) > 0
          ? <Eye className="w-3 h-3" />
          : <div className="w-3" />
        }
        <span className={cn(
          "text-[9px] font-semibold uppercase w-[14px] text-center",
          race.size === "Small" ? "text-amber-500" : "text-muted-foreground/40",
        )}>
          {race.size === "Small" ? "S" : "M"}
        </span>
        <span className="text-[10px] tabular-nums w-[28px] text-right">{race.speed}фт</span>
      </div>
    </button>
  );
}

// ─── Race Picker — stat pill ──────────────────────────────────────────────────

function RaceStatPill({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: string;
  tooltip: string;
}) {
  return (
    <HelpTooltip
      content={<p className="text-xs max-w-[220px]">{tooltip}</p>}
      side="top"
      asChild
    >
      <div className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 cursor-help min-w-[68px]">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none">{label}</span>
        <span className="text-sm font-semibold leading-tight">{value}</span>
      </div>
    </HelpTooltip>
  );
}

// ─── Race Picker — detail panel ───────────────────────────────────────────────

function RaceDetailPanel({ race }: { race: RaceDefinition | null }) {
  if (!race) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-10 space-y-5">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
          <User className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-1.5">
          <h3 className="font-semibold text-base">Выберите расу</h3>
          <p className="text-sm text-muted-foreground">
            Нажмите на любую расу слева — здесь появится её описание
          </p>
        </div>
        <div className="w-full max-w-[260px] space-y-3 text-left">
          <div className="flex gap-2.5 items-start">
            <span className="text-lg shrink-0">🎭</span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Раса</strong> — кем был ваш персонаж с рождения: человеком, эльфом, гоблином или кем-то ещё
            </p>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="text-lg shrink-0">⚡</span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Она даёт <strong className="text-foreground">бонусы характеристик</strong>, скорость движения и уникальные способности
            </p>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="text-lg shrink-0">📖</span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Новичкам рекомендуем <strong className="text-foreground">Книга игрока (PHB)</strong> — там стандартные сбалансированные расы
            </p>
          </div>
        </div>
      </div>
    );
  }

  const hasFixedBonuses = Object.values(race.abilityBonuses).some((v) => v !== 0);
  const sizeLabel = race.size === "Small" ? "Маленький" : race.size === "Large" ? "Большой" : "Средний";
  const sizeTip =
    race.size === "Small"
      ? "Маленький размер. Персонаж не может использовать тяжёлое двуручное оружие, зато легче прячется."
      : "Средний размер — стандарт для большинства рас. Нет особых ограничений.";

  return (
    <ScrollArea className="flex-1 min-h-0 h-full">
      <div className="p-4 space-y-4 pb-6">

        {/* Header */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold leading-tight">{race.name}</h2>
            {race.entityType === "lineage" && (
              <Badge className="text-xs bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-400/30 border">
                Линидж
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 cursor-help font-medium">
                  {race.source}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {SOURCE_LABELS[race.source] ?? race.source}
              </TooltipContent>
            </Tooltip>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-xs text-muted-foreground">{race.creatureType}</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed pt-0.5">
            {race.description}
          </p>
        </div>

        {/* Key stats row */}
        <div className="flex flex-wrap gap-2">
          <RaceStatPill
            label="Скорость"
            value={`${race.speed} фт.`}
            tooltip="Скорость — сколько футов персонаж проходит за ход (1 клетка = 5 фт.). Стандарт — 30 фт."
          />
          <RaceStatPill
            label="Размер"
            value={sizeLabel}
            tooltip={sizeTip}
          />
          <RaceStatPill
            label="Тёмное зрение"
            value={(race.darkvision ?? 0) > 0 ? `${race.darkvision} фт.` : "Нет"}
            tooltip="Тёмное зрение: видите в кромешной темноте как в тусклом свете. Очень полезно в подземельях."
          />
          {(race.altSpeeds?.swim ?? 0) > 0 && (
            <RaceStatPill label="Плавание" value={`${race.altSpeeds!.swim} фт.`}
              tooltip="Скорость плавания — плывёте без штрафов в воде." />
          )}
          {(race.altSpeeds?.climb ?? 0) > 0 && (
            <RaceStatPill label="Лазание" value={`${race.altSpeeds!.climb} фт.`}
              tooltip="Скорость лазания — карабкаетесь по вертикальным поверхностям." />
          )}
          {(race.altSpeeds?.fly ?? 0) > 0 && (
            <RaceStatPill label="Полёт" value={`${race.altSpeeds!.fly} фт.`}
              tooltip="Скорость полёта." />
          )}
        </div>

        {/* Ability bonuses */}
        <div className="space-y-1.5">
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Бонусы характеристик
          </h4>
          {hasFixedBonuses ? (
            <div className="flex flex-wrap gap-1.5">
              {(ABILITY_NAMES as readonly AbilityName[])
                .filter((a) => (race.abilityBonuses[a] ?? 0) !== 0)
                .map((a) => (
                  <Badge key={a} variant="secondary" className="text-xs font-medium">
                    {ABILITY_LABELS[a].ru} +{race.abilityBonuses[a]}
                  </Badge>
                ))}
            </div>
          ) : race.abilityBonusSelection ? (
            <div className="rounded-lg bg-muted/40 px-3 py-2">
              <p className="text-xs text-muted-foreground">{race.abilityBonusSelection.description}</p>
              <p className="text-[11px] text-muted-foreground/70 mt-1">
                Вы распределяете бонусы сами — это делает расу универсальной для любого класса
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">Нет фиксированных бонусов</p>
          )}
        </div>

        {/* Resistances */}
        {(race.resistances?.length ?? 0) > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Сопротивление к урону
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {race.resistances!.map((r) => (
                <Badge key={r} variant="outline"
                  className="text-xs gap-1 border-emerald-500/40 text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                  {RACE_DAMAGE_LABELS[r] ?? r}
                </Badge>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Сопротивление — получаете вдвое меньше урона указанного типа
            </p>
          </div>
        )}

        {/* Immunities */}
        {(race.immunities?.length ?? 0) > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Иммунитет к урону
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {race.immunities!.map((r) => (
                <Badge key={r} variant="outline"
                  className="text-xs gap-1 border-blue-500/40 text-blue-700 dark:text-blue-400">
                  <ShieldCheck className="w-3 h-3" />
                  {RACE_DAMAGE_LABELS[r] ?? r}
                </Badge>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Иммунитет — не получаете урон указанного типа совсем
            </p>
          </div>
        )}

        {/* Traits */}
        {race.traits && race.traits.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Расовые особенности
            </h4>
            <ul className="space-y-2">
              {race.traits.map((trait, i) => {
                const text = typeof trait === "string" ? trait : `${trait.name}: ${trait.description}`;
                const colonIdx = text.indexOf(":");
                if (colonIdx > 0 && colonIdx < 45) {
                  return (
                    <li key={i} className="text-sm leading-relaxed">
                      <span className="font-medium">{text.slice(0, colonIdx).trim()}</span>
                      <span className="text-muted-foreground"> — {text.slice(colonIdx + 1).trim()}</span>
                    </li>
                  );
                }
                return (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="text-accent mt-0.5 shrink-0">•</span>
                    <span className="text-muted-foreground leading-relaxed">{text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Spell grants */}
        {(race.spellGrants?.length ?? 0) > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Расовые заклинания
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Изучаете эти заклинания автоматически — тратить ячейки не нужно (если не указано иное)
            </p>
            <ul className="space-y-1.5">
              {race.spellGrants!.map((sg, i) => (
                <li key={i} className="flex items-baseline gap-2 text-sm">
                  <span className="font-medium">{sg.spellName}</span>
                  <span className="text-xs text-muted-foreground">
                    {sg.minLevel === 0 ? "заговор (∞)" : `с ${sg.minLevel} ур.`}
                    {sg.usesLongRest ? " · 1×/длин. отдых" : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Skill proficiencies (auto) */}
        {(race.skillProficiencies?.length ?? 0) > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Владение навыками
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {race.skillProficiencies!.map((s) => (
                <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Skill choices */}
        {race.skillChoices && race.skillChoices.count > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Выбор навыков
            </h4>
            <p className="text-xs text-muted-foreground">
              Вы выбираете {race.skillChoices.count}{" "}
              {race.skillChoices.count === 1 ? "навык" : "навыка"}{" "}
              {race.skillChoices.options === "any"
                ? "из любых доступных"
                : `из: ${(race.skillChoices.options as string[]).join(", ")}`}
            </p>
          </div>
        )}

        {/* Languages */}
        {race.languages && race.languages.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Языки</h4>
            <div className="flex flex-wrap gap-1.5">
              {race.languages.map((lang, i) => (
                <Badge key={i} variant="secondary" className="text-xs gap-1">
                  <Globe className="w-3 h-3" />
                  {lang === "Один на выбор" ? "Один на выбор (выберете после)" : lang}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Subraces */}
        {race.subraces && Object.keys(race.subraces).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Подрасы — выберете после выбора расы
            </h4>
            <div className="space-y-1.5">
              {Object.values(race.subraces).map((sub) => {
                const bonusEntries = Object.entries(sub.abilityBonuses).filter(([, v]) => v !== 0);
                return (
                  <div key={sub.id}
                    className="rounded-lg bg-muted/30 border border-border/40 px-3 py-2.5 space-y-1">
                    <div className="font-medium text-sm">{sub.name}</div>
                    {sub.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed">{sub.description}</p>
                    )}
                    {(bonusEntries.length > 0 || sub.speed || sub.darkvision) && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {bonusEntries.map(([ability, value]) => (
                          <Badge key={ability} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {ABILITY_LABELS[ability as AbilityName]?.ru ?? ability} +{value}
                          </Badge>
                        ))}
                        {sub.speed && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {sub.speed} фт.
                          </Badge>
                        )}
                        {sub.darkvision && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1">
                            <Eye className="w-2.5 h-2.5" />{sub.darkvision} фт.
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </ScrollArea>
  );
}

// ─── Race Picker Dialog ───────────────────────────────────────────────────────

function RacePickerDialog({
  value,
  subrace,
  onChange,
}: {
  value: string;
  subrace?: string;
  onChange: (race: string, subrace?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<ActiveFilters>(DEFAULT_FILTERS);
  const [pendingFilters, setPendingFilters] = useState<ActiveFilters>(DEFAULT_FILTERS);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<string>(value);
  const [pendingSubrace, setPendingSubrace] = useState<string | undefined>(subrace);
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const isDesktop = useMediaQuery("(min-width: 640px)");

  const currentRaceData = RACE_DATA[value];
  const totalCount = Object.keys(RACE_DATA).length;
  const activeFilterCount = countActiveFilters(appliedFilters);
  const sorted = useMemo(() => {
    const filtered = applyFilters(RACE_DATA, appliedFilters, search);
    return filtered.sort((a, b) => a.name.localeCompare(b.name, "ru"));
  }, [appliedFilters, search]);
  const highlightedRace = RACE_DATA[highlighted] ?? null;
  const highlightedSubraces = highlightedRace?.subraces
    ? Object.values(highlightedRace.subraces)
    : [];
  const isCurrentlySelected = highlightedRace?.name === value;
  const isAlreadySelectedWithSameSubrace =
    isCurrentlySelected && (pendingSubrace ?? undefined) === (subrace ?? undefined);

  // Reset pendingSubrace when moving to a different race in the list
  useEffect(() => {
    if (highlightedRace?.name === value) {
      setPendingSubrace(subrace);
    } else {
      setPendingSubrace(undefined);
    }
  }, [highlighted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-sync: when filters/search removes highlighted race from results, jump to first
  useEffect(() => {
    if (sorted.length > 0 && !sorted.find((r) => r.name === highlighted)) {
      setHighlighted(sorted[0].name);
    }
  }, [appliedFilters, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (v) {
      setHighlighted(value || sorted[0]?.name || "");
      setPendingSubrace(subrace);
      setMobileView("list");
      setFilterPanelOpen(false);
    } else {
      setSearch("");
      // Keep appliedFilters across opens so user doesn't lose their filter config
    }
  };

  const handleConfirm = () => {
    if (!highlightedRace) return;
    onChange(highlightedRace.name, pendingSubrace);
    setOpen(false);
    setSearch("");
  };

  const handleClearFilters = () => {
    setAppliedFilters(DEFAULT_FILTERS);
    setPendingFilters(DEFAULT_FILTERS);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(pendingFilters);
    setFilterPanelOpen(false);
  };

  const toggleFilterPanel = () => {
    if (!filterPanelOpen) setPendingFilters(appliedFilters); // sync draft to current
    setFilterPanelOpen((v) => !v);
  };

  const handleRowClick = (raceName: string) => {
    setHighlighted(raceName);
    if (!isDesktop) setMobileView("detail");
  };

  // Steps the user still needs to take after confirming (subraces handled inline)
  const pendingSteps = useMemo(() => {
    if (!highlightedRace) return [];
    const steps: string[] = [];
    if (highlightedRace.abilityBonusSelection) {
      steps.push("распределить бонусы характеристик");
    }
    if (highlightedRace.skillChoices && highlightedRace.skillChoices.count > 0) {
      const n = highlightedRace.skillChoices.count;
      steps.push(`выбрать ${n} навык${n === 1 ? "" : n < 5 ? "а" : "ов"}`);
    }
    if (highlightedRace.languages?.some((l) => l === "Один на выбор")) {
      const n = highlightedRace.languages.filter((l) => l === "Один на выбор").length;
      steps.push(n === 1 ? "выбрать язык" : `выбрать ${n} языка`);
    }
    return steps;
  }, [highlightedRace]);

  // ── Shared: search bar / filter panel + column headers ────────────────────
  const listControls = (
    <>
      {/* Search row OR filter panel header */}
      <div className="px-3 pb-2 shrink-0 flex items-center gap-1.5">
        {filterPanelOpen ? (
          <span className="flex-1 text-sm font-semibold">Фильтры</span>
        ) : (
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск…"
              className="pl-8 h-8 text-sm"
              autoFocus={isDesktop}
            />
          </div>
        )}
        {/* Clear filters (eraser) — only when filters are applied */}
        {activeFilterCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={handleClearFilters}
            title="Сбросить фильтры"
          >
            <Eraser className="w-3.5 h-3.5" />
          </Button>
        )}
        {/* Filter panel toggle (funnel) */}
        <Button
          type="button"
          variant={filterPanelOpen ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8 shrink-0 relative"
          onClick={toggleFilterPanel}
          title="Фильтры"
        >
          <Filter className="w-3.5 h-3.5" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full bg-accent flex items-center justify-center text-[8px] font-bold text-white px-0.5">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Filter panel (shown instead of chips when open) */}
      {filterPanelOpen && (
        <div className="px-3 pb-3 shrink-0 space-y-3 border-b border-border/30">

          {/* Source checkboxes */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Источник
            </p>
            <div className="flex flex-wrap gap-1">
              {ALL_SOURCES.filter((src) => (SOURCE_COUNTS[src] ?? 0) > 0).map((src) => {
                const active = pendingFilters.sources.includes(src);
                return (
                  <Tooltip key={src}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() =>
                          setPendingFilters((prev) => ({
                            ...prev,
                            sources: active
                              ? prev.sources.filter((s) => s !== src)
                              : [...prev.sources, src],
                          }))
                        }
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-medium border transition-colors",
                          active
                            ? "bg-accent/15 border-accent/50 text-foreground"
                            : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground bg-transparent",
                        )}
                      >
                        {src}
                        <span className="ml-1 opacity-55">({SOURCE_COUNTS[src]})</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      {SOURCE_LABELS[src] ?? src}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>

          {/* Size radio */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Размер
            </p>
            <div className="flex gap-1">
              {[
                { value: "" as const, label: "Любой" },
                { value: "Small" as const, label: "Маленький" },
                { value: "Medium" as const, label: "Средний" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPendingFilters((prev) => ({ ...prev, size: opt.value }))}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium border transition-colors",
                    pendingFilters.size === opt.value
                      ? "bg-accent/15 border-accent/50 text-foreground"
                      : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground bg-transparent",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle chips */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Особенности
            </p>
            <div className="flex flex-wrap gap-1">
              {([
                { key: "darkvision", label: "Тёмное зрение" },
                { key: "lineage",    label: "Линидж" },
              ] as const).map(({ key, label }) => {
                const active = pendingFilters[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPendingFilters((prev) => ({ ...prev, [key]: !prev[key] }))}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium border transition-colors",
                      active
                        ? "bg-accent/15 border-accent/50 text-foreground"
                        : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground bg-transparent",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Apply button */}
          <Button
            type="button"
            className="w-full h-8 text-sm"
            onClick={handleApplyFilters}
          >
            Применить фильтры
          </Button>
        </div>
      )}

      {/* Column headers — always visible */}
      <div className="px-4 pb-1 shrink-0">
        <div className="flex items-center text-[10px] text-muted-foreground/60 uppercase tracking-wide">
          <span className="w-4 shrink-0" />
          <span className="flex-1 ml-2">Название</span>
          <span className="whitespace-nowrap text-right pr-1">Зрение · Р · Скор.</span>
        </div>
      </div>
    </>
  );

  // ── Shared: scrollable race list ───────────────────────────────────────────
  const raceList = (
    <ScrollArea className="flex-1 min-h-0 px-2">
      <div className="pb-3">
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Ничего не найдено</p>
        ) : (
          sorted.map((r) => (
            <RaceListRow
              key={r.id}
              race={r}
              isSelected={r.name === value}
              isActive={r.name === highlighted}
              onClick={() => handleRowClick(r.name)}
            />
          ))
        )}
      </div>
    </ScrollArea>
  );

  // ── Shared: sticky action bar (subrace select + confirm button) ────────────
  const actionBar = highlightedRace ? (
    <div className="shrink-0 border-t border-border/50 bg-background px-4 py-3 space-y-2.5">
      {highlightedSubraces.length > 0 && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Подраса</label>
          <Select
            value={pendingSubrace ?? "__none__"}
            onValueChange={(v) => setPendingSubrace(v === "__none__" ? undefined : v)}
          >
            <SelectTrigger className="h-9 text-sm" data-testid="select-subrace-in-picker">
              <SelectValue placeholder="Выбрать подрасу…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Без подрасы</SelectItem>
              {highlightedSubraces.map((sub) => (
                <SelectItem key={sub.id} value={sub.name}>{sub.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {pendingSteps.length > 0 && (
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          После выбора нужно будет: {pendingSteps.join(", ")}
        </p>
      )}
      <Button
        className="w-full gap-2"
        variant={isAlreadySelectedWithSameSubrace ? "outline" : "default"}
        onClick={handleConfirm}
      >
        {isAlreadySelectedWithSameSubrace
          ? <><Check className="w-4 h-4" /> Уже выбрано</>
          : `Выбрать: ${highlightedRace.name}${pendingSubrace ? ` · ${pendingSubrace}` : ""}`
        }
      </Button>
    </div>
  ) : null;

  const trigger = (
    <Button
      type="button"
      variant="outline"
      className="flex-1 h-10 text-sm justify-between gap-2 font-normal"
      onClick={() => handleOpenChange(true)}
      data-testid="button-open-race-picker"
    >
      <span className="truncate text-left">
        {value
          ? subrace ? `${value} · ${subrace}` : value
          : "Выберите расу…"}
      </span>
      <div className="flex items-center gap-1 shrink-0">
        {currentRaceData && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
            {currentRaceData.source}
          </Badge>
        )}
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </div>
    </Button>
  );

  // ── Mobile: Drawer (bottom sheet) ─────────────────────────────────────────
  if (!isDesktop) {
    return (
      <>
        {trigger}
        <Drawer open={open} onOpenChange={handleOpenChange}>
          <DrawerContent className="flex flex-col p-0 gap-0 h-[94vh] overflow-hidden">
            {mobileView === "list" ? (
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <DrawerHeader className="px-4 pt-3 pb-2 shrink-0 text-left border-b border-border/30">
                  <DrawerTitle className="flex items-baseline gap-2 text-base">
                    Выбор расы
                    <span className="text-xs font-normal text-muted-foreground">
                      {sorted.length === totalCount
                        ? `${totalCount} рас`
                        : `${sorted.length} из ${totalCount}`}
                    </span>
                  </DrawerTitle>
                </DrawerHeader>
                {listControls}
                <div data-vaul-no-drag className="flex-1 min-h-0 flex flex-col">
                  {raceList}
                </div>
              </div>
            ) : (
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="shrink-0 px-3 pt-2 pb-1.5 border-b border-border/50 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 h-7 text-xs -ml-2 text-muted-foreground shrink-0"
                    onClick={() => setMobileView("list")}
                  >
                    ← Список
                  </Button>
                  {highlightedRace && (
                    <span className="font-semibold text-sm truncate">{highlightedRace.name}</span>
                  )}
                </div>
                <div data-vaul-no-drag className="flex-1 min-h-0 flex flex-col">
                  <RaceDetailPanel race={highlightedRace} />
                </div>
                {actionBar}
              </div>
            )}
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  // ── Desktop: Dialog (two-panel) ────────────────────────────────────────────
  return (
    <>
      {trigger}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="p-0 gap-0 overflow-hidden flex flex-row max-w-5xl h-[88vh]">
          <DialogTitle className="sr-only">Выбор расы</DialogTitle>

          {/* Left / List panel */}
          <div className="w-72 border-r border-border/50 shrink-0 h-full flex flex-col">
            <div className="px-4 pt-4 pb-3 shrink-0">
              <div className="flex items-baseline gap-2">
                <h2 className="font-semibold text-base">Выбор расы</h2>
                <span className="text-xs font-normal text-muted-foreground">
                  {sorted.length === totalCount
                    ? `${totalCount} рас`
                    : `${sorted.length} из ${totalCount}`}
                </span>
              </div>
            </div>
            {listControls}
            {raceList}
          </div>

          {/* Right / Detail + action panel */}
          <div className="flex flex-col flex-1 min-h-0 min-w-0">
            <RaceDetailPanel race={highlightedRace} />
            {actionBar}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Language Choice Editor ───────────────────────────────────────────────────

function LanguageChoiceEditor({
  character,
  onChange,
}: {
  character: Character;
  onChange: (updates: Partial<Character>) => void;
}) {
  const raceData = RACE_DATA[character.race];
  if (!raceData) return null;

  const choiceSlots = raceData.languages.filter((l) => l === "Один на выбор");
  if (choiceSlots.length === 0) return null;

  const currentChoices =
    (character.raceSelections?.["language-choices"] as string[] | undefined) ?? [];

  // Languages already fixed by the race (non-choice slots)
  const fixedLangs = raceData.languages.filter((l) => l !== "Один на выбор");

  const handleChoiceChange = (index: number, lang: string) => {
    const next = [...currentChoices];
    next[index] = lang;
    onChange({
      raceSelections: {
        ...(character.raceSelections ?? {}),
        "language-choices": next,
      },
    });
  };

  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2">
      <div className="flex items-center gap-1.5">
        <Globe className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium">
          {choiceSlots.length === 1 ? "Дополнительный язык" : `Дополнительные языки (${choiceSlots.length})`}
        </span>
      </div>
      {choiceSlots.map((_, i) => (
        <Select
          key={i}
          value={currentChoices[i] ?? ""}
          onValueChange={(v) => handleChoiceChange(i, v)}
        >
          <SelectTrigger className="h-9 text-sm" data-testid={`select-language-choice-${i}`}>
            <SelectValue placeholder="Выберите язык…" />
          </SelectTrigger>
          <SelectContent>
            {(LANGUAGES as readonly string[]).map((lang) => {
              const usedByOtherSlot = currentChoices.some((c, j) => j !== i && c === lang);
              const isFixedLang = fixedLangs.includes(lang);
              return (
                <SelectItem
                  key={lang}
                  value={lang}
                  disabled={usedByOtherSlot || isFixedLang}
                >
                  {lang}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function formatAbilityBonuses(
  bonuses: Partial<Record<AbilityName, number>>,
): string {
  return ABILITY_NAMES.filter((ability) => (bonuses[ability] || 0) !== 0)
    .map((ability) => `${ABILITY_LABELS[ability].ru} +${bonuses[ability]}`)
    .join(", ");
}

type FlexibleBonusMode = "split" | "spread";

function hasAssignedAbilityBonuses(
  bonuses?: Partial<Record<AbilityName, number>>,
): boolean {
  return ABILITY_NAMES.some((ability) => (bonuses?.[ability] || 0) > 0);
}

function detectFlexibleBonusMode(
  bonuses?: Partial<Record<AbilityName, number>>,
): FlexibleBonusMode | null {
  const appliedBonuses = ABILITY_NAMES.map((ability) => bonuses?.[ability] || 0)
    .filter((bonus) => bonus > 0)
    .sort((a, b) => b - a);

  if (appliedBonuses.includes(2)) {
    return "split";
  }

  if (
    appliedBonuses.length === 3 &&
    appliedBonuses.every((bonus) => bonus === 1)
  ) {
    return "spread";
  }

  return null;
}

function buildSplitAbilityBonuses(
  primary?: AbilityName,
  secondary?: AbilityName,
) {
  const bonuses = createEmptyAbilityBonuses();

  if (primary) {
    bonuses[primary] = 2;
  }

  if (secondary && secondary !== primary) {
    bonuses[secondary] = 1;
  }

  return bonuses;
}

function buildSpreadAbilityBonuses(selectedAbilities: AbilityName[]) {
  const bonuses = createEmptyAbilityBonuses();

  for (const ability of selectedAbilities.slice(0, 3)) {
    bonuses[ability] = 1;
  }

  return bonuses;
}

function AbilityBonusChip({
  label,
  selected,
  disabled,
  onClick,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-40",
        selected
          ? "border-accent bg-accent/12 text-foreground shadow-sm"
          : "border-border bg-background text-muted-foreground hover:border-accent/40 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function FlexibleRaceBonusesEditor({
  character,
  onChange,
}: {
  character: Character;
  onChange: (updates: Partial<Character>) => void;
}) {
  const raceData = RACE_DATA[character.race];
  const selection = raceData?.abilityBonusSelection;

  if (!selection) {
    return null;
  }

  const selectedBonuses =
    character.selectedRacialAbilityBonuses ?? createEmptyAbilityBonuses();
  const validatedSelectedBonuses = getValidatedSelectedRacialBonuses(
    character.race,
    selectedBonuses,
  );
  const hasValidSelection = hasAssignedAbilityBonuses(validatedSelectedBonuses);
  const detectedMode = detectFlexibleBonusMode(selectedBonuses);
  const [mode, setMode] = useState<FlexibleBonusMode>(() =>
    detectedMode ?? "split",
  );

  useEffect(() => {
    if (detectedMode) {
      setMode(detectedMode);
    }
  }, [detectedMode]);

  const splitPrimary = ABILITY_NAMES.find(
    (ability) => selectedBonuses[ability] === 2,
  );
  const splitSecondary = ABILITY_NAMES.find(
    (ability) => selectedBonuses[ability] === 1,
  );
  const spreadSelections = ABILITY_NAMES.filter(
    (ability) => selectedBonuses[ability] === 1,
  );
  const splitLabel =
    selection.patterns.find((pattern) => pattern.id === "split")?.label ||
    "+2 и +1";
  const spreadLabel =
    selection.patterns.find((pattern) => pattern.id === "spread")?.label ||
    "+1 к трём";

  const setSelectedBonuses = (
    nextBonuses: ReturnType<typeof createEmptyAbilityBonuses>,
  ) => {
    onChange({ selectedRacialAbilityBonuses: nextBonuses });
  };

  const handleModeChange = (nextMode: FlexibleBonusMode) => {
    setMode(nextMode);
    setSelectedBonuses(createEmptyAbilityBonuses());
  };

  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-3">
      <div className="space-y-1">
        <div className="text-xs font-medium">Расовые бонусы характеристик</div>
        <p className="text-xs text-muted-foreground">{selection.description}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={mode === "split" ? "default" : "outline"}
          size="sm"
          className="h-8 text-xs"
          onClick={() => handleModeChange("split")}
        >
          {splitLabel}
        </Button>
        <Button
          type="button"
          variant={mode === "spread" ? "default" : "outline"}
          size="sm"
          className="h-8 text-xs"
          onClick={() => handleModeChange("spread")}
        >
          {spreadLabel}
        </Button>
      </div>

      {mode === "split" ? (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Выберите бонус +2</div>
            <div className="flex flex-wrap gap-2">
              {ABILITY_NAMES.map((ability) => (
                <AbilityBonusChip
                  key={`split-primary-${ability}`}
                  label={ABILITY_LABELS[ability].ru}
                  selected={splitPrimary === ability}
                  onClick={() => {
                    const nextPrimary =
                      splitPrimary === ability ? undefined : ability;
                    const nextSecondary =
                      splitSecondary === nextPrimary ? undefined : splitSecondary;
                    setSelectedBonuses(
                      buildSplitAbilityBonuses(nextPrimary, nextSecondary),
                    );
                  }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Выберите бонус +1</div>
            <div className="flex flex-wrap gap-2">
              {ABILITY_NAMES.map((ability) => (
                <AbilityBonusChip
                  key={`split-secondary-${ability}`}
                  label={ABILITY_LABELS[ability].ru}
                  selected={splitSecondary === ability}
                  disabled={splitPrimary === ability}
                  onClick={() => {
                    if (splitPrimary === ability) return;
                    const nextSecondary =
                      splitSecondary === ability ? undefined : ability;
                    setSelectedBonuses(
                      buildSplitAbilityBonuses(splitPrimary, nextSecondary),
                    );
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            Выберите три разные характеристики
          </div>
          <div className="flex flex-wrap gap-2">
            {ABILITY_NAMES.map((ability) => {
              const isSelected = spreadSelections.includes(ability);
              const isDisabled = !isSelected && spreadSelections.length >= 3;
              return (
                <AbilityBonusChip
                  key={`spread-${ability}`}
                  label={ABILITY_LABELS[ability].ru}
                  selected={isSelected}
                  disabled={isDisabled}
                  onClick={() => {
                    const nextSelections = isSelected
                      ? spreadSelections.filter((value) => value !== ability)
                      : [...spreadSelections, ability];
                    setSelectedBonuses(buildSpreadAbilityBonuses(nextSelections));
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {!hasValidSelection && (
        <p className="text-[11px] text-muted-foreground">
          Бонусы начнут учитываться после полного выбора схемы.
        </p>
      )}
    </div>
  );
}

function RaceTooltipContent({
  raceName,
  subraceName,
  selectedRacialAbilityBonuses,
}: {
  raceName: string;
  subraceName?: string;
  selectedRacialAbilityBonuses?: Partial<Record<AbilityName, number>>;
}) {
  const raceData = RACE_DATA[raceName];
  if (!raceData) return null;

  const subraceData = subraceName
    ? raceData.subraces?.[subraceName]
    : undefined;
  const combinedBonuses = getRacialBonuses(
    raceName,
    subraceName,
    selectedRacialAbilityBonuses,
  );
  const formattedBonuses = formatAbilityBonuses(combinedBonuses);
  const bonusSummary =
    formattedBonuses ||
    raceData.abilityBonusSelection?.description ||
    "Нет";

  const subraceDescription =
    subraceData && typeof subraceData === "object"
      ? subraceData.description
      : undefined;

  const effectiveSpeed = getRaceSpeed(raceName, subraceName);
  const resistances = getRaceResistances(raceName, subraceName);
  const creatureType = getRaceCreatureType(raceName);

  return (
    <div className="space-y-2 max-w-xs">
      <div className="font-bold text-sm">
        {raceName}
        {subraceName ? ` (${subraceName})` : ""}
        <span className="font-normal text-muted-foreground ml-1 text-xs">
          [{raceData.source}]
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{raceData.description}</p>
      {subraceDescription && (
        <p className="text-xs italic">{subraceDescription}</p>
      )}
      <div className="space-y-1 text-xs">
        <div>
          <span className="font-medium">Бонусы:</span>{" "}
          {bonusSummary}
        </div>
        <div>
          <span className="font-medium">Скорость:</span> {effectiveSpeed} фт.
        </div>
        <div>
          <span className="font-medium">Тип существа:</span> {creatureType}
        </div>
        <div>
          <span className="font-medium">Размер:</span>{" "}
          {raceData.size === "Small" ? "Маленький" : raceData.size === "Large" ? "Большой" : "Средний"}
        </div>
        {resistances.length > 0 && (
          <div>
            <span className="font-medium">Сопротивления:</span>{" "}
            {resistances.join(", ")}
          </div>
        )}
        <div>
          <span className="font-medium">Языки:</span>{" "}
          {raceData.languages.join(", ")}
        </div>
        <div>
          <span className="font-medium">Особенности:</span>
          <ul className="list-disc list-inside ml-1">
            {raceData.traits.map((trait, i) => (
              <li key={i}>{typeof trait === "string" ? trait : trait.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ClassTooltipContent({ className }: { className: string }) {
  const classData = CLASS_DATA[className];
  if (!classData) return null;

  return (
    <div className="space-y-2 max-w-xs">
      <div className="font-bold text-sm">{classData.name}</div>
      <p className="text-xs text-muted-foreground">{classData.description}</p>
      <div className="space-y-1 text-xs">
        <div>
          <span className="font-medium">Кость хитов:</span> {classData.hitDice}
        </div>
        <div>
          <span className="font-medium">Спасброски:</span>{" "}
          {classData.savingThrows.map((s) => ABILITY_LABELS[s].ru).join(", ")}
        </div>
        {classData.armorProficiencies.length > 0 && (
          <div>
            <span className="font-medium">Доспехи:</span>{" "}
            {classData.armorProficiencies.join(", ")}
          </div>
        )}
        {classData.weaponProficiencies.length > 0 && (
          <div>
            <span className="font-medium">Оружие:</span>{" "}
            {classData.weaponProficiencies.join(", ")}
          </div>
        )}
        {classData.toolProficiencies.length > 0 && (
          <div>
            <span className="font-medium">Инструменты:</span>{" "}
            {classData.toolProficiencies.join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}

function slugifyClassSelectionValue(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function createClassSelectionId(index: number, className: string): string {
  return `class-selection-${index + 1}-${slugifyClassSelectionValue(className) || "custom"}`;
}

function MulticlassEditor({
  selections,
  onSelectionsChange,
}: {
  selections: ClassSelection[];
  onSelectionsChange: (selections: ClassSelection[]) => void;
}) {
  const classes = selections.map((selection) => ({
    name: selection.className,
    level: selection.level,
    subclass: selection.subclassName,
  }));
  const totalLevel = getTotalLevel(classes);

  const handleClassNameChange = (index: number, newName: string) => {
    const definition = getClassDefinitionByName(newName);
    const updated = selections.map((selection, i) =>
      i === index
        ? {
            ...selection,
            id: createClassSelectionId(index, newName),
            classId: definition?.id ?? slugifyClassSelectionValue(newName),
            className: newName,
            source: definition?.source ?? selection.source ?? "CUSTOM",
            contentVersion:
              definition?.contentVersion ?? selection.contentVersion ?? "2014",
            subclassId: undefined,
            subclassName: undefined,
            choices: {},
            optionalFeatureIds: [],
            resourceState: undefined,
          }
        : selection,
    );
    onSelectionsChange(updated);
  };

  const handleClassLevelChange = (index: number, newLevel: number) => {
    const otherLevelsTotal = selections.reduce(
      (sum, selection, i) => (i === index ? sum : sum + selection.level),
      0,
    );
    const maxForThis = Math.max(1, 20 - otherLevelsTotal);
    const level = Math.max(1, Math.min(maxForThis, newLevel));
    const updated = selections.map((selection, i) =>
      i === index ? { ...selection, level } : selection,
    );
    onSelectionsChange(updated);
  };

  const handleSubclassChange = (index: number, newSubclass: string) => {
    const subclassName = newSubclass.trim();
    const updated = selections.map((selection, i) =>
      i === index
        ? {
            ...selection,
            subclassId: subclassName
              ? slugifyClassSelectionValue(subclassName)
              : undefined,
            subclassName: subclassName || undefined,
          }
        : selection,
    );
    onSelectionsChange(updated);
  };

  const addClass = () => {
    if (totalLevel >= 20) return;
    const usedClasses = new Set(selections.map((selection) => selection.className));
    const available = CLASSES.filter((c) => !usedClasses.has(c));
    if (available.length === 0) return;
    const newName = available[0];
    const definition = getClassDefinitionByName(newName);
    onSelectionsChange([
      ...selections,
      {
        id: createClassSelectionId(selections.length, newName),
        classId: definition?.id ?? slugifyClassSelectionValue(newName),
        className: newName,
        source: definition?.source ?? "PHB",
        contentVersion: definition?.contentVersion ?? "2014",
        level: 1,
        choices: {},
        optionalFeatureIds: [],
      },
    ]);
  };

  const removeClass = (index: number) => {
    if (selections.length <= 1) return;
    onSelectionsChange(selections.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs text-muted-foreground">
          Классы (общий ур. {totalLevel})
        </label>
        {totalLevel < 20 && classes.length < CLASSES.length && (
          <Button
            variant="ghost"
            size="sm"
            onClick={addClass}
            className="h-7 text-xs gap-1"
            data-testid="button-add-class"
          >
            <Plus className="w-3 h-3" />
            Добавить класс
          </Button>
        )}
      </div>
      {selections.map((selection, index) => {
        const entry = classes[index];
        return (
          <div key={selection.id} className="rounded-lg border border-border/60 p-2.5 space-y-2">
            <div className="flex items-center gap-2">
              <Select
                value={entry.name}
                onValueChange={(v) => handleClassNameChange(index, v)}
              >
                <SelectTrigger
                  className="flex-1 h-10 text-sm"
                  data-testid={`select-class-${index}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLASSES.map((cls) => (
                    <SelectItem
                      key={cls}
                      value={cls}
                      disabled={
                        cls !== entry.name &&
                        selections.some((current) => current.className === cls)
                      }
                    >
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                max={20}
                value={entry.level}
                onChange={(e) =>
                  handleClassLevelChange(index, parseInt(e.target.value) || 1)
                }
                className="w-16 h-10 text-center font-bold"
                data-testid={`input-class-level-${index}`}
              />
              {selections.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeClass(index)}
                  className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive"
                  data-testid={`button-remove-class-${index}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="space-y-1">
              <label
                className="text-[11px] text-muted-foreground block"
                htmlFor={`input-subclass-${index}`}
              >
                Подкласс
              </label>
              <Input
                id={`input-subclass-${index}`}
                value={selection.subclassName ?? ""}
                onChange={(e) => handleSubclassChange(index, e.target.value)}
                placeholder="Если уже выбран"
                className="h-9 text-sm"
                data-testid={`input-subclass-${index}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EditingFields({
  character,
  onChange,
  handleClassSelectionsChange,
  handleRaceChange,
  subraces,
}: {
  character: Character;
  onChange: (updates: Partial<Character>) => void;
  handleClassSelectionsChange: (selections: ClassSelection[]) => void;
  handleRaceChange: (newRace: string, newSubrace?: string) => void;
  subraces: string[];
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">
          Имя персонажа
        </label>
        <Input
          value={character.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="text-lg font-bold h-10"
          placeholder="Имя персонажа"
          data-testid="input-name"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Раса</label>
        <RacePickerDialog value={character.race} subrace={character.subrace} onChange={handleRaceChange} />
      </div>

      {subraces.length > 0 && (
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Подраса
          </label>
          <Select
            value={character.subrace || "none"}
            onValueChange={(value) => {
              const newSubrace = value === "none" ? "" : value;
              onChange({
                subrace: newSubrace,
                speed: getRaceSpeed(character.race, newSubrace || undefined),
              });
            }}
          >
            <SelectTrigger
              className="h-10 text-sm"
              data-testid="select-subrace"
            >
              <SelectValue placeholder="Подраса" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Нет</SelectItem>
              {subraces.map((subrace) => (
                <SelectItem key={subrace} value={subrace}>
                  {subrace}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <FlexibleRaceBonusesEditor
        key={character.race}
        character={character}
        onChange={onChange}
      />

      <LanguageChoiceEditor
        key={`lang-${character.race}`}
        character={character}
        onChange={onChange}
      />

      <MulticlassEditor
        selections={getCharacterClassSelections(character)}
        onSelectionsChange={handleClassSelectionsChange}
      />

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">
          Опыт (XP)
        </label>
        <NumericInput
          min={0}
          value={character.experience}
          onChange={(v) => onChange({ experience: v })}
          className="h-10"
          data-testid="input-experience"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
          <Scroll className="w-3 h-3" />
          Предыстория
        </label>
        <Input
          value={character.background || ""}
          onChange={(e) => onChange({ background: e.target.value })}
          placeholder="Народный герой"
          className="h-10"
          data-testid="input-background"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
          <Sparkles className="w-3 h-3" />
          Мировоззрение
        </label>
        <Select
          value={character.alignment || ""}
          onValueChange={(value) => onChange({ alignment: value })}
        >
          <SelectTrigger className="h-10" data-testid="select-alignment">
            <SelectValue placeholder="Выберите" />
          </SelectTrigger>
          <SelectContent>
            {ALIGNMENTS.map((alignment) => (
              <SelectItem key={alignment} value={alignment}>
                {alignment}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ─── Short Rest ──────────────────────────────────────────────────────────────

interface RollEntry {
  raw: number;
  mod: number;
  total: number;
}

function ShortRestDialog({
  character,
  conMod,
  open,
  onOpenChange,
  onApply,
}: {
  character: Character;
  conMod: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (updates: Partial<Character>) => void;
}) {
  const [rolls, setRolls] = useState<RollEntry[]>([]);
  const [rolling, setRolling] = useState(false);
  const [animVal, setAnimVal] = useState<number | null>(null);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const parsedDice = character.hitDice?.match(/d(\d+)/);
  const dieFaces = parsedDice ? parseInt(parsedDice[1]) : 6;
  const totalDice = getTotalLevel(getCharacterClasses(character));
  const diceRemaining = (character.hitDiceRemaining ?? totalDice) - rolls.length;

  const totalRestored = rolls.reduce((s, r) => s + r.total, 0);
  const newHp = Math.min(character.maxHp, character.currentHp + totalRestored);
  const isHpFull = newHp >= character.maxHp;
  const canRoll = diceRemaining > 0 && !isHpFull && !rolling;

  useEffect(() => {
    if (open) {
      setRolls([]);
      setAnimVal(null);
      setRolling(false);
    }
    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [open]);

  const rollHitDie = () => {
    if (!canRoll) return;
    const raw = Math.floor(Math.random() * dieFaces) + 1;
    const total = Math.max(1, raw + conMod);

    setRolling(true);
    setAnimVal(Math.floor(Math.random() * dieFaces) + 1);
    animRef.current = setInterval(() => {
      setAnimVal(Math.floor(Math.random() * dieFaces) + 1);
    }, 60);

    setTimeout(() => {
      if (animRef.current) clearInterval(animRef.current);
      setAnimVal(null);
      setRolls((prev) => [...prev, { raw, mod: conMod, total }]);
      setRolling(false);
    }, 500);
  };

  const handleFinish = () => {
    if (rolls.length > 0) {
      onApply({
        currentHp: newHp,
        hitDiceRemaining: (character.hitDiceRemaining ?? totalDice) - rolls.length,
      });
    }
    onOpenChange(false);
  };

  const modStr = conMod >= 0 ? `+${conMod}` : `${conMod}`;

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-amber-500" />
            Короткий отдых
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <div className="space-y-3">
          {/* HP and hit dice status */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border/50">
              <Heart className="w-4 h-4 text-red-500 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-muted-foreground">Хиты</div>
                <div className="text-sm font-bold tabular-nums">
                  <span className={isHpFull ? "text-green-500" : ""}>{newHp}</span>
                  <span className="text-muted-foreground font-normal"> / {character.maxHp}</span>
                  {totalRestored > 0 && (
                    <span className="text-green-500 text-xs ml-1">(+{totalRestored})</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border/50">
              <Dice6 className="w-4 h-4 text-accent shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-muted-foreground">Кости хитов (d{dieFaces})</div>
                <div className="text-sm font-bold tabular-nums">
                  {diceRemaining}
                  <span className="text-muted-foreground font-normal"> / {totalDice}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Animation or hint */}
          {rolling && animVal !== null ? (
            <div className="flex flex-col items-center py-4">
              <div className="text-5xl font-black tabular-nums text-accent animate-pulse">
                {animVal}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Бросок d{dieFaces}...</div>
            </div>
          ) : rolls.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-3">
              Каждая кость: d{dieFaces} {modStr} (КОН) → восстановление ХП
            </p>
          ) : null}

          {/* Roll history */}
          {rolls.length > 0 && !rolling && (
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Броски этого отдыха
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {rolls.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm px-2.5 py-1.5 rounded-md bg-green-500/10 border border-green-500/20"
                  >
                    <span className="text-muted-foreground text-xs">
                      d{dieFaces} → <span className="font-semibold text-foreground">{r.raw}</span>
                      {" "}{r.mod >= 0 ? "+" : ""}{r.mod} КОН
                    </span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      +{r.total} ХП
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status messages */}
          {isHpFull && !rolling && (
            <div className="flex items-center justify-center gap-1.5 text-sm text-green-600 dark:text-green-400 font-medium py-1">
              <CheckCircle2 className="w-4 h-4" />
              Хиты восстановлены до максимума!
            </div>
          )}
          {diceRemaining <= 0 && !isHpFull && !rolling && (
            <p className="text-sm text-center text-muted-foreground py-1">
              Кости хитов закончились
            </p>
          )}

          {/* Roll button */}
          <Button
            className="w-full gap-2 h-11"
            onClick={rollHitDie}
            disabled={!canRoll}
          >
            <Dice6 className="w-4 h-4" />
            {rolling ? "Бросок..." : `Потратить кость хитов (d${dieFaces})`}
          </Button>
        </div>

        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleFinish}>
            Завершить отдых
            {rolls.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-xs">
                {rolls.length} {rolls.length === 1 ? "кость" : rolls.length < 5 ? "кости" : "костей"}
              </Badge>
            )}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

// ─── Long Rest ───────────────────────────────────────────────────────────────

function LongRestDialog({
  character,
  open,
  onOpenChange,
  onApply,
}: {
  character: Character;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (updates: Partial<Character>) => void;
}) {
  const totalDice = getTotalLevel(getCharacterClasses(character));
  const diceRestored = Math.max(1, Math.floor(totalDice / 2));
  const currentDice = character.hitDiceRemaining ?? totalDice;
  const newDice = Math.min(totalDice, currentDice + diceRestored);

  const hpMissing = character.maxHp - character.currentHp;
  const spellcasting = character.spellcasting;
  const hasSpellSlots =
    spellcasting?.spellSlots?.some((s) => s.max > 0) ||
    (spellcasting?.pactMagic?.max ?? 0) > 0;
  const usedSpellSlots =
    (spellcasting?.spellSlots?.reduce((s, slot) => s + slot.used, 0) ?? 0) +
    (spellcasting?.pactMagic?.used ?? 0);

  const handleRest = () => {
    const updates: Partial<Character> = {
      currentHp: character.maxHp,
      hitDiceRemaining: newDice,
    };

    if (spellcasting) {
      updates.spellcasting = {
        ...spellcasting,
        spellSlots: spellcasting.spellSlots.map((slot) => ({
          ...slot,
          used: 0,
        })),
        pactMagic: spellcasting.pactMagic
          ? { ...spellcasting.pactMagic, used: 0 }
          : spellcasting.pactMagic,
      };
    }

    onApply(updates);
    onOpenChange(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-400" />
            Продолжительный отдых
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            8 часов отдыха полностью восстанавливают силы персонажа.
          </p>

          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              После отдыха
            </div>

            {/* HP */}
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 border border-border/50">
              <Heart className="w-4 h-4 text-red-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">Хиты</div>
                <div className="text-xs text-muted-foreground">
                  {character.currentHp} / {character.maxHp}
                  {hpMissing > 0 && (
                    <span className="text-green-500 ml-1">→ {character.maxHp} (+{hpMissing})</span>
                  )}
                </div>
              </div>
              {hpMissing === 0 ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <span className="text-xs font-bold text-green-500">Макс.</span>
              )}
            </div>

            {/* Hit Dice */}
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 border border-border/50">
              <Dice6 className="w-4 h-4 text-accent shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">Кости хитов</div>
                <div className="text-xs text-muted-foreground">
                  {currentDice} / {totalDice}
                  {newDice > currentDice && (
                    <span className="text-green-500 ml-1">→ {newDice} (+{newDice - currentDice})</span>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Восстанавливается половина максимума (минимум 1): +{diceRestored}
                </div>
              </div>
              {currentDice === totalDice ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              ) : (
                <span className="text-xs font-bold text-green-500 shrink-0">+{diceRestored}</span>
              )}
            </div>

            {/* Spell slots */}
            {hasSpellSlots && (
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 border border-border/50">
                <Wand2 className="w-4 h-4 text-purple-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">Ячейки заклинаний</div>
                  <div className="text-xs text-muted-foreground">
                    {usedSpellSlots > 0
                      ? `${usedSpellSlots} потраченных → все восстановлены`
                      : "Все ячейки уже восстановлены"}
                  </div>
                </div>
                {usedSpellSlots === 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                ) : (
                  <span className="text-xs font-bold text-green-500 shrink-0">Восст.</span>
                )}
              </div>
            )}
          </div>
        </div>

        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleRest} className="gap-2">
            <Moon className="w-3.5 h-3.5" />
            Отдохнуть
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface CharacterHeaderProps {
  character: Character;
  onChange: (updates: Partial<Character>) => void;
  isEditing: boolean;
  onFinishEditing?: () => Promise<void> | void;
}

export function CharacterHeader({
  character,
  onChange,
  isEditing,
  onFinishEditing,
}: CharacterHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [shortRestOpen, setShortRestOpen] = useState(false);
  const [longRestOpen, setLongRestOpen] = useState(false);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [avatarViewOpen, setAvatarViewOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 640px)");

  const racialBonuses = getRacialBonuses(
    character.race,
    character.subrace,
    character.selectedRacialAbilityBonuses,
  );
  const conMod = calculateModifier(
    character.abilityScores.CON +
      (racialBonuses.CON || 0) +
      (character.customAbilityBonuses?.CON || 0),
  );
  const classSelections = getCharacterClassSelections(character);
  const charClasses = getCharacterClasses(character);
  const totalLevel = getTotalLevel(charClasses);
  const profBonus = getProficiencyBonus(totalLevel);
  const raceData = RACE_DATA[character.race];
  const subraces = raceData?.subraces ? Object.keys(raceData.subraces) : [];
  const xpProgress = getXPProgress(character.experience, totalLevel);
  const xpLevel = getLevelFromXP(character.experience);
  const canLevelUp = xpLevel > totalLevel && totalLevel < 20;

  const handleDrawerSave = async () => {
    if (!onFinishEditing) {
      setDrawerOpen(false);
      return;
    }

    try {
      await onFinishEditing();
    } catch {
      // saveChanges already shows a toast on failure; keep the drawer open
    }
  };

  const handleLevelUp = () => {
    const newLevel = Math.min(20, xpLevel);
    const levelDiff = newLevel - totalLevel;
    const nextSelections = classSelections.map((selection, index) =>
      index === 0
        ? { ...selection, level: selection.level + levelDiff }
        : selection,
    );
    handleClassSelectionsChange(nextSelections);
  };

  const handleClassSelectionsChange = (newSelections: ClassSelection[]) => {
    const patch = buildClassStatePatch(character, newSelections);
    onChange({
      ...patch,
      spellcasting:
        patch.spellcasting ??
        (character.spellcasting
          ? {
              ...character.spellcasting,
              spellSlots: Array.from({ length: 9 }, () => ({ max: 0, used: 0 })),
              pactMagic: { slotLevel: 1, max: 0, used: 0 },
            }
          : undefined),
    });
  };

  const handleRaceChange = (newRace: string, newSubrace?: string) => {
    onChange({
      race: newRace,
      // Use "" instead of undefined: JSON.stringify drops undefined, so the server
      // would never receive the "clear subrace" signal and the old value would persist.
      subrace: newSubrace ?? "",
      speed: getRaceSpeed(newRace, newSubrace),
      selectedRacialAbilityBonuses: createEmptyAbilityBonuses(),
      raceSelections: {},
    });
  };

  return (
    <Card className="stat-card p-3 sm:p-4">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          {/* Avatar with edit/view interaction */}
          <div className="relative flex-shrink-0 group">
            <Avatar
              className={`w-14 h-14 sm:w-16 sm:h-16 border-2 border-accent/30 ${
                !isEditing && character.avatar ? "cursor-pointer" : ""
              }`}
              onClick={() => {
                if (!isEditing && character.avatar) setAvatarViewOpen(true);
              }}
            >
              {character.avatar ? (
                <AvatarImage src={character.avatar} alt={character.name} />
              ) : null}
              <AvatarFallback className="text-xl bg-accent/20">
                <User className="w-7 h-7 sm:w-8 sm:h-8 text-accent" />
              </AvatarFallback>
            </Avatar>

            {/* Pencil overlay in edit mode — always visible */}
            {isEditing && (
              <button
                onClick={() => setAvatarPickerOpen(true)}
                className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40"
                aria-label="Изменить фото"
              >
                <Pencil className="w-5 h-5 text-white" />
              </button>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            {isEditing && isDesktop ? (
              <Input
                value={character.name}
                onChange={(e) => onChange({ name: e.target.value })}
                className="text-lg sm:text-xl font-bold h-10"
                placeholder="Имя персонажа"
                data-testid="input-name"
              />
            ) : (
              <h1
                className="text-lg sm:text-xl font-bold truncate"
                data-testid="text-character-name"
              >
                {character.name}
              </h1>
            )}

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {isEditing && isDesktop ? (
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <RacePickerDialog
                      value={character.race}
                      subrace={character.subrace}
                      onChange={handleRaceChange}
                    />
                    {subraces.length > 0 && (
                      <Select
                        value={character.subrace || "none"}
                        onValueChange={(value) => {
                          const newSubrace = value === "none" ? "" : value;
                          onChange({
                            subrace: newSubrace,
                            speed: getRaceSpeed(character.race, newSubrace || undefined),
                          });
                        }}
                      >
                        <SelectTrigger
                          className="flex-1 min-w-[100px] h-10 text-sm"
                          data-testid="select-subrace"
                        >
                          <SelectValue placeholder="Подраса" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Нет</SelectItem>
                          {subraces.map((subrace) => (
                            <SelectItem key={subrace} value={subrace}>
                              {subrace}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {character.race && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0"
                            data-testid="button-race-info"
                          >
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="p-3">
                          <RaceTooltipContent
                            raceName={character.race}
                            subraceName={character.subrace}
                            selectedRacialAbilityBonuses={
                              character.selectedRacialAbilityBonuses
                            }
                          />
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <FlexibleRaceBonusesEditor
                    key={character.race}
                    character={character}
                    onChange={onChange}
                  />
                  <LanguageChoiceEditor
                    key={`lang-${character.race}`}
                    character={character}
                    onChange={onChange}
                  />
                  <MulticlassEditor
                    selections={classSelections}
                    onSelectionsChange={handleClassSelectionsChange}
                  />
                </div>
              ) : (
                <>
                  <HelpTooltip
                    content={
                      <RaceTooltipContent
                        raceName={character.race}
                        subraceName={character.subrace}
                        selectedRacialAbilityBonuses={
                          character.selectedRacialAbilityBonuses
                        }
                      />
                    }
                    side="bottom"
                    asChild
                    mobileAsChild
                  >
                    <span className="cursor-help" data-testid="badge-race">
                      <Badge variant="secondary" className="text-xs">
                        {character.race}
                        {character.subrace ? ` (${character.subrace})` : ""}
                      </Badge>
                    </span>
                  </HelpTooltip>
                  {charClasses.map((entry, i) => (
                    <HelpTooltip
                      key={i}
                      content={<ClassTooltipContent className={entry.name} />}
                      side="bottom"
                      asChild
                      mobileAsChild
                    >
                      <span
                        className="cursor-help"
                        data-testid={`badge-class-${i}`}
                      >
                        <Badge variant="outline" className="text-xs">
                          {charClasses.length > 1
                            ? `${entry.name} ${entry.level}`
                            : entry.name}
                        </Badge>
                      </span>
                    </HelpTooltip>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="text-center min-w-[50px]"
                  data-testid="stat-level"
                >
                  <div className="text-xs text-muted-foreground">Уровень</div>
                  <div className="text-xl sm:text-2xl font-bold">
                    {totalLevel}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {charClasses.length > 1 ? (
                  <div className="space-y-1">
                    <p>Общий уровень: {totalLevel}</p>
                    {charClasses.map((c, i) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        {c.name}: {c.level}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p>Уровень персонажа от 1 до 20</p>
                )}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="text-center px-2 sm:px-3 py-1 rounded-md bg-accent/10"
                  data-testid="stat-proficiency"
                >
                  <div className="text-xs text-muted-foreground">
                    Мастерство
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-accent">
                    {formatModifier(profBonus)}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Бонус мастерства</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-1.5">
            {isEditing && !isDesktop && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDrawerOpen(true)}
                className="gap-1.5 h-10 px-3"
                data-testid="button-open-edit-drawer"
              >
                <Settings2 className="w-4 h-4" />
                Параметры
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          onClick={() => onChange({ inspiration: !character.inspiration })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-xs font-medium select-none ${
            character.inspiration
              ? "bg-accent/20 border-accent/60 text-accent"
              : "border-border/50 text-muted-foreground hover:border-accent/40 hover:text-foreground"
          }`}
          data-testid="button-toggle-inspiration"
          aria-label={character.inspiration ? "Убрать вдохновение" : "Получить вдохновение"}
          aria-pressed={character.inspiration}
        >
          <Zap className={`w-3.5 h-3.5 transition-all ${character.inspiration ? "fill-accent" : ""}`} />
          Вдохновение
        </button>

        {!isEditing && (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShortRestOpen(true)}
              className="h-8 px-2.5 text-xs gap-1.5 text-amber-600 border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-500"
              data-testid="button-short-rest"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Кор. отдых</span>
              <span className="sm:hidden">Кор.</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLongRestOpen(true)}
              className="h-8 px-2.5 text-xs gap-1.5 text-indigo-400 border-indigo-400/40 hover:bg-indigo-400/10 hover:text-indigo-400"
              data-testid="button-long-rest"
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Дол. отдых</span>
              <span className="sm:hidden">Дол.</span>
            </Button>
          </div>
        )}
      </div>

      <ShortRestDialog
        character={character}
        conMod={conMod}
        open={shortRestOpen}
        onOpenChange={setShortRestOpen}
        onApply={onChange}
      />
      <LongRestDialog
        character={character}
        open={longRestOpen}
        onOpenChange={setLongRestOpen}
        onApply={onChange}
      />

      <div className="mt-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="space-y-1" data-testid="stat-xp-progress">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Опыт: {character.experience.toLocaleString()} XP</span>
                <span>
                  {totalLevel < 20
                    ? `До ${totalLevel + 1} уровня: ${(xpProgress.next - character.experience).toLocaleString()} XP`
                    : "Максимальный уровень"}
                </span>
              </div>
              <Progress value={xpProgress.progress} className="h-2" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Прогресс опыта</p>
            <p className="text-xs text-muted-foreground">
              {xpProgress.current.toLocaleString()} /{" "}
              {xpProgress.next.toLocaleString()} XP
            </p>
          </TooltipContent>
        </Tooltip>
        {canLevelUp && (
          <Button
            size="sm"
            variant="default"
            className="w-full mt-1.5 gap-1.5 h-8 text-xs"
            onClick={handleLevelUp}
            data-testid="button-level-up"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Повысить уровень до {xpLevel}
          </Button>
        )}
      </div>

      {!isEditing && isDesktop && (
        <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 gap-3">
          <div className="flex items-start gap-2">
            <Scroll className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">Предыстория</div>
              <div className="text-sm font-medium truncate">
                {character.background || "—"}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">Мировоззрение</div>
              <div className="text-sm font-medium truncate">
                {character.alignment || "—"}
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditing && isDesktop && (
        <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
              <Scroll className="w-3 h-3" />
              Предыстория
            </label>
            <Input
              value={character.background || ""}
              onChange={(e) => onChange({ background: e.target.value })}
              placeholder="Народный герой"
              className="h-10"
              data-testid="input-background"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
              <Sparkles className="w-3 h-3" />
              Мировоззрение
            </label>
            <Select
              value={character.alignment || ""}
              onValueChange={(value) => onChange({ alignment: value })}
            >
              <SelectTrigger className="h-10" data-testid="select-alignment">
                <SelectValue placeholder="Выберите" />
              </SelectTrigger>
              <SelectContent>
                {ALIGNMENTS.map((alignment) => (
                  <SelectItem key={alignment} value={alignment}>
                    {alignment}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
              <BookOpen className="w-3 h-3" />
              Опыт (XP)
            </label>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={character.experience}
              onChange={(e) =>
                onChange({ experience: parseInt(e.target.value) || 0 })
              }
              className="h-10"
              data-testid="input-experience"
            />
          </div>
        </div>
      )}

      {isEditing && (
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent>
            <div className="max-h-[85vh] overflow-y-auto px-4 pb-4">
              <DrawerHeader>
                <DrawerTitle>Редактирование персонажа</DrawerTitle>
                <DrawerDescription>
                  Измените параметры вашего персонажа
                </DrawerDescription>
              </DrawerHeader>
              <EditingFields
                character={character}
                onChange={onChange}
                handleClassSelectionsChange={handleClassSelectionsChange}
                handleRaceChange={handleRaceChange}
                subraces={subraces}
              />
              <DrawerFooter>
                <Button variant="outline" onClick={() => setDrawerOpen(false)}>
                  Продолжить
                </Button>
                <Button onClick={handleDrawerSave}>Сохранить</Button>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Avatar picker (edit mode) */}
      <AvatarPickerModal
        open={avatarPickerOpen}
        onOpenChange={setAvatarPickerOpen}
        currentAvatar={character.avatar}
        onSave={(dataUrl) => onChange({ avatar: dataUrl ?? "" })}
      />

      {/* Avatar fullscreen view (play mode) */}
      {character.avatar && (
        <AvatarViewModal
          open={avatarViewOpen}
          onOpenChange={setAvatarViewOpen}
          avatarSrc={character.avatar}
          characterName={character.name}
        />
      )}
    </Card>
  );
}
