import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Spell } from "@shared/schema";
import { RichTextField } from "@/components/RichTextField";

export function EditSpellDialog({
  spell,
  onSave,
  trigger,
}: {
  spell: Spell;
  onSave: (updated: Spell) => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(spell.name);
  const [level, setLevel] = useState(spell.level);
  const [castingTime, setCastingTime] = useState(spell.castingTime);
  const [range, setRange] = useState(spell.range);
  const [components, setComponents] = useState(spell.components);
  const [duration, setDuration] = useState(spell.duration || "");
  const [concentration, setConcentration] = useState(spell.concentration);
  const [ritual, setRitual] = useState(spell.ritual);
  const [description, setDescription] = useState(spell.description);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setName(spell.name);
      setLevel(spell.level);
      setCastingTime(spell.castingTime);
      setRange(spell.range);
      setComponents(spell.components);
      setDuration(spell.duration || "");
      setConcentration(spell.concentration);
      setRitual(spell.ritual);
      setDescription(spell.description);
    }
    setOpen(isOpen);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      ...spell,
      name,
      level,
      castingTime,
      range,
      components,
      duration,
      concentration,
      ritual,
      description,
    });
    setOpen(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={handleOpen}>
      <ResponsiveDialogTrigger asChild>{trigger}</ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            Редактировать заклинание
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="space-y-3 p-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Название *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10"
              data-testid="input-edit-spell-name"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Уровень
              </label>
              <Select
                value={String(level)}
                onValueChange={(v) => setLevel(Number(v))}
              >
                <SelectTrigger
                  className="h-10"
                  data-testid="select-edit-spell-level"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {i === 0 ? "Заговор" : `${i} уровень`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Время сотворения
              </label>
              <Input
                value={castingTime}
                onChange={(e) => setCastingTime(e.target.value)}
                className="h-10"
                data-testid="input-edit-spell-casting-time"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Дистанция
              </label>
              <Input
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="h-10"
                data-testid="input-edit-spell-range"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Компоненты
              </label>
              <Input
                value={components}
                onChange={(e) => setComponents(e.target.value)}
                className="h-10"
                data-testid="input-edit-spell-components"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Длительность
            </label>
            <Input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="h-10"
              data-testid="input-edit-spell-duration"
            />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={concentration}
                onCheckedChange={(c) => setConcentration(c === true)}
                data-testid="checkbox-edit-spell-concentration"
              />
              Концентрация
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={ritual}
                onCheckedChange={(c) => setRitual(c === true)}
                data-testid="checkbox-edit-spell-ritual"
              />
              Ритуал
            </label>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Описание
            </label>
            <RichTextField
              value={description}
              onChange={setDescription}
              rows={3}
              textareaClassName="min-h-[132px]"
              previewContainerClassName="min-h-[132px]"
              textareaTestId="textarea-edit-spell-description"
              previewTestId="preview-edit-spell-description"
            />
          </div>
        </div>
        <ResponsiveDialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim()}
            data-testid="button-confirm-edit-spell"
          >
            Сохранить
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
