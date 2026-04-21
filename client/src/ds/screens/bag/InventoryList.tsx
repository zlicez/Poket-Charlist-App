import { Backpack, Shield, ShieldCheck, Sparkles, Sword, Wrench } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { Chip, Tag } from "@/ds/primitives";
import { ListRow } from "@/ds/hero";
import { typeClass } from "@/ds/tokens";
import { useEquipmentOps } from "@/hooks/character/useEquipmentOps";
import type { Equipment } from "@shared/schema";

/**
 * S-05 (нижняя часть) — инвентарь с chip-фильтром.
 * Handoff 03-screens.jsx BagScreen:
 *   [chip bar: Все · Экипир. · Броня · Расходники]
 *   [ListRow для каждого item: icon · name + equipped-tag · qty · weight]
 *
 * Actions:
 *   tap item                → accordion с описанием (TODO Phase I)
 *                             или toggle equipped для armor/shield (atomic ops)
 *   swipe ← delete          → removeItem
 *
 * Armor equip — через useEquipmentOps atomic batch (наденет этот, снимет
 * конфликтующий armor/shield — логика в applyEquipmentOpsLocally).
 */

type FilterId = "all" | "equipped" | "armor" | "consumables" | "misc";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "equipped", label: "На себе" },
  { id: "armor", label: "Броня" },
  { id: "consumables", label: "Расходники" },
  { id: "misc", label: "Прочее" },
];

function matchesFilter(item: Equipment, id: FilterId): boolean {
  if (id === "all") return true;
  if (id === "equipped") return Boolean(item.equipped);
  if (id === "armor") return Boolean(item.isArmor);
  if (id === "consumables") return item.category === "potion" || item.category === "food";
  if (id === "misc") return item.category === "misc" || item.category === "tool";
  return true;
}

function itemIcon(item: Equipment): React.ReactNode {
  const cls = "w-4 h-4 shrink-0";
  if (item.isArmor && item.armorType === "shield")
    return <ShieldCheck className={cn(cls, "text-ocean")} />;
  if (item.isArmor) return <Shield className={cn(cls, "text-ink-600")} />;
  if (item.isWeapon) return <Sword className={cn(cls, "text-ink-600")} />;
  if (item.category === "potion") return <Sparkles className={cn(cls, "text-violet")} />;
  if (item.category === "tool") return <Wrench className={cn(cls, "text-ink-500")} />;
  return <Backpack className={cn(cls, "text-ink-500")} />;
}

export function InventoryList({
  characterId,
  equipment,
}: {
  characterId: string;
  equipment: Equipment[];
}) {
  const [filter, setFilter] = useState<FilterId>("all");
  const equipmentOps = useEquipmentOps(characterId);

  const filtered = useMemo(
    () => equipment.filter((e) => matchesFilter(e, filter)),
    [equipment, filter],
  );

  const toggleEquipped = (item: Equipment) => {
    // Для armor/shield — атомарный swap через useEquipmentOps (снимает
    // прошлый non-shield armor если надеваем новый не-шит).
    if (!item.isArmor) {
      equipmentOps.mutate([
        {
          op: "upsertItem",
          collection: "equipment",
          id: item.id,
          patch: { equipped: !item.equipped } as Record<string, unknown>,
        },
      ]);
      return;
    }
    const nextEquipped = !item.equipped;
    const ops: Parameters<typeof equipmentOps.mutate>[0] = [
      {
        op: "upsertItem",
        collection: "equipment",
        id: item.id,
        patch: { equipped: nextEquipped } as Record<string, unknown>,
      },
    ];
    // Если надеваем не-shield armor — снять прошлый не-shield armor.
    if (nextEquipped && item.armorType !== "shield") {
      for (const other of equipment) {
        if (
          other.id !== item.id &&
          other.equipped &&
          other.isArmor &&
          other.armorType !== "shield"
        ) {
          ops.push({
            op: "upsertItem",
            collection: "equipment",
            id: other.id,
            patch: { equipped: false } as Record<string, unknown>,
          });
        }
      }
    }
    equipmentOps.mutate(ops);
  };

  const deleteItem = (item: Equipment) => {
    equipmentOps.mutate([
      { op: "removeItem", collection: "equipment", id: item.id },
    ]);
  };

  return (
    <div className="space-y-2">
      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <Chip
            key={f.id}
            variant={filter === f.id ? "active" : "default"}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </Chip>
        ))}
      </div>

      {/* Items */}
      {filtered.length === 0 ? (
        <div className="rounded-ds-md border border-dashed border-ink-300 p-4 text-center">
          <div className={cn(typeClass("body-sm"), "text-ink-500")}>
            {equipment.length === 0
              ? "Инвентарь пуст. Добавь предмет в edit-mode."
              : "Ничего не подходит под фильтр."}
          </div>
        </div>
      ) : (
        <div className="rounded-ds-md border border-ink-200 bg-paper-card overflow-hidden">
          {filtered.map((item, i) => (
            <ListRow
              key={item.id}
              left={itemIcon(item)}
              title={
                <span className="flex items-center gap-1.5">
                  {item.name}
                  {item.equipped && <Tag variant="sage">на себе</Tag>}
                </span>
              }
              subtitle={buildSubtitle(item)}
              right={
                item.isArmor ? (
                  <button
                    type="button"
                    onClick={() => toggleEquipped(item)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[11px] font-medium font-ds-sans",
                      "border transition-colors",
                      "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ruby-bg",
                      item.equipped
                        ? "bg-sage-bg text-sage border-sage-soft"
                        : "bg-paper-card text-ink-600 border-ink-300 hover:border-ink-500",
                    )}
                    data-testid={`inv-equip-${item.id}`}
                  >
                    {item.equipped ? "снять" : "надеть"}
                  </button>
                ) : undefined
              }
              swipeActions={{
                onDelete: () => deleteItem(item),
              }}
              isLast={i === filtered.length - 1}
              testId={`inv-row-${item.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function buildSubtitle(item: Equipment): React.ReactNode {
  const parts: string[] = [];
  if (item.quantity > 1) parts.push(`${item.quantity} шт`);
  if (item.weight) parts.push(`${item.weight} lb`);
  if (item.isWeapon && item.damage) parts.push(item.damage);
  if (item.isArmor && item.armorBaseAC) parts.push(`КД ${item.armorBaseAC}`);
  return parts.join(" · ");
}
