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
  getTotalLevel,
  calculateMaxHp,
  hasAnyCasterClass,
  type Character,
} from "@shared/schema";
import {
  Moon,
  Sun,
  ArrowLeft,
  Crosshair,
  BookOpen,
  Backpack,
  Share2,
  StickyNote,
  User,
  Users,
  Flag,
} from "lucide-react";
import { FaDiceD20 } from "react-icons/fa";

export default function SharedCharacterSheet() {
  const { token } = useParams<{ token: string }>();
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();

  const { data: character, isLoading, error } = useQuery<Character>({
    queryKey: ["/api/shared", token],
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
  const charClassesForHp = getCharacterClasses(character);
  const totalLevelForHp = getTotalLevel(charClassesForHp);
  const isLevel1ForHp = totalLevelForHp === 1;
  const conModForHp = calculateModifier(character.abilityScores.CON + (racialBonuses.CON || 0) + (character.customAbilityBonuses?.CON || 0));
  const calculatedMaxHp = calculateMaxHp(charClassesForHp[0]?.name || character.class, 1, conModForHp);
  const effectiveMaxHp = isLevel1ForHp
    ? calculatedMaxHp + (character.customMaxHpBonus || 0)
    : character.maxHp;
  const showSpellsSection = !!character.spellcasting || hasAnyCasterClass(getCharacterClasses(character));
  const sectionNavItems = [
    { id: "section-combat", label: "Общее", icon: User },
    { id: "section-equipment", label: "Оружие", icon: Crosshair },
    ...(showSpellsSection ? [{ id: "section-spells", label: "Заклинания", icon: BookOpen }] : []),
    { id: "section-abilities", label: "Характеристики", icon: FaDiceD20 },
    { id: "section-inventory", label: "Инвентарь", icon: Backpack },
  ];
  const referenceSections = [
    { key: "notes" as const, label: "Заметки", icon: StickyNote },
    { key: "appearance" as const, label: "Внешность", icon: User },
    { key: "allies" as const, label: "Союзники", icon: Users },
    { key: "factions" as const, label: "Фракции", icon: Flag },
  ].filter(({ key }) => !!character[key]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Общий доступ (только просмотр)</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-2 sm:p-4">
        <div className="space-y-4 sm:space-y-5">
          <nav className="sticky top-[49px] sm:top-[53px] z-40 border-b bg-background/95 backdrop-blur" data-testid="section-nav">
            <div className="-mx-2 sm:mx-0 nav-scroll-container">
              <div className="overflow-x-auto scrollbar-hide px-2 sm:px-0 lg:overflow-visible">
                <div className="flex gap-2 py-2 lg:flex-wrap lg:justify-start">
                  {sectionNavItems.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                      className="section-nav-chip"
                      data-testid={`nav-${id}`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          <section id="section-combat" className="space-y-3 sm:space-y-4">
            <div className="section-label">Общее</div>
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.95fr)] gap-3 sm:gap-4">
              <div className="min-w-0">
                <CharacterHeader
                  character={character}
                  onChange={noop}
                  isEditing={false}
                />
              </div>
              <div className="space-y-3">
                <HpTracker
                  current={character.currentHp}
                  max={effectiveMaxHp}
                  calculatedMax={calculatedMaxHp}
                  customMaxHpBonus={character.customMaxHpBonus || 0}
                  isAutoCalc={isLevel1ForHp}
                  temp={character.tempHp}
                  onChange={noop}
                  isEditing={false}
                />
                <CombatStats
                  character={character}
                  onChange={noop}
                  isEditing={false}
                  hideHp
                  hideDeathSaves
                />
                <DeathSavesTracker
                  deathSaves={character.deathSaves}
                  onChange={noop}
                  isEditing={false}
                />
              </div>
            </div>
          </section>

          <section id="section-equipment" className="space-y-3">
            <div className="section-label">Оружие и ключевые действия</div>
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-3 sm:gap-4">
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

              <FeaturesList
                features={character.features}
                onChange={noop}
                isEditing={false}
                isLocked={true}
              />
            </div>
          </section>

          {showSpellsSection && (
            <section id="section-spells" className="space-y-3">
              <div className="section-label">Заклинания</div>
              <SpellsSection
                character={character}
                isEditing={false}
                onChange={noop}
              />
            </section>
          )}

          <section id="section-abilities" className="space-y-3">
            <div className="section-label">Характеристики, спасброски и навыки</div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
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
          </section>

          <section id="section-inventory" className="space-y-3">
            <div className="section-label">Инвентарь и справочная информация</div>
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] gap-3 sm:gap-4">
              <EquipmentSystem
                equipment={character.equipment}
                onChange={noop}
                isEditing={false}
                isLocked={true}
                proficiencyBonus={getProficiencyBonus(character.level)}
                money={character.money ?? { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }}
                onMoneyChange={noop}
              />

              <div className="space-y-3">
                <ProficienciesSection
                  proficiencies={character.proficiencies ?? { languages: [], weapons: [], armor: [], tools: [] }}
                  onChange={noop}
                  isEditing={false}
                  race={character.race}
                  className={character.class}
                  subrace={character.subrace}
                />

                {referenceSections.map(({ key, label, icon: Icon }) => (
                  <Card key={key} className="stat-card-tertiary p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <Icon className="w-4 h-4 text-accent" />
                      <h3 className="tx-l3 font-semibold">{label}</h3>
                    </div>
                    <div className="tx-l4 whitespace-pre-wrap">
                      {character[key]}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
