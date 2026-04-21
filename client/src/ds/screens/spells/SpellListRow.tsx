import { ChevronDown, Trash2, Wand2 } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Button, Tag } from "@/ds/primitives";
import { typeClass } from "@/ds/tokens";
import type { Spell } from "@shared/schema";

/**
 * S-03 — spell row в списке подготовленных.
 * Handoff 03-screens.jsx SpellsScreen S-03:
 *   [prepared-dot violet/outline] [name + concentration К-tag]
 *   [school · casting time] [+N слот / прочесть кнопка]
 * Accordion — tap по ряду раскрывает description.
 */
export function SpellListRow({
  spell,
  isLast,
  onCast,
  onTogglePrepared,
  onRemove,
  /** Cantrip (level=0) — нельзя «потратить», вместо +N слот читаем сразу. */
  isCantrip,
}: {
  spell: Spell;
  isLast?: boolean;
  onCast?: () => void;
  onTogglePrepared?: () => void;
  onRemove?: () => void;
  isCantrip?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn(!isLast && "border-b border-ink-100")}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          "w-full flex items-center gap-2.5 px-3 py-2.5",
          "text-left transition-colors duration-150",
          "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ruby-bg",
          "hover:bg-paper-2 active:bg-ink-100",
        )}
        data-testid={`spell-row-${spell.id}`}
      >
        {/* Prepared dot */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePrepared?.();
          }}
          aria-label={spell.prepared ? "Убрать из подготовленных" : "Подготовить"}
          className={cn(
            "w-2.5 h-2.5 rounded-full shrink-0 focus:outline-none focus-visible:ring-[2px] focus-visible:ring-ruby-bg",
            spell.prepared ? "bg-violet" : "bg-transparent border border-ink-300",
          )}
        />

        <div className="flex-1 min-w-0">
          <div className="font-ds-sans text-[13.5px] font-medium text-ink-900 truncate flex items-center gap-1.5">
            {spell.name}
            {spell.concentration && <Tag variant="ruby">К</Tag>}
            {spell.ritual && <Tag variant="gold">Р</Tag>}
          </div>
          <div className={cn(typeClass("code"), "text-ink-500 truncate mt-0.5")}>
            {spell.castingTime}
            {spell.range ? ` · ${spell.range}` : ""}
          </div>
        </div>

        {/* Cast CTA — spend slot (или «Прочесть» для заговоров) */}
        {onCast && (
          <Button
            variant={isCantrip ? "outline" : "ruby"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onCast();
            }}
            className={cn(
              "shrink-0 font-ds-mono",
              isCantrip && "text-violet border-violet",
            )}
            aria-label={isCantrip ? "Прочесть" : `Потратить слот ${spell.level} уровня`}
            data-testid={`spell-cast-${spell.id}`}
          >
            {isCantrip ? "Прочесть" : `+1 слот`}
          </Button>
        )}

        <ChevronDown
          className={cn(
            "w-4 h-4 text-ink-400 shrink-0 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 bg-paper-2 space-y-2">
          <div className={cn(typeClass("caption"), "text-ink-500")}>
            <span className="mr-2">Школа: {spellSchoolOrDash(spell)}</span>
            <span className="mr-2">Компоненты: {spell.components || "—"}</span>
            <span>Длительность: {spell.duration || "—"}</span>
          </div>
          {spell.description && (
            <p className={cn(typeClass("body-sm"), "text-ink-700 whitespace-pre-wrap")}>
              {spell.description}
            </p>
          )}
          {onRemove && (
            <div className="flex justify-end pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="text-ruby"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Удалить
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function spellSchoolOrDash(s: Spell): string {
  // Школа не хранится в character.spellcasting.spells (без поля в schema);
  // UI показывает «—» если не заполнено. Для library-импортированных spell'ов
  // лучше было бы сохранять school, но это Phase F work.
  return (s as Spell & { school?: string }).school ?? "—";
}

export { Wand2 as SpellIcon };
