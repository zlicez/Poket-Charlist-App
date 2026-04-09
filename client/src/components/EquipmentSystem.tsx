import { useState, useMemo, useRef, useEffect } from "react";
import { cn, generateId } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpTooltip, TooltipBody } from "@/components/ui/help-tooltip";
import {
  EQUIPPED_ARMOR_TOOLTIP,
  EQUIPPED_SHIELD_TOOLTIP,
  EQUIPPED_WEAPON_TOOLTIP,
  ARMOR_AC_TOOLTIP,
} from "@/lib/tooltip-content";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  ResponsiveDialog,
  ResponsiveDialogTrigger,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import {
  Backpack, Plus, Trash2, Package, Shield, ShieldCheck, Lock, Unlock,
  Sword, Apple, FlaskConical, Wrench, Search,
  Minus, ChevronDown, ChevronRight, Sparkles, GripVertical, Pencil
} from "lucide-react";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  EQUIPMENT_CATEGORIES, 
  CATEGORY_LABELS,
  ALL_BASE_EQUIPMENT,
  BASE_WEAPONS,
  BASE_ARMOR,
  BASE_FOOD,
  BASE_POTIONS,
  BASE_TOOLS,
  BASE_MISC,
  createEquipmentFromBase
} from "@shared/schema";
import type { Equipment, EquipmentCategory, BaseEquipmentItem, Money } from "@shared/schema";
import { MoneyBlock } from "./MoneyBlock";
import { WeaponFormFields } from "@/components/WeaponFormFields";
import {
  DEFAULT_WEAPON_FORM_VALUES,
  createEquipmentWeaponFromForm,
  type WeaponFormValues,
} from "@/lib/weapons";

interface EquipmentSystemProps {
  equipment: Equipment[];
  onChange: (equipment: Equipment[]) => void;
  isEditing: boolean;
  isLocked?: boolean;
  onToggleLock?: () => void;
  proficiencyBonus?: number;
  money?: Money;
  onMoneyChange?: (money: Money) => void;
}

const CATEGORY_ICONS: Record<EquipmentCategory, React.ReactNode> = {
  weapon: <Sword className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
  armor: <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
  food: <Apple className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
  potion: <FlaskConical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
  tool: <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
  misc: <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
};

const CATEGORY_ITEMS: Record<EquipmentCategory, BaseEquipmentItem[]> = {
  weapon: BASE_WEAPONS,
  armor: BASE_ARMOR,
  food: BASE_FOOD,
  potion: BASE_POTIONS,
  tool: BASE_TOOLS,
  misc: BASE_MISC,
};

function EquipmentScrollArea({
  children,
  className,
  contentClassName,
}: {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <ScrollArea
      className={cn("equipment-scroll-area", className)}
      viewportClassName="equipment-scroll-viewport overscroll-contain touch-pan-y"
      scrollbarClassName="equipment-scrollbar"
      thumbClassName="equipment-scrollbar-thumb"
    >
      <div className={cn("pr-3", contentClassName)}>{children}</div>
    </ScrollArea>
  );
}

function AddFromCatalogDialog({ 
  onAdd, 
  category 
}: { 
  onAdd: (item: Omit<Equipment, "id">) => void;
  category: EquipmentCategory;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const items = CATEGORY_ITEMS[category];
  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    return items.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase())
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
                    <span>{item.damage} {item.damageType}</span>
                  )}
                  {item.isArmor && (
                    <span>КД {item.armorBaseAC}</span>
                  )}
                  {item.description && !item.isWeapon && !item.isArmor && (
                    <span>{item.description}</span>
                  )}
                  {item.weaponProperties && (
                    <span className="block text-muted-foreground/70">{item.weaponProperties}</span>
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

function AddCustomItemDialog({
  onAdd,
  onUpdate,
  defaultCategory = "misc",
  initialItem,
  isEdit = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  onAdd?: (item: Omit<Equipment, "id">) => void;
  onUpdate?: (item: Equipment) => void;
  defaultCategory?: EquipmentCategory;
  initialItem?: Equipment;
  isEdit?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const initialCategory = initialItem
    ? (initialItem.isWeapon ? "misc" : initialItem.isArmor ? "misc" : (initialItem.category ?? "misc") as EquipmentCategory)
    : defaultCategory === "weapon" || defaultCategory === "armor" ? "misc" : defaultCategory;
  const defaultIsWeapon = initialItem ? !!initialItem.isWeapon : defaultCategory === "weapon";
  const defaultIsArmor = initialItem ? !!initialItem.isArmor : defaultCategory === "armor";

  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalOpen;

  const [name, setName] = useState(initialItem?.name ?? "");
  const [category, setCategory] = useState<EquipmentCategory>(initialCategory as EquipmentCategory);
  const [quantity, setQuantity] = useState(initialItem?.quantity ?? 1);
  const [weight, setWeight] = useState<number | undefined>(initialItem?.weight);
  const [description, setDescription] = useState(initialItem?.description ?? "");
  const [isWeapon, setIsWeapon] = useState(defaultIsWeapon);
  const [isArmor, setIsArmor] = useState(defaultIsArmor);
  const [weaponForm, setWeaponForm] = useState<WeaponFormValues>(
    initialItem?.isWeapon
      ? {
          ...DEFAULT_WEAPON_FORM_VALUES,
          damage: initialItem.damage ?? DEFAULT_WEAPON_FORM_VALUES.damage,
          damageType: initialItem.damageType ?? DEFAULT_WEAPON_FORM_VALUES.damageType,
          properties: initialItem.weaponProperties ?? DEFAULT_WEAPON_FORM_VALUES.properties,
        }
      : DEFAULT_WEAPON_FORM_VALUES
  );
  const [armorBaseAC, setArmorBaseAC] = useState(initialItem?.armorBaseAC ?? 12);

  // Sync state when initialItem changes (edit dialog re-opens with new item)
  const prevItemId = useRef<string | undefined>(undefined);
  if (open && initialItem && initialItem.id !== prevItemId.current) {
    prevItemId.current = initialItem.id;
    setName(initialItem.name ?? "");
    setQuantity(initialItem.quantity ?? 1);
    setWeight(initialItem.weight);
    setDescription(initialItem.description ?? "");
    setIsWeapon(!!initialItem.isWeapon);
    setIsArmor(!!initialItem.isArmor);
    setArmorBaseAC(initialItem.armorBaseAC ?? 12);
    const cat = initialItem.isWeapon || initialItem.isArmor
      ? "misc"
      : ((initialItem.category ?? "misc") as EquipmentCategory);
    setCategory(cat);
  }

  const handleSubmit = () => {
    if (!name.trim()) return;

    let item: Omit<Equipment, "id"> = {
      name: name.trim(),
      quantity,
      weight,
      description: description || undefined,
      category: isWeapon ? "weapon" : isArmor ? "armor" : category,
      equipped: initialItem?.equipped ?? false,
    };

    if (isWeapon) {
      item = createEquipmentWeaponFromForm(name, weaponForm, {
        quantity,
        weight,
        description,
        equipped: initialItem?.equipped ?? false,
      });
    }

    if (isArmor) {
      item.isArmor = true;
      item.armorType = "light";
      item.armorBaseAC = armorBaseAC;
      item.armorMaxDexBonus = null;
    }

    if (isEdit && initialItem && onUpdate) {
      onUpdate({ ...item, id: initialItem.id });
    } else if (onAdd) {
      onAdd(item);
    }
    resetForm();
    setOpen(false);
  };

  const resetForm = () => {
    if (!isEdit) {
      setName("");
      setCategory(initialCategory as EquipmentCategory);
      setQuantity(1);
      setWeight(undefined);
      setDescription("");
      setIsWeapon(defaultIsWeapon);
      setIsArmor(defaultIsArmor);
      setWeaponForm(DEFAULT_WEAPON_FORM_VALUES);
      setArmorBaseAC(12);
      prevItemId.current = undefined;
    }
  };

  const dialogContent = (
    <ResponsiveDialogContent>
      <ResponsiveDialogHeader>
        <ResponsiveDialogTitle>{isEdit ? "Редактировать предмет" : "Создать предмет"}</ResponsiveDialogTitle>
        <ResponsiveDialogDescription>
          {isEdit ? "Изменить данные предмета" : "Добавьте собственный предмет в инвентарь"}
        </ResponsiveDialogDescription>
      </ResponsiveDialogHeader>

      <div className="space-y-3">
        <div>
          <label className="text-sm text-muted-foreground">Название</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Название предмета"
            data-testid="input-custom-name"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="is-weapon"
              checked={isWeapon}
              onCheckedChange={(checked) => {
                setIsWeapon(!!checked);
                if (checked) setIsArmor(false);
              }}
              data-testid="checkbox-is-weapon"
            />
            <label htmlFor="is-weapon" className="text-sm">Оружие</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="is-armor"
              checked={isArmor}
              onCheckedChange={(checked) => {
                setIsArmor(!!checked);
                if (checked) setIsWeapon(false);
              }}
              data-testid="checkbox-is-armor"
            />
            <label htmlFor="is-armor" className="text-sm">Доспех</label>
          </div>
        </div>

        {!isWeapon && !isArmor && (
          <div>
            <label className="text-sm text-muted-foreground">Категория</label>
            <Select value={category} onValueChange={(v) => setCategory(v as EquipmentCategory)}>
              <SelectTrigger data-testid="select-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EQUIPMENT_CATEGORIES.filter(c => c !== "weapon" && c !== "armor").map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    <span className="flex items-center gap-2">
                      {CATEGORY_ICONS[cat]}
                      {CATEGORY_LABELS[cat]}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {isWeapon && (
          <div className="p-2 bg-muted/30 rounded-md">
            <WeaponFormFields
              values={weaponForm}
              onChange={(updates) => setWeaponForm((prev) => ({ ...prev, ...updates }))}
            />
          </div>
        )}

        {isArmor && (
          <div className="p-2 bg-muted/30 rounded-md">
            <label className="text-xs text-muted-foreground">Базовый КД</label>
            <Input
              type="number"
              min={10}
              max={20}
              value={armorBaseAC}
              onChange={(e) => setArmorBaseAC(parseInt(e.target.value) || 10)}
              data-testid="input-armor-ac"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm text-muted-foreground">Количество</label>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              data-testid="input-custom-quantity"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Вес (фунты)</label>
            <Input
              type="number"
              min={0}
              step={0.1}
              value={weight ?? ""}
              onChange={(e) => setWeight(e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="—"
              data-testid="input-custom-weight"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-muted-foreground">Описание</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание предмета..."
            data-testid="input-custom-description"
          />
        </div>
      </div>

      <ResponsiveDialogFooter>
        <Button variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Отмена</Button>
        <Button onClick={handleSubmit} disabled={!name.trim()} data-testid="button-save-custom">
          {isEdit ? "Сохранить" : "Добавить"}
        </Button>
      </ResponsiveDialogFooter>
    </ResponsiveDialogContent>
  );

  if (isEdit) {
    return (
      <ResponsiveDialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
        {dialogContent}
      </ResponsiveDialog>
    );
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
      <ResponsiveDialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 h-10 sm:h-9 px-3" data-testid="button-add-custom">
          <Plus className="w-4 h-4" />
          <Sparkles className="w-3 h-3" />
        </Button>
      </ResponsiveDialogTrigger>
      {dialogContent}
    </ResponsiveDialog>
  );
}

// Width of the action strip when snapped open (edit + delete buttons + gap + padding)
const SWIPE_REVEAL_PX = 112;

function SortableEquipmentItem({
  item,
  index,
  onToggleEquip,
  onUpdateQuantity,
  onRemove,
  onEdit,
  canModify,
  isEditing,
  canReorder,
  isSwipeOpen,
  onSwipeActivate,
}: {
  item: Equipment;
  index: number;
  onToggleEquip: () => void;
  onUpdateQuantity: (delta: number) => void;
  onRemove: () => void;
  onEdit: () => void;
  canModify: boolean;
  isEditing: boolean;
  canReorder: boolean;
  isSwipeOpen: boolean;
  onSwipeActivate: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: !canReorder,
  });

  // Container ref to measure actual rendered width for trigger threshold
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(320);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    ro.observe(el);
    setContainerWidth(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  const [swipeX, setSwipeX] = useState(0);
  // snapping=true: CSS transition enabled (finger lifted); false: instant follow
  const [snapping, setSnapping] = useState(false);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const swipeXAtTouchStart = useRef(0);
  const dirLocked = useRef<'h' | 'v' | null>(null);
  const touchMoved = useRef(false);

  // Close smoothly when another item becomes active or outside tap happens
  useEffect(() => {
    if (!isSwipeOpen && swipeX > 0) {
      setSnapping(true);
      setSwipeX(0);
    }
  }, [isSwipeOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // The threshold at which a full swipe commits delete (65% of row width)
  const triggerAt = Math.min(containerWidth * 0.65, containerWidth - 16);

  // t: progress from REVEAL to commit (0..1) — drives phase-2 visuals
  const t = containerWidth > 0
    ? Math.min(1, Math.max(0, (swipeX - SWIPE_REVEAL_PX) / Math.max(1, triggerAt - SWIPE_REVEAL_PX)))
    : 0;
  const isCommitting = t >= 0.92;

  // Edit button collapses as t goes 0 → 0.5
  const editWidthPx = Math.round(52 * Math.max(0, 1 - t / 0.5));
  const editOpacity = Math.max(0, 1 - t / 0.35);
  const showEditBtn = editWidthPx > 3;
  const gapPx = showEditBtn ? 4 : 0;

  const snapTransition = `transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
  const snapFastTransition = `transform 0.18s cubic-bezier(0.4, 0, 1, 1)`;

  const snapOpen = () => { setSnapping(true); setSwipeX(SWIPE_REVEAL_PX); };
  const snapClose = () => { setSnapping(true); setSwipeX(0); };
  const commitDelete = () => {
    // Animate item off-screen then call delete
    setSnapping(true);
    setSwipeX(containerWidth + 20);
    setTimeout(() => {
      onRemove();
      setSwipeX(0);
      setSnapping(false);
    }, 200);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Always stop propagation so parent doesn't close this item
    e.stopPropagation();
    // Notify parent: this is the active item (closes all others)
    onSwipeActivate();
    if (!canModify) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    swipeXAtTouchStart.current = swipeX;
    dirLocked.current = null;
    touchMoved.current = false;
    setSnapping(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!canModify) return;
    const dx = touchStartX.current - e.touches[0].clientX; // positive = leftward
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);

    // Lock swipe direction on first significant movement
    if (dirLocked.current === null) {
      if (Math.abs(dx) < 4 && dy < 4) return;
      dirLocked.current = Math.abs(dx) >= dy ? 'h' : 'v';
    }
    if (dirLocked.current === 'v') return;

    touchMoved.current = true;
    e.preventDefault(); // stop page scroll while swiping horizontally

    const target = Math.max(0, Math.min(containerWidth * 0.85, swipeXAtTouchStart.current + dx));
    setSwipeX(target);
  };

  const handleTouchEnd = () => {
    if (!canModify) return;

    // Tap on already-open item (no horizontal movement) → close
    if (!touchMoved.current && swipeX > 0) {
      snapClose();
      return;
    }

    if (isCommitting || swipeX >= triggerAt) {
      commitDelete();
    } else if (swipeX >= SWIPE_REVEAL_PX / 2) {
      snapOpen();
    } else {
      snapClose();
    }
  };

  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isEquippable = item.isWeapon || item.isArmor;
  const actionAreaVisible = swipeX > 2;

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        // @ts-ignore — dual ref
        containerRef.current = node;
      }}
      style={dndStyle}
      className={`relative rounded-md overflow-hidden ${isDragging ? 'z-50' : ''}`}
      data-testid={`equipment-item-${index}`}
    >
      {/* ── iOS-style swipe action strip (mobile only) ─────────────────── */}
      {canModify && (
        <div
          className="absolute inset-y-[2px] right-0 sm:hidden flex items-stretch overflow-hidden rounded-md"
          onTouchStart={(e) => e.stopPropagation()}
          style={{
            width: actionAreaVisible ? swipeX : 0,
            // Background fills in as phase-2 progresses (delete zone takes over)
            background: t > 0.05
              ? `hsl(var(--destructive) / ${0.12 + t * 0.88})`
              : 'transparent',
            transition: snapping
              ? `width 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94), background-color 0.2s ease`
              : 'none',
          }}
        >
          {/* Edit button — collapses as phase 2 begins */}
          {showEditBtn && (
            <button
              onClick={(e) => { e.stopPropagation(); snapClose(); onEdit(); }}
              aria-label="Редактировать"
              style={{
                width: editWidthPx,
                opacity: editOpacity,
                flexShrink: 0,
                marginRight: gapPx,
                transition: snapping ? 'width 0.2s ease, opacity 0.15s ease' : 'none',
              }}
              className="flex items-center justify-center rounded-md bg-accent text-accent-foreground overflow-hidden"
            >
              <Pencil size={16} />
            </button>
          )}

          {/* Delete button — expands to fill all remaining space */}
          <button
            onClick={(e) => { e.stopPropagation(); snapClose(); onRemove(); }}
            aria-label="Удалить"
            className="flex-1 flex items-center justify-center rounded-md text-white"
            style={{
              // Phase 1: standard red bg; phase 2: transparent (action area bg takes over)
              background: t > 0.15 ? 'transparent' : 'hsl(var(--destructive))',
              minWidth: 48,
              transition: snapping ? 'background-color 0.2s ease' : 'none',
            }}
          >
            <Trash2
              size={isCommitting ? 22 : 18}
              style={{
                transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: isCommitting ? 'scale(1.25)' : 'scale(1)',
              }}
            />
          </button>
        </div>
      )}

      {/* ── Main item row ───────────────────────────────────────────────── */}
      <div
        className={`group flex items-center gap-1.5 sm:gap-2 py-1.5 px-1.5 sm:px-2 rounded-md ${item.equipped ? 'bg-accent/10' : 'hover-elevate'}`}
        style={{
          transform: `translateX(-${swipeX}px)`,
          transition: snapping ? snapTransition : 'none',
          willChange: 'transform',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {canReorder && (
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-0.5 text-muted-foreground hover:text-foreground touch-none min-w-[32px] min-h-[36px] flex items-center justify-center shrink-0"
            data-testid={`drag-handle-${index}`}
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
        )}

        {isEquippable && (
          <HelpTooltip
            content={
              item.isArmor && item.armorType === "shield"
                ? <TooltipBody title={EQUIPPED_SHIELD_TOOLTIP.title} lines={EQUIPPED_SHIELD_TOOLTIP.lines} />
                : item.isArmor
                ? <TooltipBody title={EQUIPPED_ARMOR_TOOLTIP.title} lines={EQUIPPED_ARMOR_TOOLTIP.lines} />
                : <TooltipBody title={EQUIPPED_WEAPON_TOOLTIP.title} lines={EQUIPPED_WEAPON_TOOLTIP.lines} />
            }
            side="right"
            asChild
          >
            <Button
              variant="ghost"
              size="icon"
              className={`h-10 w-10 sm:h-9 sm:w-9 shrink-0 ${item.equipped ? 'text-accent' : 'text-muted-foreground'}`}
              onClick={onToggleEquip}
              data-testid={`button-equip-${index}`}
            >
              {item.isArmor ? (
                item.equipped ? <ShieldCheck className="w-4 h-4" /> : <Shield className="w-4 h-4" />
              ) : (
                <Sword className={`w-4 h-4 ${item.equipped ? 'text-accent' : ''}`} />
              )}
            </Button>
          </HelpTooltip>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <span className={`text-sm font-medium truncate ${item.equipped ? 'text-accent' : ''}`}>
              {item.name}
            </span>
            {item.quantity > 1 && (
              <Badge variant="secondary" className="text-[10px] sm:text-xs h-4 sm:h-5 px-1">x{item.quantity}</Badge>
            )}
            {item.isArmor && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-[10px] sm:text-xs h-4 sm:h-5 px-1 hidden sm:inline-flex cursor-help">КД {item.armorBaseAC}</Badge>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[240px]">
                  <TooltipBody
                    title={ARMOR_AC_TOOLTIP(item.armorBaseAC ?? 10, item.armorMaxDexBonus ?? null).title}
                    lines={ARMOR_AC_TOOLTIP(item.armorBaseAC ?? 10, item.armorMaxDexBonus ?? null).lines}
                  />
                </TooltipContent>
              </Tooltip>
            )}
            {item.isWeapon && (
              <Badge variant="outline" className="text-[10px] sm:text-xs h-4 sm:h-5 px-1 hidden sm:inline-flex">{item.damage}</Badge>
            )}
          </div>
          {(item.description || item.weaponProperties || item.damageType) && (
            <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
              {item.isWeapon && item.damageType && <span>{item.damageType}</span>}
              {item.weaponProperties && <span> • {item.weaponProperties}</span>}
              {!item.isWeapon && item.description && <span>{item.description}</span>}
            </div>
          )}
        </div>

        {item.weight !== undefined && (
          <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0 hidden sm:inline">
            {(item.weight * item.quantity).toFixed(1)}ф
          </span>
        )}

        {!isEditing && !isEquippable && (
          <div className="flex items-center shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 sm:h-9 sm:w-9"
              onClick={() => onUpdateQuantity(-1)}
              data-testid={`button-qty-minus-${index}`}
            >
              <Minus className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 sm:h-9 sm:w-9"
              onClick={() => onUpdateQuantity(1)}
              data-testid={`button-qty-plus-${index}`}
            >
              <Plus className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
            </Button>
          </div>
        )}

        {/* Desktop: hover-reveal edit + delete (no swipe needed) */}
        {canModify && (
          <div className="hidden sm:flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={onEdit}
              data-testid={`button-edit-${index}`}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-destructive hover:text-destructive"
              onClick={onRemove}
              data-testid={`button-remove-${index}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

type TabValue = EquipmentCategory | "all";

export function EquipmentSystem({
  equipment,
  onChange,
  isEditing,
  isLocked = false,
  onToggleLock,
  proficiencyBonus = 2,
  money,
  onMoneyChange,
}: EquipmentSystemProps) {
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
        onChange(arrayMove(equipment, oldIndex, newIndex));
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
    onChange([...equipment, { ...item, id: generateId() }]);
  };

  const removeEquipment = (id: string) => {
    onChange(equipment.filter((e) => e.id !== id));
  };

  const updateEquipmentItem = (updated: Equipment) => {
    onChange(equipment.map((e) => e.id === updated.id ? updated : e));
  };

  const requestDelete = (id: string) => setDeleteTarget(id);
  const confirmDelete = () => {
    if (deleteTarget) removeEquipment(deleteTarget);
    setDeleteTarget(null);
  };

  const toggleEquipped = (id: string) => {
    const toggledItem = equipment.find(e => e.id === id);
    if (!toggledItem) return;
    
    const isEquipping = !toggledItem.equipped;
    
    if (toggledItem.isArmor) {
      const isNonShieldArmor = toggledItem.armorType !== "shield";
      onChange(equipment.map((e) => {
        if (e.id === id) {
          return { ...e, equipped: isEquipping };
        }
        if (isEquipping && isNonShieldArmor && e.isArmor && e.armorType !== "shield" && e.id !== id) {
          return { ...e, equipped: false };
        }
        return e;
      }));
    } else {
      onChange(equipment.map((e) => 
        e.id === id ? { ...e, equipped: isEquipping } : e
      ));
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    onChange(equipment.map((e) => {
      if (e.id === id) {
        const newQty = Math.max(0, e.quantity + delta);
        return newQty === 0 ? null : { ...e, quantity: newQty };
      }
      return e;
    }).filter(Boolean) as Equipment[]);
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

        {equippedItems.length > 0 && (
          <div className="mb-2 p-2 bg-accent/10 rounded-md">
            <div className="text-xs text-muted-foreground mb-1">Экипировано:</div>
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

      {money !== undefined && onMoneyChange && (
        <div className="mt-auto pt-3 border-t border-border">
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
