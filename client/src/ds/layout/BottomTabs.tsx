import { Link, useRoute } from "wouter";
import { Backpack, BookOpen, Scroll, Sword } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * DS BottomTabs — 4-табная mobile IA. Handoff 03-screens.jsx:
 *   ⚔ Бой  ❖ Лист  ✦ Магия  ◈ Сумка
 * README указывает заменить Unicode на Lucide:
 *   Sword, Scroll, Sparkles (→ BookOpen для магии, лучше семантически), Backpack
 *
 * Active: ruby text + font-semibold; inactive: ink-500.
 * Safe-area: padding-bottom 22px (iOS home indicator).
 */

export const TAB_IDS = ["combat", "sheet", "spells", "bag"] as const;
export type TabId = (typeof TAB_IDS)[number];

interface TabDescriptor {
  id: TabId;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabDescriptor[] = [
  { id: "combat", label: "Бой", Icon: Sword },
  { id: "sheet", label: "Лист", Icon: Scroll },
  { id: "spells", label: "Магия", Icon: BookOpen },
  { id: "bag", label: "Сумка", Icon: Backpack },
];

export interface BottomTabsProps {
  characterId: string;
  /** Скрыть таб «Магия» для не-кастеров. */
  showSpells?: boolean;
  className?: string;
}

function TabButton({
  tab,
  characterId,
}: {
  tab: TabDescriptor;
  characterId: string;
}) {
  const [isActive] = useRoute(`/character/${characterId}/${tab.id}`);
  const Icon = tab.Icon;

  return (
    <Link
      href={`/character/${characterId}/${tab.id}`}
      className={cn(
        "flex flex-col items-center gap-0.5 py-2 min-h-[44px]",
        "transition-colors duration-150",
        "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ruby-bg rounded-ds-sm",
        isActive ? "text-ruby" : "text-ink-500",
      )}
      aria-current={isActive ? "page" : undefined}
      data-testid={`tab-${tab.id}`}
    >
      <Icon className="w-[18px] h-[18px]" />
      <span
        className={cn(
          "text-[10.5px]",
          isActive ? "font-semibold" : "font-medium",
        )}
      >
        {tab.label}
      </span>
    </Link>
  );
}

export function BottomTabs({ characterId, showSpells = true, className }: BottomTabsProps) {
  const visibleTabs = TABS.filter((t) => showSpells || t.id !== "spells");

  return (
    <nav
      className={cn(
        "grid bg-paper-2 border-t border-ink-200",
        "pt-1.5 pb-[max(22px,env(safe-area-inset-bottom))] px-2",
        "flex-shrink-0",
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, 1fr)` }}
      aria-label="Основная навигация"
    >
      {visibleTabs.map((tab) => (
        <TabButton key={tab.id} tab={tab} characterId={characterId} />
      ))}
    </nav>
  );
}
