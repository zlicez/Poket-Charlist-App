import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { RichTextContent } from "@/components/RichTextContent";
import { ChevronDown, ChevronRight, Edit2, Trash2 } from "lucide-react";
import type { Feature } from "@shared/schema";

import { EditFeatureDialog } from "./EditFeatureDialog";

export function FeatureItem({
  feature,
  onRemove,
  onEdit,
  canModify,
}: {
  feature: Feature;
  onRemove: () => void;
  onEdit: (updated: Feature) => void;
  canModify: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div
          className="rounded-md bg-muted/30 overflow-hidden"
          data-testid={`feature-${feature.id}`}
        >
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center gap-2 p-2 hover-elevate min-h-[44px] sm:min-h-0">
              {isOpen ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
              <span className="font-medium text-sm text-left flex-1">
                {feature.name}
              </span>
              {feature.source && (
                <Badge variant="outline" className="text-xs shrink-0">
                  {feature.source}
                </Badge>
              )}
              {canModify && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground shrink-0 h-9 w-9 sm:h-8 sm:w-8"
                  onClick={(e) => { e.stopPropagation(); setEditOpen(true); }}
                  data-testid={`button-edit-feature-${feature.id}`}
                >
                  <Edit2 className="w-4 h-4 sm:w-3 sm:h-3" />
                </Button>
              )}
              {canModify && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive shrink-0 h-9 w-9 sm:h-8 sm:w-8"
                  onClick={(e) => { e.stopPropagation(); onRemove(); }}
                  data-testid={`button-remove-feature-${feature.id}`}
                >
                  <Trash2 className="w-4 h-4 sm:w-3 sm:h-3" />
                </Button>
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-2 pb-2 pt-0">
              <RichTextContent
                content={feature.description}
                className="pl-6"
                emptyState="Описание отсутствует"
                testId={`feature-description-${feature.id}`}
              />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      <EditFeatureDialog
        feature={feature}
        onSave={onEdit}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
