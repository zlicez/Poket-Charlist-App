import type { PlayMode } from "@shared/schema";

import { cn } from "@/lib/utils";

/**
 * DS PlayEditPill — segmented control в header'е. Handoff 03-screens.jsx:
 *   [Play] [Edit]  — ink-900 background на active, ink-500 на inactive
 *
 * Персистится в character.ui_state.mode (см. usePlayMode).
 * Smoooth transition 180ms per handoff motion table.
 */

export interface PlayEditPillProps {
  value: PlayMode;
  onChange: (next: PlayMode) => void;
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<PlayEditPillProps["size"]>, {
  container: string;
  segment: string;
}> = {
  sm: {
    container: "p-[2px] text-[10.5px]",
    segment: "px-2.5 py-[3px] rounded-full",
  },
  md: {
    container: "p-[3px] text-[11px]",
    segment: "px-3 py-1 rounded-full",
  },
};

export function PlayEditPill({
  value,
  onChange,
  size = "md",
  disabled,
  className,
}: PlayEditPillProps) {
  const sizing = SIZE_CLASS[size];

  return (
    <div
      role="tablist"
      aria-label="Режим: Play или Edit"
      className={cn(
        "inline-flex items-center bg-ink-100 rounded-full",
        sizing.container,
        disabled && "opacity-60 pointer-events-none",
        className,
      )}
    >
      {(["play", "edit"] as const).map((mode) => {
        const active = value === mode;
        return (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={active}
            aria-disabled={disabled}
            onClick={() => !disabled && onChange(mode)}
            className={cn(
              "font-ds-sans font-semibold transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ruby-bg",
              sizing.segment,
              active
                ? "bg-ink-900 text-paper"
                : "text-ink-500 hover:text-ink-700",
            )}
            data-testid={`play-edit-${mode}`}
          >
            {mode === "play" ? "Play" : "Edit"}
          </button>
        );
      })}
    </div>
  );
}
