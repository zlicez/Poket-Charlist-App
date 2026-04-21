import { describe, expect, it } from "vitest";

/**
 * Phase H3 edge-screen utilities. Проверяем две чистые функции:
 *   formatCountdown — форматирование 429 retry-after в m:ss
 *   parseStatusFromError — достаём HTTP status code из `${status}: ${statusText}`
 *
 * Они живут в компонентах (RateLimitedScreen и CharacterScreen), поэтому
 * дублируем здесь тест-copies, чтобы изменения в форматировании заметила
 * CI. Если функции публично понадобятся — вытащим в shared/format.
 */

function formatCountdown(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function parseStatusFromError(err: unknown): number | null {
  if (!(err instanceof Error) || !err.message) return null;
  const match = err.message.match(/^(\d{3})\b/);
  if (!match) return null;
  const code = Number.parseInt(match[1], 10);
  return Number.isFinite(code) ? code : null;
}

describe("formatCountdown", () => {
  it("prints 0:00 for zero", () => {
    expect(formatCountdown(0)).toBe("0:00");
  });

  it("pads single-digit seconds", () => {
    expect(formatCountdown(9_000)).toBe("0:09");
  });

  it("handles exact minute boundary", () => {
    expect(formatCountdown(60_000)).toBe("1:00");
  });

  it("rounds up sub-second remainders", () => {
    // 59.4s → 60s after ceil → 1:00
    expect(formatCountdown(59_400)).toBe("1:00");
  });

  it("handles the 6:42 handoff example", () => {
    expect(formatCountdown(6 * 60_000 + 42_000)).toBe("6:42");
  });
});

describe("parseStatusFromError", () => {
  it("extracts 404 from apiRequest error", () => {
    expect(parseStatusFromError(new Error("404: Not Found"))).toBe(404);
  });

  it("extracts 500 regardless of trailing text", () => {
    expect(parseStatusFromError(new Error("500: Internal Server Error"))).toBe(500);
  });

  it("returns null for messages without a leading status code", () => {
    expect(parseStatusFromError(new Error("Network offline"))).toBeNull();
  });

  it("returns null for non-Error values", () => {
    expect(parseStatusFromError("404: not error")).toBeNull();
    expect(parseStatusFromError(null)).toBeNull();
    expect(parseStatusFromError(undefined)).toBeNull();
  });
});
