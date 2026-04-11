import { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CharacterHeader } from "@/components/CharacterHeader";
import { AbilityWithSkills } from "@/components/AbilityWithSkills";
import {
  CombatStats,
  DeathSavesTracker,
  HpTracker,
} from "@/components/CombatStats";
import { WeaponsList } from "@/components/WeaponsList";
import { FeaturesList } from "@/components/FeaturesList";
import { EquipmentSystem } from "@/components/EquipmentSystem";
import { CharacterLoadingScreen } from "@/components/CharacterLoadingScreen";
import { SpellsSection } from "@/components/SpellsSection";
import { ProficienciesSection } from "@/components/ProficienciesSection";
import {
  DiceRoller,
  DiceRollerTrigger,
  rollDice,
  type DiceRoll,
} from "@/components/DiceRoller";
import { RichTextContent } from "@/components/RichTextContent";
import { RichTextField } from "@/components/RichTextField";
import { useTheme } from "@/components/ThemeProvider";
import { AccountDialog } from "@/components/AccountDialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { CharacterProvider, useCharacter } from "@/context/CharacterContext";
import { cn } from "@/lib/utils";
import {
  ABILITY_NAMES,
  ABILITY_LABELS,
  SKILLS_BY_ABILITY,
  calculateModifier,
  getProficiencyBonus,
  formatModifier,
  getRacialBonuses,
  getCharacterClasses,
  getTotalLevel,
  calculateMaxHp,
  hasAnyCasterClass,
  type AbilityName,
  type Weapon,
} from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  Backpack,
  Sparkles,
  Swords,
  BookOpen,
  Download,
  FileText,
  FileJson,
  Share2,
  Copy,
  Check,
  Menu,
} from "lucide-react";
import { FaDiceD20 } from "react-icons/fa";

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
  const [activeTab, setActiveTab] = useState("section-combat");

  const [pdfToast, setPdfToast] = useState<{
    title: string;
    msg: string;
    progress: number;
  } | null>(null);
  const pdfIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Compute early (with null-guard) so useEffect can depend on it
  const showSpellsSection =
    !isLoading &&
    !!character &&
    (isEditing || !!character.spellcasting || hasAnyCasterClass(getCharacterClasses(character)));

  // If character loses spellcasting while on the spells tab — fall back to combat
  useEffect(() => {
    if (!showSpellsSection && activeTab === "section-spells") {
      setActiveTab("section-combat");
    }
  }, [showSpellsSection, activeTab]);

  const handleExportPdf = async () => {
    if (!character) return;

    const FUNNY_MESSAGES = [
      "Точим гусиное перо...",
      "Будим скрайба...",
      "Торгуемся с драконом за бумагу...",
      "Считаем кости хитов...",
      "Спрашиваем разрешения у Мастера...",
      "Пересчитываем золото в кошельке...",
      "Застёгиваем доспех персонажа...",
      "Переводим с эльфийского...",
      "Проверяем мировоззрение...",
      "Намазываем чернилами свиток...",
      "Сворачиваем пергамент...",
      "Шепчем заклинание архивации...",
    ];

    let progress = 5;
    let msgIndex = Math.floor(Math.random() * FUNNY_MESSAGES.length);

    setPdfToast({ title: "Создаём PDF...", msg: FUNNY_MESSAGES[msgIndex], progress });

    pdfIntervalRef.current = setInterval(() => {
      progress = Math.min(progress + Math.random() * 18 + 7, 85);
      msgIndex = (msgIndex + 1) % FUNNY_MESSAGES.length;
      setPdfToast({ title: "Создаём PDF...", msg: FUNNY_MESSAGES[msgIndex], progress });
    }, 350);

    try {
      const { exportCharacterToPDF } = await import("@/lib/pdf-export");
      await exportCharacterToPDF(character);
      if (pdfIntervalRef.current) clearInterval(pdfIntervalRef.current);
      setPdfToast({ title: "PDF готов!", msg: "Файл сохранён на устройство", progress: 100 });
      setTimeout(() => setPdfToast(null), 2500);
    } catch {
      if (pdfIntervalRef.current) clearInterval(pdfIntervalRef.current);
      setPdfToast({ title: "Ошибка", msg: "Не удалось создать PDF", progress: 100 });
      setTimeout(() => setPdfToast(null), 3000);
    }
  };

  const handleExportJson = () => {
    if (!character) return;
    exportCharacterToJSON(character);
    toast({ title: "JSON сохранён" });
  };

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
    addRoll(
      rollDice(`Проверка ${ABILITY_LABELS[ability].ru}`, "1d20", mod, [
        `${ABILITY_LABELS[ability].ru} ${formatModifier(mod)}`,
      ]),
    );
  };

  const rollSkill = (skillName: string, ability: AbilityName) => {
    if (!character) return;
    const abilityMod = getAbilityModifier(ability);
    const profBonus = getProficiencyBonus(character.level);
    const proficiency = character.skills[skillName] || {
      proficient: false,
      expertise: false,
    };

    let totalMod = abilityMod;
    const sources: string[] = [`${ability} ${formatModifier(abilityMod)}`];

    if (proficiency.expertise) {
      totalMod += profBonus * 2;
      sources.push(`Экспертность +${profBonus * 2}`);
    } else if (proficiency.proficient) {
      totalMod += profBonus;
      sources.push(`Владение +${profBonus}`);
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
      sources.push(`Владение +${profBonus}`);
    }

    addRoll(
      rollDice(
        `Спасбросок ${ABILITY_LABELS[ability].ru}`,
        "1d20",
        totalMod,
        sources,
      ),
    );
  };

  const rollWeaponAttack = (
    weapon: Weapon,
    totalAttackBonus: number,
    isProficient = true,
  ) => {
    if (!character) return;
    const profBonus = isProficient ? getProficiencyBonus(character.level) : 0;
    const abilityLabel = weapon.abilityMod === "dex" ? "ЛОВ" : "СИЛ";
    const abilityMod =
      weapon.abilityMod === "dex"
        ? calculateModifier(character.abilityScores.DEX)
        : calculateModifier(character.abilityScores.STR);

    addRoll(
      rollDice(
        `Атака: ${weapon.name}${!isProficient ? " (без влад.)" : ""}`,
        "1d20",
        totalAttackBonus,
        [
          `${abilityLabel} ${formatModifier(abilityMod)}`,
          `Мастерство +${profBonus}`,
          weapon.attackBonus !== 0
            ? `Бонус ${formatModifier(weapon.attackBonus)}`
            : "",
        ].filter(Boolean),
      ),
    );
  };

  const rollWeaponDamage = (weapon: Weapon, damageModifier: number) => {
    const abilityLabel = weapon.abilityMod === "dex" ? "ЛОВ" : "СИЛ";
    addRoll(
      rollDice(
        `Урон: ${weapon.name}`,
        weapon.damage,
        damageModifier,
        [
          weapon.damageType,
          damageModifier !== 0
            ? `${abilityLabel} ${formatModifier(damageModifier)}`
            : "",
        ].filter(Boolean),
      ),
    );
  };

  if (isLoading) {
    return <CharacterLoadingScreen />;
  }

  if (error || !character) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-6 text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">Персонаж не найден</h2>
          <p className="text-muted-foreground mb-4">
            Возможно, он был удалён или никогда не существовал.
          </p>
          <Button onClick={() => setLocation("/")} data-testid="button-go-home">
            <ArrowLeft className="w-4 h-4 mr-2" />К списку персонажей
          </Button>
        </Card>
      </div>
    );
  }

  const racialBonuses = getRacialBonuses(character.race, character.subrace);
  const charClassesForHp = getCharacterClasses(character);
  const totalLevelForHp = getTotalLevel(charClassesForHp);
  const conModForHp = calculateModifier(
    character.abilityScores.CON +
      (racialBonuses.CON || 0) +
      (character.customAbilityBonuses?.CON || 0),
  );
  const isLevel1ForHp = totalLevelForHp === 1;
  const calculatedMaxHp = calculateMaxHp(
    charClassesForHp[0]?.name || character.class,
    1,
    conModForHp,
  );
  const effectiveMaxHp = isLevel1ForHp
    ? calculatedMaxHp + (character.customMaxHpBonus || 0)
    : character.maxHp;

  const sectionNavItems = [
    { id: "section-combat",    label: "Общее",          mobileLabel: "Общее",    icon: User },
    { id: "section-abilities", label: "Характеристики", mobileLabel: "Броски",  icon: FaDiceD20 },
    { id: "section-equipment", label: "Оружие",         mobileLabel: "Оружие",   icon: Swords },
    { id: "section-inventory", label: "Инвентарь",      mobileLabel: "Вещи",     icon: Backpack },
    ...(showSpellsSection
      ? [{ id: "section-spells", label: "Заклинания", mobileLabel: "Магия", icon: BookOpen }]
      : []),
    { id: "section-notes", label: "Заметки", mobileLabel: "Заметки", icon: StickyNote },
  ];

  const referenceSections = [
    {
      key: "notes" as const,
      label: "Заметки",
      icon: StickyNote,
      rows: 8,
      minHeightClass: "min-h-[220px]",
      placeholder: "Записи о персонаже, квестах...",
      testId: "textarea-notes",
    },
    {
      key: "appearance" as const,
      label: "Внешность",
      icon: User,
      rows: 5,
      minHeightClass: "min-h-[160px]",
      placeholder: "Рост, телосложение, особые приметы...",
      testId: "textarea-appearance",
    },
    {
      key: "allies" as const,
      label: "Союзники",
      icon: Users,
      rows: 5,
      minHeightClass: "min-h-[160px]",
      placeholder: "Друзья, союзники...",
      testId: "textarea-allies",
    },
    {
      key: "factions" as const,
      label: "Фракции",
      icon: Flag,
      rows: 5,
      minHeightClass: "min-h-[160px]",
      placeholder: "Гильдии, ордены...",
      testId: "textarea-factions",
    },
  ];
  const normalizedReferenceSections = referenceSections.map((section) => ({
    ...section,
    rows: 8,
    minHeightClass: "min-h-[220px]",
  }));

  // ─── Section content renderer (shared between mobile tab view and desktop scroll) ───
  const renderSection = (sectionId: string, isMobile = false) => {
    switch (sectionId) {
      case "section-combat":
        return (
          <section id="section-combat" className="space-y-3 sm:space-y-4">
            <div className="section-label">Общее</div>
            {/* New-character hint — shown inside the combat section on all layouts */}
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
                    Новый персонаж — нажмите{" "}
                    <strong className="text-foreground">«Редактировать»</strong>,
                    чтобы задать характеристики и снаряжение.
                  </span>
                  <button
                    onClick={() => setNewCharHintVisible(false)}
                    className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground shrink-0"
                    aria-label="Закрыть подсказку"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.95fr)] gap-3 sm:gap-4">
              <div className="min-w-0">
                <CharacterHeader
                  character={character}
                  onChange={handleChange}
                  isEditing={isEditing}
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
            {isMobile && (
              <ProficienciesSection
                proficiencies={
                  character.proficiencies ?? {
                    languages: [],
                    weapons: [],
                    armor: [],
                    tools: [],
                  }
                }
                onChange={(proficiencies) => handleChange({ proficiencies })}
                isEditing={isEditing}
                race={character.race}
                className={character.class}
                subrace={character.subrace}
              />
            )}
          </section>
        );

      case "section-abilities":
        return (
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
                  onScoreChange={(value) =>
                    handleChange({
                      abilityScores: {
                        ...character.abilityScores,
                        [ability]: value,
                      },
                    })
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
                    handleChange({
                      savingThrows: {
                        ...character.savingThrows,
                        [ability]: !character.savingThrows[ability],
                      },
                    })
                  }
                  onRollAbility={() => rollAbility(ability)}
                  onRollSavingThrow={() => rollSavingThrow(ability)}
                  onRollSkill={(skillName) => {
                    const skill = SKILLS_BY_ABILITY[ability].find(
                      (s) => s.name === skillName,
                    );
                    if (skill) rollSkill(skillName, skill.ability);
                  }}
                  isEditing={isEditing}
                />
              ))}
            </div>
          </section>
        );

      case "section-equipment":
        return (
          <section id="section-equipment" className="space-y-3">
            <div className="section-label">Оружие и ключевые действия</div>
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-3 sm:gap-4">
              <WeaponsList
                weapons={character.weapons}
                onChange={(weapons) => handleChange({ weapons })}
                onAddInventoryWeapon={(weapon) =>
                  handleChange({
                    equipment: [
                      ...character.equipment,
                      { ...weapon, id: crypto.randomUUID() },
                    ],
                  })
                }
                onRollAttack={rollWeaponAttack}
                onRollDamage={rollWeaponDamage}
                isEditing={isEditing}
                isLocked={character.weaponsLocked ?? false}
                onToggleLock={() =>
                  handleChange({ weaponsLocked: !character.weaponsLocked })
                }
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
                proficiencies={
                  character.proficiencies ?? {
                    languages: [],
                    weapons: [],
                    armor: [],
                    tools: [],
                  }
                }
              />
              <FeaturesList
                features={character.features}
                onChange={(features) => handleChange({ features })}
                isEditing={isEditing}
                isLocked={character.featuresLocked ?? false}
                onToggleLock={() =>
                  handleChange({ featuresLocked: !character.featuresLocked })
                }
              />
            </div>
          </section>
        );

      case "section-inventory":
        return (
          <section id="section-inventory" className="space-y-3">
            <div className="section-label">Инвентарь и владения</div>
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] gap-3 sm:gap-4 items-start">
              <EquipmentSystem
                equipment={character.equipment}
                onChange={(equipment) => handleChange({ equipment })}
                isEditing={isEditing}
                isLocked={character.equipmentLocked ?? false}
                onToggleLock={() =>
                  handleChange({ equipmentLocked: !character.equipmentLocked })
                }
                proficiencyBonus={getProficiencyBonus(character.level)}
                money={character.money ?? { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }}
                onMoneyChange={(money) => handleChange({ money })}
              />
              {!isMobile && (
                <ProficienciesSection
                  proficiencies={
                    character.proficiencies ?? {
                      languages: [],
                      weapons: [],
                      armor: [],
                      tools: [],
                    }
                  }
                  onChange={(proficiencies) => handleChange({ proficiencies })}
                  isEditing={isEditing}
                  race={character.race}
                  className={character.class}
                  subrace={character.subrace}
                />
              )}
            </div>
          </section>
        );

      case "section-spells":
        if (!showSpellsSection) return null;
        return (
          <section id="section-spells" className="space-y-3">
            <div className="section-label">Заклинания</div>
            <SpellsSection
              character={character}
              onChange={handleChange}
              isEditing={isEditing}
              isLocked={character.spellSlotsLocked ?? false}
              onToggleLock={() =>
                handleChange({ spellSlotsLocked: !character.spellSlotsLocked })
              }
            />
          </section>
        );

      case "section-notes":
        return (
          <section id="section-notes" className="space-y-3">
            <div className="section-label">Заметки и сведения</div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
              {normalizedReferenceSections.map(
                ({ key, label, icon: Icon, rows, minHeightClass, placeholder, testId }) => (
                  <Card
                    key={key}
                    className="stat-card-tertiary p-3 h-full flex flex-col"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <Icon className="w-4 h-4 text-accent" />
                      <h3 className="tx-l3 font-semibold">{label}</h3>
                    </div>
                    {isEditing ? (
                      <RichTextField
                        value={character[key] || ""}
                        onChange={(value) => handleChange({ [key]: value })}
                        placeholder={placeholder}
                        rows={rows}
                        className="flex-1"
                        textareaClassName={`flex-1 ${minHeightClass}`}
                        previewContainerClassName={`flex-1 ${minHeightClass}`}
                        textareaTestId={testId}
                        previewTestId={`${testId}-preview`}
                      />
                    ) : (
                      <RichTextContent
                        content={character[key]}
                        className={`flex-1 ${minHeightClass}`}
                        emptyState={`Нет ${key === "notes" ? "заметок" : key === "appearance" ? "описания" : "записей"}`}
                        testId={`${testId}-content`}
                      />
                    )}
                  </Card>
                ),
              )}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  // ─── Shared header JSX ───────────────────────────────────────────────────────
  const headerInner = (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-1 sm:gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setLocation("/")}
        data-testid="button-back"
      >
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
            Сохранить
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
            Редактировать
          </Button>
        )}

        <DiceRollerTrigger
          onClick={() => setIsDiceRollerOpen(true)}
          rollCount={rollHistory.length}
        />

        {/* Mobile menu (hamburger) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              data-testid="button-mobile-menu"
              aria-label="Открыть меню"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              onClick={handleExportPdf}
              data-testid="button-mobile-export-pdf"
            >
              <FileText className="w-4 h-4 mr-2" />
              Экспорт в PDF
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleExportJson}
              data-testid="button-mobile-export-json"
            >
              <FileJson className="w-4 h-4 mr-2" />
              Экспорт в JSON
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsShareDialogOpen(true)}
              data-testid="button-mobile-share"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Поделиться
            </DropdownMenuItem>
            {user ? (
              <DropdownMenuItem
                onClick={() => setIsAccountDialogOpen(true)}
                data-testid="button-mobile-account"
              >
                <User className="w-4 h-4 mr-2" />
                Профиль
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={toggleTheme}
              data-testid="button-mobile-theme-toggle"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 mr-2" />
              ) : (
                <Moon className="w-4 h-4 mr-2" />
              )}
              {theme === "dark" ? "Светлая тема" : "Тёмная тема"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Desktop controls */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex"
              data-testid="button-export-menu"
            >
              <Download className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleExportPdf}
              data-testid="button-export-pdf"
            >
              <FileText className="w-4 h-4 mr-2" />
              Экспорт в PDF
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleExportJson}
              data-testid="button-export-json"
            >
              <FileJson className="w-4 h-4 mr-2" />
              Экспорт в JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsShareDialogOpen(true)}
          className="hidden sm:inline-flex"
          data-testid="button-share"
        >
          <Share2 className="w-5 h-5" />
        </Button>
        {user ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsAccountDialogOpen(true)}
            className="hidden sm:inline-flex"
            data-testid="button-account"
          >
            <User className="w-5 h-5" />
          </Button>
        ) : null}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="hidden sm:inline-flex"
          data-testid="button-theme-toggle"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="bg-background">

      {/* ═══════════════════════════════════════════════════════════════════════
          MOBILE LAYOUT (< lg): fixed full-screen flex column
          Header → scrollable tab panel → bottom tab bar
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden fixed inset-0 flex flex-col">

        {/* Header */}
        <header className="shrink-0 bg-background/95 backdrop-blur border-b">
          {headerInner}
        </header>

        {/* Active tab content — key={activeTab} triggers re-mount + CSS animate-in */}
        <div
          key={activeTab}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2 tab-panel-mobile
                     animate-in fade-in-0 slide-in-from-bottom-2 duration-150"
        >
          {renderSection(activeTab, true)}
        </div>

        {/* Bottom tab bar */}
        <nav
          aria-label="Навигация по персонажу"
          className="shrink-0 border-t bg-background/95 backdrop-blur bottom-tab-bar"
        >
          <div className="flex items-stretch h-[60px] px-1">
            {sectionNavItems.map(({ id: sectionId, mobileLabel, icon: Icon }) => {
              const isActive = activeTab === sectionId;
              return (
                <button
                  key={sectionId}
                  onClick={() => setActiveTab(sectionId)}
                  data-testid={`tab-${sectionId}`}
                  aria-selected={isActive}
                  className={cn(
                    "relative flex flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5",
                    "rounded-lg transition-colors duration-200 select-none",
                    "-webkit-tap-highlight-color-transparent",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground active:text-foreground/70",
                  )}
                >
                  {/* Active indicator pill at top */}
                  <span
                    className={cn(
                      "absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full",
                      "transition-all duration-300 ease-out",
                      isActive ? "w-6 bg-primary" : "w-0 bg-transparent",
                    )}
                  />
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px] transition-transform duration-200",
                      isActive && "scale-110",
                    )}
                  />
                  <span className="text-[9px] font-medium leading-none truncate max-w-full">
                    {mobileLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          DESKTOP LAYOUT (lg+): original sticky scroll layout, unchanged
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block min-h-screen">

        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
          {headerInner}
        </header>

        <main className="max-w-7xl mx-auto p-2 sm:p-4">
          <div className="space-y-4 sm:space-y-5">

            {/* Desktop sticky section nav */}
            <nav
              className="sticky top-[49px] sm:top-[53px] z-40 border-b bg-background/95 backdrop-blur"
              data-testid="section-nav"
            >
              <div className="-mx-2 sm:mx-0 nav-scroll-container">
                <div className="overflow-x-auto scrollbar-hide px-2 sm:px-0 lg:overflow-visible">
                  <div className="flex gap-2 py-2 lg:flex-wrap lg:justify-start">
                    {sectionNavItems.map(({ id: sectionId, label, icon: Icon }) => (
                      <button
                        key={sectionId}
                        onClick={() =>
                          document
                            .getElementById(sectionId)
                            ?.scrollIntoView({ behavior: "smooth", block: "start" })
                        }
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

            {/* All sections stacked for desktop scroll */}
            {sectionNavItems.map(({ id: sectionId }) => renderSection(sectionId))}

          </div>
        </main>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SHARED OVERLAYS (both layouts)
          ═══════════════════════════════════════════════════════════════════════ */}

      <DiceRoller
        isOpen={isDiceRollerOpen}
        onClose={() => setIsDiceRollerOpen(false)}
        rollHistory={rollHistory}
        onClearHistory={() => setRollHistory([])}
      />

      <AccountDialog
        open={isAccountDialogOpen}
        onOpenChange={setIsAccountDialogOpen}
      />

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Поделиться персонажем</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="share-toggle" className="text-sm">
                Общий доступ по ссылке
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
                  Любой, у кого есть эта ссылка, сможет просматривать лист
                  персонажа без возможности редактирования.
                </p>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="text-xs"
                    data-testid="input-share-url"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyShareLink}
                    data-testid="button-copy-share-link"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
            {!shareData?.isShared && (
              <p className="text-xs text-muted-foreground">
                Включите общий доступ, чтобы получить ссылку для просмотра листа
                персонажа.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF export progress toast — positioned above bottom tab bar on mobile */}
      {pdfToast && (
        <div className="fixed bottom-[76px] lg:bottom-4 right-4 z-[100] w-[300px] sm:w-[340px] rounded-lg border bg-background shadow-lg overflow-hidden">
          <div className="px-4 pt-4 pb-3">
            <p className="text-sm font-semibold">{pdfToast.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{pdfToast.msg}</p>
          </div>
          <div className="h-1.5 bg-muted w-full">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${pdfToast.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
