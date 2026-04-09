import spellsData from "./spells_library.json";

interface RawSpellEntry {
  id: string;
  name: string;
  level: number;
  school?: string | null;
  classes?: string[] | null;
  range: string;
  ritual: boolean;
  duration: string;
  components: string;
  casting_time: string;
  description: string;
  concentration: boolean;
}

export interface SpellEntry {
  id: string;
  name: string;
  level: number;
  school: string;
  classes?: string[] | null;
  range: string;
  ritual: boolean;
  components: string;
  castingTime: string;
  description: string;
  concentration: boolean;
  duration: string;
}

export const spells: SpellEntry[] = (spellsData as RawSpellEntry[]).map((spell) => ({
  id: spell.id,
  name: spell.name,
  level: spell.level,
  school: spell.school ?? "",
  classes: spell.classes ?? null,
  range: spell.range,
  ritual: spell.ritual,
  duration: spell.duration,
  components: spell.components,
  castingTime: spell.casting_time,
  description: spell.description,
  concentration: spell.concentration,
}));
