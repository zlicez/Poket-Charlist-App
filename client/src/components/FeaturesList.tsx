import { useState } from "react";

import { generateId } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ResponsiveDialog,
  ResponsiveDialogTrigger,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { RichTextContent } from "@/components/RichTextContent";
import { RichTextField } from "@/components/RichTextField";
import {
  Sparkles,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Lock,
  Unlock,
  Edit2,
} from "lucide-react";
import type { Feature } from "@shared/schema";

interface FeaturesListProps {
  features: Feature[];
  onChange: (features: Feature[]) => void;
  isEditing: boolean;
  isLocked?: boolean;
  onToggleLock?: () => void;
}

function AddFeatureDialog({
  onAdd,
}: {
  onAdd: (feature: Omit<Feature, "id">) => void;
}) {
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
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 h-9 sm:h-8"
          data-testid="button-add-feature"
        >
          <Plus className="w-4 h-4" />
          Добавить
        </Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Добавить способность</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">Название</label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Второе дыхание"
              data-testid="input-feature-name"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Источник</label>
            <Input
              value={source}
              onChange={(event) => setSource(event.target.value)}
              placeholder="Воин 1"
              data-testid="input-feature-source"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Описание</label>
            <RichTextField
              value={description}
              onChange={setDescription}
              placeholder="Опишите, как работает эта способность..."
              rows={4}
              textareaTestId="input-feature-description"
              previewTestId="preview-feature-description"
              previewContainerClassName="min-h-[140px]"
            />
          </div>
        </div>
        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} data-testid="button-save-feature">
            Сохранить
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

function EditFeatureDialog({
  feature,
  onSave,
  open,
  onOpenChange,
}: {
  feature: Feature;
  onSave: (updated: Feature) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState(feature.name);
  const [source, setSource] = useState(feature.source || "");
  const [description, setDescription] = useState(feature.description || "");

  // Sync fields when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setName(feature.name);
      setSource(feature.source || "");
      setDescription(feature.description || "");
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({ ...feature, name, source, description });
    onOpenChange(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Редактировать способность</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">Название</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Второе дыхание"
              data-testid="input-edit-feature-name"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Источник</label>
            <Input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Воин 1"
              data-testid="input-edit-feature-source"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Описание</label>
            <RichTextField
              value={description}
              onChange={setDescription}
              placeholder="Опишите, как работает эта способность..."
              rows={4}
              textareaTestId="input-edit-feature-description"
              previewTestId="preview-edit-feature-description"
              previewContainerClassName="min-h-[140px]"
            />
          </div>
        </div>
        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} data-testid="button-save-edit-feature">
            Сохранить
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

function FeatureItem({
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

export function FeaturesList({
  features,
  onChange,
  isEditing,
  isLocked = false,
  onToggleLock,
}: FeaturesListProps) {
  const canModify = isEditing || !isLocked;

  const addFeature = (feature: Omit<Feature, "id">) => {
    onChange([...features, { ...feature, id: generateId() }]);
  };

  const removeFeature = (id: string) => {
    onChange(features.filter((feature) => feature.id !== id));
  };

  const updateFeature = (updated: Feature) => {
    onChange(features.map((f) => (f.id === updated.id ? updated : f)));
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
