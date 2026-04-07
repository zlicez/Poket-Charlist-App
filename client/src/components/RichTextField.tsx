import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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
}: RichTextFieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Tabs defaultValue="text" className="flex flex-1 flex-col">
        <TabsList className="grid h-8 w-full grid-cols-2 self-start">
          <TabsTrigger value="text" className="text-xs">
            Текст
          </TabsTrigger>
          <TabsTrigger value="preview" className="text-xs">
            Предпросмотр
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="flex-1">
          <Textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            rows={rows}
            className={cn("resize-none text-sm", textareaClassName)}
            data-testid={textareaTestId}
          />
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
  );
}
