/**
 * Long-press hook для touch/mouse. 500ms threshold per handoff. Отменяется
 * на move > 10px или touchcancel. Используется SlotRow (восстановить слот),
 * AbilityTile (expand skills), HPWidget (set temp HP).
 */
import { useCallback, useRef } from "react";

const DEFAULT_THRESHOLD_MS = 500;
const MOVE_CANCEL_PX = 10;

interface UseLongPressArgs {
  onLongPress: () => void;
  onPress?: () => void;
  thresholdMs?: number;
  /** Если true — после long-press блокируется ближайший click. */
  preventClickAfterLong?: boolean;
}

export function useLongPress({
  onLongPress,
  onPress,
  thresholdMs = DEFAULT_THRESHOLD_MS,
  preventClickAfterLong = true,
}: UseLongPressArgs) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggeredRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(
    (x: number, y: number) => {
      triggeredRef.current = false;
      startXRef.current = x;
      startYRef.current = y;
      clear();
      timerRef.current = setTimeout(() => {
        triggeredRef.current = true;
        onLongPress();
      }, thresholdMs);
    },
    [clear, onLongPress, thresholdMs],
  );

  const move = useCallback(
    (x: number, y: number) => {
      const dx = Math.abs(x - startXRef.current);
      const dy = Math.abs(y - startYRef.current);
      if (dx > MOVE_CANCEL_PX || dy > MOVE_CANCEL_PX) {
        clear();
      }
    },
    [clear],
  );

  const release = useCallback(() => {
    clear();
    if (!triggeredRef.current && onPress) {
      onPress();
    }
  }, [clear, onPress]);

  return {
    onMouseDown: (e: React.MouseEvent) => start(e.clientX, e.clientY),
    onMouseMove: (e: React.MouseEvent) => move(e.clientX, e.clientY),
    onMouseUp: release,
    onMouseLeave: clear,
    onTouchStart: (e: React.TouchEvent) => {
      const t = e.touches[0];
      if (t) start(t.clientX, t.clientY);
    },
    onTouchMove: (e: React.TouchEvent) => {
      const t = e.touches[0];
      if (t) move(t.clientX, t.clientY);
    },
    onTouchEnd: release,
    onTouchCancel: clear,
    onClick: (e: React.MouseEvent) => {
      if (preventClickAfterLong && triggeredRef.current) {
        e.preventDefault();
        e.stopPropagation();
        triggeredRef.current = false;
      }
    },
  };
}
