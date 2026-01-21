import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Dices } from "lucide-react";
import { ABILITY_NAMES, ABILITY_LABELS, calculateModifier, formatModifier, getProficiencyBonus, type AbilityName, type AbilityScores, type SavingThrows as SavingThrowsType } from "@shared/schema";

interface SavingThrowsProps {
  abilityScores: AbilityScores;
  savingThrows: SavingThrowsType;
  level: number;
  onChange: (savingThrows: SavingThrowsType) => void;
  onRoll: (ability: AbilityName) => void;
  isEditing: boolean;
}

const SAVING_THROW_TOOLTIPS: Record<AbilityName, string> = {
  STR: "Спасбросок Силы используется против эффектов, которые пытаются сбить вас с ног, схватить или физически переместить.",
  DEX: "Спасбросок Ловкости помогает уклоняться от ловушек, взрывов огненного шара и подобных эффектов по области.",
  CON: "Спасбросок Телосложения противостоит ядам, болезням и эффектам, влияющим на выносливость и жизненную силу.",
  INT: "Спасбросок Интеллекта защищает от ментальных атак, иллюзий и эффектов, атакующих разум.",
  WIS: "Спасбросок Мудрости противостоит очарованию, страху и другим эффектам, влияющим на волю и восприятие.",
  CHA: "Спасбросок Харизмы защищает от эффектов изгнания, одержимости и атак на вашу личность.",
};

export function SavingThrowsComponent({ abilityScores, savingThrows, level, onChange, onRoll, isEditing }: SavingThrowsProps) {
  const profBonus = getProficiencyBonus(level);

  const toggleProficiency = (ability: AbilityName) => {
    onChange({
      ...savingThrows,
      [ability]: !savingThrows[ability],
    });
  };

  return (
    <Card className="stat-card p-3">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-accent" />
        <h3 className="font-semibold text-sm">Спасброски</h3>
      </div>

      <div className="space-y-1">
        {ABILITY_NAMES.map((ability) => {
          const score = abilityScores[ability];
          const mod = calculateModifier(score);
          const isProficient = savingThrows[ability];
          const totalBonus = isProficient ? mod + profBonus : mod;

          return (
            <Tooltip key={ability}>
              <TooltipTrigger asChild>
                <div 
                  className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer hover-elevate active-elevate-2 ${
                    isProficient ? 'bg-accent/10' : ''
                  }`}
                  onClick={() => !isEditing && onRoll(ability)}
                  data-testid={`save-${ability.toLowerCase()}`}
                >
                  {isEditing ? (
                    <Checkbox 
                      checked={isProficient}
                      onCheckedChange={() => toggleProficiency(ability)}
                      onClick={(e) => e.stopPropagation()}
                      data-testid={`checkbox-save-${ability.toLowerCase()}`}
                    />
                  ) : (
                    <div className={`w-3 h-3 rounded-full ${
                      isProficient ? 'bg-accent' : 'border-2 border-muted-foreground/30'
                    }`} />
                  )}
                  
                  <span className={`text-sm flex-1 ${isProficient ? 'font-medium' : 'text-muted-foreground'}`}>
                    {ABILITY_LABELS[ability].ru}
                  </span>
                  
                  <span className={`text-sm font-bold ${
                    totalBonus >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatModifier(totalBonus)}
                  </span>

                  {!isEditing && (
                    <Dices className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p className="font-semibold">Спасбросок {ABILITY_LABELS[ability].ru}</p>
                <p className="text-sm text-muted-foreground mt-1">{SAVING_THROW_TOOLTIPS[ability]}</p>
                <div className="text-xs mt-2 space-y-0.5">
                  <p>Модификатор {ability}: {formatModifier(mod)}</p>
                  {isProficient && <p>Бонус мастерства: +{profBonus}</p>}
                </div>
                {!isEditing && (
                  <p className="text-xs text-muted-foreground mt-2">Нажмите для спасброска</p>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </Card>
  );
}
