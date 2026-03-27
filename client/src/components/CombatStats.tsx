import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Footprints, Heart, Skull, Plus, Minus, Dice6, Check, X, RotateCcw } from "lucide-react";
import { calculateModifier, formatModifier, calculateAC, CLASS_DATA, getRacialBonuses } from "@shared/schema";
import type { Character, DeathSaves, ArmorData } from "@shared/schema";

interface CombatStatsProps {
  character: Character;
  onChange: (updates: Partial<Character>) => void;
  isEditing: boolean;
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
    <Card className="stat-card-primary p-3" data-testid="stat-hp">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-negative" />
          <span className="font-semibold text-sm">Хиты</span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="text-xs font-mono">
              {temp > 0 && <span className="text-info mr-1">+{temp}</span>}
              {current}/{max}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Текущие / Максимальные хиты</p>
            {temp > 0 && <p className="text-info">Временные хиты: {temp}</p>}
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
        <div className="absolute inset-0 flex items-center justify-center text-destructive-foreground text-sm font-bold font-mono drop-shadow">
          {current} / {max}
        </div>
      </div>

      {isEditing ? (
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div>
            <label className="text-xs text-muted-foreground">Текущие</label>
            <Input
              type="number"
              inputMode="numeric"
              value={current}
              onChange={(e) => onChange({ currentHp: parseInt(e.target.value) || 0 })}
              className="h-10 text-center font-mono"
              data-testid="input-current-hp"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Макс.</label>
            <Input
              type="number"
              inputMode="numeric"
              value={max}
              onChange={(e) => onChange({ maxHp: parseInt(e.target.value) || 0 })}
              className="h-10 text-center font-mono"
              data-testid="input-max-hp"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Врем.</label>
            <Input
              type="number"
              inputMode="numeric"
              value={temp}
              onChange={(e) => onChange({ tempHp: parseInt(e.target.value) || 0 })}
              className="h-10 text-center font-mono"
              data-testid="input-temp-hp"
            />
          </div>
        </div>
      ) : (
        <div className="flex justify-center gap-3">
          <Button 
            variant="outline" 
            size="icon"
            className="h-10 w-10 sm:h-9 sm:w-9"
            onClick={() => adjustHp(-1)}
            data-testid="button-hp-minus"
          >
            <Minus className="w-5 h-5" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            className="h-10 w-10 sm:h-9 sm:w-9"
            onClick={() => adjustHp(1)}
            data-testid="button-hp-plus"
          >
            <Plus className="w-5 h-5" />
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

  const isStabilized = deathSaves.successes >= 3;
  const isDead = deathSaves.failures >= 3;

  return (
    <Card className={`stat-card p-3 transition-colors ${isStabilized ? 'ring-2 ring-positive/50' : ''} ${isDead ? 'ring-2 ring-negative/50' : ''}`} data-testid="stat-death-saves">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Skull className={`w-5 h-5 ${isDead ? 'text-negative' : isStabilized ? 'text-positive' : 'text-muted-foreground'}`} />
          <span className="font-semibold text-sm">Спасброски от смерти</span>
          {isStabilized && (
            <Badge variant="default" className="text-xs h-5 px-1.5 bg-positive text-primary-foreground">Стабилизирован</Badge>
          )}
          {isDead && (
            <Badge variant="default" className="text-xs h-5 px-1.5 bg-negative text-primary-foreground">Мёртв</Badge>
          )}
        </div>
        {!isEditing && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={reset} 
            className={`h-9 w-9 sm:h-7 sm:w-7 ${deathSaves.successes === 0 && deathSaves.failures === 0 ? 'invisible' : ''}`}
            disabled={deathSaves.successes === 0 && deathSaves.failures === 0}
            data-testid="button-reset-death-saves"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-positive" />
            <span className="text-sm font-medium">Успехи</span>
          </div>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => {
              const isActive = deathSaves.successes > i;
              return (
                <button
                  key={i}
                  onClick={() => toggleSuccess(i)}
                  className={`w-10 h-10 sm:w-9 sm:h-9 rounded-lg border-2 transition-all flex items-center justify-center ${
                    isActive
                      ? 'bg-positive border-positive text-primary-foreground shadow-md'
                      : 'border-positive/30 hover:border-positive hover:bg-positive-muted'
                  } ${!isEditing ? 'active:scale-95' : 'opacity-50 cursor-not-allowed'}`}
                  disabled={isEditing}
                  data-testid={`button-death-success-${i}`}
                >
                  {isActive && <Check className="w-5 h-5" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <X className="w-4 h-4 text-negative" />
            <span className="text-sm font-medium">Провалы</span>
          </div>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => {
              const isActive = deathSaves.failures > i;
              return (
                <button
                  key={i}
                  onClick={() => toggleFailure(i)}
                  className={`w-10 h-10 sm:w-9 sm:h-9 rounded-lg border-2 transition-all flex items-center justify-center ${
                    isActive
                      ? 'bg-negative border-negative text-primary-foreground shadow-md'
                      : 'border-negative/30 hover:border-negative hover:bg-negative-muted'
                  } ${!isEditing ? 'active:scale-95' : 'opacity-50 cursor-not-allowed'}`}
                  disabled={isEditing}
                  data-testid={`button-death-failure-${i}`}
                >
                  {isActive && <X className="w-5 h-5" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function CombatStats({ character, onChange, isEditing }: CombatStatsProps) {
  const racialBonuses = getRacialBonuses(character.race, character.subrace);
  const totalDex = character.abilityScores.DEX + (racialBonuses.DEX || 0) + (character.customAbilityBonuses?.DEX || 0);
  const dexMod = calculateModifier(totalDex);
  const classData = CLASS_DATA[character.class];
  
  const equippedArmor = character.equipment.find(e => e.equipped && e.isArmor && e.armorType !== "shield");
  const hasShield = character.equipment.some(e => e.equipped && e.isArmor && e.armorType === "shield");
  
  let armorData: ArmorData | null = null;
  if (equippedArmor && equippedArmor.armorBaseAC !== undefined) {
    armorData = {
      name: equippedArmor.name,
      type: equippedArmor.armorType || "none",
      baseAC: equippedArmor.armorBaseAC,
      maxDexBonus: equippedArmor.armorMaxDexBonus ?? null,
      stealthDisadvantage: false
    };
  }
  
  const calculatedAC = calculateAC(dexMod, armorData, hasShield, character.customACBonus || 0);
  const calculatedInitiative = dexMod + (character.customInitiativeBonus || 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="stat-card-primary p-3 text-center" data-testid="stat-ac">
              <Shield className="w-5 h-5 mx-auto mb-1 text-accent" />
              <div className="text-xs text-muted-foreground">КД</div>
              <div className="text-2xl font-bold font-mono">{calculatedAC}</div>
              {isEditing && (
                <div className="mt-1">
                  <label className="text-xs text-muted-foreground">Бонус</label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={character.customACBonus || 0}
                    onChange={(e) => onChange({ customACBonus: parseInt(e.target.value) || 0 })}
                    className="text-center text-sm h-10 w-14 mx-auto font-mono"
                    data-testid="input-ac-bonus"
                  />
                </div>
              )}
              {!isEditing && (
                <div className="text-xs text-muted-foreground mt-1 truncate">
                  {armorData ? armorData.name : 'Без'}
                  {hasShield && ' +Щит'}
                </div>
              )}
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Класс Доспеха</p>
            <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
              <p>Базовый: {armorData ? armorData.baseAC : 10}</p>
              <p>ЛОВ: {formatModifier(dexMod)}</p>
              {hasShield && <p>Щит: +2</p>}
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="stat-card-primary p-3 text-center" data-testid="stat-initiative">
              <Zap className="w-5 h-5 mx-auto mb-1 text-accent" />
              <div className="text-xs text-muted-foreground">Иниц.</div>
              <div className={`text-2xl font-bold font-mono ${calculatedInitiative >= 0 ? 'text-positive' : 'text-negative'}`}>
                {formatModifier(calculatedInitiative)}
              </div>
              {isEditing && (
                <div className="mt-1">
                  <label className="text-xs text-muted-foreground">Бонус</label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={character.customInitiativeBonus || 0}
                    onChange={(e) => onChange({ customInitiativeBonus: parseInt(e.target.value) || 0 })}
                    className="text-center text-sm h-10 w-14 mx-auto font-mono"
                    data-testid="input-initiative-bonus"
                  />
                </div>
              )}
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Инициатива определяет порядок действий в бою</p>
            <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
              <p>Модификатор ЛОВ: {formatModifier(dexMod)}</p>
              {(character.customInitiativeBonus || 0) !== 0 && <p>Бонус: {formatModifier(character.customInitiativeBonus || 0)}</p>}
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="stat-card-primary p-3 text-center" data-testid="stat-speed">
              <Footprints className="w-5 h-5 mx-auto mb-1 text-accent" />
              <div className="text-xs text-muted-foreground">Скор.</div>
              {isEditing ? (
                <Input
                  type="number"
                  inputMode="numeric"
                  value={character.speed}
                  onChange={(e) => onChange({ speed: parseInt(e.target.value) || 30 })}
                  className="text-center text-base font-bold h-10 mt-1 font-mono"
                  data-testid="input-speed"
                />
              ) : (
                <div className="text-2xl font-bold font-mono">{character.speed}</div>
              )}
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Скорость (футов/ход)</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <Card className="stat-card p-3" data-testid="stat-hit-dice">
        <div className="flex items-center gap-2 mb-2">
          <Dice6 className="w-5 h-5 text-accent" />
          <span className="font-semibold text-sm">Кубики хитов</span>
          <Badge variant="secondary" className="ml-auto text-xs font-mono">
            {classData ? classData.hitDice : 'd10'}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground font-mono">
            {character.hitDiceRemaining} / {character.level}
          </span>
          {!isEditing && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 sm:h-9 sm:w-9"
                onClick={() => onChange({ hitDiceRemaining: Math.max(0, character.hitDiceRemaining - 1) })}
                disabled={character.hitDiceRemaining <= 0}
                data-testid="button-hit-dice-minus"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 sm:h-9 sm:w-9"
                onClick={() => onChange({ hitDiceRemaining: Math.min(character.level, character.hitDiceRemaining + 1) })}
                disabled={character.hitDiceRemaining >= character.level}
                data-testid="button-hit-dice-plus"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </Card>

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
    </div>
  );
}
