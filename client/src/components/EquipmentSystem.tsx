import { useMemo, useState } from "react";
import { generateId } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Backpack,
  Lock,
  Package,
  ShieldCheck,
  Sword,
  Unlock,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  CATEGORY_LABELS,
  EQUIPMENT_CATEGORIES,
} from "@shared/schema";
import type {
  CollectionOp,
  Equipment,
  EquipmentCategory,
  Money,
} from "@shared/schema";
import { MoneyBlock } from "./MoneyBlock";

import { AddCustomItemDialog } from "./equipment/AddCustomItemDialog";
import { AddFromCatalogDialog } from "./equipment/AddFromCatalogDialog";
import { EquipmentScrollArea } from "./equipment/EquipmentScrollArea";
import { SortableEquipmentItem } from "./equipment/SortableEquipmentItem";
import { CATEGORY_ICONS, CATEGORY_ITEMS } from "./equipment/constants";

interface EquipmentSystemProps {
  equipment: Equipment[];
  // Discrete-дорожка для equipment: батч keyed ops за один PATCH. Если задан,
  // add/remove/edit/reorder/toggleEquipped идут через него атомарно; иначе
  // fallback на `onChange` (full-array replace).
  onApplyOps?: (ops: CollectionOp[]) => void;
  onChange: (equipment: Equipment[]) => void;
  isEditing: boolean;
  isLocked?: boolean;
  onToggleLock?: () => void;
  proficiencyBonus?: number;
  money?: Money;
  onMoneyChange?: (money: Money) => void;
}

type TabValue = EquipmentCategory | "all";

export function EquipmentSystem({
  equipment,
  onApplyOps,
  onChange,
  isEditing,
  isLocked = false,
  onToggleLock,
  money,
  onMoneyChange,
}: EquipmentSystemProps) {
  // Хелпер, маршрутизирующий любое изменение коллекции: если родитель дал
  // onApplyOps — идём через keyed ops (атомарный batch); иначе собираем
  // итоговый массив и шлём через onChange (full-array fallback).
  const applyOrFallback = (ops: CollectionOp[], fallback: () => Equipment[]) => {
    if (onApplyOps) onApplyOps(ops);
    else onChange(fallback());
  };
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  // Tracks which item has an open swipe; null = all closed
  const [openSwipeItemId, setOpenSwipeItemId] = useState<string | null>(null);
  const canModify = isEditing || !isLocked;

  // Close any open swipe when tapping outside of items
  const handleListAreaTouchStart = () => setOpenSwipeItemId(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = equipment.findIndex((item) => item.id === active.id);
      const newIndex = equipment.findIndex((item) => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(equipment, oldIndex, newIndex);
        applyOrFallback(
          [{ op: "reorderItems", collection: "equipment", orderedIds: reordered.map((e) => e.id) }],
          () => reordered,
        );
      }
    }
  };

  const categorizedEquipment = useMemo(() => {
    const result: Record<EquipmentCategory, Equipment[]> = {
      weapon: [],
      armor: [],
      food: [],
      potion: [],
      tool: [],
      misc: [],
    };

    equipment.forEach(item => {
      const cat = (item.category && item.category in result ? item.category : "misc") as EquipmentCategory;
      result[cat].push(item);
    });

    return result;
  }, [equipment]);

  const categoryCounts = useMemo(() => {
    const counts: Record<EquipmentCategory, number> = {
      weapon: 0, armor: 0, food: 0, potion: 0, tool: 0, misc: 0,
    };
    equipment.forEach(item => {
      const cat = (item.category && item.category in counts ? item.category : "misc") as EquipmentCategory;
      counts[cat] += item.quantity;
    });
    return counts;
  }, [equipment]);

  const totalWeight = useMemo(() =>
    equipment.reduce((sum, e) => sum + (e.weight || 0) * e.quantity, 0),
    [equipment]
  );

  const addEquipment = (item: Omit<Equipment, "id">) => {
    const newId = generateId();
    const newItem: Equipment = { ...item, id: newId };
    applyOrFallback(
      [{ op: "upsertItem", collection: "equipment", id: newId, patch: newItem as unknown as Record<string, unknown> }],
      () => [...equipment, newItem],
    );
  };

  const removeEquipment = (id: string) => {
    applyOrFallback(
      [{ op: "removeItem", collection: "equipment", id }],
      () => equipment.filter((e) => e.id !== id),
    );
  };

  const updateEquipmentItem = (updated: Equipment) => {
    applyOrFallback(
      [{ op: "upsertItem", collection: "equipment", id: updated.id, patch: updated as unknown as Record<string, unknown> }],
      () => equipment.map((e) => (e.id === updated.id ? updated : e)),
    );
  };

  const requestDelete = (id: string) => setDeleteTarget(id);
  const confirmDelete = () => {
    if (deleteTarget) removeEquipment(deleteTarget);
    setDeleteTarget(null);
  };

  const toggleEquipped = (id: string) => {
    const toggledItem = equipment.find((e) => e.id === id);
    if (!toggledItem) return;

    const isEquipping = !toggledItem.equipped;
    const ops: CollectionOp[] = [
      { op: "upsertItem", collection: "equipment", id, patch: { equipped: isEquipping } },
    ];

    // Надевание не-щитного доспеха снимает все другие не-щитные доспехи —
    // одним атомарным батчем, чтобы не было промежуточного состояния «оба надеты».
    if (isEquipping && toggledItem.isArmor && toggledItem.armorType !== "shield") {
      for (const other of equipment) {
        if (other.id === id) continue;
        if (other.isArmor && other.armorType !== "shield" && other.equipped) {
          ops.push({
            op: "upsertItem",
            collection: "equipment",
            id: other.id,
            patch: { equipped: false },
          });
        }
      }
    }

    applyOrFallback(ops, () =>
      equipment.map((e) => {
        if (e.id === id) return { ...e, equipped: isEquipping };
        if (
          isEquipping &&
          toggledItem.isArmor &&
          toggledItem.armorType !== "shield" &&
          e.isArmor &&
          e.armorType !== "shield"
        ) {
          return { ...e, equipped: false };
        }
        return e;
      }),
    );
  };

  const updateQuantity = (id: string, delta: number) => {
    const item = equipment.find((e) => e.id === id);
    if (!item) return;
    const newQty = Math.max(0, item.quantity + delta);
    if (newQty === 0) {
      applyOrFallback(
        [{ op: "removeItem", collection: "equipment", id }],
        () => equipment.filter((e) => e.id !== id),
      );
    } else {
      applyOrFallback(
        [{ op: "upsertItem", collection: "equipment", id, patch: { quantity: newQty } }],
        () => equipment.map((e) => (e.id === id ? { ...e, quantity: newQty } : e)),
      );
    }
  };

  const equippedItems = equipment.filter(e => e.equipped);
  const catalogCategory: EquipmentCategory = activeTab === "all" ? "weapon" : activeTab;

  return (
    <Card className="stat-card self-start p-2 sm:p-3 flex flex-col">
      <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
        <div className="flex items-center gap-2">
          <Backpack className="w-4 h-4 text-accent" />
          <h3 className="font-semibold text-sm">Снаряжение</h3>
          <Badge variant="outline" className="text-xs">
            {totalWeight.toFixed(1)} ф.
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {!isEditing && onToggleLock && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleLock}
              className={`h-10 w-10 sm:h-9 sm:w-9 ${isLocked ? "text-muted-foreground" : "text-accent"}`}
              data-testid="button-toggle-equipment-lock"
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </Button>
          )}
          {canModify && <AddFromCatalogDialog onAdd={addEquipment} category={catalogCategory} />}
          {canModify && <AddCustomItemDialog onAdd={addEquipment} defaultCategory={catalogCategory} />}
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => { setActiveTab(v as TabValue); setOpenSwipeItemId(null); }}
        className="flex flex-col"
      >
        <div className="nav-scroll-container -mx-2 sm:mx-0 mb-2">
          <div className="overflow-x-auto scrollbar-hide px-2 sm:px-0 lg:overflow-visible">
            <TabsList className="inline-flex w-max min-w-full h-auto rounded-xl border border-border/60 bg-muted/50 p-1 gap-1 lg:flex lg:w-full lg:min-w-0 lg:flex-nowrap lg:justify-start">
              <TabsTrigger
                value="all"
                className="shrink-0 rounded-lg px-3 py-2.5 min-h-[44px] text-xs gap-1.5 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground lg:flex-1 lg:min-w-0 lg:px-2 lg:py-2 lg:min-h-[38px] lg:text-[11px] lg:gap-1"
                data-testid="tab-all"
              >
                <Backpack className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
                <span className="lg:truncate">Всё</span>
                {equipment.length > 0 && (
                  <Badge variant="outline" className="h-5 px-1.5 text-[10px] sm:text-xs lg:h-4 lg:px-1 lg:text-[9px]">
                    {equipment.reduce((sum, e) => sum + e.quantity, 0)}
                  </Badge>
                )}
              </TabsTrigger>
              {EQUIPMENT_CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="shrink-0 rounded-lg px-3 py-2.5 min-h-[44px] text-xs gap-1.5 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground lg:flex-1 lg:min-w-0 lg:px-2 lg:py-2 lg:min-h-[38px] lg:text-[11px] lg:gap-1"
                  data-testid={`tab-${cat}`}
                >
                  {CATEGORY_ICONS[cat]}
                  <span className="lg:truncate">{CATEGORY_LABELS[cat]}</span>
                  {categoryCounts[cat] > 0 && (
                    <Badge variant="outline" className="h-5 px-1.5 text-[10px] sm:text-xs lg:h-4 lg:px-1 lg:text-[9px]">
                      {categoryCounts[cat]}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          {equipment.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Инвентарь пуст</p>
              <p className="text-xs mt-1">
                Выберите категорию и добавьте предметы
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={equipment.map(e => e.id)}
                strategy={verticalListSortingStrategy}
              >
                <div onTouchStart={handleListAreaTouchStart}>
                  <EquipmentScrollArea className="equipment-scroll-area-dynamic" contentClassName="space-y-0.5 py-0.5">
                    {equipment.map((item, index) => (
                      <SortableEquipmentItem
                        key={item.id}
                        item={item}
                        index={index}
                        onToggleEquip={() => toggleEquipped(item.id)}
                        onUpdateQuantity={(delta: number) => updateQuantity(item.id, delta)}
                        onRemove={() => requestDelete(item.id)}
                        onEdit={() => setEditingItem(item)}
                        canModify={canModify}
                        isEditing={isEditing}
                        isLocked={isLocked}
                        canReorder={canModify}
                        isSwipeOpen={openSwipeItemId === item.id}
                        onSwipeActivate={() => setOpenSwipeItemId(item.id)}
                      />
                    ))}
                  </EquipmentScrollArea>
                </div>
              </SortableContext>
            </DndContext>
          )}
        </TabsContent>

        {EQUIPMENT_CATEGORIES.map((cat) => (
          <TabsContent key={cat} value={cat} className="mt-0">
            {categorizedEquipment[cat].length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                {CATEGORY_ICONS[cat] && (
                  <div className="w-8 h-8 mx-auto mb-2 opacity-50 flex items-center justify-center [&>svg]:w-8 [&>svg]:h-8">
                    {CATEGORY_ICONS[cat]}
                  </div>
                )}
                <p>Добавьте {CATEGORY_LABELS[cat].toLowerCase()}</p>
                {canModify && CATEGORY_ITEMS[cat].length > 0 && (
                  <p className="text-xs mt-1">
                    Выберите из каталога или создайте
                  </p>
                )}
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={categorizedEquipment[cat].map(e => e.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div onTouchStart={handleListAreaTouchStart}>
                    <EquipmentScrollArea className="equipment-scroll-area-dynamic" contentClassName="space-y-0.5 py-0.5">
                      {categorizedEquipment[cat].map((item, index) => (
                        <SortableEquipmentItem
                          key={item.id}
                          item={item}
                          index={index}
                          onToggleEquip={() => toggleEquipped(item.id)}
                          onUpdateQuantity={(delta: number) => updateQuantity(item.id, delta)}
                          onRemove={() => requestDelete(item.id)}
                          onEdit={() => setEditingItem(item)}
                          canModify={canModify}
                          isEditing={isEditing}
                          isLocked={isLocked}
                          canReorder={canModify}
                          isSwipeOpen={openSwipeItemId === item.id}
                          onSwipeActivate={() => setOpenSwipeItemId(item.id)}
                        />
                      ))}
                    </EquipmentScrollArea>
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {equippedItems.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5 mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-medium text-muted-foreground">Экипировано</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {equippedItems.map((item) => (
              <Badge key={item.id} variant="secondary" className="gap-1 text-xs">
                {item.isArmor ? <ShieldCheck className="w-3 h-3" /> : <Sword className="w-3 h-3" />}
                {item.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {money !== undefined && onMoneyChange && (
        <div className="mt-3 pt-3 border-t border-border">
          <MoneyBlock flat money={money} onChange={onMoneyChange} isEditing={isEditing} />
        </div>
      )}

      {/* Delete confirmation modal */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить предмет?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && equipment.find(e => e.id === deleteTarget)?.name
                ? `«${equipment.find(e => e.id === deleteTarget)!.name}» будет удалён из инвентаря.`
                : "Предмет будет удалён из инвентаря."}
              {" "}Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit item dialog */}
      {editingItem && (
        <AddCustomItemDialog
          isEdit
          initialItem={editingItem}
          onUpdate={updateEquipmentItem}
          open={!!editingItem}
          onOpenChange={(open) => { if (!open) setEditingItem(null); }}
        />
      )}
    </Card>
  );
}
