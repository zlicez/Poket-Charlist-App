import fontkit from "@pdf-lib/fontkit";
import {
  PDFDocument,
  PDFRadioGroup,
  PDFTextField,
  TextAlignment,
  type PDFForm,
  type PDFFont,
} from "pdf-lib";
import {
  ABILITY_NAMES,
  CLASS_DATA,
  PROFICIENCY_CATEGORY_LABELS,
  SKILLS,
  calculateModifier,
  calculateSpellAttackBonus,
  calculateSpellSaveDC,
  formatClassesDisplay,
  formatModifier,
  getCharacterClasses,
  getProficiencyBonus,
  getRacialBonuses,
  getRaceAndClassProficiencies,
  getTotalLevel,
  type AbilityName,
  type Character,
  type ClassEntry,
  type SkillName,
} from "@shared/schema";
import { getCombinedWeapons } from "@/lib/weapons";

const PDF_TEMPLATE_URL = "/charlist_blank.pdf";
const PDF_FONT_URL = "/fonts/NotoSans-Regular.ttf";

const SPELL_ROW_FIELD_RE = /^spell_lvl_(\d)_row_(\d{2})_name$/;
const SPELL_SLOT_FIELD_RE = /^spell_lvl_(\d)_slots_(total|used)$/;
const ATTACK_FIELD_RE = /^attack_(\d+)_(name|bonus|damage)$/;

const FEATURE_FIELD_BUDGETS = [1350, 820] as const;
const SPELL_NAME_FONT_SIZE = 8;
const MIN_ADAPTIVE_FONT_SIZE = 6;
const ADAPTIVE_TEXT_FIELD_NAMES = new Set([
  "background",
  "features_primary",
  "features_secondary",
  "allies_text",
  "equipment_text",
]);

const ABILITY_TO_LOWERCASE_FIELD: Record<AbilityName, string> = {
  STR: "str",
  DEX: "dex",
  CON: "con",
  INT: "int",
  WIS: "wis",
  CHA: "cha",
};

const ABILITY_TO_RUSSIAN_SHORT_LABEL: Record<AbilityName, string> = {
  STR: "СИЛ",
  DEX: "ЛОВ",
  CON: "ТЕЛ",
  INT: "ИНТ",
  WIS: "МУД",
  CHA: "ХАР",
};

const SKILL_FIELD_BINDINGS: { slug: string; skill: SkillName }[] = [
  { slug: "acrobatics", skill: "Акробатика" },
  { slug: "investigation", skill: "Анализ" },
  { slug: "athletics", skill: "Атлетика" },
  { slug: "perception", skill: "Восприятие" },
  { slug: "survival", skill: "Выживание" },
  { slug: "performance", skill: "Выступление" },
  { slug: "intimidation", skill: "Запугивание" },
  { slug: "history", skill: "История" },
  { slug: "sleight_of_hand", skill: "Ловкость рук" },
  { slug: "arcana", skill: "Магия" },
  { slug: "medicine", skill: "Медицина" },
  { slug: "deception", skill: "Обман" },
  { slug: "nature", skill: "Природа" },
  { slug: "insight", skill: "Проницательность" },
  { slug: "religion", skill: "Религия" },
  { slug: "stealth", skill: "Скрытность" },
  { slug: "persuasion", skill: "Убеждение" },
  { slug: "animal_handling", skill: "Уход за животными" },
];

const SKILL_TO_ABILITY = new Map<SkillName, AbilityName>(
  SKILLS.map((skill) => [skill.name, skill.ability]),
);

interface TextFieldBinding {
  value: string;
}

interface RadioFieldBinding {
  selected: boolean;
}

interface PdfExportViewModel {
  textFields: Record<string, TextFieldBinding>;
  radioFields: Record<string, RadioFieldBinding>;
}

interface TemplateFieldIndex {
  fieldNames: Set<string>;
  attackRows: number[];
  spellRowFields: Map<number, string[]>;
  spellSlotTotalFields: Map<number, string>;
  spellSlotUsedFields: Map<number, string>;
}

interface TextFieldSettings {
  alignment?: TextAlignment;
  fontSize?: number;
  multiline?: boolean;
}

function normalizeWhitespace(input: string): string {
  return input.replace(/\r\n/g, "\n").replace(/\u00a0/g, " ");
}

function decodeBasicHtmlEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripHtmlKeepingStructure(input: string): string {
  return input
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|blockquote|h[1-6]|li|ul|ol|pre)>/gi, "\n")
    .replace(/<li>/gi, "- ")
    .replace(/<[^>]+>/g, "");
}

function stripMarkdownSyntax(input: string): string {
  return input
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "- ")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/`{1,3}([^`]+)`{1,3}/g, "$1")
    .replace(/[*_~]{1,3}/g, "");
}

function normalizeRichTextToPlainText(input?: string): string {
  if (!input) return "";

  return decodeBasicHtmlEntities(
    stripMarkdownSyntax(stripHtmlKeepingStructure(normalizeWhitespace(input))),
  )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sanitizeFilename(input: string): string {
  return input
    .replace(/[^a-zA-Zа-яА-ЯёЁ0-9\s_-]/g, "_")
    .replace(/\s+/g, " ")
    .trim();
}

function toUint8Array(bytes: ArrayBuffer | Uint8Array): Uint8Array {
  return bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
}

function buildTemplateFieldIndex(form: PDFForm): TemplateFieldIndex {
  const fieldNames = new Set<string>();
  const attackRows = new Set<number>();
  const spellRowFields = new Map<number, string[]>();
  const spellSlotTotalFields = new Map<number, string>();
  const spellSlotUsedFields = new Map<number, string>();

  for (const field of form.getFields()) {
    const fieldName = field.getName();
    fieldNames.add(fieldName);

    const attackMatch = fieldName.match(ATTACK_FIELD_RE);
    if (attackMatch) {
      attackRows.add(Number(attackMatch[1]));
    }

    const spellRowMatch = fieldName.match(SPELL_ROW_FIELD_RE);
    if (spellRowMatch) {
      const level = Number(spellRowMatch[1]);
      const rows = spellRowFields.get(level) || [];
      rows.push(fieldName);
      spellRowFields.set(level, rows);
    }

    const spellSlotMatch = fieldName.match(SPELL_SLOT_FIELD_RE);
    if (spellSlotMatch) {
      const level = Number(spellSlotMatch[1]);
      const slotType = spellSlotMatch[2];
      if (slotType === "total") {
        spellSlotTotalFields.set(level, fieldName);
      } else {
        spellSlotUsedFields.set(level, fieldName);
      }
    }
  }

  spellRowFields.forEach((rows) => {
    rows.sort((left: string, right: string) => left.localeCompare(right, "en"));
  });

  return {
    fieldNames,
    attackRows: Array.from(attackRows).sort((left, right) => left - right),
    spellRowFields,
    spellSlotTotalFields,
    spellSlotUsedFields,
  };
}

function getTotalLevelSafe(classes: ClassEntry[]): number {
  return classes.length > 0 ? getTotalLevel(classes) : 1;
}

function formatClassAndLevel(classes: ClassEntry[]): string {
  if (classes.length === 0) return "";
  if (classes.length === 1) {
    return `${classes[0].name} ${classes[0].level}`;
  }
  return formatClassesDisplay(classes);
}

function getTotalAbilityScore(character: Character, ability: AbilityName): number {
  const racialBonuses = getRacialBonuses(
    character.race,
    character.subrace,
    character.selectedRacialAbilityBonuses,
  );
  return (
    character.abilityScores[ability] +
    (racialBonuses[ability] || 0) +
    (character.customAbilityBonuses?.[ability] || 0)
  );
}

function getAbilityModifier(character: Character, ability: AbilityName): number {
  return calculateModifier(getTotalAbilityScore(character, ability));
}

function getSavingThrowTotal(
  character: Character,
  ability: AbilityName,
  proficiencyBonus: number,
): number {
  const modifier = getAbilityModifier(character, ability);
  return character.savingThrows[ability]
    ? modifier + proficiencyBonus
    : modifier;
}

function getSkillTotal(
  character: Character,
  skillName: SkillName,
  proficiencyBonus: number,
): { total: number; proficient: boolean; expertise: boolean } {
  const skillEntry = character.skills[skillName];
  const ability = SKILL_TO_ABILITY.get(skillName) || "INT";
  const abilityModifier = getAbilityModifier(character, ability);

  if (skillEntry?.expertise) {
    return {
      total: abilityModifier + proficiencyBonus * 2,
      proficient: true,
      expertise: true,
    };
  }

  if (skillEntry?.proficient) {
    return {
      total: abilityModifier + proficiencyBonus,
      proficient: true,
      expertise: false,
    };
  }

  return { total: abilityModifier, proficient: false, expertise: false };
}

function getPassivePerception(character: Character, proficiencyBonus: number): number {
  const perception = getSkillTotal(character, "Восприятие", proficiencyBonus);
  return 10 + perception.total;
}

function mergeUniqueValues(...groups: ReadonlyArray<readonly string[]>): string[] {
  return Array.from(
    new Set(groups.flat().map((value) => value.trim()).filter(Boolean)),
  );
}

function buildProficienciesText(character: Character): string {
  const autoProficiencies = getRaceAndClassProficiencies(
    character.race,
    character.class,
    character.subrace,
  );

  const lines = (
    ["languages", "weapons", "armor", "tools"] as const
  ).flatMap((category) => {
    const values = mergeUniqueValues(
      autoProficiencies[category] || [],
      character.proficiencies?.[category] || [],
    );
    if (values.length === 0) return [];
    return [`${PROFICIENCY_CATEGORY_LABELS[category]}: ${values.join(", ")}`];
  });

  return lines.join("\n");
}

function buildEquipmentText(character: Character): string {
  return character.equipment
    .map((item) => {
      const quantity = item.quantity > 1 ? `${item.quantity}x ` : "";
      return `${quantity}${item.name}`;
    })
    .join("\n");
}

function buildFeatureBlocks(character: Character): string[] {
  return character.features.map((feature) => {
    const title = feature.source
      ? `${feature.name} (${feature.source})`
      : feature.name;
    const description = normalizeRichTextToPlainText(feature.description);
    return description ? `${title}\n${description}` : title;
  });
}

function splitBlockByBudget(block: string, budget: number): [string, string] {
  if (block.length <= budget) {
    return [block, ""];
  }

  const boundary = Math.max(
    block.lastIndexOf("\n", budget),
    block.lastIndexOf(" ", budget),
  );
  const safeIndex = boundary > Math.floor(budget * 0.45) ? boundary : budget;

  return [
    block.slice(0, safeIndex).trim(),
    block.slice(safeIndex).trim(),
  ];
}

function splitBlocksAcrossBudgets(
  blocks: string[],
  budgets: readonly number[],
): string[] {
  const segments = budgets.map(() => "");
  let blockIndex = 0;
  let carry = "";

  for (let segmentIndex = 0; segmentIndex < budgets.length; segmentIndex += 1) {
    const budget = budgets[segmentIndex];
    const segmentBlocks: string[] = [];
    let used = 0;

    while (carry || blockIndex < blocks.length) {
      const nextBlock = carry || blocks[blockIndex];
      const separatorLength = segmentBlocks.length > 0 ? 2 : 0;
      const nextLength = separatorLength + nextBlock.length;

      if (used + nextLength <= budget) {
        segmentBlocks.push(nextBlock);
        used += nextLength;
        carry = "";
        if (blockIndex < blocks.length) {
          blockIndex += 1;
        }
        continue;
      }

      if (segmentBlocks.length === 0) {
        const [head, tail] = splitBlockByBudget(nextBlock, budget);
        if (head) {
          segmentBlocks.push(head);
        }
        carry = tail;
        if (!carry && blockIndex < blocks.length) {
          blockIndex += 1;
        }
      }
      break;
    }

    segments[segmentIndex] = segmentBlocks.join("\n\n");
  }

  return segments;
}

function buildFeatureTextSegments(character: Character): {
  primary: string;
  secondary: string;
} {
  const blocks = buildFeatureBlocks(character);
  const [primary = "", secondary = ""] = splitBlocksAcrossBudgets(
    blocks,
    FEATURE_FIELD_BUDGETS,
  );

  return { primary, secondary };
}

function buildAlliesAndFactionsText(character: Character): string {
  const allies = normalizeRichTextToPlainText(character.allies);
  const factions = normalizeRichTextToPlainText(character.factions);

  if (allies && factions) {
    return `${allies}\n\nФракции:\n${factions}`;
  }

  return allies || factions;
}

function getWeaponDisplayRows(character: Character, proficiencyBonus: number) {
  return getCombinedWeapons(character.weapons, character.equipment).map((weapon) => {
    const ability = weapon.abilityMod === "dex" ? "DEX" : "STR";
    const abilityModifier = getAbilityModifier(character, ability);
    const attackBonus = formatModifier(
      proficiencyBonus + abilityModifier + weapon.attackBonus,
    );
    const damageModifier =
      abilityModifier !== 0 ? formatModifier(abilityModifier) : "";
    const damageTypeSuffix = weapon.damageType ? ` ${weapon.damageType}` : "";

    return {
      name: weapon.name,
      attackBonus,
      damage: `${weapon.damage}${damageModifier}${damageTypeSuffix}`.trim(),
    };
  });
}

function getSpellSlotSummary(character: Character): { max: number; used: number }[] {
  const slots = Array.from({ length: 9 }, (_, index) => {
    const current = character.spellcasting?.spellSlots[index];
    return {
      max: current?.max || 0,
      used: current?.used || 0,
    };
  });

  const pactMagic = character.spellcasting?.pactMagic;
  if (pactMagic && pactMagic.max > 0) {
    const pactIndex = pactMagic.slotLevel - 1;
    if (pactIndex >= 0 && pactIndex < slots.length) {
      slots[pactIndex] = {
        max: slots[pactIndex].max + pactMagic.max,
        used: slots[pactIndex].used + pactMagic.used,
      };
    }
  }

  return slots;
}

function getSpellcastingClasses(classes: ClassEntry[]): ClassEntry[] {
  return classes.filter((entry) => Boolean(CLASS_DATA[entry.name]?.spellcastingAbility));
}

function getTextFieldSettings(fieldName: string): TextFieldSettings {
  if (
    fieldName === "character_name_p1" ||
    fieldName === "character_name_p2"
  ) {
    return { fontSize: 16 };
  }

  if (
    fieldName === "class_level" ||
    fieldName === "background" ||
    fieldName === "race_display" ||
    fieldName === "alignment" ||
    fieldName === "experience" ||
    fieldName === "spellcasting_class"
  ) {
    return { fontSize: 10 };
  }

  if (
    fieldName === "armor_class" ||
    fieldName === "initiative" ||
    fieldName === "speed" ||
    fieldName === "hp_current" ||
    fieldName === "spellcasting_ability" ||
    fieldName === "spell_save_dc" ||
    fieldName === "spell_attack_bonus"
  ) {
    return { alignment: TextAlignment.Center, fontSize: 12 };
  }

  if (
    fieldName === "hp_max" ||
    fieldName === "hp_temp" ||
    fieldName === "hit_dice_total" ||
    fieldName === "hit_dice_value" ||
    fieldName === "passive_perception" ||
    fieldName === "proficiency_bonus"
  ) {
    return { alignment: TextAlignment.Center, fontSize: 10 };
  }

  if (/^ability_[a-z]+_score$/.test(fieldName)) {
    return { alignment: TextAlignment.Center, fontSize: 18 };
  }

  if (/^ability_[a-z]+_mod$/.test(fieldName)) {
    return { alignment: TextAlignment.Center, fontSize: 12 };
  }

  if (/^save_throw_[a-z]+_value$/.test(fieldName)) {
    return { alignment: TextAlignment.Center, fontSize: 9 };
  }

  if (/^skill_[a-z_]+_value$/.test(fieldName)) {
    return { alignment: TextAlignment.Center, fontSize: 8 };
  }

  if (/^attack_\d+_bonus$/.test(fieldName)) {
    return { alignment: TextAlignment.Center, fontSize: 8 };
  }

  if (/^attack_\d+_name$/.test(fieldName)) {
    return { fontSize: 8 };
  }

  if (/^attack_\d+_damage$/.test(fieldName)) {
    return { fontSize: 7 };
  }

  if (
    fieldName === "features_primary" ||
    fieldName === "features_secondary" ||
    fieldName === "equipment_text" ||
    fieldName === "proficiencies_text" ||
    fieldName === "allies_text" ||
    fieldName === "backstory_text" ||
    fieldName === "treasure_text"
  ) {
    const fontSize =
      fieldName === "features_primary" || fieldName === "features_secondary"
        ? 8
        : fieldName === "backstory_text"
          ? 8
          : 8.5;
    return { multiline: true, fontSize };
  }

  if (/^coins_(cp|sp|ep|gp|pp)$/.test(fieldName)) {
    return { alignment: TextAlignment.Center, fontSize: 9 };
  }

  if (/^spell_lvl_\d_row_\d{2}_name$/.test(fieldName)) {
    return { fontSize: SPELL_NAME_FONT_SIZE };
  }

  if (/^spell_lvl_\d_slots_(total|used)$/.test(fieldName)) {
    return { alignment: TextAlignment.Center, fontSize: 10 };
  }

  return {};
}

function countWrappedLines(
  text: string,
  maxWidth: number,
  font: PDFFont,
  fontSize: number,
): number {
  const normalizedLines = text.replace(/\r\n/g, "\n").split("\n");
  let linesUsed = 0;

  for (const rawLine of normalizedLines) {
    linesUsed += 1;

    const words = rawLine.split(" ");
    let spaceInLineRemaining = maxWidth;

    for (let index = 0; index < words.length; index += 1) {
      const isLastWord = index === words.length - 1;
      const word = isLastWord ? words[index] : `${words[index]} `;
      const widthOfWord = font.widthOfTextAtSize(word, fontSize);

      spaceInLineRemaining -= widthOfWord;
      if (spaceInLineRemaining <= 0) {
        linesUsed += 1;
        spaceInLineRemaining = maxWidth - widthOfWord;
      }
    }
  }

  return linesUsed;
}

function getAdaptiveFontSizeForField(
  field: PDFTextField,
  text: string,
  font: PDFFont,
  preferredFontSize: number,
): number {
  const [widget] = field.acroField.getWidgets();
  if (!widget) return preferredFontSize;

  const rectangle = widget.getRectangle();
  const borderWidth = widget.getBorderStyle()?.getWidth() ?? 0;
  const padding = field.isCombed() ? 0 : 1;
  const availableWidth = Math.abs(rectangle.width) - (borderWidth + padding) * 2;
  const availableHeight =
    Math.abs(rectangle.height) - (borderWidth + padding) * 2;

  if (availableWidth <= 0 || availableHeight <= 0) {
    return preferredFontSize;
  }

  const singleLineText = text.replace(/\r?\n/g, " ");

  for (
    let fontSize = preferredFontSize;
    fontSize >= MIN_ADAPTIVE_FONT_SIZE;
    fontSize -= 0.5
  ) {
    if (field.isMultiline()) {
      const lineHeight = font.heightAtSize(fontSize) * 1.2;
      const linesUsed = countWrappedLines(text, availableWidth, font, fontSize);

      if (linesUsed * lineHeight <= availableHeight) {
        return fontSize;
      }

      continue;
    }

    const textWidth = font.widthOfTextAtSize(singleLineText, fontSize);
    const textHeight = font.heightAtSize(fontSize, { descender: false });

    if (textWidth <= availableWidth && textHeight <= availableHeight) {
      return fontSize;
    }
  }

  return MIN_ADAPTIVE_FONT_SIZE;
}

function getExistingTextField(form: PDFForm, fieldName: string): PDFTextField | null {
  try {
    return form.getTextField(fieldName);
  } catch {
    return null;
  }
}

function getExistingRadioGroup(form: PDFForm, fieldName: string): PDFRadioGroup | null {
  try {
    return form.getRadioGroup(fieldName);
  } catch {
    return null;
  }
}

function applyTextFieldBinding(
  form: PDFForm,
  fieldName: string,
  binding: TextFieldBinding,
): void {
  const field = getExistingTextField(form, fieldName);
  if (!field) return;

  const settings = getTextFieldSettings(fieldName);
  if (settings.multiline) {
    field.enableMultiline();
  } else {
    field.disableMultiline();
  }

  if (settings.alignment !== undefined) {
    field.setAlignment(settings.alignment);
  }

  if (settings.fontSize !== undefined) {
    field.setFontSize(settings.fontSize);
  }

  field.setText(binding.value);
}

function applyAdaptiveTextSizing(
  form: PDFForm,
  viewModel: PdfExportViewModel,
  font: PDFFont,
): void {
  for (const [fieldName, binding] of Object.entries(viewModel.textFields)) {
    if (!ADAPTIVE_TEXT_FIELD_NAMES.has(fieldName) || !binding.value) continue;

    const field = getExistingTextField(form, fieldName);
    if (!field) continue;

    const preferredFontSize = getTextFieldSettings(fieldName).fontSize;
    if (!preferredFontSize) continue;

    field.setFontSize(
      getAdaptiveFontSizeForField(field, binding.value, font, preferredFontSize),
    );
  }
}

function applyRadioFieldBinding(
  form: PDFForm,
  fieldName: string,
  binding: RadioFieldBinding,
): void {
  const field = getExistingRadioGroup(form, fieldName);
  if (!field) return;

  if (!binding.selected) {
    field.clear();
    return;
  }

  const [firstOption] = field.getOptions();
  if (firstOption) {
    field.select(firstOption);
  }
}

function buildPdfExportViewModel(
  character: Character,
  template: TemplateFieldIndex,
): PdfExportViewModel {
  const textFields: Record<string, TextFieldBinding> = {};
  const radioFields: Record<string, RadioFieldBinding> = {};

  const characterClasses = getCharacterClasses(character);
  const totalLevel = getTotalLevelSafe(characterClasses);
  const proficiencyBonus = getProficiencyBonus(totalLevel);
  const featureSegments = buildFeatureTextSegments(character);
  const skillValues = SKILL_FIELD_BINDINGS.map(({ slug, skill }) => ({
    slug,
    skill,
    total: getSkillTotal(character, skill, proficiencyBonus),
  }));

  const setText = (fieldName: string, value: string | null | undefined) => {
    if (!template.fieldNames.has(fieldName)) return;
    if (!value) return;
    textFields[fieldName] = { value };
  };

  const setRadio = (fieldName: string, selected: boolean) => {
    if (!template.fieldNames.has(fieldName)) return;
    radioFields[fieldName] = { selected };
  };

  setText("character_name_p1", character.name);
  setText("character_name_p2", character.name);
  setText("class_level", formatClassAndLevel(characterClasses));
  setText("background", character.background || "");
  setText("race_display", [character.race, character.subrace].filter(Boolean).join(" "));
  setText("alignment", character.alignment || "");
  setText("experience", String(character.experience || 0));
  setText("proficiency_bonus", formatModifier(proficiencyBonus));
  setText("armor_class", String(character.armorClass || 0));
  setText(
    "initiative",
    formatModifier(
      getAbilityModifier(character, "DEX") + (character.customInitiativeBonus || 0),
    ),
  );
  setText("speed", String(character.speed || 0));
  setText("hp_max", String(character.maxHp || 0));
  setText("hp_current", String(character.currentHp || 0));
  setText("hp_temp", String(character.tempHp || 0));
  setText("hit_dice_total", String(character.hitDiceRemaining || 0));
  setText("hit_dice_value", character.hitDice || "");
  setText(
    "passive_perception",
    String(getPassivePerception(character, proficiencyBonus)),
  );
  setText("proficiencies_text", buildProficienciesText(character));
  setText("equipment_text", buildEquipmentText(character));
  setText("features_primary", featureSegments.primary);
  setText("features_secondary", featureSegments.secondary);
  setText("allies_text", buildAlliesAndFactionsText(character));
  setText("backstory_text", normalizeRichTextToPlainText(character.notes));
  setRadio("inspiration", Boolean(character.inspiration));
  setText("personality_traits", normalizeRichTextToPlainText(character.personalityTraits));
  setText("ideals", normalizeRichTextToPlainText(character.ideals));
  setText("bonds", normalizeRichTextToPlainText(character.bonds));
  setText("flaws", normalizeRichTextToPlainText(character.flaws));
  setText("age", character.age || "");
  setText("height", character.height || "");
  setText("weight", character.weight || "");
  setText("eyes", character.eyes || "");
  setText("skin", character.skin || "");
  setText("hair", character.hair || "");

  for (const ability of ABILITY_NAMES) {
    const abilityField = ABILITY_TO_LOWERCASE_FIELD[ability];
    setText(
      `ability_${abilityField}_score`,
      String(getTotalAbilityScore(character, ability)),
    );
    setText(
      `ability_${abilityField}_mod`,
      formatModifier(getAbilityModifier(character, ability)),
    );
    setText(
      `save_throw_${abilityField}_value`,
      formatModifier(getSavingThrowTotal(character, ability, proficiencyBonus)),
    );
    setRadio(
      `save_throw_${abilityField}_prof`,
      Boolean(character.savingThrows[ability]),
    );
  }

  for (const skillValue of skillValues) {
    setText(
      `skill_${skillValue.slug}_value`,
      formatModifier(skillValue.total.total),
    );
    setRadio(
      `skill_${skillValue.slug}_prof`,
      skillValue.total.proficient || skillValue.total.expertise,
    );
  }

  for (let index = 1; index <= 3; index += 1) {
    setRadio(
      `death_save_success_${index}`,
      index <= (character.deathSaves?.successes || 0),
    );
    setRadio(
      `death_save_failure_${index}`,
      index <= (character.deathSaves?.failures || 0),
    );
  }

  (["cp", "sp", "ep", "gp", "pp"] as const).forEach((coinType) => {
    const value = character.money?.[coinType] ?? 0;
    if (value > 0) {
      setText(`coins_${coinType}`, String(value));
    }
  });

  const weaponRows = getWeaponDisplayRows(character, proficiencyBonus);
  template.attackRows.forEach((attackRowNumber, index) => {
    const weaponRow = weaponRows[index];
    if (!weaponRow) return;
    setText(`attack_${attackRowNumber}_name`, weaponRow.name);
    setText(`attack_${attackRowNumber}_bonus`, weaponRow.attackBonus);
    setText(`attack_${attackRowNumber}_damage`, weaponRow.damage);
  });

  const casterClasses = getSpellcastingClasses(characterClasses);
  if (casterClasses.length > 0 && character.spellcasting) {
    const ability = character.spellcasting.ability;
    const abilityModifier = getAbilityModifier(character, ability);
    const spellSaveDc = calculateSpellSaveDC(abilityModifier, proficiencyBonus);
    const spellAttackBonus = calculateSpellAttackBonus(
      abilityModifier,
      proficiencyBonus,
    );
    const spellSlotSummary = getSpellSlotSummary(character);

    setText("spellcasting_class", formatClassAndLevel(casterClasses));
    setText("spellcasting_ability", ABILITY_TO_RUSSIAN_SHORT_LABEL[ability]);
    setText("spell_save_dc", String(spellSaveDc));
    setText("spell_attack_bonus", formatModifier(spellAttackBonus));

    const spellsByLevel = new Map<number, string[]>();
    for (let level = 0; level <= 9; level += 1) {
      spellsByLevel.set(
        level,
        (character.spellcasting.spells || [])
          .filter((spell) => spell.level === level)
          .map((spell) => spell.name),
      );
    }

    template.spellRowFields.forEach((fieldNames, level) => {
      const spellNames = spellsByLevel.get(level) || [];
      fieldNames.forEach((fieldName, index) => {
        const spellName = spellNames[index];
        if (spellName) {
          setText(fieldName, spellName);
        }
      });
    });

    template.spellSlotTotalFields.forEach((fieldName, level) => {
      const summary = spellSlotSummary[level - 1];
      if (summary && summary.max > 0) {
        setText(fieldName, String(summary.max));
      }
    });

    template.spellSlotUsedFields.forEach((fieldName, level) => {
      const summary = spellSlotSummary[level - 1];
      if (summary && summary.used > 0) {
        setText(fieldName, String(summary.used));
      }
    });
  }

  return { textFields, radioFields };
}

function applyViewModelToForm(form: PDFForm, viewModel: PdfExportViewModel): void {
  for (const [fieldName, binding] of Object.entries(viewModel.textFields)) {
    applyTextFieldBinding(form, fieldName, binding);
  }

  for (const [fieldName, binding] of Object.entries(viewModel.radioFields)) {
    applyRadioFieldBinding(form, fieldName, binding);
  }
}

async function loadTemplateBytes(): Promise<Uint8Array> {
  const response = await fetch(PDF_TEMPLATE_URL);
  if (!response.ok) {
    throw new Error(`Failed to load PDF template: ${response.status}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

async function loadFontBytes(): Promise<Uint8Array> {
  const response = await fetch(PDF_FONT_URL);
  if (!response.ok) {
    throw new Error(`Failed to load PDF font: ${response.status}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

function savePdfBytes(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function buildCharacterPdfBytes(
  character: Character,
  templateBytes: ArrayBuffer | Uint8Array,
  fontBytes?: ArrayBuffer | Uint8Array,
): Promise<Uint8Array> {
  const pdfDocument = await PDFDocument.load(toUint8Array(templateBytes));
  pdfDocument.registerFontkit(fontkit);

  const form = pdfDocument.getForm();
  const templateFieldIndex = buildTemplateFieldIndex(form);
  const unicodeFont = await pdfDocument.embedFont(
    fontBytes ? toUint8Array(fontBytes) : await loadFontBytes(),
    { subset: false },
  );

  const viewModel = buildPdfExportViewModel(character, templateFieldIndex);
  applyViewModelToForm(form, viewModel);
  applyAdaptiveTextSizing(form, viewModel, unicodeFont);
  form.updateFieldAppearances(unicodeFont);

  return pdfDocument.save({ useObjectStreams: false });
}

export async function exportCharacterToPDF(character: Character): Promise<void> {
  const templateBytes = await loadTemplateBytes();
  const fontBytes = await loadFontBytes();
  const pdfBytes = await buildCharacterPdfBytes(character, templateBytes, fontBytes);
  const fileName = `${sanitizeFilename(character.name || "Персонаж")}.pdf`;
  savePdfBytes(pdfBytes, fileName);
}
