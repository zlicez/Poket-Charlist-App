import { describe, expect, it } from "vitest";

import {
  computeSaveBonus,
  computeSkillBonus,
  proficiencyTier,
} from "../client/src/ds/screens/sheet/skill-utils";

describe("computeSkillBonus", () => {
  it("returns only ability mod when not proficient", () => {
    expect(computeSkillBonus(3, { proficient: false, expertise: false }, 2)).toBe(3);
  });
  it("adds proficiency bonus once when proficient", () => {
    expect(computeSkillBonus(3, { proficient: true, expertise: false }, 2)).toBe(5);
  });
  it("adds proficiency bonus twice when expertise", () => {
    expect(computeSkillBonus(3, { proficient: true, expertise: true }, 2)).toBe(7);
  });
  it("negative ability mod still applied", () => {
    expect(computeSkillBonus(-1, { proficient: true, expertise: false }, 3)).toBe(2);
  });
});

describe("computeSaveBonus", () => {
  it("adds proficiency only when proficient", () => {
    expect(computeSaveBonus(2, false, 3)).toBe(2);
    expect(computeSaveBonus(2, true, 3)).toBe(5);
  });
});

describe("proficiencyTier", () => {
  it("returns 0 for undefined or neither", () => {
    expect(proficiencyTier(undefined)).toBe(0);
    expect(proficiencyTier({ proficient: false, expertise: false })).toBe(0);
  });
  it("returns 1 for proficient only", () => {
    expect(proficiencyTier({ proficient: true, expertise: false })).toBe(1);
  });
  it("returns 2 for expertise (assumes proficient=true)", () => {
    expect(proficiencyTier({ proficient: true, expertise: true })).toBe(2);
  });
});
