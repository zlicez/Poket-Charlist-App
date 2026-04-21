import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { typeClass } from "@/ds/tokens";
import { BottomSheet } from "@/ds/hero";
import { Button } from "@/ds/primitives";
import { useAuth } from "@/hooks/use-auth";
import { useOnlineStatus } from "@/hooks/use-online-status";

/**
 * A-04 — Session expired. Edge-case:
 *   пользователь был залогинен (isAuthenticated был true), но сервер перестал
 *   отвечать нашим cookie. useAuth()/react-query на фоновом refetch получил
 *   401 → user → null. Между этим моментом и AuthScreen хотим показать
 *   короткое объяснение («сессия истекла, локальные правки сохранены»), чтобы
 *   юзер не решил, что его выкинули «сами».
 *
 * Тех. реализация: ref предыдущего значения isAuthenticated. Переход
 * true → false и при этом **не** по свежему logout → open sheet.
 * Logout явно резолвит href = "/" (см. useAuth.logout), так что там пере-
 * загрузка страницы уронит ref вместе с сессией.
 */

export function SessionExpiredSheet() {
  const { isAuthenticated, isLoading } = useAuth();
  const { pendingCount } = useOnlineStatus();
  const prevAuthed = useRef<boolean | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    // Первый осознанный apply: запомнили baseline и вышли.
    if (prevAuthed.current === null) {
      prevAuthed.current = isAuthenticated;
      return;
    }
    // Авторизация сорвалась: был залогинен, стал нет.
    if (prevAuthed.current === true && isAuthenticated === false) {
      setOpen(true);
    }
    prevAuthed.current = isAuthenticated;
  }, [isAuthenticated, isLoading]);

  const handleReLogin = () => {
    setOpen(false);
    // AuthScreen уже подхватит !isAuthenticated.
    // Reload — чтобы react-query cache гарантированно сбросился.
    window.location.reload();
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={setOpen}
      dismissable={false}
      title="Сессия истекла"
      description="Нужно войти ещё раз. Локальные правки сохранены."
    >
      <div className="mt-2 rounded-ds-md bg-ruby-bg border border-ruby-soft px-3 py-2.5">
        <div className={cn(typeClass("body-sm"), "text-ink-900")}>
          <strong className="text-ruby">Что произошло:</strong> сессия на сервере
          истекла или была завершена с другого устройства.
        </div>
      </div>

      {pendingCount > 0 && (
        <div className={cn(typeClass("body-sm"), "text-ink-700 mt-2.5")}>
          <strong>{pendingCount}</strong>{" "}
          {pendingCount === 1
            ? "изменение ждёт"
            : pendingCount <= 4
              ? "изменения ждут"
              : "изменений ждут"}{" "}
          в очереди. Они уйдут на сервер сразу после входа.
        </div>
      )}

      <div
        className={cn(typeClass("caption"), "text-ink-500 mt-2.5")}
      >
        Нажмите «Войти снова» — откроется форма входа. Никакие локальные
        данные не потеряются.
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full mt-4"
        onClick={handleReLogin}
        data-testid="session-expired-relogin"
      >
        Войти снова
      </Button>
    </BottomSheet>
  );
}
