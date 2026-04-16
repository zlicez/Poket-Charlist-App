import { describe, expect, it } from "vitest";
import {
  BASE_WEAPONS,
  createEquipmentFromBase,
  type Equipment,
} from "../shared/schema";
import {
  DEFAULT_WEAPON_FORM_VALUES,
  createEquipmentWeaponFromForm,
  createWeaponFromForm,
  equipmentWeaponToWeapon,
  getActiveWeaponDamage,
  getWeaponPropertiesDisplay,
  normalizeWeaponGripMode,
  parseWeaponProperties,
} from "../client/src/lib/weapons";

describe("weapon helpers", () => {
  it("uses the selected grip to choose active damage", () => {
    expect(
      getActiveWeaponDamage({
        damage: "1d8",
        versatileDamage: "1d10",
        gripMode: "oneHand",
        properties: "Универсальное",
      }),
    ).toBe("1d8");

    expect(
      getActiveWeaponDamage({
        damage: "1d8",
        versatileDamage: "1d10",
        gripMode: "twoHand",
        properties: "Универсальное",
      }),
    ).toBe("1d10");
  });

  it("normalizes legacy versatile properties and rebuilds the display string", () => {
    expect(parseWeaponProperties("Метательное, Универсальное (1d8)")).toEqual({
      properties: ["Метательное", "Универсальное"],
      versatileDamage: "1d8",
    });

    expect(getWeaponPropertiesDisplay("Метательное, Универсальное", "1d8")).toBe(
      "Метательное, Универсальное (1d8)",
    );

    expect(getWeaponPropertiesDisplay("Метательное, Универсальное (1d8)")).toBe(
      "Метательное, Универсальное (1d8)",
    );
  });

  it("creates structured versatile weapons from the form payload", () => {
    const form = {
      ...DEFAULT_WEAPON_FORM_VALUES,
      damage: "1d8",
      versatileDamage: "1d10",
      damageType: "рубящий",
      properties: ["Универсальное"],
      gripMode: "twoHand" as const,
      weaponCategory: "martial" as const,
    };

    const weapon = createWeaponFromForm("Длинный меч", form);
    const equipment = createEquipmentWeaponFromForm("Длинный меч", form, {
      equipped: true,
    });

    expect(weapon).toMatchObject({
      damage: "1d8",
      versatileDamage: "1d10",
      properties: "Универсальное",
      gripMode: "twoHand",
      weaponCategory: "martial",
    });

    expect(equipment).toMatchObject({
      category: "weapon",
      damage: "1d8",
      versatileDamage: "1d10",
      weaponProperties: "Универсальное",
      gripMode: "twoHand",
      equipped: true,
    });
  });

  it("drops versatile mode when the property is removed", () => {
    const weapon = createWeaponFromForm("Боевой молот", {
      ...DEFAULT_WEAPON_FORM_VALUES,
      damage: "1d8",
      versatileDamage: "1d10",
      properties: [],
      gripMode: "twoHand",
    });

    expect(weapon.versatileDamage).toBeUndefined();
    expect(normalizeWeaponGripMode(weapon)).toBe("oneHand");
  });

  it("preserves versatile data when converting catalog items into equipment and weapon entries", () => {
    const baseWeapon = BASE_WEAPONS.find((item) => item.name === "Длинный меч");
    expect(baseWeapon).toBeDefined();

    const equipment = createEquipmentFromBase(baseWeapon!) as Omit<Equipment, "id">;
    expect(equipment).toMatchObject({
      isWeapon: true,
      damage: "1d8",
      versatileDamage: "1d10",
      gripMode: "oneHand",
      weaponProperties: "универсальное",
    });

    const weapon = equipmentWeaponToWeapon({ ...equipment, id: "eq-longsword" });
    expect(weapon).toMatchObject({
      damage: "1d8",
      versatileDamage: "1d10",
      gripMode: "oneHand",
    });
    expect(
      getActiveWeaponDamage({
        ...weapon,
        gripMode: "twoHand",
      }),
    ).toBe("1d10");
  });
});
