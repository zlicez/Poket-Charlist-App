import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RichTextContent } from "@/components/RichTextContent";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Edit2,
  Eye,
  Ruler,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { Spell } from "@shared/schema";

import { EditSpellDialog } from "./EditSpellDialog";

export function SpellCard({
  spell,
  isEditing,
  onRemove,
  onTogglePrepared,
  onUpdate,
}: {
  spell: Spell;
  isEditing: boolean;
  onRemove: () => void;
  onTogglePrepared: () => void;
  onUpdate: (updated: Spell) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`border rounded-md px-2.5 py-1.5 text-sm transition-colors ${
        spell.prepared
          ? "border-border bg-card"
          : "border-border/50 bg-muted/30 opacity-60"
      }`}
      data-testid={`spell-card-${spell.id}`}
    >
      <div className="flex items-center gap-1.5">
        {spell.level > 0 && (
          <Checkbox
            checked={spell.prepared}
            onCheckedChange={() => onTogglePrepared()}
            className="shrink-0"
            data-testid={`checkbox-spell-prepared-${spell.id}`}
          />
        )}
        <button
          className="flex-1 flex items-center gap-1.5 text-left min-w-0"
          onClick={() => setExpanded(!expanded)}
          data-testid={`button-expand-spell-${spell.id}`}
        >
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
          )}
          <span className="font-medium truncate">{spell.name}</span>
          {spell.concentration && (
            <Badge
              variant="outline"
              className="text-[10px] px-1 py-0 h-4 shrink-0"
            >
              К
            </Badge>
          )}
          {spell.ritual && (
            <Badge
              variant="outline"
              className="text-[10px] px-1 py-0 h-4 shrink-0"
            >
              Р
            </Badge>
          )}
        </button>
        {isEditing && (
          <div className="flex items-center gap-0.5 shrink-0">
            <EditSpellDialog
              spell={spell}
              onSave={onUpdate}
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  data-testid={`button-edit-spell-${spell.id}`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
              }
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              onClick={onRemove}
              data-testid={`button-remove-spell-${spell.id}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
      {expanded && (
        <div className="mt-2 space-y-1 text-xs text-muted-foreground pl-5">
          {spell.castingTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{spell.castingTime}</span>
            </div>
          )}
          {spell.range && (
            <div className="flex items-center gap-1">
              <Ruler className="w-3 h-3" />
              <span>{spell.range}</span>
            </div>
          )}
          {spell.components && (
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{spell.components}</span>
            </div>
          )}
          {spell.duration && (
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{spell.duration}</span>
            </div>
          )}
          {spell.description && (
            <RichTextContent
              content={spell.description}
              className="mt-1"
              testId={`spell-description-${spell.id}`}
            />
          )}
        </div>
      )}
    </div>
  );
}
