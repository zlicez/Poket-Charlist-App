/**
 * TS-представление design-tokens. Имена здесь обязаны совпадать с CSS-переменными
 * в ./tokens.css. Используются для типизации props'ов (variant-prop не должен
 * принимать строку вне этого enum'а).
 */

export const INK_STEPS = [
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
] as const;
export type InkStep = (typeof INK_STEPS)[number];

export const PAPER_SURFACES = ["paper", "paper-2", "paper-card"] as const;
export type PaperSurface = (typeof PAPER_SURFACES)[number];

export const SEMANTIC_COLORS = [
  "ruby",
  "gold",
  "sage",
  "ocean",
  "violet",
] as const;
export type SemanticColor = (typeof SEMANTIC_COLORS)[number];

export const SEMANTIC_SHADES = ["", "soft", "bg"] as const;
export type SemanticShade = (typeof SEMANTIC_SHADES)[number];

export const RADIUS_STEPS = ["sm", "md", "lg", "xl"] as const;
export type RadiusStep = (typeof RADIUS_STEPS)[number];

export const SHADOW_LEVELS = ["1", "2", "3"] as const;
export type ShadowLevel = (typeof SHADOW_LEVELS)[number];

export const FONT_FAMILIES = ["sans", "serif", "mono"] as const;
export type FontFamily = (typeof FONT_FAMILIES)[number];

/**
 * Type-scale per handoff. Keys — логические имена, value — Tailwind-класс
 * (комбинация font-family + size + weight + letter-spacing).
 * Используется компонентами через helper {@link typeClass}.
 */
export const TYPE_SCALE = {
  "display-xl":
    "font-ds-serif text-[56px] leading-[60px] font-medium tracking-[-0.02em]",
  "display-lg":
    "font-ds-serif text-[36px] leading-[40px] font-medium tracking-[-0.01em]",
  h1: "font-ds-serif text-[28px] leading-[1.1] font-medium tracking-[-0.01em]",
  h2: "font-ds-sans text-[18px] leading-[24px] font-semibold",
  "ability-mod": "font-ds-serif text-[40px] leading-none font-medium",
  "hp-current": "font-ds-serif text-[44px] leading-none font-medium",
  body: "font-ds-sans text-[15px] leading-[22px] font-normal",
  "body-sm": "font-ds-sans text-[13px] leading-[18px] font-normal",
  caption: "font-ds-sans text-[11px] leading-[16px] font-medium",
  label:
    "font-ds-mono text-[11px] leading-[16px] font-medium uppercase tracking-[0.1em]",
  code: "font-ds-mono text-[13px] leading-[18px] font-medium",
} as const;
export type TypeScaleKey = keyof typeof TYPE_SCALE;

export function typeClass(key: TypeScaleKey): string {
  return TYPE_SCALE[key];
}
