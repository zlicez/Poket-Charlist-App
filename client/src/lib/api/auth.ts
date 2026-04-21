/**
 * Типизированные обёртки для auth-endpoint'ов. Прямых `fetch("/api/auth/...")`
 * в UI-коде быть не должно — все хуки идут сюда.
 */
import { AUTH_PATHS } from "@shared/constants";
import type { User } from "@shared/models/auth";

export async function fetchCurrentUser(): Promise<User | null> {
  const response = await fetch(AUTH_PATHS.user, { credentials: "include" });
  if (response.status === 401) return null;
  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }
  return response.json();
}

async function submit<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const responseBody = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      responseBody && typeof responseBody.message === "string"
        ? responseBody.message
        : `${response.status}: ${response.statusText}`;
    throw new Error(message);
  }
  return responseBody as T;
}

export type LoginInput = { email: string; password: string };
export type RegisterInput = { email: string; password: string; confirmPassword?: string };
export type PasswordInput = { currentPassword?: string; newPassword: string };

export async function login(input: LoginInput): Promise<User> {
  return submit<User>(AUTH_PATHS.login, input);
}

export async function register(input: RegisterInput): Promise<User> {
  return submit<User>(AUTH_PATHS.register, input);
}

export async function setPasswordRequest(input: PasswordInput): Promise<User> {
  return submit<User>(AUTH_PATHS.password, input);
}

export async function logoutRequest(): Promise<void> {
  await fetch(AUTH_PATHS.logout, { method: "POST", credentials: "include" }).catch(
    () => {},
  );
}
