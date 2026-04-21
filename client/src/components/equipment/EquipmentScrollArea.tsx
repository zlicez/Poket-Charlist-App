import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export function EquipmentScrollArea({
  children,
  className,
  contentClassName,
}: {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <ScrollArea
      className={cn("equipment-scroll-area", className)}
      viewportClassName="equipment-scroll-viewport overscroll-contain touch-pan-y"
      scrollbarClassName="equipment-scrollbar"
      thumbClassName="equipment-scrollbar-thumb"
    >
      <div className={cn("pr-3", contentClassName)}>{children}</div>
    </ScrollArea>
  );
}
