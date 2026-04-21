import { cn } from "@/lib/utils";
import { typeClass } from "@/ds/tokens";

/**
 * A-02 — Стартовый лоадер. Показывается пока useAuth().isLoading === true,
 * до того как стало известно «вошёл / не вошёл». Мягкий wordmark + spinner,
 * без BottomTabs и без шапки — это «до роутинга».
 *
 * Принцип: минимальный CLS. HTML-loader'а (app-loader div) уже нет к моменту
 * показа, но этот экран продолжает его тему (paper фон + ruby wordmark).
 */
export function AuthLoader({
  message = "Загружаем ваших героев…",
}: {
  message?: string;
}) {
  return (
    <div
      className="min-h-screen bg-paper flex flex-col items-center justify-center px-6"
      role="status"
      aria-live="polite"
      data-testid="auth-loader"
    >
      <div
        className={cn(
          typeClass("label"),
          "text-ruby tracking-[0.14em]",
        )}
      >
        POCKET CHARLIST
      </div>
      <div
        className={cn(
          "font-ds-serif text-[26px] font-medium leading-[1.1] tracking-[-0.01em] mt-2 text-ink-900 text-center",
        )}
      >
        Лист персонажа<span className="text-ruby"> · </span>
        <em className="text-ruby not-italic">без математики</em>
      </div>
      <div className="mt-7 w-8 h-8 rounded-full border-[3px] border-ink-200 border-t-ruby motion-safe:animate-spin" />
      <div
        className={cn(typeClass("caption"), "text-ink-500 mt-4")}
      >
        {message}
      </div>
    </div>
  );
}
