import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { typeClass } from "@/ds/tokens";
import {
  filterCommands,
  groupCommands,
  type Command,
} from "@/ds/hooks/useCommandPalette";

/**
 * Phase I — ⌘K Command Palette. Handoff §Interactions: desktop cmdk с
 * действиями (tabs / rest / play-edit / attacks / spells).
 *
 * MVP:
 *   - Radix Dialog (центрированный), overlay 55% ink-900
 *   - input label "Найти команду"
 *   - list с arrow-navigation (↑ ↓ Enter + Home/End)
 *   - Esc закрывает
 *
 * Mobile fallback: palette тоже работает — просто нет hotkey, открывается
 * из ActionsMenuSheet через prop.
 */
export function CommandPalette({
  open,
  onOpenChange,
  commands,
  placeholder = "Найти команду…",
  emptyLabel = "Ничего не найдено",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: Command[];
  placeholder?: string;
  emptyLabel?: string;
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filtered = filterCommands(commands, query);
  const groups = groupCommands(filtered);

  // Reset at open & на query change: курсор на верх.
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Клавиатурная навигация — только на open state.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!filtered.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(filtered.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[activeIndex];
      if (cmd && !cmd.disabled) {
        cmd.onRun();
        onOpenChange(false);
      }
    }
  };

  // Scroll активного в viewport.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-command-index="${activeIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-ink-900/55",
            "motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0 motion-safe:data-[state=open]:duration-[160ms]",
            "motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:fade-out-0 motion-safe:data-[state=closed]:duration-[120ms]",
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-[15vh] z-50 -translate-x-1/2 w-[min(640px,calc(100vw-32px))]",
            "bg-paper-card rounded-ds-md shadow-ds-3 border border-ink-200",
            "overflow-hidden",
            "motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0 motion-safe:data-[state=open]:zoom-in-95 motion-safe:data-[state=open]:duration-[180ms]",
          )}
          onKeyDown={handleKeyDown}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <DialogPrimitive.Title className="sr-only">
            Команды
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Стрелки вверх/вниз для выбора, Enter для запуска, Escape для
            закрытия.
          </DialogPrimitive.Description>

          <div className="px-4 py-3 border-b border-ink-200 flex items-center gap-3">
            <span
              className={cn(
                typeClass("label"),
                "text-ink-500 tracking-[0.12em]",
              )}
              aria-hidden
            >
              ⌘K
            </span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              aria-label="Поиск команды"
              className={cn(
                "flex-1 bg-transparent outline-none",
                "font-ds-sans text-[15px] text-ink-900 placeholder:text-ink-400",
              )}
              data-testid="command-palette-input"
            />
          </div>

          <div
            ref={listRef}
            role="listbox"
            aria-label="Команды"
            className="max-h-[min(380px,55vh)] overflow-y-auto py-1.5"
          >
            {filtered.length === 0 ? (
              <div
                className={cn(
                  typeClass("body-sm"),
                  "text-ink-500 px-4 py-6 text-center",
                )}
                data-testid="command-palette-empty"
              >
                {emptyLabel}
              </div>
            ) : (
              groups.map(({ section, items }) => (
                <div key={section ?? "__default"}>
                  {section && (
                    <div
                      className={cn(
                        typeClass("label"),
                        "text-ink-500 px-4 pt-2 pb-1",
                      )}
                    >
                      {section}
                    </div>
                  )}
                  {items.map((cmd) => {
                    const globalIndex = filtered.indexOf(cmd);
                    const active = globalIndex === activeIndex;
                    return (
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        aria-disabled={cmd.disabled || undefined}
                        data-command-index={globalIndex}
                        data-testid={`command-palette-item-${cmd.id}`}
                        key={cmd.id}
                        disabled={cmd.disabled}
                        onMouseEnter={() => setActiveIndex(globalIndex)}
                        onClick={() => {
                          if (cmd.disabled) return;
                          cmd.onRun();
                          onOpenChange(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-left",
                          "font-ds-sans text-[14px] text-ink-900",
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                          "focus:outline-none",
                          active && !cmd.disabled && "bg-ink-100",
                        )}
                      >
                        <span className="flex-1 truncate">{cmd.label}</span>
                        {cmd.hint && (
                          <span
                            className={cn(
                              typeClass("caption"),
                              "text-ink-500 shrink-0",
                            )}
                          >
                            {cmd.hint}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          <div
            className={cn(
              typeClass("caption"),
              "text-ink-500 border-t border-ink-200 px-4 py-2 flex gap-4",
            )}
            aria-hidden
          >
            <span>
              <kbd className="font-ds-mono text-ink-700">↑↓</kbd> выбор
            </span>
            <span>
              <kbd className="font-ds-mono text-ink-700">Enter</kbd> запустить
            </span>
            <span>
              <kbd className="font-ds-mono text-ink-700">Esc</kbd> закрыть
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
