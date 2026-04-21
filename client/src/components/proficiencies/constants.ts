import { Languages, Swords, Shield, Wrench } from "lucide-react";
import {
  LANGUAGES,
  WEAPON_PROFICIENCIES,
  ARMOR_PROFICIENCIES,
  TOOL_PROFICIENCIES,
} from "@shared/schema";
import type {
  DamageType,
  ProficiencyCategory,
} from "@shared/schema";

export const DAMAGE_TYPE_LABELS: Record<DamageType, string> = {
  fire:        "Огонь",
  cold:        "Холод",
  lightning:   "Молния",
  acid:        "Кислота",
  poison:      "Яд",
  psychic:     "Психика",
  radiant:     "Сияние",
  necrotic:    "Некротика",
  thunder:     "Гром",
  force:       "Силовой",
  piercing:    "Колющий",
  slashing:    "Рубящий",
  bludgeoning: "Дробящий",
};

export const CATEGORY_ICONS: Record<ProficiencyCategory, typeof Languages> = {
  languages: Languages,
  weapons: Swords,
  armor: Shield,
  tools: Wrench,
};

export const CATEGORY_PRESETS: Record<ProficiencyCategory, readonly string[]> = {
  languages: LANGUAGES,
  weapons: WEAPON_PROFICIENCIES,
  armor: ARMOR_PROFICIENCIES,
  tools: TOOL_PROFICIENCIES,
};
