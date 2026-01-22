import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sparkles, Plus, Trash2, ChevronDown, ChevronRight, Lock, Unlock } from "lucide-react";
import type { Feature } from "@shared/schema";

interface FeaturesListProps {
  features: Feature[];
  onChange: (features: Feature[]) => void;
  isEditing: boolean;
  isLocked?: boolean;
  onToggleLock?: () => void;
}

function AddFeatureDialog({ onAdd }: { onAdd: (feature: Omit<Feature, "id">) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [source, setSource] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({ name, source, description });
    setName("");
    setSource("");
    setDescription("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1" data-testid="button-add-feature">
          <Plus className="w-4 h-4" />
          Добавить
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить способность</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">Название</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Второе дыхание"
              data-testid="input-feature-name"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Источник</label>
            <Input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Воин 1"
              data-testid="input-feature-source"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Описание</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите, как работает эта способность..."
              rows={4}
              data-testid="input-feature-description"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
          <Button onClick={handleSubmit} data-testid="button-save-feature">Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FeatureItem({ feature, onRemove, canModify }: { feature: Feature; onRemove: () => void; canModify: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-md bg-muted/30 overflow-hidden" data-testid={`feature-${feature.id}`}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center gap-2 p-2 hover-elevate">
            {isOpen ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
            <span className="font-medium text-sm text-left flex-1">{feature.name}</span>
            {feature.source && (
              <Badge variant="outline" className="text-xs shrink-0">{feature.source}</Badge>
            )}
            {canModify && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-destructive shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                data-testid={`button-remove-feature-${feature.id}`}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-2 pb-2 pt-0">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-6">
              {feature.description || "Описание отсутствует"}
            </p>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function FeaturesList({ features, onChange, isEditing, isLocked = false, onToggleLock }: FeaturesListProps) {
  const canModify = isEditing || !isLocked;

  const addFeature = (feature: Omit<Feature, "id">) => {
    onChange([...features, { ...feature, id: crypto.randomUUID() }]);
  };

  const removeFeature = (id: string) => {
    onChange(features.filter((f) => f.id !== id));
  };

  return (
    <Card className="stat-card p-2 sm:p-3">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <h3 className="font-semibold text-xs sm:text-sm">Способности и черты</h3>
        </div>
        <div className="flex items-center gap-1">
          {!isEditing && onToggleLock && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleLock}
                  className={isLocked ? "text-muted-foreground" : "text-accent"}
                  data-testid="button-toggle-features-lock"
                >
                  {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isLocked ? "Разблокировать редактирование" : "Заблокировать редактирование"}
              </TooltipContent>
            </Tooltip>
          )}
          {canModify && <AddFeatureDialog onAdd={addFeature} />}
        </div>
      </div>

      {features.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground text-sm">
          {isEditing ? "Нажмите \"Добавить\" чтобы добавить способность" : "Нет способностей"}
        </div>
      ) : (
        <div className="space-y-2">
          {features.map((feature) => (
            <FeatureItem 
              key={feature.id}
              feature={feature}
              onRemove={() => removeFeature(feature.id)}
              canModify={canModify}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
