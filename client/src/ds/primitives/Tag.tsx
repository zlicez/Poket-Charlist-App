import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * DS Tag. Handoff §7:
 *  default  : ink-100 bg + ink-600 text
 *  ruby/gold/sage/ocean/violet : *-bg + * text
 *
 * Tag = мини-бейдж («core», «shared», «ритуал», «К» для концентрации).
 * font: mono 9.5px 600, padding 2/6, radius 4px.
 */
const tagVariants = cva(
  [
    "inline-flex items-center gap-1 px-1.5 py-[2px]",
    "rounded text-[9.5px] font-semibold font-ds-mono uppercase tracking-[0.04em]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-ink-100 text-ink-600",
        ruby: "bg-ruby-bg text-ruby",
        gold: "bg-gold-bg text-gold",
        sage: "bg-sage-bg text-sage",
        ocean: "bg-ocean-bg text-ocean",
        violet: "bg-violet-bg text-violet",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface TagProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tagVariants> {}

export const Tag = forwardRef<HTMLSpanElement, TagProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(tagVariants({ variant }), className)}
      {...props}
    />
  ),
);
Tag.displayName = "Tag";

export { tagVariants };
