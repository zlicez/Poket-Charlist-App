import { cn } from "@/lib/utils";

/**
 * DS Die — компактный бейдж кубика. Handoff styles.css .die:
 * ромб 28×28 (transform rotate 45°), обратно повёрнутая цифра внутри.
 * Используется в dice palette, rest dialog, level-up screen.
 */
export type DieSides = 4 | 6 | 8 | 10 | 12 | 20;

export interface DieProps {
  sides: DieSides;
  value?: number | string;
  size?: number;
  variant?: "default" | "active" | "muted";
  className?: string;
}

const VARIANT_CLASS: Record<NonNullable<DieProps["variant"]>, string> = {
  default: "border-ink-900 bg-paper-card text-ink-900",
  active: "border-ruby bg-ruby-bg text-ruby",
  muted: "border-ink-300 bg-paper-2 text-ink-400",
};

export function Die({ sides, value, size = 28, variant = "default", className }: DieProps) {
  const display = value ?? sides;
  const outerStyle: React.CSSProperties = {
    width: size,
    height: size,
    transform: "rotate(45deg)",
  };

  return (
    <span
      aria-label={`d${sides}`}
      className={cn(
        "inline-flex items-center justify-center border-[1.5px] rounded-[4px]",
        "font-ds-mono font-bold",
        VARIANT_CLASS[variant],
        className,
      )}
      style={outerStyle}
    >
      <span
        style={{ transform: "rotate(-45deg)" }}
        className={cn(size <= 24 ? "text-[9px]" : size <= 32 ? "text-[10px]" : "text-[12px]")}
      >
        {display}
      </span>
    </span>
  );
}
