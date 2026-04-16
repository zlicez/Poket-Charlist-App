import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Button } from "@/components/ui/button";
import { HelpTooltip, TooltipBody } from "@/components/ui/help-tooltip";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Footprints, Heart, Skull, Plus, Minus, Dice6, Check, X, RotateCcw } from "lucide-react";
import {
  HP_TOOLTIP,
  TEMP_HP_TOOLTIP,
  DEATH_SAVES_TOOLTIP,
  HIT_DICE_TOOLTIP,
} from "@/lib/tooltip-content";
import { calculateModifier, formatModifier, calculateAC, calculateMaxHp, CLASS_DATA, getRacialBonuses, getCharacterClasses, getMulticlassHitDice, getTotalLevel } from "@shared/schema";
import type { Character, DeathSaves, ArmorData } from "@shared/schema";

interface HpTrackerProps {
  current: number;
  max: number;
  calculatedMax: number;
  customMaxHpBonus: number;
  isAutoCalc: boolean;
  temp: number;
  onChange: (updates: { currentHp?: number; maxHp?: number; customMaxHpBonus?: number; tempHp?: number }) => void;
  isEditing: boolean;
}

interface CombatStatsProps {
  character: Character;
  onChange: (updates: Partial<Character>) => void;
  isEditing: boolean;
  hideDeathSaves?: boolean;
  hideHp?: boolean;
}

export function HpTracker({
  current,
  max,
  calculatedMax,
  customMaxHpBonus,
  isAutoCalc,
  temp,
  onChange,
  isEditing
}: HpTrackerProps) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  const tempPercentage = Math.max(0, Math.min(100 - percentage, (temp / max) * 100));

  const adjustHp = (delta: number) => {
    const newHp = Math.min(max, Math.max(0, current + delta));
    onChange({ currentHp: newHp });
  };

  return (
    <Card className="stat-card-primary p-3" data-testid="stat-hp">
      <div className="flex items-center gap-2 mb-2">
        <Heart className="w-5 h-5 text-negative" />
        <span className="font-semibold text-sm">Хиты</span>
        <HelpTooltip
          content={<TooltipBody title={HP_TOOLTIP.title} lines={HP_TOOLTIP.lines} />}
          side="right"
        />
        {temp > 0 && (
          <span className="text-xs text-info font-mono ml-auto">+{temp} врем.</span>
        )}
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
        isAutoCalc ? (
          <div className="grid grid-cols-4 gap-1.5 mt-2">
            <div>
              <label className="text-xs text-muted-foreground">Текущие</label>
              <NumericInput
                value={current}
                min={0}
                max={max}
                onChange={(v) => onChange({ currentHp: v })}
                className="h-10 text-center font-mono"
                data-testid="input-current-hp"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Расч.</label>
              <div className="h-10 flex items-center justify-center font-mono text-sm border rounded-md bg-muted/50 text-muted-foreground" data-testid="display-calc-hp">
                {calculatedMax}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Бонус</label>
              <NumericInput
                value={customMaxHpBonus}
                onChange={(v) => onChange({ customMaxHpBonus: v })}
                className="h-10 text-center font-mono"
                data-testid="input-max-hp-bonus"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs text-muted-foreground">
                Врем.
                <HelpTooltip
                  content={<TooltipBody title={TEMP_HP_TOOLTIP.title} lines={TEMP_HP_TOOLTIP.lines} />}
                  side="top"
                  iconSize="xs"
                />
              </label>
              <NumericInput
                value={temp}
                min={0}
                onChange={(v) => onChange({ tempHp: v })}
                className="h-10 text-center font-mono"
                data-testid="input-temp-hp"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div>
              <label className="text-xs text-muted-foreground">Текущие</label>
              <NumericInput
                value={current}
                min={0}
                max={max}
                onChange={(v) => onChange({ currentHp: v })}
                className="h-10 text-center font-mono"
                data-testid="input-current-hp"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Макс.</label>
              <NumericInput
                value={max}
                min={1}
                onChange={(v) => onChange({ maxHp: v })}
                className="h-10 text-center font-mono"
                data-testid="input-max-hp"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs text-muted-foreground">
                Врем.
                <HelpTooltip
                  content={<TooltipBody title={TEMP_HP_TOOLTIP.title} lines={TEMP_HP_TOOLTIP.lines} />}
                  side="top"
                  iconSize="xs"
                />
              </label>
              <NumericInput
                value={temp}
                min={0}
                onChange={(v) => onChange({ tempHp: v })}
                className="h-10 text-center font-mono"
                data-testid="input-temp-hp"
              />
            </div>
          </div>
        )
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

export function DeathSavesTracker({ 
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
          <Skull className={`w-5 h-5 shrink-0 ${isDead ? 'text-negative' : isStabilized ? 'text-positive' : 'text-muted-foreground'}`} />
          <span className="font-semibold text-sm">Спасброски от смерти</span>
          <HelpTooltip
            content={<TooltipBody title={DEATH_SAVES_TOOLTIP.title} lines={DEATH_SAVES_TOOLTIP.lines} />}
            side="top"
          />
          <div className="w-[120px] shrink-0 flex items-center">
            {isDead ? (
              <Badge variant="default" className="text-xs h-5 px-1.5 bg-negative text-primary-foreground">Мёртв</Badge>
            ) : isStabilized ? (
              <Badge variant="default" className="text-xs h-5 px-1.5 bg-positive text-primary-foreground">Стабилизирован</Badge>
            ) : null}
          </div>
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
            <span className="text-xs font-medium">Успехи</span>
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
            <span className="text-xs font-medium">Провалы</span>
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

export function CombatStats({ character, onChange, isEditing, hideDeathSaves, hideHp }: CombatStatsProps) {
  const racialBonuses = getRacialBonuses(
    character.race,
    character.subrace,
    character.selectedRacialAbilityBonuses,
  );
  const totalDex = character.abilityScores.DEX + (racialBonuses.DEX || 0) + (character.customAbilityBonuses?.DEX || 0);
  const dexMod = calculateModifier(totalDex);
  const totalCon = character.abilityScores.CON + (racialBonuses.CON || 0) + (character.customAbilityBonuses?.CON || 0);
  const conMod = calculateModifier(totalCon);
  const charClasses = getCharacterClasses(character);
  const totalLevel = getTotalLevel(charClasses);
  const multiHitDice = getMulticlassHitDice(charClasses);
  const primaryClass = charClasses[0]?.name || character.class;
  const isLevel1 = totalLevel === 1;
  const calculatedMaxHp = calculateMaxHp(primaryClass, 1, conMod);
  const effectiveMaxHp = isLevel1
    ? calculatedMaxHp + (character.customMaxHpBonus || 0)
    : character.maxHp;
  
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
  const effectiveDexBonus = armorData
    ? (armorData.maxDexBonus === null ? dexMod : armorData.maxDexBonus === 0 ? 0 : Math.min(dexMod, armorData.maxDexBonus))
    : dexMod;
  const armorTypeLabel = armorData
    ? ({ none: "Без брони", light: "Лёгкий", medium: "Средний (макс. ЛОВ +2)", heavy: "Тяжёлый (ЛОВ не учит.)", shield: "" } as const)[armorData.type] ?? "Без брони"
    : "Без брони";
  const compactSummary = hideHp && hideDeathSaves;

  if (compactSummary) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
        <Card className="stat-card-primary p-3 text-center" data-testid="stat-ac">
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-accent shrink-0" />
            <span className="tx-l4">КД</span>
            <HelpTooltip
              side="bottom"
              content={
                <div className="space-y-0.5">
                  <p className="font-medium text-sm">Класс Доспеха</p>
                  <p className="text-xs text-muted-foreground">Тип: {armorTypeLabel}</p>
                  <p className="text-xs text-muted-foreground">Базовый: {armorData ? armorData.baseAC : 10}</p>
                  {(armorData?.type !== "heavy") && <p className="text-xs text-muted-foreground">ЛОВ: {formatModifier(effectiveDexBonus)}</p>}
                  {hasShield && <p className="text-xs text-muted-foreground">Щит: +2</p>}
                  {(character.customACBonus || 0) !== 0 && <p className="text-xs text-muted-foreground">Бонус: {formatModifier(character.customACBonus || 0)}</p>}
                </div>
              }
            />
          </div>
          <div className="mt-3 flex flex-col items-center gap-2">
            <div className="tx-l1 font-mono">{calculatedAC}</div>
            {isEditing ? (
              <div className="space-y-1">
                <label className="tx-l4">Бонус</label>
                <NumericInput
                  value={character.customACBonus || 0}
                  onChange={(v) => onChange({ customACBonus: v })}
                  className="h-10 w-16 text-sm font-mono text-center mx-auto"
                  data-testid="input-ac-bonus"
                />
              </div>
            ) : (
              <div className="tx-l4 w-full truncate text-center">
                {armorData ? armorData.name : "Без брони"}
                {hasShield ? " + Щит" : ""}
              </div>
            )}
          </div>
        </Card>

        <Card className="stat-card-primary p-3 text-center" data-testid="stat-initiative">
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-accent shrink-0" />
            <span className="tx-l4">Инициатива</span>
            <HelpTooltip
              side="bottom"
              content={
                <div className="space-y-0.5">
                  <p className="font-medium text-sm">Инициатива</p>
                  <p className="text-xs text-muted-foreground">Определяет порядок ходов в бою.</p>
                  <p className="text-xs text-muted-foreground">Модификатор ЛОВ: {formatModifier(dexMod)}</p>
                  {(character.customInitiativeBonus || 0) !== 0 && <p className="text-xs text-muted-foreground">Бонус: {formatModifier(character.customInitiativeBonus || 0)}</p>}
                </div>
              }
            />
          </div>
          <div className="mt-3 flex flex-col items-center gap-2">
            <div className={`tx-l1 font-mono ${calculatedInitiative >= 0 ? 'text-positive' : 'text-negative'}`}>
              {formatModifier(calculatedInitiative)}
            </div>
            {isEditing ? (
              <div className="space-y-1">
                <label className="tx-l4">Бонус</label>
                <NumericInput
                  value={character.customInitiativeBonus || 0}
                  onChange={(v) => onChange({ customInitiativeBonus: v })}
                  className="h-10 w-16 text-sm font-mono text-center mx-auto"
                  data-testid="input-initiative-bonus"
                />
              </div>
            ) : (
              <div className="tx-l4 text-center">ЛОВ: {formatModifier(dexMod)}</div>
            )}
          </div>
        </Card>

        <Card className="stat-card-primary p-3 text-center" data-testid="stat-speed">
          <div className="flex items-center justify-center gap-2">
            <Footprints className="w-4 h-4 text-accent shrink-0" />
            <span className="tx-l4">Скорость</span>
            <HelpTooltip
              side="bottom"
              content={
                <div className="space-y-0.5">
                  <p className="font-medium text-sm">Скорость</p>
                  <p className="text-xs text-muted-foreground">Расстояние в футах, которое персонаж может пройти за ход (без спринта).</p>
                  <p className="text-xs text-muted-foreground">Стандартная скорость — 30 футов. Зависит от расы.</p>
                </div>
              }
            />
          </div>
          <div className="mt-3 flex flex-col items-center gap-2">
            {isEditing ? (
              <NumericInput
                value={character.speed}
                min={0}
                onChange={(v) => onChange({ speed: v })}
                className="h-10 w-20 text-base font-bold font-mono text-center mx-auto"
                data-testid="input-speed"
              />
            ) : (
              <div className="tx-l1 font-mono">{character.speed}</div>
            )}
            <div className="tx-l4 text-center">футов за ход</div>
          </div>
        </Card>

        <Card className="stat-card p-3" data-testid="stat-hit-dice">
          <div className="flex items-center gap-2">
            <Dice6 className="w-4 h-4 text-accent shrink-0" />
            <span className="tx-l4">Кубики хитов</span>
            <HelpTooltip
              content={<TooltipBody title={HIT_DICE_TOOLTIP.title} lines={HIT_DICE_TOOLTIP.lines} />}
              side="top"
            />
          </div>
          <div className="mt-3 space-y-3">
            <div className="tx-l1 font-mono">
              {character.hitDiceRemaining} / {totalLevel}
            </div>
            <div className="flex flex-wrap gap-1">
              {multiHitDice.map((hd, i) => (
                <Badge key={i} variant="secondary" className="text-[10px] sm:text-xs font-mono">
                  {hd.count}{hd.dice}
                </Badge>
              ))}
            </div>
            {!isEditing && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => onChange({ hitDiceRemaining: Math.max(0, character.hitDiceRemaining - 1) })}
                  disabled={character.hitDiceRemaining <= 0}
                  data-testid="button-hit-dice-minus"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => onChange({ hitDiceRemaining: Math.min(totalLevel, character.hitDiceRemaining + 1) })}
                  disabled={character.hitDiceRemaining >= totalLevel}
                  data-testid="button-hit-dice-plus"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <Card className="stat-card-primary p-3 text-center" data-testid="stat-ac">
          <div className="flex items-center justify-center gap-1.5">
            <Shield className="w-5 h-5 text-accent" />
            <HelpTooltip
              side="right"
              content={
                <div className="space-y-0.5">
                  <p className="font-medium text-sm">Класс Доспеха</p>
                  <p className="text-xs text-muted-foreground">Тип: {armorTypeLabel}</p>
                  <p className="text-xs text-muted-foreground">Базовый: {armorData ? armorData.baseAC : 10}</p>
                  {(armorData?.type !== "heavy") && <p className="text-xs text-muted-foreground">ЛОВ: {formatModifier(effectiveDexBonus)}</p>}
                  {hasShield && <p className="text-xs text-muted-foreground">Щит: +2</p>}
                  {(character.customACBonus || 0) !== 0 && <p className="text-xs text-muted-foreground">Бонус: {formatModifier(character.customACBonus || 0)}</p>}
                </div>
              }
            />
          </div>
          <div className="text-xs text-muted-foreground">КД</div>
          <div className="text-2xl font-bold font-mono">{calculatedAC}</div>
          {isEditing && (
            <div className="mt-1">
              <label className="text-xs text-muted-foreground">Бонус</label>
              <NumericInput
                value={character.customACBonus || 0}
                onChange={(v) => onChange({ customACBonus: v })}
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

        <Card className="stat-card-primary p-3 text-center" data-testid="stat-initiative">
          <div className="flex items-center justify-center gap-1.5">
            <Zap className="w-5 h-5 text-accent" />
            <HelpTooltip
              side="right"
              content={
                <div className="space-y-0.5">
                  <p className="font-medium text-sm">Инициатива</p>
                  <p className="text-xs text-muted-foreground">Определяет порядок ходов в бою.</p>
                  <p className="text-xs text-muted-foreground">Модификатор ЛОВ: {formatModifier(dexMod)}</p>
                  {(character.customInitiativeBonus || 0) !== 0 && <p className="text-xs text-muted-foreground">Бонус: {formatModifier(character.customInitiativeBonus || 0)}</p>}
                </div>
              }
            />
          </div>
          <div className="text-xs text-muted-foreground">Иниц.</div>
          <div className={`text-2xl font-bold font-mono ${calculatedInitiative >= 0 ? 'text-positive' : 'text-negative'}`}>
            {formatModifier(calculatedInitiative)}
          </div>
          {isEditing && (
            <div className="mt-1">
              <label className="text-xs text-muted-foreground">Бонус</label>
              <NumericInput
                value={character.customInitiativeBonus || 0}
                onChange={(v) => onChange({ customInitiativeBonus: v })}
                className="text-center text-sm h-10 w-14 mx-auto font-mono"
                data-testid="input-initiative-bonus"
              />
            </div>
          )}
        </Card>

        <Card className="stat-card-primary p-3 text-center" data-testid="stat-speed">
          <div className="flex items-center justify-center gap-1.5">
            <Footprints className="w-5 h-5 text-accent" />
            <HelpTooltip
              side="right"
              content={
                <div className="space-y-0.5">
                  <p className="font-medium text-sm">Скорость</p>
                  <p className="text-xs text-muted-foreground">Расстояние в футах за ход (без спринта).</p>
                  <p className="text-xs text-muted-foreground">Стандартная скорость — 30 футов. Зависит от расы.</p>
                </div>
              }
            />
          </div>
          <div className="text-xs text-muted-foreground">Скор.</div>
          {isEditing ? (
            <NumericInput
              value={character.speed}
              min={0}
              onChange={(v) => onChange({ speed: v })}
              className="text-center text-base font-bold h-10 mt-1 w-20 mx-auto font-mono"
              data-testid="input-speed"
            />
          ) : (
            <div className="text-2xl font-bold font-mono">{character.speed}</div>
          )}
        </Card>
      </div>

      <div className={`grid ${hideHp ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-3`}>
        {!hideHp && (
          <HpTracker
            current={character.currentHp}
            max={effectiveMaxHp}
            calculatedMax={calculatedMaxHp}
            customMaxHpBonus={character.customMaxHpBonus || 0}
            isAutoCalc={isLevel1}
            temp={character.tempHp}
            onChange={onChange}
            isEditing={isEditing}
          />
        )}

        <Card className="stat-card p-3" data-testid="stat-hit-dice">
          <div className="flex items-center gap-2 mb-2">
            <Dice6 className="w-5 h-5 text-accent" />
            <span className="font-semibold text-sm">Кубики хитов</span>
            <HelpTooltip
              content={<TooltipBody title={HIT_DICE_TOOLTIP.title} lines={HIT_DICE_TOOLTIP.lines} />}
              side="top"
            />
            <div className="ml-auto flex gap-1">
              {multiHitDice.map((hd, i) => (
                <Badge key={i} variant="secondary" className="text-xs font-mono">
                  {hd.count}{hd.dice}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-mono">
              {character.hitDiceRemaining} / {totalLevel}
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
                  onClick={() => onChange({ hitDiceRemaining: Math.min(totalLevel, character.hitDiceRemaining + 1) })}
                  disabled={character.hitDiceRemaining >= totalLevel}
                  data-testid="button-hit-dice-plus"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {!hideDeathSaves && (
        <DeathSavesTracker
          deathSaves={character.deathSaves}
          onChange={(deathSaves) => onChange({ deathSaves })}
          isEditing={isEditing}
        />
      )}
    </div>
  );
}
