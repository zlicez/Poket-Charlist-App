/**
 * DS haptic feedback — Phase I polish. README §Interactions не прописывает
 * силу вибрации, только «tap target минимум 44×44», поэтому полагаемся на
 * ограниченный набор паттернов.
 *
 * API:
 *   const haptic = useHapticFeedback();
 *   haptic("tick")   // 10ms — подтверждение лёгкого tap'а
 *   haptic("bump")   // 25ms — средний — применение damage/heal, D20-roll
 *   haptic("success")// [10,40,20] — level-up, long rest complete
 *   haptic("warn")   // [15,50,15,50] — death save fail, rate limit
 *
 * Отключено, если:
 *   - navigator.vibrate отсутствует (desktop / iOS Safari < 16.4);
 *   - `localStorage["ds.haptics"] === "off"` — пользовательский opt-out;
 *   - `matchMedia("(prefers-reduced-motion: reduce)")` активен.
 *
 * Throttling: не чаще одного срабатывания в 80ms (совпадает с таймингом
 * active:scale кнопки из handoff'а).
 */
import { useCallback, useRef } from "react";

export type HapticPattern = "tick" | "bump" | "success" | "warn";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  tick: 10,
  bump: 25,
  success: [10, 40, 20],
  warn: [15, 50, 15, 50],
};

const THROTTLE_MS = 80;
const OPT_OUT_KEY = "ds.haptics";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isUserOptedOut(): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    return localStorage.getItem(OPT_OUT_KEY) === "off";
  } catch {
    return false;
  }
}

function hapticsEnabled(): boolean {
  if (typeof navigator === "undefined") return false;
  if (typeof navigator.vibrate !== "function") return false;
  if (prefersReducedMotion()) return false;
  if (isUserOptedOut()) return false;
  return true;
}

export function useHapticFeedback() {
  const lastFiredRef = useRef(0);

  return useCallback((pattern: HapticPattern) => {
    if (!hapticsEnabled()) return;
    const now = Date.now();
    if (now - lastFiredRef.current < THROTTLE_MS) return;
    lastFiredRef.current = now;
    try {
      navigator.vibrate(PATTERNS[pattern]);
    } catch {
      // Silently swallow — a failed vibrate is never worth breaking UX.
    }
  }, []);
}

/** Standalone helpers for pure tests and non-hook callers. */
export const __private = {
  PATTERNS,
  THROTTLE_MS,
  OPT_OUT_KEY,
  hapticsEnabled,
};
