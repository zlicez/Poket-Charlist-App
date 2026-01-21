import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { calculateModifier, formatModifier, getProficiencyBonus, type AbilityName, type SkillProficiency } from "@shared/schema";
import { Dices, Star } from "lucide-react";

interface SkillItemProps {
  name: string;
  ability: AbilityName;
  abilityScore: number;
  level: number;
  proficiency: SkillProficiency;
  onProficiencyChange: (proficiency: SkillProficiency) => void;
  onRoll: () => void;
  isEditing: boolean;
}

const SKILL_TOOLTIPS: Record<string, string> = {
  "Акробатика": "Проверки равновесия, кувырков и сложных манёвров. Используется при попытке устоять на ногах или выполнить трюк.",
  "Анализ": "Поиск улик, разгадывание загадок, оценка слабых мест противника. Используется для логических умозаключений.",
  "Атлетика": "Лазание, плавание, прыжки и силовые действия. Используется при борьбе, толкании и физических испытаниях.",
  "Восприятие": "Заметить скрытое, услышать шорох, почувствовать опасность. Один из самых важных навыков в игре.",
  "Выживание": "Следопытство, охота, ориентирование на местности и выживание в дикой природе.",
  "Выступление": "Музыка, танцы, актёрское мастерство и развлечение публики.",
  "Запугивание": "Угрозы, демонстрация силы и давление на собеседника для получения информации или послушания.",
  "История": "Знание исторических событий, легенд, королевств и значимых личностей прошлого.",
  "Ловкость рук": "Фокусы, карманные кражи, подбрасывание предметов и манипуляции с мелкими объектами.",
  "Магия": "Знание заклинаний, магических предметов, традиций и существ связанных с магией.",
  "Медицина": "Стабилизация умирающего, диагностика болезней и базовая помощь раненым.",
  "Обман": "Ложь, маскировка, создание ложных впечатлений и введение в заблуждение.",
  "Природа": "Знание растений, животных, погоды и природных явлений.",
  "Проницательность": "Чтение намерений, распознавание лжи и понимание истинных мотивов собеседника.",
  "Религия": "Знание богов, религиозных обрядов, священных символов и небесных существ.",
  "Скрытность": "Незаметное передвижение, прятки и избегание обнаружения.",
  "Убеждение": "Дипломатия, торговля, просьбы и честное влияние на мнение других.",
  "Уход за животными": "Успокоить животное, понять его поведение, управлять скакуном.",
};

export function SkillItem({
  name,
  ability,
  abilityScore,
  level,
  proficiency,
  onProficiencyChange,
  onRoll,
  isEditing,
}: SkillItemProps) {
  const abilityMod = calculateModifier(abilityScore);
  const profBonus = getProficiencyBonus(level);
  
  let skillBonus = abilityMod;
  if (proficiency.expertise) {
    skillBonus += profBonus * 2;
  } else if (proficiency.proficient) {
    skillBonus += profBonus;
  }

  const handleProficiencyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!proficiency.proficient) {
      onProficiencyChange({ proficient: true, expertise: false });
    } else if (!proficiency.expertise) {
      onProficiencyChange({ proficient: true, expertise: true });
    } else {
      onProficiencyChange({ proficient: false, expertise: false });
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer hover-elevate active-elevate-2 ${
            proficiency.proficient ? 'bg-accent/10' : ''
          }`}
          onClick={() => !isEditing && onRoll()}
          data-testid={`skill-${name.toLowerCase().replace(/\s/g, '-')}`}
        >
          {isEditing ? (
            <div 
              className="flex items-center justify-center w-5 h-5 cursor-pointer"
              onClick={handleProficiencyClick}
              data-testid={`checkbox-skill-${name.toLowerCase().replace(/\s/g, '-')}`}
            >
              {proficiency.expertise ? (
                <Star className="w-4 h-4 text-accent fill-accent" />
              ) : proficiency.proficient ? (
                <div className="w-3 h-3 rounded-full bg-accent" />
              ) : (
                <div className="w-3 h-3 rounded-full border-2 border-muted-foreground" />
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center w-5 h-5">
              {proficiency.expertise ? (
                <Star className="w-4 h-4 text-accent fill-accent" />
              ) : proficiency.proficient ? (
                <div className="w-3 h-3 rounded-full bg-accent" />
              ) : (
                <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/30" />
              )}
            </div>
          )}
          
          <span className={`text-sm flex-1 ${proficiency.proficient ? 'font-medium' : 'text-muted-foreground'}`}>
            {name}
          </span>
          
          <span className="text-xs text-muted-foreground uppercase">
            {ability}
          </span>
          
          <span className={`text-sm font-bold min-w-[2rem] text-right ${
            skillBonus >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {formatModifier(skillBonus)}
          </span>

          {!isEditing && (
            <Dices className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-xs">
        <p className="font-semibold">{name} ({ability})</p>
        <p className="text-sm text-muted-foreground mt-1">{SKILL_TOOLTIPS[name]}</p>
        <div className="text-xs mt-2 space-y-0.5">
          <p>Модификатор {ability}: {formatModifier(abilityMod)}</p>
          {proficiency.proficient && (
            <p>Бонус мастерства: +{proficiency.expertise ? profBonus * 2 : profBonus}</p>
          )}
          {proficiency.expertise && (
            <p className="text-accent">Экспертность (x2)</p>
          )}
        </div>
        {!isEditing && (
          <p className="text-xs text-muted-foreground mt-2">Нажмите для проверки навыка</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
