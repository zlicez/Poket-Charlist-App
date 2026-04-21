import { cn } from "@/lib/utils";
import { typeClass } from "@/ds/tokens";
import { BottomSheet } from "@/ds/hero";
import { Button } from "@/ds/primitives";
import { AUTH_PATHS } from "@shared/constants";

/**
 * A-05 — Forgot password (заглушка). Handoff явно помечает «в разработке».
 *
 * Текущий backend не даёт password-reset endpoint, поэтому MVP:
 *   • объясняем, что восстановление в разработке;
 *   • предлагаем Google-вход как альтернативу;
 *   • напоминаем про установку пароля в разделе «Аккаунт» после Google-логина.
 */
export function ForgotPasswordSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const handleGoogleLogin = () => {
    window.location.href = AUTH_PATHS.oauthLogin;
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Восстановление пароля"
      description="Почтовое восстановление пока в разработке. Ниже — обходной путь."
    >
      <div className="mt-2 rounded-ds-md bg-gold-bg border border-gold-soft px-3 py-2.5">
        <div className={cn(typeClass("body-sm"), "text-ink-900")}>
          <strong className="text-gold">Как войти прямо сейчас:</strong>
        </div>
        <ol className={cn(typeClass("body-sm"), "text-ink-700 mt-1.5 pl-4 list-decimal space-y-0.5")}>
          <li>Войдите через Google — один аккаунт на email.</li>
          <li>
            Откройте «Аккаунт» (меню в списке персонажей) и{" "}
            <em className="not-italic text-ink-900">установите новый пароль</em>.
          </li>
          <li>Дальше можно входить по email и паролю, как обычно.</li>
        </ol>
      </div>

      <div
        className={cn(typeClass("caption"), "text-ink-500 mt-3")}
      >
        Если Google не подходит — напишите команде, вручную сбросим пароль.
      </div>

      <div className="flex gap-2.5 mt-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onOpenChange(false)}
          data-testid="forgot-cancel"
        >
          Закрыть
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          onClick={handleGoogleLogin}
          data-testid="forgot-google"
        >
          Войти через Google
        </Button>
      </div>
    </BottomSheet>
  );
}
