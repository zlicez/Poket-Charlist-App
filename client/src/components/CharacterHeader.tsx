import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { Progress } from "@/components/ui/progress";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import {
  User,
  Sparkles,
  Scroll,
  BookOpen,
  Info,
  Settings2,
  TrendingUp,
  Zap,
  Coffee,
  Moon,
  Pencil,
} from "lucide-react";
import { AvatarPickerModal, AvatarViewModal } from "@/components/avatar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { NumericInput } from "@/components/ui/numeric-input";
import {
  ALIGNMENTS,
  RACE_DATA,
  createEmptyAbilityBonuses,
  buildClassStatePatch,
  getProficiencyBonus,
  formatModifier,
  getXPProgress,
  getLevelFromXP,
  getCharacterClasses,
  getCharacterClassSelections,
  getTotalLevel,
  calculateModifier,
  getRacialBonuses,
  getRaceSpeed,
} from "@shared/schema";
import type {
  Character,
  ClassSelection,
} from "@shared/schema";


// ─── Race picker — extracted to components/race-picker/* ─────────────────────

import { FlexibleRaceBonusesEditor } from "./race-picker/FlexibleRaceBonusesEditor";
import { LanguageChoiceEditor } from "./race-picker/LanguageChoiceEditor";
import { RacePickerDialog } from "./race-picker/RacePickerDialog";
import { RaceTooltipContent } from "./race-picker/RaceTooltipContent";

// ─── Class tooltip + Multiclass + Rest + EditingFields + CharacterHeader ─────


// ─── Multiclass + ClassTooltip extracted ─────────────────────────────────────

import { ClassTooltipContent } from "./multiclass/ClassTooltipContent";
import { MulticlassEditor } from "./multiclass/MulticlassEditor";


function EditingFields({
  character,
  onChange,
  handleClassSelectionsChange,
  handleRaceChange,
  subraces,
}: {
  character: Character;
  onChange: (updates: Partial<Character>) => void;
  handleClassSelectionsChange: (selections: ClassSelection[]) => void;
  handleRaceChange: (newRace: string, newSubrace?: string) => void;
  subraces: string[];
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">
          Имя персонажа
        </label>
        <Input
          value={character.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="text-lg font-bold h-10"
          placeholder="Имя персонажа"
          data-testid="input-name"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Раса</label>
        <RacePickerDialog value={character.race} subrace={character.subrace} onChange={handleRaceChange} />
      </div>

      {subraces.length > 0 && (
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Подраса
          </label>
          <Select
            value={character.subrace || "none"}
            onValueChange={(value) => {
              const newSubrace = value === "none" ? "" : value;
              onChange({
                subrace: newSubrace,
                speed: getRaceSpeed(character.race, newSubrace || undefined),
              });
            }}
          >
            <SelectTrigger
              className="h-10 text-sm"
              data-testid="select-subrace"
            >
              <SelectValue placeholder="Подраса" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Нет</SelectItem>
              {subraces.map((subrace) => (
                <SelectItem key={subrace} value={subrace}>
                  {subrace}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <FlexibleRaceBonusesEditor
        key={character.race}
        character={character}
        onChange={onChange}
      />

      <LanguageChoiceEditor
        key={`lang-${character.race}`}
        character={character}
        onChange={onChange}
      />

      <MulticlassEditor
        selections={getCharacterClassSelections(character)}
        onSelectionsChange={handleClassSelectionsChange}
      />

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">
          Опыт (XP)
        </label>
        <NumericInput
          min={0}
          value={character.experience}
          onChange={(v) => onChange({ experience: v })}
          className="h-10"
          data-testid="input-experience"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
          <Scroll className="w-3 h-3" />
          Предыстория
        </label>
        <Input
          value={character.background || ""}
          onChange={(e) => onChange({ background: e.target.value })}
          placeholder="Народный герой"
          className="h-10"
          data-testid="input-background"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
          <Sparkles className="w-3 h-3" />
          Мировоззрение
        </label>
        <Select
          value={character.alignment || ""}
          onValueChange={(value) => onChange({ alignment: value })}
        >
          <SelectTrigger className="h-10" data-testid="select-alignment">
            <SelectValue placeholder="Выберите" />
          </SelectTrigger>
          <SelectContent>
            {ALIGNMENTS.map((alignment) => (
              <SelectItem key={alignment} value={alignment}>
                {alignment}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}


// ─── Rest flows extracted to components/rest/* ───────────────────────────────

import { LongRestDialog } from "./rest/LongRestDialog";
import { ShortRestDialog } from "./rest/ShortRestDialog";


// ─────────────────────────────────────────────────────────────────────────────

interface CharacterHeaderProps {
  character: Character;
  onChange: (updates: Partial<Character>) => void;
  isEditing: boolean;
  onFinishEditing?: () => Promise<void> | void;
}

export function CharacterHeader({
  character,
  onChange,
  isEditing,
  onFinishEditing,
}: CharacterHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [shortRestOpen, setShortRestOpen] = useState(false);
  const [longRestOpen, setLongRestOpen] = useState(false);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [avatarViewOpen, setAvatarViewOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 640px)");

  const racialBonuses = getRacialBonuses(
    character.race,
    character.subrace,
    character.selectedRacialAbilityBonuses,
  );
  const conMod = calculateModifier(
    character.abilityScores.CON +
      (racialBonuses.CON || 0) +
      (character.customAbilityBonuses?.CON || 0),
  );
  const classSelections = getCharacterClassSelections(character);
  const charClasses = getCharacterClasses(character);
  const totalLevel = getTotalLevel(charClasses);
  const profBonus = getProficiencyBonus(totalLevel);
  const raceData = RACE_DATA[character.race];
  const subraces = raceData?.subraces ? Object.keys(raceData.subraces) : [];
  const xpProgress = getXPProgress(character.experience, totalLevel);
  const xpLevel = getLevelFromXP(character.experience);
  const canLevelUp = xpLevel > totalLevel && totalLevel < 20;

  const handleDrawerSave = async () => {
    if (!onFinishEditing) {
      setDrawerOpen(false);
      return;
    }

    try {
      await onFinishEditing();
    } catch {
      // saveChanges already shows a toast on failure; keep the drawer open
    }
  };

  const handleLevelUp = () => {
    const newLevel = Math.min(20, xpLevel);
    const levelDiff = newLevel - totalLevel;
    const nextSelections = classSelections.map((selection, index) =>
      index === 0
        ? { ...selection, level: selection.level + levelDiff }
        : selection,
    );
    handleClassSelectionsChange(nextSelections);
  };

  const handleClassSelectionsChange = (newSelections: ClassSelection[]) => {
    const patch = buildClassStatePatch(character, newSelections);
    onChange({
      ...patch,
      spellcasting:
        patch.spellcasting ??
        (character.spellcasting
          ? {
              ...character.spellcasting,
              spellSlots: Array.from({ length: 9 }, () => ({ max: 0, used: 0 })),
              pactMagic: { slotLevel: 1, max: 0, used: 0 },
            }
          : undefined),
    });
  };

  const handleRaceChange = (newRace: string, newSubrace?: string) => {
    onChange({
      race: newRace,
      // Use "" instead of undefined: JSON.stringify drops undefined, so the server
      // would never receive the "clear subrace" signal and the old value would persist.
      subrace: newSubrace ?? "",
      speed: getRaceSpeed(newRace, newSubrace),
      selectedRacialAbilityBonuses: createEmptyAbilityBonuses(),
      raceSelections: {},
    });
  };

  return (
    <Card className="stat-card p-3 sm:p-4">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          {/* Avatar with edit/view interaction */}
          <div className="relative flex-shrink-0 group">
            <Avatar
              className={`w-14 h-14 sm:w-16 sm:h-16 border-2 border-accent/30 ${
                !isEditing && character.avatar ? "cursor-pointer" : ""
              }`}
              onClick={() => {
                if (!isEditing && character.avatar) setAvatarViewOpen(true);
              }}
            >
              {character.avatar ? (
                <AvatarImage src={character.avatar} alt={character.name} />
              ) : null}
              <AvatarFallback className="text-xl bg-accent/20">
                <User className="w-7 h-7 sm:w-8 sm:h-8 text-accent" />
              </AvatarFallback>
            </Avatar>

            {/* Pencil overlay in edit mode — always visible */}
            {isEditing && (
              <button
                onClick={() => setAvatarPickerOpen(true)}
                className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40"
                aria-label="Изменить фото"
              >
                <Pencil className="w-5 h-5 text-white" />
              </button>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            {isEditing && isDesktop ? (
              <Input
                value={character.name}
                onChange={(e) => onChange({ name: e.target.value })}
                className="text-lg sm:text-xl font-bold h-10"
                placeholder="Имя персонажа"
                data-testid="input-name"
              />
            ) : (
              <h1
                className="text-lg sm:text-xl font-bold truncate"
                data-testid="text-character-name"
              >
                {character.name}
              </h1>
            )}

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {isEditing && isDesktop ? (
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <RacePickerDialog
                      value={character.race}
                      subrace={character.subrace}
                      onChange={handleRaceChange}
                    />
                    {subraces.length > 0 && (
                      <Select
                        value={character.subrace || "none"}
                        onValueChange={(value) => {
                          const newSubrace = value === "none" ? "" : value;
                          onChange({
                            subrace: newSubrace,
                            speed: getRaceSpeed(character.race, newSubrace || undefined),
                          });
                        }}
                      >
                        <SelectTrigger
                          className="flex-1 min-w-[100px] h-10 text-sm"
                          data-testid="select-subrace"
                        >
                          <SelectValue placeholder="Подраса" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Нет</SelectItem>
                          {subraces.map((subrace) => (
                            <SelectItem key={subrace} value={subrace}>
                              {subrace}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {character.race && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0"
                            data-testid="button-race-info"
                          >
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="p-3">
                          <RaceTooltipContent
                            raceName={character.race}
                            subraceName={character.subrace}
                            selectedRacialAbilityBonuses={
                              character.selectedRacialAbilityBonuses
                            }
                          />
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <FlexibleRaceBonusesEditor
                    key={character.race}
                    character={character}
                    onChange={onChange}
                  />
                  <LanguageChoiceEditor
                    key={`lang-${character.race}`}
                    character={character}
                    onChange={onChange}
                  />
                  <MulticlassEditor
                    selections={classSelections}
                    onSelectionsChange={handleClassSelectionsChange}
                  />
                </div>
              ) : (
                <>
                  <HelpTooltip
                    content={
                      <RaceTooltipContent
                        raceName={character.race}
                        subraceName={character.subrace}
                        selectedRacialAbilityBonuses={
                          character.selectedRacialAbilityBonuses
                        }
                      />
                    }
                    side="bottom"
                    asChild
                    mobileAsChild
                  >
                    <span className="cursor-help" data-testid="badge-race">
                      <Badge variant="secondary" className="text-xs">
                        {character.race}
                        {character.subrace ? ` (${character.subrace})` : ""}
                      </Badge>
                    </span>
                  </HelpTooltip>
                  {charClasses.map((entry, i) => (
                    <HelpTooltip
                      key={i}
                      content={<ClassTooltipContent className={entry.name} />}
                      side="bottom"
                      asChild
                      mobileAsChild
                    >
                      <span
                        className="cursor-help"
                        data-testid={`badge-class-${i}`}
                      >
                        <Badge variant="outline" className="text-xs">
                          {charClasses.length > 1
                            ? `${entry.name} ${entry.level}`
                            : entry.name}
                        </Badge>
                      </span>
                    </HelpTooltip>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="text-center min-w-[50px]"
                  data-testid="stat-level"
                >
                  <div className="text-xs text-muted-foreground">Уровень</div>
                  <div className="text-xl sm:text-2xl font-bold">
                    {totalLevel}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {charClasses.length > 1 ? (
                  <div className="space-y-1">
                    <p>Общий уровень: {totalLevel}</p>
                    {charClasses.map((c, i) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        {c.name}: {c.level}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p>Уровень персонажа от 1 до 20</p>
                )}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="text-center px-2 sm:px-3 py-1 rounded-md bg-accent/10"
                  data-testid="stat-proficiency"
                >
                  <div className="text-xs text-muted-foreground">
                    Мастерство
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-accent">
                    {formatModifier(profBonus)}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Бонус мастерства</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-1.5">
            {isEditing && !isDesktop && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDrawerOpen(true)}
                className="gap-1.5 h-10 px-3"
                data-testid="button-open-edit-drawer"
              >
                <Settings2 className="w-4 h-4" />
                Параметры
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          onClick={() => onChange({ inspiration: !character.inspiration })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-xs font-medium select-none ${
            character.inspiration
              ? "bg-accent/20 border-accent/60 text-accent"
              : "border-border/50 text-muted-foreground hover:border-accent/40 hover:text-foreground"
          }`}
          data-testid="button-toggle-inspiration"
          aria-label={character.inspiration ? "Убрать вдохновение" : "Получить вдохновение"}
          aria-pressed={character.inspiration}
        >
          <Zap className={`w-3.5 h-3.5 transition-all ${character.inspiration ? "fill-accent" : ""}`} />
          Вдохновение
        </button>

        {!isEditing && (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShortRestOpen(true)}
              className="h-8 px-2.5 text-xs gap-1.5 text-amber-600 border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-500"
              data-testid="button-short-rest"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Кор. отдых</span>
              <span className="sm:hidden">Кор.</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLongRestOpen(true)}
              className="h-8 px-2.5 text-xs gap-1.5 text-indigo-400 border-indigo-400/40 hover:bg-indigo-400/10 hover:text-indigo-400"
              data-testid="button-long-rest"
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Дол. отдых</span>
              <span className="sm:hidden">Дол.</span>
            </Button>
          </div>
        )}
      </div>

      <ShortRestDialog
        character={character}
        conMod={conMod}
        open={shortRestOpen}
        onOpenChange={setShortRestOpen}
        onApply={onChange}
      />
      <LongRestDialog
        character={character}
        open={longRestOpen}
        onOpenChange={setLongRestOpen}
        onApply={onChange}
      />

      <div className="mt-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="space-y-1" data-testid="stat-xp-progress">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Опыт: {character.experience.toLocaleString()} XP</span>
                <span>
                  {totalLevel < 20
                    ? `До ${totalLevel + 1} уровня: ${(xpProgress.next - character.experience).toLocaleString()} XP`
                    : "Максимальный уровень"}
                </span>
              </div>
              <Progress value={xpProgress.progress} className="h-2" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Прогресс опыта</p>
            <p className="text-xs text-muted-foreground">
              {xpProgress.current.toLocaleString()} /{" "}
              {xpProgress.next.toLocaleString()} XP
            </p>
          </TooltipContent>
        </Tooltip>
        {canLevelUp && (
          <Button
            size="sm"
            variant="default"
            className="w-full mt-1.5 gap-1.5 h-8 text-xs"
            onClick={handleLevelUp}
            data-testid="button-level-up"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Повысить уровень до {xpLevel}
          </Button>
        )}
      </div>

      {!isEditing && isDesktop && (
        <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 gap-3">
          <div className="flex items-start gap-2">
            <Scroll className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">Предыстория</div>
              <div className="text-sm font-medium truncate">
                {character.background || "—"}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">Мировоззрение</div>
              <div className="text-sm font-medium truncate">
                {character.alignment || "—"}
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditing && isDesktop && (
        <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
              <Scroll className="w-3 h-3" />
              Предыстория
            </label>
            <Input
              value={character.background || ""}
              onChange={(e) => onChange({ background: e.target.value })}
              placeholder="Народный герой"
              className="h-10"
              data-testid="input-background"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
              <Sparkles className="w-3 h-3" />
              Мировоззрение
            </label>
            <Select
              value={character.alignment || ""}
              onValueChange={(value) => onChange({ alignment: value })}
            >
              <SelectTrigger className="h-10" data-testid="select-alignment">
                <SelectValue placeholder="Выберите" />
              </SelectTrigger>
              <SelectContent>
                {ALIGNMENTS.map((alignment) => (
                  <SelectItem key={alignment} value={alignment}>
                    {alignment}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
              <BookOpen className="w-3 h-3" />
              Опыт (XP)
            </label>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={character.experience}
              onChange={(e) =>
                onChange({ experience: parseInt(e.target.value) || 0 })
              }
              className="h-10"
              data-testid="input-experience"
            />
          </div>
        </div>
      )}

      {isEditing && (
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent>
            <div className="max-h-[85vh] overflow-y-auto px-4 pb-4">
              <DrawerHeader>
                <DrawerTitle>Редактирование персонажа</DrawerTitle>
                <DrawerDescription>
                  Измените параметры вашего персонажа
                </DrawerDescription>
              </DrawerHeader>
              <EditingFields
                character={character}
                onChange={onChange}
                handleClassSelectionsChange={handleClassSelectionsChange}
                handleRaceChange={handleRaceChange}
                subraces={subraces}
              />
              <DrawerFooter>
                <Button variant="outline" onClick={() => setDrawerOpen(false)}>
                  Продолжить
                </Button>
                <Button onClick={handleDrawerSave}>Сохранить</Button>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Avatar picker (edit mode) */}
      <AvatarPickerModal
        open={avatarPickerOpen}
        onOpenChange={setAvatarPickerOpen}
        currentAvatar={character.avatar}
        onSave={(dataUrl) => onChange({ avatar: dataUrl ?? "" })}
      />

      {/* Avatar fullscreen view (play mode) */}
      {character.avatar && (
        <AvatarViewModal
          open={avatarViewOpen}
          onOpenChange={setAvatarViewOpen}
          avatarSrc={character.avatar}
          characterName={character.name}
        />
      )}
    </Card>
  );
}
