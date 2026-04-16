import type { WeaponGripMode } from "@shared/schema";
import { cn } from "@/lib/utils";
import { WEAPON_GRIP_LABELS } from "@/lib/weapons";

interface WeaponGripToggleProps {
  value: WeaponGripMode;
  onChange: (value: WeaponGripMode) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "xs";
  testIdPrefix?: string;
}

export function WeaponGripToggle({
  value,
  onChange,
  disabled = false,
  className,
  size = "sm",
  testIdPrefix = "weapon-grip",
}: WeaponGripToggleProps) {
  const buttonClassName =
    size === "xs"
      ? "h-7 min-w-[66px] px-2 text-[11px]"
      : "h-8 min-w-[74px] px-2.5 text-xs";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-border bg-muted/40 p-0.5",
        className,
      )}
      role="group"
      aria-label="Хват оружия"
    >
      {(["oneHand", "twoHand"] as const).map((gripMode) => {
        const isActive = value === gripMode;

        return (
          <button
            key={gripMode}
            type="button"
            disabled={disabled}
            onClick={() => onChange(gripMode)}
            className={cn(
              "rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              buttonClassName,
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-pressed={isActive}
            data-testid={`${testIdPrefix}-${gripMode}`}
          >
            {WEAPON_GRIP_LABELS[gripMode]}
          </button>
        );
      })}
    </div>
  );
}
