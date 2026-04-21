/**
 * Клиентский deepMerge. Отличается от серверного (server/deep-merge.ts):
 * серверный пропускает `undefined`, клиентский — наоборот, копирует
 * `undefined` явно, чтобы optimistic cache-update мог «стирать» поля
 * в setQueryData. По сети `JSON.stringify` всё равно дропает `undefined`
 * из body — а клиент, если нужно очистить поле, шлёт `""`.
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>,
): T {
  const result: Record<string, unknown> = { ...target };
  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = target[key];
    if (
      sourceValue !== null &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      targetValue !== null &&
      typeof targetValue === "object" &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Partial<Record<string, unknown>>,
      );
    } else {
      result[key] = sourceValue;
    }
  }
  return result as T;
}
