export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

// Redirect to login with a toast notification
export function redirectToLogin(toast?: (options: { title: string; description: string; variant: string }) => void) {
  if (toast) {
    toast({
      title: "Требуется вход",
      description: "Открываем стартовый экран авторизации...",
      variant: "destructive",
    });
  }
  setTimeout(() => {
    window.location.href = "/";
  }, 500);
}
