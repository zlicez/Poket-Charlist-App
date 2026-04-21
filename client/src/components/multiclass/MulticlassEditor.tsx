import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import {
  CLASSES,
  getClassDefinitionByName,
  getTotalLevel,
  type ClassSelection,
} from "@shared/schema";

export function slugifyClassSelectionValue(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

export function createClassSelectionId(index: number, className: string): string {
  return `class-selection-${index + 1}-${slugifyClassSelectionValue(className) || "custom"}`;
}

export function MulticlassEditor({
  selections,
  onSelectionsChange,
}: {
  selections: ClassSelection[];
  onSelectionsChange: (selections: ClassSelection[]) => void;
}) {
  const classes = selections.map((selection) => ({
    name: selection.className,
    level: selection.level,
    subclass: selection.subclassName,
  }));
  const totalLevel = getTotalLevel(classes);

  const handleClassNameChange = (index: number, newName: string) => {
    const definition = getClassDefinitionByName(newName);
    const updated = selections.map((selection, i) =>
      i === index
        ? {
            ...selection,
            id: createClassSelectionId(index, newName),
            classId: definition?.id ?? slugifyClassSelectionValue(newName),
            className: newName,
            source: definition?.source ?? selection.source ?? "CUSTOM",
            contentVersion:
              definition?.contentVersion ?? selection.contentVersion ?? "2014",
            subclassId: undefined,
            subclassName: undefined,
            choices: {},
            optionalFeatureIds: [],
            resourceState: undefined,
          }
        : selection,
    );
    onSelectionsChange(updated);
  };

  const handleClassLevelChange = (index: number, newLevel: number) => {
    const otherLevelsTotal = selections.reduce(
      (sum, selection, i) => (i === index ? sum : sum + selection.level),
      0,
    );
    const maxForThis = Math.max(1, 20 - otherLevelsTotal);
    const level = Math.max(1, Math.min(maxForThis, newLevel));
    const updated = selections.map((selection, i) =>
      i === index ? { ...selection, level } : selection,
    );
    onSelectionsChange(updated);
  };

  const handleSubclassChange = (index: number, newSubclass: string) => {
    const subclassName = newSubclass.trim();
    const updated = selections.map((selection, i) =>
      i === index
        ? {
            ...selection,
            subclassId: subclassName
              ? slugifyClassSelectionValue(subclassName)
              : undefined,
            subclassName: subclassName || undefined,
          }
        : selection,
    );
    onSelectionsChange(updated);
  };

  const addClass = () => {
    if (totalLevel >= 20) return;
    const usedClasses = new Set(selections.map((selection) => selection.className));
    const available = CLASSES.filter((c) => !usedClasses.has(c));
    if (available.length === 0) return;
    const newName = available[0];
    const definition = getClassDefinitionByName(newName);
    onSelectionsChange([
      ...selections,
      {
        id: createClassSelectionId(selections.length, newName),
        classId: definition?.id ?? slugifyClassSelectionValue(newName),
        className: newName,
        source: definition?.source ?? "PHB",
        contentVersion: definition?.contentVersion ?? "2014",
        level: 1,
        choices: {},
        optionalFeatureIds: [],
      },
    ]);
  };

  const removeClass = (index: number) => {
    if (selections.length <= 1) return;
    onSelectionsChange(selections.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs text-muted-foreground">
          Классы (общий ур. {totalLevel})
        </label>
        {totalLevel < 20 && classes.length < CLASSES.length && (
          <Button
            variant="ghost"
            size="sm"
            onClick={addClass}
            className="h-7 text-xs gap-1"
            data-testid="button-add-class"
          >
            <Plus className="w-3 h-3" />
            Добавить класс
          </Button>
        )}
      </div>
      {selections.map((selection, index) => {
        const entry = classes[index];
        return (
          <div key={selection.id} className="rounded-lg border border-border/60 p-2.5 space-y-2">
            <div className="flex items-center gap-2">
              <Select
                value={entry.name}
                onValueChange={(v) => handleClassNameChange(index, v)}
              >
                <SelectTrigger
                  className="flex-1 h-10 text-sm"
                  data-testid={`select-class-${index}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLASSES.map((cls) => (
                    <SelectItem
                      key={cls}
                      value={cls}
                      disabled={
                        cls !== entry.name &&
                        selections.some((current) => current.className === cls)
                      }
                    >
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                max={20}
                value={entry.level}
                onChange={(e) =>
                  handleClassLevelChange(index, parseInt(e.target.value) || 1)
                }
                className="w-16 h-10 text-center font-bold"
                data-testid={`input-class-level-${index}`}
              />
              {selections.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeClass(index)}
                  className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive"
                  data-testid={`button-remove-class-${index}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="space-y-1">
              <label
                className="text-[11px] text-muted-foreground block"
                htmlFor={`input-subclass-${index}`}
              >
                Подкласс
              </label>
              <Input
                id={`input-subclass-${index}`}
                value={selection.subclassName ?? ""}
                onChange={(e) => handleSubclassChange(index, e.target.value)}
                placeholder="Если уже выбран"
                className="h-9 text-sm"
                data-testid={`input-subclass-${index}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
