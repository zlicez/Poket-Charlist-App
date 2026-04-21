import { ABILITY_LABELS, CLASS_DATA } from "@shared/schema";

export function ClassTooltipContent({ className }: { className: string }) {
  const classData = CLASS_DATA[className];
  if (!classData) return null;

  return (
    <div className="space-y-2 max-w-xs">
      <div className="font-bold text-sm">{classData.name}</div>
      <p className="text-xs text-muted-foreground">{classData.description}</p>
      <div className="space-y-1 text-xs">
        <div>
          <span className="font-medium">Кость хитов:</span> {classData.hitDice}
        </div>
        <div>
          <span className="font-medium">Спасброски:</span>{" "}
          {classData.savingThrows.map((s) => ABILITY_LABELS[s].ru).join(", ")}
        </div>
        {classData.armorProficiencies.length > 0 && (
          <div>
            <span className="font-medium">Доспехи:</span>{" "}
            {classData.armorProficiencies.join(", ")}
          </div>
        )}
        {classData.weaponProficiencies.length > 0 && (
          <div>
            <span className="font-medium">Оружие:</span>{" "}
            {classData.weaponProficiencies.join(", ")}
          </div>
        )}
        {classData.toolProficiencies.length > 0 && (
          <div>
            <span className="font-medium">Инструменты:</span>{" "}
            {classData.toolProficiencies.join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}
