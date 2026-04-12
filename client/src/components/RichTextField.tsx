import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Maximize2 } from "lucide-react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";

import { RichTextContent } from "@/components/RichTextContent";

interface RichTextFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  textareaClassName?: string;
  previewContainerClassName?: string;
  contentClassName?: string;
  helperText?: string;
  textareaTestId?: string;
  previewTestId?: string;
  /** Label shown in fullscreen dialog title */
  label?: string;
}

export function RichTextField({
  value,
  onChange,
  placeholder,
  rows = 4,
  className,
  textareaClassName,
  previewContainerClassName,
  contentClassName,
  helperText = "Поддерживаются Markdown и безопасный HTML.",
  textareaTestId,
  previewTestId,
  label,
}: RichTextFieldProps) {
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  return (
    <>
      <div className={cn("flex flex-col gap-2", className)}>
        <Tabs defaultValue="text" className="flex flex-1 flex-col">
          <TabsList className="grid w-full grid-cols-2 overflow-hidden">
            <TabsTrigger value="text" className="text-xs">
              Текст
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs">
              Предпросмотр
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="flex-1">
            <div style={{ position: "relative" }}>
              <Textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                rows={rows}
                className={cn("resize-none text-sm", textareaClassName)}
                data-testid={textareaTestId}
              />
              {/* Expand button — overlays bottom-right of textarea */}
              <button
                type="button"
                onClick={() => setFullscreenOpen(true)}
                aria-label="Развернуть редактор"
                style={{
                  position: "absolute",
                  bottom: 6,
                  right: 6,
                  zIndex: 10,
                }}
                className="flex items-center justify-center h-6 w-6 rounded text-muted-foreground/70 hover:text-foreground bg-background/70 hover:bg-background transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1">
            <div
              className={cn(
                "rounded-md border border-border/70 bg-muted/20 p-3",
                previewContainerClassName,
              )}
              data-testid={previewTestId}
            >
              <RichTextContent
                content={value}
                className={contentClassName}
                emptyState="Пока нечего показывать."
              />
            </div>
          </TabsContent>
        </Tabs>

        <p className="tx-l4">{helperText}</p>
      </div>

      {/* ── Fullscreen editor modal ── */}
      <ResponsiveDialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <ResponsiveDialogContent className="sm:max-w-2xl sm:h-[80vh] flex flex-col">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>
              {label ?? "Редактор"}
            </ResponsiveDialogTitle>
          </ResponsiveDialogHeader>

          <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
            <Tabs defaultValue="text" className="flex flex-1 flex-col min-h-0">
              <TabsList className="grid w-full grid-cols-2 overflow-hidden flex-shrink-0">
                <TabsTrigger value="text" className="text-xs">
                  Текст
                </TabsTrigger>
                <TabsTrigger value="preview" className="text-xs">
                  Предпросмотр
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="flex-1 min-h-0">
                <Textarea
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  className="resize-none text-sm h-full w-full min-h-[300px] sm:min-h-0"
                  data-testid={textareaTestId ? `${textareaTestId}-fullscreen` : undefined}
                  autoFocus
                />
              </TabsContent>

              <TabsContent value="preview" className="flex-1 min-h-0 overflow-y-auto">
                <div className="rounded-md border border-border/70 bg-muted/20 p-3 h-full min-h-[300px] sm:min-h-0">
                  <RichTextContent
                    content={value}
                    emptyState="Пока нечего показывать."
                  />
                </div>
              </TabsContent>
            </Tabs>

            <p className="tx-l4 flex-shrink-0">{helperText}</p>
          </div>

          <ResponsiveDialogFooter>
            <Button size="sm" onClick={() => setFullscreenOpen(false)}>
              Готово
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </>
  );
}
