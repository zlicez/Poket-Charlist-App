import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

type CharacterSheetDesktopNavItem = {
  id: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
};

type CharacterSheetDesktopNavProps = {
  activeSectionId: string;
  items: CharacterSheetDesktopNavItem[];
  onSelectSection: (sectionId: string) => void;
  setNavElement: (element: HTMLElement | null) => void;
  stickyTop: number;
};

export function CharacterSheetDesktopNav({
  activeSectionId,
  items,
  onSelectSection,
  setNavElement,
  stickyTop,
}: CharacterSheetDesktopNavProps) {
  return (
    <nav
      ref={setNavElement}
      aria-label="Навигация по разделам персонажа"
      className="sticky z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85"
      data-testid="section-nav"
      style={{ top: `${stickyTop}px` }}
    >
      <div className="-mx-2 overflow-x-auto scrollbar-hide px-2 sm:mx-0 sm:px-0">
        <div className="flex min-w-max items-center gap-2 py-2">
          {items.map(({ id, icon: Icon, label }) => {
            const isActive = activeSectionId === id;

            return (
              <button
                key={id}
                type="button"
                aria-current={isActive ? "location" : undefined}
                data-active={isActive}
                data-testid={`nav-${id}`}
                className={cn(
                  "group inline-flex min-h-11 items-center gap-2.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-[background-color,border-color,color,box-shadow] duration-200",
                  "border-border/60 bg-background/80 text-muted-foreground shadow-sm shadow-black/5",
                  "hover:border-border hover:bg-muted/70 hover:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2",
                  "data-[active=true]:border-primary/20 data-[active=true]:bg-primary/[0.08] data-[active=true]:text-foreground data-[active=true]:shadow-md data-[active=true]:shadow-primary/10",
                )}
                onClick={() => onSelectSection(id)}
              >
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition-colors duration-200",
                    "group-hover:bg-background group-hover:text-foreground",
                    "group-data-[active=true]:bg-primary/15 group-data-[active=true]:text-primary",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
