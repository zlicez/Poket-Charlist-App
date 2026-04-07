import { describe, expect, it } from "vitest";
import {
  getMulticlassSpellSlots,
  getPactMagicForClass,
  getSpellSlotsForClass,
  getSpellcastingProgression,
} from "../shared/data/spell-slots";

describe("spell slot progression", () => {
  it("keeps lower-level slots for full casters when higher-level slots appear", () => {
    expect(getSpellSlotsForClass("Волшебник", 5)).toEqual([
      4, 3, 2, 0, 0, 0, 0, 0, 0,
    ]);
  });

  it("treats warlock pact magic as a separate progression", () => {
    expect(getSpellSlotsForClass("Колдун", 5)).toBeNull();
    expect(getPactMagicForClass("Колдун", 5)).toEqual({ slotLevel: 3, max: 2 });
  });

  it("uses multiclass caster level for standard spellcasting slots", () => {
    expect(
      getMulticlassSpellSlots([
        { name: "Волшебник", level: 3 },
        { name: "Паладин", level: 4 },
      ]),
    ).toEqual([4, 3, 2, 0, 0, 0, 0, 0, 0]);
  });

  it("keeps regular spell slots and pact magic side by side for warlock multiclassing", () => {
    expect(
      getSpellcastingProgression([
        { name: "Волшебник", level: 3 },
        { name: "Колдун", level: 2 },
      ]),
    ).toEqual({
      spellSlots: [4, 2, 0, 0, 0, 0, 0, 0, 0],
      pactMagic: { slotLevel: 1, max: 2 },
    });
  });
});
