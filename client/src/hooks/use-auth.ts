import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/models/auth";
import { clearAllCachedCharacters, clearPendingChanges } from "@/lib/offline-db";

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = {
  email: string;
  password: string;
  confirmPassword?: string;
};

type PasswordInput = {
  currentPassword?: string;
  newPassword: string;
};

async function fetchUser(): Promise<User | null> {
  const response = await fetch("/api/auth/user", {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

async function submitAuthRequest(url: string, body: unknown): Promise<User> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
    const message = typeof responseBody?.message === "string"
      ? responseBody.message
      : `${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  return responseBody as User;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) => submitAuthRequest("/api/auth/login", input),
    onSuccess: (nextUser) => {
      queryClient.setQueryData(["/api/auth/user"], nextUser);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (input: RegisterInput) => submitAuthRequest("/api/auth/register", input),
    onSuccess: (nextUser) => {
      queryClient.setQueryData(["/api/auth/user"], nextUser);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (input: PasswordInput) => submitAuthRequest("/api/auth/password", input),
    onSuccess: (nextUser) => {
      queryClient.setQueryData(["/api/auth/user"], nextUser);
    },
  });

  const logout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" }).catch(() => {});
    queryClient.clear();
    await clearAllCachedCharacters().catch(() => {});
    await clearPendingChanges().catch(() => {});
    window.location.href = "/";
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    setPassword: (input: Omit<PasswordInput, "currentPassword">) => passwordMutation.mutateAsync(input),
    changePassword: (input: Required<Pick<PasswordInput, "currentPassword">> & Pick<PasswordInput, "newPassword">) =>
      passwordMutation.mutateAsync(input),
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isUpdatingPassword: passwordMutation.isPending,
  };
}
