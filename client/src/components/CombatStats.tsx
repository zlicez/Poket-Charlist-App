import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Footprints, Heart, Skull, Plus, Minus } from "lucide-react";
import type { Character, DeathSaves } from "@shared/schema";

interface CombatStatsProps {
  character: Character;
  onChange: (updates: Partial<Character>) => void;
  isEditing: boolean;
}

function StatBox({ 
  icon: Icon, 
  label, 
  value, 
  tooltip, 
  onChange, 
  isEditing,
  testId
}: { 
  icon: React.ElementType; 
  label: string; 
  value: number; 
  tooltip: string;
  onChange?: (value: number) => void;
  isEditing: boolean;
  testId: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card className="stat-card p-3 text-center" data-testid={testId}>
          <Icon className="w-5 h-5 mx-auto mb-1 text-accent" />
          <div className="text-xs text-muted-foreground mb-1">{label}</div>
          {isEditing && onChange ? (
            <Input
              type="number"
              value={value}
              onChange={(e) => onChange(parseInt(e.target.value) || 0)}
              className="text-center text-lg font-bold h-8"
              data-testid={`input-${testId}`}
            />
          ) : (
            <div className="text-2xl font-bold">{value}</div>
          )}
        </Card>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function HpTracker({ 
  current, 
  max, 
  temp, 
  onChange, 
  isEditing 
}: { 
  current: number; 
  max: number; 
  temp: number;
  onChange: (updates: { currentHp?: number; maxHp?: number; tempHp?: number }) => void;
  isEditing: boolean;
}) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  const tempPercentage = Math.max(0, Math.min(100 - percentage, (temp / max) * 100));

  const adjustHp = (delta: number) => {
    const newHp = Math.min(max, Math.max(0, current + delta));
    onChange({ currentHp: newHp });
  };

  return (
    <Card className="stat-card p-3" data-testid="stat-hp">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          <span className="font-semibold">Хиты</span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="text-xs">
              {temp > 0 && <span className="text-blue-500 mr-1">+{temp}</span>}
              {current}/{max}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Текущие / Максимальные хиты</p>
            {temp > 0 && <p className="text-blue-400">Временные хиты: {temp}</p>}
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="hp-bar mb-2">
        <div 
          className="hp-fill absolute left-0 top-0"
          style={{ width: `${percentage}%` }}
        />
        {temp > 0 && (
          <div 
            className="hp-temp absolute top-0 h-full"
            style={{ left: `${percentage}%`, width: `${tempPercentage}%` }}
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold drop-shadow">
          {current} / {max}
        </div>
      </div>

      {isEditing ? (
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div>
            <label className="text-xs text-muted-foreground">Текущие</label>
            <Input
              type="number"
              value={current}
              onChange={(e) => onChange({ currentHp: parseInt(e.target.value) || 0 })}
              className="h-8 text-center"
              data-testid="input-current-hp"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Макс.</label>
            <Input
              type="number"
              value={max}
              onChange={(e) => onChange({ maxHp: parseInt(e.target.value) || 0 })}
              className="h-8 text-center"
              data-testid="input-max-hp"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Врем.</label>
            <Input
              type="number"
              value={temp}
              onChange={(e) => onChange({ tempHp: parseInt(e.target.value) || 0 })}
              className="h-8 text-center"
              data-testid="input-temp-hp"
            />
          </div>
        </div>
      ) : (
        <div className="flex justify-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => adjustHp(-1)}
            className="h-7 w-7 p-0"
            data-testid="button-hp-minus"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => adjustHp(1)}
            className="h-7 w-7 p-0"
            data-testid="button-hp-plus"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}
    </Card>
  );
}

function DeathSavesTracker({ 
  deathSaves, 
  onChange, 
  isEditing 
}: { 
  deathSaves: DeathSaves; 
  onChange: (deathSaves: DeathSaves) => void;
  isEditing: boolean;
}) {
  const toggleSuccess = (index: number) => {
    if (isEditing) return;
    const newSuccesses = deathSaves.successes >= index + 1 ? index : index + 1;
    onChange({ ...deathSaves, successes: newSuccesses });
  };

  const toggleFailure = (index: number) => {
    if (isEditing) return;
    const newFailures = deathSaves.failures >= index + 1 ? index : index + 1;
    onChange({ ...deathSaves, failures: newFailures });
  };

  const reset = () => {
    onChange({ successes: 0, failures: 0 });
  };

  return (
    <Card className="stat-card p-3" data-testid="stat-death-saves">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Skull className="w-5 h-5 text-muted-foreground" />
          <span className="font-semibold text-sm">Спасброски от смерти</span>
        </div>
        {!isEditing && (deathSaves.successes > 0 || deathSaves.failures > 0) && (
          <Button variant="ghost" size="sm" onClick={reset} className="h-6 text-xs" data-testid="button-reset-death-saves">
            Сброс
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Успехи</span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                onClick={() => toggleSuccess(i)}
                className={`w-5 h-5 rounded-full border-2 transition-colors ${
                  deathSaves.successes > i
                    ? 'bg-green-500 border-green-500'
                    : 'border-muted-foreground/30 hover:border-green-500'
                }`}
                disabled={isEditing}
                data-testid={`button-death-success-${i}`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Провалы</span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                onClick={() => toggleFailure(i)}
                className={`w-5 h-5 rounded-full border-2 transition-colors ${
                  deathSaves.failures > i
                    ? 'bg-red-500 border-red-500'
                    : 'border-muted-foreground/30 hover:border-red-500'
                }`}
                disabled={isEditing}
                data-testid={`button-death-failure-${i}`}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function CombatStats({ character, onChange, isEditing }: CombatStatsProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <StatBox
          icon={Shield}
          label="Класс Доспеха"
          value={character.armorClass}
          tooltip="Класс Доспеха (КД) определяет, насколько сложно попасть по персонажу атакой. Чем выше КД, тем сложнее нанести урон."
          onChange={(value) => onChange({ armorClass: value })}
          isEditing={isEditing}
          testId="stat-ac"
        />
        <StatBox
          icon={Zap}
          label="Инициатива"
          value={character.initiative}
          tooltip="Инициатива определяет порядок действий в бою. Рассчитывается как модификатор Ловкости плюс возможные бонусы."
          onChange={(value) => onChange({ initiative: value })}
          isEditing={isEditing}
          testId="stat-initiative"
        />
        <StatBox
          icon={Footprints}
          label="Скорость"
          value={character.speed}
          tooltip="Скорость показывает, сколько футов персонаж может пройти за один ход. Стандартная скорость человека — 30 футов."
          onChange={(value) => onChange({ speed: value })}
          isEditing={isEditing}
          testId="stat-speed"
        />
      </div>

      <HpTracker
        current={character.currentHp}
        max={character.maxHp}
        temp={character.tempHp}
        onChange={onChange}
        isEditing={isEditing}
      />

      <DeathSavesTracker
        deathSaves={character.deathSaves}
        onChange={(deathSaves) => onChange({ deathSaves })}
        isEditing={isEditing}
      />

      {isEditing && (
        <Card className="stat-card p-3" data-testid="stat-hit-dice">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm">Кубики хитов</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Тип</label>
              <Input
                value={character.hitDice}
                onChange={(e) => onChange({ hitDice: e.target.value })}
                className="h-8 text-center"
                placeholder="1d10"
                data-testid="input-hit-dice"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Осталось</label>
              <Input
                type="number"
                value={character.hitDiceRemaining}
                onChange={(e) => onChange({ hitDiceRemaining: parseInt(e.target.value) || 0 })}
                className="h-8 text-center"
                data-testid="input-hit-dice-remaining"
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
