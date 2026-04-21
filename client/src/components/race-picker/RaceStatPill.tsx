import { HelpTooltip } from "@/components/ui/help-tooltip";

export function RaceStatPill({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: string;
  tooltip: string;
}) {
  return (
    <HelpTooltip
      content={<p className="text-xs max-w-[220px]">{tooltip}</p>}
      side="top"
      asChild
    >
      <div className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 cursor-help min-w-[68px]">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none">{label}</span>
        <span className="text-sm font-semibold leading-tight">{value}</span>
      </div>
    </HelpTooltip>
  );
}
