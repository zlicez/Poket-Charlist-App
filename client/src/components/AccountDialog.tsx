import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, LoaderCircle, Mail } from "lucide-react";

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function AccountDialog({ open, onOpenChange }: AccountDialogProps) {
  const { user, changePassword, setPassword, logout, isUpdatingPassword } = useAuth();
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
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    try {
      if (user.hasPassword) {
        await changePassword({ currentPassword, newPassword });
        toast({ title: "Пароль обновлен" });
      } else {
        await setPassword({ newPassword });
        toast({ title: "Пароль добавлен", description: "Теперь можно входить и через email." });
      }

      onOpenChange(false);
    } catch (updateError) {
      setError(getErrorMessage(updateError, "Не удалось обновить пароль"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Аккаунт</DialogTitle>
          <DialogDescription>
            Управляйте способами входа и паролем для текущего аккаунта.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-accent" />
              <span className="font-medium">{user.email ?? "Email не указан"}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {user.hasGoogle
                ? "Google подключен к аккаунту."
                : "Google пока не подключен."}
              {" "}
              {user.hasPassword
                ? "Пароль уже установлен."
                : "Сейчас вы входите без пароля. Добавьте его, чтобы входить и по email."}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {user.hasPassword ? (
              <div className="space-y-2">
                <Label htmlFor="current-password">Текущий пароль</Label>
                <Input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  data-testid="input-current-password"
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="new-password">{user.hasPassword ? "Новый пароль" : "Пароль"}</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Минимум 8 символов"
                data-testid="input-new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Подтверждение</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Повторите пароль"
                data-testid="input-confirm-password"
              />
            </div>

            {error ? (
              <p className="text-sm text-destructive" data-testid="text-password-error">
                {error}
              </p>
            ) : null}

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={logout} data-testid="button-account-logout">
                Выйти
              </Button>
              <Button type="submit" className="gap-2" disabled={isUpdatingPassword} data-testid="button-save-password">
                {isUpdatingPassword ? (
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                ) : (
                  <KeyRound className="w-4 h-4" />
                )}
                {user.hasPassword ? "Сменить пароль" : "Добавить пароль"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
