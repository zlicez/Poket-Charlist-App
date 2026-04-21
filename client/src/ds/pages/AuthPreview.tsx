/**
 * Dev-page: Phase H1 auth screens. Показывает все 5 состояний рядом,
 * чтобы смотреть вёрстку без цикла «выйти-войти-открыть». Эта страница
 * исключена из auth-гейта в NewRouter — её можно смотреть без логина.
 *
 * Реальный A-01 AuthScreen в NewRouter не мокируется; здесь же — просто
 * визуал, без обработчиков сессии.
 */
import { useState } from "react";

import { typeClass } from "@/ds/tokens";
import { Button } from "@/ds/primitives";
import {
  AccountSheet,
  AuthLoader,
  AuthScreen,
  ForgotPasswordSheet,
} from "@/ds/screens/auth";

type Panel = "A-01" | "A-02" | "A-03" | "A-04" | "A-05";

const panels: Array<{ id: Panel; label: string; note: string }> = [
  { id: "A-01", label: "A-01", note: "Вход / Регистрация" },
  { id: "A-02", label: "A-02", note: "Стартовый лоадер" },
  { id: "A-03", label: "A-03", note: "Аккаунт — пароль + Google" },
  { id: "A-04", label: "A-04", note: "Session expired (edge)" },
  { id: "A-05", label: "A-05", note: "Forgot password (stub)" },
];

export default function AuthPreview() {
  const [panel, setPanel] = useState<Panel>("A-01");
  const [accountOpen, setAccountOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  return (
    <div className="min-h-screen bg-paper-2 text-ink-900 font-ds-sans">
      <header className="border-b border-ink-200 bg-paper-card px-6 py-4">
        <div className={`${typeClass("label")} text-ruby mb-1`}>
          PHASE H1 · AUTH
        </div>
        <h1 className={`${typeClass("h1")} text-ink-900`}>
          Auth screens preview
        </h1>
        <div className={`${typeClass("body-sm")} text-ink-600 mt-1`}>
          A-01..A-05 в изолированной среде. Не подключён к реальному auth-гейту.
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {panels.map((p) => (
            <Button
              key={p.id}
              variant={panel === p.id ? "primary" : "outline"}
              size="sm"
              onClick={() => setPanel(p.id)}
              data-testid={`preview-panel-${p.id}`}
            >
              {p.label} · {p.note}
            </Button>
          ))}
          {panel === "A-03" && (
            <Button
              variant="ruby"
              size="sm"
              onClick={() => setAccountOpen(true)}
            >
              Open AccountSheet
            </Button>
          )}
          {panel === "A-05" && (
            <Button
              variant="ruby"
              size="sm"
              onClick={() => setForgotOpen(true)}
            >
              Open ForgotPasswordSheet
            </Button>
          )}
        </div>
      </header>

      <main className="px-6 py-6">
        {panel === "A-01" && (
          <div className="rounded-ds-md border border-ink-200 overflow-hidden">
            <AuthScreen />
          </div>
        )}
        {panel === "A-02" && (
          <div className="rounded-ds-md border border-ink-200 overflow-hidden">
            <AuthLoader />
          </div>
        )}
        {panel === "A-03" && (
          <div className="rounded-ds-md border border-dashed border-ink-300 p-6 max-w-lg">
            <div className={`${typeClass("body-sm")} text-ink-600`}>
              AccountSheet — BottomSheet, открывается по кнопке. Требует
              залогиненного user'а из useAuth; в этом dev-превью он не
              мокируется. Откройте его в реальном флоу после логина.
            </div>
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => setAccountOpen(true)}
            >
              Открыть AccountSheet
            </Button>
            <AccountSheet
              open={accountOpen}
              onOpenChange={setAccountOpen}
            />
          </div>
        )}
        {panel === "A-04" && (
          <div className="rounded-ds-md border border-dashed border-ink-300 p-6 max-w-lg">
            <div className={`${typeClass("body-sm")} text-ink-600`}>
              SessionExpiredSheet отслеживает переход isAuthenticated
              true→false через useRef. В preview не мокируем — smoke-тест
              делается через logout из реального флоу.
            </div>
          </div>
        )}
        {panel === "A-05" && (
          <div className="rounded-ds-md border border-dashed border-ink-300 p-6 max-w-lg">
            <div className={`${typeClass("body-sm")} text-ink-600`}>
              Заглушка для восстановления пароля. Предлагает Google + установку
              пароля в «Аккаунт».
            </div>
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => setForgotOpen(true)}
            >
              Открыть ForgotPasswordSheet
            </Button>
            <ForgotPasswordSheet
              open={forgotOpen}
              onOpenChange={setForgotOpen}
            />
          </div>
        )}
      </main>
    </div>
  );
}
