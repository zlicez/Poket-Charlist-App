import { useEffect, useRef, useState } from "react";
import { generateId } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Lock,
  RefreshCw,
  Sparkles,
  Target,
  Unlock,
  Wand2,
} from "lucide-react";
import {
  ABILITY_LABELS,
  calculateModifier,
  calculateSpellSaveDC,
  calculateSpellAttackBonus,
  formatModifier,
  getProficiencyBonus,
  getRacialBonuses,
  getCharacterClasses,
  getTotalLevel,
  resolveClassState,
} from "@shared/schema";
import type {
  AbilityName,
  Character,
  Spell,
  Spellcasting,
} from "@shared/schema";

import { AddSpellDialog } from "./spells/AddSpellDialog";
import {
  DEFAULT_SPELLCASTING,
  SPELL_LEVEL_LABELS,
} from "./spells/constants";
import { SpellCard } from "./spells/SpellCard";
import { SpellLibraryDialog } from "./spells/SpellLibraryDialog";
import { SpellSlotTracker } from "./spells/SpellSlotTracker";
import {
  buildSyncedPactMagic,
  buildSyncedSpellSlots,
  getLegacyPactMagicFromSpellSlots,
  pactMagicChanged,
  spellSlotsChanged,
} from "./spells/spell-slots";

interface SpellsSectionProps {
  character: Character;
  onChange: (updates: Partial<Character>) => void;
  isEditing: boolean;
  isLocked?: boolean;
  onToggleLock?: () => void;
}

export function SpellsSection({
  character,
  onChange,
  isEditing,
  isLocked = false,
  onToggleLock,
}: SpellsSectionProps) {
  const resolvedClassState = resolveClassState(character);
  const charClasses = getCharacterClasses(character);
  const classSpellAbility = resolvedClassState.spellcasting.ability;
  const calculatedProgression = resolvedClassState.spellcasting.progression;
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

  const racialBonuses = getRacialBonuses(
    character.race,
    character.subrace,
    character.selectedRacialAbilityBonuses,
  );
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
  }, [casterSignature]); // eslint-disable-line react-hooks/exhaustive-deps

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
