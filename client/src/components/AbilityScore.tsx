import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { calculateModifier, formatModifier, ABILITY_LABELS, type AbilityName } from "@shared/schema";
import { Dices } from "lucide-react";

interface AbilityScoreProps {
  ability: AbilityName;
  score: number;
  onChange: (value: number) => void;
  onRoll: () => void;
  isEditing: boolean;
}

const ABILITY_TOOLTIPS: Record<AbilityName, string> = {
  STR: "Сила определяет физическую мощь персонажа. Влияет на броски атаки и урона в ближнем бою, проверки Атлетики и переносимый вес.",
  DEX: "Ловкость отражает быстроту и координацию. Влияет на инициативу, КД, броски дальних атак и навыки Акробатика, Ловкость рук, Скрытность.",
  CON: "Телосложение показывает выносливость и здоровье. Определяет количество хитов персонажа и спасброски на концентрацию.",
  INT: "Интеллект отвечает за логику и память. Важен для волшебников. Влияет на Анализ, Историю, Магию, Природу и Религию.",
  WIS: "Мудрость отражает интуицию и внимательность. Важна для жрецов и друидов. Влияет на Восприятие, Проницательность, Медицину, Выживание.",
  CHA: "Харизма определяет силу личности. Важна для бардов, паладинов и колдунов. Влияет на Обман, Запугивание, Выступление, Убеждение.",
};

export function AbilityScore({ ability, score, onChange, onRoll, isEditing }: AbilityScoreProps) {
  const modifier = calculateModifier(score);
  const label = ABILITY_LABELS[ability];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card 
          className="stat-card p-3 text-center cursor-pointer group hover-elevate active-elevate-2"
          onClick={() => !isEditing && onRoll()}
          data-testid={`ability-${ability.toLowerCase()}`}
        >
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            {ability}
          </div>
          <div className="text-sm text-muted-foreground mb-2">
            {label.ru}
          </div>
          
          <div className="relative mb-2">
            {isEditing ? (
              <Input
                type="number"
                min={1}
                max={30}
                value={score}
                onChange={(e) => onChange(parseInt(e.target.value) || 10)}
                className="text-center text-lg font-bold h-10"
                onClick={(e) => e.stopPropagation()}
                data-testid={`input-ability-${ability.toLowerCase()}`}
              />
            ) : (
              <div className="text-2xl font-bold">{score}</div>
            )}
          </div>

          <div 
            className={`text-lg font-bold rounded-md py-1 px-2 inline-block min-w-[3rem] ${
              modifier >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatModifier(modifier)}
          </div>

          {!isEditing && (
            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Dices className="w-4 h-4 mx-auto text-accent" />
            </div>
          )}
        </Card>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <p className="text-sm">{ABILITY_TOOLTIPS[ability]}</p>
        {!isEditing && (
          <p className="text-xs text-muted-foreground mt-1">Нажмите для проверки характеристики</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
