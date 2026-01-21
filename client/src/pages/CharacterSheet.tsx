import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CharacterHeader } from "@/components/CharacterHeader";
import { AbilityScore } from "@/components/AbilityScore";
import { SkillItem } from "@/components/SkillItem";
import { CombatStats } from "@/components/CombatStats";
import { SavingThrowsComponent } from "@/components/SavingThrows";
import { WeaponsList } from "@/components/WeaponsList";
import { FeaturesList } from "@/components/FeaturesList";
import { EquipmentList } from "@/components/EquipmentList";
import { DiceRoller, DiceRollerTrigger, rollDice, type DiceRoll } from "@/components/DiceRoller";
import { useTheme } from "@/components/ThemeProvider";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ABILITY_NAMES, 
  SKILLS, 
  ABILITY_LABELS,
  calculateModifier, 
  getProficiencyBonus,
  formatModifier,
  type Character, 
  type AbilityName,
  type SkillProficiency,
  type Weapon
} from "@shared/schema";
import { ArrowLeft, Moon, Sun, Save, StickyNote } from "lucide-react";

export default function CharacterSheet() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isDiceRollerOpen, setIsDiceRollerOpen] = useState(false);
  const [rollHistory, setRollHistory] = useState<DiceRoll[]>([]);
  const [localChanges, setLocalChanges] = useState<Partial<Character>>({});

  const { data: character, isLoading, error } = useQuery<Character>({
    queryKey: ['/api/characters', id],
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Character>) => {
      return apiRequest('PATCH', `/api/characters/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/characters', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/characters'] });
      toast({ title: "Сохранено", description: "Изменения персонажа сохранены" });
    },
    onError: () => {
      toast({ 
        title: "Ошибка", 
        description: "Не удалось сохранить изменения",
        variant: "destructive"
      });
    },
  });

  const currentCharacter = character ? (() => {
    const merged = { ...character };
    for (const key in localChanges) {
      const localValue = (localChanges as any)[key];
      const charValue = (character as any)[key];
      
      if (
        localValue !== null &&
        typeof localValue === 'object' &&
        !Array.isArray(localValue) &&
        charValue !== null &&
        typeof charValue === 'object' &&
        !Array.isArray(charValue)
      ) {
        (merged as any)[key] = { ...charValue, ...localValue };
      } else {
        (merged as any)[key] = localValue;
      }
    }
    return merged as Character;
  })() : null;

  const handleChange = useCallback((updates: Partial<Character>) => {
    setLocalChanges(prev => {
      const newChanges = { ...prev };
      for (const key in updates) {
        const updateValue = (updates as any)[key];
        const prevValue = (prev as any)[key];
        
        if (
          updateValue !== null &&
          typeof updateValue === 'object' &&
          !Array.isArray(updateValue) &&
          prevValue !== null &&
          typeof prevValue === 'object' &&
          !Array.isArray(prevValue)
        ) {
          (newChanges as any)[key] = { ...prevValue, ...updateValue };
        } else {
          (newChanges as any)[key] = updateValue;
        }
      }
      return newChanges;
    });
  }, []);

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

  const rollAbility = (ability: AbilityName) => {
    if (!currentCharacter) return;
    const score = currentCharacter.abilityScores[ability];
    const mod = calculateModifier(score);
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
    const score = currentCharacter.abilityScores[ability];
    const abilityMod = calculateModifier(score);
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
    const score = currentCharacter.abilityScores[ability];
    const abilityMod = calculateModifier(score);
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

  const rollWeaponAttack = (weapon: Weapon) => {
    const roll = rollDice(
      `Атака: ${weapon.name}`,
      "1d20",
      weapon.attackBonus,
      [`Бонус атаки +${weapon.attackBonus}`]
    );
    addRoll(roll);
    setIsDiceRollerOpen(true);
  };

  const rollWeaponDamage = (weapon: Weapon) => {
    const roll = rollDice(
      `Урон: ${weapon.name}`,
      weapon.damage,
      0,
      [weapon.damageType]
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
          <div className="grid grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Назад
          </Button>

          <div className="flex items-center gap-2">
            {isEditing && (
              <Button 
                size="sm" 
                onClick={saveChanges}
                disabled={updateMutation.isPending}
                data-testid="button-save"
              >
                <Save className="w-4 h-4 mr-1" />
                Сохранить
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

      <main className="max-w-6xl mx-auto p-4">
        <div className="space-y-4">
          <CharacterHeader
            character={currentCharacter}
            onChange={handleChange}
            isEditing={isEditing}
            onToggleMode={() => isEditing ? saveChanges() : setIsEditing(true)}
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {ABILITY_NAMES.map((ability) => (
              <AbilityScore
                key={ability}
                ability={ability}
                score={currentCharacter.abilityScores[ability]}
                onChange={(value) => handleChange({
                  abilityScores: {
                    ...currentCharacter.abilityScores,
                    [ability]: value
                  }
                })}
                onRoll={() => rollAbility(ability)}
                isEditing={isEditing}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-4">
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
            </div>

            <Card className="stat-card p-3">
              <h3 className="font-semibold text-sm mb-3">Навыки</h3>
              <ScrollArea className="h-[400px] pr-2">
                <div className="space-y-0.5">
                  {SKILLS.map((skill) => (
                    <SkillItem
                      key={skill.name}
                      name={skill.name}
                      ability={skill.ability}
                      abilityScore={currentCharacter.abilityScores[skill.ability]}
                      level={currentCharacter.level}
                      proficiency={currentCharacter.skills[skill.name] || { proficient: false, expertise: false }}
                      onProficiencyChange={(proficiency: SkillProficiency) => handleChange({
                        skills: {
                          ...currentCharacter.skills,
                          [skill.name]: proficiency
                        }
                      })}
                      onRoll={() => rollSkill(skill.name, skill.ability)}
                      isEditing={isEditing}
                    />
                  ))}
                </div>
              </ScrollArea>
            </Card>

            <div className="space-y-4">
              <WeaponsList
                weapons={currentCharacter.weapons}
                onChange={(weapons) => handleChange({ weapons })}
                onRollAttack={rollWeaponAttack}
                onRollDamage={rollWeaponDamage}
                isEditing={isEditing}
              />
              <FeaturesList
                features={currentCharacter.features}
                onChange={(features) => handleChange({ features })}
                isEditing={isEditing}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EquipmentList
              equipment={currentCharacter.equipment}
              onChange={(equipment) => handleChange({ equipment })}
              isEditing={isEditing}
            />

            <Card className="stat-card p-3">
              <div className="flex items-center gap-2 mb-2">
                <StickyNote className="w-4 h-4 text-accent" />
                <h3 className="font-semibold text-sm">Заметки</h3>
              </div>
              {isEditing ? (
                <Textarea
                  value={currentCharacter.notes || ""}
                  onChange={(e) => handleChange({ notes: e.target.value })}
                  placeholder="Записи о персонаже, союзниках, квестах..."
                  rows={6}
                  className="resize-none"
                  data-testid="textarea-notes"
                />
              ) : (
                <div className="text-sm text-muted-foreground whitespace-pre-wrap min-h-[100px]">
                  {currentCharacter.notes || "Нет заметок"}
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
