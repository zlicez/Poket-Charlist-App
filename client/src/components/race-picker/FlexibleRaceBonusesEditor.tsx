import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ABILITY_LABELS,
  ABILITY_NAMES,
  RACE_DATA,
  createEmptyAbilityBonuses,
  getValidatedSelectedRacialBonuses,
  type Character,
} from "@shared/schema";

import { AbilityBonusChip } from "./AbilityBonusChip";
import {
  buildSplitAbilityBonuses,
  buildSpreadAbilityBonuses,
  detectFlexibleBonusMode,
  hasAssignedAbilityBonuses,
  type FlexibleBonusMode,
} from "./ability-bonuses";

export function FlexibleRaceBonusesEditor({
  character,
  onChange,
}: {
  character: Character;
  onChange: (updates: Partial<Character>) => void;
}) {
  const raceData = RACE_DATA[character.race];
  const selection = raceData?.abilityBonusSelection;

  // Хуки должны вызываться в одном и том же порядке на каждом рендере —
  // поэтому они идут до early-return. Состояние `mode` не зависит от selection;
  // для рас без flexible-selection компонент просто не рендерится ниже.
  const selectedBonuses =
    character.selectedRacialAbilityBonuses ?? createEmptyAbilityBonuses();
  const detectedMode = detectFlexibleBonusMode(selectedBonuses);
  const [mode, setMode] = useState<FlexibleBonusMode>(
    () => detectedMode ?? "split",
  );

  useEffect(() => {
    if (detectedMode) {
      setMode(detectedMode);
    }
  }, [detectedMode]);

  if (!selection) {
    return null;
  }

  const validatedSelectedBonuses = getValidatedSelectedRacialBonuses(
    character.race,
    selectedBonuses,
  );
  const hasValidSelection = hasAssignedAbilityBonuses(validatedSelectedBonuses);

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
