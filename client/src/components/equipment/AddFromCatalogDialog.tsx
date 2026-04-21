import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { Package, Search } from "lucide-react";
import {
  CATEGORY_LABELS,
  createEquipmentFromBase,
} from "@shared/schema";
import type {
  BaseEquipmentItem,
  Equipment,
  EquipmentCategory,
} from "@shared/schema";
import {
  getActiveWeaponDamage,
  getWeaponPropertiesDisplay,
} from "@/lib/weapons";

import { CATEGORY_ICONS, CATEGORY_ITEMS } from "./constants";
import { EquipmentScrollArea } from "./EquipmentScrollArea";

export function AddFromCatalogDialog({
  onAdd,
  category,
}: {
  onAdd: (item: Omit<Equipment, "id">) => void;
  category: EquipmentCategory;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const items = CATEGORY_ITEMS[category];
  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    return items.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [items, search]);

  const handleAdd = (baseItem: BaseEquipmentItem) => {
    onAdd(createEquipmentFromBase(baseItem));
    setOpen(false);
    setSearch("");
  };

  if (items.length === 0) return null;

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-9 sm:w-9" data-testid={`button-catalog-${category}`}>
          <Package className="w-4 h-4" />
        </Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent className="max-w-md">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            {CATEGORY_ICONS[category]}
            {CATEGORY_LABELS[category]}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Выберите предмет из каталога D&D 5e
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск..."
            className="pl-9"
            data-testid="input-catalog-search"
          />
        </div>

        <EquipmentScrollArea className="mt-1 h-[300px]" contentClassName="space-y-1 p-0.5">
            {filteredItems.map((item, index) => (
              <button
                key={item.name}
                onClick={() => handleAdd(item)}
                className="w-full text-left p-3 sm:p-2 rounded-md hover-elevate active-elevate-2 transition-colors min-h-[44px] sm:min-h-0"
                data-testid={`catalog-item-${index}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm">{item.name}</span>
                  {item.cost && (
                    <Badge variant="outline" className="text-xs shrink-0">
                      {item.cost}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {item.isWeapon && (
                    <span>
                      {getActiveWeaponDamage({
                        damage: item.damage,
                        versatileDamage: item.versatileDamage,
                        properties: item.weaponProperties,
                      })}{" "}
                      {item.damageType}
                    </span>
                  )}
                  {item.isArmor && (
                    <span>КД {item.armorBaseAC}</span>
                  )}
                  {item.description && !item.isWeapon && !item.isArmor && (
                    <span>{item.description}</span>
                  )}
                  {item.isWeapon && getWeaponPropertiesDisplay(item.weaponProperties, item.versatileDamage) && (
                    <span className="block text-muted-foreground/70">
                      {getWeaponPropertiesDisplay(item.weaponProperties, item.versatileDamage)}
                    </span>
                  )}
                </div>
              </button>
            ))}
            {filteredItems.length === 0 && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Ничего не найдено
              </div>
            )}
        </EquipmentScrollArea>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
