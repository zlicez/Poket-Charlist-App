import { useState } from "react";

import { cn } from "@/lib/utils";
import { typeClass } from "@/ds/tokens";
import { Button, InputField } from "@/ds/primitives";
import { useAuth } from "@/hooks/use-auth";
import { AUTH_PATHS } from "@shared/constants";

import { ForgotPasswordSheet } from "./ForgotPasswordSheet";

/**
 * A-01 — Вход / Регистрация. Handoff 03-screens.jsx:
 *   [wordmark ruby label] [serif title «Лист персонажа без математики»]
 *   [segmented Вход/Регистрация] [email + password] [submit]
 *   [divider «или»] [Google login]
 *   [footer: forgot password stub]
 */

type AuthMode = "login" | "register";

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export function AuthScreen() {
  const { login, register, isLoggingIn, isRegistering } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);

  const busy = isLoggingIn || isRegistering;

  const reset = () => {
    setError(null);
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (mode === "register" && password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({ email, password, confirmPassword });
      }
    } catch (authErr) {
      setError(
        getErrorMessage(
          authErr,
          mode === "login"
            ? "Не удалось выполнить вход"
            : "Не удалось создать аккаунт",
        ),
      );
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = AUTH_PATHS.oauthLogin;
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <main className="flex-1 flex flex-col justify-center px-6 py-10 max-w-[440px] mx-auto w-full">
        <div className="mb-7">
          <div
            className={cn(
              typeClass("label"),
              "text-ruby tracking-[0.14em]",
            )}
          >
            POCKET CHARLIST
          </div>
          <h1
            className={cn(
              "font-ds-serif text-[34px] font-medium leading-[1.05] tracking-[-0.01em] mt-1 text-ink-900",
            )}
          >
            Лист персонажа
            <br />
            <em className="text-ruby not-italic">без математики</em>
          </h1>
          <p className={cn(typeClass("body-sm"), "text-ink-600 mt-2.5")}>
            D&amp;D 5e в кармане. Считает HP, КД, атаки и слоты, пока вы играете.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Режим аутентификации"
          className="flex gap-1 bg-ink-100 rounded-ds-md p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            onClick={() => {
              setMode("login");
              reset();
            }}
            className={cn(
              "flex-1 h-9 rounded-ds-sm text-[13px] font-medium transition-all",
              "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ruby-bg",
              mode === "login"
                ? "bg-paper-card shadow-ds-1 text-ink-900"
                : "text-ink-500 hover:text-ink-700",
            )}
            data-testid="auth-tab-login"
          >
            Вход
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "register"}
            onClick={() => {
              setMode("register");
              reset();
            }}
            className={cn(
              "flex-1 h-9 rounded-ds-sm text-[13px] font-medium transition-all",
              "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ruby-bg",
              mode === "register"
                ? "bg-paper-card shadow-ds-1 text-ink-900"
                : "text-ink-500 hover:text-ink-700",
            )}
            data-testid="auth-tab-register"
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 mt-4.5">
          <InputField
            label="EMAIL"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            data-testid="auth-input-email"
          />
          <InputField
            label="ПАРОЛЬ"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder={
              mode === "login" ? "Введите пароль" : "Минимум 8 символов"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            data-testid="auth-input-password"
          />
          {mode === "register" && (
            <InputField
              label="ПОДТВЕРЖДЕНИЕ"
              type="password"
              autoComplete="new-password"
              placeholder="Повторите пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              data-testid="auth-input-confirm-password"
            />
          )}

          {error && (
            <div
              className={cn(typeClass("body-sm"), "text-ruby mt-1")}
              data-testid="auth-error"
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="mt-1"
            disabled={busy}
            data-testid="auth-submit"
          >
            {busy
              ? mode === "login"
                ? "Входим…"
                : "Создаём…"
              : mode === "login"
                ? "Войти"
                : "Создать аккаунт"}
          </Button>

          <div className="flex items-center gap-2.5 my-1.5">
            <div className="flex-1 h-px bg-ink-200" />
            <span className={cn(typeClass("caption"), "text-ink-400")}>
              или
            </span>
            <div className="flex-1 h-px bg-ink-200" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleGoogleLogin}
            disabled={busy}
            data-testid="auth-google"
          >
            Войти через Google
          </Button>
        </form>

        <div
          className={cn(
            typeClass("caption"),
            "text-ink-500 text-center mt-5 leading-[1.5]",
          )}
        >
          Забыли пароль?{" "}
          <button
            type="button"
            onClick={() => setForgotOpen(true)}
            className="text-ocean hover:underline"
            data-testid="auth-forgot"
          >
            Восстановление по почте
          </button>{" "}
          в разработке.
          <br />
          Войдите через Google — установите пароль в профиле.
        </div>
      </main>

      <footer
        className={cn(
          typeClass("caption"),
          "text-ink-400 text-center py-6",
        )}
      >
        <div>D&amp;D 5e Character Sheet</div>
        <div className="mt-0.5 text-[10px]">
          Dungeons &amp; Dragons is a trademark of Wizards of the Coast LLC
        </div>
      </footer>

      <ForgotPasswordSheet
        open={forgotOpen}
        onOpenChange={setForgotOpen}
      />
    </div>
  );
}
