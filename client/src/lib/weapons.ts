import type { Equipment, Weapon, WeaponAbilityMod } from "@shared/schema";

export interface WeaponFormValues {
  attackBonus: number;
  damage: string;
  damageType: string;
  properties: string;
  abilityMod: WeaponAbilityMod;
  isFinesse: boolean;
}

export const DEFAULT_WEAPON_FORM_VALUES: WeaponFormValues = {
  attackBonus: 0,
  damage: "1d8",
  damageType: "рубящий",
  properties: "",
  abilityMod: "str",
  isFinesse: false,
};

export function createWeaponFromForm(name: string, values: WeaponFormValues): Omit<Weapon, "id"> {
  return {
    name: name.trim(),
    attackBonus: values.attackBonus,
    damage: values.damage.trim() || "1d8",
    damageType: values.damageType.trim() || "рубящий",
    properties: values.properties.trim() || undefined,
    abilityMod: values.abilityMod,
    isFinesse: values.isFinesse,
  };
}

export function createEquipmentWeaponFromForm(
  name: string,
  values: WeaponFormValues,
  options?: {
    quantity?: number;
    weight?: number;
    description?: string;
    equipped?: boolean;
  },
): Omit<Equipment, "id"> {
  return {
    name: name.trim(),
    quantity: options?.quantity ?? 1,
    weight: options?.weight,
    description: options?.description || undefined,
    category: "weapon",
    isWeapon: true,
    damage: values.damage.trim() || "1d8",
    damageType: values.damageType.trim() || "рубящий",
    weaponProperties: values.properties.trim() || undefined,
    attackBonus: values.attackBonus,
    abilityMod: values.abilityMod,
    isFinesse: values.isFinesse,
    equipped: options?.equipped ?? false,
  };
}

export function equipmentWeaponToWeapon(item: Equipment): Weapon {
  return {
    id: item.id,
    name: item.name,
    attackBonus: item.attackBonus || 0,
    damage: item.damage || "1d4",
    damageType: item.damageType || "дробящий",
    properties: item.weaponProperties,
    abilityMod: (item.abilityMod || "str") as WeaponAbilityMod,
    isFinesse: item.isFinesse,
  };
}

export function getEquippedInventoryWeapons(equipment: Equipment[]): Weapon[] {
  return equipment
    .filter((item) => item.isWeapon && item.equipped)
    .map(equipmentWeaponToWeapon);
}

export function getCombinedWeapons(weapons: Weapon[], equipment: Equipment[]): Weapon[] {
  return [...getEquippedInventoryWeapons(equipment), ...weapons];
}
