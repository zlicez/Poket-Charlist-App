import { cn } from "@/lib/utils";
import { typeClass } from "@/ds/tokens";
import { Button, Tag } from "@/ds/primitives";

/**
 * X-07 — 500 / server error. В handoff'е нет отдельной мокапки, но
 * сайд X-06 очевиден: большая цифра + объяснение + CTA.
 *
 * Логика: показываем когда запрос вернул 5xx без внятного сообщения.
 * CTA — повторить; secondary — вернуться.
 */
export function ServerErrorScreen({
  title = "Сервер не смог ответить",
  description = "Мы уже знаем и чиним. Попробуйте ещё раз — если не сработает, возвращайтесь позже.",
  onRetry,
  onBack,
  statusCode = 500,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  onBack?: () => void;
  statusCode?: number;
}) {
  return (
    <div
      className="min-h-screen bg-paper flex items-center justify-center px-6"
      data-testid="server-error-screen"
    >
      <div className="text-center max-w-[380px]">
        <Tag variant="ruby" className="mb-3">
          {statusCode}
        </Tag>
        <div
          className={cn(
            "font-ds-serif text-[56px] leading-none font-medium text-ink-300",
          )}
          aria-hidden
        >
          {statusCode}
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
        <div className="flex flex-col gap-2.5 mt-5">
          {onRetry && (
            <Button
              variant="primary"
              size="lg"
              className="min-w-[220px]"
              onClick={onRetry}
              data-testid="server-error-retry"
            >
              Попробовать ещё раз
            </Button>
          )}
          {onBack && (
            <Button
              variant="outline"
              size="lg"
              className="min-w-[220px]"
              onClick={onBack}
              data-testid="server-error-back"
            >
              Назад к списку
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
