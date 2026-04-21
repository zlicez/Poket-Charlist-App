import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, ChevronDown, Eraser, Filter, Search } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { RACE_DATA } from "@shared/schema";

import {
  ALL_SOURCES,
  SOURCE_COUNTS,
  SOURCE_LABELS,
} from "./constants";
import {
  applyFilters,
  countActiveFilters,
  DEFAULT_FILTERS,
  type ActiveFilters,
} from "./filters";
import { RaceDetailPanel } from "./RaceDetailPanel";
import { RaceListRow } from "./RaceListRow";

export function RacePickerDialog({
  value,
  subrace,
  onChange,
}: {
  value: string;
  subrace?: string;
  onChange: (race: string, subrace?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<ActiveFilters>(DEFAULT_FILTERS);
  const [pendingFilters, setPendingFilters] = useState<ActiveFilters>(DEFAULT_FILTERS);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<string>(value);
  const [pendingSubrace, setPendingSubrace] = useState<string | undefined>(subrace);
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const isDesktop = useMediaQuery("(min-width: 640px)");

  const currentRaceData = RACE_DATA[value];
  const totalCount = Object.keys(RACE_DATA).length;
  const activeFilterCount = countActiveFilters(appliedFilters);
  const sorted = useMemo(() => {
    const filtered = applyFilters(RACE_DATA, appliedFilters, search);
    return filtered.sort((a, b) => a.name.localeCompare(b.name, "ru"));
  }, [appliedFilters, search]);
  const highlightedRace = RACE_DATA[highlighted] ?? null;
  const highlightedSubraces = highlightedRace?.subraces
    ? Object.values(highlightedRace.subraces)
    : [];
  const isCurrentlySelected = highlightedRace?.name === value;
  const isAlreadySelectedWithSameSubrace =
    isCurrentlySelected && (pendingSubrace ?? undefined) === (subrace ?? undefined);

  // Reset pendingSubrace when moving to a different race in the list
  useEffect(() => {
    if (highlightedRace?.name === value) {
      setPendingSubrace(subrace);
    } else {
      setPendingSubrace(undefined);
    }
  }, [highlighted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-sync: when filters/search removes highlighted race from results, jump to first
  useEffect(() => {
    if (sorted.length > 0 && !sorted.find((r) => r.name === highlighted)) {
      setHighlighted(sorted[0].name);
    }
  }, [appliedFilters, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (v) {
      setHighlighted(value || sorted[0]?.name || "");
      setPendingSubrace(subrace);
      setMobileView("list");
      setFilterPanelOpen(false);
    } else {
      setSearch("");
      // Keep appliedFilters across opens so user doesn't lose their filter config
    }
  };

  const handleConfirm = () => {
    if (!highlightedRace) return;
    onChange(highlightedRace.name, pendingSubrace);
    setOpen(false);
    setSearch("");
  };

  const handleClearFilters = () => {
    setAppliedFilters(DEFAULT_FILTERS);
    setPendingFilters(DEFAULT_FILTERS);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(pendingFilters);
    setFilterPanelOpen(false);
  };

  const toggleFilterPanel = () => {
    if (!filterPanelOpen) setPendingFilters(appliedFilters); // sync draft to current
    setFilterPanelOpen((v) => !v);
  };

  const handleRowClick = (raceName: string) => {
    setHighlighted(raceName);
    if (!isDesktop) setMobileView("detail");
  };

  // Steps the user still needs to take after confirming (subraces handled inline)
  const pendingSteps = useMemo(() => {
    if (!highlightedRace) return [];
    const steps: string[] = [];
    if (highlightedRace.abilityBonusSelection) {
      steps.push("распределить бонусы характеристик");
    }
    if (highlightedRace.skillChoices && highlightedRace.skillChoices.count > 0) {
      const n = highlightedRace.skillChoices.count;
      steps.push(`выбрать ${n} навык${n === 1 ? "" : n < 5 ? "а" : "ов"}`);
    }
    if (highlightedRace.languages?.some((l) => l === "Один на выбор")) {
      const n = highlightedRace.languages.filter((l) => l === "Один на выбор").length;
      steps.push(n === 1 ? "выбрать язык" : `выбрать ${n} языка`);
    }
    return steps;
  }, [highlightedRace]);

  // ── Shared: search bar / filter panel + column headers ────────────────────
  const listControls = (
    <>
      {/* Search row OR filter panel header */}
      <div className="px-3 pb-2 shrink-0 flex items-center gap-1.5">
        {filterPanelOpen ? (
          <span className="flex-1 text-sm font-semibold">Фильтры</span>
        ) : (
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск…"
              className="pl-8 h-8 text-sm"
              autoFocus={isDesktop}
            />
          </div>
        )}
        {/* Clear filters (eraser) — only when filters are applied */}
        {activeFilterCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={handleClearFilters}
            title="Сбросить фильтры"
          >
            <Eraser className="w-3.5 h-3.5" />
          </Button>
        )}
        {/* Filter panel toggle (funnel) */}
        <Button
          type="button"
          variant={filterPanelOpen ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8 shrink-0 relative"
          onClick={toggleFilterPanel}
          title="Фильтры"
        >
          <Filter className="w-3.5 h-3.5" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full bg-accent flex items-center justify-center text-[8px] font-bold text-white px-0.5">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Filter panel (shown instead of chips when open) */}
      {filterPanelOpen && (
        <div className="px-3 pb-3 shrink-0 space-y-3 border-b border-border/30">

          {/* Source checkboxes */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Источник
            </p>
            <div className="flex flex-wrap gap-1">
              {ALL_SOURCES.filter((src) => (SOURCE_COUNTS[src] ?? 0) > 0).map((src) => {
                const active = pendingFilters.sources.includes(src);
                return (
                  <Tooltip key={src}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() =>
                          setPendingFilters((prev) => ({
                            ...prev,
                            sources: active
                              ? prev.sources.filter((s) => s !== src)
                              : [...prev.sources, src],
                          }))
                        }
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-medium border transition-colors",
                          active
                            ? "bg-accent/15 border-accent/50 text-foreground"
                            : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground bg-transparent",
                        )}
                      >
                        {src}
                        <span className="ml-1 opacity-55">({SOURCE_COUNTS[src]})</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      {SOURCE_LABELS[src] ?? src}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>

          {/* Size radio */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Размер
            </p>
            <div className="flex gap-1">
              {[
                { value: "" as const, label: "Любой" },
                { value: "Small" as const, label: "Маленький" },
                { value: "Medium" as const, label: "Средний" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPendingFilters((prev) => ({ ...prev, size: opt.value }))}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium border transition-colors",
                    pendingFilters.size === opt.value
                      ? "bg-accent/15 border-accent/50 text-foreground"
                      : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground bg-transparent",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle chips */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Особенности
            </p>
            <div className="flex flex-wrap gap-1">
              {([
                { key: "darkvision", label: "Тёмное зрение" },
                { key: "lineage",    label: "Линидж" },
              ] as const).map(({ key, label }) => {
                const active = pendingFilters[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPendingFilters((prev) => ({ ...prev, [key]: !prev[key] }))}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium border transition-colors",
                      active
                        ? "bg-accent/15 border-accent/50 text-foreground"
                        : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground bg-transparent",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Apply button */}
          <Button
            type="button"
            className="w-full h-8 text-sm"
            onClick={handleApplyFilters}
          >
            Применить фильтры
          </Button>
        </div>
      )}

      {/* Column headers — always visible */}
      <div className="px-4 pb-1 shrink-0">
        <div className="flex items-center text-[10px] text-muted-foreground/60 uppercase tracking-wide">
          <span className="w-4 shrink-0" />
          <span className="flex-1 ml-2">Название</span>
          <span className="whitespace-nowrap text-right pr-1">Зрение · Р · Скор.</span>
        </div>
      </div>
    </>
  );

  // ── Shared: scrollable race list ───────────────────────────────────────────
  const raceList = (
    <ScrollArea className="flex-1 min-h-0 px-2">
      <div className="pb-3">
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Ничего не найдено</p>
        ) : (
          sorted.map((r) => (
            <RaceListRow
              key={r.id}
              race={r}
              isSelected={r.name === value}
              isActive={r.name === highlighted}
              onClick={() => handleRowClick(r.name)}
            />
          ))
        )}
      </div>
    </ScrollArea>
  );

  // ── Shared: sticky action bar (subrace select + confirm button) ────────────
  const actionBar = highlightedRace ? (
    <div className="shrink-0 border-t border-border/50 bg-background px-4 py-3 space-y-2.5">
      {highlightedSubraces.length > 0 && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Подраса</label>
          <Select
            value={pendingSubrace ?? "__none__"}
            onValueChange={(v) => setPendingSubrace(v === "__none__" ? undefined : v)}
          >
            <SelectTrigger className="h-9 text-sm" data-testid="select-subrace-in-picker">
              <SelectValue placeholder="Выбрать подрасу…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Без подрасы</SelectItem>
              {highlightedSubraces.map((sub) => (
                <SelectItem key={sub.id} value={sub.name}>{sub.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {pendingSteps.length > 0 && (
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          После выбора нужно будет: {pendingSteps.join(", ")}
        </p>
      )}
      <Button
        className="w-full gap-2"
        variant={isAlreadySelectedWithSameSubrace ? "outline" : "default"}
        onClick={handleConfirm}
      >
        {isAlreadySelectedWithSameSubrace
          ? <><Check className="w-4 h-4" /> Уже выбрано</>
          : `Выбрать: ${highlightedRace.name}${pendingSubrace ? ` · ${pendingSubrace}` : ""}`
        }
      </Button>
    </div>
  ) : null;

  const trigger = (
    <Button
      type="button"
      variant="outline"
      className="flex-1 h-10 text-sm justify-between gap-2 font-normal"
      onClick={() => handleOpenChange(true)}
      data-testid="button-open-race-picker"
    >
      <span className="truncate text-left">
        {value
          ? subrace ? `${value} · ${subrace}` : value
          : "Выберите расу…"}
      </span>
      <div className="flex items-center gap-1 shrink-0">
        {currentRaceData && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
            {currentRaceData.source}
          </Badge>
        )}
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </div>
    </Button>
  );

  // ── Mobile: Drawer (bottom sheet) ─────────────────────────────────────────
  if (!isDesktop) {
    return (
      <>
        {trigger}
        <Drawer open={open} onOpenChange={handleOpenChange}>
          <DrawerContent className="flex flex-col p-0 gap-0 h-[94vh] overflow-hidden">
            {mobileView === "list" ? (
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <DrawerHeader className="px-4 pt-3 pb-2 shrink-0 text-left border-b border-border/30">
                  <DrawerTitle className="flex items-baseline gap-2 text-base">
                    Выбор расы
                    <span className="text-xs font-normal text-muted-foreground">
                      {sorted.length === totalCount
                        ? `${totalCount} рас`
                        : `${sorted.length} из ${totalCount}`}
                    </span>
                  </DrawerTitle>
                </DrawerHeader>
                {listControls}
                <div data-vaul-no-drag className="flex-1 min-h-0 flex flex-col">
                  {raceList}
                </div>
              </div>
            ) : (
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="shrink-0 px-3 pt-2 pb-1.5 border-b border-border/50 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 h-7 text-xs -ml-2 text-muted-foreground shrink-0"
                    onClick={() => setMobileView("list")}
                  >
                    ← Список
                  </Button>
                  {highlightedRace && (
                    <span className="font-semibold text-sm truncate">{highlightedRace.name}</span>
                  )}
                </div>
                <div data-vaul-no-drag className="flex-1 min-h-0 flex flex-col">
                  <RaceDetailPanel race={highlightedRace} />
                </div>
                {actionBar}
              </div>
            )}
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  // ── Desktop: Dialog (two-panel) ────────────────────────────────────────────
  return (
    <>
      {trigger}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="p-0 gap-0 overflow-hidden flex flex-row max-w-5xl h-[88vh]">
          <DialogTitle className="sr-only">Выбор расы</DialogTitle>

          {/* Left / List panel */}
          <div className="w-72 border-r border-border/50 shrink-0 h-full flex flex-col">
            <div className="px-4 pt-4 pb-3 shrink-0">
              <div className="flex items-baseline gap-2">
                <h2 className="font-semibold text-base">Выбор расы</h2>
                <span className="text-xs font-normal text-muted-foreground">
                  {sorted.length === totalCount
                    ? `${totalCount} рас`
                    : `${sorted.length} из ${totalCount}`}
                </span>
              </div>
            </div>
            {listControls}
            {raceList}
          </div>

          {/* Right / Detail + action panel */}
          <div className="flex flex-col flex-1 min-h-0 min-w-0">
            <RaceDetailPanel race={highlightedRace} />
            {actionBar}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
