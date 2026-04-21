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
import { Plus } from "lucide-react";
import type { Spell } from "@shared/schema";
import { RichTextField } from "@/components/RichTextField";

export function AddSpellDialog({
  onAdd,
  defaultLevel,
}: {
  onAdd: (spell: Omit<Spell, "id">) => void;
  defaultLevel?: number;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [level, setLevel] = useState(defaultLevel ?? 0);
  const [castingTime, setCastingTime] = useState("1 действие");
  const [range, setRange] = useState("");
  const [components, setComponents] = useState("");
  const [duration, setDuration] = useState("");
  const [concentration, setConcentration] = useState(false);
  const [ritual, setRitual] = useState(false);
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({
      name,
      level,
      castingTime,
      range,
      components,
      duration,
      concentration,
      ritual,
      description,
      prepared: true,
    });
    setName("");
    setLevel(defaultLevel ?? 0);
    setCastingTime("1 действие");
    setRange("");
    setComponents("");
    setDuration("");
    setConcentration(false);
    setRitual(false);
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
          data-testid="button-add-spell"
        >
          <Plus className="w-4 h-4" />
          Добавить
        </Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Новое заклинание</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="space-y-3 p-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Название *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Огненный шар"
              className="h-10"
              data-testid="input-spell-name"
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
                  data-testid="select-spell-level"
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
                placeholder="1 действие"
                className="h-10"
                data-testid="input-spell-casting-time"
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
                placeholder="150 фт."
                className="h-10"
                data-testid="input-spell-range"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Компоненты
              </label>
              <Input
                value={components}
                onChange={(e) => setComponents(e.target.value)}
                placeholder="В, С, М"
                className="h-10"
                data-testid="input-spell-components"
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
              placeholder="Мгновенная"
              className="h-10"
              data-testid="input-spell-duration"
            />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={concentration}
                onCheckedChange={(c) => setConcentration(c === true)}
                data-testid="checkbox-spell-concentration"
              />
              Концентрация
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={ritual}
                onCheckedChange={(c) => setRitual(c === true)}
                data-testid="checkbox-spell-ritual"
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
              placeholder="Описание заклинания..."
              rows={3}
              textareaClassName="min-h-[132px]"
              previewContainerClassName="min-h-[132px]"
              textareaTestId="textarea-spell-description"
              previewTestId="preview-spell-description"
            />
          </div>
        </div>
        <ResponsiveDialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim()}
            data-testid="button-confirm-add-spell"
          >
            Добавить заклинание
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
