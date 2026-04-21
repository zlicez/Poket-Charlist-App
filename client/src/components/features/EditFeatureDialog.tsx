import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { RichTextField } from "@/components/RichTextField";
import type { Feature } from "@shared/schema";

export function EditFeatureDialog({
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
