import { cn } from "@/lib/utils";

export function AbilityBonusChip({
  label,
  selected,
  disabled,
  onClick,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-40",
        selected
          ? "border-accent bg-accent/12 text-foreground shadow-sm"
          : "border-border bg-background text-muted-foreground hover:border-accent/40 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
