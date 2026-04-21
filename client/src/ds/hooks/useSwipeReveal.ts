/**
 * iOS-style swipe-to-reveal actions на ListRow.
 *
 * Жест: свайп влево открывает action-панель справа. Двухфазный threshold:
 *   <25px              — игнорируем (accidental drag)
 *   25..REVEAL_PX      — snap to revealed
 *   >REVEAL_PX * 1.6   — immediate fire onPrimary (full swipe delete)
 *
 * Возвращает binding'и для контейнера + state для рендера. Hook-owned state:
 *   translateX — текущее смещение контента
 *   revealed — snapped flag
 *
 * Touch-only (mouse не поддерживается — на desktop используем hover / right buttons).
 */
import { useCallback, useRef, useState } from "react";

const MIN_MOVE_PX = 12;
const FULL_SWIPE_MULTIPLIER = 1.6;

export interface UseSwipeRevealArgs {
  revealPx: number;
  onPrimary?: () => void; // triggered at full swipe
  onOpen?: () => void;
  onClose?: () => void;
  disabled?: boolean;
}

export interface SwipeRevealState {
  translateX: number;
  revealed: boolean;
  dragging: boolean;
}

export function useSwipeReveal({
  revealPx,
  onPrimary,
  onOpen,
  onClose,
  disabled,
}: UseSwipeRevealArgs) {
  const [state, setState] = useState<SwipeRevealState>({
    translateX: 0,
    revealed: false,
    dragging: false,
  });

  const startXRef = useRef(0);
  const lastXRef = useRef(0);

  const close = useCallback(() => {
    setState({ translateX: 0, revealed: false, dragging: false });
    onClose?.();
  }, [onClose]);

  const open = useCallback(() => {
    setState({ translateX: -revealPx, revealed: true, dragging: false });
    onOpen?.();
  }, [onOpen, revealPx]);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;
      const t = e.touches[0];
      if (!t) return;
      startXRef.current = t.clientX;
      lastXRef.current = t.clientX;
      setState((s) => ({ ...s, dragging: true }));
    },
    [disabled],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;
      const t = e.touches[0];
      if (!t) return;
      lastXRef.current = t.clientX;
      const delta = t.clientX - startXRef.current;
      // Only allow left swipe (negative delta); ignore minor drags.
      if (state.revealed) {
        // When open, positive delta closes — compute relative to -revealPx.
        const adjusted = -revealPx + delta;
        const clamped = Math.min(0, Math.max(-revealPx * FULL_SWIPE_MULTIPLIER, adjusted));
        setState((s) => ({ ...s, translateX: clamped }));
      } else {
        if (delta > -MIN_MOVE_PX) {
          setState((s) => ({ ...s, translateX: Math.min(0, delta) }));
          return;
        }
        const clamped = Math.max(-revealPx * FULL_SWIPE_MULTIPLIER, delta);
        setState((s) => ({ ...s, translateX: clamped }));
      }
    },
    [disabled, revealPx, state.revealed],
  );

  const onTouchEnd = useCallback(() => {
    if (disabled) return;
    const delta = lastXRef.current - startXRef.current;

    // Full swipe → fire primary and close.
    if (Math.abs(delta) > revealPx * FULL_SWIPE_MULTIPLIER && delta < 0) {
      setState({ translateX: 0, revealed: false, dragging: false });
      onPrimary?.();
      return;
    }

    // Snap open/close by midpoint.
    if (state.revealed) {
      if (delta > revealPx / 2) {
        close();
      } else {
        open();
      }
    } else {
      if (delta < -revealPx / 2) {
        open();
      } else {
        close();
      }
    }
  }, [close, disabled, onPrimary, open, revealPx, state.revealed]);

  const onTouchCancel = useCallback(() => {
    if (disabled) return;
    if (state.revealed) open();
    else close();
  }, [close, disabled, open, state.revealed]);

  return {
    state,
    close,
    open,
    bindings: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onTouchCancel,
    },
  };
}
