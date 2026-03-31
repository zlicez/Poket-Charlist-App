import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { CharacterHeader } from "@/components/CharacterHeader";
import { AbilityWithSkills } from "@/components/AbilityWithSkills";
import { CombatStats, DeathSavesTracker, HpTracker } from "@/components/CombatStats";
import { WeaponsList } from "@/components/WeaponsList";
import { FeaturesList } from "@/components/FeaturesList";
import { EquipmentSystem } from "@/components/EquipmentSystem";
import { SpellsSection } from "@/components/SpellsSection";
import { ProficienciesSection } from "@/components/ProficienciesSection";
import { DiceRoller, DiceRollerTrigger, rollDice, type DiceRoll } from "@/components/DiceRoller";
import { useTheme } from "@/components/ThemeProvider";
import { AccountDialog } from "@/components/AccountDialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { CharacterProvider, useCharacter } from "@/context/CharacterContext";
import {
  ABILITY_NAMES,
  ABILITY_LABELS,
  SKILLS_BY_ABILITY,
  calculateModifier,
  getProficiencyBonus,
  formatModifier,
  getRacialBonuses,
  getCharacterClasses,
  hasAnyCasterClass,
  type AbilityName,
  type Weapon,
} from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportCharacterToJSON } from "@/lib/json-export";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Moon,
  Sun,
  Save,
  Edit2,
  X,
  StickyNote,
  User,
  Users,
  Flag,
  Swords,
  Shield,
  Backpack,
  Sparkles,
  Crosshair,
  BookOpen,
  Download,
  FileText,
  FileJson,
  Share2,
  Copy,
  Check,
} from "lucide-react";

export default function CharacterSheet() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;

  return (
    <CharacterProvider id={id}>
      <CharacterSheetContent />
    </CharacterProvider>
  );
}

function CharacterSheetContent() {
  const {
    character,
    isLoading,
    error,
    isEditing,
    setIsEditing,
    handleChange,
    saveChanges,
    isSaving,
    shareData,
    shareUrl,
    handleToggleShare,
    handleCopyShareLink,
    copied,
  } = useCharacter();

  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const { user } = useAuth();

  const [isDiceRollerOpen, setIsDiceRollerOpen] = useState(false);
  const [rollHistory, setRollHistory] = useState<DiceRoll[]>([]);
  const [newCharHintVisible, setNewCharHintVisible] = useState(true);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);

  const addRoll = (roll: DiceRoll) => {
    setRollHistory((prev) => [roll, ...prev].slice(0, 50));
    setIsDiceRollerOpen(true);
  };

  const getAbilityModifier = (ability: AbilityName) => {
    if (!character) return 0;
    const baseScore = character.abilityScores[ability];
    const racialBonuses = getRacialBonuses(character.race, character.subrace);
    const racialBonus = racialBonuses[ability] || 0;
    const customBonus = character.customAbilityBonuses?.[ability] || 0;
    return calculateModifier(baseScore + racialBonus + customBonus);
  };

  const rollAbility = (ability: AbilityName) => {
    if (!character) return;
    const mod = getAbilityModifier(ability);
    addRoll(rollDice(
      `РџСЂРѕРІРµСЂРєР° ${ABILITY_LABELS[ability].ru}`,
      "1d20",
      mod,
      [`${ABILITY_LABELS[ability].ru} ${formatModifier(mod)}`],
    ));
  };

  const rollSkill = (skillName: string, ability: AbilityName) => {
    if (!character) return;
    const abilityMod = getAbilityModifier(ability);
    const profBonus = getProficiencyBonus(character.level);
    const proficiency = character.skills[skillName] || { proficient: false, expertise: false };

    let totalMod = abilityMod;
    const sources: string[] = [`${ability} ${formatModifier(abilityMod)}`];

    if (proficiency.expertise) {
      totalMod += profBonus * 2;
      sources.push(`Р­РєСЃРїРµСЂС‚РЅРѕСЃС‚СЊ +${profBonus * 2}`);
    } else if (proficiency.proficient) {
      totalMod += profBonus;
      sources.push(`Р’Р»Р°РґРµРЅРёРµ +${profBonus}`);
    }

    addRoll(rollDice(skillName, "1d20", totalMod, sources));
  };

  const rollSavingThrow = (ability: AbilityName) => {
    if (!character) return;
    const abilityMod = getAbilityModifier(ability);
    const profBonus = getProficiencyBonus(character.level);
    const isProficient = character.savingThrows[ability];

    let totalMod = abilityMod;
    const sources: string[] = [`${ability} ${formatModifier(abilityMod)}`];

    if (isProficient) {
      totalMod += profBonus;
      sources.push(`Р’Р»Р°РґРµРЅРёРµ +${profBonus}`);
    }

    addRoll(rollDice(`РЎРїР°СЃР±СЂРѕСЃРѕРє ${ABILITY_LABELS[ability].ru}`, "1d20", totalMod, sources));
  };

  const rollWeaponAttack = (weapon: Weapon, totalAttackBonus: number, isProficient = true) => {
    if (!character) return;
    const profBonus = isProficient ? getProficiencyBonus(character.level) : 0;
    const abilityLabel = weapon.abilityMod === "dex" ? "Р›РћР’" : "РЎРР›";
    const abilityMod = weapon.abilityMod === "dex"
      ? calculateModifier(character.abilityScores.DEX)
      : calculateModifier(character.abilityScores.STR);

    addRoll(rollDice(
      `РђС‚Р°РєР°: ${weapon.name}${!isProficient ? " (Р±РµР· РІР»Р°Рґ.)" : ""}`,
      "1d20",
      totalAttackBonus,
      [
        `${abilityLabel} ${formatModifier(abilityMod)}`,
        `РњР°СЃС‚РµСЂСЃС‚РІРѕ +${profBonus}`,
        weapon.attackBonus !== 0 ? `Р‘РѕРЅСѓСЃ ${formatModifier(weapon.attackBonus)}` : "",
      ].filter(Boolean),
    ));
  };

  const rollWeaponDamage = (weapon: Weapon, damageModifier: number) => {
    const abilityLabel = weapon.abilityMod === "dex" ? "Р›РћР’" : "РЎРР›";
    addRoll(rollDice(
      `РЈСЂРѕРЅ: ${weapon.name}`,
      weapon.damage,
      damageModifier,
      [
        weapon.damageType,
        damageModifier !== 0 ? `${abilityLabel} ${formatModifier(damageModifier)}` : "",
      ].filter(Boolean),
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24" />)}
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
          <h2 className="text-xl font-bold mb-2">РџРµСЂСЃРѕРЅР°Р¶ РЅРµ РЅР°Р№РґРµРЅ</h2>
          <p className="text-muted-foreground mb-4">
            Р’РѕР·РјРѕР¶РЅРѕ, РѕРЅ Р±С‹Р» СѓРґР°Р»С‘РЅ РёР»Рё РЅРёРєРѕРіРґР° РЅРµ СЃСѓС‰РµСЃС‚РІРѕРІР°Р».
          </p>
          <Button onClick={() => setLocation("/")} data-testid="button-go-home">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Рљ СЃРїРёСЃРєСѓ РїРµСЂСЃРѕРЅР°Р¶РµР№
          </Button>
        </Card>
      </div>
    );
  }

  const racialBonuses = getRacialBonuses(character.race, character.subrace);
  const showSpellsSection = isEditing || !!character.spellcasting || hasAnyCasterClass(getCharacterClasses(character));
  const sectionNavItems = [
    { id: "section-combat", label: "Р‘РѕР№", icon: Shield },
    { id: "section-equipment", label: "РћСЂСѓР¶РёРµ", icon: Crosshair },
    ...(showSpellsSection ? [{ id: "section-spells", label: "Р—Р°РєР»РёРЅР°РЅРёСЏ", icon: BookOpen }] : []),
    { id: "section-abilities", label: "РҐР°СЂР°РєС‚РµСЂРёСЃС‚РёРєРё", icon: Swords },
    { id: "section-inventory", label: "РРЅРІРµРЅС‚Р°СЂСЊ", icon: Backpack },
  ];
  const referenceSections = [
    { key: "notes" as const, label: "Р—Р°РјРµС‚РєРё", icon: StickyNote, rows: 6, placeholder: "Р—Р°РїРёСЃРё Рѕ РїРµСЂСЃРѕРЅР°Р¶Рµ, РєРІРµСЃС‚Р°С…...", testId: "textarea-notes" },
    { key: "appearance" as const, label: "Р’РЅРµС€РЅРѕСЃС‚СЊ", icon: User, rows: 3, placeholder: "Р РѕСЃС‚, С‚РµР»РѕСЃР»РѕР¶РµРЅРёРµ, РѕСЃРѕР±С‹Рµ РїСЂРёРјРµС‚С‹...", testId: "textarea-appearance" },
    { key: "allies" as const, label: "РЎРѕСЋР·РЅРёРєРё", icon: Users, rows: 3, placeholder: "Р”СЂСѓР·СЊСЏ, СЃРѕСЋР·РЅРёРєРё...", testId: "textarea-allies" },
    { key: "factions" as const, label: "Р¤СЂР°РєС†РёРё", icon: Flag, rows: 3, placeholder: "Р“РёР»СЊРґРёРё, РѕСЂРґРµРЅС‹...", testId: "textarea-factions" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")} data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-1 sm:gap-2">
            {isEditing ? (
              <Button
                variant="default"
                size="sm"
                onClick={saveChanges}
                disabled={isSaving}
                className="gap-1.5"
                data-testid="button-toggle-mode"
              >
                <Save className="w-4 h-4" />
                РЎРѕС…СЂР°РЅРёС‚СЊ
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-1.5"
                data-testid="button-toggle-mode"
              >
                <Edit2 className="w-4 h-4" />
                Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ
              </Button>
            )}

            <DiceRollerTrigger
              onClick={() => setIsDiceRollerOpen(true)}
              rollCount={rollHistory.length}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-export-menu">
                  <Download className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={async () => {
                    const { exportCharacterToPDF } = await import("@/lib/pdf-export");
                    exportCharacterToPDF(character);
                    toast({ title: "PDF РіРµРЅРµСЂРёСЂСѓРµС‚СЃСЏ..." });
                  }}
                  data-testid="button-export-pdf"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Р­РєСЃРїРѕСЂС‚ РІ PDF
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    exportCharacterToJSON(character);
                    toast({ title: "JSON СЃРѕС…СЂР°РЅС‘РЅ" });
                  }}
                  data-testid="button-export-json"
                >
                  <FileJson className="w-4 h-4 mr-2" />
                  Р­РєСЃРїРѕСЂС‚ РІ JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsShareDialogOpen(true)}
              data-testid="button-share"
            >
              <Share2 className="w-5 h-5" />
            </Button>
            {user ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAccountDialogOpen(true)}
                data-testid="button-account"
              >
                <User className="w-5 h-5" />
              </Button>
            ) : null}
            <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="button-theme-toggle">
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-2 sm:p-4">
        <div className="space-y-4 sm:space-y-5">
          <section id="section-combat" className="space-y-3 sm:space-y-4">
            <div className="section-label">Р‘РѕРµРІРѕР№ РѕР±Р·РѕСЂ</div>
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.95fr)] gap-3 sm:gap-4">
              <div className="min-w-0">
                <CharacterHeader character={character} onChange={handleChange} isEditing={isEditing} />
              </div>
              <div className="space-y-3">
                <HpTracker
                  current={character.currentHp}
                  max={character.maxHp}
                  temp={character.tempHp}
                  onChange={handleChange}
                  isEditing={isEditing}
                />
                <CombatStats
                  character={character}
                  onChange={handleChange}
                  isEditing={isEditing}
                  hideDeathSaves
                  hideHp
                />
                <DeathSavesTracker
                  deathSaves={character.deathSaves}
                  onChange={(deathSaves) => handleChange({ deathSaves })}
                  isEditing={isEditing}
                />
              </div>
            </div>
          </section>

          <nav className="sticky top-[49px] sm:top-[53px] z-40 border-b bg-background/95 backdrop-blur" data-testid="section-nav">
            <div className="-mx-2 sm:mx-0 nav-scroll-container">
              <div className="overflow-x-auto scrollbar-hide px-2 sm:px-0">
                <div className="flex gap-2 py-2">
                  {sectionNavItems.map(({ id: sectionId, label, icon: Icon }) => (
                    <button
                      key={sectionId}
                      onClick={() => document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                      className="section-nav-chip"
                      data-testid={`nav-${sectionId}`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {!isEditing &&
            newCharHintVisible &&
            character.equipment.length === 0 &&
            character.weapons.length === 0 &&
            character.features.length === 0 && (
              <div
                className="flex items-center gap-2 rounded-md border border-info/20 bg-info/5 px-3 py-2"
                data-testid="new-character-hint"
              >
                <Sparkles className="w-4 h-4 text-info shrink-0" />
                <span className="flex-1 text-xs text-muted-foreground">
                  РќРѕРІС‹Р№ РїРµСЂСЃРѕРЅР°Р¶ вЂ” РЅР°Р¶РјРёС‚Рµ <strong className="text-foreground">В«Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊВ»</strong>, С‡С‚РѕР±С‹ Р·Р°РґР°С‚СЊ С…Р°СЂР°РєС‚РµСЂРёСЃС‚РёРєРё Рё СЃРЅР°СЂСЏР¶РµРЅРёРµ.
                </span>
                <button
                  onClick={() => setNewCharHintVisible(false)}
                  className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground shrink-0"
                  aria-label="Р—Р°РєСЂС‹С‚СЊ РїРѕРґСЃРєР°Р·РєСѓ"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          <section id="section-equipment" className="space-y-3">
            <div className="section-label">РћСЂСѓР¶РёРµ Рё РєР»СЋС‡РµРІС‹Рµ РґРµР№СЃС‚РІРёСЏ</div>
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-3 sm:gap-4">
              <WeaponsList
                weapons={character.weapons}
                onChange={(weapons) => handleChange({ weapons })}
                onRollAttack={rollWeaponAttack}
                onRollDamage={rollWeaponDamage}
                isEditing={isEditing}
                isLocked={character.weaponsLocked ?? false}
                onToggleLock={() => handleChange({ weaponsLocked: !character.weaponsLocked })}
                equippedFromInventory={character.equipment}
                strMod={calculateModifier(
                  character.abilityScores.STR +
                  (racialBonuses.STR || 0) +
                  (character.customAbilityBonuses?.STR || 0),
                )}
                dexMod={calculateModifier(
                  character.abilityScores.DEX +
                  (racialBonuses.DEX || 0) +
                  (character.customAbilityBonuses?.DEX || 0),
                )}
                proficiencyBonus={getProficiencyBonus(character.level)}
                proficiencies={character.proficiencies ?? { languages: [], weapons: [], armor: [], tools: [] }}
              />
              <FeaturesList
                features={character.features}
                onChange={(features) => handleChange({ features })}
                isEditing={isEditing}
                isLocked={character.featuresLocked ?? false}
                onToggleLock={() => handleChange({ featuresLocked: !character.featuresLocked })}
              />
            </div>
          </section>

          {showSpellsSection && (
            <section id="section-spells" className="space-y-3">
              <div className="section-label">Р—Р°РєР»РёРЅР°РЅРёСЏ</div>
              <SpellsSection character={character} onChange={handleChange} isEditing={isEditing} />
            </section>
          )}

          <section id="section-abilities" className="space-y-3">
            <div className="section-label">РҐР°СЂР°РєС‚РµСЂРёСЃС‚РёРєРё, СЃРїР°СЃР±СЂРѕСЃРєРё Рё РЅР°РІС‹РєРё</div>
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
                  onScoreChange={(value) =>
                    handleChange({ abilityScores: { ...character.abilityScores, [ability]: value } })
                  }
                  onCustomBonusChange={(value) =>
                    handleChange({
                      customAbilityBonuses: {
                        STR: character.customAbilityBonuses?.STR || 0,
                        DEX: character.customAbilityBonuses?.DEX || 0,
                        CON: character.customAbilityBonuses?.CON || 0,
                        INT: character.customAbilityBonuses?.INT || 0,
                        WIS: character.customAbilityBonuses?.WIS || 0,
                        CHA: character.customAbilityBonuses?.CHA || 0,
                        [ability]: value,
                      },
                    })
                  }
                  onSkillProficiencyChange={(skillName, proficiency) =>
                    handleChange({ skills: { [skillName]: proficiency } })
                  }
                  savingThrowProficient={!!character.savingThrows[ability]}
                  onSavingThrowProficiencyChange={() =>
                    handleChange({ savingThrows: { ...character.savingThrows, [ability]: !character.savingThrows[ability] } })
                  }
                  onRollAbility={() => rollAbility(ability)}
                  onRollSavingThrow={() => rollSavingThrow(ability)}
                  onRollSkill={(skillName) => {
                    const skill = SKILLS_BY_ABILITY[ability].find((s) => s.name === skillName);
                    if (skill) rollSkill(skillName, skill.ability);
                  }}
                  isEditing={isEditing}
                />
              ))}
            </div>
          </section>

          <section id="section-inventory" className="space-y-3">
            <div className="section-label">РРЅРІРµРЅС‚Р°СЂСЊ Рё СЃРїСЂР°РІРѕС‡РЅР°СЏ РёРЅС„РѕСЂРјР°С†РёСЏ</div>
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] gap-3 sm:gap-4">
              <EquipmentSystem
                equipment={character.equipment}
                onChange={(equipment) => handleChange({ equipment })}
                isEditing={isEditing}
                isLocked={character.equipmentLocked ?? false}
                onToggleLock={() => handleChange({ equipmentLocked: !character.equipmentLocked })}
                proficiencyBonus={getProficiencyBonus(character.level)}
                money={character.money ?? { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }}
                onMoneyChange={(money) => handleChange({ money })}
              />

              <div className="space-y-3">
                <ProficienciesSection
                  proficiencies={character.proficiencies ?? { languages: [], weapons: [], armor: [], tools: [] }}
                  onChange={(proficiencies) => handleChange({ proficiencies })}
                  isEditing={isEditing}
                  race={character.race}
                  className={character.class}
                  subrace={character.subrace}
                />
                {referenceSections.map(({ key, label, icon: Icon, rows, placeholder, testId }) => (
                  <Card key={key} className="stat-card-tertiary p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <Icon className="w-4 h-4 text-accent" />
                      <h3 className="tx-l3 font-semibold">{label}</h3>
                    </div>
                    {isEditing ? (
                      <Textarea
                        value={character[key] || ""}
                        onChange={(e) => handleChange({ [key]: e.target.value })}
                        placeholder={placeholder}
                        rows={rows}
                        className="resize-none text-sm"
                        data-testid={testId}
                      />
                    ) : (
                      <div className={`tx-l4 whitespace-pre-wrap ${rows === 6 ? "min-h-[96px]" : "min-h-[52px]"}`}>
                        {character[key] || `РќРµС‚ ${key === "notes" ? "Р·Р°РјРµС‚РѕРє" : key === "appearance" ? "РѕРїРёСЃР°РЅРёСЏ" : "Р·Р°РїРёСЃРµР№"}`}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      <DiceRoller
        isOpen={isDiceRollerOpen}
        onClose={() => setIsDiceRollerOpen(false)}
        rollHistory={rollHistory}
        onClearHistory={() => setRollHistory([])}
      />

      <AccountDialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen} />
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>РџРѕРґРµР»РёС‚СЊСЃСЏ РїРµСЂСЃРѕРЅР°Р¶РµРј</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="share-toggle" className="text-sm">
                РћР±С‰РёР№ РґРѕСЃС‚СѓРї РїРѕ СЃСЃС‹Р»РєРµ
              </Label>
              <Switch
                id="share-toggle"
                checked={shareData?.isShared || false}
                onCheckedChange={handleToggleShare}
                data-testid="switch-share-toggle"
              />
            </div>
            {shareData?.isShared && shareUrl && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Р›СЋР±РѕР№, Сѓ РєРѕРіРѕ РµСЃС‚СЊ СЌС‚Р° СЃСЃС‹Р»РєР°, СЃРјРѕР¶РµС‚ РїСЂРѕСЃРјР°С‚СЂРёРІР°С‚СЊ Р»РёСЃС‚ РїРµСЂСЃРѕРЅР°Р¶Р° (Р±РµР· РІРѕР·РјРѕР¶РЅРѕСЃС‚Рё СЂРµРґР°РєС‚РёСЂРѕРІР°РЅРёСЏ).
                </p>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly className="text-xs" data-testid="input-share-url" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyShareLink}
                    data-testid="button-copy-share-link"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
            {!shareData?.isShared && (
              <p className="text-xs text-muted-foreground">
                Р’РєР»СЋС‡РёС‚Рµ РѕР±С‰РёР№ РґРѕСЃС‚СѓРї, С‡С‚РѕР±С‹ РїРѕР»СѓС‡РёС‚СЊ СЃСЃС‹Р»РєСѓ РґР»СЏ РїСЂРѕСЃРјРѕС‚СЂР° Р»РёСЃС‚Р° РїРµСЂСЃРѕРЅР°Р¶Р°.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
