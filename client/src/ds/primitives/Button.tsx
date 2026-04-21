import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * DS Button. Handoff README §8:
 *  primary : ink-900 фон + paper текст
 *  ruby    : ruby фон + белый текст (деструктив / HP)
 *  outline : paper-card + ink-300 border + ink-900 текст
 *  ghost   : transparent + ink-700 текст
 *  icon    : 30×30 / 44×44 circle, ghost
 *
 * Sizes: sm (30px), md (default 40px), lg (44px CTA).
 * Tap-target: md/lg ≥44px — handoff требует 44×44 минимум в play-mode.
 *
 * Focus ring: 3px ruby-bg + border ruby — общий pattern ДС.
 * Tap scale: 0.98, 80ms ease-out.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-1.5 font-medium font-ds-sans",
    "border border-transparent transition-all duration-150",
    "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ruby-bg focus-visible:border-ruby",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
    "active:scale-[0.98]",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: "bg-ink-900 text-paper-2 hover:bg-ink-800",
        ruby: "bg-ruby text-white hover:bg-ruby/90",
        outline:
          "bg-paper-card text-ink-900 border-ink-200 hover:border-ink-400 hover:shadow-ds-1",
        ghost: "bg-transparent text-ink-700 hover:bg-ink-100",
        icon: "bg-transparent text-ink-700 hover:bg-ink-100 rounded-full p-0",
      },
      size: {
        sm: "h-[30px] px-3 text-[12.5px] rounded-ds-sm",
        md: "h-10 px-4 text-[13.5px] rounded-ds-md",
        lg: "h-11 px-5 text-[14px] rounded-ds-md",
      },
    },
    compoundVariants: [
      // Icon size overrides — circular, fixed square.
      { variant: "icon", size: "sm", class: "h-8 w-8 p-0 rounded-full" },
      { variant: "icon", size: "md", class: "h-10 w-10 p-0 rounded-full" },
      { variant: "icon", size: "lg", class: "h-11 w-11 p-0 rounded-full" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
