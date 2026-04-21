export const FEATURE_FLAGS = {
  newDesignSystem: import.meta.env.VITE_NEW_DS === "true",
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;
