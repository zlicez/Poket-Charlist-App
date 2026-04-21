import { Maximize2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { cn } from "@/lib/utils";
import { Button } from "@/ds/primitives";
import { typeClass } from "@/ds/tokens";
import { RichTextContent } from "@/components/RichTextContent";

/**
 * S-06 — заметки. Handoff README §Rich-text pattern:
 *   «Любое длинное freeform-поле: Текст / Предпросмотр tabs + кнопка
 *   fullscreen. Не добавляем WYSIWYG — только markdown.»
 *
 * Переиспользует существующий RichTextContent (markdown-render) из legacy,
 * textarea — нативный. Debounced save — через prop onChange (character-state
 * hook дебаунсит 500ms).
 *
 * Не используем legacy RichTextField — он на shadcn Tabs/Dialog, хочется
 * DS-native реализацию.
 */

export interface NotesEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
  className?: string;
}

type Mode = "text" | "preview";

export function NotesEditor({
  value,
  onChange,
  label = "Заметки",
  placeholder = "## Сессия…",
  rows = 8,
  className,
}: NotesEditorProps) {
  const [mode, setMode] = useState<Mode>("text");
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "rounded-ds-md border border-ink-200 bg-paper-card overflow-hidden",
          className,
        )}
      >
        <div className="flex items-center gap-2 px-3 py-2 border-b border-ink-100 bg-paper-2">
          <div className={cn(typeClass("label"), "text-ink-500")}>{label}</div>
          <TabSwitch mode={mode} onChange={setMode} className="ml-auto" />
          <Button
            variant="icon"
            size="sm"
            onClick={() => setFullscreen(true)}
            aria-label="Открыть на весь экран"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>

        {mode === "text" ? (
          <TextareaShell
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
          />
        ) : (
          <PreviewShell value={value} />
        )}
        <div className={cn(typeClass("caption"), "px-3 py-1.5 text-ink-500 bg-paper-2 border-t border-ink-100")}>
          Поддерживаются Markdown и безопасный HTML.
        </div>
      </div>

      <FullscreenDialog
        open={fullscreen}
        onOpenChange={setFullscreen}
        label={label}
        value={value}
        onChange={onChange}
        mode={mode}
        onModeChange={setMode}
        placeholder={placeholder}
      />
    </>
  );
}

function TabSwitch({
  mode,
  onChange,
  className,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Режим заметок"
      className={cn("inline-flex items-center bg-ink-100 rounded-full p-[2px]", className)}
    >
      {(["text", "preview"] as const).map((m) => (
        <button
          key={m}
          type="button"
          role="tab"
          aria-selected={mode === m}
          onClick={() => onChange(m)}
          className={cn(
            "px-2.5 py-[3px] rounded-full text-[11px] font-medium font-ds-sans",
            "transition-all duration-[180ms]",
            "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ruby-bg",
            mode === m ? "bg-ink-900 text-paper" : "text-ink-500 hover:text-ink-700",
          )}
        >
          {m === "text" ? "Текст" : "Предпросмотр"}
        </button>
      ))}
    </div>
  );
}

function TextareaShell({
  value,
  onChange,
  placeholder,
  rows,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn(
        "w-full font-ds-mono text-[13px] text-ink-900 bg-paper-card",
        "px-3 py-3 resize-y outline-none",
        "placeholder:text-ink-400",
        "focus:bg-paper-2",
      )}
    />
  );
}

function PreviewShell({ value }: { value: string }) {
  return (
    <div className="px-3 py-3 min-h-[120px] bg-paper-card">
      {value.trim() ? (
        <RichTextContent content={value} className="text-[14px] leading-[22px] text-ink-700" />
      ) : (
        <div className={cn(typeClass("body-sm"), "text-ink-400 italic")}>
          Заметок пока нет.
        </div>
      )}
    </div>
  );
}

function FullscreenDialog({
  open,
  onOpenChange,
  label,
  value,
  onChange,
  mode,
  onModeChange,
  placeholder,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  value: string;
  onChange: (v: string) => void;
  mode: Mode;
  onModeChange: (m: Mode) => void;
  placeholder?: string;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-ink-900/70",
            "motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0",
            "motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:fade-out-0",
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-0 z-50 flex flex-col bg-paper text-ink-900 font-ds-sans",
            "motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0",
            "motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:fade-out-0",
          )}
        >
          <DialogPrimitive.Title asChild>
            <header className="flex items-center gap-2 px-4 py-3 border-b border-ink-200 bg-paper-2 flex-shrink-0">
              <div className="flex-1 font-ds-sans text-[14px] font-semibold">{label}</div>
              <TabSwitch mode={mode} onChange={onModeChange} />
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                Готово
              </Button>
            </header>
          </DialogPrimitive.Title>
          <div className="flex-1 overflow-auto">
            {mode === "text" ? (
              <TextareaShell
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={20}
                autoFocus
              />
            ) : (
              <PreviewShell value={value} />
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
