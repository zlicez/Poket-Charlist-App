import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Library, Search } from "lucide-react";
import type { Spell } from "@shared/schema";
import {
  spells as spellLibrary,
  type SpellEntry,
} from "@shared/data/spells-library";

export function SpellLibraryDialog({
  onAdd,
}: {
  onAdd: (spell: Omit<Spell, "id">) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const schoolOptions = useMemo(() => {
    return Array.from(
      new Set(spellLibrary.map((spell) => spell.school.trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b, "ru"));
  }, []);

  const classOptions = useMemo(() => {
    return Array.from(
      new Set(
        spellLibrary.flatMap((spell) => spell.classes ?? []).filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b, "ru"));
  }, []);

  const filtered = useMemo(() => {
    return spellLibrary.filter((s) => {
      if (
        debouncedSearch.trim() &&
        !s.name.toLowerCase().includes(debouncedSearch.trim().toLowerCase())
      )
        return false;
      if (levelFilter !== "all" && s.level !== Number(levelFilter))
        return false;
      if (schoolFilter !== "all" && s.school !== schoolFilter) return false;
      if (classFilter !== "all" && !s.classes?.includes(classFilter))
        return false;
      return true;
    });
  }, [debouncedSearch, levelFilter, schoolFilter, classFilter]);

  const handleAdd = (entry: SpellEntry) => {
    onAdd({
      name: entry.name,
      level: entry.level,
      castingTime: entry.castingTime ?? "1 действие",
      range: entry.range ?? "",
      components: entry.components ?? "",
      duration: entry.duration ?? "",
      concentration: entry.concentration,
      ritual: entry.ritual,
      description: entry.description ?? "",
      prepared: true,
    });
    setOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setSearch("");
      setDebouncedSearch("");
      setLevelFilter("all");
      setSchoolFilter("all");
      setClassFilter("all");
    }
  };

  const formatSchoolLabel = (school: string) =>
    school ? school.charAt(0).toUpperCase() + school.slice(1) : "Без школы";

  return (
    <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
      <ResponsiveDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 sm:h-7 sm:w-7"
          title="Выбрать из базы заклинаний"
          data-testid="button-spell-library"
        >
          <Library className="w-4 h-4" />
        </Button>
      </ResponsiveDialogTrigger>

      <ResponsiveDialogContent className="max-w-md">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <Library className="w-4 h-4" />
            База заклинаний
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        {/* Search + filters */}
        <div className="space-y-2 px-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по названию..."
              className="pl-9"
              data-testid="input-spell-library-search"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger
                className="h-9 text-xs"
                data-testid="select-spell-library-level"
              >
                <SelectValue placeholder="Уровень" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все уровни</SelectItem>
                <SelectItem value="0">Заговор</SelectItem>
                {Array.from({ length: 9 }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {i + 1} уровень
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={schoolFilter} onValueChange={setSchoolFilter}>
              <SelectTrigger
                className="h-9 text-xs"
                data-testid="select-spell-library-school"
              >
                <SelectValue placeholder="Школа" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все школы</SelectItem>
                {schoolOptions.map((school) => (
                  <SelectItem key={school} value={school}>
                    {formatSchoolLabel(school)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger
              className="h-9 text-xs"
              data-testid="select-spell-library-class"
            >
              <SelectValue placeholder="Класс" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все классы</SelectItem>
              {classOptions.map((cls) => (
                <SelectItem key={cls} value={cls}>
                  {cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results list */}
        <ScrollArea className="h-[320px] px-1">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              Ничего не найдено
            </div>
          ) : (
            <div className="space-y-0.5">
              {filtered.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => handleAdd(entry)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-accent/10 active:bg-accent/20 transition-colors min-h-[44px] sm:min-h-0"
                  data-testid={`spell-library-item-${entry.id}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm leading-tight">
                      {entry.name}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {entry.concentration && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0 h-4"
                        >
                          К
                        </Badge>
                      )}
                      {entry.ritual && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0 h-4"
                        >
                          Р
                        </Badge>
                      )}
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 h-4"
                      >
                        {entry.level === 0 ? "Загов." : `${entry.level} ур.`}
                      </Badge>
                    </div>
                  </div>
                  {entry.castingTime && (
                    <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {entry.castingTime}
                      </span>
                      {entry.school && (
                        <span>{formatSchoolLabel(entry.school)}</span>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
