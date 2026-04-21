import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { typeClass } from "@/ds/tokens";
import { StatusPill } from "@/ds/primitives";
import { BottomTabs } from "./BottomTabs";
import { PlayEditPill } from "./PlayEditPill";
import { usePlayMode } from "@/ds/hooks/usePlayMode";

/**
 * DS MobileShell — scroll-container с header'ом и 4-табной нижней навигацией.
 * Активный таб определяется URL'ом внутри BottomTabs (wouter useRoute).
 *
 * Layout (per handoff 03-screens.jsx .m-screen):
 *   [m-header  — back? avatar name/subtitle play-edit pill status-pill]
 *   [m-body    — scrollable content (дети)]
 *   [BottomTabs — 4 icons + labels + safe-area]
 */

export interface MobileShellProps {
  characterId: string;
  characterName?: string;
  subtitle?: string;
  avatar?: React.ReactNode;
  showSpellsTab?: boolean;
  /** Status pill state (saved/saving/offline + pendingCount). */
  status?: React.ComponentProps<typeof StatusPill>["state"];
  pendingCount?: number;
  children: React.ReactNode;
}

export function MobileShell({
  characterId,
  characterName,
  subtitle,
  avatar,
  showSpellsTab = true,
  status = "saved",
  pendingCount,
  children,
}: MobileShellProps) {
  const { mode, setMode } = usePlayMode(characterId);

  return (
    <div className="min-h-dvh flex flex-col bg-paper text-ink-900 font-ds-sans">
      <header
        className={cn(
          "flex items-center gap-2.5 px-3.5 py-2.5",
          "bg-paper-2 border-b border-ink-200",
          "flex-shrink-0",
        )}
      >
        <Link
          href="/"
          className="flex items-center justify-center w-8 h-8 rounded-full text-ink-700 hover:bg-ink-100 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ruby-bg"
          aria-label="К списку персонажей"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        {avatar}
        <div className="flex-1 min-w-0">
          {characterName && (
            <div className="font-ds-sans text-[14px] font-semibold text-ink-900 truncate">
              {characterName}
            </div>
          )}
          {subtitle && (
            <div className={cn(typeClass("label"), "text-ink-500 normal-case tracking-[0.08em]")}>
              {subtitle}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StatusPill state={status} pendingCount={pendingCount} />
          <PlayEditPill value={mode} onChange={setMode} size="sm" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>

      <BottomTabs characterId={characterId} showSpells={showSpellsTab} />
    </div>
  );
}
