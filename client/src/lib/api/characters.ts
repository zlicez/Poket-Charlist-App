/**
 * Типизированные обёртки над `apiRequest` для character-endpoint'ов.
 * Компоненты и хуки вызывают эти функции; прямых импортов `apiRequest` и
 * `fetch` к `/api/characters*` в UI-слое быть не должно.
 */
import {
  CHARACTERS_LIST_URL,
  characterShareUrl,
  characterUrl,
  sharedCharacterUrl,
} from "@shared/constants";
import type { Character, InsertCharacter } from "@shared/schema";
import { apiRequest, VersionConflictError } from "../queryClient";

// Реэкспорт, чтобы обработчики мутаций могли отличить 409 от прочих ошибок,
// не импортируя queryClient напрямую.
export { VersionConflictError };

export async function createCharacter(payload: InsertCharacter | unknown): Promise<Character> {
  const res = await apiRequest("POST", CHARACTERS_LIST_URL, payload);
  return res.json();
}

// Возвращает `Character | null`: null означает, что операция ушла в оффлайн-очередь
// и ответ `{ queued: true }` мы не интерпретируем как Character.
export async function updateCharacter(
  id: string,
  patch: Partial<Character>,
): Promise<Character | null> {
  const res = await apiRequest("PATCH", characterUrl(id), patch);
  const data = await res.json().catch(() => null);
  if (data && typeof data === "object" && "queued" in data) return null;
  return data as Character;
}

export async function deleteCharacter(id: string): Promise<void> {
  await apiRequest("DELETE", characterUrl(id));
}

export async function enableShare(id: string): Promise<{ shareToken: string }> {
  const res = await apiRequest("POST", characterShareUrl(id));
  return res.json();
}

export async function disableShare(id: string): Promise<void> {
  await apiRequest("DELETE", characterShareUrl(id));
}

export async function getSharedCharacter(token: string): Promise<Character> {
  const res = await fetch(sharedCharacterUrl(token), { credentials: "include" });
  if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
  return res.json();
}
