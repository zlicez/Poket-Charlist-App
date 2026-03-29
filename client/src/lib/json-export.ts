import type { Character } from "@shared/schema";

export function exportCharacterToJSON(character: Character): void {
  const { userId: _userId, ...characterData } = character;

  const exportData = {
    format: "pocket-charlist",
    version: 1,
    exportedAt: new Date().toISOString(),
    character: characterData,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${character.name.replace(/[^a-zA-Zа-яА-ЯёЁ0-9\s]/g, "_")}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
