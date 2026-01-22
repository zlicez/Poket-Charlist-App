import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Edit2, Play, User, Sparkles, Scroll, BookOpen, Info } from "lucide-react";
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
  XP_THRESHOLDS
} from "@shared/schema";
import type { Character, AbilityName } from "@shared/schema";

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

interface CharacterHeaderProps {
  character: Character;
  onChange: (updates: Partial<Character>) => void;
  isEditing: boolean;
  onToggleMode: () => void;
}

export function CharacterHeader({ character, onChange, isEditing, onToggleMode }: CharacterHeaderProps) {
  const profBonus = getProficiencyBonus(character.level);
  const classData = CLASS_DATA[character.class];
  const raceData = RACE_DATA[character.race];
  const subraces = raceData?.subraces ? Object.keys(raceData.subraces) : [];
  const xpProgress = getXPProgress(character.experience, character.level);

  const handleClassChange = (newClass: string) => {
    const newClassData = CLASS_DATA[newClass];
    if (newClassData) {
      const savingThrows = {
        STR: newClassData.savingThrows.includes("STR"),
        DEX: newClassData.savingThrows.includes("DEX"),
        CON: newClassData.savingThrows.includes("CON"),
        INT: newClassData.savingThrows.includes("INT"),
        WIS: newClassData.savingThrows.includes("WIS"),
        CHA: newClassData.savingThrows.includes("CHA"),
      };
      onChange({ 
        class: newClass,
        hitDice: `${character.level}${newClassData.hitDice}`,
        savingThrows
      });
    } else {
      onChange({ class: newClass });
    }
  };

  const handleRaceChange = (newRace: string) => {
    const newRaceData = RACE_DATA[newRace];
    onChange({ 
      race: newRace, 
      subrace: undefined,
      speed: newRaceData?.speed || 30
    });
  };

  const handleLevelChange = (newLevel: number) => {
    const level = Math.min(20, Math.max(1, newLevel));
    const newProfBonus = getProficiencyBonus(level);
    onChange({ 
      level,
      proficiencyBonus: newProfBonus,
      hitDice: classData ? `${level}${classData.hitDice}` : `${level}d10`,
      hitDiceRemaining: level
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
            {isEditing ? (
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
              {isEditing ? (
                <div className="flex flex-wrap gap-2 w-full">
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
                  <div className="flex items-center gap-1 flex-1 min-w-[100px]">
                    <Select value={character.class} onValueChange={handleClassChange}>
                      <SelectTrigger className="flex-1 h-10 text-sm" data-testid="select-class">
                        <SelectValue placeholder="Класс" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLASSES.map((cls) => (
                          <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {character.class && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="flex-shrink-0" data-testid="button-class-info">
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="p-3">
                          <ClassTooltipContent className={character.class} />
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help" data-testid="badge-class">
                        <Badge variant="outline" className="text-xs">
                          {character.class}
                        </Badge>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="p-3">
                      <ClassTooltipContent className={character.class} />
                    </TooltipContent>
                  </Tooltip>
                  {classData && (
                    <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                      {classData.hitDice}
                    </Badge>
                  )}
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
                  <div className="text-[10px] sm:text-xs text-muted-foreground">Уровень</div>
                  {isEditing ? (
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={20}
                      value={character.level}
                      onChange={(e) => handleLevelChange(parseInt(e.target.value) || 1)}
                      className="w-14 h-10 text-center text-lg font-bold"
                      data-testid="input-level"
                    />
                  ) : (
                    <div className="text-xl sm:text-2xl font-bold">{character.level}</div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Уровень персонажа от 1 до 20</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center px-2 sm:px-3 py-1 rounded-md bg-accent/10" data-testid="stat-proficiency">
                  <div className="text-[10px] sm:text-xs text-muted-foreground">Мастерство</div>
                  <div className="text-lg sm:text-xl font-bold text-accent">{formatModifier(profBonus)}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Бонус мастерства</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Button
            variant={isEditing ? "default" : "outline"}
            onClick={onToggleMode}
            className="gap-1.5 h-10 px-3 sm:px-4"
            data-testid="button-toggle-mode"
          >
            {isEditing ? (
              <>
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">Режим игры</span>
                <span className="sm:hidden">Играть</span>
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4" />
                <span className="hidden sm:inline">Редактировать</span>
                <span className="sm:hidden">Ред.</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="space-y-1" data-testid="stat-xp-progress">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Опыт: {character.experience.toLocaleString()} XP</span>
                <span>
                  {character.level < 20 
                    ? `До ${character.level + 1} уровня: ${(xpProgress.next - character.experience).toLocaleString()} XP`
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
      </div>

      {isEditing && (
        <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <div>
            <label className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1 mb-1">
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
            <label className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1 mb-1">
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
            <label className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1 mb-1">
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
    </Card>
  );
}
