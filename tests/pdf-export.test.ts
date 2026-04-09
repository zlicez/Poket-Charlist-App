import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { buildCharacterPdfBytes } from "../client/src/lib/pdf-export";
import { createDefaultCharacter, type Character } from "../shared/schema";

const PDF_EXPORT_TEST_TIMEOUT_MS = 15_000;

function createPdfTestCharacter(): Character {
  const character: Character = {
    id: "pdf-test-character",
    ...createDefaultCharacter(),
    name: "Эландор Ветрорун",
    class: "Волшебник",
    race: "Высший эльф",
    background: "Мудрец",
    alignment: "Нейтрально-добрый",
    experience: 6500,
    level: 5,
    classes: [{ name: "Волшебник", level: 5 }],
    abilityScores: { STR: 8, DEX: 16, CON: 14, INT: 18, WIS: 12, CHA: 10 },
    savingThrows: {
      STR: false,
      DEX: false,
      CON: false,
      INT: true,
      WIS: true,
      CHA: false,
    },
    armorClass: 13,
    customInitiativeBonus: 0,
    speed: 30,
    maxHp: 27,
    currentHp: 22,
    tempHp: 4,
    hitDice: "5d6",
    hitDiceRemaining: 3,
    deathSaves: { successes: 1, failures: 2 },
    weapons: [
      {
        id: "w1",
        name: "Посох",
        attackBonus: 0,
        damage: "1d6",
        damageType: "дробящий",
        abilityMod: "str",
      },
      {
        id: "w2",
        name: "Кинжал",
        attackBonus: 0,
        damage: "1d4",
        damageType: "колющий",
        abilityMod: "dex",
        isFinesse: true,
      },
    ],
    features: Array.from({ length: 10 }, (_, index) => ({
      id: `feature-${index + 1}`,
      name: `Особенность ${index + 1}`,
      source: "Волшебник",
      description:
        "Подробное описание способности с несколькими строками и достаточно длинным текстом для проверки перелива между полями.",
    })),
    equipment: [
      { id: "e1", name: "Книга заклинаний", quantity: 1, category: "misc" },
      { id: "e2", name: "Компонентная сумка", quantity: 1, category: "tool" },
      { id: "e3", name: "Зелье лечения", quantity: 2, category: "potion" },
      { id: "e4", name: "Верёвка, 50 футов", quantity: 1, category: "misc" },
    ],
    money: { cp: 12, sp: 8, ep: 0, gp: 124, pp: 1 },
    proficiencies: {
      languages: ["Общий", "Эльфийский", "Драконий"],
      weapons: ["Кинжалы", "Дротики", "Пращи"],
      armor: [],
      tools: ["Набор каллиграфа"],
    },
    notes:
      "История персонажа с переносами строк.\n\nПосле академии он отправился изучать древние руины.",
    allies: "Старый наставник из башни магов",
    factions: "Союз арканистов",
    spellcasting: {
      ability: "INT",
      spellSlots: [
        { max: 4, used: 1 },
        { max: 3, used: 2 },
        { max: 2, used: 1 },
        { max: 0, used: 0 },
        { max: 0, used: 0 },
        { max: 0, used: 0 },
        { max: 0, used: 0 },
        { max: 0, used: 0 },
        { max: 0, used: 0 },
      ],
      pactMagic: { slotLevel: 1, max: 0, used: 0 },
      spells: [
        {
          id: "spell-0-1",
          name: "Свет",
          level: 0,
          castingTime: "1 действие",
          range: "",
          components: "",
          duration: "",
          concentration: false,
          ritual: false,
          description: "",
          prepared: true,
        },
        {
          id: "spell-1-1",
          name: "Волшебная стрела",
          level: 1,
          castingTime: "1 действие",
          range: "",
          components: "",
          duration: "",
          concentration: false,
          ritual: false,
          description: "",
          prepared: true,
        },
        {
          id: "spell-1-2",
          name: "Щит",
          level: 1,
          castingTime: "1 реакция",
          range: "",
          components: "",
          duration: "",
          concentration: false,
          ritual: false,
          description: "",
          prepared: true,
        },
        {
          id: "spell-2-1",
          name: "Невидимость",
          level: 2,
          castingTime: "1 действие",
          range: "",
          components: "",
          duration: "",
          concentration: true,
          ritual: false,
          description: "",
          prepared: true,
        },
      ],
    },
  };

  character.skills["Магия"] = { proficient: true, expertise: true };
  character.skills["История"] = { proficient: true, expertise: false };
  character.skills["Анализ"] = { proficient: true, expertise: false };
  character.skills["Проницательность"] = { proficient: true, expertise: false };
  character.skills["Восприятие"] = { proficient: true, expertise: false };

  return character;
}

async function buildFormForCharacter(character: Character) {
  const templateBytes = readFileSync(resolve("assets/charlist_blank.pdf"));
  const fontBytes = readFileSync(
    resolve("client/public/fonts/NotoSans-Regular.ttf"),
  );
  const pdfBytes = await buildCharacterPdfBytes(character, templateBytes, fontBytes);
  const pdfDocument = await PDFDocument.load(pdfBytes);
  return pdfDocument.getForm();
}

describe("pdf export", () => {
  it(
    "fills key fields across all pages from AcroForm bindings",
    async () => {
      const form = await buildFormForCharacter(createPdfTestCharacter());

      expect(form.getTextField("character_name_p1").getText()).toBe("Эландор Ветрорун");
      expect(form.getTextField("character_name_p2").getText()).toBe("Эландор Ветрорун");
      expect(form.getTextField("class_level").getText()).toBe("Волшебник 5");
      expect(form.getTextField("background").getText()).toBe("Мудрец");
      expect(form.getTextField("race_display").getText()).toBe("Высший эльф");
      expect(form.getTextField("spellcasting_class").getText()).toBe("Волшебник 5");
      expect(form.getTextField("spellcasting_ability").getText()).toBe("ИНТ");
      expect(form.getTextField("spell_lvl_0_row_01_name").getText()).toBe("Свет");
      expect(form.getTextField("spell_lvl_1_row_01_name").getText()).toBe("Волшебная стрела");
      expect(form.getTextField("spell_lvl_1_row_02_name").getText()).toBe("Щит");
      expect(form.getTextField("spell_lvl_1_slots_total").getText()).toBe("4");
      expect(form.getTextField("spell_lvl_1_slots_used").getText()).toBe("1");
      expect(form.getTextField("allies_text").getText()).toContain("Старый наставник");
      expect(form.getTextField("allies_text").getText()).toContain("Фракции:");
      expect(form.getTextField("backstory_text").getText()).toContain("История персонажа");
    },
    PDF_EXPORT_TEST_TIMEOUT_MS,
  );

  it(
    "marks radio groups and spills long features into the second field",
    async () => {
      const form = await buildFormForCharacter(createPdfTestCharacter());

      expect(form.getRadioGroup("save_throw_int_prof").getSelected()).toBe(
        "save_throw_int_prof",
      );
      expect(form.getRadioGroup("skill_arcana_prof").getSelected()).toBe(
        "skill_arcana_prof",
      );
      expect(form.getRadioGroup("death_save_success_1").getSelected()).toBe(
        "death_save_success_1",
      );
      expect(form.getRadioGroup("death_save_failure_2").getSelected()).toBe(
        "death_save_failure_2",
      );
      expect(form.getTextField("features_primary").getText()).toContain("Особенность 1");
      expect(form.getTextField("features_secondary").getText()).toContain(
        "Особенность",
      );
    },
    PDF_EXPORT_TEST_TIMEOUT_MS,
  );

  it(
    "merges automatic class proficiencies into the exported proficiencies block",
    async () => {
      const character = createPdfTestCharacter();
      character.class = "Друид";
      character.classes = [{ name: "Друид", level: 5 }];
      character.proficiencies = {
        languages: ["Общий"],
        weapons: [],
        armor: [],
        tools: [],
      };

      const form = await buildFormForCharacter(character);
      const proficienciesText = form.getTextField("proficiencies_text").getText() || "";

      expect(proficienciesText).toContain("Языки: Общий");
      expect(proficienciesText).toContain("Оружие:");
      expect(proficienciesText).toContain("Доспехи:");
      expect(proficienciesText).toContain("Инструменты:");
      expect(proficienciesText).toContain("Набор травника");
    },
    PDF_EXPORT_TEST_TIMEOUT_MS,
  );

  it(
    "leaves unmapped template fields blank",
    async () => {
      const form = await buildFormForCharacter(createPdfTestCharacter());

      expect(form.getTextField("player_name").getText()).toBeUndefined();
      expect(form.getTextField("personality_traits").getText()).toBeUndefined();
      expect(form.getTextField("treasure_text").getText()).toBeUndefined();
      expect(form.getTextField("age").getText()).toBeUndefined();
    },
    PDF_EXPORT_TEST_TIMEOUT_MS,
  );
});
