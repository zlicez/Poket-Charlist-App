import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { CharacterHeader } from "@/components/CharacterHeader";
import { AbilityWithSkills } from "@/components/AbilityWithSkills";
import { CombatStats } from "@/components/CombatStats";
import { SavingThrowsComponent } from "@/components/SavingThrows";
import { WeaponsList } from "@/components/WeaponsList";
import { FeaturesList } from "@/components/FeaturesList";
import { EquipmentSystem } from "@/components/EquipmentSystem";
import { MoneyBlock } from "@/components/MoneyBlock";
import { ProficienciesSection } from "@/components/ProficienciesSection";
import { DiceRoller, DiceRollerTrigger, rollDice, type DiceRoll } from "@/components/DiceRoller";
import { useTheme } from "@/components/ThemeProvider";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { isUnauthorizedError } from "@/lib/auth-utils";
import { 
  ABILITY_NAMES, 
  ABILITY_LABELS,
  SKILLS_BY_ABILITY,
  calculateModifier, 
  getProficiencyBonus,
  formatModifier,
  getRacialBonuses,
  type Character, 
  type AbilityName,
  type SkillProficiency,
  type Weapon,
  type Money,
  type Equipment
} from "@shared/schema";
import { ArrowLeft, Moon, Sun, Save, StickyNote, User, Users, Flag } from "lucide-react";

function deepMerge(target: any, source: any): any {
  const result = { ...target };
  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = target[key];
    if (
      sourceValue !== null &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue !== null &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(targetValue, sourceValue);
    } else {
      result[key] = sourceValue;
    }
  }
  return result;
}

export default function CharacterSheet() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isDiceRollerOpen, setIsDiceRollerOpen] = useState(false);
  const [rollHistory, setRollHistory] = useState<DiceRoll[]>([]);
  const [localChanges, setLocalChanges] = useState<Partial<Character>>({});

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      toast({ 
        title: "Требуется авторизация", 
        description: "Перенаправление на страницу входа...",
        variant: "destructive"
      });
      setTimeout(() => { window.location.href = "/api/login"; }, 500);
    }
  }, [isAuthenticated, isAuthLoading, toast]);

  const { data: character, isLoading, error } = useQuery<Character>({
    queryKey: ['/api/characters', id],
    enabled: !!id && isAuthenticated,
  });

  const pendingChangesRef = useRef<Partial<Character>>({});
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Character>) => {
      return apiRequest('PATCH', `/api/characters/${id}`, updates);
    },
    onMutate: async (updates: Partial<Character>) => {
      await queryClient.cancelQueries({ queryKey: ['/api/characters', id] });
      const previousCharacter = queryClient.getQueryData<Character>(['/api/characters', id]);
      if (previousCharacter) {
        const optimisticCharacter = deepMerge(previousCharacter, updates);
        queryClient.setQueryData(['/api/characters', id], optimisticCharacter);
      }
      return { previousCharacter };
    },
    onError: (err, updates, context) => {
      if (context?.previousCharacter) {
        queryClient.setQueryData(['/api/characters', id], context.previousCharacter);
      }
      toast({ 
        title: "Ошибка", 
        description: "Не удалось сохранить изменения",
        variant: "destructive"
      });
    },
    onSettled: () => {
      isSavingRef.current = false;
    },
  });

  const flushPendingChanges = useCallback(() => {
    if (Object.keys(pendingChangesRef.current).length > 0 && !isSavingRef.current) {
      isSavingRef.current = true;
      const changes = pendingChangesRef.current;
      pendingChangesRef.current = {};
      updateMutation.mutate(changes);
    }
  }, [updateMutation]);

  const scheduleSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      flushPendingChanges();
    }, 500);
  }, [flushPendingChanges]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (Object.keys(pendingChangesRef.current).length > 0) {
        flushPendingChanges();
      }
    };
  }, [flushPendingChanges]);

  const currentCharacter = character ? deepMerge(character, localChanges) as Character : null;

  const handleChange = useCallback((updates: Partial<Character>) => {
    if (isEditing) {
      setLocalChanges(prev => deepMerge(prev, updates));
    } else {
      if (character) {
        const optimisticCharacter = deepMerge(character, deepMerge(pendingChangesRef.current, updates));
        queryClient.setQueryData(['/api/characters', id], optimisticCharacter);
      }
      pendingChangesRef.current = deepMerge(pendingChangesRef.current, updates);
      scheduleSave();
    }
  }, [isEditing, character, id, scheduleSave]);

  const saveChanges = async () => {
    if (Object.keys(localChanges).length > 0) {
      await updateMutation.mutateAsync(localChanges);
      setLocalChanges({});
    }
    setIsEditing(false);
  };

  const addRoll = useCallback((roll: DiceRoll) => {
    setRollHistory(prev => [roll, ...prev].slice(0, 50));
  }, []);

  const getAbilityModifier = (ability: AbilityName) => {
    if (!currentCharacter) return 0;
    const baseScore = currentCharacter.abilityScores[ability];
    const racialBonuses = getRacialBonuses(currentCharacter.race, currentCharacter.subrace);
    const racialBonus = racialBonuses[ability] || 0;
    const customBonus = currentCharacter.customAbilityBonuses?.[ability] || 0;
    return calculateModifier(baseScore + racialBonus + customBonus);
  };

  const rollAbility = (ability: AbilityName) => {
    if (!currentCharacter) return;
    const mod = getAbilityModifier(ability);
    const roll = rollDice(
      `Проверка ${ABILITY_LABELS[ability].ru}`,
      "1d20",
      mod,
      [`${ABILITY_LABELS[ability].ru} ${formatModifier(mod)}`]
    );
    addRoll(roll);
    setIsDiceRollerOpen(true);
  };

  const rollSkill = (skillName: string, ability: AbilityName) => {
    if (!currentCharacter) return;
    const abilityMod = getAbilityModifier(ability);
    const profBonus = getProficiencyBonus(currentCharacter.level);
    const proficiency = currentCharacter.skills[skillName] || { proficient: false, expertise: false };
    
    let totalMod = abilityMod;
    const sources: string[] = [`${ability} ${formatModifier(abilityMod)}`];
    
    if (proficiency.expertise) {
      totalMod += profBonus * 2;
      sources.push(`Экспертность +${profBonus * 2}`);
    } else if (proficiency.proficient) {
      totalMod += profBonus;
      sources.push(`Владение +${profBonus}`);
    }

    const roll = rollDice(skillName, "1d20", totalMod, sources);
    addRoll(roll);
    setIsDiceRollerOpen(true);
  };

  const rollSavingThrow = (ability: AbilityName) => {
    if (!currentCharacter) return;
    const abilityMod = getAbilityModifier(ability);
    const profBonus = getProficiencyBonus(currentCharacter.level);
    const isProficient = currentCharacter.savingThrows[ability];
    
    let totalMod = abilityMod;
    const sources: string[] = [`${ability} ${formatModifier(abilityMod)}`];
    
    if (isProficient) {
      totalMod += profBonus;
      sources.push(`Владение +${profBonus}`);
    }

    const roll = rollDice(
      `Спасбросок ${ABILITY_LABELS[ability].ru}`,
      "1d20",
      totalMod,
      sources
    );
    addRoll(roll);
    setIsDiceRollerOpen(true);
  };

  const rollWeaponAttack = (weapon: Weapon, totalAttackBonus: number, isProficient: boolean = true) => {
    if (!currentCharacter) return;
    const profBonus = isProficient ? getProficiencyBonus(currentCharacter.level) : 0;
    const abilityLabel = weapon.abilityMod === "dex" ? "ЛОВ" : "СИЛ";
    const abilityMod = weapon.abilityMod === "dex" 
      ? calculateModifier(currentCharacter.abilityScores.DEX)
      : calculateModifier(currentCharacter.abilityScores.STR);
    
    const roll = rollDice(
      `Атака: ${weapon.name}${!isProficient ? " (без влад.)" : ""}`,
      "1d20",
      totalAttackBonus,
      [
        `${abilityLabel} ${formatModifier(abilityMod)}`,
        `Мастерство +${profBonus}`,
        weapon.attackBonus !== 0 ? `Бонус ${formatModifier(weapon.attackBonus)}` : ""
      ].filter(Boolean)
    );
    addRoll(roll);
    setIsDiceRollerOpen(true);
  };

  const rollWeaponDamage = (weapon: Weapon, damageModifier: number) => {
    const abilityLabel = weapon.abilityMod === "dex" ? "ЛОВ" : "СИЛ";
    const roll = rollDice(
      `Урон: ${weapon.name}`,
      weapon.damage,
      damageModifier,
      [
        weapon.damageType,
        damageModifier !== 0 ? `${abilityLabel} ${formatModifier(damageModifier)}` : ""
      ].filter(Boolean)
    );
    addRoll(roll);
    setIsDiceRollerOpen(true);
  };

  useEffect(() => {
    if (!isEditing && Object.keys(localChanges).length > 0) {
      const timer = setTimeout(() => {
        updateMutation.mutate(localChanges);
        setLocalChanges({});
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [localChanges, isEditing]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto space-y-4">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !currentCharacter) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-6 text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">Персонаж не найден</h2>
          <p className="text-muted-foreground mb-4">
            Возможно, он был удалён или никогда не существовал.
          </p>
          <Button onClick={() => setLocation("/")} data-testid="button-go-home">
            <ArrowLeft className="w-4 h-4 mr-2" />
            К списку персонажей
          </Button>
        </Card>
      </div>
    );
  }

  const racialBonuses = getRacialBonuses(currentCharacter.race, currentCharacter.subrace);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-1 sm:gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-1 sm:gap-2">
            {isEditing && (
              <Button 
                size="sm" 
                onClick={saveChanges}
                disabled={updateMutation.isPending}
                data-testid="button-save"
              >
                <Save className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Сохранить</span>
                <span className="sm:hidden">OK</span>
              </Button>
            )}
            <DiceRollerTrigger 
              onClick={() => setIsDiceRollerOpen(true)} 
              rollCount={rollHistory.length}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-2 sm:p-4">
        <div className="space-y-3 sm:space-y-4">
          <CharacterHeader
            character={currentCharacter}
            onChange={handleChange}
            isEditing={isEditing}
            onToggleMode={() => isEditing ? saveChanges() : setIsEditing(true)}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-4">
            <div className="space-y-2 sm:space-y-3">
              {ABILITY_NAMES.map((ability) => (
                <AbilityWithSkills
                  key={ability}
                  ability={ability}
                  baseScore={currentCharacter.abilityScores[ability]}
                  customBonus={currentCharacter.customAbilityBonuses?.[ability] || 0}
                  race={currentCharacter.race}
                  subrace={currentCharacter.subrace}
                  level={currentCharacter.level}
                  skills={currentCharacter.skills}
                  onScoreChange={(value) => handleChange({
                    abilityScores: { 
                      ...currentCharacter.abilityScores,
                      [ability]: value 
                    }
                  })}
                  onCustomBonusChange={(value) => handleChange({
                    customAbilityBonuses: { 
                      STR: currentCharacter.customAbilityBonuses?.STR || 0,
                      DEX: currentCharacter.customAbilityBonuses?.DEX || 0,
                      CON: currentCharacter.customAbilityBonuses?.CON || 0,
                      INT: currentCharacter.customAbilityBonuses?.INT || 0,
                      WIS: currentCharacter.customAbilityBonuses?.WIS || 0,
                      CHA: currentCharacter.customAbilityBonuses?.CHA || 0,
                      [ability]: value 
                    }
                  })}
                  onSkillProficiencyChange={(skillName, proficiency) => handleChange({
                    skills: { [skillName]: proficiency }
                  })}
                  onRollAbility={() => rollAbility(ability)}
                  onRollSkill={(skillName) => {
                    const skill = SKILLS_BY_ABILITY[ability].find(s => s.name === skillName);
                    if (skill) rollSkill(skillName, skill.ability);
                  }}
                  isEditing={isEditing}
                />
              ))}
            </div>

            <div className="space-y-2 sm:space-y-3">
              <CombatStats
                character={currentCharacter}
                onChange={handleChange}
                isEditing={isEditing}
              />
              <SavingThrowsComponent
                abilityScores={currentCharacter.abilityScores}
                savingThrows={currentCharacter.savingThrows}
                level={currentCharacter.level}
                onChange={(savingThrows) => handleChange({ savingThrows })}
                onRoll={rollSavingThrow}
                isEditing={isEditing}
              />
              <WeaponsList
                weapons={currentCharacter.weapons}
                onChange={(weapons) => handleChange({ weapons })}
                onRollAttack={rollWeaponAttack}
                onRollDamage={rollWeaponDamage}
                isEditing={isEditing}
                isLocked={currentCharacter.weaponsLocked ?? false}
                onToggleLock={() => handleChange({ weaponsLocked: !currentCharacter.weaponsLocked })}
                equippedFromInventory={currentCharacter.equipment}
                strMod={calculateModifier(
                  currentCharacter.abilityScores.STR + 
                  (racialBonuses.STR || 0) + 
                  (currentCharacter.customAbilityBonuses?.STR || 0)
                )}
                dexMod={calculateModifier(
                  currentCharacter.abilityScores.DEX + 
                  (racialBonuses.DEX || 0) + 
                  (currentCharacter.customAbilityBonuses?.DEX || 0)
                )}
                proficiencyBonus={getProficiencyBonus(currentCharacter.level)}
                proficiencies={currentCharacter.proficiencies ?? { languages: [], weapons: [], armor: [], tools: [] }}
              />
              <FeaturesList
                features={currentCharacter.features}
                onChange={(features) => handleChange({ features })}
                isEditing={isEditing}
                isLocked={currentCharacter.featuresLocked ?? false}
                onToggleLock={() => handleChange({ featuresLocked: !currentCharacter.featuresLocked })}
              />
              <ProficienciesSection
                proficiencies={currentCharacter.proficiencies ?? { languages: [], weapons: [], armor: [], tools: [] }}
                onChange={(proficiencies) => handleChange({ proficiencies })}
                isEditing={isEditing}
                race={currentCharacter.race}
                className={currentCharacter.class}
                subrace={currentCharacter.subrace}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
            <div className="space-y-2 sm:space-y-3">
              <MoneyBlock
                money={currentCharacter.money ?? { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }}
                onChange={(money) => handleChange({ money })}
                isEditing={isEditing}
              />
              <EquipmentSystem
                equipment={currentCharacter.equipment}
                onChange={(equipment) => handleChange({ equipment })}
                isEditing={isEditing}
                isLocked={currentCharacter.equipmentLocked ?? false}
                onToggleLock={() => handleChange({ equipmentLocked: !currentCharacter.equipmentLocked })}
                proficiencyBonus={getProficiencyBonus(currentCharacter.level)}
              />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Card className="stat-card p-2 sm:p-3">
                <div className="flex items-center gap-2 mb-2">
                  <StickyNote className="w-4 h-4 text-accent" />
                  <h3 className="font-semibold text-xs sm:text-sm">Заметки</h3>
                </div>
                {isEditing ? (
                  <Textarea
                    value={currentCharacter.notes || ""}
                    onChange={(e) => handleChange({ notes: e.target.value })}
                    placeholder="Записи о персонаже, квестах..."
                    rows={6}
                    className="resize-none text-sm"
                    data-testid="textarea-notes"
                  />
                ) : (
                  <div className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap min-h-[80px] sm:min-h-[100px]">
                    {currentCharacter.notes || "Нет заметок"}
                  </div>
                )}
              </Card>

              <Card className="stat-card p-2 sm:p-3">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-accent" />
                  <h3 className="font-semibold text-xs sm:text-sm">Внешность</h3>
                </div>
                {isEditing ? (
                  <Textarea
                    value={currentCharacter.appearance || ""}
                    onChange={(e) => handleChange({ appearance: e.target.value })}
                    placeholder="Рост, телосложение, особые приметы..."
                    rows={3}
                    className="resize-none text-sm"
                    data-testid="textarea-appearance"
                  />
                ) : (
                  <div className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap min-h-[40px] sm:min-h-[50px]">
                    {currentCharacter.appearance || "Нет описания"}
                  </div>
                )}
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
            <Card className="stat-card p-2 sm:p-3">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-accent" />
                <h3 className="font-semibold text-xs sm:text-sm">Союзники</h3>
              </div>
              {isEditing ? (
                <Textarea
                  value={currentCharacter.allies || ""}
                  onChange={(e) => handleChange({ allies: e.target.value })}
                  placeholder="Друзья, союзники..."
                  rows={3}
                  className="resize-none text-sm"
                  data-testid="textarea-allies"
                />
              ) : (
                <div className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap min-h-[40px] sm:min-h-[50px]">
                  {currentCharacter.allies || "Нет записей"}
                </div>
              )}
            </Card>

            <Card className="stat-card p-2 sm:p-3">
              <div className="flex items-center gap-2 mb-2">
                <Flag className="w-4 h-4 text-accent" />
                <h3 className="font-semibold text-xs sm:text-sm">Фракции</h3>
              </div>
              {isEditing ? (
                <Textarea
                  value={currentCharacter.factions || ""}
                  onChange={(e) => handleChange({ factions: e.target.value })}
                  placeholder="Гильдии, ордены..."
                  rows={3}
                  className="resize-none text-sm"
                  data-testid="textarea-factions"
                />
              ) : (
                <div className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap min-h-[40px] sm:min-h-[50px]">
                  {currentCharacter.factions || "Нет записей"}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      <DiceRoller
        isOpen={isDiceRollerOpen}
        onClose={() => setIsDiceRollerOpen(false)}
        rollHistory={rollHistory}
        onClearHistory={() => setRollHistory([])}
      />
    </div>
  );
}
