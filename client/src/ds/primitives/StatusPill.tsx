import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * DS StatusPill. Handoff README §10 + styles.css .conn-pill.
 * Три состояния: saved (sage) / saving (gold pulse) / offline (ruby).
 * Живёт в top-right каждого main-экрана.
 */
const pillVariants = cva(
  [
    "inline-flex items-center gap-1.5 px-2 py-[3px]",
    "rounded-full text-[10.5px] font-ds-mono tracking-[0.04em]",
    "border transition-colors duration-150",
    "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ruby-bg",
  ].join(" "),
  {
    variants: {
      state: {
        saved: "bg-sage-bg text-sage border-sage-soft",
        saving: "bg-gold-bg text-gold border-gold-soft",
        offline: "bg-ruby-bg text-ruby border-ruby-soft",
      },
    },
    defaultVariants: { state: "saved" },
  },
);

const dotVariants = cva("w-2 h-2 rounded-full shrink-0", {
  variants: {
    state: {
      saved: "bg-sage",
      saving: "bg-gold animate-pulse",
      offline: "bg-ruby",
    },
  },
  defaultVariants: { state: "saved" },
});

export interface StatusPillProps
  extends Omit<React.HTMLAttributes<HTMLButtonElement>, "children">,
    VariantProps<typeof pillVariants> {
  pendingCount?: number;
  label?: string;
  /** Если передан — pill рендерится как button (кликабельный). */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const DEFAULT_LABELS: Record<"saved" | "saving" | "offline", string> = {
  saved: "Сохранено",
  saving: "Сохраняем…",
  offline: "Оффлайн",
};

export const StatusPill = forwardRef<HTMLButtonElement, StatusPillProps>(
  ({ state = "saved", label, pendingCount, className, onClick, ...props }, ref) => {
    const effectiveState = state ?? "saved";
    const text =
      label ??
      (effectiveState === "offline" && pendingCount && pendingCount > 0
        ? `Оффлайн · ${pendingCount} в очереди`
        : DEFAULT_LABELS[effectiveState]);

    const content = (
      <>
        <span className={dotVariants({ state: effectiveState })} aria-hidden />
        <span>{text}</span>
      </>
    );

    if (onClick) {
      return (
        <button
          ref={ref}
          type="button"
          onClick={onClick}
          className={cn(
            pillVariants({ state: effectiveState }),
            "cursor-pointer active:scale-[0.98]",
            className,
          )}
          {...props}
        >
          {content}
        </button>
      );
    }

    return (
      <span
        className={cn(pillVariants({ state: effectiveState }), className)}
        aria-live="polite"
      >
        {content}
      </span>
    );
  },
);
StatusPill.displayName = "StatusPill";

export { pillVariants as statusPillVariants };
