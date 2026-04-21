import { QueryClient, QueryFunction } from "@tanstack/react-query";
import {
  cacheCharacters,
  cacheCharacter,
  getCachedCharacters,
  getCachedCharacter,
  addPendingChange,
  removeCachedCharacter,
} from "./offline-db";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

const CHARACTER_URL_RE = /^\/api\/characters\/([^/]+)$/;

// Ошибка версии: выбрасывается, когда сервер отвечает 409 на PATCH.
// Мутация использует её в onError, чтобы отличить conflict от прочих сбоев.
export class VersionConflictError extends Error {
  constructor(
    public readonly characterId: string,
    public readonly currentCharacter: unknown,
    public readonly currentUpdatedAt: string | undefined,
  ) {
    super("Version mismatch");
    this.name = "VersionConflictError";
  }
}

// Безопасное чтение updatedAt из React Query кеша без статической зависимости
// на queryClient (он объявлен в этом же файле ниже — чтобы избежать TDZ-цикла,
// читаем через геттер после инициализации).
function getCachedCharacterUpdatedAt(id: string): string | undefined {
  const cached = queryClient.getQueryData<{ updatedAt?: string }>([
    "/api/characters",
    id,
  ]);
  return cached?.updatedAt;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const characterIdMatch = url.match(CHARACTER_URL_RE);
  const isPatchCharacter = method === "PATCH" && !!characterIdMatch;
  const baseUpdatedAt = isPatchCharacter
    ? getCachedCharacterUpdatedAt(characterIdMatch![1])
    : undefined;

  try {
    const headers: Record<string, string> = {};
    if (data) headers["Content-Type"] = "application/json";
    if (isPatchCharacter && baseUpdatedAt) headers["If-Match"] = baseUpdatedAt;

    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    if (res.status === 409 && isPatchCharacter) {
      const body = await res
        .clone()
        .json()
        .catch(() => ({}) as { currentCharacter?: unknown; currentUpdatedAt?: string });
      const characterId = characterIdMatch![1];
      // Сервер возвращает актуальную запись — кладём в кеш и IndexedDB, чтобы
      // UI сразу показал правильное состояние.
      if (body.currentCharacter) {
        queryClient.setQueryData(["/api/characters", characterId], body.currentCharacter);
        cacheCharacter(body.currentCharacter).catch(() => {});
      }
      window.dispatchEvent(
        new CustomEvent("sync:conflict", {
          detail: {
            characterId,
            url,
            attempted: data,
            current: body.currentCharacter,
            currentUpdatedAt: body.currentUpdatedAt,
            source: "patch",
          },
        }),
      );
      throw new VersionConflictError(
        characterId,
        body.currentCharacter,
        body.currentUpdatedAt,
      );
    }

    await throwIfResNotOk(res);

    if (isPatchCharacter) {
      try {
        const clone = res.clone();
        const updated = await clone.json();
        if (updated?.id) {
          cacheCharacter(updated).catch(() => {});
        }
      } catch {}
    }

    if (method === "DELETE" && characterIdMatch) {
      removeCachedCharacter(characterIdMatch[1]).catch(() => {});
    }

    return res;
  } catch (err) {
    if (err instanceof VersionConflictError) {
      throw err;
    }
    if (!navigator.onLine && method !== "GET") {
      await addPendingChange({
        method,
        url,
        body: data,
        baseUpdatedAt,
        timestamp: Date.now(),
      });

      if (method === "DELETE" && characterIdMatch) {
        removeCachedCharacter(characterIdMatch[1]).catch(() => {});
      }

      return new Response(JSON.stringify({ queued: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    throw err;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export function getQueryFn<T>(options: {
  on401: UnauthorizedBehavior;
}): QueryFunction<T> {
  const { on401: unauthorizedBehavior } = options;

  return async ({ queryKey }) => {
    const url = queryKey.join("/") as string;

    try {
      const res = await fetch(url, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      const data = await res.json();

      if (url === "/api/characters" && Array.isArray(data)) {
        cacheCharacters(data).catch(() => {});
      } else if (url.match(/^\/api\/characters\/[^/]+$/) && data?.id) {
        cacheCharacter(data).catch(() => {});
      }

      return data;
    } catch (err) {
      if (!navigator.onLine || (err instanceof TypeError && (err as TypeError).message.includes("fetch"))) {
        if (url === "/api/characters") {
          const cached = await getCachedCharacters();
          if (cached.length > 0) return cached as T;
        }

        const charMatch = url.match(/^\/api\/characters\/([^/]+)$/);
        if (charMatch) {
          const cached = await getCachedCharacter(charMatch[1]);
          if (cached) return cached as T;
        }
      }
      throw err;
    }
  };
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
