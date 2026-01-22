import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Backpack, Plus, Trash2, Package, Shield, ShieldCheck, Lock, Unlock, 
  Sword, Apple, FlaskConical, Wrench, Trash, Search,
  Minus, ChevronDown, ChevronRight, Sparkles, GripVertical
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
import type { Equipment, EquipmentCategory, BaseEquipmentItem } from "@shared/schema";

interface EquipmentSystemProps {
  equipment: Equipment[];
  onChange: (equipment: Equipment[]) => void;
  isEditing: boolean;
  isLocked?: boolean;
  onToggleLock?: () => void;
  proficiencyBonus?: number;
}

const CATEGORY_ICONS: Record<EquipmentCategory, React.ReactNode> = {
  weapon: <Sword className="w-4 h-4" />,
  armor: <Shield className="w-4 h-4" />,
  food: <Apple className="w-4 h-4" />,
  potion: <FlaskConical className="w-4 h-4" />,
  tool: <Wrench className="w-4 h-4" />,
  misc: <Package className="w-4 h-4" />,
  trash: <Trash className="w-4 h-4" />,
};

const CATEGORY_ITEMS: Record<EquipmentCategory, BaseEquipmentItem[]> = {
  weapon: BASE_WEAPONS,
  armor: BASE_ARMOR,
  food: BASE_FOOD,
  potion: BASE_POTIONS,
  tool: BASE_TOOLS,
  misc: BASE_MISC,
  trash: [],
};

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7" data-testid={`button-catalog-${category}`}>
          <Package className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {CATEGORY_ICONS[category]}
            {CATEGORY_LABELS[category]}
          </DialogTitle>
          <DialogDescription>
            Выберите предмет из каталога D&D 5e
          </DialogDescription>
        </DialogHeader>
        
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

        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-1">
            {filteredItems.map((item, index) => (
              <button
                key={item.name}
                onClick={() => handleAdd(item)}
                className="w-full text-left p-2 rounded-md hover-elevate active-elevate-2 transition-colors"
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
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function AddCustomItemDialog({ 
  onAdd,
  defaultCategory = "misc"
}: { 
  onAdd: (item: Omit<Equipment, "id">) => void;
  defaultCategory?: EquipmentCategory;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<EquipmentCategory>(defaultCategory);
  const [quantity, setQuantity] = useState(1);
  const [weight, setWeight] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [isWeapon, setIsWeapon] = useState(false);
  const [isArmor, setIsArmor] = useState(false);
  const [damage, setDamage] = useState("1d6");
  const [damageType, setDamageType] = useState("рубящий");
  const [weaponProperties, setWeaponProperties] = useState("");
  const [armorBaseAC, setArmorBaseAC] = useState(12);

  const handleSubmit = () => {
    if (!name.trim()) return;
    
    const item: Omit<Equipment, "id"> = {
      name: name.trim(),
      quantity,
      weight,
      description: description || undefined,
      category: isWeapon ? "weapon" : isArmor ? "armor" : category,
      equipped: false,
    };

    if (isWeapon) {
      item.isWeapon = true;
      item.damage = damage;
      item.damageType = damageType;
      item.weaponProperties = weaponProperties || undefined;
      item.attackBonus = 0;
    }

    if (isArmor) {
      item.isArmor = true;
      item.armorType = "light";
      item.armorBaseAC = armorBaseAC;
      item.armorMaxDexBonus = null;
    }

    onAdd(item);
    resetForm();
    setOpen(false);
  };

  const resetForm = () => {
    setName("");
    setCategory("misc");
    setQuantity(1);
    setWeight(undefined);
    setDescription("");
    setIsWeapon(false);
    setIsArmor(false);
    setDamage("1d6");
    setDamageType("рубящий");
    setWeaponProperties("");
    setArmorBaseAC(12);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1" data-testid="button-add-custom">
          <Plus className="w-4 h-4" />
          <Sparkles className="w-3 h-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создать предмет</DialogTitle>
          <DialogDescription>
            Добавьте собственный предмет в инвентарь
          </DialogDescription>
        </DialogHeader>
        
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
            <div className="space-y-2 p-2 bg-muted/30 rounded-md">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Урон</label>
                  <Input
                    value={damage}
                    onChange={(e) => setDamage(e.target.value)}
                    placeholder="1d8"
                    data-testid="input-weapon-damage"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Тип урона</label>
                  <Input
                    value={damageType}
                    onChange={(e) => setDamageType(e.target.value)}
                    placeholder="рубящий"
                    data-testid="input-weapon-damage-type"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Свойства</label>
                <Input
                  value={weaponProperties}
                  onChange={(e) => setWeaponProperties(e.target.value)}
                  placeholder="универсальное, фехтовальное..."
                  data-testid="input-weapon-properties"
                />
              </div>
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

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
          <Button onClick={handleSubmit} disabled={!name.trim()} data-testid="button-save-custom">
            Добавить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SortableEquipmentItem({
  item,
  index,
  onToggleEquip,
  onUpdateQuantity,
  onRemove,
  canModify,
  isEditing,
  canReorder,
}: {
  item: Equipment;
  index: number;
  onToggleEquip: () => void;
  onUpdateQuantity: (delta: number) => void;
  onRemove: () => void;
  canModify: boolean;
  isEditing: boolean;
  canReorder: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !canReorder });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isEquippable = item.isWeapon || item.isArmor;

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 py-1.5 px-2 rounded-md ${item.equipped ? 'bg-accent/10' : 'hover-elevate'} ${isDragging ? 'z-50' : ''}`}
      data-testid={`equipment-item-${index}`}
    >
      {canReorder && (
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground touch-none"
          data-testid={`drag-handle-${index}`}
        >
          <GripVertical className="w-4 h-4" />
        </button>
      )}
      {isEquippable && (
        <Button
          variant="ghost"
          size="icon"
          className={`h-7 w-7 ${item.equipped ? 'text-accent' : 'text-muted-foreground'}`}
          onClick={onToggleEquip}
          data-testid={`button-equip-${index}`}
        >
          {item.isArmor ? (
            item.equipped ? <ShieldCheck className="w-4 h-4" /> : <Shield className="w-4 h-4" />
          ) : (
            <Sword className={`w-4 h-4 ${item.equipped ? 'text-accent' : ''}`} />
          )}
        </Button>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-sm font-medium ${item.equipped ? 'text-accent' : ''}`}>
            {item.name}
          </span>
          {item.quantity > 1 && (
            <Badge variant="secondary" className="text-xs h-5">x{item.quantity}</Badge>
          )}
          {item.isArmor && (
            <Badge variant="outline" className="text-xs h-5">КД {item.armorBaseAC}</Badge>
          )}
          {item.isWeapon && (
            <Badge variant="outline" className="text-xs h-5">{item.damage}</Badge>
          )}
        </div>
        {(item.description || item.weaponProperties || item.damageType) && (
          <div className="text-xs text-muted-foreground truncate">
            {item.isWeapon && item.damageType && <span>{item.damageType}</span>}
            {item.weaponProperties && <span> • {item.weaponProperties}</span>}
            {!item.isWeapon && item.description && <span>{item.description}</span>}
          </div>
        )}
      </div>

      {item.weight !== undefined && (
        <span className="text-xs text-muted-foreground shrink-0">
          {(item.weight * item.quantity).toFixed(1)}ф
        </span>
      )}

      {!isEditing && !isEquippable && (
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={() => onUpdateQuantity(-1)}
            data-testid={`button-qty-minus-${index}`}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={() => onUpdateQuantity(1)}
            data-testid={`button-qty-plus-${index}`}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      )}

      {canModify && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-destructive shrink-0"
          onClick={onRemove}
          data-testid={`button-remove-${index}`}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      )}
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
  proficiencyBonus = 2
}: EquipmentSystemProps) {
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const canModify = isEditing || !isLocked;

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
      trash: [],
    };
    
    equipment.forEach(item => {
      const cat = item.category || "misc";
      result[cat].push(item);
    });
    
    return result;
  }, [equipment]);

  const categoryCounts = useMemo(() => {
    const counts: Record<EquipmentCategory, number> = {
      weapon: 0, armor: 0, food: 0, potion: 0, tool: 0, misc: 0, trash: 0,
    };
    equipment.forEach(item => {
      const cat = item.category || "misc";
      counts[cat] += item.quantity;
    });
    return counts;
  }, [equipment]);

  const totalWeight = useMemo(() => 
    equipment.reduce((sum, e) => sum + (e.weight || 0) * e.quantity, 0),
    [equipment]
  );

  const addEquipment = (item: Omit<Equipment, "id">) => {
    onChange([...equipment, { ...item, id: crypto.randomUUID() }]);
  };

  const removeEquipment = (id: string) => {
    onChange(equipment.filter((e) => e.id !== id));
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
    <Card className="stat-card p-2 sm:p-3">
      <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
        <div className="flex items-center gap-2">
          <Backpack className="w-4 h-4 text-accent" />
          <h3 className="font-semibold text-xs sm:text-sm">Снаряжение</h3>
          <Badge variant="outline" className="text-[10px] sm:text-xs">
            {totalWeight.toFixed(1)} ф.
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {!isEditing && onToggleLock && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleLock}
                  className={`h-7 w-7 ${isLocked ? "text-muted-foreground" : "text-accent"}`}
                  data-testid="button-toggle-equipment-lock"
                >
                  {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isLocked ? "Разблокировать" : "Заблокировать"}
              </TooltipContent>
            </Tooltip>
          )}
          {canModify && <AddFromCatalogDialog onAdd={addEquipment} category={catalogCategory} />}
          {canModify && <AddCustomItemDialog onAdd={addEquipment} defaultCategory={catalogCategory} />}
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

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabsList className="w-full h-auto flex-wrap gap-0.5 p-1 mb-2">
          <TabsTrigger 
            value="all"
            className="flex-1 min-w-0 px-1.5 py-1 text-xs gap-1 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            data-testid="tab-all"
          >
            <Backpack className="w-4 h-4" />
            <span className="hidden sm:inline">Всё</span>
            {equipment.length > 0 && (
              <Badge variant="outline" className="h-4 px-1 text-[10px] ml-0.5">
                {equipment.reduce((sum, e) => sum + e.quantity, 0)}
              </Badge>
            )}
          </TabsTrigger>
          {EQUIPMENT_CATEGORIES.map((cat) => (
            <TabsTrigger 
              key={cat} 
              value={cat}
              className="flex-1 min-w-0 px-1.5 py-1 text-xs gap-1 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
              data-testid={`tab-${cat}`}
            >
              {CATEGORY_ICONS[cat]}
              <span className="hidden sm:inline">{CATEGORY_LABELS[cat]}</span>
              {categoryCounts[cat] > 0 && (
                <Badge variant="outline" className="h-4 px-1 text-[10px] ml-0.5">
                  {categoryCounts[cat]}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

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
                <div 
                  className="max-h-[300px] overflow-y-auto overscroll-contain"
                  style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
                >
                  <div className="space-y-0.5 pr-1">
                    {equipment.map((item, index) => (
                      <SortableEquipmentItem
                        key={item.id}
                        item={item}
                        index={index}
                        onToggleEquip={() => toggleEquipped(item.id)}
                        onUpdateQuantity={(delta: number) => updateQuantity(item.id, delta)}
                        onRemove={() => removeEquipment(item.id)}
                        canModify={canModify}
                        isEditing={isEditing}
                        canReorder={canModify}
                      />
                    ))}
                  </div>
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
                    Выберите из каталога или создайте свой
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
                  <div 
                    className="max-h-[300px] overflow-y-auto overscroll-contain"
                    style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
                  >
                    <div className="space-y-0.5 pr-1">
                      {categorizedEquipment[cat].map((item, index) => (
                        <SortableEquipmentItem
                          key={item.id}
                          item={item}
                          index={index}
                          onToggleEquip={() => toggleEquipped(item.id)}
                          onUpdateQuantity={(delta: number) => updateQuantity(item.id, delta)}
                          onRemove={() => removeEquipment(item.id)}
                          canModify={canModify}
                          isEditing={isEditing}
                          canReorder={canModify}
                        />
                      ))}
                    </div>
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}
