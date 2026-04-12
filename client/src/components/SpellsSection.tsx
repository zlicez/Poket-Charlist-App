import { useState, useEffect, useMemo, useRef } from "react";
import { generateId } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpTooltip, TooltipBody } from "@/components/ui/help-tooltip";
import {
  SPELL_SLOTS_TOOLTIP,
  CANTRIPS_TOOLTIP,
  PACT_MAGIC_TOOLTIP,
} from "@/lib/tooltip-content";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ResponsiveDialog,
  ResponsiveDialogTrigger,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Edit2,
  Clock,
  Ruler,
  Sparkles,
  Eye,
  Target,
  Wand2,
  Library,
  Search,
  RefreshCw,
  Lock,
  Unlock,
} from "lucide-react";
import {
  ABILITY_LABELS,
  CLASS_DATA,
  calculateModifier,
  calculateSpellSaveDC,
  calculateSpellAttackBonus,
  formatModifier,
  getProficiencyBonus,
  getRacialBonuses,
  getCharacterClasses,
  getTotalLevel,
} from "@shared/schema";
import type {
  Character,
  Spell,
  Spellcasting,
  AbilityName,
} from "@shared/schema";
import {
  spells as spellLibrary,
  type SpellEntry,
} from "@shared/data/spells-library";
import { RichTextContent } from "@/components/RichTextContent";
import { RichTextField } from "@/components/RichTextField";
import { getSpellcastingProgression } from "@shared/data/spell-slots";
import { NumericInput } from "@/components/ui/numeric-input";

const SPELL_LEVEL_LABELS: Record<number, string> = {
  0: "Заговоры",
  1: "1 уровень",
  2: "2 уровень",
  3: "3 уровень",
  4: "4 уровень",
  5: "5 уровень",
  6: "6 уровень",
  7: "7 уровень",
  8: "8 уровень",
  9: "9 уровень",
};

// ── Spell Library Dialog ──────────────────────────────────────────────────────

function SpellLibraryDialog({
  onAdd,
}: {
  onAdd: (spell: Omit<Spell, "id">) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const schoolOptions = useMemo(() => {
    return Array.from(
      new Set(spellLibrary.map((spell) => spell.school.trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b, "ru"));
  }, []);

  const classOptions = useMemo(() => {
    return Array.from(
      new Set(
        spellLibrary.flatMap((spell) => spell.classes ?? []).filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b, "ru"));
  }, []);

  const filtered = useMemo(() => {
    return spellLibrary.filter((s) => {
      if (
        debouncedSearch.trim() &&
        !s.name.toLowerCase().includes(debouncedSearch.trim().toLowerCase())
      )
        return false;
      if (levelFilter !== "all" && s.level !== Number(levelFilter))
        return false;
      if (schoolFilter !== "all" && s.school !== schoolFilter) return false;
      if (classFilter !== "all" && !s.classes?.includes(classFilter))
        return false;
      return true;
    });
  }, [debouncedSearch, levelFilter, schoolFilter, classFilter]);

  const handleAdd = (entry: SpellEntry) => {
    onAdd({
      name: entry.name,
      level: entry.level,
      castingTime: entry.castingTime ?? "1 действие",
      range: entry.range ?? "",
      components: entry.components ?? "",
      duration: entry.duration ?? "",
      concentration: entry.concentration,
      ritual: entry.ritual,
      description: entry.description ?? "",
      prepared: true,
    });
    setOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setSearch("");
      setDebouncedSearch("");
      setLevelFilter("all");
      setSchoolFilter("all");
      setClassFilter("all");
    }
  };

  const formatSchoolLabel = (school: string) =>
    school ? school.charAt(0).toUpperCase() + school.slice(1) : "Без школы";

  return (
    <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
      <ResponsiveDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 sm:h-7 sm:w-7"
          title="Выбрать из базы заклинаний"
          data-testid="button-spell-library"
        >
          <Library className="w-4 h-4" />
        </Button>
      </ResponsiveDialogTrigger>

      <ResponsiveDialogContent className="max-w-md">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <Library className="w-4 h-4" />
            База заклинаний
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        {/* Search + filters */}
        <div className="space-y-2 px-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по названию..."
              className="pl-9"
              data-testid="input-spell-library-search"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger
                className="h-9 text-xs"
                data-testid="select-spell-library-level"
              >
                <SelectValue placeholder="Уровень" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все уровни</SelectItem>
                <SelectItem value="0">Заговор</SelectItem>
                {Array.from({ length: 9 }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {i + 1} уровень
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={schoolFilter} onValueChange={setSchoolFilter}>
              <SelectTrigger
                className="h-9 text-xs"
                data-testid="select-spell-library-school"
              >
                <SelectValue placeholder="Школа" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все школы</SelectItem>
                {schoolOptions.map((school) => (
                  <SelectItem key={school} value={school}>
                    {formatSchoolLabel(school)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger
              className="h-9 text-xs"
              data-testid="select-spell-library-class"
            >
              <SelectValue placeholder="Класс" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все классы</SelectItem>
              {classOptions.map((cls) => (
                <SelectItem key={cls} value={cls}>
                  {cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results list */}
        <ScrollArea className="h-[320px] px-1">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              Ничего не найдено
            </div>
          ) : (
            <div className="space-y-0.5">
              {filtered.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => handleAdd(entry)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-accent/10 active:bg-accent/20 transition-colors min-h-[44px] sm:min-h-0"
                  data-testid={`spell-library-item-${entry.id}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm leading-tight">
                      {entry.name}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {entry.concentration && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0 h-4"
                        >
                          К
                        </Badge>
                      )}
                      {entry.ritual && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0 h-4"
                        >
                          Р
                        </Badge>
                      )}
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 h-4"
                      >
                        {entry.level === 0 ? "Загов." : `${entry.level} ур.`}
                      </Badge>
                    </div>
                  </div>
                  {entry.castingTime && (
                    <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {entry.castingTime}
                      </span>
                      {entry.school && (
                        <span>{formatSchoolLabel(entry.school)}</span>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_SPELLCASTING: Spellcasting = {
  ability: "INT",
  spellSlots: Array.from({ length: 9 }, () => ({ max: 0, used: 0 })),
  pactMagic: { slotLevel: 1, max: 0, used: 0 },
  spells: [],
};

function buildSyncedSpellSlots(
  currentSlots: Spellcasting["spellSlots"],
  calculatedSlots: number[] | null,
) {
  return Array.from({ length: 9 }, (_, i) => {
    const currentSlot = currentSlots[i] ?? { max: 0, used: 0 };
    const nextMax = calculatedSlots?.[i] ?? 0;

    return {
      max: nextMax,
      used: Math.min(currentSlot.used, nextMax),
    };
  });
}

function spellSlotsChanged(
  currentSlots: Spellcasting["spellSlots"],
  nextSlots: Spellcasting["spellSlots"],
) {
  return nextSlots.some((slot, i) => {
    const currentSlot = currentSlots[i] ?? { max: 0, used: 0 };
    return currentSlot.max !== slot.max || currentSlot.used !== slot.used;
  });
}

function buildSyncedPactMagic(
  currentPactMagic: Spellcasting["pactMagic"],
  calculatedPactMagic: { slotLevel: number; max: number } | null,
) {
  const nextMax = calculatedPactMagic?.max ?? 0;

  return {
    slotLevel: calculatedPactMagic?.slotLevel ?? 1,
    max: nextMax,
    used: Math.min(currentPactMagic.used, nextMax),
  };
}

function pactMagicChanged(
  currentPactMagic: Spellcasting["pactMagic"],
  nextPactMagic: Spellcasting["pactMagic"],
) {
  return (
    currentPactMagic.slotLevel !== nextPactMagic.slotLevel ||
    currentPactMagic.max !== nextPactMagic.max ||
    currentPactMagic.used !== nextPactMagic.used
  );
}

function getLegacyPactMagicFromSpellSlots(
  currentSlots: Spellcasting["spellSlots"],
  calculatedPactMagic: { slotLevel: number; max: number } | null,
) {
  if (!calculatedPactMagic) return null;

  const nonEmptySlots = currentSlots
    .map((slot, index) => ({ slot, level: index + 1 }))
    .filter(({ slot }) => slot.max > 0);

  if (nonEmptySlots.length !== 1) return null;

  const [legacySlot] = nonEmptySlots;
  if (legacySlot.level !== calculatedPactMagic.slotLevel) return null;

  return {
    slotLevel: legacySlot.level,
    max: legacySlot.slot.max,
    used: Math.min(legacySlot.slot.used, legacySlot.slot.max),
  };
}

interface SpellsSectionProps {
  character: Character;
  onChange: (updates: Partial<Character>) => void;
  isEditing: boolean;
  isLocked?: boolean;
  onToggleLock?: () => void;
}

const MAX_SLOTS_PER_LEVEL = [4, 3, 3, 3, 3, 2, 2, 1, 1]; // index 0 = level 1 (D&D 5e max)

function AddSpellDialog({
  onAdd,
  defaultLevel,
}: {
  onAdd: (spell: Omit<Spell, "id">) => void;
  defaultLevel?: number;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [level, setLevel] = useState(defaultLevel ?? 0);
  const [castingTime, setCastingTime] = useState("1 действие");
  const [range, setRange] = useState("");
  const [components, setComponents] = useState("");
  const [duration, setDuration] = useState("");
  const [concentration, setConcentration] = useState(false);
  const [ritual, setRitual] = useState(false);
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({
      name,
      level,
      castingTime,
      range,
      components,
      duration,
      concentration,
      ritual,
      description,
      prepared: true,
    });
    setName("");
    setLevel(defaultLevel ?? 0);
    setCastingTime("1 действие");
    setRange("");
    setComponents("");
    setDuration("");
    setConcentration(false);
    setRitual(false);
    setDescription("");
    setOpen(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 h-9 sm:h-8"
          data-testid="button-add-spell"
        >
          <Plus className="w-4 h-4" />
          Добавить
        </Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Новое заклинание</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="space-y-3 p-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Название *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Огненный шар"
              className="h-10"
              data-testid="input-spell-name"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Уровень
              </label>
              <Select
                value={String(level)}
                onValueChange={(v) => setLevel(Number(v))}
              >
                <SelectTrigger
                  className="h-10"
                  data-testid="select-spell-level"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {i === 0 ? "Заговор" : `${i} уровень`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Время сотворения
              </label>
              <Input
                value={castingTime}
                onChange={(e) => setCastingTime(e.target.value)}
                placeholder="1 действие"
                className="h-10"
                data-testid="input-spell-casting-time"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Дистанция
              </label>
              <Input
                value={range}
                onChange={(e) => setRange(e.target.value)}
                placeholder="150 фт."
                className="h-10"
                data-testid="input-spell-range"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Компоненты
              </label>
              <Input
                value={components}
                onChange={(e) => setComponents(e.target.value)}
                placeholder="В, С, М"
                className="h-10"
                data-testid="input-spell-components"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Длительность
            </label>
            <Input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Мгновенная"
              className="h-10"
              data-testid="input-spell-duration"
            />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={concentration}
                onCheckedChange={(c) => setConcentration(c === true)}
                data-testid="checkbox-spell-concentration"
              />
              Концентрация
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={ritual}
                onCheckedChange={(c) => setRitual(c === true)}
                data-testid="checkbox-spell-ritual"
              />
              Ритуал
            </label>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Описание
            </label>
            <RichTextField
              value={description}
              onChange={setDescription}
              placeholder="Описание заклинания..."
              rows={3}
              textareaClassName="min-h-[132px]"
              previewContainerClassName="min-h-[132px]"
              textareaTestId="textarea-spell-description"
              previewTestId="preview-spell-description"
            />
          </div>
        </div>
        <ResponsiveDialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim()}
            data-testid="button-confirm-add-spell"
          >
            Добавить заклинание
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

function SpellSlotTracker({
  testIdPrefix = "spell-slots",
  rowLabel,
  level,
  max,
  used,
  calculatedMax,
  onChange,
  isEditing,
  isLocked,
  noCap = false,
}: {
  testIdPrefix?: string;
  rowLabel?: string;
  level: number;
  max: number;
  used: number;
  calculatedMax?: number;
  onChange: (max: number, used: number) => void;
  isEditing: boolean;
  isLocked?: boolean;
  noCap?: boolean; // skip D&D 5e cap (for pact magic)
}) {
  if (max === 0 && !isEditing) return null;

  const cap = !noCap ? MAX_SLOTS_PER_LEVEL[level - 1] : undefined;
  const displayMax = cap !== undefined ? Math.min(max, cap) : max;

  // Count-based: spent slots fill from the right
  const spent = Math.min(used, displayMax);
  const available = displayMax - spent;
  // Cell i is spent if it is in the right-side (spent) zone
  const isCellSpent = (i: number) => i >= available;

  return (
    <div
      className="grid items-center gap-x-3"
      style={{ gridTemplateColumns: "1.5rem 1fr auto" }}
      data-testid={`${testIdPrefix}-level-${level}`}
    >
      <span className="text-xs font-medium text-right text-muted-foreground">
        {rowLabel ?? level}
      </span>
      {isEditing ? (
        <div className="flex items-center gap-1.5">
          <NumericInput
            min={0}
            max={20}
            value={max}
            onChange={(v) => onChange(v, Math.min(used, v))}
            className="h-8 w-14 text-center text-sm font-mono"
            data-testid={`input-${testIdPrefix}-max-${level}`}
          />
          {calculatedMax !== undefined && calculatedMax !== max && (
            <button
              className="text-[11px] text-muted-foreground hover:text-accent tabular-nums"
              onClick={() =>
                onChange(calculatedMax, Math.min(used, calculatedMax))
              }
              title="Заполнить расчётным значением"
              data-testid={`button-${testIdPrefix}-calc-${level}`}
            >
              /{calculatedMax}
            </button>
          )}
        </div>
      ) : (
        <div className="flex gap-1.5 flex-wrap">
          {Array.from({ length: displayMax }, (_, i) => {
            const isSpent = isCellSpent(i);
            return (
              <div
                key={i}
                className={`w-10 h-10 sm:w-8 sm:h-8 rounded border-2 flex items-center justify-center ${
                  isSpent
                    ? "bg-muted border-muted-foreground/30 opacity-40"
                    : "border-accent/50 bg-accent/10"
                }`}
                data-testid={`${testIdPrefix}-cell-${level}-${i}`}
              >
                {!isSpent && <Sparkles className="w-4 h-4 text-accent" />}
              </div>
            );
          })}
          {displayMax === 0 && (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>
      )}
      {!isEditing && !isLocked && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 sm:h-8 sm:w-8"
            onClick={() => onChange(max, Math.min(displayMax, used + 1))}
            disabled={spent >= displayMax}
            aria-label="Потратить ячейку"
            data-testid={`button-${testIdPrefix}-minus-${level}`}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 sm:h-8 sm:w-8"
            onClick={() => onChange(max, Math.max(0, used - 1))}
            disabled={spent <= 0}
            aria-label="Восстановить ячейку"
            data-testid={`button-${testIdPrefix}-plus-${level}`}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function EditSpellDialog({
  spell,
  onSave,
  trigger,
}: {
  spell: Spell;
  onSave: (updated: Spell) => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(spell.name);
  const [level, setLevel] = useState(spell.level);
  const [castingTime, setCastingTime] = useState(spell.castingTime);
  const [range, setRange] = useState(spell.range);
  const [components, setComponents] = useState(spell.components);
  const [duration, setDuration] = useState(spell.duration || "");
  const [concentration, setConcentration] = useState(spell.concentration);
  const [ritual, setRitual] = useState(spell.ritual);
  const [description, setDescription] = useState(spell.description);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setName(spell.name);
      setLevel(spell.level);
      setCastingTime(spell.castingTime);
      setRange(spell.range);
      setComponents(spell.components);
      setDuration(spell.duration || "");
      setConcentration(spell.concentration);
      setRitual(spell.ritual);
      setDescription(spell.description);
    }
    setOpen(isOpen);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      ...spell,
      name,
      level,
      castingTime,
      range,
      components,
      duration,
      concentration,
      ritual,
      description,
    });
    setOpen(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={handleOpen}>
      <ResponsiveDialogTrigger asChild>{trigger}</ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            Редактировать заклинание
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="space-y-3 p-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Название *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10"
              data-testid="input-edit-spell-name"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Уровень
              </label>
              <Select
                value={String(level)}
                onValueChange={(v) => setLevel(Number(v))}
              >
                <SelectTrigger
                  className="h-10"
                  data-testid="select-edit-spell-level"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {i === 0 ? "Заговор" : `${i} уровень`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Время сотворения
              </label>
              <Input
                value={castingTime}
                onChange={(e) => setCastingTime(e.target.value)}
                className="h-10"
                data-testid="input-edit-spell-casting-time"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Дистанция
              </label>
              <Input
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="h-10"
                data-testid="input-edit-spell-range"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Компоненты
              </label>
              <Input
                value={components}
                onChange={(e) => setComponents(e.target.value)}
                className="h-10"
                data-testid="input-edit-spell-components"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Длительность
            </label>
            <Input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="h-10"
              data-testid="input-edit-spell-duration"
            />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={concentration}
                onCheckedChange={(c) => setConcentration(c === true)}
                data-testid="checkbox-edit-spell-concentration"
              />
              Концентрация
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={ritual}
                onCheckedChange={(c) => setRitual(c === true)}
                data-testid="checkbox-edit-spell-ritual"
              />
              Ритуал
            </label>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Описание
            </label>
            <RichTextField
              value={description}
              onChange={setDescription}
              rows={3}
              textareaClassName="min-h-[132px]"
              previewContainerClassName="min-h-[132px]"
              textareaTestId="textarea-edit-spell-description"
              previewTestId="preview-edit-spell-description"
            />
          </div>
        </div>
        <ResponsiveDialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim()}
            data-testid="button-confirm-edit-spell"
          >
            Сохранить
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

function SpellCard({
  spell,
  isEditing,
  onRemove,
  onTogglePrepared,
  onUpdate,
}: {
  spell: Spell;
  isEditing: boolean;
  onRemove: () => void;
  onTogglePrepared: () => void;
  onUpdate: (updated: Spell) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`border rounded-md px-2.5 py-1.5 text-sm transition-colors ${
        spell.prepared
          ? "border-border bg-card"
          : "border-border/50 bg-muted/30 opacity-60"
      }`}
      data-testid={`spell-card-${spell.id}`}
    >
      <div className="flex items-center gap-1.5">
        {spell.level > 0 && (
          <Checkbox
            checked={spell.prepared}
            onCheckedChange={() => onTogglePrepared()}
            className="shrink-0"
            data-testid={`checkbox-spell-prepared-${spell.id}`}
          />
        )}
        <button
          className="flex-1 flex items-center gap-1.5 text-left min-w-0"
          onClick={() => setExpanded(!expanded)}
          data-testid={`button-expand-spell-${spell.id}`}
        >
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
          )}
          <span className="font-medium truncate">{spell.name}</span>
          {spell.concentration && (
            <Badge
              variant="outline"
              className="text-[10px] px-1 py-0 h-4 shrink-0"
            >
              К
            </Badge>
          )}
          {spell.ritual && (
            <Badge
              variant="outline"
              className="text-[10px] px-1 py-0 h-4 shrink-0"
            >
              Р
            </Badge>
          )}
        </button>
        {isEditing && (
          <div className="flex items-center gap-0.5 shrink-0">
            <EditSpellDialog
              spell={spell}
              onSave={onUpdate}
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  data-testid={`button-edit-spell-${spell.id}`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
              }
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              onClick={onRemove}
              data-testid={`button-remove-spell-${spell.id}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
      {expanded && (
        <div className="mt-2 space-y-1 text-xs text-muted-foreground pl-5">
          {spell.castingTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{spell.castingTime}</span>
            </div>
          )}
          {spell.range && (
            <div className="flex items-center gap-1">
              <Ruler className="w-3 h-3" />
              <span>{spell.range}</span>
            </div>
          )}
          {spell.components && (
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{spell.components}</span>
            </div>
          )}
          {spell.duration && (
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{spell.duration}</span>
            </div>
          )}
          {spell.description && (
            <RichTextContent
              content={spell.description}
              className="mt-1"
              testId={`spell-description-${spell.id}`}
            />
          )}
        </div>
      )}
    </div>
  );
}

export function SpellsSection({
  character,
  onChange,
  isEditing,
  isLocked = false,
  onToggleLock,
}: SpellsSectionProps) {
  const charClasses = getCharacterClasses(character);
  const casterClass = charClasses.find(
    (c) => CLASS_DATA[c.name]?.spellcastingAbility,
  );
  const classData = casterClass
    ? CLASS_DATA[casterClass.name]
    : CLASS_DATA[character.class];
  const classSpellAbility = classData?.spellcastingAbility;
  const calculatedProgression = getSpellcastingProgression(charClasses);
  const calculatedSlots = calculatedProgression.spellSlots;
  const calculatedPactMagic = calculatedProgression.pactMagic;

  const resolvedDefault: Spellcasting = {
    ...DEFAULT_SPELLCASTING,
    ability: classSpellAbility ?? DEFAULT_SPELLCASTING.ability,
  };
  const rawSpellcasting = character.spellcasting;
  const currentSpellSlots =
    rawSpellcasting?.spellSlots ?? DEFAULT_SPELLCASTING.spellSlots;
  const legacyPactMagic =
    rawSpellcasting?.pactMagic === undefined
      ? getLegacyPactMagicFromSpellSlots(currentSpellSlots, calculatedPactMagic)
      : null;
  const spellcasting = character.spellcasting
    ? {
        ...DEFAULT_SPELLCASTING,
        ...character.spellcasting,
        ability: character.spellcasting.ability ?? classSpellAbility ?? "INT",
        spellSlots: legacyPactMagic
          ? DEFAULT_SPELLCASTING.spellSlots
          : currentSpellSlots,
        pactMagic: {
          ...DEFAULT_SPELLCASTING.pactMagic,
          ...(legacyPactMagic ?? {}),
          ...(character.spellcasting.pactMagic ?? {}),
          ...(character.spellcasting.pactMagic === undefined &&
          calculatedPactMagic
            ? {
                slotLevel: calculatedPactMagic.slotLevel,
                max: calculatedPactMagic.max,
              }
            : {}),
        },
      }
    : resolvedDefault;

  const totalLevel = getTotalLevel(charClasses);
  const profBonus = getProficiencyBonus(totalLevel);
  const casterSignature =
    charClasses.map(({ name, level }) => `${name}:${level}`).join("|") ||
    "none";

  const racialBonuses = getRacialBonuses(character.race, character.subrace);
  const abilityScore =
    character.abilityScores[spellcasting.ability] +
    (racialBonuses[spellcasting.ability] || 0) +
    (character.customAbilityBonuses?.[spellcasting.ability] || 0);
  const abilityMod = calculateModifier(abilityScore);
  const spellSaveDC = calculateSpellSaveDC(abilityMod, profBonus);
  const spellAttackBonus = calculateSpellAttackBonus(abilityMod, profBonus);

  const [openLevels, setOpenLevels] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    for (const spell of spellcasting.spells) {
      initial[spell.level] = true;
    }
    return initial;
  });
  const lastAutoSyncSignature = useRef<string | null>(null);

  const updateSpellcasting = (updates: Partial<Spellcasting>) => {
    onChange({
      spellcasting: { ...spellcasting, ...updates },
    });
  };

  const handleAbilityChange = (ability: AbilityName) => {
    updateSpellcasting({ ability });
  };

  const handleSlotChange = (levelIndex: number, max: number, used: number) => {
    const newSlots = [...spellcasting.spellSlots];
    newSlots[levelIndex] = { max, used: Math.min(used, max) };
    updateSpellcasting({ spellSlots: newSlots });
  };

  const handlePactMagicChange = (max: number, used: number) => {
    updateSpellcasting({
      pactMagic: {
        ...spellcasting.pactMagic,
        max,
        used: Math.min(used, max),
      },
    });
  };

  const syncSpellSlotsToCalculated = () => {
    const newSlots = buildSyncedSpellSlots(
      spellcasting.spellSlots,
      calculatedSlots,
    );
    const newPactMagic = buildSyncedPactMagic(
      spellcasting.pactMagic,
      calculatedPactMagic,
    );
    const slotsHaveChanged = spellSlotsChanged(
      spellcasting.spellSlots,
      newSlots,
    );
    const pactMagicHasChanged = pactMagicChanged(
      spellcasting.pactMagic,
      newPactMagic,
    );

    if (!slotsHaveChanged && !pactMagicHasChanged) return;

    updateSpellcasting({
      ...(slotsHaveChanged ? { spellSlots: newSlots } : {}),
      ...(pactMagicHasChanged ? { pactMagic: newPactMagic } : {}),
    });
  };

  const handleAutoFillSlots = () => {
    syncSpellSlotsToCalculated();
  };

  useEffect(() => {
    if (lastAutoSyncSignature.current === null) {
      lastAutoSyncSignature.current = casterSignature;
      return;
    }

    if (lastAutoSyncSignature.current === casterSignature) return;
    lastAutoSyncSignature.current = casterSignature;
    syncSpellSlotsToCalculated();
  }, [casterSignature]);

  const handleAddSpell = (spellData: Omit<Spell, "id">) => {
    const newSpell: Spell = {
      ...spellData,
      id: generateId(),
    };
    updateSpellcasting({ spells: [...spellcasting.spells, newSpell] });
    setOpenLevels((prev) => ({ ...prev, [newSpell.level]: true }));
  };

  const handleRemoveSpell = (spellId: string) => {
    updateSpellcasting({
      spells: spellcasting.spells.filter((s) => s.id !== spellId),
    });
  };

  const handleTogglePrepared = (spellId: string) => {
    updateSpellcasting({
      spells: spellcasting.spells.map((s) =>
        s.id === spellId ? { ...s, prepared: !s.prepared } : s,
      ),
    });
  };

  const handleUpdateSpell = (updated: Spell) => {
    updateSpellcasting({
      spells: spellcasting.spells.map((s) =>
        s.id === updated.id ? updated : s,
      ),
    });
  };

  const toggleLevel = (level: number) => {
    setOpenLevels((prev) => ({ ...prev, [level]: !prev[level] }));
  };

  const spellsByLevel = new Map<number, Spell[]>();
  for (let i = 0; i <= 9; i++) {
    spellsByLevel.set(i, []);
  }
  for (const spell of spellcasting.spells) {
    const list = spellsByLevel.get(spell.level) ?? [];
    list.push(spell);
    spellsByLevel.set(spell.level, list);
  }

  const hasAnySpellSlots = spellcasting.spellSlots.some((s) => s.max > 0);
  const hasPactMagic = spellcasting.pactMagic.max > 0;
  const hasAnySlots = hasAnySpellSlots || hasPactMagic;
  const hasAnySpells = spellcasting.spells.length > 0;
  const showRegularSpellSlots =
    calculatedSlots !== null ||
    hasAnySpellSlots ||
    (isEditing && !calculatedPactMagic);
  const showPactMagic = calculatedPactMagic !== null || hasPactMagic;
  const showAutoFillButton =
    isEditing && (calculatedSlots !== null || calculatedPactMagic !== null);

  const isCasterClass = !!classSpellAbility;
  if (!hasAnySlots && !hasAnySpells && !isEditing && !isCasterClass) {
    return null;
  }

  return (
    <Card className="stat-card p-2 sm:p-3" data-testid="section-spells-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-accent" />
          <h3 className="font-semibold text-sm">Заклинания</h3>
        </div>
        {isEditing && (
          <div className="flex items-center gap-1">
            <SpellLibraryDialog onAdd={handleAddSpell} />
            <AddSpellDialog onAdd={handleAddSpell} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div
              className="text-center p-2 rounded-md bg-accent/10"
              data-testid="stat-spell-ability"
            >
              <div className="text-[10px] text-muted-foreground uppercase">
                Характ.
              </div>
              {isEditing ? (
                <Select
                  value={spellcasting.ability}
                  onValueChange={(v) => handleAbilityChange(v as AbilityName)}
                >
                  <SelectTrigger
                    className="h-7 text-xs font-bold border-0 bg-transparent p-0 justify-center"
                    data-testid="select-spell-ability"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      [
                        "STR",
                        "DEX",
                        "CON",
                        "INT",
                        "WIS",
                        "CHA",
                      ] as AbilityName[]
                    ).map((ab) => (
                      <SelectItem key={ab} value={ab}>
                        {ABILITY_LABELS[ab].ru}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm font-bold">
                  {ABILITY_LABELS[spellcasting.ability].ru}
                </div>
              )}
          <div className="mt-1 flex justify-center">
            <HelpTooltip
              content={
                <div className="space-y-0.5">
                  <p className="font-medium text-sm">Заклинательная характеристика</p>
                  <p className="text-xs text-muted-foreground">Модификатор используется для расчёта Сл. спасброска и Бонуса атаки.</p>
                  <p className="text-xs text-muted-foreground">Текущий модификатор: {formatModifier(abilityMod)}</p>
                </div>
              }
              iconSize="xs"
              side="bottom"
            />
          </div>
            </div>

        <div className="text-center p-2 rounded-md bg-accent/10" data-testid="stat-spell-save-dc">
            <div className="text-[10px] text-muted-foreground uppercase">
              Сл. спасбр.
            </div>
            <div className="text-lg font-bold font-mono">{spellSaveDC}</div>
            <div className="flex justify-center mt-1">
              <HelpTooltip
                content={
                  <div className="space-y-0.5">
                    <p className="font-medium text-sm">Сложность спасброска заклинания</p>
                    <p className="text-xs text-muted-foreground">Цель должна превысить это значение своим спасброском.</p>
                    <p className="text-xs text-muted-foreground">8 + мастерство ({profBonus}) + {ABILITY_LABELS[spellcasting.ability].ru} ({formatModifier(abilityMod)})</p>
                  </div>
                }
                iconSize="xs"
                side="bottom"
              />
            </div>
          </div>

        <div className="text-center p-2 rounded-md bg-accent/10" data-testid="stat-spell-attack">
            <div className="text-[10px] text-muted-foreground uppercase">
              Атака закл.
            </div>
            <div className={`text-lg font-bold font-mono ${spellAttackBonus >= 0 ? "text-positive" : "text-negative"}`}>
              {formatModifier(spellAttackBonus)}
            </div>
            <div className="flex justify-center mt-1">
              <HelpTooltip
                content={
                  <div className="space-y-0.5">
                    <p className="font-medium text-sm">Бонус атаки заклинанием</p>
                    <p className="text-xs text-muted-foreground">Добавляется к броску d20 при заклинаниях с атакой.</p>
                    <p className="text-xs text-muted-foreground">Мастерство ({profBonus}) + {ABILITY_LABELS[spellcasting.ability].ru} ({formatModifier(abilityMod)})</p>
                  </div>
                }
                iconSize="xs"
                side="bottom"
              />
            </div>
          </div>
      </div>

      {showRegularSpellSlots && (
        <div className="space-y-1.5 mb-3" data-testid="spell-slots-section">
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Target className="w-3 h-3" />
            Ячейки заклинаний
            <HelpTooltip
              content={<TooltipBody title={SPELL_SLOTS_TOOLTIP.title} lines={SPELL_SLOTS_TOOLTIP.lines} />}
              side="right"
              iconSize="xs"
            />
            <div className="ml-auto flex items-center gap-1">
              {!isEditing && onToggleLock && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onToggleLock}
                      className={`h-6 w-6 ${isLocked ? "text-muted-foreground" : "text-accent"}`}
                      data-testid="button-toggle-spell-slots-lock"
                    >
                      {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isLocked ? "Разблокировать ячейки" : "Заблокировать ячейки"}
                  </TooltipContent>
                </Tooltip>
              )}
              {showAutoFillButton && (
                <button
                  onClick={handleAutoFillSlots}
                  className="flex items-center gap-1 text-xs text-accent hover:underline"
                  data-testid="button-auto-fill-slots"
                >
                  <RefreshCw className="w-3 h-3" />
                  По классу
                </button>
              )}
            </div>
          </div>
          {Array.from({ length: 9 }, (_, i) => (
            <SpellSlotTracker
              key={i}
              level={i + 1}
              max={spellcasting.spellSlots[i]?.max ?? 0}
              used={spellcasting.spellSlots[i]?.used ?? 0}
              calculatedMax={calculatedSlots?.[i]}
              onChange={(max, used) => handleSlotChange(i, max, used)}
              isEditing={isEditing}
              isLocked={isLocked}
            />
          ))}
        </div>
      )}

      {showPactMagic && (
        <div
          className="space-y-1.5 mb-3"
          data-testid="spell-pact-magic-section"
        >
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            Пактовая магия
            <HelpTooltip
              content={<TooltipBody title={PACT_MAGIC_TOOLTIP.title} lines={PACT_MAGIC_TOOLTIP.lines} />}
              side="right"
              iconSize="xs"
            />
            {!showRegularSpellSlots && showAutoFillButton && (
              <button
                onClick={handleAutoFillSlots}
                className="ml-auto flex items-center gap-1 text-xs text-accent hover:underline"
                data-testid="button-auto-fill-slots"
              >
                <RefreshCw className="w-3 h-3" />
                По классу
              </button>
            )}
          </div>
          <SpellSlotTracker
            testIdPrefix="pact-magic"
            rowLabel="Пакт"
            level={spellcasting.pactMagic.slotLevel}
            max={spellcasting.pactMagic.max}
            used={spellcasting.pactMagic.used}
            onChange={handlePactMagicChange}
            isEditing={isEditing}
            noCap
          />
          <div className="pl-12 text-[11px] text-muted-foreground">
            Все ячейки колдуна одного уровня: {spellcasting.pactMagic.slotLevel}
          </div>
        </div>
      )}

      <div className="space-y-2" data-testid="spells-list">
        {Array.from({ length: 10 }, (_, level) => {
          const spells = spellsByLevel.get(level) ?? [];
          if (spells.length === 0 && !isEditing) return null;

          const isOpen = openLevels[level] ?? false;

          return (
            <Collapsible
              key={level}
              open={isOpen}
              onOpenChange={() => toggleLevel(level)}
            >
              <CollapsibleTrigger
                className="flex items-center gap-1.5 w-full text-left py-1 hover:bg-muted/50 rounded px-1 transition-colors"
                data-testid={`spell-level-trigger-${level}`}
              >
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                )}
                <Wand2 className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-medium flex-1">
                  {SPELL_LEVEL_LABELS[level]}
                </span>
                {level === 0 && (
                  <span onClick={(e) => e.stopPropagation()} className="shrink-0">
                    <HelpTooltip
                      content={<TooltipBody title={CANTRIPS_TOOLTIP.title} lines={CANTRIPS_TOOLTIP.lines} />}
                      iconSize="xs"
                      side="top"
                    />
                  </span>
                )}
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                  {spells.length}
                </Badge>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-1 mt-1 pl-1">
                  {spells.map((spell) => (
                    <SpellCard
                      key={spell.id}
                      spell={spell}
                      isEditing={isEditing}
                      onRemove={() => handleRemoveSpell(spell.id)}
                      onTogglePrepared={() => handleTogglePrepared(spell.id)}
                      onUpdate={handleUpdateSpell}
                    />
                  ))}
                  {spells.length === 0 && (
                    <div className="text-xs text-muted-foreground py-2 text-center">
                      Нет заклинаний этого уровня
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </Card>
  );
}
