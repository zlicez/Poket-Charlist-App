import { generateId } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sparkles, Lock, Unlock } from "lucide-react";
import type { Feature } from "@shared/schema";

import { AddFeatureDialog } from "./features/AddFeatureDialog";
import { FeatureItem } from "./features/FeatureItem";

interface FeaturesListProps {
  features: Feature[];
  // Discrete-дорожка (keyed ops). Если заданы — add/edit/remove идут через них;
  // иначе fallback на `onChange` (полная запись массива).
  onUpsertFeature?: (feature: Feature) => void;
  onRemoveFeature?: (id: string) => void;
  onChange: (features: Feature[]) => void;
  isEditing: boolean;
  isLocked?: boolean;
  onToggleLock?: () => void;
}

export function FeaturesList({
  features,
  onUpsertFeature,
  onRemoveFeature,
  onChange,
  isEditing,
  isLocked = false,
  onToggleLock,
}: FeaturesListProps) {
  const canModify = isEditing || !isLocked;

  const addFeature = (feature: Omit<Feature, "id">) => {
    const newFeature: Feature = { ...feature, id: generateId() };
    if (onUpsertFeature) {
      onUpsertFeature(newFeature);
    } else {
      onChange([...features, newFeature]);
    }
  };

  const removeFeature = (id: string) => {
    if (onRemoveFeature) {
      onRemoveFeature(id);
    } else {
      onChange(features.filter((feature) => feature.id !== id));
    }
  };

  const updateFeature = (updated: Feature) => {
    if (onUpsertFeature) {
      onUpsertFeature(updated);
    } else {
      onChange(features.map((f) => (f.id === updated.id ? updated : f)));
    }
  };

  return (
    <Card className="stat-card p-2 sm:p-3">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <h3 className="font-semibold text-sm">Способности и черты</h3>
        </div>
        <div className="flex items-center gap-1">
          {!isEditing && onToggleLock && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleLock}
                  className={`h-9 w-9 sm:h-8 sm:w-8 ${
                    isLocked ? "text-muted-foreground" : "text-accent"
                  }`}
                  data-testid="button-toggle-features-lock"
                >
                  {isLocked ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <Unlock className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isLocked
                  ? "Разблокировать редактирование"
                  : "Заблокировать редактирование"}
              </TooltipContent>
            </Tooltip>
          )}
          {canModify && <AddFeatureDialog onAdd={addFeature} />}
        </div>
      </div>

      {features.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground text-xs">
          {isEditing
            ? 'Нажмите "Добавить" чтобы добавить способность'
            : "Нет способностей"}
        </div>
      ) : (
        <div className="space-y-2">
          {features.map((feature) => (
            <FeatureItem
              key={feature.id}
              feature={feature}
              onRemove={() => removeFeature(feature.id)}
              onEdit={updateFeature}
              canModify={canModify}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
