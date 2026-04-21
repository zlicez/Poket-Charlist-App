import {
  Apple,
  FlaskConical,
  Package,
  Shield,
  Sword,
  Wrench,
} from "lucide-react";
import {
  BASE_ARMOR,
  BASE_FOOD,
  BASE_MISC,
  BASE_POTIONS,
  BASE_TOOLS,
  BASE_WEAPONS,
} from "@shared/schema";
import type { BaseEquipmentItem, EquipmentCategory } from "@shared/schema";

export const CATEGORY_ICONS: Record<EquipmentCategory, React.ReactNode> = {
  weapon: <Sword className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
  armor: <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
  food: <Apple className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
  potion: <FlaskConical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
  tool: <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
  misc: <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
};

export const CATEGORY_ITEMS: Record<EquipmentCategory, BaseEquipmentItem[]> = {
  weapon: BASE_WEAPONS,
  armor: BASE_ARMOR,
  food: BASE_FOOD,
  potion: BASE_POTIONS,
  tool: BASE_TOOLS,
  misc: BASE_MISC,
};

// Width of the action strip when snapped open (edit + delete buttons + gap + padding).
// Используется в SortableEquipmentItem для порога iOS-style свайпа.
export const SWIPE_REVEAL_PX = 112;
