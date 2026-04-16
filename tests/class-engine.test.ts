import { describe, expect, it } from "vitest";

import { getClassDefinitionByName } from "../shared/data/d5e-classes";
import { buildClassSelectionsFromLegacy } from "../shared/lib/class-compat";
import {
  buildClassStatePatch,
  resolveClassState,
} from "../shared/lib/class-engine";
import {
  createDefaultCharacter,
  getCharacterAutoProficiencies,
} from "../shared/types/character-types";

describe("class compatibility", () => {
  it("builds canonical class selections from legacy fields", () => {
    const selections = buildClassSelectionsFromLegacy(
      {
        class: "Воин",
        level: 3,
        subclass: "Мастер битвы",
      },
      getClassDefinitionByName,
    );

    expect(selections).toHaveLength(1);
    expect(selections[0]).toMatchObject({
      classId: "fighter",
      className: "Воин",
      level: 3,
      subclassName: "Мастер битвы",
      source: "PHB",
      contentVersion: "2014",
    });
    expect(selections[0].subclassId).toBeTruthy();
  });
});

describe("class engine", () => {
  it("resolves multiclass proficiencies and standard spellcasting progression", () => {
    const resolved = resolveClassState({
      class: "Волшебник",
      level: 7,
      classes: [
        { name: "Волшебник", level: 3 },
        { name: "Паладин", level: 4 },
      ],
      hitDiceRemaining: 7,
    });

    expect(resolved.totalLevel).toBe(7);
    expect(resolved.savingThrowProficiencies).toEqual(["INT", "WIS"]);
    expect(resolved.grantedProficiencies.weapons).toContain("Воинское оружие");
    expect(resolved.grantedProficiencies.armor).toContain("Щиты");
    expect(resolved.spellcasting.ability).toBe("INT");
    expect(resolved.spellcasting.progression.spellSlots).toEqual([
      4, 3, 2, 0, 0, 0, 0, 0, 0,
    ]);
    expect(resolved.spellcasting.progression.pactMagic).toBeNull();
  });

  it("keeps pact magic separate from regular spell slots", () => {
    const resolved = resolveClassState({
      class: "Волшебник",
      level: 5,
      classes: [
        { name: "Волшебник", level: 3 },
        { name: "Колдун", level: 2 },
      ],
      hitDiceRemaining: 5,
    });

    expect(resolved.spellcasting.casterClassNames).toEqual([
      "Волшебник",
      "Колдун",
    ]);
    expect(resolved.spellcasting.progression.spellSlots).toEqual([
      4, 2, 0, 0, 0, 0, 0, 0, 0,
    ]);
    expect(resolved.spellcasting.progression.pactMagic).toEqual({
      slotLevel: 1,
      max: 2,
    });
  });

  it("builds a dual-write patch with canonical selections, hit dice pools, and spellcasting", () => {
    const character = {
      ...createDefaultCharacter(),
      hitDiceRemaining: 5,
    };
    const patch = buildClassStatePatch(character, [
      {
        id: "class-selection-1-fighter",
        classId: "fighter",
        className: "Воин",
        source: "PHB",
        contentVersion: "2014",
        level: 2,
        choices: {},
        optionalFeatureIds: [],
      },
      {
        id: "class-selection-2-wizard",
        classId: "wizard",
        className: "Волшебник",
        source: "PHB",
        contentVersion: "2014",
        level: 3,
        choices: {},
        optionalFeatureIds: [],
      },
    ]);

    expect(patch.classSelections).toHaveLength(2);
    expect(patch.class).toBe("Воин");
    expect(patch.level).toBe(5);
    expect(patch.classes).toEqual([
      { name: "Воин", level: 2, subclass: undefined },
      { name: "Волшебник", level: 3, subclass: undefined },
    ]);
    expect(patch.savingThrows).toMatchObject({
      STR: true,
      CON: true,
      DEX: false,
      INT: false,
      WIS: false,
      CHA: false,
    });
    expect(patch.hitDice).toBe("1d10");
    expect(patch.hitDicePools).toEqual([
      {
        selectionId: "class-selection-1-fighter",
        classId: "fighter",
        className: "Воин",
        dice: "d10",
        total: 2,
        remaining: 2,
      },
      {
        selectionId: "class-selection-2-wizard",
        classId: "wizard",
        className: "Волшебник",
        dice: "d6",
        total: 3,
        remaining: 3,
      },
    ]);
    expect(patch.spellcasting).toMatchObject({
      ability: "INT",
      pactMagic: { slotLevel: 1, max: 0, used: 0 },
    });
    expect(patch.spellcasting?.spellSlots).toEqual([
      { max: 4, used: 0 },
      { max: 2, used: 0 },
      { max: 0, used: 0 },
      { max: 0, used: 0 },
      { max: 0, used: 0 },
      { max: 0, used: 0 },
      { max: 0, used: 0 },
      { max: 0, used: 0 },
      { max: 0, used: 0 },
    ]);
  });

  it("merges automatic class proficiencies from canonical selections", () => {
    const character = {
      ...createDefaultCharacter(),
      classes: [
        { name: "Воин", level: 1 },
        { name: "Волшебник", level: 1 },
      ],
      classSelections: [
        {
          id: "class-selection-1-fighter",
          classId: "fighter",
          className: "Воин",
          source: "PHB",
          contentVersion: "2014",
          level: 1,
          choices: {},
          optionalFeatureIds: [],
        },
        {
          id: "class-selection-2-wizard",
          classId: "wizard",
          className: "Волшебник",
          source: "PHB",
          contentVersion: "2014",
          level: 1,
          choices: {},
          optionalFeatureIds: [],
        },
      ],
      level: 2,
    };

    const autoProficiencies = getCharacterAutoProficiencies(character);

    expect(autoProficiencies.weapons).toContain("Воинское оружие");
    expect(autoProficiencies.armor).toContain("Щиты");
    expect(autoProficiencies.languages).toContain("Общий");
  });
});
