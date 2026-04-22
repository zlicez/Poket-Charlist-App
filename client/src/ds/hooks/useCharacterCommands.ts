/**
 * Phase I — команды ⌘K для экрана персонажа.
 *
 * Handoff README §Interactions: palette включает «attack weapons, cast
 * spells, rest, toggle play/edit». MVP покрывает:
 *   - переключение play/edit
 *   - навигация по табам combat/sheet/spells/bag
 *   - короткий / долгий отдых (apply прямо из палитры, без sheet'а)
 *   - поделиться / экспорт
 *
 * Attack weapons / cast spells выведены отдельно — они раскрываются на своих
 * табах, палитра отправляет на соответствующий таб.
 */
import { useMemo } from "react";

import { usePlayMode } from "@/ds/hooks/usePlayMode";
import { useCommitRest } from "@/hooks/character/useCommitRest";
import { useHapticFeedback } from "@/ds/hooks/useHapticFeedback";
import type { Command } from "@/ds/hooks/useCommandPalette";
import {
  getCharacterClasses,
  getTotalLevel,
  type Character,
  type Spellcasting,
} from "@shared/schema";

export interface CharacterCommandsArgs {
  id: string;
  /**
   * null ровно пока `useCharacterState` грузит данные. Хук вернёт пустой
   * список, чтобы CharacterScreen мог вызывать его безусловно — rules-of-hooks.
   */
  character: Character | null;
  hasSpellcasting: boolean;
  setLocation: (to: string) => void;
  openShare: () => void;
  openExport: () => void;
}

export function useCharacterCommands({
  id,
  character,
  hasSpellcasting,
  setLocation,
  openShare,
  openExport,
}: CharacterCommandsArgs): Command[] {
  const { mode, setMode } = usePlayMode(id);
  const commitRest = useCommitRest(id);
  const haptic = useHapticFeedback();

  return useMemo<Command[]>(() => {
    if (!character) return [];
    const togglePlayEdit: Command = {
      id: "toggle-mode",
      label: mode === "play" ? "Переключиться в Edit" : "Переключиться в Play",
      section: "Режим",
      keywords: ["play", "edit", "режим"],
      hint: mode === "play" ? "→ Edit" : "→ Play",
      onRun: () => {
        setMode(mode === "play" ? "edit" : "play");
        haptic("tick");
      },
    };

    const goto = (tab: string, label: string, keywords: string[]): Command => ({
      id: `goto-${tab}`,
      label,
      section: "Перейти",
      keywords,
      hint: `/${tab}`,
      onRun: () => setLocation(`/character/${id}/${tab}`),
    });

    const longRestPatch = (): Partial<Character> => {
      const totalLevel = getTotalLevel(getCharacterClasses(character));
      const hdGain = Math.min(
        Math.max(1, Math.ceil(totalLevel / 2)),
        totalLevel - (character.hitDiceRemaining ?? 0),
      );
      const newHd = Math.min(
        totalLevel,
        (character.hitDiceRemaining ?? 0) + hdGain,
      );
      const patch: Partial<Character> = {
        currentHp: character.maxHp,
        hitDiceRemaining: newHd,
        deathSaves: { successes: 0, failures: 0 },
      };
      if (character.spellcasting) {
        const next: Spellcasting = {
          ...character.spellcasting,
          spellSlots: character.spellcasting.spellSlots.map((s) => ({
            ...s,
            used: 0,
          })),
          pactMagic: character.spellcasting.pactMagic
            ? { ...character.spellcasting.pactMagic, used: 0 }
            : character.spellcasting.pactMagic,
        };
        patch.spellcasting = next;
      }
      return patch;
    };

    const longRest: Command = {
      id: "long-rest",
      label: "Долгий отдых",
      hint: "полное восст.",
      section: "Отдых",
      keywords: ["rest", "long", "sleep", "отдых", "ночь"],
      onRun: () => {
        commitRest.mutate(longRestPatch());
        haptic("success");
      },
    };

    const share: Command = {
      id: "share",
      label: "Поделиться ссылкой",
      section: "Экспорт",
      keywords: ["share", "link", "публичн"],
      onRun: openShare,
    };

    const exportMenu: Command = {
      id: "export",
      label: "Экспорт JSON / PDF",
      section: "Экспорт",
      keywords: ["export", "json", "pdf", "сохранить"],
      onRun: openExport,
    };

    return [
      togglePlayEdit,
      goto("combat", "Открыть Бой", ["combat", "hp", "atk", "бой"]),
      goto("sheet", "Открыть Лист", ["sheet", "skills", "navyki", "навыки"]),
      ...(hasSpellcasting
        ? [goto("spells", "Открыть Заклинания", ["spells", "magic", "магия"])]
        : []),
      goto("bag", "Открыть Сумку", ["bag", "inventory", "инвентарь"]),
      longRest,
      share,
      exportMenu,
    ];
  }, [
    character,
    commitRest,
    hasSpellcasting,
    haptic,
    id,
    mode,
    openExport,
    openShare,
    setLocation,
    setMode,
  ]);
}
