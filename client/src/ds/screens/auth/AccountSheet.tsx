import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { typeClass } from "@/ds/tokens";
import { BottomSheet } from "@/ds/hero";
import { Button, InputField, Tag } from "@/ds/primitives";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

/**
 * A-03 — Account. Handoff «пароль и Google»:
 *   [email badge + Google/Password статус]
 *   [смена / установка пароля]
 *   [logout / close]
 *
 * Поведение одинаково для двух состояний: если user.hasPassword — сначала
 * спросим текущий, иначе сразу новый (user пришёл через Google и ставит пароль).
 */

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export function AccountSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user, changePassword, setPassword, logout, isUpdatingPassword } =
    useAuth();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError(null);
    }
  }, [open]);

  if (!user) {
    return (
      <BottomSheet
        open={open}
        onOpenChange={onOpenChange}
        title="Аккаунт"
        description="Нужно войти, чтобы управлять аккаунтом."
      >
        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={() => onOpenChange(false)}
        >
          Закрыть
        </Button>
      </BottomSheet>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    try {
      if (user.hasPassword) {
        await changePassword({ currentPassword, newPassword });
        toast({ title: "Пароль обновлён" });
      } else {
        await setPassword({ newPassword });
        toast({
          title: "Пароль добавлен",
          description: "Теперь можно входить и через email.",
        });
      }
      onOpenChange(false);
    } catch (err) {
      setError(getErrorMessage(err, "Не удалось обновить пароль"));
    }
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Аккаунт"
      description="Управляйте способами входа и паролем для текущего аккаунта."
    >
      <div className="mt-2 rounded-ds-md border border-ink-200 bg-paper-2 px-3 py-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(typeClass("body-sm"), "text-ink-900 font-semibold truncate")}
            data-testid="account-email"
          >
            {user.email ?? "email не указан"}
          </span>
          {user.hasGoogle && <Tag variant="ocean">Google</Tag>}
          {user.hasPassword ? (
            <Tag variant="sage">Пароль</Tag>
          ) : (
            <Tag variant="gold">Без пароля</Tag>
          )}
        </div>
        <div className={cn(typeClass("caption"), "text-ink-500 mt-1.5")}>
          {user.hasPassword
            ? "Пароль уже установлен."
            : "Сейчас вы входите без пароля. Добавьте его, чтобы входить и по email."}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 mt-3">
        {user.hasPassword && (
          <InputField
            label="ТЕКУЩИЙ ПАРОЛЬ"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            data-testid="account-current-password"
          />
        )}
        <InputField
          label={user.hasPassword ? "НОВЫЙ ПАРОЛЬ" : "ПАРОЛЬ"}
          type="password"
          autoComplete="new-password"
          placeholder="Минимум 8 символов"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          data-testid="account-new-password"
        />
        <InputField
          label="ПОДТВЕРЖДЕНИЕ"
          type="password"
          autoComplete="new-password"
          placeholder="Повторите пароль"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          data-testid="account-confirm-password"
        />

        {error && (
          <div
            className={cn(typeClass("body-sm"), "text-ruby")}
            data-testid="account-error"
          >
            {error}
          </div>
        )}

        <div className="flex gap-2.5 mt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={logout}
            data-testid="account-logout"
          >
            Выйти
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={isUpdatingPassword}
            data-testid="account-save-password"
          >
            {isUpdatingPassword
              ? "Сохраняем…"
              : user.hasPassword
                ? "Сменить пароль"
                : "Добавить пароль"}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
}
