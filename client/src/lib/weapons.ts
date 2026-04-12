import type { Equipment, Weapon, WeaponAbilityMod } from "@shared/schema";

export type WeaponCategory = "simple" | "martial" | "exotic";

export interface WeaponFormValues {
  attackBonus: number;
  damage: string;
  damageType: string;
  properties: string[];
  abilityMod: WeaponAbilityMod;
  weaponCategory: WeaponCategory | undefined;
}

export const DEFAULT_WEAPON_FORM_VALUES: WeaponFormValues = {
  attackBonus: 0,
  damage: "1d8",
  damageType: "рубящий",
  properties: [],
  abilityMod: "str",
  weaponCategory: undefined,
};

function propsToString(properties: string[]): string | undefined {
  return properties.length > 0 ? properties.join(", ") : undefined;
}

function propsToArray(properties: string | undefined): string[] {
  if (!properties) return [];
  return properties.split(/,\s*/).filter(Boolean);
}

function isFinesseFromProps(properties: string[]): boolean {
  return properties.some(
    (p) => p.toLowerCase().includes("фехтовальное"),
  );
}

export function weaponToFormValues(weapon: Weapon): WeaponFormValues {
  return {
    attackBonus: weapon.attackBonus,
    damage: weapon.damage,
    damageType: weapon.damageType,
    properties: propsToArray(weapon.properties),
    abilityMod: weapon.abilityMod,
    weaponCategory: weapon.weaponCategory,
  };
}

export function createWeaponFromForm(name: string, values: WeaponFormValues): Omit<Weapon, "id"> {
  const isFinesse = isFinesseFromProps(values.properties);
  return {
    name: name.trim(),
    attackBonus: values.attackBonus,
    damage: values.damage.trim() || "1d8",
    damageType: values.damageType.trim() || "рубящий",
    properties: propsToString(values.properties),
    abilityMod: isFinesse ? "dex" : values.abilityMod,
    isFinesse,
    weaponCategory: values.weaponCategory,
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
  const isFinesse = isFinesseFromProps(values.properties);
  return {
    name: name.trim(),
    quantity: options?.quantity ?? 1,
    weight: options?.weight,
    description: options?.description || undefined,
    category: "weapon",
    isWeapon: true,
    damage: values.damage.trim() || "1d8",
    damageType: values.damageType.trim() || "рубящий",
    weaponProperties: propsToString(values.properties),
    weaponCategory: values.weaponCategory,
    attackBonus: values.attackBonus,
    abilityMod: isFinesse ? "dex" : values.abilityMod,
    isFinesse,
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
    weaponCategory: item.weaponCategory,
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

export { propsToArray as weaponPropsToArray };
