import { Link } from "wouter";
import { useMemo } from "react";

import { cn } from "@/lib/utils";
import { typeClass } from "@/ds/tokens";
import { Button } from "@/ds/primitives";
import { StatusPillLive } from "@/ds/screens/edge/StatusPillLive";
import { PlayEditPill } from "./PlayEditPill";
import { usePlayMode } from "@/ds/hooks/usePlayMode";
import { useScrollSpy } from "@/ds/hooks/useScrollSpy";

/**
 * DS Sidebar — desktop sticky nav. Handoff 03-screens.jsx desktop mock:
 *   [avatar + name + subtitle]
 *   [Play/Edit segmented]
 *   [section links — scroll-spy highlight]
 *   [divider]
 *   [Share] [Export]
 *
 * Scroll-spy через IntersectionObserver по data-scroll-section id'ам.
 * Tap по ссылке → scrollIntoView({ behavior: "smooth" }).
 */

export interface SidebarSection {
  id: string;
  label: string;
}

export interface SidebarProps {
  characterId: string;
  characterName?: string;
  subtitle?: string;
  avatar?: React.ReactNode;
  sections: SidebarSection[];
  scrollRootRef?: React.RefObject<HTMLElement>;
  onShare?: () => void;
  onExport?: () => void;
  className?: string;
}

export function Sidebar({
  characterId,
  characterName,
  subtitle,
  avatar,
  sections,
  scrollRootRef,
  onShare,
  onExport,
  className,
}: SidebarProps) {
  const { mode, setMode } = usePlayMode(characterId);
  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections]);

  const activeId = useScrollSpy({
    sectionIds,
    rootRef: scrollRootRef,
    topOffsetPx: 16,
  });

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <aside
      className={cn(
        "sticky top-3 w-[200px] shrink-0",
        "bg-paper-2 border border-ink-200 rounded-ds-md",
        "p-3.5 text-[13px]",
        className,
      )}
      aria-label="Навигация по секциям"
    >
      <div className="flex items-center gap-2.5 pb-3.5">
        {avatar}
        <div className="min-w-0">
          {characterName && (
            <div className="text-[13px] font-semibold text-ink-900 truncate">
              {characterName}
            </div>
          )}
          {subtitle && (
            <div className={cn(typeClass("caption"), "text-ink-500 tracking-[0.06em]")}>
              {subtitle}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pb-3">
        <PlayEditPill value={mode} onChange={setMode} size="sm" />
        <StatusPillLive />
      </div>

      <nav className="flex flex-col gap-0.5" aria-label="Разделы">
        {sections.map((s) => {
          const active = activeId === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollTo(s.id)}
              className={cn(
                "text-left px-2.5 py-1.5 rounded-ds-sm",
                "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ruby-bg",
                "transition-colors duration-150",
                active
                  ? "bg-ink-900 text-paper"
                  : "text-ink-700 hover:bg-ink-100",
              )}
              aria-current={active ? "true" : undefined}
            >
              {s.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-4 pt-3.5 border-t border-ink-200 space-y-1.5">
        {onShare && (
          <Button variant="outline" size="sm" onClick={onShare} className="w-full">
            ↗ Поделиться
          </Button>
        )}
        {onExport && (
          <Button variant="ghost" size="sm" onClick={onExport} className="w-full text-ink-500">
            ⇣ Экспорт JSON / PDF
          </Button>
        )}
        <Link href="/" className="block text-[11px] text-ink-500 hover:text-ocean text-center pt-1">
          ← К списку
        </Link>
      </div>
    </aside>
  );
}
