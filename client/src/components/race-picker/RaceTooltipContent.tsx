import {
  type AbilityName,
  RACE_DATA,
  getRaceCreatureType,
  getRaceResistances,
  getRaceSpeed,
  getRacialBonuses,
} from "@shared/schema";

import { formatAbilityBonuses } from "./ability-bonuses";

export function RaceTooltipContent({
  raceName,
  subraceName,
  selectedRacialAbilityBonuses,
}: {
  raceName: string;
  subraceName?: string;
  selectedRacialAbilityBonuses?: Partial<Record<AbilityName, number>>;
}) {
  const raceData = RACE_DATA[raceName];
  if (!raceData) return null;

  const subraceData = subraceName
    ? raceData.subraces?.[subraceName]
    : undefined;
  const combinedBonuses = getRacialBonuses(
    raceName,
    subraceName,
    selectedRacialAbilityBonuses,
  );
  const formattedBonuses = formatAbilityBonuses(combinedBonuses);
  const bonusSummary =
    formattedBonuses ||
    raceData.abilityBonusSelection?.description ||
    "Нет";

  const subraceDescription =
    subraceData && typeof subraceData === "object"
      ? subraceData.description
      : undefined;

  const effectiveSpeed = getRaceSpeed(raceName, subraceName);
  const resistances = getRaceResistances(raceName, subraceName);
  const creatureType = getRaceCreatureType(raceName);

  return (
    <div className="space-y-2 max-w-xs">
      <div className="font-bold text-sm">
        {raceName}
        {subraceName ? ` (${subraceName})` : ""}
        <span className="font-normal text-muted-foreground ml-1 text-xs">
          [{raceData.source}]
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{raceData.description}</p>
      {subraceDescription && (
        <p className="text-xs italic">{subraceDescription}</p>
      )}
      <div className="space-y-1 text-xs">
        <div>
          <span className="font-medium">Бонусы:</span>{" "}
          {bonusSummary}
        </div>
        <div>
          <span className="font-medium">Скорость:</span> {effectiveSpeed} фт.
        </div>
        <div>
          <span className="font-medium">Тип существа:</span> {creatureType}
        </div>
        <div>
          <span className="font-medium">Размер:</span>{" "}
          {raceData.size === "Small" ? "Маленький" : raceData.size === "Large" ? "Большой" : "Средний"}
        </div>
        {resistances.length > 0 && (
          <div>
            <span className="font-medium">Сопротивления:</span>{" "}
            {resistances.join(", ")}
          </div>
        )}
        <div>
          <span className="font-medium">Языки:</span>{" "}
          {raceData.languages.join(", ")}
        </div>
        <div>
          <span className="font-medium">Особенности:</span>
          <ul className="list-disc list-inside ml-1">
            {raceData.traits.map((trait, i) => (
              <li key={i}>{typeof trait === "string" ? trait : trait.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
