import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { BottomSheet } from "@/ds/hero";
import { Button, Chip, InputField, Tag } from "@/ds/primitives";
import { typeClass } from "@/ds/tokens";
import { generateId } from "@/lib/utils";
import { useUpsertSpell } from "@/hooks/character/useUpsertSpell";
import type { Character, Spell } from "@shared/schema";
import { spells as spellLibrary, type SpellEntry } from "@shared/data/spells-library";

/**
 * S-04 — spell library с фильтрами. Handoff 03-screens.jsx SpellLibraryScreen:
 *   search input + chip filter bar (class / level / school / concentration) + cards list.
 *
 * Добавление в персонажа — через useUpsertSpell (keyed op). `prepared: true`
 * по умолчанию (handoff не уточняет — принято «взял из библиотеки = подготовил»).
 *
 * Внутри BottomSheet с max-height 85vh. При большой библиотеке (~300 entries)
 * нужна была бы виртуализация (react-window), но для MVP фильтры + debounced
 * search достаточно отсекают. Phase I polish — добавить виртуализацию если
 * профили покажут jank.
 */

export function SpellLibrarySheet({
  open,
  onOpenChange,
  character,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
}) {
  const upsertSpell = useUpsertSpell(character.id);

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [levelFilter, setLevelFilter] = useState<number | "all">("all");
  const [classFilter, setClassFilter] = useState<string | "all">("all");
  const [schoolFilter, setSchoolFilter] = useState<string | "all">("all");
  const [concentrationFilter, setConcentrationFilter] = useState<
    "all" | "yes" | "no"
  >("all");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset filters on open for predictable UX.
  useEffect(() => {
    if (open) {
      setSearch("");
      setDebounced("");
      setLevelFilter("all");
      setClassFilter("all");
      setSchoolFilter("all");
      setConcentrationFilter("all");
    }
  }, [open]);

  const classOptions = useMemo(
    () =>
      Array.from(
        new Set(spellLibrary.flatMap((s) => s.classes ?? []).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b, "ru")),
    [],
  );
  const schoolOptions = useMemo(
    () =>
      Array.from(
        new Set(spellLibrary.map((s) => s.school.trim()).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b, "ru")),
    [],
  );

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return spellLibrary.filter((s) => {
      if (q && !s.name.toLowerCase().includes(q)) return false;
      if (levelFilter !== "all" && s.level !== levelFilter) return false;
      if (classFilter !== "all" && !s.classes?.includes(classFilter)) return false;
      if (schoolFilter !== "all" && s.school !== schoolFilter) return false;
      if (concentrationFilter !== "all") {
        if (concentrationFilter === "yes" && !s.concentration) return false;
        if (concentrationFilter === "no" && s.concentration) return false;
      }
      return true;
    });
  }, [debounced, levelFilter, classFilter, schoolFilter, concentrationFilter]);

  const addSpell = (entry: SpellEntry) => {
    const spell: Spell = {
      id: generateId(),
      name: entry.name,
      level: entry.level,
      castingTime: entry.castingTime ?? "1 действие",
      range: entry.range ?? "",
      components: entry.components ?? "",
      duration: entry.duration ?? "",
      concentration: entry.concentration ?? false,
      ritual: entry.ritual ?? false,
      description: entry.description ?? "",
      prepared: true,
    };
    upsertSpell.mutate({ id: spell.id, patch: spell });
  };

  // Check if spell already known (by name, since library id ≠ character spell id).
  const knownNames = useMemo(
    () => new Set((character.spellcasting?.spells ?? []).map((s) => s.name)),
    [character.spellcasting?.spells],
  );

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Библиотека заклинаний"
      description={`${filtered.length} из ${spellLibrary.length}`}
    >
      {/* Search */}
      <InputField
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск по названию…"
        suffix={<Search className="w-4 h-4" />}
        wrapperClassName="mt-2"
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        <Chip
          variant={levelFilter === "all" ? "active" : "default"}
          onClick={() => setLevelFilter("all")}
        >
          Все уровни
        </Chip>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => (
          <Chip
            key={l}
            variant={levelFilter === l ? "active" : "default"}
            onClick={() => setLevelFilter(l)}
          >
            {l === 0 ? "заг" : l}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2">
        <Chip
          variant={classFilter === "all" ? "active" : "default"}
          onClick={() => setClassFilter("all")}
        >
          Все классы
        </Chip>
        {classOptions.slice(0, 6).map((c) => (
          <Chip
            key={c}
            variant={classFilter === c ? "active" : "default"}
            onClick={() => setClassFilter(classFilter === c ? "all" : c)}
          >
            {c.toLowerCase()}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2">
        <Chip
          variant={schoolFilter === "all" ? "active" : "default"}
          onClick={() => setSchoolFilter("all")}
        >
          Все школы
        </Chip>
        {schoolOptions.slice(0, 5).map((s) => (
          <Chip
            key={s}
            variant={schoolFilter === s ? "active" : "default"}
            onClick={() => setSchoolFilter(schoolFilter === s ? "all" : s)}
          >
            {s.toLowerCase()}
          </Chip>
        ))}
        <Chip
          variant={concentrationFilter === "no" ? "ruby" : "default"}
          onClick={() =>
            setConcentrationFilter(concentrationFilter === "no" ? "all" : "no")
          }
        >
          без концент.
        </Chip>
      </div>

      {/* Results */}
      <div className="mt-3 rounded-ds-md border border-ink-200 bg-paper-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-5 text-center">
            <div className={cn(typeClass("body-sm"), "text-ink-500")}>
              Ничего не найдено. Сбрось фильтры.
            </div>
          </div>
        ) : (
          filtered.slice(0, 80).map((s, i) => {
            const known = knownNames.has(s.name);
            return (
              <div
                key={s.id}
                className={cn(
                  "flex items-start gap-2 px-3 py-2.5",
                  i < Math.min(filtered.length, 80) - 1 && "border-b border-ink-100",
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="font-ds-sans text-[13.5px] font-medium truncate">
                      {s.name}
                    </span>
                    <span className={cn(typeClass("code"), "text-ink-500")}>
                      {s.school.toLowerCase()}
                    </span>
                    {s.concentration && <Tag variant="ruby">К</Tag>}
                    {s.ritual && <Tag variant="gold">Р</Tag>}
                    <Tag>ур {s.level}</Tag>
                  </div>
                  <div className={cn(typeClass("caption"), "text-ink-500 mt-0.5")}>
                    {s.castingTime} · {(s.classes ?? []).join(", ")}
                  </div>
                </div>
                <Button
                  variant={known ? "ghost" : "primary"}
                  size="sm"
                  onClick={() => addSpell(s)}
                  disabled={known}
                  className="shrink-0"
                  aria-label={known ? "Уже выучено" : "Добавить"}
                >
                  {known ? "✓" : "+"}
                </Button>
              </div>
            );
          })
        )}
        {filtered.length > 80 && (
          <div className="px-3 py-2 bg-paper-2 text-center">
            <div className={cn(typeClass("caption"), "text-ink-500")}>
              Показано 80 из {filtered.length}. Уточни фильтры.
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
