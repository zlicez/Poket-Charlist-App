import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { User, Sparkles, Scroll, BookOpen, Info, Settings2, Plus, Trash2, TrendingUp } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { NumericInput } from "@/components/ui/numeric-input";
import {
  CLASSES,
  RACES,
  ALIGNMENTS,
  RACE_DATA,
  CLASS_DATA,
  ABILITY_LABELS,
  getProficiencyBonus,
  formatModifier,
  getXPProgress,
  getLevelFromXP,
  getCharacterClasses,
  getTotalLevel,
} from "@shared/schema";
import type { Character, AbilityName, ClassEntry } from "@shared/schema";

function formatAbilityBonuses(bonuses: Partial<Record<AbilityName, number>>): string {
  return Object.entries(bonuses)
    .map(([ability, bonus]) => `${ABILITY_LABELS[ability as AbilityName].ru} +${bonus}`)
    .join(", ");
}

function RaceTooltipContent({ raceName, subraceName }: { raceName: string; subraceName?: string }) {
  const raceData = RACE_DATA[raceName];
  if (!raceData) return null;
  
  const subraceData = subraceName ? raceData.subraces?.[subraceName] : undefined;
  const combinedBonuses = { ...raceData.abilityBonuses };
  if (subraceData && typeof subraceData === 'object') {
    Object.entries(subraceData.abilityBonuses).forEach(([key, value]) => {
      combinedBonuses[key as AbilityName] = (combinedBonuses[key as AbilityName] || 0) + value;
    });
  }
  
  const subraceDescription = subraceData && typeof subraceData === 'object' ? subraceData.description : undefined;
  
  return (
    <div className="space-y-2 max-w-xs">
      <div className="font-bold text-sm">{raceName}{subraceName ? ` (${subraceName})` : ''}</div>
      <p className="text-xs text-muted-foreground">{raceData.description}</p>
      {subraceDescription && (
        <p className="text-xs italic">{subraceDescription}</p>
      )}
      <div className="space-y-1 text-xs">
        <div><span className="font-medium">Бонусы:</span> {formatAbilityBonuses(combinedBonuses)}</div>
        <div><span className="font-medium">Скорость:</span> {raceData.speed} фт.</div>
        <div><span className="font-medium">Языки:</span> {raceData.languages.join(", ")}</div>
        <div>
          <span className="font-medium">Особенности:</span>
          <ul className="list-disc list-inside ml-1">
            {raceData.traits.map((trait, i) => (
              <li key={i}>{trait}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ClassTooltipContent({ className }: { className: string }) {
  const classData = CLASS_DATA[className];
  if (!classData) return null;
  
  return (
    <div className="space-y-2 max-w-xs">
      <div className="font-bold text-sm">{classData.name}</div>
      <p className="text-xs text-muted-foreground">{classData.description}</p>
      <div className="space-y-1 text-xs">
        <div><span className="font-medium">Кость хитов:</span> {classData.hitDice}</div>
        <div><span className="font-medium">Спасброски:</span> {classData.savingThrows.map(s => ABILITY_LABELS[s].ru).join(", ")}</div>
        {classData.armorProficiencies.length > 0 && (
          <div><span className="font-medium">Доспехи:</span> {classData.armorProficiencies.join(", ")}</div>
        )}
        {classData.weaponProficiencies.length > 0 && (
          <div><span className="font-medium">Оружие:</span> {classData.weaponProficiencies.join(", ")}</div>
        )}
        {classData.toolProficiencies.length > 0 && (
          <div><span className="font-medium">Инструменты:</span> {classData.toolProficiencies.join(", ")}</div>
        )}
      </div>
    </div>
  );
}

function MulticlassEditor({
  classes,
  onClassesChange,
}: {
  classes: ClassEntry[];
  onClassesChange: (classes: ClassEntry[]) => void;
}) {
  const totalLevel = getTotalLevel(classes);

  const handleClassNameChange = (index: number, newName: string) => {
    const updated = classes.map((c, i) => i === index ? { ...c, name: newName } : c);
    onClassesChange(updated);
  };

  const handleClassLevelChange = (index: number, newLevel: number) => {
    const otherLevelsTotal = classes.reduce((sum, c, i) => i === index ? sum : sum + c.level, 0);
    const maxForThis = Math.max(1, 20 - otherLevelsTotal);
    const level = Math.max(1, Math.min(maxForThis, newLevel));
    const updated = classes.map((c, i) => i === index ? { ...c, level } : c);
    onClassesChange(updated);
  };

  const addClass = () => {
    if (totalLevel >= 20) return;
    const usedClasses = new Set(classes.map(c => c.name));
    const available = CLASSES.filter(c => !usedClasses.has(c));
    if (available.length === 0) return;
    onClassesChange([...classes, { name: available[0], level: 1 }]);
  };

  const removeClass = (index: number) => {
    if (classes.length <= 1) return;
    onClassesChange(classes.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs text-muted-foreground">Классы (общий ур. {totalLevel})</label>
        {totalLevel < 20 && classes.length < CLASSES.length && (
          <Button
            variant="ghost"
            size="sm"
            onClick={addClass}
            className="h-7 text-xs gap-1"
            data-testid="button-add-class"
          >
            <Plus className="w-3 h-3" />
            Добавить класс
          </Button>
        )}
      </div>
      {classes.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <Select value={entry.name} onValueChange={(v) => handleClassNameChange(index, v)}>
            <SelectTrigger className="flex-1 h-10 text-sm" data-testid={`select-class-${index}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CLASSES.map((cls) => (
                <SelectItem key={cls} value={cls} disabled={cls !== entry.name && classes.some(c => c.name === cls)}>
                  {cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            max={20}
            value={entry.level}
            onChange={(e) => handleClassLevelChange(index, parseInt(e.target.value) || 1)}
            className="w-16 h-10 text-center font-bold"
            data-testid={`input-class-level-${index}`}
          />
          {classes.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeClass(index)}
              className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive"
              data-testid={`button-remove-class-${index}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

function EditingFields({ 
  character, 
  onChange, 
  handleClassesChange, 
  handleRaceChange, 
  subraces 
}: { 
  character: Character;
  onChange: (updates: Partial<Character>) => void;
  handleClassesChange: (classes: ClassEntry[]) => void;
  handleRaceChange: (newRace: string) => void;
  subraces: string[];
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Имя персонажа</label>
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
        <Select value={character.race} onValueChange={handleRaceChange}>
          <SelectTrigger className="h-10 text-sm" data-testid="select-race">
            <SelectValue placeholder="Раса" />
          </SelectTrigger>
          <SelectContent>
            {RACES.map((race) => (
              <SelectItem key={race} value={race}>{race}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {subraces.length > 0 && (
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Подраса</label>
          <Select value={character.subrace || "none"} onValueChange={(value) => onChange({ subrace: value === "none" ? undefined : value })}>
            <SelectTrigger className="h-10 text-sm" data-testid="select-subrace">
              <SelectValue placeholder="Подраса" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Нет</SelectItem>
              {subraces.map((subrace) => (
                <SelectItem key={subrace} value={subrace}>{subrace}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <MulticlassEditor
        classes={getCharacterClasses(character)}
        onClassesChange={handleClassesChange}
      />

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Опыт (XP)</label>
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
        <Select value={character.alignment || ""} onValueChange={(value) => onChange({ alignment: value })}>
          <SelectTrigger className="h-10" data-testid="select-alignment">
            <SelectValue placeholder="Выберите" />
          </SelectTrigger>
          <SelectContent>
            {ALIGNMENTS.map((alignment) => (
              <SelectItem key={alignment} value={alignment}>{alignment}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

interface CharacterHeaderProps {
  character: Character;
  onChange: (updates: Partial<Character>) => void;
  isEditing: boolean;
}

export function CharacterHeader({ character, onChange, isEditing }: CharacterHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const charClasses = getCharacterClasses(character);
  const totalLevel = getTotalLevel(charClasses);
  const profBonus = getProficiencyBonus(totalLevel);
  const raceData = RACE_DATA[character.race];
  const subraces = raceData?.subraces ? Object.keys(raceData.subraces) : [];
  const xpProgress = getXPProgress(character.experience, totalLevel);
  const xpLevel = getLevelFromXP(character.experience);
  const canLevelUp = xpLevel > totalLevel && totalLevel < 20;

  const handleLevelUp = () => {
    const newLevel = Math.min(20, xpLevel);
    const levelDiff = newLevel - totalLevel;
    const newClasses = charClasses.map((c, i) =>
      i === 0 ? { ...c, level: c.level + levelDiff } : c
    );
    handleClassesChange(newClasses);
  };

  const handleClassesChange = (newClasses: ClassEntry[]) => {
    const newTotalLevel = getTotalLevel(newClasses);
    const primaryClass = newClasses[0];
    const primaryData = CLASS_DATA[primaryClass.name];

    const savingThrows = primaryData ? {
      STR: primaryData.savingThrows.includes("STR"),
      DEX: primaryData.savingThrows.includes("DEX"),
      CON: primaryData.savingThrows.includes("CON"),
      INT: primaryData.savingThrows.includes("INT"),
      WIS: primaryData.savingThrows.includes("WIS"),
      CHA: primaryData.savingThrows.includes("CHA"),
    } : character.savingThrows;

    const updates: Partial<Character> = {
      classes: newClasses,
      class: primaryClass.name,
      subclass: primaryClass.subclass,
      level: newTotalLevel,
      savingThrows,
      proficiencyBonus: getProficiencyBonus(newTotalLevel),
      hitDiceRemaining: newTotalLevel,
    };

    const casterClass = newClasses.find(c => CLASS_DATA[c.name]?.spellcastingAbility);
    if (casterClass) {
      const casterData = CLASS_DATA[casterClass.name]!;
      const existingSpellcasting = character.spellcasting ?? {
        ability: casterData.spellcastingAbility!,
        spellSlots: Array.from({ length: 9 }, () => ({ max: 0, used: 0 })),
        spells: [],
      };
      updates.spellcasting = {
        ...existingSpellcasting,
        ability: casterData.spellcastingAbility!,
      };
    }

    onChange(updates);
  };

  const handleRaceChange = (newRace: string) => {
    const newRaceData = RACE_DATA[newRace];
    onChange({ 
      race: newRace, 
      subrace: undefined,
      speed: newRaceData?.speed || 30
    });
  };

  return (
    <Card className="stat-card p-3 sm:p-4">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-accent/30 flex-shrink-0">
            {character.avatar ? (
              <AvatarImage src={character.avatar} alt={character.name} />
            ) : null}
            <AvatarFallback className="text-xl bg-accent/20">
              <User className="w-7 h-7 sm:w-8 sm:h-8 text-accent" />
            </AvatarFallback>
          </Avatar>

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
              <h1 className="text-lg sm:text-xl font-bold truncate" data-testid="text-character-name">{character.name}</h1>
            )}

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {isEditing && isDesktop ? (
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1 flex-1 min-w-[100px]">
                      <Select value={character.race} onValueChange={handleRaceChange}>
                        <SelectTrigger className="flex-1 h-10 text-sm" data-testid="select-race">
                          <SelectValue placeholder="Раса" />
                        </SelectTrigger>
                        <SelectContent>
                          {RACES.map((race) => (
                            <SelectItem key={race} value={race}>{race}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {character.race && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="flex-shrink-0" data-testid="button-race-info">
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="p-3">
                            <RaceTooltipContent raceName={character.race} subraceName={character.subrace} />
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    {subraces.length > 0 && (
                      <Select value={character.subrace || "none"} onValueChange={(value) => onChange({ subrace: value === "none" ? undefined : value })}>
                        <SelectTrigger className="flex-1 min-w-[100px] h-10 text-sm" data-testid="select-subrace">
                          <SelectValue placeholder="Подраса" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Нет</SelectItem>
                          {subraces.map((subrace) => (
                            <SelectItem key={subrace} value={subrace}>{subrace}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <MulticlassEditor
                    classes={charClasses}
                    onClassesChange={handleClassesChange}
                  />
                </div>
              ) : (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help" data-testid="badge-race">
                        <Badge variant="secondary" className="text-xs">
                          {character.race}{character.subrace ? ` (${character.subrace})` : ''}
                        </Badge>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="p-3">
                      <RaceTooltipContent raceName={character.race} subraceName={character.subrace} />
                    </TooltipContent>
                  </Tooltip>
                  {charClasses.map((entry, i) => (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <span className="cursor-help" data-testid={`badge-class-${i}`}>
                          <Badge variant="outline" className="text-xs">
                            {charClasses.length > 1 ? `${entry.name} ${entry.level}` : entry.name}
                          </Badge>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="p-3">
                        <ClassTooltipContent className={entry.name} />
                      </TooltipContent>
                    </Tooltip>
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
                <div className="text-center min-w-[50px]" data-testid="stat-level">
                  <div className="text-xs text-muted-foreground">Уровень</div>
                  <div className="text-xl sm:text-2xl font-bold">{totalLevel}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {charClasses.length > 1 ? (
                  <div className="space-y-1">
                    <p>Общий уровень: {totalLevel}</p>
                    {charClasses.map((c, i) => (
                      <p key={i} className="text-xs text-muted-foreground">{c.name}: {c.level}</p>
                    ))}
                  </div>
                ) : (
                  <p>Уровень персонажа от 1 до 20</p>
                )}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center px-2 sm:px-3 py-1 rounded-md bg-accent/10" data-testid="stat-proficiency">
                  <div className="text-xs text-muted-foreground">Мастерство</div>
                  <div className="text-lg sm:text-xl font-bold text-accent">{formatModifier(profBonus)}</div>
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

      <div className="mt-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="space-y-1" data-testid="stat-xp-progress">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Опыт: {character.experience.toLocaleString()} XP</span>
                <span>
                  {totalLevel < 20 
                    ? `До ${totalLevel + 1} уровня: ${(xpProgress.next - character.experience).toLocaleString()} XP`
                    : 'Максимальный уровень'
                  }
                </span>
              </div>
              <Progress value={xpProgress.progress} className="h-2" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Прогресс опыта</p>
            <p className="text-xs text-muted-foreground">
              {xpProgress.current.toLocaleString()} / {xpProgress.next.toLocaleString()} XP
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
            <Select value={character.alignment || ""} onValueChange={(value) => onChange({ alignment: value })}>
              <SelectTrigger className="h-10" data-testid="select-alignment">
                <SelectValue placeholder="Выберите" />
              </SelectTrigger>
              <SelectContent>
                {ALIGNMENTS.map((alignment) => (
                  <SelectItem key={alignment} value={alignment}>{alignment}</SelectItem>
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
              onChange={(e) => onChange({ experience: parseInt(e.target.value) || 0 })}
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
                <DrawerDescription>Измените параметры вашего персонажа</DrawerDescription>
              </DrawerHeader>
              <EditingFields
                character={character}
                onChange={onChange}
                handleClassesChange={handleClassesChange}
                handleRaceChange={handleRaceChange}
                subraces={subraces}
              />
              <DrawerFooter>
                <Button onClick={() => setDrawerOpen(false)}>Готово</Button>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </Card>
  );
}
