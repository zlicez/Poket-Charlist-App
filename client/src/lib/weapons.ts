import type {
  Equipment,
  Weapon,
  WeaponAbilityMod,
  WeaponGripMode,
} from "@shared/schema";

export type WeaponCategory = "simple" | "martial" | "exotic";

export interface WeaponFormValues {
  attackBonus: number;
  damage: string;
  versatileDamage: string;
  damageType: string;
  properties: string[];
  gripMode: WeaponGripMode;
  abilityMod: WeaponAbilityMod;
  weaponCategory: WeaponCategory | undefined;
}

type WeaponPropertySource = {
  damage?: string;
  versatileDamage?: string;
  gripMode?: WeaponGripMode;
  properties?: string;
};

const DEFAULT_DAMAGE_TYPE = "рубящий";
const DEFAULT_WEAPON_DAMAGE = "1d8";
const DEFAULT_FALLBACK_DAMAGE = "1d4";
const VERSATILE_PROPERTY_LABEL = "Универсальное";
const FINESSE_PROPERTY_LABEL = "Фехтовальное";
const LEGACY_VERSATILE_PROPERTY_RE = /^универсальное(?:\s*\(([^)]+)\))?$/i;

export const WEAPON_GRIP_LABELS: Record<WeaponGripMode, string> = {
  oneHand: "1 рука",
  twoHand: "2 руки",
};

export const DEFAULT_WEAPON_FORM_VALUES: WeaponFormValues = {
  attackBonus: 0,
  damage: DEFAULT_WEAPON_DAMAGE,
  versatileDamage: "",
  damageType: DEFAULT_DAMAGE_TYPE,
  properties: [],
  gripMode: "oneHand",
  abilityMod: "str",
  weaponCategory: undefined,
};

function normalizeDamageValue(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function isVersatileProperty(property: string): boolean {
  return property.trim().toLowerCase() === VERSATILE_PROPERTY_LABEL.toLowerCase();
}

function normalizePropertyToken(
  property: string,
): { property?: string; versatileDamage?: string } {
  const normalized = property.trim();
  if (!normalized) return {};

  const versatileMatch = normalized.match(LEGACY_VERSATILE_PROPERTY_RE);
  if (versatileMatch) {
    return {
      property: VERSATILE_PROPERTY_LABEL,
      versatileDamage: normalizeDamageValue(versatileMatch[1]),
    };
  }

  return { property: normalized };
}

export function parseWeaponProperties(
  properties: string | undefined,
): { properties: string[]; versatileDamage?: string } {
  if (!properties) return { properties: [] };

  const normalizedProperties: string[] = [];
  let versatileDamage: string | undefined;

  for (const token of properties.split(/,\s*/)) {
    const normalized = normalizePropertyToken(token);
    if (normalized.property && !normalizedProperties.includes(normalized.property)) {
      normalizedProperties.push(normalized.property);
    }
    if (!versatileDamage && normalized.versatileDamage) {
      versatileDamage = normalized.versatileDamage;
    }
  }

  return { properties: normalizedProperties, versatileDamage };
}

function propsToString(properties: string[]): string | undefined {
  return properties.length > 0 ? properties.join(", ") : undefined;
}

export function weaponPropsToArray(properties: string | undefined): string[] {
  return parseWeaponProperties(properties).properties;
}

function resolveVersatileDamage(
  versatileDamage: string | undefined,
  properties: string | undefined,
): string | undefined {
  return normalizeDamageValue(versatileDamage) ?? parseWeaponProperties(properties).versatileDamage;
}

export function hasVersatileDamage(source: {
  versatileDamage?: string;
  properties?: string;
}): boolean {
  return Boolean(resolveVersatileDamage(source.versatileDamage, source.properties));
}

export function normalizeWeaponGripMode(source: {
  gripMode?: WeaponGripMode;
  versatileDamage?: string;
  properties?: string;
}): WeaponGripMode {
  if (!hasVersatileDamage(source)) {
    return "oneHand";
  }

  return source.gripMode === "twoHand" ? "twoHand" : "oneHand";
}

export function getWeaponPropertiesDisplay(
  properties: string | undefined,
  versatileDamage?: string,
): string | undefined {
  const parsed = parseWeaponProperties(properties);
  const resolvedVersatileDamage =
    normalizeDamageValue(versatileDamage) ?? parsed.versatileDamage;

  if (parsed.properties.length === 0) return undefined;

  return parsed.properties
    .map((property) => {
      if (isVersatileProperty(property) && resolvedVersatileDamage) {
        return `${VERSATILE_PROPERTY_LABEL} (${resolvedVersatileDamage})`;
      }
      return property;
    })
    .join(", ");
}

export function getActiveWeaponDamage(source: WeaponPropertySource): string {
  const baseDamage = normalizeDamageValue(source.damage) ?? DEFAULT_FALLBACK_DAMAGE;
  const versatileDamage = resolveVersatileDamage(
    source.versatileDamage,
    source.properties,
  );
  const gripMode = normalizeWeaponGripMode(source);

  if (gripMode === "twoHand" && versatileDamage) {
    return versatileDamage;
  }

  return baseDamage;
}

function isFinesseFromProps(properties: string[]): boolean {
  return properties.some(
    (property) =>
      property.trim().toLowerCase() === FINESSE_PROPERTY_LABEL.toLowerCase(),
  );
}

function normalizeFormVersatileDamage(values: WeaponFormValues): string | undefined {
  if (!values.properties.some(isVersatileProperty)) {
    return undefined;
  }

  return normalizeDamageValue(values.versatileDamage);
}

export function weaponToFormValues(weapon: Weapon): WeaponFormValues {
  const parsed = parseWeaponProperties(weapon.properties);
  const versatileDamage = resolveVersatileDamage(
    weapon.versatileDamage,
    weapon.properties,
  );

  return {
    attackBonus: weapon.attackBonus,
    damage: weapon.damage,
    versatileDamage: versatileDamage ?? "",
    damageType: weapon.damageType,
    properties: parsed.properties,
    gripMode: normalizeWeaponGripMode({
      gripMode: weapon.gripMode,
      versatileDamage,
      properties: weapon.properties,
    }),
    abilityMod: weapon.abilityMod,
    weaponCategory: weapon.weaponCategory,
  };
}

export function createWeaponFromForm(
  name: string,
  values: WeaponFormValues,
): Omit<Weapon, "id"> {
  const isFinesse = isFinesseFromProps(values.properties);
  const versatileDamage = normalizeFormVersatileDamage(values);

  return {
    name: name.trim(),
    attackBonus: values.attackBonus,
    damage: normalizeDamageValue(values.damage) ?? DEFAULT_WEAPON_DAMAGE,
    versatileDamage,
    damageType: normalizeDamageValue(values.damageType) ?? DEFAULT_DAMAGE_TYPE,
    properties: propsToString(values.properties),
    gripMode: normalizeWeaponGripMode({
      gripMode: values.gripMode,
      versatileDamage,
      properties: propsToString(values.properties),
    }),
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
  const versatileDamage = normalizeFormVersatileDamage(values);
  const weaponProperties = propsToString(values.properties);

  return {
    name: name.trim(),
    quantity: options?.quantity ?? 1,
    weight: options?.weight,
    description: options?.description || undefined,
    category: "weapon",
    isWeapon: true,
    damage: normalizeDamageValue(values.damage) ?? DEFAULT_WEAPON_DAMAGE,
    versatileDamage,
    damageType: normalizeDamageValue(values.damageType) ?? DEFAULT_DAMAGE_TYPE,
    weaponProperties,
    gripMode: normalizeWeaponGripMode({
      gripMode: values.gripMode,
      versatileDamage,
      properties: weaponProperties,
    }),
    weaponCategory: values.weaponCategory,
    attackBonus: values.attackBonus,
    abilityMod: isFinesse ? "dex" : values.abilityMod,
    isFinesse,
    equipped: options?.equipped ?? false,
  };
}

export function equipmentWeaponToWeapon(item: Equipment): Weapon {
  const versatileDamage = resolveVersatileDamage(
    item.versatileDamage,
    item.weaponProperties,
  );

  return {
    id: item.id,
    name: item.name,
    attackBonus: item.attackBonus || 0,
    damage: item.damage || DEFAULT_FALLBACK_DAMAGE,
    versatileDamage,
    damageType: item.damageType || "дробящий",
    properties: item.weaponProperties,
    gripMode: normalizeWeaponGripMode({
      gripMode: item.gripMode,
      versatileDamage,
      properties: item.weaponProperties,
    }),
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
