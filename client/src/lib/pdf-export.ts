import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ABILITY_LABELS,
  ABILITY_NAMES,
  SKILLS_BY_ABILITY,
  calculateModifier,
  getProficiencyBonus,
  formatModifier,
  getRacialBonuses,
  getCharacterClasses,
  getTotalLevel,
  formatClassesDisplay,
  type Character,
  type AbilityName,
} from "@shared/schema";

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable: { finalY: number };
  }
}

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 12;
const CONTENT_W = PAGE_W - MARGIN * 2;

import { ROBOTO_REGULAR_BASE64 } from "@/assets/roboto-regular-base64";

function loadCyrillicFont(doc: jsPDF): void {
  try {
    doc.addFileToVFS("Roboto-Regular.ttf", ROBOTO_REGULAR_BASE64);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.addFileToVFS("Roboto-Bold.ttf", ROBOTO_REGULAR_BASE64);
    doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
  } catch (e) {
    console.warn("Failed to load Cyrillic font", e);
  }
}

function setFont(doc: jsPDF, style: "normal" | "bold" = "normal", size: number = 9) {
  doc.setFont("Roboto", style);
  doc.setFontSize(size);
}

function drawSectionHeader(doc: jsPDF, title: string, y: number): number {
  setFont(doc, "bold", 11);
  doc.setFillColor(50, 50, 50);
  doc.rect(MARGIN, y, CONTENT_W, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.text(title, MARGIN + 3, y + 5);
  doc.setTextColor(0, 0, 0);
  return y + 9;
}

function drawLabelValue(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  labelWidth: number = 40
): number {
  setFont(doc, "normal", 7);
  doc.setTextColor(100, 100, 100);
  doc.text(label, x, y);
  setFont(doc, "normal", 9);
  doc.setTextColor(0, 0, 0);
  doc.text(String(value), x + labelWidth, y);
  return y + 5;
}

function checkNewPage(doc: jsPDF, y: number, needed: number = 20): number {
  if (y + needed > PAGE_H - MARGIN) {
    doc.addPage();
    return MARGIN + 5;
  }
  return y;
}

export function exportCharacterToPDF(character: Character): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  loadCyrillicFont(doc);
  doc.setFont("Roboto", "normal");

  const charClasses = getCharacterClasses(character);
  const totalLevel = getTotalLevel(charClasses);
  const profBonus = getProficiencyBonus(totalLevel);
  const racialBonuses = getRacialBonuses(character.race, character.subrace);

  const getScore = (ab: AbilityName) => {
    const base = character.abilityScores[ab];
    const racial = racialBonuses[ab] || 0;
    const custom = character.customAbilityBonuses?.[ab] || 0;
    return base + racial + custom;
  };
  const getMod = (ab: AbilityName) => calculateModifier(getScore(ab));

  let y = MARGIN;

  setFont(doc, "bold", 18);
  doc.text(character.name, MARGIN, y + 6);
  y += 10;

  setFont(doc, "normal", 10);
  const classDisplay = formatClassesDisplay(charClasses);
  const headerLine = [
    classDisplay,
    character.race + (character.subrace ? ` (${character.subrace})` : ""),
    `Ур. ${totalLevel}`,
    character.background ? `${character.background}` : "",
    character.alignment || "",
  ]
    .filter(Boolean)
    .join("  •  ");
  const headerLines = doc.splitTextToSize(headerLine, CONTENT_W);
  for (const line of headerLines) {
    doc.text(line, MARGIN, y + 4);
    y += 5;
  }
  y += 3;

  doc.setDrawColor(180, 180, 180);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 4;

  y = drawSectionHeader(doc, "ХАРАКТЕРИСТИКИ", y);

  const colW = CONTENT_W / 6;
  ABILITY_NAMES.forEach((ab, i) => {
    const x = MARGIN + i * colW;
    const score = getScore(ab);
    const mod = getMod(ab);

    doc.setFillColor(240, 240, 240);
    doc.roundedRect(x + 1, y, colW - 2, 22, 2, 2, "F");

    setFont(doc, "bold", 7);
    doc.setTextColor(100, 100, 100);
    doc.text(ABILITY_LABELS[ab].ru, x + colW / 2, y + 4, { align: "center" });

    setFont(doc, "bold", 16);
    doc.setTextColor(0, 0, 0);
    doc.text(formatModifier(mod), x + colW / 2, y + 13, { align: "center" });

    setFont(doc, "normal", 8);
    doc.text(String(score), x + colW / 2, y + 19, { align: "center" });
  });
  y += 26;

  const leftColX = MARGIN;
  const rightColX = MARGIN + CONTENT_W / 2 + 2;
  const halfW = CONTENT_W / 2 - 2;

  y = drawSectionHeader(doc, "СПАСБРОСКИ И НАВЫКИ", y);
  let yLeft = y;
  let yRight = y;

  setFont(doc, "bold", 8);
  doc.text("Спасброски", leftColX, yLeft + 4);
  yLeft += 7;

  ABILITY_NAMES.forEach((ab) => {
    const mod = getMod(ab);
    const isProficient = character.savingThrows[ab];
    const totalMod = isProficient ? mod + profBonus : mod;
    const marker = isProficient ? "●" : "○";

    setFont(doc, "normal", 8);
    doc.text(
      `${marker} ${formatModifier(totalMod)}  ${ABILITY_LABELS[ab].ru}`,
      leftColX + 2,
      yLeft + 3
    );
    yLeft += 4.5;
  });

  setFont(doc, "bold", 8);
  doc.text("Навыки", rightColX, yRight + 4);
  yRight += 7;

  for (const ab of ABILITY_NAMES) {
    const abMod = getMod(ab);
    const abSkills = SKILLS_BY_ABILITY[ab];
    for (const skill of abSkills) {
      const prof = character.skills[skill.name];
      let totalMod = abMod;
      let marker = "○";
      if (prof?.expertise) {
        totalMod += profBonus * 2;
        marker = "◆";
      } else if (prof?.proficient) {
        totalMod += profBonus;
        marker = "●";
      }
      setFont(doc, "normal", 7);
      doc.text(
        `${marker} ${formatModifier(totalMod)}  ${skill.name}`,
        rightColX + 2,
        yRight + 3
      );
      yRight += 4;
    }
  }

  y = Math.max(yLeft, yRight) + 4;

  y = checkNewPage(doc, y, 35);
  y = drawSectionHeader(doc, "БОЕВЫЕ ПАРАМЕТРЫ", y);

  const combatData = [
    ["КД", String(character.armorClass)],
    ["Инициатива", formatModifier(getMod("DEX") + (character.customInitiativeBonus || 0))],
    ["Скорость", `${character.speed} фт.`],
    ["Хиты", `${character.currentHp} / ${character.maxHp}`],
    ["Врем. хиты", String(character.tempHp)],
    ["Кости хитов", character.hitDice],
    ["Бонус мастерства", formatModifier(profBonus)],
  ];

  const combatColW = CONTENT_W / 4;
  combatData.forEach((item, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = MARGIN + col * combatColW;
    const cy = y + row * 12;

    setFont(doc, "normal", 7);
    doc.setTextColor(100, 100, 100);
    doc.text(item[0], x + 2, cy + 4);

    setFont(doc, "bold", 11);
    doc.setTextColor(0, 0, 0);
    doc.text(item[1], x + 2, cy + 10);
  });
  y += Math.ceil(combatData.length / 4) * 12 + 4;

  if (character.weapons.length > 0) {
    y = checkNewPage(doc, y, 20);
    y = drawSectionHeader(doc, "ОРУЖИЕ", y);

    const weaponRows = character.weapons.map((w) => [
      w.name,
      formatModifier(w.attackBonus + getMod(w.abilityMod === "dex" ? "DEX" : "STR") + profBonus),
      w.damage,
      w.damageType,
      w.properties || "",
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Название", "Атака", "Урон", "Тип", "Свойства"]],
      body: weaponRows,
      margin: { left: MARGIN, right: MARGIN },
      styles: { font: "Roboto", fontSize: 8, cellPadding: 1.5 },
      headStyles: { fillColor: [80, 80, 80], font: "Roboto", fontStyle: "bold" },
      theme: "grid",
    });
    y = doc.lastAutoTable.finalY + 4;
  }

  if (character.features.length > 0) {
    y = checkNewPage(doc, y, 20);
    y = drawSectionHeader(doc, "СПОСОБНОСТИ И ЧЕРТЫ", y);

    for (const feat of character.features) {
      y = checkNewPage(doc, y, 15);
      setFont(doc, "bold", 8);
      doc.text(`${feat.name} (${feat.source})`, MARGIN + 2, y + 4);
      y += 5;

      if (feat.description) {
        setFont(doc, "normal", 7);
        const lines = doc.splitTextToSize(feat.description, CONTENT_W - 4);
        for (const line of lines) {
          y = checkNewPage(doc, y, 5);
          doc.text(line, MARGIN + 2, y + 3);
          y += 3.5;
        }
      }
      y += 2;
    }
  }

  if (character.spellcasting && character.spellcasting.spells.length > 0) {
    y = checkNewPage(doc, y, 20);
    y = drawSectionHeader(doc, "ЗАКЛИНАНИЯ", y);

    const spellAbMod = getMod(character.spellcasting.ability);
    const spellSaveDC = 8 + profBonus + spellAbMod;
    const spellAttack = profBonus + spellAbMod;

    setFont(doc, "normal", 8);
    doc.text(
      `Базовая характеристика: ${ABILITY_LABELS[character.spellcasting.ability].ru}  |  Сложность спасброска: ${spellSaveDC}  |  Бонус атаки: ${formatModifier(spellAttack)}`,
      MARGIN + 2,
      y + 4
    );
    y += 8;

    const slotInfo = character.spellcasting.spellSlots
      .map((s, i) => (s.max > 0 ? `${i + 1}-й: ${s.max - s.used}/${s.max}` : null))
      .filter(Boolean);
    if (slotInfo.length > 0) {
      setFont(doc, "normal", 7);
      doc.text(`Ячейки: ${slotInfo.join("  ")}`, MARGIN + 2, y + 3);
      y += 6;
    }

    const spellRows = character.spellcasting.spells.map((s) => [
      s.level === 0 ? "Заговор" : String(s.level),
      s.name,
      s.castingTime,
      s.range,
      [s.concentration ? "К" : "", s.ritual ? "Р" : ""].filter(Boolean).join(", ") || "—",
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Ур.", "Название", "Время", "Дистанция", "К/Р"]],
      body: spellRows,
      margin: { left: MARGIN, right: MARGIN },
      styles: { font: "Roboto", fontSize: 7, cellPadding: 1.2 },
      headStyles: { fillColor: [80, 80, 80], font: "Roboto", fontStyle: "bold" },
      theme: "grid",
    });
    y = doc.lastAutoTable.finalY + 4;
  }

  if (character.equipment.length > 0 || (character.money && Object.values(character.money).some((v) => v > 0))) {
    y = checkNewPage(doc, y, 20);
    y = drawSectionHeader(doc, "СНАРЯЖЕНИЕ И МОНЕТЫ", y);

    const moneyStr = [
      character.money.pp > 0 ? `ПМ: ${character.money.pp}` : "",
      character.money.gp > 0 ? `ЗМ: ${character.money.gp}` : "",
      character.money.ep > 0 ? `ЭМ: ${character.money.ep}` : "",
      character.money.sp > 0 ? `СМ: ${character.money.sp}` : "",
      character.money.cp > 0 ? `ММ: ${character.money.cp}` : "",
    ]
      .filter(Boolean)
      .join("  ");

    if (moneyStr) {
      setFont(doc, "bold", 8);
      doc.text("Монеты: ", MARGIN + 2, y + 4);
      setFont(doc, "normal", 8);
      doc.text(moneyStr, MARGIN + 22, y + 4);
      y += 7;
    }

    if (character.equipment.length > 0) {
      const eqRows = character.equipment.map((eq) => [
        eq.name,
        String(eq.quantity),
        eq.description || "",
      ]);

      autoTable(doc, {
        startY: y,
        head: [["Предмет", "Кол-во", "Описание"]],
        body: eqRows,
        margin: { left: MARGIN, right: MARGIN },
        styles: { font: "Roboto", fontSize: 7, cellPadding: 1.2 },
        headStyles: { fillColor: [80, 80, 80], font: "Roboto", fontStyle: "bold" },
        theme: "grid",
        columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 15 } },
      });
      y = doc.lastAutoTable.finalY + 4;
    }
  }

  if (character.notes) {
    y = checkNewPage(doc, y, 20);
    y = drawSectionHeader(doc, "ЗАМЕТКИ", y);
    setFont(doc, "normal", 8);
    const noteLines = doc.splitTextToSize(character.notes, CONTENT_W - 4);
    for (const line of noteLines) {
      y = checkNewPage(doc, y, 5);
      doc.text(line, MARGIN + 2, y + 3);
      y += 4;
    }
    y += 2;
  }

  if (character.appearance) {
    y = checkNewPage(doc, y, 15);
    y = drawSectionHeader(doc, "ВНЕШНОСТЬ", y);
    setFont(doc, "normal", 8);
    const appLines = doc.splitTextToSize(character.appearance, CONTENT_W - 4);
    for (const line of appLines) {
      y = checkNewPage(doc, y, 5);
      doc.text(line, MARGIN + 2, y + 3);
      y += 4;
    }
  }

  const fileName = `${character.name.replace(/[^a-zA-Zа-яА-ЯёЁ0-9\s]/g, "_")}.pdf`;
  doc.save(fileName);
}
