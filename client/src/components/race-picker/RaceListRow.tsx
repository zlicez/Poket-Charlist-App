import { Check, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RaceDefinition } from "@shared/schema";

export function RaceListRow({
  race,
  isSelected,
  isActive,
  onClick,
}: {
  race: RaceDefinition;
  isSelected: boolean;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-2 py-2.5 rounded-md text-sm transition-colors text-left",
        isActive
          ? "bg-accent/15 text-foreground"
          : "hover:bg-muted/60 text-foreground",
      )}
      data-testid={`race-option-${race.id}`}
    >
      <div className="w-4 shrink-0">
        {isSelected && <Check className="w-4 h-4 text-accent" />}
      </div>
      <span className="flex-1 font-medium">{race.name}</span>
      <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
        {race.entityType === "lineage" && (
          <span className="text-[9px] font-semibold text-purple-500 uppercase tracking-wide">ЛИН</span>
        )}
        {(race.darkvision ?? 0) > 0
          ? <Eye className="w-3 h-3" />
          : <div className="w-3" />
        }
        <span className={cn(
          "text-[9px] font-semibold uppercase w-[14px] text-center",
          race.size === "Small" ? "text-amber-500" : "text-muted-foreground/40",
        )}>
          {race.size === "Small" ? "S" : "M"}
        </span>
        <span className="text-[10px] tabular-nums w-[28px] text-right">{race.speed}фт</span>
      </div>
    </button>
  );
}
