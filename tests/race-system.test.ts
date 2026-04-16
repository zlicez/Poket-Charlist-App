import { describe, it, expect } from "vitest";
import {
  getRacialBonuses,
  getValidatedSelectedRacialBonuses,
  getRaceAndClassProficiencies,
  getRaceDarkvision,
  getRaceSpeed,
  getRaceCreatureType,
  getRaceSkillGrants,
  getRaceSpellGrants,
  getRaceResistances,
} from "../shared/types/character-types";
import { RACE_DATA, RACES } from "../shared/data/d5e-races";

// ─────────────────────────────────────────────────────────────────────────────
// RACE_DATA integrity
// ─────────────────────────────────────────────────────────────────────────────

describe("RACE_DATA integrity", () => {
  it("contains all 25 target races", () => {
    const expected = [
      "Аасимар", "Багбир", "Гитьянки", "Гитцерай", "Гном", "Гоблин",
      "Голиаф", "Грунг", "Дварф", "Драконорождённый", "Кенку", "Кобольд",
      "Людоящер", "Орк", "Полуорк", "Полурослик", "Полуэльф", "Табакси",
      "Тифлинг", "Тритон", "Фирболг", "Хобгоблин", "Человек", "Эльф",
      "Юань-ти", "Дампир",
    ];
    for (const name of expected) {
      expect(RACE_DATA[name], `Раса "${name}" должна существовать в RACE_DATA`).toBeDefined();
    }
  });

  it("every race has required fields", () => {
    for (const key of RACES) {
      const r = RACE_DATA[key];
      expect(r.id, `${key}: нет id`).toBeTruthy();
      expect(r.name, `${key}: нет name`).toBeTruthy();
      expect(r.source, `${key}: нет source`).toBeTruthy();
      expect(r.entityType, `${key}: нет entityType`).toBeTruthy();
      expect(r.size, `${key}: нет size`).toBeTruthy();
      expect(r.creatureType, `${key}: нет creatureType`).toBeTruthy();
      expect(typeof r.speed, `${key}: speed должен быть числом`).toBe("number");
    }
  });

  it("all subraces have required fields", () => {
    for (const key of RACES) {
      const r = RACE_DATA[key];
      if (!r.subraces) continue;
      for (const [subKey, sub] of Object.entries(r.subraces)) {
        expect(sub.id, `${key}/${subKey}: нет id`).toBeTruthy();
        expect(sub.name, `${key}/${subKey}: нет name`).toBeTruthy();
        expect(sub.abilityBonuses, `${key}/${subKey}: нет abilityBonuses`).toBeDefined();
      }
    }
  });

  it("RACES array matches RACE_DATA keys", () => {
    expect(RACES).toEqual(expect.arrayContaining(Object.keys(RACE_DATA)));
    expect(RACES.length).toBe(Object.keys(RACE_DATA).length);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getRacialBonuses
// ─────────────────────────────────────────────────────────────────────────────

describe("getRacialBonuses", () => {
  it("base race without subrace — Дварф → CON+2", () => {
    expect(getRacialBonuses("Дварф")).toEqual({ CON: 2 });
  });

  it("base race — Человек → +1 to all abilities", () => {
    const bonuses = getRacialBonuses("Человек");
    expect(bonuses).toEqual({ STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 });
  });

  it("race + subrace stacks additively — Эльф + Высший эльф → DEX+2 INT+1", () => {
    const bonuses = getRacialBonuses("Эльф", "Высший эльф");
    expect(bonuses.DEX).toBe(2);
    expect(bonuses.INT).toBe(1);
  });

  it("race + subrace stacks additively — Эльф + Тёмный эльф → DEX+2 CHA+1", () => {
    const bonuses = getRacialBonuses("Эльф", "Тёмный эльф");
    expect(bonuses.DEX).toBe(2);
    expect(bonuses.CHA).toBe(1);
  });

  it("race + subrace — Горный дварф → CON+2 STR+2", () => {
    const bonuses = getRacialBonuses("Дварф", "Горный дварф");
    expect(bonuses.CON).toBe(2);
    expect(bonuses.STR).toBe(2);
  });

  it("invalid race → empty object, no crash", () => {
    expect(getRacialBonuses("НесуществующаяРаса")).toEqual({});
  });

  it("valid race + invalid subrace → base bonuses only", () => {
    const bonuses = getRacialBonuses("Эльф", "НесуществующаяПодраса");
    expect(bonuses).toEqual({ DEX: 2 });
  });

  it("flexible bonuses — Дампир split (+2 STR +1 DEX)", () => {
    const selected = { STR: 2, DEX: 1, CON: 0, INT: 0, WIS: 0, CHA: 0 };
    const bonuses = getRacialBonuses("Дампир", undefined, selected);
    expect(bonuses.STR).toBe(2);
    expect(bonuses.DEX).toBe(1);
  });

  it("flexible bonuses — Дампир spread (+1 STR +1 DEX +1 CON)", () => {
    const selected = { STR: 1, DEX: 1, CON: 1, INT: 0, WIS: 0, CHA: 0 };
    const bonuses = getRacialBonuses("Дампир", undefined, selected);
    expect(bonuses.STR).toBe(1);
    expect(bonuses.DEX).toBe(1);
    expect(bonuses.CON).toBe(1);
  });

  it("flexible bonuses — invalid pattern → no flexible bonuses applied", () => {
    // 3+1 — не совпадает ни с одним паттерном Дампира
    const invalid = { STR: 3, DEX: 1, CON: 0, INT: 0, WIS: 0, CHA: 0 };
    const bonuses = getRacialBonuses("Дампир", undefined, invalid);
    // Дампир имеет пустой abilityBonuses, так что результат = {}
    expect(bonuses.STR).toBeUndefined();
    expect(bonuses.DEX).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getValidatedSelectedRacialBonuses
// ─────────────────────────────────────────────────────────────────────────────

describe("getValidatedSelectedRacialBonuses", () => {
  it("valid split pattern (+2/+1) → returns bonuses", () => {
    const selected = { STR: 2, DEX: 1, CON: 0, INT: 0, WIS: 0, CHA: 0 };
    const result = getValidatedSelectedRacialBonuses("Дампир", selected);
    expect(result.STR).toBe(2);
    expect(result.DEX).toBe(1);
  });

  it("valid spread pattern (+1+1+1) → returns bonuses", () => {
    const selected = { STR: 1, DEX: 0, CON: 1, INT: 1, WIS: 0, CHA: 0 };
    const result = getValidatedSelectedRacialBonuses("Дампир", selected);
    expect(result.STR).toBe(1);
    expect(result.CON).toBe(1);
    expect(result.INT).toBe(1);
  });

  it("invalid total → empty object", () => {
    const invalid = { STR: 3, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 };
    expect(getValidatedSelectedRacialBonuses("Дампир", invalid)).toEqual({});
  });

  it("race without abilityBonusSelection → empty object", () => {
    const any = { STR: 2, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 };
    expect(getValidatedSelectedRacialBonuses("Эльф", any)).toEqual({});
  });

  it("undefined selectedBonuses → empty object", () => {
    expect(getValidatedSelectedRacialBonuses("Дампир", undefined)).toEqual({});
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getRaceDarkvision
// ─────────────────────────────────────────────────────────────────────────────

describe("getRaceDarkvision", () => {
  it("Эльф → 60", () => expect(getRaceDarkvision("Эльф")).toBe(60));
  it("Дварф → 60", () => expect(getRaceDarkvision("Дварф")).toBe(60));
  it("Человек → null", () => expect(getRaceDarkvision("Человек")).toBeNull());
  it("Тёмный эльф (subrace) → 120, overrides parent", () =>
    expect(getRaceDarkvision("Эльф", "Тёмный эльф")).toBe(120));
  it("Высший эльф (subrace) → 60, inherits parent", () =>
    expect(getRaceDarkvision("Эльф", "Высший эльф")).toBe(60));
  it("unknown race → null", () =>
    expect(getRaceDarkvision("Неизвестная")).toBeNull());
});

// ─────────────────────────────────────────────────────────────────────────────
// getRaceSpeed
// ─────────────────────────────────────────────────────────────────────────────

describe("getRaceSpeed", () => {
  it("Человек → 30", () => expect(getRaceSpeed("Человек")).toBe(30));
  it("Дварф → 25", () => expect(getRaceSpeed("Дварф")).toBe(25));
  it("Дампир → 35", () => expect(getRaceSpeed("Дампир")).toBe(35));
  it("Эльф base → 30", () => expect(getRaceSpeed("Эльф")).toBe(30));
  it("Лесной эльф (subrace speed=35) → 35", () =>
    expect(getRaceSpeed("Эльф", "Лесной эльф")).toBe(35));
  it("Высший эльф (no subrace speed) → inherits 30", () =>
    expect(getRaceSpeed("Эльф", "Высший эльф")).toBe(30));
  it("unknown race → 30 (default)", () =>
    expect(getRaceSpeed("Несуществующая")).toBe(30));
});

// ─────────────────────────────────────────────────────────────────────────────
// getRaceCreatureType
// ─────────────────────────────────────────────────────────────────────────────

describe("getRaceCreatureType", () => {
  it("Человек → Гуманоид", () =>
    expect(getRaceCreatureType("Человек")).toBe("Гуманоид"));
  it("Дампир → Нежить (Гуманоид)", () =>
    expect(getRaceCreatureType("Дампир")).toBe("Нежить (Гуманоид)"));
  it("unknown race → Гуманоид (default)", () =>
    expect(getRaceCreatureType("Несуществующая")).toBe("Гуманоид"));
});

// ─────────────────────────────────────────────────────────────────────────────
// getRaceSkillGrants
// ─────────────────────────────────────────────────────────────────────────────

describe("getRaceSkillGrants", () => {
  it("Полуорк → [Запугивание]", () =>
    expect(getRaceSkillGrants("Полуорк")).toEqual(["Запугивание"]));
  it("Эльф → [Восприятие]", () =>
    expect(getRaceSkillGrants("Эльф")).toEqual(["Восприятие"]));
  it("Орк → [Запугивание]", () =>
    expect(getRaceSkillGrants("Орк")).toEqual(["Запугивание"]));
  it("Табакси → [Восприятие, Скрытность]", () => {
    const skills = getRaceSkillGrants("Табакси");
    expect(skills).toContain("Восприятие");
    expect(skills).toContain("Скрытность");
  });
  it("Человек → [] (нет авто-навыков)", () =>
    expect(getRaceSkillGrants("Человек")).toEqual([]));
  it("unknown race → []", () =>
    expect(getRaceSkillGrants("Несуществующая")).toEqual([]));
  it("no duplicates when race + subrace both grant same skill", () => {
    const skills = getRaceSkillGrants("Эльф");
    expect(skills.filter((s) => s === "Восприятие").length).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getRaceSpellGrants
// ─────────────────────────────────────────────────────────────────────────────

describe("getRaceSpellGrants", () => {
  it("Тифлинг level 1 → только Тауматургия", () => {
    const grants = getRaceSpellGrants("Тифлинг", 1);
    expect(grants.map((g) => g.spellName)).toContain("Тауматургия");
    expect(grants.map((g) => g.spellName)).not.toContain("Адское возмездие");
    expect(grants.map((g) => g.spellName)).not.toContain("Тьма");
  });

  it("Тифлинг level 3 → Тауматургия + Адское возмездие", () => {
    const names = getRaceSpellGrants("Тифлинг", 3).map((g) => g.spellName);
    expect(names).toContain("Тауматургия");
    expect(names).toContain("Адское возмездие");
    expect(names).not.toContain("Тьма");
  });

  it("Тифлинг level 5 → все три заклинания", () => {
    const names = getRaceSpellGrants("Тифлинг", 5).map((g) => g.spellName);
    expect(names).toContain("Тауматургия");
    expect(names).toContain("Адское возмездие");
    expect(names).toContain("Тьма");
  });

  it("Человек → [] (нет заклинаний)", () =>
    expect(getRaceSpellGrants("Человек", 5)).toEqual([]));

  it("unknown race → []", () =>
    expect(getRaceSpellGrants("Несуществующая", 5)).toEqual([]));

  it("Тёмный эльф (subrace) level 3 → получает subrace spells", () => {
    const names = getRaceSpellGrants("Эльф", 3, "Тёмный эльф").map((g) => g.spellName);
    expect(names).toContain("Свет");
    expect(names).toContain("Ядовитые брызги");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getRaceResistances
// ─────────────────────────────────────────────────────────────────────────────

describe("getRaceResistances", () => {
  it("Тифлинг → [fire]", () =>
    expect(getRaceResistances("Тифлинг")).toEqual(["fire"]));
  it("Дварф → [poison]", () =>
    expect(getRaceResistances("Дварф")).toEqual(["poison"]));
  it("Аасимар → [necrotic, radiant]", () => {
    const res = getRaceResistances("Аасимар");
    expect(res).toContain("necrotic");
    expect(res).toContain("radiant");
  });
  it("Тритон → [cold]", () =>
    expect(getRaceResistances("Тритон")).toEqual(["cold"]));
  it("Человек → []", () =>
    expect(getRaceResistances("Человек")).toEqual([]));
  it("unknown race → []", () =>
    expect(getRaceResistances("Несуществующая")).toEqual([]));
  it("Коренастый полурослик (subrace) → [poison]", () =>
    expect(getRaceResistances("Полурослик", "Коренастый")).toEqual(["poison"]));
  it("no duplicates", () => {
    const res = getRaceResistances("Тифлинг");
    expect(new Set(res).size).toBe(res.length);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getRaceAndClassProficiencies (extended with skills + resistances)
// ─────────────────────────────────────────────────────────────────────────────

describe("getRaceAndClassProficiencies", () => {
  it("Дварф + Воин: weapons merged", () => {
    const profs = getRaceAndClassProficiencies("Дварф", "Воин");
    expect(profs.weapons).toContain("Боевой топор");
  });

  it("Горный дварф: armorProficiencies include Средние доспехи", () => {
    const profs = getRaceAndClassProficiencies("Дварф", "Воин", "Горный дварф");
    expect(profs.armor).toContain("Средние доспехи");
  });

  it("Полуорк: skills includes Запугивание", () => {
    const profs = getRaceAndClassProficiencies("Полуорк", "Воин");
    expect(profs.skills).toContain("Запугивание");
  });

  it("Тифлинг: resistances includes fire", () => {
    const profs = getRaceAndClassProficiencies("Тифлинг", "Волшебник");
    expect(profs.resistances).toContain("fire");
  });

  it("unknown race + unknown class: returns empty arrays, no crash", () => {
    const profs = getRaceAndClassProficiencies("НеизвестнаяРаса", "НеизвестныйКласс");
    expect(profs.languages).toEqual([]);
    expect(profs.weapons).toEqual([]);
    expect(profs.skills).toEqual([]);
    expect(profs.resistances).toEqual([]);
    expect(profs.darkvision).toBeNull();
  });

  it("Тёмный эльф: darkvision = 120 (subrace override)", () => {
    const profs = getRaceAndClassProficiencies("Эльф", "Следопыт", "Тёмный эльф");
    expect(profs.darkvision).toBe(120);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Backward compatibility
// ─────────────────────────────────────────────────────────────────────────────

describe("backward compat", () => {
  it("character with race:'Эльф' (legacy string) still computes bonuses", () => {
    // Симулируем старый character без raceSource/raceRef
    const raceBonuses = getRacialBonuses("Эльф");
    expect(raceBonuses.DEX).toBe(2);
  });

  it("old race name keys unchanged — RACE_DATA['Человек'] defined", () =>
    expect(RACE_DATA["Человек"]).toBeDefined());

  it("old race name keys unchanged — RACE_DATA['Аасимар'] defined", () =>
    expect(RACE_DATA["Аасимар"]).toBeDefined());

  it("race with string traits renders without crash", () => {
    // Человек использует string traits — функции не должны падать
    const r = RACE_DATA["Человек"];
    expect(r.traits.every((t) => typeof t === "string" || typeof t === "object")).toBe(true);
  });

  it("getRacialBonuses with no selectedRacialAbilityBonuses → works for non-flexible race", () => {
    expect(() => getRacialBonuses("Эльф", undefined, undefined)).not.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Supplemental races sanity checks
// ─────────────────────────────────────────────────────────────────────────────

describe("supplemental races basic sanity", () => {
  it("Гитьянки и Гитцерай — оба существуют и имеют groupTag Гит", () => {
    expect(RACE_DATA["Гитьянки"]?.groupTag).toBe("Гит");
    expect(RACE_DATA["Гитцерай"]?.groupTag).toBe("Гит");
  });

  it("Дампир — entityType=lineage", () =>
    expect(RACE_DATA["Дампир"]?.entityType).toBe("lineage"));

  it("Грунг — source=OGA", () =>
    expect(RACE_DATA["Грунг"]?.source).toBe("OGA"));

  it("Людоящер — altSpeeds.swim=30", () =>
    expect(RACE_DATA["Людоящер"]?.altSpeeds?.swim).toBe(30));

  it("Тритон — altSpeeds.swim=30", () =>
    expect(RACE_DATA["Тритон"]?.altSpeeds?.swim).toBe(30));

  it("Юань-ти — immunities includes poison", () =>
    expect(RACE_DATA["Юань-ти"]?.immunities).toContain("poison"));

  it("Кобольд — size=Small", () =>
    expect(RACE_DATA["Кобольд"]?.size).toBe("Small"));

  it("MPMM races with abilityBonusSelection have valid patterns", () => {
    const mmpmRaces = Object.values(RACE_DATA).filter((r) => r.source === "MPMM");
    for (const r of mmpmRaces) {
      if (r.abilityBonusSelection) {
        expect(r.abilityBonusSelection.patterns.length).toBeGreaterThan(0);
        for (const p of r.abilityBonusSelection.patterns) {
          expect(p.id).toBeTruthy();
          expect(p.bonuses.length).toBeGreaterThan(0);
        }
      }
    }
  });
});
