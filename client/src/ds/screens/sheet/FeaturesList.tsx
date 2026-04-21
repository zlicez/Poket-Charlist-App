import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { typeClass } from "@/ds/tokens";
import { Tag } from "@/ds/primitives";
import type { Feature } from "@shared/schema";

/**
 * S-07 — features list. Accordion — tap на ряд раскрывает описание.
 * Markdown не рендерим здесь (описания plain-text в модели); если нужен
 * rich — подключим RichTextContent в Phase I polish.
 */
export function FeaturesList({ features }: { features: Feature[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (features.length === 0) {
    return (
      <div className="rounded-ds-md border border-dashed border-ink-300 p-5 text-center">
        <div className={cn(typeClass("body-sm"), "text-ink-500")}>
          Способностей пока нет. Добавь их в edit-mode.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-ds-md border border-ink-200 bg-paper-card overflow-hidden">
      {features.map((f, i) => {
        const isOpen = openId === f.id;
        return (
          <div
            key={f.id}
            className={cn(i < features.length - 1 && "border-b border-ink-100")}
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : f.id)}
              aria-expanded={isOpen}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5",
                "text-left transition-colors duration-150",
                "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ruby-bg",
                "hover:bg-paper-2 active:bg-ink-100",
              )}
              data-testid={`feature-row-${f.id}`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-ds-sans text-[13.5px] font-semibold text-ink-900 truncate">
                  {f.name}
                </div>
                {f.source && (
                  <div className={cn(typeClass("code"), "text-ink-500 truncate mt-0.5")}>
                    {f.source}
                  </div>
                )}
              </div>
              {f.source && (
                <Tag variant="ocean" className="shrink-0">
                  {sourceBadge(f.source)}
                </Tag>
              )}
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-ink-400 shrink-0 transition-transform duration-200",
                  isOpen && "rotate-180",
                )}
              />
            </button>

            {isOpen && (
              <div className="px-3 pb-3 pt-1 bg-paper-2">
                <p className={cn(typeClass("body-sm"), "text-ink-700 whitespace-pre-wrap")}>
                  {f.description || "Описание отсутствует."}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Короткий бейдж: первое слово источника (класс / раса / background). */
function sourceBadge(source: string): string {
  const first = source.split(/[\s:]/)[0];
  return first.length > 10 ? first.slice(0, 10) + "…" : first;
}
