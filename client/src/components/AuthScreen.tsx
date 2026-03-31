import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import {
  Dices,
  LoaderCircle,
  LogIn,
  Moon,
  Scroll,
  Shield,
  Sun,
  Swords,
  UserPlus,
} from "lucide-react";

type AuthTab = "login" | "register";

interface AuthScreenProps {
  theme: string;
  toggleTheme: () => void;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function AuthScreen({ theme, toggleTheme }: AuthScreenProps) {
  const { login, register, isLoggingIn, isRegistering } = useAuth();
  const [tab, setTab] = useState<AuthTab>("login");
  const [error, setError] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const isBusy = isLoggingIn || isRegistering;

  const handleGoogleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      await login(loginForm);
    } catch (authError) {
      setError(getErrorMessage(authError, "Не удалось выполнить вход"));
    }
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    try {
      await register(registerForm);
    } catch (authError) {
      setError(getErrorMessage(authError, "Не удалось создать аккаунт"));
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Scroll className="w-6 h-6 text-accent" />
            <h1 className="text-lg sm:text-xl font-bold font-serif">POCKET CHARLIST</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-10 w-10"
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl grid gap-8 lg:grid-cols-[1.1fr_440px] items-center">
          <section className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-accent opacity-70" />
              <Dices className="w-12 h-12 sm:w-14 sm:h-14 text-accent" />
              <Swords className="w-8 h-8 sm:w-10 sm:h-10 text-accent opacity-70" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold font-serif mb-3">Листы персонажей D&amp;D 5e</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-4">
              Храните персонажей в одном месте, переключайтесь между ними на телефоне и компьютере
              и возвращайтесь к игре без ручной рутины.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Вход доступен через email и пароль или через Google. Если аккаунт уже есть в Google,
              пароль можно добавить позже в настройках аккаунта.
            </p>
          </section>

          <Card className="w-full shadow-lg">
            <CardHeader className="space-y-2">
              <CardTitle>Вход в приложение</CardTitle>
              <CardDescription>
                Один email соответствует одной учетной записи, независимо от способа входа.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs
                value={tab}
                onValueChange={(value) => {
                  setTab(value as AuthTab);
                  setError(null);
                }}
                className="space-y-4"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Вход</TabsTrigger>
                  <TabsTrigger value="register">Регистрация</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form className="space-y-4" onSubmit={handleLogin}>
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        autoComplete="email"
                        value={loginForm.email}
                        onChange={(event) =>
                          setLoginForm((prev) => ({ ...prev, email: event.target.value }))
                        }
                        placeholder="you@example.com"
                        data-testid="input-login-email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Пароль</Label>
                      <Input
                        id="login-password"
                        type="password"
                        autoComplete="current-password"
                        value={loginForm.password}
                        onChange={(event) =>
                          setLoginForm((prev) => ({ ...prev, password: event.target.value }))
                        }
                        placeholder="Введите пароль"
                        data-testid="input-login-password"
                      />
                    </div>

                    {error && tab === "login" ? (
                      <p className="text-sm text-destructive" data-testid="text-auth-error">
                        {error}
                      </p>
                    ) : null}

                    <Button
                      type="submit"
                      className="w-full gap-2"
                      disabled={isBusy}
                      data-testid="button-login-submit"
                    >
                      {isLoggingIn ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                      Войти по email
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form className="space-y-4" onSubmit={handleRegister}>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        autoComplete="email"
                        value={registerForm.email}
                        onChange={(event) =>
                          setRegisterForm((prev) => ({ ...prev, email: event.target.value }))
                        }
                        placeholder="you@example.com"
                        data-testid="input-register-email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">Пароль</Label>
                      <Input
                        id="register-password"
                        type="password"
                        autoComplete="new-password"
                        value={registerForm.password}
                        onChange={(event) =>
                          setRegisterForm((prev) => ({ ...prev, password: event.target.value }))
                        }
                        placeholder="Минимум 8 символов"
                        data-testid="input-register-password"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">Подтверждение пароля</Label>
                      <Input
                        id="register-confirm-password"
                        type="password"
                        autoComplete="new-password"
                        value={registerForm.confirmPassword}
                        onChange={(event) =>
                          setRegisterForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                        }
                        placeholder="Повторите пароль"
                        data-testid="input-register-confirm-password"
                      />
                    </div>

                    {error && tab === "register" ? (
                      <p className="text-sm text-destructive" data-testid="text-auth-error">
                        {error}
                      </p>
                    ) : null}

                    <Button
                      type="submit"
                      className="w-full gap-2"
                      disabled={isBusy}
                      data-testid="button-register-submit"
                    >
                      {isRegistering ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                      Создать аккаунт
                    </Button>
                  </form>
                </TabsContent>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-background px-3 text-xs uppercase tracking-wide text-muted-foreground">
                      или
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={isBusy}
                  data-testid="button-google-login"
                >
                  Продолжить с Google
                </Button>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>D&amp;D 5e Character Sheet</p>
        <p className="text-xs mt-1">Dungeons &amp; Dragons is a trademark of Wizards of the Coast LLC</p>
      </footer>
    </div>
  );
}
