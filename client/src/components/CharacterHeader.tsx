import { useState, useEffect, useRef } from "react";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";
import { AvatarPickerModal, AvatarViewModal } from "@/components/avatar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { NumericInput } from "@/components/ui/numeric-input";
import {
  CLASSES,
  ALIGNMENTS,
  RACE_DATA,
  CLASS_DATA,
  ABILITY_LABELS,
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
  getRaceSpeed,
} from "@shared/schema";
import type {
  Character,
  ClassSelection,
} from "@shared/schema";


// ─── Race picker — extracted to components/race-picker/* ─────────────────────

import { FlexibleRaceBonusesEditor } from "./race-picker/FlexibleRaceBonusesEditor";
import { LanguageChoiceEditor } from "./race-picker/LanguageChoiceEditor";
import { RacePickerDialog } from "./race-picker/RacePickerDialog";
import { RaceTooltipContent } from "./race-picker/RaceTooltipContent";

// ─── Class tooltip + Multiclass + Rest + EditingFields + CharacterHeader ─────

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
