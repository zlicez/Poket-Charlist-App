import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * DS Chip. Handoff §6:
 *  default  : paper-card bg + ink-200 border + ink-700 text
 *  active   : ink-900 bg + paper text
 *  ruby/gold/sage/ocean/violet : *-bg + * text + *-soft border
 *
 * Padding 5/10, radius 999 (full pill), font mono 12px.
 * Рендерится как <button> если передан onClick, иначе как <span>.
 */
const chipVariants = cva(
  [
    "inline-flex items-center gap-1 px-2.5 py-[5px]",
    "rounded-full text-[12px] font-medium font-ds-mono",
    "border transition-colors duration-150",
    "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ruby-bg",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-paper-card border-ink-200 text-ink-700 hover:border-ink-400",
        active: "bg-ink-900 border-ink-900 text-paper",
        ruby: "bg-ruby-bg border-ruby-soft text-ruby",
        gold: "bg-gold-bg border-gold-soft text-gold",
        sage: "bg-sage-bg border-sage-soft text-sage",
        ocean: "bg-ocean-bg border-ocean-soft text-ocean",
        violet: "bg-violet-bg border-violet text-violet",
      },
      interactive: {
        true: "cursor-pointer active:scale-[0.98]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      interactive: false,
    },
  },
);

type ChipBaseProps = VariantProps<typeof chipVariants> & {
  className?: string;
  children?: React.ReactNode;
};

export type ChipProps =
  | (ChipBaseProps & {
      onClick?: undefined;
      as?: "span";
    })
  | (ChipBaseProps &
      React.ButtonHTMLAttributes<HTMLButtonElement> & {
        onClick: React.MouseEventHandler<HTMLButtonElement>;
      });

export const Chip = forwardRef<HTMLElement, ChipProps>((props, ref) => {
  const { variant, className, children, ...rest } = props as ChipBaseProps &
    Partial<React.ButtonHTMLAttributes<HTMLButtonElement>>;
  const isInteractive = Boolean(rest.onClick);

  if (isInteractive) {
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={cn(chipVariants({ variant, interactive: true }), className)}
        {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  }
  return (
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      className={cn(chipVariants({ variant, interactive: false }), className)}
    >
      {children}
    </span>
  );
});
Chip.displayName = "Chip";

export { chipVariants };
