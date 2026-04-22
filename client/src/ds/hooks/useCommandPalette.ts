/**
 * Phase I — ⌘K command palette infrastructure.
 *
 * Handoff README §Interactions: «desktop ⌘K opens a command palette with:
 * attack weapons, cast spells, rest, toggle play/edit». Mobile без hotkey, но
 * можно открыть через overflow-меню (Phase I polish дополнение).
 *
 * API:
 *   useCmdKListener(onOpen) — attach global Cmd+K / Ctrl+K.
 *   filterCommands(commands, query) — substring + keyword scoring, stable sort.
 */
import { useEffect } from "react";

export interface Command {
  id: string;
  label: string;
  /** Лаконичное описание справа (иногда hotkey hint). */
  hint?: string;
  /** Доп. термины для поиска (синонимы, тэги). */
  keywords?: string[];
  /** Секция для группировки списка. */
  section?: string;
  /** Отключённые команды остаются видимыми, но не исполняются. */
  disabled?: boolean;
  onRun: () => void;
}

const HOTKEY_KEY = "k";

/**
 * Глобальный hotkey Cmd+K / Ctrl+K. onOpen вызывается только если focus не
 * внутри input/textarea/contenteditable — чтобы не перехватить «искать
 * по полю».
 */
export function useCmdKListener(onOpen: () => void) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key !== HOTKEY_KEY) return;
      if (!(e.metaKey || e.ctrlKey)) return;
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        if (target.isContentEditable) return;
      }
      e.preventDefault();
      onOpen();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpen]);
}

/**
 * Фильтрация и ранжирование команд по query. Пустой query → исходный
 * порядок, никаких «топ-команд» не выдумывается.
 *
 * Scoring (lower = лучше):
 *   0 — label начинается с query
 *   1 — label содержит query
 *   2 — keyword начинается с query
 *   3 — keyword содержит query
 *   Infinity — не совпадает, исключено.
 *
 * Стабильная сортировка: при равенстве score сохраняется индекс входа.
 */
export function filterCommands(
  commands: Command[],
  query: string,
): Command[] {
  const q = query.trim().toLowerCase();
  if (!q) return commands;

  const scored = commands.map((cmd, index) => {
    const label = cmd.label.toLowerCase();
    let score = Number.POSITIVE_INFINITY;
    if (label.startsWith(q)) score = 0;
    else if (label.includes(q)) score = 1;
    if (cmd.keywords) {
      for (const kw of cmd.keywords) {
        const kwl = kw.toLowerCase();
        if (kwl.startsWith(q)) score = Math.min(score, 2);
        else if (kwl.includes(q)) score = Math.min(score, 3);
      }
    }
    return { cmd, index, score };
  });

  return scored
    .filter((s) => Number.isFinite(s.score))
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .map((s) => s.cmd);
}

/**
 * Группировка фильтрованного списка команд по `section`. Без `section`
 * идут под ключом `__default`, их потом рендерим без заголовка.
 */
export function groupCommands(
  commands: Command[],
): Array<{ section: string | null; items: Command[] }> {
  const buckets = new Map<string | null, Command[]>();
  for (const cmd of commands) {
    const key = cmd.section ?? null;
    const arr = buckets.get(key);
    if (arr) arr.push(cmd);
    else buckets.set(key, [cmd]);
  }
  return Array.from(buckets.entries()).map(([section, items]) => ({
    section,
    items,
  }));
}
