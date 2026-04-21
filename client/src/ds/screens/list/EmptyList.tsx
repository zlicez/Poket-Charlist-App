import { cn } from "@/lib/utils";
import { typeClass } from "@/ds/tokens";
import { Button, Die } from "@/ds/primitives";

/**
 * L-01 — Пустой список (первый вход). Handoff 03-screens.jsx:
 *   [big dashed circle с d20] [serif heading «Создайте первого героя»]
 *   [copy «Соберите с нуля или импортируйте JSON. На первом уровне HP
 *    посчитаем сами.»]
 *   [primary «＋ Создать персонажа»] [outline «⇡ Импортировать JSON»]
 */
export function EmptyList({
  onCreate,
  onImport,
  isCreating,
  isImporting,
}: {
  onCreate: () => void;
  onImport: () => void;
  isCreating?: boolean;
  isImporting?: boolean;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center px-6 py-12 text-center max-w-[420px] mx-auto"
      data-testid="empty-list"
    >
      <div
        className={cn(
          "w-24 h-24 rounded-full border-2 border-dashed border-ink-300 bg-paper-2",
          "flex items-center justify-center mb-5",
        )}
        aria-hidden
      >
        <Die sides={20} size={48} />
      </div>

      <h1
        className={cn(
          "font-ds-serif text-[22px] font-medium tracking-[-0.01em] text-ink-900",
        )}
      >
        Создайте первого героя
      </h1>
      <p
        className={cn(
          typeClass("body-sm"),
          "text-ink-600 mt-2 max-w-[360px] leading-[1.5]",
        )}
      >
        Соберите лист с нуля или импортируйте из JSON. На первом уровне HP
        посчитаем сами.
      </p>

      <div className="flex flex-col gap-2.5 w-full mt-7">
        <Button
          variant="primary"
          size="lg"
          onClick={onCreate}
          disabled={isCreating}
          data-testid="empty-list-create"
        >
          ＋ Создать персонажа
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={onImport}
          disabled={isImporting}
          data-testid="empty-list-import"
        >
          ⇡ Импортировать JSON
        </Button>
      </div>
    </div>
  );
}
