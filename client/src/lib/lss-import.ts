import {
  SKILLS,
  buildClassStatePatch,
  getProficiencyBonus,
  type InsertCharacter,
  type SkillProficiency,
  type Weapon,
  type Equipment,
  type Feature,
  type ClassEntry,
  DEFAULT_SKILLS_PROFICIENCY,
  createEmptyAbilityBonuses,
} from "@shared/schema";

const LSS_SKILL_MAP: Record<string, string> = {
  acrobatics: "Акробатика",
  investigation: "Анализ",
  athletics: "Атлетика",
  perception: "Восприятие",
  survival: "Выживание",
  performance: "Выступление",
  intimidation: "Запугивание",
  history: "История",
  "sleight of hand": "Ловкость рук",
  arcana: "Магия",
  medicine: "Медицина",
  deception: "Обман",
  nature: "Природа",
  insight: "Проницательность",
  religion: "Религия",
  stealth: "Скрытность",
  persuasion: "Убеждение",
  "animal handling": "Уход за животными",
};

function extractPlainText(field: any): string {
  if (!field) return "";
  const doc = field?.value?.data || field?.data || field;
  if (!doc || !doc.content) return "";
  const texts: string[] = [];
  function walk(node: any) {
    if (node.text) texts.push(node.text);
    if (node.content) node.content.forEach(walk);
  }
  doc.content.forEach(walk);
  return texts.join("");
}

function parseDamageString(dmgStr: string): { damage: string; damageType: string } {
  const match = dmgStr.match(/^([\dкd]+(?:\+\d+)?)\s*(.*)$/i);
  if (match) {
    return { damage: match[1].replace(/к/g, "d"), damageType: match[2] || "" };
  }
  return { damage: dmgStr, damageType: "" };
}

function isLSSFormat(data: any): boolean {
  return !!(data.jsonType === "character" || data.info?.charClass || data.stats?.str);
}

function isAppFormat(data: any): boolean {
  return !!(data.abilityScores && data.savingThrows && typeof data.class === "string");
}

export function parseImportedJson(fileContent: string): InsertCharacter {
  const raw = JSON.parse(fileContent);

  if (raw.format === "pocket-charlist" && raw.character) {
    return parseAppJson(raw.character);
  }

  if (isAppFormat(raw)) {
    return parseAppJson(raw);
  }

  const data = typeof raw.data === "string" ? JSON.parse(raw.data) : raw.data || raw;

  if (isLSSFormat(data)) {
    return parseLSSData(data);
  }

  if (isAppFormat(data)) {
    return parseAppJson(data);
  }

  throw new Error("Неизвестный формат файла. Поддерживаются: Pocket Charlist JSON, Long Story Short JSON.");
}

function parseAppJson(data: any): InsertCharacter {
  const { id, userId, createdAt, updatedAt, ...rest } = data;
  return rest as InsertCharacter;
}

function parseLSSData(data: any): InsertCharacter {
  const name = data.name?.value || "Импортированный персонаж";
  const className = data.info?.charClass?.value || "Воин";
  const level = data.info?.level?.value || 1;
  const race = data.info?.race?.value || "Человек";
  const background = data.info?.background?.value || "";
  const alignment = data.info?.alignment?.value || "";
  const experience = data.info?.experience?.value || 0;
  const subclass = data.info?.charSubclass?.value || "";

  const abilityScores = {
    STR: data.stats?.str?.score || 10,
    DEX: data.stats?.dex?.score || 10,
    CON: data.stats?.con?.score || 10,
    INT: data.stats?.int?.score || 10,
    WIS: data.stats?.wis?.score || 10,
    CHA: data.stats?.cha?.score || 10,
  };

  const savingThrows = {
    STR: data.saves?.str?.isProf || false,
    DEX: data.saves?.dex?.isProf || false,
    CON: data.saves?.con?.isProf || false,
    INT: data.saves?.int?.isProf || false,
    WIS: data.saves?.wis?.isProf || false,
    CHA: data.saves?.cha?.isProf || false,
  };

  const skills: Record<string, SkillProficiency> = { ...DEFAULT_SKILLS_PROFICIENCY };
  if (data.skills) {
    for (const [key, val] of Object.entries(data.skills) as [string, any][]) {
      const skillLabel = val.label || LSS_SKILL_MAP[key];
      const ourSkillName = skillLabel
        ? SKILLS.find((s) => s.name === skillLabel)?.name
        : undefined;
      if (ourSkillName) {
        skills[ourSkillName] = {
          proficient: !!(val.isProf && val.isProf >= 1),
          expertise: !!(val.isProf && val.isProf >= 2),
        };
      }
    }
  }

  const maxHp = data.vitality?.["hp-max"]?.value || 10;
  const currentHp = data.vitality?.["hp-current"]?.value || maxHp;
  const tempHp = data.vitality?.["hp-temp"]?.value || 0;
  const speed = data.vitality?.speed?.value || 30;
  const armorClass = data.vitality?.ac?.value || 10;

  const deathSaves = {
    successes: Math.min(3, data.vitality?.deathSuccesses || 0),
    failures: Math.min(3, data.vitality?.deathFails || 0),
  };

  const hitDiceStr = data.vitality?.["hit-die"]?.value || "";
  const hitDiceMatch = hitDiceStr.match(/d(\d+)/i);
  const hitDice = hitDiceMatch ? `${level}d${hitDiceMatch[1]}` : `${level}d10`;
  const hitDiceRemaining = data.vitality?.["hp-dice-current"]?.value || level;

  const weapons: Weapon[] = [];
  if (data.weaponsList && Array.isArray(data.weaponsList)) {
    data.weaponsList.forEach((w: any, idx: number) => {
      const weaponName = w.name?.value || `Оружие ${idx + 1}`;
      const dmgStr = w.dmg?.value || "1d6";
      const { damage, damageType } = parseDamageString(dmgStr);
      const modBonus = w.modBonus?.value || 0;
      const modType = w.mod?.value || "+0";
      const isDex = modType.toLowerCase().includes("dex") || modType.toLowerCase().includes("лов");

      weapons.push({
        id: w.id || `weapon-${Date.now()}-${idx}`,
        name: weaponName,
        attackBonus: modBonus,
        damage,
        damageType,
        abilityMod: isDex ? "dex" : "str",
        properties: "",
      });
    });
  }

  const equipment: Equipment[] = [];
  const resources = data.resources || {};
  for (const [, res] of Object.entries(resources) as [string, any][]) {
    if (res.name && res.location === "equipment") {
      equipment.push({
        id: res.id || `eq-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: res.name,
        quantity: res.max || 1,
        category: "misc",
      });
    }
  }

  const textEquipment = extractPlainText(data.text?.equipment);
  if (textEquipment) {
    const lines = textEquipment.split("\n").filter((l: string) => l.trim());
    lines.forEach((line: string, idx: number) => {
      equipment.push({
        id: `eq-text-${Date.now()}-${idx}`,
        name: line.trim(),
        quantity: 1,
        category: "misc",
      });
    });
  }

  const features: Feature[] = [];
  const textFeatures = extractPlainText(data.text?.features);
  const textTraits = extractPlainText(data.text?.traits);
  const textFeats = extractPlainText(data.text?.feats);

  if (textFeatures) {
    features.push({
      id: `feat-class-${Date.now()}`,
      name: "Способности класса",
      source: className,
      description: textFeatures,
    });
  }
  if (textTraits) {
    features.push({
      id: `feat-race-${Date.now()}`,
      name: "Видовые особенности",
      source: race,
      description: textTraits,
    });
  }
  if (textFeats) {
    features.push({
      id: `feat-feats-${Date.now()}`,
      name: "Черты",
      source: "Черты",
      description: textFeats,
    });
  }

  const money = {
    cp: data.coins?.cp?.value || 0,
    sp: data.coins?.sp?.value || 0,
    ep: data.coins?.ep?.value || 0,
    gp: data.coins?.gp?.value || 0,
    pp: data.coins?.pp?.value || 0,
  };

  const profText = extractPlainText(data.text?.prof);
  const languages: string[] = [];
  const armorProfs: string[] = [];
  const weaponProfs: string[] = [];
  if (profText) {
    const langMatch = profText.match(/Знание языков:\s*(.+?)(?:\n|$)/);
    if (langMatch) {
      languages.push(...langMatch[1].split(",").map((l: string) => l.trim()).filter(Boolean));
    }
    const armorMatch = profText.match(/Доспехи:\s*(.+?)(?:\n|$)/);
    if (armorMatch) {
      armorProfs.push(...armorMatch[1].split(",").map((l: string) => l.trim()).filter(Boolean));
    }
    const weaponMatch = profText.match(/Оружие:\s*(.+?)(?:\n|$)/);
    if (weaponMatch) {
      weaponProfs.push(...weaponMatch[1].split(",").map((l: string) => l.trim()).filter(Boolean));
    }
  }

  const notes = [
    extractPlainText(data.text?.["notes-1"]),
    extractPlainText(data.text?.["notes-2"]),
    extractPlainText(data.text?.background),
  ].filter(Boolean).join("\n\n");

  const age    = String(data.subInfo?.age?.value    || "");
  const height = String(data.subInfo?.height?.value || "");
  const weight = String(data.subInfo?.weight?.value || "");
  const eyes   = String(data.subInfo?.eyes?.value   || "");
  const skin   = String(data.subInfo?.skin?.value   || "");
  const hair   = String(data.subInfo?.hair?.value   || "");

  const personalityTraits = extractPlainText(data.text?.personality);
  const ideals = extractPlainText(data.text?.ideals);
  const bonds  = extractPlainText(data.text?.bonds);
  const flaws  = extractPlainText(data.text?.flaws);

  const allies = extractPlainText(data.text?.attacks) || "";

  const classEntry: ClassEntry = { name: className, level, subclass: subclass || undefined };
  const baseCharacter: InsertCharacter = {
    name,
    class: className,
    subclass: subclass || undefined,
    race,
    level,
    classes: [classEntry],
    background,
    alignment,
    experience,
    abilityScores,
    selectedRacialAbilityBonuses: createEmptyAbilityBonuses(),
    customAbilityBonuses: createEmptyAbilityBonuses(),
    savingThrows,
    skills,
    armorClass,
    customACBonus: 0,
    customMaxHpBonus: 0,
    initiative: 0,
    customInitiativeBonus: 0,
    speed,
    maxHp,
    currentHp,
    tempHp,
    hitDice,
    hitDiceRemaining,
    deathSaves,
    weapons,
    features,
    equipment,
    money,
    proficiencies: {
      languages: languages.length > 0 ? languages : ["Общий"],
      weapons: weaponProfs,
      armor: armorProfs,
      tools: [],
    },
    proficiencyBonus: getProficiencyBonus(level),
    inspiration: false,
    notes,
    personalityTraits,
    ideals,
    bonds,
    flaws,
    appearance: "",
    age,
    height,
    weight,
    eyes,
    skin,
    hair,
    allies,
    equipmentLocked: false,
    weaponsLocked: false,
    featuresLocked: false,
    spellSlotsLocked: false,
  };
  const classStatePatch = buildClassStatePatch(baseCharacter);

  return {
    ...baseCharacter,
    ...classStatePatch,
  };
}

export { parseImportedJson as parseLSSJson };
