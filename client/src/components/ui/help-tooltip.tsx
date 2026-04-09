import * as React from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HelpTooltipProps {
  /** Содержимое тултипа (JSX или строка) */
  content: React.ReactNode;
  /** Дочерний элемент — на десктопе становится триггером hover */
  children?: React.ReactNode;
  /** Сторона на десктопе */
  side?: "top" | "bottom" | "left" | "right";
  /** Выравнивание на десктопе */
  align?: "start" | "center" | "end";
  /** Размер иконки ⓘ на мобайле: xs=14px, sm=16px */
  iconSize?: "xs" | "sm";
  /** Дополнительные классы на иконку ⓘ */
  iconClassName?: string;
  /** На десктопе: обернуть children как TooltipTrigger (hover по children) */
  asChild?: boolean;
  /** На мобайле: children — триггер Popover по тапу (без иконки ⓘ) */
  mobileAsChild?: boolean;
}

/**
 * Унифицированный компонент подсказок.
 * Desktop (≥640px): Radix Tooltip на hover.
 * Mobile (<640px): иконка ⓘ + Radix Popover на tap.
 */
export function HelpTooltip({
  content,
  children,
  side = "top",
  align = "start",
  iconSize = "xs",
  iconClassName,
  asChild = false,
  mobileAsChild = false,
}: HelpTooltipProps) {
  const isDesktop = useMediaQuery("(min-width: 640px)");

  const iconSizeClass = iconSize === "xs" ? "w-3.5 h-3.5" : "w-4 h-4";

  if (isDesktop) {
    // ── Desktop: hover Tooltip ──────────────────────────────────────────────
    if (asChild && children) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{children}</TooltipTrigger>
          <TooltipContent side={side} align={align} className="max-w-[280px]">
            {content}
          </TooltipContent>
        </Tooltip>
      );
    }

    // Когда нет children — рендерим иконку ⓘ как триггер (inline-help стиль)
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center justify-center cursor-help text-muted-foreground/60 hover:text-muted-foreground transition-colors shrink-0",
              iconSizeClass,
              iconClassName
            )}
            aria-label="Подсказка"
          >
            <Info className={iconSizeClass} />
          </span>
        </TooltipTrigger>
        <TooltipContent side={side} align={align} className="max-w-[280px]">
          {content}
        </TooltipContent>
      </Tooltip>
    );
  }

  // ── Mobile: mobileAsChild — children сами являются триггером ─────────────
  if (mobileAsChild && children) {
    return (
      <Popover>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent
          side="top"
          align="start"
          sideOffset={6}
          collisionPadding={12}
          className="w-auto max-w-[260px] p-3 text-sm"
        >
          {content}
        </PopoverContent>
      </Popover>
    );
  }

  // ── Mobile: tap Popover ──────────────────────────────────────────────────
  return (
    <>
      {children}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center shrink-0 rounded-full text-muted-foreground/50 active:text-accent transition-colors",
              iconSizeClass,
              iconClassName
            )}
            aria-label="Подсказка"
          >
            <Info className={iconSizeClass} />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="start"
          sideOffset={6}
          collisionPadding={12}
          className="w-auto max-w-[260px] p-3 text-sm"
        >
          {content}
        </PopoverContent>
      </Popover>
    </>
  );
}

/**
 * Стандартный формат контента тултипа — заголовок + список строк.
 * Используется вместе с константами из tooltip-content.ts.
 */
export function TooltipBody({
  title,
  lines,
}: {
  title: string;
  lines: string[];
}) {
  return (
    <div className="space-y-1">
      <p className="font-medium text-sm">{title}</p>
      <ul className="space-y-0.5">
        {lines.map((line, i) => (
          <li key={i} className="text-xs text-muted-foreground leading-snug">
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
