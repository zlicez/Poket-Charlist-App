import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { PROFICIENCY_CATEGORY_LABELS } from "@shared/schema";
import type { ProficiencyCategory } from "@shared/schema";

import { AddProficiencyDialog } from "./AddProficiencyDialog";
import { CATEGORY_ICONS } from "./constants";

export function ProficiencyCategoryWithAuto({
  category,
  items,
  autoItems,
  isEditing,
  onAdd,
  onRemove,
}: {
  category: ProficiencyCategory;
  items: string[];
  autoItems: string[];
  isEditing: boolean;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const Icon = CATEGORY_ICONS[category];
  const label = PROFICIENCY_CATEGORY_LABELS[category];

  const resolvedAutoItems = autoItems.filter((i) => i !== "Один на выбор");
  const pendingChoices = autoItems.filter((i) => i === "Один на выбор").length;
  const allItems = Array.from(new Set([...resolvedAutoItems, ...items]));
  const totalCount = allItems.length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 p-1 h-auto" data-testid={`toggle-auto-${category}`}>
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <Icon className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{label}</span>
            <Badge variant="secondary" className="ml-1">{totalCount}</Badge>
            {pendingChoices > 0 && (
              <Badge variant="outline" className="ml-0.5 border-dashed text-muted-foreground text-xs">
                +{pendingChoices}
              </Badge>
            )}
          </Button>
        </CollapsibleTrigger>
        {isEditing && (
          <AddProficiencyDialog
            category={category}
            existingProficiencies={allItems}
            onAdd={onAdd}
          />
        )}
      </div>

      <CollapsibleContent>
        <div className="flex flex-wrap gap-1.5 mt-2 pl-6">
          {totalCount === 0 && pendingChoices === 0 ? (
            <p className="text-xs text-muted-foreground italic">Нет владений</p>
          ) : (
            <>
              {autoItems.map((item) => {
                // "Один на выбор" that hasn't been resolved yet — show as pending
                if (item === "Один на выбор") {
                  return (
                    <Badge
                      key="pending-lang-choice"
                      variant="outline"
                      className="gap-1 border-dashed text-muted-foreground text-xs italic"
                    >
                      + выберите язык
                    </Badge>
                  );
                }
                return (
                  <HelpTooltip
                    key={`auto-${item}`}
                    content={<p className="text-xs">От расы/класса</p>}
                    side="top"
                    asChild
                  >
                    <span>
                      <Badge
                        variant="secondary"
                        className="gap-1 cursor-help"
                        data-testid={`proficiency-auto-${category}-${item}`}
                      >
                        {item}
                      </Badge>
                    </span>
                  </HelpTooltip>
                );
              })}
              {items.filter(item => !autoItems.includes(item)).map((item) => (
                <Badge
                  key={item}
                  variant="outline"
                  className="gap-1"
                  data-testid={`proficiency-${category}-${item}`}
                >
                  {item}
                  {isEditing && (
                    <button
                      onClick={() => onRemove(item)}
                      className="ml-1 hover:text-destructive"
                      data-testid={`remove-proficiency-${item}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
