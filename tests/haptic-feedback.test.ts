import { describe, expect, it } from "vitest";

import { __private } from "@/ds/hooks/useHapticFeedback";

const { PATTERNS, THROTTLE_MS, OPT_OUT_KEY, hapticsEnabled } = __private;

/**
 * Тесты для контракта useHapticFeedback. Мы не тянем jsdom в deps ради
 * одного хука, поэтому environment-gated часть (window.matchMedia +
 * localStorage) проверяется через node-негативный путь: в ноде нет
 * navigator.vibrate → hapticsEnabled должен вернуть false.
 */

describe("haptic PATTERNS", () => {
  it("tick is a short 10ms pulse", () => {
    expect(PATTERNS.tick).toBe(10);
  });

  it("bump is a single 25ms pulse", () => {
    expect(PATTERNS.bump).toBe(25);
  });

  it("success has 3-beat rhythm", () => {
    expect(PATTERNS.success).toEqual([10, 40, 20]);
  });

  it("warn has 4-beat alarm rhythm", () => {
    expect(PATTERNS.warn).toEqual([15, 50, 15, 50]);
  });

  it("throttle matches button-scale timing (80ms)", () => {
    expect(THROTTLE_MS).toBe(80);
  });

  it("opt-out key is namespaced under ds.*", () => {
    expect(OPT_OUT_KEY).toBe("ds.haptics");
  });
});

describe("hapticsEnabled in node environment", () => {
  it("returns false when navigator.vibrate is unavailable", () => {
    // vitest default env is node — no navigator, no vibrate → false.
    expect(hapticsEnabled()).toBe(false);
  });
});
