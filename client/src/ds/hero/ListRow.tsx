import { forwardRef, useRef } from "react";
import { ChevronRight, Pencil, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useSwipeReveal } from "@/ds/hooks/useSwipeReveal";

/**
 * DS ListRow — hero-компонент 3/4. Унифицированный ряд для
 * weapons / equipment / features / spells.
 *
 * Handoff:
 *  - 02-system.jsx «Списки · Cards» (play-ряд с действиями)
 *  - README §4 ListRow (title/subtitle/left/right slots + swipe)
 *  - 03-screens.jsx B-01 (attacks), S-03 (spells list), S-05 (bag items)
 *
 * Layout:
 *   [left] [title / subtitle]  [right]
 *   border-bottom ink-100 кроме последнего
 *
 * Interactions:
 *   onPress      → tap по ряду (play-mode action / edit-mode navigate)
 *   swipe ←      → reveal delete/edit actions (mobile-only via useSwipeReveal)
 */

const REVEAL_PX = 128;

export interface ListRowSwipeActions {
  onDelete?: () => void;
  onEdit?: () => void;
  /** Иконки кастомные если базовые pencil/trash не подходят. */
  editLabel?: string;
  deleteLabel?: string;
}

export interface ListRowProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  left?: React.ReactNode;
  /** Слот справа — обычно action buttons (play) или chevron (edit). */
  right?: React.ReactNode;
  onPress?: () => void;
  swipeActions?: ListRowSwipeActions;
  /** Последний ряд в списке — убирает border-bottom. */
  isLast?: boolean;
  /** Отобразить chevron автоматически если onPress и нет right. */
  showChevron?: boolean;
  className?: string;
  testId?: string;
}

export const ListRow = forwardRef<HTMLDivElement, ListRowProps>(
  (
    {
      title,
      subtitle,
      left,
      right,
      onPress,
      swipeActions,
      isLast,
      showChevron,
      className,
      testId,
    },
    ref,
  ) => {
    const outerRef = useRef<HTMLDivElement | null>(null);
    const hasSwipe = Boolean(swipeActions?.onDelete || swipeActions?.onEdit);

    const { state, bindings, close } = useSwipeReveal({
      revealPx: REVEAL_PX,
      onPrimary: swipeActions?.onDelete,
      disabled: !hasSwipe,
    });

    const content = (
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2.5",
          "bg-paper-card",
          !isLast && "border-b border-ink-100",
        )}
      >
        {left && <div className="shrink-0">{left}</div>}
        <div className="flex-1 min-w-0">
          <div className="font-ds-sans text-[13.5px] font-semibold text-ink-900 truncate">
            {title}
          </div>
          {subtitle && (
            <div className="font-ds-mono text-[11px] text-ink-500 truncate mt-0.5">
              {subtitle}
            </div>
          )}
        </div>
        {right ? (
          <div className="shrink-0 flex items-center gap-1.5">{right}</div>
        ) : showChevron && onPress ? (
          <ChevronRight className="w-4 h-4 text-ink-400 shrink-0" />
        ) : null}
      </div>
    );

    // No swipe — simple row with optional onPress.
    if (!hasSwipe) {
      return onPress ? (
        <button
          ref={(el) => {
            outerRef.current = el as unknown as HTMLDivElement;
            if (typeof ref === "function") ref(el as unknown as HTMLDivElement);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el as unknown as HTMLDivElement;
          }}
          type="button"
          onClick={onPress}
          data-testid={testId}
          className={cn(
            "block w-full text-left",
            "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ruby-bg",
            "active:bg-ink-100",
            className,
          )}
        >
          {content}
        </button>
      ) : (
        <div ref={ref} data-testid={testId} className={cn("block", className)}>
          {content}
        </div>
      );
    }

    // Swipe-enabled: actions layer underneath, content slides.
    return (
      <div
        ref={(el) => {
          outerRef.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        data-testid={testId}
        className={cn("relative overflow-hidden bg-ink-100", className)}
      >
        {/* Action bar — sits behind, revealed via negative translateX on content. */}
        <div
          className="absolute inset-y-0 right-0 flex items-stretch"
          style={{ width: REVEAL_PX }}
        >
          {swipeActions?.onEdit && (
            <button
              type="button"
              onClick={() => {
                close();
                swipeActions.onEdit?.();
              }}
              aria-label={swipeActions.editLabel ?? "Редактировать"}
              className="flex-1 flex items-center justify-center bg-ocean text-white"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {swipeActions?.onDelete && (
            <button
              type="button"
              onClick={() => {
                close();
                swipeActions.onDelete?.();
              }}
              aria-label={swipeActions.deleteLabel ?? "Удалить"}
              className="flex-1 flex items-center justify-center bg-ruby text-white"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div
          className="relative"
          style={{
            transform: `translateX(${state.translateX}px)`,
            transition: state.dragging
              ? "none"
              : "transform 200ms cubic-bezier(0.22,1,0.36,1)",
          }}
          {...bindings}
        >
          {onPress ? (
            <button
              type="button"
              onClick={onPress}
              className="block w-full text-left focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ruby-bg"
            >
              {content}
            </button>
          ) : (
            content
          )}
        </div>
      </div>
    );
  },
);
ListRow.displayName = "ListRow";
