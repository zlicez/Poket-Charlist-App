import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Sparkles } from "lucide-react";
import {
  CATEGORY_LABELS,
  EQUIPMENT_CATEGORIES,
} from "@shared/schema";
import type { Equipment, EquipmentCategory } from "@shared/schema";
import { WeaponFormFields } from "@/components/WeaponFormFields";
import {
  DEFAULT_WEAPON_FORM_VALUES,
  createEquipmentWeaponFromForm,
  normalizeWeaponGripMode,
  parseWeaponProperties,
  type WeaponFormValues,
} from "@/lib/weapons";

import { CATEGORY_ICONS } from "./constants";

export function AddCustomItemDialog({
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
      ? (() => {
          const parsedProperties = parseWeaponProperties(initialItem.weaponProperties);
          const versatileDamage =
            initialItem.versatileDamage ?? parsedProperties.versatileDamage ?? "";

          return {
            ...DEFAULT_WEAPON_FORM_VALUES,
            damage: initialItem.damage ?? DEFAULT_WEAPON_FORM_VALUES.damage,
            versatileDamage,
            damageType: initialItem.damageType ?? DEFAULT_WEAPON_FORM_VALUES.damageType,
            properties: parsedProperties.properties,
            gripMode: normalizeWeaponGripMode({
              gripMode: initialItem.gripMode,
              versatileDamage,
              properties: initialItem.weaponProperties,
            }),
            weaponCategory: initialItem.weaponCategory,
            abilityMod: (initialItem.abilityMod ?? DEFAULT_WEAPON_FORM_VALUES.abilityMod) as "str" | "dex",
            attackBonus: initialItem.attackBonus ?? DEFAULT_WEAPON_FORM_VALUES.attackBonus,
          };
        })()
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
    if (initialItem.isWeapon) {
      const parsedProperties = parseWeaponProperties(initialItem.weaponProperties);
      const versatileDamage =
        initialItem.versatileDamage ?? parsedProperties.versatileDamage ?? "";

      setWeaponForm({
        ...DEFAULT_WEAPON_FORM_VALUES,
        damage: initialItem.damage ?? DEFAULT_WEAPON_FORM_VALUES.damage,
        versatileDamage,
        damageType: initialItem.damageType ?? DEFAULT_WEAPON_FORM_VALUES.damageType,
        properties: parsedProperties.properties,
        gripMode: normalizeWeaponGripMode({
          gripMode: initialItem.gripMode,
          versatileDamage,
          properties: initialItem.weaponProperties,
        }),
        weaponCategory: initialItem.weaponCategory,
        abilityMod: (initialItem.abilityMod ?? DEFAULT_WEAPON_FORM_VALUES.abilityMod) as "str" | "dex",
        attackBonus: initialItem.attackBonus ?? DEFAULT_WEAPON_FORM_VALUES.attackBonus,
      });
    }
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
