import { useState } from "react";

import { cn } from "@/lib/utils";
import { typeClass } from "@/ds/tokens";
import { BottomSheet } from "@/ds/hero";
import { Button, Tag } from "@/ds/primitives";
import { exportCharacterToJSON } from "@/lib/json-export";
import { exportCharacterToPDF } from "@/lib/pdf-export";
import { useToast } from "@/hooks/use-toast";
import type { Character } from "@shared/schema";

/**
 * X-03 — Export меню (JSON / PDF). Handoff + README §Risks:
 *   PDF-шаблон `charlist_blank.pdf` содержит AcroForm-поля, которые
 *   наш model не заполняет. UX должен честно предупреждать, какие
 *   поля останутся пустыми.
 *
 * MVP:
 *   JSON: полный экспорт через existing exportCharacterToJSON.
 *   PDF : existing exportCharacterToPDF + статичная подсказка.
 */
export function ExportMenuSheet({
  open,
  onOpenChange,
  character,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character | null;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState<"json" | "pdf" | null>(null);

  const handleJson = () => {
    if (!character) return;
    try {
      exportCharacterToJSON(character);
      toast({
        title: "JSON выгружен",
        description: "Файл сохранён в загрузки.",
      });
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Не удалось выгрузить JSON",
        description:
          err instanceof Error ? err.message : "Повторите попытку.",
        variant: "destructive",
      });
    }
  };

  const handlePdf = async () => {
    if (!character || busy) return;
    setBusy("pdf");
    try {
      await exportCharacterToPDF(character);
      toast({
        title: "PDF выгружен",
        description: "Проверьте незаполненные поля вручную.",
      });
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Не удалось выгрузить PDF",
        description:
          err instanceof Error ? err.message : "Повторите попытку.",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Экспорт"
      description={
        character
          ? `${character.name || "Персонаж"} — выгрузить копию листа.`
          : "Выгрузить копию листа."
      }
    >
      <div className="flex flex-col gap-2 mt-2">
        <ExportOption
          badge="JSON"
          title="Pocket Charlist JSON"
          description="Полный снимок листа. Подходит для импорта обратно и бэкапа."
          cta="Скачать JSON"
          onClick={handleJson}
          disabled={!character}
          testId="export-json"
        />
        <ExportOption
          badge="PDF"
          title="Стандартный лист 5e"
          description="На шаблон charlist_blank.pdf. Поля вне нашей схемы (языки, trinket, treasure) останутся пустыми — заполните от руки."
          cta={busy === "pdf" ? "Готовим PDF…" : "Скачать PDF"}
          onClick={handlePdf}
          disabled={!character || busy !== null}
          testId="export-pdf"
          tone="gold"
        />
      </div>

      <div className={cn(typeClass("caption"), "text-ink-500 mt-3")}>
        Шаринг ссылкой — отдельный пункт «Поделиться».
      </div>
    </BottomSheet>
  );
}

function ExportOption({
  badge,
  title,
  description,
  cta,
  onClick,
  disabled,
  testId,
  tone = "ocean",
}: {
  badge: string;
  title: string;
  description: string;
  cta: string;
  onClick: () => void;
  disabled?: boolean;
  testId: string;
  tone?: "ocean" | "gold";
}) {
  return (
    <div
      className={cn(
        "rounded-ds-md border border-ink-200 bg-paper-card p-3.5",
        "flex flex-col gap-2",
      )}
    >
      <div className="flex items-center gap-2">
        <Tag variant={tone}>{badge}</Tag>
        <div
          className={cn(
            typeClass("body"),
            "text-ink-900 font-semibold",
          )}
        >
          {title}
        </div>
      </div>
      <p
        className={cn(typeClass("body-sm"), "text-ink-600 leading-[1.4]")}
      >
        {description}
      </p>
      <Button
        variant="outline"
        size="md"
        onClick={onClick}
        disabled={disabled}
        data-testid={testId}
      >
        {cta}
      </Button>
    </div>
  );
}
