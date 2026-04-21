import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ResponsiveDialog,
  ResponsiveDialogTrigger,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { RichTextField } from "@/components/RichTextField";
import { Plus } from "lucide-react";
import type { Feature } from "@shared/schema";

export function AddFeatureDialog({
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
