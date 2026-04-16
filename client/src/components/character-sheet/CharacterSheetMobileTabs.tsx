import type { ComponentType, ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type CharacterSheetMobileTabItem = {
  id: string;
  icon: ComponentType<{ className?: string }>;
  mobileLabel: string;
};

type CharacterSheetMobileTabsProps = {
  items: CharacterSheetMobileTabItem[];
  onValueChange: (value: string) => void;
  renderContent: (sectionId: string) => ReactNode;
  value: string;
};

export function CharacterSheetMobileTabs({
  items,
  onValueChange,
  renderContent,
  value,
}: CharacterSheetMobileTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={onValueChange}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2 tab-panel-mobile">
        {items.map((item) => (
          <TabsContent
            key={item.id}
            value={item.id}
            className="mt-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-150">
              {renderContent(item.id)}
            </div>
          </TabsContent>
        ))}
      </div>

      <nav
        aria-label="Навигация по персонажу"
        className="border-t bg-background/95 backdrop-blur bottom-tab-bar"
      >
        <TabsList className="flex h-[60px] w-full items-stretch gap-0 bg-transparent p-1 text-muted-foreground">
          {items.map(({ id, icon: Icon, mobileLabel }) => (
            <TabsTrigger
              key={id}
              value={id}
              data-testid={`tab-${id}`}
              className={cn(
                "group relative flex h-full flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 text-[9px] font-medium leading-none transition-colors",
                "text-muted-foreground hover:text-foreground",
                "data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
              )}
            >
              <span
                aria-hidden="true"
                className="absolute top-0 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-primary transition-all duration-200 group-data-[state=active]:w-6 w-0"
              />
              <Icon
                className={cn(
                  "h-[18px] w-[18px] transition-transform duration-200",
                  "group-data-[state=active]:scale-110",
                )}
              />
              <span className="max-w-full truncate">{mobileLabel}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </nav>
    </Tabs>
  );
}
