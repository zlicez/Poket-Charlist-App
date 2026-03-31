import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CharacterHeader } from "@/components/CharacterHeader";
import { AbilityWithSkills } from "@/components/AbilityWithSkills";
import { CombatStats, DeathSavesTracker, HpTracker } from "@/components/CombatStats";
import { WeaponsList } from "@/components/WeaponsList";
import { FeaturesList } from "@/components/FeaturesList";
import { EquipmentSystem } from "@/components/EquipmentSystem";
import { SpellsSection } from "@/components/SpellsSection";
import { ProficienciesSection } from "@/components/ProficienciesSection";
import { useTheme } from "@/components/ThemeProvider";
import {
  ABILITY_NAMES,
  calculateModifier,
  getProficiencyBonus,
  getRacialBonuses,
  getCharacterClasses,
  hasAnyCasterClass,
  type Character,
} from "@shared/schema";
import { Moon, Sun, ArrowLeft, Swords, Shield, Crosshair, BookOpen, Backpack, Share2, StickyNote, User, Users, Flag } from "lucide-react";

export default function SharedCharacterSheet() {
  const { token } = useParams<{ token: string }>();
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();

  const { data: character, isLoading, error } = useQuery<Character>({
    queryKey: ['/api/shared', token],
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto space-y-4">
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

  if (error || !character) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-6 text-center max-w-md">
          <Share2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold mb-2">Персонаж не найден</h2>
          <p className="text-muted-foreground mb-4">
            Ссылка недействительна или доступ был отключён владельцем.
          </p>
          <Button onClick={() => setLocation("/")} data-testid="button-go-home">
            <ArrowLeft className="w-4 h-4 mr-2" />
            На главную
          </Button>
        </Card>
      </div>
    );
  }

  const racialBonuses = getRacialBonuses(character.race, character.subrace);
  const noop = () => {};

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-1 sm:gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Общий доступ (только просмотр)</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
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

      <nav className="sticky top-[49px] sm:top-[53px] z-40 bg-background/95 backdrop-blur border-b" data-testid="section-nav">
        <div className="max-w-7xl mx-auto px-1 sm:px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-0.5 sm:gap-1 py-1">
            {[
              { id: "section-abilities", label: "Характеристики", icon: Swords },
              { id: "section-combat", label: "Бой", icon: Shield },
              { id: "section-equipment", label: "Оружие", icon: Crosshair },
              ...(character.spellcasting || hasAnyCasterClass(getCharacterClasses(character))
                ? [{ id: "section-spells", label: "Заклинания", icon: BookOpen }]
                : []),
              { id: "section-inventory", label: "Инвентарь", icon: Backpack },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors whitespace-nowrap"
                data-testid={`nav-${id}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-2 sm:p-4">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col lg:flex-row gap-2 sm:gap-4">
            <div className="flex-1 min-w-0">
              <CharacterHeader
                character={character}
                onChange={noop}
                isEditing={false}
              />
            </div>
            <div className="flex flex-col gap-2 sm:gap-3 lg:w-[320px] xl:w-[360px] flex-shrink-0">
              <HpTracker
                current={character.currentHp}
                max={character.maxHp}
                temp={character.tempHp}
                onChange={noop}
                isEditing={false}
              />
              <DeathSavesTracker
                deathSaves={character.deathSaves}
                onChange={noop}
                isEditing={false}
              />
            </div>
          </div>

          <div id="section-abilities" className="scroll-mt-28">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {ABILITY_NAMES.map((ability) => (
                <AbilityWithSkills
                  key={ability}
                  ability={ability}
                  baseScore={character.abilityScores[ability]}
                  customBonus={character.customAbilityBonuses?.[ability] || 0}
                  race={character.race}
                  subrace={character.subrace}
                  level={character.level}
                  skills={character.skills}
                  savingThrowProficient={!!character.savingThrows[ability]}
                  onScoreChange={noop}
                  onCustomBonusChange={noop}
                  onSkillProficiencyChange={noop}
                  onSavingThrowProficiencyChange={noop}
                  onRollAbility={noop}
                  onRollSavingThrow={noop}
                  onRollSkill={noop}
                  isEditing={false}
                />
              ))}
            </div>
          </div>

          <div id="section-combat" className="scroll-mt-28">
            <CombatStats
              character={character}
              onChange={noop}
              isEditing={false}
              hideHp
              hideDeathSaves
            />
          </div>

          <div id="section-equipment" className="scroll-mt-28 space-y-2 sm:space-y-3">
            <WeaponsList
              weapons={character.weapons}
              onChange={noop}
              onRollAttack={noop}
              onRollDamage={noop}
              isEditing={false}
              isLocked={true}
              equippedFromInventory={character.equipment}
              strMod={calculateModifier(
                character.abilityScores.STR +
                (racialBonuses.STR || 0) +
                (character.customAbilityBonuses?.STR || 0)
              )}
              dexMod={calculateModifier(
                character.abilityScores.DEX +
                (racialBonuses.DEX || 0) +
                (character.customAbilityBonuses?.DEX || 0)
              )}
              proficiencyBonus={getProficiencyBonus(character.level)}
              proficiencies={character.proficiencies}
            />

            {character.features.length > 0 && (
              <FeaturesList
                features={character.features}
                onChange={noop}
                isEditing={false}
                isLocked={true}
              />
            )}

            <ProficienciesSection
              proficiencies={character.proficiencies ?? { languages: [], weapons: [], armor: [], tools: [] }}
              onChange={noop}
              isEditing={false}
              race={character.race}
              className={character.class}
              subrace={character.subrace}
            />
          </div>

          {(character.spellcasting || hasAnyCasterClass(getCharacterClasses(character))) && (
            <div id="section-spells" className="scroll-mt-28">
              <SpellsSection
                character={character}
                isEditing={false}
                onChange={noop}
              />
            </div>
          )}

          <div id="section-inventory" className="scroll-mt-28 space-y-3">
            <EquipmentSystem
              equipment={character.equipment}
              onChange={noop}
              isEditing={false}
              isLocked={true}
              proficiencyBonus={getProficiencyBonus(character.level)}
              money={character.money ?? { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }}
              onMoneyChange={noop}
            />
          </div>

          {character.appearance && (
            <Card className="stat-card-tertiary p-2 sm:p-3">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-accent" />
                <h3 className="font-semibold text-sm">Внешность</h3>
              </div>
              <p className="text-xs text-muted-foreground whitespace-pre-wrap">{character.appearance}</p>
            </Card>
          )}

          {character.allies && (
            <Card className="stat-card-tertiary p-2 sm:p-3">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-accent" />
                <h3 className="font-semibold text-sm">Союзники и организации</h3>
              </div>
              <p className="text-xs text-muted-foreground whitespace-pre-wrap">{character.allies}</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
