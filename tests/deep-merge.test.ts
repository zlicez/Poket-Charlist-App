import { describe, it, expect } from "vitest";
import { deepMerge } from "../server/deep-merge";

describe("deepMerge", () => {
  describe("primitives", () => {
    it("overwrites a string with a new string", () => {
      const result = deepMerge({ name: "Alice" }, { name: "Bob" });
      expect(result.name).toBe("Bob");
    });

    it("overwrites a number with a new number", () => {
      const result = deepMerge({ hp: 10 }, { hp: 7 });
      expect(result.hp).toBe(7);
    });

    it("overwrites a boolean with a new boolean", () => {
      const result = deepMerge({ locked: false }, { locked: true });
      expect(result.locked).toBe(true);
    });

    it("preserves keys not present in source", () => {
      const result = deepMerge({ name: "Alice", level: 5 }, { level: 6 });
      expect(result.name).toBe("Alice");
      expect(result.level).toBe(6);
    });

    it("adds new keys from source that target did not have", () => {
      const result = deepMerge({ name: "Alice" } as any, { level: 1 } as any);
      expect((result as any).level).toBe(1);
    });
  });

  describe("undefined values", () => {
    it("skips undefined source values (does not overwrite target)", () => {
      const result = deepMerge({ hp: 10, name: "Alice" }, { hp: undefined });
      expect(result.hp).toBe(10);
    });
  });

  describe("null values", () => {
    it("overwrites target with null when source is null", () => {
      const result = deepMerge({ shareToken: "abc" } as any, { shareToken: null } as any);
      expect((result as any).shareToken).toBeNull();
    });

    it("does not recurse into target when source is null", () => {
      const result = deepMerge(
        { stats: { str: 10, dex: 12 } } as any,
        { stats: null } as any,
      );
      expect((result as any).stats).toBeNull();
    });

    it("does not recurse into source when target is null", () => {
      const result = deepMerge(
        { stats: null } as any,
        { stats: { str: 14 } } as any,
      );
      expect((result as any).stats).toEqual({ str: 14 });
    });
  });

  describe("nested objects", () => {
    it("deep merges nested objects (keeps unmodified nested keys)", () => {
      const target = { abilityScores: { STR: 10, DEX: 12, CON: 14 } };
      const source = { abilityScores: { STR: 16 } };
      const result = deepMerge(target, source);
      expect(result.abilityScores).toEqual({ STR: 16, DEX: 12, CON: 14 });
    });

    it("deep merges 3 levels deep", () => {
      const target = { a: { b: { c: 1, d: 2 } } };
      const source = { a: { b: { c: 99 } } };
      const result = deepMerge(target, source);
      expect(result.a.b.c).toBe(99);
      expect(result.a.b.d).toBe(2);
    });

    it("does not mutate the target object", () => {
      const target = { abilityScores: { STR: 10, DEX: 12 } };
      const source = { abilityScores: { STR: 16 } };
      deepMerge(target, source);
      expect(target.abilityScores.STR).toBe(10);
    });
  });

  describe("arrays", () => {
    it("replaces arrays entirely (does not merge elements)", () => {
      const target = { weapons: [{ id: "1", name: "Sword" }] };
      const source = { weapons: [{ id: "2", name: "Axe" }, { id: "3", name: "Bow" }] };
      const result = deepMerge(target, source);
      expect(result.weapons).toHaveLength(2);
      expect(result.weapons[0].name).toBe("Axe");
    });

    it("replaces a non-empty array with an empty array", () => {
      const target = { weapons: [{ id: "1", name: "Sword" }] };
      const source = { weapons: [] };
      const result = deepMerge(target, source);
      expect(result.weapons).toHaveLength(0);
    });

    it("replaces an empty array with a populated array", () => {
      const target = { weapons: [] as { id: string; name: string }[] };
      const source = { weapons: [{ id: "1", name: "Sword" }] };
      const result = deepMerge(target, source);
      expect(result.weapons).toHaveLength(1);
      expect(result.weapons[0].name).toBe("Sword");
    });
  });

  describe("character update scenario", () => {
    it("partial HP update preserves all other character fields", () => {
      const character = {
        name: "Aragorn",
        level: 10,
        currentHp: 80,
        maxHp: 100,
        abilityScores: { STR: 18, DEX: 14, CON: 16, INT: 12, WIS: 13, CHA: 14 },
        weapons: [{ id: "1", name: "Andúril" }],
      };
      const update = { currentHp: 55 };
      const result = deepMerge(character, update);

      expect(result.currentHp).toBe(55);
      expect(result.maxHp).toBe(100);
      expect(result.name).toBe("Aragorn");
      expect(result.abilityScores.STR).toBe(18);
      expect(result.weapons).toHaveLength(1);
    });

    it("nested ability score update does not wipe other scores", () => {
      const character = {
        name: "Gandalf",
        abilityScores: { STR: 10, DEX: 10, CON: 14, INT: 20, WIS: 18, CHA: 16 },
      };
      const result = deepMerge(character, { abilityScores: { INT: 22 } });
      expect(result.abilityScores).toEqual({
        STR: 10, DEX: 10, CON: 14, INT: 22, WIS: 18, CHA: 16,
      });
    });
  });
});
