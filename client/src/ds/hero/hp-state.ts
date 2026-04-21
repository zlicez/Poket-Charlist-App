/**
 * Pure helper для HPWidget. Выведение state из текущего/максимального HP —
 * чистая функция, тестируется отдельно.
 *
 * Handoff 02-system.jsx «Состояния»:
 *   healthy   >50%
 *   wounded   25–50%
 *   critical  <25%
 *   downed    0 (режим death saves)
 */
export type HpState = "healthy" | "wounded" | "critical" | "downed";

export function getHpState(current: number, max: number): HpState {
  if (max <= 0 || current <= 0) return "downed";
  const ratio = current / max;
  if (ratio > 0.5) return "healthy";
  if (ratio >= 0.25) return "wounded";
  return "critical";
}

export function clampHpPercentage(current: number, max: number): number {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, (current / max) * 100));
}

export function clampTempPercentage(
  current: number,
  max: number,
  temp: number,
): number {
  if (max <= 0) return 0;
  const currentPct = clampHpPercentage(current, max);
  const tempPct = (temp / max) * 100;
  return Math.max(0, Math.min(100 - currentPct, tempPct));
}
