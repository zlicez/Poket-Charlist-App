import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Edit2, Play, User, Sparkles, Scroll, BookOpen } from "lucide-react";
import { 
  CLASSES, 
  RACES, 
  ALIGNMENTS, 
  RACE_DATA,
  CLASS_DATA,
  getProficiencyBonus, 
  formatModifier,
  getXPProgress,
  XP_THRESHOLDS
} from "@shared/schema";
import type { Character } from "@shared/schema";

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
    <Card className="stat-card p-4">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20 border-2 border-accent/30">
            {character.avatar ? (
              <AvatarImage src={character.avatar} alt={character.name} />
            ) : null}
            <AvatarFallback className="text-2xl bg-accent/20">
              <User className="w-10 h-10 text-accent" />
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            {isEditing ? (
              <Input
                value={character.name}
                onChange={(e) => onChange({ name: e.target.value })}
                className="text-xl font-bold h-8"
                placeholder="Имя персонажа"
                data-testid="input-name"
              />
            ) : (
              <h1 className="text-xl font-bold" data-testid="text-character-name">{character.name}</h1>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {isEditing ? (
                <>
                  <Select value={character.race} onValueChange={handleRaceChange}>
                    <SelectTrigger className="w-32 h-7 text-xs" data-testid="select-race">
                      <SelectValue placeholder="Раса" />
                    </SelectTrigger>
                    <SelectContent>
                      {RACES.map((race) => (
                        <SelectItem key={race} value={race}>{race}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {subraces.length > 0 && (
                    <Select value={character.subrace || "none"} onValueChange={(value) => onChange({ subrace: value === "none" ? undefined : value })}>
                      <SelectTrigger className="w-32 h-7 text-xs" data-testid="select-subrace">
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
                  <Select value={character.class} onValueChange={handleClassChange}>
                    <SelectTrigger className="w-32 h-7 text-xs" data-testid="select-class">
                      <SelectValue placeholder="Класс" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASSES.map((cls) => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <>
                  <Badge variant="secondary">{character.race}{character.subrace ? ` (${character.subrace})` : ''}</Badge>
                  <Badge variant="outline">{character.class}</Badge>
                  {classData && (
                    <Badge variant="outline" className="text-xs">
                      Кость хитов: {classData.hitDice}
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex flex-wrap items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center" data-testid="stat-level">
                <div className="text-xs text-muted-foreground">Уровень</div>
                {isEditing ? (
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={character.level}
                    onChange={(e) => handleLevelChange(parseInt(e.target.value) || 1)}
                    className="w-14 h-8 text-center text-lg font-bold"
                    data-testid="input-level"
                  />
                ) : (
                  <div className="text-2xl font-bold">{character.level}</div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Уровень персонажа от 1 до 20</p>
              <p className="text-xs text-muted-foreground">Определяет бонус мастерства и доступные способности</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center px-3 py-1 rounded-md bg-accent/10" data-testid="stat-proficiency">
                <div className="text-xs text-muted-foreground">Бонус мастерства</div>
                <div className="text-xl font-bold text-accent">{formatModifier(profBonus)}</div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Бонус мастерства добавляется к:</p>
              <ul className="text-xs text-muted-foreground list-disc pl-4 mt-1">
                <li>Проверкам навыков с владением</li>
                <li>Спасброскам с владением</li>
                <li>Броскам атаки с владением оружием</li>
                <li>КС ваших заклинаний</li>
              </ul>
            </TooltipContent>
          </Tooltip>

          <Button
            variant={isEditing ? "default" : "outline"}
            onClick={onToggleMode}
            className="gap-2"
            data-testid="button-toggle-mode"
          >
            {isEditing ? (
              <>
                <Play className="w-4 h-4" />
                Режим игры
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4" />
                Редактировать
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
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <Scroll className="w-3 h-3" />
              Предыстория
            </label>
            <Input
              value={character.background || ""}
              onChange={(e) => onChange({ background: e.target.value })}
              placeholder="Например: Народный герой"
              className="h-8"
              data-testid="input-background"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Мировоззрение
            </label>
            <Select value={character.alignment || ""} onValueChange={(value) => onChange({ alignment: value })}>
              <SelectTrigger className="h-8" data-testid="select-alignment">
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
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              Опыт (XP)
            </label>
            <Input
              type="number"
              min={0}
              value={character.experience}
              onChange={(e) => onChange({ experience: parseInt(e.target.value) || 0 })}
              className="h-8"
              data-testid="input-experience"
            />
          </div>
        </div>
      )}
    </Card>
  );
}
