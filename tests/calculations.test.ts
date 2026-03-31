import { describe, it, expect } from "vitest";
import {
  calculateModifier,
  getProficiencyBonus,
  formatModifier,
  calculateMaxHp,
  calculateAC,
  calculateSpellSaveDC,
  calculateSpellAttackBonus,
  getTotalAbilityScore,
  getTotalLevel,
  getMulticlassHitDice,
} from "../shared/types/character-types";
import type { ArmorData } from "../shared/data/d5e-equipment";

// ---------------------------------------------------------------------------
// calculateModifier
// ---------------------------------------------------------------------------
describe("calculateModifier", () => {
  it.each([
    [1,  -5],
    [2,  -4],
    [3,  -4],
    [8,  -1],
    [9,  -1],
    [10,  0],
    [11,  0],
    [12,  1],
    [13,  1],
    [14,  2],
    [16,  3],
    [18,  4],
    [20,  5],
    [24,  7],
    [30, 10],
  ])("score %i → modifier %i", (score, expected) => {
    expect(calculateModifier(score)).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// getProficiencyBonus
// ---------------------------------------------------------------------------
describe("getProficiencyBonus", () => {
  it.each([
    [1,  2],
    [2,  2],
    [3,  2],
    [4,  2],
    [5,  3],
    [6,  3],
    [7,  3],
    [8,  3],
    [9,  4],
    [12, 4],
    [13, 5],
    [16, 5],
    [17, 6],
    [20, 6],
  ])("level %i → proficiency bonus %i", (level, expected) => {
    expect(getProficiencyBonus(level)).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// formatModifier
// ---------------------------------------------------------------------------
describe("formatModifier", () => {
  it("prepends + for positive modifiers", () => {
    expect(formatModifier(3)).toBe("+3");
  });

  it("prepends + for zero", () => {
    expect(formatModifier(0)).toBe("+0");
  });

  it("shows minus sign for negative modifiers", () => {
    expect(formatModifier(-2)).toBe("-2");
    expect(formatModifier(-5)).toBe("-5");
  });
});

// ---------------------------------------------------------------------------
// getTotalAbilityScore
// ---------------------------------------------------------------------------
describe("getTotalAbilityScore", () => {
  it("sums base + racial bonus + custom bonus", () => {
    expect(getTotalAbilityScore(10, 2, 0)).toBe(12);
    expect(getTotalAbilityScore(14, 0, 2)).toBe(16);
    expect(getTotalAbilityScore(10, 2, 2)).toBe(14);
  });

  it("returns base when both bonuses are zero", () => {
    expect(getTotalAbilityScore(16, 0, 0)).toBe(16);
  });
});

// ---------------------------------------------------------------------------
// calculateMaxHp
// ---------------------------------------------------------------------------
describe("calculateMaxHp", () => {
  // Воин: d10 (value 10), avgRollPerLevel = floor(10/2)+1 = 6
  describe("Воин (d10)", () => {
    it("level 1, CON 10 → 10", () => {
      expect(calculateMaxHp("Воин", 1, calculateModifier(10))).toBe(10);
    });

    it("level 1, CON 12 → 11", () => {
      expect(calculateMaxHp("Воин", 1, calculateModifier(12))).toBe(11);
    });

    it("level 1, CON 8 (mod -1) → 9", () => {
      expect(calculateMaxHp("Воин", 1, calculateModifier(8))).toBe(9);
    });

    it("level 2, CON 10 → 16  (10 + 1×6)", () => {
      expect(calculateMaxHp("Воин", 2, calculateModifier(10))).toBe(16);
    });

    it("level 5, CON 14 (mod +2) → 44  (12 + 4×8)", () => {
      // firstLevel = 10+2=12, avgRoll=6, additionalPerLevel=6+2=8, 4×8=32
      expect(calculateMaxHp("Воин", 5, calculateModifier(14))).toBe(44);
    });

    it("level 20, CON 20 (mod +5) → 224  (15 + 19×11)", () => {
      // firstLevel=15, avgRoll=6, perLevel=6+5=11, 19×11=209
      expect(calculateMaxHp("Воин", 20, calculateModifier(20))).toBe(224);
    });
  });

  // Волшебник: d6 (value 6), avgRollPerLevel = floor(6/2)+1 = 4
  describe("Волшебник (d6)", () => {
    it("level 1, CON 10 → 6", () => {
      expect(calculateMaxHp("Волшебник", 1, calculateModifier(10))).toBe(6);
    });

    it("level 3, CON 10 → 14  (6 + 2×4)", () => {
      expect(calculateMaxHp("Волшебник", 3, calculateModifier(10))).toBe(14);
    });

    it("level 1, CON 6 (mod -2) → 4  (floor max 1 not triggered)", () => {
      expect(calculateMaxHp("Волшебник", 1, calculateModifier(6))).toBe(4);
    });
  });

  // Варвар: d12 (value 12), avgRollPerLevel = floor(12/2)+1 = 7
  describe("Варвар (d12)", () => {
    it("level 1, CON 10 → 12", () => {
      expect(calculateMaxHp("Варвар", 1, calculateModifier(10))).toBe(12);
    });

    it("level 2, CON 10 → 19  (12 + 1×7)", () => {
      expect(calculateMaxHp("Варвар", 2, calculateModifier(10))).toBe(19);
    });
  });

  describe("edge cases", () => {
    it("enforces minimum HP of 1 when the calculation would go below", () => {
      // Use an artificially low conModifier to force the result below 1
      expect(calculateMaxHp("Волшебник", 1, -10)).toBe(1);
    });

    it("falls back to d10 for an unknown class name", () => {
      // getClassHitDice returns { dice: "d10", value: 10 } for unknown classes
      expect(calculateMaxHp("НеизвестныйКласс", 1, 0)).toBe(10);
    });
  });
});

// ---------------------------------------------------------------------------
// calculateAC
// ---------------------------------------------------------------------------
describe("calculateAC", () => {
  const leather: ArmorData = { name: "Кожаный доспех", type: "light", baseAC: 11, maxDexBonus: null, stealthDisadvantage: false };
  const chainMail: ArmorData = { name: "Кольчуга", type: "heavy", baseAC: 16, maxDexBonus: 0, stealthDisadvantage: true };
  const breastplate: ArmorData = { name: "Нагрудник", type: "medium", baseAC: 14, maxDexBonus: 2, stealthDisadvantage: false };
  const shieldItem: ArmorData = { name: "Щит", type: "shield", baseAC: 2, maxDexBonus: null, stealthDisadvantage: false };

  it("no armor, no shield, DEX 10 → 10", () => {
    expect(calculateAC(0, null, false)).toBe(10);
  });

  it("no armor, no shield, DEX 14 (mod +2) → 12", () => {
    expect(calculateAC(2, null, false)).toBe(12);
  });

  it("no armor, with shield, DEX 14 (mod +2) → 14", () => {
    expect(calculateAC(2, null, true)).toBe(14);
  });

  it("leather armor (AC 11, no dex cap), DEX 14 (mod +2) → 13", () => {
    expect(calculateAC(2, leather, false)).toBe(13);
  });

  it("chain mail (AC 16, dex cap 0), DEX 16 (mod +3) → 16", () => {
    expect(calculateAC(3, chainMail, false)).toBe(16);
  });

  it("breastplate (AC 14, dex cap +2), DEX 18 (mod +4) → 16", () => {
    expect(calculateAC(4, breastplate, false)).toBe(16);
  });

  it("chain mail + shield, DEX 16 (mod +3) → 18", () => {
    expect(calculateAC(3, chainMail, true)).toBe(18);
  });

  it("custom AC bonus is added on top", () => {
    expect(calculateAC(0, null, false, 3)).toBe(13);
  });

  it("shield ArmorData as equippedArmor is ignored (type === 'shield')", () => {
    // type "shield" is excluded from armor calculation; full DEX applies
    expect(calculateAC(2, shieldItem, false)).toBe(12);
  });

  it("negative DEX mod reduces AC when unarmored", () => {
    expect(calculateAC(-1, null, false)).toBe(9);
  });
});

// ---------------------------------------------------------------------------
// calculateSpellSaveDC
// ---------------------------------------------------------------------------
describe("calculateSpellSaveDC", () => {
  it("8 + proficiency + ability modifier", () => {
    expect(calculateSpellSaveDC(3, 2)).toBe(13); // 8+2+3
    expect(calculateSpellSaveDC(5, 3)).toBe(16); // 8+3+5
    expect(calculateSpellSaveDC(0, 2)).toBe(10); // 8+2+0
    expect(calculateSpellSaveDC(4, 4)).toBe(16); // 8+4+4
  });
});

// ---------------------------------------------------------------------------
// calculateSpellAttackBonus
// ---------------------------------------------------------------------------
describe("calculateSpellAttackBonus", () => {
  it("proficiency + ability modifier", () => {
    expect(calculateSpellAttackBonus(3, 2)).toBe(5);
    expect(calculateSpellAttackBonus(5, 3)).toBe(8);
    expect(calculateSpellAttackBonus(0, 2)).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// getTotalLevel (multiclass)
// ---------------------------------------------------------------------------
describe("getTotalLevel", () => {
  it("single class returns its level", () => {
    expect(getTotalLevel([{ name: "Воин", level: 7 }])).toBe(7);
  });

  it("sums levels across classes", () => {
    expect(getTotalLevel([
      { name: "Воин", level: 5 },
      { name: "Плут", level: 3 },
    ])).toBe(8);
  });

  it("caps total at 20", () => {
    expect(getTotalLevel([
      { name: "Воин", level: 15 },
      { name: "Волшебник", level: 10 },
    ])).toBe(20);
  });

  it("exactly 20 total is allowed", () => {
    expect(getTotalLevel([
      { name: "Воин", level: 10 },
      { name: "Плут", level: 10 },
    ])).toBe(20);
  });
});

// ---------------------------------------------------------------------------
// getMulticlassHitDice
// ---------------------------------------------------------------------------
describe("getMulticlassHitDice", () => {
  it("single class returns one entry", () => {
    const result = getMulticlassHitDice([{ name: "Воин", level: 5 }]);
    expect(result).toEqual([{ dice: "d10", count: 5 }]);
  });

  it("two classes with different dice return two entries", () => {
    const result = getMulticlassHitDice([
      { name: "Воин", level: 5 },
      { name: "Волшебник", level: 3 },
    ]);
    expect(result).toContainEqual({ dice: "d10", count: 5 });
    expect(result).toContainEqual({ dice: "d6", count: 3 });
    expect(result).toHaveLength(2);
  });

  it("two classes with same dice are merged into one entry", () => {
    const result = getMulticlassHitDice([
      { name: "Воин", level: 5 },   // d10
      { name: "Паладин", level: 3 }, // d10
    ]);
    expect(result).toEqual([{ dice: "d10", count: 8 }]);
  });
});
