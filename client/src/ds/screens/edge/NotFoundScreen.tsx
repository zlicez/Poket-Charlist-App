import { useLocation } from "wouter";

import { cn } from "@/lib/utils";
import { typeClass } from "@/ds/tokens";
import { Button } from "@/ds/primitives";

/**
 * X-06 — 404 / персонаж не найден. Handoff 03-screens.jsx:
 *   [big serif «404» ink-300] [«Этот персонаж не существует»]
 *   [copy] [primary «К списку персонажей»]
 *
 * Используется одновременно как (а) fallback роут DS-дерева (неизвестный url),
 * (б) inline-state на CharacterScreen при 404/410 от `/api/characters/:id`.
 */
export function NotFoundScreen({
  title = "Этот персонаж не существует",
  description = "Возможно, лист удалён или ссылка устарела.",
  cta = "К списку персонажей",
  onCta,
}: {
  title?: string;
  description?: string;
  cta?: string;
  onCta?: () => void;
}) {
  const [, setLocation] = useLocation();
  const handleCta = () => {
    if (onCta) onCta();
    else setLocation("/");
  };

  return (
    <div
      className="min-h-screen bg-paper flex items-center justify-center px-6"
      data-testid="not-found-screen"
    >
      <div className="text-center max-w-[360px]">
        <div
          className={cn(
            "font-ds-serif text-[64px] leading-none font-medium text-ink-300",
          )}
          aria-hidden
        >
          404
        </div>
        <h1
          className={cn(
            "font-ds-serif text-[22px] font-medium text-ink-900 mt-3",
          )}
        >
          {title}
        </h1>
        <p className={cn(typeClass("body-sm"), "text-ink-600 mt-2")}>
          {description}
        </p>
        <Button
          variant="primary"
          size="lg"
          className="mt-5 min-w-[220px]"
          onClick={handleCta}
          data-testid="not-found-cta"
        >
          {cta}
        </Button>
      </div>
    </div>
  );
}
