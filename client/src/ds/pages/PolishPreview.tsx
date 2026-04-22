import { useCallback, useMemo, useState } from "react";

import { typeClass } from "@/ds/tokens";
import { Button, Tag } from "@/ds/primitives";
import { CommandPalette } from "@/ds/screens/polish";
import {
  useCmdKListener,
  type Command,
} from "@/ds/hooks/useCommandPalette";
import {
  useHapticFeedback,
  __private as hapticInternals,
  type HapticPattern,
} from "@/ds/hooks/useHapticFeedback";

/**
 * Dev-page: Phase I polish — палитра команд + haptic triggers. Работает без
 * auth (подключена через GatedRoutes bypass).
 *
 * Подсказка: на реальном iPhone/Android с поддержкой navigator.vibrate
 * кнопки haptic действительно вибрируют, на desktop — no-op.
 */
export default function PolishPreview() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [lastPattern, setLastPattern] = useState<HapticPattern | null>(null);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const haptic = useHapticFeedback();
  const openPalette = useCallback(() => setPaletteOpen(true), []);
  useCmdKListener(openPalette);

  const fire = (pattern: HapticPattern) => {
    haptic(pattern);
    setLastPattern(pattern);
  };

  const commands = useMemo<Command[]>(() => {
    const make = (
      id: string,
      label: string,
      section: string,
      keywords: string[],
    ): Command => ({
      id,
      label,
      section,
      keywords,
      hint: `id: ${id}`,
      onRun: () => setLastCommand(id),
    });
    return [
      make("toggle-mode", "Переключиться в Edit", "Режим", ["play", "edit"]),
      make("goto-combat", "Открыть Бой", "Перейти", ["combat", "hp"]),
      make("goto-sheet", "Открыть Лист", "Перейти", ["skills", "навыки"]),
      make("goto-spells", "Открыть Заклинания", "Перейти", ["magic", "магия"]),
      make("goto-bag", "Открыть Сумку", "Перейти", ["bag", "inventory"]),
      make("long-rest", "Долгий отдых", "Отдых", ["rest", "long", "sleep"]),
      make("share", "Поделиться ссылкой", "Экспорт", ["share", "link"]),
      make("export", "Экспорт JSON / PDF", "Экспорт", ["json", "pdf"]),
    ];
  }, []);

  const envEnabled = hapticInternals.hapticsEnabled();

  return (
    <div className="min-h-screen bg-paper-2 text-ink-900 font-ds-sans">
      <header className="border-b border-ink-200 bg-paper-card px-6 py-4">
        <div className={`${typeClass("label")} text-ruby mb-1`}>
          PHASE I · POLISH
        </div>
        <h1 className={`${typeClass("h1")} text-ink-900`}>
          Polish preview
        </h1>
        <p className={`${typeClass("body-sm")} text-ink-600 mt-1 max-w-xl`}>
          ⌘K (или Ctrl+K) открывает command palette. Haptic кнопки вибрируют на
          мобильных устройствах с поддержкой Vibration API.
        </p>
      </header>

      <main className="px-6 py-6 max-w-2xl space-y-6">
        <section>
          <div className={`${typeClass("label")} text-ink-500 mb-2`}>
            COMMAND PALETTE
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="primary" onClick={() => setPaletteOpen(true)}>
              Открыть палитру
            </Button>
            <span className={`${typeClass("caption")} text-ink-500`}>
              или нажми <kbd className="font-ds-mono text-ink-700">⌘K</kbd>
            </span>
          </div>
          {lastCommand && (
            <div
              className={`${typeClass("body-sm")} text-ink-700 mt-3`}
              data-testid="polish-last-command"
            >
              Последняя команда:{" "}
              <strong className="font-ds-mono text-ink-900">
                {lastCommand}
              </strong>
            </div>
          )}
        </section>

        <section>
          <div
            className={`${typeClass("label")} text-ink-500 mb-2 flex items-center gap-2`}
          >
            HAPTIC FEEDBACK{" "}
            {envEnabled ? (
              <Tag variant="sage">активно</Tag>
            ) : (
              <Tag variant="gold">недоступно</Tag>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(["tick", "bump", "success", "warn"] as const).map((p) => (
              <Button
                key={p}
                variant="outline"
                onClick={() => fire(p)}
                data-testid={`polish-haptic-${p}`}
              >
                {p}
              </Button>
            ))}
          </div>
          {lastPattern && (
            <div
              className={`${typeClass("body-sm")} text-ink-700 mt-3`}
              data-testid="polish-last-haptic"
            >
              Последняя вибрация:{" "}
              <strong className="font-ds-mono text-ink-900">
                {lastPattern}
              </strong>
            </div>
          )}
          {!envEnabled && (
            <div
              className={`${typeClass("caption")} text-ink-500 mt-2 max-w-md leading-[1.4]`}
            >
              Haptics отключены: либо устройство не поддерживает
              navigator.vibrate, либо включён prefers-reduced-motion, либо
              пользователь выставил localStorage["ds.haptics"] = "off".
            </div>
          )}
        </section>
      </main>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        commands={commands}
      />
    </div>
  );
}
