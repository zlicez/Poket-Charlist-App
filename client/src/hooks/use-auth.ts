import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/models/auth";
import { queryKeys } from "@shared/constants";
import { clearAllCachedCharacters, clearPendingChanges } from "@/lib/offline-db";
import {
  fetchCurrentUser,
  login as loginRequest,
  logoutRequest,
  register as registerRequest,
  setPasswordRequest,
  type LoginInput,
  type PasswordInput,
  type RegisterInput,
} from "@/lib/api/auth";

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: queryKeys.authUser(),
    queryFn: fetchCurrentUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) => loginRequest(input),
    onSuccess: (nextUser) => {
      queryClient.setQueryData(queryKeys.authUser(), nextUser);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (input: RegisterInput) => registerRequest(input),
    onSuccess: (nextUser) => {
      queryClient.setQueryData(queryKeys.authUser(), nextUser);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (input: PasswordInput) => setPasswordRequest(input),
    onSuccess: (nextUser) => {
      queryClient.setQueryData(queryKeys.authUser(), nextUser);
    },
  });

  const logout = async () => {
    await logoutRequest();
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
