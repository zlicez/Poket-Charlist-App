import { useRef } from "react";

import { cn } from "@/lib/utils";
import { Sidebar, type SidebarSection } from "./Sidebar";

/**
 * DS DesktopShell — 3-колонная раскладка + sticky sidebar.
 * Handoff 03-screens.jsx DesktopScreen.
 *
 * Layout:
 *   [sidebar 200px] [column L — identity] [column M — combat] [column R — content]
 *
 * Колонки передаются через props.left / center / right. Каждая — обычно
 * стек карточек. Секции получают id (data-scroll-section) для scroll-spy.
 */

export interface DesktopShellProps {
  characterId: string;
  characterName?: string;
  subtitle?: string;
  avatar?: React.ReactNode;
  sections: SidebarSection[];
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
  onShare?: () => void;
  onExport?: () => void;
  className?: string;
}

export function DesktopShell({
  characterId,
  characterName,
  subtitle,
  avatar,
  sections,
  left,
  center,
  right,
  onShare,
  onExport,
  className,
}: DesktopShellProps) {
  const scrollRootRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={scrollRootRef}
      className={cn(
        "min-h-dvh bg-paper text-ink-900 font-ds-sans",
        "p-4",
        className,
      )}
    >
      <div className="grid gap-4 max-w-[1480px] mx-auto" style={{ gridTemplateColumns: "200px 1fr" }}>
        <Sidebar
          characterId={characterId}
          characterName={characterName}
          subtitle={subtitle}
          avatar={avatar}
          sections={sections}
          scrollRootRef={scrollRootRef}
          onShare={onShare}
          onExport={onExport}
        />
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          <div className="space-y-3 min-w-0">{left}</div>
          <div className="space-y-3 min-w-0">{center}</div>
          <div className="space-y-3 min-w-0">{right}</div>
        </div>
      </div>
    </div>
  );
}
