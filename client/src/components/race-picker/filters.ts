import type { RaceDefinition } from "@shared/schema";

export type ActiveFilters = {
  sources: string[];
  size: "" | "Small" | "Medium" | "Large";
  darkvision: boolean;
  lineage: boolean;
};

export const DEFAULT_FILTERS: ActiveFilters = {
  sources: [],
  size: "",
  darkvision: false,
  lineage: false,
};

export function countActiveFilters(f: ActiveFilters): number {
  return (f.sources.length > 0 ? 1 : 0) +
    (f.size ? 1 : 0) +
    (f.darkvision ? 1 : 0) +
    (f.lineage ? 1 : 0);
}

export function applyFilters(
  raceData: Record<string, RaceDefinition>,
  filters: ActiveFilters,
  search: string,
): RaceDefinition[] {
  let result = Object.values(raceData);
  if (search) {
    const s = search.toLowerCase();
    result = result.filter((r) => r.name.toLowerCase().includes(s));
  }
  if (filters.sources.length > 0) {
    result = result.filter((r) => filters.sources.includes(r.source));
  }
  if (filters.size) {
    result = result.filter((r) => r.size === filters.size);
  }
  if (filters.darkvision) {
    result = result.filter((r) => (r.darkvision ?? 0) > 0);
  }
  if (filters.lineage) {
    result = result.filter((r) => r.entityType === "lineage");
  }
  return result;
}
