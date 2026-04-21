import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { PROFICIENCY_CATEGORY_LABELS } from "@shared/schema";
import type { ProficiencyCategory } from "@shared/schema";

import { CATEGORY_ICONS, CATEGORY_PRESETS } from "./constants";

export function AddProficiencyDialog({
  category,
  existingProficiencies,
  onAdd,
}: {
  category: ProficiencyCategory;
  existingProficiencies: string[];
  onAdd: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const presets = CATEGORY_PRESETS[category];
  const availablePresets = presets.filter(p => !existingProficiencies.includes(p));
  const filteredPresets = availablePresets.filter(p =>
    p.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPreset = (value: string) => {
    onAdd(value);
    setSearchTerm("");
  };

  const handleAddCustom = () => {
    if (customValue.trim() && !existingProficiencies.includes(customValue.trim())) {
      onAdd(customValue.trim());
      setCustomValue("");
      setOpen(false);
    }
  };

  const Icon = CATEGORY_ICONS[category];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1" data-testid={`button-add-proficiency-${category}`}>
          <Plus className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            Добавить: {PROFICIENCY_CATEGORY_LABELS[category]}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Поиск из списка</label>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Поиск..."
              data-testid={`input-search-proficiency-${category}`}
            />
          </div>

          <ScrollArea className="h-48 border rounded-md p-2">
            <div className="space-y-1">
              {filteredPresets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {availablePresets.length === 0 ? "Все владения уже добавлены" : "Ничего не найдено"}
                </p>
              ) : (
                filteredPresets.map((preset) => (
                  <Button
                    key={preset}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => handleAddPreset(preset)}
                    data-testid={`button-preset-${preset}`}
                  >
                    <Plus className="w-3 h-3 mr-2 flex-shrink-0" />
                    <span className="truncate">{preset}</span>
                  </Button>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="border-t pt-4">
            <label className="text-sm text-muted-foreground mb-1 block">Или добавить своё</label>
            <div className="flex gap-2">
              <Input
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder="Своё владение..."
                onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                data-testid={`input-custom-proficiency-${category}`}
              />
              <Button
                onClick={handleAddCustom}
                disabled={!customValue.trim()}
                data-testid={`button-add-custom-${category}`}
              >
                Добавить
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
