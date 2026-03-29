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

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);

    if (method === "PATCH" && url.match(/\/api\/characters\/\d+$/)) {
      try {
        const clone = res.clone();
        const updated = await clone.json();
        if (updated?.id) {
          cacheCharacter(updated).catch(() => {});
        }
      } catch {}
    }

    if (method === "DELETE" && url.match(/\/api\/characters\/\d+$/)) {
      const idMatch = url.match(/\/api\/characters\/(\d+)$/);
      if (idMatch) {
        removeCachedCharacter(idMatch[1]).catch(() => {});
      }
    }

    return res;
  } catch (err) {
    if (!navigator.onLine && method !== "GET") {
      await addPendingChange({
        method,
        url,
        body: data,
        timestamp: Date.now(),
      });

      if (method === "DELETE" && url.match(/\/api\/characters\/\d+$/)) {
        const idMatch = url.match(/\/api\/characters\/(\d+)$/);
        if (idMatch) {
          removeCachedCharacter(idMatch[1]).catch(() => {});
        }
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
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
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
      } else if (url.match(/^\/api\/characters\/\d+$/) && data?.id) {
        cacheCharacter(data).catch(() => {});
      }

      return data;
    } catch (err) {
      if (!navigator.onLine || (err instanceof TypeError && (err as TypeError).message.includes("fetch"))) {
        if (url === "/api/characters") {
          const cached = await getCachedCharacters();
          if (cached.length > 0) return cached as T;
        }

        const charMatch = url.match(/^\/api\/characters\/(\d+)$/);
        if (charMatch) {
          const cached = await getCachedCharacter(charMatch[1]);
          if (cached) return cached as T;
        }
      }
      throw err;
    }
  };

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
