import { describe, expect, it } from "vitest";

import {
  averageHpGain,
  computeHpGain,
} from "../client/src/ds/screens/wizards/level-up-utils";

describe("averageHpGain", () => {
  it("matches D&D 5e table", () => {
    expect(averageHpGain(6)).toBe(4); // d6 → 4
    expect(averageHpGain(8)).toBe(5); // d8 → 5
    expect(averageHpGain(10)).toBe(6); // d10 → 6
    expect(averageHpGain(12)).toBe(7); // d12 → 7
  });
});

describe("computeHpGain", () => {
  it("adds CON mod to roll", () => {
    expect(computeHpGain(6, 2)).toBe(8);
  });
  it("clamps at minimum 1 even with negative CON", () => {
    expect(computeHpGain(1, -5)).toBe(1);
    expect(computeHpGain(2, -3)).toBe(1);
  });
  it("allows negative net if not at floor", () => {
    // hitDieResult 5 + (-2) = 3 — выше 1, не clamped
    expect(computeHpGain(5, -2)).toBe(3);
  });
});
